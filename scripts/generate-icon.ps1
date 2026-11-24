Add-Type -AssemblyName System.Drawing

$bmp = New-Object System.Drawing.Bitmap(64, 64)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Background dark circle
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(33, 33, 33))
$g.FillEllipse($bgBrush, 2, 2, 60, 60)

# Red accent ring
$ringPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(239, 68, 68), 3)
$g.DrawEllipse($ringPen, 3, 3, 58, 58)

# Chef Hat puffs
$hatBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillEllipse($hatBrush, 14, 16, 20, 20)
$g.FillEllipse($hatBrush, 30, 16, 20, 20)
$g.FillEllipse($hatBrush, 22, 10, 20, 22)

# Hat base
$g.FillRectangle($hatBrush, 18, 28, 28, 14)

# Golden band
$bandBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(234, 179, 8))
$g.FillRectangle($bandBrush, 18, 42, 28, 6)

$icoPath = Join-Path $PSScriptRoot "..\public\game.ico"
$icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
$fs = New-Object System.IO.FileStream($icoPath, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$icon.Dispose()
$g.Dispose()
$bmp.Dispose()

Write-Output "game.ico generated successfully at $icoPath"
