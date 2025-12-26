import { useState } from 'react';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { ShareLinksManager } from '../components/ShareLinksManager';
import type { File } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { useGetFilesQuery, useDeleteFileMutation } from '../store/api/filesApi';
import { useCreateShareLinkMutation } from '../store/api/shareApi';
import { useAuth } from '../hooks/useAuth';

type FilterType = 'all' | 'images' | 'videos' | 'documents';

export const Files = () => {
  const { isAuthenticated } = useAuth();
  const { data: filesResponse, isLoading, refetch } = useGetFilesQuery(undefined, { skip: !isAuthenticated });
  const [deleteFile] = useDeleteFileMutation();
  const [createShareLink] = useCreateShareLinkMutation();
  const files = filesResponse?.files || [];
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState(false);

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'images') return file.type?.startsWith('image/');
    if (filter === 'videos') return file.type?.startsWith('video/');
    if (filter === 'documents') return file.type === 'application/pdf';
    return true;
  });

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
        {selectedFile && (
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

