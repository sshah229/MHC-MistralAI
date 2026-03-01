import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiWind, FiTarget, FiMenu, FiX } from "react-icons/fi";
import { MdQuiz } from "react-icons/md";
import { BiSolidReport, BiLogOut, BiSolidPhoneCall } from "react-icons/bi";
import { FaUserDoctor } from "react-icons/fa6";
import { BsJournalText } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";

const navigations = [
  { id: 1, name: "Home", path: "/home", Icon: FiHome },
  { id: 2, name: "Insights", path: "/insights", childPaths: ["/Dashboard", "/soul-report"], Icon: BiSolidReport },
  { id: 3, name: "Assessments", path: "/assessments", childPaths: ["/reports", "/diet-plan"], Icon: MdQuiz },
  { id: 4, name: "Activities", path: "/activities", childPaths: ["/plans", "/rewards"], Icon: FiTarget },
  { id: 5, name: "Progress", path: "/progress", childPaths: ["/goals", "/journal"], Icon: BsJournalText },
  { id: 6, name: "Breathing", path: "/breathing", Icon: FiWind },
  { id: 7, name: "Search Doctors", path: "/search-doctors", Icon: FaUserDoctor },
  { id: 8, name: "Emergency Call", path: "/emergency", Icon: BiSolidPhoneCall },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEmergency = async () => {
    const email = JSON.parse(localStorage.getItem("data") || "{}")?.email;
    if (!email) {
      toast.error("No logged-in user found for emergency alert.", { position: "top-right", autoClose: 5000 });
      return;
    }
    toast.error("Hold tight! Calling emergency contact...", { position: "top-right", autoClose: 5000 });
    try {
      const { data } = await axios.post("http://localhost:3000/emergency", {
        email,
        message: "User triggered emergency assistance from Sakhi.",
      });
      toast.success(`Emergency call queued: ${data.callSid}`, { position: "top-right", autoClose: 6000 });
    } catch (err) {
      toast.error(err?.response?.data?.error || "Emergency alert failed.", { position: "top-right", autoClose: 6000 });
    }
  };

  return (
    <>
      {/* Hamburger button — always visible */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed top-4 left-4 z-[1100] p-2 rounded-lg bg-slate-800/80 backdrop-blur border border-white/10 text-slate-300 hover:text-white hover:bg-slate-700 transition-all ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <FiMenu size={22} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-[1200] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 z-[1300] bg-slate-900 border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <img src={logo} className="w-9 h-9" alt="Sakhi" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Sakhi
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 mt-2">
          {navigations.map((nav) => {
            const isActive =
              location.pathname === nav.path ||
              (nav.childPaths && nav.childPaths.includes(location.pathname));

            return (
              <Link
                to={nav.path}
                key={nav.id}
                onClick={(e) => {
                  if (nav.name === "Emergency Call") {
                    e.preventDefault();
                    handleEmergency();
                  }
                  setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 mb-0.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-teal-500/15 text-teal-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                <nav.Icon size={18} />
                <span>{nav.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <BiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <ToastContainer />
    </>
  );
};

export default Navbar;
