"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TambahTeknisi() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    jurusan: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Ambil token dari localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Anda harus login terlebih dahulu");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/tambah", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Sesuaikan format token jika perlu
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Reset form dan redirect ke halaman lain atau tampilkan pesan sukses
        setFormData({ nama: "", jurusan: "" });
        alert("Data teknisi berhasil ditambahkan!");
        router.push("/"); // Ganti dengan halaman tujuan setelah berhasil
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal menambahkan data");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
        <div className="col-xl-5 col-lg-6 col-md-8 col-sm-8 col-xs-10 card-sigin-main mx-auto my-auto py-4 justify-content-center">
          <div className="card-sigin">
            <div className="main-card-signin d-md-flex">
              <div className="wd-100p">
                <div className="d-flex mb-4">
                  <a href="/">
                    <img
                      src="../assets/images/brand-logos/toggle-logo.png"
                      className="sign-favicon ht-40"
                      alt="logo"
                    />
                  </a>
                </div>
                <div className="">
                  <div className="main-signup-header">
                    <h2>Tambah Teknisi Baru</h2>
                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label>Nama Teknisi</label>
                        <input
                          className="form-control"
                          placeholder="Masukkan nama teknisi"
                          type="text"
                          name="nama"
                          value={formData.nama}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Jurusan</label>
                        <input
                          className="form-control"
                          placeholder="Masukkan jurusan"
                          type="text"
                          name="jurusan"
                          value={formData.jurusan}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isLoading}
                      >
                        {isLoading ? "Menambahkan..." : "Tambah Teknisi"}
                      </button>
                    </form>
                    <div className="main-signin-footer text-center mt-3">
                      <p>
                        <a href="/">Kembali ke Beranda</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}