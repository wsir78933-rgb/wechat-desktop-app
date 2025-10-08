# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller 打包配置文件
用于将 对标账号管理软件 打包为 Windows 可执行文件
"""

import os
import sys

# 项目路径配置
project_root = os.path.abspath('.')
src_path = os.path.join(project_root, 'src', 'main', 'python')

# 隐藏导入列表（确保所有模块都被打包）
hidden_imports = [
    'PyQt5',
    'PyQt5.QtCore',
    'PyQt5.QtGui',
    'PyQt5.QtWidgets',
    'PyQt5.sip',
    # UI模块
    'ui',
    'ui.main_window',
    'ui.styles',
    'ui.widgets',
    'ui.widgets.account_list_widget',
    'ui.widgets.article_list_widget',
    'ui.dialogs',
    'ui.dialogs.add_account_dialog',
    'ui.dialogs.add_article_dialog',
    # Core模块
    'core',
    'core.database',
    'core.account_manager',
    'core.article_manager',
    'core.export_manager',
    'core.import_manager',
    # Utils模块
    'utils',
    'utils.logger',
    'utils.config',
    'utils.validators',
    # 标准库
    'logging',
    'sqlite3',
    'json',
    'datetime',
    # 第三方库
    'openpyxl',
    'openpyxl.styles',
    'openpyxl.utils',
    'validators',
    'dateutil',
    'dateutil.parser',
]

# 分析阶段
a = Analysis(
    [os.path.join('src', 'main', 'python', 'main.py')],
    pathex=[src_path],
    binaries=[],
    datas=[],
    hiddenimports=hidden_imports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

# PYZ 归档
pyz = PYZ(a.pure, a.zipped_data, cipher=None)

# 可执行文件
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='对标账号管理软件',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # 不显示控制台窗口
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='icon.ico',  # 应用程序图标
)
