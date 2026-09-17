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
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
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

  async function loadData() {
    setLoading(true);

    const [{ data: studentsData, error: studentsError }, { data: paymentsData, error: paymentsError }] =
      await Promise.all([
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

    await loadData();
  }

  function studentName(studentId: number) {
    return students.find((s) => s.id === studentId)?.name || "Άγνωστος";
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

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Πληρωμές
          </h1>

          <p className="mt-2 text-gray-600">
            Καταχώρηση και διαχείριση πληρωμών μαθητών
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-5 text-xl font-semibold">
            Νέα πληρωμή
          </h2>

          <form
            onSubmit={addPayment}
            className="grid gap-4 md:grid-cols-2"
          >
            <div>
              <label className="mb-2 block text-sm font-medium">
                Μαθητής
              </label>

              <select
                value={studentId}
                onChange={(e) => selectStudent(e.target.value)}
                className="w-full rounded-lg border p-3"
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
              <label className="mb-2 block text-sm font-medium">
                Μήνας
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Ποσό (€)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="π.χ. 50"
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Τρόπος πληρωμής
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border p-3"
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Ημερομηνία πληρωμής
              </label>

              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                + Καταχώρηση πληρωμής
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Ιστορικό πληρωμών
              </h2>

              <p className="text-sm text-gray-500">
                Όλες οι καταχωρημένες πληρωμές
              </p>
            </div>

            <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm">
              Σύνολο:{" "}
              <strong>
                {payments
                  .reduce((sum, payment) => sum + Number(payment.amount), 0)
                  .toFixed(2)}
                €
              </strong>
            </div>
          </div>

          {loading ? (
            <p>Φόρτωση...</p>
          ) : payments.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
              Δεν υπάρχουν ακόμα πληρωμές.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="p-3">Μαθητής</th>
                    <th className="p-3">Μήνας</th>
                    <th className="p-3">Ποσό</th>
                    <th className="p-3">Τρόπος</th>
                    <th className="p-3">Ημερομηνία</th>
                    <th className="p-3">Ενέργεια</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 font-medium">
                        {studentName(payment.student_id)}
                      </td>

                      <td className="p-3">
                        {monthLabel(payment.month)}
                      </td>

                      <td className="p-3 font-semibold">
                        {Number(payment.amount).toFixed(2)}€
                      </td>

                      <td className="p-3">
                        {payment.payment_method || "-"}
                      </td>

                      <td className="p-3">
                        {payment.payment_date}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => deletePayment(payment.id)}
                          className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                        >
                          Διαγραφή
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}