'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { DemandeCredit, DemandeCreditClass } from '../types/DemandeCredit';
import DemandeCreditForm from './DemandeCreditForm';

const BASE_URL = buildApiUrl('/api/credit/applications');
const CLIENTS_URL = buildApiUrl('/api/client-management/clients');
const BRANCHES_URL = buildApiUrl('/api/usermanagement/branches');
const USERS_URL = buildApiUrl('/api/usermanagement/users');
const PRODUCTS_URL = buildApiUrl('/api/loan-product/loan-products');
const STATUTS_URL = buildApiUrl('/api/credit/application-statuses');
const PURPOSES_URL = buildApiUrl('/api/credit/purposes');

export default function DemandesCreditPage() {
    const [demande, setDemande] = useState<DemandeCredit>(new DemandeCreditClass());
    const [demandes, setDemandes] = useState<DemandeCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [selectedDemande, setSelectedDemande] = useState<DemandeCredit | null>(null);

    // Reference data
    const [clients, setClients] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);
    const [creditOfficers, setCreditOfficers] = useState<any[]>([]);
    const [loanProducts, setLoanProducts] = useState<any[]>([]);
    const [statuts, setStatuts] = useState<any[]>([]);
    const [objetsCredit, setObjetsCredit] = useState<any[]>([]);

    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadReferenceData();
        loadDemandes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadDemandes':
                    setDemandes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadClients':
                    setClients(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadBranches':
                    setBranches(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadUsers':
                    setCreditOfficers(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadProducts':
                    setLoanProducts(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadStatuts':
                    setStatuts(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadPurposes':
                    setObjetsCredit(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Demande de crédit créée avec succès');
                    resetForm();
                    loadDemandes();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Demande de crédit modifiée avec succès');
                    resetForm();
                    loadDemandes();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Demande de crédit supprimée avec succès');
                    loadDemandes();
                    break;
                case 'updateStatus':
                    showToast('success', 'Succès', 'Statut mis à jour avec succès');
                    setShowStatusDialog(false);
                    loadDemandes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadReferenceData = () => {
        fetchData(null, 'GET', `${CLIENTS_URL}/findall`, 'loadClients');
        setTimeout(() => fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches'), 100);
        setTimeout(() => fetchData(null, 'GET', `${USERS_URL}/findall`, 'loadUsers'), 200);
        setTimeout(() => fetchData(null, 'GET', `${PRODUCTS_URL}/findall`, 'loadProducts'), 300);
        setTimeout(() => fetchData(null, 'GET', `${STATUTS_URL}/findall/active`, 'loadStatuts'), 400);
        setTimeout(() => fetchData(null, 'GET', `${PURPOSES_URL}/findall/active`, 'loadPurposes'), 500);
    };

    const loadDemandes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDemandes');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setDemande(new DemandeCreditClass());
        setIsViewMode(false);
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

    const validateForm = (): boolean => {
        if (!demande.clientId) {
            showToast('error', 'Erreur de validation', 'Le client est obligatoire');
            return false;
        }
        if (!demande.branchId) {
            showToast('error', 'Erreur de validation', "L'agence est obligatoire");
            return false;
        }
        if (!demande.creditOfficerId) {
            showToast('error', 'Erreur de validation', "L'agent de crédit est obligatoire");
            return false;
        }
        if (!demande.loanProductId) {
            showToast('error', 'Erreur de validation', 'Le produit de crédit est obligatoire');
            return false;
        }
        if (!demande.amountRequested || demande.amountRequested <= 0) {
            showToast('error', 'Erreur de validation', 'Le montant demandé est obligatoire');
            return false;
        }
        if (!demande.creditPurposeId) {
            showToast('error', 'Erreur de validation', "L'objet du crédit est obligatoire");
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (demande.id) {
            fetchData(demande, 'PUT', `${BASE_URL}/update/${demande.id}`, 'update');
        } else {
            fetchData(demande, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: DemandeCredit) => {
        setDemande({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: DemandeCredit) => {
        setDemande({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: DemandeCredit) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la demande "${rowData.applicationNumber}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: DemandeCredit) => {
        const status = rowData.status;
        return (
            <Tag
                value={status?.nameFr || 'N/A'}
                style={{ backgroundColor: status?.color || '#6c757d' }}
            />
        );
    };

    const amountBodyTemplate = (rowData: DemandeCredit) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(rowData.amountRequested || 0);
    };

    const clientBodyTemplate = (rowData: DemandeCredit) => {
        const client = rowData.client;
        return client ? `${client.firstName} ${client.lastName}` : 'N/A';
    };

    const dateBodyTemplate = (rowData: DemandeCredit) => {
        return rowData.applicationDate ? new Date(rowData.applicationDate).toLocaleDateString('fr-FR') : 'N/A';
    };

    const actionsBodyTemplate = (rowData: DemandeCredit) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    onClick={() => handleView(rowData)}
                    tooltip="Voir"
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => handleEdit(rowData)}
                    tooltip="Modifier"
                    disabled={!rowData.status?.allowsEdit}
                />
                <Button
                    icon="pi pi-chart-line"
                    rounded
                    text
                    severity="success"
                    onClick={() => window.location.href = `/credit/analyses/${rowData.id}`}
                    tooltip="Analyse financière"
                />
                <Button
                    icon="pi pi-map-marker"
                    rounded
                    text
                    severity="help"
                    onClick={() => window.location.href = `/credit/visites/${rowData.id}`}
                    tooltip="Visite terrain"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => handleDelete(rowData)}
                    tooltip="Supprimer"
                    disabled={!rowData.status?.allowsEdit}
                />
            </div>
        );
    };

    const header = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Liste des Demandes de Crédit</h5>
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

            <h4 className="mb-4">
                <i className="pi pi-folder-open mr-2"></i>
                Gestion des Demandes de Crédit
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Demande" leftIcon="pi pi-plus mr-2">
                    <DemandeCreditForm
                        demande={demande}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        clients={clients}
                        branches={branches}
                        creditOfficers={creditOfficers}
                        loanProducts={loanProducts}
                        statuts={statuts}
                        objetsCredit={objetsCredit}
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
                                label={demande.id ? 'Modifier' : 'Enregistrer'}
                                icon={demande.id ? 'pi pi-check' : 'pi pi-save'}
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
                        loading={loading && callType === 'loadDemandes'}
                        emptyMessage="Aucune demande de crédit trouvée"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        header={header}
                        sortField="applicationDate"
                        sortOrder={-1}
                    >
                        <Column field="applicationNumber" header="N° Dossier" sortable filter style={{ minWidth: '130px' }} />
                        <Column header="Client" body={clientBodyTemplate} sortable filter />
                        <Column header="Date" body={dateBodyTemplate} sortable />
                        <Column header="Montant" body={amountBodyTemplate} sortable />
                        <Column field="durationMonths" header="Durée (mois)" sortable />
                        <Column field="creditPurpose.nameFr" header="Objet" sortable filter />
                        <Column header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '220px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
