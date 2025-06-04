import React from 'react';
import { withAuthenticationRequired } from '@auth0/auth0-react'; // AppState can be imported if needed for onRedirecting args or options
import { Outlet } from 'react-router-dom';

// A simple loading component to show while Auth0 is redirecting or checking session
const Loading: React.FC = () => <div>Loading authentication details...</div>;

interface ProtectedRouteProps {
  // This component is primarily a layout mechanism for protected routes.
  // It will render an <Outlet /> for nested child routes.
  // If you wanted to protect a specific component directly, you'd wrap that component:
  // export const ProtectedMyComponent = withAuthenticationRequired(MyComponent);
  // Here, we are creating a component that acts as the element in a Route definition,
  // which then allows react-router's Outlet to render the matched child route.
  children?: React.ReactNode; // children prop can be used if not using as a layout for Outlet
}

const ProtectedRouteOutlet: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Renders an Outlet by default, allowing this to be used for parent routes.
  // If children are explicitly passed, it would render those (though less common for this HOC pattern).
  return children ? <>{children}</> : <Outlet />;
};

// This is the component that will be used in route definitions:
// <Route element={<ProtectedRoute />} >
//   <Route path="dashboard" element={<DashboardPage />} />
// </Route>
// The HOC handles the protection.
export default withAuthenticationRequired(ProtectedRouteOutlet, {
  // Show a loading component while the user is being redirected to the login page
  onRedirecting: () => <Loading />,
  // You can add other options here, like:
  // returnTo: '/some-path' // Redirect here after login, or a function (path) => path
  // loginOptions: { appState: { returnTo: window.location.pathname } } // To redirect to original path
});
