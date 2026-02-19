import React from 'react';
import {
  PlusCircle,
  Calendar,
  Settings,
  Brain
} from 'lucide-react';
import { type MenuItem } from '../../types';
import  SidebarItem from './SidebarItem';


interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, activePage, setActivePage }) => {
  const menuItems: MenuItem[] = [
    { id: 'new-session', icon: PlusCircle, label: 'New Session' },
    { id: 'sessions', icon: Calendar, label: 'All Sessions' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-72
          border-r border-slate-200
          bg-white
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          flex flex-col
        `}
      >

        {/* Logo */}
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Brain size={20} />
              </div>
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-black tracking-tight ">Shravya</h1>
              <p className="mt-0.5 text-xs text-slate-500">Instructor Dashboard</p>
            </div>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <ul className="space-y-1.5">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                activePage={activePage}
                setActivePage={setActivePage}
                onClose={onClose}
              />
            ))}
          </ul>
        </nav>

        
      </aside>
    </>
  );
};

export default Sidebar;