import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

export function HeroScrollDemo() {
  return (
    <ScrollExpandMedia
      mediaType="sequence"
      bgImageSrc="/0611_frames/frame_001.webp"
      titleTop="Da primeira linha"
      titleBottom="ao deploy final"
      date="CÓDIGO · DESIGN · PRODUTO"
      scrollToExpand="role para expandir"
    />
  );
}

export default HeroScrollDemo;
