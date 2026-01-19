'use client';

import { InputNumber } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { PrixServiceTonage } from "./PrixServiceTonage";
import { FacService } from "./FacService";

interface PrixServiceTonageProps {
    prixServiceTonage: PrixServiceTonage;
    services: FacService[];
    selectedService: FacService;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleValueChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
}

const PrixServiceTonageForm: React.FC<PrixServiceTonageProps> = ({
    prixServiceTonage,
    services,
    selectedService,
    handleChange,
    handleValueChange,
    handleDropDownSelect
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="serviceId">Service</label>
                    <Dropdown
                        id="serviceId"
                        name="serviceId"
                        value={prixServiceTonage.serviceId || ''} // Gestion des valeurs nulles
                        options={services}
                        optionLabel="libelleService" // Doit correspondre au champ de FacService
                        optionValue="id" // Doit correspondre au champ de FacService
                        onChange={handleDropDownSelect}
                        placeholder="Sélectionner un service"
                        className="w-full"
                        filter // Optionnel: ajoute un filtre de recherche
                        showClear // Optionnel: permet de vider la sélection
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="poids1">Poids Min (kg)</label>
                    <InputNumber
                        id="poids1"
                        name="poids1"
                        value={prixServiceTonage.poids1}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="poids2">Poids Max (kg)</label>
                    <InputNumber
                        id="poids2"
                        name="poids2"
                        value={prixServiceTonage.poids2}
                        onValueChange={handleValueChange}
                        mode="decimal"
                        min={0}
                        maxFractionDigits={2}
                        suffix=" kg"
                    />
                </div>

                <div className="field col-12">
                    <label htmlFor="montantBarge">Montant Barge (BIF)</label>
                    <InputNumber
                        id="montantBarge"
                        name="montantBarge"
                        value={prixServiceTonage.montantBarge}
                        onValueChange={handleValueChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );
};

export default PrixServiceTonageForm;