import React, { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AiSuggestionModal from './components/AiSuggestionModal';
import TaskEditModal from './components/TaskEditModal';
import SettingsPage from './components/SettingsPage';
import { INITIAL_PROJECT_STATE, INITIAL_USERS } from './constants';
import { Project, Task, Comment, User } from './types';

const AppContent: React.FC = () => {
    const [project, setProject] = useState<Project>(INITIAL_PROJECT_STATE);
    const [users, setUsers] = useState<Record<string, User>>(INITIAL_USERS);
    const [featureFlags, setFeatureFlags] = useState({ aiSuggestionsEnabled: true });
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [modalState, setModalState] = useState<{ mode: 'new' | 'edit' | 'closed'; data?: { taskId?: string; columnId?: string } }>({ mode: 'closed' });
    
    const location = useLocation();
    let activeView: 'board' | 'analytics' | 'settings' = 'board';
    if (location.pathname === '/analytics') {
        activeView = 'analytics';
    } else if (location.pathname === '/settings') {
        activeView = 'settings';
    }


    const handleTaskMove = useCallback((taskId: string, newColumnId: string) => {
        if (!project) return;
        
        const newProject = { ...project, columns: { ...project.columns } };
        
        let sourceColumnId: string | null = null;
        for (const colId in newProject.columns) {
            if (newProject.columns[colId].taskIds.includes(taskId)) {
                sourceColumnId = colId;
                if(sourceColumnId === newColumnId) return;

                newProject.columns[colId] = {
                    ...newProject.columns[colId],
                    taskIds: newProject.columns[colId].taskIds.filter(id => id !== taskId)
                };
                break;
            }
        }

        if (sourceColumnId) {
            const newColumn = { ...newProject.columns[newColumnId] };
            newColumn.taskIds.push(taskId);
            newProject.columns[newColumnId] = newColumn;
        }
        
        updateProject(newProject);
    }, [project, updateProject]);

    const handleOpenModal = (mode: 'new' | 'edit', data: { taskId?: string; columnId?: string }) => {
        setModalState({ mode, data });
    };

    const handleCloseModal = () => {
        setModalState({ mode: 'closed' });
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'comments'>, existingTaskId?: string, columnId?: string) => {
        if (!project) return;
        
        const newProject = { ...project, tasks: { ...project.tasks } };

        if (existingTaskId) { // Editing existing task
            const updatedTask = { ...newProject.tasks[existingTaskId], ...taskData };
            newProject.tasks[existingTaskId] = updatedTask;
        } else if(columnId) { // Creating new task
            const newId = `task-${Date.now()}`;
            const newTask: Task = {
                ...taskData,
                id: newId,
                comments: [],
            };
            newProject.tasks[newId] = newTask;

            const newColumns = { ...newProject.columns };
            newColumns[columnId] = {
                ...newColumns[columnId],
                taskIds: [...newColumns[columnId].taskIds, newId]
            };
            newProject.columns = newColumns;
        }

        updateProject(newProject);
        handleCloseModal();
    };
    
    const handleDeleteTask = (taskId: string) => {
        if (!project) return;
        
        const newProject = { ...project };
        const newTasks = { ...newProject.tasks };
        delete newTasks[taskId];
        newProject.tasks = newTasks;

        const newColumns = { ...newProject.columns };
        for(const colId in newColumns) {
            newColumns[colId] = {
                ...newColumns[colId],
                taskIds: newColumns[colId].taskIds.filter(id => id !== taskId)
            }
        }
        newProject.columns = newColumns;

        updateProject(newProject);
        handleCloseModal();
    };

    const handleAddComment = (taskId: string, text: string) => {
        if (!project || !currentUser) return;
        
        const newProject = { ...project };
        const task = newProject.tasks[taskId];
        if (!task) return;

        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            userId: currentUser.id,
            text,
            timestamp: new Date().toISOString()
        };

        const updatedTask = {
            ...task,
            comments: [...task.comments, newComment]
        };

        newProject.tasks[taskId] = updatedTask;
        updateProject(newProject);
    };

    const handleSaveUser = (user: User) => {
        const newUsers = {
            ...users,
            [user.id]: user,
        };
        updateUsers(newUsers);
    };

    const handleDeleteUser = (userId: string) => {
        if (!project) return;
        
        // 1. Remove user from the users object
        const newUsers = { ...users };
        delete newUsers[userId];
        updateUsers(newUsers);

        // 2. Remove user from all task assignments
        const newTasks = { ...project.tasks };
        Object.keys(newTasks).forEach(taskId => {
            const task = newTasks[taskId];
            const newAssigneeIds = task.assigneeIds.filter(id => id !== userId);
            if (newAssigneeIds.length !== task.assigneeIds.length) {
                newTasks[taskId] = { ...task, assigneeIds: newAssigneeIds };
            }
        });
        updateProject({ ...project, tasks: newTasks });
    };
    
    const handleToggleFeature = (feature: keyof typeof featureFlags) => {
        setFeatureFlags(prevFlags => ({
            ...prevFlags,
            [feature]: !prevFlags[feature],
        }));
    };

    // Show loading state while data is being loaded
    if (isLoading || !project) {
        return (
            <div className="flex items-center justify-center h-screen bg-secondary">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your project...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-secondary font-sans">
            <Header 
                projectName={project.name} 
                activeView={activeView}
                onAiClick={() => setAiModalOpen(true)}
                isAiEnabled={featureFlags.aiSuggestionsEnabled}
            />
            
            {/* Active Users Bar */}
            <div className="bg-white border-b border-gray-200 px-4 py-2">
                <ActiveUsers 
                    activeUsers={activeUsers}
                    currentUser={currentUser}
                    lastUpdate={lastUpdate}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            </div>
            <main className="flex-grow overflow-hidden">
                <Routes>
                    <Route path="/" element={
                        <KanbanBoard 
                            project={project}
                            users={users}
                            onTaskMove={handleTaskMove}
                            onTaskClick={(task) => handleOpenModal('edit', { taskId: task.id })} 
                            onAddTask={(columnId) => handleOpenModal('new', { columnId })}
                        />
                    } />
                    <Route path="/analytics" element={<AnalyticsDashboard project={project} users={users} />} />
                    <Route path="/settings" element={
                        <SettingsPage 
                            users={users}
                            featureFlags={featureFlags}
                            onSaveUser={handleSaveUser}
                            onDeleteUser={handleDeleteUser}
                            onToggleFeature={handleToggleFeature}
                        />
                    } />
                </Routes>
            </main>
            <AiSuggestionModal 
                isOpen={isAiModalOpen} 
                onClose={() => setAiModalOpen(false)} 
                project={project} 
            />
            <TaskEditModal
                isOpen={modalState.mode !== 'closed'}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                onDelete={handleDeleteTask}
                onAddComment={handleAddComment}
                task={modalState.mode === 'edit' && modalState.data?.taskId ? project.tasks[modalState.data.taskId] : null}
                columnId={modalState.mode === 'new' ? modalState.data?.columnId : null}
                users={users}
            />
        </div>
    );
};

const App: React.FC = () => (
    <HashRouter>
        <AppContent />
    </HashRouter>
);

export default App;