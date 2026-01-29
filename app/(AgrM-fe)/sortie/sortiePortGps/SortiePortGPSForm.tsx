'use client';

import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { SortiePortGPS } from "./SortiePortGPS";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import React from 'react';
import { Importer } from "../../(settings)/settings/importateur/Importer";
import { Button } from "primereact/button";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { AgenceDouane } from "../../(settings)/settings/agence/AgenceDouane";
import { FacServicePreste } from "../../entryMagasin/(entryVehicule)/factServicePreste/FacServicePreste";

interface SortiePortGPSFormProps {
    sortiePortGPS: SortiePortGPS;
    importateurs: Importer[];
    agencesDouane: AgenceDouane[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: string | Date | Date[] | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    handleGpsBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    onShowPontBasculeDialog?: () => void;
    facServicePresteList?: FacServicePreste[];
    onShowFacServicePresteDialog?: () => void;
}

export const typeOperationOptions = [
    { label: '[Aucun]', value: '' },
    { label: 'Déchargement à domicile 20\'', value: 'DAD 20\'' },
    { label: 'Déchargement à domicile 40\'', value: 'DAD 40\'' },
    { label: 'Déchargement au port 20\'', value: 'DP 20\'' },
    { label: 'Déchargement au port 40\'', value: 'DP 40\'' },
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

CustomFilterInput.displayName = 'CustomFilterInput';

const SortiePortGPSForm: React.FC<SortiePortGPSFormProps> = ({
    sortiePortGPS,
    importateurs,
    agencesDouane,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleLazyLoading,
    handleGpsBlur,
    importateurFilter,
    onImportateurFilterChange,
    onShowPontBasculeDialog,
    facServicePresteList,
    onShowFacServicePresteDialog,
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Row 1: Main Information */}
                <div className="field col-3">
                    <label htmlFor="gps">GPS (LT/PAC/T1) <span className="text-red-500">*</span></label>
                    <InputText
                        id="gps"
                        name="gps"
                        value={sortiePortGPS.gps}
                        onChange={handleChange}
                        onBlur={handleGpsBlur}
                        placeholder="GPS"
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="clientId">Client <span className="text-red-500">*</span></label>
                    <Dropdown
                        id="clientId"
                        name="clientId"
                        value={sortiePortGPS.clientId}
                        options={importateurs}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="importateurId"
                        placeholder="Sélectionner un client"
                        filterBy="nom"
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
                        filterTemplate={(options: any) => (
                            <CustomFilterInput
                                value={importateurFilter || ''}
                                onChange={(e) => onImportateurFilterChange?.(e.target.value)}
                                ref={options.filterInputRef}
                            />
                        )}
                        showClear
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateEntree">Date Entrée <span className="text-red-500">*</span></label>
                    <Calendar
                        id="dateEntree"
                        name="dateEntree"
                        value={sortiePortGPS.dateEntree}
                        onChange={(e) => handleDateChange(e.value, "dateEntree")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        required
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dateSortie">Date Sortie <span className="text-red-500">*</span></label>
                    <Calendar
                        id="dateSortie"
                        name="dateSortie"
                        value={sortiePortGPS.dateSortie}
                        onChange={(e) => handleDateChange(e.value, "dateSortie")}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                        showIcon
                        required
                    />
                </div>

                {/* Row 2: SORTIE Section */}
                <div className="field col-12">
                    <h5 className="mb-2">SORTIE</h5>
                </div>

                <div className="field col-3">
                    <label htmlFor="typeOperation">Type d&apos;opération</label>
                    <Dropdown
                        id="typeOperation"
                        name="typeOperation"
                        value={sortiePortGPS.typeOperation}
                        options={typeOperationOptions}
                        onChange={handleDropdownChange}
                        placeholder="Type d'opération"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="numQuittance">N° Quittance</label>
                    <InputText
                        id="numQuittance"
                        name="numQuittance"
                        value={sortiePortGPS.numQuittance}
                        onChange={handleChange}
                        placeholder="N° Quittance"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="poids1erePesee">Poids 1ère Pesée</label>
                    <InputNumber
                        id="poids1erePesee"
                        name="poids1erePesee"
                        value={sortiePortGPS.poids1erePesee}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        locale="fr-FR"
                        suffix=" kg"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="poids2emePesee">Poids 2ème Pesée</label>
                    <InputNumber
                        id="poids2emePesee"
                        name="poids2emePesee"
                        value={sortiePortGPS.poids2emePesee}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        locale="fr-FR"
                        suffix=" kg"
                        readOnly
                    />
                </div>

                {/* Row 3 */}
                <div className="field col-3">
                    <label htmlFor="poidsNet">Poids Net</label>
                    <InputNumber
                        id="poidsNet"
                        name="poidsNet"
                        value={sortiePortGPS.poidsNet}
                        onValueChange={handleNumberChange}
                        min={0}
                        minFractionDigits={2}
                        locale="fr-FR"
                        suffix=" kg"
                        readOnly
                    />
                </div>
                <div className="field col-3">
                    <label htmlFor="montant">Montant</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={sortiePortGPS.montant}
                        onValueChange={handleNumberChange}
                        mode="currency"
                        currency="BIF"
                        locale="fr-FR"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="agenceDouaneId">Agence en Douane</label>
                    <Dropdown
                        id="agenceDouaneId"
                        name="agenceDouaneId"
                        value={sortiePortGPS.agenceDouaneId}
                        options={agencesDouane}
                        onChange={handleDropdownChange}
                        optionLabel="libelle"
                        optionValue="agenceDouaneId"
                        placeholder="Sélectionner une agence"
                        filter
                        showClear
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="numFiche">N° Fiche</label>
                    <InputText
                        id="numFiche"
                        name="numFiche"
                        value={sortiePortGPS.numFiche}
                        onChange={handleChange}
                        placeholder="N° Fiche"
                        readOnly
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="dmc">DMC</label>
                    <InputText
                        id="dmc"
                        name="dmc"
                        value={sortiePortGPS.dmc}
                        onChange={handleChange}
                        placeholder="DMC"
                    />
                </div>

                <div className="field col-3">
                    <label htmlFor="banqueName">Banque</label>
                    <InputText
                        id="banqueName"
                        name="banqueName"
                        value={sortiePortGPS.banqueName || ''}
                        placeholder="Banque"
                        readOnly
                    />
                </div>

                {/* Row 4 */}
                <div className="field col-3">
                    <label htmlFor="numBordereau">N° Bordereau</label>
                    <InputText
                        id="numBordereau"
                        name="numBordereau"
                        value={sortiePortGPS.numBordereau}
                        onChange={handleChange}
                        placeholder="N° Bordereau"
                        readOnly
                    />
                </div>





                <div className="field col-3">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={sortiePortGPS.plaque}
                        placeholder="Plaque"
                        onChange={handleChange}
                    />
                </div>

                {/* Button to show PontBascule dialog */}
                {sortiePortGPS.pontBasculeList && sortiePortGPS.pontBasculeList.length > 0 && (
                    <div className="field col-3">
                        <label>&nbsp;</label>
                        <Button
                            type="button"
                            label={`Voir Pesées (${sortiePortGPS.pontBasculeList.length})`}
                            icon="pi pi-list"
                            severity="info"
                            onClick={onShowPontBasculeDialog}
                        />
                    </div>
                )}

                {/* Button to show FacServicePreste dialog */}
                {facServicePresteList && facServicePresteList.length > 0 && (
                    <div className="field col-3">
                        <label>&nbsp;</label>
                        <Button
                            type="button"
                            label={`Voir Services (${facServicePresteList.length})`}
                            icon="pi pi-file"
                            severity="secondary"
                            onClick={onShowFacServicePresteDialog}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default SortiePortGPSForm;
