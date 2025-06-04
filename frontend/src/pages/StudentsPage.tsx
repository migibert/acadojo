import React from 'react';
import { useParams } from 'react-router-dom';

const StudentsPage: React.FC = () => {
  const { academyId } = useParams<{ academyId: string }>();
  return <div>Students Page for Academy ID: {academyId}</div>;
};

export default StudentsPage;
