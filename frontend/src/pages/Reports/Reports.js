import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";

const Reports = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios
      .post("http://localhost:3000/report/", {
        email: JSON.parse(localStorage.getItem("data"))?.email,
      })
      .then((res) => {
        console.log(res.data);
        setReport(res.data);
      });
  }, []);

  // Function to clean markdown formatting completely
  const formatReportText = (text) => {
    // Remove both double and single asterisks, and bullet points
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/^\s*\•\s+/, "")
      .replace(/^\s*\-\s+/, "");
  };

  // Determine if the text is a title, subtitle, or regular text
  const getTextStyle = (text) => {
    const cleanText = text.trim();

    if (cleanText.endsWith(":")) {
      return "font-bold text-teal-400";
    }

    if (
      cleanText.startsWith("Why") ||
      cleanText.includes("?") ||
      (cleanText.match(/^[A-Z]/) && cleanText.length < 50) ||
      cleanText.match(/^\d+\.\s/) ||
      cleanText.match(/^(Analysis|Overview|Recommendation|Summary|Conclusion|Finding)/)
    ) {
      return "font-semibold text-teal-300";
    }

    return "text-slate-300";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 bg-teal-500/20 border-b border-teal-400/20">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/assessments"))}
            className="flex items-center gap-2 text-teal-300 hover:text-white mb-3 transition-colors"
          >
            <FiArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="ml-1 text-3xl font-semibold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
            Your Health Report
          </h1>
        </div>

        <div className="p-6">
          <div className="mb-6">
            {!report?.success ? (
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

          <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/10 border-l-4 border-l-teal-500">
            {!report?.success ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-red-400">
                  No report found, please take a test
                </h2>
              </div>
            ) : (
              <div className="report-content space-y-2">
                {report?.report?.split("\n").map((item, index) => {
                  if (!item.trim()) return null;

                  const cleanedText = formatReportText(item);
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

export default Reports;