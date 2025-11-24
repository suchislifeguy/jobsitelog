import React, { useState, useEffect, useRef } from 'react';
import { Task, Job, ViewMode } from './types';
import { TaskCard } from './components/TaskCard';
import { JobProjectCard } from './components/JobProjectCard';
import { SummarySidebar } from './components/SummarySidebar';
import { Plus, Image as ImageIcon, X, Save, Hammer, Clipboard, ArrowLeft, MapPin, HardHat, Printer, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [storageError, setStorageError] = useState<string | null>(null);
  
  // Task Form State
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [taskMaterials, setTaskMaterials] = useState('');
  const [taskTools, setTaskTools] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Array for multiple images
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job Form State
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [newJobAddress, setNewJobAddress] = useState('');
  const [newJobClient, setNewJobClient] = useState('');

  // Load from local storage on mount with Migration Logic
  useEffect(() => {
    const savedJobs = localStorage.getItem('jobsite-log-jobs');
    if (savedJobs) {
      try {
        const parsedJobs: Job[] = JSON.parse(savedJobs);
        // Migrate old data structure (imageUrl -> imageUrls)
        const migratedJobs = parsedJobs.map(job => ({
          ...job,
          tasks: job.tasks.map((task: any) => ({
            ...task,
            imageUrls: task.imageUrls || (task.imageUrl ? [task.imageUrl] : [])
          }))
        }));
        setJobs(migratedJobs);
      } catch (e) {
        console.error("Failed to load local jobs");
        setJobs([]);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem('jobsite-log-jobs', JSON.stringify(jobs));
      setStorageError(null);
    } catch (e) {
      console.error("Storage limit reached", e);
      setStorageError("Storage full! Delete some photos or old jobs to save new data.");
    }
  }, [jobs]);

  // --- Nav Actions ---
  const openJob = (id: string) => {
    setActiveJobId(id);
    setViewMode('job-detail');
    setIsTaskFormOpen(false);
    window.scrollTo(0, 0);
  };

  const goToDashboard = () => {
    setActiveJobId(null);
    setViewMode('dashboard');
    setIsTaskFormOpen(false);
  };

  // --- Job Actions ---
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobAddress.trim()) return;

    const newJob: Job = {
      id: crypto.randomUUID(),
      address: newJobAddress,
      clientName: newJobClient,
      tasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setJobs(prev => [newJob, ...prev]);
    setNewJobAddress('');
    setNewJobClient('');
    setIsJobFormOpen(false);
  };

  const deleteJob = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this entire job and all its tasks?')) {
      setJobs(prev => prev.filter(j => j.id !== id));
    }
  };

  // --- Image Processing ---
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          // Resize to max 1024px
          const MAX_SIZE = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to 70% JPEG
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          } else {
            // Fallback if context fails
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => {
           // Fallback if image load fails
           resolve(event.target?.result as string);
        }
      };
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsProcessingImages(true);
      const processedImages: string[] = [];
      
      try {
        // Process sequentially to avoid freezing UI too much
        for (let i = 0; i < files.length; i++) {
          const base64 = await compressImage(files[i]);
          processedImages.push(base64);
        }
        setImagePreviews(prev => [...prev, ...processedImages]);
      } catch (err) {
        console.error("Error processing images", err);
        alert("Could not process one or more images.");
      } finally {
        setIsProcessingImages(false);
      }
    }
  };

  const removeImagePreview = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- Task Actions ---
  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskTime('');
    setTaskMaterials('');
    setTaskTools('');
    setTaskDescription('');
    setImagePreviews([]);
    setIsTaskFormOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !activeJobId) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      estimatedTime: taskTime,
      description: taskDescription,
      materials: taskMaterials.split(',').map(s => s.trim()).filter(Boolean),
      tools: taskTools.split(',').map(s => s.trim()).filter(Boolean),
      imageUrls: imagePreviews,
      isCompleted: false,
      createdAt: Date.now(),
    };

    setJobs(prev => prev.map(job => {
      if (job.id === activeJobId) {
        return {
          ...job,
          tasks: [newTask, ...job.tasks],
          updatedAt: Date.now()
        };
      }
      return job;
    }));

    resetTaskForm();
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Delete this entry?')) {
      setJobs(prev => prev.map(job => {
        if (job.id === activeJobId) {
          return {
            ...job,
            tasks: job.tasks.filter(t => t.id !== taskId),
            updatedAt: Date.now()
          };
        }
        return job;
      }));
    }
  };

  const activeJob = jobs.find(j => j.id === activeJobId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans print:bg-white print:pb-0 print:h-auto print:overflow-visible">
      
      {/* Storage Warning */}
      {storageError && (
        <div className="bg-red-600 text-white p-2 text-center text-sm font-bold print:hidden sticky top-0 z-50">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle size={16} />
            {storageError}
          </div>
        </div>
      )}

      {/* Header - Hidden when printing */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-20 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {viewMode === 'job-detail' ? (
               <button 
                 onClick={goToDashboard}
                 className="p-2 -ml-2 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2"
               >
                 <ArrowLeft size={20} />
                 <span className="text-sm font-semibold text-slate-300">Back to Jobs</span>
               </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-1.5 rounded-lg">
                  <Hammer className="text-white h-5 w-5" />
                </div>
                <div>
                   <h1 className="text-xl font-bold tracking-tight">JobSite Log</h1>
                </div>
              </div>
            )}
          </div>

          {/* Action Button based on View */}
          {viewMode === 'dashboard' ? (
            // SMART UI: Only show 'New Job' button in header if we actually have jobs.
            // If empty, the big call-to-action is enough.
            jobs.length > 0 && (
              <button 
                onClick={() => setIsJobFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-orange-500/30 text-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Job</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-2">
               <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full font-medium transition-all text-sm mr-2"
                title="Print or Save as PDF"
               >
                 <Printer size={18} />
                 <span className="hidden sm:inline">Print / PDF</span>
               </button>

               <button 
                onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm ${isTaskFormOpen ? 'bg-slate-700 text-white' : 'bg-orange-600 text-white hover:bg-orange-500 shadow-lg hover:shadow-orange-500/30'}`}
              >
                {isTaskFormOpen ? <X size={18} /> : <Plus size={18} />}
                <span className="hidden sm:inline">{isTaskFormOpen ? 'Cancel' : 'Add Item'}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Job Sub-header */}
        {viewMode === 'job-detail' && activeJob && (
          <div className="border-t border-slate-800 bg-slate-900 pb-4 pt-1 px-4">
             <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MapPin className="text-orange-500" size={24} />
                  {activeJob.address}
                </h2>
                {activeJob.clientName && (
                  <p className="text-slate-400 text-sm ml-8">{activeJob.clientName}</p>
                )}
             </div>
          </div>
        )}
      </header>

      {/* Print Header - Visible ONLY when printing */}
      <div className="hidden print:block border-b-2 border-black pb-6 mb-8 pt-8 px-8">
         <div className="flex justify-between items-start">
           <div>
             <h1 className="text-4xl font-bold text-black">{activeJob?.address}</h1>
             {activeJob?.clientName && <p className="text-xl text-gray-600 mt-2">Client: {activeJob.clientName}</p>}
           </div>
           <div className="text-right">
             <div className="flex items-center justify-end gap-2 text-black font-bold text-xl mb-1">
               <Hammer size={24} /> JobSite Estimate
             </div>
             <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
             <p className="text-sm text-gray-500 mt-1">{activeJob?.tasks.length} Items</p>
           </div>
         </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 print:px-8 print:py-0 print:max-w-full">
        
        {/* --- DASHBOARD VIEW --- */}
        {viewMode === 'dashboard' && (
          <>
            {isJobFormOpen && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 print:hidden">
                 <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg">Add New Job</h3>
                      <button onClick={() => setIsJobFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                      </button>
                    </div>
                    <form onSubmit={handleAddJob} className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Job Address / Name *</label>
                        <input 
                          autoFocus
                          required
                          type="text" 
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="e.g. 42 Wallaby Way"
                          value={newJobAddress}
                          onChange={e => setNewJobAddress(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Client Name (Optional)</label>
                        <input 
                          type="text" 
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          placeholder="e.g. P. Sherman"
                          value={newJobClient}
                          onChange={e => setNewJobClient(e.target.value)}
                        />
                      </div>
                      <div className="pt-2">
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-colors">
                          Create Job
                        </button>
                      </div>
                    </form>
                 </div>
               </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
              {jobs.length === 0 ? (
                <div className="md:col-span-2 text-center py-24 bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4">
                    <HardHat className="text-slate-300" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700">No Jobs Recorded</h3>
                  <p className="text-slate-400 mt-2 mb-6">Create a job to start logging items.</p>
                  <button 
                    onClick={() => setIsJobFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold transition-all shadow-lg"
                  >
                    <Plus size={18} /> Create First Job
                  </button>
                </div>
              ) : (
                jobs.map(job => (
                  <JobProjectCard 
                    key={job.id} 
                    job={job} 
                    onClick={openJob}
                    onDelete={deleteJob}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* --- JOB DETAILS VIEW --- */}
        {viewMode === 'job-detail' && activeJob && (
          <>
            {/* Add Task Form - Hidden when printing */}
            {isTaskFormOpen && (
              <div className="mb-8 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 print:hidden">
                <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <Clipboard size={18} />
                    Record New Item for {activeJob.address}
                  </h2>
                </div>
                
                <form onSubmit={handleAddTask} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Item Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Paint Living Room"
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          value={taskTitle}
                          onChange={(e) => setTaskTitle(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Est. Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 2 hours, 30 mins"
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          value={taskTime}
                          onChange={(e) => setTaskTime(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                        <textarea
                          rows={3}
                          placeholder="Describe the work..."
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                          value={taskDescription}
                          onChange={(e) => setTaskDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Materials (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Paint, Tape, Primer"
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          value={taskMaterials}
                          onChange={(e) => setTaskMaterials(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Tools (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Brush, Roller, Ladder"
                          className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          value={taskTools}
                          onChange={(e) => setTaskTools(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Photos</label>
                        <div className="space-y-3">
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isProcessingImages}
                              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors text-sm font-medium disabled:opacity-50"
                            >
                              <ImageIcon size={18} />
                              {isProcessingImages ? 'Processing...' : 'Add Photos'}
                            </button>
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept="image/*" 
                              multiple
                              className="hidden" 
                              onChange={handleImageUpload} 
                            />
                            <span className="text-xs text-slate-400">{imagePreviews.length} photos selected</span>
                          </div>
                          
                          {imagePreviews.length > 0 && (
                            <div className="flex gap-3 overflow-x-auto py-2">
                              {imagePreviews.map((src, idx) => (
                                <div key={idx} className="relative flex-shrink-0 h-20 w-20 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 group">
                                  <img src={src} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeImagePreview(idx)}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button 
                      type="button" 
                      onClick={resetTaskForm}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isProcessingImages}
                      className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2 disabled:bg-slate-600"
                    >
                      <Save size={18} />
                      Save Entry
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">
              {/* Task List */}
              <div className="lg:col-span-2 space-y-6 print:space-y-0 print:block">
                {activeJob.tasks.length === 0 && !isTaskFormOpen ? (
                  <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200 print:border-black">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4 print:hidden">
                      <Clipboard className="text-slate-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 print:text-black">Job Log Empty</h3>
                    <p className="text-slate-400 mt-2 print:text-gray-600">No tasks recorded for this address yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 print:block print:gap-0">
                    {activeJob.tasks.map((task, index) => (
                      <div key={task.id} className="print:break-inside-avoid print:mb-8">
                        <TaskCard 
                          task={task} 
                          index={index}
                          onDelete={deleteTask} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sidebar - Hidden when printing */}
              <div className="lg:col-span-1 print:hidden">
                 <SummarySidebar 
                    tasks={activeJob.tasks} 
                    jobAddress={activeJob.address} 
                    clientName={activeJob.clientName}
                 />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;