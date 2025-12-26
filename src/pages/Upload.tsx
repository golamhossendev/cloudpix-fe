import { useState } from 'react';
import { UploadArea } from '../components/UploadArea';
import { FileUploadList } from '../components/FileUploadList';
import { Button } from '../components/Button';
import type { UploadFileItem } from '../types';
import { isValidFileSize, isValidFileType } from '../utils/fileUtils';
import { useUploadFileMutation } from '../store/api/filesApi';

export const Upload = () => {
  const [selectedFiles, setSelectedFiles] = useState<UploadFileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFile] = useUploadFileMutation();

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

        // Update progress
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
        } catch (error: any) {
          (window as any).showAlert?.(
            `Failed to upload ${fileObj.file.name}: ${error?.data?.error || error?.message || 'Unknown error'}`,
            'error'
          );
        }
      }

      (window as any).showAlert?.('Files uploaded successfully!', 'success');
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

  return (
    <div className="upload-section">
      <div className="upload-header">
        <h2>Upload Files</h2>
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
  );
};

