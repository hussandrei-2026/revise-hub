import React, { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../services/firestore.service';
import { storageService } from '../services/storage.service';

interface PastPaper {
  id: string;
  subject: string;
  year: number;
  examBoard: string;
  fileSize: number;
  uploadedAt: Date;
  downloadUrl: string;
  fileName: string;
}

interface PastPapersTabProps {
  userId: string;
}

export const PastPapersTab: React.FC<PastPapersTabProps> = ({ userId }) => {
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    subject: 'maths',
    year: new Date().getFullYear(),
    examBoard: 'edexcel',
    file: null as File | null
  });

  // Load past papers - wrapped in useCallback to avoid dependency issues
  const loadPastPapers = useCallback(async () => {
    setLoading(true);
    try {
      const papers = await firestoreService.getPastPapers(userId);
      setPapers(papers);
      console.log('Loaded past papers:', papers);
    } catch (err: any) {
      setError('Failed to load past papers: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load past papers on mount
  useEffect(() => {
    loadPastPapers();
  }, [loadPastPapers]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file is PDF
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file');
        return;
      }
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setFormData({ ...formData, file });
      setError('');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Uploading past paper:', formData);
      
      const result = await storageService.uploadPastPaper(
        userId,
        formData.subject,
        formData.year,
        formData.examBoard,
        formData.file
      );

      console.log('Upload successful:', result);
      setSuccess('✅ Past paper uploaded successfully!');
      
      // Reset form
      setFormData({
        subject: 'maths',
        year: new Date().getFullYear(),
        examBoard: 'edexcel',
        file: null
      });
      setShowUploadForm(false);
      
      // Reload papers
      await loadPastPapers();
    } catch (err: any) {
      setError('Upload failed: ' + err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  // Filter papers
  const filteredPapers = papers.filter(paper => {
    const subjectMatch = selectedSubject === 'all' || paper.subject === selectedSubject;
    const yearMatch = selectedYear === 'all' || paper.year.toString() === selectedYear;
    return subjectMatch && yearMatch;
  });

  return (
    <div className="past-papers-content">
      <h2>📄 Past Papers</h2>

      {error && (
        <div className="alert alert-error">
          {error}
          <button 
            className="alert-close"
            onClick={() => setError('')}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button 
            className="alert-close"
            onClick={() => setSuccess('')}
          >
            ✕
          </button>
        </div>
      )}

      {/* Upload Section */}
      <div className="upload-section">
        <button
          className="create-btn"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          📤 {showUploadForm ? 'Cancel Upload' : 'Upload Past Paper'}
        </button>

        {showUploadForm && (
          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label>Subject *</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option value="maths">Maths</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="biology">Biology</option>
                <option value="english-language">English Language</option>
                <option value="english-literature">English Literature</option>
                <option value="history">History</option>
                <option value="geography">Geography</option>
              </select>
            </div>

            <div className="form-group">
              <label>Exam Year *</label>
              <input
                type="number"
                min="2015"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Exam Board *</label>
              <select
                value={formData.examBoard}
                onChange={(e) => setFormData({ ...formData, examBoard: e.target.value })}
              >
                <option value="edexcel">Edexcel (Pearson)</option>
                <option value="aqa">AQA</option>
                <option value="ocr">OCR</option>
                <option value="wjec">WJEC</option>
                <option value="ccea">CCEA</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>PDF File * (Max 50MB)</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
              {formData.file && (
                <div className="file-info">
                  ✓ {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !formData.file}
              className="submit-btn"
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload Past Paper'}
            </button>
          </form>
        )}
      </div>

      {/* Filter Section */}
      {papers.length > 0 && (
        <div className="filter-section">
          <div className="filter-group">
            <label>Subject:</label>
            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              <option value="maths">Maths</option>
              <option value="physics">Physics</option>
              <option value="chemistry">Chemistry</option>
              <option value="biology">Biology</option>
              <option value="english-language">English Language</option>
              <option value="english-literature">English Literature</option>
              <option value="history">History</option>
              <option value="geography">Geography</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>
      )}

      {/* Papers List */}
      <div className="papers-list">
        {loading ? (
          <div className="empty-state">Loading past papers...</div>
        ) : filteredPapers.length > 0 ? (
          <div className="papers-grid">
            {filteredPapers.map((paper) => (
              <div key={paper.id} className="paper-card">
                <div className="paper-header">
                  <h3>{paper.subject.replace('-', ' ').toUpperCase()}</h3>
                  <span className="paper-year">{paper.year}</span>
                </div>

                <div className="paper-details">
                  <div className="detail">
                    <span className="label">Exam Board:</span>
                    <span className="value">{paper.examBoard.toUpperCase()}</span>
                  </div>
                  <div className="detail">
                    <span className="label">File Size:</span>
                    <span className="value">{(paper.fileSize / 1024 / 1024).toFixed(2)}MB</span>
                  </div>
                  <div className="detail">
                    <span className="label">Uploaded:</span>
                    <span className="value">
                      {new Date(paper.uploadedAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                <div className="paper-actions">
                  <a
                    href={paper.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-btn"
                  >
                    📥 Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {papers.length === 0 ? (
              <>
                <p>📄 No past papers yet</p>
                <p>Upload your first past paper to get started!</p>
              </>
            ) : (
              <>
                <p>No papers match your filters</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="info-box">
        <h4>💡 Tips for Using Past Papers</h4>
        <ul>
          <li>Practice with papers from your exam board</li>
          <li>Try timed practice to simulate exam conditions</li>
          <li>Review mark schemes after attempting</li>
          <li>Focus on topics you find difficult</li>
          <li>Aim to complete at least 5 papers before your exam</li>
        </ul>
      </div>
    </div>
  );
};
