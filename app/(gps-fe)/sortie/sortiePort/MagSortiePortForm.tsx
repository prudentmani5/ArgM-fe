// MagSortiePortForm.tsx
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
import { Divider } from "primereact/divider";
import { CategorieVehiculeEntrepot } from "../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot";

interface MagSortiePortProps {
    magSortiePort: MagSortiePort;
    importateurs: Importer[];
    marchandises: Marchandise[];
    entrepots: Entrepos[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    handleBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    vehicleCategories: CategorieVehiculeEntrepot[];
}

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
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleLazyLoading,
    importateurFilter,
    onImportateurFilterChange,
    handleBlur,
    vehicleCategories
}) => {


    return (
        <div className="col-12">
            <div className="card">
                <div className="grid">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-3">
                            <label htmlFor="lettreTransport">Lettre de Transport</label>
                            <InputText
                                id="lettreTransport"
                                readOnly
                                name="lettreTransport"
                                value={magSortiePort.lettreTransport}
                                onChange={handleChange}
                            />
                        </div>
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
                            <label htmlFor="noEntree">N° Entrée</label>
                            <InputText
                                id="noEntree"
                                name="noEntree"
                                readOnly
                                value={magSortiePort.noEntree}
                                onChange={handleChange}
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
                                disabled
                                hourFormat="24"
                                dateFormat="dd/mm/yy"
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
                            <label htmlFor="importateurId">Client</label>
                            <Dropdown
                                id="importateurId"
                                name="importateurId"
                                value={magSortiePort.importateurId}
                                onChange={handleDropdownChange}
                                options={importateurs}
                                placeholder='Sélectionner un importateur'
                                filterBy='nom'
                                filter
                                disabled
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
                            <label htmlFor="marchandiseId">Marchandise</label>
                            <Dropdown
                                id="marchandiseId"
                                name="marchandiseId"
                                value={magSortiePort.marchandiseId}
                                options={marchandises}
                                onChange={handleDropdownChange}
                                optionLabel="nom"
                                disabled
                                optionValue="marchandiseId"
                                placeholder="Sélectionner une marchandise"
                                filter
                                filterBy="nom"
                                showClear
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="entreposId">Entrepôt</label>
                            <Dropdown
                                id="entreposId"
                                name="entreposId"
                                value={magSortiePort.entreposId}
                                options={entrepots}
                                disabled
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
                            <label htmlFor="categorieVehiculeId">Catégorie véhicule</label>
                            <Dropdown
                                name="categorieVehiculeId"
                                value={magSortiePort.categorieVehiculeId}
                                options={vehicleCategories}
                                optionLabel='libelle'
                                optionValue='id'
                                onChange={handleDropdownChange}
                                placeholder='Sélectionner la catégorie de véhicule'
                            />
                        </div>


                        <div className="field col-3">
                            <label htmlFor="poidsEntre">Poids Entrée (kg)</label>
                            <InputNumber
                                id="poidsEntre"
                                name="poidsEntre"
                                readOnly
                                value={magSortiePort.poidsEntre}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="poidsSortie">Poids Sortie (kg)</label>
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
                            <label htmlFor="tare">Tare (kg)</label>
                            <InputNumber
                                id="tare"
                                name="tare"
                                value={magSortiePort.tare}
                                onValueChange={handleNumberChange}
                                min={0}
                                mode="decimal"
                                locale="fr-FR"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="nbreColis">Nombre Colis</label>
                            <InputNumber
                                id="nbreColis"
                                name="nbreColis"
                                value={magSortiePort.nbreColis}
                                onValueChange={handleNumberChange}
                                min={0}
                                locale="fr-FR"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="montant">Montant (FBU)</label>
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
                            <label htmlFor="noFacture">N° Facture</label>
                            <InputText
                                id="noFacture"
                                name="noFacture"
                                value={magSortiePort.noFacture || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="plaqueEntree">Plaque Entrée</label>
                            <InputText
                                id="plaqueEntree"
                                name="plaqueEntree"
                                value={magSortiePort.plaqueEntree || ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
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

                        <div className="field col-3">
                            <label htmlFor="dmc">DMC</label>
                            <InputText
                                id="dmc"
                                name="dmc"
                                value={magSortiePort.dmc || ''}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="quittance">Quittance</label>
                            <InputText
                                id="quittance"
                                name="quittance"
                                value={magSortiePort.quittance || ''}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="noBordereau">N° Bordereau</label>
                            <InputText
                                id="noBordereau"
                                name="noBordereau"
                                value={magSortiePort.noBordereau || ''}
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