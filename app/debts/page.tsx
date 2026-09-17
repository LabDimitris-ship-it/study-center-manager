"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type Student = {
  id: number;
  name: string;
  class: string | null;
  guardian: string | null;
  phone: string | null;
  monthly_fee: number;
  status: string | null;
};

type Payment = {
  id: number;
  student_id: number;
  month: string;
  amount: number;
  payment_method: string | null;
  payment_date: string;
};

type DebtExclusion = {
  id: number;
  student_id: number;
  month: string;
};

type Debt = {
  student: Student;
  fee: number;
  paid: number;
  remaining: number;
};

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");

  const months = [
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

  return `${months[Number(month) - 1]} ${year}`;
}

export default function DebtsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [exclusions, setExclusions] = useState<DebtExclusion[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonth());

  async function loadData() {
    setLoading(true);

    const [
      { data: studentsData, error: studentsError },
      { data: paymentsData, error: paymentsError },
      { data: exclusionsData, error: exclusionsError },
    ] = await Promise.all([
      supabase
        .from("students")
        .select("*")
        .order("name"),

      supabase
        .from("payments")
        .select("*")
        .order("payment_date", {
          ascending: false,
        }),

      supabase
        .from("debt_exclusions")
        .select("*"),
    ]);

    if (studentsError) {
      console.error(studentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των μαθητών.");
    }

    if (paymentsError) {
      console.error(paymentsError);
      alert("Δεν ήταν δυνατή η φόρτωση των πληρωμών.");
    }

    if (exclusionsError) {
      console.error(exclusionsError);
      alert("Δεν ήταν δυνατή η φόρτωση των διαγραμμένων οφειλών.");
    }

    setStudents(studentsData || []);
    setPayments(paymentsData || []);
    setExclusions(exclusionsData || []);

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const debts = useMemo<Debt[]>(() => {
    return students
      .filter((student) => {
        if (
          student.status &&
          student.status.toLowerCase() === "ανενεργός"
        ) {
          return false;
        }

        return Number(student.monthly_fee) > 0;
      })
      .map((student) => {
        const studentPayments = payments.filter(
          (payment) =>
            payment.student_id === student.id &&
            payment.month === month
        );

        const paid = studentPayments.reduce(
          (sum, payment) => sum + Number(payment.amount || 0),
          0
        );

        const fee = Number(student.monthly_fee || 0);

        const remaining = Math.max(fee - paid, 0);

        return {
          student,
          fee,
          paid,
          remaining,
        };
      })
      .filter((debt) => {
        if (debt.remaining <= 0) {
          return false;
        }

        const excluded = exclusions.some(
          (exclusion) =>
            exclusion.student_id === debt.student.id &&
            exclusion.month === month
        );

        return !excluded;
      });
  }, [students, payments, exclusions, month]);

  const totalDebt = debts.reduce(
    (sum, debt) => sum + debt.remaining,
    0
  );

  const totalPaid = debts.reduce(
    (sum, debt) => sum + debt.paid,
    0
  );

  async function deleteDebt(studentId: number) {
    const student = students.find(
      (item) => item.id === studentId
    );

    if (!student) return;

    const confirmed = window.confirm(
      `Θέλεις να διαγράψεις την οφειλή του ${student.name} για ${formatMonth(
        month
      )};\n\nΗ πληρωμή και το παιδί δεν θα διαγραφούν.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("debt_exclusions")
      .insert({
        student_id: studentId,
        month,
      });

    if (error) {
      console.error(error);

      if (error.code === "23505") {
        alert("Η οφειλή έχει ήδη διαγραφεί.");
      } else {
        alert("Η οφειλή δεν διαγράφηκε.");
      }

      return;
    }

    await loadData();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Οφειλές
          </h1>

          <p className="mt-2 text-gray-600">
            Αυτόματος υπολογισμός οφειλών ανά μήνα
          </p>
        </div>

        {/* MONTH */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Επιλογή μήνα
              </label>

              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border p-3"
              />
            </div>

            <div className="rounded-xl bg-red-50 px-6 py-4">
              <p className="text-sm text-gray-600">
                Συνολικές οφειλές
              </p>

              <p className="text-2xl font-bold text-red-700">
                {totalDebt.toFixed(2)}€
              </p>
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Οφειλέτες
            </p>

            <p className="mt-1 text-2xl font-bold">
              {debts.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Πληρωμές στον μήνα
            </p>

            <p className="mt-1 text-2xl font-bold">
              {totalPaid.toFixed(2)}€
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">
              Μήνας
            </p>

            <p className="mt-1 text-xl font-bold">
              {formatMonth(month)}
            </p>
          </div>

        </div>

        {/* DEBTS */}
        <div className="rounded-2xl bg-white p-6 shadow">

          <div className="mb-5">
            <h2 className="text-xl font-semibold">
              Οφειλές — {formatMonth(month)}
            </h2>

            <p className="text-sm text-gray-500">
              Οι οφειλές υπολογίζονται αυτόματα από τις πληρωμές.
            </p>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Φόρτωση...
            </div>
          ) : debts.length === 0 ? (
            <div className="rounded-xl bg-green-50 p-10 text-center">
              <p className="text-xl font-semibold text-green-700">
                Δεν υπάρχουν οφειλές 🎉
              </p>

              <p className="mt-2 text-green-600">
                Όλοι οι μαθητές είναι τακτοποιημένοι για τον συγκεκριμένο μήνα.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="p-3">
                      Μαθητής
                    </th>

                    <th className="p-3">
                      Τάξη
                    </th>

                    <th className="p-3">
                      Μηνιαία χρέωση
                    </th>

                    <th className="p-3">
                      Πληρωμή
                    </th>

                    <th className="p-3">
                      Οφειλή
                    </th>

                    <th className="p-3">
                      Ενέργεια
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {debts.map((debt) => (
                    <tr
                      key={debt.student.id}
                      className="border-b last:border-0"
                    >

                      <td className="p-3">
                        <div className="font-semibold">
                          {debt.student.name}
                        </div>

                        {debt.student.guardian && (
                          <div className="text-xs text-gray-500">
                            {debt.student.guardian}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {debt.student.class || "-"}
                      </td>

                      <td className="p-3">
                        {debt.fee.toFixed(2)}€
                      </td>

                      <td className="p-3 text-green-700">
                        {debt.paid.toFixed(2)}€
                      </td>

                      <td className="p-3">
                        <span className="rounded-lg bg-red-100 px-3 py-2 font-bold text-red-700">
                          {debt.remaining.toFixed(2)}€
                        </span>
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() =>
                            deleteDebt(debt.student.id)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Διαγραφή
                        </button>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}