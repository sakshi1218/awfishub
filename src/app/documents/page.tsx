'use client';

import React, { useState } from 'react';
import { FileText, Search, Upload, Eye, X, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { DocumentRecord } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function DocumentsPage() {
  const { documents, addDocument, currentEmployee, isChairperson } = useApp();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCat, setUploadCat] = useState<DocumentRecord['category']>('Course documents');

  const visibleDocs = documents.filter((d) => {
    if (d.classification === 'Chairperson Confidential' && !isChairperson) return false;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.owner.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'ALL' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      name: uploadName || 'New_Mock_Document.pdf',
      category: uploadCat,
      owner: currentEmployee.name,
      relatedModule: 'Document Center',
      uploadDate: '2026-11-25',
      classification: 'Department Only',
      version: 'v1.0',
      fileType: 'PDF',
    });
    setShowUpload(false);
    setUploadName('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Centralized Document Management"
        subtitle="Mock document repository with version history, access classifications, and preview drawer."
        icon={FileText}
        actions={
          <button onClick={() => setShowUpload(true)} className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5">
            <Upload className="w-4 h-4" /> Upload Mock File
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <option value="ALL">All Categories</option>
          {(['Employee documents', 'College agreements', 'MoUs', 'Event documents', 'Campaign documents', 'GST files', 'Expense receipts', 'Asset records', 'Course documents'] as const).map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
            <tr>
              <th className="py-3 px-4">Document Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Classification</th>
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4 text-right">Preview</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleDocs.map((doc) => (
              <tr key={doc.id}>
                <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{doc.name}</td>
                <td className="py-3 px-4">{doc.category}</td>
                <td className="py-3 px-4 text-slate-500">{doc.owner} • {doc.uploadDate}</td>
                <td className="py-3 px-4">
                  <StatusBadge label={doc.classification} variant={doc.classification.includes('Confidential') || doc.classification === 'Private' ? 'warning' : 'info'} />
                </td>
                <td className="py-3 px-4 font-mono">{doc.version}</td>
                <td className="py-3 px-4 text-right">
                  <button onClick={() => setPreviewDoc(doc)} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-3 text-xs relative">
            <button onClick={() => setPreviewDoc(null)} className="absolute top-4 right-4 text-slate-400"><X className="w-5 h-5" /></button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{previewDoc.name}</h3>
            <p className="text-slate-500">Module: {previewDoc.relatedModule} • Version: {previewDoc.version}</p>
            <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-center space-y-1">
              <Lock className="w-6 h-6 mx-auto text-blue-600" />
              <p className="font-bold">Local Mock Document Preview</p>
              <p className="text-[11px] text-slate-500">No cloud storage connected. Classification: {previewDoc.classification}</p>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Mock Document Reference</h3>
            <form onSubmit={handleUpload} className="mt-4 space-y-3 text-xs">
              <input required placeholder="File Name (e.g. MoU_Draft.pdf)" value={uploadName} onChange={(e) => setUploadName(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <select value={uploadCat} onChange={(e) => setUploadCat(e.target.value as DocumentRecord['category'])} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <option value="Course documents">Course documents</option>
                <option value="MoUs">MoUs</option>
                <option value="Event documents">Event documents</option>
                <option value="Campaign documents">Campaign documents</option>
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowUpload(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Save Reference</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
