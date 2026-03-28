'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { TabView, TabPanel } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Divider } from 'primereact/divider';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { InternalAccount, InternalAccountClass, InternalAccountOperation, CptCashCount, CptJournal } from '../types';
import InternalAccountForm from './InternalAccountForm';
import { useAuthorities } from '../../../../hooks/useAuthorities';

const DENOMINATIONS = [
    { field: 'bill10000', label: 'Billets 10 000 FBu', value: 10000 },
    { field: 'bill5000', label: 'Billets 5 000 FBu', value: 5000 },
    { field: 'bill2000', label: 'Billets 2 000 FBu', value: 2000 },
    { field: 'bill1000', label: 'Billets 1 000 FBu', value: 1000 },
    { field: 'bill500', label: 'Billets 500 FBu', value: 500 },
    { field: 'coin100', label: 'Pieces 100 FBu', value: 100 },
    { field: 'coin50', label: 'Pieces 50 FBu', value: 50 },
    { field: 'coin10', label: 'Pieces 10 FBu', value: 10 },
    { field: 'coin5', label: 'Pieces 5 FBu', value: 5 },
    { field: 'coin1', label: 'Pieces 1 FBu', value: 1 },
];

const formatNumber = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('fr-FR');
};

const formatDate = (value: string | undefined | null): string => {
    if (!value) return '';
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
    } catch {
        return value;
    }
};

