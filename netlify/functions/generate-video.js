const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { script, imageUrl, voiceId } = JSON.parse(event.body);

  const response = await fetch("https://api.d-id.com/talks", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.D_ID_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      script: { type: "text", input: script },
      source_url: imageUrl,
      voice_id: voiceId
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ video_url: data.result_url || data.url })
  };
};
