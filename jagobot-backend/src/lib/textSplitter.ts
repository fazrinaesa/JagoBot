/**
 * Fungsi untuk memecah teks panjang menjadi potongan (chunks) kecil.
 */
export const splitText = (text: string, chunkSize: number = 500, chunkOverlap: number = 50): string[] => {
    const chunks: string[] = [];
    let i = 0;

    while (i < text.length) {
        chunks.push(text.slice(i, i + chunkSize));
        i += chunkSize - chunkOverlap;
    }

    return chunks;
};