import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import Reports from "./pages/Reports/Reports";
import Diet from "./pages/Diet/Diet";
import Notifs from "./pages/Notifs/Notifs";
import SearchDocs from "./pages/SearchDocs/SearchDocs";
import Plans from "./pages/Plans/Plans";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chat from "./pages/Chat/Chat";
import Login from "./pages/Login/Login";
import SignUp from "./pages/SignUp/SignUp";
import Quiz from "./pages/Quiz/Quiz";
import Awards from "./pages/Awards/Awards";
import Home from "./pages/Home/Home";
import GoalTrackerPage from "./pages/GoalTracker/GoalTrackerPage";
import Journal from "./pages/Journal/Journal";
import Breathing from "./pages/Breathing/Breathing";
import SoulReport from "./pages/SoulReport/SoulReport";
import Insights from "./pages/Insights/Insights";
import Assessments from "./pages/Assessments/Assessments";
import Activities from "./pages/Activities/Activities";
import Progress from "./pages/Progress/Progress";

const RequireAuth = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },

  // Protected routes
  {
    element: <RequireAuth />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
      {
        path: "/quiz",
        element: <Quiz />,
      },
      {
        path: "/diet-plan",
        element: <Diet />,
      },
      {
        path: "/notifications",
        element: <Notifs />,
      },
      {
        path: "/search-doctors",
        element: <SearchDocs />,
      },
      {
        path: "/plans",
        element: <Plans />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/rewards",
        element: <Awards />,
      },
      {
        path: "/Dashboard",
        element: <Dashboard />,
      },
      {
        path: "/goals",
        element: <GoalTrackerPage />,
      },
      {
        path: "/journal",
        element: <Journal />,
      },
      {
        path: "/breathing",
        element: <Breathing />,
      },
      {
        path: "/soul-report",
        element: <SoulReport />,
      },
      {
        path: "/insights",
        element: <Insights />,
      },
      {
        path: "/assessments",
        element: <Assessments />,
      },
      {
        path: "/activities",
        element: <Activities />,
      },
      {
        path: "/progress",
        element: <Progress />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
