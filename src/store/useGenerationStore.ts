import { create } from "zustand";

export interface GenerationSettings {
    style: string;
    lighting: string;
    camera: string;
    lens: string;
    depth: string;
    mood: string;
    quality: string;
    color: string;
    environment: string;
    aspectRatio: string;
}

interface GenerationState {
    ideaText: string;
    setIdeaText: (text: string) => void;

    activeMode: "image" | "video";
    setActiveMode: (mode: "image" | "video") => void;

    settings: GenerationSettings;
    updateSetting: (key: keyof GenerationSettings, value: string) => void;

    videoSettings: Record<string, string>;
    updateVideoSetting: (key: string, value: string) => void;

    basicPrompt: string;
    advancedPrompt: string;
    setAdvancedPrompt: (prompt: string) => void;
    setPrompts: (basic: string, advanced: string) => void;

    isGeneratingPrompt: boolean;
    setIsGeneratingPrompt: (isGenerating: boolean) => void;

    isGeneratingImage: boolean;
    setIsGeneratingImage: (isGenerating: boolean) => void;

    generatedImages: { url: string; prompt: string }[];
    setGeneratedImages: (images: { url: string; prompt: string }[]) => void;

    editingImageIndex: number | null;
    setEditingImageIndex: (index: number | null) => void;

    editPrompt: string;
    setEditPrompt: (prompt: string) => void;

    isEditingImage: boolean;
    setIsEditingImage: (isEditing: boolean) => void;

    referenceImage: string | null;
    setReferenceImage: (img: string | null) => void;

    isFullscreen: boolean;
    setIsFullscreen: (isFullscreen: boolean) => void;
}

const DEFAULT_SETTINGS: GenerationSettings = {
    style: "Photorealistic",
    lighting: "Cinematic Lighting",
    camera: "Drone View",
    lens: "35mm",
    depth: "Shallow Depth of Field",
    mood: "Epic",
    quality: "8k, Masterpiece",
    color: "Vibrant",
    environment: "Auto (AI Decide)",
    aspectRatio: "16:9",
};

const DEFAULT_VIDEO_SETTINGS = {
    camera: "Smooth Pan",
    shotType: "Establishing Shot",
    motionSpeed: "Normal",
    lighting: "Cinematic Lighting",
    mood: "Epic",
    duration: "5 Seconds",
    quality: "8k, Masterpiece",
};

export const useGenerationStore = create<GenerationState>((set) => ({
    activeMode: "image",
    setActiveMode: (mode) => set({ activeMode: mode }),

    settings: DEFAULT_SETTINGS,
    updateSetting: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
    })),

    videoSettings: DEFAULT_VIDEO_SETTINGS,
    updateVideoSetting: (key, value) => set((state) => ({
        videoSettings: { ...state.videoSettings, [key]: value }
    })),

    ideaText: "",
    setIdeaText: (text) => set({ ideaText: text }),

    basicPrompt: "",
    advancedPrompt: "",
    setAdvancedPrompt: (prompt) => set({ advancedPrompt: prompt }),
    setPrompts: (basic, advanced) => set({ basicPrompt: basic, advancedPrompt: advanced }),

    isGeneratingPrompt: false,
    setIsGeneratingPrompt: (isGenerating) => set({ isGeneratingPrompt: isGenerating }),

    isGeneratingImage: false,
    setIsGeneratingImage: (isGenerating) => set({ isGeneratingImage: isGenerating }),

    generatedImages: [],
    setGeneratedImages: (images) => set({ generatedImages: images }),

    editingImageIndex: null,
    setEditingImageIndex: (index) => set({ editingImageIndex: index }),

    editPrompt: "",
    setEditPrompt: (prompt) => set({ editPrompt: prompt }),

    isEditingImage: false,
    setIsEditingImage: (isEditing) => set({ isEditingImage: isEditing }),

    referenceImage: null,
    setReferenceImage: (img) => set({ referenceImage: img }),

    isFullscreen: false,
    setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
}));
