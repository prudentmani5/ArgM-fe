// MagSortieMagasinForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { MagSortiePort } from "./MagSortiePort";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React from 'react';
import { Marchandise } from "../../(settings)/settings/marchandise/Marchandise";
import { Importer } from "../../(settings)/settings/importateur/Importer";
import { Entrepos } from "../../(settings)/settings/entrepot/Entrepos";
import { Barge } from "../../(settings)/settings/barge/Barge";
import { AgenceDouane } from "../../(settings)/settings/agence/AgenceDouane";
import { CategorieVehiculeEntrepot } from "../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot";
import { Bank } from "../../(settings)/settings/compteBanquaire/CompteBanque";
import { CategorieVehiculeSortieMagasin } from "../../(settings)/settings/categorieVehiculeSortieMagasin/CategorieVehiculeSortieMagasin";

interface MagSortiePortProps {
    magSortiePort: MagSortiePort;
    importateurs: Importer[];
    marchandises: Marchandise[];
    entrepots: Entrepos[];
    barges: Barge[];
    agencesDouane: AgenceDouane[];
    categoriesVehicule: CategorieVehiculeEntrepot[];
    banques: Bank[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    categoriesVehiculeSortieMagasin: CategorieVehiculeSortieMagasin[];
    handleCategorieVehChange: (e: DropdownChangeEvent) => void;
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

const MagSortiePortForm: React.FC<MagSortiePortProps> = ({
    magSortiePort,
    importateurs,
    marchandises,
    entrepots,
    barges,
    agencesDouane,
    categoriesVehicule,
    banques,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    importateurFilter,
    onImportateurFilterChange,
    handleBlur,
    categoriesVehiculeSortieMagasin,
    handleCategorieVehChange

}) => {
    return (
        <div className="col-12">
            <div className="card">
                <div className="grid">
                    <div className="p-fluid formgrid grid">
                        {/* First Row */}
                        <div className="field col-3">
                            <label htmlFor="rsp">RSP</label>
                            <InputText
                                id="rsp"
                                name="rsp"
                                value={magSortiePort.rsp || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="entreposId">Magasin</label>
                            <Dropdown
                                id="entreposId"
                                name="entreposId"
                                value={magSortiePort.entreposId}
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
                                value={magSortiePort.marchandiseId}
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
                            <label htmlFor="bargeIdEntree">Barge/Camion Entrée</label>
                            <Dropdown
                                id="bargeIdEntree"
                                name="bargeIdEntree"
                                value={magSortiePort.bargeIdEntree}
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

                        {/* Second Row */}
                        <div className="field col-3">
                            <label htmlFor="poidsEntre">Poids Entrée</label>
                            <InputNumber
                                id="poidsEntre"
                                name="poidsEntre"
                                value={magSortiePort.poidsEntre}
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
                                value={magSortiePort.dateEntree}
                                onChange={(e) => handleDateChange(e.value, "dateEntree")}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="lettreTransport">LT/PAC/T1</label>
                            <InputText
                                id="lettreTransport"
                                name="lettreTransport"
                                value={magSortiePort.lettreTransport}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="typeTransportEntre">Type Transport Entrée</label>
                            <Dropdown
                                id="typeTransportEntre"
                                name="typeTransportEntre"
                                value={magSortiePort.typeTransportEntre}
                                options={transportTypes}
                                onChange={handleDropdownChange}
                                placeholder="Sélectionner un type"
                            />
                        </div>

                        {/* Third Row */}
                        <div className="field col-3">
                            <label htmlFor="importateurId">Importateur</label>
                            <Dropdown
                                id="importateurId"
                                name="importateurId"
                                value={magSortiePort.importateurId}
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

                        <div className="field col-3">
                            <label htmlFor="categorieVehiculeId">Catégorie Véh.</label>
                            <Dropdown
                                id="categorieVehiculeId"
                                name="categorieVehiculeId"
                                value={magSortiePort.categorieVehiculeId}
                                options={categoriesVehiculeSortieMagasin}
                                onChange={handleCategorieVehChange}
                                optionLabel="libelle"
                                optionValue="categorieVehiculeId"
                                placeholder="Sélectionner une catégorie"
                                filter
                                filterBy="libelle"
                                showClear
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="dateSaisieEntree">Date Saisie Entrée</label>
                            <Calendar
                                id="dateSaisieEntree"
                                name="dateSaisieEntree"
                                value={magSortiePort.dateSaisieEntree}
                                onChange={(e) => handleDateChange(e.value, "dateSaisieEntree")}
                                showTime
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        {/* SORTIE Section */}
                        <div className="field col-12">
                            <h5>SORTIE</h5>
                        </div>

                        {/* Fourth Row */}
                        <div className="field col-3">
                            <label htmlFor="typeTransportSortie">Type Transport Sortie</label>
                            <Dropdown
                                id="typeTransportSortie"
                                name="typeTransportSortie"
                                value={magSortiePort.typeTransportSortie}
                                options={transportTypes}
                                onChange={handleDropdownChange}
                                placeholder="Sélectionner un type"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="poidsSortie">Poids Sortie</label>
                            <InputNumber
                                id="poidsSortie"
                                name="poidsSortie"
                                value={magSortiePort.poidsSortie}
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
                                value={magSortiePort.dateSortie}
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
                                value={magSortiePort.declarant || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="declarant">N° Quittance</label>
                            <InputText
                                id="declarant"
                                name="declarant"
                                value={magSortiePort.quittance || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="declarant">Bordereau</label>
                            <InputText
                                id="declarant"
                                name="declarant"
                                value={magSortiePort.noBordereau || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Fifth Row */}
                        <div className="field col-3">
                            <label htmlFor="montant">Montant</label>
                            <InputNumber
                                id="montant"
                                name="montant"
                                value={magSortiePort.montant}
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
                                value={magSortiePort.solde}
                                onValueChange={handleNumberChange}
                                mode="currency"
                                currency="FBU"
                                locale="fr-FR"
                            />
                        </div>

                        {/* <div className="field col-3">
                            <label htmlFor="sortie">Sortie</label>
                            <div className="mt-2">
                                <Checkbox
                                    inputId="sortie"
                                    name="sortie"
                                    checked={magSortiePort.sortie}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                        </div> */}

                        {/* Sixth Row */}
                        <div className="field col-3">
                            <label htmlFor="noConteneur">N° Conteneur</label>
                            <InputText
                                id="noConteneur"
                                name="noConteneur"
                                value={magSortiePort.noConteneur || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="nbreColis">Qté Sortie</label>
                            <InputNumber
                                id="nbreColis"
                                name="nbreColis"
                                value={magSortiePort.nbreColis}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="plaqueEntree">Plaque Entrée (IT)</label>
                            <InputText
                                id="plaqueEntree"
                                name="plaqueEntree"
                                value={magSortiePort.plaqueEntree || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="plaqueSortie">Plaque Sortie</label>
                            <InputText
                                id="plaqueSortie"
                                name="plaqueSortie"
                                value={magSortiePort.plaqueSortie || ''}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Seventh Row */}
                        <div className="field col-3">
                            <label htmlFor="agenceDouaneId">Agence</label>
                            <Dropdown
                                id="agenceDouaneId"
                                name="agenceDouaneId"
                                value={magSortiePort.agenceDouaneId}
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
                            <label htmlFor="dmc">DMC</label>
                            <InputText
                                id="dmc"
                                name="dmc"
                                value={magSortiePort.dmc || ''}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MagSortiePortForm;