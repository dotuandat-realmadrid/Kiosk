// server/config/role.config.js

// Định nghĩa các role trong hệ thống
const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  USER: 'USER',
  GUEST: 'GUEST'
};

// Định nghĩa quyền cho từng role
const ROLE_PERMISSIONS = {
  ADMIN: {
    description: 'Quản trị viên - Có toàn quyền',
    permissions: [
      'CREATE_USER',
      'READ_USER',
      'UPDATE_USER',
      'DELETE_USER',
      'MANAGE_ROLES',
      'CREATE_PRODUCT',
      'READ_PRODUCT',
      'UPDATE_PRODUCT',
      'DELETE_PRODUCT',
      'CREATE_ORDER',
      'READ_ORDER',
      'UPDATE_ORDER',
      'DELETE_ORDER',
      'VIEW_ANALYTICS',
      'MANAGE_SETTINGS',
      'CREATE_EMPLOYEE',
      'READ_EMPLOYEE',
      'UPDATE_EMPLOYEE',
      'DELETE_EMPLOYEE'
    ]
  },
  MANAGER: {
    description: 'Quản lý - Quản lý sản phẩm và đơn hàng',
    permissions: [
      'READ_USER',
      'CREATE_PRODUCT',
      'READ_PRODUCT',
      'UPDATE_PRODUCT',
      'DELETE_PRODUCT',
      'CREATE_ORDER',
      'READ_ORDER',
      'UPDATE_ORDER',
      'VIEW_ANALYTICS',
      'READ_EMPLOYEE'
    ]
  },
  EMPLOYEE: {
    description: 'Nhân viên - Quản lý dịch vụ khách hàng, người dùng',
    permissions: [
      'READ_USER',
      'READ_PRODUCT',
      'CREATE_ORDER',
      'READ_ORDER',
      'UPDATE_ORDER',
      'UPDATE_OWN_PROFILE',
      'READ_EMPLOYEE'
    ]
  },
  USER: {
    description: 'Người dùng - Quyền cơ bản',
    permissions: [
      'READ_PRODUCT',
      'CREATE_ORDER',
      'READ_ORDER',
      'UPDATE_OWN_PROFILE'
    ]
  },
  GUEST: {
    description: 'Khách - Chỉ xem',
    permissions: [
      'READ_PRODUCT'
    ]
  }
};

// Hệ thống phân cấp role (role cao hơn có quyền của role thấp hơn)
const ROLE_HIERARCHY = {
  ADMIN: ['MANAGER', 'EMPLOYEE', 'USER', 'GUEST'],
  MANAGER: ['EMPLOYEE', 'USER', 'GUEST'],
  EMPLOYEE: ['USER', 'GUEST'],
  USER: ['GUEST'],
  GUEST: []
};

// Route protection config - Định nghĩa role cho từng nhóm route
const ROUTE_ROLES = {
  // Auth routes
  '/api/auth/register': [],
  '/api/auth/login': [],
  '/api/auth/logout': ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],
  '/api/auth/refresh-token': ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],
  '/api/auth/change-password': ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],

  // User management routes
  '/api/users': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    POST: ['ADMIN'],
    PUT: ['ADMIN'],
    DELETE: ['ADMIN']
  },
  '/api/users/:id': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'], // USER chỉ xem được profile của mình
    PUT: ['ADMIN', 'EMPLOYEE', 'USER'], // USER/EMPLOYEE chỉ sửa được profile của mình
    DELETE: ['ADMIN']
  },

  // Employee management routes
  '/api/employees': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    POST: ['ADMIN'],
    PUT: ['ADMIN'],
    DELETE: ['ADMIN']
  },
  '/api/employees/:id': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    PUT: ['ADMIN', 'EMPLOYEE'], // EMPLOYEE chỉ sửa được profile của mình
    DELETE: ['ADMIN']
  },

  // Product routes
  '/api/products': {
    GET: [], // Public
    POST: ['ADMIN', 'MANAGER'],
    PUT: ['ADMIN', 'MANAGER'],
    DELETE: ['ADMIN', 'MANAGER']
  },

  // Order routes
  '/api/orders': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],
    POST: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],
    PUT: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    DELETE: ['ADMIN']
  },

  // Customer Service routes (EMPLOYEE có quyền)
  '/api/customer-service/tickets': {
    GET: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    POST: ['ADMIN', 'MANAGER', 'EMPLOYEE', 'USER'],
    PUT: ['ADMIN', 'MANAGER', 'EMPLOYEE'],
    DELETE: ['ADMIN']
  },

  // Analytics routes
  '/api/analytics': {
    GET: ['ADMIN', 'MANAGER']
  },

  // Settings routes
  '/api/settings': {
    GET: ['ADMIN'],
    POST: ['ADMIN'],
    PUT: ['ADMIN'],
    DELETE: ['ADMIN']
  }
};

// Kiểm tra role có quyền không (kể cả quyền kế thừa)
function hasPermission(userRole, requiredRole) {
  if (userRole === requiredRole) return true;
  
  const hierarchy = ROLE_HIERARCHY[userRole] || [];
  return hierarchy.includes(requiredRole);
}

// Kiểm tra user có ít nhất 1 trong các role yêu cầu
function hasAnyRole(userRoles = [], requiredRoles = []) {
  return requiredRoles.some(requiredRole => 
    userRoles.some(userRole => hasPermission(userRole, requiredRole))
  );
}

// Kiểm tra user có tất cả các role yêu cầu
function hasAllRoles(userRoles = [], requiredRoles = []) {
  return requiredRoles.every(requiredRole => 
    userRoles.some(userRole => hasPermission(userRole, requiredRole))
  );
}

// Lấy tất cả permissions của user dựa trên roles
function getUserPermissions(userRoles = []) {
  const permissions = new Set();
  
  userRoles.forEach(role => {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms && rolePerms.permissions) {
      rolePerms.permissions.forEach(perm => permissions.add(perm));
    }
    
    // Thêm permissions của các role thấp hơn trong hierarchy
    const lowerRoles = ROLE_HIERARCHY[role] || [];
    lowerRoles.forEach(lowerRole => {
      const lowerRolePerms = ROLE_PERMISSIONS[lowerRole];
      if (lowerRolePerms && lowerRolePerms.permissions) {
        lowerRolePerms.permissions.forEach(perm => permissions.add(perm));
      }
    });
  });
  
  return Array.from(permissions);
}

module.exports = {
  ROLES,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  ROUTE_ROLES,
  hasPermission,
  hasAnyRole,
  hasAllRoles,
  getUserPermissions
};