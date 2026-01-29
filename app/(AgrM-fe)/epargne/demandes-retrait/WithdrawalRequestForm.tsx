'use client';
import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { WithdrawalRequest, WithdrawalStatus } from './WithdrawalRequest';

interface WithdrawalRequestFormProps {
    request: WithdrawalRequest;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    clients: any[];
    branches: any[];
    savingsAccounts: any[];
    currencies: any[];
    authorizationLevels: any[];
    onSavingsAccountChange?: (accountId: number) => void;
    onAmountChange?: (amount: number) => void;
    accountBalance?: number;
    isViewMode?: boolean;
}

const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({
    request,
    handleChange,
    handleDropdownChange,
    handleDateChange,
    handleNumberChange,
    clients,
    branches,
    savingsAccounts,
    currencies,
    authorizationLevels,
    onSavingsAccountChange,
    onAmountChange,
    accountBalance = 0,
    isViewMode = false
}) => {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const getStatusSeverity = (status: string): 'success' | 'info' | 'warning' | 'danger' => {
        switch (status) {
            case 'DISBURSED':
                return 'success';
            case 'APPROVED':
            case 'MANAGER_APPROVED':
                return 'info';
            case 'PENDING':
            case 'ID_VERIFIED':
            case 'FIRST_VERIFIED':
            case 'SECOND_VERIFIED':
                return 'warning';
            case 'REJECTED':
            case 'CANCELLED':
                return 'danger';
            default:
                return 'info';
        }
    };

    const getStatusLabel = (status: string): string => {
        const labels: { [key: string]: string } = {
            PENDING: 'En attente',
            ID_VERIFIED: 'ID Vérifié',
            FIRST_VERIFIED: '1ère Vérification',
            SECOND_VERIFIED: '2ème Vérification',
            MANAGER_APPROVED: 'Approuvé Manager',
            APPROVED: 'Approuvé',
            DISBURSED: 'Décaissé',
            REJECTED: 'Rejeté',
            CANCELLED: 'Annulé'
        };
        return labels[status] || status;
    };

    const purposeOptions = [
        { label: 'Besoins personnels', value: 'PERSONNEL' },
        { label: 'Frais de scolarité', value: 'SCOLARITE' },
        { label: 'Frais médicaux', value: 'MEDICAL' },
        { label: 'Commerce', value: 'COMMERCE' },
        { label: 'Construction', value: 'CONSTRUCTION' },
        { label: 'Événement familial', value: 'EVENEMENT' },
        { label: 'Autre', value: 'AUTRE' }
    ];

    const relationshipOptions = [
        { label: 'Titulaire lui-même', value: 'TITULAIRE' },
        { label: 'Conjoint(e)', value: 'CONJOINT' },
        { label: 'Enfant', value: 'ENFANT' },
        { label: 'Parent', value: 'PARENT' },
        { label: 'Frère/Sœur', value: 'FRATRIE' },
        { label: 'Mandataire', value: 'MANDATAIRE' },
        { label: 'Autre', value: 'AUTRE' }
    ];

    return (
        <div className="card p-fluid">
            {isViewMode && request.status && (
                <div className="surface-100 p-3 border-round mb-4 flex align-items-center justify-content-between">
                    <div>
                        <span className="font-medium mr-2">Statut actuel:</span>
                        <Tag value={getStatusLabel(request.status)} severity={getStatusSeverity(request.status)} />
                    </div>
                    <div>
                        <span className="font-medium mr-2">N° Demande:</span>
                        <span className="font-bold">{request.requestNumber}</span>
                    </div>
                </div>
            )}

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-user mr-2"></i>
                    Compte et Client
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="savingsAccountId" className="font-medium">Compte d'Épargne *</label>
                        {isViewMode ? (
                            <InputText
                                value={request.savingsAccountId?.toString() || '-'}
                                disabled
                                className="w-full"
                            />
                        ) : (
                            <Dropdown
                                id="savingsAccountId"
                                value={request.savingsAccountId}
                                options={savingsAccounts}
                                onChange={(e) => {
                                    handleDropdownChange('savingsAccountId', e.value);
                                    if (onSavingsAccountChange) onSavingsAccountChange(e.value);
                                }}
                                optionLabel={(item) => `${item.accountNumber} - ${item.client?.firstName || ''} ${item.client?.lastName || ''} (${formatCurrency(item.currentBalance || 0)})`}
                                optionValue="id"
                                placeholder="Sélectionner le compte d'épargne..."
                                filter
                                filterPlaceholder="Rechercher par numéro de compte"
                                className="w-full"
                            />
                        )}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientId" className="font-medium">Client</label>
                        {isViewMode ? (
                            <InputText
                                value={request.client ? `${request.client.firstName || ''} ${request.client.lastName || ''} - ${request.client.clientNumber || ''}` : '-'}
                                disabled
                                className="w-full"
                            />
                        ) : (
                            <Dropdown
                                id="clientId"
                                value={request.clientId}
                                options={clients}
                                onChange={(e) => handleDropdownChange('clientId', e.value)}
                                optionLabel={(item) => `${item.firstName} ${item.lastName} - ${item.clientNumber}`}
                                optionValue="id"
                                placeholder="Sélectionnez d'abord un compte..."
                                disabled={true}
                                className="w-full"
                            />
                        )}
                    </div>
                </div>
                {!isViewMode && request.savingsAccountId && (
                    <div className="mt-2 p-2 surface-50 border-round">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span className="text-500">Le client est automatiquement récupéré depuis le compte sélectionné</span>
                        </div>
                    </div>
                )}
                {!isViewMode && accountBalance > 0 && (
                    <div className="mt-3 p-3 surface-50 border-round">
                        <div className="flex justify-content-between align-items-center">
                            <span className="font-medium">Solde disponible:</span>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(accountBalance)}</span>
                        </div>
                        <div className="flex justify-content-between align-items-center mt-2">
                            <span className="text-500">Solde minimum à conserver:</span>
                            <span className="text-orange-500 font-medium">1 000 FBU</span>
                        </div>
                        <div className="flex justify-content-between align-items-center mt-2">
                            <span className="text-500">Montant maximum retirable:</span>
                            <span className="text-primary font-bold">{formatCurrency(Math.max(0, accountBalance - 1000))}</span>
                        </div>
                    </div>
                )}
                {isViewMode && (
                    <div className="mt-3 p-3 surface-50 border-round">
                        <div className="flex justify-content-between align-items-center">
                            <span className="font-medium">Solde au moment de la demande:</span>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(request.balanceAtRequest || 0)}</span>
                        </div>
                        {request.balanceAfterWithdrawal !== undefined && request.balanceAfterWithdrawal !== null && (
                            <div className="flex justify-content-between align-items-center mt-2">
                                <span className="font-medium">Solde après retrait:</span>
                                <span className="text-xl font-bold text-green-600">{formatCurrency(request.balanceAfterWithdrawal)}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Informations du Bénéficiaire du Retrait */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-id-card mr-2"></i>
                    Informations du Bénéficiaire du Retrait
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorName" className="font-medium">Nom de la Personne qui Retire</label>
                        <InputText
                            id="depositorName"
                            name="depositorName"
                            value={request.depositorName || ''}
                            onChange={handleChange}
                            placeholder="Nom complet de la personne qui retire"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorRelationship" className="font-medium">Relation avec le Titulaire</label>
                        {isViewMode ? (
                            <InputText
                                value={relationshipOptions.find(r => r.value === request.depositorRelationship)?.label || request.depositorRelationship || '-'}
                                disabled
                                className="w-full"
                            />
                        ) : (
                            <Dropdown
                                id="depositorRelationship"
                                value={request.depositorRelationship}
                                options={relationshipOptions}
                                onChange={(e) => handleDropdownChange('depositorRelationship', e.value)}
                                placeholder="Sélectionner la relation"
                                className="w-full"
                            />
                        )}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorPhone" className="font-medium">Téléphone</label>
                        <InputText
                            id="depositorPhone"
                            name="depositorPhone"
                            value={request.depositorPhone || ''}
                            onChange={handleChange}
                            placeholder="Ex: +257 79 XXX XXX"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="depositorIdNumber" className="font-medium">N° Pièce d'Identité</label>
                        <InputText
                            id="depositorIdNumber"
                            name="depositorIdNumber"
                            value={request.depositorIdNumber || ''}
                            onChange={handleChange}
                            placeholder="Numéro CNI ou passeport"
                            disabled={isViewMode}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary">
                    <i className="pi pi-money-bill mr-2"></i>
                    Montant et Motif
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="requestedAmount" className="font-medium">Montant Demandé (FBU) *</label>
                        <InputNumber
                            id="requestedAmount"
                            value={request.requestedAmount}
                            onValueChange={(e) => {
                                handleNumberChange('requestedAmount', e.value);
                                if (onAmountChange && e.value) onAmountChange(e.value);
                            }}
                            mode="decimal"
                            suffix=" FBU"
                            min={1000}
                            max={accountBalance > 1000 ? accountBalance - 1000 : 0}
                            disabled={isViewMode}
                            className="w-full"
                        />
                        <small className="text-500">Minimum: 1 000 FBU</small>
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="withdrawalPurpose" className="font-medium">Motif du Retrait</label>
                        {isViewMode ? (
                            <InputText
                                value={purposeOptions.find(p => p.value === request.withdrawalPurpose)?.label || request.withdrawalPurpose || '-'}
                                disabled
                                className="w-full"
                            />
                        ) : (
                            <Dropdown
                                id="withdrawalPurpose"
                                value={request.withdrawalPurpose}
                                options={purposeOptions}
                                onChange={(e) => handleDropdownChange('withdrawalPurpose', e.value)}
                                placeholder="Sélectionner le motif"
                                className="w-full"
                            />
                        )}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="requestDate" className="font-medium">Date de Demande</label>
                        <Calendar
                            id="requestDate"
                            value={request.requestDate ? new Date(request.requestDate) : null}
                            onChange={(e) => handleDateChange('requestDate', e.value as Date | null)}
                            dateFormat="dd/mm/yy"
                            disabled={isViewMode}
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="branchId" className="font-medium">Agence *</label>
                        {isViewMode ? (
                            <InputText
                                value={request.branch?.name || '-'}
                                disabled
                                className="w-full"
                            />
                        ) : (
                            <Dropdown
                                id="branchId"
                                value={request.branchId}
                                options={branches}
                                onChange={(e) => handleDropdownChange('branchId', e.value)}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Sélectionner l'agence"
                                filter
                                className="w-full"
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Afficher les contrôles de sécurité requis */}
            {(request.dualVerificationRequired || request.requiresManagerApproval) && (
                <div className="surface-100 p-3 border-round mb-4 border-left-3 border-orange-500">
                    <h5 className="m-0 mb-3 text-orange-500">
                        <i className="pi pi-shield mr-2"></i>
                        Contrôles de Sécurité Requis
                    </h5>
                    <div className="grid">
                        {request.dualVerificationRequired && (
                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-users text-blue-500"></i>
                                    <span>Double vérification requise</span>
                                    {request.firstVerifiedAt && (
                                        <Tag value="1ère OK" severity="success" className="ml-2" />
                                    )}
                                    {request.secondVerifiedAt && (
                                        <Tag value="2ème OK" severity="success" className="ml-2" />
                                    )}
                                </div>
                            </div>
                        )}
                        {request.requiresManagerApproval && (
                            <div className="col-12 md:col-6">
                                <div className="flex align-items-center gap-2">
                                    <i className="pi pi-user-edit text-purple-500"></i>
                                    <span>Approbation manager requise</span>
                                    {request.managerApprovedAt && (
                                        <Tag value="Approuvé" severity="success" className="ml-2" />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Afficher les détails des vérifications en mode vue */}
            {isViewMode && (request.firstVerifier || request.secondVerifier || request.manager || request.userAction) && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-users mr-2"></i>
                        Détails des Vérifications
                    </h5>
                    <div className="grid">
                        {request.userAction && (
                            <div className="col-12 md:col-6">
                                <div className="p-2 surface-50 border-round">
                                    <span className="text-500">Créé par:</span>
                                    <div className="font-bold">{request.userAction}</div>
                                </div>
                            </div>
                        )}
                        {request.firstVerifier && (
                            <div className="col-12 md:col-6">
                                <div className="p-2 surface-50 border-round">
                                    <span className="text-500">1ère Vérification:</span>
                                    <div className="font-bold">{request.firstVerifier}</div>
                                    {request.firstVerifiedAt && (
                                        <div className="text-sm text-500">{request.firstVerifiedAt}</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {request.secondVerifier && (
                            <div className="col-12 md:col-6">
                                <div className="p-2 surface-50 border-round">
                                    <span className="text-500">2ème Vérification:</span>
                                    <div className="font-bold">{request.secondVerifier}</div>
                                    {request.secondVerifiedAt && (
                                        <div className="text-sm text-500">{request.secondVerifiedAt}</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {request.manager && (
                            <div className="col-12 md:col-6">
                                <div className="p-2 surface-50 border-round">
                                    <span className="text-500">Approuvé par Manager:</span>
                                    <div className="font-bold">{request.manager}</div>
                                    {request.managerApprovedAt && (
                                        <div className="text-sm text-500">{request.managerApprovedAt}</div>
                                    )}
                                    {request.managerComments && (
                                        <div className="text-sm mt-1">Commentaire: {request.managerComments}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Afficher les détails du décaissement en mode vue */}
            {isViewMode && request.status === 'DISBURSED' && (
                <div className="surface-100 p-3 border-round mb-4 border-left-3 border-green-500">
                    <h5 className="m-0 mb-3 text-green-500">
                        <i className="pi pi-wallet mr-2"></i>
                        Détails du Décaissement
                    </h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <span className="text-500">Montant décaissé:</span>
                            <div className="font-bold text-green-600">{formatCurrency(request.disbursedAmount || 0)}</div>
                        </div>
                        <div className="col-12 md:col-4">
                            <span className="text-500">Date de décaissement:</span>
                            <div className="font-bold">{request.disbursementDate || '-'}</div>
                        </div>
                        <div className="col-12 md:col-4">
                            <span className="text-500">Heure:</span>
                            <div className="font-bold">{request.disbursementTime || '-'}</div>
                        </div>
                        {request.receiptNumber && (
                            <div className="col-12 md:col-4">
                                <span className="text-500">N° Reçu:</span>
                                <div className="font-bold">{request.receiptNumber}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Historique pour vue détaillée */}
            {isViewMode && request.authorizationHistory && request.authorizationHistory.length > 0 && (
                <div className="surface-100 p-3 border-round mb-4">
                    <h5 className="m-0 mb-3 text-primary">
                        <i className="pi pi-history mr-2"></i>
                        Historique des Autorisations
                    </h5>
                    <div className="timeline">
                        {request.authorizationHistory.map((history, index) => (
                            <div key={index} className="flex gap-3 mb-3 p-2 surface-50 border-round">
                                <div className="flex-shrink-0">
                                    <i className="pi pi-check-circle text-green-500 text-xl"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="font-medium">{history.action}</div>
                                    <div className="text-500 text-sm">
                                        {history.performedAt || history.actionAt} par {history.userAction || history.actionBy?.username || 'Système'}
                                    </div>
                                    {history.comments && (
                                        <div className="text-sm mt-1">{history.comments}</div>
                                    )}
                                </div>
                            </div>
                        ))}
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
                    value={request.notes || ''}
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

export default WithdrawalRequestForm;
