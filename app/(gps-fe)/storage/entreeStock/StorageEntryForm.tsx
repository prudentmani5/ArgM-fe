// StorageEntryForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { StorageEntry } from "./StorageEntry";
import { Entrepos } from "../../(settings)/settings/entrepot/Entrepos";
import { Marchandise } from "../../(settings)/settings/marchandise/Marchandise";
import { Barge } from "../../(settings)/settings/barge/Barge";
import { Importer } from "../../(settings)/settings/importateur/Importer";
import React from 'react';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Provenance } from "../../(settings)/settings/provenance/Provenance";
import { stringToDate } from '@/utils/dateUtils';

interface StorageEntryProps {
    storageEntry: StorageEntry;
    entrepots: Entrepos[];
    marchandises: Marchandise[];
    barges: Barge[];
    importateurs: Importer[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    destinataireFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    provenances: Provenance[];
    handleLtBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    ltExists: boolean;
}

const transportTypes = [
    { label: 'Camion', value: 'CAMION' },
    { label: 'Barge', value: 'BARGE' }
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

const StorageEntryForm: React.FC<StorageEntryProps> = ({
    storageEntry,
    entrepots,
    marchandises,
    barges,
    importateurs,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    importateurFilter,
    destinataireFilter,
    onImportateurFilterChange,
    provenances,
    handleLtBlur,
    ltExists
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Basic Information */}
                <div className="field col-3">
                    <label htmlFor="lt">Lettre de Transport *</label>
                    <InputText
                        id="lt"
                        name="lt"
                        value={storageEntry.lt}
                        onChange={handleChange}
                        onBlur={handleLtBlur}
                        className={ltExists ? 'p-invalid' : ''}
                    />
                    {ltExists && (
                        <small className="p-error">Cette lettre de transport existe déjà</small>
                    )}
                </div>
                <div className="field col-3">
                    <label htmlFor="entreposId">Magasin</label>
                    <Dropdown
                        id="entreposId"
                        name="entreposId"
                        value={storageEntry.entreposId}
                        options={entrepots}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="entreposId"
                        placeholder="Sélectionner un entrepot"
                        filter
                        filterBy="nom"
                        showClear
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="marchandiseId">Marchandise</label>
                    <Dropdown
                        id="marchandiseId"
                        name="marchandiseId"
                        value={storageEntry.marchandiseId}
                        options={marchandises}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="marchandiseId"
                        placeholder="Sélectionner une marchandise"
                        filter
                        filterBy="nom"
                        showClear
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={stringToDate(storageEntry.dateEntree)}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        dateFormat="dd/mm/yy"
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="poidsEntre">Poids Entrée (kg)</label>
                    <InputNumber
                        id="poidsEntre"
                        name="poidsEntre"
                        value={storageEntry.poidsEntre}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        mode="decimal"
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="noConteneur">Numéro Conteneur</label>
                    <InputText
                        id="noConteneur"
                        name="noConteneur"
                        value={storageEntry.noConteneur}
                        onChange={handleChange}
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={storageEntry.plaque}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="provenanceId">Provenance</label>
                    <Dropdown
                        id="provenanceId"
                        name="provenanceId"
                        value={storageEntry.provenanceId}
                        options={provenances}
                        optionLabel="nom"
                        optionValue="provenanceId"
                        filter
                        filterBy="nom"
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une provenance"
                    />
                </div>

                {/* Transport Information */}
                <div className="field col-3">
                    <label htmlFor="typeTransport">Type Transport</label>
                    <Dropdown
                        id="typeTransport"
                        name="typeTransport"
                        value={storageEntry.typeTransport}
                        options={transportTypes}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez un type"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="bargeId">Barge</label>
                    <Dropdown
                        id="bargeId"
                        name="bargeId"
                        value={storageEntry.bargeId}
                        options={barges}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="bargeId"
                        placeholder="Sélectionner une condition"
                        filter
                        filterBy="nom"
                        showClear
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="exportation">Exportation</label>
                    <Checkbox
                        inputId="exportation"
                        name="exportation"
                        checked={storageEntry.exportation}
                        onChange={handleCheckboxChange}
                    />
                </div>

                {/* Importateur and Destinataire Dropdowns */}
                <div className="field col-3">
                    <label htmlFor="importateurId">Importateur</label>
                    <Dropdown
                        id="importateurId"
                        name="importateurId"
                        value={storageEntry.importateurId}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un importateur'
                        filterBy='nom'
                        filter
                        filterValue={importateurFilter || ''}
                        onFilter={(e) => {
                            onImportateurFilterChange?.(e.filter);
                        }}
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
                        pt={{
                            filterInput: {
                                root: { style: { display: 'contents' } }
                            },
                            filterContainer: {
                                className: 'p-dropdown-filter-container'
                            }
                        }}
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
                    <label htmlFor="destinataire">Destinataire</label>
                    <Dropdown
                        id="destinataire"
                        name="destinataire"
                        value={storageEntry.destinataire}
                        onChange={handleDropdownChange}
                        options={importateurs}
                        placeholder='Sélectionner un destinataire'
                        filterBy='nom'
                        filter
                        filterValue={importateurFilter || ''}
                        onFilter={(e) => {
                            onImportateurFilterChange?.(e.filter);
                        }}
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
                        pt={{
                            filterInput: {
                                root: { style: { display: 'contents' } }
                            },
                            filterContainer: {
                                className: 'p-dropdown-filter-container'
                            }
                        }}
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
                <div className="field col-4">
                   <label htmlFor="solde">Nbre de sac</label>
                    <InputNumber
                        id="solde"
                        name="solde"
                        value={storageEntry.solde}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="capita">Chef d'équipe</label>
                    <InputText
                        id="capita"
                        name="capita"
                        value={storageEntry.capita}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default StorageEntryForm;