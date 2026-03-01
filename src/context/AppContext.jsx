import React from 'react';
import { RoleProvider } from "./RoleContext";

export const AppProvider = ({ children }) => {
  return (
    <RoleProvider>
      {children}
    </RoleProvider>
  );
};