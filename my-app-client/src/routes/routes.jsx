import { createBrowserRouter } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ManageUsers from '../dashboard/ManageUsers';

const routes = createBrowserRouter([
  {
    path: '/admin/dashboard',
    element: <DashboardLayout />,
    children: [
      // ...existing routes...
      {
        path: 'manage-users',
        element: <ManageUsers />
      }
    ]
  }
]);

export default routes;