import React from 'react';
import { X } from 'lucide-react';
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export function Drawer({ isOpen, onClose, title, children }: DrawerProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-[420px] h-full shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors">
            
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 flex-1">{children}</div>
      </div>
    </div>);

}