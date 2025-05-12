"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TaskProps {
  id: string;
  title: string;
  description: string;
  onDelete: (id: string) => void;
  onMoveTask?: (taskId: string, targetColumnId: string) => void;
  availableColumns?: { id: string; title: string }[];
  currentColumnId: string;
}

const Task: React.FC<TaskProps> = ({
  id,
  title,
  description,
  onDelete,
  onMoveTask,
  availableColumns = [],
  currentColumnId
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter columns to show only others
  const otherColumns = availableColumns.filter(col => col.id !== currentColumnId);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      taskId: id,
      sourceColumnId: currentColumnId
    }));
    e.dataTransfer.effectAllowed = 'move';
    
    // Use state instead of directly manipulating classList
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={taskRef}
      className={`bg-white p-4 rounded-md shadow-md mb-2 border border-gray-200 cursor-move transition-all hover:shadow-lg ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start mb-1">
        <h3 className="font-semibold text-lg text-gray-900 flex-grow">{title}</h3>
        <div className="text-gray-400 p-1 -mt-1 -mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
          </svg>
        </div>
      </div>
      
      <p className="text-gray-700 text-sm mb-3">{description}</p>
      <div className="flex justify-between items-center">
        {onMoveTask && otherColumns.length > 0 && (
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowOptions(!showOptions)}
              className="text-blue-600 text-xs hover:text-blue-800 transition-colors focus:outline-none font-medium"
            >
              Move to...
            </button>
            {showOptions && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 top-full mt-1 w-32 bg-white shadow-lg rounded-md overflow-auto z-10 border border-gray-200 max-h-40"
              >
                {otherColumns.map((column) => (
                  <button
                    key={column.id}
                    onClick={() => {
                      onMoveTask(id, column.id);
                      setShowOptions(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 transition-colors text-gray-800"
                  >
                    {column.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => onDelete(id)}
          className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Task; 