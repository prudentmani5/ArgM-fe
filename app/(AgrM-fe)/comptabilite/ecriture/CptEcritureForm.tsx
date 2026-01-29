'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { InputMask } from 'primereact/inputmask';
import { Button } from 'primereact/button';
import { CptEcriture } from './CptEcriture';
import { CptBrouillard } from '../brouillard/CptBrouillard';
import { CptCompte } from '../compte/CptCompte';

interface CptEcritureFormProps {
  ecriture: CptEcriture;
  brouillards: CptBrouillard[];
  comptes: CptCompte[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDateChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: number | null) => void;
  handleBrdDropDownSelect: (e: DropdownChangeEvent) => void;
  handleCptDropDownSelect: (e: DropdownChangeEvent) => void;
  handleSubmit: () => void;
  handleReset: () => void;
  handleDelete?: () => void; // Optional now since we don't use it
  handlePieceBlur: () => void;
  handelSavePiece: () => void;
  handelNumeroPiece: (brd: any) => void;
  handelDeletePiece: () => void;
  handelDeleteList: () => void;
  handleAutoEquilibre: () => void;
}

const CptEcritureForm: React.FC<CptEcritureFormProps> = ({
  ecriture,
  brouillards,
  comptes,
  handleChange,
  handleDateChange,
  handleNumberChange,
  handleBrdDropDownSelect,
  handleCptDropDownSelect,
  handleSubmit,
  handleReset,
  handlePieceBlur,
  handelSavePiece,
  handelNumeroPiece,
  handelDeletePiece,
  handelDeleteList,
  handleAutoEquilibre
}) => {
  return (
    <div className="card p-fluid" style={{ marginTop: '0.5rem' }}>


      <div className="formgrid grid">
        {/* Ligne 1 */}
        <div className="field col-4">
          <label htmlFor="brouillardId">Brouillard</label>
          <Dropdown
            name="brouillardId"
            value={ecriture.brouillardId}
            options={brouillards}
            optionLabel="codeLibelle"
            optionValue="brouillardId"
            onChange={handleBrdDropDownSelect}
            placeholder="Sélectionner..."
            filter
            filterBy="codeLibelle"
          />
        </div>

        <div className="field col-4">
          <label>Journal</label>
          <InputText value={ecriture.codeJournal || ''} readOnly />
        </div>

        <div className="field col-4">
          <label>Solde Journal</label>
          <InputNumber value={ecriture.soldeJournal ?? 0} readOnly />
        </div>

        {/* <div className="field col-4"></div> */}

        {/* Ligne 2 */}
        <div className="field col-4">
          <label htmlFor="numeroPiece">N° Pièce</label>
          <InputText
            id="numeroPiece"
            name="numeroPiece"
            value={ecriture.numeroPiece || ''}
            onChange={handleChange}
            onBlur={handlePieceBlur} // <— chargement auto à la sortie
          />
        </div>

        <div className="field col-4">
          <label htmlFor="reference">Référence</label>
          <InputText
            id="reference"
            name="reference"
            value={ecriture.reference || ''}
            onChange={handleChange}
          />
        </div>

        <div className="field col-4">
          <label>Date</label>
          <InputMask
            mask="99/99/9999"
            placeholder="jj/mm/aaaa"
            value={ecriture.printDate || ''}
            onChange={(e) => handleDateChange('printDate', e.value || '')}
          />
        </div>

        {/* Ligne 3 */}
        <div className="field col-4">
          <label>Compte</label>
          <Dropdown
            name="compteId"
            value={ecriture.compteId}
            options={comptes}
            optionLabel="codeLibelle"
            optionValue="compteId"
            onChange={handleCptDropDownSelect}
            placeholder="Sélectionner un compte"
            filter
            filterBy="codeLibelle"
            filterMatchMode="startsWith"
          />
        </div>

        <div className="field col-4">
          <label>Libellé</label>
          <InputText name="libelle" value={ecriture.libelle || ''} onChange={handleChange} />
        </div>

        <div className="field col-2">
          <label>Débit</label>
          <InputNumber
            value={ecriture.debit ?? null}
            onValueChange={(e) => handleNumberChange('debit', e.value)}
            mode="decimal"
            locale="fr-FR"
          />
        </div>

        <div className="field col-2">
          <label>Crédit</label>
          <InputNumber
            value={ecriture.credit ?? null}
            onValueChange={(e) => handleNumberChange('credit', e.value)}
            mode="decimal"
            locale="fr-FR"
          />
        </div>

        {/* Boutons */}

        <div className="field col-2">
          <Button label="Enregistrer pièce" icon="pi pi-file" outlined onClick={handelSavePiece} className="w-full p-button-info" />
        </div>
        <div className="field col-2">
          <Button label="Supprimer pièce" icon="pi pi-times-circle" onClick={handelDeletePiece} className="w-full  p-button-warning" />
        </div>
        <div className="field col-2">
          <Button label="Réinitialiser" icon="pi pi-refresh" outlined onClick={handleReset} className="w-full" />
        </div>
        <div className="field col-2">
          <Button label="Enregistrer" icon="pi pi-save" onClick={handleSubmit} className="w-full   p-button-success" />
        </div>
        <div className="field col-2">
          <Button
            label="Supprimer les écritures"
            icon="pi pi-trash" 
            className="p-button-danger mb-2 "
            onClick={handelDeleteList}

          />
          
        </div>
        <div className="field col-2">
            <Button
              label="Equilibrer" outlined
              icon="pi pi-arrow-right-arrow-left"
              className="p-button-secondary  mb-2 "
              onClick={handleAutoEquilibre} />
          </div>
      </div>
    </div>
  );
};

export default CptEcritureForm;
