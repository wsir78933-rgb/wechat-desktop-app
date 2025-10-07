"""
验证工具模块
提供URL、输入格式等验证功能
"""

import re
from typing import Tuple
from urllib.parse import urlparse


class URLValidator:
    """URL验证器"""

    # URL正则表达式（简化版）
    URL_PATTERN = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
        r'localhost|'  # localhost
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE
    )

    # 支持的平台域名模式
    PLATFORM_PATTERNS = {
        "微信公众号": [
            r'mp\.weixin\.qq\.com',
            r'weixin\.qq\.com'
        ],
        "知乎": [
            r'zhihu\.com',
            r'zhuanlan\.zhihu\.com'
        ],
        "小红书": [
            r'xiaohongshu\.com',
            r'xhslink\.com'
        ],
        "B站": [
            r'bilibili\.com',
            r'b23\.tv'
        ],
        "抖音": [
            r'douyin\.com',
            r'iesdouyin\.com'
        ],
        "微博": [
            r'weibo\.com',
            r'weibo\.cn'
        ],
        "今日头条": [
            r'toutiao\.com'
        ],
        "百家号": [
            r'baijiahao\.baidu\.com'
        ],
        "搜狐号": [
            r'sohu\.com'
        ],
        "网易号": [
            r'163\.com',
            r'netease\.com'
        ]
    }

    @staticmethod
    def is_valid_url(url: str) -> bool:
        """
        验证URL格式是否合法

        Args:
            url: 待验证的URL

        Returns:
            bool: 合法返回True，否则返回False
        """
        if not url or not isinstance(url, str):
            return False

        url = url.strip()

        # 基本格式验证
        if not URLValidator.URL_PATTERN.match(url):
            return False

        # 使用urlparse进行进一步验证
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except Exception:
            return False

    @staticmethod
    def detect_platform(url: str) -> Tuple[bool, str]:
        """
        检测URL所属平台

        Args:
            url: 待检测的URL

        Returns:
            Tuple[bool, str]: (是否识别成功, 平台名称)
        """
        if not URLValidator.is_valid_url(url):
            return False, "无效URL"

        url_lower = url.lower()

        for platform, patterns in URLValidator.PLATFORM_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, url_lower):
                    return True, platform

        return False, "未知平台"

    @staticmethod
    def normalize_url(url: str) -> str:
        """
        规范化URL（去除多余参数、统一格式）

        Args:
            url: 原始URL

        Returns:
            str: 规范化后的URL
        """
        if not url:
            return ""

        url = url.strip()

        # 确保有协议头
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        try:
            parsed = urlparse(url)

            # 重构URL（去除fragment）
            normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"

            # 保留必要的查询参数（根据平台特性）
            if parsed.query:
                # 微信公众号保留__biz参数
                if 'mp.weixin.qq.com' in parsed.netloc:
                    if '__biz=' in parsed.query:
                        normalized += '?' + parsed.query

            return normalized

        except Exception:
            return url


class InputValidator:
    """输入验证器"""

    @staticmethod
    def is_valid_name(name: str, min_length: int = 1, max_length: int = 100) -> Tuple[bool, str]:
        """
        验证账号名称

        Args:
            name: 账号名称
            min_length: 最小长度
            max_length: 最大长度

        Returns:
            Tuple[bool, str]: (是否合法, 错误信息)
        """
        if not name or not isinstance(name, str):
            return False, "名称不能为空"

        name = name.strip()

        if len(name) < min_length:
            return False, f"名称长度不能少于{min_length}个字符"

        if len(name) > max_length:
            return False, f"名称长度不能超过{max_length}个字符"

        # 检查是否包含非法字符
        illegal_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        for char in illegal_chars:
            if char in name:
                return False, f"名称不能包含特殊字符: {char}"

        return True, ""

    @staticmethod
    def is_valid_tags(tags: str) -> Tuple[bool, str]:
        """
        验证标签格式

        Args:
            tags: 标签字符串（逗号分隔）

        Returns:
            Tuple[bool, str]: (是否合法, 错误信息)
        """
        if not tags:
            return True, ""  # 标签可以为空

        tags = tags.strip()

        # 检查标签数量（最多10个）
        tag_list = [t.strip() for t in tags.split(',') if t.strip()]
        if len(tag_list) > 10:
            return False, "标签数量不能超过10个"

        # 检查单个标签长度
        for tag in tag_list:
            if len(tag) > 20:
                return False, f"标签'{tag}'长度不能超过20个字符"

        return True, ""

    @staticmethod
    def sanitize_input(text: str) -> str:
        """
        清理输入文本（去除危险字符）

        Args:
            text: 原始文本

        Returns:
            str: 清理后的文本
        """
        if not text:
            return ""

        # 去除首尾空白
        text = text.strip()

        # 替换控制字符
        text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)

        return text


def validate_url(url: str) -> Tuple[bool, str]:
    """
    快捷函数：验证URL

    Args:
        url: 待验证的URL

    Returns:
        Tuple[bool, str]: (是否合法, 错误信息或平台名称)
    """
    if not URLValidator.is_valid_url(url):
        return False, "URL格式不正确"

    success, platform = URLValidator.detect_platform(url)
    if success:
        return True, f"识别为{platform}链接"
    else:
        return True, "URL格式正确，但平台未识别"


def validate_account_name(name: str) -> Tuple[bool, str]:
    """
    快捷函数：验证账号名称

    Args:
        name: 账号名称

    Returns:
        Tuple[bool, str]: (是否合法, 错误信息)
    """
    return InputValidator.is_valid_name(name)
