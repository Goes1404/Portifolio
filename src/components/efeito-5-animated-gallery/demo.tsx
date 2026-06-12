import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryCol,
  GalleryContainer,
} from "@/components/ui/animated-gallery"
import { Button } from "@/components/ui/button"
import { VideoIcon } from "lucide-react"

const IMAGES_1 = [
  "https://images.unsplash.com/photo-1529218402470-5dec8fea0761?w=900&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1604928141064-207cea6f571f?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1573455494060-c5595004fb6c?w=800&auto=format&fit=crop&q=60",
]
const IMAGES_2 = [
  "https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1564284369929-026ba231f89b?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1532236204992-f5e85c024202?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1493515322954-4fa727e97985?w=800&auto=format&fit=crop&q=60",
]
const IMAGES_3 = [
  "https://images.unsplash.com/photo-1528361237150-8a9a7df33035?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1493515322954-4fa727e97985?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1608875004752-2fdb6a39ba4c?w=800&auto=format&fit=crop&q=60",
]

export const DemoVariant1 = () => {
  return (
    <div className="relative bg-[#05070f]">
      <ContainerStagger className="relative z-[9999] -mb-12 place-self-center px-6 pt-12 text-center">
        <ContainerAnimated>
          <h1 className="font-display text-3xl text-[#e9edf7] md:text-4xl">
            Momentos da{" "}
            <span className="text-[#38e0ff]">
              jornada
            </span>
          </h1>
        </ContainerAnimated>
        <ContainerAnimated>
          <h1 className="mt-3 font-editorial text-3xl italic text-white/70 md:text-4xl">
            estudo, código e café
          </h1>
        </ContainerAnimated>

        <ContainerAnimated className="my-5">
          <p className="font-editorial text-lg italic leading-normal text-white/55">
            Cada projeto, cada bug resolvido e cada linha aprendida
            <br /> fazem parte da história que me trouxe até aqui.
          </p>
        </ContainerAnimated>

        <ContainerAnimated className="flex items-center justify-center gap-2">
          <Button className="gap-1 bg-[#2f6bff] text-white hover:bg-[#6f97ff]">
            Ver projetos <VideoIcon className="size-4" />
          </Button>
          <Button variant={"link"} className="text-white/60 hover:text-[#38e0ff]">
            Sobre mim
          </Button>
        </ContainerAnimated>
      </ContainerStagger>
      <div
        className="pointer-events-none absolute z-10 h-[70vh] w-full"
        style={{
          background: "linear-gradient(to right, #0a1f6b, #2f6bff, #38e0ff)",
          filter: "blur(90px)",
          mixBlendMode: "screen",
          opacity: 0.6,
        }}
      />

      <ContainerScroll className="relative h-[350vh]">
        <ContainerSticky className="h-svh">
          <GalleryContainer>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_1.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol className="mt-[-50%]" yRange={["15%", "5%"]}>
              {IMAGES_2.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
            <GalleryCol yRange={["-10%", "2%"]} className="-mt-2">
              {IMAGES_3.map((imageUrl, index) => (
                <img
                  key={index}
                  className="aspect-video block h-auto max-h-full w-full rounded-md object-cover shadow"
                  src={imageUrl}
                  alt="gallery item"
                />
              ))}
            </GalleryCol>
          </GalleryContainer>
        </ContainerSticky>
      </ContainerScroll>
    </div>
  )
}

export default DemoVariant1
