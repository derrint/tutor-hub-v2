// Temporary mock data — to be replaced with real fetches from Prisma/DB.
// The shape is intentionally kept close to the Prisma models (prisma/schema.prisma)
// for a smooth transition.
//
// Every name, fee, and date below is a fabricated placeholder for development.
// None of it is real customer data.

export type EducationLevel = "TK" | "SD";
export type StudentStatus = "ACTIVE" | "INACTIVE";
export type SessionStatus = "SCHEDULED" | "ATTENDED" | "ABSENT";
export type InvoiceStatus = "UNPAID" | "PAID";

export type Student = {
  id: string;
  name: string;
  age: number;
  level: EducationLevel;
  feePerSession: number;
  status: StudentStatus;
  parentName: string;
};

export const STUDENTS: Student[] = [
  {
    id: "m1",
    name: "Askara",
    age: 5,
    level: "TK",
    feePerSession: 125000,
    status: "ACTIVE",
    parentName: "Mama Askara",
  },
  {
    id: "m2",
    name: "Arga",
    age: 6,
    level: "TK",
    feePerSession: 125000,
    status: "ACTIVE",
    parentName: "Mama Askara",
  },
  {
    id: "m3",
    name: "Gavendra",
    age: 3,
    level: "TK",
    feePerSession: 110000,
    status: "ACTIVE",
    parentName: "Michelle",
  },
  {
    id: "m4",
    name: "Azka",
    age: 5,
    level: "TK",
    feePerSession: 110000,
    status: "ACTIVE",
    parentName: "Ibu Azka",
  },
  {
    id: "m5",
    name: "Aurell",
    age: 7,
    level: "SD",
    feePerSession: 135000,
    status: "ACTIVE",
    parentName: "Ibu Aurell",
  },
  {
    id: "m6",
    name: "Milena",
    age: 6,
    level: "SD",
    feePerSession: 135000,
    status: "INACTIVE",
    parentName: "Ibu Milena",
  },
];

export type TodaySession = {
  id: string;
  studentName: string;
  level: EducationLevel;
  startTime: string;
  endTime: string;
  status: SessionStatus;
};

export const TODAY_SCHEDULE: TodaySession[] = [
  {
    id: "s1",
    studentName: "Gavendra",
    level: "TK",
    startTime: "17:00",
    endTime: "18:00",
    status: "SCHEDULED",
  },
  {
    id: "s2",
    studentName: "Azka",
    level: "TK",
    startTime: "18:45",
    endTime: "19:45",
    status: "SCHEDULED",
  },
];

export type RecurringSession = {
  id: string;
  studentId: string;
  studentName: string;
  level: EducationLevel;
  /** 0 = Sunday … 6 = Saturday, matching FullCalendar's daysOfWeek convention. */
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
};

// Weekly recurring sessions — feeds the desktop calendar grid on /jadwal.
// Materialized into concrete events by FullCalendar's own recurring-event
// support (daysOfWeek + startTime/endTime), so navigating weeks "just works"
// without us generating dates by hand.
export const RECURRING_SESSIONS: RecurringSession[] = [
  {
    id: "r1",
    studentId: "m3",
    studentName: "Gavendra",
    level: "TK",
    daysOfWeek: [1, 3, 5],
    startTime: "17:00",
    endTime: "18:00",
  },
  {
    id: "r2",
    studentId: "m4",
    studentName: "Azka",
    level: "TK",
    daysOfWeek: [2, 4],
    startTime: "18:45",
    endTime: "19:45",
  },
  {
    id: "r3",
    studentId: "m1",
    studentName: "Askara",
    level: "TK",
    daysOfWeek: [1, 3],
    startTime: "15:00",
    endTime: "16:00",
  },
  {
    id: "r4",
    studentId: "m2",
    studentName: "Arga",
    level: "TK",
    daysOfWeek: [1, 3],
    startTime: "16:00",
    endTime: "17:00",
  },
  {
    id: "r5",
    studentId: "m5",
    studentName: "Aurell",
    level: "SD",
    daysOfWeek: [2, 4, 6],
    startTime: "16:00",
    endTime: "17:30",
  },
];

export type InvoiceChildLine = {
  id: string;
  name: string;
  sessionCount: number;
  subtotal: number;
  /** e.g. "2/9" — matches the format the tutor already uses over WhatsApp. */
  sessionDates: string[];
};

export type InvoicePreview = {
  id: string;
  parentName: string;
  monthLabel: string;
  total: number;
  status: InvoiceStatus;
  children: InvoiceChildLine[];
};

export const INVOICES: InvoicePreview[] = [
  {
    id: "inv1",
    parentName: "Mama Askara",
    monthLabel: "September 2026",
    total: 1500000,
    status: "UNPAID",
    children: [
      {
        id: "m1",
        name: "Askara",
        sessionCount: 6,
        subtotal: 750000,
        sessionDates: ["2/9", "7/9", "9/9", "23/9", "29/9", "30/9"],
      },
      {
        id: "m2",
        name: "Arga",
        sessionCount: 6,
        subtotal: 750000,
        sessionDates: ["2/9", "7/9", "9/9", "23/9", "29/9", "30/9"],
      },
    ],
  },
  {
    id: "inv2",
    parentName: "Michelle",
    monthLabel: "September 2026",
    total: 440000,
    status: "PAID",
    children: [
      {
        id: "m3",
        name: "Gavendra",
        sessionCount: 4,
        subtotal: 440000,
        sessionDates: ["3/9", "10/9", "17/9", "24/9"],
      },
    ],
  },
];

export const FINANCE_SUMMARY = {
  monthLabel: "September 2026",
  totalBilled: 1940000,
  collected: 440000,
  unpaid: 1500000,
};
