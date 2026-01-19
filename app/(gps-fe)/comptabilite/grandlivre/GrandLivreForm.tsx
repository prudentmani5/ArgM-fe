'use client';

import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { CptCompte } from '../compte/CptCompte';

interface GrandLivreFormProps {
  comptesDb: CptCompte[];
  comptesFn: CptCompte[];
  compteDebut: string | null;
  setCompteDebut: (val: string | null) => void;
  compteFin: string | null;
  setCompteFin: (val: string | null) => void;
  dateDebutStr: string;
  setDateDebutStr: (date: string) => void;
  dateFinStr: string;
  setDateFinStr: (date: string) => void;
  handleSubmit: () => void;
}

const GrandLivreForm: React.FC<GrandLivreFormProps> = ({
  comptesDb,
  comptesFn,
  compteDebut,
  setCompteDebut,
  compteFin,
  setCompteFin,
  dateDebutStr,
  setDateDebutStr,
  dateFinStr,
  setDateFinStr,
  handleSubmit,
}) => {
  return (
    <div className="formgrid grid p-fluid">
      {/* Compte Début */}
      <div className="field col-6">
        <label>Compte Début</label>
        <Dropdown
          name="compteDebut"
          value={compteDebut}
          onChange={(e) => setCompteDebut(e.value)}
          options={comptesDb}
          optionLabel="codeLibelle"
          optionValue="compteId"
          placeholder="Sélectionner"
          filter
          filterBy="codeLibelle"
          filterMatchMode="startsWith"
        />
      </div>

      {/* For spacing */}
      <div className="field col-6" />

      {/* Compte Fin */}
      <div className="field col-6">
        <label>Compte Fin</label>
        <Dropdown
          name="compteFin"
          value={compteFin}
          onChange={(e) => setCompteFin(e.value)}
          options={comptesFn}
          optionLabel="codeLibelle"
          optionValue="compteId"
          placeholder="Sélectionner"
          filter
          filterBy="codeLibelle"
          filterMatchMode="startsWith"
        />
      </div>

      {/* For spacing */}
      <div className="field col-6" />

      {/* Dates avec InputMask */}
      <div className="field col-3">
        <label>Date Début</label>
        <InputMask
          mask="99/99/9999"
          placeholder="jj/mm/aaaa"
          value={dateDebutStr}
          onChange={(e) => setDateDebutStr(e.value || '')}
        />
      </div>

      <div className="field col-3">
        <label>Date Fin</label>
        <InputMask
          mask="99/99/9999"
          placeholder="jj/mm/aaaa"
          value={dateFinStr}
          onChange={(e) => setDateFinStr(e.value || '')}
        />
      </div>

      {/* For spacing */}
      <div className="field col-6" />

      {/* Bouton Générer */}
      <div className="field col-3">
        <Button
          label="Générer Grand Livre"
          icon="pi pi-file-pdf"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
};

export default GrandLivreForm;
