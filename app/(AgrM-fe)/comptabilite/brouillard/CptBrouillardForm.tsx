'use client';

import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import React from 'react';
import { CptBrouillard } from './CptBrouillard';
import { CptJournal } from '../journal/CptJournal';

interface CptBrouillardProps {
  brouillard: CptBrouillard;
  journaux: CptJournal[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (name: string, value: string) => void;
  handleDropDownSelect: (e: DropdownChangeEvent) => void;
}

const CptBrouillardForm: React.FC<CptBrouillardProps> = ({
  brouillard,
  journaux,
  handleChange,
  handleCheckboxChange,
  handleDateChange,
  handleDropDownSelect
}) => {

  return (
    <div className="card p-fluid">
      <div className="formgrid grid">

        <div className="field col-2">
          <label htmlFor="codeBrouillard">Code Brouillard</label>
          <InputText
            id="codeBrouillard"
            name="codeBrouillard"
            value={brouillard.codeBrouillard}
            onChange={handleChange}
          />
        </div>

        <div className="field col-10">
          <label htmlFor="description">Description</label>
          <InputText
            id="description"
            name="description"
            value={brouillard.description}
            onChange={handleChange}
          />
        </div>

        <div className="field col-8">
          <label htmlFor="journalId">Journal</label>
          <Dropdown
            name="journalId"
            value={brouillard.journalId}
            options={journaux}
            optionLabel="codeLibelle"
            optionValue="journalId"
            onChange={handleDropDownSelect}
            placeholder="Sélectionner le journal"
            filter
            filterBy="codeLibelle"
          />
        </div>

        <div className="field col-2">
          <label htmlFor="dateDebut">Date Début</label>
          <InputMask
            id="dateDebut"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={brouillard.dateDebut}
            onChange={(e) => handleDateChange('dateDebut', e.value || '')}
          />
        </div>

        <div className="field col-2">
          <label htmlFor="dateFin">Date Fin</label>
          <InputMask
            id="dateFin"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={brouillard.dateFin}
            onChange={(e) => handleDateChange('dateFin', e.value || '')}
          />
        </div>

        <div className="field col-12">
          <label htmlFor="valide">Valide</label>
          <Checkbox
            id="valide"
            name="valide"
            checked={brouillard.valide}
            onChange={handleCheckboxChange}
          />
        </div>

      </div>
    </div>
  );
};

export default CptBrouillardForm;
