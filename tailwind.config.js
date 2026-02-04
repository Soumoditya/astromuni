/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'vedic-gold': '#d4af37',
                'vedic-saffron': '#ff9933',
                'cosmic-blue': '#1a237e',
                'cream': '#f5f5dc',
            },
            fontFamily: {
                serif: ['var(--font-heading)', 'serif'],
                sans: ['var(--font-body)', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
