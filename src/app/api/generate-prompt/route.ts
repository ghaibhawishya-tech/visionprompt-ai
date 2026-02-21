import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { ideaText, settings, referenceImage } = await req.json();

        if (!ideaText) {
            return NextResponse.json({ error: "Idea text is required" }, { status: 400 });
        }

        const API_KEY = process.env.GROK_API_KEY;

        // Fallback if no API key is set
        if (!API_KEY) {
            // Return mock data after a small delay to simulate network
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({
                basicPrompt: ideaText,
                advancedPrompt: `${ideaText}, Style: ${settings.style}, Lighting: ${settings.lighting}, Camera: ${settings.camera}, Lens: ${settings.lens}, Quality: ${settings.quality}, Mood: ${settings.mood}. Highly detailed, masterpiece, stunning visual, 8k resolution.`,
                negativePrompt: "ugly, blurry, deformed, low quality, poorly drawn",
                explanation: "Enhanced your idea with specific photography and style tags to ensure high-quality output."
            });
        }

        const promptText = `Core idea: ${ideaText}

Settings to incorporate:
- Style: ${settings.style}
- Lighting: ${settings.lighting}
- Camera Angle: ${settings.camera}
- Lens/Focal Length: ${settings.lens}
- Depth of Field: ${settings.depth}
- Mood/Tone: ${settings.mood}
- Quality/Resolution: ${settings.quality}
- Color Palette: ${settings.color}
- Environment: ${settings.environment}
- Aspect Ratio: ${settings.aspectRatio}

Generate the final, highly detailed optimized image prompt string now.`;

        const userMessageContent = referenceImage
            ? [
                { type: "text", text: promptText },
                { type: "image_url", image_url: { url: referenceImage, detail: "high" } }
            ]
            : promptText;

        const targetModel = referenceImage ? "grok-2-vision-1212" : "grok-3-mini";

        // Call Grok API for text completion
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: targetModel,
                messages: [
                    {
                        role: "system",
                        content: `You are an expert AI prompt engineer specializing in extremely high-quality, professional image generation.

Your goal is to take a user's core idea, a set of visual settings, and optionally a reference image, and craft a single, masterfully engineered prompt string that an image generation AI will use to create stunning visuals. 
Use the reference image (if provided) to heavily inspire the colors, composition, and subject matter of the prompt, while still applying the requested exact user settings.

CRITICAL RULES:
1. ONLY return the final prompt string. Do not include introductory text like "Here is your prompt:" or explanations.
2. Structure the prompt logically: [Subject/Action/Reference Inspiration] + [Setting/Context] + [Camera/Lighting Details] + [Style/Mood] + [Quality Enhancers] + [Aspect Ratio constraint].
3. Naturally seamlessly weave the provided settings into the prompt.
4. Use highly descriptive, evocative language. Expand on the user's idea with creative, hyper-detailed visual descriptors.
5. Use precise photography terms.
6. Explicitly include the exact Aspect Ratio requested at the very end of the prompt (e.g., "--ar 16:9").
7. The output should be a comma-separated list of highly descriptive phrases.`
                    },
                    {
                        role: "user",
                        content: userMessageContent
                    }
                ],
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Grok API error body:", errText);
            throw new Error(`Grok API error: ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        const resultText = data.choices[0].message.content;

        // Simple parser (in a real app, use structured output or function calling)
        return NextResponse.json({
            basicPrompt: ideaText,
            advancedPrompt: resultText, // Just passing the raw output for the MVP
            negativePrompt: "low quality, bad anatomy, worst quality",
            explanation: "Generated via Grok API"
        });

    } catch (error) {
        console.error("Generate Prompt Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
