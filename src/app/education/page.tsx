'use client';

import React, { useState } from 'react';
import { GraduationCap, BookOpen, Users, Upload, Check, X, AlertCircle, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useApp } from '@/context/AppContext';
import { CourseCatalogItem } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';

export default function EducationPage() {
  const {
    courses,
    batches,
    students,
    isFaculty,
    currentEmployee,
    updateStudentAttendance,
    bulkImportStudents,
    addStudent,
  } = useApp();

  const [tab, setTab] = useState<'COURSES' | 'BATCHES' | 'STUDENTS' | 'IMPORT'>('COURSES');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', phone: '', college: '', batchId: batches[0]?.id || '' });

  // Bulk Excel Import UI state
  const [previewRows, setPreviewRows] = useState<Array<{ name: string; email: string; phone: string; college: string; batchId: string; valid: boolean; error?: string }>>([]);
  const [importDone, setImportDone] = useState(false);

  // Faculty sees assigned batches only
  const visibleBatches = isFaculty
    ? batches.filter((b) => b.assignedFacultyId === currentEmployee.id)
    : batches;

  const visibleStudents = students.filter((s) => {
    const allowedBatch = !isFaculty || visibleBatches.some((b) => b.id === s.batchId);
    const matchCourse = selectedCourse === 'ALL' || s.course === selectedCourse;
    return allowedBatch && matchCourse;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
      const parsed = rows.map((r) => {
        const valid = Boolean(r.Name && r.Email && r.Phone);
        return {
          name: r.Name || '',
          email: r.Email || '',
          phone: String(r.Phone || ''),
          college: r.College || 'Partner Institute',
          batchId: r.BatchId || batches[0]?.id || 'BATCH-AI-2026-A',
          valid,
          error: valid ? undefined : 'Missing Name, Email, or Phone column',
        };
      });
      setPreviewRows(parsed);
      setImportDone(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const loadSamplePreview = () => {
    setPreviewRows([
      { name: 'Rohan Deshpande', email: 'rohan.d@coep.ac.in', phone: '+91 98220 11221', college: 'COEP Pune', batchId: 'BATCH-AI-2026-A', valid: true },
      { name: 'Snehal Joshi', email: 'snehal.j@mitwpu.edu', phone: '+91 98220 33441', college: 'MIT-WPU Pune', batchId: 'BATCH-CDAC-2026-B', valid: true },
      { name: 'Invalid Row Demo', email: '', phone: '+91 98000 00000', college: 'VJTI Mumbai', batchId: 'BATCH-AI-2026-A', valid: false, error: 'Missing required Email address' },
    ]);
    setImportDone(false);
  };

  const confirmBulkImport = () => {
    const validRows = previewRows.filter((r) => r.valid);
    bulkImportStudents(
      validRows.map((r) => ({
        name: r.name,
        email: r.email,
        phone: r.phone,
        college: r.college,
        course: 'MindlyftAI',
        batchId: r.batchId,
        attendancePct: 100,
        progressPct: 10,
        status: 'Active',
      }))
    );
    setImportDone(true);
    setPreviewRows([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses, Batches & Student Management"
        subtitle="Configurable catalog (Capsule, CDAC, C3RIHub, MindlyftAI), batch schedules, live attendance & bulk Excel import."
        icon={GraduationCap}
        badge={isFaculty ? 'Faculty: Assigned Batches Only' : `${courses.length} Courses • ${batches.length} Batches`}
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(['COURSES', 'BATCHES', 'STUDENTS', 'IMPORT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg font-bold ${
                  tab === t ? 'bg-white dark:bg-slate-900 text-purple-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                {t === 'IMPORT' ? 'Bulk Excel Import' : t.charAt(0) + t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        }
      />

      {tab === 'COURSES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((c: CourseCatalogItem) => (
            <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] font-bold text-purple-600">{c.id}</span>
                  <StatusBadge label={c.status} variant="success" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">{c.name}</h3>
                <p className="text-[11px] text-purple-600 font-semibold">{c.category} • {c.duration}</p>
                <p className="text-xs text-slate-500 mt-2">{c.description}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between">
                <span>{c.totalBatches} Batches</span>
                <b>{c.totalStudents} Students</b>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'BATCHES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleBatches.map((b) => (
            <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] font-bold text-purple-600">{b.id} • {b.course}</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{b.batchName}</h3>
                </div>
                <StatusBadge label={b.batchStatus} variant={b.batchStatus === 'Ongoing' ? 'success' : 'info'} />
              </div>
              <p className="text-slate-500">Faculty: <b>{b.assignedFacultyName}</b> • {b.schedule}</p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b>{b.studentCount}</b><span className="block text-[10px] text-slate-400">Students</span></div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b>{b.completedSessions}/{b.totalSessions}</b><span className="block text-[10px] text-slate-400">Sessions</span></div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"><b className="text-emerald-600">{b.attendanceAvgPct}%</b><span className="block text-[10px] text-slate-400">Avg Att.</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <option value="ALL">All Courses</option>
              <option value="Capsule">Capsule</option>
              <option value="CDAC">CDAC</option>
              <option value="C3RIHub">C3RIHub</option>
              <option value="MindlyftAI">MindlyftAI</option>
            </select>
            <button onClick={() => setShowAddStudent(true)} className="px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course & Batch</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {visibleStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{s.name}</p>
                      <p className="text-[11px] text-slate-500">{s.college} • {s.email}</p>
                    </td>
                    <td className="py-3 px-4">{s.course} • <span className="font-mono text-[10px]">{s.batchId}</span></td>
                    <td className="py-3 px-4 font-bold">{s.attendancePct}%</td>
                    <td className="py-3 px-4 font-bold text-purple-600">{s.progressPct}%</td>
                    <td className="py-3 px-4"><StatusBadge label={s.status} variant={s.status === 'At Risk' ? 'danger' : 'success'} /></td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => updateStudentAttendance(s.id, true)} className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 mr-1"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateStudentAttendance(s.id, false)} className="p-1.5 rounded-lg bg-rose-100 text-rose-700"><X className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'IMPORT' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bulk Student Excel Import Prototype</h3>
              <p className="text-xs text-slate-500">Select an `.xlsx` / `.csv` file (columns: Name, Email, Phone, College, BatchId) or load a sample preview.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadSamplePreview} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                Load Sample Preview
              </button>
              <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5">
                <Upload className="w-4 h-4" /> Choose Excel File
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {importDone && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
              ✓ Valid student records imported into local state!
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500">
                    <tr>
                      <th className="py-2 px-3">Validation</th>
                      <th className="py-2 px-3">Name</th>
                      <th className="py-2 px-3">Email</th>
                      <th className="py-2 px-3">College</th>
                      <th className="py-2 px-3">Batch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {previewRows.map((r, i) => (
                      <tr key={i} className={!r.valid ? 'bg-rose-50/60 dark:bg-rose-950/20' : ''}>
                        <td className="py-2 px-3">
                          {r.valid ? (
                            <StatusBadge label="Valid" variant="success" />
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {r.error}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-bold">{r.name}</td>
                        <td className="py-2 px-3">{r.email || '—'}</td>
                        <td className="py-2 px-3">{r.college}</td>
                        <td className="py-2 px-3 font-mono">{r.batchId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end">
                <button onClick={confirmBulkImport} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                  Import {previewRows.filter((r) => r.valid).length} Valid Records
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Enroll Student</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addStudent({
                  ...studentForm,
                  course: 'MindlyftAI',
                  attendancePct: 100,
                  progressPct: 0,
                  status: 'Active',
                });
                setShowAddStudent(false);
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <input required placeholder="Full Name" value={studentForm.name} onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required type="email" placeholder="Email" value={studentForm.email} onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required placeholder="Phone" value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <input required placeholder="College" value={studentForm.college} onChange={(e) => setStudentForm({ ...studentForm, college: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" />
              <select value={studentForm.batchId} onChange={(e) => setStudentForm({ ...studentForm, batchId: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                {batches.map((b) => <option key={b.id} value={b.id}>{b.batchName}</option>)}
              </select>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStudent(false)} className="px-3 py-1.5 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold">Enroll</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
