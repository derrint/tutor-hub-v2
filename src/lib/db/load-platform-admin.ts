import { prisma } from "@/lib/db/prisma";

export type AdminTutorListItem = {
  id: string;
  displayName: string;
  slug: string | null;
  accountHolderName: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  whatsappNumber: string | null;
  userCount: number;
  users: { id: string; email: string }[];
};

export type AdminUserListItem = {
  id: string;
  email: string;
  role: "TEACHER" | "ADMIN";
  tutorId: string | null;
  tutorDisplayName: string | null;
};

export async function loadAdminTutorList(): Promise<AdminTutorListItem[]> {
  const rows = await prisma.tutor.findMany({
    orderBy: { displayName: "asc" },
    select: {
      id: true,
      displayName: true,
      slug: true,
      accountHolderName: true,
      bankName: true,
      bankAccountNumber: true,
      whatsappNumber: true,
      users: {
        select: { id: true, email: true },
        orderBy: { email: "asc" },
      },
      _count: { select: { users: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    displayName: row.displayName,
    slug: row.slug,
    accountHolderName: row.accountHolderName,
    bankName: row.bankName,
    bankAccountNumber: row.bankAccountNumber,
    whatsappNumber: row.whatsappNumber,
    userCount: row._count.users,
    users: row.users,
  }));
}

export async function loadAdminUserList(): Promise<AdminUserListItem[]> {
  const rows = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: {
      id: true,
      email: true,
      role: true,
      tutorId: true,
      tutor: { select: { displayName: true } },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    tutorId: row.tutorId,
    tutorDisplayName: row.tutor?.displayName ?? null,
  }));
}

export async function loadAdminTutorOptions(): Promise<
  { id: string; displayName: string }[]
> {
  return prisma.tutor.findMany({
    orderBy: { displayName: "asc" },
    select: { id: true, displayName: true },
  });
}
