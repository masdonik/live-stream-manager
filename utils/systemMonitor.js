const si = require('systeminformation');

class SystemMonitor {
  async getCpuUsage() {
    try {
      const data = await si.currentLoad();
      return {
        total: Math.round(data.currentLoad),
        user: Math.round(data.currentLoadUser),
        system: Math.round(data.currentLoadSystem)
      };
    } catch (error) {
      console.error('Error mendapatkan CPU usage:', error);
      return { total: 0, user: 0, system: 0 };
    }
  }

  async getMemoryUsage() {
    try {
      const data = await si.mem();
      const total = Math.round(data.total / 1024 / 1024 / 1024); // Convert to GB
      const used = Math.round(data.used / 1024 / 1024 / 1024);
      const free = Math.round(data.free / 1024 / 1024 / 1024);
      const percentUsed = Math.round((used / total) * 100);

      return {
        total: total,
        used: used,
        free: free,
        percentUsed: percentUsed
      };
    } catch (error) {
      console.error('Error mendapatkan Memory usage:', error);
      return { total: 0, used: 0, free: 0, percentUsed: 0 };
    }
  }

  async getDiskUsage() {
    try {
      const data = await si.fsSize();
      const mainDisk = data[0]; // Mengambil disk utama
      const total = Math.round(mainDisk.size / 1024 / 1024 / 1024); // Convert to GB
      const used = Math.round(mainDisk.used / 1024 / 1024 / 1024);
      const free = Math.round(mainDisk.free / 1024 / 1024 / 1024);
      const percentUsed = Math.round(mainDisk.use);

      return {
        total: total,
        used: used,
        free: free,
        percentUsed: percentUsed
      };
    } catch (error) {
      console.error('Error mendapatkan Disk usage:', error);
      return { total: 0, used: 0, free: 0, percentUsed: 0 };
    }
  }

  async getMetrics() {
    const [cpu, memory, disk] = await Promise.all([
      this.getCpuUsage(),
      this.getMemoryUsage(),
      this.getDiskUsage()
    ]);

    return {
      cpu,
      memory,
      disk,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new SystemMonitor();