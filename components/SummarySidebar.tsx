import React, { useMemo } from 'react';
import { Task } from '../types.ts';
import { Download, Package, Wrench, Printer, FileText, Clock } from 'lucide-react';

interface SummarySidebarProps {
  tasks: Task[];
  jobAddress: string;
  clientName?: string;
}

export const SummarySidebar: React.FC<SummarySidebarProps> = ({ tasks, jobAddress, clientName }) => {
  
  const totalTasksCount = tasks.length;

  // Materials: LIST ALL (Allow duplicates)
  const allMaterials = useMemo(() => {
    const mats: string[] = [];
    tasks.forEach(t => t.materials.forEach(m => mats.push(m)));
    return mats.sort();
  }, [tasks]);

  // Tools: (Stack/Deduplicate)
  const allTools = useMemo(() => {
    const tools = new Set<string>();
    tasks.forEach(t => t.tools.forEach(too => tools.add(too)));
    return Array.from(tools).sort();
  }, [tasks]);

  const totalEstimatedTime = useMemo(() => {
    let totalMinutes = 0;
    tasks.forEach(t => {
      if (!t.estimatedTime) return;
      
      const timeStr = t.estimatedTime.toLowerCase().trim();
      let minutes = 0;

      // Try parsing standard formats
      const hoursMatch = timeStr.match(/(\d+(\.\d+)?)\s*(h|hr|hour)/);
      const minsMatch = timeStr.match(/(\d+)\s*(m|min)/);

      if (hoursMatch) {
        minutes += parseFloat(hoursMatch[1]) * 60;
      }
      if (minsMatch) {
        minutes += parseInt(minsMatch[1], 10);
      }

      // Fallback: if only a number is provided (e.g. "2"), assume hours
      if (!hoursMatch && !minsMatch) {
        const val = parseFloat(timeStr);
        if (!isNaN(val)) {
          minutes += val * 60;
        }
      }

      totalMinutes += minutes;
    });

    return totalMinutes;
  }, [tasks]);

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "0h";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const handleDownloadFullLog = () => {
    if (tasks.length === 0) return;

    let content = `JOBSITE ESTIMATE\n`;
    content += `Job: ${jobAddress}\n`;
    if (clientName) content += `Client: ${clientName}\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n`;
    content += `Total Items: ${tasks.length}\n`;
    content += `Total Est. Time: ${formatTime(totalEstimatedTime)}\n`;
    content += "==================================================\n\n";
    
    tasks.forEach((task, index) => {
      content += `ENTRY #${index + 1}: ${task.title.toUpperCase()}\n`;
      if (task.estimatedTime) content += `Time Est: ${task.estimatedTime}\n`;
      content += `--------------------------------------------------\n`;
      
      if (task.description) {
        content += `NOTES:\n${task.description}\n\n`;
      }
      
      if (task.materials.length > 0) {
        content += `MATERIALS:\n`;
        task.materials.forEach(m => content += ` - ${m}\n`);
        content += `\n`;
      }

      if (task.tools.length > 0) {
        content += `TOOLS:\n`;
        task.tools.forEach(t => content += ` - ${t}\n`);
        content += `\n`;
      }
      
      if (task.imageUrls.length > 0) {
        content += `[Attached ${task.imageUrls.length} photo(s) to this item]\n`;
      }

      content += "\n==================================================\n\n";
    });

    // Master List at bottom
    content += " MATERIAL LIST:\n";
    allMaterials.forEach(m => content += `[ ] ${m}\n`);
    
    content += "\nREQUIRED TOOLS:\n";
    allTools.forEach(t => content += `[ ] ${t}\n`);

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Estimate_${jobAddress.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (tasks.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-6 print:hidden">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800 border-b border-slate-100 pb-3">
        <FileText className="text-orange-600" size={20} /> 
        Job Summary
      </h2>

      <div className="space-y-3">
        <button
          onClick={handlePrint}
          className="w-full py-3 px-4 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Printer size={18} />
          Print / Save as PDF
        </button>

        <button
          onClick={handleDownloadFullLog}
          className="w-full py-3 px-4 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border border-slate-200"
        >
          <Download size={18} />
          Download Text Quote
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Totals</h3>
        
        {/* Total Time */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
             <Clock size={16} className="text-orange-500" />
             <span>Total Est. Time</span>
          </div>
          <span className="font-bold text-slate-900">{formatTime(totalEstimatedTime)}</span>
        </div>

        {/* Materials */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
               <Package size={16} className="text-slate-400" />
               <span>Material List</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">{allMaterials.length} items</span>
          </div>
          {allMaterials.length > 0 ? (
            <ul className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {allMaterials.map((m, i) => (
                <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0"></span>
                  <span className="leading-tight">{m}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400 italic">None recorded.</p>
          )}
        </div>

        {/* Tools */}
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
             <Wrench size={16} className="text-slate-400" />
             <span>Tools Needed</span>
          </div>
          {allTools.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {allTools.map((t, i) => (
                <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};