export default function ComptesInternesPage() {
    const toast = useRef<Toast>(null);
    const { hasAuthority } = useAuthorities();

    // Separate useConsumApi instances for each concern
    const { data: accountsData, loading: accountsLoading, error: accountsError, fetchData: fetchAccounts, callType: accountsCallType } = useConsumApi('');
    const { data: crudData, loading: crudLoading, error: crudError, fetchData: fetchCrud, callType: crudCallType } = useConsumApi('');
    const { data: comptesData, fetchData: fetchComptes, callType: comptesCallType } = useConsumApi('');
    const { data: branchesData, fetchData: fetchBranches, callType: branchesCallType } = useConsumApi('');  // branches for movement display
    const { data: mouvementsData, loading: mouvementsLoading, fetchData: fetchMouvements, callType: mouvementsCallType } = useConsumApi('');
    const { data: manualOpData, loading: manualOpLoading, error: manualOpError, fetchData: fetchManualOp, callType: manualOpCallType } = useConsumApi('');
    const { data: operationsData, loading: operationsLoading, error: operationsError, fetchData: fetchOperations, callType: operationsCallType } = useConsumApi('');
    const { data: validateData, loading: validateLoading, error: validateError, fetchData: fetchValidate, callType: validateCallType } = useConsumApi('');
    const { data: billetageData, loading: billetageLoading, error: billetageError, fetchData: fetchBilletage, callType: billetageCallType } = useConsumApi('');
    const { data: journauxData, fetchData: fetchJournaux, callType: journauxCallType } = useConsumApi('');

    // Data lists
    const [accounts, setAccounts] = useState<any[]>([]);
    const [comptes, setComptes] = useState<any[]>([]);
    const [journaux, setJournaux] = useState<CptJournal[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [mouvements, setMouvements] = useState<any[]>([]);
    const [operations, setOperations] = useState<any[]>([]);

    // Form state
    const [account, setAccount] = useState<InternalAccount>(new InternalAccountClass());
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    // Dialogs
    const [createDialog, setCreateDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [depotDialog, setDepotDialog] = useState(false);
    const [retraitDialog, setRetraitDialog] = useState(false);
    const [transfertDialog, setTransfertDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);

    // Operations state
    const [selectedOperation, setSelectedOperation] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [operationStatusFilter, setOperationStatusFilter] = useState<string | null>(null);

    // Manual operations state
    const [manualMontant, setManualMontant] = useState<number>(0);
    const [manualLibelle, setManualLibelle] = useState('');
    const [contrepartieAccount, setContrepartieAccount] = useState<any>(null);
    const [transfertDestAccount, setTransfertDestAccount] = useState<any>(null);

    // Mouvement filters
    const [selectedAccountForMvt, setSelectedAccountForMvt] = useState<any>(null);
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);

    // Billetage
    const [billetageVisible, setBilletageVisible] = useState(false);
    const [billetageAccount, setBilletageAccount] = useState<any>(null);
    const [billetageCount, setBilletageCount] = useState<CptCashCount>(new CptCashCount());
    const [billetageOperationType, setBilletageOperationType] = useState<string>('');

    // Active tab
    const [activeTabIndex, setActiveTabIndex] = useState(0);

    // Global filter
    const [globalFilter, setGlobalFilter] = useState('');

    const BASE_URL = buildApiUrl('/api/comptability/internal-accounts');

    // Load data on mount
    useEffect(() => {
        loadAccounts();
        loadComptes();
        loadJournaux();
        loadBranches();
        loadOperations();
    }, []);

    // Handle accounts list response
    useEffect(() => {
        if (accountsData && accountsCallType === 'loadAccounts') {
            setAccounts(Array.isArray(accountsData) ? accountsData : []);
        }
        if (accountsError && accountsCallType === 'loadAccounts') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: accountsError.message || 'Erreur chargement comptes', life: 5000 });
        }
    }, [accountsData, accountsError, accountsCallType]);

    // Handle comptes response
    useEffect(() => {
        if (comptesData && comptesCallType === 'loadComptes') {
            setComptes(Array.isArray(comptesData) ? comptesData : []);
        }
    }, [comptesData, comptesCallType]);

    // Handle journaux response
    useEffect(() => {
        if (journauxData && journauxCallType === 'loadJournaux') {
            setJournaux(Array.isArray(journauxData) ? journauxData : []);
        }
    }, [journauxData, journauxCallType]);

    // Handle branches response
    useEffect(() => {
        if (branchesData && branchesCallType === 'loadBranches') {
            setBranches(Array.isArray(branchesData) ? branchesData : []);
        }
    }, [branchesData, branchesCallType]);

    // Handle mouvements response
    useEffect(() => {
        if (mouvementsData && mouvementsCallType === 'loadMouvements') {
            setMouvements(Array.isArray(mouvementsData) ? mouvementsData : []);
        }
    }, [mouvementsData, mouvementsCallType]);

    // Handle operations list response
    useEffect(() => {
        if (operationsData && operationsCallType === 'loadOperations') {
            setOperations(Array.isArray(operationsData) ? operationsData : []);
        }
        if (operationsError && operationsCallType === 'loadOperations') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: operationsError.message || 'Erreur chargement opérations', life: 5000 });
        }
    }, [operationsData, operationsError, operationsCallType]);

    // Handle validate/reject responses
    useEffect(() => {
        if (validateData) {
            switch (validateCallType) {
                case 'validateOperation':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Opération validée avec succès', life: 3000 });
                    loadOperations();
                    loadAccounts();
                    break;
                case 'rejectOperation':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Opération rejetée', life: 3000 });
                    setRejectDialog(false);
                    setRejectionReason('');
                    setSelectedOperation(null);
                    loadOperations();
                    break;
            }
        }
        if (validateError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: validateError.message || 'Une erreur est survenue', life: 5000 });
        }
    }, [validateData, validateError, validateCallType]);

    // Handle CRUD responses (create, update, delete)
    useEffect(() => {
        if (crudData) {
            switch (crudCallType) {
                case 'createAccount':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Compte interne créé', life: 3000 });
                    setCreateDialog(false);
                    resetForm();
                    loadAccounts();
                    break;
                case 'updateAccount':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Compte interne mis à jour', life: 3000 });
                    setEditDialog(false);
                    resetForm();
                    loadAccounts();
                    break;
            }
        }
        if (crudError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: crudError.message || 'Une erreur est survenue', life: 5000 });
        }
    }, [crudData, crudError, crudCallType]);

    // Handle depot/retrait/transfert responses (now creates PENDING operations)
    useEffect(() => {
        if (manualOpData) {
            switch (manualOpCallType) {
                case 'depotAccount':
                    toast.current?.show({ severity: 'info', summary: 'Opération créée', detail: `Dépôt de ${formatNumber(manualOpData.montant)} FBU sur ${selectedAccount?.accountNumber} - ${selectedAccount?.libelle}. En attente de validation.`, life: 5000 });
                    // Trigger billetage for depot
                    if (selectedAccount) {
                        setBilletageAccount({ ...selectedAccount, lastOpMontant: manualOpData.montant });
                        setBilletageOperationType('Depot');
                        setBilletageCount(new CptCashCount());
                        setBilletageVisible(true);
                    }
                    setDepotDialog(false);
                    setManualMontant(0);
                    setManualLibelle('');
                    loadOperations();
                    setActiveTabIndex(2);
                    break;
                case 'retraitAccount':
                    toast.current?.show({ severity: 'info', summary: 'Opération créée', detail: `Retrait de ${formatNumber(manualOpData.montant)} FBU sur ${selectedAccount?.accountNumber} - ${selectedAccount?.libelle}. En attente de validation.`, life: 5000 });
                    // Trigger billetage for retrait
                    if (selectedAccount) {
                        setBilletageAccount({ ...selectedAccount, lastOpMontant: manualOpData.montant });
                        setBilletageOperationType('Retrait');
                        setBilletageCount(new CptCashCount());
                        setBilletageVisible(true);
                    }
                    setRetraitDialog(false);
                    setManualMontant(0);
                    setManualLibelle('');
                    loadOperations();
                    setActiveTabIndex(2);
                    break;
                case 'transfertAccount':
                    toast.current?.show({ severity: 'info', summary: 'Opération créée', detail: `Transfert de ${formatNumber(manualOpData.montant)} FBU de ${selectedAccount?.accountNumber} vers ${transfertDestAccount?.accountNumber}. En attente de validation.`, life: 5000 });
                    setTransfertDialog(false);
                    setManualMontant(0);
                    setManualLibelle('');
                    setTransfertDestAccount(null);
                    loadOperations();
                    setActiveTabIndex(2);
                    break;
            }
        }
        if (manualOpError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: manualOpError.message || 'Une erreur est survenue', life: 5000 });
        }
    }, [manualOpData, manualOpError, manualOpCallType]);

    // Handle billetage response
    useEffect(() => {
        if (billetageData && billetageCallType === 'saveBilletage') {
            const result = billetageData as any;
            const ecart = result.ecart || 0;
            toast.current?.show({
                severity: Math.abs(ecart) > 0.01 ? 'warn' : 'success',
                summary: 'Billetage enregistre',
                detail: Math.abs(ecart) > 0.01
                    ? `Total physique: ${formatNumber(result.totalPhysique)} FBu — Ecart: ${formatNumber(ecart)} FBu`
                    : `Total physique: ${formatNumber(result.totalPhysique)} FBu — Pas d'ecart`,
                life: 5000
            });
            setBilletageVisible(false);
            setBilletageAccount(null);
            setBilletageCount(new CptCashCount());
        }
        if (billetageError && billetageCallType === 'saveBilletage') {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: billetageError.message || 'Erreur lors du billetage', life: 5000 });
        }
    }, [billetageData, billetageError, billetageCallType]);

    const loadAccounts = () => {
        fetchAccounts(null, 'GET', `${BASE_URL}/findall`, 'loadAccounts');
    };

    const loadComptes = () => {
        fetchComptes(null, 'GET', buildApiUrl('/api/comptability/comptes/findall'), 'loadComptes');
    };

    const loadJournaux = () => {
        fetchJournaux(null, 'GET', buildApiUrl('/api/comptability/journaux/findall'), 'loadJournaux');
    };

    const loadBranches = () => {
        fetchBranches(null, 'GET', buildApiUrl('/api/reference-data/branches/findactive'), 'loadBranches');
    };

    const loadMouvements = (accountId: number, dateFrom?: string, dateTo?: string) => {
        let url = `${BASE_URL}/mouvements/${accountId}`;
        if (dateFrom && dateTo) {
            url += `?dateFrom=${dateFrom}&dateTo=${dateTo}`;
        }
        fetchMouvements(null, 'GET', url, 'loadMouvements');
    };

    const loadOperations = () => {
        fetchOperations(null, 'GET', `${BASE_URL}/operations`, 'loadOperations');
    };

    const resetForm = () => {
        setAccount(new InternalAccountClass());
        setSelectedAccount(null);
    };

    // Form handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setAccount(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    // CRUD actions
    const saveAccount = () => {
        if (!account.compteComptableId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un compte comptable', life: 3000 });
            return;
        }
        const dataToSend = { ...account, userAction: getUserAction() };
        fetchCrud(dataToSend, 'POST', `${BASE_URL}/new`, 'createAccount');
    };

    const updateAccount = () => {
        if (!selectedAccount?.accountId) return;
        const dataToSend = { ...account, userAction: getUserAction() };
        fetchCrud(dataToSend, 'PUT', `${BASE_URL}/update/${selectedAccount.accountId}`, 'updateAccount');
    };

    const toggleAccountStatus = (rowData: any) => {
        const action = rowData.actif ? 'Désactiver' : 'Activer';
        confirmDialog({
            message: `${action} le compte interne ${rowData.accountNumber} - ${rowData.libelle} ?`,
            header: 'Confirmation',
            icon: rowData.actif ? 'pi pi-ban' : 'pi pi-check-circle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchCrud({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/toggle-status/${rowData.accountId}`, 'updateAccount');
            }
        });
    };

    const openEditDialog = (rowData: any) => {
        setSelectedAccount(rowData);
        setAccount({ ...rowData });
        setEditDialog(true);
    };

    const openViewDialog = (rowData: any) => {
        setSelectedAccount(rowData);
        setAccount({ ...rowData });
        setViewDialog(true);
    };

    const openDepotDialog = (rowData: any) => {
        setSelectedAccount(rowData);
        setManualMontant(0);
        setManualLibelle('');
        setContrepartieAccount(null);
        setDepotDialog(true);
    };

    const openRetraitDialog = (rowData: any) => {
        setSelectedAccount(rowData);
        setManualMontant(0);
        setManualLibelle('');
        setContrepartieAccount(null);
        setRetraitDialog(true);
    };

    const openTransfertDialog = (rowData: any) => {
        setSelectedAccount(rowData);
        setManualMontant(0);
        setManualLibelle('');
        setTransfertDestAccount(null);
        setTransfertDialog(true);
    };

    const executeDepot = () => {
        if (!selectedAccount?.accountId || manualMontant <= 0) return;
        if (!contrepartieAccount) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner le compte de contrepartie', life: 3000 });
            return;
        }
        fetchManualOp({
            montant: manualMontant,
            libelle: manualLibelle,
            contrepartieAccountId: contrepartieAccount.accountId,
            userAction: getUserAction()
        }, 'POST', `${BASE_URL}/depot/${selectedAccount.accountId}`, 'depotAccount');
    };

    const executeRetrait = () => {
        if (!selectedAccount?.accountId || manualMontant <= 0) return;
        if (!contrepartieAccount) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner le compte de contrepartie', life: 3000 });
            return;
        }
        if (manualMontant > (selectedAccount?.soldeActuel ?? 0)) {
            toast.current?.show({ severity: 'warn', summary: 'Solde insuffisant', detail: `Le solde actuel (${formatNumber(selectedAccount?.soldeActuel)} FBU) est insuffisant pour un retrait de ${formatNumber(manualMontant)} FBU.`, life: 5000 });
            return;
        }
        fetchManualOp({
            montant: manualMontant,
            libelle: manualLibelle,
            contrepartieAccountId: contrepartieAccount.accountId,
            userAction: getUserAction()
        }, 'POST', `${BASE_URL}/retrait/${selectedAccount.accountId}`, 'retraitAccount');
    };

    const executeTransfert = () => {
        if (!selectedAccount?.accountId || !transfertDestAccount?.accountId || manualMontant <= 0) return;
        if (selectedAccount.accountId === transfertDestAccount.accountId) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Le compte source et destination doivent être différents', life: 3000 });
            return;
        }
        if (manualMontant > (selectedAccount?.soldeActuel ?? 0)) {
            toast.current?.show({ severity: 'warn', summary: 'Solde insuffisant', detail: `Le solde actuel du compte source (${formatNumber(selectedAccount?.soldeActuel)} FBU) est insuffisant pour un transfert de ${formatNumber(manualMontant)} FBU.`, life: 5000 });
            return;
        }
        fetchManualOp({
            sourceAccountId: selectedAccount.accountId,
            destAccountId: transfertDestAccount.accountId,
            montant: manualMontant,
            libelle: manualLibelle,
            userAction: getUserAction()
        }, 'POST', `${BASE_URL}/transfert`, 'transfertAccount');
    };

    // Billetage handlers
    const CAISSE_BASE_URL = buildApiUrl('/api/comptability/caisses');

    const calculateBilletageTotal = (): number => {
        return DENOMINATIONS.reduce((sum, d) => sum + ((billetageCount as any)[d.field] || 0) * d.value, 0);
    };

    const handleBilletageDenominationChange = (field: string, value: number) => {
        setBilletageCount(prev => ({ ...prev, [field]: value || 0 }));
    };

    const handleSaveBilletage = () => {
        if (!billetageAccount) return;
        // Try to find linked caisse by compteComptable
        const linkedCaisseId = billetageAccount.caisseId || billetageAccount.accountId;
        const dataToSend = { ...billetageCount, userAction: getUserAction() };
        fetchBilletage(dataToSend, 'POST', `${CAISSE_BASE_URL}/billetage/${linkedCaisseId}`, 'saveBilletage');
    };

    const handleSkipBilletage = () => {
        setBilletageVisible(false);
        setBilletageAccount(null);
        setBilletageCount(new CptCashCount());
    };

    // Operation validation
    const validateOperation = (op: any) => {
        confirmDialog({
            message: `Valider cette opération de ${op.operationType} de ${formatNumber(op.montant)} FBU ?`,
            header: 'Confirmer la validation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Valider',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-success',
            accept: () => {
                fetchValidate({ userAction: getUserAction() }, 'POST', `${BASE_URL}/operations/validate/${op.operationId}`, 'validateOperation');
            }
        });
    };

    const openRejectDialog = (op: any) => {
        setSelectedOperation(op);
        setRejectionReason('');
        setRejectDialog(true);
    };

    const executeReject = () => {
        if (!selectedOperation?.operationId) return;
        fetchValidate({
            rejectionReason: rejectionReason,
            userAction: getUserAction()
        }, 'POST', `${BASE_URL}/operations/reject/${selectedOperation.operationId}`, 'rejectOperation');
    };

    // Mouvement tab handlers
    const handleAccountSelectionForMvt = (acc: any) => {
        setSelectedAccountForMvt(acc);
        setDateDebut(null);
        setDateFin(null);
        if (acc?.accountId) {
            loadMouvements(acc.accountId);
        } else {
            setMouvements([]);
        }
    };

    const handleDateDebutChange = (date: Date | null) => {
        setDateDebut(date);
        if (selectedAccountForMvt?.accountId) {
            if (date && dateFin) {
                const dateFrom = date.toISOString().split('T')[0];
                const dateToStr = dateFin.toISOString().split('T')[0];
                loadMouvements(selectedAccountForMvt.accountId, dateFrom, dateToStr);
            } else if (!date && !dateFin) {
                loadMouvements(selectedAccountForMvt.accountId);
            }
        }
    };

    const handleDateFinChange = (date: Date | null) => {
        setDateFin(date);
        if (selectedAccountForMvt?.accountId) {
            if (dateDebut && date) {
                const dateFrom = dateDebut.toISOString().split('T')[0];
                const dateToStr = date.toISOString().split('T')[0];
                loadMouvements(selectedAccountForMvt.accountId, dateFrom, dateToStr);
            } else if (!dateDebut && !date) {
                loadMouvements(selectedAccountForMvt.accountId);
            }
        }
    };

    // Templates
    const soldeBodyTemplate = (rowData: any) => {
        const val = rowData.soldeActuel ?? 0;
        return <span className={val < 0 ? 'text-red-500 font-bold' : 'font-bold'}>{formatNumber(val)} FBU</span>;
    };

    const actifBodyTemplate = (rowData: any) => {
        return <Tag value={rowData.actif ? 'Actif' : 'Inactif'} severity={rowData.actif ? 'success' : 'danger'} />;
    };

    const canDepot = hasAuthority('ACCOUNTING_INTERNAL_DEPOT');
    const canRetrait = hasAuthority('ACCOUNTING_INTERNAL_RETRAIT');
    const canTransfert = hasAuthority('ACCOUNTING_INTERNAL_TRANSFERT');
    const canValidateDepot = hasAuthority('ACCOUNTING_INTERNAL_VALIDATE_DEPOT');
    const canValidateRetrait = hasAuthority('ACCOUNTING_INTERNAL_VALIDATE_RETRAIT');
    const canValidateTransfert = hasAuthority('ACCOUNTING_INTERNAL_VALIDATE_TRANSFERT');
    const canToggleStatus = hasAuthority('ACCOUNTING_INTERNAL_TOGGLE_STATUS');

    const canValidateOp = (op: any) => {
        if (op.status !== 'PENDING') return false;
        // Check if source account is active
        const sourceAcc = accounts.find((a: any) => a.accountId === op.sourceAccountId);
        if (sourceAcc && !sourceAcc.actif) return false;
        // Check if dest account is active (for transfers)
        if (op.destAccountId) {
            const destAcc = accounts.find((a: any) => a.accountId === op.destAccountId);
            if (destAcc && !destAcc.actif) return false;
        }
        switch (op.operationType) {
            case 'DEPOT': return canValidateDepot;
            case 'RETRAIT': return canValidateRetrait;
            case 'TRANSFERT': return canValidateTransfert;
            default: return false;
        }
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-eye" rounded text severity="info" onClick={() => openViewDialog(rowData)} tooltip="Voir" />
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => openEditDialog(rowData)} tooltip="Modifier" />
                {canDepot && rowData.actif && rowData.depotEnabled && <Button icon="pi pi-arrow-down" rounded text severity="success" onClick={() => openDepotDialog(rowData)} tooltip="Dépôt" />}
                {canRetrait && rowData.actif && rowData.retraitEnabled && <Button icon="pi pi-arrow-up" rounded text severity="danger" onClick={() => openRetraitDialog(rowData)} tooltip="Retrait" />}
                {canTransfert && rowData.actif && <Button icon="pi pi-arrow-right-arrow-left" rounded text severity="help" onClick={() => openTransfertDialog(rowData)} tooltip="Transfert" />}
                {canToggleStatus && <Button icon={rowData.actif ? 'pi pi-ban' : 'pi pi-check-circle'} rounded text severity={rowData.actif ? 'warning' : 'success'}
                    onClick={() => toggleAccountStatus(rowData)} tooltip={rowData.actif ? 'Désactiver' : 'Activer'} />}
            </div>
        );
    };

    const sensBodyTemplate = (rowData: any) => {
        return <Tag value={rowData.sens} severity={rowData.sens === 'ENTREE' ? 'success' : 'danger'} />;
    };

    const entreeBodyTemplate = (rowData: any) => {
        const val = rowData.entree ?? 0;
        return val > 0 ? <span className="text-green-500 font-bold">{formatNumber(val)}</span> : <span>-</span>;
    };

    const sortieBodyTemplate = (rowData: any) => {
        const val = rowData.sortie ?? 0;
        return val > 0 ? <span className="text-red-500 font-bold">{formatNumber(val)}</span> : <span>-</span>;
    };

    const soldeAvantBodyTemplate = (rowData: any) => {
        return <span>{formatNumber(rowData.soldeAvant)}</span>;
    };

    const soldeApresBodyTemplate = (rowData: any) => {
        return <span className="font-bold">{formatNumber(rowData.soldeApres)}</span>;
    };

    // Operation templates
    const operationTypeTemplate = (rowData: any) => {
        const iconMap: any = {
            DEPOT: 'pi pi-arrow-down', RETRAIT: 'pi pi-arrow-up', TRANSFERT: 'pi pi-arrow-right-arrow-left',
            DEPOT_CAISSE: 'pi pi-arrow-down', RETRAIT_CAISSE: 'pi pi-arrow-up'
        };
        const colorMap: any = {
            DEPOT: 'success', RETRAIT: 'danger', TRANSFERT: 'help',
            DEPOT_CAISSE: 'success', RETRAIT_CAISSE: 'danger'
        };
        const labelMap: any = {
            DEPOT: 'Depot', RETRAIT: 'Retrait', TRANSFERT: 'Transfert',
            DEPOT_CAISSE: 'Depot (Caisse)', RETRAIT_CAISSE: 'Retrait (Caisse)'
        };
        return <Tag icon={iconMap[rowData.operationType]} value={labelMap[rowData.operationType] || rowData.operationType} severity={colorMap[rowData.operationType] || 'info'} />;
    };

    const operationStatusTemplate = (rowData: any) => {
        const statusMap: any = { PENDING: { label: 'En attente', severity: 'warning' }, VALIDATED: { label: 'Validée', severity: 'success' }, REJECTED: { label: 'Rejetée', severity: 'danger' } };
        const s = statusMap[rowData.status] || { label: rowData.status, severity: 'info' };
        return <Tag value={s.label} severity={s.severity} />;
    };

    const operationSourceTemplate = (rowData: any) => {
        const acc = accounts.find((a: any) => a.accountId === rowData.sourceAccountId);
        return acc ? <span>{acc.accountNumber} - {acc.libelle}</span> : <span>ID: {rowData.sourceAccountId}</span>;
    };

    const operationDestTemplate = (rowData: any) => {
        if (!rowData.destAccountId) return <span>-</span>;
        const acc = accounts.find((a: any) => a.accountId === rowData.destAccountId);
        return acc ? <span>{acc.accountNumber} - {acc.libelle}</span> : <span>ID: {rowData.destAccountId}</span>;
    };

    const operationMontantTemplate = (rowData: any) => {
        return <span className="font-bold">{formatNumber(rowData.montant)} FBU</span>;
    };

    const operationDateTemplate = (rowData: any) => {
        if (!rowData.createdAt) return '';
        try {
            const d = new Date(rowData.createdAt);
            return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
        } catch { return rowData.createdAt; }
    };

    const operationAuditTemplate = (rowData: any) => {
        const formatDateTime = (dt: string | null) => {
            if (!dt) return '';
            try {
                const d = new Date(dt);
                return new Intl.DateTimeFormat('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
            } catch { return dt; }
        };
        if (rowData.status === 'VALIDATED') {
            return (
                <div>
                    <small className="text-green-500 block"><i className="pi pi-check mr-1"></i>{rowData.validatedBy}</small>
                    <small className="text-500">{formatDateTime(rowData.validatedAt)}</small>
                </div>
            );
        }
        if (rowData.status === 'REJECTED') {
            return (
                <div>
                    <small className="text-red-500 block"><i className="pi pi-times mr-1"></i>{rowData.rejectedBy}</small>
                    <small className="text-500">{formatDateTime(rowData.rejectedAt)}</small>
                    {rowData.rejectionReason && <small className="block mt-1 text-orange-500" title={rowData.rejectionReason}>{rowData.rejectionReason.length > 30 ? rowData.rejectionReason.substring(0, 30) + '...' : rowData.rejectionReason}</small>}
                </div>
            );
        }
        return <small className="text-500">En attente</small>;
    };

    const operationActionsTemplate = (rowData: any) => {
        if (rowData.status !== 'PENDING') return null;
        return (
            <div className="flex gap-1">
                {canValidateOp(rowData) && (
                    <Button icon="pi pi-check" rounded text severity="success" onClick={() => validateOperation(rowData)}
                        tooltip="Valider" loading={validateLoading && validateCallType === 'validateOperation'} />
                )}
                {canValidateOp(rowData) && (
                    <Button icon="pi pi-times" rounded text severity="danger" onClick={() => openRejectDialog(rowData)}
                        tooltip="Rejeter" />
                )}
            </div>
        );
    };

    const filteredOperations = operationStatusFilter
        ? operations.filter((op: any) => op.status === operationStatusFilter)
        : operations;

    const statusFilterOptions = [
        { label: 'Toutes', value: null },
        { label: 'En attente', value: 'PENDING' },
        { label: 'Validées', value: 'VALIDATED' },
        { label: 'Rejetées', value: 'REJECTED' }
    ];

    // Toolbar
    const leftToolbarTemplate = () => {
        return (
            <div className="flex gap-2">
                <Button label="Nouveau Compte" icon="pi pi-plus" severity="success" onClick={() => { resetForm(); setCreateDialog(true); }} />
                <Button label="Actualiser" icon="pi pi-refresh" severity="secondary" onClick={loadAccounts} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        );
    };

    const branchNameTemplate = (rowData: any) => {
        if (!rowData.branchId) return '-';
        const branch = branches.find((b: any) => String(b.id) === String(rowData.branchId));
        return branch ? branch.name : rowData.branchId;
    };

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <ConfirmDialog />

                    <h4>
                        <i className="pi pi-building mr-2"></i>
                        Comptes Internes
                    </h4>

                    <TabView activeIndex={activeTabIndex} onTabChange={(e) => setActiveTabIndex(e.index)}>
                        {/* Tab 1: Account List */}
                        <TabPanel header="Comptes Internes" leftIcon="pi pi-list mr-2">
                            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />
                            <DataTable
                                value={accounts}
                                paginator
                                rows={20}
                                rowsPerPageOptions={[10, 20, 50]}
                                globalFilter={globalFilter}
                                emptyMessage="Aucun compte interne trouvé"
                                loading={accountsLoading}
                                stripedRows
                                sortField="accountNumber"
                                sortOrder={1}
                                size="small"
                            >
                                <Column field="accountNumber" header="N° Compte" sortable style={{ width: '120px' }} />
                                <Column field="codeCompte" header="Code Comptable" sortable style={{ width: '130px' }} />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column header="Journal" sortable sortField="journalId" style={{ width: '100px' }}
                                    body={(r: InternalAccount) => {
                                        if (!r.journalId) return <span className="text-300">-</span>;
                                        const j = journaux.find((j: CptJournal) => String(j.journalId) === String(r.journalId));
                                        return j ? <span>{j.codeJournal}</span> : <span>{r.journalId}</span>;
                                    }}
                                />
                                <Column header="Solde Actuel" body={soldeBodyTemplate} sortable sortField="soldeActuel" style={{ width: '160px' }} />
                                <Column header="Statut" body={actifBodyTemplate} style={{ width: '80px' }} />
                                <Column header="Actions" body={actionBodyTemplate} style={{ width: '300px' }} />
                            </DataTable>
                        </TabPanel>

                        {/* Tab 2: Movement Journal */}
                        <TabPanel header="Journal des Mouvements" leftIcon="pi pi-book mr-2">
                            <div className="grid mb-4">
                                <div className="col-12 md:col-6">
                                    <label className="font-medium block mb-2">Sélectionner un compte</label>
                                    <Dropdown
                                        value={selectedAccountForMvt}
                                        options={accounts}
                                        onChange={(e) => handleAccountSelectionForMvt(e.value)}
                                        optionLabel="accountNumber"
                                        placeholder="Choisir un compte..."
                                        filter
                                        filterBy="accountNumber,libelle"
                                        className="w-full"
                                        itemTemplate={(item: any) => (
                                            <span>{item.accountNumber} - {item.libelle} ({formatNumber(item.soldeActuel)} FBU)</span>
                                        )}
                                        valueTemplate={(item: any, props: any) => {
                                            if (item) return <span>{item.accountNumber} - {item.libelle}</span>;
                                            return <span>{props?.placeholder}</span>;
                                        }}
                                    />
                                </div>
                                <div className="col-12 md:col-2">
                                    <label className="font-medium block mb-2">Date début</label>
                                    <Calendar
                                        value={dateDebut}
                                        onChange={(e) => handleDateDebutChange(e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        showButtonBar
                                        className="w-full"
                                        placeholder="Date début"
                                    />
                                </div>
                                <div className="col-12 md:col-2">
                                    <label className="font-medium block mb-2">Date fin</label>
                                    <Calendar
                                        value={dateFin}
                                        onChange={(e) => handleDateFinChange(e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        showButtonBar
                                        className="w-full"
                                        placeholder="Date fin"
                                    />
                                </div>
                                {selectedAccountForMvt && (
                                    <div className="col-12 md:col-3 flex align-items-end">
                                        <div className="surface-100 p-3 border-round w-full text-center">
                                            <small className="text-500">Solde actuel</small>
                                            <div className="text-xl font-bold text-primary">
                                                {formatNumber(selectedAccountForMvt.soldeActuel)} FBU
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DataTable
                                value={mouvements}
                                paginator
                                rows={20}
                                rowsPerPageOptions={[10, 20, 50, 100]}
                                emptyMessage={selectedAccountForMvt ? "Aucun mouvement trouvé" : "Sélectionnez un compte pour voir les mouvements"}
                                loading={mouvementsLoading}
                                stripedRows
                                size="small"
                            >
                                <Column field="date" header="Date" style={{ width: '100px' }} body={(row: any) => formatDate(row.date)} />
                                <Column field="heure" header="Heure" style={{ width: '60px' }} />
                                <Column header="Agence" body={(row: any) => branchNameTemplate(row)} style={{ width: '120px' }} />
                                <Column field="operationType" header="Type" style={{ width: '140px' }} />
                                <Column header="Sens" body={sensBodyTemplate} style={{ width: '80px' }} />
                                <Column header="Entrée" body={entreeBodyTemplate} style={{ width: '120px' }} />
                                <Column header="Sortie" body={sortieBodyTemplate} style={{ width: '120px' }} />
                                <Column field="reference" header="Référence" style={{ width: '180px' }} />
                                <Column field="libelle" header="Libellé" />
                                <Column header="Solde Avant" body={soldeAvantBodyTemplate} style={{ width: '120px' }} />
                                <Column header="Solde Après" body={soldeApresBodyTemplate} style={{ width: '120px' }} />
                            </DataTable>
                        </TabPanel>

                        {/* Tab 3: Operations (validation workflow) */}
                        <TabPanel header="Opérations" leftIcon="pi pi-check-square mr-2">
                            <div className="flex justify-content-between align-items-center mb-4">
                                <div className="flex gap-2 align-items-center">
                                    <label className="font-medium">Statut:</label>
                                    <Dropdown
                                        value={operationStatusFilter}
                                        options={statusFilterOptions}
                                        onChange={(e) => setOperationStatusFilter(e.value)}
                                        placeholder="Toutes"
                                        className="w-12rem"
                                    />
                                </div>
                                <Button label="Actualiser" icon="pi pi-refresh" severity="secondary" onClick={loadOperations} />
                            </div>

                            <DataTable
                                value={filteredOperations}
                                paginator
                                rows={20}
                                rowsPerPageOptions={[10, 20, 50]}
                                emptyMessage="Aucune opération trouvée"
                                loading={operationsLoading}
                                stripedRows
                                size="small"
                                sortField="createdAt"
                                sortOrder={-1}
                            >
                                <Column header="Date" body={operationDateTemplate} sortable sortField="createdAt" style={{ width: '150px' }} />
                                <Column header="Type" body={operationTypeTemplate} sortable sortField="operationType" style={{ width: '120px' }} />
                                <Column header="Compte Source" body={operationSourceTemplate} />
                                <Column header="Compte Dest." body={operationDestTemplate} />
                                <Column header="Montant" body={operationMontantTemplate} sortable sortField="montant" style={{ width: '150px' }} />
                                <Column field="libelle" header="Libellé" />
                                <Column header="Statut" body={operationStatusTemplate} sortable sortField="status" style={{ width: '110px' }} />
                                <Column field="createdBy" header="Créé par" style={{ width: '120px' }} />
                                <Column header="Traitement" body={operationAuditTemplate} style={{ width: '200px' }} />
                                <Column header="Actions" body={operationActionsTemplate} style={{ width: '100px' }} />
                            </DataTable>
                        </TabPanel>
                    </TabView>

                    {/* Create Dialog */}
                    <Dialog
                        visible={createDialog}
                        onHide={() => setCreateDialog(false)}
                        header="Nouveau Compte Interne"
                        style={{ width: '60vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setCreateDialog(false)} />
                                <Button label="Créer" icon="pi pi-check" severity="success" onClick={saveAccount} loading={crudLoading && crudCallType === 'createAccount'} />
                            </div>
                        }
                    >
                        <InternalAccountForm
                            account={account}
                            handleChange={handleChange}
                            handleDropdownChange={handleDropdownChange}
                            handleNumberChange={handleNumberChange}
                            comptes={comptes}
                            journaux={journaux}
                        />
                    </Dialog>

                    {/* Edit Dialog */}
                    <Dialog
                        visible={editDialog}
                        onHide={() => setEditDialog(false)}
                        header="Modifier Compte Interne"
                        style={{ width: '60vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setEditDialog(false)} />
                                <Button label="Sauvegarder" icon="pi pi-check" severity="warning" onClick={updateAccount} loading={crudLoading && crudCallType === 'updateAccount'} />
                            </div>
                        }
                    >
                        <InternalAccountForm
                            account={account}
                            handleChange={handleChange}
                            handleDropdownChange={handleDropdownChange}
                            handleNumberChange={handleNumberChange}
                            comptes={comptes}
                            journaux={journaux}
                            isEditMode
                        />
                    </Dialog>

                    {/* View Dialog */}
                    <Dialog
                        visible={viewDialog}
                        onHide={() => setViewDialog(false)}
                        header="Détails du Compte Interne"
                        style={{ width: '60vw' }}
                        modal
                    >
                        <InternalAccountForm
                            account={account}
                            handleChange={handleChange}
                            handleDropdownChange={handleDropdownChange}
                            handleNumberChange={handleNumberChange}
                            comptes={comptes}
                            journaux={journaux}
                            isViewMode
                        />
                    </Dialog>

                    {/* Dépôt Dialog */}
                    <Dialog
                        visible={depotDialog}
                        onHide={() => setDepotDialog(false)}
                        header={<span><i className="pi pi-arrow-down mr-2 text-green-500"></i>Dépôt - {selectedAccount?.accountNumber} {selectedAccount?.libelle}</span>}
                        style={{ width: '35vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setDepotDialog(false)} />
                                <Button label="Effectuer le dépôt" icon="pi pi-arrow-down" severity="success" onClick={executeDepot}
                                    disabled={manualMontant <= 0} loading={manualOpLoading && manualOpCallType === 'depotAccount'} />
                            </div>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label className="font-medium">Compte Contrepartie *</label>
                                <Dropdown
                                    value={contrepartieAccount}
                                    options={accounts.filter((a: any) => a.accountId !== selectedAccount?.accountId && a.actif)}
                                    onChange={(e) => setContrepartieAccount(e.value)}
                                    optionLabel="accountNumber"
                                    placeholder="Sélectionner le compte de contrepartie"
                                    className="w-full"
                                    filter
                                    filterBy="accountNumber,codeCompte,libelle"
                                    itemTemplate={(option: any) => (
                                        <span>{option.accountNumber} - {option.codeCompte} - {option.libelle}</span>
                                    )}
                                    valueTemplate={(option: any) => {
                                        return option ? <span>{option.accountNumber} - {option.codeCompte} - {option.libelle}</span> : <span className="text-400">Sélectionner le compte de contrepartie</span>;
                                    }}
                                />
                            </div>
                            <div className="field">
                                <label className="font-medium">Montant *</label>
                                <InputNumber value={manualMontant} onValueChange={(e) => setManualMontant(e.value ?? 0)}
                                    suffix=" FBU" min={0} className="w-full" />
                            </div>
                            <div className="field">
                                <label className="font-medium">Libellé</label>
                                <InputText value={manualLibelle} onChange={(e) => setManualLibelle(e.target.value)}
                                    placeholder="Description du dépôt" className="w-full" />
                            </div>
                            <div className="surface-100 p-3 border-round mt-3">
                                <div className="flex justify-content-between">
                                    <small className="text-500">Solde actuel ({selectedAccount?.codeCompte}):</small>
                                    <b>{formatNumber(selectedAccount?.soldeActuel)} FBU</b>
                                </div>
                                {manualMontant > 0 && (
                                    <div className="flex justify-content-between mt-2">
                                        <small className="text-500">Solde après dépôt:</small>
                                        <b className="text-green-500">{formatNumber((selectedAccount?.soldeActuel ?? 0) + manualMontant)} FBU</b>
                                    </div>
                                )}
                                {contrepartieAccount && manualMontant > 0 && (
                                    <>
                                        <Divider className="my-2" />
                                        <div className="flex justify-content-between">
                                            <small className="text-500">Contrepartie ({contrepartieAccount.codeCompte}):</small>
                                            <b>{formatNumber(contrepartieAccount.soldeActuel)} FBU</b>
                                        </div>
                                        <div className="flex justify-content-between mt-2">
                                            <small className="text-500">Solde après:</small>
                                            <b className="text-red-500">{formatNumber((contrepartieAccount.soldeActuel ?? 0) - manualMontant)} FBU</b>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    {/* Retrait Dialog */}
                    <Dialog
                        visible={retraitDialog}
                        onHide={() => setRetraitDialog(false)}
                        header={<span><i className="pi pi-arrow-up mr-2 text-red-500"></i>Retrait - {selectedAccount?.accountNumber} {selectedAccount?.libelle}</span>}
                        style={{ width: '35vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setRetraitDialog(false)} />
                                <Button label="Effectuer le retrait" icon="pi pi-arrow-up" severity="danger" onClick={executeRetrait}
                                    disabled={manualMontant <= 0 || !contrepartieAccount} loading={manualOpLoading && manualOpCallType === 'retraitAccount'} />
                            </div>
                        }
                    >
                        <div className="p-fluid">
                            <div className="field">
                                <label className="font-medium">Compte Contrepartie *</label>
                                <Dropdown
                                    value={contrepartieAccount}
                                    options={accounts.filter((a: any) => a.accountId !== selectedAccount?.accountId && a.actif)}
                                    onChange={(e) => setContrepartieAccount(e.value)}
                                    optionLabel="accountNumber"
                                    placeholder="Sélectionner le compte de contrepartie"
                                    className="w-full"
                                    filter
                                    filterBy="accountNumber,codeCompte,libelle"
                                    itemTemplate={(option: any) => (
                                        <span>{option.accountNumber} - {option.codeCompte} - {option.libelle}</span>
                                    )}
                                    valueTemplate={(option: any) => {
                                        return option ? <span>{option.accountNumber} - {option.codeCompte} - {option.libelle}</span> : <span className="text-400">Sélectionner le compte de contrepartie</span>;
                                    }}
                                />
                            </div>
                            <div className="field">
                                <label className="font-medium">Montant *</label>
                                <InputNumber value={manualMontant} onValueChange={(e) => setManualMontant(e.value ?? 0)}
                                    suffix=" FBU" min={0} className="w-full" />
                            </div>
                            <div className="field">
                                <label className="font-medium">Libellé</label>
                                <InputText value={manualLibelle} onChange={(e) => setManualLibelle(e.target.value)}
                                    placeholder="Description du retrait" className="w-full" />
                            </div>
                            <div className="surface-100 p-3 border-round mt-3">
                                <div className="flex justify-content-between">
                                    <small className="text-500">Solde actuel ({selectedAccount?.codeCompte}):</small>
                                    <b>{formatNumber(selectedAccount?.soldeActuel)} FBU</b>
                                </div>
                                {manualMontant > 0 && (
                                    <div className="flex justify-content-between mt-2">
                                        <small className="text-500">Solde après retrait:</small>
                                        <b className="text-red-500">{formatNumber((selectedAccount?.soldeActuel ?? 0) - manualMontant)} FBU</b>
                                    </div>
                                )}
                                {contrepartieAccount && manualMontant > 0 && (
                                    <>
                                        <Divider className="my-2" />
                                        <div className="flex justify-content-between">
                                            <small className="text-500">Contrepartie ({contrepartieAccount.codeCompte}):</small>
                                            <b>{formatNumber(contrepartieAccount.soldeActuel)} FBU</b>
                                        </div>
                                        <div className="flex justify-content-between mt-2">
                                            <small className="text-500">Solde après:</small>
                                            <b className="text-green-500">{formatNumber((contrepartieAccount.soldeActuel ?? 0) + manualMontant)} FBU</b>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Dialog>

                    {/* Transfert Dialog */}
                    <Dialog
                        visible={transfertDialog}
                        onHide={() => setTransfertDialog(false)}
                        header={<span><i className="pi pi-arrow-right-arrow-left mr-2 text-purple-500"></i>Transfert entre comptes</span>}
                        style={{ width: '45vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setTransfertDialog(false)} />
                                <Button label="Effectuer le transfert" icon="pi pi-arrow-right-arrow-left" severity="help" onClick={executeTransfert}
                                    disabled={manualMontant <= 0 || !transfertDestAccount}
                                    loading={manualOpLoading && manualOpCallType === 'transfertAccount'} />
                            </div>
                        }
                    >
                        <div className="p-fluid">
                            <div className="surface-100 p-3 border-round mb-3">
                                <label className="font-medium block mb-2">Compte Source</label>
                                <div className="text-lg font-bold">
                                    {selectedAccount?.accountNumber} - {selectedAccount?.libelle}
                                </div>
                                <small className="text-500">Solde: {formatNumber(selectedAccount?.soldeActuel)} FBU</small>
                            </div>
                            <div className="field">
                                <label className="font-medium">Compte Destination *</label>
                                <Dropdown
                                    value={transfertDestAccount}
                                    options={accounts.filter((a: any) => a.accountId !== selectedAccount?.accountId && a.actif)}
                                    onChange={(e) => setTransfertDestAccount(e.value)}
                                    optionLabel="accountNumber"
                                    placeholder="Sélectionner le compte destination..."
                                    filter
                                    filterBy="accountNumber,libelle"
                                    className="w-full"
                                    itemTemplate={(item: any) => (
                                        <span>{item.accountNumber} - {item.libelle} ({formatNumber(item.soldeActuel)} FBU)</span>
                                    )}
                                    valueTemplate={(item: any, props: any) => {
                                        if (item) return <span>{item.accountNumber} - {item.libelle}</span>;
                                        return <span>{props?.placeholder}</span>;
                                    }}
                                />
                            </div>
                            <div className="field">
                                <label className="font-medium">Montant *</label>
                                <InputNumber value={manualMontant} onValueChange={(e) => setManualMontant(e.value ?? 0)}
                                    suffix=" FBU" min={0} className="w-full" />
                            </div>
                            <div className="field">
                                <label className="font-medium">Libellé</label>
                                <InputText value={manualLibelle} onChange={(e) => setManualLibelle(e.target.value)}
                                    placeholder="Motif du transfert" className="w-full" />
                            </div>
                            {manualMontant > 0 && transfertDestAccount && (
                                <div className="surface-100 p-3 border-round mt-3">
                                    <div className="grid">
                                        <div className="col-6">
                                            <small className="text-500 block">Source après transfert:</small>
                                            <b className="text-red-500">{formatNumber((selectedAccount?.soldeActuel ?? 0) - manualMontant)} FBU</b>
                                        </div>
                                        <div className="col-6">
                                            <small className="text-500 block">Destination après transfert:</small>
                                            <b className="text-green-500">{formatNumber((transfertDestAccount?.soldeActuel ?? 0) + manualMontant)} FBU</b>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Dialog>

                    {/* Reject Operation Dialog */}
                    <Dialog
                        visible={rejectDialog}
                        onHide={() => { setRejectDialog(false); setSelectedOperation(null); setRejectionReason(''); }}
                        header={<span><i className="pi pi-times-circle mr-2 text-red-500"></i>Rejeter l'opération</span>}
                        style={{ width: '35vw' }}
                        modal
                        footer={
                            <div>
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => { setRejectDialog(false); setSelectedOperation(null); setRejectionReason(''); }} />
                                <Button label="Rejeter" icon="pi pi-ban" severity="danger" onClick={executeReject}
                                    loading={validateLoading && validateCallType === 'rejectOperation'} />
                            </div>
                        }
                    >
                        {selectedOperation && (
                            <div className="p-fluid">
                                <div className="surface-100 p-3 border-round mb-3">
                                    <div className="flex justify-content-between mb-2">
                                        <small className="text-500">Type:</small>
                                        <Tag value={selectedOperation.operationType} severity={selectedOperation.operationType === 'DEPOT' ? 'success' : selectedOperation.operationType === 'RETRAIT' ? 'danger' : 'help'} />
                                    </div>
                                    <div className="flex justify-content-between mb-2">
                                        <small className="text-500">Montant:</small>
                                        <b>{formatNumber(selectedOperation.montant)} FBU</b>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <small className="text-500">Créé par:</small>
                                        <span>{selectedOperation.createdBy}</span>
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="font-medium">Motif du rejet</label>
                                    <InputTextarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                        placeholder="Indiquer le motif du rejet..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog>

                    {/* Billetage Dialog */}
                    <Dialog
                        visible={billetageVisible}
                        onHide={handleSkipBilletage}
                        header={
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-money-bill text-xl text-primary"></i>
                                <span>Billetage - Comptage Physique</span>
                            </div>
                        }
                        style={{ width: '520px' }}
                        modal
                        closable={false}
                        footer={
                            <div className="flex justify-content-between">
                                <Button label="Passer" icon="pi pi-forward" severity="secondary" outlined onClick={handleSkipBilletage} />
                                <Button label="Enregistrer le Billetage" icon="pi pi-check" severity="success" onClick={handleSaveBilletage} loading={billetageLoading} />
                            </div>
                        }
                    >
                        {billetageAccount && (
                            <div>
                                <div className="p-3 border-round mb-3 surface-100">
                                    <div className="flex justify-content-between align-items-center flex-wrap gap-2">
                                        <div>
                                            <span className="text-500">Compte: </span>
                                            <span className="font-bold">{billetageAccount.accountNumber}</span>
                                            <span className="text-500 ml-2">— {billetageAccount.libelle}</span>
                                        </div>
                                        <Tag value={billetageOperationType} severity={billetageOperationType === 'Depot' ? 'success' : 'danger'} />
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-500">Montant de l'operation: </span>
                                        <span className="font-bold text-blue-600">{formatNumber(billetageAccount.lastOpMontant)} FBu</span>
                                    </div>
                                </div>

                                <DataTable value={DENOMINATIONS} size="small" showGridlines
                                    footer={
                                        <div className="flex justify-content-between align-items-center">
                                            <span className="text-lg font-bold">TOTAL</span>
                                            <span className="text-lg font-bold text-green-600">{formatNumber(calculateBilletageTotal())} FBu</span>
                                        </div>
                                    }>
                                    <Column header="Denomination" body={(d: any) => (
                                        <span className="font-medium">{formatNumber(d.value)} FBu</span>
                                    )} style={{ width: '120px' }} />
                                    <Column header="Quantite" body={(d: any) => (
                                        <InputNumber
                                            value={(billetageCount as any)[d.field] || 0}
                                            onValueChange={(e) => handleBilletageDenominationChange(d.field, e.value || 0)}
                                            min={0}
                                            showButtons
                                            buttonLayout="horizontal"
                                            incrementButtonIcon="pi pi-plus"
                                            decrementButtonIcon="pi pi-minus"
                                            inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                                        />
                                    )} style={{ width: '180px' }} />
                                    <Column header="Sous-total" body={(d: any) => (
                                        <span className="font-bold text-primary">{formatNumber(((billetageCount as any)[d.field] || 0) * d.value)} FBu</span>
                                    )} style={{ textAlign: 'right' }} />
                                </DataTable>

                                <div className="mt-3 p-3 border-round" style={{
                                    background: Math.abs(calculateBilletageTotal() - (billetageAccount.lastOpMontant ?? 0)) > 0.01 ? '#FFF3E0' : '#E8F5E9',
                                    borderLeft: `4px solid ${Math.abs(calculateBilletageTotal() - (billetageAccount.lastOpMontant ?? 0)) > 0.01 ? '#FF9800' : '#4CAF50'}`
                                }}>
                                    <div className="flex justify-content-between align-items-center mb-2">
                                        <span className="text-600">Montant operation:</span>
                                        <span className="font-bold text-blue-600">{formatNumber(billetageAccount.lastOpMontant)} FBu</span>
                                    </div>
                                    <div className="flex justify-content-between align-items-center">
                                        <span className="font-semibold">Ecart:</span>
                                        <span className={`font-bold text-lg ${Math.abs(calculateBilletageTotal() - (billetageAccount.lastOpMontant ?? 0)) > 0.01 ? 'text-orange-600' : 'text-green-600'}`}>
                                            {formatNumber(calculateBilletageTotal() - (billetageAccount.lastOpMontant ?? 0))} FBu
                                        </span>
                                    </div>
                                </div>

                                <div className="field mt-3">
                                    <label className="font-semibold">Notes</label>
                                    <InputTextarea
                                        value={billetageCount.notes || ''}
                                        onChange={(e) => setBilletageCount(prev => ({ ...prev, notes: e.target.value }))}
                                        rows={2}
                                        className="w-full"
                                        placeholder="Observations sur le comptage..."
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
