export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Task extends TaskFormData {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  isOverdue?: boolean;
}

export interface DashboardStats {
  stats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
    highPriority: number;
    overdue: number;
  };
  recentTasks: Task[];
  upcomingDeadlines: Task[];
}
