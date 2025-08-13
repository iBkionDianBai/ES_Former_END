import React, { useState } from 'react';
import './FileUploadPage.css';
import Header from "./header";
import Footer from "./Footer";
import { uploadDocumentAsync } from '../api/service';
import { useTranslation } from 'react-i18next';
import {Helmet} from 'react-helmet';

const FileUploadComponent = () => {
    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.doc',
        '.docx'
    ];

    const validateFile = (file) => {
        const fileType = file.type;
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        return allowedTypes.includes(fileType) ||
            ['doc', 'docx'].includes(fileExtension);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (validateFile(file)) {
            setSelectedFile(file);
            setError('');
        } else {
            setError(t('onlySupportWordFiles'));
            setSelectedFile(null);
            e.target.value = '';
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setError('');
        } else {
            setError(t('onlySupportWordFiles'));
        }
    };

    // 异步上传处理函数
    const handleAsyncUpload = async () => {
        if (!selectedFile) {
            setError(t('pleaseSelectFile'));
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // 只需file字段

        try {
            await uploadDocumentAsync(formData);
            // 清除选中的文件和提示信息
            setSelectedFile(null);
            setError('');
            document.getElementById('file-input').value = '';
            alert(t('uploadRequestSubmitted'));
        } catch (err) {
            setError(t('uploadError') + (err?.message || JSON.stringify(err)));
            console.error(t('uploadError'), err);
        }
    };

    return (
        <div className="upload-container">
            <h2 className="title">{t('uploadWordDocument')}</h2>

            <div
                className={`drop-area ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    id="file-input"
                    className="file-input"
                />
                <label htmlFor="file-input" className="file-label">
                    <div className="upload-icon">📄</div>
                    <p>{t('dragOrSelectFile')}</p>
                    <span className="file-hint">{t('supportedFormats')}</span>
                </label>
            </div>

            {selectedFile && (
                <div className="file-info">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="success-indicator">✓</span>
                </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
                className="upload-button"
                disabled={!selectedFile}
                onClick={handleAsyncUpload} // 绑定异步上传
            >
                {t('asyncUpload')}
            </button>
        </div>
    );
};

const FileUploadPage = () => {
    const { t } = useTranslation();
    return (
        <div className="page-wrapper">
            <Helmet>
                <title>{t('')}</title>
            </Helmet>
            <Header />
            <FileUploadComponent />
            <Footer />
        </div>
    )
};
export default FileUploadPage;