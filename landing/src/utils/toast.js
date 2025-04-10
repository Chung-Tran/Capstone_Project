import { toast } from 'react-toastify';

const defaultConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light"
};

const successStyle = {
    style: {
        background: '#fff',
        color: '#333',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
    }
};

const errorStyle = {
    style: {
        background: '#fff',
        color: '#dc2626',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        border: '1px solid #fecaca'
    }
};

export const showToast = {
    success: (message) => {
        toast.success(message, {
            ...defaultConfig,
            ...successStyle
        });
    },
    error: (message) => {
        toast.error(message, {
            ...defaultConfig,
            ...errorStyle
        });
    },
    info: (message) => {
        toast.info(message, {
            ...defaultConfig,
            ...successStyle
        });
    },
    warning: (message) => {
        toast.warning(message, {
            ...defaultConfig,
            ...errorStyle
        });
    }
}; 