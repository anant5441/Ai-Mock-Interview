import Container from "@/components/container";
import { MarqueImg } from "@/components/marquee-img";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, FileSearch, BarChart3, FileText, MessageSquare, Lock } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

const HomePage = () => {
     const { userId } = useAuth();

     return <div className="flex-col w-full pb-24">
          <Container>
               <div className="my-8">
                    <h2 className="text-3xl text-center md:text-left md:text-6xl dark:text-white">
                         <span className=" text-outline font-extrabold md:text-8xl">
                              AI Superpower
                         </span>
                         <span className="text-gray-500 dark:text-gray-400 font-extrabold">
                              – A smarter way to
                         </span>
                         <br />
                         master interviews with confidence
                    </h2>

                    <p className="mt-4 text-muted-foreground text-sm">
                         Supercharge your preparation with AI tools that mimic real interviews. Get feedback, track growth, and walk into every interview with clarity and confidence.
                    </p>
               </div>
               <div className="flex w-full items-center justify-evenly md:px-12 md:py-16 md:items-center md:justify-end gap-12">
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white text-center">
                         180k+
                         <span className="block text-xl text-muted-foreground font-normal">
                              Offers Recieved
                         </span>
                    </p>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white text-center">
                         1M+
                         <span className="block text-xl text-muted-foreground font-normal">
                              Interview Aced
                         </span>
                    </p>
               </div>
               {/* image section */}
               <div className="w-full mt-4 rounded-xl bg-gray-100 dark:bg-gray-800 h-[420px] drop-shadow-md overflow-hidden relative">
                    <img
                         src="/img/hero.jpg"
                         alt=""
                         className="w-full h-full object-cover"
                    />

                    <div className="absolute top-4 left-4 px-4 py-2 rounded-md bg-white/40 dark:bg-black/40 backdrop-blur-md dark:text-white">
                         Inteviews
                    </div>

                    <div className="hidden md:block absolute w-80 bottom-4 right-4 px-4 py-2 rounded-md bg-white/60 dark:bg-black/50 backdrop-blur-md">
                         <h2 className="text-neutral-800 dark:text-white font-semibold">Developer</h2>
                         <p className="text-sm text-neutral-500 dark:text-neutral-300">
                              Get instant AI-generated interview questions tailored to for this role.
                         </p>

                         <Button className="mt-3">
                              Generate <Sparkles />
                         </Button>
                    </div>
               </div>
          </Container>
          {/* marquee section */}
          <div className=" w-full my-12">
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
          <Container className="py-8 space-y-8">
               <h2 className="tracking-wide text-xl text-gray-800 dark:text-gray-100 font-semibold">
                    Unleash your potential with personalized AI insights and targeted
                    interview practice.
               </h2>

               <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="col-span-1 md:col-span-3">
                         <img
                              src="/img/office.jpg"
                              alt=""
                              className="w-full max-h-96 rounded-md object-cover"
                         />
                    </div>

                    <div className="col-span-1 md:col-span-2 gap-8 max-h-96 min-h-96 w-full flex flex-col items-center justify-center text-center">
                         <p className="text-center text-muted-foreground">
                              Transform the way you prepare, gain confidence, and boost your
                              chances of landing your dream job. Let AI be your edge in
                              today&apos;s competitive job market.
                         </p>

                         <Link to={"/generate"} className="w-full">
                              <Button className="w-3/4">
                                   Generate <Sparkles className="ml-2" />
                              </Button>
                         </Link>
                    </div>
               </div>
          </Container>

          {/* ─── FEATURES SECTION (visible when NOT logged in) ─── */}
          {!userId && (
               <Container className="py-12 md:py-16">
                    <div className="text-center mb-10">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium mb-4">
                              <Lock className="w-3.5 h-3.5" />
                              Sign in to unlock
                         </div>
                         <h2 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">
                              Powerful Features Await You
                         </h2>
                         <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
                              Create an account or sign in to access our full suite of AI-powered career tools.
                         </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                         {[
                              { icon: <BrainCircuit className="w-6 h-6" />, title: "AI Mock Interviews", desc: "Practice with realistic AI-generated questions tailored to your role and experience level." },
                              { icon: <FileSearch className="w-6 h-6" />, title: "Resume Insights", desc: "Get AI-powered analysis of your resume for ATS compatibility and keyword optimization." },
                              { icon: <BarChart3 className="w-6 h-6" />, title: "Performance Analytics", desc: "Track your progress with detailed charts, skill radar, and improvement trends." },
                              { icon: <FileText className="w-6 h-6" />, title: "Cover Letter Generator", desc: "Generate personalized cover letters matched to any job description in seconds." },
                              { icon: <MessageSquare className="w-6 h-6" />, title: "Community Feedback", desc: "Share and read feedback from other candidates to improve together." },
                              { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered Feedback", desc: "Receive detailed scoring and actionable feedback on every answer you give." },
                         ].map((feature) => (
                              <div
                                   key={feature.title}
                                   className="group relative rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-black/30"
                              >
                                   <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                   </div>
                                   <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{feature.title}</h3>
                                   <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                              </div>
                         ))}
                    </div>

                    <div className="mt-10 text-center">
                         <Link to="/signin">
                              <Button size="lg" className="px-8 text-base">
                                   Sign In to Get Started <Sparkles className="ml-2 w-4 h-4" />
                              </Button>
                         </Link>
                         <p className="mt-3 text-xs text-muted-foreground">
                              Free to use • No credit card required
                         </p>
                    </div>
               </Container>
          )}
     </div>;
};

export default HomePage;