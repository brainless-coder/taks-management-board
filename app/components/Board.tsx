"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Column from './Column';
import LoadingState from './LoadingState';
import Toast from './Toast';
import { ColumnType, TaskType } from '../types';
import { useCache } from '../utils/cache';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const Board: React.FC = () => {
  // Use our cache mechanism for data persistence
  const [cachedData, setCachedData] = useCache();
  const [columns, setColumns] = useState<ColumnType[]>(cachedData);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Use a ref to track if columns were changed internally
  const columnsUpdatedRef = useRef(false);
  
  // Load initial data
  useEffect(() => {
    setColumns(cachedData);
    setIsLoading(false);
  }, []); // Run only once on mount
  
  // Memoize the update function to avoid dependency changes
  const updateCache = useCallback((data: ColumnType[]) => {
    setCachedData(data);
  }, [setCachedData]);
  
  // Update cache when columns change, but use a flag to prevent infinite loops
  useEffect(() => {
    if (!isLoading && columnsUpdatedRef.current) {
      updateCache(columns);
      columnsUpdatedRef.current = false;
    }
  }, [columns, isLoading, updateCache]);
  
  // Wrapper for setColumns that also sets the update flag
  const updateColumns = (newColumnsOrFn: ColumnType[] | ((prev: ColumnType[]) => ColumnType[])) => {
    columnsUpdatedRef.current = true;
    setColumns(newColumnsOrFn);
  };

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const addTask = (columnId: string, title: string, description: string) => {
    updateColumns(prevColumns => {
      return prevColumns.map(column => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: [
              ...column.tasks,
              {
                id: Date.now().toString(),
                title,
                description,
                columnId: column.id
              }
            ]
          };
        }
        return column;
      });
    });
    
    const columnName = columns.find(col => col.id === columnId)?.title || 'column';
    showToast(`Task "${title}" added to ${columnName}`, 'success');
  };
  
  const deleteTask = (taskId: string) => {
    // Find the task before deleting it
    let taskTitle = '';
    columns.forEach(column => {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        taskTitle = task.title;
      }
    });

    updateColumns(prevColumns => {
      return prevColumns.map(column => {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      });
    });

    showToast(`Task "${taskTitle}" deleted`, 'info');
  };
  
  const moveTask = (taskId: string, targetColumnId: string) => {
    // First, find the task in all columns
    let taskToMove: TaskType | null = null;
    let sourceColumnId: string = '';
    let sourceColumnName = '';
    let targetColumnName = '';
    
    // Find the task and its column
    for (const column of columns) {
      const task = column.tasks.find(t => t.id === taskId);
      if (task) {
        taskToMove = { ...task };
        sourceColumnId = column.id;
        sourceColumnName = column.title;
        break;
      }
    }
    
    if (!taskToMove) return;
    
    // Find target column name
    targetColumnName = columns.find(col => col.id === targetColumnId)?.title || 'column';
    
    // Update the task's columnId
    const updatedTask: TaskType = {
      ...taskToMove,
      columnId: targetColumnId
    };
    
    // Update the columns
    updateColumns(prevColumns => {
      return prevColumns.map(column => {
        // Remove task from source column
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter(t => t.id !== taskId)
          };
        }
        // Add task to target column
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, updatedTask]
          };
        }
        return column;
      });
    });

    showToast(`Moved "${taskToMove.title}" from ${sourceColumnName} to ${targetColumnName}`, 'success');
  };
  
  const addColumn = () => {
    if (newColumnTitle.trim()) {
      updateColumns(prevColumns => [
        ...prevColumns,
        {
          id: Date.now().toString(),
          title: newColumnTitle,
          tasks: []
        }
      ]);
      showToast(`Column "${newColumnTitle}" added`, 'success');
      setNewColumnTitle('');
    }
  };
  
  const deleteColumn = (columnId: string) => {
    const columnToDelete = columns.find(col => col.id === columnId);
    if (!columnToDelete) return;

    updateColumns(prevColumns => prevColumns.filter(column => column.id !== columnId));
    showToast(`Column "${columnToDelete.title}" removed`, 'info');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Management Board</h1>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newColumnTitle}
            onChange={(e) => setNewColumnTitle(e.target.value)}
            placeholder="New Column Title"
            className="px-3 py-2 border rounded text-gray-800"
          />
          <button
            onClick={addColumn}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors font-medium"
          >
            Add Column
          </button>
        </div>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {columns.map(column => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-gray-900">{column.title}</h2>
              {columns.length > 1 && (
                <button
                  onClick={() => deleteColumn(column.id)}
                  className="text-red-600 text-sm font-medium hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
            <Column
              id={column.id}
              title={column.title}
              tasks={column.tasks}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onMoveTask={moveTask}
              allColumns={columns}
            />
          </div>
        ))}
      </div>

      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Board; 