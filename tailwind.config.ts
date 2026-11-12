import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#16262d', teal: '#0f4c5c', tape: '#f2c230', paper: '#eef2f1' } } }, plugins: [] } satisfies Config;
