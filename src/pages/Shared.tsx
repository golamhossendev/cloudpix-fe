import { useState, useMemo, useEffect } from 'react';
import { FileCard } from '../components/FileCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { ShareLinksManager } from '../components/ShareLinksManager';
import type { File } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { useGetFilesQuery, useDeleteFileMutation } from '../store/api/filesApi';
import { useGetShareLinksByFileIdQuery } from '../store/api/shareApi';
import { useAuth } from '../hooks/useAuth';
import './Shared.css';

interface FileWithShareLinks extends File {
  shareLinksCount?: number;
  activeShareLinks?: number;
  isLoadingShareLinks?: boolean;
  hasShareLinks?: boolean;
}

export const Shared = () => {
  const { isAuthenticated, user, token } = useAuth();
  const { data: filesResponse, isLoading: filesLoading, error: filesError, refetch } = useGetFilesQuery(undefined, { skip: !isAuthenticated });
  const [deleteFile] = useDeleteFileMutation();
  
  const allFiles = filesResponse?.files || [];
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [filesWithShareInfo, setFilesWithShareInfo] = useState<FileWithShareLinks[]>([]);
  const [loadingShareLinks, setLoadingShareLinks] = useState(false);

  // Fetch share links for all files to determine which ones are shared
  useEffect(() => {
    if (allFiles.length === 0 || !token) {
      setFilesWithShareInfo([]);
      return;
    }

    const checkShareLinks = async () => {
      setLoadingShareLinks(true);
      try {

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
        const filesWithLinks: FileWithShareLinks[] = [];
        
        // Check share links for each file in parallel
        const shareLinkPromises = allFiles.map(async (file) => {
          try {
            const fileId = file.id || file.fileId;
            if (!fileId) return null;

            const response = await fetch(
              `${API_BASE_URL}/files/${fileId}/share-links`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              const shareLinks = data.shareLinks || [];
              const activeLinks = shareLinks.filter((link: any) => 
                !link.isRevoked && new Date(link.expiryDate) > new Date()
              );
              
              if (shareLinks.length > 0) {
                return {
                  ...file,
                  shareLinksCount: shareLinks.length,
                  activeShareLinks: activeLinks.length,
                  hasShareLinks: true,
                } as FileWithShareLinks;
              }
            }
          } catch (error) {
            // Silently skip files that fail (might not have share links or permission issues)
            console.debug(`No share links for file ${file.id}:`, error);
          }
          return null;
        });

        const results = await Promise.all(shareLinkPromises);
        const validFiles = results.filter((f): f is FileWithShareLinks => f !== null);
        
        setFilesWithShareInfo(validFiles);
      } catch (error) {
        console.error('Error checking share links:', error);
        // Fallback: show empty if we can't check share links
        setFilesWithShareInfo([]);
      } finally {
        setLoadingShareLinks(false);
      }
    };

    checkShareLinks();
  }, [allFiles, token]);

  const filteredFiles = useMemo(() => {
    if (filter === 'all') return filesWithShareInfo;
    if (filter === 'active') {
      return filesWithShareInfo.filter(file => (file.activeShareLinks || 0) > 0);
    }
    if (filter === 'expired') {
      return filesWithShareInfo.filter(file => 
        (file.shareLinksCount || 0) > 0 && (file.activeShareLinks || 0) === 0
      );
    }
    return filesWithShareInfo;
  }, [filesWithShareInfo, filter]);

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
      if (!confirm(`Are you sure you want to delete "${selectedFile.name}"?`)) {
        return;
      }
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

  // Loading state
  if (filesLoading || loadingShareLinks) {
    return (
      <div className="shared-page">
        <div className="shared-header">
          <h2>Shared Files</h2>
          <p className="subtitle">Files you've shared with others</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{filesLoading ? 'Loading files...' : 'Checking share links...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (filesError) {
    return (
      <div className="shared-page">
        <div className="shared-header">
          <h2>Shared Files</h2>
          <p className="subtitle">Files you've shared with others</p>
        </div>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Failed to load shared files</h3>
          <p>{(filesError as any)?.data?.error || 'An error occurred while loading your shared files.'}</p>
          <Button variant="primary" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-header">
        <div>
          <h2>Shared Files</h2>
          <p className="subtitle">Files you've shared with others</p>
        </div>
        <div className="shared-stats">
          <div className="stat-item">
            <span className="stat-value">{filteredFiles.length}</span>
            <span className="stat-label">Shared Files</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Shared
        </button>
        <button
          className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active Links
        </button>
        <button
          className={`filter-tab ${filter === 'expired' ? 'active' : ''}`}
          onClick={() => setFilter('expired')}
        >
          Expired
        </button>
      </div>

      {/* Files Grid */}
      <div className="files-grid">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <h3>No shared files</h3>
            <p>Share a file from your files to see it here</p>
            <Button 
              variant="primary" 
              onClick={() => window.location.href = '/files'}
              style={{ marginTop: '1rem' }}
            >
              Go to My Files
            </Button>
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

      {/* File Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFile?.name || 'File Details'}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setIsShareLinksModalOpen(true);
            }}>
              Manage Share Links
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
                <div style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>Share Links</div>
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
    </div>
  );
};
