#!/usr/bin/env node
/**
 * Launcher proses JagoBot.
 *
 * Hosting Kroombox menjalankan `npm run dev` lewat PM2, bukan `npm run start`.
 * Di hosting, PORT diisi panel dan hasil build ada di dist/, sehingga kita
 * jalankan server produksi (backend menyajikan dist). Di laptop, tanpa PORT,
 * kita tetap memakai Vite agar hot reload tidak hilang.
 */
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const forceProd = process.argv.includes('--prod');

const hasBuild = existsSync(resolve(root, 'dist', 'index.html'));
const panelPort = Boolean(process.env.PORT);
const isProduction =
  forceProd || process.env.NODE_ENV === 'production' || (panelPort && hasBuild);

const [commandLine, cwd] = isProduction
  ? ['npx tsx server.ts', resolve(root, 'jagobot-backend')]
  : ['npx vite --port=5177 --host=0.0.0.0', root];

console.log(
  `[launcher] mode=${isProduction ? 'production' : 'development'} port=${process.env.PORT ?? '-'} dist=${hasBuild}`
);

const child = spawn(commandLine, { cwd, stdio: 'inherit', shell: true });

child.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
