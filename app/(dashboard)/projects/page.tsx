'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Project } from '@/lib/types';
import {
  FolderGit2,
  Plus,
  Edit2,
  Archive,
  CheckCircle,
  AlertTriangle,
  X,
  FileText,
} from 'lucide-react';
import { ProjectsSkeleton } from '@/components/ui/Skeleton';
import { Pagination } from '@/components/ui/Pagination';

export default function ProjectsManagementPage() {
  const { isManager } = useAuth();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    name: '',
    code: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [localProjects, setLocalProjects] = useState<Project[] | null>(null);
  const [projectToArchive, setProjectToArchive] = useState<Project | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data: projectsData, isLoading, error: swrError, mutate: refetchProjects } = useSWR<Project[]>(
    'projects-list',
    () => ApiClient.getProjects(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000,
      keepPreviousData: true,
    }
  );

  const projects = localProjects || projectsData || [];
  const paginatedProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const [fieldErrors, setFieldErrors] = useState<{ name?: string; code?: string }>({});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errs: { name?: string; code?: string } = {};
    const trimmedName = currentProject.name?.trim() || '';
    const trimmedCode = currentProject.code?.trim().toUpperCase() || '';
    const codeRegex = /^[A-Z0-9_-]{2,10}$/;

    if (!trimmedName) {
      errs.name = 'Project name is required.';
    } else if (trimmedName.length < 2) {
      errs.name = 'Project name must be at least 2 characters.';
    }

    if (!trimmedCode) {
      errs.code = 'Project code is required.';
    } else if (!codeRegex.test(trimmedCode)) {
      errs.code = 'Code must be 2-10 uppercase alphanumeric characters (e.g. PROJ-01).';
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      if (modalMode === 'create') {
        await ApiClient.createProject({
          name: trimmedName,
          code: trimmedCode,
          description: currentProject.description?.trim(),
        });
      } else if (modalMode === 'edit' && currentProject.id) {
        await ApiClient.updateProject(currentProject.id, {
          name: trimmedName,
          code: trimmedCode,
          description: currentProject.description?.trim(),
        });
      }
      setLocalProjects(null);
      await mutate('projects-list');
      setModalMode(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save project category.');
      // Local state fallback
      if (modalMode === 'create') {
        setLocalProjects([
          ...projects,
          {
            id: `proj-${Date.now()}`,
            name: trimmedName,
            code: trimmedCode,
            description: currentProject.description,
            status: 'ACTIVE',
            reportCount: 0,
          },
        ]);
      } else if (modalMode === 'edit') {
        setLocalProjects(
          projects.map((p) =>
            p.id === currentProject.id
              ? { ...p, ...currentProject, name: trimmedName, code: trimmedCode }
              : p,
          ),
        );
      }
      setModalMode(null);
    }
  };

  const executeArchive = async () => {
    if (!projectToArchive) return;
    setIsArchiving(true);
    try {
      await ApiClient.deleteProject(projectToArchive.id);
      setLocalProjects(null);
      await mutate('projects-list');
      setProjectToArchive(null);
    } catch {
      setLocalProjects(
        projects.map((p) => (p.id === projectToArchive.id ? { ...p, status: 'ARCHIVED' } : p)),
      );
      setProjectToArchive(null);
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading && !projectsData && !localProjects) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Category Management
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            Projects & Work Categories
          </h1>
          <p className="text-xs text-slateText-secondary">
            Manage projects, strategic tracks, and client categories attached to weekly reporting entries.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setCurrentProject({ name: '', code: '', description: '' });
              setError('');
              setModalMode('create');
            }}
            className="h-10 px-4 bg-accent text-white text-xs font-black flex items-center gap-2 hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Plus size={15} />
            <span>New Category</span>
          </button>
        )}
      </div>

      {/* Error alert banner */}
      {swrError && (
        <div className="p-4 bg-[#fee2e2] border-2 border-accent text-accent text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>Failed to load categories: {swrError.message || 'Server error'}</span>
          </div>
          <button
            onClick={() => refetchProjects()}
            className="px-3 py-1 bg-accent text-white hover:bg-accent-hover text-xs font-black uppercase transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Projects Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="p-12 bg-white border-2 border-ink/40 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="w-12 h-12 bg-[#f3f2f2] border-2 border-ink flex items-center justify-center text-ink">
            <FolderGit2 size={24} />
          </div>
          <h2 className="text-base font-black text-ink uppercase tracking-wider mt-2">
            No Work Categories Found
          </h2>
          <p className="text-xs text-slateText-secondary max-w-sm">
            There are no projects or strategic tracks defined yet.
            {isManager ? ' Create a new category above to enable project tagging on team reports.' : ' Contact your manager or admin to configure work categories.'}
          </p>
          {isManager && (
            <button
              onClick={() => {
                setCurrentProject({ name: '', code: '', description: '' });
                setError('');
                setModalMode('create');
              }}
              className="mt-2 h-9 px-4 bg-ink text-white hover:bg-accent text-xs font-black uppercase flex items-center gap-2 transition-colors"
            >
              <Plus size={14} />
              <span>Create First Category</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProjects.map((p) => (
              <div
                key={p.id}
                className="p-5 bg-white border-2 border-ink/40 flex flex-col justify-between gap-4 shadow-sm"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-ink text-white font-mono text-[11px] font-extrabold uppercase">
                      {p.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        p.status === 'ACTIVE'
                          ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                          : 'bg-[#f3f2f2] text-slateText-muted border-ink/30'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-ink tracking-tight mt-1">
                    {p.name}
                  </h2>
                  <p className="text-xs text-slateText-secondary leading-relaxed min-h-[36px]">
                    {p.description || 'No detailed description specified.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-ink/20 flex items-center justify-between text-xs">
                  <span className="font-mono text-slateText-muted text-[11px]">
                    {p.reportCount || 0} reports filed
                  </span>

                  {isManager && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setCurrentProject(p);
                          setError('');
                          setModalMode('edit');
                        }}
                        className="p-1.5 text-slateText-secondary hover:text-ink transition-colors"
                        title="Edit project"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setProjectToArchive(p)}
                        className="p-1.5 text-slateText-secondary hover:text-accent transition-colors cursor-pointer"
                        title="Archive project"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={projects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemName="work categories"
            className="border-2 border-ink/40 shadow-sm"
          />
        </div>
      )}

      {/* Modal for Create / Edit */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                {modalMode === 'create' ? 'Create New Category' : 'Edit Project Category'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="project-name" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer flex items-center justify-between">
                  <span>Category / Project Name *</span>
                  {fieldErrors.name && (
                    <span className="text-accent text-[11px] font-semibold lowercase tracking-normal">
                      {fieldErrors.name}
                    </span>
                  )}
                </label>
                <input
                  id="project-name"
                  type="text"
                  value={currentProject.name}
                  onChange={(e) => {
                    setCurrentProject({ ...currentProject, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  placeholder="e.g. Mobile App Redesign"
                  required
                  className={`h-9 px-3 bg-white border text-xs font-medium cursor-text ${
                    fieldErrors.name ? 'border-accent ring-1 ring-accent' : 'border-ink/40 focus:border-ink'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="project-code" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer flex items-center justify-between">
                  <span>Project Code (Uppercase) *</span>
                  {fieldErrors.code && (
                    <span className="text-accent text-[11px] font-semibold lowercase tracking-normal">
                      {fieldErrors.code}
                    </span>
                  )}
                </label>
                <input
                  id="project-code"
                  type="text"
                  value={currentProject.code}
                  onChange={(e) => {
                    setCurrentProject({ ...currentProject, code: e.target.value.toUpperCase() });
                    if (fieldErrors.code) setFieldErrors({ ...fieldErrors, code: undefined });
                  }}
                  placeholder="e.g. MAR-01"
                  required
                  className={`h-9 px-3 bg-white border text-xs font-mono font-bold uppercase cursor-text ${
                    fieldErrors.code ? 'border-accent ring-1 ring-accent' : 'border-ink/40 focus:border-ink'
                  }`}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="project-description" className="text-xs font-bold uppercase tracking-wider text-ink cursor-pointer">
                  Description
                </label>
                <textarea
                  id="project-description"
                  rows={3}
                  value={currentProject.description || ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  placeholder="What scope rolls up into this category?"
                  className="p-3 bg-white border border-ink/40 text-xs font-medium focus:border-ink cursor-text"
                />
              </div>

              {error && <div className="text-xs font-bold text-accent">{error}</div>}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink/20">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ink text-white text-xs font-black hover:bg-black transition-colors"
                >
                  {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Category Confirmation Modal */}
      {projectToArchive && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-accent flex items-center gap-2">
                <Archive size={16} />
                <span>Confirm Category Archive</span>
              </h3>
              <button
                type="button"
                onClick={() => setProjectToArchive(null)}
                className="p-1 text-slateText-secondary hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border-2 border-amber-400 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Archive category &ldquo;{projectToArchive.name}&rdquo; ({projectToArchive.code})?
                </p>
                <p className="mt-1 text-amber-800">
                  Active team members will no longer be able to select this project category for new weekly reports. All historical reports will remain completely intact.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
              <button
                type="button"
                onClick={() => setProjectToArchive(null)}
                className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeArchive}
                disabled={isArchiving}
                className="px-5 py-2 bg-accent text-white text-xs font-black uppercase tracking-wider hover:bg-[#ae1800] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Archive size={13} />
                <span>{isArchiving ? 'Archiving…' : 'Yes, Archive Category'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
