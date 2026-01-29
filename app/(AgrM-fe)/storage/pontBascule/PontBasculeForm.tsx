'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { PontBascule } from "./PontBascule";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React from 'react';
import { Importer } from "../../(settings)/settings/importateur/Importer";

interface PontBasculeProps {
    pontBascule: PontBascule;
    importateurs: Importer[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    handleFactureBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
}

const typeOptions = [
    { label: 'Aucun', value: '' },
    { label: 'Service', value: 'SERV' },
    { label: 'ServicesBuceco', value: 'SERVBUCECO' }
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

const PontBasculeForm: React.FC<PontBasculeProps> = ({ 
    pontBascule, 
    importateurs,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleLazyLoading,
    handleFactureBlur,
    importateurFilter,
    onImportateurFilterChange,
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Row 1 */}
                <div className="field col-3">
                    <label htmlFor="type">Type</label>
                    <Dropdown
                        id="type"
                        name="type"
                        value={pontBascule.type}
                        options={typeOptions}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner le type"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="factureId">N° Facture</label>
                    <InputText 
                        id="factureId"
                        name="factureId"
                        value={pontBascule.factureId}
                        onChange={handleChange}
                        onBlur={handleFactureBlur}
                        placeholder="Saisir N° Facture"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="plaque">Plaque <span className="text-red-500">*</span></label>
                    <InputText 
                        id="plaque"
                        name="plaque"
                        value={pontBascule.plaque}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="datePont1">Date 1ère Pesée <span className="text-red-500">*</span></label>
                    <Calendar 
                        id="datePont1"
                        name="datePont1"
                        value={pontBascule.datePont1}
                        onChange={(e) => handleDateChange(e.value, "datePont1")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>

                {/* Row 2 */}
                <div className="field col-3">
                    <label htmlFor="poidsVide">Poids 1ère Pesée (kg) <span className="text-red-500">*</span></label>
                    <InputNumber 
                        id="poidsVide"
                        name="poidsVide"
                        value={pontBascule.poidsVide}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        required
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="datePont2">Date 2ème Pesée</label>
                    <Calendar 
                        id="datePont2"
                        name="datePont2"
                        value={pontBascule.datePont2}
                        onChange={(e) => handleDateChange(e.value, "datePont2")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="poidsCharge">Poids 2ème Pesée (kg)</label>
                    <InputNumber 
                        id="poidsCharge"
                        name="poidsCharge"
                        value={pontBascule.poidsCharge}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="poidsNet">Poids Net (kg)</label>
                    <InputNumber 
                        id="poidsNet"
                        name="poidsNet"
                        value={pontBascule.poidsNet}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        readOnly
                        className="font-bold"
                        locale="fr-FR"
                    />
                </div>

                {/* Row 3 */}
                <div className="field col-3">
                    <label htmlFor="lt">L.T/T1/PAC</label>
                    <InputText 
                        id="lt"
                        name="lt"
                        value={pontBascule.lt}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="rsp">RSP</label>
                    <InputText 
                        id="rsp"
                        name="rsp"
                        value={pontBascule.rsp}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="poidsRSP">Poids RSP (kg)</label>
                    <InputNumber 
                        id="poidsRSP"
                        name="poidsRSP"
                        value={pontBascule.poidsRSP}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="clientId">Client</label>
                    <Dropdown
                        id="clientId"
                        name="clientId"
                        value={pontBascule.clientId}
                        options={importateurs}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionner un client"
                        filterBy='nom'
                        filter
                        filterInputAutoFocus
                        clearIcon
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

                {/* Row 4 */}
                <div className="field col-3">
                    <label htmlFor="numDecl">Num. Décl (DMC) <span className="text-red-500">*</span></label>
                    <InputText
                        id="numDecl"
                        name="numDecl"
                        value={pontBascule.numDecl}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="nbrePalette">Nbre Palette</label>
                    <InputNumber 
                        id="nbrePalette"
                        name="nbrePalette"
                        value={pontBascule.nbrePalette}
                        onValueChange={handleNumberChange}
                        min={0}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="numBorderau">N° Bordereau</label>
                    <InputText 
                        id="numBorderau"
                        name="numBorderau"
                        value={pontBascule.numBorderau}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="montantPalette">Poids Palette (KG)</label>
                    <InputNumber 
                        id="montantPalette"
                        name="montantPalette"
                        value={pontBascule.montantPalette}
                        onValueChange={handleNumberChange}
                        locale="fr-FR"
                        minFractionDigits={0}
                    />
                </div>

                {/* Row 5 */}
                <div className="field col-3">
                    <label htmlFor="dateEntree">Date Entrée</label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={pontBascule.dateEntree}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        readOnlyInput
                        disabled
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="observation">Observation</label>
                    <InputText 
                        id="observation"
                        name="observation"
                        value={pontBascule.observation}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="gardienage">Motif</label>
                    <InputText 
                        id="gardienage"
                        name="gardienage"
                        value={pontBascule.gardienage}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="sigle">Banque</label>
                    <InputText 
                        id="sigle"
                        name="sigle"
                        value={pontBascule.sigle}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );
};

export default PontBasculeForm;