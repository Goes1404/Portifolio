import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import SectionHead from '@/components/ui/section-head';
import CursorPreview from '@/components/effects/CursorPreview';

const EXPERIENCES = [
  {
    id: 1,
    period: '2024 — hoje',
    status: 'Projeto principal',
    role: 'Desenvolvedor Full Stack',
    company: 'Compromisso',
    type: 'EdTech · ENEM & ETEC · IA',
    preview: '/projects/compromisso.jpg',
    previewFit: 'cover',
    description:
      'Meu principal projeto. Desenvolvi a Compromisso — plataforma de preparação para ENEM e ETEC com IA — ao lado de um único parceiro, à frente de todo o desenvolvimento, da concepção à entrega. Foi onde mais cresci como dev: assumir um produto inteiro, de ponta a ponta.',
    highlights: [
      'Mais de 730 usuários cadastrados — no ar em compromissose.com',
      'Ownership de todo o ciclo: front-end, back-end, banco e deploy',
      'Front-end em React / Next.js e back-end em Node.js com banco relacional',
      'Autenticação, painel do aluno e o fluxo completo da plataforma',
    ],
    tags: ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    accent: '#2f6bff',
  },
  {
    id: 2,
    period: '2025 — hoje',
    status: 'Atual',
    role: 'Analista de Tráfego & Dev Front-end',
    company: 'Next Home',
    type: 'Imobiliário · Performance & Web',
    preview: '/projects/next-home.jpg',
    previewFit: 'cover',
    description:
      'Uno desenvolvimento e dados: crio e mantenho sites e landing pages do setor imobiliário enquanto gerencio campanhas de tráfego pago e analiso a performance para gerar mais leads para o negócio.',
    highlights: [
      'Campanhas de tráfego pago (Meta Ads / Google Ads) com foco em ROI',
      'Análise de métricas (CPC, CTR, conversão) e relatórios em Power BI',
      'Desenvolvimento de sites responsivos (HTML, CSS, JS, React / Next.js)',
      'Segmentação de público-alvo a partir de lógica de dados',
    ],
    tags: ['Meta Ads', 'Google Ads', 'Power BI', 'React', 'Next.js', 'JavaScript'],
    accent: '#38e0ff',
  },
  {
    id: 3,
    period: '2023 — hoje',
    status: 'Ativo',
    role: 'Freelancer · Web & IoT',
    company: 'Autônomo',
    type: 'Front-end · Imobiliário & Automação',
    preview: '/projects/jr-acessorios.jpg',
    previewFit: 'cover',
    description:
      'Desenvolvo landing pages e sites de alta conversão para clientes reais nos setores imobiliário e comercial — alguns já no ar com domínio próprio — e também aplicações para automação residencial (IoT). Foco em UI/UX, responsividade e resultado.',
    highlights: [
      'Sites e landing pages de alta conversão (HTML5, CSS3, JavaScript)',
      'Projetos reais publicados (ex.: JR Acessórios, com domínio próprio)',
      'Aplicações para automação residencial (IoT) — do software ao hardware',
      'Otimização de performance para aumentar a captação de leads',
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'React', 'IoT', 'UI/UX'],
    accent: '#6f97ff',
  },
  {
    id: 4,
    period: '2023 — 2024',
    status: null,
    role: 'Jovem Aprendiz · Infraestrutura de TI',
    company: 'Thales Group',
    type: 'Multinacional · Redes & Sistemas',
    preview: '/thales.png',
    previewFit: 'contain',
    description:
      'Início da carreira em uma multinacional de tecnologia. Trabalhei diretamente com redes, sistemas e suporte — uma base sólida que hoje informa como penso infraestrutura e confiabilidade.',
    highlights: [
      'Gerenciamento de IPs de rede e administração de contas de usuários',
      'Operação de sistema de chamados (ticketing) com resolução ágil',
      'Manutenção preventiva e corretiva garantindo alta disponibilidade',
      'Análise e reestruturação de layouts de produção',
    ],
    tags: ['Infraestrutura', 'Redes', 'Help Desk', 'Suporte TI'],
    accent: '#2f6bff',
  },
] as const;

type Exp = (typeof EXPERIENCES)[number];

const EASE = [0.16, 1, 0.3, 1] as const;

