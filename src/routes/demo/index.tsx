import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { ComponentPreview } from '@/components/component-preview';
import ButtonDemo from './button-demo';

export const demoRouter = createBrowserRouter([
  {
    path: '/',
    element: <DemoLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/button-demo" replace />,
      },
      {
        path: 'button-demo',
        element: <ButtonDemo />,
      },
    ],
  },
]);

function DemoLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ComponentPreview>
        <Outlet />
      </ComponentPreview>
    </div>
  );
}
