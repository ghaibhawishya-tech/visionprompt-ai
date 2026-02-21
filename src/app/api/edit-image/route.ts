import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { image, prompt, aspectRatio, originalPrompt } = await req.json();

        if (!image || !prompt) {
            return NextResponse.json({ error: "Image and edit prompt are required" }, { status: 400 });
        }

        const API_KEY = process.env.GROK_API_KEY;

        // Fallback if no API key is set
        if (!API_KEY) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return NextResponse.json({
                images: [
                    // Simulated edited image return
                    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80&blend=ff0000",
                ]
            });
        }

        // Directly use the user's prompt without going through Grok Vision
        // Since we bypassed the vision step, the "new Prompt" stored on the frontend will just be the user's edit instruction or we can append it.
        const combinedPrompt = originalPrompt
            ? `${originalPrompt} [EDIT]: ${prompt}`
            : prompt;

        // Generate the new image using the proper IMAGES/EDITS endpoint
        const editResponse = await fetch("https://api.x.ai/v1/images/edits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                imageUrl: image,
                prompt: combinedPrompt, // Send the combined prompt directly
                model: "grok-imagine-image"
            })
        });

        if (!editResponse.ok) {
            const errText = await editResponse.text();
            console.error("Grok Image Edit API error body:", errText);
            throw new Error(`Grok Image Edit API error: ${editResponse.statusText}`);
        }

        const data = await editResponse.json();
        const images = data.data.map((item: any) => item.url);

        return NextResponse.json({ images, newPrompt: combinedPrompt });

    } catch (error) {
        console.error("Edit Image Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
