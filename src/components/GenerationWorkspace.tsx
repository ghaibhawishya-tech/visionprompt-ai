"use client";

import { useState, useRef } from "react";
import { useGenerationStore } from "@/store/useGenerationStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Image as ImageIcon, Copy, CheckCircle2, Loader2, Sparkles, Edit2, X, Download, Maximize2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export function GenerationWorkspace() {
    const {
        activeMode,
        setActiveMode,
        ideaText,
        setIdeaText,
        settings,
        videoSettings,
        basicPrompt,
        advancedPrompt,
        setAdvancedPrompt,
        setPrompts,
        isGeneratingPrompt,
        setIsGeneratingPrompt,
        isGeneratingImage,
        setIsGeneratingImage,
        generatedImages,
        setGeneratedImages,
        editingImageIndex,
        setEditingImageIndex,
        editPrompt,
        setEditPrompt,
        isEditingImage,
        setIsEditingImage,
        referenceImage,
        setReferenceImage,
        setIsFullscreen
    } = useGenerationStore();

    const { user } = useAuthStore();
    const [copied, setCopied] = useState(false);
    const [viewingImageIndex, setViewingImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        if (!advancedPrompt) return;
        navigator.clipboard.writeText(advancedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure it's a JPG or PNG image
        if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
            toast.error("Please upload a valid JPG or PNG image.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setReferenceImage(event.target.result as string);
                toast.success("Reference image attached");
            }
        };
        reader.readAsDataURL(file);
    };

    const generatePrompt = async () => {
        if (!ideaText.trim()) return;
        setIsGeneratingPrompt(true);

        try {
            const response = await fetch('/api/generate-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ideaText, settings, referenceImage }),
            });

            if (!response.ok) throw new Error("Failed to generate prompt");

            const data = await response.json();
            setPrompts(data.basicPrompt, data.advancedPrompt);
            toast.success("Prompt engineered successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate prompt. Please try again.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const generateVideoPrompt = async () => {
        if (!ideaText.trim()) return;
        setIsGeneratingPrompt(true);

        try {
            const response = await fetch('/api/generate-video-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ideaText, videoSettings }),
            });

            if (!response.ok) throw new Error("Failed to generate video prompt");

            const data = await response.json();
            setPrompts(ideaText, data.prompt);
            toast.success("Video prompt engineered successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate video prompt. Please try again.");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const generateImage = async () => {
        if (!advancedPrompt) return;
        setIsGeneratingImage(true);

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: advancedPrompt, aspectRatio: settings.aspectRatio }),
            });

            if (!response.ok) throw new Error("Failed to generate image");

            const data = await response.json();
            const newImagesArray = data.images.map((url: string) => ({
                url, prompt: advancedPrompt
            }));
            setGeneratedImages(newImagesArray);

            // Add to history (simple implementation + Firestore)
            const historyItem = {
                id: Date.now().toString(),
                ideaText,
                settings,
                advancedPrompt,
                images: data.images.map((url: string) => ({ url, prompt: advancedPrompt })),
                createdAt: Date.now()
            };

            const existingHistory = JSON.parse(localStorage.getItem('visionprompt_history') || '[]');
            localStorage.setItem('visionprompt_history', JSON.stringify([historyItem, ...existingHistory]));

            if (user) {
                try {
                    await addDoc(collection(db, "user_generations", user.uid, "history"), historyItem);
                } catch (err) {
                    console.error("Failed to save to cloud history", err);
                }
            }

            toast.success("Images generated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate images. Please try again.");
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const submitEdit = async () => {
        if (editingImageIndex === null || !editPrompt.trim()) return;
        setIsEditingImage(true);

        try {
            const targetImageObj = generatedImages[editingImageIndex];
            const response = await fetch('/api/edit-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: targetImageObj.url,
                    prompt: editPrompt,
                    aspectRatio: settings.aspectRatio,
                    originalPrompt: targetImageObj.prompt
                }),
            });

            if (!response.ok) throw new Error("Failed to edit image");

            const data = await response.json();

            // Append the edited image to the array so the original remains
            const newImages = [...generatedImages, { url: data.images[0], prompt: data.newPrompt }];
            setGeneratedImages(newImages);

            toast.success("Image edited successfully!");
            setEditingImageIndex(null);
            setEditPrompt("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to edit image. Please try again.");
        } finally {
            setIsEditingImage(false);
        }
    };

    const handleDownloadImage = async (imageUrl: string, index: number) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `visionprompt-generation-${Date.now()}-${index + 1}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);

            toast.success("Image downloaded successfully!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download image");
        }
    };

    return (
        <div className="flex-1 flex flex-col gap-6">
            {/* Input Area */}
            <div className="flex flex-col gap-4 p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl relative isolate overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        What do you want to create?
                    </label>
                    <div className="flex bg-black/40 rounded-xl p-1 w-fit border border-white/5">
                        <button
                            onClick={() => setActiveMode("image")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeMode === "image" ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
                        >
                            Image Mode
                        </button>
                        <button
                            onClick={() => setActiveMode("video")}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeMode === "video" ? "bg-primary text-white shadow-lg" : "text-white/50 hover:text-white/80"}`}
                        >
                            Video Mode
                        </button>
                    </div>
                </div>
                <div className="relative z-10">
                    <Textarea
                        placeholder="A futuristic city in the clouds with flying cars..."
                        className="min-h-[120px] bg-black/40 border-white/10 text-lg resize-none focus-visible:ring-primary/50 text-white placeholder:text-white/30"
                        value={ideaText}
                        onChange={(e) => setIdeaText(e.target.value)}
                    />
                </div>

                {referenceImage && (
                    <div className="relative z-10 mb-4 inline-block">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                        </div>
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                            onClick={() => setReferenceImage(null)}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                <div className="relative z-10 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground hidden md:block">Select settings on the left, then enhance your prompt.</p>
                        {activeMode === "image" && (
                            <>
                                <input
                                    type="file"
                                    accept="image/jpeg, image/png"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                                <Button
                                    variant="ghost"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all text-sm h-10 px-4"
                                >
                                    <Paperclip className="w-4 h-4 mr-2 text-primary" />
                                    Upload Style Reference
                                </Button>
                            </>
                        )}
                    </div>
                    <Button
                        onClick={activeMode === "video" ? generateVideoPrompt : generatePrompt}
                        disabled={!ideaText.trim() || isGeneratingPrompt}
                        className="rounded-xl px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-105"
                    >
                        {isGeneratingPrompt ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        Generate {activeMode === "video" ? "Video " : ""}Prompt
                    </Button>
                </div>
            </div>

            {/* Advanced Prompt Display */}
            {advancedPrompt && (
                <div className="flex flex-col gap-3 p-6 rounded-3xl bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-primary flex items-center gap-2">
                            <Wand2 className="w-4 h-4" />
                            Engineered Prompt
                        </label>
                        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 hover:bg-primary/20 text-primary">
                            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                    </div>
                    <Textarea
                        value={advancedPrompt}
                        onChange={(e) => setAdvancedPrompt(e.target.value)}
                        className="w-full min-h-[120px] bg-black/40 border-white/10 text-white/90 text-base leading-relaxed font-medium resize-y focus-visible:ring-primary/50"
                    />

                    {activeMode === "image" ? (
                        <div className="flex justify-end mt-2">
                            <Button
                                onClick={generateImage}
                                disabled={isGeneratingImage}
                                size="lg"
                                className="rounded-xl px-8 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-[0_0_30px_-5px_rgba(139,92,246,0.4)] border-0 transition-transform hover:scale-105"
                            >
                                {isGeneratingImage ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ImageIcon className="w-5 h-5 mr-3" />}
                                Generate Original Image
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-end mt-2">
                            <Button
                                disabled
                                size="lg"
                                className="rounded-xl px-8 bg-white/5 text-white/50 border border-white/10"
                            >
                                <span className="text-sm">Video Rendering Coming Soon</span>
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Gallery */}
            {generatedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {generatedImages.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group bg-black/50">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={`Generated image ${i + 1}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setViewingImageIndex(i);
                                        setIsFullscreen(true);
                                    }}
                                    className="rounded-full backdrop-blur-md shadow-xl bg-white/10 hover:bg-white/20 text-white border-white/20 w-10 h-10 p-0"
                                >
                                    <Maximize2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setEditingImageIndex(i)}
                                    className="rounded-full backdrop-blur-md shadow-xl bg-white/10 hover:bg-white/20 text-white border-white/20 w-10 h-10 p-0"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Image Modal Overlay */}
            {editingImageIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-background border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Edit2 className="w-4 h-4 text-primary" /> Edit Image
                            </h3>
                            <Button variant="ghost" size="icon" onClick={() => setEditingImageIndex(null)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="p-6 flex flex-col md:flex-row gap-6">
                            <div className="relative aspect-square w-full md:w-1/2 rounded-xl overflow-hidden bg-black/50 border border-white/10 shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={generatedImages[editingImageIndex].url}
                                    alt="Image to edit"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex flex-col gap-4 flex-1">
                                <label className="text-sm text-white/80 font-medium">What would you like to change?</label>
                                <Textarea
                                    placeholder="Make the sky red, add a spaceship..."
                                    className="flex-1 min-h-[100px] bg-black/40 border-white/10 resize-none text-white focus-visible:ring-primary/50"
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                />
                                <div className="flex gap-3 justify-end mt-auto pt-4">
                                    <Button variant="ghost" onClick={() => setEditingImageIndex(null)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={submitEdit}
                                        disabled={!editPrompt.trim() || isEditingImage}
                                        className="bg-primary hover:bg-primary/90 text-white"
                                    >
                                        {isEditingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                                        Apply Edit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Overlay */}
            {viewingImageIndex !== null && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-200"
                    onClick={() => {
                        setViewingImageIndex(null);
                        setIsFullscreen(false);
                    }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-6 right-6 text-white/70 hover:text-white hover:bg-white/10 w-10 h-10 rounded-full"
                        onClick={() => {
                            setViewingImageIndex(null);
                            setIsFullscreen(false);
                        }}
                    >
                        <X className="w-6 h-6" />
                    </Button>

                    <div
                        className="relative max-w-full max-h-full aspect-square md:aspect-auto md:w-auto md:h-full rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={generatedImages[viewingImageIndex].url}
                            alt="Full screen generated view"
                            className="w-full h-full object-contain"
                        />

                        {/* Optional explicit download button in Lightbox */}
                        <div className="absolute bottom-6 right-6">
                            <Button
                                className="rounded-full bg-white text-black hover:bg-white/90 shadow-2xl"
                                onClick={() => handleDownloadImage(generatedImages[viewingImageIndex].url, viewingImageIndex)}
                            >
                                <Download className="w-4 h-4 mr-2" /> Download
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
