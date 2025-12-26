import { useState, useEffect } from 'react';
import { StatsCard } from '../components/StatsCard';
import { UploadArea } from '../components/UploadArea';
import { FileUploadList } from '../components/FileUploadList';
import { ShareSettings } from '../components/ShareSettings';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { File, UploadFileItem, ShareSettings as ShareSettingsType } from '../types';
import { formatFileSize, getFileIcon, getFileThumbnail, isValidFileSize, isValidFileType } from '../utils/fileUtils';
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
    id: '3',
    name: 'business_presentation.pdf',
    type: 'application/pdf',
    size: 2097152,
    thumbnail: 'https://via.placeholder.com/300x200/9013FE/FFFFFF?text=PDF+Document',
    uploadDate: '2024-01-05',
    isShared: false,
    shareCount: 0,
    downloads: 12,
    tags: ['business', 'presentation']
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

export const Dashboard = () => {
  const { data: files = sampleFiles } = useGetFilesQuery();
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSettingsType>({
    expiration: '7d',
    privacy: 'public',
    maxViews: 100,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const totalFiles = files.length;
  const storageUsed = files.reduce((sum, file) => sum + file.size, 0);
  const sharedFiles = files.filter(file => file.isShared).length;

  const handleFilesSelected = (fileList: FileList) => {
    const newFiles: UploadFileItem[] = [];
    
    Array.from(fileList).forEach(file => {
      if (!isValidFileSize(file)) {
        (window as any).showAlert?.(`File ${file.name} exceeds 100MB limit`, 'error');
        return;
      }

      if (!isValidFileType(file)) {
        (window as any).showAlert?.(`File type not supported: ${file.name}`, 'error');
        return;
      }

      if (!selectedFiles.find(f => f.file.name === file.name && f.file.size === file.size)) {
        newFiles.push({
          file,
          id: Date.now() + Math.random().toString(),
          progress: 0
        });
      }
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      (window as any).showAlert?.('Please select files to upload', 'warning');
      return;
    }

    setIsUploading(true);

    // Simulate upload progress
    for (let i = 0; i < selectedFiles.length; i++) {
      const fileObj = selectedFiles[i];
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setSelectedFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, progress } : f
        ));
      }
    }

    setIsUploading(false);
    setSelectedFiles([]);
    (window as any).showAlert?.('Files uploaded successfully!', 'success');
  };

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

  const recentFiles = files.slice(0, 4);

  return (
    <>
      <div className="stats-grid">
        <StatsCard icon="📊" value={totalFiles} label="Total Files" />
        <StatsCard icon="💾" value={formatFileSize(storageUsed)} label="Storage Used" />
        <StatsCard icon="🔗" value={sharedFiles} label="Shared Files" />
        <StatsCard icon="⚡" value="85%" label="CDN Cache Hit Rate" />
      </div>

      <div className="upload-section">
        <div className="upload-header">
          <h2>Quick Upload</h2>
          <p>Drag and drop files or click to browse (Max 100MB each)</p>
        </div>

        <UploadArea onFilesSelected={handleFilesSelected} />
        <FileUploadList files={selectedFiles} onRemove={handleRemoveFile} />
        
        <ShareSettings settings={shareSettings} onChange={setShareSettings} />

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
        </div>
      </div>

      <div className="files-grid">
        {recentFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No files yet</h3>
            <p>Upload your first file to get started</p>
          </div>
        ) : (
          recentFiles.map(file => (
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