function Row({ exp, index, open, onToggle, onHover }: {
  exp: Exp; index: number; open: boolean;
  onToggle: () => void; onHover: (src: string | null) => void;
}) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <motion.li
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, ease: EASE, delay: index * 0.06 }}
      className="index-row border-t rule"
      data-open={open}
      onPointerEnter={() => onHover(exp.preview)}
      onPointerLeave={() => onHover(null)}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`exp-${exp.id}`}
        data-cursor={open ? 'fechar' : 'abrir'}
        className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 px-2 py-6 text-left sm:gap-x-8 sm:px-4 md:grid-cols-[4rem_1fr_minmax(0,16rem)_auto] md:py-8"
      >
        <span
          className="font-display text-sm leading-none transition-colors duration-500 md:text-base"
          style={{ color: open ? exp.accent : 'rgba(233,237,247,0.35)' }}
        >
          {num}
        </span>

        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-code text-[10px] tracking-[0.35em] text-white/40 tabular-nums">{exp.period}</span>
            {exp.status && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-code text-[9px] uppercase tracking-[0.2em]"
                style={{ color: exp.accent, borderColor: `${exp.accent}40`, background: `${exp.accent}12` }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: exp.accent }} />
                {exp.status}
              </span>
            )}
          </span>
          <span
            className="mt-2 block font-display leading-[1.12] text-[#e9edf7] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2"
            style={{ fontSize: 'clamp(1.2rem, 3.2vw, 2.4rem)' }}
          >
            {exp.role}
          </span>
          <span className="mt-2 block font-code text-[11px] tracking-widest text-white/45 md:hidden">
            {exp.company} <span className="text-white/20">·</span> {exp.type}
          </span>
        </span>

        <span className="hidden min-w-0 md:block">
          <span className="block truncate font-code text-[12px] tracking-widest text-white/70">{exp.company}</span>
          <span className="mt-1 block truncate font-code text-[10px] tracking-widest text-white/30">{exp.type}</span>
        </span>

        <span
          className="flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-500"
          style={{
            borderColor: open ? exp.accent : 'rgba(233,237,247,0.15)',
            background: open ? `${exp.accent}1a` : 'transparent',
          }}
        >
          <Plus
            className="h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', color: open ? exp.accent : 'rgba(233,237,247,0.6)' }}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`exp-${exp.id}`}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-8 px-2 pb-10 sm:px-4 md:grid-cols-[4rem_1fr_minmax(0,16rem)_auto] md:gap-x-8">
              <span className="hidden md:block" />
              <div className="max-w-2xl">
                <p className="font-editorial text-lg italic leading-snug text-white/60 md:text-[1.2rem]">
                  {exp.description}
                </p>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {exp.highlights.map((h, i) => (
                    <motion.li
                      key={h}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.06, duration: 0.5, ease: EASE } }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-[0.45em] h-px w-4 shrink-0" style={{ background: exp.accent }} />
                      <span className="font-code text-xs leading-relaxed tracking-wide text-white/50">{h}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap content-start gap-2 md:col-span-2">
                {exp.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1.5 font-code text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: `${exp.accent}cc`, borderColor: `${exp.accent}26`, background: `${exp.accent}0a` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/**
 * Experiência — an editorial index. Each row is a numbered entry that opens
 * in place; hovering a row floats a preview (logo / product shot) under the
 * cursor. Reads like a table of contents, not a stack of cards.
 */
export default function ExperienciaSection() {
  const [openId, setOpenId] = useState<number | null>(EXPERIENCES[0].id);
  const [preview, setPreview] = useState<string | null>(null);
  const current = EXPERIENCES.find((e) => e.preview === preview);

  return (
    <section id="experiencia" className="relative scroll-mt-20 overflow-hidden bg-[#05070f] px-6 py-24 sm:px-8 md:py-36">
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 top-6 select-none font-display text-[30vw] leading-none text-white/[0.03] md:text-[18vw]"
      >
        02
      </span>

      <div className="relative mx-auto max-w-6xl">
        <SectionHead
          num="02"
          kicker="Experiência profissional"
          title={['Onde', <span key="a" className="text-[#2f6bff]">trabalhei</span>]}
          aside={
            <p className="font-code text-[11px] leading-relaxed tracking-[0.2em] text-white/40">
              {EXPERIENCES.length} POSIÇÕES · 2023 → HOJE<br />
              CLIQUE PARA EXPANDIR
            </p>
          }
        />

        <ul className="mt-16 border-b rule md:mt-20">
          {EXPERIENCES.map((exp, i) => (
            <Row
              key={exp.id}
              exp={exp}
              index={i}
              open={openId === exp.id}
              onToggle={() => setOpenId((cur) => (cur === exp.id ? null : exp.id))}
              onHover={setPreview}
            />
          ))}
        </ul>
      </div>

      <CursorPreview src={preview} fit={current?.previewFit ?? 'cover'} width={280} height={190} />
    </section>
  );
}
