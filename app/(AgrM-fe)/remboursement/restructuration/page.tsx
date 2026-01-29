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
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Message } from 'primereact/message';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import {
    RestructurationCredit,
    RestructurationCreditClass,
    TYPES_RESTRUCTURATION,
    STATUTS_DEMANDE
} from '../types/RemboursementTypes';

const RestructurationPage = () => {
    const [restructurations, setRestructurations] = useState<RestructurationCredit[]>([]);
    const [restructuration, setRestructuration] = useState<RestructurationCredit>(new RestructurationCreditClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [canRestructure, setCanRestructure] = useState(true);

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/restructurings');

    useEffect(() => {
        loadRestructurations();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadRestructurations':
                    setRestructurations(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'checkCanRestructure':
                    setCanRestructure(data.canRequest);
                    break;
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadRestructurations();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Demande supprimée');
                    loadRestructurations();
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Demande approuvée');
                    loadRestructurations();
                    break;
                case 'reject':
                    showToast('info', 'Info', 'Demande rejetée');
                    loadRestructurations();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadRestructurations = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRestructurations');
    };

    const checkCanRestructure = (loanId: number) => {
        fetchData(null, 'GET', `${BASE_URL}/canrequest/${loanId}`, 'checkCanRestructure');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setRestructuration(new RestructurationCreditClass());
        setIsViewMode(false);
        setCanRestructure(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRestructuration(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setRestructuration(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setRestructuration(prev => ({ ...prev, [name]: value }));

        // Calcul automatique de la nouvelle mensualité
        if (name === 'newTermMonths' || name === 'newInterestRate') {
            // Simplification: recalcul basé sur les nouvelles conditions
        }
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setRestructuration(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleCheckboxChange = (name: string, value: boolean) => {
        setRestructuration(prev => ({ ...prev, [name]: value }));
    };

    const handleLoanIdChange = (value: number | null) => {
        setRestructuration(prev => ({ ...prev, loanId: value }));
        if (value) {
            checkCanRestructure(value);
        }
    };

    const handleSubmit = () => {
        if (!restructuration.loanId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un crédit');
            return;
        }

        if (!canRestructure && !restructuration.id) {
            showToast('warn', 'Attention', 'Ce crédit a déjà été restructuré (maximum 1 restructuration par crédit)');
            return;
        }

        if (restructuration.id) {
            fetchData(restructuration, 'PUT', `${BASE_URL}/update/${restructuration.id}`, 'update');
        } else {
            fetchData(restructuration, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: RestructurationCredit) => {
        setRestructuration({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: RestructurationCredit) => {
        setRestructuration({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleApprove = (rowData: RestructurationCredit) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir approuver cette demande de restructuration ?',
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

    const handleReject = (rowData: RestructurationCredit) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir rejeter cette demande ?',
            header: 'Confirmation de rejet',
            icon: 'pi pi-times-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, rejeter',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'POST', `${BASE_URL}/reject/${rowData.id}?rejectedBy=1&reason=Rejet manuel`, 'reject');
            }
        });
    };

    // Column body templates
    const statusBodyTemplate = (rowData: RestructurationCredit) => {
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

    const typeBodyTemplate = (rowData: RestructurationCredit) => {
        const labelMap: { [key: string]: string } = {
            'TERM_EXTENSION': 'Extension durée',
            'PAYMENT_REDUCTION': 'Réduction mensualité',
            'RATE_MODIFICATION': 'Modification taux',
            'COMBINED': 'Combinée'
        };
        return labelMap[rowData.restructuringType || ''] || rowData.restructuringType;
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const actionsBodyTemplate = (rowData: RestructurationCredit) => (
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
                        icon="pi pi-times"
                        rounded
                        text
                        severity="danger"
                        tooltip="Rejeter"
                        tooltipOptions={{ position: 'top' }}
                        onClick={() => handleReject(rowData)}
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
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-refresh mr-2"></i>
                Demandes de Restructuration
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

            {/* Règles de restructuration */}
            <Card className="mb-4 surface-100">
                <h5 className="m-0 mb-3">
                    <i className="pi pi-info-circle mr-2 text-primary"></i>
                    Règles de Restructuration
                </h5>
                <div className="grid">
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center">
                            <i className="pi pi-check-circle text-green-500 mr-2"></i>
                            <span>Maximum 1 restructuration par crédit</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center">
                            <i className="pi pi-percentage text-blue-500 mr-2"></i>
                            <span>Frais: 2% à 5% du capital restant</span>
                        </div>
                    </div>
                    <div className="col-12 md:col-4">
                        <div className="flex align-items-center">
                            <i className="pi pi-clock text-orange-500 mr-2"></i>
                            <span>Extension max: 50% de la durée initiale</span>
                        </div>
                    </div>
                </div>
            </Card>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    {!canRestructure && (
                        <Message
                            severity="warn"
                            className="mb-3 w-full"
                            text="Ce crédit a déjà été restructuré. Une seule restructuration est autorisée par crédit."
                        />
                    )}

                    <div className="grid">
                        {/* Informations du Crédit */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-folder mr-2"></i>
                                    Informations du Crédit
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">N° Demande</label>
                                        <InputText value={restructuration.requestNumber || ''} disabled className="w-full" placeholder="Auto-généré" />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">ID Crédit *</label>
                                        <InputNumber
                                            value={restructuration.loanId || null}
                                            onValueChange={(e) => handleLoanIdChange(e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Type de Restructuration *</label>
                                        <Dropdown
                                            value={restructuration.restructuringType}
                                            options={TYPES_RESTRUCTURATION}
                                            onChange={(e) => handleDropdownChange('restructuringType', e.value)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            placeholder="Sélectionner..."
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Date Effective</label>
                                        <Calendar
                                            value={restructuration.effectiveDate ? new Date(restructuration.effectiveDate) : null}
                                            onChange={(e) => handleDateChange('effectiveDate', e.value as Date)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            dateFormat="dd/mm/yy"
                                            showIcon
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Conditions Originales vs Nouvelles */}
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3 text-color-secondary">
                                    <i className="pi pi-history mr-2"></i>
                                    Conditions Originales
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold">Durée (Mois)</label>
                                        <InputNumber
                                            value={restructuration.originalTermMonths || null}
                                            onValueChange={(e) => handleNumberChange('originalTermMonths', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix=" mois"
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Taux d'Intérêt (%)</label>
                                        <InputNumber
                                            value={restructuration.originalInterestRate || null}
                                            onValueChange={(e) => handleNumberChange('originalInterestRate', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix="%"
                                            minFractionDigits={2}
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Mensualité</label>
                                        <InputNumber
                                            value={restructuration.originalMonthlyPayment || null}
                                            onValueChange={(e) => handleNumberChange('originalMonthlyPayment', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-4 border-primary border-2">
                                <h5 className="mb-3 text-primary">
                                    <i className="pi pi-arrow-right mr-2"></i>
                                    Nouvelles Conditions
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12">
                                        <label className="font-semibold">Nouvelle Durée (Mois)</label>
                                        <InputNumber
                                            value={restructuration.newTermMonths || null}
                                            onValueChange={(e) => handleNumberChange('newTermMonths', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix=" mois"
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Nouveau Taux d'Intérêt (%)</label>
                                        <InputNumber
                                            value={restructuration.newInterestRate || null}
                                            onValueChange={(e) => handleNumberChange('newInterestRate', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix="%"
                                            minFractionDigits={2}
                                        />
                                    </div>
                                    <div className="field col-12">
                                        <label className="font-semibold">Nouvelle Mensualité</label>
                                        <InputNumber
                                            value={restructuration.newMonthlyPayment || null}
                                            onValueChange={(e) => handleNumberChange('newMonthlyPayment', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Frais et Conditions */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-money-bill mr-2"></i>
                                    Frais et Conditions
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Frais de Restructuration (%)</label>
                                        <InputNumber
                                            value={restructuration.restructuringFeePercent || null}
                                            onValueChange={(e) => handleNumberChange('restructuringFeePercent', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix="%"
                                            min={2}
                                            max={5}
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Montant des Frais</label>
                                        <InputNumber
                                            value={restructuration.restructuringFee || null}
                                            onValueChange={(e) => handleNumberChange('restructuringFee', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            mode="currency"
                                            currency="BIF"
                                            locale="fr-BI"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3">
                                        <label className="font-semibold">Période de Grâce (Mois)</label>
                                        <InputNumber
                                            value={restructuration.gracePeriodMonths || null}
                                            onValueChange={(e) => handleNumberChange('gracePeriodMonths', e.value ?? null)}
                                            className="w-full"
                                            disabled={isViewMode}
                                            suffix=" mois"
                                        />
                                    </div>
                                    <div className="field col-12 md:col-3 flex align-items-end">
                                        <div className="flex align-items-center">
                                            <Checkbox
                                                inputId="isFeeCapitalized"
                                                checked={restructuration.isFeeCapitalized || false}
                                                onChange={(e) => handleCheckboxChange('isFeeCapitalized', e.checked ?? false)}
                                                disabled={isViewMode}
                                            />
                                            <label htmlFor="isFeeCapitalized" className="ml-2">
                                                Capitaliser les frais
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Justification */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-4">
                                <h5 className="mb-3">
                                    <i className="pi pi-file-edit mr-2"></i>
                                    Justification
                                </h5>
                                <div className="formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold">Raison de la Restructuration *</label>
                                        <InputTextarea
                                            name="reason"
                                            value={restructuration.reason || ''}
                                            onChange={handleChange}
                                            className="w-full"
                                            disabled={isViewMode}
                                            rows={3}
                                            placeholder="Ex: Difficultés temporaires liées à..."
                                        />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label className="font-semibold">Justification du Client</label>
                                        <InputTextarea
                                            name="clientJustification"
                                            value={restructuration.clientJustification || ''}
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
                                label={restructuration.id ? "Modifier" : "Soumettre la Demande"}
                                icon="pi pi-save"
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={!canRestructure && !restructuration.id}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={restructurations}
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
                            field="restructuringType"
                            header="Type"
                            body={typeBodyTemplate}
                            sortable
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="originalMonthlyPayment"
                            header="Ancienne Mensualité"
                            body={(rowData) => currencyBodyTemplate(rowData.originalMonthlyPayment)}
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="newMonthlyPayment"
                            header="Nouvelle Mensualité"
                            body={(rowData) => currencyBodyTemplate(rowData.newMonthlyPayment)}
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="restructuringFee"
                            header="Frais"
                            body={(rowData) => currencyBodyTemplate(rowData.restructuringFee)}
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
                            style={{ width: '14%' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default RestructurationPage;
