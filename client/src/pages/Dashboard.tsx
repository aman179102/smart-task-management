import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import type { DashboardStats, Task } from '../types';
import { Layout } from '../components/Layout';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  ArrowRight,
  Plus,
  Clock3,
  Flag,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats['stats'] | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await taskAPI.getDashboardStats();
      setStats(response.data.data.stats);
      setRecentTasks(response.data.data.recentTasks);
      setUpcomingDeadlines(response.data.data.upcomingDeadlines);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500">Overview of your tasks and progress</p>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Tasks</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stats?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Completed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats?.completed || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{stats?.pending || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Overdue</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats?.overdue || 0}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
                <button
                  onClick={() => navigate('/tasks')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  View All
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No tasks yet. Create your first task!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => navigate('/tasks')}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-2 h-12 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : isOverdue(task)
                            ? 'bg-red-500'
                            : 'bg-primary-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-sm text-slate-500">{formatDate(task.deadline)}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock3 className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </div>
            <div className="p-6">
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No upcoming deadlines in the next 7 days</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => navigate('/tasks')}
                      className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Flag
                          className={`w-5 h-5 ${
                            task.priority === 'high'
                              ? 'text-red-600'
                              : task.priority === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-sm text-slate-500">
                          Due {formatDate(task.deadline)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
