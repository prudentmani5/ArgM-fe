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
import { InputTextarea } from 'primereact/inputtextarea';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

import EcheancierForm from './EcheancierForm';
import {
    EcheancierRemboursement,
    EcheancierRemboursementClass
} from '../types/RemboursementTypes';

const EcheancierPage = () => {
    const [echeanciers, setEcheanciers] = useState<EcheancierRemboursement[]>([]);
    const [groupedLoans, setGroupedLoans] = useState<any[]>([]);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [echeancier, setEcheancier] = useState<EcheancierRemboursement>(new EcheancierRemboursementClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const [showLoanSelectionDialog, setShowLoanSelectionDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [scheduleToDelete, setScheduleToDelete] = useState<EcheancierRemboursement | null>(null);
    const [disbursements, setDisbursements] = useState<any[]>([]);
    const [filteredDisbursements, setFilteredDisbursements] = useState<any[]>([]);
    const [disbursementFilter, setDisbursementFilter] = useState('');
    const [selectedDisbursement, setSelectedDisbursement] = useState<any>(null);
    const [loadingDisbursements, setLoadingDisbursements] = useState(false);
    const [generateParams, setGenerateParams] = useState({
        loanId: null as number | null,
        disbursementNumber: '' as string,
        applicationNumber: '' as string,
        principal: null as number | null,
        interestRate: null as number | null,
        termMonths: null as number | null,
        startDate: new Date(),
        amortizationMethod: 'FRENCH'
    });

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const BASE_URL = buildApiUrl('/api/remboursement/schedules');
    const DISBURSEMENTS_URL = buildApiUrl('/api/credit/disbursements');

    // Store loan IDs that are fully paid (either through early repayment or normal payments)
    const [fullyPaidLoanIds, setFullyPaidLoanIds] = useState<number[]>([]);

    useEffect(() => {
        loadEcheanciers();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadEcheanciers':
                    const loadedData = Array.isArray(data) ? data : data.content || [];
                    setEcheanciers(loadedData);
                    groupEcheanciersByLoan(loadedData);
                    break;
                case 'loadDisbursements':
                    const disb = Array.isArray(data) ? data : data.content || [];
                    // Filter only completed disbursements
                    const completedDisb = disb.filter((d: any) => d.status === 'COMPLETED');

                    // Filter out disbursements that are fully paid (no more pending payments)
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
                            loanScheduleMap.set(loanId, true); // Assume all paid initially
                        }
                        // If any schedule is not PAID, mark the loan as not fully paid
                        if (s.status !== 'PAID') {
                            loanScheduleMap.set(loanId, false);
                        }
                    });

                    // Get loan IDs where ALL schedules are PAID (fully paid loans)
                    const paidLoanIds: number[] = [];
                    loanScheduleMap.forEach((allPaid, loanId) => {
                        if (allPaid) {
                            paidLoanIds.push(loanId);
                        }
                    });

                    setFullyPaidLoanIds(paidLoanIds);
                    // Now load disbursements
                    fetchData(null, 'GET', `${DISBURSEMENTS_URL}/findbystatus/COMPLETED/paginated?page=0&size=100&sortBy=disbursementDate&sortDir=desc`, 'loadDisbursements');
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

    // This effect is no longer needed as we handle mapping in the loadLoanProducts case

    const loadEcheanciers = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEcheanciers');
    };

    const loadDisbursements = () => {
        setLoadingDisbursements(true);
        // First load all schedules to determine which loans are fully paid
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadSchedulesForFilter');
    };

    const handleLoadFromDisbursement = () => {
        loadDisbursements();
        setShowLoanSelectionDialog(true);
    };

    const handleDisbursementSelect = (disbursement: any) => {
        setSelectedDisbursement(disbursement);

        // Auto-populate generate params from selected disbursement
        const application = disbursement.application || {};
        const interestRate = disbursement.interestRate || 0;

        setGenerateParams({
            loanId: disbursement.id, // Use disbursement ID (references mod4_disbursements)
            disbursementNumber: disbursement.disbursementNumber || '',
            applicationNumber: disbursement.applicationNumber || application.applicationNumber || '',
            principal: disbursement.amount || 0,
            interestRate: interestRate,
            termMonths: application.durationMonths || 12,
            startDate: new Date(),
            amortizationMethod: 'FRENCH'
        });

        setShowLoanSelectionDialog(false);
        setShowGenerateDialog(true);
        showToast('info', 'Données Chargées',
            `N° Décaissement: ${disbursement.disbursementNumber}, Montant: ${disbursement.amount?.toLocaleString()} FBU, Taux: ${interestRate}%, Durée: ${application.durationMonths} mois.`);
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

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setEcheancier(new EcheancierRemboursementClass());
        setIsViewMode(false);
    };

    const groupEcheanciersByLoan = (echeanciers: EcheancierRemboursement[]) => {
        const grouped = echeanciers.reduce((acc: any, echeancier: any) => {
            const key = echeancier.loanId;
            if (!acc[key]) {
                acc[key] = {
                    loanId: echeancier.loanId,
                    applicationNumber: echeancier.applicationNumber,
                    disbursementNumber: echeancier.disbursementNumber,
                    clientName: echeancier.clientName,
                    installments: [],
                    totalDue: 0,
                    totalPaid: 0,
                    totalRemaining: 0,
                    totalPenaltyAccrued: 0,
                    totalPenaltyPaid: 0,
                    installmentCount: 0
                };
            }
            acc[key].installments.push(echeancier);
            const due = echeancier.totalDue || 0;
            const penalty = echeancier.penaltyAccrued || 0;
            const paid = echeancier.totalPaid || 0;
            acc[key].totalDue += due + penalty; // totalDue includes penalties
            acc[key].totalPaid += paid;
            acc[key].totalRemaining += (due + penalty) - paid;
            acc[key].totalPenaltyAccrued += penalty;
            acc[key].totalPenaltyPaid += echeancier.penaltyPaid || 0;
            acc[key].installmentCount++;
            return acc;
        }, {});

        setGroupedLoans(Object.values(grouped));
    };

    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-3">
                <h5 className="mb-3">Détail des Échéances - {data.applicationNumber}</h5>
                <DataTable value={data.installments} className="p-datatable-sm">
                    <Column field="installmentNumber" header="N°" sortable style={{ width: '4%' }} />
                    <Column
                        field="dueDate"
                        header="Date Échéance"
                        body={(row) => dateBodyTemplate(row.dueDate)}
                        sortable
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="principalDue"
                        header="Capital"
                        body={(row) => currencyBodyTemplate(row.principalDue)}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="interestDue"
                        header="Intérêts"
                        body={(row) => currencyBodyTemplate(row.interestDue)}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="penaltyAccrued"
                        header="Pénalités"
                        body={(row) => (
                            <span className={row.penaltyAccrued > 0 ? 'text-orange-600 font-semibold' : ''}>
                                {currencyBodyTemplate(row.penaltyAccrued || 0)}
                            </span>
                        )}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="penaltyPaid"
                        header="Pén. Payées"
                        body={(row) => (
                            <span className={row.penaltyPaid > 0 ? 'text-green-600' : ''}>
                                {currencyBodyTemplate(row.penaltyPaid || 0)}
                            </span>
                        )}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="totalDue"
                        header="Total Dû"
                        body={(row) => currencyBodyTemplate((row.totalDue || 0) + (row.penaltyAccrued || 0))}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="totalPaid"
                        header="Total Payé"
                        body={(row) => currencyBodyTemplate(row.totalPaid)}
                        style={{ width: '10%' }}
                    />
                    <Column
                        field="status"
                        header="Statut"
                        body={statusBodyTemplate}
                        style={{ width: '8%' }}
                    />
                    <Column
                        header="Actions"
                        body={actionsBodyTemplate}
                        style={{ width: '10%' }}
                    />
                </DataTable>
            </div>
        );
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

        // Add user action
        const dataToSend = {
            ...echeancier,
            userAction: getUserAction()
        };

        if (echeancier.id) {
            fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${echeancier.id}`, 'update');
        } else {
            fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
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
        setScheduleToDelete(rowData);
        setDeleteReason('');
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!deleteReason.trim()) {
            showToast('warn', 'Attention', 'Veuillez indiquer la raison de la suppression');
            return;
        }

        if (scheduleToDelete) {
            // Include reason in the delete request (can be logged)
            showToast('info', 'Suppression', `Suppression de l'échéance N°${scheduleToDelete.installmentNumber}. Raison: ${deleteReason}`);
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${scheduleToDelete.id}`, 'delete');
            setShowDeleteDialog(false);
            setDeleteReason('');
            setScheduleToDelete(null);
        }
    };

    const handleGenerateSchedule = () => {
        if (!generateParams.loanId || !generateParams.principal || !generateParams.termMonths) {
            showToast('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        const params = {
            ...generateParams,
            startDate: generateParams.startDate.toISOString().split('T')[0],
            userAction: getUserAction()
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
            {rowData.status !== 'PAID' && rowData.status !== 'PARTIAL' && (
                <>
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
                </>
            )}
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
                    label="Charger Crédit"
                    icon="pi pi-download"
                    severity="info"
                    onClick={handleLoadFromDisbursement}
                    tooltip="Charger depuis un crédit décaissé"
                    tooltipOptions={{ position: 'top' }}
                />
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
                        value={groupedLoans}
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                        dataKey="loanId"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun crédit trouvé"
                        className="p-datatable-sm"
                    >
                        <Column expander style={{ width: '3rem' }} />
                        <Column field="applicationNumber" header="N° Dossier" sortable filter />
                        <Column field="disbursementNumber" header="N° Décaissement" sortable filter />
                        <Column field="clientName" header="Client" sortable filter />
                        <Column
                            field="installmentCount"
                            header="Échéances"
                            body={(row) => <Tag value={`${row.installmentCount} échéances`} severity="info" />}
                        />
                        <Column
                            field="totalDue"
                            header="Total à Payer"
                            body={(row) => currencyBodyTemplate(row.totalDue)}
                            sortable
                        />
                        <Column
                            field="totalPaid"
                            header="Total Payé"
                            body={(row) => currencyBodyTemplate(row.totalPaid)}
                            sortable
                        />
                        <Column
                            field="totalPenaltyAccrued"
                            header="Pénalités"
                            body={(row) => (
                                <span className={row.totalPenaltyAccrued > 0 ? 'text-orange-600 font-semibold' : ''}>
                                    {currencyBodyTemplate(row.totalPenaltyAccrued)}
                                </span>
                            )}
                            sortable
                        />
                        <Column
                            field="totalRemaining"
                            header="Solde Restant"
                            body={(row) => <span className="font-bold text-orange-600">{currencyBodyTemplate(row.totalRemaining)}</span>}
                            sortable
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
                        <label htmlFor="genDisbursementNumber" className="font-semibold">N° Décaissement *</label>
                        <InputText
                            id="genDisbursementNumber"
                            value={generateParams.disbursementNumber}
                            className="w-full"
                            disabled={true}
                        />
                        <small className="text-500">
                            <i className="pi pi-info-circle mr-1"></i>
                            Numéro du décaissement
                        </small>
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="genApplicationNumber" className="font-semibold">N° Dossier Crédit</label>
                        <InputText
                            id="genApplicationNumber"
                            value={generateParams.applicationNumber}
                            className="w-full"
                            disabled={true}
                        />
                        <small className="text-500">
                            <i className="pi pi-info-circle mr-1"></i>
                            Numéro du dossier de crédit
                        </small>
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

            {/* Dialog Sélection Demande de Crédit */}
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
                            placeholder="Rechercher par N° décaissement, N° dossier, client ou produit..."
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
                    sortField="disbursementDate"
                    sortOrder={-1}
                >
                    <Column
                        field="disbursementNumber"
                        header="N° Décaissement"
                        sortable
                        style={{ width: '14%' }}
                    />
                    <Column
                        field="applicationNumber"
                        header="N° Dossier"
                        sortable
                        style={{ width: '14%' }}
                    />
                    <Column
                        field="clientName"
                        header="Client"
                        sortable
                        style={{ width: '18%' }}
                    />
                    <Column
                        field="amount"
                        header="Montant"
                        body={(row) => row.amount?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                        sortable
                        style={{ width: '13%' }}
                    />
                    <Column
                        field="disbursementDate"
                        header="Date"
                        body={(row) => row.disbursementDate ? new Date(row.disbursementDate).toLocaleDateString('fr-FR') : '-'}
                        sortable
                        style={{ width: '15%' }}
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
                        style={{ width: '12%' }}
                    />
                </DataTable>
                <div className="mt-3 p-3 surface-100 border-round">
                    <p className="text-sm text-color-secondary m-0">
                        <i className="pi pi-info-circle mr-2"></i>
                        Utilisez la barre de recherche pour filtrer les dossiers. Cliquez sur une ligne pour sélectionner
                        un crédit et charger automatiquement ses paramètres dans le formulaire de génération d'échéancier.
                    </p>
                </div>
            </Dialog>

            {/* Dialog Confirmation de Suppression */}
            <Dialog
                visible={showDeleteDialog}
                onHide={() => setShowDeleteDialog(false)}
                header="Confirmation de suppression"
                style={{ width: '450px' }}
                modal
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            severity="secondary"
                            onClick={() => setShowDeleteDialog(false)}
                        />
                        <Button
                            label="Supprimer"
                            icon="pi pi-trash"
                            severity="danger"
                            onClick={confirmDelete}
                        />
                    </div>
                }
            >
                <div className="flex align-items-center gap-3 mb-3">
                    <i className="pi pi-exclamation-triangle text-orange-500" style={{ fontSize: '2rem' }}></i>
                    <span>
                        Êtes-vous sûr de vouloir supprimer l'échéance <strong>N°{scheduleToDelete?.installmentNumber}</strong> ?
                        <br />
                        <small className="text-600">Cette action est irréversible.</small>
                    </span>
                </div>

                <div className="field">
                    <label htmlFor="deleteReason" className="font-semibold">
                        Raison de la suppression *
                    </label>
                    <InputTextarea
                        id="deleteReason"
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={3}
                        className="w-full"
                        placeholder="Veuillez indiquer la raison de cette suppression..."
                        autoFocus
                    />
                </div>
            </Dialog>
        </div>
    );
};

export default EcheancierPage;
