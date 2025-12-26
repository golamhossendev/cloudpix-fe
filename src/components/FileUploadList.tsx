import type { UploadFileItem } from '../types';
import { getFileIcon, formatFileSize } from '../utils/fileUtils';
import { Button } from './Button';

interface FileUploadListProps {
  files: UploadFileItem[];
  onRemove: (index: number) => void;
}

export const FileUploadList = ({ files, onRemove }: FileUploadListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="file-list">
      {files.map((fileObj, index) => {
        const icon = getFileIcon(fileObj.file.type);
        const size = formatFileSize(fileObj.file.size);

        return (
          <div key={fileObj.id} className="file-item">
            <div className="file-info">
              <div className="file-icon">{icon}</div>
              <div className="file-details">
                <div className="file-name">{fileObj.file.name}</div>
                <div className="file-size">{size}</div>
              </div>
            </div>
            <div className="file-progress">
              <div className="progress-bar" style={{ width: `${fileObj.progress}%` }}></div>
            </div>
            <Button variant="danger" size="sm" onClick={() => onRemove(index)}>
              Remove
            </Button>
          </div>
        );
      })}
    </div>
  );
};

