const fetch = require("node-fetch");

// 🔐 Directly embedded API key for testing
const D_ID_API_KEY = "dGhla25pZ2h0bWVudG9yQGdtYWlsLmNvbQ:egYdkYutXY-IdbgY_dzYb";

exports.handler = async function (event) {
  try {
    const { script, imageUrl, voiceId } = JSON.parse(event.body);

    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${D_ID_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        script: {
          type: "text",
          input: script
        },
        source_url: imageUrl,
        voice_id: voiceId
      })
    });

    const data = await response.json();

    if (data && (data.result_url || data.url)) {
      return {
        statusCode: 200,
        body: JSON.stringify({ video_url: data.result_url || data.url })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No video URL returned from D-ID." })
      };
    }
  } catch (error) {
    console.error("D-ID API error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate video." })
    };
  }
};
