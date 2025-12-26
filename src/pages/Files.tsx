import { useState } from 'react';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { File } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { useGetFilesQuery, useDeleteFileMutation } from '../store/api/filesApi';
import { useAuth } from '../hooks/useAuth';

type FilterType = 'all' | 'images' | 'videos' | 'documents';

export const Files = () => {
  const { isAuthenticated } = useAuth();
  const { data: filesResponse, isLoading, refetch } = useGetFilesQuery(undefined, { skip: !isAuthenticated });
  const [deleteFile] = useDeleteFileMutation();
  const files = filesResponse?.files || [];
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'images') return file.type.startsWith('image/');
    if (filter === 'videos') return file.type.startsWith('video/');
    if (filter === 'documents') return file.type === 'application/pdf';
    return true;
  });

  const handleViewFile = (file: File) => {
    setSelectedFile(file);
    setIsModalOpen(true);
  };

  const handleShareFile = (file: File) => {
    // Share functionality will be handled by share API
    (window as any).showAlert?.('Share functionality coming soon', 'info');
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
    if (selectedFile) {
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

  if (isLoading) {
    return <div>Loading files...</div>;
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>My Files</h2>
        <div className="tabs">
          <button
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Files
          </button>
          <button
            className={`tab ${filter === 'images' ? 'active' : ''}`}
            onClick={() => setFilter('images')}
          >
            Images
          </button>
          <button
            className={`tab ${filter === 'videos' ? 'active' : ''}`}
            onClick={() => setFilter('videos')}
          >
            Videos
          </button>
          <button
            className={`tab ${filter === 'documents' ? 'active' : ''}`}
            onClick={() => setFilter('documents')}
          >
            Documents
          </button>
        </div>
      </div>

      <div className="files-grid">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No files found</h3>
            <p>Try uploading some files</p>
          </div>
        ) : (
          filteredFiles.map(file => (
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

