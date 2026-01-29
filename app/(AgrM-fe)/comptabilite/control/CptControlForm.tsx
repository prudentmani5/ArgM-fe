'use client';

import { Button } from 'primereact/button';
import React from 'react';

interface CptControlFormProps{
  handleChargement: () => void;
}
const CptControlForm: React.FC<CptControlFormProps> = ({
  handleChargement
}) => {
  return (
    <div className="card p-3">
      <h5>Contrôle des pièces non équilibrées</h5>
      <Button
                  label="Chargement"
                  icon="pi pi-filter-fill" 
                  className="p-button-info mb-2 "
                  onClick={handleChargement}
      
                />
    </div>

  );
};

export default CptControlForm;
