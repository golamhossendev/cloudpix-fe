import { File } from '../types';
import { getFileIcon, formatFileSize } from '../utils/fileUtils';
import { Button } from './Button';

interface FileCardProps {
  file: File;
  onView: (file: File) => void;
  onShare: (file: File) => void;
  onDownload: (file: File) => void;
}

export const FileCard = ({ file, onView, onShare, onDownload }: FileCardProps) => {
  const icon = getFileIcon(file.type);
  const size = formatFileSize(file.size);
  const date = new Date(file.uploadDate).toLocaleDateString();

  return (
    <div className="file-card">
      <div className="file-thumbnail">
        {file.thumbnail ? (
          <img src={file.thumbnail} alt={file.name} />
        ) : (
          <div className="thumbnail-icon">{icon}</div>
        )}
      </div>
      <div className="file-content">
        <div className="file-title">{file.name}</div>
        <div className="file-meta">
          <span>{size}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
        <div className="file-actions">
          <Button variant="secondary" size="sm" onClick={() => onView(file)}>
            View
          </Button>
          {file.isShared ? (
            <Button variant="success" size="sm" onClick={() => onShare(file)}>
              Shared
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onShare(file)}>
              Share
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => onDownload(file)}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

