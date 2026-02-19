import React from 'react';
import { Menu } from 'lucide-react';
import UserAccountDropdown from './UserAccountDropdown';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 transition-colors hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
          >
            <Menu size={22} className="text-slate-700" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden h-6 w-px bg-slate-300 lg:block" />
          <UserAccountDropdown />
        </div>
      </div>
    </header>
  );
};

export default TopBar;