"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

// --- Data: companies ---
const companies = [
  {
    id: 1,
    name: "Thales Group",
    role: "Jovem Aprendiz — Infraestrutura de TI",
    desc: "Gerenciei IPs de rede, administrei contas de usuário e prestei suporte aos sistemas da multinacional.",
    profile: "/thales.png",
  },
  {
    id: 2,
    name: "Next Home",
    role: "Analista de Tráfego & Dev Front-end",
    desc: "Criei sites/landing pages de alta conversão e liderei campanhas de tráfego (Meta/Google Ads) baseadas em dados.",
    profile: "/nexthome.png",
  },
  {
    id: 3,
    name: "A5 Maker",
    role: "Desenvolvedor Web & Automação",
    desc: "Projetei e programei sistemas embarcados (IoT) e aplicações web para automação residencial do hardware ao software.",
    profile: "/a5maker.jpg",
  },
  {
    id: 4,
    name: "Projov",
    role: "Projetos Sociais & Tecnologia",
    desc: "Colaborei no desenvolvimento de sistemas web corporativos e apoiei iniciativas de fomento tecnológico social.",
    profile: "/projov.jpg",
  },
  {
    id: 5,
    name: "FutFeminino",
    role: "Desenvolvedor Front-end / Projetos",
    desc: "Criei uma plataforma interativa de engajamento para a comunidade esportiva com foco em otimização e UX.",
    profile: "/futfeminino.png",
  },
];

// --- Utility for fallback images ---
const safeImage = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.src = "https://placehold.co/100x100/E0E7FF/4338CA?text=Error";
};

// --- Custom hook for responsive detection ---
const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState<'xs' | 'sm' | 'md' | 'lg'>('lg');
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 480) setScreenSize('xs');
      else if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else setScreenSize('lg');
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  
  return screenSize;
};

