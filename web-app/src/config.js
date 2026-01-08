// Automatically determine the backend URL
// In Production (Vite build serves from same origin): use relative path (empty string)
// In Development (Vite dev server on 5173): use localhost:3000
const isProd = import.meta.env.PROD;

export const API_URL = isProd ? '' : 'http://localhost:3000';
export const API_BASE = `${API_URL}/api`;
export const SOCKET_URL = isProd ? window.location.origin : 'http://localhost:3000';
