import { useContext } from 'react';
import { ClinicalSessionContext } from './clinicalSessionContext';

export const useClinicalSession = () => {
  const context = useContext(ClinicalSessionContext);
  if (!context) {
    throw new Error('useClinicalSession must be used within a ClinicalSessionProvider');
  }
  return context;
};
