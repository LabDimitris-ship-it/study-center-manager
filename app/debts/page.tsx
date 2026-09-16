"use client";

import { AlertCircle, ArrowLeft, Search } from "lucide-react";
import { useState } from "react";

const debts = [
  {
    id: 1,
    student: "Γιάννης Παπαδόπουλος",
    className: "Ε' Δημοτικού",
    month: "Σεπτέμβριος",
    charge: 100,
    paid: 20,
  },
  {
    id: 2,
    student: "Ελένη Κωνσταντίνου",
    className: "Δ' Δημοτικού",
    month: "Σεπτέμβριος",
    charge: 80,
    paid: 30,
  },
  {
    id: 3,
    student: "Κώστας Νικολάου",
    className: "ΣΤ' Δημοτικού",
    month: "Σεπτέμβριος",
    charge: 100,
    paid: 0,
  },
  {
    id: 4,
    student: "Αναστασία Γεωργίου",
    className: "Β' Δημοτικού",
    month: "Σεπτέμβριος",
    charge: 90,
    paid: 40,
  },
];

export default function DebtsPage() {
  const [search, setSearch] = useState("");

  const filteredDebts = debts.filter((debt) =>
    debt.student
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalDebt = debts.reduce(
    (sum, debt) => sum + (debt.charge - debt.paid),
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
                Οφειλές
              </h1>

            </div>

          </div>

        </div>

      </header>

      <div className="p-6 md:p-8">

        <div className="mb-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-red-50 p-3">
                <AlertCircle
                  size={22}
                  className="text-red-600"
                />
              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Μαθητές με οφειλή
                </p>

                <p className="text-2xl font-bold text-slate-900">
                  {debts.length}
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">
              Συνολικές οφειλές
            </p>

            <p className="mt-1 text-3xl font-bold text-red-600">
              {totalDebt.toFixed(2)} €
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
                Εκκρεμείς οφειλές
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Μαθητές που έχουν υπόλοιπο
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

            <table className="w-full min-w-[850px]">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Μαθητής
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Τάξη
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Μήνας
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Χρέωση
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Πληρωμένα
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase text-slate-500">
                    Υπόλοιπο
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredDebts.map((debt) => {

                  const remaining =
                    debt.charge - debt.paid;

                  return (

                    <tr
                      key={debt.id}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {debt.student}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {debt.className}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {debt.month}
                      </td>

                      <td className="px-6 py-5 font-semibold text-slate-900">
                        {debt.charge.toFixed(2)} €
                      </td>

                      <td className="px-6 py-5 font-semibold text-green-600">
                        {debt.paid.toFixed(2)} €
                      </td>

                      <td className="px-6 py-5">

                        <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-600">
                          {remaining.toFixed(2)} €
                        </span>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </main>
  );
}