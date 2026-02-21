const API_KEY = process.env.GROK_API_KEY || "YOUR_GROK_API_KEY";

async function test() {
    const visionResponse = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "grok-2-vision-1212", // Maybe the model doesn't support vision, or the image_url syntax?
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "What is this image?" },
                        { type: "image_url", image_url: { url: "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg", detail: "high" } }
                    ]
                }
            ],
        })
    });

    if (!visionResponse.ok) {
        console.error("Error:", await visionResponse.text());
    } else {
        const data = await visionResponse.json();
        console.log("Success:", data.choices[0].message.content);
    }
}
test();
