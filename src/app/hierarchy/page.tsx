'use client';

import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Users,
  Building,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  ChevronDown,
  Layers,
  Crown,
  ShieldCheck,
  UserCheck,
  Info,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';

interface HierarchyNode {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  designation: string;
  role: string;
  status: string;
  responsibilities?: string | null;
  department?: { id: string; name: string; code: string } | null;
  reportingManager?: { name: string; designation: string } | null;
  reportingDirector?: { name: string; designation: string } | null;
  children?: HierarchyNode[];
}

const leadershipNamesByEmployeeId: Record<string, string> = {
  'ML-F01': 'Pooja Ahire',
  'ML-D01': 'Anchal Agawane',
  'ML-D02': 'Rutuja Botre',
  'ML-D03': 'Shubham Jadhav',
};

const leadershipNamesByDesignation: Record<string, string> = {
  'Founder & Managing Director': 'Pooja Ahire',
  'Director of Sales & Partnerships': 'Anchal Agawane',
  'Director of Technology & Product': 'Rutuja Botre',
  'Director of Operations & People': 'Shubham Jadhav',
};

function applyLeadershipDisplayNames(node: HierarchyNode): HierarchyNode {
  return {
    ...node,
    name: leadershipNamesByEmployeeId[node.employeeId] ?? node.name,
    reportingManager: node.reportingManager
      ? {
          ...node.reportingManager,
          name: leadershipNamesByDesignation[node.reportingManager.designation] ?? node.reportingManager.name,
        }
      : node.reportingManager,
    reportingDirector: node.reportingDirector
      ? {
          ...node.reportingDirector,
          name: leadershipNamesByDesignation[node.reportingDirector.designation] ?? node.reportingDirector.name,
        }
      : node.reportingDirector,
    children: node.children?.map(applyLeadershipDisplayNames),
  };
}

export default function HierarchyPage() {
  const [tree, setTree] = useState<HierarchyNode | null>(null);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<HierarchyNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const fetchHierarchy = async () => {
    try {
      const res = await fetch('/api/hierarchy');
      if (res.ok) {
        const data = await res.json();
        setTree(data.tree ? applyLeadershipDisplayNames(data.tree) : null);
        setAllEmployees(data.allEmployees);
        // Expand top levels by default
        if (data.tree) {
          const initialExpanded: Record<string, boolean> = { [data.tree.id]: true };
          data.tree.children?.forEach((child: HierarchyNode) => {
            initialExpanded[child.id] = true;
          });
          setExpandedNodes(initialExpanded);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const allExp: Record<string, boolean> = {};
    const traverse = (node: HierarchyNode) => {
      allExp[node.id] = true;
      node.children?.forEach(traverse);
    };
    if (tree) traverse(tree);
    setExpandedNodes(allExp);
  };

  const collapseAll = () => {
    setExpandedNodes(tree ? { [tree.id]: true } : {});
  };

  const renderNode = (node: HierarchyNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id] ?? false;

    // Filter children if department filter active
    const filteredChildren = node.children?.filter((c) => {
      if (selectedDeptFilter === 'ALL') return true;
      return c.department?.code === selectedDeptFilter || (c.children && c.children.some(gc => gc.department?.code === selectedDeptFilter));
    });

    const roleColor =
      node.role === 'FOUNDER'
        ? 'from-amber-500 to-yellow-600 text-amber-900 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/50'
        : node.role.includes('DIRECTOR')
        ? 'from-indigo-600 to-purple-600 text-indigo-900 border-indigo-200 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-800'
        : node.role === 'MANAGER'
        ? 'from-blue-600 to-cyan-600 text-blue-900 border-blue-200 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-800'
        : 'from-emerald-600 to-teal-600 text-slate-800 border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800';

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* Node Card */}
        <div
          onClick={() => setSelectedEmployee(node)}
          className={`relative z-10 w-64 md:w-72 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:scale-[1.02] ${roleColor}`}
        >
          {/* Top header badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 uppercase tracking-wider">
              {node.role === 'FOUNDER' && <Crown className="w-3 h-3 text-amber-500" />}
              {node.role.includes('DIRECTOR') && <ShieldCheck className="w-3 h-3 text-indigo-500" />}
              {node.role === 'MANAGER' && <UserCheck className="w-3 h-3 text-blue-500" />}
              {node.role.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {node.employeeId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-bold flex items-center justify-center text-sm shadow">
              {node.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {node.name}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate">
                {node.designation}
              </p>
              {node.department && (
                <span className="inline-block mt-0.5 text-[10px] text-blue-600 dark:text-blue-400 font-semibold truncate">
                  {node.department.name}
                </span>
              )}
            </div>
          </div>

          {/* Expand/Collapse Toggle if has children */}
          {hasChildren && (
            <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <span>{filteredChildren?.length || 0} direct reports</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNode(node.id);
                }}
                className="p-1 rounded bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Children connector lines */}
        {hasChildren && isExpanded && filteredChildren && filteredChildren.length > 0 && (
          <div className="flex flex-col items-center">
            {/* Vertical stem down */}
            <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700" />

            {/* Horizontal branch bar */}
            <div className="relative flex justify-center gap-6 pt-4">
              {filteredChildren.length > 1 && (
                <div
                  className="absolute top-0 left-[12%] right-[12%] h-0.5 bg-slate-300 dark:bg-slate-700"
                />
              )}
              {filteredChildren.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  {/* Stem into child */}
                  <div className="w-0.5 h-4 -mt-4 bg-slate-300 dark:bg-slate-700" />
                  {renderNode(child, level + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                MindLyft Company Hierarchy
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive Organizational Chart: Founder → Directors → Managers → Employees
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="SALES_BD">Sales & BD</option>
            <option value="TECH_DEV">Technology & Dev</option>
            <option value="OPS">Operations</option>
            <option value="HR_ADMIN">HR & Admin</option>
            <option value="TRAIN_EDU">Training & Education</option>
          </select>

          <button
            onClick={expandAll}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-2 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="overflow-x-auto p-6 md:p-12 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 min-h-[500px] flex justify-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Loading hierarchy tree...</p>
          </div>
        ) : tree ? (
          <div className="min-w-fit">{renderNode(tree)}</div>
        ) : (
          <p className="text-sm text-slate-400">No hierarchy data available</p>
        )}
      </div>

      {/* Employee Profile Flyout Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-blue-700 text-2xl font-black flex items-center justify-center shadow-lg">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedEmployee.name}</h3>
                  <p className="text-xs text-blue-100 font-medium">{selectedEmployee.designation}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
                      {selectedEmployee.role.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-blue-200">
                      ID: {selectedEmployee.employeeId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {selectedEmployee.department?.name || 'Executive Leadership'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {selectedEmployee.status}
                  </p>
                </div>
              </div>

              {/* Reporting lines */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
                <h4 className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">
                  Reporting Hierarchy
                </h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reporting Manager:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEmployee.reportingManager?.name || 'None (Direct Report / Founder)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reporting Director:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedEmployee.reportingDirector?.name || 'Founder'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{selectedEmployee.phone || '+91 98200 00000'}</span>
                </div>
              </div>

              {/* Responsibilities */}
              {selectedEmployee.responsibilities && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Responsibilities & Scope
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedEmployee.responsibilities}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
