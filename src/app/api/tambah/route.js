import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization"); // 🔥 token dari client
    const body = await request.json();

    if (!authHeader) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(
      "https://web-production-dbd6b.up.railway.app/teknisi",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader, // teruskan ke API eksternal
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to create data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Tambah teknisi error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
