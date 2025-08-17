import { Project, User } from '../types';

export interface DataUpdate {
  id: string;
  timestamp: number;
  userId: string;
  type: 'project' | 'user';
  action: 'create' | 'update' | 'delete';
  data: any;
  projectId?: string;
}

export interface UserActivity {
  userId: string;
  userName: string;
  lastSeen: number;
  currentPage: string;
  isActive: boolean;
}

class DataService {
  private storagePrefix = 'synergy_';
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private updateListeners: Array<(update: DataUpdate) => void> = [];
  private activityListeners: Array<(activities: UserActivity[]) => void> = [];
  private currentUser: User | null = null;
  private currentProjectId: string = 'proj-1'; // Default project ID

  constructor() {
    // Initialize current user
    this.initializeCurrentUser();
    
    // Start sync service
    this.startSyncService();

    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', this.handleStorageChange.bind(this));

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Update activity on page interactions
    this.setupActivityTracking();
  }

  private initializeCurrentUser() {
    let user = this.getStoredData<User>('current_user');
    if (!user) {
      // Create a new user if none exists
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: `User ${Math.floor(Math.random() * 1000)}`,
        avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/32/32`
      };
      this.setStoredData('current_user', user);
    }
    this.currentUser = user;
  }

  private setupActivityTracking() {
    const updateActivity = () => {
      if (this.currentUser) {
        this.updateUserActivity(this.currentUser.id, window.location.hash || '/');
      }
    };

    // Update activity on mouse movement, clicks, and keyboard events
    ['mousemove', 'click', 'keypress', 'scroll'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Update activity on hash change (route changes)
    window.addEventListener('hashchange', updateActivity);
  }

  private startSyncService() {
    // Sync every 2 seconds for real-time feel
    this.syncInterval = setInterval(() => {
      this.syncData();
      this.broadcastActivity();
    }, 2000);
  }

  private handleStorageChange(e: StorageEvent) {
    if (e.key?.startsWith(this.storagePrefix)) {
      // Another tab/user updated data, notify listeners
      const key = e.key.replace(this.storagePrefix, '');
      
      if (key === 'updates' && e.newValue) {
        const updates: DataUpdate[] = JSON.parse(e.newValue);
        const newUpdates = updates.filter(u => u.timestamp > this.lastSyncTime);
        newUpdates.forEach(update => {
          this.updateListeners.forEach(listener => listener(update));
        });
        this.lastSyncTime = Math.max(...updates.map(u => u.timestamp));
      }
      
      if (key === 'user_activities' && e.newValue) {
        const activities: UserActivity[] = JSON.parse(e.newValue);
        this.activityListeners.forEach(listener => listener(activities));
      }
    }
  }

  private handleVisibilityChange() {
    if (document.hidden && this.currentUser) {
      // User switched tabs or minimized window
      this.updateUserActivity(this.currentUser.id, window.location.hash || '/', false);
    } else if (!document.hidden && this.currentUser) {
      // User came back
      this.updateUserActivity(this.currentUser.id, window.location.hash || '/', true);
    }
  }

  // Data persistence methods
  saveProject(project: Project): void {
    this.setStoredData(`project_${project.id}`, project);
    this.addUpdate({
      id: `update_${Date.now()}`,
      timestamp: Date.now(),
      userId: this.currentUser?.id || 'anonymous',
      type: 'project',
      action: 'update',
      data: project,
      projectId: project.id
    });
  }

  loadProject(projectId: string): Project | null {
    return this.getStoredData<Project>(`project_${projectId}`);
  }

  saveUsers(users: Record<string, User>): void {
    this.setStoredData('users', users);
    this.addUpdate({
      id: `update_${Date.now()}`,
      timestamp: Date.now(),
      userId: this.currentUser?.id || 'anonymous',
      type: 'user',
      action: 'update',
      data: users
    });
  }

  loadUsers(): Record<string, User> | null {
    return this.getStoredData<Record<string, User>>('users');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  updateCurrentUser(user: User): void {
    this.currentUser = user;
    this.setStoredData('current_user', user);
  }

  // Real-time sync methods
  private addUpdate(update: DataUpdate): void {
    const updates = this.getStoredData<DataUpdate[]>('updates') || [];
    updates.push(update);
    
    // Keep only last 100 updates to prevent storage bloat
    const recentUpdates = updates.slice(-100);
    this.setStoredData('updates', recentUpdates);
    
    // Notify local listeners immediately
    this.updateListeners.forEach(listener => listener(update));
  }

  private syncData(): void {
    const updates = this.getStoredData<DataUpdate[]>('updates') || [];
    const newUpdates = updates.filter(u => u.timestamp > this.lastSyncTime);
    
    if (newUpdates.length > 0) {
      this.lastSyncTime = Math.max(...newUpdates.map(u => u.timestamp));
    }
  }

  private updateUserActivity(userId: string, currentPage: string, isActive: boolean = true): void {
    const activities = this.getStoredData<UserActivity[]>('user_activities') || [];
    const existingIndex = activities.findIndex(a => a.userId === userId);
    
    const activity: UserActivity = {
      userId,
      userName: this.currentUser?.name || 'Unknown User',
      lastSeen: Date.now(),
      currentPage,
      isActive: isActive && !document.hidden
    };

    if (existingIndex >= 0) {
      activities[existingIndex] = activity;
    } else {
      activities.push(activity);
    }

    // Clean up old activities (older than 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const activeActivities = activities.filter(a => a.lastSeen > fiveMinutesAgo);

    this.setStoredData('user_activities', activeActivities);
  }

  private broadcastActivity(): void {
    const activities = this.getStoredData<UserActivity[]>('user_activities') || [];
    this.activityListeners.forEach(listener => listener(activities));
  }

  // Event listeners
  onDataUpdate(listener: (update: DataUpdate) => void): () => void {
    this.updateListeners.push(listener);
    return () => {
      const index = this.updateListeners.indexOf(listener);
      if (index > -1) {
        this.updateListeners.splice(index, 1);
      }
    };
  }

  onUserActivity(listener: (activities: UserActivity[]) => void): () => void {
    this.activityListeners.push(listener);
    return () => {
      const index = this.activityListeners.indexOf(listener);
      if (index > -1) {
        this.activityListeners.splice(index, 1);
      }
    };
  }

  // Utility methods
  private getStorageKey(key: string): string {
    return `${this.storagePrefix}${key}`;
  }

  private setStoredData<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.getStorageKey(key), JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  private getStoredData<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.getStorageKey(key));
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return null;
    }
  }

  // Export/Import for backup
  exportAllData(): string {
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        const cleanKey = key.replace(this.storagePrefix, '');
        allData[cleanKey] = this.getStoredData(cleanKey);
      }
    }
    return JSON.stringify(allData, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      Object.keys(data).forEach(key => {
        this.setStoredData(key, data[key]);
      });
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  clearAllData(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.storagePrefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }
}

// Singleton instance
export const dataService = new DataService();