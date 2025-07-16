const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { image, script, voice, audio } = JSON.parse(event.body);

    if (!image || !script || !voice) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Prepare API payload based on voice choice
    let voicePayload;

    if (voice === "upload") {
      if (!audio) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Missing uploaded audio for custom voice" }),
        };
      }
      // Custom voice uploaded as base64 audio
      voicePayload = {
        type: "custom_audio",
        audio_base64: audio,
      };
    } else {
      // Preset voice selected
      voicePayload = {
        type: "preset",
        voice_id: voice,
      };
    }

    // Build the request body for your AI video API
    const apiPayload = {
      source_image: image,
      script: script,
      voice: voicePayload,
      // Other necessary options depending on your API
      // e.g., output format, resolution, etc.
    };

    // Replace with your AI video generation API endpoint and key
    const API_URL = "https://api.d-id.com/talks"; // example endpoint
    const API_KEY = process.env.D_ID_API_KEY;

    const apiResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiPayload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return {
        statusCode: apiResponse.status,
        body: JSON.stringify({ error: `API error: ${errorText}` }),
      };
    }

    const apiData = await apiResponse.json();

    // Extract video URL from API response (adjust according to your API)
    const videoUrl = apiData.result?.videoUrl || apiData.video_url || apiData.url;

    if (!videoUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Video URL missing in API response" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ videoUrl }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
