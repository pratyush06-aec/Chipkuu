import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function LandingScreen({ onVisualize }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const glowRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Floating text entry
    tl.fromTo(
      textRef.current,
      { y: 40, opacity: 0, filter: "blur(10px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power3.out" }
    );

    // Button entry
    tl.fromTo(
      buttonRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)" },
      "-=0.6"
    );

    // Color mixing ambient animation in the text reflection
    gsap.to(glowRef.current, {
      backgroundPosition: "200% center",
      duration: 8,
      ease: "none",
      repeat: -1,
    });
  }, []);

  const handleLaunch = () => {
    // Cinematic launch out
    const tl = gsap.timeline({ onComplete: onVisualize });

    tl.to(buttonRef.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in"
    })
    .to(textRef.current, {
      scale: 1.5,
      opacity: 0,
      filter: "blur(20px)",
      duration: 0.6,
      ease: "power4.in"
    }, "-=0.1")
    .to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.in"
    }, "-=0.3");
  };

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
    >
      <div className="relative text-center select-none" ref={textRef}>
        {/* Glow behind text */}
        <div 
          ref={glowRef}
          className="absolute inset-0 opacity-40 blur-3xl pointer-events-none mix-blend-screen"
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981, #8b5cf6)",
            backgroundSize: "200% auto",
            transform: "translateY(-10px) scale(1.2)"
          }}
        />
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-[#f0f0f5] to-[#8b8ba3] drop-shadow-2xl mb-4 relative z-10">
          Clipboard<br/>Workspace
        </h1>
        <p className="text-[#a0a0b8] text-lg font-medium tracking-wide">
          Your local-first productivity tool.
        </p>
      </div>

      <button
        ref={buttonRef}
        onClick={handleLaunch}
        className="mt-20 px-20 py-5 rounded-full liquid-glass-panel border border-[rgba(255,255,255,0.1)] 
                   text-white text-2xl font-bold tracking-wider shadow-[0_0_40px_rgba(139,92,246,0.4)]
                   hover:shadow-[0_0_80px_rgba(139,92,246,0.8)] hover:-translate-y-2 hover:border-[rgba(255,255,255,0.4)]
                   transition-all duration-300 group overflow-hidden relative inline-flex items-center justify-center min-w-[300px]"
      >
        <span className="relative z-10 flex items-center justify-center gap-4 w-full">
          Visualize
          <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </span>
        {/* Button hover glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  );
}
