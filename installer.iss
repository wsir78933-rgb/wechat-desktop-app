; Inno Setup 安装脚本
; 对标账号管理软件 Windows 安装程序
; Version: 1.2.0

#define MyAppName "对标账号管理软件"
#define MyAppVersion "1.2.0"
#define MyAppPublisher "Claude Code Project"
#define MyAppURL "https://github.com/wsir78933-rgb/wechat-desktop-app"
#define MyAppExeName "对标账号管理软件.exe"

[Setup]
; 应用程序基本信息
AppId={{A5F8E9D3-2B4C-4E1A-9F6D-8C3A7B5E9D2F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}

; 安装路径
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

; 输出设置
OutputDir=output\installer
OutputBaseFilename=对标账号管理软件-setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes

; 安装程序界面
SetupIconFile=icon.ico
WizardStyle=modern

; 权限要求
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog

; 支持的 Windows 版本
MinVersion=10.0

; 允许用户选择是否创建桌面快捷方式
UsePreviousAppDir=yes
UsePreviousGroup=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; 主程序文件
Source: "dist\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
; 图标文件
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion
; 许可证文件
Source: "LICENSE"; DestDir: "{app}"; Flags: ignoreversion
; 说明文件
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme

[Icons]
; 开始菜单快捷方式
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
; 桌面快捷方式（可选）
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\icon.ico"; Tasks: desktopicon

[Run]
; 安装完成后询问是否运行程序
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
; 卸载时删除用户数据（可选）
Type: filesandordirs; Name: "{app}\data"
Type: filesandordirs; Name: "{app}\logs"

[Code]
// 自定义安装逻辑
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
  begin
    // 安装后操作（如有需要）
  end;
end;

function InitializeSetup(): Boolean;
begin
  Result := True;
  // 检查是否已安装旧版本
end;
