"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  name: string;
  monthly_fee: number;
};

type Payment = {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  payment_method: string | null;
  payment_date: string;
};

const paymentMethods = [
  "Μετρητά",
  "POS",
  "Τραπεζική κατάθεση",
  "IRIS",
];

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

export default function PaymentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Μετρητά");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [selectedReceipt, setSelectedReceipt] =
    useState<Payment | null>(null);

  async function loadData() {
    setLoading(true);

    const [
      { data: studentsData, error: studentsError },
      { data: paymentsData, error: paymentsError },
    ] = await Promise.all([
      supabase
        .from("students")
        .select("id, name, monthly_fee")
        .order("name"),

      supabase
        .from("payments")
        .select("*")
        .order("payment_date", { ascending: false }),
    ]);

    if (studentsError) {
      console.error(studentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των μαθητών.");
    }

    if (paymentsError) {
      console.error(paymentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των πληρωμών.");
    }

    setStudents(studentsData || []);
    setPayments(paymentsData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function selectStudent(id: string) {
    setStudentId(id);

    const student = students.find((s) => String(s.id) === id);

    if (student) {
      setAmount(String(student.monthly_fee || 0));
    }
  }

  async function addPayment(e: React.FormEvent) {
    e.preventDefault();

    if (!studentId) {
      alert("Επίλεξε μαθητή.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Βάλε έγκυρο ποσό.");
      return;
    }

    const { error } = await supabase.from("payments").insert({
      student_id: Number(studentId),
      month,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_date: paymentDate,
    });

    if (error) {
      console.error(error);
      alert("Η πληρωμή δεν καταχωρήθηκε.");
      return;
    }

    setAmount("");
    setStudentId("");

    await loadData();

    alert("Η πληρωμή καταχωρήθηκε επιτυχώς.");
  }

  async function deletePayment(id: number) {
    const confirmed = window.confirm(
      "Θέλεις σίγουρα να διαγράψεις αυτή την πληρωμή;"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("Η πληρωμή δεν διαγράφηκε.");
      return;
    }

    if (selectedReceipt?.id === id) {
      setSelectedReceipt(null);
    }

    await loadData();
  }

  function studentName(studentId: number) {
    return (
      students.find((s) => s.id === studentId)?.name || "Άγνωστος"
    );
  }

  function studentClass(studentId: number) {
    return "";
  }

  function monthLabel(value: string) {
    const [year, monthNumber] = value.split("-");

    const months = [
      "Ιανουάριος",
      "Φεβρουάριος",
      "Μάρτιος",
      "Απρίλιος",
      "Μάιος",
      "Ιούνιος",
      "Ιούλιος",
      "Αύγουστος",
      "Σεπτέμβριος",
      "Οκτώβριος",
      "Νοέμβριος",
      "Δεκέμβριος",
    ];

    return `${months[Number(monthNumber) - 1]} ${year}`;
  }

  function formatDate(date: string) {
    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  }

  function receiptNumber(payment: Payment) {
    return String(payment.id).padStart(6, "0");
  }
  function getPaymentSummary(payment: Payment) {
  const student = students.find(
    (student) => student.id === payment.student_id
  );

  const monthlyFee = Number(student?.monthly_fee || 0);

  const totalPaid = payments
    .filter(
      (item) =>
        item.student_id === payment.student_id &&
        item.month === payment.month
    )
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const balance = Math.max(monthlyFee - totalPaid, 0);

  let status = "Απλήρωτο";

  if (totalPaid >= monthlyFee && monthlyFee > 0) {
    status = "Εξοφλημένο";
  } else if (totalPaid > 0) {
    status = "Μερική πληρωμή";
  }

  return {
    monthlyFee,
    totalPaid,
    balance,
    status,
  };
}

  function printReceipt() {
    window.print();
  }

  const receiptSummary = selectedReceipt
    ? getPaymentSummary(selectedReceipt)
    : null;

  return (
    <>
      <main className="min-h-screen bg-slate-100 p-4 md:p-6 print:bg-white print:p-0">
        <div className="mx-auto max-w-6xl print:hidden">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                  ΚΑΛΟΜΕΛΕΤΑ
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Πληρωμές
                </h1>

                <p className="mt-2 text-slate-500">
                  Καταχώρηση και διαχείριση πληρωμών μαθητών
                </p>
              </div>

              <div className="rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Σύνολο εισπράξεων
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {payments
                    .reduce(
                      (sum, payment) =>
                        sum + Number(payment.amount),
                      0
                    )
                    .toFixed(2)}
                  €
                </p>
              </div>
            </div>
          </div>

          {/* NEW PAYMENT */}
          <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold text-slate-900">
                Νέα πληρωμή
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Καταχώρησε μια νέα πληρωμή μαθητή
              </p>
            </div>

            <form
              onSubmit={addPayment}
              className="grid gap-5 p-6 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μαθητής
                </label>

                <select
                  value={studentId}
                  onChange={(e) => selectStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  <option value="">Επίλεξε μαθητή</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} — {student.monthly_fee || 0}€
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μήνας
                </label>

                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ποσό (€)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="π.χ. 50"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Τρόπος πληρωμής
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ημερομηνία πληρωμής
                </label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-slate-900 px-5 py-3.5 font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99]"
                >
                  + Καταχώρηση πληρωμής
                </button>
              </div>
            </form>
          </div>

          {/* PAYMENT HISTORY */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Ιστορικό πληρωμών
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Όλες οι καταχωρημένες πληρωμές
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                Σύνολο:{" "}
                <strong className="text-slate-900">
                  {payments
                    .reduce(
                      (sum, payment) =>
                        sum + Number(payment.amount),
                      0
                    )
                    .toFixed(2)}
                  €
                </strong>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-slate-500">
                Φόρτωση...
              </div>
            ) : payments.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                Δεν υπάρχουν ακόμα πληρωμές.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4">Μαθητής</th>
                      <th className="p-4">Μήνας</th>
                      <th className="p-4">Ποσό</th>
                      <th className="p-4">Τρόπος</th>
                      <th className="p-4">Ημερομηνία</th>
                      <th className="p-4">Ενέργειες</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="p-4 font-semibold text-slate-900">
                          {studentName(payment.student_id)}
                        </td>

                        <td className="p-4 text-slate-600">
                          {monthLabel(payment.month)}
                        </td>

                        <td className="p-4 font-bold text-slate-900">
                          {Number(payment.amount).toFixed(2)}€
                        </td>

                        <td className="p-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {payment.payment_method || "-"}
                          </span>
                        </td>

                        <td className="p-4 text-slate-600">
                          {formatDate(payment.payment_date)}
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                setSelectedReceipt(payment)
                              }
                              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              🧾 Απόδειξη
                            </button>

                            <button
                              onClick={() =>
                                deletePayment(payment.id)
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              Διαγραφή
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RECEIPT MODAL */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="max-h-[95vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
              {/* Receipt */}
              <div
                id="receipt"
                className="bg-white p-8 md:p-10"
              >
                <div className="border-b-2 border-slate-900 pb-6">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-3xl font-black tracking-tight text-slate-900">
                        ΚΑΛΟΜΕΛΕΤΑ
                      </p>

                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        ΚΕΝΤΡΟ ΣΧΟΛΙΚΗΣ ΜΕΛΕΤΗΣ
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Απόδειξη
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        #{receiptNumber(selectedReceipt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-7">
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Στοιχεία πληρωμής
                    </p>

                    <div className="mt-4 space-y-4">
                      <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                        <span className="text-slate-500">
                          Μαθητής
                        </span>

                        <span className="text-right font-bold text-slate-900">
                          {studentName(selectedReceipt.student_id)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                        <span className="text-slate-500">
                          Μήνας
                        </span>

                        <span className="font-semibold text-slate-900">
                          {monthLabel(selectedReceipt.month)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                        <span className="text-slate-500">
                          Τρόπος πληρωμής
                        </span>

                        <span className="font-semibold text-slate-900">
                          {selectedReceipt.payment_method ||
                            "-"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                          Ημερομηνία
                        </span>

                        <span className="font-semibold text-slate-900">
                          {formatDate(
                            selectedReceipt.payment_date
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  {receiptSummary && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-100 p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Πληρωμή
                        </p>

                        <p className="mt-2 text-4xl font-black tracking-tight text-slate-900">
                          {Number(selectedReceipt.amount).toFixed(2)}€
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Οικονομική κατάσταση
                        </p>

                        <div className="space-y-3">
                          <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">
                              Μηνιαία χρέωση
                            </span>

                            <span className="font-semibold text-slate-900">
                              {receiptSummary.monthlyFee.toFixed(2)}€
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">
                              Σύνολο πληρωμών μήνα
                            </span>

                            <span className="font-semibold text-slate-900">
                              {receiptSummary.totalPaid.toFixed(2)}€
                            </span>
                          </div>

                          <div className="flex justify-between border-b border-slate-100 pb-3">
                            <span className="text-slate-500">
                              Υπόλοιπο
                            </span>

                            <span
                              className={`text-lg font-bold ${
                                receiptSummary.balance > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {receiptSummary.balance.toFixed(2)}€
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-slate-500">
                              Κατάσταση
                            </span>

                            <span
                              className={`rounded-full px-4 py-2 text-sm font-bold ${
                                receiptSummary.status === "Εξοφλημένο"
                                  ? "bg-green-100 text-green-700"
                                  : receiptSummary.status === "Μερική πληρωμή"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {receiptSummary.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    Ευχαριστούμε για την εμπιστοσύνη σας.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    ΚΑΛΟΜΕΛΕΤΑ · ΚΕΝΤΡΟ ΣΧΟΛΙΚΗΣ ΜΕΛΕΤΗΣ
                  </p>
                </div>
              </div>

                           {/* Buttons */}
              <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row">
                <button
                  onClick={printReceipt}
                  className="flex-1 rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  🖨️ Εκτύπωση / PDF
                </button>

                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Κλείσιμο
                </button>
              </div>
            </div>
          
        )}
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          #receipt,
          #receipt * {
            visibility: visible;
          }

          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            max-width: 700px;
            margin: 0 auto;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  );
}