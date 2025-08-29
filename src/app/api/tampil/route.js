import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Ambil token dari header request (Authorization)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Token tidak ditemukan atau invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // Panggil API eksternal /teknisi
    const res = await fetch("https://web-production-dbd6b.up.railway.app/teknisi", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // kirim token ke API
      },
      cache: "no-store", // biar selalu fresh
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Gagal mengambil data dari API eksternal" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Hanya ambil field nama & jurusan
    const teknisi = data.map((item, index) => ({
      no: index + 1,
      nama: item.nama,
      jurusan: item.jurusan,
    }));

    return NextResponse.json(teknisi, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { message: "Terjadi error", error: err.message },
      { status: 500 }
    );
  }
}
