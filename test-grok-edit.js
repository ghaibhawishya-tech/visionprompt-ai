const url = "https://api.x.ai/v1/images/edits";
const apiKey = process.env.GROK_API_KEY || "YOUR_GROK_API_KEY";

async function testGrokEdit() {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            imageUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
            prompt: "make the sky red --ar 16:9",
            model: "grok-imagine-image",
            strength: 0.3
        })
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("Error:", text);
    } else {
        const data = await res.json();
        console.log("Success:", JSON.stringify(data, null, 2));
    }
}

testGrokEdit();
