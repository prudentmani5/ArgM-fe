'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { EnginsPartieType } from "./EnginsPartieType";
import { PanEngin } from "./PanEngin";

interface EnginsPartieTypeProps {
    enginsPartieType: EnginsPartieType;
    handleChange: (e: any) => void;
    engins: PanEngin[];
}


const EnginsPartieTypeForm = ({ 
    enginsPartieType, 
    handleChange,
    engins
}: EnginsPartieTypeProps) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-4">
                    <label htmlFor="partieDesignation">Désignation de la partie</label>
                    <InputText 
                        id="partieDesignation" 
                        name="partieDesignation" 
                        value={enginsPartieType.partieDesignation} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="caractDesignation">Désignation caractéristique</label>
                    <InputText 
                        id="caractDesignation" 
                        name="caractDesignation" 
                        value={enginsPartieType.caractDesignation} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="observation">Observation</label>
                    <InputText 
                        id="observation" 
                        name="observation" 
                        value={enginsPartieType.observation} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="enginId">Engin</label>
                    <Dropdown
                        id="enginId"
                        name="enginId"
                        value={enginsPartieType.enginId}
                        options={engins || []}
                        onChange={handleChange}
                        optionLabel="enginDesignation"
                        optionValue="enginId"
                        placeholder="Sélectionnez un engin"
                        filter
                        filterBy="enginDesignation,enginId"
                        showClear
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="categorie">Catégorie</label>
                    <InputText 
                        id="categorie" 
                        name="categorie" 
                        value={enginsPartieType.categorie} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="unite">Unité</label>
                    <InputText 
                        id="unite" 
                        name="unite" 
                        value={enginsPartieType.unite} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="periodicite">Périodicité</label>
                    <InputNumber
                        id="periodicite"
                        name="periodicite"
                        value={enginsPartieType.periodicite}
                        onValueChange={(e) => handleChange({
                            target: {
                                name: 'periodicite',
                                value: e.value
                            }
                        })}
                        mode="decimal"
                        min={0}
                        className="w-full"
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="typeMesure">Type de mesure</label>
                    <InputText 
                        id="typeMesure" 
                        name="typeMesure" 
                        value={enginsPartieType.typeMesure} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="mesure">Mesure actuelle</label>
                    <InputText
                        id="mesure"
                        name="mesure"
                        value={enginsPartieType.mesure}
                        onChange={handleChange} 
                       // mode="decimal"
                        min={0}
                        className="w-full"
                    />
                </div>
                
                <div className="field col-4">
                    <label htmlFor="ancienMesure">Ancienne mesure</label>
                    <InputText
                        id="ancienMesure"
                        name="ancienMesure"
                        value={enginsPartieType.ancienMesure}
                        onChange={handleChange} 
                        //mode="decimal"
                        min={0}
                        className="w-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default EnginsPartieTypeForm;
