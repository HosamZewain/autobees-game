/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#7c3aed', // Purple-600 matching main app
                    hover: '#6d28d9',
                    light: '#ede9fe',
                },
                secondary: {
                    DEFAULT: '#10b981', // Green-500
                    hover: '#059669',
                    light: '#d1fae5',
                }
            }
        },
    },
    plugins: [],
}
