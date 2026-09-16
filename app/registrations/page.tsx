"use client";

import { useState } from "react";
import {
  Plus,
  Users,
  Search,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Phone,
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  className: string;
  guardian: string;
  phone: string;
  monthlyFee: number;
  registrationDate: string;
  status: "Ενεργός" | "Ανενεργός";
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Μαρία Κωνσταντίνου",
    className: "Ε' Δημοτικού",
    guardian: "Γιώργος Κωνσταντίνου",
    phone: "69XXXXXXXX",
    monthlyFee: 80,
    registrationDate: "01/09/2026",
    status: "Ενεργός",
  },
  {
    id: 2,
    name: "Γιώργος Παπαδόπουλος",
    className: "ΣΤ' Δημοτικού",
    guardian: "Ελένη Παπαδοπούλου",
    phone: "69XXXXXXXX",
    monthlyFee: 100,
    registrationDate: "01/09/2026",
    status: "Ενεργός",
  },
  {
    id: 3,
    name: "Νίκος Δημητρίου",
    className: "Γ' Δημοτικού",
    guardian: "Κώστας Δημητρίου",
    phone: "69XXXXXXXX",
    monthlyFee: 70,
    registrationDate: "02/09/2026",
    status: "Ενεργός",
  },
  {
    id: 4,
    name: "Ελένη Γεωργίου",
    className: "Β' Δημοτικού",
    guardian: "Μαρία Γεωργίου",
    phone: "69XXXXXXXX",
    monthlyFee: 90,
    registrationDate: "02/09/2026",
    status: "Ενεργός",
  },
];

export default function RegistrationsPage() {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);

  const [form, setForm] = useState({
    name: "",
    className: "",
    guardian: "",
    phone: "",
    monthlyFee: "",
    registrationDate: "",
    status: "Ενεργός" as "Ενεργός" | "Ανενεργός",
  });

  function openNewStudent() {
    setEditingStudent(null);

    setForm({
      name: "",
      className: "",
      guardian: "",
      phone: "",
      monthlyFee: "",
      registrationDate: "",
      status: "Ενεργός",
    });

    setShowModal(true);
  }

  function openEditStudent(student: Student) {
    setEditingStudent(student);

    setForm({
      name: student.name,
      className: student.className,
      guardian: student.guardian,
      phone: student.phone,
      monthlyFee: String(student.monthlyFee),
      registrationDate: student.registrationDate,
      status: student.status,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingStudent(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.name ||
      !form.className ||
      !form.guardian ||
      !form.monthlyFee
    ) {
      alert("Συμπλήρωσε τα απαραίτητα πεδία.");
      return;
    }

    if (editingStudent) {
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === editingStudent.id
            ? {
                ...student,
                name: form.name,
                className: form.className,
                guardian: form.guardian,
                phone: form.phone,
                monthlyFee: Number(form.monthlyFee),
                registrationDate:
                  form.registrationDate || "16/09/2026",
                status: form.status,
              }
            : student
        )
      );
    } else {
      const newStudent: Student = {
        id: Date.now(),
        name: form.name,
        className: form.className,
        guardian: form.guardian,
        phone: form.phone,
        monthlyFee: Number(form.monthlyFee),
        registrationDate:
          form.registrationDate || "16/09/2026",
        status: form.status,
      };

      setStudents((currentStudents) => [
        ...currentStudents,
        newStudent,
      ]);
    }

    closeModal();
  }

  function deleteStudent(id: number) {
    const confirmed = window.confirm(
      "Θέλεις σίγουρα να διαγράψεις τον μαθητή;"
    );

    if (!confirmed) return;

    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== id)
    );
  }

  const filteredStudents = students.filter((student) => {
    const text = search.toLowerCase();

    return (
      student.name.toLowerCase().includes(text) ||
      student.guardian.toLowerCase().includes(text) ||
      student.className.toLowerCase().includes(text)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">

        <div className="flex items-center justify-between px-6 py-5 md:px-8">

          <div className="flex items-center gap-4">

            <a
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </a>

            <div>

              <p className="text-sm text-slate-500">
                Κέντρο Μελέτης
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Εγγραφές
              </h1>

            </div>

          </div>

          <button
            onClick={openNewStudent}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={18} />
            Νέα εγγραφή
          </button>

        </div>

      </header>

      {/* CONTENT */}

      <div className="p-6 md:p-8">

        {/* TITLE CARD */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="rounded-xl bg-slate-100 p-3">
                <Users
                  size={22}
                  className="text-slate-700"
                />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Λίστα μαθητών
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {students.length} μαθητές καταχωρημένοι
                </p>

              </div>

            </div>

            {/* SEARCH */}

            <div className="relative w-full md:w-80">

              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Αναζήτηση μαθητή..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

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

                    {/* NAME */}

                    <td className="px-6 py-5">

                      <div>

                        <p className="font-semibold text-slate-900">
                          {student.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Εγγραφή:{" "}
                          {student.registrationDate}
                        </p>

                      </div>

                    </td>

                    {/* CLASS */}

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.className}
                    </td>

                    {/* GUARDIAN */}

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.guardian}
                    </td>

                    {/* PHONE */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-2 text-sm text-slate-600">

                        <Phone size={15} />

                        {student.phone || "-"}
                        
                      </div>

                    </td>

                    {/* FEE */}

                    <td className="px-6 py-5">

                      <span className="font-bold text-slate-900">
                        {student.monthlyFee.toFixed(2)} €
                      </span>

                    </td>

                    {/* STATUS */}

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

                    {/* ACTIONS */}

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
                            deleteStudent(student.id)
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

          {/* EMPTY SEARCH */}

          {filteredStudents.length === 0 && (

            <div className="px-6 py-16 text-center">

              <Users
                size={35}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-700">
                Δεν βρέθηκαν μαθητές
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Δοκίμασε διαφορετική αναζήτηση.
              </p>

            </div>

          )}

        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
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
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div className="grid gap-5 md:grid-cols-2">

                {/* NAME */}

                <div>

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  >

                    <option value="">
                      Επιλογή τάξης
                    </option>

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

                    <option value="Λύκειο">
                      Λύκειο
                    </option>

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* PHONE */}

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
                    placeholder="69XXXXXXXX"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* MONTHLY FEE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Μηνιαία χρέωση (€) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.monthlyFee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthlyFee: e.target.value,
                      })
                    }
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* DATE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ημερομηνία εγγραφής
                  </label>

                  <input
                    type="text"
                    value={form.registrationDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        registrationDate:
                          e.target.value,
                      })
                    }
                    placeholder="16/09/2026"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* STATUS */}

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κατάσταση
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target.value as
                            | "Ενεργός"
                            | "Ανενεργός",
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
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

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {editingStudent
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