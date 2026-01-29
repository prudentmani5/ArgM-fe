'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox } from "primereact/checkbox";
import { Exporter } from "./Exporter";

interface ExporterProps {
    exporter: Exporter;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: any) => void;
}

const ExporterForm: React.FC<ExporterProps> = ({exporter, handleChange, handleCheckboxChange}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="nom">Nom*</label>
                    <InputText 
                        id="nom" 
                        name="nom" 
                        value={exporter.nom} 
                        onChange={handleChange} 
                        required
                    />
                </div>
                
                <div className="field col-12">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText 
                        id="adresse" 
                        name="adresse" 
                        value={exporter.adresse} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText 
                        id="tel" 
                        name="tel" 
                        value={exporter.tel} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-6">
                    <label htmlFor="fax">Fax</label>
                    <InputText 
                        id="fax" 
                        name="fax" 
                        value={exporter.fax} 
                        onChange={handleChange} 
                    />
                </div>
                
                <div className="field col-6 flex align-items-center">
                    <Checkbox
                        inputId="compte"
                        name="compte"
                        checked={exporter.compte}
                        onChange={handleCheckboxChange}
                    />
                    <label htmlFor="compte" className="ml-2">Compte</label>
                </div>
                
                {exporter.compte && (
                    <div className="field col-6">
                        <label htmlFor="compteCredit">Compte Crédit</label>
                        <InputText 
                            id="compteCredit" 
                            name="compteCredit" 
                            value={exporter.compteCredit} 
                            onChange={handleChange} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExporterForm;