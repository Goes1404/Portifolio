import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export function HeroScrollDemo() {
  return (
    <ScrollExpandMedia
      mediaType="sequence"
      bgImageSrc="https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=1920&auto=format&fit=crop&q=60"
      title="Dominando a stack completa para criar produtos que escalam."
      date="CÓDIGO · DESIGN · PRODUTO"
      scrollToExpand="scroll para expandir"
    />
  );
}

export default HeroScrollDemo;
