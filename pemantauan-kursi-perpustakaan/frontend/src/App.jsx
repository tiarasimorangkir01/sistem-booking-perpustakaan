import React, { useState, useEffect, useRef } from "react";
import {
  getApiStatus,
  getFloors,
  loginMahasiswa,
  registerMahasiswa,
  sendResetCode,
  confirmResetPassword,
  getHistory,
  claimSeats,
} from "./api";
import "./App.css";

function MapSeat({ id, top, left, w = 28, h = 24, seats, selectedSeats, onSeatClick }) {
  const seat = seats.find((item) => item.id === id);
  const occupied = seat?.status === "occupied";
  const selected = selectedSeats.includes(id) && !occupied;

  return (
    <button
      key={`${id}-${top}-${left}`}
      type="button"
      className={`map-seat ${occupied ? "occupied" : selected ? "selected" : "available"}`}
      style={{ top, left, width: w, height: h }}
      onClick={() => seat && onSeatClick(seat)}
      disabled={!seat || occupied}
      title={`${id} - ${occupied ? "Terisi" : "Tersedia"}`}
    >
      {id}
    </button>
  );
}

function MapWall({ top, left, w, h, side = "left" }) {
  return (
    <div
      className={`map-wall ${side}`}
      style={{ top, left, width: w, height: h }}
    />
  );
}

function MapTable({ top, left, w = 62, h = 26, round = false }) {
  return (
    <div
      className={`map-table ${round ? "round" : ""}`}
      style={{ top, left, width: w, height: h }}
    />
  );
}

function MapDivider({ top, left, w = 7, h = 45 }) {
  return <div className="map-divider" style={{ top, left, width: w, height: h }} />;
}

function MapLegend() {
  return (
    <div className="map-legend map-legend-floor">
      <span><i className="dot green" /> Tersedia</span>
      <span><i className="dot red" /> Terisi / nonaktif</span>
      <span><i className="dot blue" /> Dipilih</span>
    </div>
  );
}

function SeatMap({ floorId, seats, selectedSeats, onSeatClick }) {
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  const dimensions = {
    1: { width: 610, height: 350, sourceWidth: 700, sourceHeight: 380, minX: 60, minY: 25 },
    3: { width: 700, height: 350, sourceWidth: 850, sourceHeight: 450, minX: 40, minY: 35 },
    4: { width: 680, height: 340, sourceWidth: 900, sourceHeight: 450, minX: 135, minY: 55 },
  }[floorId] || { width: 680, height: 340, sourceWidth: 900, sourceHeight: 450, minX: 135, minY: 55 };

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;
    const updateScale = () => {
      const availableWidth = Math.max(200, element.clientWidth - 48);
      const availableHeight = Math.max(200, element.clientHeight - 88);
      setScale(Math.min(availableWidth / dimensions.width, availableHeight / dimensions.height));
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [floorId, dimensions.width, dimensions.height]);

  const seat = (id, top, left, w = 28, h = 24) => (
    <MapSeat
      key={`${id}-${top}-${left}`}
      id={id}
      top={top}
      left={left}
      w={w}
      h={h}
      seats={seats}
      selectedSeats={selectedSeats}
      onSeatClick={onSeatClick}
    />
  );

  const renderMap = (children, className = "") => (
    <div ref={viewportRef} className={`map-floor-viewport ${className}`}>
      <div
        className="map-coordinate-map"
        style={{
          width: dimensions.width,
          height: dimensions.height,
          transform: `scale(${scale})`,
        }}
      >
        <div
          className="map-geometry"
          style={{ left: -dimensions.minX, top: -dimensions.minY, width: dimensions.sourceWidth, height: dimensions.sourceHeight }}
        >
          {children}
        </div>
      </div>
      <MapLegend />
    </div>
  );

  if (floorId === 1) {
    return renderMap(<>
      <MapWall top={65} left={60} w={2} h={180} />
      <MapWall top={245} left={60} w={15} h={2} side="horizontal" />
      <MapWall top={245} left={75} w={2} h={15} />
      <MapWall top={275} left={60} w={2} h={60} />
      <div className="map-door" style={{ top: 255, left: 90 }}> Pintu masuk ↑</div>
      <MapWall top={245} left={170} w={500} h={2} side="horizontal" />
      <MapTable top={260} left={195} w={175} h={25} />
      <MapTable top={350} left={195} w={175} h={25} />
      <MapTable top={255} left={495} w={35} h={35} round />
      {seat("RD00", 25, 75, 85, 35)}
      {seat("RD01", 25, 165, 70, 65)}
      {seat("A12", 75, 95)}{seat("A11", 102, 95)}{seat("A10", 129, 95)}
      {seat("A09", 156, 95)}{seat("A08", 183, 95)}{seat("A07", 210, 95)}
      {seat("RD02", 98, 165, 70, 35)}{seat("A15", 140, 165, 70, 25)}
      {seat("A08", 295, 205)}{seat("A07", 295, 260)}{seat("A06", 295, 315)}
      {seat("A01", 355, 205)}{seat("A02", 355, 260)}{seat("A03", 355, 315)}
      {seat("A16", 262, 450, 35, 25)}{seat("A18", 262, 540, 35, 25)}{seat("A17", 300, 495, 35, 25)}
    </>, "floor-one");
  }

  if (floorId === 3) {
    return renderMap(<>
      <MapWall top={35} left={80} w={2} h={125} />
      <MapWall top={210} left={80} w={2} h={170} />
      <MapWall top={200} left={100} w={35} h={2} side="horizontal" />
      <MapWall top={200} left={135} w={2} h={185} side="right" />
      <MapWall top={35} left={235} w={2} h={140} />
      <MapWall top={35} left={335} w={2} h={140} />
      <MapWall top={35} left={480} w={2} h={105} />
      <MapWall top={140} left={480} w={235} h={2} side="horizontal" />
      <MapWall top={140} left={715} w={2} h={100} />
      <MapWall top={270} left={715} w={2} h={110} />
      <MapWall top={320} left={340} w={2} h={60} />
      <MapWall top={320} left={465} w={2} h={60} />
      <MapWall top={320} left={590} w={2} h={60} />
      <div className="map-door map-door-vertical" style={{ top: 165, left: 60 }}> Pintu masuk ↑</div>
      <div className="map-door" style={{ top: 145, left: 725 }}> Pintu ↑</div>
      {seat("RD05", 330, 40, 40, 50)}
      {[["C01",210],["C02",235],["C03",260],["C04",285],["C05",310],["C06",335],["C07",360]].map(([id, top]) => seat(id, top, 100, 28, id === "C07" ? 25 : 22))}
      {[["C08",235],["C09",260],["C10",285],["C11",310],["C12",335],["C13",360]].map(([id, top]) => seat(id, top, 145, 28, id === "C13" ? 25 : 22))}
      {seat("C35",45,165,60,30)}{seat("C37",45,245)}{seat("C38",45,275)}{seat("C39",45,305)}
      {seat("C36",85,255,65,40)}
      {seat("C41",45,345)}{seat("C42",45,375)}{seat("C43",45,405)}{seat("C44",45,435)}
      {seat("C40",85,360,65,40)}{seat("C45",75,435)}{seat("C46",100,435)}
      {seat("C49",55,490,24,24)}{seat("C50",40,518,24,24)}{seat("C48",85,490,24,24)}{seat("C47",100,518,24,24)}
      {seat("C55",45,565)}{seat("C56",45,595)}{seat("C57",45,625)}{seat("C58",45,655)}
      {seat("C51",85,565)}{seat("C52",85,595)}{seat("C53",85,625)}{seat("C54",85,655)}
      {[
        { x: 225, ids: ["C18","C19","C20","C21"] },
        { x: 335, ids: ["C22","C23","C24","C25"] },
        { x: 445, ids: ["C26","C27","C28","C29"] },
        { x: 555, ids: ["C30","C31","C32","C33"] },
      ].map(({x,ids}) => <React.Fragment key={ids[0]}>
        {seat(ids[0],215,x)}{seat(ids[1],255,x)}<MapTable top={215} left={x+35}/>
        {seat(ids[2],215,x+70)}{seat(ids[3],255,x+70)}
      </React.Fragment>)}
      {seat("C14",330,215,110,45)}{seat("C15",330,345,110,45)}
      {seat("C16",330,470,110,45)}{seat("C17",330,595,110,45)}
    </>, "floor-three");
  }

  return renderMap(<>
    <MapWall top={65} left={135} w={2} h={235} />
    <MapWall top={300} left={135} w={60} h={2} side="horizontal" />
    <MapWall top={235} left={195} w={2} h={65} />
    <MapWall top={55} left={625} w={2} h={65} />
    <MapWall top={55} left={710} w={2} h={65} />
    <MapWall top={300} left={265} w={550} h={2} side="horizontal" />
    <div className="map-door" style={{ top: 293, left: 210 }}> Pintu ↓</div>
    <div className="map-door" style={{ top: 293, left: 400 }}> Pintu ↓</div>
    {[...Array(16)].map((_,i) => <MapDivider key={`top-${i}`} top={55} left={155+i*29} w={7} h={45}/>)}
    {seat("RD03",60,635,70,50)}{seat("RD04",60,720,70,50)}
    {["D34","D33","D32","D31","D30","D29"].map((id,i) => seat(id,115+i*31,140))}
    {seat("D35",175,175)}{seat("D36",206,175)}
    {[
      {top:["D39","D40"],bottom:["D37","D38"]},
      {top:["D43","D44"],bottom:["D41","D42"]},
      {top:["D47","D48"],bottom:["D45","D46"]},
      {top:["D51","D52"],bottom:["D49","D50"]},
      {top:["D55","D56"],bottom:["D53","D54"]},
      {top:["D59","D60"],bottom:["D57","D58"]},
    ].map((group,i) => {
      const x=300+i*78;
      return <React.Fragment key={`group-${i}`}>
        {seat(group.top[0],135,x)}{seat(group.top[1],135,x+32)}
        <MapTable top={165} left={x-2} w={64} h={30}/>
        {seat(group.bottom[0],200,x)}{seat(group.bottom[1],200,x+32)}
      </React.Fragment>;
    })}
    {[0,1,2].map(i => <MapDivider key={`bottom-left-${i}`} top={240} left={305+i*28} w={7} h={45}/>)}
    {[...Array(11)].map((_,i) => <MapDivider key={`bottom-right-${i}`} top={240} left={465+i*29} w={7} h={45}/>)}
    {seat("D28",315,290)}{seat("D27",315,322)}{seat("D26",315,354)}
    {["D25","D24","D23","D22","D21","D20","D19","D18","D17","D16"].map((id,i) => seat(id,315,455+i*32))}
    {["D01","D02","D03","D04","D05"].map((id,i) => seat(id,350,290+i*32))}
    {["D06","D07","D08","D09","D10","D11","D12","D13","D14","D15"].map((id,i) => seat(id,350,455+i*32))}
  </>, "floor-four");
}

