'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { CompteBanque } from "./CompteBanque";
import { Bank } from "./Bank";
import { Devise } from "./Devise";

interface CompteBanqueProps {
    compteBanque: CompteBanque;
    handleChange: (e: any) => void;
    banks: Bank[];
    devises: Devise[];
}

const  devisesBanks = [
    { label: 'BIF', value: 1 },
    { label: 'USD', value: 2 },
    { label: 'EUR', value: 3 }
];

const CompteBanqueForm: React.FC<CompteBanqueProps> = ({ 
    compteBanque, 
    handleChange,
    banks,
    devises
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="numeroCompte">Numéro de compte</label>
                    <InputText 
                        id="numeroCompte" 
                        type="text" 
                        name="numeroCompte" 
                        value={compteBanque.numeroCompte} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="banqueId">Banque</label>
                    <Dropdown
                        id="banqueId"
                        name="banqueId"
                        value={compteBanque.banqueId}
                        //options={banks}
                        options={banks || []} // Double sécurité
                        onChange={handleChange}
                        optionLabel="libelleBanque"
                        optionValue="banqueId"
                        placeholder="Sélectionnez une banque"
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="deviseId">Devise</label>
                    <Dropdown
                        id="deviseId"
                        name="deviseId"
                        value={compteBanque.deviseId}
                        options={devises}
                        onChange={handleChange}
                        optionLabel="libelle"
                        optionValue="deviseId"
                        placeholder="Sélectionnez une devise"
                    />
                </div>
            </div>
        </div>
    );
};

export default CompteBanqueForm;