// ImporterForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Importer } from "./Importer";

interface ImporterProps {
    importer: Importer;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
}

const ImporterForm: React.FC<ImporterProps> = ({ 
    importer,
    handleChange,
    handleNumberChange,
    handleCheckboxChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Basic Information */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="nom">Nom *</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={importer.nom}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="nif">NIF *</label>
                    <InputText
                        id="nif"
                        name="nif"
                        value={importer.nif}
                        onChange={handleChange}
                        required
                    />
                </div>
                
                {/* Contact Information */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="tel">Téléphone</label>
                    <InputText
                        id="tel"
                        name="tel"
                        value={importer.tel}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="fax">Fax</label>
                    <InputText
                        id="fax"
                        name="fax"
                        value={importer.fax}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="email">Email</label>
                    <InputText
                        id="email"
                        name="email"
                        value={importer.email}
                        onChange={handleChange}
                    />
                </div>
                
                {/* Address */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="adresse">Adresse</label>
                    <InputText
                        id="adresse"
                        name="adresse"
                        value={importer.adresse}
                        onChange={handleChange}
                    />
                </div>
                
                {/* Accounting Information */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="compteDebit">Compte Débit</label>
                    <InputText
                        id="compteDebit"
                        name="compteDebit"
                        value={importer.compteDebit}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="compteCredit">Compte Crédit</label>
                    <InputText
                        id="compteCredit"
                        name="compteCredit"
                        value={importer.compteCredit}
                        onChange={handleChange}
                    />
                </div>
                
                {/* Tax Information */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="assujetiTVA">Assujetti TVA (%)</label>
                    <InputNumber
                        id="assujetiTVA"
                        name="assujetiTVA"
                        value={importer.assujetiTVA}
                        onValueChange={handleNumberChange}
                        min={0}
                        max={100}
                        suffix=" %"
                    />
                </div>
                
                {/* Status */}
                <div className="field col-12 md:col-3">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="facture"
                            name="facture"
                            checked={importer.facture}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="facture" className="ml-2">
                            Facture
                        </label>
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <div className="flex align-items-center">
                        <Checkbox
                            inputId="actif"
                            name="actif"
                            checked={importer.actif}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="actif" className="ml-2">
                            Actif
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImporterForm;