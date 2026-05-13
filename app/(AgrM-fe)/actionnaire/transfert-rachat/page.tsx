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
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import { Panel } from 'primereact/panel';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { Transfert, TransfertClass } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires/transferts');
const ACTIONNAIRES_URL = buildApiUrl('/api/actionnaires');

const MODES_PAIEMENT = [
    { label: 'Virement bancaire (521)', value: 'BANQUE' },
    { label: 'Versement en caisse (571)', value: 'CAISSE' },
];

export default function TransfertRachatPage() {
    const [transfert, setTransfert] = useState<Transfert>(new TransfertClass());
    const [transferts, setTransferts] = useState<Transfert[]>([]);
    const [actionnaires, setActionnaires] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [typeOp, setTypeOp] = useState<'TRANSFERT' | 'RACHAT'>('TRANSFERT');
    const [globalFilter, setGlobalFilter] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [verificationResult, setVerificationResult] = useState<any>(null);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Transfert | null>(null);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const crudApi = useConsumApi('');
    const actionnaireApi = useConsumApi('');
    const verifyApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    useEffect(() => {
        listApi.fetchData(null, 'GET', BASE_URL, 'loadTransferts');
        actionnaireApi.fetchData(null, 'GET', `${ACTIONNAIRES_URL}?statut=ACTIF`, 'loadActionnaires');
    }, []);

    useEffect(() => {
        if (listApi.data && listApi.callType === 'loadTransferts') {
            setTransferts(Array.isArray(listApi.data) ? listApi.data : listApi.data.content || []);
        }
        if (actionnaireApi.data && actionnaireApi.callType === 'loadActionnaires') {
            const data = Array.isArray(actionnaireApi.data) ? actionnaireApi.data : actionnaireApi.data.content || [];
            setActionnaires(data.map((a: any) => ({ label: `${a.numeroActionnaire} — ${a.nom}`, value: a.id, data: a })));
        }
        if (verifyApi.data && verifyApi.callType === 'verify') {
            setVerificationResult(verifyApi.data);
        }
        if (verifyApi.error && verifyApi.callType === 'verify') {
            setVerificationResult({ ok: false, message: verifyApi.error.message });
        }
    }, [listApi.data, actionnaireApi.data, verifyApi.data, verifyApi.error, listApi.callType, actionnaireApi.callType, verifyApi.callType]);

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande enregistrée et soumise au circuit d\'approbation');
                    resetForm();
                    setActiveIndex(1);
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadTransferts');
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Demande approuvée — transfert exécuté');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadTransferts');
                    break;
                case 'reject':
                    showToast('success', 'Info', 'Demande rejetée');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadTransferts');
                    break;
            }
        }
        if (crudApi.error) {
            showToast('error', 'Erreur', crudApi.error.message || 'Une erreur est survenue');
        }
    }, [crudApi.data, crudApi.error, crudApi.callType]);

    const resetForm = () => {
        setTransfert(new TransfertClass());
        setVerificationResult(null);
        setValidationErrors([]);
    };

    const handleDropdownChange = (name: string, value: any) => {
        setTransfert(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setTransfert(prev => {
            const updated = { ...prev, [name]: value ?? 0 };
            if (name === 'nombreParts' || name === 'prixParPart') {
                updated.montantTotal = (updated.nombreParts || 0) * (updated.prixParPart || 0);
            }
            return updated;
        });
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setTransfert(prev => ({ ...prev, [name]: value ? value.toISOString().split('T')[0] : '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTransfert(prev => ({ ...prev, [name]: value }));
    };

    const handleVerify = () => {
        if (!transfert.cedantId) { showToast('warn', 'Attention', 'Sélectionnez l\'actionnaire cédant d\'abord'); return; }
        verifyApi.fetchData(null, 'GET', `${ACTIONNAIRES_URL}/${transfert.cedantId}/verifier-rachat`, 'verify');
    };

    const validate = (): boolean => {
        const errors: string[] = [];
        if (!transfert.cedantId) errors.push('Veuillez sélectionner l\'actionnaire cédant.');
        if (typeOp === 'TRANSFERT' && !transfert.cessionnairId) errors.push('Veuillez sélectionner le cessionnaire.');
        if (!transfert.nombreParts || transfert.nombreParts <= 0) errors.push('Le nombre de parts doit être supérieur à 0.');
        if (!transfert.prixParPart || transfert.prixParPart <= 0) errors.push('Le prix par part est requis.');
        if (!transfert.dateCession) errors.push('La date est requise.');
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const dataToSend = { ...transfert, typeOperation: typeOp, userAction: getUserAction() };
        crudApi.fetchData(dataToSend, 'POST', BASE_URL, 'create');
    };

    const handleApprove = (item: Transfert) => {
        confirmDialog({
            message: `Approuver et exécuter ce ${item.typeOperation === 'RACHAT' ? 'rachat' : 'transfert'} ?`,
            header: 'Approbation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Approuver',
            rejectLabel: 'Annuler',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/approuver`, 'approve')
        });
    };

    const handleReject = (item: Transfert) => {
        confirmDialog({
            message: 'Rejeter cette demande ?',
            header: 'Rejet',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Rejeter',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/rejeter`, 'reject')
        });
    };

    const formatCurrency = (val: number) =>
        (val || 0).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU';

    const statutBodyTemplate = (row: Transfert) => {
        const colors: Record<string, string> = { EN_ATTENTE: '#f97316', APPROUVEE: '#22c55e', REJETEE: '#ef4444', EXECUTEE: '#3b82f6' };
        const labels: Record<string, string> = { EN_ATTENTE: 'En attente', APPROUVEE: 'Approuvée', REJETEE: 'Rejetée', EXECUTEE: 'Exécutée' };
        return <Tag value={labels[row.statut || ''] || row.statut} style={{ backgroundColor: colors[row.statut || ''] || '#6b7280' }} />;
    };

    const typeOpBodyTemplate = (row: Transfert) => (
        <Tag
            value={row.typeOperation === 'RACHAT' ? 'Rachat' : 'Transfert'}
            style={{ backgroundColor: row.typeOperation === 'RACHAT' ? '#8b5cf6' : '#0ea5e9' }}
        />
    );

    const actionsBodyTemplate = (row: Transfert) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => { setSelectedItem(row); setViewDialog(true); }} tooltip="Voir" />
            {row.statut === 'EN_ATTENTE' && (
                <>
                    <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleApprove(row)} tooltip="Approuver" />
                    <Button icon="pi pi-times" rounded text severity="danger" onClick={() => handleReject(row)} tooltip="Rejeter" />
                </>
            )}
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
            <div className="flex gap-2">
                <Button label="Nouveau transfert" icon="pi pi-arrow-right-arrow-left" onClick={() => { resetForm(); setTypeOp('TRANSFERT'); setActiveIndex(0); }} />
                <Button label="Demande de rachat" icon="pi pi-sign-out" severity="warning" onClick={() => { resetForm(); setTypeOp('RACHAT'); setActiveIndex(0); }} />
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-arrow-right-arrow-left mr-2" />
                Transfert et Rachat de Parts — SH-TRF
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
                <TabPanel header={typeOp === 'RACHAT' ? 'Rachat de Parts' : 'Transfert de Parts'} leftIcon="pi pi-file-edit mr-2">
                    <div className="card p-fluid">
                        <div className="flex gap-2 mb-3">
                            <Button
                                label="Transfert entre actionnaires"
                                icon="pi pi-arrow-right-arrow-left"
                                className={typeOp === 'TRANSFERT' ? '' : 'p-button-outlined'}
                                onClick={() => setTypeOp('TRANSFERT')}
                            />
                            <Button
                                label="Rachat par l'institution"
                                icon="pi pi-sign-out"
                                severity="warning"
                                className={typeOp === 'RACHAT' ? '' : 'p-button-outlined'}
                                onClick={() => setTypeOp('RACHAT')}
                            />
                        </div>

                        {validationErrors.length > 0 && (
                            <div className="mb-3">
                                {validationErrors.map((e, i) => <Message key={i} severity="warn" text={e} className="w-full mb-1" />)}
                            </div>
                        )}

                        {typeOp === 'RACHAT' && (
                            <Panel header="Vérifications automatiques obligatoires" className="mb-3" toggleable>
                                <p className="text-sm text-600 mb-2">Avant tout rachat, le système effectue 3 vérifications :</p>
                                <ul className="text-sm">
                                    <li>1. Aucun crédit actif auprès de l'institution</li>
                                    <li>2. Aucune garantie en cours pour un tiers</li>
                                    <li>3. Délai de préavis statutaire respecté</li>
                                </ul>
                                <Button
                                    label="Lancer les vérifications"
                                    icon="pi pi-search"
                                    size="small"
                                    className="mt-2"
                                    onClick={handleVerify}
                                    loading={verifyApi.loading}
                                />
                                {verificationResult && (
                                    <Message
                                        severity={verificationResult.ok ? 'success' : 'error'}
                                        text={verificationResult.message || (verificationResult.ok ? 'Toutes les vérifications sont passées.' : 'Vérification échouée.')}
                                        className="w-full mt-2"
                                    />
                                )}
                            </Panel>
                        )}

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-users mr-2" />Parties concernées</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label>{typeOp === 'RACHAT' ? 'Actionnaire (cédant)' : 'Cédant'} *</label>
                                    <Dropdown
                                        value={transfert.cedantId}
                                        options={actionnaires}
                                        onChange={e => handleDropdownChange('cedantId', e.value)}
                                        placeholder="Sélectionner l'actionnaire..."
                                        filter
                                        showClear
                                    />
                                </div>
                                {typeOp === 'TRANSFERT' && (
                                    <div className="field col-12 md:col-6">
                                        <label>Cessionnaire *</label>
                                        <Dropdown
                                            value={transfert.cessionnairId}
                                            options={actionnaires}
                                            onChange={e => handleDropdownChange('cessionnairId', e.value)}
                                            placeholder="Sélectionner le cessionnaire..."
                                            filter
                                            showClear
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-money-bill mr-2" />Détails de l'opération</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-3">
                                    <label>Nombre de parts *</label>
                                    <InputNumber value={transfert.nombreParts} onValueChange={e => handleNumberChange('nombreParts', e.value)} min={1} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Prix par part (FBU) *</label>
                                    <InputNumber value={transfert.prixParPart} onValueChange={e => handleNumberChange('prixParPart', e.value)} min={1} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Montant total (FBU)</label>
                                    <InputNumber value={transfert.montantTotal} disabled className="font-bold" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Date de {typeOp === 'RACHAT' ? 'rachat' : 'cession'} *</label>
                                    <Calendar
                                        value={transfert.dateCession ? new Date(transfert.dateCession) : null}
                                        onChange={e => handleDateChange('dateCession', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label>Référence PV du CA</label>
                                    <InputText name="referencePVCA" value={transfert.referencePVCA || ''} onChange={handleChange} placeholder="N° PV du Conseil d'Administration" />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label>Référence décision</label>
                                    <InputText name="referenceDecision" value={transfert.referenceDecision || ''} onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-content-end">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            <Button label="Soumettre au CA" icon="pi pi-send" onClick={handleSubmit} loading={crudApi.loading} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={transferts}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={listApi.loading}
                        emptyMessage="Aucune demande enregistrée"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        globalFilterFields={['cedantNom', 'cessionnaireNom', 'referencePVCA']}
                        header={header}
                    >
                        <Column header="Type" body={typeOpBodyTemplate} style={{ width: '110px' }} />
                        <Column field="cedantNom" header="Cédant" sortable filter style={{ minWidth: '160px' }} />
                        <Column field="cessionnaireNom" header="Cessionnaire" sortable filter style={{ minWidth: '160px' }} />
                        <Column field="nombreParts" header="Parts" sortable body={r => r.nombreParts?.toLocaleString()} />
                        <Column header="Prix/part" body={r => formatCurrency(r.prixParPart)} />
                        <Column header="Montant total" body={r => formatCurrency(r.montantTotal)} sortable />
                        <Column field="dateCession" header="Date" sortable />
                        <Column field="referencePVCA" header="Réf. PV CA" />
                        <Column header="Statut" body={statutBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '130px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog header="Détail de la demande" visible={viewDialog} style={{ width: '600px' }} onHide={() => setViewDialog(false)}>
                {selectedItem && (
                    <div className="grid">
                        <div className="col-6"><strong>Type :</strong> {typeOpBodyTemplate(selectedItem)}</div>
                        <div className="col-6"><strong>Statut :</strong> {statutBodyTemplate(selectedItem)}</div>
                        <div className="col-6"><strong>Cédant :</strong> {selectedItem.cedantNom}</div>
                        <div className="col-6"><strong>Cessionnaire :</strong> {selectedItem.cessionnaireNom || '—'}</div>
                        <div className="col-6"><strong>Parts :</strong> {selectedItem.nombreParts?.toLocaleString()}</div>
                        <div className="col-6"><strong>Prix/part :</strong> {formatCurrency(selectedItem.prixParPart || 0)}</div>
                        <div className="col-6"><strong>Montant total :</strong> {formatCurrency(selectedItem.montantTotal || 0)}</div>
                        <div className="col-6"><strong>Date :</strong> {selectedItem.dateCession}</div>
                        <div className="col-6"><strong>Réf. PV CA :</strong> {selectedItem.referencePVCA}</div>
                        <div className="col-6"><strong>Réf. décision :</strong> {selectedItem.referenceDecision}</div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
