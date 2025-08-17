import React from 'react';
import { Project, User, Priority } from '../types';

interface AnalyticsDashboardProps {
  project: Project;
  users: Record<string, User>;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ project, users }) => {
  const tasks = Object.values(project.tasks);
  const columns = Object.values(project.columns);
  
  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = project.columns['column-4']?.taskIds.length || 0;
  const inProgressTasks = project.columns['column-2']?.taskIds.length || 0;
  const todoTasks = project.columns['column-1']?.taskIds.length || 0;
  const reviewTasks = project.columns['column-3']?.taskIds.length || 0;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Priority distribution
  const priorityStats = {
    [Priority.Low]: tasks.filter(t => t.priority === Priority.Low).length,
    [Priority.Medium]: tasks.filter(t => t.priority === Priority.Medium).length,
    [Priority.High]: tasks.filter(t => t.priority === Priority.High).length,
    [Priority.Urgent]: tasks.filter(t => t.priority === Priority.Urgent).length,
  };

  // User workload
  const userWorkload = Object.values(users).map(user => {
    const assignedTasks = tasks.filter(task => task.assigneeIds.includes(user.id));
    const completedUserTasks = assignedTasks.filter(task => 
      project.columns['column-4']?.taskIds.includes(task.id)
    );
    
    return {
      user,
      totalTasks: assignedTasks.length,
      completedTasks: completedUserTasks.length,
      completionRate: assignedTasks.length > 0 ? Math.round((completedUserTasks.length / assignedTasks.length) * 100) : 0
    };
  });

  // Overdue tasks
  const today = new Date();
  const overdueTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate < today && !project.columns['column-4']?.taskIds.includes(task.id);
  });

  // Tasks due soon (next 7 days)
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueSoonTasks = tasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= nextWeek && !project.columns['column-4']?.taskIds.includes(task.id);
  });

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 card-hover`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${color.replace('text-', '')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-secondary overflow-y-auto">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Analytics</h1>
          <p className="text-gray-600">Overview of {project.name} performance and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-in-up">
          <MetricCard
            title="Total Tasks"
            value={totalTasks}
            icon="📋"
            color="text-blue-600"
            subtitle={`Across ${columns.length} columns`}
          />
          <MetricCard
            title="Completed"
            value={completedTasks}
            icon="✅"
            color="text-green-600"
            subtitle={`${completionRate}% completion rate`}
          />
          <MetricCard
            title="In Progress"
            value={inProgressTasks}
            icon="🔄"
            color="text-blue-500"
            subtitle="Currently active"
          />
          <MetricCard
            title="Overdue"
            value={overdueTasks.length}
            icon="⚠️"
            color="text-red-600"
            subtitle="Need attention"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-in-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">To Do</span>
                  <span className="font-medium">{todoTasks} tasks</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill bg-gray-400 h-full"
                    style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">In Progress</span>
                  <span className="font-medium">{inProgressTasks} tasks</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill bg-blue-400 h-full"
                    style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">In Review</span>
                  <span className="font-medium">{reviewTasks} tasks</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill bg-yellow-400 h-full"
                    style={{ width: `${totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium">{completedTasks} tasks</span>
                </div>
                <div className="progress-bar h-3">
                  <div 
                    className="progress-fill bg-green-400 h-full"
                    style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Overall Progress Circle */}
            <div className="mt-6 text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                    className="text-green-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">Overall Completion</p>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-in-right">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔴</span>
                  <span className="font-medium text-gray-900">Urgent</span>
                </div>
                <span className="text-lg font-bold text-red-600">{priorityStats[Priority.Urgent]}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟠</span>
                  <span className="font-medium text-gray-900">High</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{priorityStats[Priority.High]}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟡</span>
                  <span className="font-medium text-gray-900">Medium</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{priorityStats[Priority.Medium]}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🟢</span>
                  <span className="font-medium text-gray-900">Low</span>
                </div>
                <span className="text-lg font-bold text-green-600">{priorityStats[Priority.Low]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userWorkload.map(({ user, totalTasks: userTasks, completedTasks: userCompleted, completionRate: userRate }) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="avatar avatar-md"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-600">{userTasks} tasks</p>
                  </div>
                </div>
                
                <div className="progress-bar h-2 mb-2">
                  <div 
                    className="progress-fill bg-primary h-full"
                    style={{ width: `${userRate}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed: {userCompleted}</span>
                  <span className="font-medium text-gray-900">{userRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl">⚠️</span>
                  <h3 className="text-lg font-semibold text-red-700">Overdue Tasks</h3>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {overdueTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">🔴</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <p className="text-xs text-red-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {overdueTasks.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{overdueTasks.length - 5} more overdue tasks
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Due Soon */}
            {dueSoonTasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xl">📅</span>
                  <h3 className="text-lg font-semibold text-yellow-700">Due This Week</h3>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {dueSoonTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm">🟡</span>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                        <p className="text-xs text-yellow-600">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {dueSoonTasks.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{dueSoonTasks.length - 5} more tasks due soon
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;