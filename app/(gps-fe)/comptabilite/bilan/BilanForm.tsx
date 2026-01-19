'use client';

import React from 'react';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';

interface BilanFormProps {
  dateReferenceStr: string;
  setDateReferenceStr: (date: string) => void;
  etatEcritures: string;
  setEtatEcritures: (etat: string) => void;
  typeBilan: string;
  setTypeBilan: (etat: string) => void;
  handleSubmit: () => void;
}

const BilanForm: React.FC<BilanFormProps> = ({
  dateReferenceStr,
  setDateReferenceStr,
  etatEcritures,
  setEtatEcritures,
  typeBilan,
  setTypeBilan,
  handleSubmit
}) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">

        {/* Date référence */}
        <div className="field col-4">
          <label htmlFor="dateReference">À la date du ...</label>
          <InputMask
            id="dateReference"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={dateReferenceStr}
            onChange={(e) => setDateReferenceStr(e.value || '')}
          />
        </div>

        {/* État des écritures */}
        <div className="field col-12">
          <label>Écritures :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            <div>
              <RadioButton inputId="validees" name="etatEcritures" value="validees"
                onChange={(e) => setEtatEcritures(e.value)} checked={etatEcritures === 'validees'} />
              <label htmlFor="validees" className="ml-2">Validées</label>
            </div>
            <div>
              <RadioButton inputId="nonValidees" name="etatEcritures" value="nonValidees"
                onChange={(e) => setEtatEcritures(e.value)} checked={etatEcritures === 'nonValidees'} />
              <label htmlFor="nonValidees" className="ml-2">Non Validées</label>
            </div>
            <div>
              <RadioButton inputId="toutes" name="etatEcritures" value="toutes"
                onChange={(e) => setEtatEcritures(e.value)} checked={etatEcritures === 'toutes'} />
              <label htmlFor="toutes" className="ml-2">Toutes</label>
            </div>
          </div>
        </div>

        {/* Type de bilan */}
        <div className="field col-12">
          <label>Bilan :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            <div>
              <RadioButton inputId="actif" name="typeBilan" value="actif"
                onChange={(e) => setTypeBilan(e.value)} checked={typeBilan === 'actif'} />
              <label htmlFor="actif" className="ml-2">Actif</label>
            </div>
            <div>
              <RadioButton inputId="passif" name="typeBilan" value="passif"
                onChange={(e) => setTypeBilan(e.value)} checked={typeBilan === 'passif'} />
              <label htmlFor="passif" className="ml-2">Passif</label>
            </div>
          </div>
        </div>

        {/* Bouton */}
        <div className="field col-3 mt-3">
          <Button label="Générer PDF" icon="pi pi-file-pdf" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default BilanForm;
