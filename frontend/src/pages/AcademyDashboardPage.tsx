import React from 'react';
import { useParams } from 'react-router-dom';

const AcademyDashboardPage: React.FC = () => {
  const { academyId } = useParams<{ academyId: string }>();
  return <div>Academy Dashboard Page for Academy ID: {academyId}</div>;
};

export default AcademyDashboardPage;
