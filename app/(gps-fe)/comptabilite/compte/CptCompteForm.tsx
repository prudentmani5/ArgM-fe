'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { CptCompte } from "./CptCompte";
import React from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface CptCompteProps {
  compte: CptCompte;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDropdownChange: (e: DropdownChangeEvent) => void;
}
const categories = [
    { label: 'Client', value: 1 },
    { label: 'Fournisseur', value: 2 },
    { label: 'Généraux', value: 3 }
];
const sensCpt = [
    { label: 'Aucun', value: ' ' },
    { label: 'Débit', value: 'D' },
    { label: 'Crédit', value: 'C' }
];
const CptCompteForm: React.FC<CptCompteProps> = ({ compte, handleChange,handleDropdownChange, handleCheckboxChange }) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">
        <div className="field col-4">
          <label htmlFor="codeCompte">N° Compte</label>
          <InputText id="codeCompte" name="codeCompte" value={compte.codeCompte} onChange={handleChange} />
        </div>

        <div className="field col-8">
          <label htmlFor="libelle">Libellé</label>
          <InputText id="libelle" name="libelle" value={compte.libelle} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="typeCompte">Catégorie de Compte</label>
          <Dropdown 
                                  id="typeCompte"
                                  name="typeCompte"
                                  value={compte.typeCompte}
                                  options={categories}
                                  optionValue="value"
                                  onChange={handleDropdownChange}
                                  placeholder="Sélectionnez catégorie"
                              />
        </div>

       
        <div className="field col-2">
          <label htmlFor="codeBudget">Code Budget</label>
          <InputText id="codeBudget" name="codeBudget" value={compte.codeBudget} onChange={handleChange} />
        </div>

        <div className="field col-2">
          <label htmlFor="compteBanque">Compte Banque</label>
          <InputText id="compteBanque" name="compteBanque" value={compte.compteBanque} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="sens">Sens</label>
          <Dropdown 
                                  id="sens"
                                  name="sens"
                                  value={compte.sens}
                                  options={sensCpt}
                                  optionValue="value"
                                  onChange={handleDropdownChange}
                                  placeholder="Sélectionnez le sens"
                              />

        </div>

        <div className="field col-8">
          <label htmlFor="adresse">Adresse</label>
          <InputText id="adresse" name="adresse" value={compte.adresse} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="bp">BP</label>
          <InputText id="bp" name="bp" value={compte.bp} onChange={handleChange} />
        </div>

        <div className="field col-4">
          <label htmlFor="tel">Tél</label>
          <InputText id="tel" name="tel" value={compte.tel} onChange={handleChange} />
        </div>

        <div className="field col-8">
          <label htmlFor="email">Email</label>
          <InputText id="email" name="email" value={compte.email} onChange={handleChange} />
        </div>

        {/* Checkbox fields */}
        <div className="field col-3">
          <label htmlFor="activite">Activité</label>
          <Checkbox inputId="activite" name="activite" checked={compte.activite} onChange={handleCheckboxChange} />
        </div>

        <div className="field col-3">
          <label htmlFor="financement">Financement</label>
          <Checkbox inputId="financement" name="financement" checked={compte.financement} onChange={handleCheckboxChange} />
        </div>

        <div className="field col-3">
          <label htmlFor="geographique">Géographique</label>
          <Checkbox inputId="geographique" name="geographique" checked={compte.geographique} onChange={handleCheckboxChange} />
        </div>

        <div className="field col-3">
          <label htmlFor="collectif">Collectif</label>
          <Checkbox inputId="collectif" name="collectif" checked={compte.collectif} onChange={handleCheckboxChange} />
        </div>

        <div className="field col-3">
          <label htmlFor="actif">Actif</label>
          <Checkbox inputId="actif" name="actif" checked={compte.actif} onChange={handleCheckboxChange} />
        </div>
      </div>
    </div>
  );
};

export default CptCompteForm;
