import React, { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import type { Task } from '../types';
import { Layout } from '../components/Layout';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Calendar: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTasksForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return tasks.filter((task) => {
      const taskDate = new Date(task.deadline).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-slate-500';
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-slate-500">View tasks by deadline</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-xl font-semibold text-slate-900 min-w-[150px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Week Day Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-sm font-semibold text-slate-600 bg-slate-50"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-slate-100 bg-slate-50/50" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayTasks = getTasksForDate(day);

              return (
                <div
                  key={day}
                  className={`min-h-[120px] border-r border-b border-slate-200 p-2 ${
                    isToday(day) ? 'bg-primary-50' : ''
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(day)
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task._id}
                        className={`text-xs p-1.5 rounded truncate cursor-pointer ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-700 line-through'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        title={task.title}
                      >
                        <span className={`inline-block w-2 h-2 rounded-full mr-1 ${getPriorityColor(task.priority)}`} />
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-slate-500 pl-1">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-600">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Low Priority</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};
