'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { FileUpload } from 'primereact/fileupload';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { TabPanel, TabView } from 'primereact/tabview';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';
import { filterOwnRecordsForCaissier } from '@/utils/userUtils';
import Cookies from 'js-cookie';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { formatLocalDate } from '@/utils/dateUtils';
import {
    DecouvertRequest,
    DecouvertRequestClass,
    STATUS_LABELS,
    STATUS_SEVERITY,
} from './DecouvertRequest';
import DecouvertRequestForm from './DecouvertRequestForm';
import PrintableDecouvertReceipt from './PrintableDecouvertReceipt';

const BASE_URL              = `${API_BASE_URL}/api/epargne/decouvert`;
const SAVINGS_URL           = `${API_BASE_URL}/api/savings-accounts`;
const INTERNAL_ACCOUNTS_URL = `${API_BASE_URL}/api/comptability/internal-accounts`;
const CAISSES_URL           = `${API_BASE_URL}/api/comptability/caisses`;
const DOCS_URL              = `${API_BASE_URL}/api/epargne/decouvert-documents`;
const FILES_URL             = `${API_BASE_URL}/api/files`;

const DENOMINATIONS = [
    { field: 'bill10000', label: 'Billets 10 000 FBu', value: 10000 },
    { field: 'bill5000',  label: 'Billets 5 000 FBu',  value: 5000 },
    { field: 'bill2000',  label: 'Billets 2 000 FBu',  value: 2000 },
    { field: 'bill1000',  label: 'Billets 1 000 FBu',  value: 1000 },
    { field: 'bill500',   label: 'Billets 500 FBu',    value: 500 },
    { field: 'coin100',   label: 'Pièces 100 FBu',     value: 100 },
    { field: 'coin50',    label: 'Pièces 50 FBu',      value: 50 },
    { field: 'coin10',    label: 'Pièces 10 FBu',      value: 10 },
    { field: 'coin5',     label: 'Pièces 5 FBu',       value: 5 },
    { field: 'coin1',     label: 'Pièces 1 FBu',       value: 1 },
];

const formatNumberFBu = (val: number | null | undefined): string => {
    if (val == null) return '0';
    return val.toLocaleString('fr-FR');
};

