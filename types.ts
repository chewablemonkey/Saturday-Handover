
export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Urgent = 'Urgent',
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assigneeIds: string[];
  tags: string[];
  comments: Comment[];
  // New fields for advanced features
  startDate: string;
  parentId?: string;
  subtaskIds: string[];
  dependsOn: string[]; // IDs of tasks this task depends on
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

export interface Project {
  id: string;
  name: string;
  tasks: Record<string, Task>;
  columns: Record<string, Column>;
  columnOrder: string[];
}