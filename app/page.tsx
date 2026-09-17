"use client";

import { useEffect, useState } from "react";
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

const payments = [
  {
    student: "Μαρία Κωνσταντίνου",
    amount: "80,00 €",
    method: "Μετρητά",
    date: "16/09/2026",
  },
  {
    student: "Γιώργος Παπαδόπουλος",
    amount: "100,00 €",
    method: "POS",
    date: "16/09/2026",
  },
  {
    student: "Νίκος Δημητρίου",
    amount: "70,00 €",
    method: "IRIS",
    date: "15/09/2026",
  },
  {
    student: "Ελένη Γεωργίου",
    amount: "90,00 €",
    method: "Τράπεζα",
    date: "15/09/2026",
  },
];

const debts = [
  {
    student: "Γιάννης Παπαδόπουλος",
    month: "Σεπτέμβριος",
    amount: "80,00 €",
  },
  {
    student: "Ελένη Κωνσταντίνου",
    month: "Σεπτέμβριος",
    amount: "50,00 €",
  },
  {
    student: "Κώστας Νικολάου",
    month: "Σεπτέμβριος",
    amount: "100,00 €",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {
      window.location.href = "/login";
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("loggedIn");

    document.cookie =
      "loggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    window.location.href = "/login";
  }

  function closeMenu() {
    setMenuOpen(false);
  }

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

            {/* ΟΙΚΟΝΟΜΙΚΑ */}
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

                  <span className="text-xs font-medium text-green-600">
                    +8%
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Ενεργοί μαθητές
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  86
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
                    Σεπτέμβριος
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Εισπράξεις
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  3.240 €
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
                    Εκκρεμούν
                  </span>

                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Οφειλές
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  680 €
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
                  3.920 €
                </p>

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
                      Οι τελευταίες καταχωρήσεις
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

                  {payments.map((payment) => (
                    <div
                      key={payment.student}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium text-slate-900">
                          {payment.student}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payment.method} • {payment.date}
                        </p>

                      </div>

                      <p className="shrink-0 font-bold text-green-600">
                        +{payment.amount}
                      </p>

                    </div>
                  ))}

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
                      Μαθητές με υπόλοιπο
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

                  {debts.map((debt) => (
                    <div
                      key={debt.student}
                      className="flex items-center justify-between gap-4 p-4 sm:p-5"
                    >

                      <div className="min-w-0">

                        <p className="truncate font-medium text-slate-900">
                          {debt.student}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {debt.month}
                        </p>

                      </div>

                      <p className="shrink-0 font-bold text-red-600">
                        {debt.amount}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}