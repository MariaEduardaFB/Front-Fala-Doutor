import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000', // troque pela sua base URL
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;