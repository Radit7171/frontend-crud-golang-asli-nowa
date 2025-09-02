/* eslint-disable */
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import Script from "next/script";
import Head from "next/head";

export default function Signup() {
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
      {/* Start Switcher */}
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
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <p className="switcher-style-head">Navigation Menu Style:</p>
                <div className="row switcher-style pb-2">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <div className="px-4 pb-3 text-secondary fs-11">
                  <span className="fw-semibold fs-12 text-dark me-2 d-inline-block">
                    Note:
                  </span>
                  Works same for both Vertical and Horizontal
                </div>
              </div>
              <div className="">
                <p className="switcher-style-head">Page Styles:</p>
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
              <div className="">
                <p className="switcher-style-head">Header Positions:</p>
                <div className="row switcher-style">
                  <div className="col-sm-4">
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
                  <div className="col-sm-4">
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
              <div className="sidemenu-layout-styles">
                <p className="switcher-style-head">Sidemenu Layout Syles:</p>
                <div className="row switcher-style pb-2">
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
                <div className="px-4 pb-3 text-secondary fs-11">
                  <span className="fw-semibold fs-12 text-dark me-2 d-inline-block">
                    Note:
                  </span>
                  Navigation menu styles won't work here.
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
                        defaultChecked=""
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
                        defaultChecked=""
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
            <div className="d-flex justify-content-between canvas-footer">
              <a href="#" className="btn btn-primary">
                Buy Now
              </a>
              <a
                href="https://themeforest.net/user/spruko/portfolio"
                className="btn btn-secondary"
              >
                Our Portfolio
              </a>
              <a
                href="javascript:void(0);"
                id="reset-all"
                className="btn btn-danger"
              >
                Reset
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* End Switcher */}
      <div className="square-box">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
      <div className="container">
        <div className="row justify-content-center align-items-center authentication authentication-basic h-100">
          <div className="col-xl-5 col-lg-6 col-md-8 col-sm-8 col-xs-10 card-sigin-main py-4 justify-content-center mx-auto">
            <div className="card-sigin ">
              {/* Demo content*/}
              <div className="main-card-signin d-md-flex">
                <div className="wd-100p">
                  <div className="d-flex mb-4">
                    <a href="index.html">
                      <img
                        src="/assets/images/brand-logos/toggle-logo.png"
                        className="sign-favicon ht-40"
                        alt="logo"
                      />
                    </a>
                  </div>
                  <div className="">
                    <div className="main-signup-header">
                      <h2 className="text-dark">Get Started</h2>
                      <h6 className="fw-normal mb-4">
                        It's free to signup and only takes a minute.
                      </h6>
                      <form action="#">
                        <div className="form-group">
                          <label>Firstname &amp; Lastname</label>{" "}
                          <input
                            className="form-control"
                            placeholder="Enter your firstname and lastname"
                            type="text"
                          />
                        </div>
                        <div className="form-group">
                          <label>Email</label>{" "}
                          <input
                            className="form-control"
                            placeholder="Enter your email"
                            type="text"
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>{" "}
                          <input
                            className="form-control"
                            placeholder="Enter your password"
                            type="password"
                          />
                        </div>
                        <button className="btn btn-primary btn-block">
                          Create Account
                        </button>
                        <div className="mt-4 d-flex text-center justify-content-center">
                          <a
                            href="javascript:void(0);"
                            className="btn btn-icon me-3"
                          >
                            <span className="btn-inner--icon">
                              {" "}
                              <i className="bx bxl-facebook fs-18 tx-prime" />{" "}
                            </span>
                          </a>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-icon me-3"
                          >
                            <span className="btn-inner--icon">
                              {" "}
                              <i className="bx bxl-twitter fs-18 tx-prime" />{" "}
                            </span>
                          </a>
                          <a
                            href="javascript:void(0);"
                            className="btn btn-icon me-3"
                          >
                            <span className="btn-inner--icon">
                              {" "}
                              <i className="bx bxl-linkedin fs-18 tx-prime" />{" "}
                            </span>
                          </a>
                          <a
                            href="javascript:void(0);"
                            className="btn  btn-icon me-3"
                          >
                            <span className="btn-inner--icon">
                              {" "}
                              <i className="bx bxl-instagram fs-18 tx-prime" />{" "}
                            </span>
                          </a>
                        </div>
                      </form>
                      <div className="main-signup-footer mt-3 text-center">
                        <p>
                          Already have an account?{" "}
                          <a href="signin.html">Sign In</a>
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

      {/* <!-- Custom-Switcher JS --> */}
      <Script src="/assets/js/custom-switcher.min.js"></Script>

      {/* <!-- Bootstrap JS --> */}
      <Script src="/assets/libs/bootstrap/js/bootstrap.bundle.min.js"></Script>

      {/* <!-- Show Password JS --> */}
      <Script src="/assets/js/show-password.js"></Script>
    </>
  );
}
