"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditTeknisi() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [formData, setFormData] = useState({
    nama: "",
    jurusan: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Fungsi untuk mengambil data teknisi berdasarkan ID
  useEffect(() => {
    const fetchTeknisiData = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Anda harus login terlebih dahulu");
          return;
        }

        const response = await fetch(`/api/tampil/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFormData({
            nama: data.nama || "",
            jurusan: data.jurusan || "",
          });
          setIsDataLoaded(true);
        } else {
          setError("Gagal mengambil data teknisi");
        }
      } catch (err) {
        setError("Terjadi kesalahan pada server");
        console.error("Error:", err);
      }
    };

    if (id) {
      fetchTeknisiData();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Anda harus login terlebih dahulu");
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/edit/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Data teknisi berhasil diupdate!");
        router.push("/"); // Ganti dengan halaman daftar teknisi
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Gagal mengupdate data");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={() => router.back()}>
          Kembali
        </button>
      </div>
    );
  }

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
                    <h2>Edit Data Teknisi</h2>
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
                      <div className="d-flex justify-content-between">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => router.back()}
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isLoading}
                        >
                          {isLoading ? "Mengupdate..." : "Update Data"}
                        </button>
                      </div>
                    </form>
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
