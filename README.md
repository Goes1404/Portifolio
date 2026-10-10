# Matheus Goes da Silva — Portfólio

Site pessoal (React 19 + Vite 8 + Tailwind) com narrativa editorial e motion:
preloader cinematográfico, hero com parallax em camadas sobre shader WebGL,
História pinada por capítulos, Experiência e Projetos em formato de índice
editorial com pré-visualização que segue o cursor, sequência de frames
scrubbada por scroll, e rodapé com marquee tipográfico.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção → dist/
npm run preview  # serve o build
npm run lint
```

## Estrutura

- `src/App.jsx` — shell da página (hero, parceiros, contato) e ordem das seções
- `src/components/shell/` — Preloader, Header (esconde ao rolar, relógio SP, seção ativa), SectionNav
- `src/components/effects/` — CustomCursor, ParticleField, Magnetic, SplitReveal, ScrambleText, CursorPreview…
- `src/components/historia/` — intro + capítulos pinados com retrato P&B → cor
- `src/components/experiencia/` — índice expansível
- `src/components/parceiros/` — faixa editorial de parceiros
- `src/components/ui/browser-frame.tsx` — mockup único usado em todas as capas
- `src/components/efeito-7-projetos/` — cases em destaque + índice + modal
- `src/components/skills/` — ledger de ferramentas
- `public/0611_frames/` — 144 frames `.webp` da sequência da marca (campo de linhas → wordmark MGS), carregados sob demanda
- `public/projects/` — capturas reais dos projetos (1440×900). Para atualizar: abra o site, capture a dobra e salve com o mesmo nome

## Conteúdo

Links, e-mail e CV ficam no topo de `src/App.jsx`. Projetos em
`src/components/efeito-7-projetos/demo.tsx`, experiências em
`src/components/experiencia/index.tsx`, capítulos em `src/components/historia/index.tsx`.
