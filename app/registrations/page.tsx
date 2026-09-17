"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  Phone,
  Menu,
  LogOut,
  LayoutDashboard,
  UserPlus,
  CreditCard,
  AlertCircle,
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
  created_at?: string;
};

type FormState = {
  name: string;
  className: string;
  guardian: string;
  phone: string;
  monthlyFee: string;
  status: "Ενεργός" | "Ανενεργός";
};

const emptyForm: FormState = {
  name: "",
  className: "",
  guardian: "",
  phone: "",
  monthlyFee: "",
  status: "Ενεργός",
};

export default function RegistrationsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");

    if (loggedIn !== "true") {
      window.location.href = "/login";
      return;
    }

    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select(
        "id, name, class, guardian, phone, monthly_fee, status, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE ERROR:", error);
      alert("Δεν ήταν δυνατή η φόρτωση των μαθητών.");
      setLoading(false);
      return;
    }

    setStudents(data || []);
    setLoading(false);
  }

  function openNewStudent() {
    setEditingStudent(null);
    setForm({
      ...emptyForm,
      status: "Ενεργός",
    });
    setShowModal(true);
    setMobileMenu(false);
  }

  function openEditStudent(student: Student) {
    setEditingStudent(student);

    setForm({
      name: student.name || "",
      className: student.class || "",
      guardian: student.guardian || "",
      phone: student.phone || "",
      monthlyFee: String(student.monthly_fee ?? ""),
      status: student.status || "Ενεργός",
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingStudent(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Συμπλήρωσε το ονοματεπώνυμο του μαθητή.");
      return;
    }

    if (!form.className) {
      alert("Επίλεξε τάξη.");
      return;
    }

    if (!form.guardian.trim()) {
      alert("Συμπλήρωσε τον κηδεμόνα.");
      return;
    }

    if (!form.monthlyFee || Number(form.monthlyFee) < 0) {
      alert("Συμπλήρωσε έγκυρη μηνιαία χρέωση.");
      return;
    }

    setSaving(true);

    const studentData = {
      name: form.name.trim(),
      class: form.className,
      guardian: form.guardian.trim(),
      phone: form.phone.trim(),
      monthly_fee: Number(form.monthlyFee),
      status: form.status,
    };

    if (editingStudent) {
      const { data, error } = await supabase
        .from("students")
        .update(studentData)
        .eq("id", editingStudent.id)
        .select()
        .single();

      if (error) {
        console.error("SUPABASE ERROR:", error);

        alert(
          `Σφάλμα Supabase:\n${error.message}\n\nDetails: ${
            error.details || "-"
          }`
        );

        setSaving(false);
        return;
      }

      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id ? data : student
        )
      );

      alert("Τα στοιχεία του μαθητή ενημερώθηκαν.");
    } else {
      const { data, error } = await supabase
        .from("students")
        .insert([studentData])
        .select()
        .single();

      if (error) {
        console.error("SUPABASE ERROR:", error);

        alert(
          `Σφάλμα Supabase:\n${error.message}\n\nDetails: ${
            error.details || "-"
          }`
        );

        setSaving(false);
        return;
      }

      setStudents((current) => [data, ...current]);

      alert("Η εγγραφή του μαθητή καταχωρήθηκε επιτυχώς.");
    }

    setSaving(false);
    closeModal();
  }

  async function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Θέλεις σίγουρα να διαγράψεις τον μαθητή "${student.name}";`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("students")
      .delete()
      .eq("id", student.id);

    if (error) {
      console.error("SUPABASE ERROR:", error);

      alert(
        `Ο μαθητής δεν διαγράφηκε.\n\n${error.message}`
      );

      return;
    }

    setStudents((current) =>
      current.filter((item) => item.id !== student.id)
    );
  }

  function handleLogout() {
    localStorage.removeItem("loggedIn");
    document.cookie = "loggedIn=; path=/; max-age=0";
    window.location.href = "/login";
  }

  const filteredStudents = students.filter((student) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      student.name?.toLowerCase().includes(text) ||
      student.guardian?.toLowerCase().includes(text) ||
      student.class?.toLowerCase().includes(text) ||
      student.phone?.toLowerCase().includes(text)
    );
  });

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
              Εγγραφές
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
                <p className="text-sm font-bold">ΚΑΛΟΜΕΛΕΤΑ</p>
                <p className="mt-1 text-xs text-slate-400">
                  Management System
                </p>
              </div>

              <button
                onClick={() => setMobileMenu(false)}
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
                className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
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
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
              >
                <AlertCircle size={19} />
                Οφειλές
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
            <h1 className="text-xl font-bold">ΚΑΛΟΜΕΛΕΤΑ</h1>

            <p className="mt-1 text-sm text-slate-400">
              Κέντρο Σχολικής Μελέτης
            </p>
          </div>

          <nav className="flex-1 p-4">
            <a
              href="/"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <LayoutDashboard size={19} />
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
              className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
            >
              <UserPlus size={19} />
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10"
            >
              <AlertCircle size={19} />
              Οφειλές
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

        {/* MAIN */}
        <section className="flex-1">
          {/* DESKTOP HEADER */}
          <header className="hidden border-b border-slate-200 bg-white md:block">
            <div className="flex items-center justify-between px-8 py-5">
              <div>
                <p className="text-sm text-slate-500">
                  Κέντρο Σχολικής Μελέτης
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Εγγραφές
                </h2>
              </div>

              <button
                onClick={openNewStudent}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Νέα εγγραφή
              </button>
            </div>
          </header>

          {/* CONTENT */}
          <div className="p-4 md:p-8">
            {/* MOBILE NEW BUTTON */}
            <button
              onClick={openNewStudent}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm md:hidden"
            >
              <Plus size={18} />
              Νέα εγγραφή
            </button>

            {/* INFO / SEARCH */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-3">
                    <Users size={20} className="text-slate-700" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Λίστα εγγραφών
                    </h3>

                    <p className="text-sm text-slate-500">
                      {students.length} μαθητές καταχωρημένοι
                    </p>
                  </div>
                </div>

                <div className="relative w-full md:w-80">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Αναζήτηση μαθητή..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* LOADING */}
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Φόρτωση μαθητών...
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <Users
                  size={38}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-4 font-semibold text-slate-700">
                  Δεν βρέθηκαν μαθητές
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {search
                    ? "Δοκίμασε διαφορετική αναζήτηση."
                    : "Δεν υπάρχουν ακόμα καταχωρημένες εγγραφές."}
                </p>
              </div>
            ) : (
              <>
                {/* MOBILE CARDS */}
                <div className="space-y-4 md:hidden">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-bold text-slate-900">
                            {student.name}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {student.class}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                            student.status === "Ενεργός"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {student.status}
                        </span>
                      </div>

                      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Κηδεμόνας
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {student.guardian}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              Τηλέφωνο
                            </p>

                            {student.phone ? (
                              <a
                                href={`tel:${student.phone}`}
                                className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-700"
                              >
                                <Phone size={15} />
                                {student.phone}
                              </a>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">
                                -
                              </p>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-400">
                              Μηνιαία χρέωση
                            </p>

                            <p className="mt-1 text-lg font-bold text-slate-900">
                              {Number(student.monthly_fee).toFixed(2)} €
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                        <button
                          onClick={() => openEditStudent(student)}
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil size={16} />
                          Επεξεργασία
                        </button>

                        <button
                          onClick={() => deleteStudent(student)}
                          className="flex items-center justify-center rounded-xl border border-red-100 px-4 py-3 text-red-500 transition hover:bg-red-50"
                          title="Διαγραφή"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Μαθητής
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Τάξη
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Κηδεμόνας
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Τηλέφωνο
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Μηνιαία χρέωση
                          </th>

                          <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                            Κατάσταση
                          </th>

                          <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Ενέργειες
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-slate-900">
                                {student.name}
                              </p>
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {student.class}
                            </td>

                            <td className="px-6 py-5 text-sm text-slate-600">
                              {student.guardian}
                            </td>

                            <td className="px-6 py-5">
                              {student.phone ? (
                                <a
                                  href={`tel:${student.phone}`}
                                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                                >
                                  <Phone size={15} />
                                  {student.phone}
                                </a>
                              ) : (
                                <span className="text-sm text-slate-400">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="px-6 py-5">
                              <span className="font-bold text-slate-900">
                                {Number(student.monthly_fee).toFixed(2)} €
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  student.status === "Ενεργός"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    openEditStudent(student)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                  title="Επεξεργασία"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteStudent(student)
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                  title="Διαγραφή"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  ΚΑΛΟΜΕΛΕΤΑ
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {editingStudent
                    ? "Επεξεργασία μαθητή"
                    : "Νέα εγγραφή"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Συμπλήρωσε τα στοιχεία του μαθητή.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                {/* NAME */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ονοματεπώνυμο μαθητή *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="π.χ. Μαρία Κωνσταντίνου"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                {/* CLASS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τάξη *
                  </label>

                  <select
                    value={form.className}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        className: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="">Επιλογή τάξης</option>
                    <option value="Α' Δημοτικού">
                      Α' Δημοτικού
                    </option>
                    <option value="Β' Δημοτικού">
                      Β' Δημοτικού
                    </option>
                    <option value="Γ' Δημοτικού">
                      Γ' Δημοτικού
                    </option>
                    <option value="Δ' Δημοτικού">
                      Δ' Δημοτικού
                    </option>
                    <option value="Ε' Δημοτικού">
                      Ε' Δημοτικού
                    </option>
                    <option value="ΣΤ' Δημοτικού">
                      ΣΤ' Δημοτικού
                    </option>
                    <option value="Α' Γυμνασίου">
                      Α' Γυμνασίου
                    </option>
                    <option value="Β' Γυμνασίου">
                      Β' Γυμνασίου
                    </option>
                    <option value="Γ' Γυμνασίου">
                      Γ' Γυμνασίου
                    </option>
                    <option value="Λύκειο">Λύκειο</option>
                  </select>
                </div>

                {/* GUARDIAN */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κηδεμόνας *
                  </label>

                  <input
                    type="text"
                    value={form.guardian}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        guardian: e.target.value,
                      })
                    }
                    placeholder="Ονοματεπώνυμο κηδεμόνα"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                {/* PHONE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τηλέφωνο
                  </label>

                  <input
                    type="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="69XXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                {/* FEE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Μηνιαία χρέωση (€) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.monthlyFee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthlyFee: e.target.value,
                      })
                    }
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </div>

                {/* STATUS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κατάσταση
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as
                          | "Ενεργός"
                          | "Ανενεργός",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                  >
                    <option value="Ενεργός">Ενεργός</option>
                    <option value="Ανενεργός">
                      Ανενεργός
                    </option>
                  </select>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving
                    ? "Αποθήκευση..."
                    : editingStudent
                    ? "Αποθήκευση αλλαγών"
                    : "Προσθήκη μαθητή"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}