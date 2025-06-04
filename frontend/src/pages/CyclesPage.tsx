import React from 'react';
import { useParams } from 'react-router-dom';

const CyclesPage: React.FC = () => {
  const { academyId } = useParams<{ academyId: string }>();
  return <div>Cycles Page for Academy ID: {academyId}</div>;
};

export default CyclesPage;
