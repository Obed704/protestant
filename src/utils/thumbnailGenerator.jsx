export const getVideoThumbnail = (videoSrc, seekTo = 2) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.currentTime = seekTo;

    video.onloadeddata = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg")); // base64 thumbnail
    };

    video.onerror = (err) => {
      reject("Error generating thumbnail: " + err);
    };
  });
};
