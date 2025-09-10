import { useRef } from 'react';
import Button from './Button';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  loading?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, loading = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-2 border-dashed border-brand-secondary rounded-lg p-8 text-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt"
        className="hidden"
      />
      
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-brand-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      
      <p className="text-gray-600 mb-4">
        Drop your legal document here or click to browse
      </p>
      
      <p className="text-sm text-gray-500 mb-4">
        Supports PDF and TXT files
      </p>
      
      <Button 
        variant="primary" 
        onClick={handleClick}
        loading={loading}
      >
        Choose File
      </Button>
    </div>
  );
};

export default FileUploader;
