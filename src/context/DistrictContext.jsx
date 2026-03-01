import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';
import { getToken } from '../services/localStorageService';

const DistrictContext = createContext();

export const DistrictProvider = ({ children }) => {
  const [allDistricts, setAllDistricts] = useState([]);

  useEffect(() => {
    fetch(`${API}/districts`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }})
      .then(response => response.json())
      .then(result => setAllDistricts(result.data));
  }, []);
  
  return (
    <DistrictContext.Provider value={allDistricts}>
      {children}
    </DistrictContext.Provider>
  );
};

// Hook để sử dụng districts trong các component với filter theo provinceId
export const useDistricts = (provinceId = null) => {
  const allDistricts = useContext(DistrictContext);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (!provinceId) {
        setDistricts(allDistricts);
        return;
      }

      try {
        const response = await fetch(`${API}/districts?province_id=${provinceId}&page=1&size=1000`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        const result = await response.json();
        setDistricts(result.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
        setDistricts([]);
      }
    };

    fetchDistricts();
  }, [provinceId, allDistricts]);

  return districts;
};