import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAcademies } from '../services/apiService'; // Assuming Academy type is exported
import type { Academy } from '../services/apiService';
import styles from './MyAcademiesPage.module.css'; // Import CSS Module

const MyAcademiesPage: React.FC = () => {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getAcademies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchAcademies();
        setAcademies(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
        console.error("Failed to fetch academies:", err);
      } finally {
        setIsLoading(false);
      }
    };

    getAcademies();
  }, []);

  if (isLoading) {
    return <div className={styles.loadingText}>Loading your academies...</div>;
  }

  if (error) {
    return <div className={styles.errorText}>Error: {error}</div>;
  }

  if (academies.length === 0) {
    return (
      <div className={styles.noAcademiesText}>
        <p>No academies found. You can join an existing academy or create a new one.</p>
        {/* <Link to="/academies/create">Create New Academy</Link> */}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>My Academies</h2>
      <ul className={styles.academyList}>
        {academies.map((academy) => (
          <li key={academy.id} className={styles.academyItem}>
            <Link to={`/academies/${academy.id}/dashboard`}>
              {academy.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyAcademiesPage;
