'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { PersonnelTechnique } from "./PersonnelTechnique";

interface PersonnelTechniqueProps {
    personnel: PersonnelTechnique;
    handleChange: (e: any) => void;
}

const PersonnelTechniqueForm: React.FC<PersonnelTechniqueProps> = ({ 
    personnel, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12 md:col-6">
                    <label htmlFor="matricule">Matricule</label>
                    <InputText 
                        id="matricule" 
                        name="matricule" 
                        value={personnel.matricule} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText 
                        id="nom" 
                        name="nom" 
                        value={personnel.nom} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="prenom">Prénom</label>
                    <InputText 
                        id="prenom" 
                        name="prenom" 
                        value={personnel.prenom} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-12 md:col-6">
                    <label htmlFor="salaireHoraire">Salaire Horaire</label>
                    <InputNumber 
                        id="salaireHoraire" 
                        name="salaireHoraire" 
                        value={personnel.salaireHoraire} 
                        onValueChange={(e) => handleChange({
                            target: {
                                name: 'salaireHoraire',
                                value: e.value
                            }
                        })}
                        mode="currency" 
                        currency="USD" 
                        locale="en-US"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonnelTechniqueForm;