'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { Card } from 'primereact/card';
import { TermDeposit, TermDepositStatusEnum } from './TermDeposit';

interface TermDepositFormProps {
    termDeposit: TermDeposit;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    clients: any[];
    branches: any[];
    savingsAccounts: any[];
    termDurations: any[];
    maturityInstructions: any[];
    currencies: any[];
    onClientChange?: (clientId: number) => void;
    onTermDurationChange?: (termDuration: any) => void;
    isViewMode?: boolean;
}

const TermDepositForm: React.FC<TermDepositFormProps> = ({
    termDeposit,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    clients,
    branches,
    savingsAccounts,
    termDurations,
    maturityInstructions,
    currencies,
    onClientChange,
    onTermDurationChange,
    isViewMode = false
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const formatPercent = (value: number) => {
        return value.toFixed(2) + ' %';
    };

    const calculateMaturityAmount = () => {
        if (!termDeposit.principalAmount || !termDeposit.interestRate || !termDeposit.termDuration) {
            return 0;
        }
        const months = termDeposit.termDuration?.durationMonths || 0;
        const interest = termDeposit.principalAmount * (termDeposit.interestRate / 100) * (months / 12);
        return termDeposit.principalAmount + interest;
    };

    const getStatusInfo = () => {
        const status = termDeposit.status;
        if (!status) return { label: 'Nouveau', severity: 'info' as const };

        const statusMap: { [key: string]: { label: string; severity: 'success' | 'info' | 'warning' | 'danger' } } = {
            PENDING: { label: 'En attente', severity: 'warning' },
            ACTIVE: { label: 'Actif', severity: 'success' },
            MATURED: { label: 'Échu', severity: 'info' },
            RENEWED: { label: 'Renouvelé', severity: 'info' },
            EARLY_WITHDRAWN: { label: 'Retiré anticipé', severity: 'warning' },
            CLOSED: { label: 'Clôturé', severity: 'danger' }
        };

        return statusMap[status.code] || { label: status.name, severity: 'info' as const };
    };

    return (
        <div className="card p-fluid">
            {/* Grille des taux */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-chart-line mr-2"></i>
                    Grille des Taux (DAT)
                </h5>
                <div className="grid">
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round">
                            <div className="text-2xl font-bold text-green-600">5%</div>
                            <div className="text-500 text-sm">3 mois</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round">
                            <div className="text-2xl font-bold text-green-600">6%</div>
                            <div className="text-500 text-sm">6 mois</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round">
                            <div className="text-2xl font-bold text-green-600">7%</div>
                            <div className="text-500 text-sm">12 mois</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round">
                            <div className="text-2xl font-bold text-green-600">7.5%</div>
                            <div className="text-500 text-sm">24 mois</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round">
                            <div className="text-2xl font-bold text-green-600">8%</div>
                            <div className="text-500 text-sm">36 mois</div>
                        </div>
                    </div>
                    <div className="col-6 md:col-2 text-center">
                        <div className="surface-0 p-2 border-round border-left-2 border-orange-500">
                            <div className="text-lg font-bold text-orange-600">Min: 50 000</div>
                            <div className="text-500 text-sm">FBU</div>
                        </div>
                    </div>
                </div>
            </div>

            {isViewMode && termDeposit.status && (
                <div className="surface-100 p-3 border-round mb-4 flex align-items-center justify-content-between">
                    <div>
                        <span className="font-medium mr-2">Statut:</span>
                        <Tag value={getStatusInfo().label} severity={getStatusInfo().severity} />
                    </div>
                    <div>
                        <span className="font-medium mr-2">N° Dépôt:</span>
                        <span className="font-bold">{termDeposit.depositNumber}</span>
                    </div>
                </div>
            )}

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Client et Compte
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-medium">Client *</label>
                        <Dropdown
                            id="clientId"
                            value={termDeposit.clientId}
                            options={clients}
                            onChange={(e) => {
                                handleDropdownChange('clientId', e.value);
                                if (onClientChange) onClientChange(e.value);
                            }}
                            optionLabel={(item) => `${item.firstName} ${item.lastName} - ${item.clientNumber}`}
                            optionValue="id"
                            placeholder="Rechercher un client..."
                            disabled={isViewMode}
                            filter
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="branchId"
                            value={termDeposit.branchId}
                            options={branches}
                            onChange={(e) => handleDropdownChange('branchId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'agence"
                            disabled={isViewMode}
                            filter
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-clock mr-2"></i>
                    Paramètres du Dépôt
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="termDurationId" className="font-medium">Durée *</label>
                        <Dropdown
                            id="termDurationId"
                            value={termDeposit.termDurationId}
                            options={termDurations}
                            onChange={(e) => {
                                handleDropdownChange('termDurationId', e.value);
                                const duration = termDurations.find(d => d.id === e.value);
                                if (duration && onTermDurationChange) onTermDurationChange(duration);
                            }}
                            optionLabel={(item) => `${item.name} - ${item.interestRate}% annuel`}
                            optionValue="id"
                            placeholder="Sélectionner la durée"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="principalAmount" className="font-medium">Montant du Dépôt (FBU) *</label>
                        <InputNumber
                            id="principalAmount"
                            value={termDeposit.principalAmount}
                            onValueChange={(e) => handleNumberChange('principalAmount', e.value)}
                            mode="decimal"
                            suffix=" FBU"
                            min={50000}
                            disabled={isViewMode}
                            className="w-full"
                        />
                        <small className="text-500">Minimum: 50 000 FBU</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="interestRate" className="font-medium">Taux d'Intérêt Annuel</label>
                        <InputNumber
                            id="interestRate"
                            value={termDeposit.interestRate}
                            onValueChange={(e) => handleNumberChange('interestRate', e.value)}
                            mode="decimal"
                            minFractionDigits={2}
                            suffix=" %"
                            disabled
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="startDate" className="font-medium">Date de Début *</label>
                        <Calendar
                            id="startDate"
                            value={termDeposit.startDate ? new Date(termDeposit.startDate) : null}
                            onChange={(e) => handleDateChange('startDate', e.value as Date | null)}
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
                            value={termDeposit.maturityDate ? new Date(termDeposit.maturityDate) : null}
                            dateFormat="dd/mm/yy"
                            disabled
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-calendar-plus mr-2"></i>
                    Instructions à l'Échéance
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="maturityInstructionId" className="font-medium">Instruction</label>
                        <Dropdown
                            id="maturityInstructionId"
                            value={termDeposit.maturityInstructionId}
                            options={maturityInstructions}
                            onChange={(e) => handleDropdownChange('maturityInstructionId', e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Sélectionner l'instruction"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="savingsAccountId" className="font-medium">Compte de Transfert</label>
                        <Dropdown
                            id="savingsAccountId"
                            value={termDeposit.savingsAccountId}
                            options={savingsAccounts}
                            onChange={(e) => handleDropdownChange('savingsAccountId', e.value)}
                            optionLabel="accountNumber"
                            optionValue="id"
                            placeholder="Compte pour virement des intérêts"
                            disabled={isViewMode || !termDeposit.clientId}
                            filter
                            className="w-full"
                        />
                        <small className="text-500">Pour le virement des intérêts ou du capital</small>
                    </div>
                </div>
            </div>

            {/* Simulation */}
            <div className="surface-100 p-3 border-round mb-4 border-left-3 border-green-500">
                <h5 className="m-0 mb-3 text-green-600">
                    <i className="pi pi-calculator mr-2"></i>
                    Simulation
                </h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="text-center">
                            <div className="text-500 mb-1">Capital</div>
                            <div className="text-xl font-bold">{formatCurrency(termDeposit.principalAmount || 0)}</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-center">
                            <div className="text-500 mb-1">Intérêts Estimés</div>
                            <div className="text-xl font-bold text-green-600">
                                {formatCurrency(calculateMaturityAmount() - (termDeposit.principalAmount || 0))}
                            </div>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="text-center">
                            <div className="text-500 mb-1">Total à l'Échéance</div>
                            <div className="text-2xl font-bold text-primary">
                                {formatCurrency(calculateMaturityAmount())}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Certificat (en mode vue) */}
            {isViewMode && termDeposit.certificateNumber && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-file mr-2"></i>
                        Certificat de Dépôt
                    </h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">N° Certificat</label>
                            <p className="m-0 font-bold">{termDeposit.certificateNumber}</p>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">Date d'Émission</label>
                            <p className="m-0">{termDeposit.certificateIssuedDate || '-'}</p>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">Retiré par</label>
                            <p className="m-0">{termDeposit.certificateCollectedBy || 'Non retiré'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Intérêts accumulés (en mode vue) */}
            {isViewMode && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-dollar mr-2"></i>
                        Intérêts
                    </h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <div className="text-center p-3 surface-0 border-round">
                                <div className="text-500 mb-1">Intérêts Courus</div>
                                <div className="text-xl font-bold text-blue-600">
                                    {formatCurrency(termDeposit.accruedInterest || 0)}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="text-center p-3 surface-0 border-round">
                                <div className="text-500 mb-1">Total Intérêts Gagnés</div>
                                <div className="text-xl font-bold text-green-600">
                                    {formatCurrency(termDeposit.totalInterestEarned || 0)}
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-4">
                            <div className="text-center p-3 surface-0 border-round">
                                <div className="text-500 mb-1">Montant Total</div>
                                <div className="text-xl font-bold text-primary">
                                    {formatCurrency(termDeposit.totalAmountAtMaturity || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="surface-100 p-3 border-round">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-comment mr-2"></i>
                    Notes
                </h5>
                <InputTextarea
                    id="notes"
                    name="notes"
                    value={termDeposit.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    disabled={isViewMode}
                    placeholder="Observations ou commentaires..."
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default TermDepositForm;
