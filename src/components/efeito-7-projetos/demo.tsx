import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X, ExternalLink, Code2, Play, FileText, ArrowUpRight } from "lucide-react";
import SectionHead from "@/components/ui/section-head";
import CursorPreview from "@/components/effects/CursorPreview";
import BrowserFrame from "@/components/ui/browser-frame";

// ── Project data ─────────────────────────────────────────────────────────────
interface Project {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  cover: string;
  tags: string[];
  accentHex: string;
  featured?: boolean;
  liveUrl?: string;
  codeUrl?: string;
  docUrl?: string;
  demo?: { role: string; user: string; pass: string }[];
  year: string;
  kind: string;
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Compromisso",
    subtitle: "EdTech · ENEM & ETEC · 730+ usuários",
    description:
      "Meu principal projeto: a Compromisso, plataforma de preparação para ENEM e ETEC com tecnologia de IA. Desenvolvi de ponta a ponta ao lado de um parceiro, à frente de todo o desenvolvimento — hoje com mais de 730 usuários cadastrados. Front-end em React/Next.js, back-end em Node.js, autenticação e painel do aluno.",
    cover: "/projects/compromisso.jpg",
    tags: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL"],
    accentHex: "#2f6bff",
    year: "2024 — hoje",
    kind: "Produto próprio",
    featured: true,
    liveUrl: "https://compromissose.com",
    demo: [
      { role: "Aluno",     user: "aluno@compromisso.com",     pass: "compromisso2026@" },
      { role: "Professor", user: "professor@compromisso.com", pass: "compromisso2026@" },
      { role: "Admin",     user: "admin@compromisso.com",     pass: "compromisso2026@" },
      { role: "Staff",     user: "staff@compromisso.com",     pass: "compromisso2026@" },
    ],
  },
  {
    id: 10,
    title: "Next Home",
    subtitle: "Imobiliária · Alphaville, Barueri e região",
    description:
      "Site da Next Home, imobiliária onde atuo como analista de tráfego e dev front-end. Catálogo com dezenas de imóveis filtrável por tipo, cidade e faixa de preço, páginas de lançamentos, simulador de financiamento e atendimento direto no WhatsApp — pensado para converter o tráfego pago das campanhas em leads.",
    cover: "/projects/next-home.jpg",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "SEO", "Imobiliário"],
    accentHex: "#38e0ff",
    year: "2025 — hoje",
    kind: "Cliente real",
    featured: true,
    liveUrl: "https://next-home-drab.vercel.app",
    codeUrl: "https://github.com/Goes1404/next-home",
  },
  {
    id: 11,
    title: "Dalí",
    subtitle: "Escola SaaS · Ensino e gestão escolar · ENEM & ETEC",
    description:
      "Plataforma SaaS de estudo e gestão escolar: cinco perfis (aluno, professor, secretaria, responsável e direção) sobre uma única base de dados. Simulados no padrão real, redação corrigida em minutos, gamificação com XP, ofensiva e mascote, flashcards com repetição espaçada, financeiro de mensalidades e chamada por código.",
    cover: "/projects/escolasaas.jpg",
    tags: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "SaaS"],
    accentHex: "#6f97ff",
    year: "2026",
    kind: "Produto próprio",
    featured: true,
    liveUrl: "https://escolasaas.vercel.app",
    codeUrl: "https://github.com/Goes1404/escolasaas",
  },
  {
    id: 2,
    title: "NEXUS",
    subtitle: "TOTVS Challenge 2026 · FIAP · IA de Vendas",
    description:
      "Plataforma de inteligência conversacional do TOTVS Challenge 2026 (FIAP). Transforma transcrições brutas de reuniões em planos de ação automáticos via agente Pydantic AI multi-provider — pipeline de 5 tools em ~90s, monorepo com Next.js 16, Fastify 5, FastAPI e PostgreSQL + pgvector.",
    cover: "/projects/nexus.jpg",
    tags: ["Next.js", "React 19", "Fastify", "Python", "PostgreSQL", "Redis", "Pydantic AI", "TOTVS"],
    accentHex: "#38e0ff",
    year: "2026",
    kind: "Hackathon · FIAP × TOTVS",
    liveUrl: "https://frontend-seven-mauve-95.vercel.app/login",
    demo: [
      { role: "Demo", user: "joao.silva@totvs.com.br", pass: "nexus2026" },
    ],
  },
  {
    id: 3,
    title: "JR Acessórios",
    subtitle: "Cliente Real · Loja Virtual (em implementação)",
    description:
      "Loja virtual de acessórios artesanais para cliente real, com domínio próprio (jracessorios.com) — atualmente em implementação. Catálogo de produtos, fluxo de pedidos e foco em conversão. Desenvolvimento de ponta a ponta, do front-end ao deploy.",
    cover: "/projects/jr-acessorios.jpg",
    tags: ["React", "Next.js", "Node.js", "E-commerce"],
    accentHex: "#2f6bff",
    year: "2025",
    kind: "Cliente real",
    liveUrl: "https://www.jracessorios.com",
    codeUrl: "https://github.com/Goes1404/jota-r-craft-connect",
  },
  {
    id: 4,
    title: "Corretora Cristal",
    subtitle: "Cliente Real · Site Imobiliário em Alphaville, SP",
    description:
      "Site profissional para corretora imobiliária em Alphaville, SP. Catálogo de imóveis, dashboard administrativo, formulário de contato e vitrine de estatísticas do negócio. Meu primeiro projeto para um cliente real no nicho imobiliário.",
    cover: "/projects/corretora-cristal.jpg",
    tags: ["Lovable", "Next.js", "React", "Imobiliário"],
    accentHex: "#38e0ff",
    year: "2025",
    kind: "Cliente real",
    liveUrl: "https://cristal-nexthome.lovable.app/",
  },
  {
    id: 5,
    title: "SPY26DER",
    subtitle: "FIAP · Global Solution 2026 — Space Connect",
    description:
      "Global Solution da FIAP (Space Connect 2026): sistema robótico semi-autônomo que mapeia tubos de lava lunares com enxames de micro-robôs (LIDAR + SLAM + rede mesh), transformando cavernas naturais em habitats protegidos da radiação. O projeto exigiu trabalhar em TODAS as áreas — Data Science (Python/ML), modelagem de banco, simulação de redes (Cisco Packet Tracer), modelagem 3D/AR-VR e metodologia ágil.",
    cover: "/projects/spy26der.jpg",
    tags: ["Python", "Machine Learning", "Data Science", "Redes", "AR/VR", "SQL"],
    accentHex: "#6f97ff",
    year: "2026",
    kind: "Global Solution · FIAP",
    docUrl: "https://docs.google.com/document/d/1DtKBkq6CwijJIqOuluMZie4ZT17tEN1fkA3H_LZdEM0/edit?usp=drivesdk",
  },
  {
    id: 6,
    title: "Vinheria Agnello",
    subtitle: "FIAP · Checkpoint 01 — Desenvolvimento Web",
    description:
      "Primeiro checkpoint da FIAP — site completo para vinheria artesanal com catálogo de produtos, navegação entre páginas, seção de personalização e layout responsivo. HTML semântico e CSS puro.",
    cover: "/projects/vinheria-agnello.jpg",
    tags: ["HTML", "CSS", "GitHub Pages", "FIAP"],
    accentHex: "#6f97ff",
    year: "2024",
    kind: "Checkpoint · FIAP",
    liveUrl: "https://mariaeduardaacyole.github.io/Checkpoint-Site-da-Vinheria-Agnello/src/pages/produtos.html",
    codeUrl: "https://github.com/Goes1404/Checkpoint-Site-da-Vinheria-Agnello",
  },
  {
    id: 7,
    title: "GlowCare",
    subtitle: "FIAP · Checkpoint 02 — E-commerce de Cosméticos",
    description:
      "Segundo checkpoint da FIAP — e-commerce de cosméticos e maquiagem com identidade visual própria, catálogo de produtos, carrinho de compras e galeria. Design focado em autocuidado e expressão pessoal.",
    cover: "/projects/glowcare.jpg",
    tags: ["HTML", "CSS", "GitHub Pages", "FIAP"],
    accentHex: "#6f97ff",
    year: "2024",
    kind: "Checkpoint · FIAP",
    liveUrl: "https://goes1404.github.io/Glowcare/",
    codeUrl: "https://github.com/Goes1404/Glowcare",
  },
  {
    id: 8,
    title: "Melodia",
    subtitle: "FIAP · Checkpoint 05 — Landing Page de Streaming",
    description:
      "Checkpoint de front-end da FIAP — landing page para o serviço de streaming de música \"Melodia\". Hero, seções de recursos, depoimentos, player com playlist dinâmica e newsletter, com layout responsivo. HTML5, CSS3 e JavaScript.",
    cover: "/projects/melodia.jpg",
    tags: ["HTML5", "CSS3", "JavaScript", "FIAP"],
    accentHex: "#6f97ff",
    year: "2025",
    kind: "Checkpoint · FIAP",
    liveUrl: "https://maykesantos98.github.io/Front-end-CP5/",
    codeUrl: "https://github.com/Maykesantos98/Front-end-CP5",
  },
  {
    id: 9,
    title: "EcoTrend",
    subtitle: "FIAP · Checkpoint 04 — E-commerce Sustentável",
    description:
      "Checkpoint de front-end da FIAP — e-commerce de produtos sustentáveis e ecológicos (beleza, vestuário, acessórios e utilidades). Catálogo com filtro dinâmico de produtos por categoria, carrinho de compras e layout responsivo. HTML5, CSS3, Bootstrap 5 e JavaScript.",
    cover: "/projects/ecotrend.jpg",
    tags: ["HTML5", "CSS3", "Bootstrap", "JavaScript", "FIAP"],
    accentHex: "#6f97ff",
    year: "2025",
    kind: "Checkpoint · FIAP",
    liveUrl: "https://mariaeduardaacyole.github.io/EcoTrend---CP4/",
    codeUrl: "https://github.com/mariaeduardaacyole/EcoTrend---CP4",
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
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        className="relative w-full max-w-4xl bg-[#0a0e1c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] z-10"
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Lado Esquerdo: Imagem Cover com efeito glow dinâmico */}
        <div className="relative w-full md:w-1/2 h-56 md:h-auto overflow-hidden">
          <motion.img
            layoutId={`card-image-${project.id}`}
            src={project.cover}
            alt={project.title}
            className="w-full h-full object-cover object-top"
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          />
          {/* Degradê cinematográfico para fundir com o fundo preto */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#0a0e1c] via-[#0a0e1c]/40 to-transparent" />
          
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
                  className="text-2xl md:text-3xl font-display text-white tracking-tight leading-tight"
                >
                  {project.title}
                </motion.h3>
                <motion.p
                  layoutId={`card-subtitle-${project.id}`}
                  className="text-sm font-code text-[#6f97ff] mt-1"
                >
                  {project.subtitle}
                </motion.p>
              </div>

              {/* Botão de Fechar */}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10"
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
              className="text-white/65 text-sm md:text-base leading-relaxed"
            >
              <p>
                {project.description}
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
                  className="px-2.5 py-1 rounded-full text-[11px] font-code border border-white/10 text-white/55 bg-white/[0.04]"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Acesso de demonstração — recrutador entra e explora a plataforma */}
            {project.demo && project.demo.length > 0 && (
              <div
                className="mt-6 rounded-xl border p-4"
                style={{ borderColor: `${project.accentHex}33`, background: `${project.accentHex}0d` }}
              >
                <div className="mb-3 flex items-center gap-2 font-code text-[10px] uppercase tracking-[0.18em] text-[#6f97ff]">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: project.accentHex }} />
                  Acesso de demonstração — entre e explore
                </div>
                <div className="space-y-2">
                  {project.demo.map((d) => (
                    <div key={d.role} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-code text-xs">
                      <span className="text-white/40">{d.role}</span>
                      <span className="text-white/80 break-all select-all">{d.user}</span>
                      <span className="text-white/25">·</span>
                      <span className="text-white/55 break-all select-all">{d.pass}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rodapé com Ações */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-white/10"
          >
            {/* Botão de Transição Cinematográfica */}
            <button
              onClick={() => onPlay(project)}
              className="cta-sheen relative group w-full sm:w-auto px-8 py-3.5 rounded-full text-white font-code text-xs font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg active:scale-95"
              style={{
                backgroundColor: project.accentHex,
                boxShadow: `0 8px 30px ${project.accentHex}30`,
              }}
            >
              <Play className="h-3.5 w-3.5 fill-white animate-pulse" />
              <span>
                {project.liveUrl
                  ? "VER PROJETO AO VIVO"
                  : project.docUrl
                    ? "VER DOCUMENTO DO PROJETO"
                    : "DEMO EM BREVE"}
              </span>
              
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </button>

            {/* Links de navegação externa */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              {project.codeUrl && (
                <a
                  href={project.codeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
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
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-4 w-4" />
                  Live Demo
                </a>
              )}
              {project.docUrl && (
                <a
                  href={project.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white/50 hover:text-white transition-colors border border-white/10 flex items-center gap-2 text-xs font-code"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="h-4 w-4" />
                  Documento
                </a>
              )}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

// ── Featured case row ─────────────────────────────────────────────────────
// Large editorial row: image on one side (alternating), big type on the
// other. The image drifts with scroll (parallax) and zooms on hover; the
// title slides. Shares layoutIds with the modal for a seamless open.
function FeaturedCase({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);
  const flip = index % 2 === 1;
  const num = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      ref={ref}
      layoutId={`card-container-${project.id}`}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="group grid cursor-pointer grid-cols-1 items-center gap-6 border-t rule py-10 md:grid-cols-12 md:gap-10 md:py-16"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      aria-label={`Abrir projeto ${project.title}`}
      data-cursor="ver case"
    >
      {/* Image */}
      <div className={`relative md:col-span-6 ${flip ? "md:order-2" : ""}`}>
        <motion.div style={{ y: imgY }}>
          <BrowserFrame
            src={project.cover}
            alt={project.title}
            url={project.liveUrl ?? project.docUrl}
            layoutId={`card-image-${project.id}`}
            accentHex={project.accentHex}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-30"
              style={{ background: `radial-gradient(60% 60% at 50% 100%, ${project.accentHex}, transparent 70%)` }}
            />
            <span className="absolute bottom-4 right-4 inline-flex translate-y-2 items-center gap-2 rounded-full border border-white/15 bg-[#05070f]/70 px-3.5 py-2 font-code text-[10px] uppercase tracking-[0.25em] text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              Ver case <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </BrowserFrame>
        </motion.div>
      </div>

      {/* Copy */}
      <div className={`relative md:col-span-6 ${flip ? "md:order-1 md:pr-6" : "md:pl-6"}`}>
        <div className="flex items-center gap-4">
          <span className="font-display text-sm leading-none" style={{ color: project.accentHex }}>{num}</span>
          <span className="h-px w-8 bg-white/15" />
          <span className="font-code text-[10px] uppercase tracking-[0.3em] text-white/45">{project.kind}</span>
          <span className="hidden h-px w-4 bg-white/15 sm:block" />
          <span className="hidden font-code text-[10px] tracking-[0.3em] text-white/30 tabular-nums sm:block">{project.year}</span>
        </div>
        <motion.h3
          layoutId={`card-title-${project.id}`}
          className="mt-5 font-display leading-[1.02] text-[#e9edf7] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2"
          style={{ fontSize: "clamp(1.8rem, 3.1vw, 3.1rem)" }}
        >
          {project.title}
        </motion.h3>
        <motion.p layoutId={`card-subtitle-${project.id}`} className="mt-3 font-code text-xs tracking-wide text-[#6f97ff]">
          {project.subtitle}
        </motion.p>
        <p className="mt-5 max-w-md font-editorial text-lg italic leading-snug text-white/55 line-clamp-3 md:text-xl">
          {project.description}
        </p>
        <motion.div layoutId={`card-tags-${project.id}`} className="mt-6 flex flex-wrap gap-2">
          {project.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-code text-[10px] text-white/55">
              {tag}
            </span>
          ))}
        </motion.div>
        <div className="mt-7 flex items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              data-cursor="abrir"
              className="link-underline font-code text-[11px] tracking-[0.25em] text-[#e9edf7]"
            >
              AO VIVO ↗
            </a>
          )}
          {project.codeUrl && (
            <a
              href={project.codeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              data-cursor="código"
              className="link-underline font-code text-[11px] tracking-[0.25em] text-white/50 hover:text-[#e9edf7]"
            >
              GITHUB ↗
            </a>
          )}
          {project.docUrl && (
            <a
              href={project.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              data-cursor="ler"
              className="link-underline font-code text-[11px] tracking-[0.25em] text-white/50 hover:text-[#e9edf7]"
            >
              DOCUMENTO ↗
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ── Index row (secondary projects) ────────────────────────────────────────
function IndexRow({
  project,
  index,
  onOpen,
  onHover,
}: {
  project: Project;
  index: number;
  onOpen: () => void;
  onHover: (src: string | null) => void;
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (index % 6) * 0.05 }}
      className="index-row border-t rule"
      onPointerEnter={() => onHover(project.cover)}
      onPointerLeave={() => onHover(null)}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="ver"
        className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 px-2 py-5 text-left sm:px-4 md:grid-cols-[4rem_1fr_minmax(0,14rem)_6rem_auto] md:gap-x-8 md:py-6"
      >
        <span className="font-display text-sm leading-none text-white/35 transition-colors group-hover:text-[#38e0ff]">{num}</span>
        <span className="min-w-0">
          <span
            className="block font-display leading-tight text-[#e9edf7] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2 md:truncate"
            style={{ fontSize: "clamp(1.25rem, 2.6vw, 2rem)" }}
          >
            {project.title}
          </span>
          <span className="mt-1 block truncate font-code text-[10px] tracking-widest text-white/40 md:hidden">
            {project.kind} · {project.year}
          </span>
        </span>
        <span className="hidden truncate font-code text-[11px] tracking-widest text-white/50 md:block">{project.kind}</span>
        <span className="hidden font-code text-[11px] tracking-widest text-white/35 tabular-nums md:block">{project.year}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition-all duration-500 group-hover:border-[#2f6bff] group-hover:bg-[#2f6bff]/15 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </button>
    </motion.li>
  );
}

// ── Seção Principal ────────────────────────────────────────────────────────────
export default function ProjetosHeroScrub() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [transitionProject, setTransitionProject] = useState<Project | null>(null);
  const [fallbackProject, setFallbackProject] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setActiveProject(null);
  }, []);

  // Click → open the REAL project. The cinematic overlay plays as a quick
  // flourish while the live site opens in a NEW TAB, so the recruiter keeps the
  // portfolio open and can actually browse the project.
  const handlePlay = (project: Project) => {
    const url = project.liveUrl ?? project.docUrl;
    if (!url) {
      setFallbackProject(project.title);
      return;
    }
    const win = window.open(url, "_blank", "noopener,noreferrer");
    setTransitionProject(project);
    if (!win) {
      setTimeout(() => {
        window.location.href = url;
      }, 900);
    }
  };

  const endTransition = () => {
    setTransitionProject(null);
    setActiveProject(null);
  };

  const featured = PROJECTS.filter((p) => p.featured);
  const others = PROJECTS.filter((p) => !p.featured);

  return (
    <section className="relative w-full overflow-hidden bg-[#05070f] px-6 py-20 sm:px-8 sm:py-28">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 top-10 select-none font-display text-[30vw] leading-none text-white/[0.03] md:text-[18vw]"
      >
        03
      </span>

      {/* Notificador — demo ainda não disponível */}
      <AnimatePresence>
        {fallbackProject && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 left-6 z-[100001] bg-[#0a0e1c] border border-[#2f6bff]/40 px-6 py-4 rounded-2xl shadow-xl flex flex-col gap-1 sm:left-auto sm:max-w-sm"
          >
            <div className="flex items-center gap-2 text-[#6f97ff] text-[10px] font-code font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f6bff] animate-ping" />
              DEMO AO VIVO EM BREVE
            </div>
            <p className="text-white text-sm font-medium mt-1">
              O demo de <span className="font-code text-[#38e0ff]">{fallbackProject}</span> ainda está sendo preparado.
            </p>
            <button
              onClick={() => setFallbackProject(null)}
              className="mt-3 text-left text-xs text-white/40 hover:text-white transition-colors underline font-code w-fit"
            >
              Fechar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay de transição ao abrir um projeto ao vivo */}
      <AnimatePresence>
        {transitionProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[100000] bg-[#05070f] flex flex-col items-center justify-center overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.86, opacity: 0, filter: "blur(16px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={endTransition}
              className="text-center px-6 z-10"
            >
              <span className="font-code text-xs uppercase tracking-[0.45em] text-[#6f97ff] block mb-4">
                {transitionProject.liveUrl ? "Abrindo projeto ao vivo" : "Abrindo documento do projeto"}
              </span>
              <h1 className="font-display text-4xl md:text-6xl text-white tracking-tight mb-2">
                {transitionProject.title}
              </h1>
              <p className="text-white/50 font-code text-sm max-w-md mx-auto">{transitionProject.subtitle}</p>
              <div className="w-48 h-px bg-white/10 mx-auto mt-8 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#2f6bff] to-transparent"
                />
              </div>
            </motion.div>
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${transitionProject.accentHex} 0%, transparent 60%)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          num="03"
          kicker="Trabalho selecionado"
          title={["Projetos reais —", <span key="b" className="text-[#38e0ff]">de clientes a desafios</span>]}
          aside={
            <p className="font-code text-[11px] leading-relaxed tracking-[0.2em] text-white/40">
              {PROJECTS.length} PROJETOS · {featured.length} EM DESTAQUE<br />
              CLIQUE PARA VER O CASE
            </p>
          }
        />

        {/* Featured — large editorial rows */}
        <div className="mt-16 border-b rule md:mt-20">
          {featured.map((project, i) => (
            <FeaturedCase key={project.id} project={project} index={i} onOpen={() => setActiveProject(project)} />
          ))}
        </div>

        {/* Index — the rest, as a table of contents with a cursor preview */}
        <div className="mt-24 md:mt-32">
          <div className="mb-8 flex items-center justify-between gap-6">
            <span className="flex items-center gap-4">
              <span className="h-px w-8 bg-white/25" />
              <span className="font-code text-[11px] uppercase tracking-[0.3em] text-white/50">Mais projetos — clientes & FIAP</span>
            </span>
            <span className="hidden font-code text-[10px] tracking-[0.3em] text-white/30 md:block">PASSE O MOUSE PARA PRÉ-VISUALIZAR</span>
          </div>
          <ul className="border-b rule">
            {others.map((project, i) => (
              <IndexRow
                key={project.id}
                project={project}
                index={featured.length + i}
                onOpen={() => setActiveProject(project)}
                onHover={setPreview}
              />
            ))}
          </ul>
        </div>
      </div>

      <CursorPreview src={preview} width={320} height={200} />

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
