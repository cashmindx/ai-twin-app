document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiTwinForm");
  const photoInput = document.getElementById("photoInput");
  const scriptInput = document.getElementById("scriptInput");
  const voiceSelect = document.getElementById("voiceSelect");
  const previewBtn = document.getElementById("previewVoice");
  const loading = document.getElementById("loading");
  const resultSection = document.getElementById("resultSection");
  const aiVideo = document.getElementById("aiVideo");
  const downloadBtn = document.getElementById("downloadBtn");

  // 🔊 Voice preview
  previewBtn.addEventListener("click", () => {
    const selectedOption = voiceSelect.options[voiceSelect.selectedIndex];
    const audioSrc = selectedOption.getAttribute("data-audio");
    const audio = new Audio(audioSrc);
    audio.play();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loading.classList.remove("hidden");
    resultSection.classList.add("hidden");

    const photoFile = photoInput.files[0];
    const script = scriptInput.value;
    const voiceId = voiceSelect.value;

    if (!photoFile) {
      alert("Please upload a photo.");
      loading.classList.add("hidden");
      return;
    }

    try {
      // Upload photo to Imgur
      const photoForm = new FormData();
      photoForm.append("image", photoFile);

      const imgurResponse = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: "Client-ID 2d3e0f5d5b1b1f1"
        },
        body: photoForm
      });

      const imgurData = await imgurResponse.json();
      const imageUrl = imgurData.data.link;

      // Send to Netlify function
      const response = await fetch("/.netlify/functions/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, imageUrl, voiceId })
      });

      const result = await response.json();

      if (result.video_url) {
        aiVideo.src = result.video_url;
        downloadBtn.href = result.video_url;
        loading.classList.add("hidden");
        resultSection.classList.remove("hidden");
      } else {
        alert("Video generation failed.");
        loading.classList.add("hidden");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
      loading.classList.add("hidden");
    }
  });
});
