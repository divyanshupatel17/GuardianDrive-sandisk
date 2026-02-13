import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  HardDrive, 
  Layers, 
  FileArchive, 
  Cloud,
  Bell,
  Settings,
  Menu,
  X,
  Shield,
  Cpu
} from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  alertCount?: number;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
  { id: 'drives', label: 'Drive Health', icon: <HardDrive size={20} /> },
  { id: 'tiering', label: 'Tiering Plan', icon: <Layers size={20} /> },
  { id: 'compression', label: 'Compression', icon: <FileArchive size={20} /> },
  { id: 'cloud', label: 'Cloud', icon: <Cloud size={20} /> },
];

export const Navigation: React.FC<NavigationProps> = ({ 
  activeTab, 
  onTabChange,
  alertCount = 0 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0a0a0f] border-r border-[#ffffff08] z-50">
        {/* Logo */}
        <div className="p-6 border-b border-[#ffffff08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#00a8cc] flex items-center justify-center">
              <Shield size={22} className="text-black" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">GuardianDrive</h1>
              <p className="text-[10px] text-[#00d4ff] uppercase tracking-wider">AI-Powered Storage</p>
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-[#00d4ff20] to-transparent text-[#00d4ff] border border-[#00d4ff30]'
                  : 'text-gray-400 hover:text-white hover:bg-[#ffffff05]'
              }`}
            >
              <span className={activeTab === item.id ? 'text-[#00d4ff]' : ''}>
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
              {item.id === 'overview' && alertCount > 0 && (
                <span className="ml-auto bg-[#ff4757] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#ffffff08] space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#ffffff05] transition-all">
            <Bell size={20} />
            <span className="font-medium text-sm">Notifications</span>
            {alertCount > 0 && (
              <span className="ml-auto bg-[#ff4757] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {alertCount}
              </span>
            )}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-[#ffffff05] transition-all">
            <Settings size={20} />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>

        {/* Version */}
        <div className="px-6 py-4 border-t border-[#ffffff08]">
          <div className="flex items-center gap-2">
            <Cpu size={14} className="text-[#00d4ff]" />
            <span className="text-xs text-gray-500">v1.0.0 • Hackathon MVP</span>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f] border-b border-[#ffffff08]">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#00a8cc] flex items-center justify-center">
              <Shield size={18} className="text-black" />
            </div>
            <span className="text-white font-bold">GuardianDrive</span>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-10 h-10 rounded-lg bg-[#ffffff08] flex items-center justify-center text-white"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-[#ffffff08] p-4 space-y-2 animate-slide-up">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${
                  activeTab === item.id
                    ? 'bg-[#00d4ff20] text-[#00d4ff] border border-[#00d4ff30]'
                    : 'text-gray-400'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Header Spacer */}
      <div className="lg:hidden h-16" />
    </>
  );
};

// Top Bar Component
export const TopBar: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
      </div>
      
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00ff8815] border border-[#00ff8830]">
          <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-[#00ff88] text-sm font-medium">System Online</span>
        </div>
        
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-[#ffffff10] flex items-center justify-center">
          <span className="text-[#00d4ff] font-bold text-sm">GD</span>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
