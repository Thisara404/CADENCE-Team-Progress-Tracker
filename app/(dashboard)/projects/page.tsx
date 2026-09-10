'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import { Project } from '@/lib/types';
import {
  FolderGit2,
  Plus,
  Edit2,
  Archive,
  CheckCircle,
  X,
  FileText,
} from 'lucide-react';
import { ProjectsSkeleton } from '@/components/ui/Skeleton';

export default function ProjectsManagementPage() {
  const { isManager } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    name: '',
    code: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getProjects();
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects from database.');
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.name?.trim() || !currentProject.code?.trim()) {
      setError('Project name and code are required.');
      return;
    }

    try {
      if (modalMode === 'create') {
        await ApiClient.createProject({
          name: currentProject.name,
          code: currentProject.code.toUpperCase(),
          description: currentProject.description,
        });
      } else if (modalMode === 'edit' && currentProject.id) {
        await ApiClient.updateProject(currentProject.id, {
          name: currentProject.name,
          code: currentProject.code.toUpperCase(),
          description: currentProject.description,
        });
      }
      fetchProjects();
      setModalMode(null);
    } catch (err: any) {
      // Local state fallback
      if (modalMode === 'create') {
        setProjects([
          ...projects,
          {
            id: `proj-${Date.now()}`,
            name: currentProject.name!,
            code: currentProject.code!.toUpperCase(),
            description: currentProject.description,
            status: 'ACTIVE',
            reportCount: 0,
          },
        ]);
      } else if (modalMode === 'edit') {
        setProjects(
          projects.map((p) =>
            p.id === currentProject.id
              ? { ...p, ...currentProject }
              : p,
          ),
        );
      }
      setModalMode(null);
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this category? Historical reports will remain intact.')) return;
    try {
      await ApiClient.deleteProject(id);
      fetchProjects();
    } catch {
      setProjects(
        projects.map((p) => (p.id === id ? { ...p, status: 'ARCHIVED' } : p)),
      );
    }
  };

  if (isLoading) {
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

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
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
                    onClick={() => handleArchive(p.id)}
                    className="p-1.5 text-slateText-secondary hover:text-accent transition-colors"
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

            <form onSubmit={handleSave} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Category / Project Name
                </label>
                <input
                  type="text"
                  value={currentProject.name}
                  onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
                  placeholder="e.g. Mobile App Redesign"
                  required
                  className="h-9 px-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Project Code (Uppercase)
                </label>
                <input
                  type="text"
                  value={currentProject.code}
                  onChange={(e) => setCurrentProject({ ...currentProject, code: e.target.value })}
                  placeholder="e.g. MAR-01"
                  required
                  className="h-9 px-3 bg-white border border-ink/40 text-xs font-mono font-bold focus:border-accent uppercase"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={currentProject.description || ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                  placeholder="What scope rolls up into this category?"
                  className="p-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
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
    </div>
  );
}
