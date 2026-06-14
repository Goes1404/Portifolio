import {
  ScrollPortraitWall,
  type Speaker,
} from "@/components/ui/scroll-portrait-wall";

// Abstract/tech textures cycled behind each skill caption.
const TEXTURES = [
  "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1607706189992-eae578626c86?w=600&auto=format&fit=crop&q=60",
];

// Each "speaker" is a skill: name = technology, role = category.
const speakers: Speaker[] = [
  { name: "React", role: "Frontend" },
  { name: "Next.js", role: "Frontend · SSR" },
  { name: "TypeScript", role: "Linguagem" },
  { name: "JavaScript", role: "Linguagem" },
  { name: "HTML5 & CSS3", role: "Frontend" },
  { name: "Tailwind", role: "UI · Estilo" },
  { name: "Node.js", role: "Backend" },
  { name: "PostgreSQL", role: "Banco de Dados" },
  { name: "Python", role: "Linguagem" },
  { name: "SQL", role: "Dados" },
  { name: "Power BI", role: "Análise de Dados" },
  { name: "Git & GitHub", role: "Versionamento" },
].map((s, i) => ({
  ...s,
  src: TEXTURES[i % TEXTURES.length],
}));

export default function ScrollPortraitWallDemo() {
  return (
    <ScrollPortraitWall
      title="Minha Stack"
      hint="role para ver minha stack"
      date="12 ferramentas favoritas"
      speakers={speakers}
      showCaptions={true}
    />
  );
}
