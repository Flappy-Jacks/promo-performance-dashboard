import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { tokens } from './styles/tokens.js';
import './index.css';

for (const [name, value] of Object.entries(tokens.colors)) {
  document.documentElement.style.setProperty(`--fc-${name}`, value);
}

for (const [name, family] of Object.entries(tokens.fontFamily)) {
  const stack = family.map((font) => font.includes(' ') ? `'${font}'` : font).join(', ');
  document.documentElement.style.setProperty(`--fc-font-${name}`, stack);
}

for (const [name, value] of Object.entries(tokens.spacing)) {
  document.documentElement.style.setProperty(`--fc-space-${name}`, value);
}

console.info('Flycatcher Scandium / RM Mono font files not found; using the specified fallback stacks.');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);