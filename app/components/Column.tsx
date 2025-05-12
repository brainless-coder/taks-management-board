"use client";

import React, { useState } from 'react';
import Task from './Task';

// Import types directly to avoid path resolution issues
interface TaskType {
  id: string;
  title: string;
  description: string;
  columnId: string;
  status?: 'dragging' | 'normal';
}

interface ColumnType {
  id: string;
  title: string;
  tasks: TaskType[];
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskType[];
  onAddTask: (columnId: string, title: string, description: string) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask?: (taskId: string, targetColumnId: string) => void;
  allColumns: ColumnType[];
}

const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteTask,
  onMoveTask,
  allColumns
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isOver, setIsOver] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      onAddTask(id, newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setShowForm(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e || !e.dataTransfer) return;
    e.preventDefault();
    setIsOver(true);
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e || !e.dataTransfer) return;
    e.preventDefault();
    setIsOver(false);
    
    try {
      const dataText = e.dataTransfer.getData('text/plain');
      if (!dataText) return;
      
      const data = JSON.parse(dataText);
      if (data && data.taskId && data.sourceColumnId && onMoveTask) {
        // Only move if it's a different column
        if (data.sourceColumnId !== id) {
          onMoveTask(data.taskId, id);
        }
      }
    } catch (error) {
      console.error('Error processing dropped task:', error);
    }
  };

  return (
    <div 
      className={`bg-gray-100 rounded-lg p-4 w-72 flex flex-col h-full shadow-sm border ${
        isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700 transition-colors font-medium"
        >
          Add Task
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 bg-white p-3 rounded-md shadow-sm border border-gray-200">
          <div className="mb-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full p-2 border rounded mb-2 text-gray-800"
              required
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full p-2 border rounded resize-none h-20 text-gray-800"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
            >
              Add
            </button>
          </div>
        </form>
      )}

      <div className="overflow-y-auto flex-grow">
        {tasks.map((task) => (
          <Task
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            onDelete={onDeleteTask}
            onMoveTask={onMoveTask}
            availableColumns={allColumns}
            currentColumnId={id}
          />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-6 text-gray-500 italic text-sm">
            Drop tasks here or use "Add Task" button
          </div>
        )}
      </div>
    </div>
  );
};

export default Column; 