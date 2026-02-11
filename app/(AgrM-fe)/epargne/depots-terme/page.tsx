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
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { TermDeposit, TermDepositClass } from './TermDeposit';
import TermDepositForm from './TermDepositForm';

const BASE_URL = `${API_BASE_URL}/api/epargne/term-deposits`;
const CLIENTS_URL = `${API_BASE_URL}/api/clients`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const DURATIONS_URL = `${API_BASE_URL}/api/epargne/term-durations`;
const INSTRUCTIONS_URL = `${API_BASE_URL}/api/epargne/maturity-instructions`;
const CURRENCIES_URL = `${API_BASE_URL}/api/financial-products/reference/currencies`;

function TermDepositPage() {
    const [termDeposit, setTermDeposit] = useState<TermDeposit>(new TermDepositClass());
    const [termDeposits, setTermDeposits] = useState<TermDeposit[]>([]);
    const [maturedDeposits, setMaturedDeposits] = useState<TermDeposit[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);
    const [termDurations, setTermDurations] = useState<any[]>([]);
    const [maturityInstructions, setMaturityInstructions] = useState<any[]>([]);
    const [currencies, setCurrencies] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [viewDialog, setViewDialog] = useState(false);
    const [renewDialog, setRenewDialog] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState<TermDeposit | null>(null);
    const [newTermDurationId, setNewTermDurationId] = useState<number | null>(null);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadDeposits();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDeposits':
                    setTermDeposits(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadMatured':
                    setMaturedDeposits(Array.isArray(data) ? data : []);
                    break;
                case 'loadClients':
                    setClients(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadBranches':
                    setBranches(Array.isArray(data) ? data : []);
                    break;
                case 'loadDurations':
                    setTermDurations(Array.isArray(data) ? data : []);
                    break;
                case 'loadInstructions':
                    setMaturityInstructions(Array.isArray(data) ? data : []);
                    break;
                case 'loadCurrencies':
                    setCurrencies(Array.isArray(data) ? data : []);
                    break;
                case 'loadSavingsAccounts':
                    setSavingsAccounts(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Dépôt à terme créé avec succès');
                    resetForm();
                    loadDeposits();
                    setActiveIndex(1);
                    break;
                case 'issueCertificate':
                    showToast('success', 'Succès', 'Certificat émis avec succès');
                    loadDeposits();
                    break;
                case 'processMaturity':
                    showToast('success', 'Succès', 'Échéance traitée avec succès');
                    loadDeposits();
                    break;
                case 'renew':
                    showToast('success', 'Succès', 'Dépôt renouvelé avec succès');
                    setRenewDialog(false);
                    loadDeposits();
                    break;
                case 'close':
                    showToast('success', 'Succès', 'Dépôt clôturé');
                    loadDeposits();
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Dépôt supprimé');
                    loadDeposits();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadReferenceData = () => {
        fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
        fetchData(null, 'GET', `${DURATIONS_URL}/findall`, 'loadDurations');
        fetchData(null, 'GET', `${INSTRUCTIONS_URL}/findall`, 'loadInstructions');
        fetchData(null, 'GET', `${CURRENCIES_URL}/findall`, 'loadCurrencies');
    };

    const loadDeposits = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDeposits');
        fetchData(null, 'GET', `${BASE_URL}/findmaturedandunprocessed`, 'loadMatured');
        setLoading(false);
    };

    const loadSavingsAccountsByClient = (clientId: number) => {
        if (clientId) {
            fetchData(null, 'GET', `${SAVINGS_URL}/findbyclient/${clientId}`, 'loadSavingsAccounts');
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTermDeposit(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setTermDeposit(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setTermDeposit(prev => ({
            ...prev,
            [name]: value ? value.toISOString().split('T')[0] : null
        }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setTermDeposit(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleTermDurationChange = (duration: any) => {
        if (duration) {
            const startDate = termDeposit.startDate ? new Date(termDeposit.startDate) : new Date();
            const maturityDate = new Date(startDate);
            maturityDate.setMonth(maturityDate.getMonth() + duration.durationMonths);

            setTermDeposit(prev => ({
                ...prev,
                termDuration: duration,
                interestRate: duration.interestRate,
                maturityDate: maturityDate.toISOString().split('T')[0]
            }));
        }
    };

    const validateForm = (): boolean => {
        if (!termDeposit.clientId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner un client');
            return false;
        }
        if (!termDeposit.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!termDeposit.termDurationId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une durée');
            return false;
        }
        if (termDeposit.principalAmount < 50000) {
            showToast('warn', 'Attention', 'Le montant minimum est de 50 000 FBU');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        fetchData(termDeposit, 'POST', `${BASE_URL}/new`, 'create');
    };

    const resetForm = () => {
        setTermDeposit(new TermDepositClass());
        setSavingsAccounts([]);
    };

    const viewDeposit = (rowData: TermDeposit) => {
        setSelectedDeposit(rowData);
        setViewDialog(true);
    };

    const issueCertificate = (rowData: TermDeposit) => {
        confirmDialog({
            message: `Émettre le certificat de dépôt pour ${formatCurrency(rowData.principalAmount)} ?`,
            header: 'Émission de Certificat',
            icon: 'pi pi-file',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Émettre',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/issuecertificate/${rowData.id}`, 'issueCertificate');
            }
        });
    };

    const processMaturity = (rowData: TermDeposit) => {
        confirmDialog({
            message: `Traiter l'échéance du dépôt ${rowData.depositNumber} ?`,
            header: 'Traitement Échéance',
            icon: 'pi pi-calendar-times',
            acceptClassName: 'p-button-success',
            acceptLabel: 'Traiter',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({}, 'POST', `${BASE_URL}/processmaturity/${rowData.id}`, 'processMaturity');
            }
        });
    };

    const openRenewDialog = (rowData: TermDeposit) => {
        setSelectedDeposit(rowData);
        setNewTermDurationId(rowData.termDurationId || null);
        setRenewDialog(true);
    };

    const handleRenew = () => {
        if (selectedDeposit && newTermDurationId) {
            fetchData(
                { newTermDurationId },
                'POST',
                `${BASE_URL}/renew/${selectedDeposit.id}`,
                'renew'
            );
        }
    };

    const closeDeposit = (rowData: TermDeposit) => {
        confirmDialog({
            message: `Clôturer le dépôt ${rowData.depositNumber} ?`,
            header: 'Clôture',
            icon: 'pi pi-times-circle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Clôturer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData(
                    { closureReason: 'Clôture à la demande du client' },
                    'POST',
                    `${BASE_URL}/close/${rowData.id}`,
                    'close'
                );
            }
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const getStatusSeverity = (status: any): 'success' | 'info' | 'warning' | 'danger' => {
        if (!status) return 'info';
        switch (status.code) {
            case 'ACTIVE': return 'success';
            case 'MATURED': return 'info';
            case 'PENDING': return 'warning';
            case 'EARLY_WITHDRAWN':
            case 'CLOSED': return 'danger';
            default: return 'info';
        }
    };

    const statusBodyTemplate = (rowData: TermDeposit) => {
        const status = rowData.status;
        return (
            <Tag
                value={status?.name || 'N/A'}
                severity={getStatusSeverity(status)}
            />
        );
    };

    const actionsBodyTemplate = (rowData: TermDeposit) => {
        const status = rowData.status?.code;
        const isActive = status === 'ACTIVE';
        const isMatured = status === 'MATURED';
        const isPending = status === 'PENDING';
        const hasCertificate = !!rowData.certificateNumber;

        return (
            <div className="flex gap-1 flex-wrap">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewDeposit(rowData)}
                    tooltip="Voir"
                />
                {isActive && !hasCertificate && (
                    <Button
                        icon="pi pi-file"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => issueCertificate(rowData)}
                        tooltip="Émettre certificat"
                    />
                )}
                {isMatured && (
                    <>
                        <Button
                            icon="pi pi-check"
                            className="p-button-rounded p-button-success p-button-sm"
                            onClick={() => processMaturity(rowData)}
                            tooltip="Traiter échéance"
                        />
                        <Button
                            icon="pi pi-refresh"
                            className="p-button-rounded p-button-info p-button-sm"
                            onClick={() => openRenewDialog(rowData)}
                            tooltip="Renouveler"
                        />
                    </>
                )}
                {(isActive || isMatured) && (
                    <Button
                        icon="pi pi-times"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => closeDeposit(rowData)}
                        tooltip="Clôturer"
                    />
                )}
                {isPending && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => {
                            confirmDialog({
                                message: 'Supprimer ce dépôt ?',
                                header: 'Suppression',
                                icon: 'pi pi-trash',
                                acceptClassName: 'p-button-danger',
                                accept: () => fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete')
                            });
                        }}
                        tooltip="Supprimer"
                    />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Dépôts à Terme</h5>
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
                <i className="pi pi-clock mr-2"></i>
                Dépôts à Terme (DAT)
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau DAT" leftIcon="pi pi-plus mr-2">
                    <TermDepositForm
                        termDeposit={termDeposit}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        termDurations={termDurations}
                        maturityInstructions={maturityInstructions}
                        currencies={currencies}
                        onClientChange={loadSavingsAccountsByClient}
                        onTermDurationChange={handleTermDurationChange}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label="Créer le Dépôt"
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                            disabled={termDeposit.principalAmount < 50000}
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Tous les DAT" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={termDeposits}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun dépôt trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="startDate"
                        sortOrder={-1}
                    >
                        <Column field="depositNumber" header="N° Dépôt" sortable />
                        <Column
                            field="client"
                            header="Client"
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column
                            field="principalAmount"
                            header="Capital"
                            body={(row) => formatCurrency(row.principalAmount)}
                            sortable
                        />
                        <Column
                            field="interestRate"
                            header="Taux"
                            body={(row) => row.interestRate + '%'}
                            sortable
                        />
                        <Column field="startDate" header="Début" sortable />
                        <Column field="maturityDate" header="Échéance" sortable />
                        <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>

                <TabPanel header={`Échéances (${maturedDeposits.length})`} leftIcon="pi pi-calendar-times mr-2">
                    <DataTable
                        value={maturedDeposits}
                        paginator
                        rows={10}
                        loading={loading}
                        emptyMessage="Aucun dépôt échu"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="maturityDate"
                        sortOrder={-1}
                    >
                        <Column field="depositNumber" header="N° Dépôt" sortable />
                        <Column
                            field="client"
                            header="Client"
                            body={(row) => row.client ? `${row.client.firstName} ${row.client.lastName}` : '-'}
                        />
                        <Column
                            field="principalAmount"
                            header="Capital"
                            body={(row) => formatCurrency(row.principalAmount)}
                        />
                        <Column
                            field="totalAmountAtMaturity"
                            header="Total à verser"
                            body={(row) => formatCurrency(row.totalAmountAtMaturity || row.principalAmount)}
                        />
                        <Column field="maturityDate" header="Date Échéance" sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '200px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog pour renouveler */}
            <Dialog
                header="Renouveler le Dépôt"
                visible={renewDialog}
                style={{ width: '450px' }}
                onHide={() => setRenewDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setRenewDialog(false)} className="p-button-text" />
                        <Button
                            label="Renouveler"
                            icon="pi pi-refresh"
                            onClick={handleRenew}
                            className="p-button-success"
                            disabled={!newTermDurationId}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-500 mb-3">
                        Dépôt: <strong>{selectedDeposit?.depositNumber}</strong><br />
                        Capital: <strong>{formatCurrency(selectedDeposit?.principalAmount || 0)}</strong>
                    </p>
                    <div className="field">
                        <label htmlFor="newTermDurationId" className="font-medium">Nouvelle Durée *</label>
                        <Dropdown
                            id="newTermDurationId"
                            value={newTermDurationId}
                            options={termDurations}
                            onChange={(e) => setNewTermDurationId(e.value)}
                            optionLabel={(item) => `${item.name} - ${item.interestRate}% annuel`}
                            optionValue="id"
                            placeholder="Sélectionner la durée"
                            className="w-full"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Dialog pour voir les détails */}
            <Dialog
                header="Détails du Dépôt à Terme"
                visible={viewDialog}
                style={{ width: '900px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedDeposit && (
                    <TermDepositForm
                        termDeposit={selectedDeposit}
                        handleChange={() => {}}
                        handleDropdownChange={() => {}}
                        handleDateChange={() => {}}
                        handleNumberChange={() => {}}
                        clients={clients}
                        branches={branches}
                        savingsAccounts={savingsAccounts}
                        termDurations={termDurations}
                        maturityInstructions={maturityInstructions}
                        currencies={currencies}
                        isViewMode={true}
                    />
                )}
            </Dialog>
        </div>
    );
}

export default TermDepositPage;
