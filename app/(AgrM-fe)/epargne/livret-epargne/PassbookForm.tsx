'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Passbook } from './Passbook';

interface PassbookFormProps {
    passbook: Passbook;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null | undefined) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    clients: any[];
    branches: any[];
    savingsAccounts: any[];
    passbookStatuses: any[];
    onClientChange?: (clientId: number) => void;
    isViewMode?: boolean;
}

const PassbookForm: React.FC<PassbookFormProps> = ({
    passbook,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    handleCheckboxChange,
    clients,
    branches,
    savingsAccounts,
    passbookStatuses,
    onClientChange,
    isViewMode = false
}) => {
    const isLost = !!passbook.reportedLostDate;

    return (
        <div className="card p-fluid">
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-book mr-2"></i>
                    Informations du Livret
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-4">
                        <label htmlFor="passbookNumber" className="font-medium">Numéro du Livret</label>
                        <InputText
                            id="passbookNumber"
                            name="passbookNumber"
                            value={passbook.passbookNumber}
                            onChange={handleChange}
                            disabled={isViewMode}
                            placeholder="Généré automatiquement"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        <Dropdown
                            id="branchId"
                            value={passbook.branchId}
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
                    <div className="field col-12 md:col-4">
                        <label htmlFor="statusId" className="font-medium">Statut</label>
                        <Dropdown
                            id="statusId"
                            value={passbook.statusId}
                            options={passbookStatuses}
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
                    Client et Compte
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-medium">Client *</label>
                        <Dropdown
                            id="clientId"
                            value={passbook.clientId}
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
                            filterPlaceholder="Rechercher par nom ou numéro"
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="savingsAccountId" className="font-medium">Compte d'Épargne *</label>
                        <Dropdown
                            id="savingsAccountId"
                            value={passbook.savingsAccountId}
                            options={savingsAccounts}
                            onChange={(e) => handleDropdownChange('savingsAccountId', e.value)}
                            optionLabel="accountNumber"
                            optionValue="id"
                            placeholder="Sélectionner le compte"
                            disabled={isViewMode || !passbook.clientId}
                            filter
                            className="w-full"
                        />
                        {!passbook.clientId && (
                            <small className="text-500">Sélectionnez d'abord un client</small>
                        )}
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-calendar mr-2"></i>
                    Dates
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="issueDate" className="font-medium">Date d'Émission *</label>
                        <Calendar
                            id="issueDate"
                            value={passbook.issueDate ? new Date(passbook.issueDate) : null}
                            onChange={(e) => handleDateChange('issueDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="expiryDate" className="font-medium">Date d'Expiration</label>
                        <Calendar
                            id="expiryDate"
                            value={passbook.expiryDate ? new Date(passbook.expiryDate) : null}
                            onChange={(e) => handleDateChange('expiryDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-file mr-2"></i>
                    Pages du Livret
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <label htmlFor="pagesTotal" className="font-medium">Nombre Total de Pages</label>
                        <InputNumber
                            id="pagesTotal"
                            value={passbook.pagesTotal}
                            onValueChange={(e) => handleNumberChange('pagesTotal', e.value)}
                            min={1}
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="pagesUsed" className="font-medium">Pages Utilisées</label>
                        <InputNumber
                            id="pagesUsed"
                            value={passbook.pagesUsed}
                            onValueChange={(e) => handleNumberChange('pagesUsed', e.value)}
                            min={0}
                            disabled
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="lastEntryPage" className="font-medium">Dernière Page</label>
                        <InputNumber
                            id="lastEntryPage"
                            value={passbook.lastEntryPage}
                            onValueChange={(e) => handleNumberChange('lastEntryPage', e.value)}
                            min={1}
                            disabled
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="lastEntryLine" className="font-medium">Dernière Ligne</label>
                        <InputNumber
                            id="lastEntryLine"
                            value={passbook.lastEntryLine}
                            onValueChange={(e) => handleNumberChange('lastEntryLine', e.value)}
                            min={0}
                            disabled
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-refresh mr-2"></i>
                    Remplacement
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-3">
                        <div className="flex align-items-center mt-4">
                            <Checkbox
                                inputId="isReplacement"
                                checked={passbook.isReplacement}
                                onChange={(e) => handleCheckboxChange('isReplacement', e.checked || false)}
                                disabled={isViewMode}
                            />
                            <label htmlFor="isReplacement" className="ml-2">Est un remplacement</label>
                        </div>
                    </div>
                    {passbook.isReplacement && (
                        <>
                            <div className="field col-12 md:col-3">
                                <label htmlFor="replacementFeePaid" className="font-medium">Frais de Remplacement (FBU)</label>
                                <InputNumber
                                    id="replacementFeePaid"
                                    value={passbook.replacementFeePaid}
                                    onValueChange={(e) => handleNumberChange('replacementFeePaid', e.value)}
                                    mode="decimal"
                                    suffix=" FBU"
                                    min={0}
                                    disabled={isViewMode}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="replacementReason" className="font-medium">Raison du Remplacement</label>
                                <InputTextarea
                                    id="replacementReason"
                                    name="replacementReason"
                                    value={passbook.replacementReason || ''}
                                    onChange={handleChange}
                                    rows={2}
                                    disabled={isViewMode}
                                    placeholder="Raison du remplacement..."
                                    className="w-full"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isLost && (
                <div className="surface-100 p-3 border-round mb-4 border-left-3 border-orange-500">
                    <h5 className="m-0 mb-3 text-orange-500">
                        <i className="pi pi-exclamation-triangle mr-2"></i>
                        Livret Déclaré Perdu
                    </h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">Date de Déclaration</label>
                            <p className="m-0">{passbook.reportedLostDate || '-'}</p>
                        </div>
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">N° Rapport de Police</label>
                            <p className="m-0">{passbook.policeReportNumber || '-'}</p>
                        </div>
                    </div>
                </div>
            )}

            {passbook.closedDate && (
                <div className="surface-100 p-3 border-round border-left-3 border-red-500">
                    <h5 className="m-0 mb-3 text-red-500">
                        <i className="pi pi-times-circle mr-2"></i>
                        Livret Fermé
                    </h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label className="font-medium">Date de Fermeture</label>
                            <p className="m-0">{passbook.closedDate}</p>
                        </div>
                        <div className="field col-12 md:col-8">
                            <label className="font-medium">Raison de Fermeture</label>
                            <p className="m-0">{passbook.closedReason || '-'}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PassbookForm;
