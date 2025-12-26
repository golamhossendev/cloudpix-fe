import { useRef, useState, DragEvent } from 'react';
import { Button } from './Button';

interface UploadAreaProps {
  onFilesSelected: (files: FileList) => void;
}

export const UploadArea = ({ onFilesSelected }: UploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="upload-area"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        borderColor: isDragging ? 'var(--primary)' : undefined,
        background: isDragging ? 'rgba(0, 102, 204, 0.05)' : undefined,
      }}
    >
      <div className="upload-icon">📁</div>
      <h3>Drop files here</h3>
      <p className="upload-hint">Supports images, videos, and documents</p>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Button variant="primary" style={{ marginTop: '1rem' }}>
        Browse Files
      </Button>
    </div>
  );
};

