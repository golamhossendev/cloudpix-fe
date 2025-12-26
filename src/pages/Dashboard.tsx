import { useState } from 'react';
import { StatsCard } from '../components/StatsCard';
import { UploadArea } from '../components/UploadArea';
import { FileUploadList } from '../components/FileUploadList';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { ShareLinksManager } from '../components/ShareLinksManager';
import type { File, UploadFileItem } from '../types';
import { formatFileSize, getFileIcon, isValidFileSize, isValidFileType } from '../utils/fileUtils';
import { useGetFilesQuery, useUploadFileMutation, useDeleteFileMutation } from '../store/api/filesApi';
import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { isAuthenticated } = useAuth();
  const { data: filesResponse, isLoading, refetch } = useGetFilesQuery(undefined, { skip: !isAuthenticated });
  const [uploadFile] = useUploadFileMutation();
  const [deleteFile] = useDeleteFileMutation();
  
  const files = filesResponse?.files || [];
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const totalFiles = files.length;
  const storageUsed = files.reduce((sum, file) => sum + (file.size || 0), 0);
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

    try {
      // Upload files one by one
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileObj = selectedFiles[i];
        const formData = new FormData();
        formData.append('file', fileObj.file);

        // Update progress simulation
        for (let progress = 0; progress <= 90; progress += 30) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setSelectedFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress } : f
          ));
        }

        try {
          await uploadFile(formData).unwrap();
          setSelectedFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress: 100 } : f
          ));
          (window as any).showAlert?.(`File ${fileObj.file.name} uploaded successfully!`, 'success');
        } catch (error: any) {
          (window as any).showAlert?.(
            `Failed to upload ${fileObj.file.name}: ${error?.data?.error || error?.message || 'Unknown error'}`,
            'error'
          );
        }
      }

      // Refresh files list after upload
      refetch();
      setSelectedFiles([]);
    } catch (error: any) {
      (window as any).showAlert?.(
        `Upload failed: ${error?.data?.error || error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleShareFile = async (file: File) => {
    // Open share links manager modal instead of creating link directly
    setSelectedFile(file);
    setIsShareLinksModalOpen(true);
  };

  const handleDownloadFile = (file: File) => {
    if (file.blobUrl) {
      window.open(file.blobUrl, '_blank');
      (window as any).showAlert?.(`Downloading ${file.name}...`, 'success');
    } else {
      (window as any).showAlert?.(`File URL not available for ${file.name}`, 'error');
    }
  };

  const handleDeleteFile = async () => {
    if (selectedFile && selectedFile.id) {
      try {
        await deleteFile(selectedFile.id).unwrap();
        (window as any).showAlert?.(`File "${selectedFile.name}" deleted`, 'success');
        setIsModalOpen(false);
        setSelectedFile(null);
        refetch(); // Refresh files list after deletion
      } catch (error: any) {
        (window as any).showAlert?.(
          `Failed to delete file: ${error?.data?.error || error?.message || 'Unknown error'}`,
          'error'
        );
      }
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

  if (isLoading) {
    return <div>Loading files...</div>;
  }

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
              {selectedFile.type?.startsWith('image/') && selectedFile.blobUrl ? (
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <img 
                    src={selectedFile.blobUrl} 
                    alt={selectedFile.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: 'var(--border-radius)',
                      boxShadow: 'var(--shadow)',
                      objectFit: 'contain',
                      background: 'var(--light-gray)',
                      padding: '0.5rem'
                    }}
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                  {getFileIcon(selectedFile.type || '')}
                </div>
              )}
              <h3>{selectedFile.name}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--light-gray)', padding: '1rem', borderRadius: 'var(--border-radius)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Size</div>
                <div style={{ fontWeight: 600 }}>{formatFileSize(selectedFile.size || 0)}</div>
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

            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--light-gray)' }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsShareLinksModalOpen(true);
                }}
                style={{ width: '100%' }}
              >
                Manage Share Links
              </Button>
            </div>
          </>
        )}
          </Modal>

      {/* Share Links Manager Modal */}
      <Modal
        isOpen={isShareLinksModalOpen}
        onClose={() => {
          setIsShareLinksModalOpen(false);
          setSelectedFile(null);
        }}
        title="Share Links"
      >
        {selectedFile && selectedFile.id && selectedFile.name && (
          <ShareLinksManager
            fileId={selectedFile.id}
            fileName={selectedFile.name}
            onClose={() => {
              setIsShareLinksModalOpen(false);
              setSelectedFile(null);
              refetch(); // Refresh files list
            }}
          />
        )}
      </Modal>
    </>
  );
};

