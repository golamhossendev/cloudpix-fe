import { useState } from 'react';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { File } from '../types';
import { formatFileSize, getFileIcon, normalizeFile } from '../utils/fileUtils';
import { useGetFilesQuery } from '../store/api/filesApi';

const sampleFiles: File[] = [
  {
    id: '1',
    name: 'sunrise_mountains.jpg',
    type: 'image/jpeg',
    size: 5242880,
    thumbnail: 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=Sunrise+Mountains',
    uploadDate: '2024-01-15',
    isShared: true,
    shareCount: 42,
    downloads: 156,
    tags: ['nature', 'mountains', 'sunrise']
  },
  {
    id: '2',
    name: 'beach_vacation.mp4',
    type: 'video/mp4',
    size: 104857600,
    thumbnail: 'https://via.placeholder.com/300x200/50E3C2/FFFFFF?text=Beach+Video',
    uploadDate: '2024-01-10',
    isShared: true,
    shareCount: 28,
    downloads: 89,
    tags: ['beach', 'vacation', 'travel']
  },
  {
    id: '4',
    name: 'city_night.jpg',
    type: 'image/jpeg',
    size: 3145728,
    thumbnail: 'https://via.placeholder.com/300x200/417505/FFFFFF?text=City+Night',
    uploadDate: '2024-01-01',
    isShared: true,
    shareCount: 15,
    downloads: 67,
    tags: ['city', 'night', 'photography']
  }
];

export const Shared = () => {
  const { data: filesResponse } = useGetFilesQuery();
  const rawFiles = filesResponse?.files || sampleFiles;
  const files = rawFiles.map(normalizeFile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sharedFiles = files.filter(file => file.isShared);

  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleShareFile = (file: File) => {
    file.isShared = !file.isShared;
    if (file.isShared) {
      file.shareCount = (file.shareCount || 0) + 1;
      (window as any).showAlert?.('File is now shared publicly', 'success');
    } else {
      (window as any).showAlert?.('File sharing disabled', 'warning');
    }
  };

  const handleDownloadFile = (file: File) => {
    file.downloads = (file.downloads || 0) + 1;
    (window as any).showAlert?.(`Downloading ${file.name}...`, 'success');
    console.log('Downloading file:', file.name);
  };

  const handleDeleteFile = () => {
    if (selectedFile) {
      (window as any).showAlert?.(`File "${selectedFile.name}" deleted`, 'success');
      setIsModalOpen(false);
      setSelectedFile(null);
    }
  };

  const handleCopyLink = () => {
    const input = document.getElementById('shareLinkInput') as HTMLInputElement;
    if (input) {
      input.select();
      document.execCommand('copy');
      (window as any).showAlert?.('Link copied to clipboard!', 'success');
    }
  };

  return (
    <>
      <h2 style={{ marginBottom: '2rem' }}>Shared Files</h2>
      
      <div className="files-grid">
        {sharedFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No shared files</h3>
            <p>Share a file to see it here</p>
          </div>
        ) : (
          sharedFiles.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onView={handleViewFile}
              onShare={handleShareFile}
              onDownload={handleDownloadFile}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFile?.name || 'File Details'}
        footer={
          <>
            <Button variant="secondary" onClick={handleCopyLink}>
              Copy Link
            </Button>
            <Button variant="primary" onClick={() => selectedFile && handleDownloadFile(selectedFile)}>
              Download
            </Button>
            <Button variant="danger" onClick={handleDeleteFile}>
              Delete
            </Button>
          </>
        }
      >
        {selectedFile && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {getFileIcon(selectedFile.type)}
              </div>
              <h3>{selectedFile.name}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--light-gray)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Size</div>
                <div style={{ fontWeight: 600 }}>{formatFileSize(selectedFile.size)}</div>
              </div>
              <div style={{ background: 'var(--light-gray)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Upload Date</div>
                <div style={{ fontWeight: 600 }}>{new Date(selectedFile.uploadDate).toLocaleDateString()}</div>
              </div>
              <div style={{ background: 'var(--light-gray)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Downloads</div>
                <div style={{ fontWeight: 600 }}>{selectedFile.downloads || 0}</div>
              </div>
              <div style={{ background: 'var(--light-gray)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Shares</div>
                <div style={{ fontWeight: 600 }}>{selectedFile.shareCount || 0}</div>
              </div>
            </div>

            {selectedFile.tags && selectedFile.tags.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '0.5rem' }}>Tags</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedFile.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        background: 'var(--primary)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '50px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFile.isShared && (
              <div style={{ background: 'rgba(0, 102, 204, 0.1)', padding: '1rem', borderRadius: 'var(--border-radius)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span>🔗</span>
                  <span style={{ fontWeight: 600 }}>Shared Publicly</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    id="shareLinkInput"
                    value={`${window.location.origin}/share/${selectedFile.id}`}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      border: '1px solid var(--light-gray)',
                      borderRadius: 'var(--border-radius)'
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
};

