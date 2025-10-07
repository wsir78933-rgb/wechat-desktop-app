# Windows PowerShell启动脚本
# 在Windows宿主机上运行Electron应用

Write-Host "🚀 在Windows上启动Electron应用..." -ForegroundColor Green
Write-Host ""

# 获取WSL路径对应的Windows路径
$wslPath = wsl pwd
$windowsPath = wsl wslpath -w $wslPath

Write-Host "📁 项目路径: $windowsPath" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js和npm
Write-Host "🔍 检查Node.js环境..." -ForegroundColor Yellow
node --version
npm --version
Write-Host ""

# 清理旧进程
Write-Host "🧹 清理旧的Electron进程..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host ""

# 切换到项目目录
Set-Location $windowsPath

# 启动开发服务器
Write-Host "🔧 启动Electron开发服务器..." -ForegroundColor Green
Write-Host "   - 主进程调试端口: 5858" -ForegroundColor Gray
Write-Host "   - 渲染进程端口: 5173+" -ForegroundColor Gray
Write-Host "   - Chrome DevTools: 自动打开" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 调试提示:" -ForegroundColor Cyan
Write-Host "   - 按 Ctrl+Shift+I 打开DevTools" -ForegroundColor Gray
Write-Host "   - 按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""
Write-Host "-----------------------------------" -ForegroundColor DarkGray
Write-Host ""

# 启动npm dev
npm run dev
