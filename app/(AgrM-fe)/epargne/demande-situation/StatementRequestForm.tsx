'use client';
import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { StatementRequest, StatementRequestType } from './StatementRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

interface StatementRequestFormProps {
    request: StatementRequest;
    setRequest: (request: StatementRequest) => void;
    branches: any[];
    savingsAccounts: any[];
    comptesComptables: any[];
    onSavingsAccountChange?: (accountId: number) => void;
    isViewMode?: boolean;
    fixedRequestType?: 'SITUATION' | 'HISTORIQUE';
}

const requestTypeOptions = [
    { label: 'Situation de compte', value: StatementRequestType.SITUATION },
    { label: 'Historique des opérations', value: StatementRequestType.HISTORIQUE }
];

const StatementRequestForm: React.FC<StatementRequestFormProps> = ({
    request,
    setRequest,
    branches,
    savingsAccounts,
    comptesComptables,
    onSavingsAccountChange,
    isViewMode = false,
    fixedRequestType
}) => {

    // Parse "YYYY-MM-DD" as local date (not UTC)
    const parseLocalDate = (dateStr: string): Date => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };

    // Format a Date to "YYYY-MM-DD" using local values
    const formatLocalDateStr = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatCurrency = (value: number | undefined) => {
        if (value === undefined || value === null) return '0 FBU';
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const selectedAccount = savingsAccounts.find(acc => acc.id === request.savingsAccountId);

    const accountOptionTemplate = (option: any) => {
        if (!option) return '';
        const clientName = option.client
            ? getClientDisplayName(option.client)
            : '';
        const balance = option.currentBalance != null ? formatCurrency(option.currentBalance) : '';
        return (
            <div className="flex align-items-center justify-content-between w-full">
                <span>{option.accountNumber} - {clientName}</span>
                <span className="text-green-600 font-bold ml-2">{balance}</span>
            </div>
        );
    };

    const compteOptionTemplate = (option: any) => {
        if (!option) return '';
        return (
            <div>
                <span className="font-bold">{option.codeCompte}</span> - {option.libelle}
            </div>
        );
    };

    return (
        <div>
            {/* Section 1: Compte et Client */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-user mr-2 text-blue-500"></i>
                    Compte et Client
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="branchId" className="font-medium">Agence *</label>
                            <Dropdown
                                id="branchId"
                                value={request.branchId}
                                options={branches}
                                onChange={(e) => setRequest({ ...request, branchId: e.value })}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Sélectionner l'agence"
                                className="w-full"
                                filter
                                disabled={isViewMode}
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="savingsAccountId" className="font-medium">Compte d'Épargne *</label>
                            <Dropdown
                                id="savingsAccountId"
                                value={request.savingsAccountId}
                                options={savingsAccounts}
                                onChange={(e) => {
                                    setRequest({ ...request, savingsAccountId: e.value });
                                    if (onSavingsAccountChange) onSavingsAccountChange(e.value);
                                }}
                                optionLabel="accountNumber"
                                optionValue="id"
                                placeholder="Sélectionner le compte"
                                className="w-full"
                                filter
                                disabled={isViewMode}
                                itemTemplate={accountOptionTemplate}
                            />
                        </div>
                    </div>
                </div>
                {selectedAccount && (
                    <div className="surface-0 p-2 border-round border-1 border-blue-200">
                        <div className="grid">
                            <div className="col-12 md:col-4">
                                <small className="text-500">Client:</small>
                                <div className="font-bold">
                                    {selectedAccount.client
                                        ? getClientDisplayName(selectedAccount.client)
                                        : '-'}
                                </div>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-500">N° Compte:</small>
                                <div className="font-bold">{selectedAccount.accountNumber || '-'}</div>
                            </div>
                            <div className="col-12 md:col-4">
                                <small className="text-500">Solde actuel:</small>
                                <div className="font-bold text-green-600">{formatCurrency(selectedAccount.currentBalance)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 2: Période (HISTORIQUE only) */}
            {(fixedRequestType === 'HISTORIQUE' || request.requestType === 'HISTORIQUE') && (
                <div className="surface-100 p-3 border-round mb-3">
                    <h6 className="mt-0 mb-3">
                        <i className="pi pi-calendar mr-2 text-indigo-500"></i>
                        Période de l'Historique
                    </h6>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="periodStart" className="font-medium">Date début *</label>
                                <Calendar
                                    id="periodStart"
                                    value={request.periodStart ? parseLocalDate(request.periodStart) : null}
                                    onChange={(e) => {
                                        const date = e.value as Date;
                                        setRequest({ ...request, periodStart: date ? formatLocalDateStr(date) : undefined });
                                    }}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Date de début"
                                    maxDate={request.periodEnd ? parseLocalDate(request.periodEnd) : new Date()}
                                />
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="periodEnd" className="font-medium">Date fin *</label>
                                <Calendar
                                    id="periodEnd"
                                    value={request.periodEnd ? parseLocalDate(request.periodEnd) : null}
                                    onChange={(e) => {
                                        const date = e.value as Date;
                                        setRequest({ ...request, periodEnd: date ? formatLocalDateStr(date) : undefined });
                                    }}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Date de fin"
                                    minDate={request.periodStart ? parseLocalDate(request.periodStart) : undefined}
                                    maxDate={new Date()}
                                />
                            </div>
                        </div>
                    </div>
                    {request.periodStart && request.periodEnd && (
                        <div className="surface-0 p-2 border-round border-1 border-indigo-200 text-center">
                            <small className="text-500">Période sélectionnée: </small>
                            <strong>
                                {parseLocalDate(request.periodStart).toLocaleDateString('fr-FR')} — {parseLocalDate(request.periodEnd).toLocaleDateString('fr-FR')}
                            </strong>
                        </div>
                    )}
                </div>
            )}

            {/* Section 3: Frais */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-file mr-2 text-green-500"></i>
                    {fixedRequestType ? 'Frais' : 'Type de Demande et Frais'}
                </h6>
                <div className="grid">
                    {!fixedRequestType && (
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="requestType" className="font-medium">Type de demande *</label>
                                <Dropdown
                                    id="requestType"
                                    value={request.requestType}
                                    options={requestTypeOptions}
                                    onChange={(e) => setRequest({ ...request, requestType: e.value })}
                                    placeholder="Sélectionner le type"
                                    className="w-full"
                                    disabled={isViewMode}
                                />
                            </div>
                        </div>
                    )}
                    <div className={fixedRequestType ? "col-12 md:col-6" : "col-12 md:col-6"}>
                        <div className="field">
                            <label htmlFor="feeAmount" className="font-medium">Frais (FBU) *</label>
                            <InputNumber
                                id="feeAmount"
                                value={request.feeAmount}
                                onValueChange={(e) => setRequest({ ...request, feeAmount: e.value || 1000 })}
                                suffix=" FBU"
                                min={0}
                                className="w-full"
                                disabled={isViewMode}
                            />
                            <small className="text-500">
                                {request.requestType === 'HISTORIQUE'
                                    ? 'Frais d\'historique (compte 708)'
                                    : 'Frais de demande situation (compte 707)'}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label className="font-medium">Montant à débiter</label>
                            <div className="p-3 surface-0 border-round border-1 border-green-300 text-center">
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(request.feeAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Compte Comptable Revenus */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-book mr-2 text-purple-500"></i>
                    Compte Comptable de Revenus
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="feeAccountId" className="font-medium">Compte de revenus *</label>
                            <Dropdown
                                id="feeAccountId"
                                value={request.feeAccountId}
                                options={comptesComptables}
                                onChange={(e) => setRequest({ ...request, feeAccountId: e.value })}
                                optionLabel="libelle"
                                optionValue="compteId"
                                placeholder="Sélectionner le compte de revenus"
                                className="w-full"
                                filter
                                filterBy="codeCompte,libelle"
                                disabled={isViewMode}
                                itemTemplate={compteOptionTemplate}
                                valueTemplate={(option) => {
                                    if (!option) return 'Sélectionner le compte de revenus';
                                    return `${option.codeCompte} - ${option.libelle}`;
                                }}
                            />
                            <small className="text-500">
                                {request.requestType === 'HISTORIQUE'
                                    ? 'Ex: 708 (Frais d\'historique)'
                                    : 'Ex: 707 (Frais de demande situation)'}
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Motif et Notes */}
            <div className="surface-100 p-3 border-round mb-3">
                <h6 className="mt-0 mb-3">
                    <i className="pi pi-comment mr-2 text-orange-500"></i>
                    Motif et Notes
                </h6>
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="motif" className="font-medium">Motif</label>
                            <InputTextarea
                                id="motif"
                                value={request.motif || ''}
                                onChange={(e) => setRequest({ ...request, motif: e.target.value })}
                                rows={2}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Motif de la demande..."
                            />
                        </div>
                    </div>
                    <div className="col-12 md:col-6">
                        <div className="field">
                            <label htmlFor="notes" className="font-medium">Notes</label>
                            <InputTextarea
                                id="notes"
                                value={request.notes || ''}
                                onChange={(e) => setRequest({ ...request, notes: e.target.value })}
                                rows={2}
                                className="w-full"
                                disabled={isViewMode}
                                placeholder="Notes additionnelles..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode: Balance Info */}
            {isViewMode && (request.balanceBefore !== undefined || request.balanceAfter !== undefined) && (
                <div className="surface-100 p-3 border-round mb-3">
                    <h6 className="mt-0 mb-3">
                        <i className="pi pi-chart-line mr-2 text-blue-500"></i>
                        Soldes
                    </h6>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <small className="text-500">Solde avant:</small>
                            <div className="font-bold text-lg">{formatCurrency(request.balanceBefore)}</div>
                        </div>
                        <div className="col-12 md:col-6">
                            <small className="text-500">Solde après:</small>
                            <div className="font-bold text-lg text-red-600">{formatCurrency(request.balanceAfter)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatementRequestForm;
