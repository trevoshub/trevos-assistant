const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  const assistant = await prisma.assistant.findUnique({
    where: { id: 1 },
  });

  if (!assistant) {
    throw new Error("Assistant with ID 1 was not found.");
  }

  if (assistant.publicApiKey) {
    console.log("Assistant already has a public API key:");
    console.log(assistant.publicApiKey);
    return;
  }

  const publicApiKey =
    "ta_live_" + crypto.randomBytes(24).toString("hex");

  await prisma.assistant.update({
    where: { id: assistant.id },
    data: { publicApiKey },
  });

  console.log("Public API key generated successfully:");
  console.log(publicApiKey);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });