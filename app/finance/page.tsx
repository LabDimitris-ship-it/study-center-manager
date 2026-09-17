// app/finance/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  AlertCircle,
  MessageCircle,
  BarChart3,
  Wallet,
  Banknote,
  Landmark,
  Smartphone,
  Search,
  Menu,
  X,
  LogOut,
  Download,
  Printer,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
};

type Payment = {
  id: string;
  student_id: string;
  month: string;
  amount: number;
  payment_method: string;
  payment_date: string;
};

const navItems = [
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
  {
    label: "Επικοινωνία",
    href: "/communication",
    icon: MessageCircle,
  },
  {
    label: "Οικονομικά",
    href: "/finance",
    icon: BarChart3,
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}`;
};

const getMonthLabel = (month: string) => {
  const [year, monthNumber] = month.split("-");

  const date = new Date(Number(year), Number(monthNumber) - 1, 1);

  return date.toLocaleDateString("el-GR", {
    month: "long",
    year: "numeric",
  });
};

export default function FinancePage() {
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loggedIn =
      typeof window !== "undefined" &&
      localStorage.getItem("loggedIn") === "true";

    if (!loggedIn) {
      router.push("/login");
      return;
    }

    loadFinance();
  }, [router, month]);

  async function loadFinance() {
    try {
      setLoading(true);
      setError("");

      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select(
          "id,name,class,guardian,phone,monthly_fee,status"
        )
        .order("name", { ascending: true });

      if (studentsError) {
        throw studentsError;
      }

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select(
          "id,student_id,month,amount,payment_method,payment_date"
        )
        .eq("month", month)
        .order("payment_date", { ascending: false });

      if (paymentsError) {
        throw paymentsError;
      }

      setStudents(studentsData || []);
      setPayments(paymentsData || []);
    } catch (err) {
      console.error(err);
      setError("Δεν ήταν δυνατή η φόρτωση των οικονομικών στοιχείων.");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("loggedIn");
    document.cookie = "loggedIn=; path=/; max-age=0";
    router.push("/login");
  }

  const activeStudents = useMemo(() => {
    return students.filter((student) => student.status !== "inactive");
  }, [students]);

  const paymentsByStudent = useMemo(() => {
    const map: Record<string, number> = {};

    payments.forEach((payment) => {
      map[payment.student_id] =
        (map[payment.student_id] || 0) + Number(payment.amount || 0);
    });

    return map;
  }, [payments]);

  const studentFinancialData = useMemo(() => {
    return activeStudents.map((student) => {
      const paid = paymentsByStudent[student.id] || 0;
      const fee = Number(student.monthly_fee || 0);
      const balance = Math.max(fee - paid, 0);

      let status = "Απλήρωτο";

      if (paid >= fee && fee > 0) {
        status = "Εξοφλημένο";
      } else if (paid > 0) {
        status = "Μερική πληρωμή";
      }

      return {
        ...student,
        fee,
        paid,
        balance,
        status,
      };
    });
  }, [activeStudents, paymentsByStudent]);

  const filteredStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return studentFinancialData;
    }

    return studentFinancialData.filter((student) => {
      return (
        student.name.toLowerCase().includes(value) ||
        student.guardian?.toLowerCase().includes(value) ||
        student.class?.toLowerCase().includes(value) ||
        student.phone?.toLowerCase().includes(value)
      );
    });
  }, [studentFinancialData, search]);

  const totalCharges = useMemo(() => {
    return activeStudents.reduce(
      (sum, student) => sum + Number(student.monthly_fee || 0),
      0
    );
  }, [activeStudents]);

  const totalPaid = useMemo(() => {
    return payments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );
  }, [payments]);

  const totalDebt = useMemo(() => {
    return studentFinancialData.reduce(
      (sum, student) => sum + student.balance,
      0
    );
  }, [studentFinancialData]);

  const paidStudents = useMemo(() => {
    return studentFinancialData.filter(
      (student) => student.paid >= student.fee && student.fee > 0
    ).length;
  }, [studentFinancialData]);

  const partialStudents = useMemo(() => {
    return studentFinancialData.filter(
      (student) => student.paid > 0 && student.paid < student.fee
    ).length;
  }, [studentFinancialData]);

  const unpaidStudents = useMemo(() => {
    return studentFinancialData.filter(
      (student) => student.paid === 0 && student.fee > 0
    ).length;
  }, [studentFinancialData]);

  const collectionPercentage =
    totalCharges > 0 ? Math.min((totalPaid / totalCharges) * 100, 100) : 0;

  const methodTotals = useMemo(() => {
    const totals: Record<string, number> = {
      Μετρητά: 0,
      POS: 0,
      "Τραπεζική κατάθεση": 0,
      IRIS: 0,
    };

    payments.forEach((payment) => {
      const method = payment.payment_method || "Άλλο";

      totals[method] = (totals[method] || 0) + Number(payment.amount || 0);
    });

    return totals;
  }, [payments]);

  function exportCSV() {
    const headers = [
      "Μαθητής",
      "Τάξη",
      "Κηδεμόνας",
      "Τηλέφωνο",
      "Μηνιαία χρέωση",
      "Πληρωμές",
      "Υπόλοιπο",
      "Κατάσταση",
    ];

    const rows = filteredStudents.map((student) => [
      student.name,
      student.class,
      student.guardian,
      student.phone,
      student.fee.toFixed(2),
      student.paid.toFixed(2),
      student.balance.toFixed(2),
      student.status,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `oikonomiki-anafora-${month}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm lg:hidden print:hidden">
        <div>
          <div className="text-lg font-bold tracking-tight">
            ΚΑΛΟΜΕΛΕΤΑ
          </div>
          <div className="text-xs text-slate-500">
            Οικονομικά
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-xl border border-slate-200 p-2.5"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="relative flex h-full w-[280px] flex-col bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <div className="text-lg font-bold">ΚΑΛΟΜΕΛΕΤΑ</div>
                <div className="text-xs text-slate-400">
                  Κέντρο Σχολικής Μελέτης
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/finance";

                return (
                  <button
                    key={item.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push(item.href);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-white text-slate-950"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon size={19} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
              >
                <LogOut size={19} />
                Αποσύνδεση
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-slate-950 text-white lg:flex print:hidden">
        <div className="border-b border-white/10 p-6">
          <div className="text-xl font-bold">ΚΑΛΟΜΕΛΕΤΑ</div>
          <div className="mt-1 text-xs text-slate-400">
            Κέντρο Σχολικής Μελέτης
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/finance";

            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Αποσύνδεση
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* TITLE */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-900 p-3 text-white">
                  <BarChart3 size={24} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Οικονομικά
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Οικονομική αναφορά για{" "}
                    <span className="font-semibold capitalize">
                      {getMonthLabel(month)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />

              <button
                onClick={exportCSV}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Download size={18} />
                Εξαγωγή CSV
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                <Printer size={18} />
                Εκτύπωση
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
              <p className="text-sm text-slate-500">
                Φόρτωση οικονομικών στοιχείων...
              </p>
            </div>
          ) : (
            <>
              {/* SUMMARY CARDS */}
              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Wallet size={21} />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      ΧΡΕΩΣΕΙΣ
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Αναμενόμενες χρεώσεις
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(totalCharges)}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <Banknote size={21} />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      ΕΙΣΠΡΑΞΕΙΣ
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Σύνολο πληρωμών
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <AlertCircle size={21} />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      ΟΦΕΙΛΕΣ
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Υπόλοιπο μήνα
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(totalDebt)}
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-100 p-3">
                      <TrendingUp size={21} />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      ΕΙΣΠΡΑΞΗ
                    </span>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    Ποσοστό είσπραξης
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {collectionPercentage.toFixed(1)}%
                  </p>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{
                        width: `${collectionPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* STUDENT STATUS */}
              <section className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Εξοφλημένοι μαθητές
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {paidStudents}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    από {activeStudents.length} ενεργούς μαθητές
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Μερικές πληρωμές
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {partialStudents}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    μαθητές με υπόλοιπο
                  </p>
                </div>

                <div className="rounded-3xl border bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">
                    Απλήρωτοι μαθητές
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    {unpaidStudents}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    χωρίς πληρωμή για τον μήνα
                  </p>
                </div>
              </section>

              {/* PAYMENT METHODS */}
              <section className="mt-6 rounded-3xl border bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold">
                    Πληρωμές ανά τρόπο
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Ανάλυση εισπράξεων για τον επιλεγμένο μήνα
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Banknote size={20} />
                      <span className="text-sm font-semibold">
                        Μετρητά
                      </span>
                    </div>

                    <p className="text-xl font-bold">
                      {formatCurrency(methodTotals["Μετρητά"] || 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <CreditCard size={20} />
                      <span className="text-sm font-semibold">
                        POS
                      </span>
                    </div>

                    <p className="text-xl font-bold">
                      {formatCurrency(methodTotals["POS"] || 0)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Landmark size={20} />
                      <span className="text-sm font-semibold">
                        Τραπεζική κατάθεση
                      </span>
                    </div>

                    <p className="text-xl font-bold">
                      {formatCurrency(
                        methodTotals["Τραπεζική κατάθεση"] || 0
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3 flex items-center gap-3">
                      <Smartphone size={20} />
                      <span className="text-sm font-semibold">
                        IRIS
                      </span>
                    </div>

                    <p className="text-xl font-bold">
                      {formatCurrency(methodTotals["IRIS"] || 0)}
                    </p>
                  </div>
                </div>
              </section>

              {/* STUDENT SEARCH */}
              <section className="mt-6 rounded-3xl border bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">
                      Αναλυτική κατάσταση μαθητών
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Χρέωση, πληρωμές και υπόλοιπο ανά μαθητή
                    </p>
                  </div>

                  <div className="relative w-full lg:max-w-sm">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Αναζήτηση μαθητή..."
                      className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
                    />
                  </div>
                </div>

                {/* MOBILE */}
                <div className="divide-y lg:hidden">
                  {filteredStudents.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">
                      Δεν βρέθηκαν μαθητές.
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
                      <div key={student.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">
                              {student.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {student.class}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              student.status === "Εξοφλημένο"
                                ? "bg-slate-900 text-white"
                                : student.status === "Μερική πληρωμή"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {student.status}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] text-slate-400">
                              Χρέωση
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {formatCurrency(student.fee)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] text-slate-400">
                              Πληρωμές
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {formatCurrency(student.paid)}
                            </p>
                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">
                            <p className="text-[11px] text-slate-400">
                              Υπόλοιπο
                            </p>

                            <p className="mt-1 text-sm font-bold">
                              {formatCurrency(student.balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* DESKTOP */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-6 py-4 font-semibold">
                          Μαθητής
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Τάξη
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Χρέωση
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Πληρωμές
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Υπόλοιπο
                        </th>
                        <th className="px-6 py-4 font-semibold">
                          Κατάσταση
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-center text-sm text-slate-500"
                          >
                            Δεν βρέθηκαν μαθητές.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-4">
                              <div className="font-semibold">
                                {student.name}
                              </div>

                              {student.guardian && (
                                <div className="mt-1 text-xs text-slate-400">
                                  {student.guardian}
                                </div>
                              )}
                            </td>

                            <td className="px-6 py-4 text-sm text-slate-600">
                              {student.class}
                            </td>

                            <td className="px-6 py-4 text-sm font-medium">
                              {formatCurrency(student.fee)}
                            </td>

                            <td className="px-6 py-4 text-sm font-medium">
                              {formatCurrency(student.paid)}
                            </td>

                            <td className="px-6 py-4 text-sm font-bold">
                              {formatCurrency(student.balance)}
                            </td>

                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  student.status === "Εξοφλημένο"
                                    ? "bg-slate-900 text-white"
                                    : student.status === "Μερική πληρωμή"
                                    ? "bg-slate-200 text-slate-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* FOOTER SUMMARY */}
              <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">
                      Οικονομική εικόνα
                    </p>

                    <p className="mt-1 text-lg font-semibold capitalize">
                      {getMonthLabel(month)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 sm:flex sm:gap-10">
                    <div>
                      <p className="text-xs text-slate-400">
                        Πληρωμές
                      </p>

                      <p className="mt-1 font-bold">
                        {payments.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Μαθητές
                      </p>

                      <p className="mt-1 font-bold">
                        {activeStudents.length}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Οφειλή
                      </p>

                      <p className="mt-1 font-bold">
                        {formatCurrency(totalDebt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          @page {
            margin: 12mm;
          }
        }
      `}</style>
    </div>
  );
}