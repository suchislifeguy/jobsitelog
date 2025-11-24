export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  materials: string[];
  tools: string[];
  imageUrls: string[]; // Changed from single optional imageUrl to array
  isCompleted: boolean;
  createdAt: number;
}

export interface Job {
  id: string;
  address: string;
  clientName?: string;
  tasks: Task[];
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'dashboard' | 'job-detail';