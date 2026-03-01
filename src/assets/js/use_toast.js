import { useCallback } from 'react';

// Toast notification helper
export const useToast = () => {
  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} position-fixed start-50 translate-middle-x mt-3 shadow-lg`;
    toast.style.cssText = `
      z-index: 9999;
      top: 20px;
      min-width: 300px;
      animation: slideDown 0.3s ease-out;
    `;
    
    // Define icons for different types
    const icons = {
      success: '<svg style="width: 20px; height: 20px; color: #10b981;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
      info: '<svg style="width: 20px; height: 20px; color: #3b82f6;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>',
      danger: '<svg style="width: 20px; height: 20px; color: #ef4444;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
    };
    
    toast.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        ${icons[type] || icons.success}
        <span>${message}</span>
      </div>
    `;
    
    // Add animation styles
    if (!document.getElementById('toast-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-animation-styles';
      style.textContent = `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 1;
            transform: translate(-50%, 0);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -100%);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideUp 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  return { showToast };
}