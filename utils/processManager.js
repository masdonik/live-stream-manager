const { spawn } = require('child_process');
const moment = require('moment');

class ProcessManager {
  constructor() {
    this.activeStreams = new Map();
    this.scheduledStreams = new Map();
  }

  generateStreamId() {
    return `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  startStreamProcess(options) {
    return new Promise((resolve, reject) => {
      try {
        const {
          platform,
          videoPath,
          streamKey,
          ffmpegScript,
          duration,
          scheduleTime
        } = options;

        const streamId = this.generateStreamId();
        
        // Jika ada jadwal, atur timeout untuk memulai stream
        if (scheduleTime) {
          const now = moment();
          const scheduledTime = moment(scheduleTime);
          const delay = scheduledTime.diff(now);
          
          if (delay > 0) {
            this.scheduledStreams.set(streamId, {
              timeout: setTimeout(() => {
                this._startFFmpeg(streamId, options);
              }, delay),
              options,
              scheduledTime: scheduleTime
            });

            resolve({
              streamId,
              status: 'scheduled',
              scheduledTime: scheduleTime
            });
            return;
          }
        }

        // Jika tidak ada jadwal, mulai streaming langsung
        this._startFFmpeg(streamId, options);
        resolve({
          streamId,
          status: 'started',
          startTime: new Date().toISOString()
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  _startFFmpeg(streamId, options) {
    const {
      platform,
      videoPath,
      streamKey,
      ffmpegScript,
      duration
    } = options;

    // Parse ffmpeg command dari script
    const ffmpegCommand = ffmpegScript
      .replace('{videoPath}', videoPath)
      .replace('{streamKey}', streamKey);

    const args = ffmpegCommand.split(' ').filter(arg => arg.length > 0);
    const process = spawn('ffmpeg', args);

    // Simpan informasi stream
    const streamInfo = {
      process,
      platform,
      videoPath,
      startTime: new Date(),
      duration
    };

    this.activeStreams.set(streamId, streamInfo);

    // Setup event listeners
    process.stdout.on('data', (data) => {
      console.log(`[Stream ${streamId}] stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`[Stream ${streamId}] stderr: ${data}`);
    });

    process.on('close', (code) => {
      console.log(`[Stream ${streamId}] process exited with code ${code}`);
      if (this.activeStreams.has(streamId)) {
        this.activeStreams.delete(streamId);
      }
    });

    // Jika durasi diatur, hentikan stream setelah durasi tersebut
    if (duration) {
      setTimeout(() => {
        this.stopStreamProcess(streamId);
      }, duration * 60 * 1000); // Konversi menit ke milidetik
    }
  }

  stopStreamProcess(streamId) {
    return new Promise((resolve, reject) => {
      try {
        // Cek apakah ini adalah scheduled stream yang belum dimulai
        if (this.scheduledStreams.has(streamId)) {
          const scheduledStream = this.scheduledStreams.get(streamId);
          clearTimeout(scheduledStream.timeout);
          this.scheduledStreams.delete(streamId);
          resolve({ status: 'cancelled', streamId });
          return;
        }

        // Cek apakah stream aktif
        if (!this.activeStreams.has(streamId)) {
          reject(new Error('Stream tidak ditemukan'));
          return;
        }

        const streamInfo = this.activeStreams.get(streamId);
        
        // Kirim sinyal SIGTERM ke proses ffmpeg
        streamInfo.process.kill('SIGTERM');
        
        // Hapus dari daftar stream aktif
        this.activeStreams.delete(streamId);
        
        resolve({
          status: 'stopped',
          streamId,
          startTime: streamInfo.startTime,
          endTime: new Date()
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  getActiveStreams() {
    const streams = [];
    for (const [streamId, streamInfo] of this.activeStreams) {
      streams.push({
        streamId,
        platform: streamInfo.platform,
        videoPath: streamInfo.videoPath,
        startTime: streamInfo.startTime,
        duration: streamInfo.duration
      });
    }
    return streams;
  }

  getScheduledStreams() {
    const streams = [];
    for (const [streamId, streamInfo] of this.scheduledStreams) {
      streams.push({
        streamId,
        platform: streamInfo.options.platform,
        videoPath: streamInfo.options.videoPath,
        scheduledTime: streamInfo.scheduledTime
      });
    }
    return streams;
  }
}

module.exports = new ProcessManager();