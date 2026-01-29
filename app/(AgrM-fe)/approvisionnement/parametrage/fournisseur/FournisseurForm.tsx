// FournisseurForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Fournisseur } from "./Fournisseur";

interface FournisseurProps {
    fournisseur: Fournisseur;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (name: keyof Fournisseur, checked: boolean) => void;
}

const FournisseurForm: React.FC<FournisseurProps> = ({ 
    fournisseur, 
    handleChange, 
    handleCheckboxChange 
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="fournisseurId">ID Fournisseur</label>
                    <InputText id="fournisseurId" type="text" name="fournisseurId" value={fournisseur.fournisseurId} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText id="nom" type="text" name="nom" value={fournisseur.nom} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText id="adresse" type="text" name="adresse" value={fournisseur.adresse || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="bp">BP</label>
                    <InputText id="bp" type="text" name="bp" value={fournisseur.bp || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText id="tel" type="text" name="tel" value={fournisseur.tel || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="email">Email</label>
                    <InputText id="email" type="text" name="email" value={fournisseur.email || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="compte">Compte</label>
                    <InputText id="compte" type="text" name="compte" value={fournisseur.compte || ''} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="magasinId">Magasin ID</label>
                    <InputText id="magasinId" type="text" name="magasinId" value={fournisseur.magasinId || ''} onChange={handleChange} />
                </div>
                  <div className="field col-6 flex align-items-center gap-2">
                    <Checkbox 
                        inputId="local" 
                        name="local" 
                        checked={fournisseur.local || false} 
                        onChange={(e) => handleCheckboxChange('local', e.checked ?? false)} 
                    />
                    <label htmlFor="local">Local</label>
                </div>
                <div className="field col-6 flex align-items-center gap-2">
                    <Checkbox 
                        inputId="donateur" 
                        name="donateur" 
                        checked={fournisseur.donateur || false} 
                        onChange={(e) => handleCheckboxChange('donateur', e.checked ?? false)} 
                    />
                    <label htmlFor="donateur">Donateur</label>
                </div>
            </div>
        </div>
    );
}

export default FournisseurForm;