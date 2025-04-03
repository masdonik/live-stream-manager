const fs = require('fs').promises;
const path = require('path');

class VideoManager {
  constructor() {
    this.videosDir = path.join(__dirname, '..', 'videos');
  }

  async listVideos() {
    try {
      // Buat direktori videos jika belum ada
      await fs.mkdir(this.videosDir, { recursive: true });
      
      const files = await fs.readdir(this.videosDir);
      const videos = [];

      for (const file of files) {
        if (file.match(/\.(mp4|mkv|avi|mov)$/i)) {
          const filePath = path.join(this.videosDir, file);
          const stats = await fs.stat(filePath);
          
          videos.push({
            name: file,
            path: filePath,
            size: this._formatSize(stats.size),
            lastModified: stats.mtime
          });
        }
      }

      return videos;
    } catch (error) {
      console.error('Error listing videos:', error);
      return [];
    }
  }

  _formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getVideoPath(filename) {
    return path.join(this.videosDir, filename);
  }
}

module.exports = new VideoManager();