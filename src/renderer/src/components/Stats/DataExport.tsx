/**
 * DataExport 数据导出组件
 * 支持多种格式导出（Markdown, HTML, PDF, JSON）
 */
import React, { useState } from 'react';
import { ExportFormat } from '../../types/article';
import Button from '../Common/Button';
import Select from '../Common/Select';
import Modal from '../Common/Modal';

interface DataExportProps {
  selectedCount: number;
  onExport: (format: ExportFormat, options: ExportOptions) => Promise<void>;
  className?: string;
}

interface ExportOptions {
  includeImages: boolean;
  includeMeta: boolean;
}

const DataExport: React.FC<DataExportProps> = ({ selectedCount, onExport, className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [includeImages, setIncludeImages] = useState(true);
  const [includeMeta, setIncludeMeta] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const formatOptions = [
    { label: 'Markdown (.md)', value: 'markdown' },
    { label: 'HTML (.html)', value: 'html' },
    { label: 'PDF (.pdf)', value: 'pdf' },
    { label: 'JSON (.json)', value: 'json' },
  ];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExport(format, { includeImages, includeMeta });
      setIsModalOpen(false);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="primary"
        onClick={() => setIsModalOpen(true)}
        disabled={selectedCount === 0}
        className={className}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        }
        aria-label="导出数据"
      >
        导出 {selectedCount > 0 ? `(${selectedCount})` : ''}
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="导出数据"
        width="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isExporting}>
              取消
            </Button>
            <Button onClick={handleExport} loading={isExporting} disabled={isExporting}>
              {isExporting ? '导出中...' : '开始导出'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* 导出信息 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-blue-600 mt-0.5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium">将导出 {selectedCount} 篇文章</p>
                <p className="mt-1 text-blue-600">
                  导出的文件将保存到系统默认下载文件夹
                </p>
              </div>
            </div>
          </div>

          {/* 导出格式选择 */}
          <Select
            label="导出格式"
            options={formatOptions}
            value={format}
            onChange={(value) => setFormat(value as ExportFormat)}
            aria-label="选择导出格式"
          />

          {/* 导出选项 */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">导出选项</label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={format === 'json'}
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">包含图片</div>
                <div className="text-xs text-gray-500">
                  {format === 'json' ? 'JSON格式不支持此选项' : '导出时包含文章中的图片'}
                </div>
              </div>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={includeMeta}
                onChange={(e) => setIncludeMeta(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="ml-3">
                <div className="text-sm font-medium text-gray-900">包含元数据</div>
                <div className="text-xs text-gray-500">
                  包含作者、发布日期、标签等元信息
                </div>
              </div>
            </label>
          </div>

          {/* 格式说明 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">格式说明</h4>
            <div className="text-xs text-gray-600 space-y-1">
              {format === 'markdown' && (
                <p>• Markdown格式适合在文本编辑器中查看和编辑，可直接用于博客发布</p>
              )}
              {format === 'html' && <p>• HTML格式可在浏览器中直接打开查看，保留完整样式</p>}
              {format === 'pdf' && <p>• PDF格式适合打印和存档，兼容性最好</p>}
              {format === 'json' && (
                <p>• JSON格式包含所有原始数据，适合数据分析和二次开发</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DataExport;
