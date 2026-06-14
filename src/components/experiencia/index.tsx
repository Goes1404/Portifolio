import { motion } from 'framer-motion';
import Tilt3D from '@/components/effects/Tilt3D';

const EXPERIENCES = [
  {
    id: 1,
    period: '2024 — presente',
    status: 'Projeto principal',
    role: 'Desenvolvedor Full Stack · à frente do projeto',
    company: 'Compromisso (EdTech)',
    type: 'Plataforma Educacional',
    description:
      'Meu principal projeto. Desenvolvi a Compromisso — uma plataforma educacional completa — ao lado de um único parceiro, estando à frente de todo o desenvolvimento, da concepção à entrega. Foi onde mais cresci como dev: assumir um produto inteiro, de ponta a ponta.',
    highlights: [
      'Ownership de todo o ciclo: front-end, back-end, banco e deploy',
      'Front-end em React / Next.js e back-end em Node.js com banco relacional',
      'Autenticação, painel do aluno e o fluxo completo da plataforma',
      'Time enxuto (eu + 1 parceiro) — decisões técnicas e produto na prática',
    ],
    tags: ['Next.js', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
    accent: '#2f6bff',
  },
  {
    id: 2,
    period: '2025 — presente',
    status: 'Atual',
    role: 'Analista de Tráfego & Dev Front-end',
    company: 'Next Home',
    type: 'Imobiliário · Performance & Web',
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
    period: '2023 — presente',
    status: 'Ativo',
    role: 'Freelancer · Desenvolvedor Web & IoT',
    company: 'Autônomo · Clientes Reais',
    type: 'Front-end · Imobiliário & Automação',
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
    role: 'Jovem Aprendiz — Infraestrutura de TI',
    company: 'Thales Group',
    type: 'Multinacional · Redes & Sistemas',
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
];

const inView  = { once: true, margin: '-8% 0px -8% 0px' };
const ease    = [0.16, 1, 0.3, 1] as const;

const rise = {
  hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.05 } },
};

export default function ExperienciaSection() {
  return (
    <section
      id="experiencia"
      className="relative scroll-mt-20 bg-[#05070f] px-6 py-24 md:py-36"
    >
      <div className="relative mx-auto max-w-5xl">
        {/* Kicker */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="mb-16"
        >
          <motion.div variants={rise} className="flex items-center gap-4 mb-10">
            <span className="h-px w-10 shrink-0 bg-[#2f6bff]" />
            <span className="font-code text-xs uppercase tracking-[0.35em] text-white/50">
              02 — Experiência Profissional
            </span>
          </motion.div>

          <motion.h2
            variants={rise}
            className="font-display leading-[0.88] text-[#e9edf7]"
            style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}
          >
            Onde <span style={{ color: '#2f6bff' }}>trabalhei</span>
          </motion.h2>
        </motion.div>

        {/* Experience entries */}
        <div className="flex flex-col">
          {EXPERIENCES.map((exp, i) => (
            <motion.div
              key={exp.id}
              variants={rise}
              initial="hidden"
              whileInView="show"
              viewport={inView}
              className="group relative"
            >
              {/* Entry card — 3D tilt on pointer with moving specular glare */}
              <Tilt3D
                max={6}
                scale={1.01}
                className="relative rounded-2xl border px-5 py-7 md:px-10 md:py-9"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.018)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(60% 60% at 0% 0%, ${exp.accent}10 0%, transparent 60%)`,
                  }}
                />

                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full"
                  style={{ background: exp.accent, opacity: 0.5 }}
                />

                {/* Top row: period + status on one side, company on the other.
                    Stacks left-aligned on mobile, splits to a row from sm up. */}
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-code text-[11px] tracking-[0.4em] text-white/35 tabular-nums">
                      {exp.period}
                    </span>
                    {exp.status && (
                      <span
                        className="inline-flex items-center gap-1.5 font-code text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full"
                        style={{
                          color: exp.accent,
                          background: `${exp.accent}18`,
                          border: `1px solid ${exp.accent}30`,
                        }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: exp.accent }} />
                        {exp.status}
                      </span>
                    )}
                  </div>
                  <div className="sm:text-right">
                    <div className="font-code text-[11px] tracking-widest text-white/55">{exp.company}</div>
                    <div className="font-code text-[10px] tracking-widest text-white/25 mt-0.5">{exp.type}</div>
                  </div>
                </div>

                {/* Role — editorial display */}
                <h3
                  className="font-display text-[#e9edf7] leading-[0.9] mb-5"
                  style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)' }}
                >
                  {exp.role}
                </h3>

                {/* Description */}
                <p className="font-editorial text-lg italic leading-snug text-white/55 max-w-2xl mb-6 md:text-[1.15rem]">
                  {exp.description}
                </p>

                {/* Highlights */}
                <ul className="flex flex-col gap-2 mb-7">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3">
                      <span className="mt-[0.35em] h-1 w-4 shrink-0 rounded-full" style={{ background: exp.accent, opacity: 0.7 }} />
                      <span className="font-code text-xs tracking-wide text-white/45">{h}</span>
                    </li>
                  ))}
                </ul>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {exp.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-code text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full border"
                      style={{
                        color: `${exp.accent}cc`,
                        borderColor: `${exp.accent}20`,
                        background: `${exp.accent}08`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Tilt3D>

              {/* Connector line between entries */}
              {i < EXPERIENCES.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="w-px h-8 bg-gradient-to-b from-white/10 to-transparent" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
