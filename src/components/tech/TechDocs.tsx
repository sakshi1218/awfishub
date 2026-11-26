'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { FileText, FolderOpen, Plus, Search } from 'lucide-react';
import TechModal from './TechModal';
import { techInputClass, techPanelClass, techPrimaryButtonClass, techSecondaryButtonClass } from './styles';

type DocCategory = 'API Docs' | 'Architecture' | 'Setup Guide' | 'User Manual';

interface TechDocument {
  title: string;
  category: DocCategory;
  updated: string;
  summary: string;
}

const initialDocuments: TechDocument[] = [
  { title: 'API Integration Reference', category: 'API Docs', updated: '2026-11-18', summary: 'Demo reference for service endpoints, request formats, and response handling.' },
  { title: 'System Architecture Overview', category: 'Architecture', updated: '2026-11-16', summary: 'Demo overview of application areas and how they work together.' },
  { title: 'Backend Setup Guide', category: 'Setup Guide', updated: '2026-11-14', summary: 'Sample steps for preparing a local backend development environment.' },
  { title: 'Frontend Development Guide', category: 'Setup Guide', updated: '2026-11-12', summary: 'Sample instructions for running and updating the web interface.' },
  { title: 'Database Structure Documentation', category: 'Architecture', updated: '2026-11-10', summary: 'Demo guide to the data areas used by the application.' },
  { title: 'Deployment & Environment Setup', category: 'User Manual', updated: '2026-11-08', summary: 'Sample checklist for preparing an application environment for deployment.' },
];

export default function TechDocs() {
  const [documents, setDocuments] = useState<TechDocument[]>(initialDocuments);
  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<TechDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return documents;
    return documents.filter((document) =>
      `${document.title} ${document.category}`.toLowerCase().includes(query)
    );
  }, [documents, search]);

  const addDemoDocument = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('document');
    const title = file instanceof File && file.name ? file.name : String(formData.get('title') ?? '').trim();
    if (!title) return;

    const category = String(formData.get('category') ?? 'Setup Guide') as DocCategory;
    const document: TechDocument = {
      title,
      category,
      updated: new Date().toISOString().slice(0, 10),
      summary: 'Temporary demo entry. No file has been uploaded or stored.',
    };
    setDocuments((current) => [document, ...current]);
    setUploadOpen(false);
    setNotice('Demo document added in this session only.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">DEMO DATA</p>
          <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">Technical Documentation</h2>
        </div>
        <button type="button" onClick={() => setUploadOpen(true)} className={techPrimaryButtonClass}>
          <Plus className="h-4 w-4" /> Upload Doc
        </button>
      </div>

      <label className="relative block max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${techInputClass} pl-9`}
          placeholder="Search documents or categories"
          aria-label="Search documents or categories"
        />
      </label>

      {notice && <p role="status" className="text-xs text-emerald-700 dark:text-emerald-300">{notice}</p>}

      {filteredDocuments.length > 0 ? (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <article key={`${document.title}-${document.updated}`} className={`${techPanelClass} flex h-full flex-col p-4 sm:p-5`}>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-semibold leading-5 text-slate-900 dark:text-white">{document.title}</h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{document.category}</p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-600 dark:text-slate-300">{document.summary}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Updated {document.updated}</span>
                <button type="button" onClick={() => setSelectedDocument(document)} className={techSecondaryButtonClass}>
                  <FolderOpen className="h-3.5 w-3.5" /> Open
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={`${techPanelClass} p-6 text-sm text-slate-600 dark:text-slate-300`}>
          No documents match “{search}”.
        </div>
      )}

      {selectedDocument && (
        <TechModal title={selectedDocument.title} onClose={() => setSelectedDocument(null)}>
          <div className="space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Category:</span> {selectedDocument.category}</p>
            <p><span className="font-semibold text-slate-800 dark:text-slate-100">Last updated:</span> {selectedDocument.updated}</p>
            <p>{selectedDocument.summary}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Demo preview content.</p>
          </div>
        </TechModal>
      )}

      {uploadOpen && (
        <TechModal title="Add demo document" onClose={() => setUploadOpen(false)}>
          <form onSubmit={addDemoDocument} className="space-y-4">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Demo only. The selected file is not uploaded or stored.</p>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Document title
              <input name="title" className={techInputClass} placeholder="Enter a title or select a file" />
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Category
              <select name="category" className={techInputClass}>
                <option>API Docs</option><option>Architecture</option><option>Setup Guide</option><option>User Manual</option>
              </select>
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              Choose a file (demo only)
              <input name="document" type="file" className={`${techInputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-200`} />
            </label>
            <div className="flex justify-end">
              <button type="submit" className={techPrimaryButtonClass}><Plus className="h-4 w-4" /> Add demo entry</button>
            </div>
          </form>
        </TechModal>
      )}
    </div>
  );
}
