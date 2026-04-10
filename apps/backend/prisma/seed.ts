import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { code: "admin" },
    update: {},
    create: { name: "管理员", code: "admin" },
  });

  await prisma.role.upsert({
    where: { code: "staff" },
    update: {},
    create: { name: "运营", code: "staff" },
  });

  await prisma.role.upsert({
    where: { code: "user" },
    update: {},
    create: { name: "用户", code: "user" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@lingopath.local" },
    update: {},
    create: {
      email: "admin@lingopath.local",
      name: "LingoPath Admin",
      passwordHash: await hash("Admin@123456", 10),
    },
  });

  await prisma.roleAssignment.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
