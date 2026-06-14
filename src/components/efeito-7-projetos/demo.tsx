import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X, ExternalLink, Code2, Play } from "lucide-react";

// ── Project data ─────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  tags: string[];
  accentHex: string;
  liveUrl?: string;
  codeUrl?: string;
  scrubTitle: { top: string; bottom: string };
  frameCount: number;
  frameUrl: (i: number) => string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Compromisso",
    subtitle: "EdTech · Meu principal projeto",
    // Dica: se houver um link ao vivo da Compromisso, preencha liveUrl para abrir
    // direto da seção. Um print real da plataforma como `cover` deixa o card muito mais forte.
    description:
      "Meu principal projeto. Desenvolvi a Compromisso — plataforma educacional completa — ao lado de um parceiro e à frente de todo o desenvolvimento, da concepção à entrega. Front-end em React/Next.js, back-end em Node.js, autenticação e painel do aluno. Ownership de ponta a ponta.",
    cover:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
    tags: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL"],
    accentHex: "#2f6bff",
    scrubTitle: { top: "Compromisso", bottom: "EdTech" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
  {
    id: 2,
    title: "Corretora Cristal",
    subtitle: "Cliente Real · Site Imobiliário em Alphaville, SP",
    description:
      "Site profissional para corretora imobiliária em Alphaville, SP. Catálogo de imóveis, dashboard administrativo, formulário de contato e vitrine de estatísticas do negócio. Meu primeiro projeto para um cliente real no nicho imobiliário.",
    cover:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=80",
    tags: ["Lovable", "Next.js", "React", "Imobiliário"],
    accentHex: "#38e0ff",
    liveUrl: "https://cristal-nexthome.lovable.app/",
    scrubTitle: { top: "Cristal", bottom: "Imóveis" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
  {
    id: 3,
    title: "Vinheria Agnello",
    subtitle: "FIAP · Checkpoint 01 — Desenvolvimento Web",
    description:
      "Primeiro checkpoint da FIAP — site completo para vinheria artesanal com catálogo de produtos, navegação entre páginas, seção de personalização e layout responsivo. HTML semântico e CSS puro.",
    cover:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80",
    tags: ["HTML", "CSS", "GitHub Pages", "FIAP"],
    accentHex: "#6f97ff",
    liveUrl: "https://mariaeduardaacyole.github.io/Checkpoint-Site-da-Vinheria-Agnello/src/pages/produtos.html",
    codeUrl: "https://github.com/Goes1404/Checkpoint-Site-da-Vinheria-Agnello",
    scrubTitle: { top: "Vinheria", bottom: "Agnello" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
  {
    id: 4,
    title: "JR Acessórios",
    subtitle: "Cliente Real · E-commerce com Domínio Próprio",
    description:
      "E-commerce completo para loja de acessórios artesanais com domínio próprio (jracessorios.com). Catálogo de produtos, sistema de pedidos e foco em entrega rápida. Projeto real entregue para cliente.",
    cover:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&auto=format&fit=crop&q=80",
    tags: ["React", "Next.js", "Node.js", "E-commerce"],
    accentHex: "#2f6bff",
    liveUrl: "https://www.jracessorios.com",
    codeUrl: "https://github.com/Goes1404/jota-r-craft-connect",
    scrubTitle: { top: "JR", bottom: "Acessórios" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
  {
    id: 5,
    title: "GlowCare",
    subtitle: "FIAP · Checkpoint 02 — E-commerce de Cosméticos",
    description:
      "Segundo checkpoint da FIAP — e-commerce de cosméticos e maquiagem com identidade visual própria, catálogo de produtos, carrinho de compras e galeria. Design focado em autocuidado e expressão pessoal.",
    cover:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80",
    tags: ["HTML", "CSS", "GitHub Pages", "FIAP"],
    accentHex: "#6f97ff",
    liveUrl: "https://goes1404.github.io/Glowcare/",
    codeUrl: "https://github.com/Goes1404/Glowcare",
    scrubTitle: { top: "Glow", bottom: "Care" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
  {
    id: 6,
    title: "Deuca",
    subtitle: "FIAP · Global Solution — Aplicação Full Stack",
    description:
      "Global Solution da FIAP — aplicação web completa com autenticação, painel de usuário e backend dedicado. Deploy de frontend no Vercel. Projeto desenvolvido para resolver um desafio real proposto pela FIAP.",
    cover:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    tags: ["React", "Node.js", "Vercel", "FIAP", "Auth"],
    accentHex: "#38e0ff",
    liveUrl: "https://frontend-seven-mauve-95.vercel.app/",
    scrubTitle: { top: "Deuca", bottom: "GS FIAP" },
    frameCount: 300,
    frameUrl: (i) =>
      `https://raw.githubusercontent.com/duthiljean/ferrari-hero-demo/main/${String(i + 1).padStart(4, "0")}.webp`,
  },
];

// ── Expanded Card ─────────────────────────────────────────────────────────────
// Componente expandido que usa layoutId para transição fluida a partir do card
function ExpandedProjectCard({
  project,
  onClose,
  onPlay,
}: {
  project: Project;
  onClose: () => void;
  onPlay: (project: Project) => void;
}) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Prevenir rolagem da página por baixo da modal (incluindo Lenis)
  useEffect(() => {
    // 1. Bloquear o scroll nativo
    document.body.style.overflow = "hidden";

    // 2. Prevenir eventos de wheel e touch que sobem para o window (essencial para parar o Lenis)
    const preventScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInsideScrollable = target.closest(".scrollable-modal-content");
      if (isInsideScrollable) {
        // Se estiver rolando dentro da modal, não impede a rolagem interna, mas para a propagação
        e.stopPropagation();
      } else {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    // Fechar ao pressionar Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
    >
      {/* Backdrop escuro com desfoque de alta fidelidade */}
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Container Principal Expandido com Layout Compartilhado */}
      <motion.div
        layoutId={`card-container-${project.id}`}
        className="relative w-full max-w-4xl bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] z-10"
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Lado Esquerdo: Imagem Cover com efeito glow dinâmico */}
        <div className="relative w-full md:w-1/2 h-56 md:h-auto overflow-hidden">
          <motion.img
            layoutId={`card-image-${project.id}`}
            src={project.cover}
            alt={project.title}
            className="w-full h-full object-cover"
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Degradê cinematográfico para fundir com o fundo preto */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
          
          {/* Ambient Glow com a cor de destaque do projeto */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 30% 50%, ${project.accentHex} 0%, transparent 60%)`,
            }}
          />
        </div>

        {/* Lado Direito: Detalhes do Projeto com Scrollbar Otimizada */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between overflow-hidden">
          
          {/* Div com scroll para o conteúdo de texto */}
          <div 
            data-lenis-prevent
            className="scrollable-modal-content overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
          >
            {/* Cabeçalho */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <motion.h3
                  layoutId={`card-title-${project.id}`}
                  className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight leading-tight"
                >
                  {project.title}
                </motion.h3>
                <motion.p
                  layoutId={`card-subtitle-${project.id}`}
                  className="text-sm font-mono text-[#6f97ff] mt-1"
                >
                  {project.subtitle}
                </motion.p>
              </div>

              {/* Botão de Fechar */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800/80"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Linha colorida do tema */}
            <div
              className="h-[2px] w-12 my-6 rounded-full"
              style={{ backgroundColor: project.accentHex }}
            />

            {/* Descrição e detalhes técnicos */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed"
            >
              <p>
                {project.description}
              </p>
              <p className="text-slate-400 text-xs">
                A engenharia de software aplicada a este projeto foca em alta performance visual, modularização rígida do código e uma experiência rica em micro-interações que retêm o engajamento do usuário final.
              </p>
            </motion.div>

            {/* Lista de Tags */}
            <motion.div
              layoutId={`card-tags-${project.id}`}
              className="flex flex-wrap gap-2 mt-6"
            >
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono border border-slate-900 text-slate-400 bg-slate-900/60"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Rodapé com Ações */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-slate-900"
          >
            {/* Botão de Transição Cinematográfica */}
            <button
              onClick={() => onPlay(project)}
              className="relative group overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-code text-xs font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95"
              style={{
                backgroundColor: project.accentHex,
                boxShadow: `0 8px 30px ${project.accentHex}30`,
              }}
            >
              <Play className="h-3.5 w-3.5 fill-white animate-pulse" />
              <span>{project.liveUrl ? "VER PROJETO AO VIVO" : "DEMO EM BREVE"}</span>
              
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>

            {/* Links de navegação externa */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              {project.codeUrl && (
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800/80 flex items-center gap-2 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Code2 className="h-4 w-4" />
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800/80 flex items-center gap-2 text-xs font-mono"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// ── Card Compacto ─────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick: () => void;
}) {
  // Scroll-driven entrance: the card grows + fades in as it rises into view.
  // Lives on a WRAPPER (not the layoutId article) so the expand projection
  // never fights the scroll transform.
  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapRef,
    offset: ["start end", "center 62%"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.84, 1]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.25, 1]);

  return (
    <motion.div ref={wrapRef} style={{ scale, opacity }} className="will-change-transform">
    <motion.article
      layoutId={`card-container-${project.id}`}
      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-slate-950 border border-slate-900/60"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`Abrir projeto ${project.title}`}
    >
      {/* Imagem de Capa */}
      <div className="relative h-64 overflow-hidden">
        <motion.img
          layoutId={`card-image-${project.id}`}
          src={project.cover}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        {/* Glow temático no hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at center, ${project.accentHex} 0%, transparent 70%)` }}
        />

        {/* Ícone de Play centralizado */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/70 backdrop-blur-md border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100"
          >
            <Play className="h-5 w-5 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="relative p-5">
        {/* Detalhe superior colorido */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${project.accentHex}66, transparent)` }}
        />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <motion.h3 
              layoutId={`card-title-${project.id}`}
              className="text-lg font-bold text-white leading-tight"
            >
              {project.title}
            </motion.h3>
            <motion.p 
              layoutId={`card-subtitle-${project.id}`}
              className="text-xs text-[#6f97ff] font-mono mt-0.5"
            >
              {project.subtitle}
            </motion.p>
          </div>
          <div className="flex gap-2 shrink-0 mt-0.5">
            {project.codeUrl && (
              <a
                href={project.codeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800/40"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver código"
              >
                <Code2 className="h-3.5 w-3.5" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800/40"
                onClick={(e) => e.stopPropagation()}
                aria-label="Ver site ao vivo"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Resumo/Descrição */}
        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        <motion.div 
          layoutId={`card-tags-${project.id}`}
          className="flex flex-wrap gap-1.5 mb-4"
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono border border-slate-900 text-slate-400 bg-slate-950/40"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 group-hover:text-[#6f97ff] transition-colors duration-300 font-mono">
          <Play className="h-2.5 w-2.5" />
          <span>Ver detalhes do projeto</span>
        </div>
      </div>
    </motion.article>
    </motion.div>
  );
}

// ── Seção Principal ────────────────────────────────────────────────────────────
export default function ProjetosHeroScrub() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [transitionProject, setTransitionProject] = useState<Project | null>(null);
  const [fallbackProject, setFallbackProject] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Click → open the REAL project. The cinematic overlay plays as a quick
  // flourish while the live site opens in a NEW TAB, so the recruiter keeps the
  // portfolio open and can actually browse the project.
  const handlePlay = (project: Project) => {
    if (!project.liveUrl) {
      // No public demo yet (e.g. Compromisso) → graceful note instead.
      setFallbackProject(project.title);
      return;
    }
    // window.open runs INSIDE the click gesture → never popup-blocked.
    const win = window.open(project.liveUrl, "_blank", "noopener,noreferrer");
    setTransitionProject(project); // brief cinematic flourish
    if (!win) {
      // If a browser still blocks the popup, fall back to a same-tab redirect
      // so the user always reaches the project.
      setTimeout(() => {
        if (project.liveUrl) window.location.href = project.liveUrl;
      }, 900);
    }
  };

  // The overlay dismisses itself once its reveal finishes (the tab is already
  // open). No next/router here — this is a Vite SPA and the live project is an
  // external URL, so we open it directly instead of routing to an internal page.
  const endTransition = () => {
    setTransitionProject(null);
    setActiveProject(null);
  };

  return (
    <section className="w-full bg-[#05070f] px-5 py-16 sm:px-6 sm:py-20">
      {/* Notificador de Transição de Rota (Simulação local) */}
      <AnimatePresence>
        {fallbackProject && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 left-6 z-[100001] bg-slate-950 border border-[#2f6bff]/40 px-6 py-4 rounded-2xl shadow-xl flex flex-col gap-1 sm:left-auto sm:max-w-sm"
          >
            <div className="flex items-center gap-2 text-[#6f97ff] text-[10px] font-code font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f6bff] animate-ping" />
              DEMO AO VIVO EM BREVE
            </div>
            <p className="text-white text-sm font-medium mt-1">
              O demo de <span className="font-mono text-[#38e0ff]">{fallbackProject}</span> ainda está sendo preparado.
            </p>
            <p className="text-slate-400 text-[11px] leading-normal mt-1">
              Enquanto isso, role o card aberto para ver os detalhes técnicos do projeto.
            </p>
            <button
              onClick={() => setFallbackProject(null)}
              className="mt-3 text-left text-xs text-white/40 hover:text-white transition-colors underline font-mono w-fit"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de Transição Cinematográfica Fullscreen */}
      <AnimatePresence>
        {transitionProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-[100000] bg-black flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Efeito Zoom e Blur no conteúdo de transição */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(20px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              // ⬇️ The reveal finishing IS the cue to navigate — this is the
              // "await the animation, then route" handoff (no setTimeout guess).
              onAnimationComplete={endTransition}
              className="text-center px-6 z-10"
            >
              <span className="font-code text-xs uppercase tracking-[0.45em] text-[#6f97ff] block mb-4 animate-pulse">
                Abrindo projeto ao vivo
              </span>
              <h1 className="font-display text-4xl md:text-6xl text-white tracking-tight mb-2">
                {transitionProject.title}
              </h1>
              <p className="text-slate-400 font-mono text-sm max-w-md mx-auto">
                {transitionProject.subtitle}
              </p>

              {/* Barra de progresso linear ambientada */}
              <div className="w-48 h-[1px] bg-slate-900 mx-auto mt-8 relative overflow-hidden rounded-full border border-slate-800/40">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#2f6bff] to-transparent"
                />
              </div>
            </motion.div>

            {/* Grid de linhas cinemáticas e Glow focal */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${transitionProject.accentHex} 0%, transparent 60%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Headline cinemática — fica FIXA no topo da seção enquanto os cards
          deslizam por trás (sticky + backdrop-blur). */}
      <div className="sticky top-16 z-20 mx-auto mb-12 max-w-5xl sm:top-[72px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/[0.06] bg-[#05070f]/80 px-5 py-5 backdrop-blur-md sm:px-7 sm:py-6"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#2f6bff]/25 bg-[#2f6bff]/10 px-3 py-1 font-code text-[11px] text-[#6f97ff]">
            <Play className="h-3 w-3 fill-none" />
            Casos selecionados
          </div>
          <h2
            className="font-display tracking-tight text-white"
            style={{ fontSize: "clamp(1.35rem, 4.6vw, 2.5rem)", lineHeight: 1.06 }}
          >
            Projetos reais — de clientes{" "}
            <span className="text-[#38e0ff]">a desafios da faculdade.</span>
          </h2>
        </motion.div>
      </div>

      {/* Grid de Projetos */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setActiveProject(project)}
          />
        ))}
      </div>

      {/* Detalhes Expandidos (Modal com Shared Layout) */}
      <AnimatePresence>
        {activeProject && (
          <ExpandedProjectCard
            key={activeProject.id}
            project={activeProject}
            onClose={handleClose}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
