const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const registrations = await prisma.registration.findMany({
    take: 1,
    include: {
      event: {
        select: {
          categories: true
        }
      }
    }
  });
  console.log(JSON.stringify(registrations, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
