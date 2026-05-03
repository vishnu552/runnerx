const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const reg = await prisma.registration.findFirst({
    include: {
      lineItems: true,
      event: {
        select: {
          title: true,
          categories: true
        }
      }
    }
  });
  console.log(JSON.stringify(reg?.event?.categories, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
