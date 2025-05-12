"use client";

import { cache } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { ColumnType } from '../types';

const CACHE_KEY = 'taskManagementData';

// Default columns if no data exists
const DEFAULT_COLUMNS: ColumnType[] = [
  { id: '1', title: 'To Do', tasks: [] },
  { id: '2', title: 'In Progress', tasks: [] },
  { id: '3', title: 'Done', tasks: [] }
];

// Initialize data from localStorage if available
export const initializeCache = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMNS;
  }
  
  try {
    const storedData = localStorage.getItem(CACHE_KEY);
    return storedData ? JSON.parse(storedData) : DEFAULT_COLUMNS;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return DEFAULT_COLUMNS;
  }
};

// Cache the data using React's cache() function
export const getCachedData = cache(() => {
  return initializeCache();
});

// Update cache in localStorage
export const updateCache = (data: ColumnType[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

// Get data from cache
export const getFromCache = (): ColumnType[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_COLUMNS;
  }
  
  return initializeCache();
};

// Custom hook to use cache
export function useCache() {
  const [data, setData] = useState<ColumnType[]>(() => getFromCache());
  
  // Memoize the setter function so it doesn't change on every render
  const updateData = useCallback((newData: ColumnType[] | ((prevData: ColumnType[]) => ColumnType[])) => {
    const computeNewData = () => {
      if (typeof newData === 'function') {
        return (newData as ((prevData: ColumnType[]) => ColumnType[]))(data);
      }
      return newData;
    };
    
    const updatedData = computeNewData();
    
    // Store in localStorage cache
    updateCache(updatedData);
    
    // Update internal state
    setData(updatedData);
    
    return updatedData;
  }, [data]);
  
  return [data, updateData] as const;
} 