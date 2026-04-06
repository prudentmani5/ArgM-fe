'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { filterOwnRecordsForCaissier } from '@/utils/userUtils';
import {
    CancellationRequest,
    CancellationRequestClass,
    CancellationSourceType,
    CancellationStatus
} from './CancellationRequest';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

const BASE_URL = `${API_BASE_URL}/api/epargne/cancellation-requests`;
const DEPOSIT_URL = `${API_BASE_URL}/api/epargne/deposit-slips`;
const WITHDRAWAL_URL = `${API_BASE_URL}/api/epargne/withdrawal-requests`;
const VIREMENT_URL = `${API_BASE_URL}/api/epargne/virements/batch`;

const sourceTypeOptions = [
    { label: 'Dépôt (Bordereau)', value: CancellationSourceType.DEPOSIT },
    { label: 'Retrait', value: CancellationSourceType.WITHDRAWAL },
    { label: 'Virement', value: CancellationSourceType.VIREMENT }
];

const formatCurrency = (v?: number) =>
    v != null ? new Intl.NumberFormat('fr-FR').format(v) + ' BIF' : '-';

const statusSeverity = (status?: string) => {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'APPROVED': return 'success';
        case 'REJECTED': return 'danger';
        default: return 'info';
    }
};

const statusLabel = (status?: string) => {
    switch (status) {
        case 'PENDING': return 'En attente';
        case 'APPROVED': return 'Approuvée';
        case 'REJECTED': return 'Rejetée';
        default: return status || '-';
    }
};

