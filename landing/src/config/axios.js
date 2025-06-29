import axios from 'axios';

const axiosClient = axios.create({
    baseURL: (process.env.REACT_APP_API_URL || 'http://160.250.133.57:3030') + "/api",
    // timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;