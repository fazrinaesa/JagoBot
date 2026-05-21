const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.knowledgeBase.findFirst().then(console.log).finally(() => prisma.$disconnect());
