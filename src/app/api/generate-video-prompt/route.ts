import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { ideaText, videoSettings } = await req.json();

        if (!ideaText) {
            return NextResponse.json({ error: "Idea text is required" }, { status: 400 });
        }

        const API_KEY = process.env.GROK_API_KEY;

        if (!API_KEY) {
            // Fallback for missing API Key
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return NextResponse.json({
                prompt: `A ${videoSettings.shotType} of ${ideaText}, captured with a ${videoSettings.camera}. The scene features ${videoSettings.lighting} and a ${videoSettings.mood} atmosphere. Motion speed: ${videoSettings.motionSpeed}. Duration: ${videoSettings.duration}. ${videoSettings.quality}.`
            });
        }

        const promptRequirements = `Core idea: ${ideaText}

Settings to incorporate:
- Camera Movement: ${videoSettings.camera}
- Shot Type: ${videoSettings.shotType}
- Motion Speed: ${videoSettings.motionSpeed}
- Lighting: ${videoSettings.lighting}
- Mood/Style: ${videoSettings.mood}
- Duration: ${videoSettings.duration}
- Quality: ${videoSettings.quality}

Generate the final, highly detailed optimized video prompt string now.`;

        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-3-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an elite, award-winning cinematic AI video prompt engineer. Your sole purpose is to translate a user's core idea and specific settings into a masterful, production-ready prompt for cutting-edge text-to-video AI models (like Sora, Runway Gen-3, or Kling).

You MUST strictly follow the industry standard "6-Prompt Formula" to guarantee breathtaking results:
1. [SUBJECT]: The main focus, described with hyper-specific physical traits and textures.
2. [ACTION & BACKGROUND MOTION]: The specific movement of the subject, foreground, and background. Describe the physics and speed of the motion exactly.
3. [ENVIRONMENT & SETTING]: The world surrounding the subject, including weather, atmosphere, and time of day.
4. [CAMERA & LENS]: The specific camera movement, shot type, focal length, and equipment (e.g., "shot on Arri Alexa 65, 35mm lens, slow tracking shot").
5. [LIGHTING]: The precise lighting setup, shadows, and mood (e.g., "volumetric lighting, neon practicals, cinematic chiaroscuro").
6. [FORMAT & HIGH-END TAGS]: The final aesthetic polish (e.g., "8k resolution, photorealistic, masterpiece, high dynamic range").

CRITICAL RULES:
1. ONLY return the final prompt string. NO introductory or closing text. NO Markdown blocks. ONLY the raw descriptive text block.
2. The user has explicitly selected strict settings. YOU MUST incorporate them exactly as they define the foundational physics and look of the video.
3. Use evocative, highly descriptive adjectives. Paint a moving, dynamic picture instead of a static one.
4. Ensure the output flows naturally as a single continuous paragraph of comma-separated highly descriptive phrases.

EXAMPLES OF MASTERFUL VIDEO PROMPTS:
"A breathtaking low-angle tracking shot of a glowing translucent jellyfish swimming through a neon-lit cyberpunk city street floating in mid-air. The jellyfish moves with a smooth, hypnotic undulating motion. The environment is drenched in volumetric rain and cinematic teal and orange lighting, reflecting off wet asphalt. Shot on Arri Alexa 65, 50mm lens, shallow depth of field. 8k, photorealistic masterpiece, slow motion."

"Extreme close-up macro shot of a single water drop falling onto a vibrant green fern leaf in a lush, misty rainforest. The impact creates a perfect, slow-motion ripple that disturbs a tiny resting ladybug. Soft, diffused morning sunlight filters through the dense canopy above. Shot on macro probe lens, 1000fps hyper-slow motion, incredibly detailed, National Geographic style."

"A smooth drone tracking shot following a vintage red sports car drifting furiously around a sharp hairpin turn on a mountainous coastal highway. Thick white tire smoke billows out forcefully driven by the wind. The ocean crashes aggressively against the cliffs in the background. Epic cinematic lighting during golden hour, high contrast, fast-paced action, 8k resolution, photorealistic."`
                    },
                    {
                        role: "user",
                        content: promptRequirements
                    }
                ],
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Grok API error body:", errText);
            throw new Error(`Grok API error: ${response.statusText}`);
        }

        const data = await response.json();
        const resultText = data.choices[0].message.content.trim();

        return NextResponse.json({
            prompt: resultText
        });

    } catch (error) {
        console.error("Generate Video Prompt Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
