import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useGetFileByShareLinkQuery } from '../store/api/shareApi';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import './ShareView.css';

export const ShareView = () => {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { data, isLoading, error } = useGetFileByShareLinkQuery(linkId || '', {
    skip: !linkId,
  });

  useEffect(() => {
    if (error) {
      (window as any).showAlert?.(
        (error as any)?.data?.error || 'Share link is invalid or expired',
        'error'
      );
    }
  }, [error]);

  const handleDownload = () => {
    if (data?.downloadUrl) {
      setIsDownloading(true);
      window.open(data.downloadUrl, '_blank');
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="share-view-container">
        <div className="share-view-card">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="share-view-container">
        <div className="share-view-card error">
          <div className="error-icon">❌</div>
          <h2>Share Link Not Available</h2>
          <p>This share link may have expired, been revoked, or the file may have been deleted.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  const { file, shareLink, downloadUrl } = data;
  const isImage = file.contentType?.startsWith('image/');

  return (
    <div className="share-view-container">
      <div className="share-view-card">
        <div className="share-header">
          <h1>Shared File</h1>
          <p>This file has been shared with you</p>
        </div>

        <div className="file-preview">
          {isImage && downloadUrl ? (
            <div className="image-preview-container">
              <img 
                src={downloadUrl} 
                alt={file.fileName}
                className="image-preview"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="file-icon-large" style={{ display: 'none' }}>
                {getFileIcon(file.contentType)}
              </div>
            </div>
          ) : (
            <div className="file-icon-large">
              {getFileIcon(file.contentType)}
            </div>
          )}
          <h2>{file.fileName}</h2>
          <div className="file-info">
            <div className="info-item">
              <span className="info-label">Size:</span>
              <span className="info-value">{formatFileSize(file.fileSize)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{file.contentType}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Uploaded:</span>
              <span className="info-value">
                {new Date(file.uploadDate).toLocaleDateString()}
              </span>
            </div>
            {shareLink.expiryDate && (
              <div className="info-item">
                <span className="info-label">Expires:</span>
                <span className="info-value">
                  {new Date(shareLink.expiryDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="share-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download File'}
          </Button>
        </div>

        {shareLink.accessCount > 0 && (
          <div className="share-stats">
            <p>This file has been accessed {shareLink.accessCount} time{shareLink.accessCount !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
};

