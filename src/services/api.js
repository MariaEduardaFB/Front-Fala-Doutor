import axios from 'axios';

console.log(import.meta.env.VITE_ENDPOINT_API);


const api = axios.create({
    baseURL: import.meta.env.VITE_ENDPOINT_API, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;