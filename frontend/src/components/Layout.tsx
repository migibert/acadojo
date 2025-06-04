import React from 'react';
import styles from './Layout.module.css';
import { Outlet, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

const Layout: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth0();

  return (
    <div>
            <header className={styles.header}>
        <h1>BJJ Academy SaaS</h1>
                <nav className={styles.navLinks}>
          <Link to="/">Home</Link> | <Link to="/academies">My Academies</Link> | <Link to="/profile">Profile</Link>
          <span className={styles.authSection}>
            {isLoading && <p>Loading user...</p>}
            {!isLoading && !isAuthenticated && <LoginButton />}
            {!isLoading && isAuthenticated && (
              <>
                <span style={{ marginRight: '10px' }}>Hello, {user?.name || user?.email}</span>
                <LogoutButton />
              </>
            )}
          </span>
        </nav>
      </header>
      <hr />
            <main className={styles.mainContent}>
        <Outlet /> {/* Nested routes will render here */}
      </main>
      <hr />
            <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} BJJ Academy SaaS</p>
      </footer>
    </div>
  );
};

export default Layout;
