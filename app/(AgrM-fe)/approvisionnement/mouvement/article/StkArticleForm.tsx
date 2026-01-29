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
import { useCurrentUser } from '@/hooks/fetchData/useCurrentUser';

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
    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();
    return (
        <div className="card p-fluid">
            <div hidden className="formgrid grid">
                {/* Section 1: Informations de base */}
                <div hidden className="field col-6">
                    <label htmlFor="codeArticle">Code Article</label>
                    <InputText id="codeArticle" name="codeArticle" value={article.codeArticle} onChange={handleChange} />
                </div>

                <div hidden className="field col-6">
                    <label htmlFor="userCreation">userCreation</label>
                    <InputText id="userCreation" name="userCreation" value={appUser?.firstname} onChange={handleChange} />
                </div>


                <div className="field col-6">
    <label htmlFor="libelle" className="font-semibold">
        Libellé <span className="text-red-500">*</span>
    </label>
    <InputText 
        id="libelle" 
        name="libelle" 
        value={article.libelle} 
        onChange={handleChange}
        className={!article.libelle ? 'p-invalid' : ''}
        placeholder="Entrez le libellé de l'article"
        required
        maxLength={100}
    />
    {!article.libelle && (
        <small className="p-error">Le libellé est obligatoire</small>
    )}
    <small className="p-text-secondary">
        {article.libelle ? `${article.libelle.length}/100 caractères` : 'Max. 100 caractères'}
    </small>
</div>

                
                {/* Nouveau champ : Catalogue */}
                <div className="field col-3">
                    <label htmlFor="catalogue">Catalogue</label>
                    <InputText 
                        id="catalogue" 
                        name="catalogue" 
                        value={article.catalogue || ''} 
                        onChange={handleChange} 
                        placeholder="Entrez le catalogue"
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
                    />
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
                    />
                </div>

                {/* Section 3: Prix et seuils */}
                <div className="field col-3">
                    <label htmlFor="pump">PUMP</label>
                    <InputNumber id="pump" name="pump" value={article.pump} mode="currency" currency="BIF" onValueChange={handleValueChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="prixVente">Prix de vente</label>
                    <InputNumber id="prixVente" name="prixVente" value={article.prixVente} mode="currency" currency="BIF" onValueChange={handleValueChange} />
                </div>
                <div className="field col-3">
                    <label htmlFor="seuil">Seuil minimum</label>
                    <InputNumber id="seuil" name="seuil" value={article.seuil} onValueChange={handleValueChange} />
                </div>

                <div className="field col-3">
                    <label htmlFor="seuilMax">Seuil maximum</label>
                    <InputNumber id="seuilMax" name="seuilMax" value={article.seuilMax} onValueChange={handleValueChange} />
                </div>

                {/* Section 4: Options */}
                <div hidden className="field col-3">
                    <label htmlFor="peremption">Péremption</label>
                    <Checkbox 
                        id="peremption" 
                        name="peremption" 
                        checked={article.peremption} 
                        onChange={(e) => handleCheckboxChange('peremption', e.checked ?? false)} 
                    />
                </div>
                <div hidden className="field col-3">
                    <label htmlFor="lot">Gestion par lot</label>
                    <Checkbox 
                        id="lot" 
                        name="lot" 
                        checked={article.lot} 
                        onChange={(e) => handleCheckboxChange('lot', e.checked ?? false)} 
                    />
                </div>
                <div hidden className="field col-3">
                    <label htmlFor="visible">Visible</label>
                    <Checkbox 
                        id="visible" 
                        name="visible" 
                        checked={article.visible ?? false} 
                        onChange={(e) => handleCheckboxChange('visible', e.checked ?? false)} 
                    />
                </div>

                {/* Section 5: Dates */}
                <div hidden className="field col-6">
                    <label htmlFor="dateCreation">Date de création</label>
                    <Calendar 
                        id="dateCreation" 
                        value={article.dateCreation ? new Date(article.dateCreation) : null} 
                        onChange={(e) => handleDateChange('dateCreation', e.value as Date)} 
                        showIcon 
                    />
                </div>
               
               
            </div>
        </div>
    );
}

export default StkArticleForm;