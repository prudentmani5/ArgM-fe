'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { PanEngin } from "./PanEngin";
//import { EnginsCategorie } from "./EnginsCategorie";
import  EnginsCategorie  from './EnginsCategorie';

interface PanEnginFormProps {
    panEngin: PanEngin;
    handleChange: (e: any) => void;
    categories: EnginsCategorie[];
}

const PanEnginForm: React.FC<PanEnginFormProps> = ({ 
    panEngin, 
    handleChange,
    categories
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-3">
                    <label htmlFor="enginDesignation">Désignation</label>
                    <InputText 
                        id="enginDesignation" 
                        type="text" 
                        name="enginDesignation" 
                        value={panEngin.enginDesignation} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="modele">Modèle</label>
                    <InputText 
                        id="modele" 
                        type="text" 
                        name="modele" 
                        value={panEngin.modele} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="marque">Marque</label>
                    <InputText 
                        id="marque" 
                        type="text" 
                        name="marque" 
                        value={panEngin.marque} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="type">Type</label>
                    <InputText 
                        id="type" 
                        type="text" 
                        name="type" 
                        value={panEngin.type} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="categorieId">Catégorie</label>
                    <Dropdown
                        id="categorieId"
                        name="categorieId"
                        value={panEngin.categorieId}
                        options={categories || []}
                        onChange={handleChange}
                        optionLabel="categorieDesignation"
                        optionValue="enginCategorieId"
                        placeholder="Sélectionnez une catégorie"
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="anneeFabrication">Année de fabrication</label>
                    <InputText 
                        id="anneeFabrication" 
                        type="text" 
                        name="anneeFabrication" 
                        value={panEngin.anneeFabrication} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroOrdre">Numéro d'ordre</label>
                    <InputText 
                        id="numeroOrdre" 
                        type="text" 
                        name="numeroOrdre" 
                        value={panEngin.numeroOrdre} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="numeroSerie">Numéro de série</label>
                    <InputText 
                        id="numeroSerie" 
                        type="text" 
                        name="numeroSerie" 
                        value={panEngin.numeroSerie} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="indexDepart">Index de départ</label>
                    <InputNumber 
                        id="indexDepart" 
                        name="indexDepart" 
                        value={panEngin.indexDepart} 
                        onValueChange={(e) => handleChange({
                            target: {
                                name: 'indexDepart',
                                value: e.value
                            }
                        })} 
                        mode="decimal"
                        minFractionDigits={2}
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="consH">Consommation H</label>
                    <InputNumber
                        id="consH" 
                        name="consH" 
                        value={panEngin.consH} 
                        onValueChange={(e) => handleChange({
                            target: {
                                name: 'consH',
                                value: e.value
                            }
                        })} 
                        mode="decimal"
                        minFractionDigits={2}
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateSortie">Date de sortie</label>
                    <Calendar 
                        id="dateSortie" 
                        name="dateSortie" 
                        value={panEngin.dateSortie ? new Date(panEngin.dateSortie) : null} 
                        onChange={(e) => handleChange({
                            target: {
                                name: 'dateSortie',
                                value: e.value
                            }
                        })} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                    />
                </div>
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateUpdate">Date de mise à jour</label>
                    <Calendar 
                        id="dateUpdate" 
                        name="dateUpdate" 
                        value={panEngin.dateUpdate ? new Date(panEngin.dateUpdate) : null} 
                        onChange={(e) => handleChange({
                            target: {
                                name: 'dateUpdate',
                                value: e.value
                            }
                        })} 
                        showIcon 
                        dateFormat="dd/mm/yy"
                    />
                </div>
                
                <div className="field col-3">
                    <label htmlFor="motif">Motif</label>
                    <InputText 
                        id="motif" 
                        type="text" 
                        name="motif" 
                        value={panEngin.motif} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="caracteristiques">Caractéristiques</label>
                    <InputText 
                        id="caracteristiques" 
                        type="text" 
                        name="caracteristiques" 
                        value={panEngin.caracteristiques} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
};

export default PanEnginForm;