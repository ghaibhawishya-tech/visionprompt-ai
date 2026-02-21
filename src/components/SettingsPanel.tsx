"use client";

import { useGenerationStore } from "@/store/useGenerationStore";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Palette, Sun, Camera, Eye, Layers, Smile, Sparkles, Droplet, Mountain, Monitor, Activity, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_CATEGORIES = [
    {
        id: "style",
        label: "Style",
        icon: Palette,
        options: ["Photorealistic", "Anime", "Cyberpunk", "Oil Painting", "3D Render", "Pixel Art", "Cinematic", "Minimalist"],
    },
    {
        id: "lighting",
        label: "Lighting",
        icon: Sun,
        options: ["Cinematic Lighting", "Natural Light", "Neon", "Volumetric", "Studio Lighting", "Golden Hour", "Moody"],
    },
    {
        id: "camera",
        label: "Camera Angle",
        icon: Camera,
        options: ["Eye-Level", "Low Angle", "High Angle", "Drone View", "Ultra-Wide", "Macro", "Dutch Angle"],
    },
    {
        id: "lens",
        label: "Lens",
        icon: Eye,
        options: ["14mm (Ultra Wide)", "35mm (Standard)", "50mm (Portrait)", "85mm (Telephoto)", "Fisheye"],
    },
    {
        id: "depth",
        label: "Depth of Field",
        icon: Layers,
        options: ["Shallow Depth of Field", "Deep Focus", "Bokeh", "Blurred Background"],
    },
    {
        id: "mood",
        label: "Mood",
        icon: Smile,
        options: ["Epic", "Dark", "Joyful", "Mysterious", "Ethereal", "Melancholic", "Serene"],
    },
    {
        id: "quality",
        label: "Quality",
        icon: Sparkles,
        options: ["8k, Masterpiece", "Highly Detailed", "Award Winning", "Raw Photo", "Crisp"],
    },
    {
        id: "color",
        label: "Color Tone",
        icon: Droplet,
        options: ["Vibrant", "Desaturated", "Monochrome", "Pastel", "High Contrast", "Sepia"],
    },
    {
        id: "environment",
        label: "Environment",
        icon: Mountain,
        options: ["Auto (AI Decide)", "Sci-Fi Cityscape", "Lush Forest", "Interior", "Space Station", "Desert", "Underwater", "Studio"],
    },
    {
        id: "aspectRatio",
        label: "Aspect Ratio",
        icon: Monitor,
        options: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
    },
] as const;

const VIDEO_CATEGORIES = [
    {
        id: "camera",
        label: "Camera Movement",
        icon: Camera,
        options: ["Static", "Smooth Pan", "Tracking Shot", "Crane Shot", "Handheld", "Zoom In/Out", "Dolly Shot", "Orbit", "Dolly Zoom"],
    },
    {
        id: "shotType",
        label: "Shot Type",
        icon: Eye,
        options: ["Establishing Shot", "Extreme Wide Shot", "Wide Shot", "Medium Shot", "Close-Up", "Extreme Close-Up", "POV", "Over-the-Shoulder"],
    },
    {
        id: "motionSpeed",
        label: "Motion Speed",
        icon: Activity,
        options: ["Normal", "Slow Motion", "Time-Lapse", "Hyperlapse", "Fast Forward", "Rewind Effect"],
    },
    {
        id: "lighting",
        label: "Lighting",
        icon: Sun,
        options: ["Cinematic Lighting", "Natural Light", "Neon", "Volumetric", "Studio Lighting", "Golden Hour", "Moody", "Low Key"],
    },
    {
        id: "mood",
        label: "Mood/Style",
        icon: Smile,
        options: ["Epic", "Dark", "Joyful", "Mysterious", "Ethereal", "Melancholic", "Serene", "Cyberpunk", "Vintage Retro"],
    },
    {
        id: "duration",
        label: "Duration",
        icon: Clock,
        options: ["5 Seconds", "10 Seconds", "15 Seconds", "30 Seconds", "Loop"],
    },
    {
        id: "quality",
        label: "Quality",
        icon: Sparkles,
        options: ["8k, Masterpiece", "Highly Detailed", "Award Winning", "Raw Video", "Cinematic 4k"],
    },
] as const;

export function SettingsPanel() {
    const { settings, updateSetting, activeMode, videoSettings, updateVideoSetting } = useGenerationStore();

    const currentCategories = activeMode === "video" ? VIDEO_CATEGORIES : SETTINGS_CATEGORIES;
    const currentSettings = activeMode === "video" ? videoSettings : settings;
    const currentUpdate = activeMode === "video" ? updateVideoSetting : updateSetting;

    return (
        <div className="flex flex-col gap-6">
            {currentCategories.map((category) => {
                const value = currentSettings[category.id as keyof typeof currentSettings];
                return (
                    <div
                        key={category.id}
                        className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all group"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-1.5 rounded-md bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                                <category.icon className="w-4 h-4" />
                            </div>
                            <Label className="text-sm font-medium text-white/90">{category.label}</Label>
                        </div>

                        <Select
                            value={value}
                            onValueChange={(val) => currentUpdate(category.id as any, val)}
                        >
                            <SelectTrigger className="w-full bg-black/20 border-white/10 text-white truncate focus:ring-primary/50 transition-shadow">
                                <SelectValue placeholder={`Select ${category.label}`} />
                            </SelectTrigger>
                            <SelectContent className="bg-background/95 border-white/10 backdrop-blur-xl">
                                {category.options.map((option) => (
                                    <SelectItem
                                        key={option}
                                        value={option}
                                        className="hover:bg-primary/20 focus:bg-primary/20 focus:text-white cursor-pointer"
                                    >
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );
            })}
        </div>
    );
}
