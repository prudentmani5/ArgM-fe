'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { FacServicePresteEntree } from "./FacServicePresteEntree";
import { FacService } from "../../../(settings)/settings/facService/FacService";
import { Importer } from "../../../(settings)/settings/importateur/Importer";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React, { useEffect, useState } from 'react';

interface FacServicePresteEntreeProps {
    facServicePresteEntree: FacServicePresteEntree;
    services: FacService[];
    importateurs: Importer[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    serviceFilter?: string;
    importateurFilter?: string;
    onServiceFilterChange?: (value: string) => void;
    onImportateurFilterChange?: (value: string) => void;
    disabled: boolean;
    onGPSBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onMontantChange?: (montant: number) => void;
    isFirstService?: boolean;
}

const paymentModes = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' }
];

const vehicleTypes = [
    { label: 'Camion simple', value: 'CAMION' },
    { label: 'Camion Remorque', value: 'REMORQUE' }
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

const FacServicePresteEntreeForm: React.FC<FacServicePresteEntreeProps> = ({
    facServicePresteEntree,
    services,
    importateurs,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    serviceFilter,
    importateurFilter,
    onServiceFilterChange,
    onImportateurFilterChange,
    disabled = false,
    onGPSBlur,
    onMontantChange,
    isFirstService = true
}) => {

    // Calculate tax automatically when montant or taxe changes
    useEffect(() => {
        if (facServicePresteEntree.taxe && facServicePresteEntree.montant) {
            const calculatedTax = facServicePresteEntree.montant * 0.18;
            if (facServicePresteEntree.montTaxe !== calculatedTax) {
                // Update montTaxe if it's different
                facServicePresteEntree.montTaxe = calculatedTax;
            }
        } else if (!facServicePresteEntree.taxe) {
            facServicePresteEntree.montTaxe = 0;
        }
    }, [facServicePresteEntree.montant, facServicePresteEntree.taxe]);

    const handleMontantChange = (e: InputNumberValueChangeEvent) => {
        const newMontant = e.value || 0;
        handleNumberChange(e);
        
        // Calculate tax if taxe is enabled
        if (facServicePresteEntree.taxe && newMontant > 0) {
            const calculatedTax = newMontant * 0.18;
            // Trigger tax calculation
            onMontantChange?.(newMontant);
        }
    };

    const handleTaxeChange = (e: CheckboxChangeEvent) => {
        // Parent handleCheckboxChange already handles the tax calculation
        // including montTaxe and montRedevTaxe recalculation
        handleCheckboxChange(e);
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-3">
                    <label htmlFor="numFacture">Numéro Facture</label>
                    <InputText
                        id="numFacture"
                        name="numFacture"
                        value={facServicePresteEntree.numFacture}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="lettreTransp">Numéro GPS</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={facServicePresteEntree.lettreTransp}
                        onChange={handleChange}
                        onBlur={onGPSBlur}
                        readOnly={disabled}
                        placeholder="Saisir le numéro GPS"
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="dateDebut">Date Entrée</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={facServicePresteEntree.dateDebut}
                        onChange={(e) => handleDateChange(e.value, "dateDebut")}
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="dateFin">Date Fin</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={facServicePresteEntree.dateFin}
                        onChange={(e) => handleDateChange(e.value, "dateFin")}
                        hourFormat="24"
                        showIcon
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="importateurId">Client</label>
                    <Dropdown
                        id="importateurId"
                        name="importateurId"
                        value={facServicePresteEntree.importateurId}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un importateur'
                        filterBy='nom'
                        filter
                        filterValue={importateurFilter || ''}
                        onFilter={(e) => {
                            onImportateurFilterChange?.(e.filter);
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
                                value={importateurFilter || ''}
                                onChange={(e) => onImportateurFilterChange?.(e.target.value)}
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
                    <label htmlFor="nbreCont">Nbre Cont./Véh./Etiq/M.</label>
                    <InputNumber
                        id="nbreCont"
                        name="nbreCont"
                        value={facServicePresteEntree.nbreCont}
                        onValueChange={handleNumberChange}
                        min={1}
                        locale="fr-FR"
                        readOnly={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="noCont">Numéro Conteneur</label>
                    <InputText
                        id="noCont"
                        name="noCont"
                        value={facServicePresteEntree.noCont}
                        onChange={handleChange}
                        readOnly={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="poids">Poids (kg)</label>
                    <InputNumber
                        id="poids"
                        name="poids"
                        value={facServicePresteEntree.poids}
                        onValueChange={handleNumberChange}
                        min={0}
                        readOnly={disabled}
                        locale="fr"
                    />
                </div>
                
                <div className="field col-3">
                    <label htmlFor="serviceId">Service</label>
                    <Dropdown
                        id="serviceId"
                        name="serviceId"
                        value={facServicePresteEntree.serviceId}
                        options={services}
                        optionLabel="libelleService"
                        optionValue="id"
                        filterBy='libelleService'
                        filter
                        filterValue={serviceFilter || ''}
                        onFilter={(e) => {
                            onServiceFilterChange?.(e.filter);
                        }}
                        onChange={handleDropdownChange}
                        disabled={disabled}
                        placeholder="Sélectionnez un service"
                        itemTemplate={(item) => (
                            <div className="flex align-items-center">
                                <i className="pi pi-cog mr-2" />
                                <span>{item.libelleService}</span>
                            </div>
                        )}
                    />
                </div>
                 <div className="field col-2">
                    <label htmlFor="taxe">Taxe (18%)</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="taxe"
                            name="taxe"
                            checked={facServicePresteEntree.taxe}
                            onChange={handleTaxeChange}
                            disabled={disabled}
                        />
                    </div>
                </div>

                <div className="field col-3">
                    <label htmlFor="montant">Montant *</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={facServicePresteEntree.montant}
                        onValueChange={handleMontantChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        // readOnly={disabled}
                        required
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="typeVehicule">Type Véhicule</label>
                    <Dropdown
                        id="typeVehicule"
                        name="typeVehicule"
                        value={facServicePresteEntree.typeVehicule}
                        options={vehicleTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={facServicePresteEntree.plaque}
                        onChange={handleChange}
                        readOnly={disabled}
                    />
                </div>

                 <div className="field col-3">
                    <label htmlFor="declarant">Déclarant/Agence <span className="text-red-500">*</span></label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={facServicePresteEntree.declarant}
                        onChange={handleChange}
                        readOnly={disabled}
                        required
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="telephoneNumber">Numéro de Téléphone <span className="text-red-500">*</span></label>
                    <InputText
                        id="telephoneNumber"
                        name="telephoneNumber"
                        value={facServicePresteEntree.telephoneNumber || ''}
                        onChange={handleChange}
                        onFocus={(e) => {
                            // Set default prefix if empty
                            if (!e.target.value || e.target.value.trim() === '') {
                                const syntheticEvent = {
                                    target: {
                                        name: 'telephoneNumber',
                                        value: '+257 '
                                    }
                                } as React.ChangeEvent<HTMLInputElement>;
                                handleChange(syntheticEvent);
                            }
                        }}
                        readOnly={disabled}
                        placeholder="+257 XX XX XX XX"
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="modePayement">Mode Paiement <span className="text-red-500">*</span></label>
                    <Dropdown
                        id="modePayement"
                        name="modePayement"
                        value={facServicePresteEntree.modePayement}
                        options={paymentModes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un mode"
                        disabled={disabled}
                        required
                    />
                </div>

               

                <div className="field col-3">
                    <label htmlFor="montTaxe">Montant Taxe</label>
                    <InputNumber
                        id="montTaxe"
                        name="montTaxe"
                        value={facServicePresteEntree.montTaxe}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montRedev">Redevance Informatique</label>
                    <InputNumber
                        id="montRedev"
                        name="montRedev"
                        value={facServicePresteEntree.montRedev}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly={disabled || !isFirstService}
                        tooltip={!isFirstService ? "La redevance informatique ne peut être modifiée que sur le premier service" : undefined}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montRedevTaxe">Taxe Redevance (18%)</label>
                    <InputNumber
                        id="montRedevTaxe"
                        name="montRedevTaxe"
                        value={facServicePresteEntree.montRedevTaxe}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly
                    />
                </div>
                
               
                
                <div className="field col-3">
                    <label htmlFor="peage">Péage</label>
                    <InputNumber
                        id="peage"
                        name="peage"
                        value={facServicePresteEntree.peage}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="pesage">Pesage</label>
                    <InputNumber
                        id="pesage"
                        name="pesage"
                        value={facServicePresteEntree.pesage}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly={disabled}
                    />
                </div>

                {/* Display total amount */}
                {(facServicePresteEntree.montant || facServicePresteEntree.montTaxe || facServicePresteEntree.montRedev || facServicePresteEntree.montRedevTaxe) && (
                    <div className="field col-3">
                        <label htmlFor="totalAmount">Montant Total</label>
                        <InputNumber
                            id="totalAmount"
                            value={Math.round(
                                (facServicePresteEntree.montant || 0) +
                                (facServicePresteEntree.montTaxe || 0) +
                                (facServicePresteEntree.montRedev || 0) +
                                (facServicePresteEntree.montRedevTaxe || 0)
                            )}
                            mode="currency"
                            currency="FBU"
                            locale="fr-FR"
                            minFractionDigits={0}
                            readOnly
                            className="font-bold"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacServicePresteEntreeForm;