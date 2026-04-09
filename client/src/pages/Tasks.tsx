import React, { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import type { Task, TaskFormData } from '../types';
import { Layout } from '../components/Layout';
import {
  Plus,
  Search,
  Calendar,
  Flag,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSubmit }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    status: 'pending',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        deadline: new Date(task.deadline).toISOString().split('T')[0],
        priority: task.priority,
        status: task.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        deadline: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
      });
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg animate-fade-in">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter task title"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskFormData['priority'] })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskFormData['status'] })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<{ total: number; completed: number; pending: number; overdue: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      setTasks(response.data.data);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (data: TaskFormData) => {
    try {
      await taskAPI.createTask(data);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    try {
      await taskAPI.updateTask(editingTask._id, data);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await taskAPI.deleteTask(id);
      fetchTasks();
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await taskAPI.updateTask(task._id, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (task: Task) => {
    return task.status !== 'completed' && new Date() > new Date(task.deadline);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
            <p className="text-slate-500">Manage and organize your tasks efficiently</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
              <p className="text-slate-500 mb-4">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-green-500 border-green-500'
                          : 'border-slate-300 hover:border-primary-500'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            task.status === 'completed'
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </h3>
                        {isOverdue(task) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p
                          className={`text-sm mb-3 ${
                            task.status === 'completed' ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        >
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span
                          className={`px-2.5 py-1 rounded-full font-medium border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          <Flag className="w-3 h-3 inline mr-1" />
                          {task.priority}
                        </span>

                        <span
                          className={`px-2.5 py-1 rounded-full font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status.replace('-', ' ')}
                        </span>

                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-4 h-4" />
                          {formatDate(task.deadline)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-2 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(task._id)}
                        className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {stats && (
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            <span>Total: <strong className="text-slate-900">{stats.total}</strong></span>
            <span>Completed: <strong className="text-green-600">{stats.completed}</strong></span>
            <span>Pending: <strong className="text-yellow-600">{stats.pending}</strong></span>
            <span>Overdue: <strong className="text-red-600">{stats.overdue}</strong></span>
          </div>
        )}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={editingTask}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
      />

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Delete Task</h3>
            <p className="text-slate-500 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(deleteConfirmId)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