const INITIAL_FLOORS = {
  1: {
    id: 1,
    name: "Lantai 1",
    area: "Area Kolaborasi",
    desc: "Ruang diskusi kelompok & meja kolaboratif",
    total: 19,
    available: 19,
    seats: [
      { id: "RD00", type: "table", status: "available" },
      { id: "RD01", type: "table", status: "available" },
      { id: "RD02", type: "table", status: "available" },
      ...Array.from({ length: 16 }, (_, i) => {
        const ids = ["A01","A02","A03","A04","A05","A06","A07","A08","A09","A10","A11","A12","A15","A16","A17","A18"];
        return { id: ids[i], status: "available" };
      }),
    ],
  },
  3: {
    id: 3,
    name: "Lantai 3",
    area: "Area Baca Umum",
    desc: "Koleksi buku utama & meja baca standar",
    total: 58,
    available: 58,
    seats: [
      { id: "RD05", type: "room", status: "available" },
      ...Array.from({ length: 58 }, (_, i) => ({
        id: `C${String(i + 1).padStart(2, "0")}`,
        status: "available",
      })).filter((s) => s.id !== "C34"),
    ],
  },
  4: {
    id: 4,
    name: "Lantai 4",
    area: "Area Belajar Hening",
    desc: "Zona fokus tinggi tanpa suara untuk belajar mandiri",
    total: 62,
    available: 62,
    seats: [
      { id: "RD03", type: "room", status: "available" },
      { id: "RD04", type: "room", status: "available" },
      ...Array.from({ length: 60 }, (_, i) => ({
        id: `D${String(i + 1).padStart(2, "0")}`,
        status: "available",
      })),
    ],
  },
};

