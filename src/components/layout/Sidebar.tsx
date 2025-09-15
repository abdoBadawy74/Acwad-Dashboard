import React from 'react';
import { 
  Users, 
  Star, 
  Settings, 
  Briefcase, 
  UserCheck, 
  Crown, 
  FolderOpen, 
  HelpCircle, 
  Shield,
  Activity,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Activity },
  { id: 'subscribers', label: 'Subscribers', icon: Users },
  { id: 'reviews', label: 'Customer Reviews', icon: Star },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'team', label: 'Team Members', icon: UserCheck },
  { id: 'leadership', label: 'Leadership', icon: Crown },
  { id: 'project-categories', label: 'Project Categories', icon: FolderOpen },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'privacy', label: 'Privacy Policy', icon: Shield },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">Company Dashboard</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white border-r-2 border-blue-400' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon size={20} />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight size={16} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
};