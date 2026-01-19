'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { FacServicePreste } from "./FacServicePreste";
import { FacService } from "../../../(settings)/settings/facService/FacService";
import { Importer } from "../../../(settings)/settings/importateur/Importer";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React, { useEffect, useState } from 'react';

interface FacServicePresteProps {
    facServicePreste: FacServicePreste;
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
    exchangeRateMessage?: string;
    currentExchangeRate?: number | null;
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

const typeDechargementOptions = [
    { label: 'A domicile 20\'', value: 'DAD 20\'' },
    { label: 'A domicile 40\'', value: 'DAD 40\'' },
    { label: 'Au port 20\'', value: 'DP 20\'' },
    { label: 'Au port 40\'', value: 'DP 40\'' },
    { label: 'Autres (Chargement)', value: 'AD' }
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

const FacServicePresteForm: React.FC<FacServicePresteProps> = ({
    facServicePreste,
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
    isFirstService = true,
    exchangeRateMessage,
    currentExchangeRate
}) => {

    // Calculate tax automatically when montant or taxe changes
    useEffect(() => {
        if (facServicePreste.taxe && facServicePreste.montant) {
            const calculatedTax = facServicePreste.montant * 0.18;
            if (facServicePreste.montTaxe !== calculatedTax) {
                // Update montTaxe if it's different
                facServicePreste.montTaxe = calculatedTax;
            }
        } else if (!facServicePreste.taxe) {
            facServicePreste.montTaxe = 0;
        }
    }, [facServicePreste.montant, facServicePreste.taxe]);

    const handleMontantChange = (e: InputNumberValueChangeEvent) => {
        const newMontant = e.value || 0;
        handleNumberChange(e);
        
        // Calculate tax if taxe is enabled
        if (facServicePreste.taxe && newMontant > 0) {
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
                        value={facServicePreste.numFacture}
                        onChange={handleChange}
                        readOnly
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="lettreTransp">Numéro GPS</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={facServicePreste.lettreTransp}
                        onChange={handleChange}
                        onBlur={onGPSBlur}
                        readOnly
                        placeholder="Saisir le numéro GPS"
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="dateDebut">Date Entrée</label>
                    <Calendar
                        id="dateDebut"
                        name="dateDebut"
                        value={facServicePreste.dateDebut}
                        onChange={(e) => handleDateChange(e.value, "dateDebut")}
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="dateFin">Date Fin</label>
                    <Calendar
                        id="dateFin"
                        name="dateFin"
                        value={facServicePreste.dateFin}
                        onChange={(e) => handleDateChange(e.value, "dateFin")}
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
                        value={facServicePreste.importateurId}
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
                        value={facServicePreste.nbreCont}
                        onValueChange={handleNumberChange}
                        min={1}
                        locale="fr-FR"
                        readOnly={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="serviceId">Service</label>
                    <Dropdown
                        id="serviceId"
                        name="serviceId"
                        value={facServicePreste.serviceId}
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

                {/* Show montant for non-dollar services */}
                {!services.find(s => s.id === facServicePreste.serviceId)?.enDollars && (
                    <div className="field col-3">
                        <label htmlFor="montant">Montant *</label>
                        <InputNumber
                            id="montant"
                            name="montant"
                            value={facServicePreste.montant}
                            onValueChange={handleMontantChange}
                            mode="currency"
                            currency="FBU"
                            locale="fr-FR"
                            minFractionDigits={0}
                            readOnly={disabled}
                            required
                        />
                    </div>
                )}

                {/* Show montantDevise for dollar services */}
                {services.find(s => s.id === facServicePreste.serviceId)?.enDollars && (
                    <>
                        <div className="field col-3">
                            <label htmlFor="montantDevise">Montant En devise (USD) *</label>
                            <InputNumber
                                id="montantDevise"
                                name="montantDevise"
                                value={facServicePreste.montantDevise}
                                onValueChange={handleNumberChange}
                                mode="currency"
                                currency="USD"
                                locale="en-US"
                                minFractionDigits={0}
                                readOnly={disabled}
                                required
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="tauxChange">
                                Taux de Change (FBU) {!currentExchangeRate && <span className="text-red-500">*</span>}
                            </label>
                            <InputNumber
                                id="tauxChange"
                                name="tauxChange"
                                value={facServicePreste.tauxChange}
                                onValueChange={handleNumberChange}
                                mode="decimal"
                                minFractionDigits={2}
                                maxFractionDigits={4}
                                min={0}
                                readOnly
                                locale="fr-FR"
                                required={!currentExchangeRate}
                                className="w-full"
                                tooltip={currentExchangeRate ? "Taux chargé automatiquement depuis les paramètres" : "Aucun taux du jour trouvé."}
                            />
                            {exchangeRateMessage && (
                                <small className={currentExchangeRate ? "text-green-600" : "text-orange-600"}>
                                    <i className={`pi ${currentExchangeRate ? 'pi-check-circle' : 'pi-exclamation-triangle'} mr-1`}></i>
                                    {exchangeRateMessage}
                                </small>
                            )}
                        </div>

                        <div className="field col-3">
                            <label htmlFor="montant">Montant (FBU) *</label>
                            <InputNumber
                                id="montant"
                                name="montant"
                                value={facServicePreste.montant}
                                onValueChange={handleNumberChange}
                                mode="currency"
                                currency="FBU"
                                locale="fr-FR"
                                minFractionDigits={0}
                                readOnly
                                tooltip="Calculé automatiquement: Montant USD × Taux de Change"
                                className="w-full"
                            />
                            <small className="text-blue-600">
                                <i className="pi pi-info-circle mr-1"></i>
                                Calculé automatiquement
                            </small>
                        </div>
                    </>
                )}

                <div className="field col-3">
                    <label htmlFor="taxe">Taxe (18%)</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="taxe"
                            name="taxe"
                            checked={facServicePreste.taxe}
                            onChange={handleTaxeChange}
                            disabled={disabled || services.find(s => s.id === facServicePreste.serviceId)?.enDollars}
                            tooltip={services.find(s => s.id === facServicePreste.serviceId)?.enDollars ? "La taxe n'est pas applicable aux services en dollars" : undefined}
                        />
                    </div>
                </div>

                <div className="field col-3">
                    <label htmlFor="montTaxe">Montant Taxe</label>
                    <InputNumber
                        id="montTaxe"
                        name="montTaxe"
                        value={facServicePreste.montTaxe}
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
                        value={facServicePreste.montRedev}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"

                        minFractionDigits={0}
                        readOnly
                        tooltip={!isFirstService ? "La redevance informatique ne peut être modifiée que sur le premier service" : undefined}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montRedevTaxe">Taxe Redevance (18%)</label>
                    <InputNumber
                        id="montRedevTaxe"
                        name="montRedevTaxe"
                        value={facServicePreste.montRedevTaxe}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        readOnly
                    />
                </div>

               
                <div className="field col-3">
                    <label htmlFor="noCont">Numéro Conteneur</label>
                    <InputText
                        id="noCont"
                        name="noCont"
                        value={facServicePreste.noCont}
                        onChange={handleChange}
                        readOnly={disabled}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="poids">Poids (kg)</label>
                    <InputNumber
                        id="poids"
                        name="poids"
                        value={facServicePreste.poids}
                        onValueChange={handleNumberChange}
                        min={0}
                        readOnly={disabled}
                        locale="fr"
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="typeVehicule">Type Véhicule</label>
                    <Dropdown
                        id="typeVehicule"
                        name="typeVehicule"
                        value={facServicePreste.typeVehicule}
                        options={vehicleTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="plaque">Plaque <span className="text-red-500">*</span></label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={facServicePreste.plaque}
                        onChange={handleChange}
                        readOnly={disabled}
                        required
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="declarant">Déclarant/Agence <span className="text-red-500">*</span></label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={facServicePreste.declarant}
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
                        value={facServicePreste.telephoneNumber || ''}
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
                        value={facServicePreste.modePayement}
                        options={paymentModes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un mode"
                        disabled={disabled}
                        required
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="typeDechargement">Type de déchargement <span className="text-red-500">*</span></label>
                    <Dropdown
                        id="typeDechargement"
                        name="typeDechargement"
                        value={facServicePreste.typeDechargement}
                        options={typeDechargementOptions}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                        disabled={disabled}
                        required
                    />
                </div>

                {/* Display total amount */}
                {(facServicePreste.montant || facServicePreste.montTaxe || facServicePreste.montRedev || facServicePreste.montRedevTaxe) && (
                    <div className="field col-3">
                        <label htmlFor="totalAmount">Montant Total</label>
                        <InputNumber
                            id="totalAmount"
                            value={Math.round(
                                (facServicePreste.montant || 0) +
                                (facServicePreste.montTaxe || 0) +
                                (facServicePreste.montRedev || 0) +
                                (facServicePreste.montRedevTaxe || 0)
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

export default FacServicePresteForm;