import { SettingsPanel } from "@/components/SettingsPanel";
import { GenerationWorkspace } from "@/components/GenerationWorkspace";
import { HistoryPanel } from "@/components/HistoryPanel";

export default function CreatePage() {
    return (
        <div className="flex-1 flex overflow-hidden">
            {/* 25% Left Panel - Settings */}
            <aside className="w-1/4 min-w-[320px] max-w-[400px] border-r border-border/50 bg-background/50 overflow-y-auto custom-scrollbar p-6">
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-semibold tracking-tight">Generation Settings</h2>
                    <SettingsPanel />
                </div>
            </aside>

            {/* 50% Center Panel - Workspace */}
            <section className="flex-1 flex flex-col relative bg-dot-pattern bg-[size:16px_16px] overflow-y-auto">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] pointer-events-none" />

                <div className="relative z-10 flex-1 flex flex-col p-8 max-w-4xl mx-auto w-full">
                    <div className="flex-1 flex flex-col gap-8">
                        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-2">
                            Bring Your Ideas to Life
                        </h1>
                        <GenerationWorkspace />
                    </div>
                </div>
            </section>

            {/* 25% Right Panel - History */}
            <aside className="w-1/4 min-w-[280px] max-w-[360px] border-l border-border/50 bg-background/50 overflow-y-auto custom-scrollbar p-6 hidden xl:block">
                <h2 className="text-xl font-semibold tracking-tight mb-6">Recent Creations</h2>
                <HistoryPanel />
            </aside>
        </div>
    );
}
