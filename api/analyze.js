/*
 * -----------------------------------------------------------------------------
 * File: analyze.js (Versi Tes Sederhana)
 * Lokasi: api/analyze.js
 * Deskripsi: Kode backend dummy untuk menguji apakah fungsi Vercel
 * bisa berjalan tanpa error.
 * -----------------------------------------------------------------------------
 */

// Ini adalah handler utama yang akan dijalankan oleh Vercel
export default async function handler(request, response) {
    // Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests allowed' });
    }

    // Langsung kirim kembali hasil dummy tanpa memanggil AI atau YouTube
    const dummyResult = {
        titles: ["Judul Tes 1: Berhasil!", "Judul Tes 2: Koneksi Sukses!"],
        thumbnail_prompt: "Prompt tes ini membuktikan bahwa backend Vercel sudah berjalan dengan benar.",
        hashtags: ["#tes", "#sukses", "#vercel"],
        trendingVideos: []
    };

    // Kirim hasil sukses
    return response.status(200).json(dummyResult);
}
