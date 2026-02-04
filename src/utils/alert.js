import Swal from 'sweetalert2';

const customTheme = {
  customClass: {
    container: 'custom-swal-container',
    popup: 'custom-swal-popup',
    title: 'custom-swal-title',
    htmlContainer: 'custom-swal-html',
    confirmButton: 'custom-swal-confirm-button',
    cancelButton: 'custom-swal-cancel-button',
    icon: 'custom-swal-icon'
  },
  buttonsStyling: false,
  confirmButtonColor: '#4B0082',
  color: '#333',
  background: '#fff',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  showClass: {
    popup: 'swal2-show'
  },
  hideClass: {
    popup: 'swal2-hide'
  }
};

export const showSuccessAlert = (title, text, timer = 2000) => {
  Swal.fire({
    ...customTheme,
    title,
    text,
    icon: 'success',
    timer,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

export const showErrorAlert = (title, text) => {
  Swal.fire({
    ...customTheme,
    title,
    text,
    icon: 'error',
    confirmButtonText: 'Try Again',
    confirmButtonColor: '#d9534f',
  });
};

export const showInfoAlert = (title, text) => {
  Swal.fire({
    ...customTheme,
    title,
    text,
    icon: 'info',
    confirmButtonText: 'OK',
  });
};

export const showWarningAlert = (title, text) => {
  Swal.fire({
    ...customTheme,
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'OK',
    confirmButtonColor: '#f0ad4e',
  });
};

export const showLoadingAlert = (title, text = 'Please wait...') => {
  Swal.fire({
    ...customTheme,
    title,
    text,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
};

export const showConfirmAlert = (title, text, confirmButtonText = 'Yes', cancelButtonText = 'No') => {
  return Swal.fire({
    ...customTheme,
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: '#4B0082',
    cancelButtonColor: '#6c757d',
    reverseButtons: true,
  });
};

export const showToast = (title, icon = 'success', timer = 3000) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon,
    title
  });
};

export const closeAlert = () => Swal.close();

export const initSweetAlertStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .custom-swal-popup {
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .custom-swal-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 10px;
    }
    
    .custom-swal-html {
      font-size: 1rem;
      color: #666;
      line-height: 1.5;
    }
    
    .custom-swal-confirm-button {
      background: #4B0082;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 0 8px;
    }
    
    .custom-swal-confirm-button:hover {
      background: #3a0069;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(75, 0, 130, 0.3);
    }
    
    .custom-swal-cancel-button {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 0 8px;
    }
    
    .custom-swal-cancel-button:hover {
      background: #5a6268;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    }
    
    .custom-swal-icon {
      font-size: 3rem;
    }
    
    .swal2-timer-progress-bar {
      background: rgba(75, 0, 130, 0.5);
    }
  `;
  document.head.appendChild(style);
};

if (typeof window !== 'undefined') {
  initSweetAlertStyles();
}