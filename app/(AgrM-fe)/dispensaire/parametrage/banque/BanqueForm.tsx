// BanqueForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Banque } from "./Banque";

interface BanqueProps {
    banque: Banque;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BanqueForm: React.FC<BanqueProps> = ({ 
    banque, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="codeBanque">Code Banque</label>
                    <InputText 
                        id="codeBanque" 
                        type="text" 
                        name="codeBanque" 
                        value={banque.codeBanque} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="sigle">Sigle</label>
                    <InputText 
                        id="sigle" 
                        type="text" 
                        name="sigle" 
                        value={banque.sigle} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="libelleBanque">Libellé Banque</label>
                    <InputText 
                        id="libelleBanque" 
                        type="text" 
                        name="libelleBanque" 
                        value={banque.libelleBanque} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-12">
                    <label htmlFor="compte">Compte</label>
                    <InputText 
                        id="compte" 
                        type="text" 
                        name="compte" 
                        value={banque.compte || ''} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
}

export default BanqueForm;