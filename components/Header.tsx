import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  projectName: string;
  activeView: 'board' | 'analytics' | 'settings';
  onAiClick: () => void;
  isAiEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ projectName, activeView, onAiClick, isAiEnabled }) => {
  const location = useLocation();

  const navItems = [
    { key: 'board', path: '/', label: 'Board', icon: '📋' },
    { key: 'analytics', path: '/analytics', label: 'Analytics', icon: '📊' },
    { key: 'settings', path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Project Name */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-gradient">Synergy</h1>
            </div>
            <div className="hidden md:block">
              <div className="h-6 w-px bg-gray-300"></div>
            </div>
            <div className="hidden md:block">
              <h2 className="text-lg font-semibold text-gray-900">{projectName}</h2>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* AI Assistant Button */}
            {isAiEnabled && (
              <button
                onClick={onAiClick}
                className="btn btn-ghost flex items-center space-x-2 relative group"
                title="AI Assistant"
              >
                <span className="text-lg">🤖</span>
                <span className="hidden sm:inline font-medium">AI Assistant</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </button>
            )}

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                className="btn btn-ghost p-2"
                title="Notifications"
              >
                <span className="text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></div>
              </button>
              
              <button
                className="btn btn-ghost p-2"
                title="User Profile"
              >
                <img
                  src="https://picsum.photos/id/1005/32/32"
                  alt="Profile"
                  className="avatar avatar-sm"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <nav className="flex space-x-1 px-4 py-2">
          {navItems.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-center ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;