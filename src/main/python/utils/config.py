"""
配置管理模块
提供应用程序配置的读取、保存和管理功能
"""

import json
from pathlib import Path
from typing import Any, Dict, Optional


class Config:
    """配置管理类（单例模式）"""

    _instance = None
    _config_data: Dict[str, Any] = {}
    _config_file: str = "data/config.json"

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self, config_file: str = None):
        """
        初始化配置管理器

        Args:
            config_file: 配置文件路径，默认为 data/config.json
        """
        if hasattr(self, '_initialized'):
            return

        if config_file:
            self._config_file = config_file

        self._initialized = True
        self.load()

    def load(self):
        """从文件加载配置"""
        config_path = Path(self._config_file)

        if config_path.exists():
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    self._config_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"配置文件格式错误: {e}")
                self._config_data = self._get_default_config()
        else:
            # 首次运行，使用默认配置
            self._config_data = self._get_default_config()
            self.save()

    def save(self):
        """保存配置到文件"""
        config_path = Path(self._config_file)
        config_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            with open(config_path, 'w', encoding='utf-8') as f:
                json.dump(self._config_data, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"保存配置失败: {e}")

    def get(self, key: str, default: Any = None) -> Any:
        """
        获取配置项

        Args:
            key: 配置键（支持点号分隔的嵌套键，如 "database.path"）
            default: 默认值

        Returns:
            Any: 配置值
        """
        keys = key.split('.')
        value = self._config_data

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def set(self, key: str, value: Any):
        """
        设置配置项

        Args:
            key: 配置键（支持点号分隔的嵌套键）
            value: 配置值
        """
        keys = key.split('.')
        data = self._config_data

        # 逐级创建嵌套字典
        for k in keys[:-1]:
            if k not in data or not isinstance(data[k], dict):
                data[k] = {}
            data = data[k]

        # 设置最终值
        data[keys[-1]] = value

    def get_all(self) -> Dict[str, Any]:
        """
        获取所有配置

        Returns:
            Dict: 配置字典
        """
        return self._config_data.copy()

    def reset(self):
        """重置为默认配置"""
        self._config_data = self._get_default_config()
        self.save()

    @staticmethod
    def _get_default_config() -> Dict[str, Any]:
        """
        获取默认配置

        Returns:
            Dict: 默认配置字典
        """
        return {
            "database": {
                "path": "data/accounts.db"
            },
            "ui": {
                "theme": "light",
                "font_family": "Microsoft YaHei",
                "font_size": 10,
                "window_width": 1200,
                "window_height": 800
            },
            "crawler": {
                "timeout": 30,
                "retry_times": 3,
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            "export": {
                "default_format": "excel",
                "output_dir": "output"
            },
            "platforms": [
                {"name": "微信公众号", "enabled": True},
                {"name": "知乎", "enabled": True},
                {"name": "小红书", "enabled": True},
                {"name": "B站", "enabled": True},
                {"name": "抖音", "enabled": True},
                {"name": "微博", "enabled": True}
            ],
            "log": {
                "level": "INFO",
                "max_size_mb": 10,
                "backup_count": 5
            }
        }


# 全局配置实例
_config_instance: Optional[Config] = None


def get_config() -> Config:
    """
    获取全局配置实例

    Returns:
        Config: 配置实例
    """
    global _config_instance
    if _config_instance is None:
        _config_instance = Config()
    return _config_instance
