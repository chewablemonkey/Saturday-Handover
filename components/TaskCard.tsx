import React from 'react';
import { Task, User, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  users: Record<string, User>;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  users,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
}) => {
  const assignees = task.assigneeIds.map(id => users[id]).filter(Boolean);
  
  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.Low: return 'priority-low';
      case Priority.Medium: return 'priority-medium';
      case Priority.High: return 'priority-high';
      case Priority.Urgent: return 'priority-urgent';
      default: return 'priority-low';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.Low: return '🟢';
      case Priority.Medium: return '🟡';
      case Priority.High: return '🟠';
      case Priority.Urgent: return '🔴';
      default: return '🟢';
    }
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
    onDragStart();
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer card-hover transition-all duration-200 ${
        isDragging ? 'dragging' : ''
      }`}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 flex-1 mr-2">
          {task.title}
        </h4>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {getPriorityIcon(task.priority)}
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="text-gray-400 text-xs">
              +{task.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Due Date */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1 text-xs">
          <span>📅</span>
          <span className={`font-medium ${
            isOverdue 
              ? 'text-red-600' 
              : isDueSoon 
                ? 'text-orange-600' 
                : 'text-gray-600'
          }`}>
            {isOverdue 
              ? `${Math.abs(daysUntilDue)} days overdue`
              : isDueSoon
                ? `Due in ${daysUntilDue} days`
                : new Date(task.dueDate).toLocaleDateString()
            }
          </span>
        </div>
        
        {/* Comments Count */}
        {task.comments.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>💬</span>
            <span>{task.comments.length}</span>
          </div>
        )}
      </div>

      {/* Assignees and Progress */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex items-center">
          {assignees.length > 0 ? (
            <div className="avatar-stack">
              {assignees.slice(0, 3).map((user) => (
                <img
                  key={user.id}
                  src={user.avatarUrl}
                  alt={user.name}
                  className="avatar avatar-sm"
                  title={user.name}
                />
              ))}
              {assignees.length > 3 && (
                <div className="avatar avatar-sm bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center text-xs text-gray-500">
              <span className="mr-1">👤</span>
              <span>Unassigned</span>
            </div>
          )}
        </div>

        {/* Subtasks Progress */}
        {task.subtaskIds.length > 0 && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <span>✓</span>
            <span>0/{task.subtaskIds.length}</span>
          </div>
        )}
      </div>

      {/* Dependencies Indicator */}
      {task.dependsOn.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>🔗</span>
            <span>Depends on {task.dependsOn.length} task{task.dependsOn.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Overdue Warning */}
      {isOverdue && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <span>⚠️</span>
            <span>This task is overdue</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;