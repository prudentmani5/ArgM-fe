'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { InputMask } from 'primereact/inputmask';

interface VariationCapitauxFormProps {
  dateReference: string;
  setDateReference: (date: string) => void;

  etatEcritures: string; // validees | nonValidees | toutes
  setEtatEcritures: (etat: string) => void;

  typeVariation: string; // simplifie | detaille
  setTypeVariation: (type: string) => void;

  handleSubmit: () => void;
}

const VariationCapitauxForm: React.FC<VariationCapitauxFormProps> = ({
  dateReference,
  setDateReference,
  etatEcritures,
  setEtatEcritures,
  typeVariation,
  setTypeVariation,
  handleSubmit
}) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">

        {/* Date de référence */}
        <div className="field col-3">
          <label htmlFor="dateReference">À la date du </label>
          <InputMask
            id="dateReference"
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={dateReference}
            onChange={(e) => setDateReference(e.target.value || '')}
          />
        </div>

        {/* État des écritures */}
        <div className="field col-12">
          <label>Écritures :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            <div>
              <RadioButton
                inputId="validees"
                name="etatEcritures"
                value="validees"
                onChange={(e) => setEtatEcritures(e.value)}
                checked={etatEcritures === 'validees'}
              />
              <label htmlFor="validees" className="ml-2">Validées</label>
            </div>

            <div>
              <RadioButton
                inputId="nonValidees"
                name="etatEcritures"
                value="nonValidees"
                onChange={(e) => setEtatEcritures(e.value)}
                checked={etatEcritures === 'nonValidees'}
              />
              <label htmlFor="nonValidees" className="ml-2">Non validées</label>
            </div>

            <div>
              <RadioButton
                inputId="toutes"
                name="etatEcritures"
                value="toutes"
                onChange={(e) => setEtatEcritures(e.value)}
                checked={etatEcritures === 'toutes'}
              />
              <label htmlFor="toutes" className="ml-2">Toutes</label>
            </div>
          </div>
        </div>

        

        {/* Bouton */}
        <div className="field col-3 mt-3">
          <Button
            label="Générer PDF"
            icon="pi pi-file-pdf"
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default VariationCapitauxForm;
