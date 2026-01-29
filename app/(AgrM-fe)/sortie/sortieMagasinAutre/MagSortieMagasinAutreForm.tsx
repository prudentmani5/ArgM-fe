// MagSortieMagasinAutreForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { MagSortieMagasinAutre } from "./MagSortieMagasinAutre";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React from 'react';
import { Marchandise } from "../../(settings)/settings/marchandise/Marchandise";
import { Importer } from "../../(settings)/settings/importateur/Importer";
import { Entrepos } from "../../(settings)/settings/entrepot/Entrepos";
import { Barge } from "../../(settings)/settings/barge/Barge";
import { AgenceDouane } from "../../(settings)/settings/agence/AgenceDouane";

interface MagSortieMagasinAutreProps {
    magSortieMagasinAutre: MagSortieMagasinAutre;
    importateurs: Importer[];
    marchandises: Marchandise[];
    entrepots: Entrepos[];
    barges: Barge[];
    agencesDouane: AgenceDouane[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
}

const transportTypes = [
    { label: 'Camion', value: 'CAMION' },
    { label: 'Barge', value: 'BARGE' },
    { label: 'Train', value: 'TRAIN' }
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

const MagSortieMagasinAutreForm: React.FC<MagSortieMagasinAutreProps> = ({
    magSortieMagasinAutre,
    importateurs,
    marchandises,
    entrepots,
    barges,
    agencesDouane,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    importateurFilter,
    onImportateurFilterChange
}) => {
    return (
        <div className="col-12">
            <div className="card">
                <div className="grid">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-3">
                            <label htmlFor="gps">GPS</label>
                            <InputText
                                id="gps"
                                name="gps"
                                value={magSortieMagasinAutre.gps || 'GPS'}
                                readOnly
                                disabled
                                style={{ backgroundColor: '#f8f9fa' }}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="noFacture">N° Facture</label>
                            <InputText
                                id="noFacture"
                                name="noFacture"
                                value={magSortieMagasinAutre.sortieId}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="entreposId">Magasin</label>
                            <Dropdown
                                id="entreposId"
                                name="entreposId"
                                value={magSortieMagasinAutre.entreposId}
                                options={entrepots}
                                onChange={handleDropdownChange}
                                optionLabel="nom"
                                optionValue="entreposId"
                                placeholder="Sélectionner un entrepôt"
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
                                value={magSortieMagasinAutre.marchandiseId}
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
                            <label htmlFor="bargeIdEntree">Barge Entrée</label>
                            <Dropdown
                                id="bargeIdEntree"
                                name="bargeIdEntree"
                                value={magSortieMagasinAutre.bargeIdEntree}
                                options={barges}
                                onChange={handleDropdownChange}
                                optionLabel="nom"
                                optionValue="bargeId"
                                placeholder="Sélectionner une barge"
                                filter
                                filterBy="nom"
                                showClear
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="poidsEntre">Poids Entrée (kg)</label>
                            <InputNumber
                                id="poidsEntre"
                                name="poidsEntre"
                                value={magSortieMagasinAutre.poidsEntre}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>
                         <div className="field col-3">
                            <label htmlFor="dateEntree">Date Entrée</label>
                            <Calendar
                                id="dateEntree"
                                name="dateEntree"
                                value={magSortieMagasinAutre.dateEntree}
                                onChange={(e) => handleDateChange(e.value, "dateEntree")}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="lettreTransport">Lettre de Transport</label>
                            <InputText
                                id="lettreTransport"
                                name="lettreTransport"
                                value={magSortieMagasinAutre.lettreTransport}
                                onChange={handleChange}
                            />
                        </div>

                         <div className="field col-3">
                            <label htmlFor="typeTransportEntre">Type Transport Entrée</label>
                            <Dropdown
                                id="typeTransportEntre"
                                name="typeTransportEntre"
                                value={magSortieMagasinAutre.typeTransportEntre}
                                options={transportTypes}
                                onChange={handleDropdownChange}
                                placeholder="Sélectionner un type"
                            />
                        </div>
                         <div className="field col-3">
                            <label htmlFor="importateurId">Importateur</label>
                            <Dropdown
                                id="importateurId"
                                name="importateurId"
                                value={magSortieMagasinAutre.importateurId}
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
                                        <span>{item.nom}</span>
                                    </div>
                                )}
                            />
                        </div>

                        {/* Section sortie */}

                        <div className="field col-3">
                            <label htmlFor="typeTransportSortie">Type Transport Sortie</label>
                            <Dropdown
                                id="typeTransportSortie"
                                name="typeTransportSortie"
                                value={magSortieMagasinAutre.typeTransportSortie}
                                options={transportTypes}
                                onChange={handleDropdownChange}
                                placeholder="Sélectionner un type"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="poidsSortie">Poids Sortie (kg)</label>
                            <InputNumber
                                id="poidsSortie"
                                name="poidsSortie"
                                value={magSortieMagasinAutre.poidsSortie}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="dateSortie">Date Sortie</label>
                            <Calendar
                                id="dateSortie"
                                name="dateSortie"
                                value={magSortieMagasinAutre.dateSortie}
                                onChange={(e) => handleDateChange(e.value, "dateSortie")}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="declarant">Déclarant</label>
                            <InputText
                                id="declarant"
                                name="declarant"
                                value={magSortieMagasinAutre.declarant || ''}
                                onChange={handleChange}
                            />
                        </div>
                         <div className="field col-3">
                            <label htmlFor="montant">Montant (FBU)</label>
                            <InputNumber
                                id="montant"
                                name="montant"
                                value={magSortieMagasinAutre.montant}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="currency"
                                currency="FBU"
                                locale="fr-FR"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="solde">Solde</label>
                            <InputNumber
                                id="solde"
                                name="solde"
                                value={magSortieMagasinAutre.solde}
                                onValueChange={handleNumberChange}
                                mode="currency"
                                currency="FBU"
                                locale="fr-FR"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="sortie">Sortie</label>
                            <div className="mt-2">
                                <Checkbox
                                    inputId="sortie"
                                    name="sortie"
                                    checked={magSortieMagasinAutre.sortie}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </div>
                        <div className="field col-3">
                            <label htmlFor="noConteneur">N° Conteneur</label>
                            <InputText
                                id="noConteneur"
                                name="noConteneur"
                                value={magSortieMagasinAutre.noConteneur || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="nbreColis">Qté Sortie</label>
                            <InputNumber
                                id="nbreColis"
                                name="nbreColis"
                                value={magSortieMagasinAutre.nbreColis}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>
                         <div className="field col-3">
                            <label htmlFor="plaqueEntree">Plaque Entrée</label>
                            <InputText
                                id="plaqueEntree"
                                name="plaqueEntree"
                                value={magSortieMagasinAutre.plaqueEntree || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="plaqueSortie">Plaque Sortie <span className="text-red-500">*</span></label>
                            <InputText
                                id="plaqueSortie"
                                name="plaqueSortie"
                                value={magSortieMagasinAutre.plaqueSortie || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="agenceDouaneId">Agence en douane</label>
                            <Dropdown
                                id="agenceDouaneId"
                                name="agenceDouaneId"
                                value={magSortieMagasinAutre.agenceDouaneId}
                                options={agencesDouane}
                                onChange={handleDropdownChange}
                                optionLabel="libelle"
                                optionValue="agenceDouaneId"
                                placeholder="Sélectionner une agence"
                                filter
                                filterBy="libelle"
                                showClear
                            />
                        </div>

                         <div className="field col-3">
                            <label htmlFor="dmc">DMC <span className="text-red-500">*</span></label>
                            <InputText
                                id="dmc"
                                name="dmc"
                                value={magSortieMagasinAutre.dmc || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MagSortieMagasinAutreForm;
