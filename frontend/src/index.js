import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";
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

// Auth check component - returns outlet or redirect based on auth state
const RequireAuth = () => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    // Redirect to login if there's no token
    return <Navigate to="/login" replace />;
  }
  
  // Return outlet which will render the child route element
  return <Outlet />;
};

// Check if user is logged in and set the initial path
const token = localStorage.getItem('token');
const initialPath = token ? '/' : '/login';

// Set the initial URL before rendering the app
if (window.location.pathname === '/') {
  window.history.replaceState({}, '', initialPath);
}

const router = createBrowserRouter([
  // Public routes
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
        path: "/",
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

    ]
  },
  
  // Catch-all route for unknown paths
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);