function DemandesAnnulationPage() {
    const { can } = useAuthorizedAction();
    const [form, setForm] = useState<CancellationRequest>(new CancellationRequestClass());
    const [requests, setRequests] = useState<CancellationRequest[]>([]);
    const [sourceOptions, setSourceOptions] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [rejectDialog, setRejectDialog] = useState(false);
    const [approveDialog, setApproveDialog] = useState(false);
    const [selected, setSelected] = useState<CancellationRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [validationComment, setValidationComment] = useState('');
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const sourcesApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        loadRequests();
        loadSourceOptions(form.sourceType);
    }, []);

    useEffect(() => {
        if (listApi.data) {
            const data = Array.isArray(listApi.data) ? listApi.data : [];
            // Caissiers see only their own records (by userAction/requestedBy); supervisors/validators see all.
            setRequests(filterOwnRecordsForCaissier(data, ['EPARGNE_CANCELLATION_VALIDATE'], 'requestedBy'));
            setLoading(false);
        }
        if (listApi.error) {
            showToast('error', 'Erreur', listApi.error.message || 'Erreur chargement');
            setLoading(false);
        }
    }, [listApi.data, listApi.error]);

    useEffect(() => {
        if (sourcesApi.data) {
            const arr = Array.isArray(sourcesApi.data) ? sourcesApi.data : [];
            // Only show operations that can still be cancelled (not already closed)
            const eligible = arr.filter((o: any) => o.closingVerified !== true);
            setSourceOptions(eligible);
        }
    }, [sourcesApi.data, sourcesApi.error]);

    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande d\'annulation créée');
                    resetForm();
                    loadRequests();
                    setActiveIndex(1);
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Demande approuvée et opération annulée');
                    setApproveDialog(false);
                    loadRequests();
                    break;
                case 'reject':
                    showToast('success', 'Succès', 'Demande rejetée');
                    setRejectDialog(false);
                    loadRequests();
                    break;
            }
        }
        if (actionsApi.error) {
            showToast('error', 'Erreur', actionsApi.error.message || actionsApi.error.data?.message || 'Erreur');
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const loadRequests = () => {
        setLoading(true);
        listApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAll');
    };

    const loadSourceOptions = (sourceType: string) => {
        let url = '';
        switch (sourceType) {
            case CancellationSourceType.DEPOSIT:
                url = `${DEPOSIT_URL}/findbystatus/COMPLETED`;
                break;
            case CancellationSourceType.WITHDRAWAL:
                url = `${WITHDRAWAL_URL}/findbystatus/DISBURSED`;
                break;
            case CancellationSourceType.VIREMENT:
                url = `${VIREMENT_URL}/findbystatus/VALIDATED`;
                break;
            default:
                setSourceOptions([]);
                return;
        }
        sourcesApi.fetchData(null, 'GET', url, 'loadSources');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const onSourceTypeChange = (value: string) => {
        setForm(prev => ({ ...prev, sourceType: value, sourceId: undefined }));
        loadSourceOptions(value);
    };

    const sourceOptionTemplate = (item: any) => {
        if (!item) return null;
        if (form.sourceType === CancellationSourceType.DEPOSIT) {
            return <span>{item.slipNumber} — {formatCurrency(item.totalAmount || item.amount)} — {item.client?.firstName || ''} {item.client?.lastName || ''}</span>;
        }
        if (form.sourceType === CancellationSourceType.WITHDRAWAL) {
            return <span>{item.requestNumber} — {formatCurrency(item.disbursedAmount || item.approvedAmount)} — {item.client?.firstName || ''} {item.client?.lastName || ''}</span>;
        }
        return <span>{item.batchNumber} — {formatCurrency(item.totalDebitAmount || item.totalAmount)}</span>;
    };

    const validateForm = (): boolean => {
        if (!form.sourceType) { showToast('warn', 'Attention', 'Sélectionnez un type d\'opération'); return false; }
        if (!form.sourceId) { showToast('warn', 'Attention', 'Sélectionnez l\'opération à annuler'); return false; }
        if (!form.reason || form.reason.trim().length < 5) { showToast('warn', 'Attention', 'Le motif doit comporter au moins 5 caractères'); return false; }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const payload = {
            sourceType: form.sourceType,
            sourceId: form.sourceId,
            reason: form.reason,
            userAction: getUserAction()
        };
        actionsApi.fetchData(payload, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        const initial = new CancellationRequestClass();
        setForm(initial);
        loadSourceOptions(initial.sourceType);
    };

    const viewRequest = (row: CancellationRequest) => { setSelected(row); setViewDialog(true); };

    const openApproveDialog = (row: CancellationRequest) => {
        setSelected(row);
        setValidationComment('');
        setApproveDialog(true);
    };

    const openRejectDialog = (row: CancellationRequest) => {
        setSelected(row);
        setRejectionReason('');
        setRejectDialog(true);
    };

    const handleApprove = () => {
        if (!selected) return;
        confirmDialog({
            message: `Approuver l'annulation ${selected.requestNumber} ? Cette action va inverser le solde et les écritures comptables de l'opération source.`,
            header: 'Confirmer l\'approbation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, approuver',
            rejectLabel: 'Non',
            accept: () => {
                actionsApi.fetchData(
                    { validationComment, userAction: getUserAction() },
                    'POST',
                    `${BASE_URL}/approve/${selected.id}`,
                    'approve'
                );
            }
        });
    };

    const handleReject = () => {
        if (!selected || !rejectionReason) {
            showToast('warn', 'Attention', 'Motif de rejet requis');
            return;
        }
        actionsApi.fetchData(
            { rejectionReason, userAction: getUserAction() },
            'POST',
            `${BASE_URL}/reject/${selected.id}`,
            'reject'
        );
    };

    const actionBodyTemplate = (row: CancellationRequest) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" onClick={() => viewRequest(row)} />
            {row.status === 'PENDING' && can('EPARGNE_CANCELLATION_VALIDATE') && (
                <>
                    <Button icon="pi pi-check" rounded text severity="success" tooltip="Approuver" onClick={() => openApproveDialog(row)} />
                    <Button icon="pi pi-times" rounded text severity="danger" tooltip="Rejeter" onClick={() => openRejectDialog(row)} />
                </>
            )}
        </div>
    );

    const sourceTypeBody = (row: CancellationRequest) => {
        const label = sourceTypeOptions.find(o => o.value === row.sourceType)?.label || row.sourceType;
        return <Tag value={label} severity="info" />;
    };

    const statusBody = (row: CancellationRequest) =>
        <Tag value={statusLabel(row.status)} severity={statusSeverity(row.status) as any} />;

    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_CANCELLATION_CREATE', 'EPARGNE_CANCELLATION_VALIDATE']}>
            <div className="card">
                <Toast ref={toast} />
                <ConfirmDialog />

                <h4><i className="pi pi-ban mr-2"></i>Demandes d'Annulation</h4>
                <p className="text-500 mb-4">
                    Créez une demande d'annulation pour un dépôt, un retrait ou un virement déjà validé contenant une erreur.
                    L'annulation est impossible si la clôture journalière de l'opération est déjà effectuée.
                </p>

                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    {/* Tab 1: Create */}
                    <TabPanel header="Nouvelle demande" leftIcon="pi pi-plus mr-2">
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label className="font-medium">Type d'opération *</label>
                                <Dropdown
                                    value={form.sourceType}
                                    options={sourceTypeOptions}
                                    onChange={(e) => onSourceTypeChange(e.value)}
                                    optionLabel="label"
                                    optionValue="value"
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-8">
                                <label className="font-medium">Opération à annuler *</label>
                                <Dropdown
                                    value={form.sourceId}
                                    options={sourceOptions}
                                    onChange={(e) => setForm(prev => ({ ...prev, sourceId: e.value }))}
                                    optionLabel={
                                        form.sourceType === CancellationSourceType.DEPOSIT ? 'slipNumber'
                                        : form.sourceType === CancellationSourceType.WITHDRAWAL ? 'requestNumber'
                                        : 'batchNumber'
                                    }
                                    optionValue="id"
                                    placeholder={sourceOptions.length === 0 ? 'Aucune opération éligible' : 'Sélectionner...'}
                                    filter
                                    itemTemplate={sourceOptionTemplate}
                                    valueTemplate={sourceOptionTemplate}
                                    className="w-full"
                                    emptyMessage="Aucune opération éligible (déjà clôturée ou non validée)"
                                />
                            </div>
                            <div className="field col-12">
                                <label className="font-medium">Motif de l'annulation *</label>
                                <InputTextarea
                                    value={form.reason}
                                    onChange={(e) => setForm(prev => ({ ...prev, reason: e.target.value }))}
                                    rows={3}
                                    placeholder="Expliquez l'erreur qui nécessite cette annulation..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" outlined onClick={resetForm} />
                            <Button
                                label="Soumettre la demande"
                                icon="pi pi-send"
                                onClick={handleSubmit}
                                disabled={!can('EPARGNE_CANCELLATION_CREATE') || actionsApi.loading}
                            />
                        </div>
                    </TabPanel>

                    {/* Tab 2: List */}
                    <TabPanel header="Toutes les demandes" leftIcon="pi pi-list mr-2">
                        <div className="flex justify-content-between mb-3">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Recherche..."
                                />
                            </span>
                            <Button icon="pi pi-refresh" text onClick={loadRequests} />
                        </div>
                        <DataTable
                            value={requests}
                            paginator
                            rows={10}
                            loading={loading}
                            globalFilter={globalFilter}
                            globalFilterFields={['requestNumber', 'sourceReference', 'clientName', 'accountNumber', 'reason', 'requestedBy', 'status', 'sourceType']}
                            emptyMessage="Aucune demande d'annulation"
                            sortField="createdAt"
                            sortOrder={-1}
                        >
                            <Column field="requestNumber" header="N° Demande" sortable />
                            <Column field="sourceType" header="Type" body={sourceTypeBody} sortable />
                            <Column field="sourceReference" header="Opération source" sortable />
                            <Column field="clientName" header="Client" sortable />
                            <Column field="accountNumber" header="N° Compte" sortable />
                            <Column field="amount" header="Montant" body={(r) => formatCurrency(r.amount)} sortable />
                            <Column field="reason" header="Motif" />
                            <Column field="status" header="Statut" body={statusBody} sortable />
                            <Column field="requestedBy" header="Demandé par" sortable />
                            <Column field="createdAt" header="Date" body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleString('fr-FR') : '-'} sortable />
                            <Column header="Actions" body={actionBodyTemplate} />
                        </DataTable>
                    </TabPanel>
                </TabView>

                {/* View Dialog */}
                <Dialog header="Détails de la demande" visible={viewDialog} onHide={() => setViewDialog(false)} style={{ width: '600px' }}>
                    {selected && (
                        <div className="grid">
                            <DetailRow label="N° Demande" value={selected.requestNumber} />
                            <DetailRow label="Type" value={sourceTypeOptions.find(o => o.value === selected.sourceType)?.label} />
                            <DetailRow label="Opération source" value={selected.sourceReference} />
                            <DetailRow label="Client" value={selected.clientName} />
                            <DetailRow label="N° Compte" value={selected.accountNumber} />
                            <DetailRow label="Montant" value={formatCurrency(selected.amount)} />
                            <DetailRow label="Statut" value={statusLabel(selected.status)} />
                            <DetailRow label="Motif" value={selected.reason} />
                            <DetailRow label="Demandé par" value={selected.requestedBy} />
                            <DetailRow label="Date demande" value={selected.requestedAt ? new Date(selected.requestedAt).toLocaleString('fr-FR') : '-'} />
                            {selected.status === 'APPROVED' && (
                                <>
                                    <DetailRow label="Approuvé par" value={selected.validatedBy} />
                                    <DetailRow label="Date approbation" value={selected.validatedAt ? new Date(selected.validatedAt).toLocaleString('fr-FR') : '-'} />
                                    <DetailRow label="Commentaire" value={selected.validationComment} />
                                    <DetailRow label="Pièce de reversal" value={selected.reversalPieceId} />
                                </>
                            )}
                            {selected.status === 'REJECTED' && (
                                <>
                                    <DetailRow label="Rejeté par" value={selected.rejectedBy} />
                                    <DetailRow label="Date rejet" value={selected.rejectedAt ? new Date(selected.rejectedAt).toLocaleString('fr-FR') : '-'} />
                                    <DetailRow label="Motif rejet" value={selected.rejectionReason} />
                                </>
                            )}
                        </div>
                    )}
                </Dialog>

                {/* Approve Dialog */}
                <Dialog header="Approuver la demande" visible={approveDialog} onHide={() => setApproveDialog(false)} style={{ width: '500px' }}>
                    {selected && (
                        <>
                            <p>Vous allez approuver l'annulation de <strong>{selected.sourceReference}</strong> ({formatCurrency(selected.amount)}).</p>
                            <p className="text-orange-600"><i className="pi pi-exclamation-triangle mr-1"></i>Cette action inversera les soldes et les écritures comptables.</p>
                            <div className="field">
                                <label className="font-medium">Commentaire (optionnel)</label>
                                <InputTextarea value={validationComment} onChange={(e) => setValidationComment(e.target.value)} rows={3} className="w-full" />
                            </div>
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button label="Annuler" severity="secondary" outlined onClick={() => setApproveDialog(false)} />
                                <Button label="Confirmer" icon="pi pi-check" severity="success" onClick={handleApprove} />
                            </div>
                        </>
                    )}
                </Dialog>

                {/* Reject Dialog */}
                <Dialog header="Rejeter la demande" visible={rejectDialog} onHide={() => setRejectDialog(false)} style={{ width: '500px' }}>
                    {selected && (
                        <>
                            <p>Rejeter la demande <strong>{selected.requestNumber}</strong> ?</p>
                            <div className="field">
                                <label className="font-medium">Motif de rejet *</label>
                                <InputTextarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={3} className="w-full" />
                            </div>
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button label="Annuler" severity="secondary" outlined onClick={() => setRejectDialog(false)} />
                                <Button label="Rejeter" icon="pi pi-times" severity="danger" onClick={handleReject} />
                            </div>
                        </>
                    )}
                </Dialog>
            </div>
        </ProtectedPage>
    );
}

const DetailRow: React.FC<{ label: string; value?: any }> = ({ label, value }) => (
    <div className="col-12 md:col-6 mb-2">
        <div className="text-500 text-sm">{label}</div>
        <div className="font-medium">{value || '-'}</div>
    </div>
);

export default DemandesAnnulationPage;
