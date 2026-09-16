export type Student = {
  id: number;
  name: string;
  className: string;
  guardian: string;
  phone: string;
  monthlyFee: number;
  status: "Ενεργός" | "Ανενεργός";
};

export type Payment = {
  id: number;
  studentId: number;
  amount: number;
  month: string;
  method: "Μετρητά" | "POS" | "IRIS" | "Τράπεζα";
  date: string;
};

export const students: Student[] = [
  {
    id: 1,
    name: "Μαρία Κωνσταντίνου",
    className: "Ε' Δημοτικού",
    guardian: "Γιώργος Κωνσταντίνου",
    phone: "69XXXXXXXX",
    monthlyFee: 80,
    status: "Ενεργός",
  },
  {
    id: 2,
    name: "Γιώργος Παπαδόπουλος",
    className: "ΣΤ' Δημοτικού",
    guardian: "Ελένη Παπαδοπούλου",
    phone: "69XXXXXXXX",
    monthlyFee: 100,
    status: "Ενεργός",
  },
  {
    id: 3,
    name: "Νίκος Δημητρίου",
    className: "Γ' Δημοτικού",
    guardian: "Κώστας Δημητρίου",
    phone: "69XXXXXXXX",
    monthlyFee: 70,
    status: "Ενεργός",
  },
  {
    id: 4,
    name: "Ελένη Γεωργίου",
    className: "Β' Δημοτικού",
    guardian: "Μαρία Γεωργίου",
    phone: "69XXXXXXXX",
    monthlyFee: 90,
    status: "Ενεργός",
  },
];

export const payments: Payment[] = [
  {
    id: 1,
    studentId: 1,
    amount: 80,
    month: "Σεπτέμβριος",
    method: "Μετρητά",
    date: "16/09/2026",
  },
  {
    id: 2,
    studentId: 2,
    amount: 100,
    month: "Σεπτέμβριος",
    method: "POS",
    date: "16/09/2026",
  },
  {
    id: 3,
    studentId: 3,
    amount: 70,
    month: "Σεπτέμβριος",
    method: "IRIS",
    date: "15/09/2026",
  },
  {
    id: 4,
    studentId: 4,
    amount: 90,
    month: "Σεπτέμβριος",
    method: "Τράπεζα",
    date: "15/09/2026",
  },
];

export function getStudentPayments(studentId: number) {
  return payments.filter(
    (payment) => payment.studentId === studentId
  );
}

export function getStudentPaidAmount(studentId: number) {
  return getStudentPayments(studentId).reduce(
    (total, payment) => total + payment.amount,
    0
  );
}

export function getStudentBalance(studentId: number) {
  const student = students.find(
    (student) => student.id === studentId
  );

  if (!student) return 0;

  const paid = getStudentPaidAmount(studentId);

  return Math.max(student.monthlyFee - paid, 0);
}

export function getTotalPayments() {
  return payments.reduce(
    (total, payment) => total + payment.amount,
    0
  );
}

export function getTotalDebts() {
  return students.reduce(
    (total, student) =>
      total + getStudentBalance(student.id),
    0
  );
}