'use client';

import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import { InputMask } from 'primereact/inputmask';
import { CptJournal } from '../journal/CptJournal';
import { Devise } from '../../(settings)/settings/compteBanquaire/CompteBanque';

interface JournalReportFormProps {
  dateDebut: string;
  setDateDebut: (date: string) => void;
  dateFin: string;
  setDateFin: (date: string) => void;
  journalId: string | null;
  setJournalId: (val: string | null) => void;
  deviseId: string | null;
  setDeviseId: (val: string | null) => void;
  etatEcritures: string; // "validees" | "nonValidees" | "toutes"
  setEtatEcritures: (val: string) => void;
  journals: CptJournal[];
  devises: Devise[];
  handleSubmit: () => void;
}

const JournalReportForm: React.FC<JournalReportFormProps> = ({
  dateDebut,
  setDateDebut,
  dateFin,
  setDateFin,
  journalId,
  setJournalId,
  deviseId,
  setDeviseId,
  etatEcritures,
  setEtatEcritures,
  journals,
  devises,
  handleSubmit
}) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">

        {/* Période */}
        <div className="field col-3">
          <label>Période du</label>
          <InputMask
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value || '')}
          />
        </div>

        <div className="field col-3">
          <label>Au</label>
          <InputMask
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value || '')}
          />
        </div>

        {/* for space */}
        <div className="field col-6" />

        {/* Journal */}
        <div className="field col-6">
          <label>Journal</label>
          <Dropdown
            value={journalId}
            options={journals}
            onChange={(e) => setJournalId(e.value)}
            name="journalId"
            optionLabel="codeLibelle"
            optionValue="journalId"
            placeholder="[Aucun]"
            filter
            filterBy="codeLibelle"
          />
        </div>

        {/* for space */}
        <div className="field col-6" />

        {/* Devise */}
        <div className="field col-6">
          <label>En devise</label>
          <Dropdown
            value={deviseId}
            options={devises}
            onChange={(e) => setDeviseId(e.value)}
            optionLabel="code"
            optionValue="deviseId"
            placeholder="[Aucune]"
            filter
            filterBy="code"
          />
        </div>

        {/* Écritures */}
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

        {/* Bouton */}
        <div className="field col-3 mt-3">
          <Button label="Générer PDF" icon="pi pi-file-pdf" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default JournalReportForm;
