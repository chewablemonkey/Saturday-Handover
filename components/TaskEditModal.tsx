import React, { useState, useEffect } from 'react';
import { Task, User, Priority } from '../types';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'comments'>, existingTaskId?: string, columnId?: string) => void;
  onDelete?: (taskId: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  task: Task | null;
  columnId: string | null;
  users: Record<string, User>;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  onAddComment,
  task,
  columnId,
  users,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: Priority.Medium,
    startDate: '',
    dueDate: '',
    assigneeIds: [] as string[],
    tags: [] as string[],
    subtaskIds: [] as string[],
    dependsOn: [] as string[],
  });
  const [newComment, setNewComment] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = task !== null;

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        assigneeIds: task.assigneeIds,
        tags: task.tags,
        subtaskIds: task.subtaskIds,
        dependsOn: task.dependsOn,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: Priority.Medium,
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        assigneeIds: [],
        tags: [],
        subtaskIds: [],
        dependsOn: [],
      });
    }
    setErrors({});
    setNewComment('');
    setTagInput('');
  }, [task]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.dueDate && formData.startDate && formData.dueDate < formData.startDate) {
      newErrors.dueDate = 'Due date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      onSave(formData, task?.id, columnId || undefined);
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddComment = async () => {
    if (newComment.trim() && task) {
      onAddComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleToggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(userId)
        ? prev.assigneeIds.filter(id => id !== userId)
        : [...prev.assigneeIds, userId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="modal-overlay fixed inset-0" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto animate-slide-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h2>
            <button
              onClick={onClose}
              className="btn btn-ghost p-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`form-input ${errors.title ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Enter task title..."
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-textarea h-24"
                placeholder="Describe the task..."
              />
            </div>

            {/* Priority and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Priority }))}
                  className="form-select"
                >
                  <option value={Priority.Low}>🟢 Low</option>
                  <option value={Priority.Medium}>🟡 Medium</option>
                  <option value={Priority.High}>🟠 High</option>
                  <option value={Priority.Urgent}>🔴 Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className={`form-input ${errors.dueDate ? 'border-red-300 focus:ring-red-500' : ''}`}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Assignees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignees
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(users).map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.assigneeIds.includes(user.id)}
                      onChange={() => handleToggleAssignee(user.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="avatar avatar-sm"
                    />
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="form-input flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="btn btn-secondary"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-500 hover:text-blue-700 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Comments Section (Edit Mode Only) */}
            {isEditing && task && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments ({task.comments.length})
                </label>
                
                {/* Add Comment */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddComment())}
                    className="form-input flex-1"
                    placeholder="Add a comment..."
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="btn btn-primary"
                  >
                    💬
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {task.comments.map((comment) => {
                    const user = users[comment.userId];
                    return (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <img
                            src={user?.avatarUrl}
                            alt={user?.name}
                            className="avatar avatar-sm"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {user?.name || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <div>
                {isEditing && onDelete && (
                  <button
                    type="button"
                    onClick={() => task && onDelete(task.id)}
                    className="btn btn-danger"
                  >
                    🗑️ Delete Task
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    isEditing ? '💾 Save Changes' : '✅ Create Task'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;