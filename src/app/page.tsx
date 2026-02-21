import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wand2, Sparkles, Image as ImageIcon, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col pt-20">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 min-h-[80vh] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80">
            <Sparkles className="w-4 h-4 text-primary" />
            Introducing VisionPrompt AI MVP
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 pb-2">
            Professional AI Imagery, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Designed by You
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl px-4">
            Take complete control of your creative vision. Precise settings, powerful prompts, and stunning image generation all in one premium workspace.
          </p>

          <div className="flex items-center gap-4 mt-4">
            <Link href="/create">
              <Button size="lg" className="h-14 px-8 rounded-full text-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)] border-0 transition-all hover:scale-105">
                Start Creating <Wand2 className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Floating elements visualization (mockup) */}
        <div className="w-full max-w-5xl mx-auto mt-20 relative isolate">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full" />
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden relative opacity-60">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-white/10 to-transparent border border-white/5" />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-black/50 border-t border-white/5 relative isolate">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <FeatureCard
            icon={Zap}
            title="Intelligent Prompts"
            description="Our system automatically enhances your simple ideas into rich, structured prompts optimized for the best results."
          />
          <FeatureCard
            icon={ImageIcon}
            title="Premium Visuals"
            description="Generate high-resolution images powered by the Grok API, instantly rendered and saved to your history."
          />
          <FeatureCard
            icon={Sparkles}
            title="Granular Control"
            description="Adjust lighting, camera angles, mood, and style before every generation to get exactly what you envision."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col gap-4 p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-2">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
