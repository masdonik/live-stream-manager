const express = require('express');
const router = express.Router();
const processManager = require('../utils/processManager');
const videoManager = require('../utils/videoManager');
const systemMonitor = require('../utils/systemMonitor');
const moment = require('moment');

// Render halaman live streaming
router.get('/', async (req, res) => {
  try {
    // Dapatkan daftar video
    const videos = await videoManager.listVideos();
    console.log('Available videos:', videos); // Debug log

    // Dapatkan informasi streaming aktif
    const activeStreams = processManager.getActiveStreams() || [];
    const scheduledStreams = processManager.getScheduledStreams() || [];
    
    // Render halaman dengan data
    res.render('live', {
      title: 'Live Streaming',
      videos: videos,
      activeStreams: activeStreams,
      scheduledStreams: scheduledStreams,
      moment: moment
    });
  } catch (error) {
    console.error('Error rendering live page:', error);
    res.status(500).render('error', {
      message: 'Gagal memuat halaman live streaming'
    });
  }
});

// Memulai streaming
router.post('/start', async (req, res) => {
  try {
    const { platform, videoPath, streamKey, scheduleTime, duration } = req.body;

    // Validasi input
    if (!platform || !videoPath || !streamKey) {
      throw new Error('Platform, Video, dan Stream Key wajib diisi');
    }

    // Validasi platform
    if (!['facebook', 'youtube'].includes(platform.toLowerCase())) {
      throw new Error('Platform tidak valid');
    }

    // Set RTMP URL berdasarkan platform
    const rtmpUrl = platform === 'facebook' 
      ? 'rtmps://live-api-s.facebook.com:443/rtmp'
      : 'rtmp://a.rtmp.youtube.com/live2';

    // Konfigurasi streaming
    const streamConfig = {
      platform,
      videoPath,
      streamKey,
      rtmpUrl,
      duration: duration ? parseInt(duration) : null,
      scheduleTime: scheduleTime || null
    };

    // Mulai streaming
    const result = await processManager.startStreamProcess(streamConfig);

    res.json({
      status: 'success',
      message: scheduleTime ? 'Streaming dijadwalkan' : 'Streaming dimulai',
      data: result
    });

  } catch (error) {
    console.error('Error starting stream:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Menghentikan streaming
router.post('/stop', async (req, res) => {
  try {
    const { streamId } = req.body;
    
    if (!streamId) {
      throw new Error('Stream ID tidak ditemukan');
    }

    await processManager.stopStreamProcess(streamId);

    res.json({
      status: 'success',
      message: 'Streaming dihentikan'
    });

  } catch (error) {
    console.error('Error stopping stream:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;