const express = require('express');
const router = express.Router();
const videoManager = require('../utils/videoManager');
const systemMonitor = require('../utils/systemMonitor');
const moment = require('moment');

// Render halaman download video
router.get('/', async (req, res) => {
  try {
    const videos = await videoManager.listVideos();
    const metrics = await systemMonitor.getMetrics();

    res.render('download', {
      title: 'Download Video',
      videos,
      metrics,
      moment
    });
  } catch (error) {
    console.error('Error pada halaman download:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'Gagal memuat halaman download video'
    });
  }
});

// Download video dari Google Drive
router.post('/download', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      throw new Error('URL Google Drive wajib diisi');
    }

    // Validasi format URL Google Drive
    if (!url.includes('drive.google.com')) {
      throw new Error('URL tidak valid. Harap masukkan URL Google Drive yang benar');
    }

    const result = await videoManager.downloadVideo(url);

    res.json({
      status: 'success',
      message: 'Video berhasil diunduh',
      data: result
    });

  } catch (error) {
    console.error('Error mengunduh video:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mengubah nama video
router.post('/rename', async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    if (!oldName || !newName) {
      throw new Error('Nama file lama dan baru wajib diisi');
    }

    // Validasi format nama file baru
    if (!/^[\w\-. ]+$/.test(newName)) {
      throw new Error('Nama file tidak valid. Gunakan hanya huruf, angka, spasi, titik, dan strip');
    }

    const result = await videoManager.renameVideo(oldName, newName);

    res.json({
      status: 'success',
      message: 'Nama video berhasil diubah',
      data: result
    });

  } catch (error) {
    console.error('Error mengubah nama video:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Menghapus video
router.post('/delete', async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      throw new Error('Nama file wajib diisi');
    }

    const result = await videoManager.deleteVideo(filename);

    res.json({
      status: 'success',
      message: 'Video berhasil dihapus',
      data: result
    });

  } catch (error) {
    console.error('Error menghapus video:', error);
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
});

// Mendapatkan daftar video
router.get('/list', async (req, res) => {
  try {
    const videos = await videoManager.listVideos();
    res.json({
      status: 'success',
      data: videos
    });
  } catch (error) {
    console.error('Error mendapatkan daftar video:', error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal mendapatkan daftar video'
    });
  }
});

module.exports = router;