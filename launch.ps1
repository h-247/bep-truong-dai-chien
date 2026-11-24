# Launch Bếp Trưởng Đại Chiến on the first available unused port
Set-Location $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BẾP TRƯỞNG ĐẠI CHIẾN - LAUNCHER                    " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Detect used TCP ports
Write-Host "Đang kiểm tra các cổng mạng đang được sử dụng..." -ForegroundColor Gray
$usedPorts = @(Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty LocalPort -Unique)

# 2. Find first unused port starting from 3000
$port = 3000
while ($usedPorts -contains $port) {
    Write-Host "  -> Cổng $port đang bận, chuyển sang cổng tiếp theo..." -ForegroundColor DarkYellow
    $port++
}

Write-Host "-> Đã chọn cổng trống an toàn: $port" -ForegroundColor Green
$url = "http://localhost:$port"

# 3. Start browser asynchronously after short delay
Start-Job -ScriptBlock {
    param($targetUrl)
    Start-Sleep -Seconds 3
    Start-Process $targetUrl
} -ArgumentList $url | Out-Null

Write-Host "Đang khởi chạy máy chủ tại $url..." -ForegroundColor Cyan
Write-Host "Trình duyệt web sẽ tự động mở sau vài giây..." -ForegroundColor Yellow
Write-Host "Nhấn Ctrl+C để dừng máy chủ khi kết thúc chơi.`n" -ForegroundColor Gray

# 4. Start vinext dev on the free port
npx vinext dev -p $port
