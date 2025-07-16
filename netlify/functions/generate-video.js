const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { script, imageUrl, voiceUrl } = JSON.parse(event.body);

    const payload = {
      script: { type: "text", input: script },
      source_url: imageUrl
    };

    if (voiceUrl) {
      payload.audio_url = voiceUrl;
    }

    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.D_ID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ video_url: data.result_url || data.url })
    };
  } catch (error) {
    console.error("D-ID error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Video generation failed." })
    };
  }
};
