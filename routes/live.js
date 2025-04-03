const express = require('express');
const router = express.Router();
const processManager = require('../utils/processManager');
const videoManager = require('../utils/videoManager');
const systemMonitor = require('../utils/systemMonitor');
const moment = require('moment');

// Render halaman live streaming
router.get('/', async (req, res) => {
  try {
    const videos = await videoManager.listVideos();
    const activeStreams = processManager.getActiveStreams();
    const scheduledStreams = processManager.getScheduledStreams();
    const metrics = await systemMonitor.getMetrics();

    res.render('live', {
      title: 'Live Streaming',
      videos,
      activeStreams,
      scheduledStreams,
      metrics,
      moment
    });
  } catch (error) {
    console.error('Error pada halaman live streaming:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Gagal memuat halaman live streaming'
    });
  }
});

// Memulai streaming
router.post('/start', async (req, res) => {
  try {
    const {
      platform,
      videoPath,
      streamKey,
      ffmpegScript,
      scheduleTime,
      duration
    } = req.body;

    // Validasi input
    if (!platform || !videoPath || !streamKey || !ffmpegScript) {
      throw new Error('Semua field wajib diisi');
    }

    // Validasi platform
    if (!['facebook', 'youtube'].includes(platform.toLowerCase())) {
      throw new Error('Platform tidak valid');
    }

    // Validasi video path
    const videoExists = await videoManager.listVideos()
      .then(videos => videos.some(v => v.path === videoPath));
    
    if (!videoExists) {
      throw new Error('Video tidak ditemukan');
    }

    // Konfigurasi streaming
    const streamOptions = {
      platform,
      videoPath,
      streamKey,
      ffmpegScript,
      duration: duration ? parseInt(duration) : null,
      scheduleTime: scheduleTime || null
    };

    // Mulai streaming
    const result = await processManager.startStreamProcess(streamOptions);

    res.json({
      status: 'success',
      message: scheduleTime 
        ? 'Streaming dijadwalkan' 
        : 'Streaming dimulai',
      data: result
    });

  } catch (error) {
    console.error('Error memulai streaming:', error);
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

    const result = await processManager.stopStreamProcess(streamId);

    res.json({
      status: 'success',
      message: 'Streaming dihentikan',
      data: result
    });

  } catch (error) {
    console.error('Error menghentikan streaming:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mendapatkan status sistem
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await systemMonitor.getMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error mendapatkan metrics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mendapatkan metrics sistem'
    });
  }
});

module.exports = router;