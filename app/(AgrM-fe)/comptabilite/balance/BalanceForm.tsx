'use client';

import React from 'react';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { RadioButton } from 'primereact/radiobutton';
import { Dropdown } from 'primereact/dropdown';
import { CptCompte } from '../compte/CptCompte';

interface BalanceFormProps {
  dateDebutStr: string;
  setDateDebutStr: (date: string) => void;
  dateFinStr: string;
  setDateFinStr: (date: string) => void;
  typeBalance: string;
  setTypeBalance: (val: string) => void;
  compteDebut: string | null;
  compteFin: string | null;
  setCompteDebut: (val: string | null) => void;
  setCompteFin: (val: string | null) => void;
  regroupement: string;
  setRegroupement: (val: string) => void;
  etatEcritures: string;
  setEtatEcritures: (val: string) => void;
  comptesFn: CptCompte[];
  comptesDb: CptCompte[];
  handleSubmit: () => void;
}

const BalanceForm: React.FC<BalanceFormProps> = ({
  dateDebutStr,
  setDateDebutStr,
  dateFinStr,
  setDateFinStr,
  typeBalance,
  setTypeBalance,
  compteDebut,
  compteFin,
  setCompteDebut,
  setCompteFin,
  regroupement,
  setRegroupement,
  etatEcritures,
  setEtatEcritures,
  comptesDb,
  comptesFn,
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
            value={dateDebutStr}
            onChange={(e) => setDateDebutStr(e.value || '')}
          />
        </div>
        <div className="field col-3">
          <label>Au</label>
          <InputMask
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={dateFinStr}
            onChange={(e) => setDateFinStr(e.value || '')}
          />
        </div>

        {/* Type Balance */}
        <div className="field col-12">
          <label>Balance :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {['generale', 'clients', 'fournisseurs'].map((val) => (
              <div key={val}>
                <RadioButton
                  inputId={val}
                  name="typeBalance"
                  value={val}
                  onChange={(e) => setTypeBalance(e.value)}
                  checked={typeBalance === val}
                />
                <label htmlFor={val} className="ml-2 text-capitalize">
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Plage comptes */}
        <div className="field col-6">
          <label>Du Compte</label>
          <Dropdown
            value={compteDebut}
            options={comptesDb}
            onChange={(e) => setCompteDebut(e.value)}
            optionLabel="codeLibelle"
            optionValue="compteId"
            placeholder="Sélectionner un compte"
            filter
            filterBy="codeLibelle"
            filterMatchMode="startsWith"
          />
        </div>
        <div className="field col-6" />
        <div className="field col-6">
          <label>Au Compte</label>
          <Dropdown
            value={compteFin}
            options={comptesFn}
            onChange={(e) => setCompteFin(e.value)}
            optionLabel="codeLibelle"
            optionValue="compteId"
            placeholder="Sélectionner un compte"
            filter
            filterBy="codeLibelle"
            filterMatchMode="startsWith"
          />
        </div>

        {/* Regroupement */}
        <div className="field col-12">
          <label>Regroupement :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            <div>
              <RadioButton inputId="parCompte" name="regroupement" value="compte"
                onChange={(e) => setRegroupement(e.value)} checked={regroupement === 'compte'} />
              <label htmlFor="parCompte" className="ml-2">Par Compte</label>
            </div>
            <div>
              <RadioButton inputId="parLibelle" name="regroupement" value="libelle"
                onChange={(e) => setRegroupement(e.value)} checked={regroupement === 'libelle'} />
              <label htmlFor="parLibelle" className="ml-2">Par Libellé</label>
            </div>
          </div>
        </div>

        {/* Écritures */}
        <div className="field col-12">
          <label>Écritures de la balance :</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {['validees', 'nonValidees', 'toutes'].map((val) => (
              <div key={val}>
                <RadioButton
                  inputId={val}
                  name="etatEcritures"
                  value={val}
                  onChange={(e) => setEtatEcritures(e.value)}
                  checked={etatEcritures === val}
                />
                <label htmlFor={val} className="ml-2 text-capitalize">
                  {val === 'validees' ? 'Validées' : val === 'nonValidees' ? 'Non Validées' : 'Toutes'}
                </label>
              </div>
            ))}
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

export default BalanceForm;
