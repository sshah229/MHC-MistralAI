import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const features = [
  {
    icon: "🧠",
    title: "Multi-Agent AI Companion",
    desc: "Three specialized agents — Listener, Coach, and Guardian — dynamically adapt to your emotional state in real time.",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: "😊",
    title: "Emotion Detection",
    desc: "Facial expression analysis and text sentiment detection work together to truly understand how you feel.",
    gradient: "from-purple-500 to-indigo-500",
  },
  {
    icon: "🎙️",
    title: "Voice Conversations",
    desc: "Speak naturally with Sakhi — hands-free mode, real-time speech recognition, and a 3D avatar that talks back.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: "🚨",
    title: "Crisis Safety Net",
    desc: "Automatic distress detection triggers emergency calls to your trusted contacts — no confirmation needed.",
    gradient: "from-amber-500 to-orange-500",
  },
];

const steps = [
  { num: "01", title: "Talk to Sakhi", desc: "Share how you feel through text or voice. Sakhi listens without judgment." },
  { num: "02", title: "Get Personalized Insights", desc: "Receive tailored responses, assessments, diet plans, and activity recommendations." },
  { num: "03", title: "Track Your Progress", desc: "Monitor your emotional journey with dashboards, journals, and weekly soul reports." },
];

const techStack = [
  { name: "Mistral AI", role: "LLM Intelligence" },
  { name: "ElevenLabs", role: "Voice Synthesis" },
  { name: "Azure", role: "Speech Services" },
  { name: "Twilio", role: "Emergency Calls" },
  { name: "MongoDB", role: "Data Layer" },
  { name: "React + Three.js", role: "3D Avatar UI" },
];

const Landing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Sakhi" className="w-9 h-9" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Sakhi
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 px-5 py-2.5 rounded-full transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-teal-900/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">Powered by Mistral AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your AI companion for{" "}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              mental wellness
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Sakhi is a stigma-free 3D companion that listens, understands, and supports you
            through every emotional moment — with voice, empathy, and real-time intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
            >
              Start Your Journey
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border border-white/15 rounded-full font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-300"
            >
              I have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Emotional AI that actually{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                understands
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built with cutting-edge AI to provide genuine emotional support, not generic responses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${f.gradient} text-2xl mb-5`}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-teal-950/20 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Sakhi works</h2>
            <p className="text-slate-400">Three simple steps to a healthier mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-b from-teal-400 to-teal-400/20 bg-clip-text text-transparent mb-4">
                  {s.num}
                </div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-slate-500 mb-8">Powered by</p>
          <div className="flex flex-wrap justify-center gap-4">
            {techStack.map((t) => (
              <div
                key={t.name}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3 flex items-center gap-3"
              >
                <span className="text-white font-medium">{t.name}</span>
                <span className="text-xs text-slate-500">{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to start your{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              wellness journey
            </span>
            ?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join Sakhi today — your empathetic AI companion is waiting.
          </p>
          <Link
            to="/signup"
            className="inline-flex px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Sakhi" className="w-6 h-6 opacity-50" />
            <span className="text-sm text-slate-500">Sakhi — Mistral AI Hackathon 2026</span>
          </div>
          <p className="text-sm text-slate-600">Built with care for mental wellness.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
