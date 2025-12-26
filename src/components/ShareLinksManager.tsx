import { useState } from 'react';
import { Button } from './Button';
import { useGetShareLinksByFileIdQuery, useCreateShareLinkMutation, useRevokeShareLinkMutation, ShareLink } from '../store/api/shareApi';
import { format } from 'date-fns';
import './ShareLinksManager.css';

interface ShareLinksManagerProps {
  fileId: string;
  fileName: string;
  onClose?: () => void;
}

export const ShareLinksManager = ({ fileId, fileName, onClose }: ShareLinksManagerProps) => {
  const [expirationDays, setExpirationDays] = useState<number>(7);
  const [isCreating, setIsCreating] = useState(false);
  
  const { data, isLoading, refetch } = useGetShareLinksByFileIdQuery(fileId);
  const [createShareLink] = useCreateShareLinkMutation();
  const [revokeShareLink] = useRevokeShareLinkMutation();

  const shareLinks = data?.shareLinks || [];

  const handleCreateLink = async () => {
    setIsCreating(true);
    try {
      const result = await createShareLink({ fileId, expirationDays }).unwrap();
      (window as any).showAlert?.(`Share link created successfully!`, 'success');
      refetch();
    } catch (error: any) {
      (window as any).showAlert?.(
        `Failed to create share link: ${error?.data?.error || error?.message || 'Unknown error'}`,
        'error'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to revoke this share link?')) {
      return;
    }
    
    try {
      await revokeShareLink(linkId).unwrap();
      (window as any).showAlert?.('Share link revoked successfully', 'success');
      refetch();
    } catch (error: any) {
      (window as any).showAlert?.(
        `Failed to revoke share link: ${error?.data?.error || error?.message || 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleCopyLink = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl);
    (window as any).showAlert?.('Link copied to clipboard!', 'success');
  };

  const isLinkExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const isLinkRevoked = (link: ShareLink) => {
    return link.isRevoked;
  };

  const getLinkStatus = (link: ShareLink) => {
    if (isLinkRevoked(link)) return { text: 'Revoked', color: 'var(--danger)' };
    if (isLinkExpired(link.expiryDate)) return { text: 'Expired', color: 'var(--warning)' };
    return { text: 'Active', color: 'var(--success)' };
  };

  return (
    <div className="share-links-manager">
      <div className="share-links-header">
        <h3>Manage Share Links</h3>
        <p className="file-name">{fileName}</p>
      </div>

      {/* Create New Share Link */}
      <div className="create-share-link-section">
        <h4>Create New Share Link</h4>
        <div className="create-link-form">
          <div className="form-group">
            <label htmlFor="expirationDays">Expiration (days)</label>
            <select
              id="expirationDays"
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number(e.target.value))}
            >
              <option value={1}>1 day</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </div>
          <Button
            variant="primary"
            onClick={handleCreateLink}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Share Link'}
          </Button>
        </div>
      </div>

      {/* Existing Share Links */}
      <div className="share-links-list">
        <h4>Existing Share Links ({shareLinks.length})</h4>
        
        {isLoading ? (
          <div className="loading-state">Loading share links...</div>
        ) : shareLinks.length === 0 ? (
          <div className="empty-state">
            <p>No share links created yet. Create one above to get started.</p>
          </div>
        ) : (
          <div className="share-links-grid">
            {shareLinks.map((link) => {
              const status = getLinkStatus(link);
              const isExpired = isLinkExpired(link.expiryDate);
              const isRevoked = isLinkRevoked(link);
              
              return (
                <div key={link.linkId} className="share-link-card">
                  <div className="share-link-header">
                    <div className="link-status">
                      <span
                        className="status-badge"
                        style={{ backgroundColor: status.color }}
                      >
                        {status.text}
                      </span>
                    </div>
                    {!isRevoked && !isExpired && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRevokeLink(link.linkId)}
                      >
                        Revoke
                      </Button>
                    )}
                  </div>

                  <div className="share-link-url">
                    <input
                      type="text"
                      value={link.shareUrl || ''}
                      readOnly
                      className="url-input"
                    />
                    {!isRevoked && !isExpired && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => link.shareUrl && handleCopyLink(link.shareUrl)}
                      >
                        Copy
                      </Button>
                    )}
                  </div>

                  <div className="share-link-details">
                    <div className="detail-item">
                      <span className="detail-label">Created:</span>
                      <span className="detail-value">
                        {format(new Date(link.createdDate), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Expires:</span>
                      <span className="detail-value">
                        {format(new Date(link.expiryDate), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Access Count:</span>
                      <span className="detail-value">{link.accessCount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {onClose && (
        <div className="share-links-footer">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
};

