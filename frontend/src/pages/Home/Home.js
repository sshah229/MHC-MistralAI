import React, { useEffect } from "react";
import ChatBot from "../../components/ChatBot/ChatBot";
import Navbar from "../../components/Navbar/Navbar";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for token when component mounts
    const token = localStorage.getItem("token");
    if (!token) {
      // If no token exists, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="flex flex-row">
      <Navbar />
      <ChatBot />
    </div>
  );
};

export default Home;