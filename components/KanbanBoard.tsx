import React, { useState, useCallback } from 'react';
import { Project, Task, User } from '../types';
import TaskCard from './TaskCard';

interface KanbanBoardProps {
  project: Project;
  users: Record<string, User>;
  onTaskMove: (taskId: string, newColumnId: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (columnId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  project,
  users,
  onTaskMove,
  onTaskClick,
  onAddTask,
}) => {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = useCallback((taskId: string) => {
    setDraggedTask(taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedTask) {
      onTaskMove(draggedTask, columnId);
    }
    setDraggedTask(null);
    setDragOverColumn(null);
  }, [draggedTask, onTaskMove]);

  const getColumnIcon = (columnId: string) => {
    switch (columnId) {
      case 'column-1': return '📝';
      case 'column-2': return '🔄';
      case 'column-3': return '👀';
      case 'column-4': return '✅';
      default: return '📋';
    }
  };

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'column-1': return 'bg-gray-100 border-gray-300';
      case 'column-2': return 'bg-blue-50 border-blue-300';
      case 'column-3': return 'bg-yellow-50 border-yellow-300';
      case 'column-4': return 'bg-green-50 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="h-full bg-secondary overflow-hidden">
      <div className="h-full p-4 md:p-6">
        <div className="flex space-x-4 md:space-x-6 h-full overflow-x-auto pb-4">
          {project.columnOrder.map((columnId) => {
            const column = project.columns[columnId];
            const tasks = column.taskIds.map(taskId => project.tasks[taskId]).filter(Boolean);
            const isDragOver = dragOverColumn === columnId;

            return (
              <div
                key={columnId}
                className={`flex-shrink-0 w-72 md:w-80 bg-white rounded-xl shadow-sm border ${
                  isDragOver ? 'drop-zone' : 'border-gray-200'
                } transition-all duration-200`}
                onDragOver={(e) => handleDragOver(e, columnId)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, columnId)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getColumnIcon(columnId)}</span>
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                      <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {tasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => onAddTask(columnId)}
                      className="btn btn-ghost p-1 text-gray-400 hover:text-gray-600"
                      title="Add task"
                    >
                      <span className="text-lg">➕</span>
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="progress-bar h-1">
                    <div 
                      className={`progress-fill h-full ${getColumnColor(columnId).replace('bg-', 'bg-').replace('-50', '-400')}`}
                      style={{ width: `${Math.min(100, (tasks.length / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <p className="text-sm">No tasks yet</p>
                      <button
                        onClick={() => onAddTask(columnId)}
                        className="btn btn-ghost mt-2 text-sm"
                      >
                        Add first task
                      </button>
                    </div>
                  ) : (
                    tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="animate-slide-in-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <TaskCard
                          task={task}
                          users={users}
                          onClick={() => onTaskClick(task)}
                          onDragStart={() => handleDragStart(task.id)}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedTask === task.id}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Add Task Button */}
                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => onAddTask(columnId)}
                    className="w-full btn btn-ghost text-gray-500 hover:text-gray-700 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-all duration-200"
                  >
                    <span className="text-lg mr-2">➕</span>
                    Add a card
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;