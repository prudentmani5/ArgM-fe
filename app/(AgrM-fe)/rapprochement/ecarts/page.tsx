'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Toolbar } from 'primereact/toolbar';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { EcartRapprochement, RapprochementBancaire, TYPES_ECART, MOIS_OPTIONS } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';

function EcartsPage() {
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);
    const [selectedRapprochementId, setSelectedRapprochementId] = useState<number | null>(null);
    const [ecarts, setEcarts] = useState<EcartRapprochement[]>([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [selectedEcart, setSelectedEcart] = useState<EcartRapprochement>(new EcartRapprochement());

    const toast = useRef<Toast>(null);

    const { data: rapprochementsData, error: rapprochementsError, fetchData: fetchRapprochements } = useConsumApi('');
    const { data: ecartsData, error: ecartsError, fetchData: fetchEcarts } = useConsumApi('');
    const { data: actionData, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/rapprochement/rapprochements');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadRapprochements();
    }, []);

    useEffect(() => {
        if (rapprochementsData) {
            const arr = Array.isArray(rapprochementsData) ? rapprochementsData : rapprochementsData.content || [];
            setRapprochements(arr);
        }
        if (rapprochementsError) {
            showToast('error', 'Erreur', rapprochementsError.message || 'Erreur de chargement');
        }
    }, [rapprochementsData, rapprochementsError]);

    useEffect(() => {
        if (ecartsData) {
            const arr = Array.isArray(ecartsData) ? ecartsData : [];
            setEcarts(arr);
        }
        if (ecartsError) {
            showToast('error', 'Erreur', ecartsError.message || 'Erreur de chargement des écarts');
        }
    }, [ecartsData, ecartsError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'updateEcart':
                    showToast('success', 'Succès', 'Écart mis à jour avec succès');
                    setEditDialogVisible(false);
                    if (selectedRapprochementId) loadEcarts(selectedRapprochementId);
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    const loadRapprochements = () => {
        fetchRapprochements(null, 'GET', `${BASE_URL}/findall`, 'loadRapprochements');
    };

    const loadEcarts = (rapprochementId: number) => {
        fetchEcarts(null, 'GET', `${BASE_URL}/ecarts/${rapprochementId}`, 'loadEcarts');
    };

    const handleRapprochementChange = (rapprochementId: number) => {
        setSelectedRapprochementId(rapprochementId);
        if (rapprochementId) {
            loadEcarts(rapprochementId);
        } else {
            setEcarts([]);
        }
    };

    const openEditDialog = (ecart: EcartRapprochement) => {
        setSelectedEcart({ ...ecart });
        setEditDialogVisible(true);
    };

    const handleUpdateEcart = () => {
        if (!selectedEcart.id) return;
        const dataToSend = { ...selectedEcart, userAction: getUserAction() };
        fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${selectedEcart.id}`, 'updateEcart');
    };

    const handleResolve = (ecart: EcartRapprochement) => {
        const dataToSend = {
            ...ecart,
            resolu: true,
            userAction: getUserAction()
        };
        fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${ecart.id}`, 'updateEcart');
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const getMoisLabel = (mois: number) => {
        return MOIS_OPTIONS.find(m => m.value === mois)?.label || '';
    };

    const typeEcartBodyTemplate = (rowData: EcartRapprochement) => {
        const labels: Record<string, string> = {
            'CHEQUE_NON_DEBITE': 'Chèque non débité',
            'VIREMENT_EN_COURS': 'Virement en cours',
            'FRAIS_BANCAIRES': 'Frais bancaires',
            'ERREUR_SAISIE': 'Erreur de saisie',
            'AUTRE': 'Autre'
        };
        const severities: Record<string, 'info' | 'warning' | 'danger' | 'success'> = {
            'CHEQUE_NON_DEBITE': 'info',
            'VIREMENT_EN_COURS': 'info',
            'FRAIS_BANCAIRES': 'warning',
            'ERREUR_SAISIE': 'danger',
            'AUTRE': 'info'
        };
        return <Tag value={labels[rowData.typeEcart] || rowData.typeEcart} severity={severities[rowData.typeEcart] || 'info'} />;
    };

    const statutBodyTemplate = (rowData: EcartRapprochement) => (
        <Tag value={rowData.resolu ? 'Résolu' : 'Non résolu'} severity={rowData.resolu ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: EcartRapprochement) => (
        <div className="flex gap-1">
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => openEditDialog(rowData)} tooltip="Justifier / Modifier" />
            {!rowData.resolu && (
                <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleResolve(rowData)} tooltip="Marquer comme résolu" />
            )}
        </div>
    );

    const rapprochementOptionTemplate = (option: RapprochementBancaire) => (
        <span>{option.reference} - {option.releveBancaire?.nomBanque} ({getMoisLabel(option.mois)} {option.annee})</span>
    );

    const ecartsResolus = ecarts.filter(e => e.resolu).length;
    const ecartsNonResolus = ecarts.filter(e => !e.resolu).length;

    const tableHeader = (
        <div className="flex justify-content-between align-items-center">
            <div>
                <h5 className="m-0 mb-1">Écarts du rapprochement</h5>
                {ecarts.length > 0 && (
                    <span className="text-500 text-sm">
                        {ecartsResolus} résolu(s) | {ecartsNonResolus} non résolu(s) sur {ecarts.length} total
                    </span>
                )}
            </div>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-exclamation-triangle mr-2"></i>Gestion des Écarts</h2>

            {/* Rapprochement Selector */}
            <div className="p-fluid formgrid grid mb-4">
                <div className="field col-12 md:col-6">
                    <label htmlFor="rapprochement">Sélectionner un rapprochement</label>
                    <Dropdown
                        id="rapprochement"
                        value={selectedRapprochementId}
                        options={rapprochements}
                        onChange={(e) => handleRapprochementChange(e.value)}
                        optionLabel="reference"
                        optionValue="id"
                        itemTemplate={rapprochementOptionTemplate}
                        placeholder="Sélectionner un rapprochement"
                        filter
                        showClear
                    />
                </div>
            </div>

            {/* Ecarts Table */}
            {selectedRapprochementId && (
                <DataTable
                    value={ecarts}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    globalFilter={globalFilter}
                    header={tableHeader}
                    emptyMessage="Aucun écart trouvé"
                    className="p-datatable-sm"
                    stripedRows
                    showGridlines
                >
                    <Column header="Type" body={typeEcartBodyTemplate} sortable sortField="typeEcart" style={{ width: '15%' }} />
                    <Column field="description" header="Description" sortable />
                    <Column field="montant" header="Montant" body={(row) => formatCurrency(row.montant)} sortable style={{ width: '12%' }} />
                    <Column field="justification" header="Justification" body={(row) => row.justification || <span className="text-500 font-italic">Non justifié</span>} />
                    <Column header="Statut" body={statutBodyTemplate} sortable sortField="resolu" style={{ width: '10%' }} />
                    <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
                </DataTable>
            )}

            {!selectedRapprochementId && (
                <div className="text-center text-500 p-5">
                    <i className="pi pi-info-circle text-4xl mb-3 block"></i>
                    <p>Sélectionnez un rapprochement pour voir ses écarts</p>
                </div>
            )}

            {/* Edit Ecart Dialog */}
            <Dialog
                header="Justification de l'écart"
                visible={editDialogVisible}
                style={{ width: '600px' }}
                onHide={() => setEditDialogVisible(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setEditDialogVisible(false)} />
                        <Button label="Enregistrer" icon="pi pi-check" onClick={handleUpdateEcart} />
                    </div>
                }
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="typeEcart">Type d'écart</label>
                        <Dropdown
                            id="typeEcart"
                            value={selectedEcart.typeEcart}
                            options={TYPES_ECART}
                            onChange={(e) => setSelectedEcart({ ...selectedEcart, typeEcart: e.value })}
                            placeholder="Sélectionner un type"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="montant">Montant</label>
                        <InputText id="montant" value={formatCurrency(selectedEcart.montant)} disabled />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="description">Description</label>
                        <InputText id="description" value={selectedEcart.description} onChange={(e) => setSelectedEcart({ ...selectedEcart, description: e.target.value })} />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="justification">Justification *</label>
                        <InputTextarea
                            id="justification"
                            value={selectedEcart.justification}
                            onChange={(e) => setSelectedEcart({ ...selectedEcart, justification: e.target.value })}
                            rows={4}
                            placeholder="Expliquez la raison de cet écart..."
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <EcartsPage />
        </ProtectedPage>
    );
}
