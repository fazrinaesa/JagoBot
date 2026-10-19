import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utilitas CLI: jadikan (atau buat) akun sebagai SUPER_ADMIN.
 * Pakai: npx tsx scripts/make-superadmin.ts
 * Email diambil dari env SUPER_ADMIN_EMAIL.
 */
async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'jagoai.business@gmail.com';

  if (!email) {
    console.error('Email tidak ditemukan');
    process.exit(1);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        nama_toko: email.split('@')[0],
        role: 'SUPER_ADMIN',
        password: 'CHANGE_ME_TEMPORARY',
      },
    });
    console.log('CREATED', { id: user.id, email: user.email, role: user.role });
  } else {
    if (user.role !== 'SUPER_ADMIN') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' },
      });
    }
    console.log('OK', { id: user.id, email: user.email, role: user.role });
  }
}

main()
  .catch((e) => {
    console.error('ERR', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
