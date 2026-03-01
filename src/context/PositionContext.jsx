import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';
import { getToken } from '../services/localStorageService';

// Tạo Context
const PositionContext = createContext();

// Provider component
export const PositionProvider = ({ children }) => {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    // Gọi API một lần khi component mount
    fetch(`${API}/positions?page=1&size=1000`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }})
      .then(response => response.json())
      .then(result => setPositions(result.data));
  }, []);
  
  return (
    <PositionContext.Provider value={positions}>
      {children}
    </PositionContext.Provider>
  );
};

// Hook để sử dụng positions trong các component
export const usePositions= () => useContext(PositionContext);