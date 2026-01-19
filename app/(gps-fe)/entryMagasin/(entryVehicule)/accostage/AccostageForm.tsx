'use client';

import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Accostage } from './Accostage';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React, { useEffect } from 'react';
import { Barge } from '../../../(settings)/settings/barge/Barge';
import { stringToDate } from '../../../../../utils/dateUtils';

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

interface AccostageFormProps {
    accostage: Accostage;
    importateurs: Importer[];
    barges: Barge[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange?: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    disabled?: boolean;
    handleBlurEvent?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const modePayementOptions = [
    { label: 'Espèces', value: 'ESPECES' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' }
];

const AccostageForm: React.FC<AccostageFormProps> = ({
    accostage,
    importateurs,
    barges,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    importateurFilter,
    onImportateurFilterChange,
    disabled = false,
    handleBlurEvent
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Row 1 */}
                <div className="field col-3">
                    <label htmlFor="noArrive">Num.Facture</label>
                    <InputText
                        id="noArrive"
                        name="noArrive"
                        value={accostage.noArrive || ''}
                        onChange={handleChange}
                        readOnly
                        className={accostage.noArrive ? 'p-inputtext-lg font-bold text-green-600' : ''}
                        placeholder="Auto-généré"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="lettreTransp">L.T</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={accostage.lettreTransp || ''}
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
                        value={accostage.bargeId}
                        options={barges}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="bargeId"
                        placeholder="Sélectionner une barge"
                        filter
                        filterBy="nom"
                        showClear
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="longeur">Longueur</label>
                    <InputNumber
                        id="longeur"
                        name="longeur"
                        value={accostage.longeur}
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        readOnly
                        disabled={disabled}
                        locale='fr-FR'
                    />
                </div>

                {/* Row 2 */}
                <div className="field col-3">
                    <label htmlFor="dateArrive">Date.Arrivée</label>
                    <Calendar
                        id="dateArrive"
                        name="dateArrive"
                        value={stringToDate(accostage.dateArrive)}
                        onChange={(e) => handleDateChange(e.value, "dateArrive")}
                        showIcon
                        dateFormat="dd/mm/yy"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateDepart">Date.Départ</label>
                    <Calendar
                        id="dateDepart"
                        name="dateDepart"
                        value={stringToDate(accostage.dateDepart)}
                        onChange={(e) => handleDateChange(e.value, "dateDepart")}
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
                        value={accostage.importateurId}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un client'
                        filterBy='nom'
                        filter
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
                    <label htmlFor="tonageArrive">Tonnage.Arrivée</label>
                    <InputNumber
                        id="tonageArrive"
                        name="tonageArrive"
                        value={accostage.tonageArrive}
                        onValueChange={handleNumberChange}
                        mode="decimal"
                        minFractionDigits={2}
                        disabled={disabled}
                        locale='fr-FR'
                    />
                </div>

                {/* Row 3 */}
                <div className="field col-3">
                    <label htmlFor="tonageDepart">Tonnage.Départ</label>
                    <InputNumber
                        id="tonageDepart"
                        name="tonageDepart"
                        value={accostage.tonageDepart}
                        onValueChange={handleNumberChange}
                        onBlur={handleBlurEvent}  // Add this
                        mode="decimal"
                        minFractionDigits={2}
                        disabled={disabled}
                        locale='fr-FR'
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="modePayement">Mode Paiement</label>
                    <Dropdown
                        id="modePayement"
                        name="modePayement"
                        value={accostage.modePayement}
                        options={modePayementOptions}
                        optionLabel="label"
                        optionValue="value"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner un mode de paiement"
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="taxeAccostage">Taxe.Accostage</label>
                    <InputNumber
                        id="taxeAccostage"
                        name="taxeAccostage"
                        value={accostage.taxeAccostage}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={0}
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="taxeManut">Taxe.Manut</label>
                    <InputNumber
                        id="taxeManut"
                        name="taxeManut"
                        value={accostage.taxeManut}
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
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={accostage.declarant}
                        onChange={handleChange}
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3 flex align-items-center">
                    <label htmlFor="taxe" className="ml-2">TVA (18%)</label>
                    <Checkbox
                        inputId="taxe"
                        name="taxe"
                        checked={accostage.taxe || false}
                        onChange={handleCheckboxChange}
                        disabled={disabled}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montTVA">Montant TVA</label>
                    <InputNumber
                        id="montTVA"
                        name="montTVA"
                        value={accostage.montTVA}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="FBU"
                        locale="fr-FR"
                        minFractionDigits={2}
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
                        value={accostage.montantRedev}
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
                        value={accostage.montRedevTaxe}
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

export default AccostageForm;