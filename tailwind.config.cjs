/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Ini yang akan digunakan Antigravity untuk fitur Dark Mode
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-blue': '#1800ad',
            },
        },
    },
    plugins: [],
}