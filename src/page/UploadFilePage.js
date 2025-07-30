import React, { useState } from 'react';
import './UploadFilePage.css';
import Header from "./header";
import Footer from "./Footer";
import { uploadDocumentAsync } from '../service';

const FileUploadComponent = () => {
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
            setError('仅支持上传Word文档 (.doc, .docx)');
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
            setError('仅支持上传Word文档 (.doc, .docx)');
        }
    };

    // 异步上传处理函数
    const handleAsyncUpload = async () => {
        if (!selectedFile) {
            setError('请选择文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile); // 只需file字段

        try {
            await uploadDocumentAsync(formData);
            alert('上传请求已提交，后台正在处理');
        } catch (err) {
            setError('上传出错: ' + (err?.message || JSON.stringify(err)));
            console.error('上传出错', err);
        }
    };

    return (
        <div className="upload-container">
            <h2 className="title">上传Word文档</h2>

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
                    <p>拖拽文件到这里 或 点击选择文件</p>
                    <span className="file-hint">支持格式：.doc, .docx</span>
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
                异步上传
            </button>
        </div>
    );
};

const FileUploadPage = () => {
    return (
        <div className="page-wrapper">
            <Header />
            <FileUploadComponent />
            <Footer />
        </div>
    )
};
export default FileUploadPage;