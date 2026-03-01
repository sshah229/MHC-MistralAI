import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import logo from "../../assets/logo.png";

/* ─── Floating glassmorphic orbs (medium, brighter) ─────────── */
const COLOR_RGB = {
  teal: "45,212,191",
  cyan: "34,211,238",
  emerald: "52,211,153",
  purple: "168,85,247",
};

function GlassOrbs() {
  const orbs = useMemo(
    () => [
      { size: 240, x1: 5, y1: 8, x2: 18, y2: 30, x3: 8, y3: 18, dur: 26, color: "teal", opacity: 0.18 },
      { size: 200, x1: 72, y1: 6, x2: 82, y2: 22, x3: 68, y3: 12, dur: 30, color: "cyan", opacity: 0.16 },
      { size: 180, x1: 38, y1: 55, x2: 52, y2: 70, x3: 32, y3: 62, dur: 24, color: "teal", opacity: 0.2 },
      { size: 220, x1: 80, y1: 50, x2: 72, y2: 68, x3: 85, y3: 58, dur: 28, color: "cyan", opacity: 0.14 },
      { size: 160, x1: 18, y1: 75, x2: 28, y2: 88, x3: 14, y3: 82, dur: 22, color: "emerald", opacity: 0.17 },
      { size: 190, x1: 55, y1: 22, x2: 45, y2: 38, x3: 60, y3: 28, dur: 32, color: "purple", opacity: 0.12 },
      { size: 140, x1: 90, y1: 85, x2: 82, y2: 78, x3: 88, y3: 90, dur: 20, color: "teal", opacity: 0.15 },
      { size: 170, x1: 30, y1: 35, x2: 40, y2: 48, x3: 25, y3: 40, dur: 25, color: "cyan", opacity: 0.13 },
    ],
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {orbs.map((orb, i) => {
        const rgb = COLOR_RGB[orb.color];
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle at 35% 35%, 
                rgba(${rgb},${orb.opacity}) 0%, 
                rgba(${rgb},${orb.opacity * 0.4}) 45%, 
                transparent 70%)`,
              boxShadow: `
                inset 0 0 ${orb.size * 0.2}px rgba(${rgb},${orb.opacity * 0.6}),
                0 0 ${orb.size * 0.3}px rgba(${rgb},${orb.opacity * 0.25})`,
              border: `1px solid rgba(${rgb},${orb.opacity * 0.8})`,
            }}
            animate={{
              left: [`${orb.x1}%`, `${orb.x2}%`, `${orb.x3}%`, `${orb.x1}%`],
              top: [`${orb.y1}%`, `${orb.y2}%`, `${orb.y3}%`, `${orb.y1}%`],
              scale: [1, 1.1, 0.93, 1],
            }}
            transition={{
              duration: orb.dur,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

/* ─── Glowing custom cursor ─────────────────────────────────── */
function GlowCursor() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, { stiffness: 300, damping: 28 });
  const dotY = useSpring(mouseY, { stiffness: 300, damping: 28 });

  const auraX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const auraY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  const handleMouseMove = useCallback(
    (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    document.body.style.cursor = "none";
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <>
      {/* Outer soft aura — trails the cursor */}
      <motion.div
        className="fixed pointer-events-none z-[100] rounded-full"
        style={{
          width: 280,
          height: 280,
          left: auraX,
          top: auraY,
          x: "-50%",
          y: "-50%",
          background: "radial-gradient(circle, rgba(45,212,191,0.1) 0%, rgba(34,211,238,0.05) 40%, transparent 70%)",
        }}
      />
      {/* Middle ring */}
      <motion.div
        className="fixed pointer-events-none z-[101] rounded-full"
        style={{
          width: 36,
          height: 36,
          left: dotX,
          top: dotY,
          x: "-50%",
          y: "-50%",
          border: "1.5px solid rgba(45,212,191,0.5)",
          background: "rgba(45,212,191,0.06)",
          boxShadow: "0 0 15px rgba(45,212,191,0.2), 0 0 40px rgba(45,212,191,0.08)",
        }}
      />
      {/* Inner bright dot */}
      <motion.div
        className="fixed pointer-events-none z-[102] rounded-full"
        style={{
          width: 8,
          height: 8,
          left: dotX,
          top: dotY,
          x: "-50%",
          y: "-50%",
          background: "rgba(45,212,191,0.9)",
          boxShadow: "0 0 8px rgba(45,212,191,0.8), 0 0 20px rgba(45,212,191,0.4)",
        }}
      />
    </>
  );
}

/* ─── Hero breathing rings ──────────────────────────────────── */
function BreathingRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 220 + i * 160,
            height: 220 + i * 160,
            border: `1px solid rgba(45, 212, 191, ${0.15 - i * 0.03})`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 5 + i * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.6,
          }}
        />
      ))}
      <motion.div
        className="absolute w-52 h-52 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,212,191,0.2) 0%, rgba(34,211,238,0.1) 50%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ─── Animation variants ────────────────────────────────────── */
const pop = {
  hidden: { opacity: 0, scale: 0.6, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      delay: i * 0.12,
    },
  }),
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─── Data ──────────────────────────────────────────────────── */
const features = [
  {
    icon: "🧠",
    title: "Multi-Agent AI Companion",
    desc: "Three specialized agents — Listener, Coach, and Guardian — dynamically adapt to your emotional state in real time.",
    gradient: "from-cyan-500 to-teal-500",
    border: "hover:border-teal-500/25",
    shadow: "hover:shadow-teal-500/10",
  },
  {
    icon: "😊",
    title: "Emotion Detection",
    desc: "Facial expression analysis and text sentiment detection work together to truly understand how you feel.",
    gradient: "from-purple-500 to-indigo-500",
    border: "hover:border-purple-500/25",
    shadow: "hover:shadow-purple-500/10",
  },
  {
    icon: "🎙️",
    title: "Voice Conversations",
    desc: "Speak naturally with Sakhi — hands-free mode, real-time speech recognition, and a 3D avatar that talks back.",
    gradient: "from-rose-500 to-pink-500",
    border: "hover:border-rose-500/25",
    shadow: "hover:shadow-rose-500/10",
  },
  {
    icon: "🚨",
    title: "Crisis Safety Net",
    desc: "Automatic distress detection triggers emergency calls to your trusted contacts — no confirmation needed.",
    gradient: "from-amber-500 to-orange-500",
    border: "hover:border-amber-500/25",
    shadow: "hover:shadow-amber-500/10",
  },
];

const steps = [
  { num: "01", title: "Talk to Sakhi", desc: "Share how you feel through text or voice. Sakhi listens without judgment.", emoji: "💬" },
  { num: "02", title: "Get Personalized Insights", desc: "Receive tailored responses, assessments, diet plans, and activity recommendations.", emoji: "✨" },
  { num: "03", title: "Track Your Progress", desc: "Monitor your emotional journey with dashboards, journals, and weekly soul reports.", emoji: "📊" },
];

const techStack = [
  { name: "Mistral AI", role: "LLM Intelligence" },
  { name: "ElevenLabs", role: "Voice Synthesis" },
  { name: "Azure", role: "Speech Services" },
  { name: "Twilio", role: "Emergency Calls" },
  { name: "MongoDB", role: "Data Layer" },
  { name: "React + Three.js", role: "3D Avatar UI" },
];

/* ─── Landing Page ──────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, 0.96]);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/home");
  }, [navigate]);

  const heroWords = ["Your", "AI", "companion", "for"];
  const gradientWords = ["mental", "wellness"];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ cursor: "none" }}>
      <GlassOrbs />
      <GlowCursor />

      {/* ─── Nav ─── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-2xl border-b border-white/[0.04]"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div className="flex items-center gap-3" whileHover={{ scale: 1.05 }}>
            <img src={logo} alt="Sakhi" className="w-9 h-9" />
            <span className="text-xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
              Sakhi
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">
              Log in
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/signup"
                className="text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 px-5 py-2.5 rounded-full transition-all inline-block"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ─── Hero ─── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center pt-20"
      >
        <BreathingRings />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
            className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2 mb-8 backdrop-blur-md"
          >
            <motion.span
              className="w-2 h-2 bg-teal-400 rounded-full"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-slate-300">Powered by Mistral AI</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            {heroWords.map((word, i) => (
              <motion.span
                key={word + i}
                initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.5 + i * 0.12 }}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
            <br className="hidden md:block" />
            {gradientWords.map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, scale: 0, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 1.1 + i * 0.15 }}
                className="inline-block mr-[0.3em] bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Sakhi is a stigma-free 3D companion that listens, understands, and supports you
            through every emotional moment — with voice, empathy, and real-time intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.06, y: -3 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full font-semibold text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow duration-300 inline-block"
              >
                Start Your Journey
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/login"
                className="px-8 py-4 border border-white/10 rounded-full font-medium text-slate-300 hover:bg-white/[0.04] hover:text-white hover:border-white/20 transition-all duration-300 inline-block backdrop-blur-sm"
              >
                I have an account
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* ─── Features ─── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              Emotional AI that actually{" "}
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                understands
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400 max-w-xl mx-auto">
              Built with cutting-edge AI to provide genuine emotional support, not generic responses.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <AnimatePresence>
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  variants={pop}
                  custom={i}
                  onHoverStart={() => setHoveredFeature(i)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 22 } }}
                  className={`group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 ${f.border} transition-all duration-300 overflow-hidden shadow-2xl ${f.shadow}`}
                >
                  {hoveredFeature === i && (
                    <motion.div
                      className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${f.gradient} opacity-[0.06]`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.06 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                  <motion.div
                    className={`relative inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${f.gradient} text-2xl mb-5 shadow-lg`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1, transition: { duration: 0.5 } }}
                  >
                    {f.icon}
                  </motion.div>
                  <h3 className="relative text-xl font-semibold mb-3">{f.title}</h3>
                  <p className="relative text-slate-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-teal-950/15 to-transparent relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
              How Sakhi works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-slate-400">
              Three simple steps to a healthier mind.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((s, i) => (
              <motion.div key={s.num} variants={pop} custom={i} className="text-center">
                <motion.div
                  className="relative inline-block mb-4"
                  whileHover={{ scale: 1.12, transition: { type: "spring", stiffness: 400, damping: 12 } }}
                >
                  <span className="text-6xl font-bold bg-gradient-to-b from-teal-400 to-teal-400/10 bg-clip-text text-transparent">
                    {s.num}
                  </span>
                  <motion.span
                    className="absolute -top-2 -right-4 text-2xl"
                    animate={{ y: [0, -5, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.5 }}
                  >
                    {s.emoji}
                  </motion.span>
                </motion.div>
                <h3 className="text-xl font-semibold mb-3">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Tech ─── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm uppercase tracking-widest text-slate-500 mb-8"
          >
            Powered by
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {techStack.map((t, i) => (
              <motion.div
                key={t.name}
                variants={pop}
                custom={i}
                whileHover={{ y: -4, scale: 1.06, transition: { type: "spring", stiffness: 400 } }}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-3 flex items-center gap-3 hover:border-teal-500/20 hover:bg-white/[0.05] transition-all backdrop-blur-sm"
              >
                <span className="text-white font-medium">{t.name}</span>
                <span className="text-xs text-slate-500">{t.role}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6 relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-bold mb-6">
            Ready to start your{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              wellness journey
            </span>
            ?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-slate-400 text-lg mb-10">
            Join Sakhi today — your empathetic AI companion is waiting.
          </motion.p>
          <motion.div variants={fadeUp} custom={2}>
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.96 }}
            >
              <Link
                to="/signup"
                className="inline-flex px-10 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full font-semibold text-lg shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow duration-300"
              >
                Get Started — It's Free
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 px-6 relative z-10">
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
