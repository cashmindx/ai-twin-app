const fetch = require('node-fetch');

exports.handler = async function(event) {
  const { image, script } = JSON.parse(event.body);

  const response = await fetch("https://api.d-id.com/talks", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${process.env.DID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      source_url: `data:image/jpeg;base64,${image}`,
      script: {
        type: "text",
        input: script,
        provider: { type: "microsoft", voice_id: "en-US-JennyNeural" },
      },
      config: {
        result_format: "mp4",
        resolution: "1080p"
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: data })
    };
  }

  // Wait for video to be ready (or implement polling in production)
  return {
    statusCode: 200,
    body: JSON.stringify({ videoUrl: data.result_url })
  };
};
