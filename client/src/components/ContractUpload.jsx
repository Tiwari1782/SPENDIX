import { useState, useRef } from 'react';
import { RiUploadCloud2Line, RiFilePdfLine, RiCloseLine } from 'react-icons/ri';
import SpendixLoader from './SpendixLoader';

export default function ContractUpload({ tools = [], onUpload, uploading = false }) {
  const [file, setFile] = useState(null);
  const [toolId, setToolId] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf' && f.size <= 10 * 1024 * 1024) setFile(f);
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f?.type === 'application/pdf' && f.size <= 10 * 1024 * 1024) setFile(f);
  };

  const handleSubmit = () => {
    if (!file || !toolId) return;
    onUpload(file, toolId);
  };

  return (
    <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
      <h3 className="font-semibold text-text-primary mb-4">Upload Contract PDF</h3>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragOver ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
      >
        <input ref={fileRef} type="file" accept=".pdf" onChange={handleChange} className="hidden" />
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <RiFilePdfLine size={24} className="text-danger" />
            <span className="font-medium">{file.name}</span>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-text-muted hover:text-danger"><RiCloseLine size={18} /></button>
          </div>
        ) : (
          <>
            <RiUploadCloud2Line size={32} className="text-text-muted mx-auto mb-2" />
            <p className="text-sm text-text-muted">Drag & drop a PDF or <span className="text-accent font-medium">browse</span></p>
            <p className="text-xs text-text-muted mt-1">PDF only, max 10MB</p>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <select value={toolId} onChange={e => setToolId(e.target.value)} className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/30">
          <option value="">Select tool...</option>
          {tools.map(t => <option key={t.id} value={t.id}>{t.tool_name}</option>)}
        </select>
        <button onClick={handleSubmit} disabled={!file || !toolId || uploading} className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
          {uploading ? <SpendixLoader size="sm" /> : 'Upload & Parse'}
        </button>
      </div>
    </div>
  );
}
