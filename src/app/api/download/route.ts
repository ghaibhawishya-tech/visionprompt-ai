import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');

    if (!url) {
        return new Response("Missing URL parameter", { status: 400 });
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "image/png",
                "Content-Disposition": `attachment; filename="visionprompt-generation-${Date.now()}.png"`,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch (error) {
        console.error("Proxy download error:", error);
        return new Response("Failed to download image", { status: 500 });
    }
}
