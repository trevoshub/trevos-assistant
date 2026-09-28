import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "tochiegbu@gmail.com";
  const password = "password123";

  const hashedPassword = await bcrypt.hash(password, 12);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: {
        name: "Tochi",
        password: hashedPassword,
        role: "SUPER_ADMIN",
        companyId: null,
      },
    });

    console.log(`Updated SUPER_ADMIN: ${email}`);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Tochi",
      email,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      companyId: null,
    },
  });

  console.log(`Created SUPER_ADMIN: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });