"use client";

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-700 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Task Management Board</h1>
        <div className="text-white text-sm">
          <a 
            href="https://github.com/brainless-coder/taks-management-board" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline text-white font-medium"
          >
            GitHub
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header; 