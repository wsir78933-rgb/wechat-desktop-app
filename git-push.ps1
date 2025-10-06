# Git推送脚本
# 配置远程仓库并推送代码

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Git推送脚本 - 公众号桌面应用" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 检查Git
Write-Host "检查Git..." -ForegroundColor Yellow
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "错误: 未安装Git" -ForegroundColor Red
    Write-Host "请从 https://git-scm.com/ 下载并安装Git" -ForegroundColor Red
    exit 1
}
$gitVersion = git --version
Write-Host "$gitVersion" -ForegroundColor Green
Write-Host ""

# 检查当前状态
Write-Host "检查Git状态..." -ForegroundColor Yellow
git status --short
Write-Host ""

# 检查远程仓库
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "已配置远程仓库:" -ForegroundColor Green
    git remote -v
    Write-Host ""
} else {
    Write-Host "未配置远程仓库" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "请输入GitHub仓库URL (例如: https://github.com/username/repo.git):" -ForegroundColor Cyan
    $repoUrl = Read-Host "仓库URL"

    if ($repoUrl) {
        Write-Host "添加远程仓库..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        Write-Host "远程仓库添加成功" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "错误: 未输入仓库URL" -ForegroundColor Red
        exit 1
    }
}

# 检查是否有未提交的更改
$status = git status --porcelain
if ($status) {
    Write-Host "发现未提交的更改，正在提交..." -ForegroundColor Yellow
    git add -A

    Write-Host "请输入提交信息 (回车使用默认信息):" -ForegroundColor Cyan
    $commitMsg = Read-Host "提交信息"

    if (!$commitMsg) {
        $commitMsg = "更新项目代码"
    }

    git commit -m "$commitMsg`n`n🤖 Generated with [Claude Code](https://claude.com/claude-code)`n`nCo-Authored-By: Claude <noreply@anthropic.com>"
    Write-Host "提交完成" -ForegroundColor Green
    Write-Host ""
}

# 获取当前分支
$currentBranch = git branch --show-current
Write-Host "当前分支: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# 推送到远程
Write-Host "推送到远程仓库..." -ForegroundColor Yellow
Write-Host "执行命令: git push -u origin $currentBranch" -ForegroundColor Gray
Write-Host ""

git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "推送成功！" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub Actions将自动开始构建..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "查看构建状态:" -ForegroundColor Yellow
    $originUrl = git remote get-url origin
    $repoPath = $originUrl -replace '\.git$', '' -replace 'https://github.com/', ''
    Write-Host "  https://github.com/$repoPath/actions" -ForegroundColor White
    Write-Host ""
    Write-Host "下载构建产物:" -ForegroundColor Yellow
    Write-Host "  1. 访问上述Actions页面" -ForegroundColor White
    Write-Host "  2. 点击最新的workflow运行" -ForegroundColor White
    Write-Host "  3. 在Artifacts部分下载exe安装程序" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "推送失败" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "可能的原因:" -ForegroundColor Yellow
    Write-Host "  1. 没有权限推送到该仓库" -ForegroundColor White
    Write-Host "  2. 需要先配置Git认证 (gh auth login)" -ForegroundColor White
    Write-Host "  3. 远程仓库URL不正确" -ForegroundColor White
    Write-Host "  4. 网络连接问题" -ForegroundColor White
    Write-Host ""
    Write-Host "建议操作:" -ForegroundColor Yellow
    Write-Host "  git remote set-url origin <正确的仓库URL>" -ForegroundColor White
    Write-Host "  gh auth login  # 使用GitHub CLI认证" -ForegroundColor White
    Write-Host ""
}

# 显示最近的提交
Write-Host "最近的提交:" -ForegroundColor Cyan
git log --oneline -n 5
Write-Host ""

# 提示发布版本
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "发布正式版本（可选）" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "创建Release版本:" -ForegroundColor Yellow
Write-Host "  npm version patch  # 1.0.0 -> 1.0.1" -ForegroundColor White
Write-Host "  git push --tags    # 推送tag触发Release构建" -ForegroundColor White
Write-Host ""
