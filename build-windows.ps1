# Windows打包脚本
# 此脚本需要在Windows PowerShell中运行

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "公众号桌面应用 - Windows打包脚本" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查Node.js
Write-Host "检查Node.js..." -ForegroundColor Yellow
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未安装Node.js" -ForegroundColor Red
    Write-Host "请从 https://nodejs.org/ 下载并安装Node.js" -ForegroundColor Red
    exit 1
}
$nodeVersion = node --version
Write-Host "Node.js版本: $nodeVersion" -ForegroundColor Green

# 检查npm
Write-Host "检查npm..." -ForegroundColor Yellow
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未安装npm" -ForegroundColor Red
    exit 1
}
$npmVersion = npm --version
Write-Host "npm版本: $npmVersion" -ForegroundColor Green
Write-Host ""

# 安装依赖
Write-Host "安装依赖包..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "依赖安装完成" -ForegroundColor Green
Write-Host ""

# 类型检查
Write-Host "执行TypeScript类型检查..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "警告: 类型检查有错误，但继续构建" -ForegroundColor Yellow
}
Write-Host ""

# 构建项目
Write-Host "构建Electron应用..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成" -ForegroundColor Green
Write-Host ""

# 打包exe
Write-Host "打包Windows安装程序..." -ForegroundColor Yellow
npx electron-builder --win --x64
if ($LASTEXITCODE -ne 0) {
    Write-Host "错误: 打包失败" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 显示结果
Write-Host "=====================================" -ForegroundColor Green
Write-Host "打包完成！" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "安装程序位置:" -ForegroundColor Cyan
Write-Host "  dist/公众号桌面应用 Setup 1.0.0.exe" -ForegroundColor White
Write-Host ""
Write-Host "便携版位置:" -ForegroundColor Cyan
Write-Host "  dist/win-unpacked/" -ForegroundColor White
Write-Host ""

# 显示文件大小
if (Test-Path "dist/公众号桌面应用 Setup 1.0.0.exe") {
    $fileSize = (Get-Item "dist/公众号桌面应用 Setup 1.0.0.exe").Length / 1MB
    Write-Host "安装程序大小: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "提示: 运行以下命令推送到Git:" -ForegroundColor Yellow
Write-Host '  git add -A' -ForegroundColor White
Write-Host '  git commit -m "添加Windows打包配置"' -ForegroundColor White
Write-Host '  git push origin master' -ForegroundColor White
