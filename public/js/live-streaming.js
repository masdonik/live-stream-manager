// FFmpeg script templates for each platform (without encoding)
const ffmpegTemplates = {
    facebook: '-stream_loop -1 -re -i "{videoPath}" -c copy -f flv -fflags nobuffer -flags low_delay "rtmps://live-api-s.facebook.com:443/rtmp/{streamKey}"',
    youtube: '-stream_loop -1 -re -i "{videoPath}" -c copy -f flv -fflags nobuffer -flags low_delay "rtmps://a.rtmps.youtube.com/live2/{streamKey}"'
};

// Handle form submission
document.getElementById('streamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Add FFmpeg script based on selected platform
    data.ffmpegScript = ffmpegTemplates[data.platform]
        .replace('{videoPath}', data.videoPath)
        .replace('{streamKey}', data.streamKey);
    
    try {
        const response = await fetch('/live/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat memulai streaming');
    }
});

// Handle stream stop
async function stopStream(streamId) {
    if (!confirm('Yakin ingin menghentikan streaming ini?')) return;
    
    try {
        const response = await fetch('/live/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ streamId })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menghentikan streaming');
    }
}

// Handle scheduled stream cancellation
async function cancelScheduledStream(streamId) {
    if (!confirm('Yakin ingin membatalkan streaming terjadwal ini?')) return;
    
    try {
        const response = await fetch('/live/stop', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ streamId })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            location.reload();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat membatalkan streaming');
    }
}
