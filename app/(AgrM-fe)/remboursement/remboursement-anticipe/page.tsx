'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';

import Cookies from 'js-cookie';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import {
    RemboursementAnticipe,
    RemboursementAnticipeClass,
    STATUTS_DEMANDE
} from '../types/RemboursementTypes';

const TYPES_REMBOURSEMENT = [
    { label: 'Total (Solde complet)', value: 'TOTAL' },
    { label: 'Partiel', value: 'PARTIAL' }
];

const RemboursementAnticipePage = () => {
    const [demandes, setDemandes] = useState<RemboursementAnticipe[]>([]);
    const [demande, setDemande] = useState<RemboursementAnticipe>(new RemboursementAnticipeClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);

    // Disbursement selection
    const [showLoanSelectionDialog, setShowLoanSelectionDialog] = useState(false);
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [filteredDisbursements, setFilteredDisbursements] = useState<any[]>([]);
    const [disbursementFilter, setDisbursementFilter] = useState('');
    const [loadingDisbursements, setLoadingDisbursements] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);

    // Savings accounts for resolving account numbers
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: savingsData, fetchData: fetchSavings } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/early-repayments');
    const DISBURSEMENTS_URL = buildApiUrl('/api/credit/disbursements');
    const SCHEDULES_URL = buildApiUrl('/api/remboursement/schedules');
    const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');

    // Store loan IDs that are fully paid (all schedules are PAID)
    const [fullyPaidLoanIds, setFullyPaidLoanIds] = useState<number[]>([]);

    // Approval dialog with bordereau validation
    const [showApprovalDialog, setShowApprovalDialog] = useState(false);
    const [approvalTarget, setApprovalTarget] = useState<RemboursementAnticipe | null>(null);
    const [bordereauNumber, setBordereauNumber] = useState('');
    const [bordereauError, setBordereauError] = useState('');
    const [bordereauValid, setBordereauValid] = useState(false);
    const [bordereauDetails, setBordereauDetails] = useState('');
    const [bordereauAmount, setBordereauAmount] = useState<number | null>(null);
    const [checkingBordereau, setCheckingBordereau] = useState(false);
    const [approving, setApproving] = useState(false);
    const PAYMENTS_URL = buildApiUrl('/api/remboursement/payments');
    const DEPOSIT_SLIPS_URL = buildApiUrl('/api/epargne/deposit-slips');

    useEffect(() => {
        loadDemandes();
        loadSavingsAccounts();
    }, []);

    // Handle savings accounts data
    useEffect(() => {
        if (savingsData) {
            const accounts = Array.isArray(savingsData) ? savingsData : savingsData.content || [];
            setSavingsAccounts(accounts);
        }
    }, [savingsData]);

    const loadSavingsAccounts = () => {
        fetchSavings(null, 'GET', `${SAVINGS_ACCOUNTS_URL}/findallactive`, 'loadSavingsAccounts');
    };

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    setDemandes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadDisbursements':
                    const disb = Array.isArray(data) ? data : data.content || [];
                    const completedDisb = disb.filter((d: any) => d.status === 'COMPLETED');
                    // Filter out disbursements that are fully paid
                    const eligibleDisb = completedDisb.filter((d: any) => {
                        const loanId = d.id;
                        return !fullyPaidLoanIds.includes(loanId);
                    });
                    setDisbursements(eligibleDisb);
                    setFilteredDisbursements(eligibleDisb);
                    setLoadingDisbursements(false);
                    break;
                case 'loadSchedulesForFilter':
                    const allSchedules = Array.isArray(data) ? data : data.content || [];
                    // Group schedules by loanId and check if all are PAID
                    const loanScheduleMap = new Map<number, boolean>();

                    allSchedules.forEach((s: any) => {
                        const loanId = s.loanId;
                        if (!loanScheduleMap.has(loanId)) {
                            loanScheduleMap.set(loanId, true);
                        }
                        if (s.status !== 'PAID') {
                            loanScheduleMap.set(loanId, false);
                        }
                    });

                    const paidLoanIds: number[] = [];
                    loanScheduleMap.forEach((allPaid, loanId) => {
                        if (allPaid) {
                            paidLoanIds.push(loanId);
                        }
                    });

                    setFullyPaidLoanIds(paidLoanIds);
                    fetchData(null, 'GET', `${DISBURSEMENTS_URL}/findbystatus/COMPLETED/paginated?page=0&size=100&sortBy=disbursementDate&sortDir=desc`, 'loadDisbursements');
                    break;
                case 'calculate':
                    setCalculatedAmount(data.totalSettlementAmount);
                    setDemande(prev => ({
                        ...prev,
                        remainingPrincipal: data.remainingPrincipal || 0,
                        accruedInterest: data.accruedInterest || 0,
                        accruedPenalties: data.accruedPenalties || 0,
                        penaltyForEarlyRepayment: data.penaltyForEarlyRepayment || 0,
                        totalSettlementAmount: data.totalSettlementAmount || 0
                    }));
                    showToast('success', 'Calcul Effectué',
                        `Montant total: ${data.totalSettlementAmount?.toLocaleString()} FBU. Économie d'intérêts: ${data.interestSavings?.toLocaleString()} FBU`);
                    break;
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadDemandes();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Demande supprimée');
                    loadDemandes();
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Demande approuvée');
                    loadDemandes();
                    break;
                case 'reject':
                    showToast('info', 'Info', 'Demande rejetée');
                    loadDemandes();
                    break;
                case 'process':
                    showToast('success', 'Remboursement Traité',
                        `Paiement créé avec succès. L'échéancier a été mis à jour et toutes les échéances restantes sont marquées comme PAYÉES.`);
                    loadDemandes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall-with-details`, 'loadDemandes');
    };

    const calculateSettlementAmount = () => {
        if (!demande.loanId || !demande.proposedSettlementDate) {
            showToast('warn', 'Attention', 'Veuillez saisir l\'ID du crédit et la date de règlement');
            return;
        }
        const date = new Date(demande.proposedSettlementDate).toISOString().split('T')[0];
        fetchData(null, 'GET', `${BASE_URL}/calculate/${demande.loanId}?settlementDate=${date}&repaymentType=${demande.repaymentType}`, 'calculate');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setDemande(new RemboursementAnticipeClass());
        setIsViewMode(false);
        setCalculatedAmount(null);
        setSelectedLoan(null);
    };

    const loadDisbursements = () => {
        setLoadingDisbursements(true);
        // First load all schedules to determine which loans are fully paid
        fetchData(null, 'GET', `${SCHEDULES_URL}/findall`, 'loadSchedulesForFilter');
    };

    const handleLoadFromDisbursement = () => {
        loadDisbursements();
        setShowLoanSelectionDialog(true);
    };

    const handleDisbursementSelect = (disbursement: any) => {
        // Resolve account number from savings accounts
        const savingsAccountId = disbursement.application?.savingsAccountId || disbursement.targetSavingsAccountId || disbursement.savingsAccountId;
        const resolvedAccount = savingsAccountId
            ? savingsAccounts.find((a: any) => a.id === savingsAccountId)
            : null;
        const accountNumber = resolvedAccount?.accountNumber || disbursement.accountNumber || '';

        const enrichedDisbursement = { ...disbursement, accountNumber };
        setSelectedLoan(enrichedDisbursement);

        // Update request with selected loan info
        setDemande(prev => ({
            ...prev,
            loanId: disbursement.loanId || disbursement.loan?.id || disbursement.id,
            requestedBy: disbursement.clientId || disbursement.client?.id,
            accountNumber: accountNumber,
            proposedSettlementDate: new Date().toISOString().split('T')[0]
        }));

        setShowLoanSelectionDialog(false);
        showToast('info', 'Crédit Sélectionné',
            `${disbursement.applicationNumber} - ${disbursement.clientName} - Montant: ${disbursement.amount?.toLocaleString()} FBU`);
    };

    const handleDisbursementFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setDisbursementFilter(value);

        if (!value) {
            setFilteredDisbursements(disbursements);
            return;
        }

        const filtered = disbursements.filter((d: any) =>
            (d.disbursementNumber || '').toLowerCase().includes(value) ||
            (d.applicationNumber || '').toLowerCase().includes(value) ||
            (d.clientName || '').toLowerCase().includes(value)
        );

        setFilteredDisbursements(filtered);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDemande(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleSubmit = () => {
        if (!demande.loanId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un crédit');
            return;
        }

        // Add userAction to track the connected user
        const dataToSubmit = {
            ...demande,
            userAction: getUserAction()
        };

        if (demande.id) {
            fetchData(dataToSubmit, 'PUT', `${BASE_URL}/update/${demande.id}`, 'update');
        } else {
            fetchData(dataToSubmit, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: RemboursementAnticipe) => {
        setDemande({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: RemboursementAnticipe) => {
        setDemande({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleApprove = (rowData: RemboursementAnticipe) => {
        setApprovalTarget(rowData);
        setBordereauNumber('');
        setBordereauError('');
        setBordereauValid(false);
        setBordereauDetails('');
        setBordereauAmount(null);
        setShowApprovalDialog(true);
    };

    const checkBordereau = async () => {
        const num = bordereauNumber.trim();
        if (!num) {
            setBordereauError('Veuillez saisir le numéro du bordereau de dépôt');
            setBordereauValid(false);
            return;
        }

        setCheckingBordereau(true);
        setBordereauError('');
        setBordereauValid(false);
        setBordereauDetails('');
        setBordereauAmount(null);

        try {
            const token = Cookies.get('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // Step 1: Check if bordereau exists and is COMPLETED via deposit-slips API
            const depositResponse = await fetch(`${DEPOSIT_SLIPS_URL}/findall`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (!depositResponse.ok) {
                setBordereauError('Erreur lors de la vérification du bordereau');
                setCheckingBordereau(false);
                return;
            }

            const allSlips = await depositResponse.json();
            const slipsList = Array.isArray(allSlips) ? allSlips : allSlips.content || [];
            const matchingSlip = slipsList.find((s: any) => s.slipNumber === num);

            if (!matchingSlip) {
                setBordereauError(`Bordereau "${num}" introuvable. Vérifiez le numéro.`);
                setCheckingBordereau(false);
                return;
            }

            if (matchingSlip.status !== 'COMPLETED') {
                setBordereauError(`Bordereau "${num}" n'est pas validé (statut: ${matchingSlip.status}). Seuls les bordereaux validés sont acceptés.`);
                setCheckingBordereau(false);
                return;
            }

            // Step 2: Check if bordereau is not already used in credit payments
            const receiptResponse = await fetch(`${PAYMENTS_URL}/check-receipt/${encodeURIComponent(num)}`, {
                method: 'GET',
                headers,
                credentials: 'include'
            });

            if (receiptResponse.ok) {
                const receiptData = await receiptResponse.json();
                if (!receiptData.valid) {
                    setBordereauError(receiptData.error || `Bordereau "${num}" est déjà utilisé dans un paiement crédit.`);
                    setCheckingBordereau(false);
                    return;
                }
            }

            // All checks passed
            setBordereauValid(true);
            setBordereauAmount(matchingSlip.amount || matchingSlip.totalAmount || 0);
            setBordereauDetails(`Client: ${matchingSlip.client?.firstName || ''} ${matchingSlip.client?.lastName || ''} - Montant: ${(matchingSlip.amount || matchingSlip.totalAmount || 0).toLocaleString()} FBU - Date: ${matchingSlip.depositDate || ''}`);
        } catch (err) {
            setBordereauError('Erreur de connexion lors de la vérification');
        } finally {
            setCheckingBordereau(false);
        }
    };

    const confirmApproval = () => {
        if (!approvalTarget || !bordereauValid) return;
        setApproving(true);
        const userAction = getUserAction();
        fetchData({ userAction }, 'POST', `${BASE_URL}/approve/${approvalTarget.id}?approvedBy=1&userAction=${encodeURIComponent(userAction)}`, 'approve');
        setShowApprovalDialog(false);
        setApprovalTarget(null);
        setBordereauNumber('');
        setBordereauValid(false);
        setApproving(false);
    };

    const handleProcess = (rowData: RemboursementAnticipe) => {
        confirmDialog({
            message: 'Confirmer le traitement du remboursement anticipé ?',
            header: 'Confirmation de traitement',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, traiter',
            rejectLabel: 'Non, annuler',
            accept: () => {
                const userAction = getUserAction();
                fetchData({ userAction }, 'POST', `${BASE_URL}/process/${rowData.id}?processedBy=1&userAction=${encodeURIComponent(userAction)}`, 'process');
            }
        });
    };

    // Column body templates
    const statusBodyTemplate = (rowData: RemboursementAnticipe) => {
        const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' | 'secondary' } = {
            'PENDING': 'warning',
            'APPROVED': 'success',
            'REJECTED': 'danger',
            'CANCELLED': 'secondary',
            'COMPLETED': 'info'
        };
        const labelMap: { [key: string]: string } = {
            'PENDING': 'En attente',
            'APPROVED': 'Approuvée',
            'REJECTED': 'Rejetée',
            'CANCELLED': 'Annulée',
            'COMPLETED': 'Complétée'
        };
        return (
            <Tag
                value={labelMap[rowData.status || 'PENDING'] || rowData.status}
                severity={severityMap[rowData.status || 'PENDING'] || 'info'}
            />
        );
    };

    const typeBodyTemplate = (rowData: RemboursementAnticipe) => {
        return rowData.repaymentType === 'TOTAL' ? (
            <Tag value="Total" severity="success" />
        ) : (
            <Tag value="Partiel" severity="info" />
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const actionsBodyTemplate = (rowData: RemboursementAnticipe) => (
        <div className="flex gap-1">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Voir"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleView(rowData)}
            />
            {rowData.status === 'PENDING' && (
                <>
                    <Button
                        icon="pi pi-check"
                        rounded
                        text
                        severity="success"
                        tooltip="Approuver"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleApprove(rowData)}
                    />
                    <Button
                        icon="pi pi-pencil"
                        rounded
                        text
                        severity="warning"
                        tooltip="Modifier"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleEdit(rowData)}
                    />
                </>
            )}
            {rowData.status === 'APPROVED' && (
                <Button
                    icon="pi pi-dollar"
                    rounded
                    text
                    severity="success"
                    tooltip="Traiter le Paiement"
                    tooltipOptions={{ position: 'top' }}
                    onClick={() => handleProcess(rowData)}
                />
            )}
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-fast-forward mr-2"></i>
                Demandes de Remboursement Anticipé
            </h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Message important */}
            <Message
                severity="info"
                className="mb-4 w-full"
                text="Remboursement Anticipé - Configurez le taux de pénalité selon votre politique institutionnelle"
            />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    {/* Loan Selection Section */}
                    <div className="mb-3 p-3 surface-border border-round border-1">
                        <div className="flex align-items-center justify-content-between mb-3">
                            <h5 className="m-0">
                                <i className="pi pi-file mr-2"></i>
                                Sélection du Crédit
                            </h5>
                            <Button
                                label="Sélectionner un Crédit"
                                icon="pi pi-search"
                                onClick={handleLoadFromDisbursement}
                                outlined
                                size="small"
                            />
                        </div>
                        {selectedLoan && (
                            <div className="grid">
                                <div className="col-12 md:col-2">
                                    <small className="text-600">N° Dossier</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.applicationNumber}</p>
                                </div>
                                <div className="col-12 md:col-2">
                                    <small className="text-600">N° Décaissement</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.disbursementNumber}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Client</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.clientName}</p>
                                </div>
                                <div className="col-12 md:col-2">
                                    <small className="text-600">N° Compte</small>
                                    <p className="mt-1 mb-0 font-semibold">{selectedLoan.accountNumber || demande.accountNumber || '-'}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Montant Décaissé</small>
                                    <p className="mt-1 mb-0 font-semibold text-primary">
                                        {selectedLoan.amount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                                    </p>
                                </div>
                            </div>
                        )}
                        {!selectedLoan && (
                            <p className="text-500 m-0">
                                <i className="pi pi-info-circle mr-2"></i>
                                Veuillez sélectionner un crédit pour créer une demande de remboursement anticipé
                            </p>
                        )}
                    </div>

                    <div className="grid">
                        {/* Informations de Base */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-folder mr-2"></i>
                                    Informations de la Demande
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">N° Demande</label>
                                        <InputText value={demande.requestNumber || ''} disabled className="w-full" placeholder="Auto-généré" />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">ID Crédit *</label>
                                        <InputNumber
                                            value={demande.loanId || null}
                                            onValueChange={(e) => handleNumberChange('loanId', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode || !!selectedLoan}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">N° Compte Client</label>
                                        <InputText
                                            name="accountNumber"
                                            value={demande.accountNumber || ''}
                                            className="w-full"
                                            disabled
                                            placeholder="Auto-rempli à la sélection"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Type de Remboursement *</label>
                                        <Dropdown
                                            value={demande.repaymentType}
                                            options={TYPES_REMBOURSEMENT}
                                            onChange={(e) => handleDropdownChange('repaymentType', e.value)}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Date de Règlement Proposée</label>
                                        <Calendar
                                            value={demande.proposedSettlementDate ? new Date(demande.proposedSettlementDate) : null}
                                            onChange={(e) => handleDateChange('proposedSettlementDate', e.value as Date)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                            minDate={new Date()}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calcul du Montant */}
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-calculator mr-2"></i>
                                    Détails du Solde
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold">Capital Restant Dû</label>
                                        <InputNumber
                                            value={demande.remainingPrincipal || null}
                                            onValueChange={(e) => handleNumberChange('remainingPrincipal', e.value ?? null)}
                                            className="w-full"
                                            disabled={true}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                        <small className="text-500">Calculé automatiquement depuis l'échéancier</small>
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Intérêts Courus</label>
                                        <InputNumber
                                            value={demande.accruedInterest || null}
                                            onValueChange={(e) => handleNumberChange('accruedInterest', e.value ?? null)}
                                            className="w-full"
                                            disabled={true}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                        <small className="text-500">Intérêts dus non payés</small>
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold text-orange-600">
                                            Pénalités Accumulées
                                            <i className="pi pi-pencil ml-2 text-xs"></i>
                                        </label>
                                        <InputNumber
                                            value={demande.accruedPenalties || null}
                                            onValueChange={(e) => {
                                                const newPenalties = e.value ?? 0;
                                                handleNumberChange('accruedPenalties', newPenalties);
                                                // Recalculate total when penalties change
                                                const newTotal = (demande.remainingPrincipal || 0) +
                                                                (demande.accruedInterest || 0) +
                                                                newPenalties +
                                                                (demande.penaltyForEarlyRepayment || 0);
                                                handleNumberChange('totalSettlementAmount', newTotal);
                                            }}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                        <small className="text-orange-600">Modifiable - Pénalités de retard</small>
                                    </div>
                                    <div className="field col-12">
                                        <Button
                                            label="Calculer le Montant Total"
                                            icon="pi pi-calculator"
                                            className="w-full"
                                            onClick={calculateSettlementAmount}
                                            loading={loading && callType === 'calculate'}
                                            disabled={isViewMode || !demande.loanId}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-4 border-primary border-2">
                                <h5 className="mb-3 text-primary">
                                    <i className="pi pi-money-bill mr-2"></i>
                                    Montant de Règlement
                                </h5>

                                <div className="text-center py-4">
                                    <div className="text-4xl font-bold text-primary">
                                        {currencyBodyTemplate(demande.totalSettlementAmount || calculatedAmount || 0)}
                                    </div>
                                    <p className="text-color-secondary mt-2">Montant total à payer</p>
                                </div>

                                <Divider />

                                {/* Breakdown */}
                                <div className="mb-3">
                                    <h6 className="mb-2 text-600">Composition du montant:</h6>
                                    <div className="grid text-sm">
                                        <div className="col-8 text-600">Capital restant dû:</div>
                                        <div className="col-4 text-right font-semibold">
                                            {currencyBodyTemplate(demande.remainingPrincipal || 0)}
                                        </div>
                                        <div className="col-8 text-600">Intérêts courus:</div>
                                        <div className="col-4 text-right font-semibold">
                                            {currencyBodyTemplate(demande.accruedInterest || 0)}
                                        </div>
                                        <div className="col-8 text-600">Pénalités accumulées:</div>
                                        <div className="col-4 text-right font-semibold text-orange-600">
                                            {currencyBodyTemplate(demande.accruedPenalties || 0)}
                                        </div>
                                        <div className="col-8 text-600">Pénalité remb. anticipé:</div>
                                        <div className="col-4 text-right font-semibold text-orange-600">
                                            {currencyBodyTemplate(demande.penaltyForEarlyRepayment || 0)}
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                <div className="field mb-3">
                                    <label className="font-semibold text-primary">
                                        <i className="pi pi-percentage mr-2"></i>
                                        Taux de Pénalité (%)
                                    </label>
                                    <InputNumber
                                        value={demande.earlyRepaymentPenaltyRate || 0}
                                        onValueChange={(e) => {
                                            const rate = e.value ?? 0;
                                            handleNumberChange('earlyRepaymentPenaltyRate', rate);

                                            // Calculate penalty amount based on remaining principal
                                            const remainingPrincipal = demande.remainingPrincipal || 0;
                                            const calculatedPenalty = (remainingPrincipal * rate) / 100;
                                            handleNumberChange('penaltyForEarlyRepayment', calculatedPenalty);

                                            // Recalculate total
                                            const newTotal = remainingPrincipal +
                                                            (demande.accruedInterest || 0) +
                                                            (demande.accruedPenalties || 0) +
                                                            calculatedPenalty;
                                            handleNumberChange('totalSettlementAmount', newTotal);
                                        }}
                                        className="w-full"
                                        disabled={isViewMode}
                                        suffix="%"
                                        min={0}
                                        max={100}
                                        minFractionDigits={0}
                                        maxFractionDigits={2}
                                    />
                                    <small className="text-500">
                                        Pourcentage du capital restant (ex: 2% = {currencyBodyTemplate((demande.remainingPrincipal || 0) * 0.02)})
                                    </small>
                                </div>

                                <div className="field">
                                    <label className="font-semibold text-orange-600">
                                        Pénalité de Remboursement Anticipé
                                        <i className="pi pi-pencil ml-2 text-xs"></i>
                                    </label>
                                    <InputNumber
                                        value={demande.penaltyForEarlyRepayment || 0}
                                        onValueChange={(e) => {
                                            const newPenalty = e.value ?? 0;
                                            handleNumberChange('penaltyForEarlyRepayment', newPenalty);

                                            // Recalculate rate based on manual amount entry
                                            const remainingPrincipal = demande.remainingPrincipal || 0;
                                            if (remainingPrincipal > 0) {
                                                const rate = (newPenalty / remainingPrincipal) * 100;
                                                handleNumberChange('earlyRepaymentPenaltyRate', rate);
                                            }

                                            // Recalculate total when penalty changes
                                            const newTotal = (demande.remainingPrincipal || 0) +
                                                            (demande.accruedInterest || 0) +
                                                            (demande.accruedPenalties || 0) +
                                                            newPenalty;
                                            handleNumberChange('totalSettlementAmount', newTotal);
                                        }}
                                        className="w-full"
                                        disabled={isViewMode}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-BI"
                                    />
                                    <small className="text-orange-600">
                                        Montant calculé automatiquement à partir du taux, ou saisissez manuellement
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Workflow Status - Show for existing requests */}
                        {demande.id && (
                            <div className="col-12">
                                <div className={`p-3 border-round mb-4 ${
                                    demande.status === 'COMPLETED' ? 'bg-green-50 border-green-200 border-1' :
                                    demande.status === 'APPROVED' ? 'bg-blue-50 border-blue-200 border-1' :
                                    demande.status === 'REJECTED' ? 'bg-red-50 border-red-200 border-1' :
                                    'surface-100'
                                }`}>
                                    <h5 className="mb-3">
                                        <i className="pi pi-sitemap mr-2"></i>
                                        Statut du Workflow
                                    </h5>
                                    <div className="grid">
                                        <div className="col-12 md:col-3">
                                            <div className="flex align-items-center gap-2">
                                                <i className={`pi ${demande.status === 'PENDING' ? 'pi-clock text-warning' : 'pi-check-circle text-success'}`}></i>
                                                <div>
                                                    <small className="text-600 block">1. Demande Créée</small>
                                                    <span className="font-semibold">{demande.requestNumber || 'En cours'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="flex align-items-center gap-2">
                                                <i className={`pi ${
                                                    demande.status === 'APPROVED' || demande.status === 'COMPLETED' ? 'pi-check-circle text-success' :
                                                    demande.status === 'REJECTED' ? 'pi-times-circle text-danger' : 'pi-clock text-400'
                                                }`}></i>
                                                <div>
                                                    <small className="text-600 block">2. Approbation</small>
                                                    <span className="font-semibold">
                                                        {demande.status === 'APPROVED' || demande.status === 'COMPLETED' ? 'Approuvée' :
                                                         demande.status === 'REJECTED' ? 'Rejetée' : 'En attente'}
                                                    </span>
                                                    {demande.approvalDate && (
                                                        <small className="text-500 block">{new Date(demande.approvalDate).toLocaleDateString('fr-FR')}</small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="flex align-items-center gap-2">
                                                <i className={`pi ${demande.status === 'COMPLETED' ? 'pi-check-circle text-success' : 'pi-clock text-400'}`}></i>
                                                <div>
                                                    <small className="text-600 block">3. Paiement</small>
                                                    <span className="font-semibold">
                                                        {demande.paymentNumber || (demande.paymentId ? `PAY-${demande.paymentId}` : 'Non traité')}
                                                    </span>
                                                    {demande.actualSettlementDate && (
                                                        <small className="text-500 block">{new Date(demande.actualSettlementDate).toLocaleDateString('fr-FR')}</small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <div className="flex align-items-center gap-2">
                                                <i className={`pi ${demande.status === 'COMPLETED' ? 'pi-check-circle text-success' : 'pi-clock text-400'}`}></i>
                                                <div>
                                                    <small className="text-600 block">4. Échéancier</small>
                                                    <span className="font-semibold">
                                                        {demande.status === 'COMPLETED' ? 'Clôturé' : 'En cours'}
                                                    </span>
                                                    {demande.status === 'COMPLETED' && (
                                                        <small className="text-success block">Toutes échéances PAYÉES</small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {demande.userAction && (
                                        <div className="mt-3 pt-3 border-top-1 border-300">
                                            <small className="text-600">
                                                <i className="pi pi-user mr-1"></i>
                                                Traité par: {demande.userAction}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Raison */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-file-edit mr-2"></i>
                                    Raison et Notes
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold">Raison du Remboursement Anticipé</label>
                                        <InputTextarea
                                            name="reason"
                                            value={demande.reason || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold">Notes</label>
                                        <InputTextarea
                                            name="notes"
                                            value={demande.notes || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label={demande.id ? "Modifier" : "Soumettre la Demande"}
                                icon="pi pi-save"
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={demandes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune demande trouvée"
                        className="p-datatable-sm"
                        sortField="requestDate"
                        sortOrder={-1}
                    >
                        <Column field="requestNumber" header="N° Demande" sortable filter style={{ width: '10%' }} />
                        <Column field="paymentNumber" header="N° Paiement" sortable filter style={{ width: '10%' }} />
                        <Column field="accountNumber" header="N° Compte" sortable filter style={{ width: '10%' }} />
                        <Column field="application_number" header="Crédit" sortable filter style={{ width: '7%' }} />
                        <Column
                            field="requestDate"
                            header="Date Demande"
                            body={(rowData) => dateBodyTemplate(rowData.requestDate)}
                            sortable
                            style={{ width: '9%' }}
                        />
                        <Column
                            field="repaymentType"
                            header="Type"
                            body={typeBodyTemplate}
                            sortable
                            style={{ width: '6%' }}
                        />
                        <Column
                            field="remainingPrincipal"
                            header="Capital Restant"
                            body={(rowData) => currencyBodyTemplate(rowData.remainingPrincipal)}
                            style={{ width: '9%' }}
                        />
                        <Column
                            field="penaltyForEarlyRepayment"
                            header="Pénalité"
                            body={(rowData) => currencyBodyTemplate(rowData.penaltyForEarlyRepayment)}
                            sortable
                            style={{ width: '9%' }}
                        />
                        <Column
                            field="totalSettlementAmount"
                            header="Montant Total"
                            body={(rowData) => currencyBodyTemplate(rowData.totalSettlementAmount)}
                            sortable
                            style={{ width: '9%' }}
                        />
                        <Column
                            field="proposedSettlementDate"
                            header="Date Proposée"
                            body={(rowData) => dateBodyTemplate(rowData.proposedSettlementDate)}
                            sortable
                            style={{ width: '9%' }}
                        />
                        <Column
                            field="status"
                            header="Statut"
                            body={statusBodyTemplate}
                            sortable
                            filter
                            style={{ width: '8%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '9%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog Sélection Crédit Décaissé */}
            <Dialog
                visible={showLoanSelectionDialog}
                onHide={() => {
                    setShowLoanSelectionDialog(false);
                    setDisbursementFilter('');
                    setFilteredDisbursements(disbursements);
                }}
                header="Sélectionner un Crédit Décaissé"
                style={{ width: '75vw' }}
                modal
            >
                <div className="mb-3">
                    <span className="p-input-icon-left w-full">
                        <i className="pi pi-search" />
                        <InputText
                            placeholder="Rechercher par N° décaissement, N° dossier ou client..."
                            className="w-full"
                            onChange={handleDisbursementFilterChange}
                        />
                    </span>
                </div>
                <DataTable
                    value={filteredDisbursements}
                    loading={loadingDisbursements}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 20, 50]}
                    emptyMessage="Aucun crédit décaissé trouvé"
                    selectionMode="single"
                    onRowSelect={(e) => handleDisbursementSelect(e.data)}
                    className="p-datatable-sm"
                >
                    <Column
                        field="disbursementNumber"
                        header="N° Décaissement"
                        sortable
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="applicationNumber"
                        header="N° Dossier"
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="clientName"
                        header="Client"
                        sortable
                        style={{ width: '18%' }}
                    />
                    <Column
                        field="accountNumber"
                        header="N° Compte"
                        body={(row) => row.accountNumber || row.savingsAccountNumber || '-'}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="amount"
                        header="Montant Décaissé"
                        body={(row) => row.amount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                        sortable
                        style={{ width: '15%' }}
                    />
                    <Column
                        field="disbursementDate"
                        header="Date Décaissement"
                        body={(row) => row.disbursementDate ? new Date(row.disbursementDate).toLocaleDateString('fr-FR') : '-'}
                        sortable
                        style={{ width: '12%' }}
                    />
                    <Column
                        field="status"
                        header="Statut"
                        body={(row) => (
                            <Tag
                                value="COMPLÉTÉ"
                                severity="success"
                            />
                        )}
                        style={{ width: '8%' }}
                    />
                </DataTable>
                <div className="mt-3 p-3 surface-100 border-round">
                    <p className="text-sm text-color-secondary m-0">
                        <i className="pi pi-info-circle mr-2"></i>
                        Utilisez la barre de recherche pour filtrer les dossiers. Cliquez sur une ligne pour sélectionner
                        un crédit et charger automatiquement ses informations dans le formulaire de demande.
                    </p>
                </div>
            </Dialog>

            {/* Dialog Approbation avec Vérification Bordereau */}
            <Dialog
                visible={showApprovalDialog}
                onHide={() => {
                    setShowApprovalDialog(false);
                    setApprovalTarget(null);
                    setBordereauNumber('');
                    setBordereauError('');
                    setBordereauValid(false);
                    setBordereauDetails('');
                    setBordereauAmount(null);
                }}
                header="Approbation - Vérification du Bordereau de Dépôt"
                style={{ width: '550px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowApprovalDialog(false)}
                        />
                        <Button
                            label="Approuver"
                            icon="pi pi-check"
                            severity="success"
                            onClick={confirmApproval}
                            disabled={!bordereauValid}
                            loading={approving}
                        />
                    </div>
                }
            >
                {approvalTarget && (
                    <div>
                        {/* Request summary */}
                        <div className="surface-100 p-3 border-round mb-3">
                            <div className="grid">
                                <div className="col-6">
                                    <small className="text-600">N° Demande</small>
                                    <p className="mt-1 mb-0 font-semibold">{approvalTarget.requestNumber}</p>
                                </div>
                                <div className="col-6">
                                    <small className="text-600">Montant Total</small>
                                    <p className="mt-1 mb-0 font-semibold text-primary">
                                        {approvalTarget.totalSettlementAmount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bordereau input */}
                        <div className="field mb-3">
                            <label htmlFor="bordereauNumber" className="font-semibold mb-2 block">
                                <i className="pi pi-file mr-2"></i>
                                N° Bordereau de Dépôt *
                            </label>
                            <div className="p-inputgroup">
                                <InputText
                                    id="bordereauNumber"
                                    value={bordereauNumber}
                                    onChange={(e) => {
                                        setBordereauNumber(e.target.value);
                                        setBordereauValid(false);
                                        setBordereauError('');
                                        setBordereauDetails('');
                                        setBordereauAmount(null);
                                    }}
                                    placeholder="Ex: DS20260207..."
                                    className={bordereauError ? 'p-invalid' : bordereauValid ? 'p-valid' : ''}
                                />
                                <Button
                                    icon={checkingBordereau ? 'pi pi-spin pi-spinner' : 'pi pi-search'}
                                    severity="info"
                                    onClick={checkBordereau}
                                    disabled={checkingBordereau || !bordereauNumber.trim()}
                                    tooltip="Vérifier le bordereau"
                                />
                            </div>
                            <small className="text-500">
                                Saisissez le numéro du bordereau de dépôt et cliquez sur Vérifier
                            </small>
                        </div>

                        {/* Validation result */}
                        {bordereauError && (
                            <Message severity="error" text={bordereauError} className="w-full mb-3" />
                        )}

                        {bordereauValid && (
                            <div className="mb-3">
                                <Message severity="success" text="Bordereau vérifié avec succès" className="w-full mb-2" />
                                <div className="surface-50 p-3 border-round border-1 border-green-200">
                                    <div className="flex align-items-center gap-2 mb-2">
                                        <i className="pi pi-check-circle text-green-500"></i>
                                        <span className="font-semibold">Bordereau validé</span>
                                    </div>
                                    {bordereauDetails && (
                                        <p className="text-sm text-600 m-0 mb-1">{bordereauDetails}</p>
                                    )}
                                    {bordereauAmount != null && bordereauAmount > 0 && (
                                        <p className="text-sm font-semibold text-primary m-0">
                                            Montant du bordereau: {bordereauAmount.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {!bordereauValid && !bordereauError && (
                            <Message
                                severity="warn"
                                text="Vous devez vérifier un bordereau de dépôt valide avant d'approuver cette demande."
                                className="w-full"
                            />
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default RemboursementAnticipePage;
