/**
 * TagEditor 标签编辑器组件
 * 用于创建和编辑标签
 */
import React, { useState, useEffect } from 'react';
import { Tag } from '../../types/tag';
import Button from '../Common/Button';
import Input from '../Common/Input';
import TagColorPicker from './TagColorPicker';

interface TagEditorProps {
  tag?: Tag;
  onSave: (tag: Omit<Tag, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const TagEditor: React.FC<TagEditorProps> = ({ tag, onSave, onCancel, isSubmitting = false }) => {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '#3b82f6');
  const [error, setError] = useState('');

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color || '#3b82f6');
    }
  }, [tag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证
    if (!name.trim()) {
      setError('标签名称不能为空');
      return;
    }

    if (name.trim().length > 20) {
      setError('标签名称不能超过20个字符');
      return;
    }

    // 验证颜色格式
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!colorRegex.test(color)) {
      setError('请输入有效的颜色代码');
      return;
    }

    setError('');
    onSave({
      name: name.trim(),
      color: color,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="标签名称"
          value={name}
          onChange={(value) => {
            setName(value);
            setError('');
          }}
          placeholder="请输入标签名称"
          error={error}
          maxLength={20}
          disabled={isSubmitting}
          aria-label="标签名称"
        />
      </div>

      <TagColorPicker selectedColor={color} onColorChange={setColor} />

      {/* 预览 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">预览</label>
        <div
          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
          style={{
            backgroundColor: color,
            color: getTextColor(color),
          }}
        >
          {name.trim() || '标签预览'}
        </div>
      </div>

      {/* 按钮组 */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          取消
        </Button>
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {tag ? '保存修改' : '创建标签'}
        </Button>
      </div>
    </form>
  );
};

// 计算文本颜色（根据背景色自动选择黑色或白色）
function getTextColor(bgColor: string): string {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

export default TagEditor;
