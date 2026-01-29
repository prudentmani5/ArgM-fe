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

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
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

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/early-repayments');

    useEffect(() => {
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    setDemandes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'calculate':
                    setCalculatedAmount(data.settlementAmount);
                    setDemande(prev => ({ ...prev, totalSettlementAmount: data.settlementAmount }));
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
                    showToast('success', 'Succès', 'Remboursement traité avec succès');
                    loadDemandes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
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

        if (demande.id) {
            fetchData(demande, 'PUT', `${BASE_URL}/update/${demande.id}`, 'update');
        } else {
            fetchData(demande, 'POST', `${BASE_URL}/new`, 'create');
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
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir approuver cette demande ?',
            header: 'Confirmation d\'approbation',
            icon: 'pi pi-check-circle',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Oui, approuver',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'POST', `${BASE_URL}/approve/${rowData.id}?approvedBy=1`, 'approve');
            }
        });
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
                fetchData(null, 'POST', `${BASE_URL}/process/${rowData.id}?processedBy=1`, 'process');
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
                severity="success"
                className="mb-4 w-full"
                text="Pas de pénalité pour remboursement anticipé total - Le client économise sur les intérêts restants"
            />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
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
                                            disabled={isViewMode}
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
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Intérêts Courus</label>
                                        <InputNumber
                                            value={demande.accruedInterest || null}
                                            onValueChange={(e) => handleNumberChange('accruedInterest', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Pénalités Accumulées</label>
                                        <InputNumber
                                            value={demande.accruedPenalties || null}
                                            onValueChange={(e) => handleNumberChange('accruedPenalties', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <Button
                                            label="Calculer le Montant Total"
                                            icon="pi pi-calculator"
                                            className="w-full"
                                            onClick={calculateSettlementAmount}
                                            loading={loading && callType === 'calculate'}
                                            disabled={isViewMode}
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

                                {demande.repaymentType === 'TOTAL' && (
                                    <Message
                                        severity="success"
                                        className="w-full"
                                        text="Aucune pénalité pour remboursement anticipé total"
                                    />
                                )}

                                <div className="field mt-3">
                                    <label className="font-semibold">Pénalité de Remboursement Anticipé</label>
                                    <InputNumber
                                        value={demande.penaltyForEarlyRepayment || 0}
                                        className="w-full"
                                        disabled={true}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-BI"
                                    />
                                </div>
                            </div>
                        </div>

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
                        <Column field="requestNumber" header="N° Demande" sortable filter style={{ width: '12%' }} />
                        <Column field="loanId" header="ID Crédit" sortable filter style={{ width: '8%' }} />
                        <Column
                            field="requestDate"
                            header="Date Demande"
                            body={(rowData) => dateBodyTemplate(rowData.requestDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="repaymentType"
                            header="Type"
                            body={typeBodyTemplate}
                            sortable
                            style={{ width: '8%' }}
                        />
                        <Column
                            field="remainingPrincipal"
                            header="Capital Restant"
                            body={(rowData) => currencyBodyTemplate(rowData.remainingPrincipal)}
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="totalSettlementAmount"
                            header="Montant Total"
                            body={(rowData) => currencyBodyTemplate(rowData.totalSettlementAmount)}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="proposedSettlementDate"
                            header="Date Proposée"
                            body={(rowData) => dateBodyTemplate(rowData.proposedSettlementDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="status"
                            header="Statut"
                            body={statusBodyTemplate}
                            sortable
                            filter
                            style={{ width: '10%' }}
                        />
                        <Column
                            header="Actions"
                            body={actionsBodyTemplate}
                            style={{ width: '12%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default RemboursementAnticipePage;
