"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Student = {
  id: string;
  name: string;
  class: string;
  guardian: string;
  phone: string;
  monthly_fee: number;
  status: string;
  created_at?: string;
};

type Payment = {
  id: string;
  student_id: string;
  month: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  created_at?: string;
};

function getCurrentMonth() {
  const date = new Date();

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("el-GR");
}

function getMonthName(month: string) {
  const [year, monthNumber] = month.split("-");

  const date = new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  );

  return date.toLocaleDateString("el-GR", {
    month: "long",
  });
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

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
    try {
      setLoading(true);
      setError("");

      const { data: studentsData, error: studentsError } =
        await supabase
          .from("students")
          .select(
            "id,name,class,guardian,phone,monthly_fee,status,created_at"
          )
          .order("name", { ascending: true });

      if (studentsError) {
        throw studentsError;
      }

      const { data: paymentsData, error: paymentsError } =
        await supabase
          .from("payments")
          .select(
            "id,student_id,month,amount,payment_method,payment_date,created_at"
          )
          .eq("month", currentMonth)
          .order("payment_date", { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      setStudents(studentsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error(err);
      setError(
        "Δεν ήταν δυνατή η φόρτωση των δεδομένων του Dashboard."
      );
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
      (student) => student.status !== "inactive"
    );
  }, [students]);

  const paymentsByStudent = useMemo(() => {
    const totals: Record<string, number> = {};

    payments.forEach((payment) => {
      totals[payment.student_id] =
        (totals[payment.student_id] || 0) +
        Number(payment.amount || 0);
    });

    return totals;
  }, [payments]);

  const totalPaid = useMemo(() => {
    return payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );
  }, [payments]);

  const totalCharges = useMemo(() => {
    return activeStudents.reduce(
      (sum, student) =>
        sum + Number(student.monthly_fee || 0),
      0
    );
  }, [activeStudents]);

  const totalDebt = useMemo(() => {
    return activeStudents.reduce((sum, student) => {
      const fee = Number(student.monthly_fee || 0);
      const paid = paymentsByStudent[student.id] || 0;

      return sum + Math.max(fee - paid, 0);
    }, 0);
  }, [activeStudents, paymentsByStudent]);

  const recentPayments = useMemo(() => {
    return payments.slice(0, 5).map((payment) => {
      const student = students.find(
        (item) => item.id === payment.student_id
      );

      return {
        ...payment,
        studentName: student?.name || "Άγνωστος μαθητής",
      };
    });
  }, [payments, students]);

  const debtStudents = useMemo(() => {
    return activeStudents
      .map((student) => {
        const fee = Number(student.monthly_fee || 0);
        const paid = paymentsByStudent[student.id] || 0;
        const debt = Math.max(fee - paid, 0);

        return {
          ...student,
          debt,
        };
      })
      .filter((student) => student.debt > 0)
      .sort((a, b) => b.debt - a.debt)
      .slice(0, 5);
  }, [activeStudents, paymentsByStudent]);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden h-screen w-64 flex-col bg-slate-950 text-white md:flex md:sticky md:top-0">

          <div className="border-b border-slate-800 p-6">
            <h1 className="text-xl font-bold">
              Κέντρο Μελέτης
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Management System
            </p>
          </div>

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

          <div className="border-t border-slate-800 p-4">

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={19} />
              Έξοδος
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

                {/* MOBILE MENU BUTTON */}
                <button
                  onClick={() => setMenuOpen(true)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white md:hidden"
                  aria-label="Άνοιγμα μενού"
                >
                  <Menu size={22} />
                </button>

                <div>
                  <p className="hidden text-sm text-slate-500 sm:block">
                    Κέντρο Σχολικής Μελέτης
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

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (

              <div className="flex min-h-[500px] items-center justify-center">
                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">

                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                  <p className="text-sm font-medium text-slate-600">
                    Φόρτωση δεδομένων...
                  </p>

                </div>
              </div>

            ) : (

              <>

                {/* STATS */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                  {/* STUDENTS */}
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
                      {activeStudents.length}
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

                      <span className="text-xs font-medium text-green-600 capitalize">
                        {getMonthName(currentMonth)}
                      </span>

                    </div>

                    <p className="mt-5 text-sm text-slate-500">
                      Εισπράξεις
                    </p>

                    <p className="mt-1 text-3xl font-bold text-slate-900">
                      {formatCurrency(totalPaid)}
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
                      {formatCurrency(totalDebt)}
                    </p>

                  </div>

                  {/* TOTAL */}
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
                      {formatCurrency(totalCharges)}
                    </p>

                  </div>

                </div>

                {/* MONTH INFO */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Οικονομική εικόνα
                      </p>

                      <p className="mt-1 text-lg font-bold capitalize text-slate-900">
                        {getMonthName(currentMonth)}{" "}
                        {currentMonth.split("-")[0]}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">
                          Πληρωμές
                        </p>

                        <p className="mt-1 font-bold">
                          {payments.length}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-400">
                          Με οφειλή
                        </p>

                        <p className="mt-1 font-bold">
                          {debtStudents.length}
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
                          Οι τελευταίες πραγματικές καταχωρήσεις
                        </p>
                      </div>

                      <a
                        href="/payments"
                        className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                      >
                        Όλες
                      </a>

                    </div>

                    <div className="divide-y divide-slate-100">

                      {recentPayments.length === 0 ? (

                        <div className="p-8 text-center">

                          <CreditCard
                            size={30}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm text-slate-500">
                            Δεν υπάρχουν πληρωμές για τον τρέχοντα μήνα.
                          </p>

                        </div>

                      ) : (

                        recentPayments.map((payment) => (

                          <div
                            key={payment.id}
                            className="flex items-center justify-between gap-4 p-4 sm:p-5"
                          >

                            <div className="min-w-0">

                              <p className="truncate font-medium text-slate-900">
                                {payment.studentName}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {payment.payment_method || "Πληρωμή"}{" "}
                                •{" "}
                                {formatDate(payment.payment_date)}
                              </p>

                            </div>

                            <p className="shrink-0 font-bold text-green-600">
                              +{formatCurrency(Number(payment.amount || 0))}
                            </p>

                          </div>

                        ))

                      )}

                    </div>

                  </div>

                  {/* DEBTS */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex items-center justify-between border-b border-slate-200 p-5">

                      <div>
                        <h3 className="font-bold text-slate-900">
                          Εκκρεμείς οφειλές
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Μαθητές με πραγματικό υπόλοιπο
                        </p>
                      </div>

                      <a
                        href="/debts"
                        className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                      >
                        Όλες
                      </a>

                    </div>

                    <div className="divide-y divide-slate-100">

                      {debtStudents.length === 0 ? (

                        <div className="p-8 text-center">

                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                            <AlertCircle
                              size={24}
                              className="text-slate-400"
                            />
                          </div>

                          <p className="mt-3 text-sm font-medium text-slate-700">
                            Δεν υπάρχουν οφειλές.
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Όλοι οι ενεργοί μαθητές είναι τακτοποιημένοι.
                          </p>

                        </div>

                      ) : (

                        debtStudents.map((student) => (

                          <div
                            key={student.id}
                            className="flex items-center justify-between gap-4 p-4 sm:p-5"
                          >

                            <div className="min-w-0">

                              <p className="truncate font-medium text-slate-900">
                                {student.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {student.class}
                              </p>

                            </div>

                            <p className="shrink-0 font-bold text-red-600">
                              {formatCurrency(student.debt)}
                            </p>

                          </div>

                        ))

                      )}

                    </div>

                  </div>

                </div>

                {/* QUICK ACTIONS */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">

                  <a
                    href="/students"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Users size={22} />

                    <h3 className="mt-4 font-bold">
                      Μαθητές
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Δες και διαχειρίσου τους μαθητές.
                    </p>
                  </a>

                  <a
                    href="/payments"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <CreditCard size={22} />

                    <h3 className="mt-4 font-bold">
                      Νέα πληρωμή
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Καταχώρησε μια νέα πληρωμή.
                    </p>
                  </a>

                  <a
                    href="/communication"
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <MessageCircle size={22} />

                    <h3 className="mt-4 font-bold">
                      Επικοινωνία
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Επικοινώνησε με τους γονείς.
                    </p>
                  </a>

                </div>

              </>

            )}

          </div>

        </section>

      </div>
    </main>
  );
}