const url = "https://api.x.ai/v1/images/generations";
const apiKey = process.env.GROK_API_KEY || "YOUR_GROK_API_KEY";

async function testGrok() {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            prompt: "a cat in space",
            model: "grok-imagine-image"
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

testGrok();
