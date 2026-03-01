// import React, { useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import wallpaper from "../../assets/login_wallp.png";
// import { MdEmail, MdPassword } from "react-icons/md";
// import axios from "axios";

// const Login = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState({
//     email: "",
//     password: "",
//   });
//   const [logging, setLogging] = useState(false);
//   const login = () => {
//     let config = {
//       method: "post",
//       maxBodyLength: Infinity,
//       url: "http://localhost:3000/auth/login",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       data: data,
//     };

//     axios
//       .request(config)
//       .then((response) => {
//         console.log(JSON.stringify(response.data));
//         localStorage.setItem("token", response.data.tokens.access.token);
//         localStorage.setItem("data", JSON.stringify(response.data.user));
//         navigate("/");
//       })
//       .catch((error) => {
//         console.log(error);
//       });
//   };
//   return (
//     <div className="w-full h-screen flex">
//       <div className="flex flex-col px-36 py-6 flex-grow max-w-[60vw]">
//         <div className="mt-32 max-w-[600px]">
//           <h1 className="text-5xl leading-tight font-semibold mt-4 text-transparent bg-clip-text bg-gradient-to-r to-sky-600 from-sky-400">
//             SoulSupport.ai
//           </h1>
//           <h1 className="mt-4 text-2xl font-normal ">
//             Empowering your journey to mental well-being with a stigma-free 3D
//             companion
//           </h1>
//         </div>
//         <img src={wallpaper} className="w-[450px]" />
//       </div>
//       <div className="flex justify-between flex-grow bg-[#02203c] text-sky-300">
//         <div className="p-8 w-full min-h-[300px] px-24 self-center">
//           <div
//             className="flex flex-col justify-center gap-6"
//             // onSubmit={(e) => login(e)}
//           >
//             <h1 className="text-3xl font-semibold">Login!</h1>
//             <p className="text-md font-medium">
//               Enter your creds to heal yourself!
//             </p>
//             <div className="bg-sky-900 shadow p-2 flex items-center rounded-md">
//               <MdEmail className="text-sky-500 mr-2" size={18} />
//               <input
//                 type="text"
//                 placeholder="Enter your email"
//                 className="p-1 w-full text-sm outline-none bg-inherit"
//                 value={data.email}
//                 onChange={(e) => setData({ ...data, email: e.target.value })}
//               />
//             </div>

//             <div className="bg-sky-900 shadow p-2 flex items-center rounded-md">
//               <MdPassword className="text-sky-500 mr-2" size={18} />
//               <input
//                 type="password"
//                 placeholder="Enter your password"
//                 className="p-1 text-sm w-full outline-none bg-inherit"
//                 value={data.password}
//                 onChange={(e) => setData({ ...data, password: e.target.value })}
//               />
//             </div>

//             <button
//               onClick={() => login()}
//               className="bg-gradient-to-bl from-sky-600 to-sky-300 bg-[position:_0%_0%] hover:bg-[position:_100%_100%] bg-[size:_200%] transition-all duration-500 text-[#02203c] p-3 rounded-md"
//             >
//               {logging ? "Logging in..." : "Login"}
//             </button>
//             <Link to="/signup" className="text-sky-600 mt-4 font-medium">
//               Do not have an account? Sign Up
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import wallpaper from "../../assets/login_wallp.png";
import { MdEmail, MdPassword } from "react-icons/md";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const login = () => {
    // Reset error message
    setError("");

    // Set logging state to show loading indicator
    setLogging(true);

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:3000/auth/login",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        // Store token in localStorage
        localStorage.setItem("token", response.data.tokens.access.token);
        // Store user data in localStorage
        localStorage.setItem("data", JSON.stringify(response.data.user));
        // Redirect to home page
        navigate("/home");
      })
      .catch((error) => {
        console.log(error);
        // Set error message for user
        setError(
          error.response?.data?.message ||
            "Login failed. Please check your credentials."
        );
      })
      .finally(() => {
        // Reset logging state regardless of outcome
        setLogging(false);
      });
  };

  // Handle form submission with Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div className="w-full h-screen flex bg-slate-950">
      <div className="flex flex-col px-16 lg:px-36 py-6 flex-grow max-w-[60vw]">
        <div className="mt-32 max-w-[600px]">
          <h1 className="text-5xl leading-tight font-semibold mt-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Sakhi
          </h1>
          <h1 className="mt-4 text-xl font-normal text-slate-400 leading-relaxed">
            Empowering your journey to mental well-being with a stigma-free 3D
            companion
          </h1>
        </div>
        <img src={wallpaper} className="w-[400px] mt-6 opacity-80" alt="Login wallpaper" />
      </div>
      <div className="flex justify-between flex-grow bg-slate-900 border-l border-white/5 text-slate-300">
        <div className="p-8 w-full min-h-[300px] px-16 lg:px-24 self-center">
          <div className="flex flex-col justify-center gap-5">
            <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400">
              Sign in to continue your healing journey
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
              <MdEmail className="text-teal-400 mr-2" size={18} />
              <input
                type="text"
                placeholder="Enter your email"
                className="p-1 w-full text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
              <MdPassword className="text-teal-400 mr-2" size={18} />
              <input
                type="password"
                placeholder="Enter your password"
                className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                onKeyDown={handleKeyDown}
              />
            </div>

            <button
              onClick={login}
              disabled={logging}
              className={`bg-gradient-to-r from-teal-500 to-cyan-500 ${
                logging
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:shadow-lg hover:shadow-teal-500/20"
              } transition-all duration-300 text-white font-medium p-3 rounded-xl`}
            >
              {logging ? "Logging in..." : "Login"}
            </button>
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 mt-2 text-sm font-medium transition-colors">
              Don't have an account? Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
