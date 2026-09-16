"use client";

import { useState } from "react";
import {
  CreditCard,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Search,
} from "lucide-react";

type Payment = {
  id: number;
  student: string;
  amount: number;
  month: string;
  method: string;
  date: string;
};

const initialPayments: Payment[] = [
  {
    id: 1,
    student: "Μαρία Κωνσταντίνου",
    amount: 80,
    month: "Σεπτέμβριος",
    method: "Μετρητά",
    date: "16/09/2026",
  },
  {
    id: 2,
    student: "Γιώργος Παπαδόπουλος",
    amount: 100,
    month: "Σεπτέμβριος",
    method: "POS",
    date: "16/09/2026",
  },
  {
    id: 3,
    student: "Νίκος Δημητρίου",
    amount: 70,
    month: "Σεπτέμβριος",
    method: "IRIS",
    date: "15/09/2026",
  },
  {
    id: 4,
    student: "Ελένη Γεωργίου",
    amount: 90,
    month: "Σεπτέμβριος",
    method: "Τράπεζα",
    date: "15/09/2026",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] =
    useState<Payment[]>(initialPayments);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingPayment, setEditingPayment] =
    useState<Payment | null>(null);

  const [form, setForm] = useState({
    student: "",
    amount: "",
    month: "Σεπτέμβριος",
    method: "Μετρητά",
    date: "",
  });

  function openNewPayment() {
    setEditingPayment(null);

    setForm({
      student: "",
      amount: "",
      month: "Σεπτέμβριος",
      method: "Μετρητά",
      date: "16/09/2026",
    });

    setShowModal(true);
  }

  function openEditPayment(payment: Payment) {
    setEditingPayment(payment);

    setForm({
      student: payment.student,
      amount: String(payment.amount),
      month: payment.month,
      method: payment.method,
      date: payment.date,
    });

    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPayment(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.student || !form.amount) {
      alert("Συμπλήρωσε μαθητή και ποσό.");
      return;
    }

    if (editingPayment) {
      setPayments((current) =>
        current.map((payment) =>
          payment.id === editingPayment.id
            ? {
                ...payment,
                student: form.student,
                amount: Number(form.amount),
                month: form.month,
                method: form.method,
                date: form.date || "16/09/2026",
              }
            : payment
        )
      );
    } else {
      const newPayment: Payment = {
        id: Date.now(),
        student: form.student,
        amount: Number(form.amount),
        month: form.month,
        method: form.method,
        date: form.date || "16/09/2026",
      };

      setPayments((current) => [
        ...current,
        newPayment,
      ]);
    }

    closeModal();
  }

  function deletePayment(id: number) {
    const confirmed = window.confirm(
      "Θέλεις σίγουρα να διαγράψεις αυτή την πληρωμή;"
    );

    if (!confirmed) return;

    setPayments((current) =>
      current.filter((payment) => payment.id !== id)
    );
  }

  const filteredPayments = payments.filter((payment) =>
    payment.student
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const total = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between px-6 py-5 md:px-8">

          <div className="flex items-center gap-4">

            <a
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft size={19} />
            </a>

            <div>
              <p className="text-sm text-slate-500">
                Κέντρο Μελέτης
              </p>

              <h1 className="text-2xl font-bold text-slate-900">
                Πληρωμές
              </h1>
            </div>

          </div>

          <button
            onClick={openNewPayment}
            className="flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Plus size={18} />
            Νέα πληρωμή
          </button>

        </div>
      </header>

      <div className="p-6 md:p-8">

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-3">
                <CreditCard size={21} />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Πληρωμές
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {payments.length}
                </p>
              </div>
            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Συνολικές εισπράξεις
            </p>

            <p className="mt-1 text-3xl font-bold text-green-600">
              {total.toFixed(2)} €
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Μήνας
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              Σεπτέμβριος
            </p>

          </div>

        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">

            <div>
              <h2 className="font-bold text-slate-900">
                Ιστορικό πληρωμών
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Όλες οι καταχωρημένες πληρωμές
              </p>
            </div>

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
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:bg-white"
              />

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Μαθητής
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Μήνας
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Ποσό
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Τρόπος πληρωμής
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Ημερομηνία
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-500">
                    Ενέργειες
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredPayments.map((payment) => (

                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-6 py-5 font-semibold text-slate-900">
                      {payment.student}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {payment.month}
                    </td>

                    <td className="px-6 py-5 font-bold text-green-600">
                      {payment.amount.toFixed(2)} €
                    </td>

                    <td className="px-6 py-5">

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {payment.method}
                      </span>

                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {payment.date}
                    </td>

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            openEditPayment(payment)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            deletePayment(payment.id)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
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

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">

          <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {editingPayment
                    ? "Επεξεργασία πληρωμής"
                    : "Νέα πληρωμή"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Καταχώρησε τα στοιχεία της πληρωμής.
                </p>

              </div>

              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Μαθητής *
                </label>

                <input
                  type="text"
                  value={form.student}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      student: e.target.value,
                    })
                  }
                  placeholder="π.χ. Μαρία Κωνσταντίνου"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white"
                />

              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ποσό (€) *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        amount: e.target.value,
                      })
                    }
                    placeholder="80"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Μήνας
                  </label>

                  <select
                    value={form.month}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        month: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  >
                    <option>Σεπτέμβριος</option>
                    <option>Οκτώβριος</option>
                    <option>Νοέμβριος</option>
                    <option>Δεκέμβριος</option>
                    <option>Ιανουάριος</option>
                    <option>Φεβρουάριος</option>
                    <option>Μάρτιος</option>
                    <option>Απρίλιος</option>
                    <option>Μάιος</option>
                    <option>Ιούνιος</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Τρόπος πληρωμής
                  </label>

                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        method: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  >
                    <option>Μετρητά</option>
                    <option>POS</option>
                    <option>IRIS</option>
                    <option>Τράπεζα</option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Ημερομηνία
                  </label>

                  <input
                    type="text"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    placeholder="16/09/2026"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  Ακύρωση
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                >
                  {editingPayment
                    ? "Αποθήκευση"
                    : "Καταχώρηση πληρωμής"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}