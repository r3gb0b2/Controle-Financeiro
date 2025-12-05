import React from 'react';
import { User, UserRole } from '../types';
import { HomeIcon, CalendarIcon, UserGroupIcon, FileTextIcon } from './icons';

interface SidebarProps {
  currentUser: User;
  onManageEvents: () => void;
  onManageUsers: () => void;
  onOpenReports: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, onManageEvents, onManageUsers, onOpenReports }) => {
  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, roles: [UserRole.FINANCE, UserRole.REQUESTER, UserRole.MANAGER], action: () => {} },
    { name: 'Centros de Custo', icon: CalendarIcon, roles: [UserRole.FINANCE, UserRole.MANAGER], action: onManageEvents },
    { name: 'Usuários', icon: UserGroupIcon, roles: [UserRole.FINANCE], action: onManageUsers },
    { name: 'Relatórios', icon: FileTextIcon, roles: [UserRole.FINANCE], action: onOpenReports },
  ];

  const activeLinkClasses = "bg-gray-800 text-white";
  const inactiveLinkClasses = "text-gray-400 hover:bg-gray-700 hover:text-white";

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
       <div className="flex items-center justify-center h-16 border-b border-gray-700">
        <svg className="h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8l3 5m0 0l3-5m-3 5v4m-3-5h6.6a2 2 0 012 1.732l1.4 7.068A2 2 0 0118 21H6a2 2 0 01-2-2.268l1.4-7.068A2 2 0 017.4 10H12" />
        </svg>
        <span className="text-white text-lg font-bold ml-2">Pagamentos</span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.filter(item => item.roles.includes(currentUser.role)).map(item => (
            <button
                key={item.name}
                onClick={item.action}
                // Simulating 'Dashboard' as always active for now
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${item.name === 'Dashboard' ? activeLinkClasses : inactiveLinkClasses}`}
            >
                <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                {item.name}
            </button>
        ))}
      </nav>
    </aside>
  );
};