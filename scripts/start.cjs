const { execSync, spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.resolve(__dirname, '..');

console.log('==========================================================');
console.log('       BẾP TRƯỞNG ĐẠI CHIẾN - LAUNCHER                    ');
console.log('==========================================================');

// 1. Clean up any stale .vinext lock file
const lockFile = path.join(root, '.vinext', 'dev', 'lock.json');
try {
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
    console.log('Đã dọn dẹp lock file cũ.');
  }
} catch {}

// 2. Detect used ports via netstat
const usedPorts = new Set();
try {
  const output = execSync('netstat -ano', { encoding: 'utf8' });
  for (const line of output.split('\n')) {
    if (line.includes('LISTENING') || line.includes('LISTEN')) {
      const match = line.match(/:(\d+)\s+/);
      if (match) {
        usedPorts.add(parseInt(match[1], 10));
      }
    }
  }
} catch {}

let port = 3000;
while (usedPorts.has(port)) {
  console.log(`Cổng ${port} đang bận, chuyển sang cổng tiếp theo...`);
  port++;
}

console.log(`-> Đã chọn cổng trống an toàn: ${port}`);
const url = `http://localhost:${port}`;

// 3. Start vinext dev on the free port directly via node.exe
console.log(`Đang khởi chạy máy chủ tại ${url}... (Nhấn Ctrl+C để dừng)\n`);
const vinextCli = path.join(root, 'node_modules', 'vinext', 'dist', 'cli.js');

const child = spawn(process.execPath, [vinextCli, 'dev', '-p', String(port)], {
  cwd: root,
  stdio: 'inherit',
});

// 4. Wait until the HTTP dev server is genuinely ready before launching the browser
let browserOpened = false;
function openBrowser() {
  if (browserOpened) return;
  browserOpened = true;
  console.log(`\n-> Máy chủ đã sẵn sàng! Đang mở trình duyệt tới ${url}...`);
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  } else if (process.platform === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
}

// Health check poll every 400ms
const pollTimer = setInterval(() => {
  const req = http.get(url, (res) => {
    if (res.statusCode && res.statusCode < 500) {
      clearInterval(pollTimer);
      // Give Vite HMR a moment to bind its socket handlers
      setTimeout(openBrowser, 500);
    }
  });
  req.on('error', () => {
    // Server not accepting connections yet
  });
  req.setTimeout(800, () => {
    req.destroy();
  });
}, 400);

// Fallback safety timeout (open after 25s if poll didn't trigger)
const fallbackTimer = setTimeout(() => {
  clearInterval(pollTimer);
  openBrowser();
}, 25000);

child.on('error', (err) => {
  clearInterval(pollTimer);
  clearTimeout(fallbackTimer);
  console.error('Lỗi khởi chạy:', err);
});

child.on('exit', (code) => {
  clearInterval(pollTimer);
  clearTimeout(fallbackTimer);
  process.exit(code || 0);
});
