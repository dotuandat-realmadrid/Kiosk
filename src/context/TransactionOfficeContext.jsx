import React, { createContext, useContext, useEffect, useState } from 'react';
import { API } from '../api/auth';
import { getToken } from '../services/localStorageService';

const TransactionOfficeContext = createContext();

export const TransactionOfficeProvider = ({ children }) => {
  const [allTransactionOffices, setAllTransactionOffices] = useState([]);

  useEffect(() => {
    fetch(`${API}/transaction-offices`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }})
      .then(response => response.json())
      .then(result => setAllTransactionOffices(result.data));
  }, []);
  
  return (
    <TransactionOfficeContext.Provider value={allTransactionOffices}>
      {children}
    </TransactionOfficeContext.Provider>
  );
};

// Hook để sử dụng transaction-offices trong các component với filter
export const useTransactionOffices = (provinceId = null, districtId = null) => {
  const allTransactionOffices = useContext(TransactionOfficeContext);
  const [transactionOffices, setTransactionOffices] = useState([]);

  useEffect(() => {
    const fetchTransactionOffices = async () => {
      // Nếu không có cả 2 ID, trả về tất cả từ context
      if (!provinceId && !districtId) {
        setTransactionOffices(allTransactionOffices);
        return;
      }

      try {
        // Build query params
        const params = new URLSearchParams();
        if (provinceId) params.append('province_id', provinceId);
        if (districtId) params.append('district_id', districtId);

        const response = await fetch(`${API}/transaction-offices?${params.toString()}&page=1&size=1000`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`
          }
        });
        const result = await response.json();
        setTransactionOffices(result.data);
      } catch (error) {
        console.error('Error fetching transaction offices:', error);
        setTransactionOffices([]);
      }
    };

    fetchTransactionOffices();
  }, [provinceId, districtId, allTransactionOffices]);

  return transactionOffices;
};