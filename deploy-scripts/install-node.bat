@echo off
chcp 65001 >nul
:: =============================================================================
:: Node.js 自动安装脚本 (Windows)
:: 小白专用 - 一键安装 Node.js 和 Git
:: =============================================================================

echo ========================================
echo   Node.js 自动安装脚本 (Windows)
echo ========================================
echo.

:: 检查是否以管理员身份运行
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 请以管理员身份运行此脚本!
    echo 右键点击脚本，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo [INFO] 正在检查系统环境...

:: 检查是否已安装 Node.js
node --version >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] Node.js 已安装
    node --version
) else (
    echo [INFO] 正在下载 Node.js...
    
    :: 下载 Node.js LTS
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\nodejs.msi'"
    
    echo [INFO] 正在安装 Node.js...
    msiexec /i "%TEMP%\nodejs.msi" /qn /norestart
    
    :: 刷新环境变量
    call refreshenv.cmd 2>nul || set "PATH=%PATH%;C:\Program Files\nodejs\"
    
    echo [✓] Node.js 安装完成
)

echo.

:: 检查是否已安装 Git
git --version >nul 2>&1
if %errorLevel% equ 0 (
    echo [✓] Git 已安装
    git --version
) else (
    echo [INFO] 正在下载 Git...
    
    :: 下载 Git
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/download/v2.43.0.windows.1/Git-2.43.0-64-bit.exe' -OutFile '%TEMP%\git.exe'"
    
    echo [INFO] 正在安装 Git...
    "%TEMP%\git.exe" /VERYSILENT /NORESTART
    
    echo [✓] Git 安装完成
)

echo.
echo ========================================
echo [✓] 环境安装完成！
echo ========================================
echo.
echo 请重新打开命令提示符，然后运行:
echo   node --version
echo   npm --version
echo   git --version
echo.
pause
