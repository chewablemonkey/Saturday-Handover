import React from 'react';
import { UserActivity } from '../services/DataService';

interface ActiveUsersProps {
  activeUsers: UserActivity[];
  currentUser: { id: string; name: string } | null;
  lastUpdate: number;
  hasUnsavedChanges: boolean;
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ 
  activeUsers, 
  currentUser, 
  lastUpdate,
  hasUnsavedChanges 
}) => {
  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const getPageName = (currentPage: string) => {
    switch (currentPage) {
      case '/':
      case '':
        return 'Board';
      case '/analytics':
      case '#/analytics':
        return 'Analytics';
      case '/settings':
      case '#/settings':
        return 'Settings';
      default:
        return 'Board';
    }
  };

  const getPageIcon = (currentPage: string) => {
    switch (getPageName(currentPage)) {
      case 'Board': return '📋';
      case 'Analytics': return '📊';
      case 'Settings': return '⚙️';
      default: return '📋';
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Save Status */}
      <div className="flex items-center space-x-2 text-sm">
        {hasUnsavedChanges ? (
          <div className="flex items-center space-x-1 text-orange-600">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span>Saving...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-green-600">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Saved {getTimeSinceUpdate()}</span>
          </div>
        )}
      </div>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 hidden sm:inline">Also working:</span>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 5).map((user) => (
              <div
                key={user.userId}
                className="relative group"
                title={`${user.userName} - viewing ${getPageName(user.currentPage)}`}
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold border-2 border-white shadow-sm">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
                
                {/* Activity indicator */}
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  <div className="flex items-center space-x-1">
                    <span>{getPageIcon(user.currentPage)}</span>
                    <span>{user.userName}</span>
                  </div>
                  <div className="text-gray-300">
                    {getPageName(user.currentPage)}
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
            
            {activeUsers.length > 5 && (
              <div 
                className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white shadow-sm"
                title={`+${activeUsers.length - 5} more users`}
              >
                +{activeUsers.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Current User */}
      {currentUser && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-semibold">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{currentUser.name}</span>
        </div>
      )}

      {/* Online Status */}
      <div className="flex items-center space-x-1 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="hidden md:inline">Online</span>
      </div>
    </div>
  );
};

export default ActiveUsers;