function DecouvertPage() {
    const { can } = useAuthorizedAction();
    const toast    = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Form / list state
    const [decouvert, setDecouvert]               = useState<DecouvertRequest>(new DecouvertRequestClass());
    const [decouvertList, setDecouvertList]       = useState<DecouvertRequest[]>([]);
    const [savingsAccounts, setSavingsAccounts]   = useState<any[]>([]);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);

    // UI state
    const [activeIndex, setActiveIndex]         = useState(0);
    const [globalFilter, setGlobalFilter]       = useState('');
    const [loading, setLoading]                 = useState(false);
    const [periodStart, setPeriodStart]         = useState<Date | null>(null);
    const [periodEnd, setPeriodEnd]             = useState<Date | null>(null);
    const [viewDialog, setViewDialog]           = useState(false);
    const [rejectDialog, setRejectDialog]       = useState(false);
    const [printDialog, setPrintDialog]         = useState(false);
    const [commentDialog, setCommentDialog]     = useState(false);
    const [commentAction, setCommentAction]     = useState<'verify' | 'approve' | null>(null);
    const [actionComment, setActionComment]     = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedDecouvert, setSelectedDecouvert] = useState<DecouvertRequest | null>(null);

    // Caisse state
    const [selectedCaisseId, setSelectedCaisseId] = useState<number | null>(null);

    // Disburse billetage state
    const [disburseBilletageVisible, setDisburseBilletageVisible] = useState(false);
    const [disburseBilletage, setDisburseBilletage]               = useState<Record<string, number>>({});
    const [disburseRequestId, setDisburseRequestId]               = useState<number | null>(null);
    const [disburseAmount, setDisburseAmount]                     = useState<number>(0);

    // Document attachment state
    const [docListDialog, setDocListDialog]     = useState(false);
    const [addDocDialog, setAddDocDialog]       = useState(false);
    const [docDecouvert, setDocDecouvert]       = useState<DecouvertRequest | null>(null);
    const [decouvertDocs, setDecouvertDocs]     = useState<any[]>([]);
    const [loadingDocs, setLoadingDocs]         = useState(false);
    const [uploading, setUploading]             = useState(false);
    const [newDocName, setNewDocName]           = useState('');
    const [selectedFile, setSelectedFile]       = useState<File | null>(null);
    const fileUploadRef                         = useRef<FileUpload>(null);

    // API hooks — separate instance per data type to avoid race conditions
    const savingsApi          = useConsumApi('');
    const internalAccountsApi = useConsumApi('');
    const caissesApi          = useConsumApi('');
    const listApi             = useConsumApi('');
    const actionsApi          = useConsumApi('');

    // ── Initial load ─────────────────────────────────────────────────────────

    useEffect(() => {
        loadReferenceData();
        loadDecouvertList();
    }, []);

    // ── Response handlers ─────────────────────────────────────────────────────

    useEffect(() => {
        if (savingsApi.data) {
            const data = Array.isArray(savingsApi.data) ? savingsApi.data : [];
            setSavingsAccounts(data.filter((a: any) => a.accountType !== 'BLOCKED'));
        }
        if (savingsApi.error) {
            showToast('error', 'Erreur', savingsApi.error.message || 'Erreur lors du chargement des comptes épargne');
        }
    }, [savingsApi.data, savingsApi.error]);

    useEffect(() => {
        if (internalAccountsApi.data) {
            setInternalAccounts(Array.isArray(internalAccountsApi.data) ? internalAccountsApi.data : []);
        }
        if (internalAccountsApi.error) {
            showToast('warn', 'Avertissement', 'Impossible de charger les comptes internes de contrepartie');
        }
    }, [internalAccountsApi.data, internalAccountsApi.error]);

    useEffect(() => {
        if (listApi.data) {
            const raw: DecouvertRequest[] = Array.isArray(listApi.data) ? listApi.data : [];
            setDecouvertList(filterOwnRecordsForCaissier(raw, ['EPARGNE_DECOUVERT_VERIFY', 'EPARGNE_DECOUVERT_APPROVE', 'EPARGNE_DECOUVERT_DISBURSE']));
            setLoading(false);
        }
        if (listApi.error) {
            setLoading(false);
        }
    }, [listApi.data, listApi.error]);

    useEffect(() => {
        if (!actionsApi.data) return;
        const result = actionsApi.data as any;
        if (!result?.id) return;

        switch (actionsApi.callType) {
            case 'create':
                showToast('success', 'Succès', 'Demande de découvert créée avec succès');
                setDecouvert(new DecouvertRequestClass());
                setActiveIndex(1);
                break;
            case 'verify':
                showToast('success', 'Vérifié', 'Demande vérifiée avec succès');
                setCommentDialog(false);
                break;
            case 'approve':
                showToast('success', 'Approuvé', 'Demande approuvée avec succès');
                setCommentDialog(false);
                break;
            case 'disburse':
                showToast('success', 'Décaissé', 'Découvert décaissé — écritures comptables créées');
                break;
            case 'reject':
                showToast('success', 'Rejeté', 'Demande rejetée');
                setRejectDialog(false);
                break;
            case 'cancel':
                showToast('success', 'Annulé', 'Demande annulée');
                break;
        }
        setActionComment('');
        setRejectionReason('');
        loadDecouvertList();
    }, [actionsApi.data, actionsApi.callType]);

    useEffect(() => {
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error?.message || 'Une erreur est survenue');
        }
    }, [actionsApi.error]);

    // Handle caisses data + auto-detect user's caisse
    useEffect(() => {
        if (caissesApi.data && caissesApi.callType === 'loadCaisses') {
            const allData = Array.isArray(caissesApi.data) ? caissesApi.data : [];
            try {
                const appUserCookie = Cookies.get('appUser');
                if (appUserCookie) {
                    const appUser = JSON.parse(appUserCookie);
                    const roleName = (appUser.roleName || '').toLowerCase();
                    const isCaissier = roleName.includes('caiss');
                    const isChefAgence = roleName.includes('chef');
                    const auths: string[] = appUser.authorities || [];
                    const isSuperAdmin = auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
                    const canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES');

                    const isGuichet = (c: any) =>
                        c.typeCaisse !== 'CHEF_AGENCE' && c.typeCaisse !== 'AGENCE' && c.typeCaisse !== 'SIEGE';
                    let userCaisse = null;

                    if (isCaissier && !isChefAgence && !isSuperAdmin && !canViewAll) {
                        if (appUser.id) {
                            userCaisse = allData.find((c: any) => c.agentId && Number(c.agentId) === Number(appUser.id) && isGuichet(c));
                        }
                        if (!userCaisse) {
                            const userName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                            userCaisse = allData.find((c: any) => c.agentName && c.agentName.toLowerCase() === userName.toLowerCase() && isGuichet(c));
                        }
                        if (!userCaisse && appUser.compteComptable) {
                            userCaisse = allData.find((c: any) => c.compteComptable === appUser.compteComptable && isGuichet(c));
                        }
                    } else {
                        if (appUser.id) {
                            userCaisse = allData.find((c: any) => c.agentId && Number(c.agentId) === Number(appUser.id));
                        }
                        if (!userCaisse && appUser.compteComptable) {
                            userCaisse = allData.find((c: any) => c.compteComptable === appUser.compteComptable);
                        }
                        if (!userCaisse) {
                            const userName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
                            userCaisse = allData.find((c: any) => c.agentName && c.agentName.toLowerCase() === userName.toLowerCase());
                        }
                    }

                    if (userCaisse) setSelectedCaisseId(userCaisse.caisseId);
                }
            } catch { /* ignore */ }
        }
    }, [caissesApi.data, caissesApi.callType]);

    // ── Data loaders ──────────────────────────────────────────────────────────

    const loadReferenceData = () => {
        savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/findallactive`, 'loadSavingsAccounts');
        internalAccountsApi.fetchData(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadInternalAccounts');
        let userBranchId: any = null;
        let canViewAll = false;
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                userBranchId = appUser.branchId;
                const auths: string[] = appUser.authorities || [];
                canViewAll = auths.includes('VIEW_ALL_BRANCHES') || auths.includes('ROLE_VIEW_ALL_BRANCHES')
                    || auths.includes('SUPER_ADMIN') || auths.includes('ROLE_SUPER_ADMIN');
            }
        } catch { /* ignore */ }
        if (userBranchId && !canViewAll) {
            caissesApi.fetchData(null, 'GET', `${CAISSES_URL}/findbybranch/${userBranchId}`, 'loadCaisses');
        } else {
            caissesApi.fetchData(null, 'GET', `${CAISSES_URL}/findactive`, 'loadCaisses');
        }
    };

    const loadDecouvertList = () => {
        setLoading(true);
        listApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadList');
    };

    // ── Actions ───────────────────────────────────────────────────────────────

    const handleCreate = () => {
        if (!decouvert.savingsAccountId) {
            showToast('warn', 'Manque', 'Veuillez sélectionner un compte d\'épargne');
            return;
        }
        if (!decouvert.requestedAmount || decouvert.requestedAmount <= 0) {
            showToast('warn', 'Manque', 'Veuillez saisir le montant demandé');
            return;
        }
        if (!decouvert.motif?.trim()) {
            showToast('warn', 'Manque', 'Veuillez indiquer le motif de la demande');
            return;
        }
        const payload = { ...decouvert, caisseId: selectedCaisseId, userAction: getUserAction() };
        actionsApi.fetchData(payload, 'POST', `${BASE_URL}/new`, 'create');
    };

    const handleVerify = () => {
        if (!selectedDecouvert?.id) return;
        actionsApi.fetchData(
            { comments: actionComment, userAction: getUserAction() },
            'POST',
            `${BASE_URL}/verify/${selectedDecouvert.id}`,
            'verify'
        );
    };

    const handleApprove = () => {
        if (!selectedDecouvert?.id) return;
        actionsApi.fetchData(
            { comments: actionComment, userAction: getUserAction() },
            'POST',
            `${BASE_URL}/approve/${selectedDecouvert.id}`,
            'approve'
        );
    };

    const handleDisburse = (row: DecouvertRequest) => {
        setDisburseRequestId(row.id ?? null);
        setDisburseAmount(row.requestedAmount || 0);
        setDisburseBilletage({});
        setDisburseBilletageVisible(true);
    };

    const calculateDisburseBilletageTotal = (): number =>
        DENOMINATIONS.reduce((sum, d) => sum + (disburseBilletage[d.field] || 0) * d.value, 0);

    const handleDisburseBilletageChange = (field: string, value: number) => {
        setDisburseBilletage(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitDisburse = () => {
        const billetageTotal = calculateDisburseBilletageTotal();
        if (billetageTotal <= 0) {
            showToast('error', 'Billetage requis', 'Veuillez saisir le billetage (billets à remettre au client).');
            return;
        }
        if (disburseAmount > 0 && Math.abs(billetageTotal - disburseAmount) > 0.01) {
            showToast('error', 'Billetage incorrect',
                `Le total du billetage (${formatNumberFBu(billetageTotal)} FBu) ne correspond pas au montant du découvert (${formatNumberFBu(disburseAmount)} FBu).`);
            return;
        }
        actionsApi.fetchData(
            { userAction: getUserAction(), billetage: disburseBilletage },
            'POST',
            `${BASE_URL}/disburse/${disburseRequestId}`,
            'disburse'
        );
        setDisburseBilletageVisible(false);
    };

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            showToast('warn', 'Requis', 'Veuillez indiquer le motif du rejet');
            return;
        }
        if (!selectedDecouvert?.id) return;
        actionsApi.fetchData(
            { reason: rejectionReason, userAction: getUserAction() },
            'POST',
            `${BASE_URL}/reject/${selectedDecouvert.id}`,
            'reject'
        );
    };

    const handleCancel = (row: DecouvertRequest) => {
        confirmDialog({
            message: `Annuler la demande ${row.requestNumber} ?`,
            header: 'Confirmation d\'Annulation',
            icon: 'pi pi-question-circle',
            acceptLabel: 'Oui, annuler',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData(
                    { reason: 'Annulé par le créateur', userAction: getUserAction() },
                    'POST',
                    `${BASE_URL}/cancel/${row.id}`,
                    'cancel'
                );
            },
        });
    };

    // ── Document handlers ─────────────────────────────────────────────────────

    const openDocList = async (row: DecouvertRequest) => {
        setDocDecouvert(row);
        setDocListDialog(true);
        if (!row.id) return;
        setLoadingDocs(true);
        try {
            const token = Cookies.get('token');
            const res = await fetch(`${DOCS_URL}/findbydecouvert/${row.id}`, {
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            setDecouvertDocs(res.ok ? await res.json() : []);
        } catch {
            setDecouvertDocs([]);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleFileSelect = (e: any) => {
        if (e.files && e.files.length > 0) {
            const file = e.files[0];
            setSelectedFile(file);
            if (!newDocName) setNewDocName(file.name.replace(/\.[^/.]+$/, ''));
        }
    };

    const handleAddDocument = async () => {
        if (!selectedFile || !docDecouvert?.id) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un fichier');
            return;
        }
        if (!newDocName.trim()) {
            showToast('warn', 'Attention', 'Veuillez saisir le nom du document');
            return;
        }
        setUploading(true);
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', `epargne/decouvert/${docDecouvert.id}`);

            const uploadRes = await fetch(`${FILES_URL}/upload`, {
                method: 'POST',
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                body: formData,
            });
            if (!uploadRes.ok) throw new Error('Erreur lors du téléchargement du fichier');

            const uploadData = await uploadRes.json();
            const filePath = uploadData.filePath || uploadData.path || uploadData.url;

            const docRes = await fetch(`${DOCS_URL}/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    decouvertId: docDecouvert.id,
                    documentName: newDocName.trim(),
                    filePath,
                    fileSizeKb: Math.round(selectedFile.size / 1024),
                    mimeType: selectedFile.type,
                    userAction: getUserAction(),
                }),
            });

            if (docRes.ok) {
                showToast('success', 'Succès', 'Document joint avec succès');
                setAddDocDialog(false);
                setSelectedFile(null);
                setNewDocName('');
                if (fileUploadRef.current) fileUploadRef.current.clear();
                await openDocList(docDecouvert);
            } else {
                throw new Error('Erreur lors de l\'enregistrement du document');
            }
        } catch (err: any) {
            showToast('error', 'Erreur', err.message || 'Erreur lors du téléchargement');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocument = (doc: any) => {
        confirmDialog({
            message: `Supprimer le document "${doc.documentName}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: async () => {
                try {
                    const token = Cookies.get('token');
                    const res = await fetch(`${DOCS_URL}/delete/${doc.id}`, {
                        method: 'DELETE',
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                    });
                    if (res.ok) {
                        showToast('success', 'Succès', 'Document supprimé');
                        if (docDecouvert) await openDocList(docDecouvert);
                    }
                } catch {
                    showToast('error', 'Erreur', 'Erreur lors de la suppression');
                }
            },
        });
    };

    const handleViewDocument = (doc: any) => {
        if (doc.filePath) {
            window.open(`${FILES_URL}/download?filePath=${encodeURIComponent(doc.filePath)}`, '_blank');
        }
    };

    // ── Dialog helpers ────────────────────────────────────────────────────────

    const openView = (row: DecouvertRequest) => { setSelectedDecouvert(row); setViewDialog(true); };
    const openPrint = (row: DecouvertRequest) => { setSelectedDecouvert(row); setPrintDialog(true); };
    const openReject = (row: DecouvertRequest) => { setSelectedDecouvert(row); setRejectionReason(''); setRejectDialog(true); };
    const openComment = (row: DecouvertRequest, action: 'verify' | 'approve') => {
        setSelectedDecouvert(row); setCommentAction(action); setActionComment(''); setCommentDialog(true);
    };

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(
            `<html><head><title>Reçu Découvert</title>
            <style>@media print { body { margin: 0; } }</style>
            </head><body>${content.innerHTML}</body></html>`
        );
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    // ── Utilities ─────────────────────────────────────────────────────────────

    const showToast = (severity: 'success' | 'error' | 'warn' | 'info', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const getCurrentUser = (): string => {
        try {
            const appUserCookie = Cookies.get('appUser');
            if (appUserCookie) {
                const appUser = JSON.parse(appUserCookie);
                return `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || appUser.email || 'Unknown';
            }
        } catch (e) {}
        return 'Unknown';
    };

    const fmt = (v?: number | null) =>
        v != null ? new Intl.NumberFormat('fr-BI').format(v) + ' FBU' : '–';

    const statusTag = (row: DecouvertRequest) => (
        <Tag value={STATUS_LABELS[row.status ?? 'PENDING']} severity={STATUS_SEVERITY[row.status ?? 'PENDING']} />
    );

    const clientBody = (row: DecouvertRequest) => {
        if (row.client) return `${row.client.firstName ?? ''} ${row.client.lastName ?? ''}`.trim();
        if (row.solidarityGroup) return row.solidarityGroup.groupName;
        return `Cpte #${row.savingsAccountId}`;
    };

    const amountBody     = (row: DecouvertRequest) => fmt(row.requestedAmount);
    const totalBody      = (row: DecouvertRequest) => (
        <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{fmt(row.totalAmount)}</span>
    );
    const balanceAfterBody = (row: DecouvertRequest) =>
        row.balanceAfterDisbursement != null ? (
            <span style={{ color: row.balanceAfterDisbursement < 0 ? '#e74c3c' : '#27ae60', fontWeight: 'bold' }}>
                {fmt(row.balanceAfterDisbursement)}
            </span>
        ) : <span>–</span>;

    const actionsBody = (row: DecouvertRequest) => (
        <div className="flex gap-1 flex-wrap">
            <Button icon="pi pi-eye"        rounded text severity="info"      tooltip="Voir"            onClick={() => openView(row)} />
            <Button icon="pi pi-print"      rounded text severity="secondary" tooltip="Imprimer"         onClick={() => openPrint(row)} />
            <Button icon="pi pi-paperclip"  rounded text severity="info"      tooltip="Documents joints" onClick={() => openDocList(row)} />

            {row.status === 'PENDING' && can('EPARGNE_DECOUVERT_VERIFY') && (
                <Button icon="pi pi-check" rounded text severity="help"    tooltip="Vérifier"  onClick={() => openComment(row, 'verify')} />
            )}
            {row.status === 'VERIFIED' && can('EPARGNE_DECOUVERT_APPROVE') && (
                <Button icon="pi pi-check-circle" rounded text severity="success" tooltip="Approuver" onClick={() => openComment(row, 'approve')} />
            )}
            {row.status === 'APPROVED' && can('EPARGNE_DECOUVERT_DISBURSE') && (
                <Button icon="pi pi-dollar" rounded text severity="success" tooltip="Décaisser" onClick={() => handleDisburse(row)} />
            )}
            {['PENDING', 'VERIFIED', 'APPROVED'].includes(row.status ?? '') && can('EPARGNE_DECOUVERT_REJECT') && (
                <Button icon="pi pi-times" rounded text severity="danger"  tooltip="Rejeter"   onClick={() => openReject(row)} />
            )}
            {row.status === 'PENDING' && can('EPARGNE_DECOUVERT_CREATE') && (
                <Button icon="pi pi-ban"   rounded text severity="warning" tooltip="Annuler"   onClick={() => handleCancel(row)} />
            )}
        </div>
    );

    const pendingList = decouvertList.filter((d) =>
        ['PENDING', 'VERIFIED', 'APPROVED'].includes(d.status ?? '')
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="card">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#2c3e50' }}>
                    <i className="pi pi-arrow-circle-down mr-2" />
                    Découvert – Avance sur Épargne
                </h2>
                <p className="text-sm text-500 mb-4">
                    Retrait anticipé même si le solde est insuffisant · Intérêts 5% prélevés immédiatement
                </p>

                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>

                    {/* TAB 1 – NOUVELLE DEMANDE */}
                    {can('EPARGNE_DECOUVERT_CREATE') && (
                        <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                            <DecouvertRequestForm
                                decouvert={decouvert}
                                onChange={setDecouvert}
                                savingsAccounts={savingsAccounts}
                                internalAccounts={internalAccounts}
                            />
                            <div className="flex justify-content-end mt-4">
                                <Button
                                    label="Soumettre la Demande"
                                    icon="pi pi-send"
                                    onClick={handleCreate}
                                    loading={actionsApi.loading && actionsApi.callType === 'create'}
                                />
                            </div>
                        </TabPanel>
                    )}

                    {/* TAB 2 – EN COURS */}
                    <TabPanel header={`En Cours (${pendingList.length})`} leftIcon="pi pi-clock mr-2">
                        <DataTable
                            value={pendingList}
                            loading={loading}
                            paginator rows={10}
                            globalFilter={globalFilter}
                            header={
                                <div className="flex justify-content-between align-items-center">
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText
                                            value={globalFilter}
                                            onChange={(e) => setGlobalFilter(e.target.value)}
                                            placeholder="Rechercher..."
                                        />
                                    </span>
                                    <Button icon="pi pi-refresh" rounded text onClick={loadDecouvertList} tooltip="Actualiser" />
                                </div>
                            }
                            emptyMessage="Aucune demande en cours"
                            rowHover
                        >
                            <Column field="requestNumber" header="N° Demande" sortable />
                            <Column header="Client / Groupe" body={clientBody} />
                            <Column header="Montant Demandé" body={amountBody} sortable field="requestedAmount" />
                            <Column header="Total (avec intérêts)" body={totalBody} />
                            <Column header="Statut" body={statusTag} />
                            <Column field="requestDate" header="Date" sortable />
                            <Column header="Actions" body={actionsBody} style={{ minWidth: '240px' }} />
                        </DataTable>
                    </TabPanel>

                    {/* TAB 3 – TOUTES */}
                    <TabPanel header="Toutes les Demandes" leftIcon="pi pi-list mr-2">
                        <DataTable
                            value={decouvertList}
                            loading={loading}
                            paginator rows={15}
                            globalFilter={globalFilter}
                            header={
                                <div className="flex justify-content-between align-items-center">
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText
                                            value={globalFilter}
                                            onChange={(e) => setGlobalFilter(e.target.value)}
                                            placeholder="Rechercher..."
                                        />
                                    </span>
                                    <Button icon="pi pi-refresh" rounded text onClick={loadDecouvertList} tooltip="Actualiser" />
                                </div>
                            }
                            emptyMessage="Aucune demande de découvert"
                            rowHover
                        >
                            <Column field="requestNumber" header="N° Demande" sortable />
                            <Column header="Client / Groupe" body={clientBody} />
                            <Column header="Montant Demandé" body={amountBody} sortable field="requestedAmount" />
                            <Column header="Intérêts (5%)" body={(r: DecouvertRequest) =>
                                <span style={{ color: '#e74c3c' }}>{fmt(r.interestAmount)}</span>} />
                            <Column header="Total Débité" body={totalBody} />
                            <Column header="Solde Après" body={balanceAfterBody} />
                            <Column header="Statut" body={statusTag} sortable field="status" />
                            <Column field="requestDate" header="Date" sortable />
                            <Column header="Actions" body={actionsBody} style={{ minWidth: '240px' }} />
                        </DataTable>
                    </TabPanel>

                    {/* Tab: Découverts du Jour */}
                    {can('EPARGNE_DECOUVERT_VIEW_TODAY') && <TabPanel header="Découverts du Jour" leftIcon="pi pi-calendar mr-2">
                        <DataTable
                            value={decouvertList.filter(d => d.requestDate === formatLocalDate(new Date()))}
                            loading={loading}
                            paginator rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            globalFilter={globalFilter}
                            header={
                                <div className="flex justify-content-between align-items-center">
                                    <h5 className="m-0">Découverts du Jour</h5>
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText
                                            value={globalFilter}
                                            onChange={(e) => setGlobalFilter(e.target.value)}
                                            placeholder="Rechercher..."
                                        />
                                    </span>
                                </div>
                            }
                            emptyMessage="Aucune demande de découvert pour aujourd'hui"
                            stripedRows
                            showGridlines
                            size="small"
                            sortField="requestDate"
                            sortOrder={-1}
                            rowHover
                        >
                            <Column field="requestNumber" header="N° Demande" sortable />
                            <Column header="Client / Groupe" body={clientBody} />
                            <Column header="Montant Demandé" body={amountBody} sortable field="requestedAmount" />
                            <Column header="Intérêts (5%)" body={(r: DecouvertRequest) =>
                                <span style={{ color: '#e74c3c' }}>{fmt(r.interestAmount)}</span>} />
                            <Column header="Total Débité" body={totalBody} />
                            <Column header="Solde Après" body={balanceAfterBody} />
                            <Column header="Statut" body={statusTag} sortable field="status" />
                            <Column field="requestDate" header="Date" sortable />
                            <Column field="userAction" header="Utilisateur" sortable />
                            <Column header="Actions" body={actionsBody} style={{ minWidth: '240px' }} />
                        </DataTable>
                    </TabPanel>}

                    {/* Tab: Mes Découverts par Période */}
                    {can('EPARGNE_DECOUVERT_VIEW_PERIOD') && <TabPanel header="Mes Découverts par Période" leftIcon="pi pi-filter mr-2">
                        {(() => {
                            const currentUser = getCurrentUser();
                            const filtered = decouvertList.filter(d => {
                                if (d.userAction !== currentUser) return false;
                                if (periodStart && d.requestDate && d.requestDate < formatLocalDate(periodStart)) return false;
                                if (periodEnd && d.requestDate && d.requestDate > formatLocalDate(periodEnd)) return false;
                                return true;
                            });
                            return (
                                <DataTable
                                    value={filtered}
                                    loading={loading}
                                    paginator rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    header={
                                        <div className="flex flex-column gap-2">
                                            <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
                                                <div>
                                                    <h5 className="m-0">Mes Découverts par Période</h5>
                                                    <small className="text-500">Utilisateur: <strong>{currentUser}</strong> — {filtered.length} demande(s)</small>
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
                                    emptyMessage="Aucune demande trouvée pour cette période"
                                    stripedRows
                                    showGridlines
                                    size="small"
                                    sortField="requestDate"
                                    sortOrder={-1}
                                    rowHover
                                >
                                    <Column field="requestNumber" header="N° Demande" sortable />
                                    <Column header="Client / Groupe" body={clientBody} />
                                    <Column header="Montant Demandé" body={amountBody} sortable field="requestedAmount" />
                                    <Column header="Intérêts (5%)" body={(r: DecouvertRequest) =>
                                        <span style={{ color: '#e74c3c' }}>{fmt(r.interestAmount)}</span>} />
                                    <Column header="Total Débité" body={totalBody} />
                                    <Column header="Solde Après" body={balanceAfterBody} />
                                    <Column header="Statut" body={statusTag} sortable field="status" />
                                    <Column field="requestDate" header="Date" sortable />
                                    <Column field="userAction" header="Utilisateur" sortable />
                                    <Column header="Actions" body={actionsBody} style={{ minWidth: '240px' }} />
                                </DataTable>
                            );
                        })()}
                    </TabPanel>}
                </TabView>
            </div>

            {/* VIEW DIALOG */}
            <Dialog
                visible={viewDialog}
                onHide={() => setViewDialog(false)}
                header={`Détail – ${selectedDecouvert?.requestNumber}`}
                style={{ width: '800px' }}
                maximizable
            >
                {selectedDecouvert && (
                    <DecouvertRequestForm
                        decouvert={selectedDecouvert}
                        onChange={() => {}}
                        savingsAccounts={savingsAccounts}
                        internalAccounts={internalAccounts}
                        viewOnly
                    />
                )}
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Imprimer" icon="pi pi-print" severity="secondary"
                        onClick={() => { setViewDialog(false); setPrintDialog(true); }} />
                    <Button label="Fermer" icon="pi pi-times" onClick={() => setViewDialog(false)} />
                </div>
            </Dialog>

            {/* VERIFY / APPROVE COMMENT DIALOG */}
            <Dialog
                visible={commentDialog}
                onHide={() => setCommentDialog(false)}
                header={commentAction === 'verify' ? 'Vérifier la Demande' : 'Approuver la Demande'}
                style={{ width: '450px' }}
            >
                <div className="p-fluid">
                    <label className="font-semibold block mb-1">Commentaires (optionnel)</label>
                    <InputTextarea
                        value={actionComment}
                        onChange={(e) => setActionComment(e.target.value)}
                        rows={3}
                        placeholder="Ajoutez vos commentaires..."
                        className="w-full"
                        autoResize
                    />
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setCommentDialog(false)} />
                    <Button
                        label={commentAction === 'verify' ? 'Confirmer Vérification' : 'Confirmer Approbation'}
                        icon="pi pi-check"
                        severity={commentAction === 'verify' ? 'help' : 'success'}
                        loading={actionsApi.loading}
                        onClick={commentAction === 'verify' ? handleVerify : handleApprove}
                    />
                </div>
            </Dialog>

            {/* REJECT DIALOG */}
            <Dialog
                visible={rejectDialog}
                onHide={() => setRejectDialog(false)}
                header={`Rejeter – ${selectedDecouvert?.requestNumber}`}
                style={{ width: '450px' }}
            >
                <div className="p-fluid">
                    <label className="font-semibold block mb-1">Motif du rejet *</label>
                    <InputTextarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        placeholder="Expliquez la raison du rejet..."
                        className="w-full"
                        autoResize
                    />
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setRejectDialog(false)} />
                    <Button
                        label="Confirmer Rejet"
                        icon="pi pi-ban"
                        severity="danger"
                        loading={actionsApi.loading}
                        onClick={handleRejectSubmit}
                    />
                </div>
            </Dialog>

            {/* PRINT DIALOG */}
            <Dialog
                visible={printDialog}
                onHide={() => setPrintDialog(false)}
                header="Aperçu avant impression"
                style={{ width: '820px' }}
                maximizable
            >
                <div ref={printRef}>
                    {selectedDecouvert && (
                        <PrintableDecouvertReceipt
                            decouvert={selectedDecouvert}
                            savingsAccounts={savingsAccounts}
                        />
                    )}
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Fermer"   icon="pi pi-times"  severity="secondary" onClick={() => setPrintDialog(false)} />
                    <Button label="Imprimer" icon="pi pi-print"  onClick={handlePrint} />
                </div>
            </Dialog>

            {/* DOCUMENT LIST DIALOG */}
            <Dialog
                visible={docListDialog}
                onHide={() => setDocListDialog(false)}
                header={
                    <span>
                        <i className="pi pi-paperclip mr-2" />
                        Documents – {docDecouvert?.requestNumber}
                    </span>
                }
                style={{ width: '700px' }}
                maximizable
            >
                <div className="flex justify-content-between align-items-center mb-3">
                    <span className="text-500 text-sm">
                        Contrats, pièces justificatives et documents liés à cette demande de découvert
                    </span>
                    <Button
                        label="Joindre un document"
                        icon="pi pi-plus"
                        size="small"
                        onClick={() => { setNewDocName(''); setSelectedFile(null); setAddDocDialog(true); }}
                    />
                </div>

                {loadingDocs ? (
                    <div className="flex align-items-center justify-content-center p-4">
                        <i className="pi pi-spin pi-spinner mr-2" /> Chargement...
                    </div>
                ) : (
                    <DataTable
                        value={decouvertDocs}
                        dataKey="id"
                        emptyMessage="Aucun document joint"
                        className="p-datatable-sm"
                        paginator={decouvertDocs.length > 5}
                        rows={5}
                    >
                        <Column
                            field="documentName"
                            header="Nom du Document"
                            body={(row: any) => (
                                <a
                                    className="text-primary cursor-pointer hover:underline flex align-items-center gap-1"
                                    onClick={() => handleViewDocument(row)}
                                >
                                    <i className="pi pi-file text-sm" />
                                    {row.documentName || 'Document'}
                                </a>
                            )}
                        />
                        <Column
                            field="fileSizeKb"
                            header="Taille"
                            style={{ width: '80px' }}
                            body={(row: any) => row.fileSizeKb ? `${row.fileSizeKb} KB` : '–'}
                        />
                        <Column
                            field="createdAt"
                            header="Date"
                            style={{ width: '120px' }}
                            body={(row: any) => row.createdAt ? new Date(row.createdAt).toLocaleDateString('fr-FR') : '–'}
                        />
                        <Column field="userAction" header="Par" style={{ width: '130px' }} />
                        <Column
                            header="Actions"
                            style={{ width: '90px' }}
                            body={(row: any) => (
                                <div className="flex gap-1">
                                    <Button
                                        icon="pi pi-eye"
                                        rounded text severity="info" size="small"
                                        tooltip="Ouvrir"
                                        onClick={() => handleViewDocument(row)}
                                    />
                                    <Button
                                        icon="pi pi-trash"
                                        rounded text severity="danger" size="small"
                                        tooltip="Supprimer"
                                        onClick={() => handleDeleteDocument(row)}
                                    />
                                </div>
                            )}
                        />
                    </DataTable>
                )}
            </Dialog>

            {/* ADD DOCUMENT DIALOG */}
            <Dialog
                visible={addDocDialog}
                onHide={() => setAddDocDialog(false)}
                header="Joindre un document"
                style={{ width: '480px' }}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary"
                            onClick={() => setAddDocDialog(false)} />
                        <Button
                            label="Joindre"
                            icon="pi pi-upload"
                            onClick={handleAddDocument}
                            loading={uploading}
                            disabled={!selectedFile || !newDocName.trim()}
                        />
                    </div>
                }
            >
                <div className="field mb-3">
                    <label className="font-medium mb-2 block">Nom du document *</label>
                    <InputText
                        value={newDocName}
                        onChange={(e) => setNewDocName(e.target.value)}
                        placeholder="Ex: Contrat de découvert signé, Pièce d'identité..."
                        className="w-full"
                    />
                </div>
                <div className="field">
                    <label className="font-medium mb-2 block">Sélectionner un fichier *</label>
                    <FileUpload
                        ref={fileUploadRef}
                        mode="basic"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                        maxFileSize={10000000}
                        chooseLabel="Parcourir"
                        auto={false}
                        onSelect={handleFileSelect}
                        onClear={() => setSelectedFile(null)}
                        className="w-full"
                    />
                    <small className="text-500 mt-1 block">Formats acceptés : Images, PDF, Word, Excel (max 10 MB)</small>
                </div>
                {selectedFile && (
                    <div className="mt-2 p-2 surface-50 border-round">
                        <i className="pi pi-check-circle text-green-500 mr-2" />
                        <strong>{selectedFile.name}</strong>
                        <span className="text-500 ml-2">({(selectedFile.size / 1024).toFixed(0)} KB)</span>
                    </div>
                )}
            </Dialog>

            {/* DISBURSE BILLETAGE DIALOG */}
            {disburseBilletageVisible && (() => {
                const total = calculateDisburseBilletageTotal();
                const diff = total - disburseAmount;
                const matched = disburseAmount > 0 && Math.abs(diff) < 0.01;
                const bills = DENOMINATIONS.filter(d => d.value >= 500);
                const coins = DENOMINATIONS.filter(d => d.value < 500);
                const billsTotal = bills.reduce((s, d) => s + (disburseBilletage[d.field] || 0) * d.value, 0);
                const coinsTotal = coins.reduce((s, d) => s + (disburseBilletage[d.field] || 0) * d.value, 0);

                return (
                    <Dialog
                        visible={disburseBilletageVisible}
                        onHide={() => setDisburseBilletageVisible(false)}
                        header={
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-wallet" style={{ color: '#2980b9', fontSize: '1.2rem' }} />
                                <span className="font-bold text-lg">Billetage – Décaissement Découvert</span>
                            </div>
                        }
                        style={{ width: '620px' }}
                        footer={
                            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                                {/* Status bar */}
                                <div
                                    className="flex align-items-center justify-content-between p-3 border-round mb-3"
                                    style={{
                                        background: matched ? '#f0fdf4' : total > 0 ? '#fff7ed' : '#f8fafc',
                                        border: `1.5px solid ${matched ? '#86efac' : total > 0 ? '#fdba74' : '#e2e8f0'}`,
                                    }}
                                >
                                    <div className="flex align-items-center gap-2">
                                        <i className={`pi ${matched ? 'pi-check-circle' : 'pi-info-circle'}`}
                                            style={{ color: matched ? '#16a34a' : total > 0 ? '#ea580c' : '#94a3b8', fontSize: '1.1rem' }} />
                                        <div>
                                            <div className="text-xs text-500 mb-1">Total billetage</div>
                                            <span className="font-bold text-lg" style={{ color: matched ? '#16a34a' : total > 0 ? '#ea580c' : '#64748b' }}>
                                                {formatNumberFBu(total)} FBu
                                            </span>
                                        </div>
                                    </div>
                                    <i className="pi pi-arrow-right text-400" />
                                    <div className="text-right">
                                        <div className="text-xs text-500 mb-1">Montant découvert</div>
                                        <span className="font-bold text-lg text-primary">
                                            {formatNumberFBu(disburseAmount)} FBu
                                        </span>
                                    </div>
                                    {total > 0 && !matched && (
                                        <div className="text-right ml-3">
                                            <div className="text-xs text-500 mb-1">Écart</div>
                                            <span className="font-bold" style={{ color: '#ea580c' }}>
                                                {diff > 0 ? '+' : ''}{formatNumberFBu(diff)} FBu
                                            </span>
                                        </div>
                                    )}
                                    {matched && (
                                        <Tag value="Montants OK" severity="success" className="ml-3" />
                                    )}
                                </div>
                                <div className="flex justify-content-end gap-2">
                                    <Button label="Annuler" icon="pi pi-times" severity="secondary"
                                        onClick={() => setDisburseBilletageVisible(false)} />
                                    <Button
                                        label="Confirmer le Décaissement"
                                        icon="pi pi-check"
                                        severity="success"
                                        loading={actionsApi.loading && actionsApi.callType === 'disburse'}
                                        onClick={handleSubmitDisburse}
                                    />
                                </div>
                            </div>
                        }
                    >
                        {/* Amount banner */}
                        <div className="flex align-items-center justify-content-between p-3 border-round mb-4"
                            style={{ background: 'linear-gradient(135deg,#1e3a5f 0%,#2980b9 100%)', color: '#fff' }}>
                            <div>
                                <div className="text-sm opacity-80 mb-1">Montant à décaisser</div>
                                <div className="text-2xl font-bold">{formatNumberFBu(disburseAmount)} FBu</div>
                            </div>
                            <i className="pi pi-money-bill" style={{ fontSize: '2.5rem', opacity: 0.3 }} />
                        </div>

                        {/* Bills section */}
                        <div className="mb-3">
                            <div className="flex align-items-center gap-2 mb-2">
                                <i className="pi pi-ticket text-blue-500" />
                                <span className="font-semibold text-blue-700">Billets</span>
                                {billsTotal > 0 && (
                                    <Tag value={`${formatNumberFBu(billsTotal)} FBu`} severity="info" className="ml-auto" />
                                )}
                            </div>
                            <div style={{ background: '#f8faff', borderRadius: 8, border: '1px solid #dbeafe', overflow: 'hidden' }}>
                                {bills.map((d, i) => (
                                    <div key={d.field}
                                        className="flex align-items-center gap-3 px-3 py-2"
                                        style={{ borderBottom: i < bills.length - 1 ? '1px solid #eff6ff' : 'none' }}
                                    >
                                        <span className="font-medium text-sm" style={{ width: '130px', color: '#1e40af' }}>
                                            {d.label}
                                        </span>
                                        <div style={{ width: '130px' }}>
                                            <InputNumber
                                                value={disburseBilletage[d.field] || 0}
                                                onValueChange={(e) => handleDisburseBilletageChange(d.field, e.value || 0)}
                                                min={0}
                                                showButtons
                                                buttonLayout="horizontal"
                                                decrementButtonIcon="pi pi-minus"
                                                incrementButtonIcon="pi pi-plus"
                                                inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                                            />
                                        </div>
                                        <div className="flex-1 text-right">
                                            {(disburseBilletage[d.field] || 0) > 0 ? (
                                                <span className="font-semibold text-sm" style={{ color: '#1e40af' }}>
                                                    = {formatNumberFBu((disburseBilletage[d.field] || 0) * d.value)} FBu
                                                </span>
                                            ) : (
                                                <span className="text-400 text-sm">–</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coins section */}
                        <div>
                            <div className="flex align-items-center gap-2 mb-2">
                                <i className="pi pi-circle-fill text-orange-400" style={{ fontSize: '0.75rem' }} />
                                <span className="font-semibold text-orange-700">Pièces</span>
                                {coinsTotal > 0 && (
                                    <Tag value={`${formatNumberFBu(coinsTotal)} FBu`} severity="warning" className="ml-auto" />
                                )}
                            </div>
                            <div style={{ background: '#fffbf5', borderRadius: 8, border: '1px solid #fed7aa', overflow: 'hidden' }}>
                                {coins.map((d, i) => (
                                    <div key={d.field}
                                        className="flex align-items-center gap-3 px-3 py-2"
                                        style={{ borderBottom: i < coins.length - 1 ? '1px solid #fff7ed' : 'none' }}
                                    >
                                        <span className="font-medium text-sm" style={{ width: '130px', color: '#9a3412' }}>
                                            {d.label}
                                        </span>
                                        <div style={{ width: '130px' }}>
                                            <InputNumber
                                                value={disburseBilletage[d.field] || 0}
                                                onValueChange={(e) => handleDisburseBilletageChange(d.field, e.value || 0)}
                                                min={0}
                                                showButtons
                                                buttonLayout="horizontal"
                                                decrementButtonIcon="pi pi-minus"
                                                incrementButtonIcon="pi pi-plus"
                                                inputStyle={{ textAlign: 'center', fontWeight: 600, width: '60px' }}
                                            />
                                        </div>
                                        <div className="flex-1 text-right">
                                            {(disburseBilletage[d.field] || 0) > 0 ? (
                                                <span className="font-semibold text-sm" style={{ color: '#9a3412' }}>
                                                    = {formatNumberFBu((disburseBilletage[d.field] || 0) * d.value)} FBu
                                                </span>
                                            ) : (
                                                <span className="text-400 text-sm">–</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Dialog>
                );
            })()}
        </>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={[
            'EPARGNE_DECOUVERT_CREATE', 'EPARGNE_DECOUVERT_VERIFY',
            'EPARGNE_DECOUVERT_APPROVE', 'EPARGNE_DECOUVERT_DISBURSE',
        ]}>
            <DecouvertPage />
        </ProtectedPage>
    );
}
