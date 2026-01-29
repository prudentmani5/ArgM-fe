'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';

import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import EcheancierForm from './EcheancierForm';
import {
    EcheancierRemboursement,
    EcheancierRemboursementClass
} from '../types/RemboursementTypes';

const EcheancierPage = () => {
    const [echeanciers, setEcheanciers] = useState<EcheancierRemboursement[]>([]);
    const [echeancier, setEcheancier] = useState<EcheancierRemboursement>(new EcheancierRemboursementClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [generateParams, setGenerateParams] = useState({
        loanId: null as number | null,
        principal: null as number | null,
        interestRate: null as number | null,
        termMonths: null as number | null,
        startDate: new Date(),
        amortizationMethod: 'FRENCH'
    });

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/schedules');

    useEffect(() => {
        loadEcheanciers();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadEcheanciers':
                    setEcheanciers(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadEcheanciers();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Échéance supprimée');
                    loadEcheanciers();
                    break;
                case 'generate':
                    showToast('success', 'Succès', 'Échéancier généré avec succès');
                    setShowGenerateDialog(false);
                    loadEcheanciers();
                    setActiveIndex(1);
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadEcheanciers = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEcheanciers');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setEcheancier(new EcheancierRemboursementClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEcheancier(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setEcheancier(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEcheancier(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setEcheancier(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleSubmit = () => {
        if (!echeancier.loanId || !echeancier.dueDate) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }

        if (echeancier.id) {
            fetchData(echeancier, 'PUT', `${BASE_URL}/update/${echeancier.id}`, 'update');
        } else {
            fetchData(echeancier, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: EcheancierRemboursement) => {
        setEcheancier({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: EcheancierRemboursement) => {
        setEcheancier({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: EcheancierRemboursement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer cette échéance ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleGenerateSchedule = () => {
        if (!generateParams.loanId || !generateParams.principal || !generateParams.termMonths) {
            showToast('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        const params = {
            ...generateParams,
            startDate: generateParams.startDate.toISOString().split('T')[0]
        };

        fetchData(params, 'POST', `${BASE_URL}/generate`, 'generate');
    };

    // Column body templates
    const statusBodyTemplate = (rowData: EcheancierRemboursement) => {
        const severityMap: { [key: string]: 'success' | 'info' | 'warning' | 'danger' } = {
            'PAID': 'success',
            'PARTIAL': 'info',
            'PENDING': 'warning',
            'OVERDUE': 'danger'
        };
        const labelMap: { [key: string]: string } = {
            'PAID': 'Payé',
            'PARTIAL': 'Partiel',
            'PENDING': 'En attente',
            'OVERDUE': 'En retard'
        };
        return (
            <Tag
                value={labelMap[rowData.status || 'PENDING'] || rowData.status}
                severity={severityMap[rowData.status || 'PENDING'] || 'info'}
            />
        );
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const progressBodyTemplate = (rowData: EcheancierRemboursement) => {
        const total = rowData.totalDue || 0;
        const paid = rowData.totalPaid || 0;
        const percentage = total > 0 ? Math.round((paid / total) * 100) : 0;
        return (
            <ProgressBar
                value={percentage}
                showValue={true}
                style={{ height: '1.5rem' }}
            />
        );
    };

    const actionsBodyTemplate = (rowData: EcheancierRemboursement) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-eye"
                rounded
                text
                severity="info"
                tooltip="Voir"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleView(rowData)}
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
            <Button
                icon="pi pi-trash"
                rounded
                text
                severity="danger"
                tooltip="Supprimer"
                tooltipOptions={{ position: 'top' }}
                onClick={() => handleDelete(rowData)}
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">
                <i className="pi pi-calendar mr-2"></i>
                Liste des Échéances
            </h4>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher..."
                    />
                </span>
                <Button
                    label="Générer Échéancier"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={() => setShowGenerateDialog(true)}
                />
            </div>
        </div>
    );

    const amortizationMethods = [
        { label: 'Français (Dégressif)', value: 'FRENCH' },
        { label: 'Linéaire', value: 'LINEAR' }
    ];

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Détails Échéance" leftIcon="pi pi-file-edit mr-2">
                    <EcheancierForm
                        echeancier={echeancier}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        isViewMode={isViewMode}
                    />

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label={echeancier.id ? "Modifier" : "Enregistrer"}
                                icon="pi pi-save"
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                        {isViewMode && (
                            <Button
                                label="Modifier"
                                icon="pi pi-pencil"
                                onClick={() => setIsViewMode(false)}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Échéances" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={echeanciers}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune échéance trouvée"
                        className="p-datatable-sm"
                        sortField="dueDate"
                        sortOrder={1}
                        rowClassName={(data) => ({
                            'bg-red-50': data.status === 'OVERDUE',
                            'bg-green-50': data.status === 'PAID'
                        })}
                    >
                        <Column field="installmentNumber" header="N°" sortable style={{ width: '5%' }} />
                        <Column field="loanId" header="ID Crédit" sortable filter style={{ width: '8%' }} />
                        <Column
                            field="dueDate"
                            header="Date Échéance"
                            body={(rowData) => dateBodyTemplate(rowData.dueDate)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="principalDue"
                            header="Capital"
                            body={(rowData) => currencyBodyTemplate(rowData.principalDue)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="interestDue"
                            header="Intérêts"
                            body={(rowData) => currencyBodyTemplate(rowData.interestDue)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            field="totalDue"
                            header="Total Dû"
                            body={(rowData) => currencyBodyTemplate(rowData.totalDue)}
                            sortable
                            style={{ width: '10%' }}
                        />
                        <Column
                            header="Progression"
                            body={progressBodyTemplate}
                            style={{ width: '12%' }}
                        />
                        <Column
                            field="daysOverdue"
                            header="Retard"
                            body={(rowData) => rowData.daysOverdue ? `${rowData.daysOverdue} j` : '-'}
                            sortable
                            style={{ width: '8%' }}
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

            {/* Dialog Génération Échéancier */}
            <Dialog
                visible={showGenerateDialog}
                onHide={() => setShowGenerateDialog(false)}
                header="Générer un Échéancier de Remboursement"
                style={{ width: '50vw' }}
                modal
                footer={
                    <div>
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowGenerateDialog(false)}
                        />
                        <Button
                            label="Générer"
                            icon="pi pi-check"
                            onClick={handleGenerateSchedule}
                            loading={loading}
                        />
                    </div>
                }
            >
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genLoanId" className="font-semibold">ID Crédit *</label>
                        <InputNumber
                            id="genLoanId"
                            value={generateParams.loanId}
                            onValueChange={(e) => setGenerateParams(prev => ({ ...prev, loanId: e.value ?? null }))}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genPrincipal" className="font-semibold">Montant Principal (FBU) *</label>
                        <InputNumber
                            id="genPrincipal"
                            value={generateParams.principal}
                            onValueChange={(e) => setGenerateParams(prev => ({ ...prev, principal: e.value ?? null }))}
                            className="w-full"
                            mode="currency"
                            currency="BIF"
                            locale="fr-BI"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genInterestRate" className="font-semibold">Taux d'Intérêt Annuel (%) *</label>
                        <InputNumber
                            id="genInterestRate"
                            value={generateParams.interestRate}
                            onValueChange={(e) => setGenerateParams(prev => ({ ...prev, interestRate: e.value ?? null }))}
                            className="w-full"
                            suffix="%"
                            minFractionDigits={2}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genTermMonths" className="font-semibold">Durée (Mois) *</label>
                        <InputNumber
                            id="genTermMonths"
                            value={generateParams.termMonths}
                            onValueChange={(e) => setGenerateParams(prev => ({ ...prev, termMonths: e.value ?? null }))}
                            className="w-full"
                            suffix=" mois"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genStartDate" className="font-semibold">Date de Début *</label>
                        <Calendar
                            id="genStartDate"
                            value={generateParams.startDate}
                            onChange={(e) => setGenerateParams(prev => ({ ...prev, startDate: e.value as Date }))}
                            className="w-full"
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genMethod" className="font-semibold">Méthode d'Amortissement</label>
                        <Dropdown
                            id="genMethod"
                            value={generateParams.amortizationMethod}
                            options={amortizationMethods}
                            onChange={(e) => setGenerateParams(prev => ({ ...prev, amortizationMethod: e.value }))}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="mt-3 p-3 surface-100 border-round">
                    <p className="text-sm text-color-secondary m-0">
                        <i className="pi pi-info-circle mr-2"></i>
                        L'échéancier sera généré automatiquement selon la méthode d'amortissement sélectionnée.
                        La méthode française (dégressif) calcule les intérêts sur le capital restant dû.
                    </p>
                </div>
            </Dialog>
        </div>
    );
};

export default EcheancierPage;
