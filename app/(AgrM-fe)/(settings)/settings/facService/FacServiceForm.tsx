'use client';

import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox } from "primereact/checkbox";
import { FacService } from "./FacService";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface FacServiceProps {
    facService: FacService;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (value: number | null, field: string) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
}

const typeOptions = [
    { label: 'E', value: 'E' },
    { label: 'S', value: 'S' },
    { label: 'ES', value: 'ES' }
];

const FacServiceForm: React.FC<FacServiceProps> = ({ facService, handleChange, handleNumberChange, handleCheckboxChange, handleDropdownChange }) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="libelleService">Libellé Service</label>
                    <InputText id="libelleService" name="libelleService" value={facService.libelleService} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="compte">Compte</label>
                    <InputText id="compte" name="compte" value={facService.compte} onChange={handleChange} />
                </div>
                <div className="field col-6">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber id="montant" name="montant" value={facService.montant} onValueChange={(e) => handleNumberChange(e.value, "montant")} locale="fr-FR" mode="decimal" />
                </div>
                <div className="field col-6">
                    <label htmlFor="type">Type</label>
                    <Dropdown
                        id="type"
                        name="type"
                        value={facService.type}
                        options={typeOptions}
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>
                <div className="field col-2">
                    <label htmlFor="tonnage">Tonnage</label>
                    <div>
                        <Checkbox inputId="tonnage" name="tonnage" checked={facService.tonnage} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="actif">Actif</label>
                    <div>
                        <Checkbox inputId="actif" name="actif" checked={facService.actif} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="prixUnitaireParJour">Prix/Jour</label>
                    <div>
                        <Checkbox inputId="prixUnitaireParJour" name="prixUnitaireParJour" checked={facService.prixUnitaireParJour} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="tarif1">1er Tarif</label>
                    <div>
                        <Checkbox inputId="tarif1" name="tarif1" checked={facService.tarif1} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="tarif2">2ème Tarif</label>
                    <div>
                        <Checkbox inputId="tarif2" name="tarif2" checked={facService.tarif2} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="tarif3">3ème Tarif</label>
                    <div>
                        <Checkbox inputId="tarif3" name="tarif3" checked={facService.tarif3} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="enDollars">En Dollars</label>
                    <div>
                        <Checkbox inputId="enDollars" name="enDollars" checked={facService.enDollars} onChange={handleCheckboxChange} />
                    </div>
                </div>
                <div className="field col-2">
                    <label htmlFor="passPontBascule">Pont Bascule</label>
                    <div>
                        <Checkbox inputId="passPontBascule" name="passPontBascule" checked={facService.passPontBascule} onChange={handleCheckboxChange} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FacServiceForm;