import { useState, useEffect, useCallback } from 'react';
import { dataService, DataUpdate, UserActivity } from '../services/DataService';
import { Project, User } from '../types';

export interface UseDataPersistenceReturn {
  // Data state
  project: Project | null;
  users: Record<string, User>;
  currentUser: User | null;
  
  // User activity
  activeUsers: UserActivity[];
  
  // Actions
  updateProject: (project: Project) => void;
  updateUsers: (users: Record<string, User>) => void;
  
  // Status
  isLoading: boolean;
  lastUpdate: number;
  hasUnsavedChanges: boolean;
  
  // Utility
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  clearData: () => void;
}

export const useDataPersistence = (initialProject?: Project, initialUsers?: Record<string, User>): UseDataPersistenceReturn => {
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUsers, setActiveUsers] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Get current user
      const user = dataService.getCurrentUser();
      setCurrentUser(user);
      
      // Load project data
      let loadedProject = null;
      if (initialProject) {
        loadedProject = dataService.loadProject(initialProject.id);
        if (!loadedProject) {
          // Save initial project if it doesn't exist
          loadedProject = initialProject;
          dataService.saveProject(loadedProject);
        }
      }
      setProject(loadedProject);
      
      // Load users data
      let loadedUsers = dataService.loadUsers();
      if (!loadedUsers && initialUsers) {
        // Save initial users if they don't exist
        loadedUsers = initialUsers;
        dataService.saveUsers(loadedUsers);
      }
      setUsers(loadedUsers || {});
      
      setIsLoading(false);
    };

    loadData();
  }, [initialProject, initialUsers]);

  // Set up real-time listeners
  useEffect(() => {
    // Listen for data updates from other users
    const unsubscribeUpdates = dataService.onDataUpdate((update: DataUpdate) => {
      // Don't process our own updates
      if (update.userId === currentUser?.id) return;
      
      setLastUpdate(update.timestamp);
      
      if (update.type === 'project' && update.data) {
        setProject(update.data as Project);
        setHasUnsavedChanges(false);
      } else if (update.type === 'user' && update.data) {
        setUsers(update.data as Record<string, User>);
        setHasUnsavedChanges(false);
      }
    });

    // Listen for user activity updates
    const unsubscribeActivity = dataService.onUserActivity((activities: UserActivity[]) => {
      // Filter out current user and inactive users
      const otherActiveUsers = activities.filter(activity => 
        activity.userId !== currentUser?.id && 
        activity.isActive &&
        Date.now() - activity.lastSeen < 30000 // Active in last 30 seconds
      );
      setActiveUsers(otherActiveUsers);
    });

    return () => {
      unsubscribeUpdates();
      unsubscribeActivity();
    };
  }, [currentUser]);

  // Auto-save when data changes
  useEffect(() => {
    if (project && !isLoading) {
      const timeoutId = setTimeout(() => {
        dataService.saveProject(project);
        setHasUnsavedChanges(false);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [project, isLoading]);

  useEffect(() => {
    if (Object.keys(users).length > 0 && !isLoading) {
      const timeoutId = setTimeout(() => {
        dataService.saveUsers(users);
        setHasUnsavedChanges(false);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [users, isLoading]);

  // Actions
  const updateProject = useCallback((newProject: Project) => {
    setProject(newProject);
    setHasUnsavedChanges(true);
    setLastUpdate(Date.now());
  }, []);

  const updateUsers = useCallback((newUsers: Record<string, User>) => {
    setUsers(newUsers);
    setHasUnsavedChanges(true);
    setLastUpdate(Date.now());
  }, []);

  // Utility functions
  const exportData = useCallback(() => {
    return dataService.exportAllData();
  }, []);

  const importData = useCallback((jsonData: string) => {
    const success = dataService.importData(jsonData);
    if (success) {
      // Reload data after import
      const loadedProject = project ? dataService.loadProject(project.id) : null;
      const loadedUsers = dataService.loadUsers();
      
      if (loadedProject) setProject(loadedProject);
      if (loadedUsers) setUsers(loadedUsers);
      
      setLastUpdate(Date.now());
      setHasUnsavedChanges(false);
    }
    return success;
  }, [project]);

  const clearData = useCallback(() => {
    dataService.clearAllData();
    setProject(initialProject || null);
    setUsers(initialUsers || {});
    setLastUpdate(Date.now());
    setHasUnsavedChanges(false);
  }, [initialProject, initialUsers]);

  return {
    // Data state
    project,
    users,
    currentUser,
    
    // User activity
    activeUsers,
    
    // Actions
    updateProject,
    updateUsers,
    
    // Status
    isLoading,
    lastUpdate,
    hasUnsavedChanges,
    
    // Utility
    exportData,
    importData,
    clearData,
  };
};