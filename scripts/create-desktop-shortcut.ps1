$root = (Get-Item $PSScriptRoot).Parent.FullName
$icoPath = Join-Path $root "public\game.ico"
$targetScript = Join-Path $root "launch.ps1"

$desktops = @(
    [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop),
    "C:\Users\toanv\OneDrive\Desktop",
    "C:\Users\toanv\Desktop",
    $root
) | Select-Object -Unique

$WshShell = New-Object -ComObject WScript.Shell

foreach ($desktopDir in $desktops) {
    if (Test-Path $desktopDir) {
        $shortcutPath = Join-Path $desktopDir "Bep Truong Dai Chien.lnk"
        $shortcut = $WshShell.CreateShortcut($shortcutPath)
        $shortcut.TargetPath = "powershell.exe"
        $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$targetScript`""
        $shortcut.WorkingDirectory = $root
        $shortcut.IconLocation = "$icoPath,0"
        $shortcut.Description = "Bep Truong Dai Chien - Game Nau An Phoi Hop"
        $shortcut.WindowStyle = 1
        $shortcut.Save()
        Write-Output "Created shortcut: $shortcutPath"
    }
}
