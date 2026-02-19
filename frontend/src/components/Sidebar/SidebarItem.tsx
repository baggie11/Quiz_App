import React from 'react';
import { type MenuItem } from '../../types';

interface SidebarItemProps {
  item: MenuItem;
  activePage: string;
  setActivePage: (page: string) => void;
  onClose: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, activePage, setActivePage, onClose }) => {
  const Icon = item.icon;

  const handleClick = () => {
    setActivePage(item.id);
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={`
          relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition
          ${
            activePage === item.id
              ? "bg-slate-100 text-slate-900"
              : "text-slate-700 hover:bg-slate-50"
          }
        `}
      >
        {activePage === item.id && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-slate-900" />
        )}

        <div
          className={`
            flex h-8 w-8 items-center justify-center rounded-md
            ${
              activePage === item.id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600"
            }
          `}
        >
          <Icon size={16} />
        </div>

        <span className="text-sm font-medium">{item.label}</span>
      </button>
    </li>
  );
};

export default SidebarItem;