import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';
import { getToken } from '../services/localStorageService';

// Tạo Context
const RoleContext = createContext();

// Provider component
export const RoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    // Gọi API một lần khi component mount
    fetch(`${API}/roles?page=1&size=1000`, 
      // {
      //   headers: {
      //     'Authorization': `Bearer ${getToken()}`
      //   }
      // }
    )
    .then(response => response.json())
    .then(result => setRoles(result.data));
  }, []);
  
  return (
    <RoleContext.Provider value={roles}>
      {children}
    </RoleContext.Provider>
  );
};

// Hook để sử dụng roles trong các component
export const useRoles = () => useContext(RoleContext);