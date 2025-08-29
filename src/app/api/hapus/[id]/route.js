  // src/app/api/hapus/[id]/route.js
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ message: "ID param is required" }, { status: 400 });
    }

    const upstream = await fetch(
      `https://web-production-dbd6b.up.railway.app/teknisi/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: authHeader },
      }
    );

    // Jika gagal dari upstream, teruskan status & pesan
    const text = await upstream.text().catch(() => "");
    if (!upstream.ok) {
      return NextResponse.json(
        { message: text || "Failed to delete data" },
        { status: upstream.status }
      );
    }

    // Sukses: tidak perlu body; 204 cukup
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Hapus teknisi error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
