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
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl, API_BASE_URL } from '@/utils/apiConfig';
import { BranchReceiptSeries, BranchReceiptSeriesClass } from './BranchReceiptSeries';
import { ProtectedPage } from '@/components/ProtectedPage';

const BASE_URL = `${API_BASE_URL}/api/epargne/receipt-series`;
const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;

function BranchReceiptSeriesPage() {
    const [series, setSeries] = useState<BranchReceiptSeries>(new BranchReceiptSeriesClass());
    const [seriesList, setSeriesList] = useState<BranchReceiptSeries[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, error, fetchData, callType } = useConsumApi('');
    const branchesApi = useConsumApi('');

    useEffect(() => {
        loadData();
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    }, []);

    useEffect(() => {
        if (branchesApi.data) setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
    }, [branchesApi.data]);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadData':
                    setSeriesList(Array.isArray(data) ? data : []);
                    setLoading(false);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Série créée avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Série mise à jour avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Série supprimée avec succès');
                    loadData();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
            setLoading(false);
        }
    }, [data, error, callType]);

    const loadData = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadData');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSeries(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!series.branchId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner une agence');
            return false;
        }
        if (!series.beginSerial?.trim()) {
            showToast('warn', 'Attention', 'Le numéro de début est obligatoire');
            return false;
        }
        if (!series.endSerial?.trim()) {
            showToast('warn', 'Attention', 'Le numéro de fin est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const dataToSend = { ...series, userAction: getUserAction() };
        if (series.id) {
            fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${series.id}`, 'update');
        } else {
            fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setSeries(new BranchReceiptSeriesClass());
    };

    const editItem = (rowData: BranchReceiptSeries) => {
        setSeries({ ...rowData });
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: BranchReceiptSeries) => {
        const label = rowData.seriesLabel || `${rowData.beginSerial} → ${rowData.endSerial}`;
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la série "${label}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData({ userAction: getUserAction() }, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: BranchReceiptSeries) => (
        <Tag value={rowData.active ? 'Active' : 'Inactive'} severity={rowData.active ? 'success' : 'danger'} />
    );

    const branchBodyTemplate = (rowData: BranchReceiptSeries) => {
        if (rowData.branch) return `${rowData.branch.name} (${rowData.branch.code})`;
        const b = branches.find((br: any) => br.id === rowData.branchId);
        return b ? `${b.name} (${b.code})` : rowData.branchId ?? '-';
    };

    const actionsBodyTemplate = (rowData: BranchReceiptSeries) => (
        <div className="flex gap-2">
            <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-warning p-button-sm"
                onClick={() => editItem(rowData)}
                tooltip="Modifier"
            />
            <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-danger p-button-sm"
                onClick={() => confirmDelete(rowData)}
                tooltip="Supprimer"
            />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Séries de Numéros de Reçus</h5>
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
                <i className="pi pi-file mr-2"></i>
                Séries de Numéros de Reçus par Agence
            </h4>

            <div className="surface-100 p-3 border-round mb-4">
                <h6 className="m-0 mb-2">
                    <i className="pi pi-info-circle mr-2 text-blue-500"></i>
                    Gestion des plages de reçus valides
                </h6>
                <ul className="m-0 pl-4">
                    <li>Chaque agence peut avoir une ou plusieurs séries de numéros de reçus</li>
                    <li>Lors d'un retrait par reçu, le système vérifie que le numéro appartient à une série active de l'agence</li>
                    <li>Un numéro de reçu déjà utilisé dans un retrait non annulé sera rejeté</li>
                </ul>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={series.id ? 'Modifier la Série' : 'Nouvelle Série'} leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Informations de la Série</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="branchId" className="font-medium">Agence *</label>
                                    <Dropdown
                                        id="branchId"
                                        value={series.branchId}
                                        options={branches}
                                        onChange={(e) => setSeries(prev => ({ ...prev, branchId: e.value }))}
                                        optionLabel="name"
                                        optionValue="id"
                                        placeholder="Sélectionner une agence"
                                        filter
                                        filterBy="name,code"
                                        className="w-full"
                                        itemTemplate={(option) => `${option.name} (${option.code})`}
                                        valueTemplate={(option) => option ? `${option.name} (${option.code})` : 'Sélectionner une agence'}
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label htmlFor="seriesLabel" className="font-medium">Libellé de la Série</label>
                                    <InputText
                                        id="seriesLabel"
                                        name="seriesLabel"
                                        value={series.seriesLabel}
                                        onChange={handleChange}
                                        placeholder="Ex: Série A 2024, Carnet 001-500..."
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="beginSerial" className="font-medium">Numéro de début *</label>
                                    <InputText
                                        id="beginSerial"
                                        name="beginSerial"
                                        value={series.beginSerial}
                                        onChange={handleChange}
                                        placeholder="Ex: REC001, 1001, A001"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="endSerial" className="font-medium">Numéro de fin *</label>
                                    <InputText
                                        id="endSerial"
                                        name="endSerial"
                                        value={series.endSerial}
                                        onChange={handleChange}
                                        placeholder="Ex: REC500, 1500, A500"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4 flex align-items-end pb-2">
                                    <div className="flex align-items-center gap-2">
                                        <Checkbox
                                            inputId="active"
                                            checked={series.active}
                                            onChange={(e) => setSeries(prev => ({ ...prev, active: e.checked || false }))}
                                        />
                                        <label htmlFor="active" className="font-medium">Série active</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Button
                            label={series.id ? 'Mettre à jour' : 'Enregistrer'}
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Séries" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={seriesList}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucune série configurée"
                        stripedRows
                        showGridlines
                        size="small"
                        sortField="branchId"
                        sortOrder={1}
                    >
                        <Column header="Agence" body={branchBodyTemplate} sortable sortField="branchId" />
                        <Column field="seriesLabel" header="Libellé" sortable body={(row) => row.seriesLabel || '-'} />
                        <Column field="beginSerial" header="Début" sortable />
                        <Column field="endSerial" header="Fin" sortable />
                        <Column field="active" header="Statut" body={statusBodyTemplate} sortable style={{ width: '100px' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '110px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['EPARGNE_SETTINGS']}>
            <BranchReceiptSeriesPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
