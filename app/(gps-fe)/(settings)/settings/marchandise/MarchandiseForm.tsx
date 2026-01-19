"use client";

import React from "react";
import { Marchandise } from "./Marchandise";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { TypePackaging } from "../typePackaging/TypePackaging";
import { FacClasse } from "../facClasse/FacClasse";
import { ClasseMarchandise } from "../classeMarchandise/ClasseMarchandise";
import { Checkbox } from "primereact/checkbox";

interface MarchandiseProps {
  marchandise: Marchandise;
  categories: { label: string; value: string }[];
  genres: { label: string; value: string }[];
  typeConditions: TypePackaging[];
  classeTarifs: FacClasse[];
  compteClasses: ClasseMarchandise[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleValueChange: (e: InputNumberValueChangeEvent) => void;
  handleDropDownSelect: (e: DropdownChangeEvent) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const MarchandiseForm: React.FC<MarchandiseProps> = ({
  marchandise,
  categories,
  genres,
  typeConditions,
  classeTarifs,
  compteClasses,
  handleChange,
  handleValueChange,
  handleDropDownSelect,
  handleCheckboxChange
}) => {
  return (
    <div className="card p-fluid">
      <div className="formgrid grid">
        <div className="field col-6">
          <label htmlFor="nom">Nom</label>
          <InputText id="nom" type="text" name="nom" value={marchandise.nom} onChange={handleChange} />
        </div>

        <div className="field col-6">
          <label htmlFor="prixCamion">Prix Camion</label>
          <InputNumber id="prixCamion" name="prixCamion" value={marchandise.prixCamion} onValueChange={handleValueChange} mode="currency"
            currency="FBU"
            locale="fr-FR" />
        </div>
        <div className="field col-6">
          <label htmlFor="categorie">Catégorie</label>
          <Dropdown
            name="categorie"
            value={marchandise.categorie}
            options={categories}
            optionValue="value"
            onChange={handleDropDownSelect}
            placeholder="Sélectionner une catégorie"
          />
        </div>

        <div className="field col-6">
          <label htmlFor="typeConditionId">Type Condition</label>
          <Dropdown
            name="typeConditionId"
            value={marchandise.typeConditionId}
            options={typeConditions}
            optionValue="typeConditionId"
            optionLabel="libelle"
            onChange={handleDropDownSelect}
            placeholder="Sélectionner un type de conditionnement"
          />
        </div>
        <div className="field col-6">
          <label htmlFor="classeId">Classe tarif</label>
          <Dropdown
            name="classeId"
            value={marchandise.classeId}
            options={classeTarifs}
            optionValue="classeId"
            optionLabel="codeClasse"
            onChange={handleDropDownSelect}
            placeholder="Sélectionner une classe de tarification"
          />
        </div>
        <div className="field col-6">
          <label htmlFor="classeMarchandiseId">Classe compte</label>
          <Dropdown
            name="classeMarchandiseId"
            value={marchandise.classeMarchandiseId}
            options={compteClasses}
            optionValue="classeMarchandiseId"
            optionLabel="libelle"
            onChange={handleDropDownSelect}
            placeholder="Sélectionner une classe de tarification"
          />
        </div>
        <div className="field col-6">
          <label htmlFor="compte">Compte</label>
          <InputText id="compte" type="text" name="compte" value={marchandise.compte} onChange={handleChange} />
        </div>
        <div className="field col-6">
          <label htmlFor="prixBarge">Prix Barge</label>
          <InputNumber id="prixBarge" name="prixBarge" value={marchandise.prixBarge} onValueChange={handleValueChange} mode="currency"
            currency="FBU"
            locale="fr-FR" />
        </div>

        <div className="field col-6">
          <label htmlFor="genre">Genre</label>
          <Dropdown
            id="genre"
            value={marchandise.genre}
            options={genres}
            onChange={handleDropDownSelect}
            placeholder="Sélectionner un genre"
          />
        </div>

        <div className="field col-6">
          <label htmlFor="surtaxe">Surtaxe</label>
          <InputNumber id="surtaxe" name="surtaxe" value={marchandise.surtaxe} onValueChange={handleValueChange} mode="currency"
            currency="FBU"
            locale="fr-FR" />
        </div>

        <div className="field col-6">
          <label htmlFor="actif">Actif</label>
          <Dropdown
            id="actif"
            value={marchandise.actif ? "Oui" : "Non"}
            options={[
              { label: "Oui", value: true },
              { label: "Non", value: false },
            ]}
            onChange={handleDropDownSelect}
            placeholder="Sélectionner"
          />
        </div>
        <div className="field col-6">
          <label htmlFor="sallissage">Salissage</label>
          <Checkbox inputId="sallissage" name="sallissage" checked={marchandise.sallissage} onChange={handleCheckboxChange} />
        </div>
      </div>
    </div>
  );
};

export default MarchandiseForm;
