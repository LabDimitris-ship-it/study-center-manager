"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  AlertCircle,
  LogOut,
  Search,
  CheckCircle2,
  Wallet,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  class: string | null;
  guardian: string | null;
  phone: string | null;
  monthly_fee: number;
  status: string | null;
};

type Payment = {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  payment_method: string | null;
  payment_date: string;
};

type DebtExclusion = {
  id: number;
  student_id: number;
  month: string;
};

type Debt = {
  studentId: number;
  studentName: string;
  studentClass: string;
  month: string;
  monthlyFee: number;
  paid: number;
  amount: number;
};

function currentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function monthLabel(value: string) {
  if (!value) return "-";

  const [year, month] = value.split("-");

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

  return `${months[Number(month) - 1]} ${year}`;
}

function formatAmount(amount: number) {
  return `${amount.toLocaleString("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export default function DebtsPage() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exclusions, setExclusions] = useState<DebtExclusion[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth());

  async function loadData() {
    setLoading(true);

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
        .order("name"),

      supabase
        .from("payments")
        .select(
          "id,student_id,month,amount,payment_method,payment_date"
        )
        .order("payment_date", { ascending: false }),

      supabase
        .from("debt_exclusions")
        .select("id,student_id,month"),
    ]);

    if (studentsError) {
      console.error(studentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των μαθητών.");
    }

    if (paymentsError) {
      console.error(paymentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των πληρωμών.");
    }

    if (exclusionsError) {
      console.error(exclusionsError);
      alert("Δεν ήταν δυνατή η φόρτωση των εξαιρέσεων οφειλών.");
    }

    setStudents(studentsData || []);
    setPayments(paymentsData || []);
    setExclusions(exclusionsData || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const debts = useMemo(() => {
    const result: Debt[] = [];

    students
      .filter((student) => student.status !== "Ανενεργός")
      .forEach((student) => {
        const monthlyFee = Number(student.monthly_fee || 0);

        if (monthlyFee <= 0) return;

        const excluded = exclusions.some(
          (item) =>
            item.student_id === student.id &&
            item.month === selectedMonth
        );

        if (excluded) return;

        const paid = payments
          .filter(
            (payment) =>
              payment.student_id === student.id &&
              payment.month === selectedMonth
          )
          .reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
          );

        const debtAmount = Math.max(monthlyFee - paid, 0);

        if (debtAmount > 0) {
          result.push({
            studentId: student.id,
            studentName: student.name,
            studentClass: student.class || "-",
            month: selectedMonth,
            monthlyFee,
            paid,
            amount: debtAmount,
          });
        }
      });

    return result;
  }, [students, payments, exclusions, selectedMonth]);

  const filteredDebts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return debts;

    return debts.filter(
      (debt) =>
        debt.studentName.toLowerCase().includes(value) ||
        debt.studentClass.toLowerCase().includes(value)
    );
  }, [debts, search]);

  const totalDebt = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.amount, 0);
  }, [debts]);

  const totalPaid = useMemo(() => {
    return debts.reduce((sum, debt) => sum + debt.paid, 0);
  }, [debts]);

  async function excludeDebt(debt: Debt) {
    const confirmed = window.confirm(
      `Θέλεις να εξαιρέσεις την οφειλή του/της "${debt.studentName}" για τον ${monthLabel(
        debt.month
      )};`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("debt_exclusions")
      .insert({
        student_id: debt.studentId,
        month: debt.month,
      });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        alert("Η συγκεκριμένη οφειλή έχει ήδη εξαιρεθεί.");
      } else {
        alert("Δεν ήταν δυνατή η εξαίρεση της οφειλής.");
      }

      return;
    }

    await loadData();
  }

  async function restoreDebt(debt: Debt) {
    const exclusion = exclusions.find(
      (item) =>
        item.student_id === debt.studentId &&
        item.month === debt.month
    );

    if (!exclusion) return;

    const confirmed = window.confirm(
      `Θέλεις να επαναφέρεις την οφειλή του/της "${debt.studentName}";`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("debt_exclusions")
      .delete()
      .eq("id", exclusion.id);

    if (error) {
      console.error(error);
      alert("Δεν ήταν δυνατή η επαναφορά της οφειλής.");
      return;
    }

    await loadData();
  }

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
      {/* MOBILE MENU */}
      {mobileMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <aside
            className="relative h-full w-[280px] bg-slate-950 text-white shadow-2xl"
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
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      item.href === "/debts"
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
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                  item.href === "/debts"
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
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenu(true)}
                className="rounded-xl border border-slate-200 p-2 lg:hidden"
              >
                <Menu size={22} />
              </button>

              <div>
                <p className="hidden text-xs font-medium text-slate-500 sm:block">
                  Κέντρο Σχολικής Μελέτης
                </p>

                <h1 className="text-xl font-bold sm:text-2xl">
                  Οφειλές
                </h1>
              </div>
            </div>

            <a
              href="/payments"
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2.5 text-sm font-bold text-white hover:bg-slate-800 sm:px-4"
            >
              <CreditCard size={17} />
              <span className="hidden sm:inline">
                Νέα πληρωμή
              </span>
            </a>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          {/* TITLE */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              ΟΙΚΟΝΟΜΙΚΗ ΔΙΑΧΕΙΡΙΣΗ
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Εκκρεμείς οφειλές
            </h2>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Παρακολούθηση υπολοίπων μαθητών ανά μήνα.
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Συνολικές οφειλές
                  </p>

                  <p className="mt-2 text-2xl font-black text-red-600">
                    {formatAmount(totalDebt)}
                  </p>
                </div>

                <div className="rounded-xl bg-red-50 p-3">
                  <AlertCircle
                    size={22}
                    className="text-red-600"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Μαθητές με οφειλή
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    {debts.length}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Users size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Ήδη καταβληθέντα
                  </p>

                  <p className="mt-2 text-2xl font-black">
                    {formatAmount(totalPaid)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Wallet size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* FILTERS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μήνας
                </label>

                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) =>
                    setSelectedMonth(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Αναζήτηση
                </label>

                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Μαθητής ή τάξη..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* DEBTS */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h3 className="text-lg font-bold">
                  Οφειλές — {monthLabel(selectedMonth)}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {filteredDebts.length} εγγραφές εμφανίζονται
                </p>
              </div>

              <div className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                {formatAmount(
                  filteredDebts.reduce(
                    (sum, debt) => sum + debt.amount,
                    0
                  )
                )}
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm text-slate-500">
                Φόρτωση οφειλών...
              </div>
            ) : filteredDebts.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2
                  size={46}
                  className="mx-auto text-emerald-500"
                />

                <p className="mt-4 font-bold text-slate-800">
                  Δεν υπάρχουν εκκρεμείς οφειλές
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Για τον μήνα {monthLabel(selectedMonth)}.
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="space-y-3 p-4 lg:hidden">
                  {filteredDebts.map((debt) => (
                    <div
                      key={`${debt.studentId}-${debt.month}`}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="truncate font-bold text-slate-900">
                            {debt.studentName}
                          </h4>

                          <p className="mt-1 text-sm text-slate-500">
                            {debt.studentClass}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-xl font-black text-red-600">
                            {formatAmount(debt.amount)}
                          </p>

                          <p className="text-xs text-slate-400">
                            Υπόλοιπο
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400">
                            Μηνιαία χρέωση
                          </p>

                          <p className="mt-1 font-bold">
                            {formatAmount(debt.monthlyFee)}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400">
                            Πληρωμένα
                          </p>

                          <p className="mt-1 font-bold text-emerald-600">
                            {formatAmount(debt.paid)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <button
                          onClick={() => excludeDebt(debt)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <CheckCircle2 size={17} />
                          Εξαίρεση οφειλής
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4">
                          Μαθητής
                        </th>

                        <th className="px-6 py-4">
                          Τάξη
                        </th>

                        <th className="px-6 py-4">
                          Μήνας
                        </th>

                        <th className="px-6 py-4">
                          Χρέωση
                        </th>

                        <th className="px-6 py-4">
                          Πληρωμένα
                        </th>

                        <th className="px-6 py-4">
                          Υπόλοιπο
                        </th>

                        <th className="px-6 py-4 text-right">
                          Ενέργεια
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDebts.map((debt) => (
                        <tr
                          key={`${debt.studentId}-${debt.month}`}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-900">
                              {debt.studentName}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {debt.studentClass}
                          </td>

                          <td className="px-6 py-5 text-sm capitalize text-slate-600">
                            {monthLabel(debt.month)}
                          </td>

                          <td className="px-6 py-5 font-semibold">
                            {formatAmount(debt.monthlyFee)}
                          </td>

                          <td className="px-6 py-5 font-semibold text-emerald-600">
                            {formatAmount(debt.paid)}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700">
                              {formatAmount(debt.amount)}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => excludeDebt(debt)}
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                            >
                              <CheckCircle2 size={17} />
                              Εξαίρεση
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* INFO */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
            <p className="font-semibold text-slate-700">
              ℹ️ Πώς υπολογίζεται η οφειλή
            </p>

            <p className="mt-2 leading-6">
              Η οφειλή υπολογίζεται από τη μηνιαία χρέωση του
              μαθητή μείον το σύνολο των πληρωμών που έχουν
              καταχωρηθεί για τον συγκεκριμένο μήνα.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}