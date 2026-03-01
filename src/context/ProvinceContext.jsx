import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';
import { getToken } from '../services/localStorageService';

// Tạo Context
const ProvinceContext = createContext();

// Provider component
export const ProvinceProvider = ({ children }) => {
  const [provinces, setProvinces] = useState([]);

  useEffect(() => {
    // Gọi API một lần khi component mount
    fetch(`${API}/provinces?page=1&size=1000`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }})
      .then(response => response.json())
      .then(result => setProvinces(result.data));
  }, []);
  
  return (
    <ProvinceContext.Provider value={provinces}>
      {children}
    </ProvinceContext.Provider>
  );
};

// Hook để sử dụng provinces trong các component
export const useProvinces = () => useContext(ProvinceContext);