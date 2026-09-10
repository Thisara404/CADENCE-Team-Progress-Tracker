'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api';
import { User, Role } from '@/lib/types';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowUpRight,
  KeyRound,
  Trash2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Create User Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [showCreatePw, setShowCreatePw] = useState(false);
  const [newUserRole, setNewUserRole] = useState<Role>('TEAM_MEMBER');
  const [newUserDept, setNewUserDept] = useState('Engineering');
  const [newUserTitle, setNewUserTitle] = useState('');
  const [createError, setCreateError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password Reset Modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [showResetPw, setShowResetPw] = useState(false);
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Delete Confirmation Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await ApiClient.getUsers();
      setUsers(data || []);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to fetch users from database.');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isRootAdmin = (u: User) => {
    return (
      u.id === 'u-admin-root' ||
      u.email.toLowerCase() === 'admin@cadence.com'
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    if (!newUserName.trim() || !newUserEmail.includes('@')) {
      setCreateError('Please provide a valid full name and work email.');
      return;
    }
    if (!newUserPassword || newUserPassword.length < 4) {
      setCreateError('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ApiClient.createUser({
        fullName: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword,
        role: newUserRole,
        department: newUserDept.trim() || 'Engineering',
        title:
          newUserTitle.trim() ||
          (newUserRole === 'ADMIN'
            ? 'Engineering Manager / Administrator'
            : 'Software Engineer'),
      });
      await fetchUsers();
      setNotification(`User ${newUserName} created with password. They can now log in.`);
      setCreateModalOpen(false);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenResetModal = (u: User) => {
    setSelectedUser(u);
    setNewResetPassword('');
    setResetError('');
    setResetModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!newResetPassword || newResetPassword.length < 4) {
      setResetError('New password must be at least 4 characters long.');
      return;
    }

    setIsResetting(true);
    try {
      await ApiClient.changeUserPassword(selectedUser.id, newResetPassword);
      setNotification(`Password reset successfully for ${selectedUser.fullName}.`);
      setResetModalOpen(false);
    } catch (err: any) {
      setResetError(err.message || 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenDeleteModal = (u: User) => {
    if (isRootAdmin(u)) return;
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

  const handleDeleteUserConfirm = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await ApiClient.deleteUser(userToDelete.id);
      await fetchUsers();
      setNotification(`User ${userToDelete.fullName} has been deleted.`);
      setDeleteModalOpen(false);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to delete user.');
      setDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await ApiClient.updateUserRole(userId, newRole);
      fetchUsers();
      setNotification('User role updated successfully.');
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
    } catch (err: any) {
      setErrorBanner(err.message || 'Could not change status.');
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
            Create user accounts with initial passwords, manage credentials, and assign workspace permissions.
          </p>
        </div>

        <button
          onClick={() => {
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('password123');
            setNewUserRole('TEAM_MEMBER');
            setNewUserDept('Engineering');
            setNewUserTitle('');
            setCreateError('');
            setCreateModalOpen(true);
          }}
          className="h-10 px-4 bg-ink text-white text-xs font-black flex items-center gap-2 hover:bg-black transition-colors shadow-sm"
        >
          <UserPlus size={15} />
          <span>Create User Account</span>
        </button>
      </div>

      {notification && (
        <div className="p-3 bg-[#dcfce7] border border-[#166534] text-[#166534] text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} />
            <span>{notification}</span>
          </div>
          <button onClick={() => setNotification('')} className="p-0.5 hover:opacity-75">
            <X size={13} />
          </button>
        </div>
      )}

      {errorBanner && (
        <div className="p-3 bg-[#fee2e2] border border-[#991b1b] text-[#991b1b] text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner('')} className="p-0.5 hover:opacity-75">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="border-2 border-ink/40 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#eae9e9] border-b-2 border-ink/40 text-[11px] font-black uppercase tracking-wider text-ink whitespace-nowrap">
                <th className="p-3.5">User</th>
                <th className="p-3.5">Work Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Reports</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/20">
              {users.map((u) => {
                const isRoot = isRootAdmin(u);

                return (
                  <tr
                    key={u.id}
                    className={`hover:bg-[#f8f7f7] transition-colors ${
                      !u.active ? 'opacity-60 bg-gray-50' : ''
                    }`}
                  >
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-7 h-7 text-white text-[11px] font-black grid place-items-center flex-shrink-0"
                          style={{ backgroundColor: u.avatarColor || '#2563eb' }}
                        >
                          {u.fullName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/manager/members/${u.id}`}
                              className="font-bold text-ink hover:text-accent group flex items-center gap-1 whitespace-nowrap"
                            >
                              <span>{u.fullName}</span>
                              <ArrowUpRight size={11} className="opacity-0 group-hover:opacity-100" />
                            </Link>
                            {isRoot && (
                              <span className="px-1.5 py-0.2 bg-[#111827] text-white text-[9px] font-mono font-bold uppercase tracking-wider">
                                Root
                              </span>
                            )}
                          </div>
                          <span className="text-[10.5px] text-slateText-muted whitespace-nowrap">
                            {u.title || 'Engineer'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slateText-secondary whitespace-nowrap">{u.email}</td>
                    <td className="p-3.5 whitespace-nowrap">{u.department || 'Engineering'}</td>

                    <td className="p-3.5 whitespace-nowrap">
                      <select
                        value={u.role}
                        disabled={isRoot}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="h-8 px-2 bg-[#f3f2f2] border border-ink/30 text-xs font-bold focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <option value="TEAM_MEMBER">Team Member</option>
                        <option value="MANAGER">Manager</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-ink whitespace-nowrap">
                      {u.reportCount ?? 0}
                    </td>

                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-black uppercase border whitespace-nowrap ${
                          u.active
                            ? 'bg-[#dcfce7] text-[#166534] border-[#166534]'
                            : 'bg-[#fee2e2] text-[#991b1b] border-[#991b1b]'
                        }`}
                      >
                        {u.active ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Password Change Option for every user */}
                        <button
                          onClick={() => handleOpenResetModal(u)}
                          className="px-2 py-1 text-[11px] font-bold border border-ink/40 bg-white text-ink hover:bg-[#eae9e9] transition-colors flex items-center gap-1 shadow-2xs"
                          title={`Reset password for ${u.fullName}`}
                        >
                          <KeyRound size={11} className="text-slateText-secondary" />
                          <span>Change PW</span>
                        </button>

                        {/* Status Toggle (Root Admin cannot be suspended) */}
                        {!isRoot ? (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-2 py-1 text-[11px] font-bold border transition-colors ${
                              u.active
                                ? 'bg-white border-ink/30 text-ink hover:bg-[#eae9e9]'
                                : 'bg-white border-green-600 text-green-700 hover:bg-green-50'
                            }`}
                          >
                            {u.active ? 'Suspend' : 'Activate'}
                          </button>
                        ) : null}

                        {/* Delete Button: Disabled for Root Admin, Enabled for all other users */}
                        {isRoot ? (
                          <button
                            disabled
                            className="px-2 py-1 text-[11px] font-bold border border-ink/20 bg-[#eae9e9] text-slateText-muted cursor-not-allowed opacity-60 flex items-center gap-1"
                            title="Primary root administrator cannot be deleted"
                          >
                            <Lock size={11} />
                            <span>Protected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDeleteModal(u)}
                            className="px-2 py-1 text-[11px] font-bold border border-accent text-accent hover:bg-accent hover:text-white transition-colors flex items-center gap-1"
                            title={`Delete ${u.fullName}`}
                          >
                            <Trash2 size={11} />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Account Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <UserPlus size={16} className="text-accent" />
                <span>Create User Account</span>
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="h-10 px-3 bg-white border border-ink/30 text-xs text-ink focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="rachel@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="h-10 px-3 bg-white border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center justify-between">
                  <span>Initial Password</span>
                  <span className="text-[10px] text-slateText-secondary lowercase font-normal">min 4 chars</span>
                </label>
                <div className="relative">
                  <input
                    type={showCreatePw ? 'text' : 'password'}
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Create user password"
                    className="h-10 px-3 pr-10 w-full bg-white border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePw(!showCreatePw)}
                    className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                    title={showCreatePw ? 'Hide password' : 'Show password'}
                  >
                    {showCreatePw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Assigned Role
                  </label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="h-10 px-2 bg-white border border-ink/30 text-xs font-bold text-ink focus:border-accent"
                  >
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value)}
                    placeholder="Engineering"
                    className="h-10 px-3 bg-white border border-ink/30 text-xs text-ink focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newUserTitle}
                  onChange={(e) => setNewUserTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="h-10 px-3 bg-white border border-ink/30 text-xs text-ink focus:border-accent"
                />
              </div>

              {createError && (
                <div className="p-2.5 bg-[#fee2e2] border border-[#991b1b] text-[#991b1b] text-xs font-semibold">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="h-9 px-4 bg-white border border-ink/30 text-xs font-bold text-ink hover:bg-[#eae9e9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-9 px-5 bg-ink text-white text-xs font-black uppercase tracking-wider hover:bg-black disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating Account…' : 'Create & Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-md w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <KeyRound size={16} className="text-accent" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setResetModalOpen(false)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slateText-secondary">
              Set a new password for <b>{selectedUser.fullName}</b> ({selectedUser.email}).
            </p>

            <form onSubmit={handleResetPassword} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPw ? 'text' : 'password'}
                    required
                    placeholder="Enter new password"
                    value={newResetPassword}
                    onChange={(e) => setNewResetPassword(e.target.value)}
                    className="h-10 px-3 pr-10 w-full bg-white border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPw(!showResetPw)}
                    className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                    title={showResetPw ? 'Hide password' : 'Show password'}
                  >
                    {showResetPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {resetError && (
                <div className="p-2.5 bg-[#fee2e2] border border-[#991b1b] text-[#991b1b] text-xs font-semibold">
                  {resetError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="h-9 px-4 bg-white border border-ink/30 text-xs font-bold text-ink hover:bg-[#eae9e9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="h-9 px-5 bg-accent text-white text-xs font-black uppercase tracking-wider hover:bg-[#ae1800] disabled:opacity-50"
                >
                  {isResetting ? 'Setting Password…' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#f3f2f2] border-2 border-ink max-w-sm w-full p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/30 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-accent flex items-center gap-2">
                <Trash2 size={16} />
                <span>Confirm User Deletion</span>
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="p-1 text-slateText-secondary hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#201e1d] leading-relaxed">
              Are you sure you want to permanently delete user <b>{userToDelete.fullName}</b> (
              <span className="font-mono">{userToDelete.email}</span>)? This will remove their reports and history.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink/20">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="h-9 px-4 bg-white border border-ink/30 text-xs font-bold text-ink hover:bg-[#eae9e9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUserConfirm}
                disabled={isDeleting}
                className="h-9 px-5 bg-accent text-white text-xs font-black uppercase tracking-wider hover:bg-[#ae1800] disabled:opacity-50"
              >
                {isDeleting ? 'Deleting…' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
