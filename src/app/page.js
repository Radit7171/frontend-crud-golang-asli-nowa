/* eslint-disable */
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [teknisi, setTeknisi] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // ✅ cek dari URL, kalau belum ada query param → reload sekali
    if (!window.location.search.includes("reloaded=true")) {
      const newUrl = `${window.location.pathname}?reloaded=true`;
      window.location.replace(newUrl); // reload total sekali
      return;
    }

    // ✅ di sini baru jalankan data fetch atau router.refresh()
    router.refresh();
  }, [router]);

  const fetchTeknisiData = async (token) => {
    try {
      const response = await fetch("/api/tampil", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTeknisi(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      } else {
        console.error("Gagal mengambil data teknisi");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter teknisi berdasarkan search term
  const filteredTeknisi = teknisi.filter(
    (tech) =>
      tech.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.jurusan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung total pages setelah filtering
  const filteredTotalPages = Math.ceil(filteredTeknisi.length / itemsPerPage);

  // Dapatkan item untuk halaman saat ini
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTeknisi.slice(indexOfFirstItem, indexOfLastItem);

  // Fungsi untuk ganti halaman
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fungsi untuk ganti items per page
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset ke halaman pertama
    setTotalPages(Math.ceil(filteredTeknisi.length / newItemsPerPage));
  };

  // Generate page numbers untuk pagination
  const pageNumbers = [];
  for (let i = 1; i <= filteredTotalPages; i++) {
    pageNumbers.push(i);
  }
  // Fungsi untuk masuk ke fullscreen
  function openFullscreen() {
    const elem = document.documentElement; // seluruh halaman

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      // Firefox
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      // Chrome, Safari, Opera
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      // IE/Edge lama
      elem.msRequestFullscreen();
    }
  }

  const openModal = (id) => {
    setSelectedId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedId(null);
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    try {
      const token = localStorage.getItem("token"); // ambil token login

      const res = await fetch(`/api/hapus/${selectedId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // kirim token
        },
      });

      if (res.ok) {
        alert("Data berhasil dihapus!");
        window.location.reload(); // atau update state tanpa reload
      } else {
        const error = await res.json();
        alert("Gagal hapus: " + error.message);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      closeModal();
    }
  };

  return (
    <>
      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="switcher-canvas"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title text-default" id="offcanvasRightLabel">
            Switcher
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <nav className="border-bottom border-block-end-dashed">
            <div
              className="nav nav-tabs nav-justified"
              id="switcher-main-tab"
              role="tablist"
            >
              <button
                className="nav-link active"
                id="switcher-home-tab"
                data-bs-toggle="tab"
                data-bs-target="#switcher-home"
                type="button"
                role="tab"
                aria-controls="switcher-home"
                aria-selected="true"
              >
                Theme Styles
              </button>
              <button
                className="nav-link"
                id="switcher-profile-tab"
                data-bs-toggle="tab"
                data-bs-target="#switcher-profile"
                type="button"
                role="tab"
                aria-controls="switcher-profile"
                aria-selected="false"
              >
                Theme Colors
              </button>
            </div>
          </nav>
          <div className="tab-content" id="nav-tabContent">
            <div
              className="tab-pane fade show active border-0"
              id="switcher-home"
              role="tabpanel"
              aria-labelledby="switcher-home-tab"
              tabIndex={0}
            >
              <div className="">
                <p className="switcher-style-head">Theme Color Mode:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-light-theme"
                      >
                        Light
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="theme-style"
                        id="switcher-light-theme"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-dark-theme"
                      >
                        Dark
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="theme-style"
                        id="switcher-dark-theme"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Directions:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-ltr"
                      >
                        LTR
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="direction"
                        id="switcher-ltr"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-rtl"
                      >
                        RTL
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="direction"
                        id="switcher-rtl"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Navigation Styles:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-vertical"
                      >
                        Vertical
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-style"
                        id="switcher-vertical"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-horizontal"
                      >
                        Horizontal
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-style"
                        id="switcher-horizontal"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="navigation-menu-styles">
                <p className="switcher-style-head">
                  Vertical &amp; Horizontal Menu Styles:
                </p>
                <div className="row switcher-style gx-0 gy-2">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-menu-click"
                      >
                        Menu Click
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-menu-styles"
                        id="switcher-menu-click"
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-menu-hover"
                      >
                        Menu Hover
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-menu-styles"
                        id="switcher-menu-hover"
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-icon-click"
                      >
                        Icon Click
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-menu-styles"
                        id="switcher-icon-click"
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-icon-hover"
                      >
                        Icon Hover
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="navigation-menu-styles"
                        id="switcher-icon-hover"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="sidemenu-layout-styles">
                <p className="switcher-style-head">Sidemenu Layout Styles:</p>
                <div className="row switcher-style gx-0 gy-2">
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-default-menu"
                      >
                        Default Menu
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-default-menu"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-closed-menu"
                      >
                        Closed Menu
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-closed-menu"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-icontext-menu"
                      >
                        Icon Text
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-icontext-menu"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-icon-overlay"
                      >
                        Icon Overlay
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-icon-overlay"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-detached"
                      >
                        Detached
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-detached"
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-double-menu"
                      >
                        Double Menu
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="sidemenu-layout-styles"
                        id="switcher-double-menu"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Page Styles:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-regular"
                      >
                        Regular
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="page-styles"
                        id="switcher-regular"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-classic"
                      >
                        Classic
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="page-styles"
                        id="switcher-classic"
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-modern"
                      >
                        Modern
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="page-styles"
                        id="switcher-modern"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Layout Width Styles:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-full-width"
                      >
                        Full Width
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="layout-width"
                        id="switcher-full-width"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-boxed"
                      >
                        Boxed
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="layout-width"
                        id="switcher-boxed"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Menu Positions:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-menu-fixed"
                      >
                        Fixed
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="menu-positions"
                        id="switcher-menu-fixed"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-menu-scroll"
                      >
                        Scrollable
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="menu-positions"
                        id="switcher-menu-scroll"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Header Positions:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-header-fixed"
                      >
                        Fixed
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="header-positions"
                        id="switcher-header-fixed"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-header-scroll"
                      >
                        Scrollable
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="header-positions"
                        id="switcher-header-scroll"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Loader:</p>
                <div className="row switcher-style gx-0">
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-loader-enable"
                      >
                        Enable
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="page-loader"
                        id="switcher-loader-enable"
                      />
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="form-check switch-select">
                      <label
                        className="form-check-label"
                        htmlFor="switcher-loader-disable"
                      >
                        Disable
                      </label>
                      <input
                        className="form-check-input"
                        type="radio"
                        name="page-loader"
                        id="switcher-loader-disable"
                        defaultChecked=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="tab-pane fade border-0"
              id="switcher-profile"
              role="tabpanel"
              aria-labelledby="switcher-profile-tab"
              tabIndex={0}
            >
              <div>
                <div className="theme-colors">
                  <p className="switcher-style-head">Menu Colors:</p>
                  <div className="d-flex switcher-style pb-2">
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-white"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Light Menu"
                        type="radio"
                        name="menu-colors"
                        id="switcher-menu-light"
                        defaultChecked=""
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-dark"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Dark Menu"
                        type="radio"
                        name="menu-colors"
                        id="switcher-menu-dark"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Color Menu"
                        type="radio"
                        name="menu-colors"
                        id="switcher-menu-primary"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-gradient"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Gradient Menu"
                        type="radio"
                        name="menu-colors"
                        id="switcher-menu-gradient"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-transparent"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Transparent Menu"
                        type="radio"
                        name="menu-colors"
                        id="switcher-menu-transparent"
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-3 text-muted fs-11">
                    Note:If you want to change color Menu dynamically change
                    from below Theme Primary color picker
                  </div>
                </div>
                <div className="theme-colors">
                  <p className="switcher-style-head">Header Colors:</p>
                  <div className="d-flex switcher-style pb-2">
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-white"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Light Header"
                        type="radio"
                        name="header-colors"
                        id="switcher-header-light"
                        defaultChecked=""
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-dark"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Dark Header"
                        type="radio"
                        name="header-colors"
                        id="switcher-header-dark"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Color Header"
                        type="radio"
                        name="header-colors"
                        id="switcher-header-primary"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-gradient"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Gradient Header"
                        type="radio"
                        name="header-colors"
                        id="switcher-header-gradient"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-transparent"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Transparent Header"
                        type="radio"
                        name="header-colors"
                        id="switcher-header-transparent"
                      />
                    </div>
                  </div>
                  <div className="px-4 pb-3 text-muted fs-11">
                    Note:If you want to change color Header dynamically change
                    from below Theme Primary color picker
                  </div>
                </div>
                <div className="theme-colors">
                  <p className="switcher-style-head">Theme Primary:</p>
                  <div className="d-flex flex-wrap align-items-center switcher-style">
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary-1"
                        type="radio"
                        name="theme-primary"
                        id="switcher-primary"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary-2"
                        type="radio"
                        name="theme-primary"
                        id="switcher-primary1"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary-3"
                        type="radio"
                        name="theme-primary"
                        id="switcher-primary2"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary-4"
                        type="radio"
                        name="theme-primary"
                        id="switcher-primary3"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-primary-5"
                        type="radio"
                        name="theme-primary"
                        id="switcher-primary4"
                      />
                    </div>
                    <div className="form-check switch-select ps-0 mt-1 color-primary-light">
                      <div className="theme-container-primary" />
                      <div className="pickr-container-primary" />
                    </div>
                  </div>
                </div>
                <div className="theme-colors">
                  <p className="switcher-style-head">Theme Background:</p>
                  <div className="d-flex flex-wrap align-items-center switcher-style">
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-bg-1"
                        type="radio"
                        name="theme-background"
                        id="switcher-background"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-bg-2"
                        type="radio"
                        name="theme-background"
                        id="switcher-background1"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-bg-3"
                        type="radio"
                        name="theme-background"
                        id="switcher-background2"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-bg-4"
                        type="radio"
                        name="theme-background"
                        id="switcher-background3"
                      />
                    </div>
                    <div className="form-check switch-select me-3">
                      <input
                        className="form-check-input color-input color-bg-5"
                        type="radio"
                        name="theme-background"
                        id="switcher-background4"
                      />
                    </div>
                    <div className="form-check switch-select ps-0 mt-1 tooltip-static-demo color-bg-transparent">
                      <div className="theme-container-background" />
                      <div className="pickr-container-background" />
                    </div>
                  </div>
                </div>
                <div className="menu-image mb-3">
                  <p className="switcher-style-head">
                    Menu With Background Image:
                  </p>
                  <div className="d-flex flex-wrap align-items-center switcher-style">
                    <div className="form-check switch-select m-2">
                      <input
                        className="form-check-input bgimage-input bg-img1"
                        type="radio"
                        name="theme-background"
                        id="switcher-bg-img"
                      />
                    </div>
                    <div className="form-check switch-select m-2">
                      <input
                        className="form-check-input bgimage-input bg-img2"
                        type="radio"
                        name="theme-background"
                        id="switcher-bg-img1"
                      />
                    </div>
                    <div className="form-check switch-select m-2">
                      <input
                        className="form-check-input bgimage-input bg-img3"
                        type="radio"
                        name="theme-background"
                        id="switcher-bg-img2"
                      />
                    </div>
                    <div className="form-check switch-select m-2">
                      <input
                        className="form-check-input bgimage-input bg-img4"
                        type="radio"
                        name="theme-background"
                        id="switcher-bg-img3"
                      />
                    </div>
                    <div className="form-check switch-select m-2">
                      <input
                        className="form-check-input bgimage-input bg-img5"
                        type="radio"
                        name="theme-background"
                        id="switcher-bg-img4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="d-grid canvas-footer">
              <a
                href="#;"
                id="reset-all"
                className="btn btn-danger btn-block m-1"
              >
                Reset
              </a>
            </div>
          </div>
        </div>
      </div>

      <div id="loader">
        <img src="assets/images/media/loader.svg" alt="" />
      </div>

      <header className="app-header">
        {/* Start::main-header-container */}
        <div className="main-header-container container-fluid">
          {/* Start::header-content-left */}
          <div className="header-content-left align-items-center">
            {/* Start::header-element */}
            <div className="header-element">
              <div className="horizontal-logo">
                <a href="index.html" className="header-logo">
                  <img
                    src="../assets/images/brand-logos/desktop-logo.png"
                    alt="logo"
                    className="desktop-logo"
                  />
                  <img
                    src="../assets/images/brand-logos/toggle-logo.png"
                    alt="logo"
                    className="toggle-logo"
                  />
                  <img
                    src="../assets/images/brand-logos/desktop-dark.png"
                    alt="logo"
                    className="desktop-dark"
                  />
                  <img
                    src="../assets/images/brand-logos/toggle-dark.png"
                    alt="logo"
                    className="toggle-dark"
                  />
                  <img
                    src="../assets/images/brand-logos/desktop-white.png"
                    alt="logo"
                    className="desktop-white"
                  />
                  <img
                    src="../assets/images/brand-logos/toggle-white.png"
                    alt="logo"
                    className="toggle-white"
                  />
                </a>
              </div>
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element">
              {/* Start::header-link */}
              <a
                aria-label="Hide Sidebar"
                className="sidemenu-toggle header-link animated-arrow hor-toggle horizontal-navtoggle"
                data-bs-toggle="sidebar"
                href="#;"
              >
                <span />
              </a>
              {/* End::header-link */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="main-header-center ms-3 d-sm-none d-md-none d-lg-block form-group">
              <input
                className="form-control"
                placeholder="Search..."
                type="search"
              />
              <button className="btn">
                <i className="fas fa-search" />
              </button>
            </div>
            {/* End::header-element */}
          </div>
          {/* End::header-content-left */}
          {/* Start::header-content-right */}
          <div className="header-content-right">
            {/* Start::header-element */}
            <div className="header-element header-search d-block d-sm-none">
              {/* Start::header-link */}
              <a
                href="#;"
                className="header-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </a>
              <ul
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                data-popper-placement="none"
              >
                <li>
                  <span className="dropdown-item d-flex align-items-center">
                    <span className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search..."
                        aria-label="Search input"
                        aria-describedby="button-addon2"
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        id="button-addon2"
                      >
                        Search
                      </button>
                      {/* <a href="#" id="button-addon2" class="btn btn-primary">Search</a> */}
                    </span>
                  </span>
                </li>
              </ul>
              {/* End::header-link */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element country-selector">
              {/* Start::header-link|dropdown-toggle */}
              <a
                href="#;"
                className="header-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <img
                  src="../assets/images/flags/us_flag.jpg"
                  alt="img"
                  className="rounded-circle"
                />
              </a>
              {/* End::header-link|dropdown-toggle */}
              <ul
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                data-popper-placement="none"
              >
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img src="../assets/images/flags/us_flag.jpg" alt="img" />
                    </span>
                    English
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src="../assets/images/flags/spain_flag.jpg"
                        alt="img"
                      />
                    </span>
                    Spanish
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src="../assets/images/flags/french_flag.jpg"
                        alt="img"
                      />
                    </span>
                    French
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src="../assets/images/flags/germany_flag.jpg"
                        alt="img"
                      />
                    </span>
                    German
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src="../assets/images/flags/italy_flag.jpg"
                        alt="img"
                      />
                    </span>
                    Italian
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex align-items-center"
                    href="#;"
                  >
                    <span className="avatar avatar-xs lh-1 me-2">
                      <img
                        src="../assets/images/flags/russia_flag.jpg"
                        alt="img"
                      />
                    </span>
                    Russian
                  </a>
                </li>
              </ul>
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element header-theme-mode">
              {/* Start::header-link|layout-setting */}
              <a href="#;" className="header-link layout-setting">
                <span className="light-layout">
                  {/* Start::header-link-icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="header-link-icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.742 13.045a8.088 8.088 0 0 1-2.077.271c-2.135 0-4.14-.83-5.646-2.336a8.025 8.025 0 0 1-2.064-7.723A1 1 0 0 0 9.73 2.034a10.014 10.014 0 0 0-4.489 2.582c-3.898 3.898-3.898 10.243 0 14.143a9.937 9.937 0 0 0 7.072 2.93 9.93 9.93 0 0 0 7.07-2.929 10.007 10.007 0 0 0 2.583-4.491 1.001 1.001 0 0 0-1.224-1.224zm-2.772 4.301a7.947 7.947 0 0 1-5.656 2.343 7.953 7.953 0 0 1-5.658-2.344c-3.118-3.119-3.118-8.195 0-11.314a7.923 7.923 0 0 1 2.06-1.483 10.027 10.027 0 0 0 2.89 7.848 9.972 9.972 0 0 0 7.848 2.891 8.036 8.036 0 0 1-1.484 2.059z" />
                  </svg>
                  {/* End::header-link-icon */}
                </span>
                <span className="dark-layout">
                  {/* Start::header-link-icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="header-link-icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6.993 12c0 2.761 2.246 5.007 5.007 5.007s5.007-2.246 5.007-5.007S14.761 6.993 12 6.993 6.993 9.239 6.993 12zM12 8.993c1.658 0 3.007 1.349 3.007 3.007S13.658 15.007 12 15.007 8.993 13.658 8.993 12 10.342 8.993 12 8.993zM10.998 19h2v3h-2zm0-17h2v3h-2zm-9 9h3v2h-3zm17 0h3v2h-3zM4.219 18.363l2.12-2.122 1.415 1.414-2.12 2.122zM16.24 6.344l2.122-2.122 1.414 1.414-2.122 2.122zM6.342 7.759 4.22 5.637l1.415-1.414 2.12 2.122zm13.434 10.605-1.414 1.414-2.122-2.122 1.414-1.414z" />
                  </svg>
                  {/* End::header-link-icon */}
                </span>
              </a>
              {/* End::header-link|layout-setting */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element cart-dropdown">
              {/* Start::header-link|dropdown-toggle */}
              <a
                href="#;"
                className="header-link dropdown-toggle"
                data-bs-auto-close="outside"
                data-bs-toggle="dropdown"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M21.822 7.431A1 1 0 0 0 21 7H7.333L6.179 4.23A1.994 1.994 0 0 0 4.333 3H2v2h2.333l4.744 11.385A1 1 0 0 0 10 17h8c.417 0 .79-.259.937-.648l3-8a1 1 0 0 0-.115-.921zM17.307 15h-6.64l-2.5-6h11.39l-2.25 6z" />
                  <circle cx="10.5" cy="19.5" r="1.5" />
                  <circle cx="17.5" cy="19.5" r="1.5" />
                </svg>
                <span
                  className="badge bg-warning rounded-pill header-icon-badge"
                  id="cart-icon-badge"
                >
                  5
                </span>
              </a>
              {/* End::header-link|dropdown-toggle */}
              {/* Start::main-header-dropdown */}
              <div
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                data-popper-placement="none"
              >
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-15 fw-semibold">Shopping Cart</p>
                    <span className="badge bg-indigo" id="cart-data">
                      Items (5)
                    </span>
                  </div>
                </div>
                <div>
                  <hr className="dropdown-divider" />
                </div>
                <ul
                  className="list-unstyled mb-0"
                  id="header-cart-items-scroll"
                >
                  <li className="dropdown-item">
                    <div className="d-flex align-items-start cart-dropdown-item">
                      <img
                        src="../assets/images/ecommerce/19.jpg"
                        alt="img"
                        className="avatar avatar-rounded br-5 me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                          <div className="mb-0">
                            <a
                              className="text-muted fs-13"
                              href="product-cart.html"
                            >
                              Lence Camera
                            </a>
                            <div className="fw-semibold text-dark fs-12">
                              1* $189.00
                            </div>
                          </div>
                          <div>
                            <a
                              href="#;"
                              className="header-cart-remove float-end dropdown-item-close me-2"
                            >
                              <i className="fe fe-trash-2 text-danger" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <div className="d-flex align-items-start cart-dropdown-item">
                      <img
                        src="../assets/images/ecommerce/16.jpg"
                        alt="img"
                        className="avatar avatar-rounded br-5 me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                          <div className="mb-0">
                            <a
                              className="text-muted fs-13"
                              href="product-cart.html"
                            >
                              White Earbuds
                            </a>
                            <div className="fw-semibold text-dark fs-12">
                              3* $59.00
                            </div>
                          </div>
                          <div>
                            <a
                              href="#;"
                              className="header-cart-remove float-end dropdown-item-close me-2"
                            >
                              <i className="fe fe-trash-2 text-danger" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <div className="d-flex align-items-start cart-dropdown-item">
                      <img
                        src="../assets/images/ecommerce/12.jpg"
                        alt="img"
                        className="avatar avatar-rounded br-5 me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                          <div className="mb-0">
                            <a
                              className="text-muted fs-13"
                              href="product-cart.html"
                            >
                              Branded Black Headeset
                            </a>
                            <div className="fw-semibold text-dark fs-12">
                              2* $39.99
                            </div>
                          </div>
                          <div>
                            <a
                              href="#;"
                              className="header-cart-remove float-end dropdown-item-close me-2"
                            >
                              <i className="fe fe-trash-2 text-danger" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <div className="d-flex align-items-start cart-dropdown-item">
                      <img
                        src="../assets/images/ecommerce/6.jpg"
                        alt="img"
                        className="avatar avatar-rounded br-5 me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                          <div className="mb-0">
                            <a
                              className="text-muted fs-13"
                              href="product-cart.html"
                            >
                              Glass Decor Item
                            </a>
                            <div className="fw-semibold text-dark fs-12">
                              5* $5.99
                            </div>
                          </div>
                          <div>
                            <a
                              href="#;"
                              className="header-cart-remove float-end dropdown-item-close me-2"
                            >
                              <i className="fe fe-trash-2 text-danger" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item">
                    <div className="d-flex align-items-start cart-dropdown-item">
                      <img
                        src="../assets/images/ecommerce/4.jpg"
                        alt="img"
                        className="avatar avatar-rounded br-5 me-3"
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between mb-0">
                          <div className="mb-0">
                            <a
                              className="text-muted fs-13"
                              href="product-cart.html"
                            >
                              Pink Teddy Bear
                            </a>
                            <div className="fw-semibold text-dark fs-12">
                              1* $10.00
                            </div>
                          </div>
                          <div>
                            <a
                              href="#;"
                              className="header-cart-remove float-end dropdown-item-close me-2"
                            >
                              <i className="fe fe-trash-2 text-danger" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="p-2 bg-primary-transparent d-flex justify-content-between align-items-center empty-header-item border-top">
                  <div className="">
                    <a
                      href="check-out.html"
                      className="btn btn-sm btn-primary btn-w-xs"
                    >
                      checkout
                    </a>
                  </div>
                  <div>
                    <span className="text-dark fw-semibold">
                      Sub Total : $ 485.93
                    </span>
                  </div>
                </div>
                <div className="p-5 empty-item d-none">
                  <div className="text-center">
                    <span className="avatar avatar-xl avatar-rounded bg-warning-transparent">
                      <i className="ri-shopping-cart-2-line fs-2" />
                    </span>
                    <h6 className="fw-bold mb-1 mt-3">Your Cart is Empty</h6>
                    <span className="mb-3 fw-normal fs-13 d-block">
                      Add some items to make me happy :)
                    </span>
                    <a
                      href="shop.html"
                      className="btn btn-primary btn-wave btn-sm m-1"
                      data-abc="true"
                    >
                      continue shopping <i className="bi bi-arrow-right ms-1" />
                    </a>
                  </div>
                </div>
              </div>
              {/* End::main-header-dropdown */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element notifications-dropdown">
              {/* Start::header-link|dropdown-toggle */}
              <a
                href="#;"
                className="header-link dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                id="messageDropdown"
                aria-expanded="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M19 13.586V10c0-3.217-2.185-5.927-5.145-6.742C13.562 2.52 12.846 2 12 2s-1.562.52-1.855 1.258C7.185 4.074 5 6.783 5 10v3.586l-1.707 1.707A.996.996 0 0 0 3 16v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a.996.996 0 0 0-.293-.707L19 13.586zM19 17H5v-.586l1.707-1.707A.996.996 0 0 0 7 14v-4c0-2.757 2.243-5 5-5s5 2.243 5 5v4c0 .266.105.52.293.707L19 16.414V17zm-7 5a2.98 2.98 0 0 0 2.818-2H9.182A2.98 2.98 0 0 0 12 22z" />
                </svg>
                <span
                  className="badge bg-secondary rounded-pill header-icon-badge pulse pulse-secondary"
                  id="notification-icon-badge"
                >
                  6
                </span>
              </a>
              {/* End::header-link|dropdown-toggle */}
              {/* Start::main-header-dropdown */}
              <div
                className="main-header-dropdown dropdown-menu dropdown-menu-end"
                data-popper-placement="none"
              >
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-17 fw-semibold">Notifications</p>
                    <span
                      className="badge bg-secondary-transparent"
                      id="notifiation-data"
                    >
                      6 Unread
                    </span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <ul
                  className="list-unstyled mb-0"
                  id="header-notification-scroll"
                >
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-pink rounded-3">
                          <i className="far fa-folder-open text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">New Files available</a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            10 hours ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-purple rounded-3">
                          <i className="fab fa-delicious text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">Updates available</a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            2 days ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-success rounded-3">
                          <i className="fa fa-cart-plus text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">New order received</a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            1 hour ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-warning rounded-3">
                          <i className="far fa-envelope-open text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">New review received </a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            1 day ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-danger rounded-3">
                          <i className="fab fa-wpforms text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">
                              22 verified registrations{" "}
                            </a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            2 hours ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="dropdown-item p-3">
                    <div className="d-flex align-items-start">
                      <div className="pe-3">
                        <span className="avatar bg-success rounded-3">
                          <i className="far fa-check-square text-fixed-white fs-18" />
                        </span>
                      </div>
                      <div className="flex-grow-1 d-flex align-items-center justify-content-between">
                        <div>
                          <p className="mb-0 fw-semibold">
                            <a href="notification.html">Project approved </a>
                          </p>
                          <span className="text-muted fw-normal fs-12 header-notification-text">
                            4 hours ago
                          </span>
                        </div>
                        <div>
                          <a
                            href="#;"
                            className="min-w-fit-content text-muted me-1 dropdown-item-close1"
                          >
                            <i className="ti ti-x fs-16" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="p-2 empty-header-item1 border-top">
                  <div className="d-grid">
                    <a
                      href="notification.html"
                      className="btn btn-primary btn-sm"
                    >
                      View All
                    </a>
                  </div>
                </div>
                <div className="p-5 empty-item1 d-none">
                  <div className="text-center">
                    <span className="avatar avatar-xl avatar-rounded bg-secondary-transparent">
                      <i className="ri-notification-off-line fs-2" />
                    </span>
                    <h6 className="fw-semibold mt-3">No New Notifications</h6>
                  </div>
                </div>
              </div>
              {/* End::main-header-dropdown */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element header-shortcuts-dropdown d-md-block d-none">
              {/* Start::header-link|dropdown-toggle */}
              <a
                href="#;"
                className="header-link dropdown-toggle"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                id="notificationDropdown"
                aria-expanded="false"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  fill="#000000"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
                </svg>
              </a>
              {/* End::header-link|dropdown-toggle */}
              {/* Start::main-header-dropdown */}
              <div
                className="main-header-dropdown header-shortcuts-dropdown dropdown-menu pb-0 dropdown-menu-end"
                aria-labelledby="notificationDropdown"
              >
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="mb-0 fs-17 fw-semibold">Related Apps</p>
                  </div>
                </div>
                <div className="dropdown-divider mb-0" />
                <div
                  className="main-header-shortcuts p-2"
                  id="header-shortcut-scroll"
                >
                  <div className="row g-2">
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img src="../assets/images/apps/figma.png" alt="" />
                          </span>
                          <span className="d-block fs-12">Figma</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/microsoft-powerpoint.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Power Point</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/microsoft-word.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">MS Word</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/calender.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Calendar</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/sketch.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Sketch</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/google-docs.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Docs</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/google.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Google</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/translate.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Translate</span>
                        </div>
                      </a>
                    </div>
                    <div className="col-4">
                      <a href="#;">
                        <div className="text-center p-3 related-app">
                          <span className="avatar avatar-sm avatar-rounded">
                            <img
                              src="../assets/images/apps/google-sheets.png"
                              alt=""
                            />
                          </span>
                          <span className="d-block fs-12">Sheets</span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                <div className="p-3 border-top">
                  <div className="d-grid">
                    <a href="#;" className="btn btn-primary">
                      View All
                    </a>
                  </div>
                </div>
              </div>
              {/* End::main-header-dropdown */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element header-fullscreen">
              {/* Start::header-link */}
              <a onClick={openFullscreen} href="#" className="header-link">
                <i className="bx bx-fullscreen full-screen-open header-link-icon" />
                <i className="bx bx-exit-fullscreen full-screen-close header-link-icon d-none" />
              </a>
              {/* End::header-link */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element d-md-block d-none">
              {/* Start::header-link|switcher-icon */}
              <a
                href="#"
                className="header-link"
                data-bs-toggle="offcanvas"
                data-bs-target="#switcher-canvas"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z" />
                </svg>
              </a>
              {/* End::header-link|switcher-icon */}
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element">
              {/* Start::header-link|dropdown-toggle */}
              <a
                href="#"
                className="header-link dropdown-toggle"
                id="mainHeaderProfile"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                <div className="d-flex align-items-center">
                  <div className="me-sm-2 me-0">
                    <img
                      src="../assets/images/faces/2.jpg"
                      alt="img"
                      width={32}
                      height={32}
                      className="rounded-circle"
                    />
                  </div>
                  <div className="d-xl-block d-none">
                    <p className="fw-semibold mb-0 lh-1">Ashton Cox</p>
                    <span className="op-7 fw-normal d-block fs-11">
                      Web Developer
                    </span>
                  </div>
                </div>
              </a>
              {/* End::header-link|dropdown-toggle */}
              <ul
                className="main-header-dropdown dropdown-menu pt-0 overflow-hidden header-profile-dropdown dropdown-menu-end"
                aria-labelledby="mainHeaderProfile"
              >
                <li>
                  <a
                    className="dropdown-item d-flex border-bottom"
                    href="profile.html"
                  >
                    <i className="far fa-user-circle fs-16 me-2 op-7" />
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex border-bottom"
                    href="chat.html"
                  >
                    <i className="far fa-smile fs-16 me-2 op-7" />
                    Chat
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex border-bottom"
                    href="mail.html"
                  >
                    <i className="far fa-envelope  fs-16 me-2 op-7" />
                    Inbox{" "}
                    <span className="badge bg-success-transparent ms-auto">
                      25
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex border-bottom border-block-end"
                    href="chat.html"
                  >
                    <i className="far fa-comment-dots fs-16 me-2 op-7" />
                    Messages
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item d-flex border-bottom"
                    href="mail-settings.html"
                  >
                    <i className="far fa-sun fs-16 me-2 op-7" />
                    Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item d-flex" href="signin.html">
                    <i className="far fa-arrow-alt-circle-left fs-16 me-2 op-7" />
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
            {/* End::header-element */}
            {/* Start::header-element */}
            <div className="header-element">
              {/* Start::header-link|switcher-icon */}
              <a
                href="#"
                className="header-link switcher-icon"
                data-bs-toggle="offcanvas"
                data-bs-target="#switcher-canvas"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="header-link-icon"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 16c2.206 0 4-1.794 4-4s-1.794-4-4-4-4 1.794-4 4 1.794 4 4 4zm0-6c1.084 0 2 .916 2 2s-.916 2-2 2-2-.916-2-2 .916-2 2-2z" />
                  <path d="m2.845 16.136 1 1.73c.531.917 1.809 1.261 2.73.73l.529-.306A8.1 8.1 0 0 0 9 19.402V20c0 1.103.897 2 2 2h2c1.103 0 2-.897 2-2v-.598a8.132 8.132 0 0 0 1.896-1.111l.529.306c.923.53 2.198.188 2.731-.731l.999-1.729a2.001 2.001 0 0 0-.731-2.732l-.505-.292a7.718 7.718 0 0 0 0-2.224l.505-.292a2.002 2.002 0 0 0 .731-2.732l-.999-1.729c-.531-.92-1.808-1.265-2.731-.732l-.529.306A8.1 8.1 0 0 0 15 4.598V4c0-1.103-.897-2-2-2h-2c-1.103 0-2 .897-2 2v.598a8.132 8.132 0 0 0-1.896 1.111l-.529-.306c-.924-.531-2.2-.187-2.731.732l-.999 1.729a2.001 2.001 0 0 0 .731 2.732l.505.292a7.683 7.683 0 0 0 0 2.223l-.505.292a2.003 2.003 0 0 0-.731 2.733zm3.326-2.758A5.703 5.703 0 0 1 6 12c0-.462.058-.926.17-1.378a.999.999 0 0 0-.47-1.108l-1.123-.65.998-1.729 1.145.662a.997.997 0 0 0 1.188-.142 6.071 6.071 0 0 1 2.384-1.399A1 1 0 0 0 11 5.3V4h2v1.3a1 1 0 0 0 .708.956 6.083 6.083 0 0 1 2.384 1.399.999.999 0 0 0 1.188.142l1.144-.661 1 1.729-1.124.649a1 1 0 0 0-.47 1.108c.112.452.17.916.17 1.378 0 .461-.058.925-.171 1.378a1 1 0 0 0 .471 1.108l1.123.649-.998 1.729-1.145-.661a.996.996 0 0 0-1.188.142 6.071 6.071 0 0 1-2.384 1.399A1 1 0 0 0 13 18.7l.002 1.3H11v-1.3a1 1 0 0 0-.708-.956 6.083 6.083 0 0 1-2.384-1.399.992.992 0 0 0-1.188-.141l-1.144.662-1-1.729 1.124-.651a1 1 0 0 0 .471-1.108z" />
                </svg>
              </a>
              {/* End::header-link|switcher-icon */}
            </div>
            {/* End::header-element */}
          </div>
          {/* End::header-content-right */}
        </div>
        {/* End::main-header-container */}
      </header>
      {/* /app-header */}
      {/* Start::app-sidebar */}
      <aside className="app-sidebar sticky" id="sidebar">
        {/* Start::main-sidebar-header */}
        <div className="main-sidebar-header">
          <a href="index.html" className="header-logo">
            <img
              src="../assets/images/brand-logos/desktop-logo.png"
              alt="logo"
              className="desktop-logo"
            />
            <img
              src="../assets/images/brand-logos/toggle-logo.png"
              alt="logo"
              className="toggle-logo"
            />
            <img
              src="../assets/images/brand-logos/desktop-dark.png"
              alt="logo"
              className="desktop-dark"
            />
            <img
              src="../assets/images/brand-logos/toggle-dark.png"
              alt="logo"
              className="toggle-dark"
            />
            <img
              src="../assets/images/brand-logos/desktop-white.png"
              alt="logo"
              className="desktop-white"
            />
            <img
              src="../assets/images/brand-logos/toggle-white.png"
              alt="logo"
              className="toggle-white"
            />
          </a>
        </div>
        {/* End::main-sidebar-header */}
        {/* Start::main-sidebar */}
        <div className="main-sidebar" id="sidebar-scroll">
          {/* Start::nav */}
          <nav className="main-menu-container nav nav-pills flex-column sub-open">
            <div className="slide-left" id="slide-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7b8191"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                {" "}
                <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z" />{" "}
              </svg>
            </div>
            <ul className="main-menu">
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">Main</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 0 0 .707-1.707l-9-9a.999.999 0 0 0-1.414 0l-9 9A1 1 0 0 0 3 13zm7 7v-5h4v5h-4zm2-15.586 6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z" />
                  </svg>
                  <span className="side-menu__label">Dashboards</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Dashboards</a>
                  </li>
                  <li className="slide">
                    <Link href="/" className="side-menu__item">
                      Dashboard-1
                    </Link>
                  </li>

                  <li className="slide">
                    <Link href="/page_2" className="side-menu__item">
                      Dashboard-2
                    </Link>
                  </li>
                  <li className="slide">
                    <Link href="page_3" className="side-menu__item">
                      Dashboard-3
                    </Link>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">WEB APPS</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11-6h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm-1 6h-4V5h4v4zm-9 4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6H5v-4h4v4zm8-6c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" />
                  </svg>
                  <span className="side-menu__label">Apps</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Apps</a>
                  </li>
                  <li className="slide">
                    <Link href="/full-calendar" className="side-menu__item">
                      Full Calendar
                    </Link>
                  </li>
                  <li className="slide">
                    <Link href="/contacks" className="side-menu__item">
                      Contacts
                    </Link>
                  </li>
                  <li className="slide">
                    <a href="gallery.html" className="side-menu__item">
                      Gallery
                    </a>
                  </li>
                  <li className="slide">
                    <a href="sweet_alerts.html" className="side-menu__item">
                      Sweet Alerts
                    </a>
                  </li>
                  <li className="slide">
                    <a href="notification.html" className="side-menu__item">
                      Notification
                    </a>
                  </li>
                  <li className="slide">
                    <a
                      href="widget-notification.html"
                      className="side-menu__item"
                    >
                      Widget-notification
                    </a>
                  </li>
                  <li className="slide">
                    <a href="treeview.html" className="side-menu__item">
                      Treeview
                    </a>
                  </li>
                  <li className="slide">
                    <a href="file-manager.html" className="side-menu__item">
                      File-manager
                    </a>
                  </li>
                  <li className="slide">
                    <a href="file-manager1.html" className="side-menu__item">
                      File-manager1
                    </a>
                  </li>
                  <li className="slide">
                    <a href="file-details.html" className="side-menu__item">
                      File-details
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 17V7c0-2.168-3.663-4-8-4S4 4.832 4 7v10c0 2.168 3.663 4 8 4s8-1.832 8-4zM12 5c3.691 0 5.931 1.507 6 1.994C17.931 7.493 15.691 9 12 9S6.069 7.493 6 7.006C6.069 6.507 8.309 5 12 5zM6 9.607C7.479 10.454 9.637 11 12 11s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2V9.607zM6 17v-2.393C7.479 15.454 9.637 16 12 16s4.521-.546 6-1.393v2.387c-.069.499-2.309 2.006-6 2.006s-5.931-1.507-6-2z" />
                  </svg>
                  <span className="side-menu__label">Elements</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Elements</a>
                  </li>
                  <li className="slide">
                    <a href="alerts.html" className="side-menu__item">
                      Alerts
                    </a>
                  </li>
                  <li className="slide">
                    <a href="breadcrumb.html" className="side-menu__item">
                      Breadcrumbs
                    </a>
                  </li>
                  <li className="slide">
                    <a href="buttongroup.html" className="side-menu__item">
                      Button Group
                    </a>
                  </li>
                  <li className="slide">
                    <a href="buttons.html" className="side-menu__item">
                      Buttons
                    </a>
                  </li>
                  <li className="slide">
                    <a href="badge.html" className="side-menu__item">
                      Badge
                    </a>
                  </li>
                  <li className="slide">
                    <a href="cards.html" className="side-menu__item">
                      Cards
                    </a>
                  </li>
                  <li className="slide">
                    <a href="dropdowns.html" className="side-menu__item">
                      Dropdowns
                    </a>
                  </li>
                  <li className="slide">
                    <a href="images_figures.html" className="side-menu__item">
                      Images &amp; Figures
                    </a>
                  </li>
                  <li className="slide">
                    <a href="listgroup.html" className="side-menu__item">
                      List Group
                    </a>
                  </li>
                  <li className="slide">
                    <a href="navs_tabs.html" className="side-menu__item">
                      Navs &amp; Tabs
                    </a>
                  </li>
                  <li className="slide">
                    <a href="object-fit.html" className="side-menu__item">
                      Media Object
                    </a>
                  </li>
                  <li className="slide">
                    <a href="pagination.html" className="side-menu__item">
                      Pagination
                    </a>
                  </li>
                  <li className="slide">
                    <a href="popovers.html" className="side-menu__item">
                      Popovers
                    </a>
                  </li>
                  <li className="slide">
                    <a href="progress.html" className="side-menu__item">
                      Progress
                    </a>
                  </li>
                  <li className="slide">
                    <a href="spinners.html" className="side-menu__item">
                      Spinners
                    </a>
                  </li>
                  <li className="slide">
                    <a href="tooltips.html" className="side-menu__item">
                      Tooltips
                    </a>
                  </li>
                  <li className="slide">
                    <a href="toasts.html" className="side-menu__item">
                      Toasts
                    </a>
                  </li>
                  <li className="slide">
                    <a href="tags.html" className="side-menu__item">
                      Tags
                    </a>
                  </li>
                  <li className="slide">
                    <a href="typography.html" className="side-menu__item">
                      Typography
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.995 6.9a.998.998 0 0 0-.548-.795l-8-4a1 1 0 0 0-.895 0l-8 4a1.002 1.002 0 0 0-.547.795c-.011.107-.961 10.767 8.589 15.014a.987.987 0 0 0 .812 0c9.55-4.247 8.6-14.906 8.589-15.014zM12 19.897C5.231 16.625 4.911 9.642 4.966 7.635L12 4.118l7.029 3.515c.037 1.989-.328 9.018-7.029 12.264z" />
                    <path d="m11 12.586-2.293-2.293-1.414 1.414L11 15.414l5.707-5.707-1.414-1.414z" />
                  </svg>
                  <span className="side-menu__label">Advanced UI</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Advanced UI</a>
                  </li>
                  <li className="slide">
                    <a
                      href="accordions_collpase.html"
                      className="side-menu__item"
                    >
                      Accordion &amp; Collapse
                    </a>
                  </li>
                  <li className="slide">
                    <a href="carousel.html" className="side-menu__item">
                      Carousel
                    </a>
                  </li>
                  <li className="slide">
                    <a href="draggable-cards.html" className="side-menu__item">
                      Draggablecards
                    </a>
                  </li>
                  <li className="slide">
                    <a href="modals_closes.html" className="side-menu__item">
                      Modals &amp; Closes
                    </a>
                  </li>
                  <li className="slide">
                    <a href="navbar.html" className="side-menu__item">
                      Navbar
                    </a>
                  </li>
                  <li className="slide">
                    <a href="offcanvas.html" className="side-menu__item">
                      Offcanvas
                    </a>
                  </li>
                  <li className="slide">
                    <a href="placeholders.html" className="side-menu__item">
                      Placeholders
                    </a>
                  </li>
                  <li className="slide">
                    <a href="ratings.html" className="side-menu__item">
                      Ratings
                    </a>
                  </li>
                  <li className="slide">
                    <a href="scrollspy.html" className="side-menu__item">
                      Scrollspy
                    </a>
                  </li>
                  <li className="slide">
                    <a href="swiperjs.html" className="side-menu__item">
                      Swiper Js
                    </a>
                  </li>
                  <li className="slide">
                    <a href="timeline.html" className="side-menu__item">
                      Timeline
                    </a>
                  </li>
                  <li className="slide">
                    <a href="search.html" className="side-menu__item">
                      Search
                    </a>
                  </li>
                  <li className="slide">
                    <a href="userlist.html" className="side-menu__item">
                      Userlist
                    </a>
                  </li>
                  <li className="slide">
                    <a href="blog.html" className="side-menu__item">
                      Blog
                    </a>
                  </li>
                  <li className="slide">
                    <a href="blog-details.html" className="side-menu__item">
                      Blog-details
                    </a>
                  </li>
                  <li className="slide">
                    <a href="edit-post.html" className="side-menu__item">
                      Edit-post
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">Pages</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 7.999a1 1 0 0 0-.516-.874l-9.022-5a1.003 1.003 0 0 0-.968 0l-8.978 4.96a1 1 0 0 0-.003 1.748l9.022 5.04a.995.995 0 0 0 .973.001l8.978-5A1 1 0 0 0 22 7.999zm-9.977 3.855L5.06 7.965l6.917-3.822 6.964 3.859-6.918 3.852z" />
                    <path d="M20.515 11.126 12 15.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" />
                    <path d="M20.515 15.126 12 19.856l-8.515-4.73-.971 1.748 9 5a1 1 0 0 0 .971 0l9-5-.97-1.748z" />
                  </svg>
                  <span className="side-menu__label">Pages</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Pages</a>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Authentication
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <Link href="/auth/login" className="side-menu__item">
                          Sign In
                        </Link>
                      </li>
                      <li className="slide">
                        <a href="signup.html" className="side-menu__item">
                          Sign Up
                        </a>
                      </li>
                      <li className="slide">
                        <a href="forgot.html" className="side-menu__item">
                          Forgot password
                        </a>
                      </li>
                      <li className="slide">
                        <a href="reset.html" className="side-menu__item">
                          Reset password
                        </a>
                      </li>
                      <li className="slide">
                        <a href="lockscreen.html" className="side-menu__item">
                          Lockscreen
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="underconstruction.html"
                          className="side-menu__item"
                        >
                          Underconstruction
                        </a>
                      </li>
                      <li className="slide">
                        <a href="404.html" className="side-menu__item">
                          404 Error
                        </a>
                      </li>
                      <li className="slide">
                        <a href="500.html" className="side-menu__item">
                          500 Error
                        </a>
                      </li>
                      <li className="slide">
                        <a href="501.html" className="side-menu__item">
                          501 Error
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Ecommerce
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a href="shop.html" className="side-menu__item">
                          Shop
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="product-details.html"
                          className="side-menu__item"
                        >
                          Product details
                        </a>
                      </li>
                      <li className="slide">
                        <a href="product-cart.html" className="side-menu__item">
                          Cart
                        </a>
                      </li>
                      <li className="slide">
                        <a href="check-out.html" className="side-menu__item">
                          Check-out
                        </a>
                      </li>
                      <li className="slide">
                        <a href="wish-list.html" className="side-menu__item">
                          Wishlist
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide">
                    <a href="profile.html" className="side-menu__item">
                      Profile
                    </a>
                  </li>
                  <li className="slide">
                    <a
                      href="profile-notifications.html"
                      className="side-menu__item"
                    >
                      Notification-list
                    </a>
                  </li>
                  <li className="slide">
                    <a href="aboutus.html" className="side-menu__item">
                      About us
                    </a>
                  </li>
                  <li className="slide">
                    <a href="settings.html" className="side-menu__item">
                      Settings
                    </a>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Mail
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a href="mail.html" className="side-menu__item">
                          Mail
                        </a>
                      </li>
                      <li className="slide">
                        <a href="mail-compose.html" className="side-menu__item">
                          Mail-compose
                        </a>
                      </li>
                      <li className="slide">
                        <a href="mail-read.html" className="side-menu__item">
                          Read-mail
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="mail-settings.html"
                          className="side-menu__item"
                        >
                          Mail-settings
                        </a>
                      </li>
                      <li className="slide">
                        <a href="chat.html" className="side-menu__item">
                          Chat
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide">
                    <a href="invoice.html" className="side-menu__item">
                      Invoice
                    </a>
                  </li>
                  <li className="slide">
                    <a href="pricing.html" className="side-menu__item">
                      Pricing
                    </a>
                  </li>
                  <li className="slide">
                    <a href="todotask.html" className="side-menu__item">
                      Todo Task
                    </a>
                  </li>
                  <li className="slide">
                    <a href="faq.html" className="side-menu__item">
                      Faqs
                    </a>
                  </li>
                  <li className="slide">
                    <a href="empty.html" className="side-menu__item">
                      Empty page
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22c4.879 0 9-4.121 9-9s-4.121-9-9-9-9 4.121-9 9 4.121 9 9 9zm0-16c3.794 0 7 3.206 7 7s-3.206 7-7 7-7-3.206-7-7 3.206-7 7-7zm5.284-2.293 1.412-1.416 3.01 3-1.413 1.417zM5.282 2.294 6.7 3.706l-2.99 3-1.417-1.413z" />
                    <path d="M11 9h2v5h-2zm0 6h2v2h-2z" />
                  </svg>
                  <span className="side-menu__label">Utilities</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Utilities</a>
                  </li>
                  <li className="slide">
                    <a href="avatars.html" className="side-menu__item">
                      Avatars
                    </a>
                  </li>
                  <li className="slide">
                    <a href="borders.html" className="side-menu__item">
                      Borders
                    </a>
                  </li>
                  <li className="slide">
                    <a href="breakpoints.html" className="side-menu__item">
                      Breakpoints
                    </a>
                  </li>
                  <li className="slide">
                    <a href="colors.html" className="side-menu__item">
                      Colors
                    </a>
                  </li>
                  <li className="slide">
                    <a href="columns.html" className="side-menu__item">
                      Columns
                    </a>
                  </li>
                  <li className="slide">
                    <a href="flex.html" className="side-menu__item">
                      Flex
                    </a>
                  </li>
                  <li className="slide">
                    <a href="gutters.html" className="side-menu__item">
                      Gutters
                    </a>
                  </li>
                  <li className="slide">
                    <a href="helpers.html" className="side-menu__item">
                      Helpers
                    </a>
                  </li>
                  <li className="slide">
                    <a href="position.html" className="side-menu__item">
                      Position
                    </a>
                  </li>
                  <li className="slide">
                    <a href="more.html" className="side-menu__item">
                      Additional Content
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">General</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide">
                <a href="icons.html" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 7h-1.209A4.92 4.92 0 0 0 19 5.5C19 3.57 17.43 2 15.5 2c-1.622 0-2.705 1.482-3.404 3.085C11.407 3.57 10.269 2 8.5 2 6.57 2 5 3.57 5 5.5c0 .596.079 1.089.209 1.5H4c-1.103 0-2 .897-2 2v2c0 1.103.897 2 2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c1.103 0 2-.897 2-2V9c0-1.103-.897-2-2-2zm-4.5-3c.827 0 1.5.673 1.5 1.5C17 7 16.374 7 16 7h-2.478c.511-1.576 1.253-3 1.978-3zM7 5.5C7 4.673 7.673 4 8.5 4c.888 0 1.714 1.525 2.198 3H8c-.374 0-1 0-1-1.5zM4 9h7v2H4V9zm2 11v-7h5v7H6zm12 0h-5v-7h5v7zm-5-9V9.085L13.017 9H20l.001 2H13z" />
                  </svg>
                  <span className="side-menu__label">Icons</span>
                </a>
              </li>
              {/* End::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 7h-4V4c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H4c-1.103 0-2 .897-2 2v9a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V9c0-1.103-.897-2-2-2zM4 11h4v8H4v-8zm6-1V4h4v15h-4v-9zm10 9h-4V9h4v10z" />
                  </svg>
                  <span className="side-menu__label">Charts</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Charts</a>
                  </li>{" "}
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Apex Charts
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a
                          href="apex-line-charts.html"
                          className="side-menu__item"
                        >
                          Line Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-area-charts.html"
                          className="side-menu__item"
                        >
                          Area Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-column-charts.html"
                          className="side-menu__item"
                        >
                          Column Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-bar-charts.html"
                          className="side-menu__item"
                        >
                          Bar Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-mixed-charts.html"
                          className="side-menu__item"
                        >
                          Mixed Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-rangearea-charts.html"
                          className="side-menu__item"
                        >
                          Rangearea Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-timeline-charts.html"
                          className="side-menu__item"
                        >
                          Timeline Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-candlestick-charts.html"
                          className="side-menu__item"
                        >
                          Candlestick Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-boxplot-charts.html"
                          className="side-menu__item"
                        >
                          Boxplot Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-bubble-charts.html"
                          className="side-menu__item"
                        >
                          Bubble Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-scatter-charts.html"
                          className="side-menu__item"
                        >
                          Scatter Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-heatmap-charts.html"
                          className="side-menu__item"
                        >
                          Heatmap Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-treemap-charts.html"
                          className="side-menu__item"
                        >
                          Treemap Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-pie-charts.html"
                          className="side-menu__item"
                        >
                          Pie Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-radialbar-charts.html"
                          className="side-menu__item"
                        >
                          Radialbar Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-radar-charts.html"
                          className="side-menu__item"
                        >
                          Radar Charts
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="apex-polararea-charts.html"
                          className="side-menu__item"
                        >
                          Polararea Charts
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide">
                    <a href="chartjs-charts.html" className="side-menu__item">
                      ChartJs Charts
                    </a>
                  </li>
                  <li className="slide">
                    <a href="echarts.html" className="side-menu__item">
                      Echart Charts
                    </a>
                  </li>
                </ul>
              </li>
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">Multi level</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                  </svg>
                  <span className="side-menu__label">Menu-levels</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Menu-levels</a>
                  </li>
                  <li className="slide">
                    <a href="#;" className="side-menu__item">
                      Level-1
                    </a>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Level-2
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a href="#;" className="side-menu__item">
                          Level-2-1
                        </a>
                      </li>
                      <li className="slide has-sub">
                        <a href="#;" className="side-menu__item">
                          Level-2-2
                          <i className="fe fe-chevron-right side-menu__angle" />
                        </a>
                        <ul className="slide-menu child3">
                          <li className="slide">
                            <a href="#;" className="side-menu__item">
                              Level-2-2-1
                            </a>
                          </li>
                          <li className="slide">
                            <a href="#;" className="side-menu__item">
                              Level-2-2-2
                            </a>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide__category */}
              <li className="slide__category">
                <span className="category-name">Components</span>
              </li>
              {/* End::slide__category */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.937 8.68c-.011-.032-.02-.063-.033-.094a.997.997 0 0 0-.196-.293l-6-6a.997.997 0 0 0-.293-.196c-.03-.014-.062-.022-.094-.033a.991.991 0 0 0-.259-.051C13.04 2.011 13.021 2 13 2H6c-1.103 0-2 .897-2 2v16c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2V9c0-.021-.011-.04-.013-.062a.99.99 0 0 0-.05-.258zM16.586 8H14V5.414L16.586 8zM6 20V4h6v5a1 1 0 0 0 1 1h5l.002 10H6z" />
                  </svg>
                  <span className="side-menu__label">Forms</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Forms</a>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Form Elements
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a href="form_inputs.html" className="side-menu__item">
                          Inputs
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_check_radios.html"
                          className="side-menu__item"
                        >
                          Check &amp; Radios
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_input_group.html"
                          className="side-menu__item"
                        >
                          Input Groups
                        </a>
                      </li>
                      <li className="slide">
                        <a href="form_select.html" className="side-menu__item">
                          Form Select
                        </a>
                      </li>
                      <li className="slide">
                        <a href="form_range.html" className="side-menu__item">
                          Rangeslider
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_input_masks.html"
                          className="side-menu__item"
                        >
                          Input Masks
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_file_uploads.html"
                          className="side-menu__item"
                        >
                          File Uploads
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_dateTime_pickers.html"
                          className="side-menu__item"
                        >
                          Date, Time Picker
                        </a>
                      </li>
                      <li className="slide">
                        <a
                          href="form_color_pickers.html"
                          className="side-menu__item"
                        >
                          Color Pickers
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide">
                    <a href="floating_labels.html" className="side-menu__item">
                      Floating Labels
                    </a>
                  </li>
                  <li className="slide">
                    <a href="form_layout.html" className="side-menu__item">
                      Form Layouts
                    </a>
                  </li>
                  <li className="slide has-sub">
                    <a href="#;" className="side-menu__item">
                      Form Editors
                      <i className="fe fe-chevron-right side-menu__angle" />
                    </a>
                    <ul className="slide-menu child2">
                      <li className="slide">
                        <a href="quill_editor.html" className="side-menu__item">
                          Quill Editor
                        </a>
                      </li>
                    </ul>
                  </li>
                  <li className="slide">
                    <a href="form_validation.html" className="side-menu__item">
                      Validation
                    </a>
                  </li>
                  <li className="slide">
                    <a href="form_select2.html" className="side-menu__item">
                      Select2
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 3H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zm0 2 .001 4H5V5h14zM5 11h8v8H5v-8zm10 8v-8h4.001l.001 8H15z" />
                  </svg>
                  <span className="side-menu__label">Tables</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Tables</a>
                  </li>
                  <li className="slide">
                    <a href="tables.html" className="side-menu__item">
                      Tables
                    </a>
                  </li>
                  <li className="slide">
                    <a href="grid-tables.html" className="side-menu__item">
                      Grid Js Tables
                    </a>
                  </li>
                  <li className="slide">
                    <a href="data-tables.html" className="side-menu__item">
                      Data Tables
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide">
                <a href="widgets.html" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11 4h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4zM17 3c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zM7 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" />
                  </svg>
                  <span className="side-menu__label">Widgets</span>
                </a>
              </li>
              {/* End::slide */}
              {/* Start::slide */}
              <li className="slide has-sub">
                <a href="#;" className="side-menu__item">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="side-menu__icon"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.002 9.63c-.023.411.207.794.581.966l7.504 3.442 3.442 7.503c.164.356.52.583.909.583l.057-.002a1 1 0 0 0 .894-.686l5.595-17.032c.117-.358.023-.753-.243-1.02s-.66-.358-1.02-.243L2.688 8.736a1 1 0 0 0-.686.894zm16.464-3.971-4.182 12.73-2.534-5.522a.998.998 0 0 0-.492-.492L5.734 9.841l12.732-4.182z" />
                  </svg>
                  <span className="side-menu__label">Maps</span>
                  <i className="fe fe-chevron-right side-menu__angle" />
                </a>
                <ul className="slide-menu child1">
                  <li className="slide side-menu__label1">
                    <a href="#">Maps</a>
                  </li>
                  <li className="slide">
                    <a href="google-maps.html" className="side-menu__item">
                      Google Maps
                    </a>
                  </li>
                  <li className="slide">
                    <a href="leaflet-maps.html" className="side-menu__item">
                      Leaflet Maps
                    </a>
                  </li>
                  <li className="slide">
                    <a href="vector-maps.html" className="side-menu__item">
                      Vector Maps
                    </a>
                  </li>
                </ul>
              </li>
              {/* End::slide */}
            </ul>
            <div className="slide-right" id="slide-right">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#7b8191"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                {" "}
                <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z" />{" "}
              </svg>
            </div>
          </nav>
          {/* End::nav */}
        </div>
        {/* End::main-sidebar */}
      </aside>
      {/* End::app-sidebar */}
      {/* Start::app-content */}
      {/* <div class="main-content app-content">
      <div class="container-fluid">
      </div>
  </div> */}
      {/* End::app-content */}
      {/* main-content */}
      <div className="main-content app-content">
        {/* container */}
        <div className="main-container container-fluid">
          {/* breadcrumb */}
          <div className="breadcrumb-header justify-content-between">
            <div className="left-content">
              <span className="main-content-title mg-b-0 mg-b-lg-1">
                DASHBOARD
              </span>
            </div>
            <div className="justify-content-center mt-2">
              <ol className="breadcrumb">
                <li className="breadcrumb-item fs-15">
                  <a href="#;">Dashboard</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Sales
                </li>
              </ol>
            </div>
          </div>
          {/* /breadcrumb */}
          {/* row */}
          <div className="row">
            <div className="col-xxl-5 col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="row">
                <div className="col-xl-12 col-lg-12 col-md-12 col-xs-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-xl-9 col-lg-7 col-md-6 col-sm-12 mb-sm-0 mb-4">
                          <div className="text-justified align-items-center">
                            <h3 className="text-dark fw-semibold mb-2 mt-0">
                              Hi, Welcome Back{" "}
                              <span className="text-primary">Nick!</span>
                            </h3>
                            <p className="text-dark fs-14 mb-3 lh-3">
                              {" "}
                              You have used the 85% of free plan storage. Please
                              upgrade your plan to get unlimited storage.
                            </p>
                            <button className="btn btn-primary shadow">
                              Upgrade Now
                            </button>
                          </div>
                        </div>
                        <div className="col-xl-3 col-lg-5 col-md-6 col-sm-12 d-flex align-items-center justify-content-center upgrade-chart-circle">
                          <div className="chart-circle" data-color="">
                            <div id="radialbar-basic1"></div>
                            <div className="chart-circle-value circle-style">
                              <div className="fs-18 fw-semibold">85%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-xs-12">
                  <div className="card sales-card">
                    <div className="row">
                      <div className="col-8">
                        <div className="ps-4 pt-4 pe-3 pb-4">
                          <div className="">
                            <span className="mb-2 fs-12 fw-semibold d-block">
                              Today Orders
                            </span>
                          </div>
                          <div className="pb-0 mt-0">
                            <div className="d-flex">
                              <h4 className="fs-20 fw-semibold mb-2">5,472</h4>
                            </div>
                            <p className="mb-0 fs-12 text-muted">
                              Last week
                              <i className="bx bx-caret-up mx-2 text-success" />
                              <span className="text-success fw-semibold">
                                {" "}
                                +427
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="circle-icon bg-primary-transparent text-center align-self-center overflow-hidden">
                          <i className="fe fe-shopping-bag fs-16 text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-xs-12">
                  <div className="card sales-card">
                    <div className="row">
                      <div className="col-8">
                        <div className="ps-4 pt-4 pe-3 pb-4">
                          <div className="">
                            <span className="mb-2 fs-12 fw-semibold d-block">
                              Today Earnings
                            </span>
                          </div>
                          <div className="pb-0 mt-0">
                            <div className="d-flex">
                              <h4 className="fs-20 fw-semibold mb-2">$7,589</h4>
                            </div>
                            <p className="mb-0 fs-12 text-muted">
                              Last week
                              <i className="bx bx-caret-down mx-2 text-danger" />
                              <span className="fw-semibold text-danger">
                                {" "}
                                -453
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                          <i className="fe fe-dollar-sign fs-16 text-info" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-xs-12">
                  <div className="card sales-card">
                    <div className="row">
                      <div className="col-8">
                        <div className="ps-4 pt-4 pe-3 pb-4">
                          <div className="">
                            <span className="mb-2 fs-12 fw-semibold d-block">
                              Profit Gain
                            </span>
                          </div>
                          <div className="pb-0 mt-0">
                            <div className="d-flex">
                              <h4 className="fs-20 fw-semibold mb-2">$8,943</h4>
                            </div>
                            <p className="mb-0 fs-12 text-muted">
                              Last week
                              <i className="bx bx-caret-up mx-2 text-success" />
                              <span className=" text-success fw-semibold">
                                {" "}
                                +788
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="circle-icon bg-secondary-transparent text-center align-self-center overflow-hidden">
                          <i className="fe fe-external-link fs-16 text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-6 col-lg-6 col-md-6 col-xs-12">
                  <div className="card sales-card">
                    <div className="row">
                      <div className="col-8">
                        <div className="ps-4 pt-4 pe-3 pb-4">
                          <div className="">
                            <span className="mb-2 fs-12 fw-semibold d-block">
                              Total Earnings
                            </span>
                          </div>
                          <div className="pb-0 mt-0">
                            <div className="d-flex">
                              <h4 className="fs-20 fw-semibold mb-2">$57.2M</h4>
                            </div>
                            <p className="mb-0 fs-12  text-muted">
                              Last week
                              <i className="bx bx-caret-down mx-2 text-danger" />
                              <span className="text-danger fw-semibold">
                                {" "}
                                -693
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="circle-icon bg-warning-transparent text-center align-self-center overflow-hidden">
                          <i className="fe fe-credit-card fs-16 text-warning" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-xl-12 col-lg-12 col-md-12 col-xs-12">
                  <div className="card">
                    <div className="card-header pb-1">
                      <h3 className="card-title mb-2">Browser Usage</h3>
                    </div>
                    <div className="card-body p-0">
                      <div className="browser-stats">
                        <div className="d-flex align-items-center item  border-bottom my-2">
                          <div className="d-flex">
                            <img
                              src="../assets/images/svgicons/chrome.svg"
                              alt="img"
                              className="ht-30 wd-30 me-2"
                            />
                            <div className="truncate">
                              <h6 className="">Chrome</h6>
                              <span className="text-muted fs-12">
                                Google, Inc.
                              </span>
                            </div>
                          </div>
                          <div className="ms-auto my-auto">
                            <div className="d-flex">
                              <span className="me-4 mt-1 fw-semibold fs-16">
                                35,502
                              </span>
                              <span className="text-success fs-13 my-auto">
                                <i className="fe fe-trending-up text-success mx-2 my-auto" />
                                12.75%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center item  border-bottom my-2">
                          <div className="d-flex">
                            <img
                              src="../assets/images/svgicons/edge.svg"
                              alt="img"
                              className="ht-30 wd-30 me-2"
                            />
                            <div className="truncate">
                              <h6 className="">Edge</h6>
                              <span className="text-muted fs-12">
                                Microsoft Corporation, Inc.
                              </span>
                            </div>
                          </div>
                          <div className="ms-auto my-auto">
                            <div className="d-flex">
                              <span className="me-4 mt-1 fw-semibold fs-16">
                                25,364
                              </span>
                              <span className="text-success">
                                <i className="fe fe-trending-down text-danger mx-2 my-auto" />
                                24.37%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center item  border-bottom my-2">
                          <div className="d-flex">
                            <img
                              src="../assets/images/svgicons/firefox.svg"
                              alt="img"
                              className="ht-30 wd-30 me-2"
                            />
                            <div className="truncate">
                              <h6 className="">Firefox</h6>
                              <span className="text-muted fs-12">
                                Mozilla Foundation, Inc.
                              </span>
                            </div>
                          </div>
                          <div className="ms-auto my-auto">
                            <div className="d-flex">
                              <span className="me-4 mt-1 fw-semibold fs-16">
                                14,635
                              </span>
                              <span className="text-success">
                                <i className="fe fe-trending-up text-success mx-2 my-auto" />
                                15,63%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center item  border-bottom my-2">
                          <div className="d-flex">
                            <img
                              src="../assets/images/svgicons/safari.svg"
                              alt="img"
                              className="ht-30 wd-30 me-2"
                            />
                            <div className="truncate">
                              <h6 className="">Safari</h6>
                              <span className="text-muted fs-12">
                                Apple Corporation, Inc.
                              </span>
                            </div>
                          </div>
                          <div className="ms-auto my-auto">
                            <div className="d-flex">
                              <span className="me-4 mt-1 fw-semibold fs-16">
                                35,657
                              </span>
                              <span className="text-danger">
                                <i className="fe fe-trending-up text-success mx-2 my-auto" />
                                12.54%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center item my-2 pb-3">
                          <div className="d-flex">
                            <img
                              src="../assets/images/svgicons/opera.svg"
                              alt="img"
                              className="ht-30 wd-30 me-2"
                            />
                            <div className="truncate">
                              <h6 className="">Opera</h6>
                              <span className="text-muted fs-12">
                                Opera, Inc.
                              </span>
                            </div>
                          </div>
                          <div className="ms-auto my-auto">
                            <div className="d-flex">
                              <span className="me-4 mt-1 fw-semibold fs-16">
                                12,563
                              </span>
                              <span className="text-danger">
                                <i className="fe fe-trending-down text-danger mx-2 my-auto" />
                                15.12%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-7 col-xl-12 col-lg-12 col-md-12 col-sm-12">
              <div className="card custom-card overflow-hidden">
                <div className="card-header border-bottom-0">
                  <div>
                    <h3 className="card-title mb-2 ">Project Budget</h3>{" "}
                    <span className="d-block fs-12 mb-0 text-muted" />
                  </div>
                </div>
                <div className="card-body">
                  <div id="statistics1" />
                </div>
              </div>
              <div className="row">
                <div className="col-sm-12 col-lg-12 col-xl-6">
                  <div className="card overflow-hidden">
                    <div className="card-header pb-1">
                      <h3 className="card-title mb-2">Recent Customers</h3>
                    </div>
                    <div className="card-body p-0 customers mt-1">
                      <div className="list-group list-lg-group list-group-flush">
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/2.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-0">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Samantha Melon
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1234
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p fs-14">
                                    <span className="float-end badge bg-success-transparent">
                                      <span className="op-7 text-success fw-semibold">
                                        paid{" "}
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/1.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-1">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Allie Grater
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1234
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p fs-14">
                                    <span className="float-end badge bg-danger-transparent ">
                                      <span className="op-7 text-danger fw-semibold">
                                        Pending
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/5.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-1">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Gabe Lackmen
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1234
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p  fs-14">
                                    <span className="float-end badge bg-danger-transparent ">
                                      <span className="op-7 text-danger fw-semibold">
                                        Pending
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/7.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-1">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Manuel Labor
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1234
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p fs-14">
                                    <span className="float-end badge bg-success-transparent ">
                                      <span className="op-7 text-success fw-semibold">
                                        Paid
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/9.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-1">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Hercules Bing
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1754
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p fs-14">
                                    <span className="float-end badge bg-success-transparent ">
                                      <span className="op-7 text-success fw-semibold">
                                        Paid
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                        <a href="#;" className="border-0">
                          <div className="list-group-item list-group-item-action p-3 border-0">
                            <div className="media mt-0">
                              <img
                                className="avatar-lg rounded-circle me-3 my-auto shadow"
                                src="../assets/images/faces/11.jpg"
                                alt="Image description"
                              />
                              <div className="media-body flex-fill">
                                <div className="d-flex align-items-center">
                                  <div className="mt-1">
                                    <h5 className="mb-1 fs-13 font-weight-sembold text-dark">
                                      Manuel Labor
                                    </h5>
                                    <p className="mb-0 fs-12 text-muted">
                                      User ID: #1234
                                    </p>
                                  </div>
                                  <span className="ms-auto wd-45p fs-14">
                                    <span className="float-end badge bg-danger-transparent ">
                                      <span className="op-7 text-danger fw-semibold">
                                        Pending
                                      </span>
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12 col-xl-6">
                  <div className="card">
                    <div className="card-header pb-3">
                      <h3 className="card-title mb-2">MAIN TASKS</h3>
                    </div>
                    <div className="card-body p-0 customers mt-1">
                      <div className="">
                        <label className="p-2 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked1"
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            accurate information at any given point.
                          </span>
                          <span className="ms-auto">
                            <span className="badge bg-primary-transparent fw-semibold px-2 py-1 fs-11 me-2">
                              Today
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked01"
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            sharing the information with clients or
                            stakeholders.
                          </span>
                          <span className="ms-auto">
                            <span className="badge bg-primary-transparent fw-semibold px-2 py-1 fs-11 me-2">
                              Today
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked2"
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            Hearing the information and responding .
                          </span>
                          <span className="ms-auto">
                            <span className="badge bg-primary-transparent fw-semibold px-2 py-1 fs-11 me-2 float-end">
                              22 hrs
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked3"
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            Setting up and customizing your own sales.
                          </span>
                          <span className="ms-auto">
                            {" "}
                            <span className="badge bg-light-transparent fw-semibold px-2 py-1 fs-11 me-2">
                              1 Day
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked05"
                              defaultChecked=""
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            To have a complete 360° overview of sales
                            information, having.
                          </span>
                          <span className="ms-auto">
                            {" "}
                            <span className="badge bg-light-transparent fw-semibold px-2 py-1 fs-11 me-2">
                              2 Days
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked07"
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            sharing the information with clients or
                            stakeholders.
                          </span>
                          <span className="ms-auto">
                            <span className="badge bg-primary-transparent fw-semibold px-2 py-1 fs-11 me-2">
                              Today
                            </span>
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked06"
                              defaultChecked=""
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            New Admin Launched.
                          </span>
                        </label>
                        <label className="p-2 mt-1 d-flex">
                          <span className="form-check mb-0 ms-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              defaultValue=""
                              id="flexCheckChecked08"
                              defaultChecked=""
                            />
                          </span>
                          <span className="mx-3 my-auto">
                            To maximize profits and improve productivity.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* </div> */}
          </div>
          {/* row closed */}
          {/* row */}
          <div className="row row-sm">
            <div className="col-sm-12 col-lg-12 col-xl-6 col-xxl-3">
              <div className="card">
                <div className="card-header pb-3">
                  <h3 className="card-title mb-2">SALES ACTIVITY</h3>
                </div>
                <div className="card-body p-0 customers mt-1">
                  <div className="country-card pt-0">
                    <div className="mb-4">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">India</span>
                        <div className="ms-auto">
                          <span className="text-danger mx-1">
                            <i className="fe fe-trending-down" />
                          </span>
                          <span className="number-font">$32,879</span> (65%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex mb-1">
                        <span className="fs-13 fw-semibold">Russia</span>
                        <div className="ms-auto">
                          <span className="text-info mx-1">
                            <i className="fe fe-trending-up" />
                          </span>
                          <span className="number-font">$22,710</span> (55%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-info"
                          style={{ width: "50%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">Canada</span>
                        <div className="ms-auto">
                          <span className="text-danger mx-1">
                            <i className="fe fe-trending-down" />
                          </span>
                          <span className="number-font">$56,291</span> (69%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-secondary"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">Brazil</span>
                        <div className="ms-auto">
                          <span className="text-success mx-1">
                            <i className="fe fe-trending-up" />
                          </span>
                          <span className="number-font">$34,209</span> (60%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
                          style={{ width: "60%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">United States</span>
                        <div className="ms-auto">
                          <span className="text-success mx-1">
                            <i className="fe fe-trending-up" />
                          </span>
                          <span className="number-font">$45,870</span> (86%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-danger"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">Germany</span>
                        <div className="ms-auto">
                          <span className="text-success mx-1">
                            <i className="fe fe-trending-up" />
                          </span>
                          <span className="number-font">$67,357</span> (73%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                          style={{ width: "70%" }}
                        />
                      </div>
                    </div>
                    <div className="mb-0 pb-2">
                      <div className="d-flex">
                        <span className="fs-13 fw-semibold">U.A.E</span>
                        <div className="ms-auto">
                          <span className="text-danger mx-1">
                            <i className="fe fe-trending-down" />
                          </span>
                          <span className="number-font">$56,291</span> (69%)
                        </div>
                      </div>
                      <div className="progress ht-7 br-5 mt-2">
                        <div
                          className="progress-bar progress-bar-striped progress-bar-animated bg-purpple"
                          style={{ width: "80%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-xxl-3 col-md-12 col-lg-12">
              <div className="card overflow-hidden">
                <div className="card-header pb-1">
                  <div className="card-title mb-2">
                    Warehouse Operating Costs
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="list-group projects-list border-0">
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-0">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Order Picking
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          3,876
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted fs-12">
                          <i className="bx bx-caret-up text-success me-1" />{" "}
                          <span className="text-success">03%</span> last month
                        </span>
                        <span className="text-muted  fs-11">5 days ago</span>
                      </div>
                    </div>
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-bottom-0  border-start-0 border-end-0 border-top">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Storage
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          2,178
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted  fs-12">
                          <i className="bx bx-caret-down text-danger me-1" />
                          <span className="text-danger"> 16%</span> last month
                        </span>
                        <span className="text-muted  fs-11">2 days ago</span>
                      </div>
                    </div>
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-bottom-0  border-start-0 border-end-0 border-top">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Shipping
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          1,367
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted  fs-12">
                          <i className="bx bx-caret-up text-success me-1" />
                          <span className="text-success"> 06%</span> last month
                        </span>
                        <span className="text-muted  fs-11">1 days ago</span>
                      </div>
                    </div>
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-bottom-0  border-start-0 border-end-0 border-top">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Receiving
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          678
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted  fs-12">
                          <i className="bx bx-caret-down text-danger me-1" />
                          <span className="text-danger"> 25%</span> last month
                        </span>
                        <span className="text-muted  fs-11">10 days ago</span>
                      </div>
                    </div>
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-bottom-0  border-start-0 border-end-0 border-top">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Review
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          578
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted  fs-12">
                          <i className="bx bx-caret-up text-success me-1" />
                          <span className="text-success"> 55%</span> last month
                        </span>
                        <span className="text-muted  fs-11">11 days ago</span>
                      </div>
                    </div>
                    <div className="list-group-item list-group-item-action flex-column align-items-start border-bottom-0  border-start-0 border-end-0 border-top pb-3">
                      <div className="d-flex w-100 justify-content-between">
                        <p className="fs-13 mb-2 fw-semibold text-dark">
                          Profit
                        </p>
                        <h4 className="text-dark mb-0 fw-semibold text-dark fs-18">
                          $27,215
                        </h4>
                      </div>
                      <div className="d-flex w-100 justify-content-between">
                        <span className="text-muted  fs-12">
                          <i className="bx bx-caret-up text-success me-1" />
                          <span className="text-success"> 32%</span> last month
                        </span>
                        <span className="text-muted  fs-11">11 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 col-xl-6 col-xxl-3">
              <div className="card">
                <div className="card-header bg-transparent pb-0">
                  <div>
                    <h3 className="card-title mb-2">Timeline</h3>
                  </div>
                </div>
                <div className="card-body mt-0">
                  <div className="latest-timelines mt-4">
                    <ul className="timelines mb-0">
                      <li>
                        <div className="featured_icon danger">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            23 Sep, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Anita Letterback
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon success">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            16 Aug, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Paddy O'Furniture
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon primary">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            23 Feb, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Olive Yew
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon warning">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            21 june, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Maureen Biologist
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt.{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon teal">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            04 Aug, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Peg Legge
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon info">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            04 Aug, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Letterbac
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                      <li>
                        <div className="featured_icon danger">
                          <i className="fas fa-circle" />
                        </div>
                      </li>
                      <li className="mt-0 activity mb-0">
                        <div>
                          <span className="fs-11 text-muted float-end">
                            23 Sep, 2021
                          </span>
                        </div>
                        <a href="#;" className="fs-12 text-dark">
                          <p className="mb-1 fw-semibold text-dark fs-13">
                            Anita Letterback
                          </p>
                        </a>
                        <p className="text-muted mt-0 mb-0 fs-12">
                          Lorem ipsum dolor tempor incididunt .{" "}
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-xxl-3 col-md-12 col-lg-12">
              <div className="card">
                <div className="card-header pb-0">
                  <h3 className="card-title mb-2">Weekly Visitors</h3>
                </div>
                <div className="card-body pb-0">
                  <div className="row mb-4">
                    <div className="col-6">
                      <div className="text-muted fs-12 text-center mb-2">
                        Average Male Visitors
                      </div>
                      <div className="d-flex justify-content-center align-items-center flex-wrap">
                        <span className="me-3 fs-26 fw-semibold">2,132</span>
                        <span className="text-success fw-semibold">
                          <i className="fa fa-caret-up me-2" />
                          0.23%
                        </span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-muted fs-12 text-center mb-2">
                        Average Female Visitors
                      </div>
                      <div className="d-flex justify-content-center align-items-center flex-wrap">
                        <span className="me-3 fs-26 fw-semibold">1,053</span>
                        <span className="text-danger fw-semibold">
                          <i className="fa fa-caret-down me-2" />
                          0.11%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div id="Viewers" />
                </div>
              </div>
            </div>
          </div>
          {/* row closed */}
          {/* row tabel  */}
          <div className="row">
            <div className="col-12 col-sm-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Product Summary</h4>
                </div>
                <div className="card-body pt-0 example1-table">
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Search Here"
                        aria-label=".form-control-sm example"
                      />
                    </div>
                    <div className="dropdown">
                      <a
                        href="#;"
                        className="btn btn-primary btn-sm btn-wave waves-effect waves-light"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Sort By
                        <i className="ri-arrow-down-s-line align-middle d-inline-block" />
                      </a>
                      <ul className="dropdown-menu" role="menu">
                        <li>
                          <a className="dropdown-item" href="#;">
                            New
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#;">
                            Popular
                          </a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="#;">
                            Relevant
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table
                      className="table  table-bordered text-nowrap mb-0"
                      id="example1"
                    >
                      <thead>
                        <tr>
                          <th className="text-center">Purchase Date</th>
                          <th>Client Name</th>
                          <th>Product ID</th>
                          <th>Product</th>
                          <th>Product Cost</th>
                          <th>Payment Mode</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="text-center">#01</td>
                          <td>Sean Black</td>
                          <td>PRO12345</td>
                          <td>Mi LED Smart TV 4A 80</td>
                          <td>$14,500</td>
                          <td>Online Payment</td>
                          <td>
                            <span className="badge bg-success">Delivered</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#02</td>
                          <td>Evan Rees</td>
                          <td>PRO8765</td>
                          <td>Thomson R9 122cm (48 inch) Full HD LED TV </td>
                          <td>$30,000</td>
                          <td>Cash on delivered</td>
                          <td>
                            <span className="badge bg-primary">Add Cart</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#03</td>
                          <td>David Wallace</td>
                          <td>PRO54321</td>
                          <td>Vu 80cm (32 inch) HD Ready LED TV</td>
                          <td>$13,200</td>
                          <td>Online Payment</td>
                          <td>
                            <span className="badge bg-orange">Pending</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#04</td>
                          <td>Julia Bower</td>
                          <td>PRO97654</td>
                          <td>Micromax 81cm (32 inch) HD Ready LED TV</td>
                          <td>$15,100</td>
                          <td>Cash on delivered</td>
                          <td>
                            <span className="badge bg-secondary">
                              Delivering
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#05</td>
                          <td>Kevin James</td>
                          <td>PRO4532</td>
                          <td>HP 200 Mouse &amp; Wireless Laptop Keyboard </td>
                          <td>$5,987</td>
                          <td>Online Payment</td>
                          <td>
                            <span className="badge bg-danger">Shipped</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#06</td>
                          <td>Theresa Wright</td>
                          <td>PRO6789</td>
                          <td>Digisol DG-HR3400 Router </td>
                          <td>$11,987</td>
                          <td>Cash on delivered</td>
                          <td>
                            <span className="badge bg-secondary">
                              Delivering
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#07</td>
                          <td>Sebastian Black</td>
                          <td>PRO4567</td>
                          <td>Dell WM118 Wireless Optical Mouse</td>
                          <td>$4,700</td>
                          <td>Online Payment</td>
                          <td>
                            <span className="badge bg-info">Add to Cart</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="text-center">#08</td>
                          <td>Kevin Glover</td>
                          <td>PRO32156</td>
                          <td>Dell 16 inch Laptop Backpack </td>
                          <td>$678</td>
                          <td>Cash On delivered</td>
                          <td>
                            <span className="badge bg-pink">Delivered</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* row tabel  */}
          <div className="row">
            <div className="col-12 col-sm-12">
              <div className="card">
                <div className="card-header">
                  <h4 className="card-title">Data Teknisi</h4>
                </div>
                <div className="card-body pt-0 example1-table">
                  <div className="d-flex justify-content-between flex-wrap gap-2 mb-3">
                    <div>
                      <input
                        className="form-control form-control-sm"
                        type="text"
                        placeholder="Cari teknisi..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1); // Reset ke halaman pertama saat mencari
                        }}
                        aria-label="Cari teknisi"
                      />
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      <div className="d-flex align-items-center">
                        <label htmlFor="itemsPerPage" className="me-2 mb-0">
                          Tampilkan:
                        </label>
                        <select
                          id="itemsPerPage"
                          className="form-select form-select-sm"
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                          style={{ width: "80px" }}
                        >
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                        </select>
                      </div>
                      <Link
                        href="/teknisi/tambah"
                        className="btn btn-primary btn-sm btn-wave waves-effect waves-light"
                      >
                        <i className="ri-add-line align-middle me-1"></i>
                        Tambah Teknisi
                      </Link>
                      <div className="dropdown">
                        <button
                          className="btn btn-outline-secondary btn-sm btn-wave waves-effect waves-light"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Urutkan
                          <i className="ri-arrow-down-s-line align-middle ms-1" />
                        </button>
                        <ul className="dropdown-menu" role="menu">
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {}}
                            >
                              Nama A-Z
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {}}
                            >
                              Nama Z-A
                            </button>
                          </li>
                          <li>
                            <button
                              className="dropdown-item"
                              onClick={() => {}}
                            >
                              Jurusan
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table
                      className="table table-bordered text-nowrap mb-0"
                      id="teknisi-table"
                    >
                      <thead>
                        <tr>
                          <th className="text-center">No</th>
                          <th>Nama</th>
                          <th>Jurusan</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length > 0 ? (
                          currentItems.map((tech, index) => (
                            <tr key={index}>
                              <td className="text-center">
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>{tech.nama}</td>
                              <td>{tech.jurusan}</td>
                              <td className="text-center">
                                <div className="btn-group">
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    title="Edit"
                                    onClick={() =>
                                      router.push(`/teknisi/edit/${tech.id}`)
                                    }
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    title="Hapus"
                                    onClick={() => openModal(tech.id)}
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-4">
                              {searchTerm
                                ? "Tidak ada teknisi yang sesuai dengan pencarian"
                                : "Tidak ada data teknisi"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {filteredTotalPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <div>
                        <p className="mb-0">
                          Menampilkan {indexOfFirstItem + 1} -{" "}
                          {Math.min(indexOfLastItem, filteredTeknisi.length)}{" "}
                          dari {filteredTeknisi.length} teknisi
                        </p>
                      </div>
                      <nav aria-label="Page navigation">
                        <ul className="pagination pagination-sm mb-0">
                          <li
                            className={`page-item ${
                              currentPage === 1 ? "disabled" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </button>
                          </li>
                          {pageNumbers.map((number) => (
                            <li
                              key={number}
                              className={`page-item ${
                                currentPage === number ? "active" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() => paginate(number)}
                              >
                                {number}
                              </button>
                            </li>
                          ))}
                          <li
                            className={`page-item ${
                              currentPage === filteredTotalPages
                                ? "disabled"
                                : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === filteredTotalPages}
                            >
                              Next
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* /row closed */}
        </div>
        {/* /Container */}
      </div>
      {/* /main-content */}
      {/* Footer Start */}
      <footer className="footer mt-auto py-3 bg-white text-center">
        <div className="container">
          <span>
            {" "}
            Copyright © <span id="year" />{" "}
            <a href="#;" className="text-primary">
              Nowa
            </a>
            . Designed with <span className="bi bi-heart-fill text-danger" /> by{" "}
            <a href="#;">
              <span className="fw-semibold text-decoration-underline">
                Spruko
              </span>
            </a>{" "}
            All rights reserved
          </span>
        </div>
      </footer>
      {/* Footer End */}
      <div
        className="sidebar offcanvas offcanvas-end"
        tabIndex={-1}
        id="sidebar-canvas"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header border-bottom bg-light">
          <h6
            className="offcanvas-title text-default"
            id="offcanvasRightLabel22"
          >
            NOTIFICATIONS
          </h6>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body p-0">
          <div className="panel-body tabs-menu-body latest-tasks p-0 border-0">
            <div className="tabs-menu p-3">
              {/* Tabs */}
              <ul className="nav panel-tabs">
                <li className="">
                  <a href="#side1" className="active" data-bs-toggle="tab">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="side-menu__icon"
                      height={24}
                      viewBox="0 0 24 24"
                      width={24}
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
                    </svg>{" "}
                    Chat
                  </a>
                </li>
                <li className="">
                  <a href="#side2" data-bs-toggle="tab">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      enableBackground="new 0 0 24 24"
                      className="side-menu__icon"
                      height={24}
                      viewBox="0 0 24 24"
                      width={24}
                    >
                      <g>
                        <path d="M0,0h24v24H0V0z" fill="none" />
                      </g>
                      <g>
                        <path d="M12,18.5c0.83,0,1.5-0.67,1.5-1.5h-3C10.5,17.83,11.17,18.5,12,18.5z M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10 c5.52,0,10-4.48,10-10S17.52,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8c4.41,0,8,3.59,8,8S16.41,20,12,20z M16,11.39 c0-2.11-1.03-3.92-3-4.39V6.5c0-0.57-0.43-1-1-1s-1,0.43-1,1V7c-1.97,0.47-3,2.27-3,4.39V14H7v2h10v-2h-1V11.39z M14,14h-4v-3 c0-1.1,0.9-2,2-2s2,0.9,2,2V14z" />
                      </g>
                    </svg>{" "}
                    Notifications
                  </a>
                </li>
                <li className="">
                  <a href="#side3" data-bs-toggle="tab">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      className="side-menu__icon"
                      height={24}
                      version="1.1"
                      width={24}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12,2C6.48,2 2,6.48 2,12C2,17.52 6.48,22 12,22C17.52,22 22,17.52 22,12C22,6.48 17.52,2 12,2M7.07,18.28C7.5,17.38 10.12,16.5 12,16.5C13.88,16.5 16.5,17.38 16.93,18.28C15.57,19.36 13.86,20 12,20C10.14,20 8.43,19.36 7.07,18.28M18.36,16.83C16.93,15.09 13.46,14.5 12,14.5C10.54,14.5 7.07,15.09 5.64,16.83C4.62,15.5 4,13.82 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,13.82 19.38,15.5 18.36,16.83M12,6C10.06,6 8.5,7.56 8.5,9.5C8.5,11.44 10.06,13 12,13C13.94,13 15.5,11.44 15.5,9.5C15.5,7.56 13.94,6 12,6M12,11C11.17,11 10.5,10.33 10.5,9.5C10.5,8.67 11.17,8 12,8C12.83,8 13.5,8.67 13.5,9.5C13.5,10.33 12.83,11 12,11Z" />
                    </svg>{" "}
                    Friends
                  </a>
                </li>
              </ul>
            </div>
            <div className="tab-content">
              <div className="tab-pane active p-0 border-0" id="side1">
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-primary rounded-circle avatar-md">
                      CH
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>New Websites is Created</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">
                          30 mins ago
                        </small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-danger rounded-circle avatar-md">
                      N
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Prepare For the Next Project</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">
                          2 hours ago
                        </small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-info rounded-circle avatar-md">
                      S
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Decide the live Discussion</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">
                          3 hours ago
                        </small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-warning rounded-circle avatar-md">
                      K
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Meeting at 3:00 pm</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">
                          4 hours ago
                        </small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-success rounded-circle avatar-md">
                      R
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Prepare for Presentation</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">1 days ago</small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-pink rounded-circle avatar-md">
                      MS
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Prepare for Presentation</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">1 days ago</small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center border-bottom p-3">
                  <div className="">
                    <span className="avatar bg-purple rounded-circle avatar-md">
                      L
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Prepare for Presentation</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">
                          45 mintues ago
                        </small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
                <div className="list d-flex align-items-center p-3">
                  <div className="">
                    <span className="avatar bg-secondary rounded-circle avatar-md">
                      U
                    </span>
                  </div>
                  <a className="wrapper w-100 ms-3" href="#;">
                    <p className="mb-0 d-flex ">
                      <b>Prepare for Presentation</b>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <i className="mdi mdi-clock text-muted me-1 fs-11" />
                        <small className="text-muted ms-auto">2 days ago</small>
                        <p className="mb-0" />
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="tab-pane p-0 border-0 " id="side2">
                <div className="list-group list-group-flush ">
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/12.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Madeleine</strong> Hey! there I' am available....
                      <div className="small text-muted">3 hours ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/1.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Anthony</strong> New product Launching...
                      <div className="small text-muted">5 hour ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/2.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Olivia</strong> New Schedule Realease......
                      <div className="small text-muted">45 mintues ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/8.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Madeleine</strong> Hey! there I' am available....
                      <div className="small text-muted">3 hours ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/11.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Anthony</strong> New product Launching...
                      <div className="small text-muted">5 hour ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/6.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Olivia</strong> New Schedule Realease......
                      <div className="small text-muted">45 mintues ago</div>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-3">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/9.jpg"
                        alt="img"
                      />
                    </div>
                    <div>
                      <strong>Olivia</strong> Hey! there I' am available....
                      <div className="small text-muted">12 mintues ago</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane p-0 border-0 " id="side3">
                <div className="list-group list-group-flush ">
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/9.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Mozelle Belt</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/11.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">
                        Florinda Carasco
                      </div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/10.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Alina Bernier</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/2.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Zula Mclaughin</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/13.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Isidro Heide</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/12.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Mozelle Belt</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/4.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">
                        Florinda Carasco
                      </div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/7.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Alina Bernier</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/2.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Zula Mclaughin</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/14.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Isidro Heide</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/11.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">
                        Florinda Carasco
                      </div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/9.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Alina Bernier</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/15.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Zula Mclaughin</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                  <div className="list-group-item d-flex  align-items-center border-0">
                    <div className="me-2">
                      <img
                        className="avatar avatar-md rounded-circle cover-image"
                        src="../assets/images/faces/4.jpg"
                        alt="img"
                      />
                    </div>
                    <div className="">
                      <div className="font-weight-semibold">Isidro Heide</div>
                    </div>
                    <div className="ms-auto">
                      <a
                        href="#;"
                        className="btn btn-sm btn-outline-light btn-rounded"
                      >
                        <i className="fe fe-message-square fs-16" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus data ini?</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="scrollToTop">
        <span className="arrow">
          <i className="ri-arrow-up-s-fill fs-20" />
        </span>
      </div>
      <div id="responsive-overlay" />
    </>
  );
}
