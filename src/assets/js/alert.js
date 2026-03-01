// Toast notification helper
export const showAlert = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg`;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 100;
        width: 28rem;
        height: 28rem;
        border-radius: 1rem;
        display: flex;
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s ease-out;
    `;

    // Define icons for different types
    const icons = {
        success: '<svg style="width: 1.5rem; height: 1.5rem; color: #10b981;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>',
        info: '<svg style="width: 1.5rem; height: 1.5rem; color: #3b82f6;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 5a1 1 0 011 1v4a1 1 0 11-2 0V6a1 1 0 011-1zm0 8a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>',
        danger: '<svg style="width: 1.5rem; height: 1.5rem; color: #ef4444;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
    };

    toast.innerHTML = `
        <div class="d-flex justify-content-center align-items-center gap-2 fs-5">
        ${icons[type] || icons.success}
        <span>${message}</span>
        </div>
    `;

    // Add animation styles
    if (!document.getElementById('toast-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-styles';
        style.textContent = `
        @keyframes fadeIn {
            from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
            }
            to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes fadeOut {
            from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
            }
            to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
            }
        }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};