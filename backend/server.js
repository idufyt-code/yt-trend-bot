/*
 * -----------------------------------------------------------------------------
 * File: server.js (Versi 5 - 15 Judul)
 * Lokasi: yt-trend-bot-pro/backend/server.js
 * Deskripsi: Versi final yang mengambil data dari YouTube dan meminta 15
 * rekomendasi judul dari Gemini AI.
 * -----------------------------------------------------------------------------
 */

// 1. Import library
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

// 2. Inisialisasi
const app = express();
const PORT = process.env.PORT || 3001;
const geminiApiKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(geminiApiKey);

// 3. Middleware
app.use(cors());
app.use(express.json());

// --- FUNGSI: Mengambil data & THUMBNAIL dari YouTube ---
async function getYouTubeTrendingData(query) {
    console.log(`  [YT-1] Mencari video & thumbnail trending di YouTube untuk: "${query}"`);
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
        console.log(`  [YT-2] Berhasil mendapatkan ${videoData.length} data video dari YouTube.`);
        if (videoData.length === 0) {
            console.log("  [!] Peringatan: YouTube tidak mengembalikan data untuk query ini.");
            return [];
        }
        return videoData;
    } catch (error) {
        console.error("  [X] GAGAL saat mengambil data dari YouTube:", error.response?.data?.error?.message || error.message);
        return null;
    }
}


// --- FUNGSI UTAMA: Analisa dengan AI ---
async function runAnalysis(niche, targetAudience, locationAudience) {
    const trendingVideos = await getYouTubeTrendingData(niche);

    if (trendingVideos === null) {
        console.log("  [!] Proses dihentikan karena gagal mengambil data dari YouTube.");
        return null;
    }
    
    const trendingTitles = trendingVideos.map(video => video.title);

    console.log("  [AI-1] Mempersiapkan model dan prompt AI...");
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "titles": { type: "ARRAY", items: { type: "STRING" } },
                    "thumbnail_prompt": { type: "STRING" },
                    "hashtags": { type: "ARRAY", items: { type: "STRING" } }
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
        console.log("  [AI-2] Mengirim prompt ke Google AI...");
        const result = await model.generateContent(prompt);
        const response = result.response;
        const aiAnalysis = JSON.parse(response.text());
        console.log("  [AI-3] Menerima dan mem-parsing hasil.");
        
        return {
            ...aiAnalysis,
            trendingVideos: trendingVideos.slice(0, 5)
        };

    } catch (error) {
        console.error("  [X] GAGAL saat memanggil Gemini API:", error);
        return null;
    }
}


// 4. Rute API
app.post('/api/analyze', async (req, res) => {
    const { niche, targetAudience, locationAudience } = req.body;
    console.log('\n--- Menerima Permintaan Baru (Versi Final) ---');
    if (!niche) {
        return res.status(400).json({ error: 'Niche atau tema konten wajib diisi.' });
    }
    const analysisResult = await runAnalysis(niche, targetAudience, locationAudience);
    if (analysisResult) {
        console.log('--- Analisa Akurat Selesai. Mengirim ke frontend. ---');
        res.json(analysisResult);
    } else {
        res.status(500).json({ error: 'Gagal mendapatkan analisa dari YouTube atau AI. Cek log backend.' });
    }
});

// 5. Jalankan Server
app.listen(PORT, () => {
    console.log(`🚀 Server YT Trend-Bot (FINAL) berjalan di http://localhost:${PORT}`);
    console.log('Dapur AI & YouTube siap menerima pesanan!');
});
