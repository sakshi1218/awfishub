'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Shield,
  FileCheck2,
  Lock,
  Building,
  Upload,
} from 'lucide-react';

export default function DocumentsVaultPage() {
  const [search, setSearch] = useState('');

  const documents = [
    {
      id: 'DOC-01',
      title: 'MindLyft Institutional MoU Master Template 2026',
      category: 'Legal Agreements',
      format: 'PDF',
      size: '2.4 MB',
      updatedAt: '2026-11-20',
      uploadedBy: 'Rajesh Varma (Sales Director)',
    },
    {
      id: 'DOC-02',
      title: 'Faculty Development Program (FDP) 5-Day Curriculum Syllabus',
      category: 'Curriculum & Training',
      format: 'PDF',
      size: '4.8 MB',
      updatedAt: '2026-11-18',
      uploadedBy: 'Tanmay Joshi (Lead Trainer)',
    },
    {
      id: 'DOC-03',
      title: 'Campus AI/ML Bootcamp Lab Hardware & Cloud Prerequisite Specification',
      category: 'Operations',
      format: 'DOCX',
      size: '1.2 MB',
      updatedAt: '2026-11-15',
      uploadedBy: 'Devanshi Shah (Operations)',
    },
    {
      id: 'DOC-04',
      title: 'Company Policy, Leave Regulations & Code of Conduct v2.4',
      category: 'HR & Policy',
      format: 'PDF',
      size: '3.1 MB',
      updatedAt: '2026-10-01',
      uploadedBy: 'Sneha Kapoor (HR Manager)',
    },
    {
      id: 'DOC-05',
      title: 'VJTI Mumbai Signed MoU & Commercial SOW Annexure A-E',
      category: 'College Agreements',
      format: 'PDF',
      size: '5.6 MB',
      updatedAt: '2026-11-21',
      uploadedBy: 'Amit Patel (Senior Sales Exec)',
    },
  ];

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Documents Vault & Institutional Repository
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Secure digital storage for company policies, signed MoUs, curriculums, and templates
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => alert('Document upload modal: Select file and assign category.')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-80">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by title, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none"
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  {doc.category}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {doc.format}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                {doc.title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-2">
                Uploaded by {doc.uploadedBy} • {doc.size}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-400">
                Updated: {new Date(doc.updatedAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
