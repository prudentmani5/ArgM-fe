'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DemandeCredit, FrequencesRemboursement } from '../types/DemandeCredit';

interface DemandeCreditFormProps {
    demande: DemandeCredit;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    clients: any[];
    branches: any[];
    creditOfficers: any[];
    loanProducts: any[];
    statuts: any[];
    objetsCredit: any[];
    onClientChange?: (clientId: number) => void;
    isViewMode?: boolean;
}

export default function DemandeCreditForm({
    demande,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    clients,
    branches,
    creditOfficers,
    loanProducts,
    statuts,
    objetsCredit,
    onClientChange,
    isViewMode = false
}: DemandeCreditFormProps) {

    const clientOptionTemplate = (option: any) => {
        if (!option) return null;
        return (
            <div className="flex align-items-center gap-2">
                <span>{option.firstName} {option.lastName}</span>
                <small className="text-500">({option.clientNumber || option.phone})</small>
            </div>
        );
    };

    const selectedClientTemplate = (option: any, props: any) => {
        if (option) {
            return <span>{option.firstName} {option.lastName}</span>;
        }
        return <span>{props.placeholder}</span>;
    };

    return (
        <div>
            {/* Section: Enregistrement Initial */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3">
                    <i className="pi pi-folder mr-2"></i>
                    Enregistrement de la Demande
                </h5>

                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="applicationNumber" className="font-semibold">
                            Numéro de Dossier
                        </label>
                        <InputText
                            id="applicationNumber"
                            name="applicationNumber"
                            value={demande.applicationNumber || ''}
                            onChange={handleChange}
                            className="w-full"
                            disabled={true}
                            placeholder="Auto-généré"
                        />
                        <small className="text-500">Généré automatiquement</small>
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="applicationDate" className="font-semibold">
                            Date de Dépôt *
                        </label>
                        <Calendar
                            id="applicationDate"
                            value={demande.applicationDate ? new Date(demande.applicationDate) : null}
                            onChange={(e) => handleDateChange('applicationDate', e.value as Date)}
                            className="w-full"
                            disabled={isViewMode}
                            dateFormat="dd/mm/yy"
                            showIcon
                            showButtonBar
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="branchId" className="font-semibold">
                            Agence de Traitement *
                        </label>
                        <Dropdown
                            id="branchId"
                            value={demande.branchId}
                            options={branches}
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner une agence"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-3">
                        <label htmlFor="statusId" className="font-semibold">
                            Statut du Dossier
                        </label>
                        <Dropdown
                            id="statusId"
                            value={demande.statusId}
                            options={statuts}
                            onChange={(e) => handleDropdownChange('statusId', e.value)}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Statut"
                            className="w-full"
                            disabled={isViewMode || !demande.id}
                        />
                    </div>
                </div>
            </div>

            {/* Section: Client */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3">
                    <i className="pi pi-user mr-2"></i>
                    Client Demandeur
                </h5>

                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-semibold">
                            Client *
                        </label>
                        <Dropdown
                            id="clientId"
                            value={demande.clientId}
                            options={clients}
                            onChange={(e) => {
                                handleDropdownChange('clientId', e.value);
                                if (onClientChange) onClientChange(e.value);
                            }}
                            optionLabel="firstName"
                            optionValue="id"
                            placeholder="Rechercher un client (ID, nom, téléphone)"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                            filterPlaceholder="Rechercher..."
                            itemTemplate={clientOptionTemplate}
                            valueTemplate={selectedClientTemplate}
                            showClear
                        />
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="creditOfficerId" className="font-semibold">
                            Agent de Crédit *
                        </label>
                        <Dropdown
                            id="creditOfficerId"
                            value={demande.creditOfficerId}
                            options={creditOfficers}
                            onChange={(e) => handleDropdownChange('creditOfficerId', e.value)}
                            optionLabel="fullName"
                            optionValue="id"
                            placeholder="Sélectionner un agent"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                        />
                    </div>
                </div>
            </div>

            {/* Section: Produit et Montant */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3">
                    <i className="pi pi-money-bill mr-2"></i>
                    Détails du Crédit Sollicité
                </h5>

                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="loanProductId" className="font-semibold">
                            Produit de Crédit *
                        </label>
                        <Dropdown
                            id="loanProductId"
                            value={demande.loanProductId}
                            options={loanProducts}
                            onChange={(e) => handleDropdownChange('loanProductId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner un produit"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="amountRequested" className="font-semibold">
                            Montant Demandé (BIF) *
                        </label>
                        <InputNumber
                            id="amountRequested"
                            value={demande.amountRequested || 0}
                            onValueChange={(e) => handleNumberChange('amountRequested', e.value ?? 0)}
                            className="w-full"
                            disabled={isViewMode}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                        />
                    </div>

                    <div className="field col-12 md:col-2">
                        <label htmlFor="durationMonths" className="font-semibold">
                            Durée (mois) *
                        </label>
                        <InputNumber
                            id="durationMonths"
                            value={demande.durationMonths || 12}
                            onValueChange={(e) => handleNumberChange('durationMonths', e.value ?? 12)}
                            className="w-full"
                            disabled={isViewMode}
                            min={1}
                            max={120}
                            showButtons
                            suffix=" mois"
                        />
                    </div>

                    <div className="field col-12 md:col-2">
                        <label htmlFor="repaymentFrequency" className="font-semibold">
                            Fréquence *
                        </label>
                        <Dropdown
                            id="repaymentFrequency"
                            value={demande.repaymentFrequency}
                            options={FrequencesRemboursement}
                            onChange={(e) => handleDropdownChange('repaymentFrequency', e.value)}
                            optionLabel="label"
                            optionValue="code"
                            placeholder="Fréquence"
                            className="w-full"
                            disabled={isViewMode}
                        />
                    </div>
                </div>
            </div>

            {/* Section: Objet du Crédit */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3">
                    <i className="pi pi-briefcase mr-2"></i>
                    Objet du Crédit
                </h5>

                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="creditPurposeId" className="font-semibold">
                            Catégorie Principale *
                        </label>
                        <Dropdown
                            id="creditPurposeId"
                            value={demande.creditPurposeId}
                            options={objetsCredit}
                            onChange={(e) => handleDropdownChange('creditPurposeId', e.value)}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Sélectionner l'objet"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                        />
                    </div>

                    <div className="field col-12 md:col-8">
                        <label htmlFor="purposeDescription" className="font-semibold">
                            Description Détaillée de l'Utilisation
                        </label>
                        <InputTextarea
                            id="purposeDescription"
                            name="purposeDescription"
                            value={demande.purposeDescription || ''}
                            onChange={handleChange}
                            className="w-full"
                            rows={3}
                            disabled={isViewMode}
                            placeholder="Décrivez en détail comment le client compte utiliser les fonds..."
                        />
                    </div>

                    <div className="field col-12">
                        <label htmlFor="repaymentPlanClient" className="font-semibold">
                            Plan de Remboursement Prévu par le Client
                        </label>
                        <InputTextarea
                            id="repaymentPlanClient"
                            name="repaymentPlanClient"
                            value={demande.repaymentPlanClient || ''}
                            onChange={handleChange}
                            className="w-full"
                            rows={3}
                            disabled={isViewMode}
                            placeholder="Comment le client prévoit-il de rembourser le crédit ? (sources de revenus, périodicité, etc.)"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
