import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiWind, FiTarget } from "react-icons/fi";
import { MdQuiz } from "react-icons/md";
import { BiSolidReport, BiLogOut, BiSolidPhoneCall } from "react-icons/bi";
import { FaUserDoctor, FaAward } from "react-icons/fa6";
import { BsJournalText } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";

const navigations = [
  {
    id: 1,
    name: "Home",
    path: "/",
    Icon: ({ color }) => <FiHome size={25} color={color} />,
  },
  {
    id: 2,
    name: "Insights",
    path: "/insights",
    childPaths: ["/Dashboard", "/soul-report"],
    Icon: ({ color }) => <BiSolidReport size={25} color={color} />,
  },
  {
    id: 3,
    name: "Assessments",
    path: "/assessments",
    childPaths: ["/reports", "/diet-plan"],
    Icon: ({ color }) => <MdQuiz size={25} color={color} />,
  },
  {
    id: 4,
    name: "Activities",
    path: "/activities",
    childPaths: ["/plans", "/rewards"],
    Icon: ({ color }) => <FiTarget size={25} color={color} />,
  },
  {
    id: 5,
    name: "Progress",
    path: "/progress",
    childPaths: ["/goals", "/journal"],
    Icon: ({ color }) => <BsJournalText size={25} color={color} />,
  },
  {
    id: 6,
    path: "/breathing",
    name: "Breathing",
    Icon: ({ color }) => <FiWind size={25} color={color} />,
  },
  {
    id: 7,
    name: "Search Doctors",
    path: "/search-doctors",
    Icon: ({ color }) => <FaUserDoctor size={25} color={color} />,
  },
  {
    id: 8,
    name: "Emergency Call",
    path: "/emergency",
    Icon: ({ color }) => <BiSolidPhoneCall size={25} color={color} />,
  },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleEmergency = async () => {
    const email = JSON.parse(localStorage.getItem("data") || "{}")?.email;
    if (!email) {
      toast.error("No logged-in user found for emergency alert.", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    toast.error("Hold tight! Calling emergency contact...", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    try {
      const { data } = await axios.post("http://localhost:3000/emergency", {
        email,
        message: "User triggered emergency assistance from Sakhi.",
      });
      toast.success(`Emergency call queued: ${data.callSid}`, {
        position: "top-right",
        autoClose: 6000,
      });
    } catch (err) {
      const msg = err?.response?.data?.error || "Emergency alert failed.";
      toast.error(msg, {
        position: "top-right",
        autoClose: 6000,
      });
    }
  };

  return (
    <div className="py-6 px-4 w-[20vw] h-screen bg-white shadow-lg flex flex-col justify-between">
      <div>
        {/* Logo section */}
        <div className="flex items-center mb-8">
          <img
            src={logo}
            className="w-12 h-12 mr-2"
            alt="SoulSupport.ai Logo"
          />
          <h1 className="text-2xl text-teal-500 font-bold">Sakhi</h1>
        </div>

        {/* Navigation section */}
        <div className="overflow-y-auto">
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
                }}
                className="block mb-1 transition-all duration-200 hover:bg-teal-50 rounded-md"
              >
                <div
                  className={`flex flex-row items-center py-3 px-4 rounded-md ${
                    isActive ? "bg-teal-100" : ""
                  }`}
                >
                  <nav.Icon color={isActive ? "#115E59" : "#5A5A5A"} />
                  <h1
                    className={`text-lg ml-3 ${
                      isActive ? "text-teal-800 font-semibold" : "text-gray-700"
                    }`}
                  >
                    {nav.name}
                  </h1>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout section */}
      <button
        onClick={logout}
        className="mt-auto flex flex-row items-center py-3 px-4 rounded-md text-red-500 hover:bg-red-50 transition-all duration-200"
      >
        <BiLogOut size={25} />
        <h1 className="text-lg ml-3 font-medium">Logout</h1>
      </button>

      <ToastContainer />
    </div>
  );
};

export default Navbar;
