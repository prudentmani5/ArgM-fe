'use client';

import { InputText } from "primereact/inputtext";
import { ImportateurCredit } from "./ImportateurCredit";

interface ImportateurCreditProps {
    importateurCredit: ImportateurCredit;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImportateurCreditForm: React.FC<ImportateurCreditProps> = ({ importateurCredit, handleChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="importateurCreditId">ID Importateur</label>
                    <InputText 
                        id="importateurCreditId" 
                        type="text" 
                        name="importateurCreditId" 
                        value={importateurCredit.importateurCreditId || ''} 
                        onChange={handleChange} 
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="nom">Nom</label>
                    <InputText 
                        id="nom" 
                        type="text" 
                        name="nom" 
                        value={importateurCredit.nom} 
                        onChange={handleChange} 
                    />
                </div>
            </div>
        </div>
    );
};

export default ImportateurCreditForm;