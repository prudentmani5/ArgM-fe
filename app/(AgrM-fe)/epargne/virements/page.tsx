'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import CancellationRefBadge from '@/components/CancellationRefBadge';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { formatLocalDate } from '@/utils/dateUtils';
import { API_BASE_URL } from '@/utils/apiConfig';
import { useMarkCancellationReplaced } from '@/hooks/useMarkCancellationReplaced';
import { Virement, VirementClass, VirementStatus, TRANSFER_TYPE_OPTIONS, DEFAULT_COMMISSION_AMOUNT, VirementBatch, VirementBatchClass, VirementBatchDetail } from './Virement';
import VirementForm from './VirementForm';
import VirementBatchForm from './VirementBatchForm';
import PrintableVirementReceipt from './PrintableVirementReceipt';
import PrintableVirementBatchReceipt from './PrintableVirementBatchReceipt';
import Cookies from 'js-cookie';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { filterOwnRecordsForCaissier } from '@/utils/userUtils';
import { getClientDisplayName } from '@/utils/clientUtils';

const BASE_URL = `${API_BASE_URL}/api/epargne/virements`;
const BATCH_URL = `${API_BASE_URL}/api/epargne/virements/batch`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const COMPTES_URL = `${API_BASE_URL}/api/comptability/comptes`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;

const getCurrentUser = (): string => {
    try {
        const appUserCookie = Cookies.get('appUser');
        if (appUserCookie) {
            const appUser = JSON.parse(appUserCookie);
            return `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || appUser.email || 'Unknown';
        }
    } catch (e) {
        console.error('Error parsing appUser cookie:', e);
    }
    return 'Unknown';
};

function VirementPage() {
    const { can } = useAuthorizedAction();
    const [virement, setVirement] = useState<Virement>(new VirementClass());
    const [virements, setVirements] = useState<Virement[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [comptesComptables, setComptesComptables] = useState<any[]>([]);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [printDialog, setPrintDialog] = useState(false);
    const [selectedVirement, setSelectedVirement] = useState<Virement | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    // Batch state
    const [batch, setBatch] = useState<VirementBatch>(new VirementBatchClass());
    const [batches, setBatches] = useState<VirementBatch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<VirementBatch | null>(null);
    const [batchViewDialog, setBatchViewDialog] = useState(false);
    const [batchRejectDialog, setBatchRejectDialog] = useState(false);
    const [batchPrintDialog, setBatchPrintDialog] = useState(false);
    const [batchRejectionReason, setBatchRejectionReason] = useState('');
    const [batchGlobalFilter, setBatchGlobalFilter] = useState('');
    const [batchLoading, setBatchLoading] = useState(false);
    const [periodStart, setPeriodStart] = useState<Date | null>(null);
    const [periodEnd, setPeriodEnd] = useState<Date | null>(null);
    const [isTodayClosed, setIsTodayClosed] = useState(false);
    const [isBatchDateClosed, setIsBatchDateClosed] = useState(false);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const batchPrintRef = useRef<HTMLDivElement>(null);

    const branchesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const virementsApi = useConsumApi('');
    const actionsApi = useConsumApi('');
    const { markIfNeeded } = useMarkCancellationReplaced();
    const comptesApi = useConsumApi('');
    const internalAccountsApi = useConsumApi('');
    const batchListApi = useConsumApi('');
    const batchActionsApi = useConsumApi('');
    const batchDetailsApi = useConsumApi('');
    const dateClosedApi = useConsumApi('');
    const batchDateClosedApi = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadVirements();
        loadBatches();
    }, []);

    // Re-check closed status whenever the virement date changes (including initial default)
    useEffect(() => {
        if (virement.dateVirement) {
            dateClosedApi.fetchData(null, 'GET', `${API_BASE_URL}/api/comptability/daily-closing/status?date=${virement.dateVirement}`, 'checkDateClosed');
        }
    }, [virement.dateVirement]);

    // Handle branches
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
    }, [branchesApi.data]);

    // Handle savings accounts
    useEffect(() => {
        if (savingsApi.data) {
            setSavingsAccounts(Array.isArray(savingsApi.data) ? savingsApi.data : []);
        }
    }, [savingsApi.data]);

    // Handle comptes comptables
    useEffect(() => {
        if (comptesApi.data) {
            setComptesComptables(Array.isArray(comptesApi.data) ? comptesApi.data : []);
        }
    }, [comptesApi.data]);

    // Handle internal accounts
    useEffect(() => {
        if (internalAccountsApi.data) {
            const accounts = Array.isArray(internalAccountsApi.data) ? internalAccountsApi.data : [];
            setInternalAccounts(accounts.filter((a: any) => a.actif));
        }
    }, [internalAccountsApi.data]);

    // Handle virements list
    useEffect(() => {
        if (virementsApi.data) {
            const data: Virement[] = Array.isArray(virementsApi.data) ? virementsApi.data : virementsApi.data.content || [];
            // Caissiers see only their own records; supervisors/validators see all.
            setVirements(filterOwnRecordsForCaissier(data, ['EPARGNE_VIREMENT_VALIDATE', 'EPARGNE_VIREMENT_REJECT', 'EPARGNE_VIREMENT_CANCEL']));
            setLoading(false);
        }
        if (virementsApi.error) {
            showToast('error', 'Erreur', virementsApi.error.message || 'Erreur lors du chargement des virements');
            setLoading(false);
        }
    }, [virementsApi.data, virementsApi.error]);

    // Handle actions
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Virement créé avec succès (en attente de validation)');
                    markIfNeeded(actionsApi.data?.notes, actionsApi.data?.batchNumber || '');
                    resetForm();
                    loadVirements();
                    setActiveIndex(1);
                    break;
                case 'validate':
                    showToast('success', 'Succès', 'Virement validé avec succès');
                    loadVirements();
                    break;
                case 'reject':
                    showToast('success', 'Succès', 'Virement rejeté');
                    setRejectDialog(false);
                    loadVirements();
                    break;
                case 'cancel':
                    showToast('success', 'Succès', 'Virement annulé');
                    loadVirements();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || 'Une erreur est survenue');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    // Handle batch list
    useEffect(() => {
        if (batchListApi.data) {
            const data: VirementBatch[] = Array.isArray(batchListApi.data) ? batchListApi.data : batchListApi.data.content || [];
            // Caissiers see only their own records; supervisors/validators see all.
            setBatches(filterOwnRecordsForCaissier(data, ['EPARGNE_VIREMENT_BATCH_VALIDATE']));
            setBatchLoading(false);
        }
        if (batchListApi.error) {
            showToast('error', 'Erreur', batchListApi.error.message || 'Erreur lors du chargement des batches');
            setBatchLoading(false);
        }
    }, [batchListApi.data, batchListApi.error]);

    // Handle batch actions
    useEffect(() => {
        if (batchActionsApi.data) {
            switch (batchActionsApi.callType) {
                case 'createBatch':
                    showToast('success', 'Succès', 'Virement multiple créé avec succès (en attente de validation)');
                    setBatch(new VirementBatchClass());
                    loadBatches();
                    setActiveIndex(3); // Switch to batches list tab
                    break;
                case 'validateBatch':
                    showToast('success', 'Succès', 'Virement multiple validé avec succès');
                    loadBatches();
                    loadReferenceData(); // Refresh balances
                    break;
                case 'rejectBatch':
                    showToast('success', 'Succès', 'Virement multiple rejeté');
                    setBatchRejectDialog(false);
                    loadBatches();
                    break;
                case 'cancelBatch':
                    showToast('success', 'Succès', 'Virement multiple annulé');
                    loadBatches();
                    break;
            }
        }
        if (batchActionsApi.error) {
            showToast('error', 'Erreur', batchActionsApi.error.message || 'Une erreur est survenue');
        }
    }, [batchActionsApi.data, batchActionsApi.error, batchActionsApi.callType]);

    // Handle batch details
    useEffect(() => {
        if (batchDetailsApi.data && selectedBatch) {
            const details: VirementBatchDetail[] = Array.isArray(batchDetailsApi.data) ? batchDetailsApi.data : [];
            setSelectedBatch({ ...selectedBatch, details });
        }
    }, [batchDetailsApi.data]);

    // Re-check closed status whenever the batch date changes (including initial default)
    useEffect(() => {
        if (batch.dateVirement) {
            batchDateClosedApi.fetchData(null, 'GET', `${API_BASE_URL}/api/comptability/daily-closing/status?date=${batch.dateVirement}`, 'checkBatchDateClosed');
        }
    }, [batch.dateVirement]);

    // Handle virement date closed check
    useEffect(() => {
        if (dateClosedApi.data && dateClosedApi.callType === 'checkDateClosed') {
            setIsTodayClosed(!!(dateClosedApi.data as any).closed);
        }
    }, [dateClosedApi.data, dateClosedApi.callType]);

    // Handle batch date closed check
    useEffect(() => {
        if (batchDateClosedApi.data && batchDateClosedApi.callType === 'checkBatchDateClosed') {
            setIsBatchDateClosed(!!(batchDateClosedApi.data as any).closed);
        }
    }, [batchDateClosedApi.data, batchDateClosedApi.callType]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        comptesApi.fetchData(null, 'GET', `${COMPTES_URL}/findall`, 'loadComptes');
        internalAccountsApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadInternalAccounts');
    };

    const loadVirements = () => {
        setLoading(true);
        virementsApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadVirements');
    };

    const loadBatches = () => {
        setBatchLoading(true);
        batchListApi.fetchData(null, 'GET', `${BATCH_URL}/findall`, 'loadBatches');
    };

    const handleBatchSubmit = () => {
        if (isBatchDateClosed) {
            showToast('error', 'Opération bloquée', 'La date sélectionnée a déjà été clôturée. Veuillez choisir une date non clôturée.');
            return;
        }
        const isInternalSource = batch.sourceType === 'INTERNAL';
        if (!isInternalSource && !batch.sourceSavingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte source');
            return;
        }
        if (isInternalSource && !batch.sourceInternalAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte interne source');
            return;
        }
        if (!batch.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return;
        }
        if (!batch.motif || !batch.motif.trim()) {
            showToast('warn', 'Attention', 'Le motif est obligatoire');
            return;
        }
        if (batch.details.length === 0) {
            showToast('warn', 'Attention', 'Ajoutez au moins un bénéficiaire');
            return;
        }

        const data = {
            sourceType: batch.sourceType || 'SAVINGS',
            sourceSavingsAccountId: isInternalSource ? null : batch.sourceSavingsAccountId,
            sourceInternalAccountId: isInternalSource ? batch.sourceInternalAccountId : null,
            branchId: batch.branchId,
            commissionRate: 0,
            commissionAmount: batch.commissionAmount,
            motif: batch.motif,
            notes: batch.notes,
            dateVirement: batch.dateVirement,
            details: batch.details.map(d => ({
                destinationSavingsAccountId: d.destinationSavingsAccountId,
                amount: d.amount
            })),
            userAction: getCurrentUser()
        };
        batchActionsApi.fetchData(data, 'POST', `${BATCH_URL}/new`, 'createBatch');
    };

    const viewBatch = (rowData: VirementBatch) => {
        setSelectedBatch(rowData);
        setBatchViewDialog(true);
        // Load details if not already present
        if (!rowData.details || rowData.details.length === 0) {
            batchDetailsApi.fetchData(null, 'GET', `${BATCH_URL}/${rowData.id}/details`, 'loadDetails');
        }
    };

    const validateBatch = (rowData: VirementBatch) => {
        const sourceInfo = rowData.sourceClient
            ? getClientDisplayName(rowData.sourceClient)
            : '-';

        confirmDialog({
            message: (
                <div>
                    <p><strong>Source:</strong> {sourceInfo}</p>
                    <p><strong>Nombre de bénéficiaires:</strong> {rowData.numberOfTransfers || rowData.details?.length || 0}</p>
                    <p><strong>Total virements:</strong> {formatCurrency(rowData.totalAmount, rowData.sourceSavingsAccount?.currency?.code)}</p>
                    <p><strong>Commission:</strong> {formatCurrency(rowData.commissionAmount, rowData.sourceSavingsAccount?.currency?.code)}</p>
                    <p><strong>Total débité:</strong> {formatCurrency(rowData.totalDebitAmount, rowData.sourceSavingsAccount?.currency?.code)}</p>
                </div>
            ) as any,
            header: 'Valider le Virement Multiple',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => {
                batchActionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BATCH_URL}/validate/${rowData.id}`, 'validateBatch');
            }
        });
    };

    const openBatchRejectDialog = (rowData: VirementBatch) => {
        setSelectedBatch(rowData);
        setBatchRejectionReason('');
        setBatchRejectDialog(true);
    };

    const handleBatchReject = () => {
        if (selectedBatch && batchRejectionReason) {
            batchActionsApi.fetchData(
                { reason: batchRejectionReason, userAction: getCurrentUser() },
                'POST',
                `${BATCH_URL}/reject/${selectedBatch.id}`,
                'rejectBatch'
            );
        }
    };

    const cancelBatch = (rowData: VirementBatch) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir annuler le virement multiple "${rowData.batchNumber}" ?`,
            header: 'Confirmation d\'annulation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                batchActionsApi.fetchData(
                    { reason: 'Annulé par l\'utilisateur', userAction: getCurrentUser() },
                    'POST',
                    `${BATCH_URL}/cancel/${rowData.id}`,
                    'cancelBatch'
                );
            }
        });
    };

    const openBatchPrintDialog = (rowData: VirementBatch) => {
        if (rowData.status !== 'VALIDATED') {
            showToast('warn', 'Attention', 'Seuls les virements validés peuvent être imprimés');
            return;
        }
        setSelectedBatch(rowData);
        setBatchPrintDialog(true);
        if (!rowData.details || rowData.details.length === 0) {
            batchDetailsApi.fetchData(null, 'GET', `${BATCH_URL}/${rowData.id}/details`, 'loadDetails');
        }
    };

    const handleBatchPrint = () => {
        if (batchPrintRef.current) {
            const printContent = batchPrintRef.current.innerHTML.replace(
                /src="\/layout\//g,
                `src="${window.location.origin}/layout/`
            );
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Reçu Virement Multiple - ${selectedBatch?.batchNumber}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 15mm; }
                            @page { margin: 15mm; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const batchStatusTemplate = (rowData: VirementBatch) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        let label = rowData.status;
        switch (rowData.status) {
            case 'PENDING': severity = 'warning'; label = 'En attente'; break;
            case 'VALIDATED': severity = 'success'; label = 'Validé'; break;
            case 'REJECTED': severity = 'danger'; label = 'Rejeté'; break;
            case 'CANCELLED': severity = 'danger'; label = 'Annulé'; break;
        }
        return <Tag value={label} severity={severity} />;
    };

    const batchSourceTemplate = (rowData: VirementBatch) => {
        if (rowData.sourceClient) {
            return getClientDisplayName(rowData.sourceClient);
        }
        if (rowData.sourceInternalAccount) {
            return `${rowData.sourceInternalAccount.codeCompte} - ${rowData.sourceInternalAccount.libelle}`;
        }
        return rowData.sourceSavingsAccount?.accountNumber || '-';
    };

    const batchActionsTemplate = (rowData: VirementBatch) => {
        const isPending = rowData.status === 'PENDING';
        const isValidated = rowData.status === 'VALIDATED';
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewBatch(rowData)}
                    tooltip="Voir"
                />
                {isPending && can('EPARGNE_VIREMENT_BATCH_VALIDATE') && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => validateBatch(rowData)}
                        tooltip="Valider"
                    />
                )}
                {isPending && can('EPARGNE_VIREMENT_BATCH_VALIDATE') && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openBatchRejectDialog(rowData)}
                        tooltip="Rejeter"
                    />
                )}
                {isPending && (
                    <Button
                        icon="pi pi-ban"
                        className="p-button-rounded p-button-warning p-button-sm"
                        onClick={() => cancelBatch(rowData)}
                        tooltip="Annuler"
                    />
                )}
                <Button
                    icon="pi pi-print"
                    className={`p-button-rounded p-button-sm ${isValidated ? 'p-button-secondary' : 'p-button-secondary p-button-outlined'}`}
                    onClick={() => openBatchPrintDialog(rowData)}
                    tooltip={isValidated ? 'Imprimer le reçu' : 'Validez d\'abord'}
                    disabled={!isValidated}
                />
            </div>
        );
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setVirement(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setVirement(prev => {
            const updated = { ...prev, [name]: value };

            // Auto-fill client info when source savings account is selected
            if (name === 'sourceSavingsAccountId' && value) {
                const account = savingsAccounts.find(a => a.id === value);
                if (account?.client) {
                    updated.sourceClientId = account.client.id;
                }
            }
            // Auto-fill client info when destination savings account is selected
            if (name === 'destinationSavingsAccountId' && value) {
                const account = savingsAccounts.find(a => a.id === value);
                if (account?.client) {
                    updated.destinationClientId = account.client.id;
                }
            }
            // Reset fields when transfer type changes
            if (name === 'transferType') {
                updated.sourceSavingsAccountId = undefined;
                updated.sourceAccountCode = '';
                updated.sourceClientId = undefined;
                updated.destinationSavingsAccountId = undefined;
                updated.destinationAccountCode = '';
                updated.destinationClientId = undefined;
            }
            return updated;
        });
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setVirement(prev => ({
            ...prev,
            [name]: value ? formatLocalDate(value) : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setVirement(prev => {
            const updated = { ...prev, [name]: value || 0 };
            const montant = name === 'montant' ? (value || 0) : updated.montant;
            const commission = name === 'commissionAmount' ? (value || 0) : updated.commissionAmount;
            updated.commissionAmount = commission;
            updated.totalDebitAmount = montant + commission;
            return updated;
        });
    };

    const validateForm = (): boolean => {
        if (!virement.transferType) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le type de virement');
            return false;
        }
        if (!virement.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        // Source validation
        if ((virement.transferType === 'CLIENT_TO_CLIENT' || virement.transferType === 'CLIENT_TO_ACCOUNT') && !virement.sourceSavingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte source');
            return false;
        }
        if (virement.transferType === 'ACCOUNT_TO_CLIENT' && !virement.sourceAccountCode) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte comptable source');
            return false;
        }
        // Destination validation
        if ((virement.transferType === 'CLIENT_TO_CLIENT' || virement.transferType === 'ACCOUNT_TO_CLIENT') && !virement.destinationSavingsAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte destination');
            return false;
        }
        if (virement.transferType === 'CLIENT_TO_ACCOUNT' && !virement.destinationAccountCode) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte comptable destination');
            return false;
        }
        // Same account check
        if (virement.transferType === 'CLIENT_TO_CLIENT' && virement.sourceSavingsAccountId === virement.destinationSavingsAccountId) {
            showToast('warn', 'Attention', 'Le compte source et destination ne peuvent pas être identiques');
            return false;
        }
        if (virement.montant <= 0) {
            showToast('warn', 'Attention', 'Le montant doit être supérieur à 0');
            return false;
        }
        if (virement.commissionAmount > 0 && !virement.commissionInternalAccountId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte interne pour la commission');
            return false;
        }
        if (!virement.motif || !virement.motif.trim()) {
            showToast('warn', 'Attention', 'Le motif du virement est obligatoire');
            return false;
        }
        // Balance check for client source
        if (virement.sourceSavingsAccountId) {
            const sourceAccount = savingsAccounts.find(a => a.id === virement.sourceSavingsAccountId);
            if (sourceAccount) {
                const available = sourceAccount.availableBalance || sourceAccount.currentBalance || 0;
                if (virement.totalDebitAmount > available) {
                    showToast('warn', 'Attention', `Solde insuffisant. Disponible: ${formatCurrency(available, sourceAccount.currency?.code)}, Requis: ${formatCurrency(virement.totalDebitAmount, sourceAccount.currency?.code)}`);
                    return false;
                }
            }
        }
        return true;
    };

    const handleSubmit = () => {
        if (isTodayClosed) {
            showToast('error', 'Opération bloquée', 'La date sélectionnée a déjà été clôturée. Veuillez choisir une date non clôturée.');
            return;
        }
        if (!validateForm()) return;
        const data = {
            ...virement,
            userAction: getCurrentUser()
        };
        actionsApi.fetchData(data, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setVirement(new VirementClass());
    };

    const viewVirement = (rowData: Virement) => {
        // Map nested objects to flat ID fields so the form dropdowns can display values
        const mapped: Virement = {
            ...rowData,
            branchId: rowData.branch?.id || rowData.branchId,
            sourceSavingsAccountId: rowData.sourceSavingsAccount?.id || rowData.sourceSavingsAccountId,
            sourceClientId: rowData.sourceClient?.id,
            destinationSavingsAccountId: rowData.destinationSavingsAccount?.id || rowData.destinationSavingsAccountId,
            destinationClientId: rowData.destinationClient?.id,
        };
        setSelectedVirement(mapped);
        setViewDialog(true);
    };

    const validateVirement = (rowData: Virement) => {
        const sourceInfo = rowData.sourceClient
            ? getClientDisplayName(rowData.sourceClient)
            : rowData.sourceAccountCode || '';
        const destInfo = rowData.destinationClient
            ? getClientDisplayName(rowData.destinationClient)
            : rowData.destinationAccountCode || '';

        confirmDialog({
            message: (
                <div>
                    <p><strong>Source:</strong> {sourceInfo}</p>
                    <p><strong>Destination:</strong> {destInfo}</p>
                    <p><strong>Montant:</strong> {formatCurrency(rowData.montant, rowData.sourceSavingsAccount?.currency?.code)}</p>
                    <p><strong>Commission:</strong> {formatCurrency(rowData.commissionAmount, rowData.sourceSavingsAccount?.currency?.code)}</p>
                    <p><strong>Total débité:</strong> {formatCurrency(rowData.totalDebitAmount, rowData.sourceSavingsAccount?.currency?.code)}</p>
                </div>
            ) as any,
            header: 'Valider le Virement',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, valider',
            rejectLabel: 'Annuler',
            accept: () => {
                actionsApi.fetchData({ userAction: getCurrentUser() }, 'POST', `${BASE_URL}/validate/${rowData.virementId}`, 'validate');
            }
        });
    };

    const openRejectDialog = (rowData: Virement) => {
        setSelectedVirement(rowData);
        setRejectionReason('');
        setRejectDialog(true);
    };

    const handleReject = () => {
        if (selectedVirement && rejectionReason) {
            actionsApi.fetchData(
                { reason: rejectionReason, userAction: getCurrentUser() },
                'POST',
                `${BASE_URL}/reject/${selectedVirement.virementId}`,
                'reject'
            );
        }
    };

    const cancelVirement = (rowData: Virement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir annuler le virement "${rowData.reference}" ?`,
            header: 'Confirmation d\'annulation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData(
                    { reason: 'Annulé par l\'utilisateur', userAction: getCurrentUser() },
                    'POST',
                    `${BASE_URL}/cancel/${rowData.virementId}`,
                    'cancel'
                );
            }
        });
    };

    const openPrintDialog = (rowData: Virement) => {
        if (rowData.status !== VirementStatus.VALIDATED) {
            showToast('warn', 'Attention', 'Seuls les virements validés peuvent être imprimés');
            return;
        }
        setSelectedVirement(rowData);
        setPrintDialog(true);
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(
                /src="\/layout\//g,
                `src="${window.location.origin}/layout/`
            );
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Reçu de Virement - ${selectedVirement?.reference}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { font-family: Arial, sans-serif; padding: 15mm; }
                            @page { margin: 15mm; }
                            @media print {
                                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        ${printContent}
                    </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        }
    };

    const formatCurrency = (value: number, currencyCode?: string) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' ' + (currencyCode || 'FBU');
    };

    const statusBodyTemplate = (rowData: Virement) => {
        let severity: 'success' | 'info' | 'warning' | 'danger' = 'info';
        let label = rowData.status;

        switch (rowData.status) {
            case VirementStatus.PENDING:
                severity = 'warning';
                label = 'En attente';
                break;
            case VirementStatus.VALIDATED:
                severity = 'success';
                label = 'Validé';
                break;
            case VirementStatus.REJECTED:
                severity = 'danger';
                label = 'Rejeté';
                break;
            case VirementStatus.CANCELLED:
                severity = 'danger';
                label = 'Annulé';
                break;
        }

        return (
            <span className="flex align-items-center flex-wrap">
                <Tag value={label} severity={severity} />
                <CancellationRefBadge text={(rowData as any).notes} />
            </span>
        );
    };

    const transferTypeTemplate = (rowData: Virement) => {
        const opt = TRANSFER_TYPE_OPTIONS.find(o => o.value === rowData.transferType);
        return opt ? opt.label : rowData.transferType;
    };

    const sourceTemplate = (rowData: Virement) => {
        if (rowData.sourceClient) {
            return getClientDisplayName(rowData.sourceClient);
        }
        return rowData.sourceAccountCode || '-';
    };

    const destinationTemplate = (rowData: Virement) => {
        if (rowData.destinationClient) {
            return getClientDisplayName(rowData.destinationClient);
        }
        return rowData.destinationAccountCode || '-';
    };

    const actionsBodyTemplate = (rowData: Virement) => {
        const isPending = rowData.status === VirementStatus.PENDING;
        const isValidated = rowData.status === VirementStatus.VALIDATED;
        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewVirement(rowData)}
                    tooltip="Voir"
                />
                {isPending && can('EPARGNE_VALIDATE') && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => validateVirement(rowData)}
                        tooltip="Valider"
                    />
                )}
                {isPending && can('EPARGNE_VALIDATE') && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => openRejectDialog(rowData)}
                        tooltip="Rejeter"
                    />
                )}
                {isPending && (
                    <Button
                        icon="pi pi-ban"
                        className="p-button-rounded p-button-warning p-button-sm"
                        onClick={() => cancelVirement(rowData)}
                        tooltip="Annuler"
                    />
                )}
                <Button
                    icon="pi pi-print"
                    className={`p-button-rounded p-button-sm ${isValidated ? 'p-button-secondary' : 'p-button-secondary p-button-outlined'}`}
                    onClick={() => openPrintDialog(rowData)}
                    tooltip={isValidated ? 'Imprimer le reçu' : 'Validez d\'abord le virement'}
                    disabled={!isValidated}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Virements</h5>
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

            <h4 className="text-primary mb-4">
                <i className="pi pi-arrow-right-arrow-left mr-2"></i>
                Virements
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Commission:</strong> {DEFAULT_COMMISSION_AMOUNT.toLocaleString('fr-BI')} FBU par défaut</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Validation:</strong> Chef d'agence requis</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-6 lg:col-4">
                        <div className="flex align-items-center gap-2">
                            <i className="pi pi-info-circle text-blue-500"></i>
                            <span><strong>Comptabilité:</strong> Écritures automatiques</span>
                        </div>
                    </div>
                </div>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Virement" leftIcon="pi pi-plus mr-2">
                    {isTodayClosed && (
                        <div className="p-message p-message-error mb-3" style={{ borderRadius: '6px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="pi pi-lock" style={{ fontSize: '1.2rem' }}></i>
                            <span><strong>Journée clôturée.</strong> La date sélectionnée ({virement.dateVirement}) a déjà été clôturée. Les nouvelles opérations sont bloquées.</span>
                        </div>
                    )}
                    <VirementForm
                        virement={virement}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        savingsAccounts={savingsAccounts}
                        comptesComptables={comptesComptables}
                        internalAccounts={internalAccounts}
                        branches={branches}
                    />

                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Enregistrer le Virement"
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={virement.montant <= 0 || !can('EPARGNE_VIREMENT_CREATE') || isTodayClosed}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Virements" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={virements}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun virement trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="dateVirement"
                        sortOrder={-1}
                    >
                        <Column field="reference" header="N° Virement" sortable />
                        <Column field="transferType" header="Type" body={transferTypeTemplate} sortable />
                        <Column header="Source" body={sourceTemplate} />
                        <Column header="Destination" body={destinationTemplate} />
                        <Column field="montant" header="Montant" body={(row) => formatCurrency(row.montant, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="dateVirement" header="Date" sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab: Virements du Jour */}
                {can('EPARGNE_VIREMENT_VIEW_TODAY') && <TabPanel header="Virements du Jour" leftIcon="pi pi-calendar mr-2">
                    <DataTable
                        value={virements.filter(v => v.dateVirement === formatLocalDate(new Date()))}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun virement enregistré aujourd'hui"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="dateVirement"
                        sortOrder={-1}
                    >
                        <Column field="reference" header="N° Virement" sortable />
                        <Column field="transferType" header="Type" body={transferTypeTemplate} sortable />
                        <Column header="Source" body={sourceTemplate} />
                        <Column header="Destination" body={destinationTemplate} />
                        <Column field="montant" header="Montant" body={(row) => formatCurrency(row.montant, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column field="dateVirement" header="Date" sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>}

                {/* Tab: Mes Virements par Période */}
                {can('EPARGNE_VIREMENT_VIEW_PERIOD') && <TabPanel header="Mes Virements par Période" leftIcon="pi pi-filter mr-2">
                    {(() => {
                        const currentUser = getCurrentUser();
                        const filtered = virements.filter(v => {
                            if ((v as any).userAction !== currentUser) return false;
                            if (periodStart && v.dateVirement && v.dateVirement < formatLocalDate(periodStart)) return false;
                            if (periodEnd && v.dateVirement && v.dateVirement > formatLocalDate(periodEnd)) return false;
                            return true;
                        });
                        return (
                            <DataTable
                                value={filtered}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading}
                                globalFilter={globalFilter}
                                globalFilterFields={['reference', 'userAction']}
                                emptyMessage="Aucun virement trouvé pour cette période"
                                stripedRows
                                showGridlines
                                size="small"
                                sortField="dateVirement"
                                sortOrder={-1}
                                header={
                                    <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                        <div>
                                            <h5 className="m-0">Mes Virements</h5>
                                            <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} virement(s)</small>
                                        </div>
                                        <div className="flex gap-2 align-items-center flex-wrap">
                                            <div className="flex align-items-center gap-1">
                                                <label className="text-sm font-medium">Du:</label>
                                                <Calendar
                                                    value={periodStart}
                                                    onChange={(e) => setPeriodStart(e.value as Date | null)}
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Date début"
                                                    showButtonBar
                                                    style={{ width: '150px' }}
                                                />
                                            </div>
                                            <div className="flex align-items-center gap-1">
                                                <label className="text-sm font-medium">Au:</label>
                                                <Calendar
                                                    value={periodEnd}
                                                    onChange={(e) => setPeriodEnd(e.value as Date | null)}
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Date fin"
                                                    showButtonBar
                                                    minDate={periodStart || undefined}
                                                    style={{ width: '150px' }}
                                                />
                                            </div>
                                            <Button
                                                icon="pi pi-times"
                                                className="p-button-secondary p-button-sm p-button-outlined"
                                                onClick={() => { setPeriodStart(null); setPeriodEnd(null); }}
                                                tooltip="Réinitialiser la période"
                                            />
                                            <span className="p-input-icon-left">
                                                <i className="pi pi-search" />
                                                <InputText
                                                    value={globalFilter}
                                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                                    placeholder="Rechercher..."
                                                />
                                            </span>
                                        </div>
                                    </div>
                                }
                            >
                                <Column field="reference" header="N° Virement" sortable />
                                <Column field="transferType" header="Type" body={transferTypeTemplate} sortable />
                                <Column header="Source" body={sourceTemplate} />
                                <Column header="Destination" body={destinationTemplate} />
                                <Column field="montant" header="Montant" body={(row) => formatCurrency(row.montant, row.sourceSavingsAccount?.currency?.code)} sortable />
                                <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                                <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} />
                                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                                <Column field="dateVirement" header="Date" sortable />
                                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                            </DataTable>
                        );
                    })()}
                </TabPanel>}

                {/* Tab 2: Virement Multiple Form */}
                <TabPanel header="Virement Multiple" leftIcon="pi pi-users mr-2">
                    {isBatchDateClosed && (
                        <div className="p-message p-message-error mb-3" style={{ borderRadius: '6px', padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="pi pi-lock" style={{ fontSize: '1.2rem' }}></i>
                            <span><strong>Journée clôturée.</strong> La date sélectionnée a déjà été clôturée. Les nouvelles opérations sont bloquées.</span>
                        </div>
                    )}
                    <VirementBatchForm
                        batch={batch}
                        setBatch={setBatch}
                        savingsAccounts={savingsAccounts}
                        internalAccounts={internalAccounts}
                        branches={branches}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Enregistrer le Virement Multiple"
                            icon="pi pi-save"
                            onClick={handleBatchSubmit}
                            className="p-button-success"
                            disabled={batch.details.length === 0 || !can('EPARGNE_VIREMENT_BATCH_CREATE') || isBatchDateClosed}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setBatch(new VirementBatchClass())}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                {/* Tab 3: Batches List */}
                <TabPanel header="Batches" leftIcon="pi pi-th-large mr-2">
                    <DataTable
                        value={batches}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={batchLoading}
                        globalFilter={batchGlobalFilter}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h5 className="m-0">Virements Multiples</h5>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={batchGlobalFilter}
                                        onChange={(e) => setBatchGlobalFilter(e.target.value)}
                                        placeholder="Rechercher..."
                                    />
                                </span>
                            </div>
                        }
                        emptyMessage="Aucun virement multiple trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="createdAt"
                        sortOrder={-1}
                    >
                        <Column field="batchNumber" header="N° Batch" sortable />
                        <Column field="dateVirement" header="Date" sortable />
                        <Column header="Source" body={batchSourceTemplate} />
                        <Column field="numberOfTransfers" header="Bénéficiaires" sortable style={{ textAlign: 'center' }} />
                        <Column field="totalAmount" header="Total Virements" body={(row) => formatCurrency(row.totalAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="status" header="Statut" body={batchStatusTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={batchActionsTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>

                {/* Tab 4: Batches du Jour */}
                {can('EPARGNE_VIREMENT_BATCH_VIEW_TODAY') && <TabPanel header="Batches du Jour" leftIcon="pi pi-calendar mr-2">
                    <DataTable
                        value={batches.filter(b => b.dateVirement === formatLocalDate(new Date()))}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={batchLoading}
                        globalFilter={batchGlobalFilter}
                        header={
                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                <h5 className="m-0">Batches du Jour</h5>
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        value={batchGlobalFilter}
                                        onChange={(e) => setBatchGlobalFilter(e.target.value)}
                                        placeholder="Rechercher..."
                                    />
                                </span>
                            </div>
                        }
                        emptyMessage="Aucun batch trouvé pour aujourd'hui"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="dateVirement"
                        sortOrder={-1}
                    >
                        <Column field="batchNumber" header="N° Batch" sortable />
                        <Column field="dateVirement" header="Date" sortable />
                        <Column header="Source" body={batchSourceTemplate} />
                        <Column field="numberOfTransfers" header="Bénéficiaires" sortable style={{ textAlign: 'center' }} />
                        <Column field="totalAmount" header="Total Virements" body={(row) => formatCurrency(row.totalAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                        <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                        <Column field="status" header="Statut" body={batchStatusTemplate} sortable />
                        <Column field="userAction" header="Utilisateur" sortable />
                        <Column header="Actions" body={batchActionsTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>}

                {/* Tab 5: Mes Batches par Période */}
                {can('EPARGNE_VIREMENT_BATCH_VIEW_PERIOD') && <TabPanel header="Mes Batches par Période" leftIcon="pi pi-filter mr-2">
                    {(() => {
                        const currentUser = getCurrentUser();
                        const filtered = batches.filter(b => {
                            if ((b as any).userAction !== currentUser) return false;
                            if (periodStart && b.dateVirement && b.dateVirement < formatLocalDate(periodStart)) return false;
                            if (periodEnd && b.dateVirement && b.dateVirement > formatLocalDate(periodEnd)) return false;
                            return true;
                        });
                        return (
                            <DataTable
                                value={filtered}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={batchLoading}
                                header={
                                    <div className="flex flex-column gap-2">
                                        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                            <div>
                                                <h5 className="m-0">Mes Batches par Période</h5>
                                                <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} batch(s)</small>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 align-items-center">
                                            <label className="font-medium">Du:</label>
                                            <Calendar
                                                value={periodStart}
                                                onChange={(e) => setPeriodStart(e.value as Date | null)}
                                                dateFormat="dd/mm/yy"
                                                placeholder="Date début"
                                                showIcon
                                            />
                                            <label className="font-medium">Au:</label>
                                            <Calendar
                                                value={periodEnd}
                                                onChange={(e) => setPeriodEnd(e.value as Date | null)}
                                                dateFormat="dd/mm/yy"
                                                placeholder="Date fin"
                                                showIcon
                                                minDate={periodStart || undefined}
                                            />
                                            <Button
                                                label="Réinitialiser"
                                                icon="pi pi-refresh"
                                                onClick={() => { setPeriodStart(null); setPeriodEnd(null); }}
                                                className="p-button-secondary p-button-sm"
                                            />
                                        </div>
                                    </div>
                                }
                                emptyMessage="Aucun batch trouvé pour cette période"
                                stripedRows
                                showGridlines
                                size="small"
                                sortField="dateVirement"
                                sortOrder={-1}
                            >
                                <Column field="batchNumber" header="N° Batch" sortable />
                                <Column field="dateVirement" header="Date" sortable />
                                <Column header="Source" body={batchSourceTemplate} />
                                <Column field="numberOfTransfers" header="Bénéficiaires" sortable style={{ textAlign: 'center' }} />
                                <Column field="totalAmount" header="Total Virements" body={(row) => formatCurrency(row.totalAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                                <Column field="commissionAmount" header="Commission" body={(row) => formatCurrency(row.commissionAmount, row.sourceSavingsAccount?.currency?.code)} />
                                <Column field="totalDebitAmount" header="Total Débité" body={(row) => formatCurrency(row.totalDebitAmount, row.sourceSavingsAccount?.currency?.code)} sortable />
                                <Column field="status" header="Statut" body={batchStatusTemplate} sortable />
                                <Column field="userAction" header="Utilisateur" sortable />
                                <Column header="Actions" body={batchActionsTemplate} style={{ width: '220px' }} />
                            </DataTable>
                        );
                    })()}
                </TabPanel>}
            </TabView>

            {/* Reject Dialog */}
            <Dialog
                header="Rejeter le Virement"
                visible={rejectDialog}
                style={{ width: '450px' }}
                onHide={() => setRejectDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setRejectDialog(false)} className="p-button-text" />
                        <Button
                            label="Rejeter"
                            icon="pi pi-ban"
                            onClick={handleReject}
                            className="p-button-danger"
                            disabled={!rejectionReason}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Virement: <strong>{selectedVirement?.reference}</strong><br />
                        Montant: <strong>{formatCurrency(selectedVirement?.montant || 0, selectedVirement?.sourceSavingsAccount?.currency?.code)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="rejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* View Dialog */}
            <Dialog
                header="Détails du Virement"
                visible={viewDialog}
                style={{ width: '900px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedVirement && (
                    <>
                        <VirementForm
                            virement={selectedVirement}
                            handleChange={() => {}}
                            handleDropdownChange={() => {}}
                            handleDateChange={() => {}}
                            handleNumberChange={() => {}}
                            savingsAccounts={savingsAccounts}
                            comptesComptables={comptesComptables}
                            internalAccounts={internalAccounts}
                            branches={branches}
                            isViewMode={true}
                        />
                        {selectedVirement.status === VirementStatus.VALIDATED && (
                            <div className="surface-100 p-3 border-round mt-3">
                                <h5 className="m-0 mb-3 text-green-600">
                                    <i className="pi pi-check-circle mr-2"></i>
                                    Résultat de la Validation
                                </h5>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <p><strong>Solde source avant:</strong> {formatCurrency(selectedVirement.sourceBalanceBefore || 0)}</p>
                                        <p><strong>Solde source après:</strong> {formatCurrency(selectedVirement.sourceBalanceAfter || 0)}</p>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <p><strong>Solde destination avant:</strong> {formatCurrency(selectedVirement.destinationBalanceBefore || 0)}</p>
                                        <p><strong>Solde destination après:</strong> {formatCurrency(selectedVirement.destinationBalanceAfter || 0)}</p>
                                    </div>
                                    <div className="col-12">
                                        <p><strong>Validé par:</strong> {selectedVirement.validatedBy || '-'}</p>
                                        <p><strong>Date validation:</strong> {selectedVirement.validatedAt || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedVirement.status === VirementStatus.REJECTED && (
                            <div className="surface-100 p-3 border-round mt-3" style={{ borderLeft: '4px solid #ef4444' }}>
                                <h5 className="m-0 mb-2 text-red-600">
                                    <i className="pi pi-times-circle mr-2"></i>
                                    Rejeté
                                </h5>
                                <p><strong>Motif:</strong> {selectedVirement.rejectionReason || '-'}</p>
                                <p><strong>Rejeté par:</strong> {selectedVirement.rejectedBy || '-'}</p>
                            </div>
                        )}
                    </>
                )}
            </Dialog>

            {/* Print Dialog */}
            <Dialog
                header="Aperçu du Reçu de Virement"
                visible={printDialog}
                style={{ width: '900px' }}
                onHide={() => setPrintDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setPrintDialog(false)} className="p-button-text" />
                        <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} className="p-button-success" />
                    </div>
                }
            >
                {selectedVirement && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableVirementReceipt
                            ref={printRef}
                            virement={selectedVirement}
                            companyName="AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 69 21 01 93"
                        />
                    </div>
                )}
            </Dialog>

            {/* Batch View Dialog */}
            <Dialog
                header="Détails du Virement Multiple"
                visible={batchViewDialog}
                style={{ width: '1000px' }}
                onHide={() => setBatchViewDialog(false)}
            >
                {selectedBatch && (
                    <>
                        <VirementBatchForm
                            batch={selectedBatch}
                            setBatch={() => {}}
                            savingsAccounts={savingsAccounts}
                            internalAccounts={internalAccounts}
                            branches={branches}
                            isViewMode={true}
                        />
                        {selectedBatch.status === 'VALIDATED' && (
                            <div className="surface-100 p-3 border-round mt-3">
                                <h5 className="m-0 mb-3 text-green-600">
                                    <i className="pi pi-check-circle mr-2"></i>
                                    Résultat de la Validation
                                </h5>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <p><strong>Solde source avant:</strong> {formatCurrency(selectedBatch.sourceBalanceBefore || 0)}</p>
                                        <p><strong>Solde source après:</strong> {formatCurrency(selectedBatch.sourceBalanceAfter || 0)}</p>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <p><strong>Validé par:</strong> {selectedBatch.validatedBy || '-'}</p>
                                        <p><strong>Date validation:</strong> {selectedBatch.validatedAt || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {selectedBatch.status === 'REJECTED' && (
                            <div className="surface-100 p-3 border-round mt-3" style={{ borderLeft: '4px solid #ef4444' }}>
                                <h5 className="m-0 mb-2 text-red-600">
                                    <i className="pi pi-times-circle mr-2"></i>
                                    Rejeté
                                </h5>
                                <p><strong>Motif:</strong> {selectedBatch.rejectionReason || '-'}</p>
                                <p><strong>Rejeté par:</strong> {selectedBatch.rejectedBy || '-'}</p>
                            </div>
                        )}
                    </>
                )}
            </Dialog>

            {/* Batch Reject Dialog */}
            <Dialog
                header="Rejeter le Virement Multiple"
                visible={batchRejectDialog}
                style={{ width: '450px' }}
                onHide={() => setBatchRejectDialog(false)}
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setBatchRejectDialog(false)} className="p-button-text" />
                        <Button
                            label="Rejeter"
                            icon="pi pi-ban"
                            onClick={handleBatchReject}
                            className="p-button-danger"
                            disabled={!batchRejectionReason}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Batch: <strong>{selectedBatch?.batchNumber}</strong><br />
                        Total: <strong>{formatCurrency(selectedBatch?.totalDebitAmount || 0)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="batchRejectionReason" className="font-medium">Motif du rejet *</label>
                        <InputTextarea
                            id="batchRejectionReason"
                            value={batchRejectionReason}
                            onChange={(e) => setBatchRejectionReason(e.target.value)}
                            rows={3}
                            placeholder="Expliquez la raison du rejet..."
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Batch Print Dialog */}
            <Dialog
                header="Aperçu du Reçu - Virement Multiple"
                visible={batchPrintDialog}
                style={{ width: '900px' }}
                onHide={() => setBatchPrintDialog(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setBatchPrintDialog(false)} className="p-button-text" />
                        <Button label="Imprimer" icon="pi pi-print" onClick={handleBatchPrint} className="p-button-success" />
                    </div>
                }
            >
                {selectedBatch && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <PrintableVirementBatchReceipt
                            ref={batchPrintRef}
                            batch={selectedBatch}
                            companyName="AGRINOVA MICROFINANCE"
                            companyAddress="Bujumbura, Burundi"
                            companyPhone="+257 22 69 21 01 93"
                        />
                    </div>
                )}
            </Dialog>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_VIREMENT_CREATE', 'EPARGNE_VIREMENT_VALIDATE', 'EPARGNE_VIREMENT_BATCH_CREATE', 'EPARGNE_VIREMENT_BATCH_VALIDATE']}>
            <VirementPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
