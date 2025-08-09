import Container from "@/components/container";
import { MarqueImg } from "@/components/marquee-img";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex-col w-full pb-24">
      <Container>
        <div className="my-10 md:my-16">
          <h2 className="text-4xl md:text-6xl leading-tight text-center md:text-left">
            <span className="text-outline font-extrabold md:text-8xl block">AI Superpower</span>
            <span className="text-gray-500 font-extrabold">– A smarter way to</span>
            <br />
            master interviews with confidence
          </h2>

          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl">
            Supercharge your preparation with AI tools that mimic real interviews. Get feedback, track growth, and walk into every interview with clarity and confidence.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <Link to={"/generate"}>
              <Button size="lg" className="gap-2">
                Get started <Sparkles />
              </Button>
            </Link>
            <a href="#learn-more" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Learn more
            </a>
          </div>
        </div>

        <div className="flex w-full items-center justify-evenly md:px-12 md:py-10 md:items-center md:justify-end gap-12">
          <p className="text-3xl font-semibold text-gray-900 text-center">
            180k+
            <span className="block text-xl text-muted-foreground font-normal">Offers Received</span>
          </p>
          <p className="text-3xl font-semibold text-gray-900 text-center">
            1M+
            <span className="block text-xl text-muted-foreground font-normal">Interviews Aced</span>
          </p>
        </div>

        {/* image section */}
        <div className="w-full mt-4 rounded-xl bg-gray-100 h-[420px] drop-shadow-md overflow-hidden relative">
          <img src="/img/hero.jpg" alt="" className="w-full h-full object-cover" />

          <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 backdrop-blur-md">
            Interviews Copilot&copy;
          </div>

          <div className="hidden md:block absolute w-80 bottom-4 right-4 px-4 py-3 rounded-lg bg-white/70 backdrop-blur-md shadow">
            <h2 className="text-neutral-800 font-semibold">Developer</h2>
            <p className="text-sm text-neutral-600">
              Practice real-world interview scenarios and sharpen your skills with instant feedback.
            </p>

            <Button className="mt-3 gap-2">
              Generate <Sparkles />
            </Button>
          </div>
        </div>
      </Container>

      {/* marquee section */}
      <div className="w-full my-12">
        <Marquee pauseOnHover>
          <MarqueImg img="/img/logo/firebase.png" />
          <MarqueImg img="/img/logo/meet.png" />
          <MarqueImg img="/img/logo/zoom.png" />
          <MarqueImg img="/img/logo/firebase.png" />
          <MarqueImg img="/img/logo/microsoft.png" />
          <MarqueImg img="/img/logo/meet.png" />
          <MarqueImg img="/img/logo/tailwindcss.png" />
          <MarqueImg img="/img/logo/microsoft.png" />
        </Marquee>
      </div>

      <Container className="py-10 space-y-8" id="learn-more">
        <h2 className="tracking-wide text-xl text-gray-800 font-semibold">
          Unleash your potential with personalized AI insights and targeted interview practice.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="col-span-1 md:col-span-3">
            <img src="/img/office.jpg" alt="" className="w-full max-h-96 rounded-md object-cover" />
          </div>

          <div className="col-span-1 md:col-span-2 gap-8 max-h-96 min-h-96 w-full flex flex-col items-center justify-center text-center">
            <p className="text-center text-muted-foreground">
              Transform the way you prepare, gain confidence, and boost your chances of landing your dream job. Let AI be your edge in today's competitive job market.
            </p>

            <Link to={"/generate"} className="w-full">
              <Button className="w-3/4 gap-2">
                Generate <Sparkles className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;