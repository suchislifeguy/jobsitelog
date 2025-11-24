import React from 'react';
import { Job } from '../types';
import { MapPin, Calendar, ChevronRight, ClipboardList, Trash2 } from 'lucide-react';

interface JobProjectCardProps {
  job: Job;
  onClick: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const JobProjectCard: React.FC<JobProjectCardProps> = ({ job, onClick, onDelete }) => {
  const totalTasks = job.tasks.length;

  return (
    <div 
      onClick={() => onClick(job.id)}
      className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-slate-100 p-3 rounded-lg group-hover:bg-orange-50 transition-colors">
              <MapPin className="text-slate-600 group-hover:text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">
                {job.address}
              </h3>
              {job.clientName && (
                <p className="text-sm text-slate-500">{job.clientName}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Calendar size={12} />
                <span>{new Date(job.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={(e) => onDelete(job.id, e)}
            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
            title="Delete Job"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-2 rounded-md w-fit">
          <ClipboardList size={16} />
          <span className="font-medium text-sm">{totalTasks} {totalTasks === 1 ? 'Item' : 'Items'} Recorded</span>
        </div>
      </div>

      <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center text-sm font-medium text-slate-600 group-hover:text-slate-900 group-hover:bg-orange-50/30 transition-colors">
        <span>Open Job Details</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
};