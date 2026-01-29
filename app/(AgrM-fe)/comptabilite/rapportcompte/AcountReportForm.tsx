'use client';

import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { CptCompte } from '../compte/CptCompte';

interface AccountReportFormProps {
  comptes: CptCompte[];
  compteDebut: string | null;
  compteFin: string | null;
  dateDebut: string; // ← string au lieu de Date
  dateFin: string;   // ← idem
  handleDropDownSelect: (e: DropdownChangeEvent) => void;
  handleDateChange: (name: string, value: string) => void;
  handleSubmit: () => void;
  handleExcelSubmit: () => void;
}

const AccountReportForm: React.FC<AccountReportFormProps> = ({
  comptes,
  compteDebut,
  compteFin,
  dateDebut,
  dateFin,
  handleDropDownSelect,
  handleDateChange,
  handleSubmit,
  handleExcelSubmit
}) => {
  return (
    <div className="formgrid grid p-fluid">
      <div className="field col-6">
        <label>Compte </label>
        <Dropdown
          name="compteDebut"
          value={compteDebut}
          onChange={handleDropDownSelect}
          options={comptes}
          optionLabel="codeLibelle"
          optionValue="codeCompte"
          placeholder="Sélectionner"
          filter
          filterBy="codeLibelle"
          filterMatchMode="startsWith"
        />
      </div>

      <div className="field col-6" />

      <div className="field col-3">
        <label>Date Début</label>
        <InputMask
          mask="99/99/9999"
          placeholder="jj/mm/aaaa"
          value={dateDebut}
          onChange={(e) => handleDateChange('dateDebut', e.target.value || '')}
        />
      </div>

      <div className="field col-3">
        <label>Date Fin</label>
        <InputMask
          mask="99/99/9999"
          placeholder="jj/mm/aaaa"
          value={dateFin}
          onChange={(e) => handleDateChange('dateFin', e.target.value || '')}
        />
      </div>

      <div className="field col-6" />
      <div className="field col-3">
        <Button label="Générer PDF" icon="pi pi-file-pdf" onClick={handleSubmit} />
      </div>
      <div className="field col-3">
        <Button label="Générer Excel" icon="pi pi-file-excel" onClick={handleExcelSubmit} />
      </div>
    </div>
  );
};

export default AccountReportForm;
