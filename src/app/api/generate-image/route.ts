import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { prompt, aspectRatio } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const API_KEY = process.env.GROK_API_KEY;

        // Fallback to mock images if no API key is set
        if (!API_KEY) {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            return NextResponse.json({
                images: [
                    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
                ]
            });
        }

        // Append the aspect ratio to the prompt as Grok-imagine-image does not natively support the size parameter array
        const finalPrompt = `${prompt} --ar ${aspectRatio}`;

        // Call Grok API for image generation
        // As of standard API compatibility, X.ai supports image generation via compatible endpoints
        const response = await fetch("https://api.x.ai/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                prompt: finalPrompt,
                model: "grok-imagine-image"
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Grok Image API error body:", errText);
            throw new Error(`Grok Image API error: ${response.statusText} - ${errText}`);
        }

        const data = await response.json();

        // Extract images
        const images = data.data.map((item: any) => item.url);

        return NextResponse.json({ images });

    } catch (error) {
        console.error("Generate Image Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
