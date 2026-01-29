'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { CptJournal } from "./CptJournal";
import React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface CptJournalProps {
  journal: CptJournal;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   handleDropdownChange: (e: DropdownChangeEvent) => void;
  }

const typeJournaux = [
    { label: 'Aucun', value: ' ' },
    { label: 'FI', value: 'FI' },
    { label: 'VE', value: 'VE' },
    { label: 'AC', value: 'AC' },
    { label: 'OD', value: 'OD' }
];
const CptJournalForm: React.FC<CptJournalProps> = ({ journal, handleChange,handleDropdownChange, handleCheckboxChange }) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">
        <div className="field col-2">
          <label htmlFor="codeJournal">Code Journal</label>
          <InputText id="codeJournal" name="codeJournal" value={journal.codeJournal} onChange={handleChange} />
        </div>

        <div className="field col-10">
          <label htmlFor="nomJournal">Nom Journal</label>
          <InputText id="nomJournal" name="nomJournal" value={journal.nomJournal} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="typeJournal">Type Journal</label>
      
          <Dropdown 
                                            id="typeJournal"
                                            name="typeJournal"
                                           value={journal.typeJournal}
                                            options={typeJournaux}
                                            optionValue="value"
                                            onChange={handleDropdownChange}
                                            placeholder="Sélectionnez le type"
                                        />
          
        </div>

       

        <div className="field col-8">
          <label htmlFor="compteId">Compte </label>
          <InputText id="compteId" name="compteId" value={journal.compteId} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="enDevise">En Devise</label>
          <Checkbox inputId="enDevise" name="enDevise" checked={journal.enDevise} onChange={handleCheckboxChange} />
        </div>
      </div>
    </div>
  );
};

export default CptJournalForm;