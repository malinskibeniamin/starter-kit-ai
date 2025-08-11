import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app';

import './globals.css';

const container = document.getElementById('root');

// biome-ignore lint/style/noNonNullAssertion: bootstrapping the app
const root = createRoot(container!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
