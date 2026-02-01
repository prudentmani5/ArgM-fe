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
    savingsAccounts: any[];
    onAccountChange?: (account: any) => void;
    onClientChange?: (clientId: number) => void;
    onProductChange?: (product: any) => void;
    connectedUser?: string;
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
    savingsAccounts,
    onAccountChange,
    onClientChange,
    onProductChange,
    connectedUser,
    isViewMode = false
}: DemandeCreditFormProps) {

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const accountOptionTemplate = (option: any) => {
        if (!option) return null;
        const clientName = option.client ? `${option.client.firstName} ${option.client.lastName}` : '';
        return (
            <div className="flex flex-column">
                <div className="flex align-items-center gap-2">
                    <span className="font-semibold">{option.accountNumber}</span>
                    <span className="text-500">-</span>
                    <span>{clientName}</span>
                </div>
                <small className="text-500">Solde: {formatCurrency(option.currentBalance || 0)}</small>
            </div>
        );
    };

    const selectedAccountTemplate = (option: any, props: any) => {
        if (option) {
            const clientName = option.client ? `${option.client.firstName} ${option.client.lastName}` : '';
            return <span>{option.accountNumber} - {clientName}</span>;
        }
        return <span>{props.placeholder}</span>;
    };

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

    // Get the selected client object
    const selectedClient = clients.find(c => c.id === demande.clientId);

    // Get the selected loan product for validation
    const selectedProduct = loanProducts.find((p: any) => p.id === demande.loanProductId);

    // Validation helpers
    const isAmountValid = () => {
        if (!selectedProduct || !demande.amountRequested) return true;
        return demande.amountRequested >= selectedProduct.minAmount &&
               demande.amountRequested <= selectedProduct.maxAmount;
    };

    const isDurationValid = () => {
        if (!selectedProduct || !demande.durationMonths) return true;
        return demande.durationMonths >= selectedProduct.minTermMonths &&
               demande.durationMonths <= selectedProduct.maxTermMonths;
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
                        <label htmlFor="savingsAccountId" className="font-semibold">
                            Compte d'Épargne *
                        </label>
                        <Dropdown
                            id="savingsAccountId"
                            value={demande.savingsAccountId}
                            options={savingsAccounts}
                            onChange={(e) => {
                                handleDropdownChange('savingsAccountId', e.value);
                                if (onAccountChange) {
                                    if (e.value) {
                                        const selectedAccount = savingsAccounts.find((a: any) => a.id === e.value);
                                        onAccountChange(selectedAccount);
                                    } else {
                                        // Dropdown cleared - notify parent to clear client
                                        onAccountChange(null);
                                    }
                                }
                            }}
                            optionLabel="accountNumber"
                            optionValue="id"
                            placeholder="Sélectionner un compte d'épargne"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                            filterPlaceholder="Rechercher par N° compte..."
                            itemTemplate={accountOptionTemplate}
                            valueTemplate={selectedAccountTemplate}
                            showClear
                        />
                        <small className="text-500">Le client sera automatiquement récupéré depuis le compte</small>
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-semibold">
                            Client (auto-rempli)
                        </label>
                        <InputText
                            id="clientDisplay"
                            value={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName} - ${selectedClient.clientNumber || ''}` : ''}
                            className="w-full"
                            disabled={true}
                            placeholder="Sélectionnez d'abord un compte..."
                        />
                        {demande.savingsAccountId && (
                            <small className="text-500">
                                <i className="pi pi-info-circle mr-1"></i>
                                Client récupéré automatiquement du compte
                            </small>
                        )}
                    </div>

                    <div className="field col-12 md:col-6">
                        <label htmlFor="userAction" className="font-semibold">
                            Utilisateur Connecté (Agent)
                        </label>
                        <InputText
                            id="userAction"
                            value={connectedUser || ''}
                            className="w-full"
                            disabled={true}
                            placeholder="Utilisateur connecté..."
                        />
                        <small className="text-500">
                            <i className="pi pi-user mr-1"></i>
                            Récupéré automatiquement de la session
                        </small>
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
                            onChange={(e) => {
                                handleDropdownChange('loanProductId', e.value);
                                if (onProductChange) {
                                    const product = loanProducts.find((p: any) => p.id === e.value);
                                    onProductChange(product || null);
                                }
                            }}
                            optionLabel="productNameFr"
                            optionValue="id"
                            placeholder="Sélectionner un produit"
                            className="w-full"
                            disabled={isViewMode}
                            filter
                        />
                        {selectedProduct && (
                            <small className="text-500 block mt-1">
                                <i className="pi pi-info-circle mr-1"></i>
                                {selectedProduct.productName || selectedProduct.productNameFr}
                            </small>
                        )}
                    </div>

                    <div className="field col-12 md:col-4">
                        <label htmlFor="amountRequested" className="font-semibold">
                            Montant Demandé (BIF) *
                        </label>
                        <InputNumber
                            id="amountRequested"
                            value={demande.amountRequested || 0}
                            onValueChange={(e) => {
                                let newValue = e.value ?? 0;
                                // Enforce strict limits if product is selected
                                if (selectedProduct) {
                                    if (newValue < selectedProduct.minAmount) {
                                        newValue = selectedProduct.minAmount;
                                    }
                                    if (newValue > selectedProduct.maxAmount) {
                                        newValue = selectedProduct.maxAmount;
                                    }
                                }
                                handleNumberChange('amountRequested', newValue);
                            }}
                            className={`w-full ${selectedProduct && !isAmountValid() ? 'p-invalid' : ''}`}
                            disabled={isViewMode || !demande.loanProductId}
                            mode="currency"
                            currency="BIF"
                            locale="fr-FR"
                            minFractionDigits={0}
                            maxFractionDigits={0}
                            min={selectedProduct?.minAmount || 0}
                            max={selectedProduct?.maxAmount || undefined}
                        />
                        {!demande.loanProductId && (
                            <small className="text-orange-500 block mt-1">
                                <i className="pi pi-exclamation-circle mr-1"></i>
                                Selectionnez d'abord un produit
                            </small>
                        )}
                        {selectedProduct && (
                            <small className={`block mt-1 ${!isAmountValid() ? 'text-red-500' : 'text-green-600'}`}>
                                <i className={`pi ${!isAmountValid() ? 'pi-exclamation-triangle' : 'pi-check-circle'} mr-1`}></i>
                                Min: {formatCurrency(selectedProduct.minAmount)} | Max: {formatCurrency(selectedProduct.maxAmount)}
                            </small>
                        )}
                    </div>

                    <div className="field col-12 md:col-2">
                        <label htmlFor="durationMonths" className="font-semibold">
                            Durée (mois) *
                        </label>
                        <InputNumber
                            id="durationMonths"
                            value={demande.durationMonths || 12}
                            onValueChange={(e) => {
                                let newValue = e.value ?? 12;
                                // Enforce strict limits if product is selected
                                if (selectedProduct) {
                                    if (newValue < selectedProduct.minTermMonths) {
                                        newValue = selectedProduct.minTermMonths;
                                    }
                                    if (newValue > selectedProduct.maxTermMonths) {
                                        newValue = selectedProduct.maxTermMonths;
                                    }
                                }
                                handleNumberChange('durationMonths', newValue);
                            }}
                            className={`w-full ${selectedProduct && !isDurationValid() ? 'p-invalid' : ''}`}
                            disabled={isViewMode || !demande.loanProductId}
                            min={selectedProduct?.minTermMonths || 1}
                            max={selectedProduct?.maxTermMonths || 120}
                            showButtons
                            suffix=" mois"
                        />
                        {!demande.loanProductId && (
                            <small className="text-orange-500 block mt-1">
                                <i className="pi pi-exclamation-circle mr-1"></i>
                                Selectionnez un produit
                            </small>
                        )}
                        {selectedProduct && (
                            <small className={`block mt-1 ${!isDurationValid() ? 'text-red-500' : 'text-green-600'}`}>
                                <i className={`pi ${!isDurationValid() ? 'pi-exclamation-triangle' : 'pi-check-circle'} mr-1`}></i>
                                {selectedProduct.minTermMonths} - {selectedProduct.maxTermMonths} mois
                            </small>
                        )}
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
