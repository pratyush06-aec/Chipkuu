import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AnimatedBackground() {
  const bgRef = useRef(null);
  const glowRef = useRef(null);

  useGSAP(() => {
    // Liquid cursor follower setup
    const xTo = gsap.quickTo(glowRef.current, "x", { duration: 0.8, ease: "power3" });
    const yTo = gsap.quickTo(glowRef.current, "y", { duration: 0.8, ease: "power3" });

    const handleMouseMove = (e) => {
      // Offset by half the width/height of the glow element to center it on cursor
      xTo(e.clientX - 400); 
      yTo(e.clientY - 400);
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Subtle background breathing animation for the dark greyish environment
    gsap.to(bgRef.current, {
      backgroundPosition: "100% 100%",
      duration: 20,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, #111 0%, #050505 100%)",
      }}
    >
      {/* 
        The static background noise/texture for premium feel. 
        Using a very subtle svg noise overlay.
      */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* 
        The moving "Stitch AI" glow element following the cursor.
        Made more prominent with higher opacity and brighter gradient centers.
      */}
      <div 
        ref={glowRef}
        className="absolute w-[800px] h-[800px] rounded-full pointer-events-none mix-blend-screen opacity-70"
        style={{
          background: "radial-gradient(circle, rgba(100,100,125,0.9) 0%, rgba(50,50,70,0.5) 40%, transparent 70%)",
          filter: "blur(50px)",
          top: 0,
          left: 0,
          willChange: "transform"
        }}
      />
      
      {/* 
        Secondary static ambient glows for depth
      */}
      <div 
        ref={bgRef}
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 20% 80%, rgba(40,40,45,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(20,20,30,0.8) 0%, transparent 50%)",
          backgroundSize: "200% 200%",
          filter: "blur(80px)"
        }}
      />
    </div>
  );
}
