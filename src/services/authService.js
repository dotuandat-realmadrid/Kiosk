import { jwtDecode } from "jwt-decode";
import { getToken } from "./localStorageService";

// Lấy roles từ JWT token
export const getScopeFromToken = () => {
  const token = getToken();
  if (!token) return [];

  try {
    const decodedToken = jwtDecode(token);
    
    // Xử lý nhiều format khả dĩ của scope/roles
    let scope = decodedToken.scope || decodedToken.roles || decodedToken.role;
    
    // Nếu là string (vd: "ADMIN MANAGER")
    if (typeof scope === 'string') {
      return scope.split(' ').filter(Boolean);
    }
    
    // Nếu là array
    if (Array.isArray(scope)) {
      return scope;
    }
    
    return [];
  } catch (error) {
    console.error('Error decoding token:', error);
    return [];
  }
};

// Kiểm tra user có role trong danh sách required roles không
export const hasPermission = (requiredRoles = []) => {
  // Nếu không yêu cầu role nào (public route)
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  const userRoles = getScopeFromToken();
  
  // Nếu user không có role nào
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return false;
  }

  // Check exact match - user có ít nhất 1 role khớp với required roles
  return requiredRoles.some(requiredRole => userRoles.includes(requiredRole));
};

// Debug helper
export const debugUserRoles = () => {
  const roles = getScopeFromToken();
  const token = getToken();
  
  console.log('=== User Roles Debug ===');
  console.log('Current roles:', roles);
  console.log('Token preview:', token?.substring(0, 50) + '...');
  
  try {
    const decodedToken = jwtDecode(token);
    console.log('Decoded token:', decodedToken);
  } catch (e) {
    console.log('Cannot decode token');
  }
  console.log('====================');
};