import Swal from 'sweetalert2';

export const showSuccessAlert = (title, text) => {
  Swal.fire({
    title,
    text,
    icon: 'success',
    confirmButtonColor: '#4B0082',
  });
};

export const showErrorAlert = (title, text) => {
  Swal.fire({
    title,
    text,
    icon: 'error',
    confirmButtonColor: '#4B0082',
  });
};

export const showLoadingAlert = (title) => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeAlert = () => Swal.close();