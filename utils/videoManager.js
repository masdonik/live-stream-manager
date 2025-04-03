const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class VideoManager {
  constructor() {
    this.videoDir = path.join(__dirname, '..', 'videos');
    this.init();
  }

  async init() {
    try {
      await fs.access(this.videoDir);
    } catch (error) {
      await fs.mkdir(this.videoDir, { recursive: true });
    }
  }

  async downloadVideo(url) {
    try {
      // Validasi URL Google Drive
      if (!url.includes('drive.google.com')) {
        throw new Error('URL tidak valid. Harap masukkan URL Google Drive yang benar.');
      }

      // Extract file ID from URL
      const fileId = this._extractFileId(url);
      if (!fileId) {
        throw new Error('URL tidak valid. Pastikan URL dalam format yang benar.');
      }

      // Pastikan gdown terinstall
      await this._checkGdownInstallation();

      // Download video menggunakan gdown dengan opsi fuzzy
      const gdownCommand = `cd ${this.videoDir} && gdown --fuzzy "${url}"`;
      console.log('Executing command:', gdownCommand);
      
      const { stdout, stderr } = await execPromise(gdownCommand);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      
      if (stderr && stderr.includes('Error')) {
        throw new Error('Gagal mengunduh video: ' + stderr);
      }

      // Ambil nama file dari output gdown atau gunakan timestamp
      const filename = stdout.match(/Downloading\s+(.*?)\s+/)?.[1] || 
                      `video_${Date.now()}.mp4`;
      
      return {
        status: 'success',
        filename,
        message: 'Video berhasil diunduh'
      };

    } catch (error) {
      throw new Error(`Gagal mengunduh video: ${error.message}`);
    }
  }

  _extractFileId(url) {
    // Format 1: https://drive.google.com/file/d/YOUR_FILE_ID/view
    let match = url.match(/\/file\/d\/([^/]+)/);
    if (match) return match[1];

    // Format 2: https://drive.google.com/open?id=YOUR_FILE_ID
    match = url.match(/[?&]id=([^&]+)/);
    if (match) return match[1];

    // Format 3: https://drive.google.com/uc?id=YOUR_FILE_ID
    match = url.match(/[?&]id=([^&]+)/);
    if (match) return match[1];

    return null;
  }

  async _checkGdownInstallation() {
    try {
      await execPromise('which gdown');
    } catch (error) {
      // Jika gdown tidak ditemukan, coba install menggunakan pip
      try {
        console.log('Installing gdown...');
        await execPromise('pip install gdown');
      } catch (pipError) {
        throw new Error('Gagal menginstall gdown. Pastikan Python dan pip terinstall.');
      }
    }
  }

  async listVideos() {
    try {
      const files = await fs.readdir(this.videoDir);
      const videoList = [];

      for (const file of files) {
        const filePath = path.join(this.videoDir, file);
        const stats = await fs.stat(filePath);

        // Filter hanya file video
        if (stats.isFile() && this._isVideoFile(file)) {
          videoList.push({
            name: file,
            size: this._formatFileSize(stats.size),
            downloadDate: stats.mtime,
            path: filePath
          });
        }
      }

      return videoList.sort((a, b) => b.downloadDate - a.downloadDate);
    } catch (error) {
      throw new Error(`Gagal mendapatkan daftar video: ${error.message}`);
    }
  }

  _isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  }

  _formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  }

  async renameVideo(oldName, newName) {
    try {
      const oldPath = path.join(this.videoDir, oldName);
      const newPath = path.join(this.videoDir, newName);

      // Cek apakah file lama ada
      await fs.access(oldPath);

      // Cek apakah nama baru sudah digunakan
      try {
        await fs.access(newPath);
        throw new Error('File dengan nama tersebut sudah ada');
      } catch (error) {
        // Error karena file tidak ada, ini yang kita inginkan
        if (error.code === 'ENOENT') {
          await fs.rename(oldPath, newPath);
          return {
            status: 'success',
            message: 'Video berhasil diubah namanya'
          };
        }
        throw error;
      }
    } catch (error) {
      throw new Error(`Gagal mengubah nama video: ${error.message}`);
    }
  }

  async deleteVideo(filename) {
    try {
      const filePath = path.join(this.videoDir, filename);
      await fs.unlink(filePath);
      return {
        status: 'success',
        message: 'Video berhasil dihapus'
      };
    } catch (error) {
      throw new Error(`Gagal menghapus video: ${error.message}`);
    }
  }

  getVideoPath(filename) {
    return path.join(this.videoDir, filename);
  }
}

module.exports = new VideoManager();