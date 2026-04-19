'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { SavingsAccount } from './SavingsAccount';

interface SavingsAccountFormProps {
    savingsAccount: SavingsAccount;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null | undefined) => void;
    clients: any[];
    branches: any[];
    currencies: any[];
    statuses: any[];
    internalAccounts?: any[];
    termDurations?: any[];
    isViewMode?: boolean;
    branchLocked?: boolean;
    selectedClientType?: string;
}

const accountTypes = [
    { label: 'Épargne Régulière', value: 'REGULAR' },
    { label: 'Dépôt à Terme', value: 'TERM_DEPOSIT' },
    { label: 'Épargne Obligatoire', value: 'COMPULSORY' },
    { label: 'Épargne Bloqué', value: 'BLOCKED' }
];

const SavingsAccountForm: React.FC<SavingsAccountFormProps> = ({
    savingsAccount,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    clients,
    branches,
    currencies,
    statuses,
    internalAccounts = [],
    termDurations = [],
    isViewMode = false,
    branchLocked = false,
    selectedClientType
}) => {
    const isIndividual = selectedClientType === 'INDIVIDUAL' || !selectedClientType;
    const selectedCurrency = currencies.find((c: any) => c.id === savingsAccount.currencyId);
    const currencyCode = selectedCurrency?.code || 'FBU';
    return (
        <div className="card p-fluid">
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-wallet mr-2"></i>
                    Informations du Compte
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="accountNumber" className="font-medium">Numéro de Compte</label>
                        <InputText
                            id="accountNumber"
                            name="accountNumber"
                            value={savingsAccount.accountNumber}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Généré automatiquement"
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="accountType" className="font-medium">Type de Compte *</label>
                        <Dropdown
                            id="accountType"
                            value={savingsAccount.accountType}
                            options={accountTypes}
                            onChange={(e) => handleDropdownChange('accountType', e.value)}
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Sélectionner le type"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="statusId" className="font-medium">Statut</label>
                        <Dropdown
                            id="statusId"
                            value={savingsAccount.statusId}
                            options={statuses}
                            onChange={(e) => handleDropdownChange('statusId', e.value)}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Sélectionner le statut"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Client et Agence
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="clientId" className="font-medium">Client *</label>
                        <Dropdown
                            id="clientId"
                            value={savingsAccount.clientId}
                            options={clients}
                            onChange={(e) => handleDropdownChange('clientId', e.value)}
                            optionLabel="clientNumber"
                            optionValue="id"
                            placeholder="Rechercher un client..."
                            disabled={isViewMode}
                            filter
                            filterBy="clientNumber,firstName,lastName,businessName"
                            filterPlaceholder="Rechercher par nom ou numéro"
                            className="w-full"
                            itemTemplate={(item: any) => {
                                const name = item.businessName
                                    ? item.businessName
                                    : `${item.firstName || ''} ${item.lastName || ''}`.trim();
                                return <span>{name} - {item.clientNumber}</span>;
                            }}
                            valueTemplate={(item: any, props: any) => {
                                if (item) {
                                    const name = item.businessName
                                        ? item.businessName
                                        : `${item.firstName || ''} ${item.lastName || ''}`.trim();
                                    return <span>{name} - {item.clientNumber}</span>;
                                }
                                return <span>{props?.placeholder}</span>;
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="branchId"
                            value={savingsAccount.branchId}
                            options={branches}
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'agence"
                            disabled={isViewMode || branchLocked}
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="currencyId" className="font-medium">Devise *</label>
                        <Dropdown
                            id="currencyId"
                            value={savingsAccount.currencyId}
                            options={currencies}
                            onChange={(e) => handleDropdownChange('currencyId', e.value)}
                            optionLabel="code"
                            optionValue="id"
                            placeholder="Sélectionner la devise"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="internalAccountId" className="font-medium">Compte Interne (suivi)</label>
                        <Dropdown
                            id="internalAccountId"
                            value={savingsAccount.internalAccountId}
                            options={internalAccounts.filter((a: any) => a.actif)}
                            onChange={(e) => handleDropdownChange('internalAccountId', e.value)}
                            optionLabel="_displayLabel"
                            optionValue="accountId"
                            placeholder="Sélectionner le compte interne"
                            disabled={isViewMode}
                            filter
                            filterBy="_displayLabel"
                            className="w-full"
                            itemTemplate={(item: any) => (
                                <span>{item.codeCompte} - {item.libelle} ({item.accountNumber})</span>
                            )}
                            valueTemplate={(item: any, props: any) => {
                                if (item) {
                                    return <span>{item.codeCompte} - {item.libelle}</span>;
                                }
                                return <span>{props?.placeholder}</span>;
                            }}
                        />
                        <small className="text-500">Compte interne pour le suivi des opérations</small>
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="requiredSignatures" className="font-medium">Nbre de Signatures pour Retrait *</label>
                        <InputNumber
                            id="requiredSignatures"
                            value={savingsAccount.requiredSignatures}
                            onValueChange={(e) => handleNumberChange('requiredSignatures', e.value)}
                            min={1}
                            max={10}
                            showButtons
                            disabled={isViewMode || isIndividual}
                            className="w-full"
                        />
                        {isIndividual && (
                            <small className="text-500">Automatiquement 1 pour les clients individuels</small>
                        )}
                        {!isIndividual && selectedClientType && (
                            <small className="text-500">
                                Nombre de signataires requis pour autoriser un retrait
                            </small>
                        )}
                    </div>
                    {selectedClientType && (
                        <div className="field col-12 md:col-4 flex align-items-center">
                            <Tag
                                value={
                                    selectedClientType === 'INDIVIDUAL' ? 'Individuel' :
                                    selectedClientType === 'BUSINESS' ? 'Entreprise' :
                                    selectedClientType === 'JOINT_ACCOUNT' ? 'Compte Conjoint' :
                                    selectedClientType
                                }
                                severity={isIndividual ? 'info' : 'warning'}
                                className="mt-3"
                            />
                        </div>
                    )}
                </div>
            </div>

            {savingsAccount.accountType !== 'TERM_DEPOSIT' && savingsAccount.accountType !== 'BLOCKED' && (
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-dollar mr-2"></i>
                    Soldes et Paramètres
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="currentBalance" className="font-medium">Solde Actuel ({currencyCode})</label>
                        <InputNumber
                            id="currentBalance"
                            value={savingsAccount.currentBalance}
                            onValueChange={(e) => handleNumberChange('currentBalance', e.value)}
                            mode="decimal"
                            suffix={` ${currencyCode}`}
                            min={0}
                            disabled={isViewMode}
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="availableBalance" className="font-medium">Solde Disponible ({currencyCode})</label>
                        <InputNumber
                            id="availableBalance"
                            value={savingsAccount.availableBalance}
                            onValueChange={(e) => handleNumberChange('availableBalance', e.value)}
                            mode="decimal"
                            suffix={` ${currencyCode}`}
                            min={0}
                            disabled
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="blockedAmount" className="font-medium">Montant Bloqué ({currencyCode})</label>
                        <InputNumber
                            id="blockedAmount"
                            value={savingsAccount.blockedAmount}
                            onValueChange={(e) => handleNumberChange('blockedAmount', e.value)}
                            mode="decimal"
                            suffix={` ${currencyCode}`}
                            min={0}
                            disabled={isViewMode}
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="minimumBalance" className="font-medium">Solde Minimum ({currencyCode})</label>
                        <InputNumber
                            id="minimumBalance"
                            value={savingsAccount.minimumBalance}
                            onValueChange={(e) => handleNumberChange('minimumBalance', e.value)}
                            mode="decimal"
                            suffix={` ${currencyCode}`}
                            min={0}
                            disabled={isViewMode}
                            className="w-full"
                            readOnly
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="interestRate" className="font-medium">Taux d'Intérêt (%)</label>
                        <InputNumber
                            id="interestRate"
                            value={savingsAccount.interestRate}
                            onValueChange={(e) => handleNumberChange('interestRate', e.value)}
                            mode="decimal"
                            suffix=" %"
                            min={0}
                            max={100}
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            disabled={isViewMode}
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="accruedInterest" className="font-medium">Intérêts Courus ({currencyCode})</label>
                        <InputNumber
                            id="accruedInterest"
                            value={savingsAccount.accruedInterest}
                            onValueChange={(e) => handleNumberChange('accruedInterest', e.value)}
                            mode="decimal"
                            suffix={` ${currencyCode}`}
                            min={0}
                            disabled
                            className="w-full"
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="openingDate" className="font-medium">Date d'Ouverture *</label>
                        <Calendar
                            id="openingDate"
                            value={savingsAccount.openingDate ? new Date(savingsAccount.openingDate) : null}
                            onChange={(e) => handleDateChange('openingDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                           
                        />
                    </div>
                </div>
            </div>
            )}

            {savingsAccount.accountType === 'TERM_DEPOSIT' && (
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-info-circle mr-2"></i>
                    Restrictions - Dépôt à Terme
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="termDurationId" className="font-medium">Durée du Terme *</label>
                        <Dropdown
                            id="termDurationId"
                            value={savingsAccount.termDurationId}
                            options={termDurations}
                            onChange={(e) => {
                                const td = termDurations.find((t: any) => t.id === e.value);
                                handleDropdownChange('termDurationId', e.value);
                                if (td) {
                                    handleNumberChange('interestRate', td.interestRate);
                                    // Calculate maturity date if start date exists
                                    if (savingsAccount.termStartDate) {
                                        const startDate = new Date(savingsAccount.termStartDate);
                                        startDate.setMonth(startDate.getMonth() + td.months);
                                        handleDateChange('maturityDate', startDate);
                                    }
                                }
                            }}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Sélectionner la durée"
                            disabled={isViewMode}
                            className="w-full"
                            itemTemplate={(item: any) => (
                                <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>
                            )}
                            valueTemplate={(item: any, props: any) => {
                                if (item) {
                                    return <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>;
                                }
                                return <span>{props?.placeholder}</span>;
                            }}
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="interestRate" className="font-medium">Taux d'Intérêt (%)</label>
                        <InputNumber
                            id="interestRate"
                            value={savingsAccount.interestRate}
                            onValueChange={(e) => handleNumberChange('interestRate', e.value)}
                            mode="decimal"
                            suffix=" %"
                            min={0}
                            max={100}
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            disabled={isViewMode || !!savingsAccount.termDurationId}
                            className="w-full"
                        />
                        {savingsAccount.termDurationId && (
                            <small className="text-500">Taux défini par la durée sélectionnée</small>
                        )}
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="openingDate" className="font-medium">Date d'Ouverture *</label>
                        <Calendar
                            id="openingDate"
                            value={savingsAccount.openingDate ? new Date(savingsAccount.openingDate) : null}
                            onChange={(e) => handleDateChange('openingDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="termStartDate" className="font-medium">Date de Début du Terme *</label>
                        <Calendar
                            id="termStartDate"
                            value={savingsAccount.termStartDate ? new Date(savingsAccount.termStartDate) : null}
                            onChange={(e) => {
                                const date = e.value as Date | null;
                                handleDateChange('termStartDate', date);
                                // Calculate maturity date
                                const td = termDurations.find((t: any) => t.id === savingsAccount.termDurationId);
                                if (date && td) {
                                    const maturity = new Date(date);
                                    maturity.setMonth(maturity.getMonth() + td.months);
                                    handleDateChange('maturityDate', maturity);
                                }
                            }}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="maturityDate" className="font-medium">Date d'Échéance</label>
                        <Calendar
                            id="maturityDate"
                            value={savingsAccount.maturityDate ? new Date(savingsAccount.maturityDate) : null}
                            dateFormat="dd/mm/yy"
                            disabled
                            showIcon
                            className="w-full"
                        />
                        <small className="text-500">Calculée automatiquement</small>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Tag value="Virement autorisé" severity="success" icon="pi pi-check" />
                    <Tag value="Dépôt interdit" severity="danger" icon="pi pi-times" />
                    <Tag value="Retrait interdit" severity="danger" icon="pi pi-times" />
                    <Tag value="Demande crédit interdite" severity="danger" icon="pi pi-times" />
                    <Tag value="Remboursement interdit" severity="danger" icon="pi pi-times" />
                </div>
            </div>
            )}

            {savingsAccount.accountType === 'BLOCKED' && (
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-lock mr-2"></i>
                    Restrictions - Épargne Bloqué
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="termDurationId" className="font-medium">Durée du Blocage</label>
                        <Dropdown
                            id="termDurationId"
                            value={savingsAccount.termDurationId}
                            options={termDurations}
                            onChange={(e) => {
                                const td = termDurations.find((t: any) => t.id === e.value);
                                handleDropdownChange('termDurationId', e.value);
                                if (td) {
                                    handleNumberChange('interestRate', td.interestRate);
                                    if (savingsAccount.termStartDate) {
                                        const startDate = new Date(savingsAccount.termStartDate);
                                        startDate.setMonth(startDate.getMonth() + td.months);
                                        handleDateChange('maturityDate', startDate);
                                    }
                                }
                            }}
                            optionLabel="nameFr"
                            optionValue="id"
                            placeholder="Sélectionner la durée"
                            disabled={isViewMode}
                            className="w-full"
                            itemTemplate={(item: any) => (
                                <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>
                            )}
                            valueTemplate={(item: any, props: any) => {
                                if (item) {
                                    return <span>{item.nameFr} ({item.months} mois) - {item.interestRate?.toFixed(2)}%</span>;
                                }
                                return <span>{props?.placeholder}</span>;
                            }}
                            readOnly
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="interestRate" className="font-medium">Taux d'Intérêt (%)</label>
                        <InputNumber
                            id="interestRate"
                            value={savingsAccount.interestRate}
                            onValueChange={(e) => handleNumberChange('interestRate', e.value)}
                            mode="decimal"
                            suffix=" %"
                            min={0}
                            max={100}
                            minFractionDigits={2}
                            maxFractionDigits={2}
                            disabled={isViewMode || !!savingsAccount.termDurationId}
                            className="w-full"
                            readOnly
                        />
                        {savingsAccount.termDurationId && (
                            <small className="text-500">Taux défini par la durée sélectionnée</small>
                        )}
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="openingDate" className="font-medium">Date d'Ouverture *</label>
                        <Calendar
                            id="openingDate"
                            value={savingsAccount.openingDate ? new Date(savingsAccount.openingDate) : null}
                            onChange={(e) => handleDateChange('openingDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                            readOnlyInput
                        />
                    </div>
                </div>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="termStartDate" className="font-medium">Date de Début du Blocage *</label>
                        <Calendar
                            id="termStartDate"
                            value={savingsAccount.termStartDate ? new Date(savingsAccount.termStartDate) : null}
                            onChange={(e) => {
                                const date = e.value as Date | null;
                                handleDateChange('termStartDate', date);
                                const td = termDurations.find((t: any) => t.id === savingsAccount.termDurationId);
                                if (date && td) {
                                    const maturity = new Date(date);
                                    maturity.setMonth(maturity.getMonth() + td.months);
                                    handleDateChange('maturityDate', maturity);
                                }
                            }}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                            readOnlyInput
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="maturityDate" className="font-medium">Date de Déblocage</label>
                        <Calendar
                            id="maturityDate"
                            value={savingsAccount.maturityDate ? new Date(savingsAccount.maturityDate) : null}
                            dateFormat="dd/mm/yy"
                            disabled
                            showIcon
                            className="w-full"
                            readOnlyInput
                        />
                        <small className="text-500">Calculée automatiquement</small>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    <Tag value="Virement autorisé" severity="success" icon="pi pi-check" />
                    <Tag value="Dépôt interdit" severity="danger" icon="pi pi-times" />
                    <Tag value="Retrait interdit" severity="danger" icon="pi pi-times" />
                    <Tag value="Demande crédit interdite" severity="danger" icon="pi pi-times" />
                    <Tag value="Remboursement interdit" severity="danger" icon="pi pi-times" />
                </div>
            </div>
            )}

            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file mr-2"></i>
                    Notes
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12">
                        <InputTextarea
                            id="notes"
                            name="notes"
                            value={savingsAccount.notes || ''}
                            onChange={handleChange}
                            rows={3}
                            disabled={isViewMode}
                            placeholder="Notes additionnelles..."
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SavingsAccountForm;