export default function App() {
  const [apiStatus, setApiStatus] = useState("Menghubungkan...");
  useEffect(() => {
    getApiStatus()
      .then((data) => {
        setApiStatus(data.message);
      })
      .catch(() => {
        setApiStatus("Backend tidak terhubung");
      });
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState({
  });
  const [activeMenu, setActiveMenu] = useState("home");

  // Mode Form Auth: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState("login");
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [namaLengkap, setNamaLengkap] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    type: "success",
  });

  // Seat Claiming States
  const [floors, setFloors] = useState(INITIAL_FLOORS);
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [claimStep, setClaimStep] = useState(1);
  const [duration, setDuration] = useState(2);
  const [conflictSeat, setConflictSeat] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Pengaturan Jam Operasional (08.00 - 20.00 WIB) & Pilih Tanggal/Jam
  const nowJakarta = new Date();
const currentHourNow = nowJakarta.getHours();
const isSundayToday = nowJakarta.getDay() === 0;
const isLibraryClosedNow = isSundayToday || currentHourNow >= 20 || currentHourNow < 8;

const formatDateISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const todayISO = formatDateISO(nowJakarta);
const nextOpenDayObj = new Date(nowJakarta);
nextOpenDayObj.setDate(nowJakarta.getDate() + 1);
if (nextOpenDayObj.getDay() === 0) {
  nextOpenDayObj.setDate(nextOpenDayObj.getDate() + 1); // Loncat Minggu -> Senin
}
const tomorrowISO = formatDateISO(nextOpenDayObj);

  const [bookingDate, setBookingDate] = useState(
    isLibraryClosedNow ? tomorrowISO : todayISO
  );
  const [startHour, setStartHour] = useState(
    isLibraryClosedNow ? 8 : Math.max(8, currentHourNow)
  );

  const selectedDateLabel = new Date(`${bookingDate}T00:00:00`).toLocaleDateString(
    "id-ID",
    { day: "numeric", month: "long", year: "numeric" }
  );

  // Mengambil data lantai dari backend + Supabase
  useEffect(() => {
  const loadFloors = () => {
    getFloors(bookingDate)
      .then((data) => {
        if (data && data[1] && data[3] && data[4]) {
          setFloors(data);
        }
      })
      .catch((error) => {
        console.error("Gagal mengambil data lantai:", error);
      });
  };

  loadFloors();
  const interval = setInterval(loadFloors, 15000);
  return () => clearInterval(interval);
}, [bookingDate]);

  // History & Detail Modal States
  const [historyList, setHistoryList] = useState([]);
  const [historyFilter, setHistoryFilter] = useState("Semua");
  const [detailModalItem, setDetailModalItem] = useState(null);
  const [profileModal, setProfileModal] = useState(false);

  // Tanggal Real-Time
  const todayObj = new Date();
  const todayShort = todayObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const currentMonthYear = todayObj.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Hitung statistik real-time dari data lantai Supabase
  const totalSeatsAll = Object.values(floors).reduce((acc, f) => acc + (f.total || 0), 0);
  const availableSeatsAll = Object.values(floors).reduce((acc, f) => acc + (f.available || 0), 0);
  const occupiedSeatsAll = totalSeatsAll - availableSeatsAll;

  const triggerToast = (title, message, type = "success") => {
    setToast({ show: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // 1. HANDLER LOGIN KE SUPABASE
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await loginMahasiswa(nim.trim(), password);
      setCurrentUser(user);

      // Ambil riwayat klaim asli milik akun ini dari Supabase
      const userHistory = await getHistory(user.nim);
      setHistoryList(Array.isArray(userHistory) ? userHistory : []);

      const firstName = (user.nama || "Mahasiswa").split(" ")[0];
      triggerToast(
        "Login berhasil",
        `Selamat datang, ${firstName}! Mengalihkan ke Home...`,
        "success"
      );

      setTimeout(() => {
        setIsLoggedIn(true);
        setActiveMenu("home");
      }, 1000);
    } catch (err) {
      triggerToast(
        "Login gagal",
        err.message || "NIM / email atau password salah. Silakan coba lagi.",
        "error"
      );
    }
  };

  // 1B. HANDLER DAFTAR AKUN BARU KE SUPABASE
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await registerMahasiswa({
        nim: nim.trim(),
        nama: namaLengkap.trim(),
        email: emailInput.trim(),
        password,
      });

      triggerToast(
        "Pendaftaran Berhasil",
        res.message || "Akun berhasil disimpan ke database. Silakan login.",
        "success"
      );
      setAuthMode("login");
    } catch (err) {
      triggerToast(
        "Pendaftaran Gagal",
        err.message || "Gagal mendaftarkan akun.",
        "error"
      );
    }
  };

  // 1C. HANDLER LUPA PASSWORD
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await sendResetCode(emailInput.trim());
      setOtpSent(true);
      triggerToast(
        "Kode Verifikasi Terkirim",
        res.devOtp
          ? `${res.message} (Kode Demo: ${res.devOtp})`
          : res.message,
        "success"
      );
    } catch (err) {
      triggerToast(
        "Gagal Mengirim Kode",
        err.message || "Email tidak ditemukan.",
        "error"
      );
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await confirmResetPassword(
        emailInput.trim(),
        otpCode.trim(),
        newPassword
      );
      triggerToast(
        "Password Diperbarui",
        res.message || "Password berhasil diubah di database.",
        "success"
      );
      setAuthMode("login");
      setOtpSent(false);
      setOtpCode("");
      setNewPassword("");
    } catch (err) {
      triggerToast(
        "Reset Password Gagal",
        err.message || "Kode verifikasi salah atau kadaluarsa.",
        "error"
      );
    }
  };

  // 2. HANDLER PILIH KURSI
  const handleSelectFloor = (floorId) => {
    setSelectedFloor(floorId);
    setSelectedSeats([]);
    setConflictSeat(null);
    setClaimStep(1);
  };

  const toggleSeat = (seat) => {
    if (seat.status === "occupied") {
      triggerToast(
        "Kursi Tidak Tersedia",
        `Kursi ${seat.id} sedang digunakan pengunjung lain.`,
        "error"
      );
      return;
    }

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
    } else {
      if (selectedSeats.length >= 3) {
        triggerToast(
          "Batas Maksimal Kursi",
          "Kamu hanya dapat memilih maksimal hingga 3 kursi.",
          "error"
        );
        return;
      }
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  // 3. HANDLER KONFIRMASI & KLAIM PERMANEN KE SUPABASE
  const handleProceedToConfirm = () => {
    if (selectedSeats.length === 0) {
      triggerToast(
        "Pilih Kursi Dulu",
        "Silakan klik minimal 1 kursi hijau pada denah.",
        "error"
      );
      return;
    }
    setConflictSeat(null);
    setClaimStep(2);
  };

  const handleSimulateConflict = () => {
    const targetSeat = selectedSeats.includes("C12")
      ? "C12"
      : selectedSeats[0];
    setConflictSeat(targetSeat);

    setFloors((prev) => {
      const current = prev[selectedFloor];
      const updatedSeats = current.seats.map((s) =>
        s.id === targetSeat ? { ...s, status: "occupied" } : s
      );
      return {
        ...prev,
        [selectedFloor]: {
          ...current,
          available: Math.max(0, current.available - 1),
          seats: updatedSeats,
        },
      };
    });

    triggerToast(
      `Klaim gagal. Kursi ${targetSeat} sudah terisi.`,
      `Gagal mengklaim kursi karena ${targetSeat} baru saja diklaim pengunjung lain.`,
      "error"
    );
  };

  const handleConfirmClaim = async () => {
    if (conflictSeat) {
      triggerToast(
        "Pilih Ulang Kursi",
        `Silakan hapus atau ganti kursi ${conflictSeat} yang sudah terisi.`,
        "error"
      );
      return;
    }

    try {
      const result = await claimSeats({
        floorId: selectedFloor,
        seats: selectedSeats,
        duration,
        nim: currentUser.nim,
        bookingDate,
        startHour,
      });

      if (result.floors) {
        setFloors(result.floors);
      }

      const updatedHistory = await getHistory(currentUser.nim);
      setHistoryList(Array.isArray(updatedHistory) ? updatedHistory : []);

      setClaimStep(3);
      setShowSuccessModal(true);
    } catch (err) {
      if (err.conflictSeat) {
        setConflictSeat(err.conflictSeat);
        const latestFloors = await getFloors();
        if (latestFloors) setFloors(latestFloors);
      }
      triggerToast(
        "Klaim gagal",
        err.message || "Gagal menyimpan klaim ke Supabase.",
        "error"
      );
    }
  };

  const userInitials = (currentUser.nama || "NP")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // ============================================================================
  // RENDER HALAMAN LOGIN / DAFTAR / LUPA PASSWORD
  // ============================================================================
  if (!isLoggedIn) {
    return (
      <div className="login-wrapper fade-in">
        <div
          className="login-left"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.45) 0%, rgba(15, 23, 42, 0.88) 100%), url("/images/perpustakaan-upnvj.jpeg")`,
          }}
        >
          <div className="brand-logo">
            <div className="logo-box">📖</div>
            <div>
              <strong>Perpustakaan</strong>
              <span>UPNVJ</span>
            </div>
          </div>

          <div className="hero-text-box slide-up">
            <div className="tagline">
              <span></span>
            </div>
            <p></p>

            <div className="hero-stats">
              <div>
                <h3>{totalSeatsAll}</h3>
                <span>Kursi belajar</span>
              </div>
              <div>
                <h3>3</h3>
                <span>Lantai pilihan</span>
              </div>
              <div>
                <h3>08–20</h3>
                <span>Jam layanan WIB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box slide-up">
            <span className="portal-badge">PORTAL MAHASISWA</span>

            {authMode === "login" && (
              <>
                <h2>
                  Selamat datang
                  <br />
                  kembali.
                </h2>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>NIM / Email</label>
                    <div className="input-box">
                      <span className="icon-left">👤</span>
                      <input
                        type="text"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                        placeholder="Masukkan NIM atau email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-box">
                      <span className="icon-left">🔒</span>
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                      />
                      <button
                        type="button"
                        className="icon-right-btn"
                        onClick={() => setShowPass(!showPass)}
                        title="Lihat/Sembunyikan Password"
                      >
                        {showPass ? "👁️" : "🙈"}
                      </button>
                    </div>
                  </div>

                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span>Ingat saya</span>
                    </label>
                    <button
                      type="button"
                      className="text-btn-green"
                      onClick={() => {
                        setAuthMode("forgot");
                        setOtpSent(false);
                      }}
                    >
                      Lupa password?
                    </button>
                  </div>

                  <button type="submit" className="btn-primary-full">
                    Login <span>&rarr;</span>
                  </button>
                </form>

                <div className="help-footer">
                  <span>Belum punya akun? </span>
                  <button
                    type="button"
                    className="text-btn-green"
                    onClick={() => {
                      setAuthMode("register");
                      setNim("");
                      setPassword("");
                    }}
                  >
                    Daftar di sini
                  </button>
                </div>
              </>
            )}

            {authMode === "register" && (
              <>
                <h2>Daftar Akun Baru</h2>
                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Nama Lengkap</label>
                    <div className="input-box">
                      <span className="icon-left">🪪</span>
                      <input
                        type="text"
                        value={namaLengkap}
                        onChange={(e) => setNamaLengkap(e.target.value)}
                        placeholder="Contoh: Oktavia Ramadhani"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>NIM</label>
                    <div className="input-box">
                      <span className="icon-left">👤</span>
                      <input
                        type="text"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                        placeholder="Contoh: 2510511006"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Kampus UPNVJ</label>
                    <div className="input-box">
                      <span className="icon-left">✉️</span>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="nim@mahasiswa.upnvj.ac.id"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <div className="input-box">
                      <span className="icon-left">🔒</span>
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary-full">
                    Daftar Sekarang <span>&rarr;</span>
                  </button>
                </form>

                <div className="help-footer">
                  <span>Sudah punya akun? </span>
                  <button
                    type="button"
                    className="text-btn-green"
                    onClick={() => setAuthMode("login")}
                  >
                    Kembali ke Login
                  </button>
                </div>
              </>
            )}

            {authMode === "forgot" && (
              <>
                <h2>Reset Password</h2>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp}>
                    <div className="form-group">
                      <label>Email Terdaftar</label>
                      <div className="input-box">
                        <span className="icon-left">✉️</span>
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="Masukkan email UPNVJ Anda"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary-full">
                      Kirim Kode OTP <span>&rarr;</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword}>
                    <div className="form-group">
                      <label>Kode OTP 6 Digit</label>
                      <div className="input-box">
                        <span className="icon-left">🔑</span>
                        <input
                          type="text"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="Masukkan 6 digit kode OTP"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Password Baru</label>
                      <div className="input-box">
                        <span className="icon-left">🔒</span>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Masukkan password baru"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary-full">
                      Simpan Password Baru ✓
                    </button>
                  </form>
                )}

                <div className="help-footer">
                  <button
                    type="button"
                    className="text-btn-green"
                    onClick={() => setAuthMode("login")}
                  >
                    &larr; Kembali ke Login
                  </button>
                </div>
              </>
            )}

            <div className="copyright-text">
              🛡️ &copy; 2026 Perpustakaan UPNVJ &bull; Akses aman kampus
              <small style={{ display: "block", marginTop: 4 }}>
                API: {apiStatus}
              </small>
            </div>
          </div>
        </div>

        {toast.show && (
          <div className={`floating-toast ${toast.type} bounce-in`}>
            <div className="toast-icon">
              {toast.type === "success" ? "✔" : "✖"}
            </div>
            <div className="toast-body">
              <strong>{toast.title}</strong>
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close"
              onClick={() => setToast({ ...toast, show: false })}
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // LAYOUT UTAMA DASHBOARD MAHASISWA
  // ============================================================================
  const currentFloorObj = floors[selectedFloor] || INITIAL_FLOORS[3];
  const safeHistoryList = Array.isArray(historyList) ? historyList : [];
  const filteredHistory = safeHistoryList.filter((item) => {
    if (historyFilter === "Semua") return true;
    return item.status === historyFilter;
  });

  return (
    <div className="dashboard-layout fade-in">
      <aside className="sidebar">
        <div>
          <div
            className="sidebar-brand"
            onClick={() => setActiveMenu("home")}
            style={{ cursor: "pointer" }}
          >
            <div className="logo-box-green">📖</div>
            <div>
              <strong>Perpustakaan</strong>
              <span>UPNVJ</span>
            </div>
          </div>

          <div className="menu-group">
            <span className="menu-title">MENU UTAMA</span>
            <button
              className={`menu-item ${activeMenu === "home" ? "active" : ""}`}
              onClick={() => setActiveMenu("home")}
            >
              <span></span> Home
            </button>
            <button
              className={`menu-item ${activeMenu === "seats" ? "active" : ""}`}
              onClick={() => {
                setActiveMenu("seats");
                setClaimStep(1);
              }}
            >
              <span></span> Denah Kursi
            </button>
            <button
              className={`menu-item ${
                activeMenu === "history" ? "active" : ""
              }`}
              onClick={async () => {
                setActiveMenu("history");
                try {
                  const latestHistory = await getHistory(currentUser.nim);
                  setHistoryList(Array.isArray(latestHistory) ? latestHistory : []);
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <span></span> Riwayat
            </button>
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            className="librarian-btn"
            onClick={() =>
              triggerToast(
                "Pustakawan Online",
                `Halo ${(currentUser.nama || "Mahasiswa").split(" ")[0]}! Ada yang bisa kami bantu terkait ketersediaan kursi?`,
                "success"
              )
            }
          >
            💬 Hubungi pustakawan ↗
          </button>
          <p className="sidebar-copy">&copy; 2026 Perpustakaan UPNVJ</p>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <h4>Halo, {(currentUser.nama || "Mahasiswa").split(" ")[0]}</h4>
          </div>
          <div className="topbar-actions">
            <button
              className="profile-pill"
              onClick={() => setProfileModal(true)}
            >
              <span className="avatar-np">{userInitials}</span> Profil
            </button>
            <button
              className="logout-btn"
              onClick={() => {
                setIsLoggedIn(false);
                triggerToast(
                  "Berhasil Keluar",
                  "Sampai jumpa kembali di Perpustakaan UPNVJ!",
                  "success"
                );
              }}
            >
              ↪ Logout
            </button>
          </div>
        </header>

        <main className="content-container">
          {/* VIEW 1: DASHBOARD HOME */}
          {activeMenu === "home" && (
            <div className="home-view slide-up">
              <h1 className="page-title">
                Belajar lebih nyaman, mulai di sini.
              </h1>
              <p className="page-subtitle">
                Temukan kursi yang pas untuk rencana belajarmu hari ini.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span>Total kursi</span>
                    <span className="stat-icon"></span>
                  </div>
                  <h2>
                    {totalSeatsAll} <small>kursi</small>
                  </h2>
                </div>

                <div className="stat-card highlight-green">
                  <div className="stat-header">
                    <span>Tersedia</span>
                    <span className="stat-icon"></span>
                  </div>
                  <h2>
                    {availableSeatsAll} <small>kursi</small>
                  </h2>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span>Terisi</span>
                    <span className="stat-icon"></span>
                  </div>
                  <h2>
                    {occupiedSeatsAll} <small>kursi</small>
                  </h2>
                </div>
              </div>

              <div className="cta-banner">
                <div className="cta-left">
                  <button
                    className="btn-white-cta"
                    onClick={() => {
                      setActiveMenu("seats");
                      setClaimStep(1);
                    }}
                  >
                    Klaim Kursi Perpustakaan &rarr;
                  </button>
                </div>

                <div className="cta-right-box">
                  <h3>{availableSeatsAll}</h3>
                  <p>kursi tersedia</p>
                </div>
              </div>

              <h3 className="sub-heading">Pilih suasana belajarmu</h3>
              <div className="floor-cards-grid">
                {[1, 3, 4].map((fId) => {
                  const f = floors[fId];
                  return (
                    <div
                      key={fId}
                      className="floor-card"
                      onClick={() => {
                        handleSelectFloor(fId);
                        setActiveMenu("seats");
                      }}
                    >
                      <div className="floor-card-top">
                        <div>
                          <span className="floor-badge">{f.name}</span>
                          <h4>{f.area}</h4>
                        </div>
                        <span className="arrow-up-right">↗</span>
                      </div>
                      <p className="floor-desc">{f.desc}</p>
                      <div className="floor-progress-bar">
                        <div
                          className="floor-progress-fill"
                          style={{
                            width: `${(f.available / f.total) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="steps-info-box">
                <h4>Klaim kursi dalam 3 langkah</h4>
                <div className="steps-three-col">
                  <div className="step-col">
                    <div className="step-num">1</div>
                    <div>
                      <strong>Pilih kursi</strong>
                    </div>
                  </div>
                  <div className="step-col">
                    <div className="step-num">2</div>
                    <div>
                      <strong>Atur durasi</strong>
                    </div>
                  </div>
                  <div className="step-col">
                    <div className="step-num">3</div>
                    <div>
                      <strong>Mulai belajar</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: DENAH KURSI & KONFIRMASI */}
          {activeMenu === "seats" && (
            <div className="seats-view slide-up">
              <span className="section-tag">KLAIM KURSI</span>
              <h1 className="page-title">
                {claimStep === 1
                  ? "Pilih tempat belajarmu"
                  : "Konfirmasi pilihanmu"}
              </h1>
              <p className="page-subtitle">
                {claimStep === 1
                  ? "Klik kursi berwarna hijau pada denah untuk memilih tempat dudukmu."
                  : "Periksa kembali pilihan kursi dan jadwal sebelum mengklaim."}
              </p>

              <div className="stepper-bar">
                <div
                  className={`step-pill ${claimStep >= 1 ? "active" : ""}`}
                  onClick={() => setClaimStep(1)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="circle">{claimStep > 1 ? "✓" : "1"}</span>
                  Pilih kursi
                </div>
                <div className="step-line"></div>
                <div
                  className={`step-pill ${claimStep >= 2 ? "active" : ""}`}
                  onClick={() => {
                    if (selectedSeats.length > 0) setClaimStep(2);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <span className="circle">2</span>
                  Konfirmasi
                </div>
                <div className="step-line"></div>
                <div className={`step-pill ${claimStep === 3 ? "active" : ""}`}>
                  <span className="circle">3</span>
                  Selesai
                </div>
              </div>

              {claimStep === 1 && (
                <>
                  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    background: "#ffffff",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #E2E8F0",
    marginBottom: "14px",
  }}
>
  <div>
    <strong style={{ fontSize: "14px", display: "block" }}>
      Tanggal Kunjungan: {selectedDateLabel}
    </strong>
    <small style={{ color: "#64748B" }}>
      Denah menampilkan kursi merah yang sudah dipesan pada tanggal ini.
    </small>
  </div>
  <input
    type="date"
    min={isLibraryClosedNow ? tomorrowISO : todayISO}
    value={bookingDate}
    onChange={(e) => {
      const val = e.target.value;
      const pickedDay = new Date(`${val}T00:00:00`).getDay();
      if (pickedDay === 0) {
        triggerToast(
          "Perpustakaan Tutup (Minggu)",
          "Perpustakaan UPNVJ tutup pada hari Minggu. Silakan pilih Senin–Sabtu.",
          "error"
        );
        return;
      }
      setBookingDate(val);
      setSelectedSeats([]);
      if (val === todayISO && startHour < currentHourNow) {
        setStartHour(Math.max(8, currentHourNow));
      }
    }}
    style={{
      padding: "8px 12px",
      borderRadius: "10px",
      border: "1px solid #CBD5E1",
      fontSize: "14px",
    }}
  />
</div>
                  <div className="floor-tabs">
                    {[1, 3, 4].map((fId) => (
                      <button
                        key={fId}
                        className={`floor-tab-btn ${
                          selectedFloor === fId ? "active" : ""
                        }`}
                        onClick={() => handleSelectFloor(fId)}
                      >
                        <strong>Lantai {fId}</strong>
                        <span>{floors[fId].available} tersedia</span>
                      </button>
                    ))}
                  </div>

                  <div className="map-card">
                    <div className="map-card-header">
                      <div>
                        <h3>{currentFloorObj.area}</h3>
                        <span>
                          {currentFloorObj.total} kursi &bull;{" "}
                          {currentFloorObj.name}
                        </span>
                      </div>
                      <span className="available-badge">
                        ● {currentFloorObj.available} tersedia
                      </span>
                    </div>

                    <div className="map-canvas">
                      <SeatMap
                        floorId={selectedFloor}
                        seats={currentFloorObj.seats}
                        selectedSeats={selectedSeats}
                        onSeatClick={toggleSeat}
                      />
                    </div>
                  </div>

                  <p className="map-Caption">
                    Kursi merah sedang digunakan dan tidak dapat dipilih.
                    Ketersediaan diperiksa lagi saat klaim.
                  </p>

                  <div className="selection-bottom-bar">
                    <div className="selection-info">
                      <div>
                        <strong>{selectedSeats.length} kursi dipilih</strong>
                        <p>
                          {selectedSeats.length > 0
                            ? `${currentFloorObj.name} • ${selectedSeats.join(
                                ", "
                              )}`
                            : "Belum ada kursi yang dipilih"}
                        </p>
                      </div>
                      {selectedSeats.length > 0 && (
                        <button
                          className="clear-selection-btn"
                          onClick={() => setSelectedSeats([])}
                        >
                          Hapus pilihan
                        </button>
                      )}
                    </div>

                    <button
                      className="btn-primary-action"
                      onClick={handleProceedToConfirm}
                    >
                      Lanjutkan Klaim &rarr;
                    </button>
                  </div>
                </>
              )}

              {claimStep >= 2 && (
                <div className="confirm-container slide-up">
                  {conflictSeat && (
                    <div className="conflict-alert-banner bounce-in">
                      <span className="alert-icon">⚠️</span>
                      <div style={{ flex: 1 }}>
                        <strong>
                          Klaim gagal. Kursi {conflictSeat} sudah terisi.
                        </strong>
                        <p>
                          Gagal mengklaim kursi karena {conflictSeat} baru saja
                          diklaim oleh pengunjung lain. Silakan pilih kursi
                          pengganti di denah.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="confirm-two-col">
                    <div className="confirm-left-col">
                      <div className="white-card">
                        <div className="card-flex-between">
                          <h4>Ringkasan kursi</h4>
                          <button
                            className="text-btn-green"
                            onClick={() => setClaimStep(1)}
                          >
                            Ubah pilihan
                          </button>
                        </div>

                        <div className="selected-chips-row">
                          {selectedSeats.map((id) => (
                            <span
                              key={id}
                              className={`seat-chip ${
                                conflictSeat === id ? "chip-conflict" : ""
                              }`}
                            >
                              🪑 {id}{" "}
                              {conflictSeat === id && " (Tidak tersedia)"}
                            </span>
                          ))}
                        </div>

                        <div className="summary-meta-grid">
                          <div>
                            <small>Lantai</small>
                            <strong>{currentFloorObj.name}</strong>
                          </div>
                          <div>
                            <small>Area</small>
                            <strong>
                              {currentFloorObj.area.replace("Area ", "")}
                            </strong>
                          </div>
                          <div>
                            <small>Tanggal</small>
                            <strong>{selectedDateLabel}</strong>
                          </div>
                          <div>
                            <small>Total kursi</small>
                            <strong>{selectedSeats.length} kursi</strong>
                          </div>
                        </div>
                      </div>

                      <div className="white-card">
                        <h4>Jadwal & durasi belajar</h4>
                        <p className="card-sub">
                          Jam operasional Perpustakaan UPNVJ: 08.00 – 20.00 WIB.
                        </p>

                        {isLibraryClosedNow && (
                          <div
                            style={{
                              background: "#FEF3C7",
                              border: "1px solid #F59E0B",
                              color: "#92400E",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              fontSize: "13px",
                              marginBottom: "14px",
                            }}
                          >
                            🕒 <strong>Perpustakaan sudah tutup untuk hari ini</strong> (di atas pukul 20.00 WIB). Silakan pilih <strong>tanggal</strong> dan <strong>jam kedatangan</strong> untuk jadwal berikutnya.
                          </div>
                        )}

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "16px",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              Tanggal Kunjungan
                            </label>
                            <input
                              type="date"
                              min={isLibraryClosedNow ? tomorrowISO : todayISO}
                              value={bookingDate}
                              onChange={(e) => {
  const val = e.target.value;
  const pickedDay = new Date(`${val}T00:00:00`).getDay();
  if (pickedDay === 0) {
    triggerToast(
      "Perpustakaan Tutup (Minggu)",
      "Perpustakaan UPNVJ tutup pada hari Minggu. Silakan pilih Senin–Sabtu.",
      "error"
    );
    return;
  }
  setBookingDate(val);
  if (val === todayISO && startHour < currentHourNow) {
    setStartHour(Math.max(8, currentHourNow));
  }
}}
                              style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                border: "1px solid #CBD5E1",
                                fontSize: "14px",
                              }}
                            />
                          </div>

                          <div>
                            <label
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                display: "block",
                                marginBottom: 6,
                              }}
                            >
                              Jam Mulai
                            </label>
                            <select
                              value={startHour}
                              onChange={(e) => setStartHour(Number(e.target.value))}
                              style={{
                                width: "100%",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                border: "1px solid #CBD5E1",
                                fontSize: "14px",
                                background: "#fff",
                              }}
                            >
                              {Array.from({ length: 12 }, (_, i) => i + 8).map((hr) => {
                                const disabledPast =
                                  bookingDate === todayISO && hr < currentHourNow;
                                return (
                                  <option key={hr} value={hr} disabled={disabledPast}>
                                    {String(hr).padStart(2, "0")}.00 WIB{" "}
                                    {disabledPast ? "(Sudah lewat)" : ""}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>

                        <div className="duration-grid">
                          {[1, 2, 3].map((jam) => {
                            const endHr = Math.min(20, startHour + jam);
                            return (
                              <button
                                key={jam}
                                type="button"
                                className={`duration-card ${
                                  duration === jam ? "active" : ""
                                }`}
                                onClick={() => setDuration(jam)}
                              >
                                <div className="dur-top">
                                  <strong>{jam} Jam</strong>
                                  <span className="radio-dot"></span>
                                </div>
                                <p>
                                  {String(startHour).padStart(2, "0")}.00 –{" "}
                                  {String(endHr).padStart(2, "0")}.00
                                </p>
                                <small>Durasi {jam} jam</small>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="confirm-right-col">
                      {!conflictSeat ? (
                        <div className="white-card">
                          <h4>Sebelum kamu klaim</h4>
                          <ul className="rules-list">
                            <li>
                              <span>✅</span>
                              <div>
                                <strong>Gunakan kursi sesuai nomor</strong>
                                <p>
                                  Pastikan tempat dudukmu sesuai dengan kursi
                                  yang diklaim.
                                </p>
                              </div>
                            </li>
                            <li>
                              <span>⏰</span>
                              <div>
                                <strong>Perhatikan waktu selesai</strong>
                                <p>
                                  Kosongkan kursi saat durasi berakhir agar
                                  dapat digunakan kembali.
                                </p>
                              </div>
                            </li>
                            <li>
                              <span>🤫</span>
                              <div>
                                <strong>Jaga kenyamanan bersama</strong>
                                <p>
                                  Jaga kebersihan dan hormati pengunjung lain.
                                </p>
                              </div>
                            </li>
                          </ul>

                          <div className="user-mini-card">
                            <div className="avatar-np">{userInitials}</div>
                            <div>
                              <strong>{currentUser.nama}</strong>
                              <span>NIM {currentUser.nim}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="white-card conflict-side-card">
                        </div>
                      )}

                      <div className="demo-conflict-box">
                      </div>
                    </div>
                  </div>

                  <div className="selection-bottom-bar">
                    <div>
                      <strong>
                        {selectedSeats.length} kursi &bull; {duration} jam
                      </strong>
                      <p>
                        {selectedDateLabel} &bull; {String(startHour).padStart(2, "0")}.00–
                        {String(Math.min(20, startHour + duration)).padStart(2, "0")}.00 WIB
                      </p>
                    </div>
                    <div className="bottom-btn-group">
                      <button
                        className="btn-secondary"
                        onClick={() => setClaimStep(1)}
                      >
                        Kembali
                      </button>
                      <button
                        className="btn-primary-action"
                        onClick={handleConfirmClaim}
                      >
                        Klaim Sekarang ✓
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW 3: RIWAYAT KLAIM KURSI (AMAN ANTI LAYAR PUTIH) */}
          {activeMenu === "history" && (
            <div className="history-view slide-up">
              <span className="section-tag">AKTIVITAS MAHASISWA</span>
              <h1 className="page-title">Riwayat klaim kursi</h1>
              <p className="page-subtitle">
                Semua tempat dan waktu belajar, tersimpan di database Supabase.
              </p>

              {safeHistoryList.some((h) => h.status === "Aktif") && safeHistoryList[0] && (
                <div className="active-claim-banner">
                  <div className="active-banner-left">
                    <div className="clock-icon-box">🕒</div>
                    <div>
                      <strong>
                        Kursimu aktif ({safeHistoryList[0].time || "-"})
                      </strong>
                      <p>
                        {(Array.isArray(safeHistoryList[0].seats)
                          ? safeHistoryList[0].seats
                          : []
                        ).join(", ")}{" "}
                        &bull; {safeHistoryList[0].floor} &bull;{" "}
                        {safeHistoryList[0].fullDate || safeHistoryList[0].date}
                      </p>
                    </div>
                  </div>
                  <div className="active-banner-right">
                    <span className="code-pill">{safeHistoryList[0].code}</span>
                    <strong>
                      {(Array.isArray(safeHistoryList[0].seats)
                        ? safeHistoryList[0].seats
                        : []
                      ).length}{" "}
                      kursi &bull; {safeHistoryList[0].duration}
                    </strong>
                  </div>
                </div>
              )}

              <div className="history-Single-bar">
                <div className="filter-tabs">
                  {["Semua", "Aktif", "Selesai"].map((tab) => {
                    const count =
                      tab === "Semua"
                        ? safeHistoryList.length
                        : safeHistoryList.filter((h) => h.status === tab).length;
                    return (
                      <button
                        key={tab}
                        className={`filter-tab ${
                          historyFilter === tab ? "active" : ""
                        }`}
                        onClick={() => setHistoryFilter(tab)}
                      >
                        {tab} ({count})
                      </button>
                    );
                  })}
                </div>
                <div className="month-picker">📅 {currentMonthYear}</div>
              </div>

              <div className="table-card">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Nomor kursi</th>
                      <th>Lantai</th>
                      <th>Tanggal</th>
                      <th>Waktu</th>
                      <th>Durasi</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: "center", padding: 24 }}>
                          Belum ada riwayat klaim untuk akun ini.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item, idx) => {
                        const seatList = Array.isArray(item.seats) ? item.seats : [];
                        return (
                          <tr key={item.code || idx}>
                            <td>
                              <strong>{seatList.join(", ") || "-"}</strong>
                              <span className="sub-code">{item.code}</span>
                            </td>
                            <td>{item.floor}</td>
                            <td>{item.date}</td>
                            <td>{item.time}</td>
                            <td>{item.duration}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  item.status === "Aktif" ? "aktif" : "selesai"
                                }`}
                              >
                                ● {item.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="detail-link-btn"
                                onClick={() => setDetailModalItem(item)}
                              >
                                Detail &gt;
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                <div className="table-footer">
                  <span>
                    Menampilkan 1–{filteredHistory.length} dari{" "}
                    {filteredHistory.length} klaim &bull; Status Selesai berarti
                    durasi klaim sudah berakhir.
                  </span>
                  <div className="pagination">
                    <button disabled>&lt;</button>
                    <button className="active">1</button>
                    <button disabled>&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL POPUP KLAIM BERHASIL */}
      {showSuccessModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-card bounce-in">
            <button
              className="modal-close"
              onClick={() => setShowSuccessModal(false)}
            >
              ✕
            </button>
            <div className="modal-success-icon">✓</div>
            <h2>Klaim Kursi Berhasil!</h2>
            <p className="modal-sub">
              Tempat belajarmu sudah siap, {(currentUser.nama || "Mahasiswa").split(" ")[0]}.
              Selamat belajar dengan nyaman!
            </p>

            <div className="ticket-box">
              <div className="ticket-top">
                <span className="ticket-code">{safeHistoryList[0]?.code}</span>
                <span className="status-badge aktif">● Aktif</span>
              </div>
              <div className="ticket-row">
                <span>Nomor kursi</span>
                <strong>{selectedSeats.join(", ")}</strong>
              </div>
              <div className="ticket-row">
                <span>Lantai / total</span>
                <strong>
                  Lantai {selectedFloor} &bull; {selectedSeats.length} kursi
                </strong>
              </div>
              <div className="ticket-row">
                <span>Tanggal</span>
                <strong>{selectedDateLabel}</strong>
              </div>
              <div className="ticket-row">
                <span>Waktu</span>
                <strong>{safeHistoryList[0]?.time}</strong>
              </div>
              <div className="ticket-row">
                <span>Durasi</span>
                <strong>{safeHistoryList[0]?.duration || `${duration} jam`}</strong>
              </div>
            </div>

            <button
              className="btn-primary-full"
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedSeats([]);
                setActiveMenu("history");
              }}
            >
              Lihat Riwayat &rarr;
            </button>
            <button
              className="btn-ghost-full"
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedSeats([]);
                setActiveMenu("home");
              }}
            >
              Kembali ke Home
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL RIWAYAT */}
      {detailModalItem && (
        <div className="modal-overlay fade-in">
          <div className="modal-card bounce-in">
            <button
              className="modal-close"
              onClick={() => setDetailModalItem(null)}
            >
              ✕
            </button>
            <h3>Detail Tiket Klaim Kursi</h3>
            <p className="modal-sub">Informasi lengkap riwayat reservasi Anda.</p>
            <div className="ticket-box">
              <div className="ticket-top">
                <span className="ticket-code">{detailModalItem.code}</span>
                <span
                  className={`status-badge ${
                    detailModalItem.status === "Aktif" ? "aktif" : "selesai"
                  }`}
                >
                  ● {detailModalItem.status}
                </span>
              </div>
              <div className="ticket-row">
                <span>Nomor Kursi</span>
                <strong>
                  {(Array.isArray(detailModalItem.seats)
                    ? detailModalItem.seats
                    : []
                  ).join(", ") || "-"}
                </strong>
              </div>
              <div className="ticket-row">
                <span>Lokasi</span>
                <strong>
                  {detailModalItem.floor} ({detailModalItem.area})
                </strong>
              </div>
              <div className="ticket-row">
                <span>Tanggal</span>
                <strong>{detailModalItem.fullDate}</strong>
              </div>
              <div className="ticket-row">
                <span>Waktu & Durasi</span>
                <strong>
                  {detailModalItem.time} ({detailModalItem.duration})
                </strong>
              </div>
            </div>
            <button
              className="btn-primary-full"
              onClick={() => setDetailModalItem(null)}
            >
              Tutup Detail
            </button>
          </div>
        </div>
      )}

      {/* MODAL PROFIL MAHASISWA */}
      {profileModal && (
        <div className="modal-overlay fade-in">
          <div className="modal-card bounce-in">
            <button
              className="modal-close"
              onClick={() => setProfileModal(false)}
            >
              ✕
            </button>
            <div className="avatar-np-large">{userInitials}</div>
            <h3>{currentUser.nama}</h3>
            <p className="modal-sub">
              Mahasiswa Aktif &bull; {currentUser.fakultas} UPNVJ
            </p>
            <div className="ticket-box">
              <div className="ticket-row">
                <span>NIM</span>
                <strong>{currentUser.nim}</strong>
              </div>
              <div className="ticket-row">
                <span>Email</span>
                <strong>{currentUser.email}</strong>
              </div>
              <div className="ticket-row">
                <span>Fakultas</span>
                <strong>{currentUser.fakultas}</strong>
              </div>
              <div className="ticket-row">
                <span>Status Akun</span>
                <strong className="green-text">Terverifikasi Akademik</strong>
              </div>
            </div>
            <button
              className="btn-primary-full"
              onClick={() => setProfileModal(false)}
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toast.show && (
        <div className={`floating-toast ${toast.type} bounce-in`}>
          <div className="toast-icon">
            {toast.type === "success" ? "✔" : "✖"}
          </div>
          <div className="toast-body">
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            className="toast-close"
            onClick={() => setToast({ ...toast, show: false })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}