// --- Main Component ---
export default function OrbitCarousel() {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHovering, setIsHovering] = React.useState(false);
  const screenSize = useResponsive();

  // Responsive sizing
  const getResponsiveValues = () => {
    switch (screenSize) {
      case 'xs':
        return {
          containerRadius: 90,
          profileSize: 45,
          cardWidth: 'w-36',
          avatarSize: 'w-12 h-12',
          avatarMargin: '-mt-8',
          fontSize: {
            name: 'text-xs',
            role: 'text-[10px]',
            email: 'text-[9px]'
          }
        };
      case 'sm':
        return {
          containerRadius: 110,
          profileSize: 55,
          cardWidth: 'w-40',
          avatarSize: 'w-14 h-14',
          avatarMargin: '-mt-9',
          fontSize: {
            name: 'text-sm',
            role: 'text-xs',
            email: 'text-[10px]'
          }
        };
      case 'md':
        return {
          containerRadius: 140,
          profileSize: 65,
          cardWidth: 'w-48',
          avatarSize: 'w-16 h-16',
          avatarMargin: '-mt-10',
          fontSize: {
            name: 'text-sm sm:text-base',
            role: 'text-xs',
            email: 'text-[11px]'
          }
        };
      default:
        return {
          containerRadius: 180,
          profileSize: 80,
          cardWidth: 'w-56',
          avatarSize: 'w-20 h-20',
          avatarMargin: '-mt-12',
          fontSize: {
            name: 'text-base sm:text-lg',
            role: 'text-xs sm:text-sm',
            email: 'text-xs'
          }
        };
    }
  };

  const { containerRadius, profileSize, cardWidth, avatarSize, avatarMargin, fontSize } = getResponsiveValues();
  const containerSize = containerRadius * 2 + 100;

  // Calculate rotation for each profile
  const getRotation = React.useCallback(
    (index: number): number => (index - activeIndex) * (360 / companies.length),
    [activeIndex]
  );

  // Navigation
  const next = () => setActiveIndex((i) => (i + 1) % companies.length);
  const prev = () => setActiveIndex((i) => (i - 1 + companies.length) % companies.length);

  const handleProfileClick = React.useCallback((index: number) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
  }, [activeIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'ArrowLeft') prev();
      else if (event.key === 'ArrowRight') next();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-rotation
  React.useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      next();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <div 
      className="flex flex-col items-center p-2 sm:p-4 relative min-h-[350px] sm:min-h-[400px] bg-transparent transition-colors duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >

      <div
        className="relative flex items-center justify-center"
        style={{ width: containerSize, height: containerSize }}
      >

        {/* Active Person Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={companies[activeIndex].id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25
            }}
            className={`z-10 bg-white/[0.025] backdrop-blur-md shadow-2xl rounded-xl p-3 sm:p-4 ${cardWidth} text-center border border-white/[0.07]`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={`${avatarSize} ${avatarMargin} mx-auto flex items-center justify-center overflow-hidden rounded-full bg-white p-2.5 ring-4 ring-[#0a0e1c] shadow-xl`}
            >
              <img
                src={companies[activeIndex].profile}
                alt={companies[activeIndex].name}
                onError={safeImage}
                draggable={false}
                className="h-full w-full object-contain"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <h2 className={`mt-3 font-display text-[#e9edf7] ${fontSize.name}`}>
                {companies[activeIndex].name}
              </h2>
              <div className={`flex items-center justify-center text-white/50 mt-1 font-code ${fontSize.role}`}>
                <Briefcase size={12} className="mr-1.5 shrink-0" />
                <span className="truncate">{companies[activeIndex].role}</span>
              </div>
              <p className="text-white/60 mt-3 font-editorial text-xs sm:text-sm italic leading-snug px-1">
                "{companies[activeIndex].desc}"
              </p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex justify-center items-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2"
            >
              <button
                onClick={prev}
                aria-label="Empresa anterior"
                className="cta-press flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="min-w-[3.25rem] text-center font-code text-[11px] tracking-[0.2em] text-white/45 tabular-nums">
                {String(activeIndex + 1).padStart(2, "0")} / {String(companies.length).padStart(2, "0")}
              </span>
              <button
                onClick={next}
                aria-label="Próxima empresa"
                className="cta-press flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronRight size={15} />
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Orbiting Profiles with Counter-Rotation */}
        {companies.map((p, i) => {
          const rotation = getRotation(i);
          const isActive = i === activeIndex;
          
          return (
            <motion.div
              key={p.id}
              animate={{
                transform: `rotate(${rotation}deg) translateY(-${containerRadius}px)`,
                opacity: isActive ? 0 : 1,
                scale: isActive ? 0.3 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 20,
                delay: isActive ? 0 : Math.abs(i - activeIndex) * 0.05
              }}
              style={{
                width: profileSize,
                height: profileSize,
                position: "absolute",
                top: `calc(50% - ${profileSize / 2}px)`,
                left: `calc(50% - ${profileSize / 2}px)`,
                zIndex: isActive ? 20 : 10,
                pointerEvents: isActive ? "none" : "auto",
              }}
            >
              {/* Counter-rotation to keep image upright */}
              <motion.div
                animate={{ rotate: -rotation }}
                transition={{
                  type: "spring",
                  stiffness: 150,
                  damping: 20,
                }}
                className="w-full h-full"
              >
                <motion.div
                  onClick={() => handleProfileClick(i)}
                  whileHover={{
                    scale: 1.12,
                    boxShadow: "0 14px 32px -6px rgba(47,107,255,0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex h-full w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-white p-2.5 shadow-lg ring-1 transition-colors duration-300 ${
                    isActive
                      ? "ring-2 ring-[#2f6bff]"
                      : "ring-white/15 hover:ring-[#2f6bff]/60"
                  }`}
                >
                  <img
                    src={p.profile}
                    alt={p.name}
                    onError={safeImage}
                    draggable={false}
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress Indicator */}
      <div className="flex justify-center mt-4 sm:mt-6 space-x-1.5 sm:space-x-2">
        {companies.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
              index === activeIndex 
                ? "bg-[#2f6bff]" 
                : "bg-white/20"
            }`}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </div>
  );
}
