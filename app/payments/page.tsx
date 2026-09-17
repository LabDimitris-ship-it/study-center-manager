"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  AlertCircle,
  LogOut,
  Plus,
  Trash2,
  Receipt,
  Printer,
  Wallet,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

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
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

function monthLabel(month: string) {
  if (!month) return "-";

  const [year, monthNumber] = month.split("-");

  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return date.toLocaleDateString("el-GR", {
    month: "long",
    year: "numeric",
  });
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("el-GR");
}

function receiptNumber(id: number) {
  return `ΑΠ-${String(id).padStart(6, "0")}`;
}

export default function PaymentsPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [studentId, setStudentId] = useState("");
  const [month, setMonth] = useState(currentMonth());
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Μετρητά");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedReceipt, setSelectedReceipt] =
    useState<Payment | null>(null);

  async function loadData() {
    setLoading(true);

    const [{ data: studentsData }, { data: paymentsData }] =
      await Promise.all([
        supabase
          .from("students")
          .select("id,name,monthly_fee")
          .order("name"),

        supabase
          .from("payments")
          .select(
            "id,student_id,month,amount,payment_method,payment_date"
          )
          .order("payment_date", { ascending: false }),
      ]);

    setStudents(studentsData || []);
    setPayments(paymentsData || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  function studentName(id: number) {
    return students.find((student) => student.id === id)?.name || "Άγνωστος";
  }

  function selectedStudent() {
    return students.find((student) => student.id === Number(studentId));
  }

  function selectStudent(value: string) {
    setStudentId(value);

    const student = students.find(
      (item) => item.id === Number(value)
    );

    if (student) {
      setAmount(String(student.monthly_fee));
    }
  }

  async function addPayment() {
    if (!studentId) {
      alert("Επίλεξε μαθητή.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Βάλε έγκυρο ποσό.");
      return;
    }

    if (!month) {
      alert("Επίλεξε μήνα.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("payments").insert({
      student_id: Number(studentId),
      month,
      amount: Number(amount),
      payment_method: paymentMethod,
      payment_date: paymentDate,
    });

    setSaving(false);

    if (error) {
      alert("Παρουσιάστηκε σφάλμα κατά την καταχώρηση.");
      console.error(error);
      return;
    }

    alert("Η πληρωμή καταχωρήθηκε επιτυχώς.");

    setStudentId("");
    setMonth(currentMonth());
    setAmount("");
    setPaymentMethod("Μετρητά");
    setPaymentDate(new Date().toISOString().split("T")[0]);

    await loadData();
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
      alert("Δεν ήταν δυνατή η διαγραφή.");
      console.error(error);
      return;
    }

    if (selectedReceipt?.id === id) {
      setSelectedReceipt(null);
    }

    await loadData();
  }

  function getPaymentSummary(payment: Payment) {
    const student = students.find(
      (item) => item.id === payment.student_id
    );

    const monthlyFee = student?.monthly_fee || 0;

    const totalPaid = payments
      .filter(
        (item) =>
          item.student_id === payment.student_id &&
          item.month === payment.month
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);

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

  const totalPayments = useMemo(() => {
    return payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );
  }, [payments]);

  const currentMonthPayments = useMemo(() => {
    return payments
      .filter((payment) => payment.month === currentMonth())
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  }, [payments]);

  function logout() {
    localStorage.removeItem("loggedIn");
    document.cookie =
      "loggedIn=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.assign("/login");
  }

  const menuItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: "Μαθητές",
      href: "/students",
      icon: Users,
    },
    {
      label: "Εγγραφές",
      href: "/registrations",
      icon: UserPlus,
    },
    {
      label: "Πληρωμές",
      href: "/payments",
      icon: CreditCard,
    },
    {
      label: "Οφειλές",
      href: "/debts",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* MOBILE OVERLAY */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <aside
            className="h-full w-[280px] bg-slate-950 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <div className="text-lg font-black tracking-wide">
                  ΚΑΛΟΜΕΛΕΤΑ
                </div>
                <div className="text-xs text-slate-400">
                  Study Center Manager
                </div>
              </div>

              <button
                onClick={() => setMobileMenu(false)}
                className="rounded-xl p-2 hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="space-y-2 p-4">
              {menuItems.map((item) => {
                const Icon = item.icon;

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenu(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      item.href === "/payments"
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="absolute bottom-0 w-[280px] border-t border-white/10 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={19} />
                Αποσύνδεση
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white lg:block">
        <div className="border-b border-white/10 px-6 py-6">
          <div className="text-xl font-black tracking-wide">
            ΚΑΛΟΜΕΛΕΤΑ
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Study Center Manager
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  item.href === "/payments"
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-64">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenu(true)}
                className="rounded-xl border border-slate-200 p-2 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <h1 className="text-lg font-bold sm:text-xl">
                  Πληρωμές
                </h1>
                <p className="hidden text-xs text-slate-500 sm:block">
                  Διαχείριση πληρωμών μαθητών
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 sm:flex">
              <Wallet size={17} />
              {formatAmount(currentMonthPayments)}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* STATS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Πληρωμές μήνα
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatAmount(currentMonthPayments)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <CreditCard size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Σύνολο εισπράξεων
                  </p>

                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {formatAmount(totalPayments)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Wallet size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* NEW PAYMENT */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-950 p-2 text-white">
                  <Plus size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    Νέα πληρωμή
                  </h2>

                  <p className="text-sm text-slate-500">
                    Καταχώρησε μια νέα πληρωμή μαθητή
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 sm:p-6 lg:grid-cols-2">
              {/* STUDENT */}
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μαθητής
                </label>

                <select
                  value={studentId}
                  onChange={(e) => selectStudent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Επίλεξε μαθητή...</option>

                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MONTH */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μήνας
                </label>

                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              {/* AMOUNT */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ποσό
                </label>

                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:border-slate-900"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">
                    €
                  </span>
                </div>
              </div>

              {/* METHOD */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Τρόπος πληρωμής
                </label>

                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Ημερομηνία
                </label>

                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>

              {/* SELECTED STUDENT INFO */}
              {selectedStudent() && (
                <div className="lg:col-span-2 rounded-xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Μηνιαία συνδρομή
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {formatAmount(
                          selectedStudent()?.monthly_fee || 0
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Μήνας
                      </p>

                      <p className="mt-1 text-sm font-bold capitalize">
                        {monthLabel(month)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="lg:col-span-2">
                <button
                  onClick={addPayment}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus size={19} />
                  {saving
                    ? "Καταχώρηση..."
                    : "Καταχώρηση πληρωμής"}
                </button>
              </div>
            </div>
          </section>

          {/* HISTORY */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="text-lg font-bold">
                  Ιστορικό πληρωμών
                </h2>

                <p className="text-sm text-slate-500">
                  Όλες οι καταχωρημένες πληρωμές
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold">
                {payments.length} πληρωμές
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Φόρτωση πληρωμών...
              </div>
            ) : payments.length === 0 ? (
              <div className="p-10 text-center">
                <CreditCard
                  className="mx-auto text-slate-300"
                  size={42}
                />

                <p className="mt-3 font-semibold text-slate-600">
                  Δεν υπάρχουν πληρωμές.
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="space-y-3 p-4 sm:p-5 lg:hidden">
                  {payments.map((payment) => {
                    const summary = getPaymentSummary(payment);

                    return (
                      <div
                        key={payment.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {studentName(payment.student_id)}
                            </p>

                            <p className="mt-1 text-sm capitalize text-slate-500">
                              {monthLabel(payment.month)}
                            </p>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-lg font-black">
                              {formatAmount(Number(payment.amount))}
                            </p>

                            <p className="text-xs text-slate-400">
                              {receiptNumber(payment.id)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">
                              Τρόπος
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {payment.payment_method || "-"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-xs text-slate-400">
                              Ημερομηνία
                            </p>

                            <p className="mt-1 text-sm font-semibold">
                              {formatDate(payment.payment_date)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-100 p-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">
                              Υπόλοιπο μήνα
                            </span>

                            <span className="font-bold">
                              {formatAmount(summary.balance)}
                            </span>
                          </div>

                          <div className="mt-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                summary.status === "Εξοφλημένο"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : summary.status ===
                                      "Μερική πληρωμή"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-red-50 text-red-700"
                              }`}
                            >
                              {summary.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            onClick={() =>
                              setSelectedReceipt(payment)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-sm font-bold text-white hover:bg-slate-800"
                          >
                            <Receipt size={17} />
                            Απόδειξη
                          </button>

                          <button
                            onClick={() =>
                              deletePayment(payment.id)
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                            Διαγραφή
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4">Μαθητής</th>
                        <th className="px-6 py-4">Μήνας</th>
                        <th className="px-6 py-4">Ποσό</th>
                        <th className="px-6 py-4">Τρόπος</th>
                        <th className="px-6 py-4">Ημερομηνία</th>
                        <th className="px-6 py-4">Κατάσταση</th>
                        <th className="px-6 py-4 text-right">
                          Ενέργειες
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {payments.map((payment) => {
                        const summary = getPaymentSummary(payment);

                        return (
                          <tr
                            key={payment.id}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold">
                                {studentName(payment.student_id)}
                              </div>

                              <div className="mt-1 text-xs text-slate-400">
                                {receiptNumber(payment.id)}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-sm capitalize text-slate-600">
                              {monthLabel(payment.month)}
                            </td>

                            <td className="px-6 py-4 font-bold">
                              {formatAmount(Number(payment.amount))}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {payment.payment_method || "-"}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(payment.payment_date)}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                                  summary.status === "Εξοφλημένο"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : summary.status ===
                                        "Μερική πληρωμή"
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}
                              >
                                {summary.status}
                              </span>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    setSelectedReceipt(payment)
                                  }
                                  title="Απόδειξη"
                                  className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
                                >
                                  <Receipt size={17} />
                                </button>

                                <button
                                  onClick={() =>
                                    deletePayment(payment.id)
                                  }
                                  title="Διαγραφή"
                                  className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-bold">Απόδειξη πληρωμής</h2>

                <p className="text-xs text-slate-500">
                  {receiptNumber(selectedReceipt.id)}
                </p>
              </div>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl p-2 hover:bg-slate-100"
              >
                <X size={21} />
              </button>
            </div>

            <div
              id="payment-receipt"
              className="p-6 sm:p-8"
            >
              {(() => {
                const summary =
                  getPaymentSummary(selectedReceipt);

                return (
                  <>
                    <div className="text-center">
                      <h1 className="text-2xl font-black tracking-wide">
                        ΚΑΛΟΜΕΛΕΤΑ
                      </h1>

                      <p className="mt-1 text-xs font-semibold tracking-widest text-slate-500">
                        ΚΕΝΤΡΟ ΣΧΟΛΙΚΗΣ ΜΕΛΕΤΗΣ
                      </p>

                      <div className="mx-auto mt-5 h-px bg-slate-200" />

                      <p className="mt-5 text-sm font-bold uppercase tracking-wider text-slate-400">
                        ΑΠΟΔΕΙΞΗ ΠΛΗΡΩΜΗΣ
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {receiptNumber(selectedReceipt.id)}
                      </p>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Μαθητής
                        </span>

                        <span className="text-right text-sm font-bold">
                          {studentName(
                            selectedReceipt.student_id
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Μήνας
                        </span>

                        <span className="text-right text-sm font-bold capitalize">
                          {monthLabel(selectedReceipt.month)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Τρόπος πληρωμής
                        </span>

                        <span className="text-right text-sm font-bold">
                          {selectedReceipt.payment_method ||
                            "-"}
                        </span>
                      </div>

                      <div className="flex justify-between gap-4">
                        <span className="text-sm text-slate-500">
                          Ημερομηνία
                        </span>

                        <span className="text-right text-sm font-bold">
                          {formatDate(
                            selectedReceipt.payment_date
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="my-6 h-px bg-slate-200" />

                    <div className="rounded-2xl bg-slate-950 p-5 text-center text-white">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Ποσό πληρωμής
                      </p>

                      <p className="mt-2 text-4xl font-black">
                        {formatAmount(
                          Number(selectedReceipt.amount)
                        )}
                      </p>
                    </div>

                    <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Μηνιαία συνδρομή
                        </span>

                        <span className="font-bold">
                          {formatAmount(summary.monthlyFee)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">
                          Σύνολο πληρωμών μήνα
                        </span>

                        <span className="font-bold">
                          {formatAmount(summary.totalPaid)}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-slate-200 pt-3 text-sm">
                        <span className="text-slate-500">
                          Υπόλοιπο
                        </span>

                        <span className="font-black">
                          {formatAmount(summary.balance)}
                        </span>
                      </div>

                      <div className="pt-2 text-center">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                            summary.status === "Εξοφλημένο"
                              ? "bg-emerald-100 text-emerald-700"
                              : summary.status ===
                                  "Μερική πληρωμή"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {summary.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 text-center text-xs text-slate-400">
                      ΚΑΛΟΜΕΛΕΤΑ • Study Center Manager
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-5">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800"
              >
                <Printer size={18} />
                Εκτύπωση / PDF
              </button>

              <button
                onClick={() => setSelectedReceipt(null)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #payment-receipt,
          #payment-receipt * {
            visibility: visible !important;
          }

          #payment-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>
    </div>
  );
}