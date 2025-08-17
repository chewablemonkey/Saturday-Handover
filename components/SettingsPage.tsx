import React, { useState } from 'react';
import { User } from '../types';

interface SettingsPageProps {
  users: Record<string, User>;
  featureFlags: Record<string, boolean>;
  onSaveUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  onToggleFeature: (feature: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  users,
  featureFlags,
  onSaveUser,
  onDeleteUser,
  onToggleFeature,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'features' | 'project'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    avatarUrl: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tabs = [
    { key: 'users', label: 'Team Members', icon: '👥' },
    { key: 'features', label: 'Features', icon: '🎛️' },
    { key: 'project', label: 'Project Settings', icon: '⚙️' },
  ];

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
    setIsAddingUser(false);
    setErrors({});
  };

  const handleAddUser = () => {
    setIsAddingUser(true);
    setEditingUser(null);
    setUserForm({
      id: `user-${Date.now()}`,
      name: '',
      avatarUrl: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/32/32`,
    });
    setErrors({});
  };

  const validateUser = () => {
    const newErrors: Record<string, string> = {};
    
    if (!userForm.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!userForm.avatarUrl.trim()) {
      newErrors.avatarUrl = 'Avatar URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateUser()) return;

    onSaveUser({
      id: userForm.id,
      name: userForm.name.trim(),
      avatarUrl: userForm.avatarUrl.trim(),
    });

    setEditingUser(null);
    setIsAddingUser(false);
    setUserForm({ id: '', name: '', avatarUrl: '' });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsAddingUser(false);
    setUserForm({ id: '', name: '', avatarUrl: '' });
    setErrors({});
  };

  const getRandomAvatarUrl = () => {
    const randomId = Math.floor(Math.random() * 100);
    const newUrl = `https://picsum.photos/id/${randomId}/32/32`;
    setUserForm(prev => ({ ...prev, avatarUrl: newUrl }));
  };

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-gray-600">Manage your project team members</p>
        </div>
        <button
          onClick={handleAddUser}
          className="btn btn-primary"
        >
          👤 Add Member
        </button>
      </div>

      {/* Add/Edit User Form */}
      {(editingUser || isAddingUser) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 animate-slide-in-up">
          <h4 className="font-semibold text-gray-900 mb-4">
            {isAddingUser ? 'Add New Member' : 'Edit Member'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                className={`form-input ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Enter full name..."
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL *</label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={userForm.avatarUrl}
                  onChange={(e) => setUserForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  className={`form-input flex-1 ${errors.avatarUrl ? 'border-red-300 focus:ring-red-500' : ''}`}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={getRandomAvatarUrl}
                  className="btn btn-secondary"
                  title="Generate random avatar"
                >
                  🎲
                </button>
              </div>
              {errors.avatarUrl && <p className="mt-1 text-sm text-red-600">{errors.avatarUrl}</p>}
            </div>
          </div>

          {/* Avatar Preview */}
          {userForm.avatarUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <div className="flex items-center space-x-3">
                <img
                  src={userForm.avatarUrl}
                  alt="Avatar preview"
                  className="avatar avatar-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://picsum.photos/64/64';
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{userForm.name || 'New User'}</p>
                  <p className="text-sm text-gray-600">Team Member</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleCancelEdit}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              className="btn btn-primary"
            >
              {isAddingUser ? 'Add Member' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-3">
        {Object.values(users).map((user) => (
          <div
            key={user.id}
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between card-hover"
          >
            <div className="flex items-center space-x-4">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="avatar avatar-lg"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-600">Team Member</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEditUser(user)}
                className="btn btn-ghost text-sm"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => onDeleteUser(user.id)}
                className="btn btn-ghost text-red-600 hover:bg-red-50 text-sm"
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Feature Toggles</h3>
        <p className="text-gray-600">Enable or disable application features</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-semibold text-gray-900">AI Suggestions</h4>
                <p className="text-sm text-gray-600">Enable intelligent project insights and recommendations</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={featureFlags.aiSuggestionsEnabled}
                onChange={() => onToggleFeature('aiSuggestionsEnabled')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold text-gray-900">Advanced Analytics</h4>
                <p className="text-sm text-gray-600">Show detailed project metrics and insights</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={true}
                readOnly
              />
              <div className="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔔</span>
              <div>
                <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Send email updates for task changes</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={false}
                readOnly
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">🚧 Coming soon</p>
        </div>
      </div>
    </div>
  );

  const renderProjectTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Project Settings</h3>
        <p className="text-gray-600">Configure project-wide preferences</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">General Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value="Q3 Marketing Campaign"
                className="form-input"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Status</label>
              <select className="form-select">
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Workflow Configuration</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Auto-assign tasks</h5>
                <p className="text-sm text-gray-600">Automatically assign new tasks to available team members</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={false}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-gray-900">Due date reminders</h5>
                <p className="text-sm text-gray-600">Send notifications before task due dates</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={true}
                />
                <div className="w-11 h-6 bg-primary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Data & Privacy</h4>
          <div className="space-y-3">
            <button className="btn btn-secondary w-full md:w-auto">
              📥 Export Project Data
            </button>
            <button className="btn btn-secondary w-full md:w-auto">
              🔄 Backup Project
            </button>
            <button className="btn btn-danger w-full md:w-auto">
              🗑️ Delete Project
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Deleted projects cannot be recovered
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-secondary overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600 mb-6">Manage your project configuration and team settings</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'features' && renderFeaturesTab()}
          {activeTab === 'project' && renderProjectTab()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;