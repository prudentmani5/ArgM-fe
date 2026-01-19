// EnterRSPForm.tsx
'use client';

import { InputText } from "primereact/inputtext";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";
import { EnterRSP } from "./EnterRSP";
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import React from 'react';
import { Marchandise } from "../../(settings)/settings/marchandise/Marchandise";
import { Importer } from "../../(settings)/settings/importateur/Importer";
import { TypePackaging } from "../../(settings)/settings/typePackaging/TypePackaging";
import { Emballage } from "../../(settings)/settings/emballage/Emballage";
import { Barge } from "../../(settings)/settings/barge/Barge";
import { Entrepos } from "../../(settings)/settings/entrepot/Entrepos";
import { Divider } from "primereact/divider";
import { Provenance } from "../../(settings)/settings/provenance/Provenance";

interface EnterRSPProps {
    enterRSP: EnterRSP;
    importateurs: Importer[];
    marchandises: Marchandise[];
    typeConditions: TypePackaging[];
    emballages: Emballage[];
    barges: Barge[];
    entrepots: Entrepos[];
    provenances: Provenance[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleLazyLoading: (e: VirtualScrollerLazyEvent) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    salissageComponent: boolean
}

const transportTypes = [
    { label: 'Camion', value: 'CAMION' },
    { label: 'Barge', value: 'BARGE' },
    { label: 'Train', value: 'TRAIN' }
];

const natureTypes = [
    { label: 'Lourd', value: 'lourd' },
    { label: 'Volumineux', value: 'volumineux' },

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

const EnterRSPForm: React.FC<EnterRSPProps> = ({
    enterRSP,
    importateurs,
    marchandises,
    typeConditions,
    emballages,
    barges,
    entrepots,
    provenances,
    loadingStatus,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    handleCheckboxChange,
    handleLazyLoading,
    importateurFilter,
    onImportateurFilterChange,
    salissageComponent
}) => {
    return (
        <div className="col-12">
            <div className="card">
                <div className="grid">
                    {/* flex align-items-center justify-content-center */}
                    <div className="col-6">
                        <div className="p-fluid formgrid grid">
                            <div className="field col-4">
                                <label htmlFor="noEntree">N° Entrée</label>
                                <InputText
                                    id="noEntree"
                                    name="noEntree"
                                    value={enterRSP.noEntree?.toString() || ''}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </div>
                            {/* Basic Information */}
                            <div className="field col-4">
                                <label htmlFor="noLettreTransport">Lettre de Transport</label>
                                <InputText
                                    id="noLettreTransport"
                                    name="noLettreTransport"
                                    value={enterRSP.noLettreTransport}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="recuPalan">RSP</label>
                                <InputText
                                    id="recuPalan"
                                    name="recuPalan"
                                    value={enterRSP.recuPalan}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="importateurId">Client</label>
                                <Dropdown
                                    id="importateurId"
                                    name="importateurId"
                                    value={enterRSP.importateurId}
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
                            <div className="field col-4">
                                <label htmlFor="nif">NIF</label>
                                <InputText
                                    id="nif"
                                    name="nif"
                                    value={enterRSP.nif}
                                    onChange={handleChange}
                                    readOnly
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="transporteur">Transporteur</label>
                                <InputText
                                    id="transporteur"
                                    name="transporteur"
                                    value={enterRSP.transporteur}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="dateEntree">Date Entrée</label>
                                <Calendar
                                    id="dateEntree"
                                    name="dateEntree"
                                    value={enterRSP.dateEntree}
                                    onChange={(e) => handleDateChange(e.value, "dateEntree")}
                                    hourFormat="24"
                                    dateFormat="dd/mm/yy"
                                />
                            </div>
                            <div className="field col-4">
                                {/* J'ai mis ce champ par hasard pour correspondre l'UI avec le logiciel deja utilisé */}
                                <label htmlFor="montantLt">Tarif Surt. Colis (FBU)</label>
                                <InputNumber
                                    id="montantLt"
                                    name="montantLt"
                                    value={enterRSP.montantLt}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>

                            <div className="field col-4">
                                {/* J'ai mis ce champ par hasard pour correspondre l'UI avec le logiciel deja utilisé */}
                                <label htmlFor="fraisSlt">Frais (FBU)</label>
                                <InputNumber
                                    id="fraisSlt"
                                    name="fraisSlt"
                                    value={enterRSP.fraisSlt}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="provenanceId">Provenance</label>
                                <Dropdown
                                    id="provenanceId"
                                    name="provenanceId"
                                    value={enterRSP.provenanceId}
                                    options={provenances}
                                    optionLabel="nom"
                                    optionValue="provenanceId"
                                    filter
                                    filterBy="nom"
                                    onChange={handleDropdownChange}
                                    placeholder="Sélectionnez une provenance"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="entreposId">Entrepot</label>
                                <Dropdown
                                    id="entreposId"
                                    name="entreposId"
                                    value={enterRSP.entreposId}
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

                            <div className="field col-4">
                                <label htmlFor="nbreColis">Nbre Etiquette</label>
                                <InputNumber
                                    id="nbreEtiquette"
                                    name="nbreEtiquette"
                                    value={enterRSP.nbreEtiquette}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="destinationId">Destination</label>
                                <Dropdown
                                    id="destinationId"
                                    name="destinationId"
                                    value={enterRSP.destinationId}
                                    options={provenances}
                                    optionLabel="nom"
                                    optionValue="provenanceId"
                                    filter
                                    filterBy="nom"
                                    onChange={handleDropdownChange}
                                    placeholder="Sélectionnez une provenance"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="typeConditionId">Condition</label>
                                <Dropdown
                                    id="typeConditionId"
                                    name="typeConditionId"
                                    value={enterRSP.typeConditionId}
                                    options={typeConditions}
                                    onChange={handleDropdownChange}
                                    optionLabel="libelle"
                                    optionValue="typeConditionId"
                                    placeholder="Sélectionner une condition"
                                    filter
                                    filterBy="libelle"
                                    showClear
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="nbrePalette">Nbre Palette</label>
                                <InputNumber
                                    id="nbrePalette"
                                    name="nbrePalette"
                                    value={enterRSP.nbrePalette}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="emballageId">Emballage</label>
                                <Dropdown
                                    id="emballageId"
                                    name="emballageId"
                                    value={enterRSP.emballageId}
                                    options={emballages}
                                    onChange={handleDropdownChange}
                                    optionLabel="nom"
                                    optionValue="emballageId"
                                    placeholder="Sélectionner un emballage"
                                    filter
                                    filterBy="nom"
                                    showClear
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="bargeId">Barge</label>
                                <Dropdown
                                    id="bargeId"
                                    name="bargeId"
                                    value={enterRSP.bargeId}
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
                            <div className="field col-4">
                                <label htmlFor="nbreColis">Nombre Colis</label>
                                <InputNumber
                                    id="nbreColis"
                                    name="nbreColis"
                                    value={enterRSP.nbreColis}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="marchandiseId">Marchandise</label>
                                <Dropdown
                                    id="marchandiseId"
                                    name="marchandiseId"
                                    value={enterRSP.marchandiseId}
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
                            <div className="field col-4">
                                <label htmlFor="montantBarge">Montant Barge (FBU)</label>
                                <InputNumber
                                    id="montantBarge"
                                    name="montantBarge"
                                    value={enterRSP.montantBarge}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="doubleManut">Double Manutention</label>
                                <Checkbox
                                    inputId="doubleManut"
                                    name="doubleManut"
                                    checked={enterRSP.doubleManut}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="nature">Nature</label>
                                <Dropdown
                                    id="nature"
                                    name="nature"
                                    value={enterRSP.nature}
                                    options={natureTypes}
                                    onChange={handleDropdownChange}
                                    placeholder="Sélectionnez une nature"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="montantCamion">Montant Camion (FBU)</label>
                                <InputNumber
                                    id="montantCamion"
                                    name="montantCamion"
                                    value={enterRSP.montantCamion}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="exonere">Exonéré</label>
                                <Checkbox
                                    inputId="exonere"
                                    name="exonere"
                                    checked={enterRSP.exonere}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="plaque">Plaque</label>
                                <InputText
                                    id="plaque"
                                    name="plaque"
                                    value={enterRSP.plaque}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="declarant">Déclarant</label>
                                <InputText
                                    id="declarant"
                                    name="declarant"
                                    value={enterRSP.declarant}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="observation">Nbre de Collis intacts</label>
                                <InputText
                                    id="observation"
                                    name="observation"
                                    value={enterRSP.observation}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="constatation">Poids Constat.</label>
                                <InputText
                                    id="constatation"
                                    name="constatation"
                                    value={enterRSP.constatation}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="colisManquants">Nbre de colis. Manquants</label>
                                <InputText
                                    id="colisManquants"
                                    name="colisManquants"
                                    value={enterRSP.colisManquants}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="colisAvaries">Nbre de colis. Avariés</label>
                                <InputText
                                    id="colisAvaries"
                                    name="colisAvaries"
                                    value={enterRSP.colisAvaries}
                                    onChange={handleChange}
                                />
                            </div>
                            {/* <div className="field col-4">
                                <label htmlFor="observation">Observation</label>
                                <InputText
                                    id="observation"
                                    name="observation"
                                    value={enterRSP.observation}
                                    onChange={handleChange}
                                />
                            </div> */}

                            {/* Transport Information */}
                            {/* <div className="field col-4">
                                <label htmlFor="typeTransport">Type Transport</label>
                                <Dropdown
                                    id="typeTransport"
                                    name="typeTransport"
                                    value={enterRSP.typeTransport}
                                    options={transportTypes}
                                    onChange={handleDropdownChange}
                                    placeholder="Sélectionnez un type"
                                />
                            </div> */}
                        </div>
                    </div>
                    {/* <div className="field col-1">
                        <Divider layout="vertical" >
                        </Divider>
                    </div> */}
                    <div className="col-6">

                        <div className="p-fluid formgrid grid">
                            <div className="field col-4">
                                {/* J'ai mis ce champ par hasard pour correspondre l'UI avec le logiciel deja utilisé */}
                                <label htmlFor="surtaxePlt">Pourcentage </label>
                                <InputNumber
                                    id="surtaxePlt"
                                    name="surtaxePlt"
                                    value={enterRSP.surtaxePlt}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                {/* J'ai mis ce champ par hasard pour correspondre l'UI avec le logiciel deja utilisé */}
                                <label htmlFor="fraisSlt">Tarif Salis. </label>
                                <InputNumber
                                    id="fraisSlt"
                                    name="fraisSlt"
                                    value={enterRSP.fraisSlt}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="peseMagasin">Pesé Magasin</label>
                                <Checkbox
                                    inputId="peseMagasin"
                                    name="peseMagasin"
                                    checked={enterRSP.peseMagasin}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="taxe">Taxe </label>
                                <InputNumber
                                    id="taxe"
                                    name="taxe"
                                    value={enterRSP.taxe}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="montantPeseMagasin">Montant Pesé </label>
                                <InputNumber
                                    id="montantPeseMagasin"
                                    name="montantPeseMagasin"
                                    value={enterRSP.montantPeseMagasin}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">  </div>
                            <div className="field col-4">
                                <label htmlFor="salissage">Salissage</label>
                                <Checkbox
                                    inputId="salissage"
                                    name="salissage"
                                    checked={enterRSP.salissage}
                                    onChange={handleCheckboxChange}
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="tauxSalissage">Taux Salissage </label>
                                <InputNumber
                                    id="tauxSalissage"
                                    name="tauxSalissage"
                                    value={enterRSP.tauxSalissage}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    disabled={salissageComponent}
                                    locale="fr-FR"

                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="surtaxePrspTaux">% Surtaxe </label>
                                <InputNumber
                                    id="surtaxePrspTaux"
                                    name="surtaxePrspTaux"
                                    value={enterRSP.surtaxePrspTaux}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"

                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="poidsExonere">Poids exonéré </label>
                                <InputNumber
                                    id="poidsExonere"
                                    name="poidsExonere"
                                    value={enterRSP.poidsExonere}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"

                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="fraisSrsp">Mont. Salissage (FBU)</label>
                                <InputNumber
                                    id="fraisSrsp"
                                    name="fraisSrsp"
                                    value={enterRSP.fraisSrsp}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="faireSuivre">Laisser suivre</label>
                                <Checkbox
                                    inputId="faireSuivre"
                                    name="faireSuivre"
                                    checked={enterRSP.faireSuivre}
                                    onChange={handleCheckboxChange}
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="poids">Poids</label>
                                <InputNumber
                                    id="poids"
                                    name="poids"
                                    value={enterRSP.poids}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"

                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="montant">Montant. Manut</label>
                                <InputNumber
                                    id="montant"
                                    name="montant"
                                    value={enterRSP.montant}
                                    onValueChange={handleNumberChange}
                                    locale="fr-FR"
                                />
                            </div>
                            
                            <div className="field col-4">
                                <label htmlFor="montantFaireSuivre">Montant. Laisser suivre</label>
                                <InputNumber
                                    id="montantFaireSuivre"
                                    name="montantFaireSuivre"
                                    value={enterRSP.montantFaireSuivre}
                                    onValueChange={handleNumberChange}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="surtaxeCrsp">Surtaxe.Colis</label>
                                <InputNumber
                                    id="surtaxeCrsp"
                                    name="surtaxeCrsp"
                                    value={enterRSP.surtaxeCrsp}
                                    onValueChange={handleNumberChange}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="tarifCamion">Tarif Camion (FBU)</label>
                                <InputNumber
                                    id="tarifCamion"
                                    name="tarifCamion"
                                    value={enterRSP.tarifCamion}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="fraisArrimage">Montant Arr.</label>
                                <InputNumber
                                    id="fraisArrimage"
                                    name="fraisArrimage"
                                    value={Math.round(enterRSP.fraisArrimage || 0)}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    mode="decimal"
                                    minFractionDigits={0}
                                    maxFractionDigits={0}
                                    locale="fr-FR"
                                />
                            </div>

                            <div className="field col-4">
                                <label htmlFor="transit">March. Transit</label>
                                <Checkbox
                                    inputId="transit"
                                    name="transit"
                                    checked={enterRSP.transit}
                                    onChange={handleCheckboxChange}
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="tarifBarge">Tarif Barge (FBU)</label>
                                <InputNumber
                                    id="tarifBarge"
                                    name="tarifBarge"
                                    value={enterRSP.tarifBarge}
                                    onValueChange={handleNumberChange}
                                    min={0}
                                    locale="fr-FR"
                                />
                            </div>
                            <div className="field col-4">
                                <label htmlFor="surtaxePrsp">Surtaxe.Colis</label>
                                <InputNumber
                                    id="surtaxePrsp"
                                    name="surtaxePrsp"
                                    value={enterRSP.surtaxePrsp}
                                    onValueChange={handleNumberChange}
                                    locale="fr-FR"
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterRSPForm;