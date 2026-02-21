"use client";

import { useEffect, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { useGenerationStore, GenerationSettings } from "@/store/useGenerationStore";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";

interface HistoryItem {
    id: string;
    ideaText: string;
    settings: GenerationSettings;
    advancedPrompt: string;
    images: ({ url: string; prompt: string } | string)[];
    createdAt: number;
}

export function HistoryPanel() {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const { user } = useAuthStore();

    useEffect(() => {
        if (!user) {
            const loadHistory = () => {
                const stored = localStorage.getItem("visionprompt_history");
                if (stored) {
                    setHistory(JSON.parse(stored));
                }
            };

            loadHistory();
            const interval = setInterval(loadHistory, 3000);
            return () => clearInterval(interval);
        }

        const q = query(
            collection(db, "user_generations", user.uid, "history"),
            orderBy("createdAt", "desc"),
            limit(5)
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

    const handleDownloadImage = async (imageUrl: string, index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // prevent opening the history item
        try {
            // Bypass CORS by using our own API route as a proxy
            const proxyUrl = `/api/download?url=${encodeURIComponent(imageUrl)}`;

            const link = document.createElement('a');
            link.href = proxyUrl;
            link.download = `visionprompt-history-${Date.now()}-${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    if (history.length === 0) {


        return (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-white/5 bg-white/5 rounded-2xl h-48">
                <Sparkles className="w-8 h-8 text-white/20 mb-3" />
                <p className="text-sm text-muted-foreground w-full">
                    Your creations will appear here once you generate an image.
                </p>
            </div>
        );
    }

    const restoreHistoryItem = (item: HistoryItem) => {
        useGenerationStore.setState({
            ideaText: item.ideaText,
            activeMode: "image", // Assuming history is mostly images for now
            settings: item.settings,
            advancedPrompt: item.advancedPrompt,
            generatedImages: item.images.map(img => typeof img === 'string' ? { url: img, prompt: item.advancedPrompt } : img)
        });
        // On mobile we might want to close the drawer, but on desktop it just updates the main view
    };

    return (
        <div className="flex flex-col gap-6">
            {history.slice(0, 2).map((item) => (
                <div
                    key={item.id}
                    className="flex flex-col gap-3 group cursor-pointer"
                    onClick={() => restoreHistoryItem(item)}
                >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black/50">
                        {item.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                                alt="Generation thumbnail"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                No Image
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                size="icon"
                                variant="secondary"
                                className="rounded-full w-8 h-8"
                                onClick={(e) => {
                                    if (item.images.length > 0) {
                                        const url = typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url;
                                        handleDownloadImage(url, 0, e);
                                    }
                                }}
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-white line-clamp-1">{item.ideaText}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
