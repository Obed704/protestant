// src/utils/youtubeUtils.js
export const normalizeYouTubeUrl = (url) => {
  if (!url) return null;
  try {
    const playlistMatch = url.match(/[?&]list=([\w-]+)/);
    const videoMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);

    if (playlistMatch) {
      return `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}`;
    }

    if (videoMatch) {
      return `https://www.youtube.com/embed/${videoMatch[1]}`;
    }

    return null;
  } catch {
    return null;
  }
};
