import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";

const Diet = () => {
  const navigate = useNavigate();
  const [diet, setDiet] = useState(null);
  
  useEffect(() => {
    axios
      .post("http://localhost:3000/diet", {
        email: JSON.parse(localStorage.getItem("data")).email,
      })
      .then((res) => {
        console.log(res.data);
        setDiet(res.data);
      });
  }, []);

  // Function to clean markdown formatting completely
  const formatDietText = (text) => {
    // Remove both double and single asterisks, and bullet points
    return text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/^\s*\•\s+/, "").replace(/^\s*\-\s+/, "");
  };

  // Determine if the text is a title, subtitle, or regular text
  const getTextStyle = (text) => {
    const cleanText = text.trim();
    
    // Title: ends with colon
    if (cleanText.endsWith(":")) {
      return "font-bold text-slate-200";
    }
    
    // Subtitle: lines that look like headers or emphasis
    if (
      cleanText.startsWith("Why") || 
      cleanText.includes("?") ||
      (cleanText.match(/^[A-Z]/) && cleanText.length < 50) || // Capitalized short lines
      cleanText.match(/^\d+\.\s/) || // Numbered items
      cleanText.match(/^(Breakfast|Lunch|Dinner|Snack|Morning|Afternoon|Evening)/) // Meal times
    ) {
      return "font-semibold text-slate-300";
    }
    
    // Regular text
    return "text-slate-400";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="w-full">
        <div className="p-6 bg-slate-900/80 border-b border-white/10">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/assessments"))}
            className="flex items-center gap-2 text-slate-300 hover:text-slate-100 mb-3 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="ml-1 text-3xl font-semibold text-slate-200">
            Your Personalized Diet Plan
          </h1>
        </div>

        <div className="p-6 bg-slate-900/50">
          <div className="mb-6">
            {!diet?.success ? (
              <button
                onClick={() => navigate("/quiz")}
                className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
              >
                Take Test
              </button>
            ) : (
              <button
                onClick={() => navigate("/quiz")}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300"
              >
                Retake Test
              </button>
            )}
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 border-l-8 border-l-teal-500">
            {!diet?.success ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-red-400">No diet found, please take a test</h2>
              </div>
            ) : (
              <div className="diet-content space-y-2">
                {diet?.diet?.split("\n").map((item, index) => {
                  if (!item.trim()) return null; // Skip empty lines
                  
                  const cleanedText = formatDietText(item);
                  const textStyle = getTextStyle(cleanedText);
                  
                  return (
                    <p 
                      key={index} 
                      className={`text-lg ${textStyle}`}
                    >
                      {cleanedText}
                    </p>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diet;