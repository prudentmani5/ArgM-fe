'use client';

import { InputText } from "primereact/inputtext";
import { InputMask } from "primereact/inputmask";
import { CptExercice } from "./CptExercice";
import React from "react";

interface CptExerciceProps {
  exercice: CptExercice;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (name: string, value: string) => void;
}

const CptExerciceForm: React.FC<CptExerciceProps> = ({ exercice, handleChange, handleDateChange }) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">

        <div className="field col-4">
          <label htmlFor="codeExercice">Code Exercice</label>
          <InputText
            id="codeExercice"
            name="codeExercice"
            value={exercice.codeExercice}
            onChange={handleChange}
          />
        </div>

        <div className="field col-8">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={exercice.description}
            onChange={handleChange}
          />
        </div>

        <div className="field col-4">
          <label htmlFor="dateDebut">Date Début</label>
          <InputMask
            id="dateDebut"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={exercice.dateDebut || ''}
            onChange={(e) => handleDateChange('dateDebut', e.value || '')}
            slotChar="_"
          />
        </div>

        <div className="field col-4">
          <label htmlFor="dateFin">Date Fin</label>
          <InputMask
            id="dateFin"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={exercice.dateFin || ''}
            onChange={(e) => handleDateChange('dateFin', e.value || '')}
            slotChar="_"
          />
        </div>

        
      </div>
    </div>
  );
};

export default CptExerciceForm;
