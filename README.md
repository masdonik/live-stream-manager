# Live Streaming Application

Aplikasi berbasis Node.js untuk live streaming ke Facebook/YouTube menggunakan FFmpeg tanpa encoding. Video source diambil dari Google Drive.

## Fitur

- Live streaming ke Facebook dan YouTube
- Download video dari Google Drive
- Streaming tanpa encoding untuk performa optimal
- Penjadwalan streaming
- Monitoring sistem (CPU, Memory, Disk)
- Dark theme & responsive design
- Manajemen video (rename, delete)

## Persyaratan Sistem

- Node.js v14 atau lebih baru
- FFmpeg
- Python & pip (untuk gdown)
- Ubuntu VPS (direkomendasikan)

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/masdonik/live-stream-manager.git
cd live-streaming-app
```

2. Install dependencies:
```bash
npm install
```

3. Install FFmpeg:
```bash
sudo apt update
sudo apt install ffmpeg
```

4. Install gdown:
```bash
pip install gdown
```

5. Buat file .env (atau gunakan yang sudah ada):
```
PORT=8000
FFMPEG_PATH=/usr/bin/ffmpeg
VIDEO_DIR=./videos
METRICS_INTERVAL=5000
```

6. Buat direktori videos:
```bash
mkdir videos
```

## Penggunaan

1. Jalankan aplikasi:
```bash
npm start
```

2. Buka browser dan akses:
```
http://localhost:8000
```

## Fitur Live Streaming

1. Download Video:
   - Buka menu "Download Video"
   - Masukkan URL Google Drive
   - Klik "Download"

2. Live Streaming:
   - Buka menu "Live Streaming"
   - Pilih platform (Facebook/YouTube)
   - Masukkan Stream Key
   - Pilih video
   - Atur jadwal (opsional)
   - Atur durasi (opsional, kosongkan untuk loop)
   - Klik "Mulai Streaming"

## FFmpeg Scripts

### Facebook:
```
-stream_loop -1 -re -i "{videoPath}" -c copy -f flv -fflags nobuffer -flags low_delay "rtmps://live-api-s.facebook.com:443/rtmp/{streamKey}"
```

### YouTube:
```
-stream_loop -1 -re -i "{videoPath}" -c copy -f flv -fflags nobuffer -flags low_delay "rtmps://a.rtmps.youtube.com/live2/{streamKey}"
```

## Monitoring

Aplikasi menyediakan monitoring sistem realtime:
- CPU Usage
- Memory Usage
- Disk Usage

## Manajemen Video

- Rename video
- Delete video
- Lihat ukuran dan tanggal download

## Troubleshooting

1. Port 8000 sudah digunakan:
```bash
sudo lsof -i :8000  # Cek proses yang menggunakan port
sudo kill <PID>     # Matikan proses
```

2. Gagal download dari Google Drive:
- Pastikan URL valid dan file dapat diakses
- Cek instalasi gdown
- Cek permission folder videos

3. Streaming error:
- Pastikan Stream Key valid
- Cek koneksi internet
- Verifikasi format video compatible

## Keamanan

- Jangan share Stream Key
- Gunakan HTTPS jika diakses dari public
- Update sistem dan dependencies secara rutin
- Monitor penggunaan sistem

## Support

Untuk bantuan dan informasi lebih lanjut:
- Buka issue di GitHub
- Kontak developer

## License

MIT License
