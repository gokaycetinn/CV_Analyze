import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { extractText } from '../services/textExtractor';
import './FileUpload.css';

export default function FileUpload({ onTextExtracted, onFileNameChange }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleFile = useCallback(async (file) => {
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];

        const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();

        if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
            setError('Desteklenmeyen dosya formatı. PDF, DOCX veya TXT yükleyin.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            setError('Dosya boyutu 10MB\'ı aşamaz.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const result = await extractText(file);

            if (result.success) {
                setUploadedFile({
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    type: ext.replace('.', '').toUpperCase()
                });
                onTextExtracted(result.text);
                if (onFileNameChange) onFileNameChange(file.name);
            } else {
                setError(result.error || 'Dosya okunamadı.');
            }
        } catch (err) {
            setError('Dosya işlenirken bir hata oluştu.');
        } finally {
            setIsProcessing(false);
        }
    }, [onTextExtracted, onFileNameChange]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleInputChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const removeFile = () => {
        setUploadedFile(null);
        onTextExtracted('');
        if (onFileNameChange) onFileNameChange('');
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div className="file-upload-wrapper">
            {!uploadedFile ? (
                <div
                    className={`file-upload-zone file-dropzone focus-ring ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && inputRef.current?.click()}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={handleInputChange}
                        className="file-input-hidden"
                    />

                    {isProcessing ? (
                        <div className="upload-processing">
                            <div className="upload-spinner" />
                            <p>Dosya işleniyor...</p>
                        </div>
                    ) : (
                        <>
                            <div className="upload-icon">
                                <Upload size={32} />
                            </div>
                            <h4>CV Dosyanızı Sürükleyin</h4>
                            <p>veya dosya seçmek için tıklayın</p>
                            <div className="upload-formats">
                                <span className="format-badge">PDF</span>
                                <span className="format-badge">DOCX</span>
                                <span className="format-badge">TXT</span>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="file-uploaded">
                    <div className="file-info">
                        <div className="file-icon">
                            <FileText size={24} />
                        </div>
                        <div className="file-details">
                            <span className="file-name">{uploadedFile.name}</span>
                            <span className="file-meta">
                                {uploadedFile.type} • {uploadedFile.size}
                            </span>
                        </div>
                        <CheckCircle size={20} className="file-success-icon" />
                    </div>
                    <button className="file-remove" onClick={removeFile}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {error && (
                <div className="upload-error">
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
