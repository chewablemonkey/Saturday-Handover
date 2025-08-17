import React, { useState } from 'react';
import { Project } from '../types';

interface AiSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

interface Suggestion {
  id: string;
  type: 'task' | 'optimization' | 'risk' | 'insight';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

const AiSuggestionModal: React.FC<AiSuggestionModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  // Generate AI suggestions based on project data
  const generateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const tasks = Object.values(project.tasks);
      const columns = Object.values(project.columns);
      
      const generatedSuggestions: Suggestion[] = [];

      // Task optimization suggestions
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        return dueDate < today && !project.columns['column-4']?.taskIds.includes(task.id);
      });

      if (overdueTasks.length > 0) {
        generatedSuggestions.push({
          id: 'overdue-tasks',
          type: 'risk',
          title: 'Overdue Tasks Detected',
          description: `${overdueTasks.length} tasks are overdue. Consider reprioritizing or reassigning these tasks to prevent project delays.`,
          action: 'Review overdue tasks and update deadlines',
          priority: 'high'
        });
      }

      // Workload balance
      const assigneeWorkload = tasks.reduce((acc, task) => {
        task.assigneeIds.forEach(assigneeId => {
          acc[assigneeId] = (acc[assigneeId] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const workloadValues = Object.values(assigneeWorkload);
      const maxWorkload = Math.max(...workloadValues);
      const minWorkload = Math.min(...workloadValues);

      if (workloadValues.length > 1 && maxWorkload - minWorkload > 3) {
        generatedSuggestions.push({
          id: 'workload-balance',
          type: 'optimization',
          title: 'Workload Imbalance Detected',
          description: 'Some team members have significantly more tasks than others. Consider redistributing tasks for better balance.',
          action: 'Redistribute tasks among team members',
          priority: 'medium'
        });
      }

      // Bottleneck analysis
      const inProgressTasks = project.columns['column-2']?.taskIds.length || 0;
      const reviewTasks = project.columns['column-3']?.taskIds.length || 0;
      
      if (reviewTasks > inProgressTasks * 0.5) {
        generatedSuggestions.push({
          id: 'review-bottleneck',
          type: 'risk',
          title: 'Review Bottleneck',
          description: 'Tasks are piling up in the review column. This might indicate a bottleneck in your approval process.',
          action: 'Streamline review process or add reviewers',
          priority: 'medium'
        });
      }

      // Task creation suggestion
      if (tasks.length < 10) {
        generatedSuggestions.push({
          id: 'more-tasks',
          type: 'insight',
          title: 'Project Scope Analysis',
          description: 'Your project has relatively few tasks. Consider breaking down larger tasks into smaller, more manageable pieces for better tracking.',
          action: 'Break down complex tasks into subtasks',
          priority: 'low'
        });
      }

      // High priority task suggestion
      const urgentTasks = tasks.filter(task => task.priority === 'Urgent' && !project.columns['column-4']?.taskIds.includes(task.id));
      if (urgentTasks.length > 0) {
        generatedSuggestions.push({
          id: 'urgent-focus',
          type: 'task',
          title: 'Focus on Urgent Tasks',
          description: `${urgentTasks.length} urgent tasks require immediate attention. Consider prioritizing these over other work.`,
          action: 'Prioritize urgent tasks for immediate completion',
          priority: 'high'
        });
      }

      // Completion rate insights
      const completedTasks = project.columns['column-4']?.taskIds.length || 0;
      const completionRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
      
      if (completionRate > 80) {
        generatedSuggestions.push({
          id: 'project-completion',
          type: 'insight',
          title: 'Project Near Completion',
          description: `Great progress! Your project is ${Math.round(completionRate)}% complete. Consider planning the next phase or conducting a retrospective.`,
          action: 'Plan project closure or next phase',
          priority: 'medium'
        });
      } else if (completionRate < 30) {
        generatedSuggestions.push({
          id: 'slow-progress',
          type: 'optimization',
          title: 'Accelerate Progress',
          description: 'Project progress is slower than optimal. Consider identifying blockers or adjusting timelines.',
          action: 'Review project timeline and remove blockers',
          priority: 'medium'
        });
      }

      setSuggestions(generatedSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const getSuggestionIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'task': return '📋';
      case 'optimization': return '⚡';
      case 'risk': return '⚠️';
      case 'insight': return '💡';
      default: return '🤖';
    }
  };

  const getSuggestionColor = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleGenerateSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestion(null);
    generateSuggestions();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="modal-overlay fixed inset-0" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-screen overflow-y-auto animate-slide-in-up">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI Project Assistant</h2>
                <p className="text-sm text-gray-600">Intelligent suggestions for {project.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost p-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                {isGenerating ? (
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing your project...</h3>
                      <p className="text-gray-600">AI is reviewing your tasks, deadlines, and team workload</p>
                    </div>
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">🤖</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to analyze your project</h3>
                      <p className="text-gray-600 mb-6">Get personalized suggestions to improve productivity, identify risks, and optimize your workflow</p>
                      <button
                        onClick={handleGenerateSuggestions}
                        className="btn btn-primary"
                      >
                        ✨ Generate AI Suggestions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Suggestions ({suggestions.length})
                  </h3>
                  <button
                    onClick={handleGenerateSuggestions}
                    className="btn btn-secondary text-sm"
                  >
                    🔄 Refresh
                  </button>
                </div>

                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedSuggestion === suggestion.id 
                          ? 'border-primary bg-primary-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSuggestion(
                        selectedSuggestion === suggestion.id ? null : suggestion.id
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getSuggestionIcon(suggestion.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSuggestionColor(suggestion.priority)}`}>
                              {suggestion.priority} priority
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{suggestion.description}</p>
                          
                          {selectedSuggestion === suggestion.id && (
                            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 animate-fade-in">
                              <div className="flex items-start space-x-2">
                                <span className="text-sm">💡</span>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm mb-1">Recommended Action:</p>
                                  <p className="text-gray-700 text-sm">{suggestion.action}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600">ℹ️</span>
                    <div>
                      <p className="text-blue-800 font-medium text-sm">How it works</p>
                      <p className="text-blue-700 text-xs mt-1">
                        AI analyzes your project data including task distribution, deadlines, team workload, and progress patterns to provide personalized suggestions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSuggestionModal;