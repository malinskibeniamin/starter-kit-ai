import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { demoRouter } from './routes/demo';

export const App = () => {
  return <RouterProvider router={demoRouter} />;
};
