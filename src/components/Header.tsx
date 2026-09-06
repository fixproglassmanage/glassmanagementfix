import React, { useState, useRef, useEffect } from 'react';
import { Moon, Menu, Target, ChevronDown, UserCheck, LogOut, ShieldCheck, Mail, Phone, KeyRound } from 'lucide-react';
import { Manager } from '../types';
import { ChangeAdminPasswordModal } from './ChangeAdminPasswordModal';

interface HeaderProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  activeView: string;
  activeUser: { name: string; role: string; email?: string; phone?: string; username?: string; permissions?: string[] };
  setActiveUser?: (user: any) => void;
  managers?: Manager[];
  setManagers?: (managers: Manager[] | ((prev: Manager[]) => Manager[])) => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarCollapsed,
  setSidebarCollapsed,
  setMobileSidebarOpen,
  activeUser,
  setActiveUser,
  managers = [],
  setManagers,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOwner = activeUser?.role === 'Super Admin';

  return (
    <header className="h-14 md:h-16 bg-white border-b border-slate-200/80 px-3 md:px-5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-2.5">
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors md:hidden flex items-center gap-1.5 font-bold text-xs"
          title="Open Menu"
        >
          <Menu className="w-4 h-4 text-slate-800 stroke-[2.5]" />
          <span className="font-extrabold text-xs text-[#0284c7]">Menu</span>
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors hidden md:block"
          title="Toggle Sidebar"
        >
          <Target className="w-5 h-5 text-slate-800 stroke-[2]" />
        </button>

        {/* Mobile App Title */}
        <span className="text-base md:text-lg font-black text-[#0284c7] md:hidden">
          fixprobd
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Firebase Connected Cloud Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Cloud Database Active</span>
        </div>

        {/* Dark Mode Icon */}
        <button
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Toggle Theme"
        >
          <Moon className="w-4 h-4 md:w-5 md:h-5 stroke-[2]" />
        </button>

        {/* Logged-in User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer group border border-transparent hover:border-slate-200/60"
            title={`Logged in as ${activeUser.name}`}
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs md:text-sm font-extrabold text-slate-800 leading-tight group-hover:text-[#0284c7] transition-colors">
                {activeUser.name}
              </div>
              <div className="text-[10px] md:text-xs text-slate-500 font-semibold capitalize">
                {activeUser.role}
              </div>
            </div>
            <div className="relative">
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden border border-slate-200 bg-[#0284c7] shrink-0 flex items-center justify-center shadow-2xs text-white font-black text-xs md:text-sm">
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Details & Logout Only */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0284c7] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-900 truncate">{activeUser.name}</p>
                    <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200">
                      <ShieldCheck className="w-3 h-3 text-[#0284c7]" />
                      <span className="capitalize">{activeUser.role}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 space-y-1 font-semibold">
                  {activeUser.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeUser.email}</span>
                    </div>
                  )}
                  {activeUser.phone && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{activeUser.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold pt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Authenticated Session</span>
                  </div>
                </div>
              </div>

              {/* Owner Action: Edit Owner Profile & Password */}
              {isOwner && (
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setPasswordModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-black text-sky-700 hover:bg-sky-50 rounded-xl transition-all flex items-center justify-between cursor-pointer group border border-transparent hover:border-sky-100"
                  >
                    <span className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#0284c7] group-hover:scale-110 transition-transform" />
                      <span>Owner Info & Password</span>
                    </span>
                    <span className="text-[10px] text-sky-600 font-extrabold bg-sky-100/80 px-1.5 py-0.5 rounded">
                      Owner
                    </span>
                  </button>
                </div>
              )}

              {/* Logout button */}
              {onLogout && (
                <div className="mt-1 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-black text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-between cursor-pointer group border border-transparent hover:border-rose-100"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 stroke-[2.5] text-rose-500 group-hover:scale-110 transition-transform" />
                      <span>Logout Account</span>
                    </span>
                    <span className="text-[10px] text-rose-400 font-bold">Switch User</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Change Admin Password Modal */}
      {isOwner && (
        <ChangeAdminPasswordModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          managers={managers}
          setManagers={setManagers || (() => {})}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
        />
      )}
    </header>
  );
};



