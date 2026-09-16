"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Users,
  Phone,
  MoreVertical,
  X,
  Pencil,
  Trash2,
  Eye,
  CreditCard,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  class: string;
  parent: string;
  phone: string;
  email: string;
  monthly: string;
  registrationDate: string;
  notes: string;
  status: string;
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Μαρία Κωνσταντίνου",
    class: "Ε' Δημοτικού",
    parent: "Γιώργος Κωνσταντίνου",
    phone: "69XXXXXXXX",
    email: "example@email.com",
    monthly: "80",
    registrationDate: "2026-09-01",
    notes: "",
    status: "Ενεργός",
  },
  {
    id: 2,
    name: "Γιώργος Παπαδόπουλος",
    class: "ΣΤ' Δημοτικού",
    parent: "Ελένη Παπαδοπούλου",
    phone: "69XXXXXXXX",
    email: "example@email.com",
    monthly: "100",
    registrationDate: "2026-09-01",
    notes: "",
    status: "Ενεργός",
  },
  {
    id: 3,
    name: "Νίκος Δημητρίου",
    class: "Γ' Δημοτικού",
    parent: "Κώστας Δημητρίου",
    phone: "69XXXXXXXX",
    email: "example@email.com",
    monthly: "70",
    registrationDate: "2026-09-02",
    notes: "",
    status: "Ενεργός",
  },
  {
    id: 4,
    name: "Ελένη Γεωργίου",
    class: "Β' Δημοτικού",
    parent: "Μαρία Γεωργίου",
    phone: "69XXXXXXXX",
    email: "example@email.com",
    monthly: "90",
    registrationDate: "2026-09-02",
    notes: "",
    status: "Ενεργός",
  },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);

  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    class: "",
    parent: "",
    phone: "",
    email: "",
    monthly: "",
    registrationDate: "",
    notes: "",
  });

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.parent}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function resetForm() {
    setForm({
      name: "",
      class: "",
      parent: "",
      phone: "",
      email: "",
      monthly: "",
      registrationDate: "",
      notes: "",
    });
  }

  function openNewStudent() {
    setEditingStudent(null);
    resetForm();
    setShowForm(true);
    setOpenMenu(null);
  }

  function openEditStudent(student: Student) {
    setEditingStudent(student);

    setForm({
      name: student.name,
      class: student.class,
      parent: student.parent,
      phone: student.phone,
      email: student.email,
      monthly: student.monthly,
      registrationDate: student.registrationDate,
      notes: student.notes,
    });

    setShowForm(true);
    setOpenMenu(null);
  }

  function openStudentDetails(student: Student) {
    setSelectedStudent(student);
    setShowDetails(true);
    setOpenMenu(null);
  }

  function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Θέλεις σίγουρα να διαγράψεις τον μαθητή "${student.name}";`
    );

    if (!confirmed) return;

    setStudents((current) =>
      current.filter((item) => item.id !== student.id)
    );

    setOpenMenu(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.name ||
      !form.class ||
      !form.parent ||
      !form.monthly
    ) {
      alert("Συμπλήρωσε τα υποχρεωτικά πεδία.");
      return;
    }

    if (editingStudent) {
      setStudents((current) =>
        current.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                ...form,
              }
            : student
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now(),
        ...form,
        status: "Ενεργός",
      };

      setStudents((current) => [newStudent, ...current]);
    }

    setShowForm(false);
    setEditingStudent(null);
    resetForm();
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 flex-col bg-slate-950 text-white md:flex">

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
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              Dashboard
            </a>

            <a
              href="/students"
              className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm font-medium"
            >
              <Users size={19} />
              Μαθητές
            </a>

            <a
              href="/registrations"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              Εγγραφές
            </a>

            <a
              href="/payments"
              className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              Πληρωμές
            </a>

            <a
              href="/debts"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/10"
            >
              Οφειλές
            </a>

          </nav>

        </aside>

        {/* MAIN */}
        <section className="flex-1">

          {/* HEADER */}
          <header className="border-b border-slate-200 bg-white px-6 py-5 md:px-8">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Διαχείριση μαθητών
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  Μαθητές
                </h2>
              </div>

              <button
                onClick={openNewStudent}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={18} />
                Νέος μαθητής
              </button>

            </div>

          </header>

          {/* CONTENT */}
          <div className="p-6 md:p-8">

            {/* SEARCH */}
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="relative">

                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Αναζήτηση μαθητή ή κηδεμόνα..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400"
                />

              </div>

            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5">

                <div className="flex items-center gap-3">

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Users size={20} className="text-slate-700" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Λίστα μαθητών
                    </h3>

                    <p className="text-sm text-slate-500">
                      {students.length} μαθητές
                    </p>
                  </div>

                </div>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead className="bg-slate-50">

                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                      <th className="px-6 py-4">
                        Μαθητής
                      </th>

                      <th className="px-6 py-4">
                        Τάξη
                      </th>

                      <th className="px-6 py-4">
                        Κηδεμόνας
                      </th>

                      <th className="px-6 py-4">
                        Τηλέφωνο
                      </th>

                      <th className="px-6 py-4">
                        Μηνιαία χρέωση
                      </th>

                      <th className="px-6 py-4">
                        Κατάσταση
                      </th>

                      <th className="px-6 py-4">
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
                          <div className="font-semibold text-slate-900">
                            {student.name}
                          </div>
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {student.class}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600">
                          {student.parent}
                        </td>

                        <td className="px-6 py-5">

                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone size={15} />
                            {student.phone}
                          </div>

                        </td>

                        <td className="px-6 py-5 font-semibold text-slate-900">
                          {student.monthly} €
                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {student.status}
                          </span>

                        </td>

                        <td className="relative px-6 py-5">

                          <button
                            onClick={() =>
                              setOpenMenu(
                                openMenu === student.id
                                  ? null
                                  : student.id
                              )
                            }
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* ACTION MENU */}
                          {openMenu === student.id && (

                            <div className="absolute right-6 top-14 z-30 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

                              <button
                                onClick={() =>
                                  openStudentDetails(student)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Eye size={17} />
                                Προβολή στοιχείων
                              </button>

                              <button
                                onClick={() =>
                                  openEditStudent(student)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <Pencil size={17} />
                                Επεξεργασία
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMenu(null);
                                  alert(
                                    `Πληρωμές για ${student.name}`
                                  );
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                              >
                                <CreditCard size={17} />
                                Πληρωμές
                              </button>

                              <div className="border-t border-slate-100" />

                              <button
                                onClick={() =>
                                  deleteStudent(student)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={17} />
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

            </div>

          </div>

        </section>
      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>

                <h3 className="text-xl font-bold text-slate-900">
                  {editingStudent
                    ? "Επεξεργασία μαθητή"
                    : "Νέος μαθητής"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {editingStudent
                    ? "Τροποποίησε τα στοιχεία του μαθητή"
                    : "Συμπλήρωσε τα στοιχεία του μαθητή"}
                </p>

              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ονοματεπώνυμο *
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τάξη *
                  </label>

                  <select
                    value={form.class}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        class: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="">
                      Επίλεξε τάξη
                    </option>

                    <option>Α' Δημοτικού</option>
                    <option>Β' Δημοτικού</option>
                    <option>Γ' Δημοτικού</option>
                    <option>Δ' Δημοτικού</option>
                    <option>Ε' Δημοτικού</option>
                    <option>ΣΤ' Δημοτικού</option>

                    <option>Α' Γυμνασίου</option>
                    <option>Β' Γυμνασίου</option>
                    <option>Γ' Γυμνασίου</option>

                    <option>Α' Λυκείου</option>
                    <option>Β' Λυκείου</option>
                    <option>Γ' Λυκείου</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Μηνιαία χρέωση *
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.monthly}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthly: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κηδεμόνας *
                  </label>

                  <input
                    type="text"
                    value={form.parent}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        parent: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τηλέφωνο
                  </label>

                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ημερομηνία εγγραφής
                  </label>

                  <input
                    type="date"
                    value={form.registrationDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        registrationDate: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Παρατηρήσεις
                  </label>

                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notes: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  {editingStudent
                    ? "Αποθήκευση αλλαγών"
                    : "Αποθήκευση μαθητή"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* DETAILS MODAL */}
      {showDetails && selectedStudent && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Στοιχεία μαθητή
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Πλήρης εικόνα μαθητή
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>

            </div>

            <div className="space-y-4 p-6">

              <div>
                <p className="text-xs text-slate-500">
                  Ονοματεπώνυμο
                </p>

                <p className="mt-1 font-semibold text-slate-900">
                  {selectedStudent.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-500">
                    Τάξη
                  </p>

                  <p className="mt-1 font-medium text-slate-900">
                    {selectedStudent.class}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Μηνιαία χρέωση
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedStudent.monthly} €
                  </p>
                </div>

              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Κηδεμόνας
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedStudent.parent}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Τηλέφωνο
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedStudent.phone || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Email
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedStudent.email || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Ημερομηνία εγγραφής
                </p>

                <p className="mt-1 font-medium text-slate-900">
                  {selectedStudent.registrationDate || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Παρατηρήσεις
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {selectedStudent.notes || "Δεν υπάρχουν παρατηρήσεις."}
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-5">

                <button
                  onClick={() => setShowDetails(false)}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Κλείσιμο
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}