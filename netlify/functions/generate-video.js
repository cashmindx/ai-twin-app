const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    const { image, script } = JSON.parse(event.body);

    const apiKey = process.env.DID_API_KEY; // Store this in Netlify Environment Variables

    // Step 1: Upload the image to D-ID
    const uploadRes = await fetch('https://api.d-id.com/images', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ source: image })
    });

    const uploadData = await uploadRes.json();
    if (!uploadData.id) throw new Error("Image upload failed");

    const imageUrl = `https://create-images.d-id.com/${uploadData.id}`;

    // Step 2: Create a talking video using the uploaded image
    const talkRes = await fetch('https://api.d-id.com/talks', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_url: imageUrl,
        script: {
          type: 'text',
          input: script,
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
        },
        config: {
          result_format: 'mp4',
          quality: '4k', // options: '360p', '720p', '1080p', '4k'
          driver_expressions: {
            expressions: [{ expression: 'neutral', intensity: 0.9 }],
          },
        }
      })
    });

    const talkData = await talkRes.json();
    if (!talkData.id) throw new Error("Video creation failed");

    // Step 3: Poll until the video is ready
    const videoId = talkData.id;
    const pollUrl = `https://api.d-id.com/talks/${videoId}`;

    let videoUrl = null;
    for (let i = 0; i < 20; i++) {
      const pollRes = await fetch(pollUrl, {
        headers: {
          'Authorization': `Basic ${apiKey}`
        }
      });

      const pollData = await pollRes.json();
      if (pollData.result_url) {
        videoUrl = pollData.result_url;
        break;
      }

      await new Promise(res => setTimeout(res, 3000)); // Wait 3s before retry
    }

    if (!videoUrl) throw new Error("Timeout: Video not ready");

    return {
      statusCode: 200,
      body: JSON.stringify({ videoUrl })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
