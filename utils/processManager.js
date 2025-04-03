const { spawn } = require('child_process');
const { v4: uuidv4 } = require('uuid');

class ProcessManager {
  constructor() {
    this.activeStreams = new Map();
    this.scheduledStreams = new Map();
  }

  async startStreamProcess(config) {
    const { platform, videoPath, streamKey, duration } = config;

    // Generate unique stream ID
    const streamId = uuidv4();

    // Set RTMP URL berdasarkan platform
    const rtmpUrl = platform === 'facebook' 
      ? 'rtmps://live-api-s.facebook.com:443/rtmp'
      : 'rtmp://a.rtmp.youtube.com/live2';

    // Buat command FFmpeg
    const ffmpegCommand = [
      '-re',                // Read input at native frame rate
      '-i', videoPath,      // Input file
      '-c:v', 'copy',       // Copy video codec (no re-encoding)
      '-c:a', 'copy',       // Copy audio codec (no re-encoding)
      '-f', 'flv',          // Force FLV format
      `${rtmpUrl}/${streamKey}` // Output URL
    ];

    // Spawn FFmpeg process
    const process = spawn('ffmpeg', ffmpegCommand);
    
    // Handle process events
    process.stdout.on('data', (data) => {
      console.log(`Stream ${streamId} stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
      console.error(`Stream ${streamId} stderr: ${data}`);
    });

    process.on('close', (code) => {
      console.log(`Stream ${streamId} exited with code ${code}`);
      this.activeStreams.delete(streamId);
    });

    // Store stream info
    const streamInfo = {
      id: streamId,
      process,
      platform,
      videoPath,
      startTime: new Date(),
      duration: duration || null
    };

    this.activeStreams.set(streamId, streamInfo);

    // If duration is set, schedule stream stop
    if (duration) {
      setTimeout(() => {
        this.stopStreamProcess(streamId);
      }, duration * 60 * 1000); // Convert minutes to milliseconds
    }

    return {
      streamId,
      message: 'Streaming started successfully'
    };
  }

  async stopStreamProcess(streamId) {
    const stream = this.activeStreams.get(streamId);
    
    if (!stream) {
      throw new Error('Stream not found');
    }

    // Kill FFmpeg process
    stream.process.kill('SIGTERM');
    
    // Remove from active streams
    this.activeStreams.delete(streamId);

    return {
      message: 'Stream stopped successfully'
    };
  }

  getActiveStreams() {
    return Array.from(this.activeStreams.values()).map(stream => ({
      id: stream.id,
      platform: stream.platform,
      videoPath: stream.videoPath,
      startTime: stream.startTime,
      duration: stream.duration
    }));
  }

  getScheduledStreams() {
    return Array.from(this.scheduledStreams.values());
  }
}

module.exports = new ProcessManager();