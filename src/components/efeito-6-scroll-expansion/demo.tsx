import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: 'https://www.w3schools.com/html/mov_bbb.mp4',
    poster:
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=1280&auto=format&fit=crop&q=60',
    background:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1920&auto=format&fit=crop&q=80',
    title: 'Da Curiosidade ao Código',
    date: 'Onde tudo começou',
    scrollToExpand: 'Role para expandir',
    about: {
      overview:
        'Tudo começou com uma pergunta simples: "como esse site foi feito?". Essa curiosidade virou noites estudando, primeiros projetos quebrando, e a vontade de entender cada peça — do front ao back.',
      conclusion:
        'De autodidata a desenvolvedor, aprendi que construir software é tanto sobre pessoas quanto sobre tecnologia. Cada projeto é uma chance de resolver um problema real de ponta a ponta.',
    },
  },
  image: {
    src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1280&auto=format&fit=crop',
    background:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1920&auto=format&fit=crop',
    title: 'Construindo de Ponta a Ponta',
    date: 'A jornada full stack',
    scrollToExpand: 'Role para expandir',
    about: {
      overview:
        'Com o tempo, o foco virou entregar produtos completos: interfaces que encantam, APIs que aguentam carga e infraestrutura que não cai às 3 da manhã. Full stack não é sobre saber tudo — é sobre conectar tudo.',
      conclusion:
        'Hoje trabalho transformando ideias em produtos digitais reais, sempre com olhar para a experiência de quem usa e a qualidade de quem mantém o código depois.',
    },
  },
};

const MediaContent = ({ media }: { media: MediaContent }) => {
  return (
    <div className='mx-auto max-w-3xl text-center'>
      <h2 className='mb-6 font-display text-3xl text-[#e9edf7] md:text-4xl'>
        {media.date}
      </h2>
      <p className='mb-6 font-editorial text-xl italic leading-relaxed text-white/70'>
        {media.about.overview}
      </p>
      <p className='font-editorial text-xl italic leading-relaxed text-white/70'>
        {media.about.conclusion}
      </p>
    </div>
  );
};

const ScrollExpansionDemo = () => {
  // Single immersive story moment (image mode) — no scroll hijack, no toggle.
  const currentMedia = sampleMediaContent.image;

  return (
    <ScrollExpandMedia
      mediaType='image'
      mediaSrc={currentMedia.src}
      bgImageSrc={currentMedia.background}
      title={currentMedia.title}
      date={currentMedia.date}
      scrollToExpand={currentMedia.scrollToExpand}
      textBlend
    >
      <MediaContent media={currentMedia} />
    </ScrollExpandMedia>
  );
};

export default ScrollExpansionDemo;
