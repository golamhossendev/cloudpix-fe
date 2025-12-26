import { useState } from 'react';
import { UploadArea } from '../components/UploadArea';
import { FileUploadList } from '../components/FileUploadList';
import { ShareSettings } from '../components/ShareSettings';
import { Button } from '../components/Button';
import { UploadFileItem, ShareSettings as ShareSettingsType } from '../types';
import { isValidFileSize, isValidFileType } from '../utils/fileUtils';

export const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [shareSettings, setShareSettings] = useState<ShareSettingsType>({
    expiration: '7d',
    privacy: 'public',
    maxViews: 100,
  });
  const [isUploading, setIsUploading] = useState(false);

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

  return (
    <div className="upload-section">
      <div className="upload-header">
        <h2>Upload Files</h2>
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
  );
};

