# Windows启动脚本 - 在Windows原生环境运行Electron
# 使用方法: 在PowerShell中运行 .\start.ps1

Write-Host "🚀 启动公众号桌面应用..." -ForegroundColor Green
Write-Host ""

# 清理旧进程
Write-Host "🧹 清理旧进程..." -ForegroundColor Yellow
Get-Process -Name "*electron*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# 启动开发服务器
Write-Host "🔧 启动开发服务器..." -ForegroundColor Green
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Cyan
Write-Host "   - 窗口会自动打开" -ForegroundColor Gray
Write-Host "   - 按 Ctrl+Shift+I 打开开发者工具" -ForegroundColor Gray
Write-Host "   - 按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

npm run dev
