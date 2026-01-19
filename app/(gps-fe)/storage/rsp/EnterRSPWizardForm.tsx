'use client';

import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';

// Interface props that should match your page.tsx
interface EnterRSPWizardFormProps {
    enterRSP: any; // Use your EnterRSP interface
    importateurs: any[];
    marchandises: any[];
    typeConditions: any[];
    emballages: any[];
    barges: any[];
    entrepots: any[];
    provenances: any[];
    loadingStatus: boolean;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: CheckboxChangeEvent) => void;
    handleLazyLoading?: (e: any) => void;
    importateurFilter?: string;
    onImportateurFilterChange?: (value: string) => void;
    salissageComponent: boolean;
    onSubmit: () => void;
    onReset: () => void;
    btnLoading: boolean;
    handleBlurEvent: (e: React.FocusEvent<HTMLInputElement>) => void;
    // Add toast function prop
    showToast?: (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => void;
    // Add edit mode flag
    isEditMode?: boolean;
}

const natureTypes = [
    { label: 'Lourd', value: 'lourd' },
    { label: 'Volumineux', value: 'volumineux' }
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

const EnterRSPWizardForm: React.FC<EnterRSPWizardFormProps> = ({
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
    salissageComponent,
    onSubmit,
    onReset,
    btnLoading,
    handleBlurEvent,
    showToast,
    isEditMode = false
}) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const steps = [
        { label: 'Informations de Base', index: 0 },
        { label: 'Transport & Marchandise', index: 1 },
        { label: 'Calculs & Taxes', index: 2 },
        { label: 'Observations', index: 3 }
    ];

    // Styles for colored fields
    const greenFieldStyle = {
        color: '#28a745',
        fontWeight: 'bold'
    };

    const blueFieldStyle = {
        color: '#007bff',
        fontWeight: 'bold'
    };

    // Validation function for each step
    const validateStep = (stepIndex: number): boolean => {
        if (!showToast) return true; // If no toast function provided, skip validation

        switch (stepIndex) {
            case 0: // Step 1 validation
                if (!enterRSP.noLettreTransport || enterRSP.noLettreTransport.trim() === '') {
                    showToast('warn', 'Attention', 'Vous devez d\'abord saisir la lettre de transport');
                    return false;
                }
                if (!enterRSP.importateurId) {
                    showToast('warn', 'Attention', 'Vous devez choisir le client');
                    return false;
                }
                if (!enterRSP.transporteur || enterRSP.transporteur.trim() === '') {
                    showToast('warn', 'Attention', 'Vous devez saisir le transporteur');
                    return false;
                }
                break;

            case 1: // Step 2 validation
                if (!enterRSP.provenanceId) {
                    showToast('warn', 'Attention', 'Vous devez choisir la provenance');
                    return false;
                }
                if (!enterRSP.destinationId) {
                    showToast('warn', 'Attention', 'Vous devez choisir la destination');
                    return false;
                }
                if (!enterRSP.entreposId) {
                    showToast('warn', 'Attention', 'Vous devez choisir l\'entrepôt');
                    return false;
                }
                if (!enterRSP.marchandiseId) {
                    showToast('warn', 'Attention', 'Vous devez choisir la marchandise');
                    return false;
                }
                if (!enterRSP.emballageId) {
                    showToast('warn', 'Attention', 'Vous devez choisir l\'emballage');
                    return false;
                }
                if (!enterRSP.bargeId) {
                    showToast('warn', 'Attention', 'Vous devez choisir la barge');
                    return false;
                }
                break;

            case 2: // Step 3 validation

                if (enterRSP.salissage && (!enterRSP.tauxSalissage || enterRSP.tauxSalissage <= 0)) {
                    showToast('warn', 'Attention', 'Vous devez préciser le taux de salissage');
                    return false;
                }

                if (!enterRSP.nbreColis || enterRSP.nbreColis <= 0) {
                    showToast('warn', 'Attention', 'Vous devez saisir le nombre de colis');
                    return false;
                }
                if (!enterRSP.poids || enterRSP.poids <= 0) {
                    showToast('warn', 'Attention', 'Vous devez saisir le poids');
                    return false;
                }
                break;

            default:
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (activeIndex < steps.length - 1) {
            // Validate current step before moving to next
            if (validateStep(activeIndex)) {
                setActiveIndex(activeIndex + 1);
            }
        }
    };

    const prevStep = () => {
        if (activeIndex > 0) {
            setActiveIndex(activeIndex - 1);
        }
    };

    const goToStep = (stepIndex: number) => {
        // Validate all previous steps before jumping to a step
        for (let i = 0; i < stepIndex; i++) {
            if (!validateStep(i)) {
                return; // Stop if any previous step validation fails
            }
        }
        setActiveIndex(stepIndex);
    };

    // Enhanced reset function that goes back to step 1
    const handleReset = () => {
        setActiveIndex(0); // Return to step 1
        onReset(); // Call the original reset function
    };

    // Custom Steps Header using basic styling
    const renderStepsHeader = () => (
        <div className="mb-4">
            <div className="flex align-items-center justify-content-center mb-4">
                {steps.map((step, index) => (
                    <React.Fragment key={step.index}>
                        <div
                            className={`flex align-items-center justify-content-center cursor-pointer border-round ${index === activeIndex
                                ? 'bg-primary text-white'
                                : index < activeIndex
                                    ? 'bg-green-500 text-white'
                                    : 'surface-200 text-700'
                                }`}
                            style={{
                                width: '40px',
                                height: '40px',
                                fontWeight: 'bold',
                                margin: '0 10px'
                            }}
                            onClick={() => goToStep(index)}
                        >
                            {index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`${index < activeIndex ? 'bg-green-500' : 'surface-300'
                                    }`}
                                style={{
                                    width: '60px',
                                    height: '2px'
                                }}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="text-center">
                <h3 className="text-xl font-medium text-900 mb-2">
                    {steps[activeIndex].label}
                </h3>
                <p className="text-600 mt-0 mb-0">Étape {activeIndex + 1} sur {steps.length}</p>
            </div>
        </div>
    );

    // Step 1: Basic Information
    const renderStep1 = () => (
        <div className="card">
            <h4 className="text-center mb-4">Informations de Base</h4>
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="noEntree">N° Entrée</label>
                    <InputText
                        id="noEntree"
                        name="noEntree"
                        value={enterRSP.noEntree?.toString() || ''}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="noLettreTransport">Lettre de Transport *</label>
                    <InputText
                        id="noLettreTransport"
                        name="noLettreTransport"
                        value={enterRSP.noLettreTransport}
                        onChange={handleChange}
                        className={!enterRSP.noLettreTransport || enterRSP.noLettreTransport.trim() === '' ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
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
                    <label htmlFor="importateurId">Client *</label>
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
                        className={!enterRSP.importateurId ? 'p-invalid' : ''}
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

                <div className="field col-12 md:col-4">
                    <label htmlFor="nif">NIF</label>
                    <InputText
                        id="nif"
                        name="nif"
                        value={enterRSP.nif}
                        onChange={handleChange}
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="transporteur">Transporteur *</label>
                    <InputText
                        id="transporteur"
                        name="transporteur"
                        value={enterRSP.transporteur}
                        onChange={handleChange}
                        className={!enterRSP.transporteur || enterRSP.transporteur.trim() === '' ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
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

                <div className="field col-12 md:col-4">
                    <label htmlFor="plaque">Plaque</label>
                    <InputText
                        id="plaque"
                        name="plaque"
                        value={enterRSP.plaque}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="declarant">Déclarant</label>
                    <InputText
                        id="declarant"
                        name="declarant"
                        value={enterRSP.declarant}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
    );

    // Step 2: Transport & Merchandise
    const renderStep2 = () => (
        <div className="card">
            <h4 className="text-center mb-4">Transport & Marchandise</h4>
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="provenanceId">Provenance *</label>
                    <Dropdown
                        id="provenanceId"
                        name="provenanceId"
                        value={enterRSP.provenanceId}
                        options={provenances}
                        optionLabel="nom"
                        optionValue="provenanceId"
                        filter
                        filterBy="nom"
                        clearIcon
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une provenance"
                        className={!enterRSP.provenanceId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="destinationId">Destination *</label>
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
                        placeholder="Sélectionnez une destination"
                        className={!enterRSP.destinationId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="entreposId">Entrepot *</label>
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
                        className={!enterRSP.entreposId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="marchandiseId">Marchandise *</label>
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
                        className={!enterRSP.marchandiseId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="emballageId">Emballage *</label>
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
                        className={!enterRSP.emballageId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeConditionId">Conditionnement</label>
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
                        readOnly
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="bargeId">Barge *</label>
                    <Dropdown
                        id="bargeId"
                        name="bargeId"
                        value={enterRSP.bargeId}
                        options={barges}
                        onChange={handleDropdownChange}
                        optionLabel="nom"
                        optionValue="bargeId"
                        placeholder="Sélectionner une barge"
                        filter
                        filterBy="nom"
                        showClear
                        className={!enterRSP.bargeId ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-4">
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
            </div>
        </div>
    );

    // Step 3: Calculations & Taxes
    const renderStep3 = () => (
        <div className="card">
            <h4 className="text-center mb-4">Calculs & Taxes</h4>
            <div className="p-fluid formgrid grid">

                {/* Checkboxes */}

                <div className="field col-12 md:col-3">
                    <label htmlFor="salissage">Salissage</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="salissage"
                            name="salissage"
                            checked={enterRSP.salissage}
                            onChange={handleCheckboxChange}
                            readOnly
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="doubleManut">Double Manutention</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="doubleManut"
                            name="doubleManut"
                            checked={enterRSP.doubleManut}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="peseMagasin">Pesé Magasin</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="peseMagasin"
                            name="peseMagasin"
                            checked={enterRSP.peseMagasin}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="exonere">Exonéré</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="exonere"
                            name="exonere"
                            checked={enterRSP.exonere}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>

                <Divider />

                {enterRSP.salissage && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="tauxSalissage">Taux Salissage</label>
                        <InputNumber
                            id="tauxSalissage"
                            name="tauxSalissage"
                            value={enterRSP.tauxSalissage}
                            onValueChange={handleNumberChange}
                            min={0}
                            disabled={salissageComponent}
                            locale="fr-FR"
                            inputStyle={greenFieldStyle}
                        />
                    </div>
                )}

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbreColis">Nombre Colis *</label>
                    <InputNumber
                        id="nbreColis"
                        name="nbreColis"
                        value={enterRSP.nbreColis}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        className={!enterRSP.nbreColis || enterRSP.nbreColis <= 0 ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="nbreEtiquette">Nbre Etiquette</label>
                    <InputNumber
                        id="nbreEtiquette"
                        name="nbreEtiquette"
                        value={enterRSP.nbreEtiquette}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                    />
                </div>

                <div className="field col-12 md:col-3">
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
                
                <div className="field col-12 md:col-3">
                    <label htmlFor="poidsExonere">Poids Exonéré</label>
                    <InputNumber
                        id="poidsExonere"
                        name="poidsExonere"
                        value={enterRSP.poidsExonere}
                        onValueChange={handleNumberChange}
                        locale="fr-FR"
                        mode='decimal'
                        min={0}
                        step={0.001}
                        minFractionDigits={0}
                        maxFractionDigits={3}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="poids">Poids *</label>
                    <InputNumber
                        id="poids"
                        name="poids"
                        value={enterRSP.poids}
                        onValueChange={handleNumberChange}
                        onBlur={handleBlurEvent}
                        locale="fr-FR"
                        placeholder="Poids en tonnes"
                        mode='decimal'
                        min={0}
                        step={0.001}
                        minFractionDigits={0}
                        maxFractionDigits={3}
                        className={!enterRSP.poids || enterRSP.poids <= 0 ? 'p-invalid' : ''}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="surtaxeClt">Tarif Surt. Colis (FBU)</label>
                    <InputNumber
                        id="surtaxeClt"
                        name="surtaxeClt"
                        value={enterRSP.surtaxeClt}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="fraisSlt">Frais (FBU)</label>
                    <InputNumber
                        id="fraisSlt"
                        name="fraisSlt"
                        value={enterRSP.fraisSlt}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                         inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="taxe">Taxe</label>
                    <InputNumber
                        id="taxe"
                        name="taxe"
                        value={enterRSP.taxe}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                         inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="montantCamion" >Montant Camion (FBU)</label>
                    <InputNumber
                        id="montantCamion"
                        name="montantCamion"
                        value={enterRSP.montantCamion}
                        onValueChange={handleNumberChange}
                        min={0}
                        readOnly
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="montantBarge" >Montant Barge (FBU)</label>
                    <InputNumber
                        id="montantBarge"
                        name="montantBarge"
                        value={enterRSP.montantBarge}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        readOnly
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="tarifCamion" >Tarif Camion (FBU)</label>
                    <InputNumber
                        id="tarifCamion"
                        name="tarifCamion"
                        value={enterRSP.tarifCamion}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="tarifBarge" >Tarif Barge (FBU)</label>
                    <InputNumber
                        id="tarifBarge"
                        name="tarifBarge"
                        value={enterRSP.tarifBarge}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="surtaxeCrsp">Surtaxe Colis</label>
                    <InputNumber
                        id="surtaxeCrsp"
                        name="surtaxeCrsp"
                        value={enterRSP.surtaxeCrsp}
                        onValueChange={handleNumberChange}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="surtaxePrsp">Surtaxe Poids</label>
                    <InputNumber
                        id="surtaxePrsp"
                        name="surtaxePrsp"
                        value={enterRSP.surtaxePrsp}
                        onValueChange={handleNumberChange}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="faireSuivre">Laisser suivre</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="faireSuivre"
                            name="faireSuivre"
                            checked={enterRSP.faireSuivre}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>
                <div className="field col-12 md:col-3">
                    <label htmlFor="transit">Marchandise Transit</label>
                    <div className="mt-2">
                        <Checkbox
                            inputId="transit"
                            name="transit"
                            checked={enterRSP.transit}
                            onChange={handleCheckboxChange}
                        />
                    </div>
                </div>
                
                {enterRSP.faireSuivre && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="montantFaireSuivre" >Montant Laisser suivre</label>
                        <InputNumber
                            id="montantFaireSuivre"
                            name="montantFaireSuivre"
                            value={enterRSP.montantFaireSuivre}
                            onValueChange={handleNumberChange}
                            locale="fr-FR"
                            inputStyle={greenFieldStyle}
                        />
                    </div>
                )}
                <div className="field col-12 md:col-3">
                    <label htmlFor="fraisArrimage" >Montant Arr.</label>
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
                        inputStyle={greenFieldStyle}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="montantPeseMagasin" >Montant Arr.</label>
                    <InputNumber
                        id="montantPeseMagasin"
                        name="montantPeseMagasin"
                        value={enterRSP.montantPeseMagasin}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                        inputStyle={greenFieldStyle}
                    />
                </div>
                {enterRSP.salissage && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="fraisSrsp" >Mont. Salissage (FBU)</label>
                        <InputNumber
                            id="fraisSrsp"
                            name="fraisSrsp"
                            value={enterRSP.fraisSrsp}
                            onValueChange={handleNumberChange}
                            min={0}
                            locale="fr-FR"
                            inputStyle={greenFieldStyle}
                        />
                    </div>
                )}

                <div className="field col-12 md:col-3">
                    <label htmlFor="montant" style={blueFieldStyle}>Montant Manut.</label>
                    <InputNumber
                        id="montant"
                        name="montant"
                        value={enterRSP.montant}
                        onValueChange={handleNumberChange}
                        locale="fr-FR"
                        readOnly
                        inputStyle={blueFieldStyle}
                    />
                </div>
            </div>
        </div>
    );

    // Step 4: Observations
    const renderStep4 = () => (
        <div className="card">
            <h4 className="text-center mb-4">Observations & Constatations</h4>
            <div className="p-fluid formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="observation">Nbre de Collis intacts</label>
                    <InputText
                        id="observation"
                        name="observation"
                        value={enterRSP.observation}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="colisManquants">Nbre de colis Manquants</label>
                    <InputText
                        id="colisManquants"
                        name="colisManquants"
                        value={enterRSP.colisManquants}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="colisAvaries">Nbre de colis Avariés</label>
                    <InputText
                        id="colisAvaries"
                        name="colisAvaries"
                        value={enterRSP.colisAvaries}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="constatation">Poids Constaté</label>
                    <InputText
                        id="constatation"
                        name="constatation"
                        value={enterRSP.constatation}
                        onChange={handleChange}
                    />
                </div>

                {/* <div className="field col-12 md:col-4">
                    <label htmlFor="fraisArrimage">Montant Arrimage</label>
                    <InputNumber
                        id="fraisArrimage"
                        name="fraisArrimage"
                        value={enterRSP.fraisArrimage}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                    />
                </div> */}

                <div className="field col-12 md:col-4">
                    <label htmlFor="surtaxePrspTaux">% Surtaxe</label>
                    <InputNumber
                        id="surtaxePrspTaux"
                        name="surtaxePrspTaux"
                        value={enterRSP.surtaxePrspTaux}
                        onValueChange={handleNumberChange}
                        min={0}
                        locale="fr-FR"
                    />
                </div>
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        switch (activeIndex) {
            case 0:
                return renderStep1();
            case 1:
                return renderStep2();
            case 2:
                return renderStep3();
            case 3:
                return renderStep4();
            default:
                return renderStep1();
        }
    };

    return (
        <div className="wizard-form">
            <div className="card">
                {renderStepsHeader()}

                <div className="step-content mb-4">
                    {renderCurrentStep()}
                </div>

                <div className="flex justify-content-between">
                    <div>
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            outlined
                            onClick={handleReset}
                        />
                    </div>

                    <div className="flex gap-2">
                        {activeIndex > 0 && (
                            <Button
                                label="Précédent"
                                icon="pi pi-chevron-left"
                                severity="secondary"
                                outlined
                                onClick={prevStep}
                            />
                        )}

                        {activeIndex < steps.length - 1 ? (
                            <Button
                                label="Suivant"
                                icon="pi pi-chevron-right"
                                iconPos="right"
                                onClick={nextStep}
                            />
                        ) : (
                            <Button
                                label={isEditMode ? "Modifier" : "Enregistrer"}
                                icon="pi pi-check"
                                severity="success"
                                loading={btnLoading}
                                onClick={onSubmit}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterRSPWizardForm;