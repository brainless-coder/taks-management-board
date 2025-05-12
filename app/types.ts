export interface TaskType {
  id: string;
  title: string;
  description: string;
  columnId: string;
  status?: 'dragging' | 'normal';
}

export interface ColumnType {
  id: string;
  title: string;
  tasks: TaskType[];
} 