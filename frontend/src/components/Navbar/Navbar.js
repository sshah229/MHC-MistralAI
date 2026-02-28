import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiActivity } from "react-icons/fi";
import { SiPlanet } from "react-icons/si";
import { BiSolidReport, BiLogOut, BiSolidPhoneCall } from "react-icons/bi";
import { FaUserDoctor, FaAward } from "react-icons/fa6";
import { MdOutlineFoodBank } from "react-icons/md";
import { BsFillChatLeftTextFill, BsJournalText } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../../assets/logo.png";

// Custom Target Logo component for Goal Tracker
const TargetLogo = ({ color = "#CC0000", size = 25 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
    >
      {/* Outer circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke={color}
        strokeWidth="10"
      />

      {/* Middle circle */}
      <circle
        cx="50"
        cy="50"
        r="25"
        fill="none"
        stroke={color}
        strokeWidth="10"
      />

      {/* Inner circle (bullseye) */}
      <circle cx="50" cy="50" r="10" fill={color} />
    </svg>
  );
};

const navigations = [
  {
    id: 1,
    name: "Home",
    path: "/",
    Icon: ({ color }) => <FiHome size={25} color={color} />,
  },
  {
    id: 2,
    name: "Dashboard",
    path: "/Dashboard",
    Icon: ({ color }) => <FiActivity size={25} color={color} />,
  },
  {
    id: 3,
    name: "Plans",
    path: "/plans",
    Icon: ({ color }) => <SiPlanet size={25} color={color} />,
  },
  {
    id: 4,
    name: "Reports",
    path: "/reports",
    Icon: ({ color }) => <BiSolidReport size={25} color={color} />,
  },
  {
    id: 5,
    path: "/goals",
    name: "Goal Tracker",
    Icon: ({ color }) => <TargetLogo size={25} color={color} />, // Target logo for Goal Tracker
  },
  {
    id: 6,
    name: "Search Doctors",
    path: "/search-doctors",
    Icon: ({ color }) => <FaUserDoctor size={25} color={color} />,
  },
  {
    id: 7,
    path: "/diet-plan",
    name: "Diet Plan",
    Icon: ({ color }) => <MdOutlineFoodBank size={25} color={color} />,
  },
  {
    id: 8,
    path: "/rewards",
    name: "Rewards",
    Icon: ({ color }) => <FaAward size={25} color={color} />,
  },
  {
    id: 9,
    path: "/journal",
    name: "Journal",
    Icon: ({ color }) => <BsJournalText size={25} color={color} />, // Changed from FaAward to a journal icon
  },
  {
    id: 10,
    name: "Emergency Call",
    path: "/emergency", // Added a path for emergency
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

  const handleEmergency = () => {
    toast.error("Hold Tight! Help Being Sent", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    // Additional emergency logic can go here
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
          {navigations.map((nav) => (
            <Link
              to={nav.path}
              key={nav.id}
              onClick={() => {
                if (nav.name === "Emergency Call") {
                  handleEmergency();
                }
              }}
              className="block mb-1 transition-all duration-200 hover:bg-teal-50 rounded-md"
            >
              <div
                className={`flex flex-row items-center py-3 px-4 rounded-md ${
                  location.pathname === nav.path ? "bg-teal-100" : ""
                }`}
              >
                <nav.Icon
                  color={location.pathname === nav.path ? "#115E59" : "#5A5A5A"}
                />
                <h1
                  className={`text-lg ml-3 ${
                    location.pathname === nav.path
                      ? "text-teal-800 font-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {nav.name}
                </h1>
              </div>
            </Link>
          ))}
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
