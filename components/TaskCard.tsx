import React from 'react';
import { Task } from '../types.ts';
import { Clock, Trash2, Package, Wrench, ImageIcon } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onDelete }) => {
  const images = task.imageUrls || [];

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 print:shadow-none print:border-2 print:border-gray-800 print:rounded-none print:break-inside-avoid hover:border-orange-300 hover:shadow-md">
      
      {/* Image Section */}
      {images.length > 0 && (
        <div className={`w-full bg-slate-100 border-b border-slate-100 relative overflow-hidden print:border-b-2 print:border-gray-800 ${images.length > 1 ? 'grid grid-cols-2 gap-0.5 print:gap-1' : ''}`}>
            {images.map((url, idx) => (
              <div 
                key={idx} 
                className={`relative ${
                  images.length === 1 ? 'h-56 w-full print:h-64' : 
                  images.length === 2 ? 'h-48 w-full print:h-48' : 
                  images.length === 3 && idx === 0 ? 'h-48 col-span-2 print:h-48' : 
                  'h-32 w-full print:h-40'
                }`}
              >
                <img 
                  src={url} 
                  alt={`${task.title} - photo ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
        </div>
      )}

      <div className="p-5 print:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-start gap-3 flex-1">
            
            {/* Item Number Visual */}
            <div className="mt-1 flex-shrink-0 h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm print:border-2 print:border-black print:bg-transparent print:text-black">
              #{index + 1}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate print:whitespace-normal print:overflow-visible print:text-xl text-slate-900 print:text-black">
                {task.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 print:text-black print:font-medium">
                {task.estimatedTime && (
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium print:bg-transparent print:p-0 print:text-sm">
                    <Clock size={12} className="print:hidden" />
                    <span className="print:hidden">Est:</span>
                    <span>{task.estimatedTime}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleDelete}
            className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors print:hidden"
            title="Delete Item"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-slate-600 text-sm mb-4 whitespace-pre-wrap print:text-black print:text-base print:mb-2">
            {task.description}
          </p>
        )}

        {/* Lists */}
        {(task.materials.length > 0 || task.tools.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 print:border-t-2 print:border-gray-200 print:grid-cols-2 print:gap-8 print:pt-4">
            
            {task.materials.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black print:text-xs print:mb-2">
                  <Package size={12} className="print:hidden" />
                  <span>Materials</span>
                </div>
                <ul className="list-disc list-inside text-sm text-slate-700 leading-relaxed print:text-black print:list-disc">
                  {task.materials.map((item, idx) => (
                    <li key={idx} className="truncate print:whitespace-normal print:overflow-visible marker:text-orange-300 print:marker:text-black">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {task.tools.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider print:text-black print:text-xs print:mb-2">
                  <Wrench size={12} className="print:hidden" />
                  <span>Tools</span>
                </div>
                <ul className="list-disc list-inside text-sm text-slate-700 leading-relaxed print:text-black print:list-disc">
                  {task.tools.map((item, idx) => (
                    <li key={idx} className="truncate print:whitespace-normal print:overflow-visible marker:text-blue-300 print:marker:text-black">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {images.length === 0 && !task.description && task.materials.length === 0 && task.tools.length === 0 && (
           <div className="flex flex-col items-center justify-center py-4 text-slate-300 print:hidden">
              <ImageIcon size={24} className="mb-1 opacity-50" />
              <span className="text-xs">No details added</span>
           </div>
        )}
      </div>
    </div>
  );
};