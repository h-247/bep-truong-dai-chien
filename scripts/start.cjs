const { execSync, spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// 3. Open browser after short delay
setTimeout(() => {
  console.log(`Đang mở trình duyệt tới ${url}...`);
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  } else if (process.platform === 'darwin') {
    exec(`open ${url}`);
  } else {
    exec(`xdg-open ${url}`);
  }
}, 2500);

// 4. Start vinext dev on the free port
console.log(`Đang khởi chạy máy chủ tại ${url}... (Nhấn Ctrl+C để dừng)\n`);
const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(npxCmd, ['vinext', 'dev', '-p', String(port)], {
  cwd: root,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
