@echo off
chcp 65001 >nul
:: =============================================================================
:: CLI 工具一键部署脚本 (Windows)
:: =============================================================================

echo ========================================
echo   GitHub Uploader CLI 一键部署
echo ========================================
echo.

:: 检查 Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] Node.js 未安装！
    echo 请先运行 install-node.bat 安装环境
    pause
    exit /b 1
)

echo [1/4] 检查环境... 通过
echo.

echo [2/4] 下载项目...
if exist github-uploader (
    echo [INFO] 目录已存在，正在更新...
    cd github-uploader
    git pull origin main
    cd ..
) else (
    git clone https://github.com/4129163/github-uploader.git
)
echo [✓] 项目下载完成
echo.

echo [3/4] 安装依赖...
cd github-uploader\cli-tool
call npm install
echo [✓] 依赖安装完成
echo.

echo [4/4] 部署完成！
echo.
echo ========================================
echo   使用指南
echo ========================================
echo.
echo 1. 获取 GitHub Token:
echo    访问: https://github.com/settings/tokens
echo    点击 'Generate new token (classic)'
echo    勾选 'repo' 权限
echo.
echo 2. 运行上传工具:
echo    cd github-uploader\cli-tool
echo    npm start
echo.
echo 3. 按提示输入 Token 和仓库名称
echo.
echo ========================================
echo.

set /p runnow="是否立即运行? (y/n): "
if /i "%runnow%"=="y" (
    npm start
) else (
    pause
)
