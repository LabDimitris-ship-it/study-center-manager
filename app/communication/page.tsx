"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Phone,
  MessageCircle,
  Mail,
  Users,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  UserPlus,
  CreditCard,
  AlertCircle,
  Send,
  Copy,
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
  status: "Ενεργός" | "Ανενεργός";
};

type Payment = {
  id: number;
  student_id: number;
  month: string;
  amount: number;
};

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function monthLabel(month: string) {
  const [year, monthNumber] = month.split("-");

  const names = [
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

  return `${names[Number(monthNumber) - 1]} ${year}`;
}

export default function CommunicationPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const month = currentMonth();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {
      window.location.href = "/login";
      return;
    }

    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const [studentsResult, paymentsResult] =
      await Promise.all([
        supabase
          .from("students")
          .select(
            "id, name, class, guardian, phone, monthly_fee, status"
          )
          .order("name", { ascending: true }),

        supabase
          .from("payments")
          .select("id, student_id, month, amount")
          .eq("month", month),
      ]);

    if (studentsResult.error) {
      console.error(studentsResult.error);
      alert("Δεν ήταν δυνατή η φόρτωση των μαθητών.");
      setLoading(false);
      return;
    }

    if (paymentsResult.error) {
      console.error(paymentsResult.error);
      alert("Δεν ήταν δυνατή η φόρτωση των πληρωμών.");
      setLoading(false);
      return;
    }

    setStudents(studentsResult.data || []);
    setPayments(paymentsResult.data || []);
    setLoading(false);
  }

  function getPaidAmount(studentId: number) {
    return payments
      .filter(
        (payment) => payment.student_id === studentId
      )
      .reduce(
        (total, payment) => total + Number(payment.amount),
        0
      );
  }

  function getDebt(student: Student) {
    const paid = getPaidAmount(student.id);

    return Math.max(
      Number(student.monthly_fee) - paid,
      0
    );
  }

  function createPaymentReminder(student: Student) {
    const debt = getDebt(student);

    const text =
      debt > 0
        ? `Καλησπέρα σας. Σας ενημερώνουμε ότι υπάρχει υπόλοιπο ${debt.toFixed(
            2
          )}€ για τα δίδακτρα του/της ${
            student.name
          } για τον μήνα ${monthLabel(
            month
          )}. Ευχαριστούμε πολύ.`
        : `Καλησπέρα σας. Σας ευχαριστούμε για την έγκαιρη εξόφληση των διδάκτρων του/της ${student.name}.`;

    setMessage(text);
    setSelectedStudent(student);
  }

  function createAbsenceMessage(student: Student) {
    const text = `Καλησπέρα σας. Σας ενημερώνουμε ότι ο/η ${student.name} απουσίασε από το μάθημα. Για οποιαδήποτε πληροφορία μπορείτε να επικοινωνήσετε μαζί μας. Ευχαριστούμε.`;

    setMessage(text);
    setSelectedStudent(student);
  }

  function createGeneralMessage(student: Student) {
    const text = `Καλησπέρα σας. Θα θέλαμε να σας ενημερώσουμε σχετικά με τον/την ${student.name}. `;

    setMessage(text);
    setSelectedStudent(student);
  }

  async function copyMessage() {
    if (!message) return;

    try {
      await navigator.clipboard.writeText(message);
      alert("Το μήνυμα αντιγράφηκε.");
    } catch {
      alert("Δεν ήταν δυνατή η αντιγραφή.");
    }
  }

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    document.cookie =
      "loggedIn=; path=/; max-age=0";

    window.location.href = "/login";
  }

  const filteredStudents = students.filter(
    (student) => {
      const text = search
        .toLowerCase()
        .trim();

      if (!text) return true;

      return (
        student.name
          ?.toLowerCase()
          .includes(text) ||
        student.guardian
          ?.toLowerCase()
          .includes(text) ||
        student.class
          ?.toLowerCase()
          .includes(text) ||
        student.phone
          ?.toLowerCase()
          .includes(text)
      );
    }
  );

  return (
    <main className="min-h-screen bg-slate-100">
      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              ΚΑΛΟΜΕΛΕΤΑ
            </p>

            <h1 className="mt-1 text-lg font-bold text-slate-900">
              Επικοινωνία
            </h1>
          </div>

          <button
            onClick={() => setMobileMenu(true)}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenu(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-[280px] flex-col bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-5">
              <div>
                <p className="text-sm font-bold">
                  ΚΑΛΟΜΕΛΕΤΑ
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Management System
                </p>
              </div>

              <button
                onClick={() =>
                  setMobileMenu(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="flex-1 p-4">
              <a
                href="/"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <LayoutDashboard size={19} />
                Dashboard
              </a>

              <a
                href="/students"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <Users size={19} />
                Μαθητές
              </a>

              <a
                href="/registrations"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <UserPlus size={19} />
                Εγγραφές
              </a>

              <a
                href="/payments"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <CreditCard size={19} />
                Πληρωμές
              </a>

              <a
                href="/debts"
                className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <AlertCircle size={19} />
                Οφειλές
              </a>

              <a
                href="/communication"
                className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
              >
                <MessageCircle size={19} />
                Επικοινωνία
              </a>
            </nav>

            <div className="border-t border-slate-800 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={19} />
                Έξοδος
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden w-64 flex-col bg-slate-950 text-white md:flex">
          <div className="border-b border-slate-800 p-6">
            <h1 className="text-xl font-bold">
              ΚΑΛΟΜΕΛΕΤΑ
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Κέντρο Σχολικής Μελέτης
            </p>
          </div>

          <nav className="flex-1 p-4">
            <a
              href="/"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <LayoutDashboard size={19} />
              Dashboard
            </a>

            <a
              href="/students"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <Users size={19} />
              Μαθητές
            </a>

            <a
              href="/registrations"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <UserPlus size={19} />
              Εγγραφές
            </a>

            <a
              href="/payments"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <CreditCard size={19} />
              Πληρωμές
            </a>

            <a
              href="/debts"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              <AlertCircle size={19} />
              Οφειλές
            </a>

            <a
              href="/communication"
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
            >
              <MessageCircle size={19} />
              Επικοινωνία
            </a>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={19} />
              Έξοδος
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex-1">
          <header className="hidden border-b border-slate-200 bg-white md:block">
            <div className="px-8 py-5">
              <p className="text-sm text-slate-500">
                Κέντρο Σχολικής Μελέτης
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Επικοινωνία με Γονείς
              </h2>
            </div>
          </header>

          <div className="p-4 md:p-8">
            {/* INTRO */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-slate-100 p-3">
                  <MessageCircle
                    size={22}
                    className="text-slate-700"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Επικοινωνία με γονείς
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Βρες γρήγορα τον μαθητή και
                    επικοινώνησε με τον κηδεμόνα
                    μέσω τηλεφώνου, Viber, SMS ή
                    email.
                  </p>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Αναζήτηση μαθητή, κηδεμόνα ή τηλεφώνου..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                <p className="text-sm text-slate-500">
                  Φόρτωση...
                </p>
              </div>
            ) : (
              <div className="grid gap-5 xl:grid-cols-2">
                {filteredStudents.map(
                  (student) => {
                    const paid =
                      getPaidAmount(
                        student.id
                      );

                    const debt =
                      getDebt(student);

                    return (
                      <div
                        key={student.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">
                              {student.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                              {student.class}
                            </p>
                          </div>

                          {debt > 0 ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                              Οφειλή{" "}
                              {debt.toFixed(
                                2
                              )}€
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                              Εξοφλημένο
                            </span>
                          )}
                        </div>

                        <div className="mt-5 rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-medium text-slate-400">
                            ΚΗΔΕΜΟΝΑΣ
                          </p>

                          <p className="mt-1 font-semibold text-slate-800">
                            {student.guardian}
                          </p>

                          {student.phone ? (
                            <p className="mt-1 text-sm text-slate-500">
                              {student.phone}
                            </p>
                          ) : (
                            <p className="mt-1 text-sm text-slate-400">
                              Δεν υπάρχει τηλέφωνο
                            </p>
                          )}
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {student.phone && (
                            <>
                              <a
                                href={`tel:${student.phone}`}
                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-xs font-semibold text-white"
                              >
                                <Phone size={15} />
                                Κλήση
                              </a>

                              <a
                                href={`viber://chat?number=${encodeURIComponent(
                                  student.phone
                                )}`}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700"
                              >
                                <MessageCircle
                                  size={15}
                                />
                                Viber
                              </a>

                              <a
                                href={`sms:${student.phone}`}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700"
                              >
                                <Send size={15} />
                                SMS
                              </a>
                            </>
                          )}

                          <button
                            onClick={() =>
                              createGeneralMessage(
                                student
                              )
                            }
                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-700"
                          >
                            <Mail size={15} />
                            Μήνυμα
                          </button>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                            Έτοιμα μηνύματα
                          </p>

                          <div className="grid gap-2 sm:grid-cols-3">
                            <button
                              onClick={() =>
                                createPaymentReminder(
                                  student
                                )
                              }
                              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              💳 Υπενθύμιση
                              πληρωμής
                            </button>

                            <button
                              onClick={() =>
                                createAbsenceMessage(
                                  student
                                )
                              }
                              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              📅 Απουσία
                            </button>

                            <button
                              onClick={() =>
                                createGeneralMessage(
                                  student
                                )
                              }
                              className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              📝 Ενημέρωση
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                          <span>
                            Πληρωμές μήνα:{" "}
                            {paid.toFixed(2)}€
                          </span>

                          <span>
                            Χρέωση:{" "}
                            {Number(
                              student.monthly_fee
                            ).toFixed(2)}€
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {!loading &&
              filteredStudents.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <Users
                    size={40}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-4 font-semibold text-slate-700">
                    Δεν βρέθηκαν μαθητές
                  </p>
                </div>
              )}
          </div>
        </section>
      </div>

      {/* MESSAGE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 sm:items-center sm:p-4">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  ΜΗΝΥΜΑ ΓΟΝΕΑ
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedStudent.guardian}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Μαθητής:{" "}
                  {selectedStudent.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Μήνυμα
              </label>

              <textarea
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                rows={7}
                className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={copyMessage}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700"
              >
                <Copy size={16} />
                Αντιγραφή
              </button>

              {selectedStudent.phone && (
                <>
                  <a
                    href={`sms:${selectedStudent.phone}?body=${encodeURIComponent(
                      message
                    )}`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-sm font-semibold text-white"
                  >
                    <Send size={16} />
                    SMS
                  </a>

                  <a
                    href={`viber://forward?text=${encodeURIComponent(
                      message
                    )}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-700"
                  >
                    <MessageCircle
                      size={16}
                    />
                    Viber
                  </a>
                </>
              )}

              <button
                onClick={() =>
                  setSelectedStudent(null)
                }
                className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600"
              >
                Κλείσιμο
              </button>
            </div>

            <p className="mt-4 text-center text-xs leading-5 text-slate-400">
              Τα κουμπιά SMS/Viber ανοίγουν την
              αντίστοιχη εφαρμογή στη συσκευή σου.
              Η αυτόματη αποστολή θα συνδεθεί σε
              επόμενο βήμα με υπηρεσία αποστολής.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}