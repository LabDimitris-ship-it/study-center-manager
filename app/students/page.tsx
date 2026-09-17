"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Pencil,
  Trash2,
  X,
  UserPlus,
  CreditCard,
  Menu,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  class: string;
  guardian: string;
  phone: string;
  monthly_fee: number;
  status: string;
};

type StudentForm = {
  name: string;
  class: string;
  guardian: string;
  phone: string;
  monthly_fee: string;
  status: string;
};

const emptyForm: StudentForm = {
  name: "",
  class: "",
  guardian: "",
  phone: "",
  monthly_fee: "",
  status: "Ενεργός",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [form, setForm] = useState<StudentForm>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    setLoading(true);

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Σφάλμα φόρτωσης μαθητών:", error);
      setStudents([]);
    } else {
      setStudents(data || []);
    }

    setLoading(false);
  }

  function openNewStudent() {
    setEditingStudent(null);
    setForm(emptyForm);
    setShowForm(true);
    setOpenMenu(null);
  }

  function openEditStudent(student: Student) {
    setEditingStudent(student);

    setForm({
      name: student.name || "",
      class: student.class || "",
      guardian: student.guardian || "",
      phone: student.phone || "",
      monthly_fee:
        student.monthly_fee !== null &&
        student.monthly_fee !== undefined
          ? String(student.monthly_fee)
          : "",
      status: student.status || "Ενεργός",
    });

    setShowForm(true);
    setOpenMenu(null);
  }

  function closeForm() {
    setShowForm(false);
    setEditingStudent(null);
    setForm(emptyForm);
  }

  async function saveStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Συμπλήρωσε το ονοματεπώνυμο του μαθητή.");
      return;
    }

    setSaving(true);

    const studentData = {
      name: form.name.trim(),
      class: form.class.trim(),
      guardian: form.guardian.trim(),
      phone: form.phone.trim(),
      monthly_fee: Number(form.monthly_fee) || 0,
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
        console.error(error);
        alert("Παρουσιάστηκε σφάλμα κατά την επεξεργασία.");
        setSaving(false);
        return;
      }

      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id ? data : student
        )
      );
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

      setStudents((current) => [...current, data]);
    }

    setSaving(false);
    closeForm();
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
      console.error(error);
      alert("Παρουσιάστηκε σφάλμα κατά τη διαγραφή.");
      return;
    }

    setStudents((current) =>
      current.filter((item) => item.id !== student.id)
    );

    setOpenMenu(null);
  }

  const filteredStudents = students.filter((student) => {
    const text = search.toLowerCase().trim();

    if (!text) return true;

    return (
      student.name?.toLowerCase().includes(text) ||
      student.class?.toLowerCase().includes(text) ||
      student.guardian?.toLowerCase().includes(text) ||
      student.phone?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100">

      {/* MOBILE TOP BAR */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:hidden">

        <div>
          <p className="text-xs text-slate-500">
            Κέντρο Σχολικής Μελέτης
          </p>

          <h1 className="text-xl font-bold text-slate-900">
            Μαθητές
          </h1>
        </div>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white"
        >
          <Menu size={22} />
        </button>

      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50"
            aria-label="Κλείσιμο μενού"
          />

          <div className="relative flex h-full w-[82%] max-w-sm flex-col bg-slate-950 text-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-800 p-5">

              <div>
                <h2 className="text-lg font-bold">
                  Κέντρο Μελέτης
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Management System
                </p>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 hover:bg-white/10"
              >
                <X size={23} />
              </button>

            </div>

            <nav className="flex-1 p-4">

              <a
                href="/"
                className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-slate-300 hover:bg-white/10"
              >
                Dashboard
              </a>

              <a
                href="/students"
                className="mb-2 flex items-center gap-4 rounded-xl bg-white/10 px-4 py-4 font-semibold"
              >
                <UserPlus size={21} />
                Μαθητές
              </a>

              <a
                href="/registrations"
                className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-slate-300 hover:bg-white/10"
              >
                <Plus size={21} />
                Εγγραφές
              </a>

              <a
                href="/payments"
                className="mb-2 flex items-center gap-4 rounded-xl px-4 py-4 text-slate-300 hover:bg-white/10"
              >
                <CreditCard size={21} />
                Πληρωμές
              </a>

              <a
                href="/debts"
                className="flex items-center gap-4 rounded-xl px-4 py-4 text-slate-300 hover:bg-white/10"
              >
                Οφειλές
              </a>

            </nav>

            <div className="border-t border-slate-800 p-4">

              <button
                onClick={() => {
                  localStorage.removeItem("loggedIn");

                  document.cookie =
                    "loggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

                  window.location.href = "/login";
                }}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
              >
                Έξοδος
              </button>

            </div>

          </div>
        </div>
      )}

      {/* CONTENT */}
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 md:p-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Μαθητές
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Διαχείριση μαθητών και στοιχείων επικοινωνίας
            </p>
          </div>

          <button
            onClick={openNewStudent}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
          >
            <Plus size={18} />
            Νέα εγγραφή
          </button>

        </div>

        {/* MAIN CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* CARD HEADER */}
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:px-7">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <UserPlus
                  size={23}
                  className="text-slate-700"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Λίστα μαθητών
                </h2>

                <p className="text-sm text-slate-500">
                  {students.length} μαθητές
                </p>
              </div>

            </div>

            {/* SEARCH */}
            <div className="relative w-full md:max-w-sm">

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

          {/* LOADING */}
          {loading ? (

            <div className="flex h-60 items-center justify-center">
              <p className="text-sm text-slate-500">
                Φόρτωση μαθητών...
              </p>
            </div>

          ) : filteredStudents.length === 0 ? (

            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <UserPlus
                size={38}
                className="mb-3 text-slate-300"
              />

              <p className="font-semibold text-slate-700">
                Δεν υπάρχουν μαθητές
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Πρόσθεσε τον πρώτο μαθητή.
              </p>

            </div>

          ) : (

            <>
              {/* MOBILE CARDS */}
              <div className="divide-y divide-slate-100 md:hidden">

                {filteredStudents.map((student) => (

                  <div
                    key={student.id}
                    className="p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <h3 className="truncate text-base font-bold text-slate-900">
                          {student.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.class || "Χωρίς τάξη"}
                        </p>

                      </div>

                      <div className="relative shrink-0">

                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === student.id
                                ? null
                                : student.id
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {openMenu === student.id && (
                          <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                            <button
                              onClick={() =>
                                openEditStudent(student)
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <Pencil size={16} />
                              Επεξεργασία
                            </button>

                            <button
                              onClick={() =>
                                deleteStudent(student)
                              }
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Διαγραφή
                            </button>

                          </div>
                        )}

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">
                          Κηδεμόνας
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-slate-700">
                          {student.guardian || "-"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">
                          Τηλέφωνο
                        </p>

                        {student.phone ? (
                          <a
                            href={`tel:${student.phone}`}
                            className="mt-1 flex items-center gap-1 text-sm font-medium text-slate-700"
                          >
                            <Phone size={14} />
                            {student.phone}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            -
                          </p>
                        )}
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">
                          Μηνιαία χρέωση
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-900">
                          {Number(
                            student.monthly_fee || 0
                          ).toLocaleString("el-GR", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}{" "}
                          €
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] font-semibold uppercase text-slate-400">
                          Κατάσταση
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            student.status === "Ενεργός"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {student.status || "Ενεργός"}
                        </span>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[900px]">

                  <thead>
                    <tr className="bg-slate-50 text-left">

                      <th className="px-7 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Μαθητής
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Τάξη
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Κηδεμόνας
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Τηλέφωνο
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Μηνιαία χρέωση
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Κατάσταση
                      </th>

                      <th className="w-16 px-5 py-4"></th>

                    </tr>
                  </thead>

                  <tbody>

                    {filteredStudents.map((student) => (

                      <tr
                        key={student.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50"
                      >

                        <td className="px-7 py-5">
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {student.class || "-"}
                        </td>

                        <td className="px-5 py-5 text-sm text-slate-600">
                          {student.guardian || "-"}
                        </td>

                        <td className="px-5 py-5">

                          {student.phone ? (
                            <a
                              href={`tel:${student.phone}`}
                              className="flex items-center gap-2 text-sm text-slate-600"
                            >
                              <Phone
                                size={16}
                                className="text-slate-400"
                              />

                              {student.phone}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">
                              -
                            </span>
                          )}

                        </td>

                        <td className="px-5 py-5">

                          <div className="flex items-center gap-2 font-bold text-slate-900">

                            <CreditCard
                              size={17}
                              className="text-slate-400"
                            />

                            {Number(
                              student.monthly_fee || 0
                            ).toLocaleString("el-GR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })}{" "}
                            €

                          </div>

                        </td>

                        <td className="px-5 py-5">

                          <span
                            className={`inline-flex rounded-full px-4 py-1.5 text-xs font-semibold ${
                              student.status === "Ενεργός"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {student.status || "Ενεργός"}
                          </span>

                        </td>

                        <td className="relative px-5 py-5">

                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === student.id
                                  ? null
                                  : student.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <MoreVertical size={20} />
                          </button>

                          {openMenu === student.id && (

                            <div className="absolute right-5 top-14 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                              <button
                                onClick={() =>
                                  openEditStudent(student)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                <Pencil size={16} />
                                Επεξεργασία
                              </button>

                              <button
                                onClick={() =>
                                  deleteStudent(student)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Διαγραφή
                              </button>

                            </div>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            </>

          )}

        </section>

      </div>

      {/* FORM MODAL */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">

          <div className="max-h-[95vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-3xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-7">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingStudent
                    ? "Επεξεργασία μαθητή"
                    : "Νέα εγγραφή μαθητή"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Συμπλήρωσε τα στοιχεία του μαθητή
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={21} />
              </button>

            </div>

            {/* FORM */}
            <form
              onSubmit={saveStudent}
              className="p-5 sm:p-7"
            >

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* NAME */}
                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ονοματεπώνυμο μαθητή
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* CLASS */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τάξη
                  </label>

                  <input
                    type="text"
                    value={form.class}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        class: e.target.value,
                      })
                    }
                    placeholder="π.χ. Ε' Δημοτικού"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* GUARDIAN */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κηδεμόνας
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* MONTHLY FEE */}
                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Μηνιαία χρέωση (€)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.monthly_fee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthly_fee: e.target.value,
                      })
                    }
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
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
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-base outline-none focus:border-slate-400 focus:bg-white"
                  >
                    <option value="Ενεργός">
                      Ενεργός
                    </option>

                    <option value="Ανενεργός">
                      Ανενεργός
                    </option>
                  </select>

                </div>

              </div>

              {/* BUTTONS */}
              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Αποθήκευση..."
                    : editingStudent
                    ? "Αποθήκευση"
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