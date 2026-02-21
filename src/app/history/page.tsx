"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useGenerationStore, GenerationSettings } from "@/store/useGenerationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

interface HistoryItem {
    id: string;
    ideaText: string;
    settings: GenerationSettings;
    advancedPrompt: string;
    images: ({ url: string; prompt: string } | string)[];
    createdAt: number;
}

export default function HistoryPage() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const router = useRouter();
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) {
            const stored = localStorage.getItem("visionprompt_history");
            if (stored) {
                setHistory(JSON.parse(stored));
            }
            return;
        }

        const q = query(
            collection(db, "user_generations", user.uid, "history"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ideaText: data.ideaText,
                    settings: data.settings,
                    advancedPrompt: data.advancedPrompt,
                    images: data.images,
                    createdAt: data.createdAt
                } as HistoryItem;
            });
            setHistory(fetched);
        });

        return () => unsubscribe();
    }, [user]);

    const restoreHistoryItem = (item: HistoryItem) => {
        useGenerationStore.setState({
            ideaText: item.ideaText,
            activeMode: "image",
            settings: item.settings,
            advancedPrompt: item.advancedPrompt,
            generatedImages: item.images.map(img => typeof img === 'string' ? { url: img, prompt: item.advancedPrompt } : img)
        });
        router.push("/");
    };

    return (
        <div className="flex-1 container mx-auto py-12 px-6">
            <div className="flex flex-col gap-4">
                <h1 className="text-4xl font-bold tracking-tight">Your History</h1>
                <p className="text-muted-foreground text-lg">
                    View and download your past AI creations.
                </p>

                {history.length === 0 ? (
                    <div className="mt-12 text-center p-12 border border-white/10 rounded-3xl bg-white/5">
                        <p className="text-xl text-white/50">You haven't generated any images yet.</p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col gap-3 group rounded-2xl p-4 bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-all cursor-pointer"
                                onClick={() => restoreHistoryItem(item)}
                            >
                                <div className="relative aspect-square rounded-xl overflow-hidden bg-black/50">
                                    {item.images.length > 0 ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                                            alt="Generation"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20 text-sm">No Image</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <Button
                                            variant="secondary"
                                            className="rounded-full backdrop-blur-md pointer-events-auto shadow-xl"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // Add download logic here
                                            }}
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 mt-2 pointer-events-none">
                                    <p className="text-sm font-medium text-white line-clamp-2">{item.ideaText}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary">{item.settings.style}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{item.settings.lighting}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
