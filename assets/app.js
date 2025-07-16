document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("aiTwinForm");
  const photoInput = document.getElementById("photoInput");
  const scriptInput = document.getElementById("scriptInput");
  const voiceMode = document.getElementById("voiceMode");
  const avatarVoiceSelect = document.getElementById("avatarVoiceSelect");
  const voiceInput = document.getElementById("voiceInput");
  const recordedAudio = document.getElementById("recordedAudio");
  const startRecordingBtn = document.getElementById("startRecording");
  const stopRecordingBtn = document.getElementById("stopRecording");
  const previewAvatarVoice = document.getElementById("previewAvatarVoice");

  const avatarVoiceSection = document.getElementById("avatarVoiceSection");
  const uploadVoiceSection = document.getElementById("uploadVoiceSection");
  const recordVoiceSection = document.getElementById("recordVoiceSection");

  const loading = document.getElementById("loading");
  const resultSection = document.getElementById("resultSection");
  const aiVideo = document.getElementById("aiVideo");
  const downloadBtn = document.getElementById("downloadBtn");

  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light");
  });

  // Genre styling
  document.getElementById("genreSelect").addEventListener("change", (e) => {
    document.body.className = document.body.className.replace(/sci-fi|drama|horror/g, "");
    const genre = e.target.value;
    if (genre !== "default") {
      document.body.classList.add(genre);
    }
  });

  // Voice mode switching
  voiceMode.addEventListener("change", () => {
    avatarVoiceSection.classList.add("hidden");
    uploadVoiceSection.classList.add("hidden");
    recordVoiceSection.classList.add("hidden");

    if (voiceMode.value === "avatar") avatarVoiceSection.classList.remove("hidden");
    if (voiceMode.value === "upload") uploadVoiceSection.classList.remove("hidden");
    if (voiceMode.value === "record") recordVoiceSection.classList.remove("hidden");
  });

  // Avatar voice preview
  previewAvatarVoice.addEventListener("click", () => {
    const src = avatarVoiceSelect.value;
    const audio = new Audio(src);
    audio.play();
  });

  // Voice recording
  let mediaRecorder;
  let recordedChunks = [];

  startRecordingBtn.addEventListener("click", async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      recordedAudio.src = url;
      recordedAudio.classList.remove("hidden");
      recordedAudio.dataset.blob = blob;
    };

    mediaRecorder.start();
    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
  });

  stopRecordingBtn.addEventListener("click", () => {
    mediaRecorder.stop();
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loading.classList.remove("hidden");
    resultSection.classList.add("hidden");

    const photoFile = photoInput.files[0];
    const script = scriptInput.value;
    const mode = voiceMode.value;

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

      let voiceUrl = null;

      if (mode === "avatar") {
        voiceUrl = avatarVoiceSelect.value;
      } else if (mode === "upload" && voiceInput.files[0]) {
        const voiceForm = new FormData();
        voiceForm.append("file", voiceInput.files[0]);
        voiceForm.append("upload_preset", "your_preset"); // Replace with your Cloudinary preset

        const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/video/upload", {
          method: "POST",
          body: voiceForm
        });

        const cloudinaryData = await cloudinaryResponse.json();
        voiceUrl = cloudinaryData.secure_url;
      } else if (mode === "record" && recordedAudio.dataset.blob) {
        const voiceForm = new FormData();
        voiceForm.append("file", recordedAudio.dataset.blob);
        voiceForm.append("upload_preset", "your_preset"); // Replace with your Cloudinary preset

        const cloudinaryResponse = await fetch("https://api.cloudinary.com/v1_1/your_cloud_name/video/upload", {
          method: "POST",
          body: voiceForm
        });

        const cloudinaryData = await cloudinaryResponse.json();
        voiceUrl = cloudinaryData.secure_url;
      }

      // Send to Netlify function
      const response = await fetch("/.netlify/functions/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, imageUrl, voiceUrl })
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
