import CryptoJS from 'crypto-js';

/**
 * Enkripsi API key provider AI (Fase 2).
 *
 * Kunci enkripsi diambil dari env AI_CONFIG_SECRET. Bila belum diset,
 * dipakai fallback JWT_SECRET agar tidak crash — namun sangat disarankan
 * mengisi AI_CONFIG_SECRET di .env (nilai acak panjang).
 *
 * Catatan: ini enkripsi simetris untuk mencegah key terbaca polos di DB.
 * Bukan pengganti secrets manager, tapi jauh lebih baik dari plaintext.
 */

const getSecret = (): string =>
    process.env.AI_CONFIG_SECRET || process.env.JWT_SECRET || 'jagobot-fallback-secret';

export const encryptKey = (plain: string): string => {
    if (!plain) return '';
    return CryptoJS.AES.encrypt(plain, getSecret()).toString();
};

export const decryptKey = (enc: string): string => {
    if (!enc) return '';
    try {
        const bytes = CryptoJS.AES.decrypt(enc, getSecret());
        const text = bytes.toString(CryptoJS.enc.Utf8);
        // Bila hasil dekripsi kosong, kemungkinan secret berubah / data rusak.
        return text;
    } catch {
        return '';
    }
};

/**
 * Sensor key untuk ditampilkan di UI: hanya 4 karakter awal + 4 akhir.
 * Contoh: "sk-abcd...wxyz"
 */
export const maskKey = (plain: string): string => {
    if (!plain) return '';
    if (plain.length <= 10) return '••••••';
    return `${plain.slice(0, 4)}••••••${plain.slice(-4)}`;
};
