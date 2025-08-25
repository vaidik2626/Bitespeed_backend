import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clean old data (optional, only for dev)
  await prisma.contact.deleteMany();

  // Insert some test contacts
  const contact1 = await prisma.contact.create({
    data: {
      email: "lorraine@hillvalley.edu",
      phoneNumber: "123456",
      linkPrecedence: "primary"
    }
  });

  const contact2 = await prisma.contact.create({
    data: {
      email: "mcfly@hillvalley.edu",
      phoneNumber: "123456", // same phone → will be treated as secondary
      linkPrecedence: "secondary",
      linkedId: contact1.id
    }
  });

  const contact3 = await prisma.contact.create({
    data: {
      email: "doc@hillvalley.edu",
      phoneNumber: "999999",
      linkPrecedence: "primary"
    }
  });

  console.log("✅ Seeded contacts:", { contact1, contact2, contact3 });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
