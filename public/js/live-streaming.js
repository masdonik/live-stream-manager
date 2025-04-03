// Update system metrics
async function updateSystemMetrics() {
    try {
        const response = await fetch('/live/metrics');
        const metrics = await response.json();

        // Update CPU Usage
        document.getElementById('cpuUsage').textContent = metrics.cpu || '0';
        
        // Update Memory Usage
        document.getElementById('memoryUsage').textContent = metrics.memory || '0';
        
        // Update Disk Usage
        document.getElementById('diskUsage').textContent = metrics.disk || '0';
    } catch (error) {
        console.error('Error updating metrics:', error);
    }
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('streamForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {
            platform: formData.get('platform'),
            streamKey: formData.get('streamKey'),
            videoPath: formData.get('videoPath'),
            scheduleTime: formData.get('scheduleTime') || null,
            duration: formData.get('duration') || null
        };

        // Validate required fields
        if (!data.platform || !data.streamKey || !data.videoPath) {
            alert('Platform, Stream Key, dan Video wajib diisi');
            return;
        }

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
                alert('Streaming berhasil dimulai');
                window.location.reload();
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Error starting stream:', error);
            alert('Gagal memulai streaming: ' + error.message);
        }
    });
});

// Stop stream handler
async function stopStream(streamId) {
    if (!confirm('Yakin ingin menghentikan streaming ini?')) {
        return;
    }

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
            alert('Streaming berhasil dihentikan');
            window.location.reload();
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        console.error('Error stopping stream:', error);
        alert('Gagal menghentikan streaming: ' + error.message);
    }
}

// Update metrics every 5 seconds
setInterval(updateSystemMetrics, 5000);

// Initial metrics update
updateSystemMetrics();
