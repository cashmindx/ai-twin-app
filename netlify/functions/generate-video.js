const fetch = require("node-fetch");

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { imageUrl, script, voice, audioUrl } = JSON.parse(event.body);

    if (!imageUrl || !script) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing image or script" }),
      };
    }

    const API_URL = "https://api.d-id.com/talks";
    const API_KEY = process.env.D_ID_API_KEY;

    const payload = {
      source_url: imageUrl,
      script: {
        type: "text",
        input: script
      }
    };

    // Use uploaded voice or preset voice
    if (voice === "upload" && audioUrl) {
      payload.driver_url = audioUrl;
    } else {
      payload.voice = voice; // e.g., "en_us_001"
    }

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "API Error: " + errText }),
      };
    }

    const data = await res.json();

    const talkId = data.id;

    // Poll the talk status until it's done
    let videoUrl = null;
    let retries = 10;
    while (retries-- > 0) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3s
      const poll = await fetch(`https://api.d-id.com/talks/${talkId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      });
      const pollData = await poll.json();
      if (pollData?.result_url) {
        videoUrl = pollData.result_url;
        break;
      }
    }

    if (!videoUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Video generation timeout." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ videoUrl })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
