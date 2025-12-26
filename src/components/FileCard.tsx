import { File } from '../types';
import { getFileIcon, formatFileSize, normalizeFile } from '../utils/fileUtils';
import { Button } from './Button';

interface FileCardProps {
  file: File;
  onView: (file: File) => void;
  onShare: (file: File) => void;
  onDownload: (file: File) => void;
}

export const FileCard = ({ file, onView, onShare, onDownload }: FileCardProps) => {
  const normalizedFile = normalizeFile(file);
  const icon = getFileIcon(normalizedFile.type || normalizedFile.contentType || '');
  const size = formatFileSize(normalizedFile.size);
  const date = new Date(normalizedFile.uploadDate).toLocaleDateString();

  return (
    <div className="file-card">
      <div className="file-thumbnail">
        {normalizedFile.thumbnail || normalizedFile.blobUrl ? (
          <img src={normalizedFile.thumbnail || normalizedFile.blobUrl} alt={normalizedFile.name} />
        ) : (
          <div className="thumbnail-icon">{icon}</div>
        )}
      </div>
      <div className="file-content">
        <div className="file-title">{normalizedFile.name}</div>
        <div className="file-meta">
          <span>{size}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
        <div className="file-actions">
          <Button variant="secondary" size="sm" onClick={() => onView(normalizedFile)}>
            View
          </Button>
          {normalizedFile.isShared ? (
            <Button variant="success" size="sm" onClick={() => onShare(normalizedFile)}>
              Shared
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => onShare(normalizedFile)}>
              Share
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={() => onDownload(normalizedFile)}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

