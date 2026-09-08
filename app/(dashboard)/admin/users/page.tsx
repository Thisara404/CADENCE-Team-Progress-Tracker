'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { MOCK_USERS } from '@/lib/mock-data';
import { User, Role } from '@/lib/types';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  Slash,
  X,
  ArrowUpRight,
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('TEAM_MEMBER');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getUsers();
      if (data && data.length) setUsers(data);
    } catch {
      setUsers(MOCK_USERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.includes('@')) {
      setError('Please provide a valid name and work email.');
      return;
    }

    try {
      await ApiClient.register({
        fullName: newUserName,
        email: newUserEmail,
        password: 'password123',
        role: newUserRole,
      });
      fetchUsers();
      setNotification(`Invited ${newUserName} as ${newUserRole}.`);
      setModalOpen(false);
    } catch (err: any) {
      // Local fallback
      setUsers([
        ...users,
        {
          id: `u-${Date.now()}`,
          fullName: newUserName,
          email: newUserEmail,
          role: newUserRole,
          department: 'Engineering',
          title: newUserRole === 'MANAGER' ? 'Engineering Manager' : 'Software Engineer',
          avatarColor: '#ec3013',
          active: true,
          reportCount: 0,
        },
      ]);
      setNotification(`User ${newUserName} added.`);
      setModalOpen(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await ApiClient.updateUserRole(userId, newRole);
      fetchUsers();
      setNotification('User role updated.');
    } catch {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await ApiClient.toggleUserStatus(userId);
      fetchUsers();
      setNotification('User status toggled.');
    } catch {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)),
      );
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Administration & RBAC
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            User Management & Role Permissions
          </h1>
          <p className="text-xs text-slateText-secondary">
            Assign organization roles, invite new engineers, and regulate report submission and review privileges.
          </p>
        </div>

        <button
          onClick={() => {
            setNewUserName('');
            setNewUserEmail('');
            setNewUserRole('TEAM_MEMBER');
            setError('');
            setModalOpen(true);
          }}
          className="h-10 px-4 bg-ink text-white text-xs font-black flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
        >
          <UserPlus size={15} />
          <span>Invite Team Member</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[#dcfce7] border border-[#166534] text-[#166534] text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={14} />
          <span>{notification}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="border-2 border-ink/40 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Work Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Reports Filed</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-[#f8f7f7] transition-colors ${
                    !u.active ? 'opacity-60 bg-gray-50' : ''
                  }`}
                >
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 text-white text-[11px] font-black grid place-items-center flex-shrink-0"
                        style={{ backgroundColor: u.avatarColor || '#2563eb' }}
                      >
                        {u.fullName?.[0] || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/manager/members/${u.id}`}
                          className="font-bold text-ink hover:text-accent group flex items-center gap-1"
                        >
                          <span>{u.fullName}</span>
                          <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100" />
                        </Link>
                        <span className="text-[10.5px] text-slateText-muted">
                          {u.title || 'Engineer'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 font-mono text-slateText-secondary">{u.email}</td>
                  <td className="p-3.5">{u.department || 'Engineering'}</td>

                  <td className="p-3.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-bold focus:border-accent"
                    >
                      <option value="TEAM_MEMBER">Team Member</option>
                      <option value="MANAGER">Manager</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>

                  <td className="p-3.5 font-mono font-bold text-ink">
                    {u.reportCount ?? 0}
                  </td>

                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-black uppercase border ${
                        u.active
                          ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                          : 'bg-accent-tint text-accent-hover border-accent'
                      }`}
                    >
                      {u.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                        u.active
                          ? 'bg-white border-accent text-accent hover:bg-accent-tint'
                          : 'bg-white border-ink text-ink hover:bg-[#eae9e9]'
                      }`}
                    >
                      {u.active ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                Invite Team Member
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Jordan Ellis"
                  required
                  className="h-9 px-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Work Email Address
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="jordan@company.com"
                  required
                  className="h-9 px-3 bg-white border border-ink/40 text-xs font-medium focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Role Privilege
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="h-9 px-2 bg-white border border-ink/40 text-xs font-bold focus:border-accent"
                >
                  <option value="TEAM_MEMBER">Team Member (Create & submit own reports)</option>
                  <option value="MANAGER">Manager (Review & analyze team reports)</option>
                  <option value="ADMIN">Admin (Full administrative privileges)</option>
                </select>
              </div>

              {error && <div className="text-xs font-bold text-accent">{error}</div>}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink/20">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-white border border-ink/40 text-xs font-bold text-ink hover:bg-[#eae9e9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ink text-white text-xs font-black hover:bg-black transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
