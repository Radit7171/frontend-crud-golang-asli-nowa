import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ambil id dari URL param /api/edit/[id]
    const { id } = params || {};
    if (!id) {
      return NextResponse.json({ message: "ID param is required" }, { status: 400 });
    }

    // body hanya berisi field yang diupdate
    const updateData = await request.json(); // { nama, jurusan }

    const response = await fetch(
      `https://web-production-dbd6b.up.railway.app/teknisi/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      const msg = await response.text().catch(() => "");
      return NextResponse.json(
        { message: msg || "Failed to update data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Edit teknisi error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
