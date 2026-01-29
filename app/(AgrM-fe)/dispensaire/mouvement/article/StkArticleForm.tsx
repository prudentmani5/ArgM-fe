'use client'

import React from "react";
import { StkArticle } from "./StkArticle";
import { InputText } from "primereact/inputtext";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";
import { StkMagasin } from "./StkMagasin";
import { StkSousCategorie } from "./StkSousCategorie";
import { StkUnite } from "./StkUnite";
import { Stkservice } from "./Stkservice";
import { CategoryArticle } from "./CategoryArticle";

interface StkArticleProps {
    article: StkArticle;
    magasins: StkMagasin[];
    sousCategories: StkSousCategorie[];
    unites: StkUnite[];
    services: Stkservice[];
    categories: CategoryArticle[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: InputNumberValueChangeEvent) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
}

const StkArticleForm: React.FC<StkArticleProps> = ({ 
    article, 
    magasins, 
    sousCategories,
    unites,
    services,
    categories,
    handleChange, 
    handleValueChange,
    handleDropDownSelect,
    handleDateChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Section 1: Informations de base */}
                <div className="field col-3">
                    <label htmlFor="codeArticle">Code Article</label>
                    <InputText id="codeArticle" name="codeArticle" value={article.codeArticle} onChange={handleChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText id="libelle" name="libelle" value={article.libelle} onChange={handleChange} />
                </div>

                <div className="field col-3">
                    <label htmlFor="catalogue">Catalogue</label>
                    <InputText id="catalogue" name="catalogue" value={article.catalogue|| ''} onChange={handleChange} />
                </div>

                 <div className="field col-3">
                    <label htmlFor="seuil">Min. Seuil</label>
                    <InputNumber id="seuil" name="seuil" value={article.seuil} onValueChange={handleValueChange} />
                </div>

                 <div className="field col-3">
                    <label htmlFor="seuilMax">Max. Seuil</label>
                    <InputNumber id="seuilMax" name="seuilMax" value={article.seuilMax} onValueChange={handleValueChange} />
                </div>

                 <div className="field col-3">
                    <label htmlFor="compteStock">compte Stock</label>
                    <InputText id="compteStock" name="compteStock" value={article.compteStock|| ''} onChange={handleChange} />
                </div>

                <div className="field col-3">
                    <label htmlFor="compteCharge">compte Charge</label>
                    <InputText id="compteCharge" name="compteCharge" value={article.compteCharge|| ''} onChange={handleChange} />
                </div>

                <div className="field col-3">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown 
                        id="magasinId" 
                        name="magasinId" 
                        value={article.magasinId} 
                        options={magasins} 
                        optionLabel="nom" 
                        optionValue="magasinId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner un magasin"
                        filter
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="sousCategorieId">Sous Catégorie</label>
                    <Dropdown 
                        id="sousCategorieId" 
                        name="sousCategorieId" 
                        value={article.sousCategorieId} 
                        options={sousCategories} 
                        optionLabel="libelle" 
                        optionValue="sousCategorieId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner une sous-catégorie"
                        filter
                    />
                </div>

                {/* Section 2: Stock et quantités */}
                <div className="field col-3">
                    <label htmlFor="qteStock">Quantité en stock</label>
                    <InputNumber id="qteStock" name="qteStock" value={article.qteStock} onValueChange={handleValueChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="qtePhysique">Quantité physique</label>
                    <InputNumber id="qtePhysique" name="qtePhysique" value={article.qtePhysique} onValueChange={handleValueChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="uniteId">Unité</label>
                    <Dropdown 
                        id="uniteId" 
                        name="uniteId" 
                        value={article.uniteId} 
                        options={unites} 
                        optionLabel="libelle" 
                        optionValue="uniteId" 
                        onChange={handleDropDownSelect} 
                        placeholder="Sélectionner une unité"
                        filter
                    />
                </div>

                {/* Section 3: Prix et seuils */}
                <div className="field col-3">
                    <label htmlFor="pump">PUMP</label>
                    <InputNumber id="pump" name="pump" value={article.pump} mode="currency" currency="BIF" onValueChange={handleValueChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="prixUnitaire">prix Unitaire</label>
                    <InputNumber id="prixUnitaire" name="prixUnitaire" value={article.prixUnitaire} mode="currency" currency="BIF" onValueChange={handleValueChange} />
                </div>
               

              
                  {/*
                <div className="field col-3">
                    <label htmlFor="lot">Gestion par lot</label>
                    <Checkbox 
                        id="lot" 
                        name="lot" 
                        checked={article.lot} 
                        onChange={(e) => handleCheckboxChange('lot', e.checked ?? false)} 
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="visible">Visible</label>
                    <Checkbox 
                        id="visible" 
                        name="visible" 
                        checked={article.visible ?? false} 
                        onChange={(e) => handleCheckboxChange('visible', e.checked ?? false)} 
                    />
                </div>
                    */}

                {/* Section 5: Dates */}
                <div className="field col-3">
                    <label htmlFor="dateCreation">Date de création</label>
                    <Calendar 
                        id="dateCreation" 
                        value={article.dateCreation ? new Date(article.dateCreation) : null} 
                        onChange={(e) => handleDateChange('dateCreation', e.value as Date)} 
                        showIcon 
                    />
                </div>
                  {/*
                <div className="field col-4">
                    <label htmlFor="dateTarif">Date tarif</label>
                    <Calendar 
                        id="dateTarif" 
                        value={article.dateTarif ? new Date(article.dateTarif) : null} 
                        onChange={(e) => handleDateChange('dateTarif', e.value as Date)} 
                        showIcon 
                    />
                </div>

                 <div className="field col-3">
                    <label htmlFor="seuil">Seuil minimum</label>
                    <InputNumber id="seuil" name="seuil" value={article.seuil} onValueChange={handleValueChange} />
                </div>

                  */}

                {/* Section 6: Description et autres */}
                <div className="field col-3">
                    <label htmlFor="description">Description</label>
                    <InputText id="description" name="description" value={article.description || ''} onChange={handleChange} />
                </div>
                  {/* Section 4: Options */}
                <div className="field col-3">
                    <label htmlFor="peremption">Péremption</label>
                    <Checkbox 
                        id="peremption" 
                        name="peremption" 
                        checked={article.peremption} 
                        onChange={(e) => handleCheckboxChange('peremption', e.checked ?? false)} 
                    />

                  
                </div>
            </div>
        </div>
    );
}

export default StkArticleForm;