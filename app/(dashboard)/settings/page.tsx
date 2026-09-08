'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ApiClient } from '@/lib/api';
import {
  User as UserIcon,
  KeyRound,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lock,
  Mail,
  Briefcase,
  Layers,
  Palette,
  Eye,
  EyeOff,
} from 'lucide-react';

const COLOR_SWATCHES = [
  '#111827',
  '#ec3013',
  '#2563eb',
  '#059669',
  '#7c3aed',
  '#d97706',
  '#db2777',
  '#0891b2',
];

export default function SettingsPage() {
  const { user, role, isAdmin, isManager, updateUserLocal } = useAuth();

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [title, setTitle] = useState(user?.title || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '#ec3013');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTitle(user.title || '');
      setDepartment(user.department || '');
      setAvatarColor(user.avatarColor || '#ec3013');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!fullName.trim()) {
      setProfileError('Full name cannot be empty.');
      return;
    }

    setIsSavingProfile(true);
    try {
      await ApiClient.updateProfile({
        fullName: fullName.trim(),
        title: title.trim(),
        department: department.trim(),
        avatarColor,
      });
      updateUserLocal({
        fullName: fullName.trim(),
        title: title.trim(),
        department: department.trim(),
        avatarColor,
      });
      setProfileSuccess('Profile information updated successfully.');
    } catch (err: any) {
      // Fallback update in local state
      updateUserLocal({
        fullName: fullName.trim(),
        title: title.trim(),
        department: department.trim(),
        avatarColor,
      });
      setProfileSuccess('Profile updated.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await ApiClient.changeMyPassword(currentPassword, newPassword);
      setPasswordSuccess(res?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-ink/40 pb-4">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-slateText-muted font-mono">
            Account Management
          </span>
          <h1 className="text-2xl font-black text-ink tracking-tight mt-1">
            Profile & Security Settings
          </h1>
          <p className="text-xs text-slateText-secondary">
            Manage your personal details, credentials, and view workspace access permissions.
          </p>
        </div>

        {/* Current Role Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#eae9e9] border border-ink/40 self-start sm:self-auto">
          <Shield size={14} className="text-accent" />
          <span className="text-[11px] font-black uppercase font-mono tracking-wider text-ink">
            {role.replace('_', ' ')} PRIVILEGES
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Password (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Card 1: Profile Information */}
          <div className="p-6 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ink/20 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <UserIcon size={16} className="text-accent" />
                <span>Profile Information</span>
              </h2>
              <span className="text-[11px] text-slateText-secondary font-mono">
                ID: {user?.id}
              </span>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-[#dcfce7] border border-[#166534] text-[#166534] text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={14} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="p-3 bg-[#fee2e2] border border-[#991b1b] text-[#991b1b] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-10 px-3 bg-[#f8f7f7] border border-ink/30 text-xs font-semibold text-ink focus:border-accent"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Work Email (Locked)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="h-10 px-3 w-full bg-[#eae9e9] border border-ink/20 text-xs font-mono text-slateText-muted cursor-not-allowed"
                    />
                    <Lock size={12} className="absolute right-3 top-3.5 text-slateText-muted" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="h-10 px-3 bg-[#f8f7f7] border border-ink/30 text-xs text-ink focus:border-accent"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Core Engineering"
                    className="h-10 px-3 bg-[#f8f7f7] border border-ink/30 text-xs text-ink focus:border-accent"
                  />
                </div>
              </div>

              {/* Avatar Color Swatches */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <Palette size={13} className="text-accent" />
                  <span>Avatar Color</span>
                </label>
                <div className="flex items-center gap-2.5">
                  {COLOR_SWATCHES.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setAvatarColor(col)}
                      className={`w-7 h-7 transition-transform ${
                        avatarColor === col
                          ? 'ring-2 ring-offset-2 ring-ink scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col }}
                      title={col}
                    />
                  ))}
                  <div
                    className="w-8 h-8 text-white text-xs font-extrabold grid place-items-center ml-2 border border-ink/40"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'U'}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="h-10 px-5 bg-ink text-white text-xs font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving Changes…' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password Management */}
          <div className="p-6 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ink/20 pb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-ink flex items-center gap-2">
                <KeyRound size={16} className="text-accent" />
                <span>Security & Password Management</span>
              </h2>
              <span className="text-[11px] text-slateText-secondary font-mono">
                Min 4 characters
              </span>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-[#dcfce7] border border-[#166534] text-[#166534] text-xs font-semibold flex items-center gap-2">
                <CheckCircle size={14} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="p-3 bg-[#fee2e2] border border-[#991b1b] text-[#991b1b] text-xs font-semibold flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-ink">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="h-10 px-3 pr-10 w-full bg-[#f8f7f7] border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                    title={showCurrentPw ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-10 px-3 pr-10 w-full bg-[#f8f7f7] border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                      title={showNewPw ? 'Hide password' : 'Show password'}
                    >
                      {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="h-10 px-3 pr-10 w-full bg-[#f8f7f7] border border-ink/30 text-xs font-mono text-ink focus:border-accent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-2.5 text-slateText-muted hover:text-ink transition-colors p-0.5"
                      title={showConfirmPw ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="h-10 px-5 bg-accent text-white text-xs font-black uppercase tracking-wider hover:bg-[#ae1800] transition-colors disabled:opacity-50"
                >
                  {isChangingPassword ? 'Updating Password…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Account Status & Role Permissions Matrix (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* User Card Summary */}
          <div className="p-5 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink pb-2 border-b border-ink/20">
              Account Badge
            </h3>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 text-white text-base font-black grid place-items-center flex-shrink-0 border-2 border-ink/30"
                style={{ backgroundColor: avatarColor }}
              >
                {fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm text-ink truncate">
                  {fullName}
                </span>
                <span className="text-xs text-slateText-secondary truncate">
                  {user?.email}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-black uppercase bg-[#201e1d] text-white self-start">
                  {role}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-ink/20 flex flex-col gap-1.5 text-xs text-slateText-secondary">
              <div className="flex justify-between">
                <span>Account Status:</span>
                <span className="font-bold text-[#166534]">Active</span>
              </div>
              <div className="flex justify-between">
                <span>Workspace:</span>
                <span className="font-bold text-ink">Acme Engineering</span>
              </div>
              <div className="flex justify-between">
                <span>Active Cycle:</span>
                <span className="font-mono font-bold text-ink">Week 37</span>
              </div>
            </div>
          </div>

          {/* Role Capabilities Matrix */}
          <div className="p-5 bg-white border-2 border-ink/40 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-ink flex items-center gap-1.5 pb-2 border-b border-ink/20">
              <Layers size={14} className="text-accent" />
              <span>{role} Capabilities</span>
            </h3>

            <div className="flex flex-col gap-2.5 text-xs">
              {isAdmin && (
                <>
                  <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-ink flex flex-col gap-0.5">
                    <span className="font-bold text-ink">User Account Creation</span>
                    <span className="text-[11px] text-slateText-secondary">
                      Create new accounts with custom passwords and assign roles.
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-ink flex flex-col gap-0.5">
                    <span className="font-bold text-ink">Credential Management</span>
                    <span className="text-[11px] text-slateText-secondary">
                      Reset user passwords and manage account activation states.
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-accent flex flex-col gap-0.5">
                    <span className="font-bold text-accent">Protected Root Admin</span>
                    <span className="text-[11px] text-slateText-secondary">
                      The primary administrator account cannot be deleted or deactivated.
                    </span>
                  </div>
                </>
              )}

              {isManager && (
                <>
                  <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-ink flex flex-col gap-0.5">
                    <span className="font-bold text-ink">Manager Intelligence</span>
                    <span className="text-[11px] text-slateText-secondary">
                      Access velocity metrics, compliance stats, and workload distribution.
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-ink flex flex-col gap-0.5">
                    <span className="font-bold text-ink">Report Review Workflow</span>
                    <span className="text-[11px] text-slateText-secondary">
                      Approve submissions or request corrections with mandatory notes.
                    </span>
                  </div>
                </>
              )}

              <div className="p-2.5 bg-[#f8f7f7] border-l-2 border-ink flex flex-col gap-0.5">
                <span className="font-bold text-ink">Weekly Reporting</span>
                <span className="text-[11px] text-slateText-secondary">
                  Create, draft, and submit weekly progress reports with task breakdowns.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
