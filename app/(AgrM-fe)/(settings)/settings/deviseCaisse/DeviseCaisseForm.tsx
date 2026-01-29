'use client';

import { InputText } from "primereact/inputtext";
import { DeviseCaisse } from "./DeviseCaisse";

interface DeviseCaisseProps {
    deviseCaisse: DeviseCaisse;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const DeviseCaisseForm: React.FC<DeviseCaisseProps> = ({ deviseCaisse, handleChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="codeDevise">Code Devise</label>
                    <InputText 
                        id="codeDevise" 
                        type="text" 
                        name="codeDevise" 
                        value={deviseCaisse.codeDevise} 
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="field col-6">
                    <label htmlFor="libelle">Libellé</label>
                    <InputText 
                        id="libelle" 
                        type="text" 
                        name="libelle" 
                        value={deviseCaisse.libelle} 
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default DeviseCaisseForm;