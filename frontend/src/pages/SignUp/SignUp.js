import React, { Fragment, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdEmail, MdPassword, MdPerson, MdCheck } from "react-icons/md";
import { PiCaretUpDownBold } from "react-icons/pi";
import wallpaper from "../../assets/login_wallp.png";
import { Tab, Listbox, Transition } from "@headlessui/react";
import axios from "axios";

const classNames = (...classes) => {
  return classes.filter(Boolean).join(" ");
};

const gender = [{ name: "Male" }, { name: "Female" }, { name: "Other" }];

const SignUp = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [pass, setPass] = useState("");
  const [data, setData] = useState({
    email: "",
    name: "",
    password: "",
    address: "",
    age: "",
    height: "",
    sex: 0,
    weight: "",
    condition: "",
    history: "",
    emergency1: "",
    emergency2: "",
  });
  const register = () => {
    if (
      data.email === "" ||
      data.password === "" ||
      data.name === "" ||
      data.address === "" ||
      data.age === "" ||
      data.height === "" ||
      data.weight === "" ||
      data.condition === "" ||
      data.history === "" ||
      data.emergency1 === "" ||
      data.emergency2 === ""
    ) {
      alert("Please fill all the fields");
      return;
    } else if (data.password !== pass) {
      alert("Passwords don't match");
      return;
    } else if (data.password.length < 8 || !/\d/.test(data.password) || !/[a-zA-Z]/.test(data.password)) {
      alert("Password must be at least 8 characters and contain at least 1 letter and 1 number");
      return;
    }
    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:3000/auth/register",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(data),
    };
    axios
      .request(config)
      .then((response) => {
        console.log(JSON.stringify(response.data));
        alert("Registration successful! Please login.");
        navigate("/login");
      })
      .catch((error) => {
        console.log(error);
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Registration failed. Make sure password is at least 8 characters with at least 1 letter and 1 number.";
        alert(msg);
      });
  };
  return (
    <div className="w-full h-screen flex bg-slate-950">
      <div className="flex flex-col px-16 lg:px-36 py-6 flex-grow max-w-[50vw]">
        <div className="mt-32 max-w-[600px]">
          <h1 className="text-5xl leading-tight font-semibold mt-4 bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Sakhi
          </h1>
          <h1 className="mt-4 text-xl font-normal text-slate-400 leading-relaxed">
            Empowering your journey to mental well-being with a stigma-free 3D
            companion
          </h1>
        </div>
        <img src={wallpaper} className="w-[400px] mt-6 opacity-80" alt="signup" />
      </div>
      <div className="flex min-w-[650px] justify-between flex-grow bg-slate-900 border-l border-white/5 text-slate-300">
        <div className="p-8 w-full min-h-[300px] px-16 lg:px-24 self-center">
          <div className="flex flex-col justify-center gap-5">
            <h1 className="text-3xl font-semibold text-white">Create account</h1>
            <p className="text-sm text-slate-400">
              Start your journey of healing yourself
            </p>
            <Tab.Group selectedIndex={tab} onChange={setTab}>
              <Tab.List className="flex justify-around space-x-1 rounded-xl py-2">
                <Tab
                  key="login"
                  className={({ selected }) =>
                    selected
                      ? "px-4 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 outline-none text-sm font-medium"
                      : "px-4 py-2 rounded-xl bg-transparent text-slate-400 hover:bg-white/5 transition-all duration-200 text-sm"
                  }
                >
                  Login Details
                </Tab>
                <Tab
                  key="personal"
                  className={({ selected }) =>
                    selected
                      ? "px-4 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 outline-none text-sm font-medium"
                      : "px-4 py-2 rounded-xl bg-transparent text-slate-400 hover:bg-white/5 transition-all duration-200 text-sm"
                  }
                >
                  Personal Details
                </Tab>
                <Tab
                  key="health"
                  className={({ selected }) =>
                    selected
                      ? "px-4 py-2 rounded-xl bg-teal-500/15 text-teal-300 border border-teal-500/30 outline-none text-sm font-medium"
                      : "px-4 py-2 rounded-xl bg-transparent text-slate-400 hover:bg-white/5 transition-all duration-200 text-sm"
                  }
                >
                  Health Details
                </Tab>
              </Tab.List>
              <Tab.Panels className="min-h-[30vh]">
                <Tab.Panel key="login" className="grid grid-cols-1 gap-4">
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
                    <MdEmail className="text-teal-400 mr-2" size={18} />
                    <input
                      type="text"
                      placeholder="Enter email"
                      className="p-1 w-full text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.email}
                      onChange={(e) =>
                        setData({ ...data, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
                    <MdPerson className="text-teal-400 mr-2" size={18} />
                    <input
                      type="text"
                      placeholder="Enter name"
                      className="p-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.name}
                      onChange={(e) =>
                        setData({ ...data, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
                    <MdPassword className="text-teal-400 mr-2" size={18} />
                    <input
                      type="password"
                      placeholder="Enter password"
                      className="p-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.password}
                      onChange={(e) =>
                        setData({ ...data, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl">
                    <MdPassword className="text-teal-400 mr-2" size={18} />
                    <input
                      type="password"
                      placeholder="Re-enter password"
                      className="p-1 text-sm outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                    />
                  </div>
                </Tab.Panel>
                <Tab.Panel key="personal" className="grid grid-cols-12 gap-4">
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-12">
                    <input
                      type="text"
                      placeholder="Enter address"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.address}
                      onChange={(e) =>
                        setData({ ...data, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="number"
                      placeholder="Enter age"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.age}
                      onChange={(e) =>
                        setData({ ...data, age: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="number"
                      placeholder="Enter weight"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.weight}
                      onChange={(e) =>
                        setData({ ...data, weight: e.target.value })
                      }
                    />
                  </div>
                  <Listbox
                    value={data.sex}
                    onChange={(x) =>
                      setData((prevData) => ({
                        ...prevData,
                        sex: x,
                      }))
                    }
                  >
                    <div className="relative bg-slate-800 border border-white/5 rounded-xl col-span-6">
                      <Listbox.Button className="relative text-slate-400 w-full h-full cursor-default rounded-xl py-2 pl-3 pr-10 text-left focus:outline-none sm:text-sm">
                        <span className="block truncate">
                          {gender[data.sex].name}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <PiCaretUpDownBold
                            className="h-5 w-5 text-slate-500"
                            aria-hidden="true"
                          />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute bg-slate-800 border border-white/10 mt-1 max-h-60 w-full overflow-auto rounded-xl py-1 text-base shadow-lg focus:outline-none sm:text-sm z-10">
                          {gender.map((person, personIdx) => (
                            <Listbox.Option
                              key={personIdx}
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 px-4 ${
                                  active
                                    ? "bg-teal-500/20 text-teal-300"
                                    : "text-slate-300"
                                }`
                              }
                              value={personIdx}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? "font-medium" : "font-normal"
                                    }`}
                                  >
                                    {person.name}
                                  </span>
                                  {selected && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-teal-400">
                                      <MdCheck
                                        className="h-5 w-5"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  )}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="number"
                      placeholder="Enter height"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.height}
                      onChange={(e) =>
                        setData({ ...data, height: e.target.value })
                      }
                    />
                  </div>
                </Tab.Panel>
                <Tab.Panel key="health" className="grid grid-cols-12 gap-4">
                  <div className="bg-slate-800 border border-white/5 p-2.5 col-span-6 flex items-center rounded-xl">
                    <input
                      type="text"
                      placeholder="Any medical condition"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.condition}
                      onChange={(e) =>
                        setData({ ...data, condition: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="text"
                      placeholder="Any family issue"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.history}
                      onChange={(e) =>
                        setData({ ...data, history: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="number"
                      placeholder="Emergency Contact 1"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.emergency1}
                      onChange={(e) =>
                        setData({ ...data, emergency1: e.target.value })
                      }
                    />
                  </div>
                  <div className="bg-slate-800 border border-white/5 p-2.5 flex items-center rounded-xl col-span-6">
                    <input
                      type="number"
                      placeholder="Emergency Contact 2"
                      className="p-1 text-sm w-full outline-none bg-transparent text-slate-200 placeholder-slate-500"
                      value={data.emergency2}
                      onChange={(e) =>
                        setData({ ...data, emergency2: e.target.value })
                      }
                    />
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
            <div className="w-full grid grid-cols-12 gap-3">
              {tab > 0 ? (
                <button
                  onClick={() => setTab((prevTab) => prevTab - 1)}
                  className="col-span-3 bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700 transition-all p-3 rounded-xl text-sm font-medium"
                >
                  Prev
                </button>
              ) : null}
              {tab < 1 ? (
                <div className="col-span-9 flex justify-center items-center"></div>
              ) : (
                <div className="col-span-6 flex justify-center items-center"></div>
              )}
              {tab !== 2 ? (
                <button
                  onClick={() => setTab((prevTab) => prevTab + 1)}
                  className="col-span-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg hover:shadow-teal-500/20 transition-all text-white p-3 rounded-xl text-sm font-medium"
                >
                  Next
                </button>
              ) : null}
              {tab === 2 ? (
                <button
                  onClick={() => register()}
                  className="col-span-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:shadow-lg hover:shadow-teal-500/20 transition-all text-white p-3 rounded-xl text-sm font-medium"
                >
                  Submit
                </button>
              ) : null}
            </div>
            <Link to="/login" className="text-teal-400 hover:text-teal-300 mt-2 text-sm font-medium transition-colors">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
