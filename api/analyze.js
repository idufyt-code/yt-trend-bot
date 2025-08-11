/*
 * -----------------------------------------------------------------------------
 * File: analyze.js (Versi Vercel Serverless)
 * Lokasi: api/analyze.js
 * Deskripsi: Kode backend yang dirancang untuk berjalan sebagai
 * Vercel Serverless Function.
 * -----------------------------------------------------------------------------
 */

// Mengimpor library yang dibutuhkan
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Google AI dari Environment Variable
const geminiApiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Fungsi untuk mengambil data dari YouTube
async function getYouTubeTrendingData(query) {
    const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
        part: 'snippet',
        q: query,
        key: geminiApiKey,
        maxResults: 15,
        type: 'video',
        relevanceLanguage: 'id',
        regionCode: 'ID'
    };
    try {
        const response = await axios.get(YOUTUBE_API_URL, { params });
        const videoData = response.data.items.map(item => ({
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails.medium.url
        }));
        return videoData;
    } catch (error) {
        console.error("GAGAL saat mengambil data dari YouTube:", error.response?.data?.error?.message || error.message);
        return null;
    }
}

// Fungsi utama untuk analisa AI
async function runAnalysis(niche, targetAudience, locationAudience) {
    const trendingVideos = await getYouTubeTrendingData(niche);
    if (trendingVideos === null) return null;

    const trendingTitles = trendingVideos.map(video => video.title);
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    titles: { type: "ARRAY", items: { type: "STRING" } },
                    thumbnail_prompt: { type: "STRING" },
                    hashtags: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["titles", "thumbnail_prompt", "hashtags"]
            }
        }
    });

    const prompt = `
        Anda adalah seorang ahli strategi YouTube kelas dunia.
        Tugas Anda adalah menganalisis data YouTube yang sedang tren dan memberikan rekomendasi yang sangat akurat.
        Parameter Analisis:
        - Niche / Tema Konten: "${niche}"
        - Target Audiens: "${targetAudience || 'Umum'}" 
        - Lokasi Audiens: "${locationAudience || 'Global/Indonesia'}"
        Berikut adalah daftar judul video yang sedang populer untuk niche ini:
        ${trendingTitles.length > 0 ? trendingTitles.map(t => `- ${t}`).join('\n') : "Tidak ada data judul dari YouTube, berikan analisa berdasarkan pengetahuan umum Anda."}
        Berdasarkan CONTOH NYATA di atas, analisa pola yang paling berhasil. Kemudian, buatkan rekomendasi baru yang mengikuti tren tersebut.
        - "titles": Buat 15 variasi judul baru yang polanya mirip dengan contoh sukses di atas.
        - "thumbnail_prompt": Buat SATU prompt thumbnail yang visualnya terinspirasi dari tren judul di atas.
        - "hashtags": Berikan 10-15 hashtag yang paling relevan berdasarkan data tersebut.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiAnalysis = JSON.parse(response.text());
        return {
            ...aiAnalysis,
            trendingVideos: trendingVideos.slice(0, 5)
        };
    } catch (error) {
        console.error("GAGAL saat memanggil Gemini API:", error);
        return null;
    }
}

// Ini adalah handler utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
    // Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests allowed' });
    }

    try {
        const { niche, targetAudience, locationAudience } = request.body;
        if (!niche) {
            return response.status(400).json({ error: 'Niche atau tema konten wajib diisi.' });
        }

        const analysisResult = await runAnalysis(niche, targetAudience, locationAudience);

        if (analysisResult) {
            // Kirim hasil sukses
            return response.status(200).json(analysisResult);
        } else {
            // Kirim error jika analisa gagal
            return response.status(500).json({ error: 'Gagal mendapatkan analisa dari YouTube atau AI.' });
        }
    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
}
