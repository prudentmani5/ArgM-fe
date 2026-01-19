'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Engin } from "./Engin";

interface EnginProps {
    engin: Engin;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (name: string, value: number | null) => void;
}

const EnginForm: React.FC<EnginProps> = ({engin, handleChange, handleNumberChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="nom">Nom</label>
                    <InputText id="nom" name="nom" value={engin.nom} onChange={handleChange} />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix">Prix 1</label>
                    <InputNumber 
                        id="prix" 
                        name="prix" 
                        value={engin.prix} 
                        onValueChange={(e) => handleNumberChange("prix", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR" 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix2">Prix 2</label>
                    <InputNumber 
                        id="prix2" 
                        name="prix2" 
                        value={engin.prix2} 
                        onValueChange={(e) => handleNumberChange("prix2", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR" 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix3">Prix 3</label>
                    <InputNumber 
                        id="prix3" 
                        name="prix3" 
                        value={engin.prix3} 
                        onValueChange={(e) => handleNumberChange("prix3", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR" 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix4">Prix 4</label>
                    <InputNumber 
                        id="prix4" 
                        name="prix4" 
                        value={engin.prix4} 
                        onValueChange={(e) => handleNumberChange("prix4", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR" 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="prix5">Prix 5</label>
                    <InputNumber 
                        id="prix5" 
                        name="prix5" 
                        value={engin.prix5} 
                        onValueChange={(e) => handleNumberChange("prix5", e.value??null)} 
                        mode="currency" 
                        currency="BIF" 
                        locale="fr-FR" 
                    />
                </div>
            </div>
        </div>
    );
};

export default EnginForm;