'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Remorquage } from "./Remorquage";
import { Barge } from "../../../(settings)/settings/barge/Barge";
import { Importer } from "../../../(settings)/settings/importateur/Importer";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React from 'react';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';

interface RemorquageProps {
    remorquage: Remorquage;
    barges: Barge[];
    importateurs: Importer[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange?: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    filterValue?: string;
    onFilterChange?: (value: string) => void;
    disabled?: boolean;
    handleBlurEvent?: (field: string) => void;
}

const paymentModes = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' }
];

const CustomFilterInput = React.forwardRef<HTMLInputElement, {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>(({ value, onChange }, ref) => {
    return (
        <input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            className="p-dropdown-filter p-inputtext p-component"
            placeholder="Rechercher..."
        />
    );
});

const RemorquageForm: React.FC<RemorquageProps> = ({
    remorquage,
    barges,
    importateurs,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    filterValue,
    onFilterChange,
    disabled = false,
    handleBlurEvent
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Row 1 */}
                <div className="field col-3">
                    <label htmlFor="noRemorque">Num.Facture</label>
                    <InputText
                        id="noRemorque"
                        name="noRemorque"
                        value={remorquage.noRemorque}
                        onChange={handleChange}
                        readOnly
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="lettreTransp">L.T</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={remorquage.lettreTransp}
                        onChange={handleChange}
                        readOnly
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="bargeId">Barge</label>
                    <Dropdown
                        id="bargeId"
                        name="bargeId"
                        value={remorquage.bargeId}
                        options={barges}
                        optionLabel="nom"
                        optionValue="bargeId"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner une barge"
                        filter
                        filterBy="nom,plaque"
                        showClear
                        disabled={disabled}
                        itemTemplate={(item) => (
                            <div className="flex align-items-center">
                                <span>{item.nom} ({item.plaque})</span>
                            </div>
                        )}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="longeur">Longueur</label>
                    <InputNumber
                        id="longeur"
                        name="longeur"
                        value={remorquage.longeur}
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        readOnly
                        disabled={disabled}
                    />
                </div>

                {/* Row 2 */}
                <div className="field col-3">
                    <label htmlFor="largeur">Largeur</label>
                    <InputNumber
                        id="largeur"
                        name="largeur"
                        value={remorquage.largeur}
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        readOnly
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="tirant">Tirant</label>
                    <InputNumber
                        id="tirant"
                        name="tirant"
                        value={remorquage.tirant}
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        readOnly
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateDebut">Date.Début</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={remorquage.dateDebut}
                        onChange={(e) => handleDateChange(e.value, "dateDebut")}
                        showIcon
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateFin">Date.Fin</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={remorquage.dateFin}
                        onChange={(e) => handleDateChange(e.value, "dateFin")}
                        onBlur={() => handleBlurEvent?.("dateFin")}  // Add this
                        showIcon
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>

                {/* Row 3 */}
                <div className="field col-3">
                    <label htmlFor="importateurId">Client</label>
                    <Dropdown
                        id="importateurId"
                        name="importateurId"
                        value={remorquage.importateurId}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un client'
                        filterBy='nom'
                        filter
                        filterValue={filterValue || ''}
                        onFilter={(e) => {
                            onFilterChange?.(e.filter);
                        }}
                        disabled={disabled}
                        virtualScrollerOptions={{
                            itemSize: 40,
                            items: importateurs,
                            lazy: true,
                            loading: loadingStatus,
                            onLazyLoad: handleLazyLoading,
                            delay: 250
                        }}
                        optionLabel='nom'
                        optionValue='importateurId'
                        filterTemplate={(options) => (
                            <CustomFilterInput
                                value={filterValue || ''}
                                onChange={(e) => onFilterChange?.(e.target.value)}
                                ref={options.filterInputRef}
                            />
                        )}
                        itemTemplate={(item) => (
                            <div className="flex align-items-center">
                                <i className="pi pi-user mr-2" />
                                <span>{item.nom} - {item.nif}</span>
                            </div>
                        )}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="manoeuvre">Nbre d'Heures</label>
                    <InputNumber
                        id="manoeuvre"
                        name="manoeuvre"
                        value={remorquage.manoeuvre}
                        onValueChange={handleNumberChange}
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={remorquage.declarant}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={remorquage.montant}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        disabled={disabled}
                    />
                </div>

                {/* Row 4 */}
                <div className="field col-3">
                    <label htmlFor="modePayement">Mode Paiement</label>
                    <Dropdown
                        id="modePayement"
                        name="modePayement"
                        value={remorquage.modePayement}
                        options={paymentModes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner un mode de paiement"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3 flex align-items-center">
                    <label htmlFor="taxe" className="ml-2">TVA (18%)</label>
                    <Checkbox
                        inputId="taxe"
                        name="taxe"
                        checked={remorquage.taxe || false}
                        onChange={handleCheckboxChange}
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montTVA">Montant TVA</label>
                    <InputNumber
                        id="montTVA"
                        name="montTVA"
                        value={remorquage.montTVA}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        disabled={true}
                        readOnly
                    />
                </div>

                {/* Row 5 - Redevance Informatique */}
                <div className="field col-3">
                    <label htmlFor="montantRedev">Redevance Informatique</label>
                    <InputNumber
                        id="montantRedev"
                        name="montantRedev"
                        value={remorquage.montantRedev}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        disabled={true}
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montRedevTaxe">TVA Redevance (18%)</label>
                    <InputNumber
                        id="montRedevTaxe"
                        name="montRedevTaxe"
                        value={remorquage.montRedevTaxe}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        disabled={true}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
};

export default RemorquageForm;