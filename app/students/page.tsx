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
} from "lucide-react";

type Student = {
  id: number;
  name: string;
  class: string;
  parent: string;
  phone: string;
  email: string;
  monthly_fee: number;
  status: string;
};

type StudentForm = {
  name: string;
  class: string;
  parent: string;
  phone: string;
  email: string;
  monthly_fee: string;
  status: string;
};

const emptyForm: StudentForm = {
  name: "",
  class: "",
  parent: "",
  phone: "",
  email: "",
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
      parent: student.parent || "",
      phone: student.phone || "",
      email: student.email || "",
      monthly_fee:
        student.monthly_fee !== null && student.monthly_fee !== undefined
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

  async function saveStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Συμπλήρωσε το ονοματεπώνυμο του μαθητή.");
      return;
    }

    setSaving(true);

    const studentData = {
  name: form.name.trim(),
  class: form.class.trim(),
  guardian: form.parent.trim(),
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
    `Σφάλμα Supabase:\n${error.message}\n\nDetails: ${error.details || "-"}`
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
    const text = search.toLowerCase();

    return (
      student.name?.toLowerCase().includes(text) ||
      student.class?.toLowerCase().includes(text) ||
      student.parent?.toLowerCase().includes(text) ||
      student.phone?.toLowerCase().includes(text)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100 p-6">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Μαθητές
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Διαχείριση μαθητών και στοιχείων επικοινωνίας
          </p>
        </div>

        <button
          onClick={openNewStudent}
          className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus size={18} />
          Νέα εγγραφή
        </button>

      </div>

      {/* MAIN CARD */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* CARD HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-7 py-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
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

          <div className="relative w-80">

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

        {/* TABLE */}

        {loading ? (

          <div className="flex h-60 items-center justify-center">
            <p className="text-sm text-slate-500">
              Φόρτωση μαθητών...
            </p>
          </div>

        ) : filteredStudents.length === 0 ? (

          <div className="flex h-60 flex-col items-center justify-center">

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

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px]">

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

                      <div>
                        <p className="font-semibold text-slate-900">
                          {student.name}
                        </p>

                        {student.email && (
                          <p className="mt-1 text-xs text-slate-400">
                            {student.email}
                          </p>
                        )}
                      </div>

                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {student.class || "-"}
                    </td>

                    <td className="px-5 py-5 text-sm text-slate-600">
                      {student.parent || "-"}
                    </td>

                    <td className="px-5 py-5">

                      {student.phone ? (

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone
                            size={16}
                            className="text-slate-400"
                          />

                          {student.phone}

                        </div>

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

                        {Number(student.monthly_fee || 0).toLocaleString(
                          "el-GR",
                          {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }
                        )}{" "}
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

        )}

      </section>

      {/* MODAL */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">

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
              className="p-7"
            >

              <div className="grid grid-cols-2 gap-5">

                {/* NAME */}

                <div className="col-span-2">

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
                  />

                </div>

                {/* PARENT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Κηδεμόνας
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
                    type="text"
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

                {/* EMAIL */}

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
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
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
                    value={form.monthly_fee}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthly_fee: e.target.value,
                      })
                    }
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:bg-white"
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

              <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-6">

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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