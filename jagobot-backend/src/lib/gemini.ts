export const generateEmbedding = async (text: string): Promise<number[]> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        throw new Error("GEMINI_API_KEY tidak ditemukan di file .env!");
    }

    try {
        // ✅ Pakai model yang tersedia di akunmu
        const modelName = "gemini-embedding-001";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:embedContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: `models/${modelName}`,
                content: { parts: [{ text }] }
            })
        });

        const data: any = await response.json();

        if (response.ok && data.embedding) {
            console.log("✅ Berhasil embedding chunk!");
            return data.embedding.values;
        } else {
            console.error("❌ Detail Error:", data.error?.message);
            throw new Error(data.error?.message || "Gagal API Gemini");
        }
    } catch (err: any) {
        console.error("❌ Error Fatal:", err.message);
        throw new Error(err.message || "Gagal memproses AI Gemini");
    }
};