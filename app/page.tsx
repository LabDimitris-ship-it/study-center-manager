"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Users,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Plus,
  ArrowUpRight,
  LogOut,
  Menu,
  X,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Student = {
  id: number;
  name: string;
  class: string;
  guardian: string;
  phone: string;
  monthly_fee: number;
  status: string;
};

type Payment = {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  created_at?: string;
};

type DebtExclusion = {
  id: number;
  student_id: number;
  month: string;
};

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "-";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatToday() {
  return new Intl.DateTimeFormat("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exclusions, setExclusions] = useState<DebtExclusion[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentMonth = getCurrentMonth();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {
      window.location.href = "/login";
      return;
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const [
        { data: studentsData, error: studentsError },
        { data: paymentsData, error: paymentsError },
        { data: exclusionsData, error: exclusionsError },
      ] = await Promise.all([
        supabase
          .from("students")
          .select(
            "id,name,class,guardian,phone,monthly_fee,status"
          )
          .order("name", { ascending: true }),

        supabase
          .from("payments")
          .select(
            "id,student_id,month,amount,payment_method,payment_date,created_at"
          )
          .eq("month", currentMonth)
          .order("payment_date", { ascending: false }),

        supabase
          .from("debt_exclusions")
          .select("id,student_id,month")
          .eq("month", currentMonth),
      ]);

      if (studentsError) {
        throw studentsError;
      }

      if (paymentsError) {
        throw paymentsError;
      }

      if (exclusionsError) {
        throw exclusionsError;
      }

      setStudents((studentsData || []) as Student[]);
      setPayments((paymentsData || []) as Payment[]);
      setExclusions((exclusionsData || []) as DebtExclusion[]);
    } catch (err) {
      console.error(err);
      setError("Δεν ήταν δυνατή η φόρτωση των στοιχείων.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("loggedIn");

    document.cookie =
      "loggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.href = "/login";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const activeStudents = useMemo(() => {
    return students.filter(
      (student) => student.status !== "Ανενεργός"
    );
  }, [students]);

  const paymentsByStudent = useMemo(() => {
    const result: Record<number, number> = {};

    payments.forEach((payment) => {
      result[payment.student_id] =
        (result[payment.student_id] || 0) +
        Number(payment.amount || 0);
    });

    return result;
  }, [payments]);

  /*
   * Οι μαθητές που έχουν εξαιρεθεί από οφειλή
   * για τον συγκεκριμένο μήνα.
   */
  const excludedStudentIds = useMemo(() => {
    return new Set(
      exclusions.map((item) => Number(item.student_id))
    );
  }, [exclusions]);

  /*
   * Συνολικές χρεώσεις ενεργών μαθητών.
   */
  const totalCharges = useMemo(() => {
    return activeStudents.reduce((sum, student) => {
      return sum + Number(student.monthly_fee || 0);
    }, 0);
  }, [activeStudents]);

  /*
   * Συνολικές εισπράξεις του συγκεκριμένου μήνα.
   */
  const totalPayments = useMemo(() => {
    return payments.reduce((sum, payment) => {
      return sum + Number(payment.amount || 0);
    }, 0);
  }, [payments]);

  /*
   * Πραγματικές οφειλές.
   *
   * Αν υπάρχει εξαίρεση για τον μαθητή και τον μήνα,
   * η συγκεκριμένη οφειλή ΔΕΝ υπολογίζεται.
   */
  const debtStudents = useMemo(() => {
    return activeStudents
      .filter((student) => {
        return !excludedStudentIds.has(Number(student.id));
      })
      .map((student) => {
        const fee = Number(student.monthly_fee || 0);
        const paid = Number(
          paymentsByStudent[student.id] || 0
        );

        const debt = Math.max(fee - paid, 0);

        return {
          ...student,
          paid,
          debt,
        };
      })
      .filter((student) => student.debt > 0)
      .sort((a, b) => b.debt - a.debt);
  }, [
    activeStudents,
    paymentsByStudent,
    excludedStudentIds,
  ]);

  const totalDebt = useMemo(() => {
    return debtStudents.reduce(
      (sum, student) => sum + student.debt,
      0
    );
  }, [debtStudents]);

  /*
   * Πόσοι μαθητές έχουν πληρώσει κάτι μέσα στον μήνα.
   */
  const studentsWithPayment = useMemo(() => {
    return activeStudents.filter(
      (student) =>
        Number(paymentsByStudent[student.id] || 0) > 0
    ).length;
  }, [activeStudents, paymentsByStudent]);

  /*
   * Ποιοι είναι εξοφλημένοι.
   */
  const paidStudents = useMemo(() => {
    return activeStudents.filter((student) => {
      const fee = Number(student.monthly_fee || 0);
      const paid = Number(
        paymentsByStudent[student.id] || 0
      );

      return fee > 0 && paid >= fee;
    }).length;
  }, [activeStudents, paymentsByStudent]);

  /*
   * Πραγματικές πρόσφατες πληρωμές.
   */
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        return (
          new Date(b.payment_date).getTime() -
          new Date(a.payment_date).getTime()
        );
      })
      .slice(0, 5);
  }, [payments]);

  function studentName(studentId: number) {
    return (
      students.find((student) => student.id === studentId)
        ?.name || "Άγνωστος μαθητής"
    );
  }

  function studentClass(studentId: number) {
    return (
      students.find((student) => student.id === studentId)
        ?.class || ""
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden h-screen w-64 flex-col bg-slate-950 text-white md:sticky md:top-0 md:flex">

          {/* LOGO */}
          <div className="border-b border-slate-800 p-6">
            <h1 className="text-xl font-bold">
              Κέντρο Μελέτης
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Management System
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 p-4">

            <a
              href="/"
              className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
            >
              <TrendingUp size={19} />
              Dashboard
            </a>

            <a
              href="/students"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <Users size={19} />
              Μαθητές
            </a>

            <a
              href="/registrations"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <Plus size={19} />
              Εγγραφές
            </a>

            <a
              href="/payments"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <CreditCard size={19} />
              Πληρωμές
            </a>

            <a
              href="/debts"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <AlertCircle size={19} />
              Οφειλές
            </a>

            <a
              href="/communication"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <MessageCircle size={19} />
              Επικοινωνία
            </a>

            <a
              href="/finance"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <BarChart3 size={19} />
              Οικονομικά
            </a>

          </nav>

          {/* LOGOUT */}
          <div className="border-t border-slate-800 p-4">

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={19} />
              <span>Έξοδος</span>
            </button>

            <p className="mt-3 px-4 text-xs text-slate-600">
              Study Center Manager
            </p>

            <p className="mt-1 px-4 text-xs text-slate-700">
              v1.0
            </p>

          </div>

        </aside>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">

            {/* BACKDROP */}
            <button
              aria-label="Κλείσιμο μενού"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/50"
            />

            {/* MENU */}
            <aside className="relative z-10 flex h-full w-[82%] max-w-sm flex-col bg-slate-950 text-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-800 p-5">

                <div>
                  <h1 className="text-lg font-bold">
                    Κέντρο Μελέτης
                  </h1>

                  <p className="mt-1 text-xs text-slate-400">
                    Management System
                  </p>
                </div>

                <button
                  onClick={closeMenu}
                  className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
                  aria-label="Κλείσιμο"
                >
                  <X size={24} />
                </button>

              </div>

              <nav className="flex-1 p-4">

                <a
                  href="/"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl bg-white/10 px-4 py-4 text-base font-medium"
                >
                  <TrendingUp size={21} />
                  Dashboard
                </a>

                <a
                  href="/students"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <Users size={21} />
                  Μαθητές
                </a>

                <a
                  href="/registrations"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <Plus size={21} />
                  Εγγραφές
                </a>

                <a
                  href="/payments"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <CreditCard size={21} />
                  Πληρωμές
                </a>

                <a
                  href="/debts"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <AlertCircle size={21} />
                  Οφειλές
                </a>

                <a
                  href="/communication"
                  onClick={closeMenu}
                  className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <MessageCircle size={21} />
                  Επικοινωνία
                </a>

                <a
                  href="/finance"
                  onClick={closeMenu}
                  className="flex items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-300 transition hover:bg-white/10"
                >
                  <BarChart3 size={21} />
                  Οικονομικά
                </a>

              </nav>

              <div className="border-t border-slate-800 p-4">

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-base text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut size={21} />
                  Έξοδος
                </button>

                <p className="mt-3 px-4 text-xs text-slate-600">
                  Study Center Manager
                </p>

              </div>

            </aside>

          </div>
        )}

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* HEADER */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 md:px-8">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                {/* MOBILE MENU */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white md:hidden"
                  aria-label="Άνοιγμα μενού"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <p className="hidden text-sm text-slate-500 sm:block">
                    {formatToday()}
                  </p>

                  <h2 className="text-xl font-bold text-slate-900 sm:mt-1 sm:text-2xl">
                    Dashboard
                  </h2>
                </div>

              </div>

              <a
                href="/payments"
                className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-xs font-semibold text-white transition hover:bg-slate-800 sm:px-4 sm:text-sm"
              >
                <Plus size={18} />

                <span className="hidden sm:inline">
                  Νέα πληρωμή
                </span>

                <span className="sm:hidden">
                  Πληρωμή
                </span>
              </a>

            </div>

          </header>

          {/* CONTENT */}
          <div className="p-4 sm:p-6 md:p-8">

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* STATS */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* ACTIVE STUDENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Users
                      size={21}
                      className="text-slate-700"
                    />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    ΕΝΕΡΓΟΙ
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Ενεργοί μαθητές
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "..." : activeStudents.length}
                </p>

              </div>

              {/* PAYMENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="rounded-xl bg-slate-100 p-3">
                    <CreditCard
                      size={21}
                      className="text-slate-700"
                    />
                  </div>

                  <span className="text-xs font-medium text-green-600">
                    {monthLabel(currentMonth).split(" ")[0]}
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Εισπράξεις
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : formatMoney(totalPayments)}
                </p>

              </div>

              {/* DEBTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="rounded-xl bg-red-50 p-3">
                    <AlertCircle
                      size={21}
                      className="text-red-600"
                    />
                  </div>

                  <span className="text-xs font-medium text-red-600">
                    ΕΚΚΡΕΜΟΥΝ
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Οφειλές
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : formatMoney(totalDebt)}
                </p>

              </div>

              {/* TOTAL CHARGES */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="rounded-xl bg-slate-100 p-3">
                    <TrendingUp
                      size={21}
                      className="text-slate-700"
                    />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-green-600"
                  />

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Συνολικές χρεώσεις
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading
                    ? "..."
                    : formatMoney(totalCharges)}
                </p>

              </div>

            </div>

            {/* MONTH SUMMARY */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Οικονομική εικόνα
                  </p>

                  <h3 className="mt-1 text-lg font-bold text-slate-900">
                    {monthLabel(currentMonth)}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex">

                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Πληρωμές
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {payments.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Με οφειλή
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {debtStudents.length}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Έχουν πληρώσει
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {studentsWithPayment}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-xs text-slate-500">
                      Εξοφλημένοι
                    </p>

                    <p className="mt-1 font-bold text-green-600">
                      {paidStudents}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            {/* TABLES */}
            <div className="mt-6 grid gap-6 xl:grid-cols-2">

              {/* RECENT PAYMENTS */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-200 p-5">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Πρόσφατες πληρωμές
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {monthLabel(currentMonth)}
                    </p>
                  </div>

                  <a
                    href="/payments"
                    className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                  >
                    Όλες
                  </a>

                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Φόρτωση...
                  </div>
                ) : recentPayments.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Δεν υπάρχουν πληρωμές για τον συγκεκριμένο μήνα.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">

                    {recentPayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between gap-4 p-4 sm:p-5"
                      >

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {studentName(payment.student_id)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {payment.payment_method || "Πληρωμή"}{" "}
                            •{" "}
                            {formatDate(payment.payment_date)}
                          </p>

                        </div>

                        <p className="shrink-0 font-bold text-green-600">
                          +{formatMoney(Number(payment.amount || 0))}
                        </p>

                      </div>
                    ))}

                  </div>
                )}

              </div>

              {/* DEBTS */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-200 p-5">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Εκκρεμείς οφειλές
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Χωρίς τις εξαιρέσεις οφειλών
                    </p>
                  </div>

                  <a
                    href="/debts"
                    className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                  >
                    Όλες
                  </a>

                </div>

                {loading ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Φόρτωση...
                  </div>
                ) : debtStudents.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    Δεν υπάρχουν εκκρεμείς οφειλές.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">

                    {debtStudents.slice(0, 5).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between gap-4 p-4 sm:p-5"
                      >

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {student.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {student.class || "Χωρίς τάξη"}
                          </p>

                        </div>

                        <p className="shrink-0 font-bold text-red-600">
                          {formatMoney(student.debt)}
                        </p>

                      </div>
                    ))}

                  </div>
                )}

              </div>

            </div>

            {/* EXCLUDED INFO */}
            {exclusions.length > 0 && (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex gap-3">

                  <div className="mt-0.5 rounded-lg bg-amber-100 p-2">
                    <AlertCircle
                      size={18}
                      className="text-amber-700"
                    />
                  </div>

                  <div>

                    <p className="font-semibold text-amber-900">
                      Εξαιρέσεις οφειλών
                    </p>

                    <p className="mt-1 text-sm text-amber-800">
                      Υπάρχουν {exclusions.length}{" "}
                      {exclusions.length === 1
                        ? "εξαίρεση"
                        : "εξαιρέσεις"}{" "}
                      για τον {monthLabel(currentMonth)}.
                      Οι συγκεκριμένες οφειλές δεν
                      υπολογίζονται στο Dashboard.
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
   );
}