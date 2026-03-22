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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { EcartRapprochement, RapprochementBancaire, TYPES_ECART, MOIS_OPTIONS } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

function EcartsPage() {
    const { can } = useAuthorizedAction();
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);
    const [selectedRapprochementId, setSelectedRapprochementId] = useState<number | null>(null);
    const [selectedRapprochement, setSelectedRapprochement] = useState<RapprochementBancaire | null>(null);
    const [ecarts, setEcarts] = useState<EcartRapprochement[]>([]);
    const [selectedEcarts, setSelectedEcarts] = useState<EcartRapprochement[]>([]);
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
                case 'resolveEcart':
                    showToast('success', 'Succès', 'Écart marqué comme résolu');
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
        setSelectedEcarts([]);
        if (rapprochementId) {
            const rap = rapprochements.find(r => r.id === rapprochementId) || null;
            setSelectedRapprochement(rap);
            loadEcarts(rapprochementId);
        } else {
            setSelectedRapprochement(null);
            setEcarts([]);
        }
    };

    const openEditDialog = (ecart: EcartRapprochement) => {
        setSelectedEcart({ ...ecart });
        setEditDialogVisible(true);
    };

    const handleUpdateEcart = () => {
        if (!selectedEcart.id) return;
        if (!selectedEcart.justification) {
            showToast('warn', 'Validation', 'La justification est obligatoire');
            return;
        }
        const dataToSend = { ...selectedEcart, userAction: getUserAction() };
        fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${selectedEcart.id}`, 'updateEcart');
    };

    const handleResolve = (ecart: EcartRapprochement) => {
        if (!ecart.justification) {
            showToast('warn', 'Attention', 'Veuillez d\'abord justifier cet écart avant de le résoudre');
            openEditDialog(ecart);
            return;
        }
        confirmDialog({
            message: `Marquer l'écart "${ecart.description}" comme résolu?`,
            header: 'Confirmation',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Oui, résoudre',
            rejectLabel: 'Annuler',
            accept: () => {
                const dataToSend = {
                    ...ecart,
                    resolu: true,
                    userAction: getUserAction()
                };
                fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${ecart.id}`, 'resolveEcart');
            }
        });
    };

    const handleBatchResolve = () => {
        const unresolvedSelected = selectedEcarts.filter(e => !e.resolu);
        const unjustified = unresolvedSelected.filter(e => !e.justification);
        if (unresolvedSelected.length === 0) {
            showToast('warn', 'Attention', 'Sélectionnez des écarts non résolus');
            return;
        }
        if (unjustified.length > 0) {
            showToast('warn', 'Attention', `${unjustified.length} écart(s) n'ont pas de justification. Veuillez les justifier d'abord.`);
            return;
        }
        confirmDialog({
            message: `Résoudre ${unresolvedSelected.length} écart(s) sélectionné(s)?`,
            header: 'Résolution en lot',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Oui, résoudre tout',
            rejectLabel: 'Annuler',
            accept: async () => {
                for (const ecart of unresolvedSelected) {
                    const dataToSend = {
                        ...ecart,
                        resolu: true,
                        userAction: getUserAction()
                    };
                    await fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${ecart.id}`, 'resolveEcart');
                }
                setSelectedEcarts([]);
            }
        });
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const getMoisLabel = (mois: number) => {
        return MOIS_OPTIONS.find(m => m.value === mois)?.label || '';
    };

    const getStatutLabel = (statut: string): string => {
        const map: Record<string, string> = { 'BROUILLON': 'Brouillon', 'EN_COURS': 'En cours', 'TERMINE': 'Terminé', 'VALIDE': 'Validé' };
        return map[statut] || statut;
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
            {can('RAPPROCHEMENT_UPDATE') && (
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => openEditDialog(rowData)} tooltip="Justifier / Modifier" />
            )}
            {!rowData.resolu && can('RAPPROCHEMENT_UPDATE') && (
                <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleResolve(rowData)} tooltip="Marquer comme résolu" />
            )}
        </div>
    );

    const rapprochementOptionTemplate = (option: RapprochementBancaire) => (
        <div className="flex align-items-center justify-content-between w-full">
            <span>{option.reference} - {option.releveBancaire?.nomBanque} ({getMoisLabel(option.mois)} {option.annee})</span>
            <Tag value={getStatutLabel(option.statut)} severity={option.statut === 'VALIDE' ? 'success' : option.statut === 'EN_COURS' ? 'warning' : 'info'} className="ml-2" />
        </div>
    );

    const ecartsResolus = ecarts.filter(e => e.resolu).length;
    const ecartsNonResolus = ecarts.filter(e => !e.resolu).length;
    const totalMontantEcarts = ecarts.reduce((sum, e) => sum + (e.montant || 0), 0);
    const totalMontantNonResolus = ecarts.filter(e => !e.resolu).reduce((sum, e) => sum + (e.montant || 0), 0);

    // Group ecarts by type for stats
    const ecartsByType = ecarts.reduce((acc, e) => {
        acc[e.typeEcart] = (acc[e.typeEcart] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const tableHeader = (
        <div className="flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
                <h5 className="m-0 mb-1">Écarts du rapprochement</h5>
                {ecarts.length > 0 && (
                    <span className="text-500 text-sm">
                        {ecartsResolus} résolu(s) | {ecartsNonResolus} non résolu(s) sur {ecarts.length} total
                    </span>
                )}
            </div>
            <div className="flex gap-2 align-items-center">
                {selectedEcarts.length > 0 && can('RAPPROCHEMENT_UPDATE') && (
                    <Button
                        label={`Résoudre (${selectedEcarts.filter(e => !e.resolu).length})`}
                        icon="pi pi-check-circle"
                        severity="success"
                        size="small"
                        onClick={handleBatchResolve}
                        disabled={selectedEcarts.filter(e => !e.resolu).length === 0}
                    />
                )}
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                </span>
            </div>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2><i className="pi pi-exclamation-triangle mr-2"></i>Gestion des Écarts</h2>

            {/* Rapprochement Selector */}
            <div className="p-fluid formgrid grid mb-4">
                <div className="field col-12 md:col-6">
                    <label htmlFor="rapprochement" className="font-semibold">Sélectionner un rapprochement</label>
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
                {selectedRapprochement && (
                    <div className="field col-12 md:col-6 flex align-items-end gap-2">
                        <Tag value={getStatutLabel(selectedRapprochement.statut)} severity={selectedRapprochement.statut === 'VALIDE' ? 'success' : 'warning'} className="text-base p-2" />
                        <span className="text-500">
                            {selectedRapprochement.releveBancaire?.nomBanque} - {getMoisLabel(selectedRapprochement.mois)} {selectedRapprochement.annee}
                        </span>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            {selectedRapprochementId && ecarts.length > 0 && (
                <div className="grid mb-4">
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="flex align-items-center">
                                <div className="flex-1">
                                    <span className="block text-500 font-medium mb-1">Total Écarts</span>
                                    <div className="text-900 font-bold text-2xl">{ecarts.length}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-list text-blue-500 text-lg"></i>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="flex align-items-center">
                                <div className="flex-1">
                                    <span className="block text-500 font-medium mb-1">Non Résolus</span>
                                    <div className={`font-bold text-2xl ${ecartsNonResolus > 0 ? 'text-red-500' : 'text-green-500'}`}>{ecartsNonResolus}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-exclamation-circle text-red-500 text-lg"></i>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="flex align-items-center">
                                <div className="flex-1">
                                    <span className="block text-500 font-medium mb-1">Résolus</span>
                                    <div className="text-green-500 font-bold text-2xl">{ecartsResolus}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-check-circle text-green-500 text-lg"></i>
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-3">
                        <Card className="shadow-1">
                            <div className="flex align-items-center">
                                <div className="flex-1">
                                    <span className="block text-500 font-medium mb-1">Montant Non Résolu</span>
                                    <div className="text-orange-500 font-bold text-lg">{formatCurrency(totalMontantNonResolus)}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-money-bill text-orange-500 text-lg"></i>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

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
                    selectionMode="multiple"
                    selection={selectedEcarts}
                    onSelectionChange={(e) => setSelectedEcarts(e.value as any)}
                    dataKey="id"
                >
                    <Column header="Type" body={typeEcartBodyTemplate} sortable sortField="typeEcart" style={{ width: '15%' }} />
                    <Column field="description" header="Description" sortable />
                    <Column field="montant" header="Montant" body={(row) => (
                        <span className="font-semibold">{formatCurrency(row.montant)}</span>
                    )} sortable style={{ width: '12%' }} />
                    <Column field="justification" header="Justification" body={(row) =>
                        row.justification
                            ? <span>{row.justification}</span>
                            : <span className="text-500 font-italic">Non justifié</span>
                    } />
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
                    <div className="flex gap-2 justify-content-end">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setEditDialogVisible(false)} />
                        <Button label="Enregistrer" icon="pi pi-check" onClick={handleUpdateEcart} />
                        {!selectedEcart.resolu && selectedEcart.justification && (
                            <Button label="Enregistrer et Résoudre" icon="pi pi-check-circle" severity="success" onClick={() => {
                                setSelectedEcart({ ...selectedEcart, resolu: true });
                                const dataToSend = { ...selectedEcart, resolu: true, userAction: getUserAction() };
                                fetchAction(dataToSend, 'PUT', `${BASE_URL}/ecarts/update/${selectedEcart.id}`, 'updateEcart');
                            }} />
                        )}
                    </div>
                }
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="typeEcart" className="font-semibold">Type d'écart</label>
                        <Dropdown
                            id="typeEcart"
                            value={selectedEcart.typeEcart}
                            options={TYPES_ECART}
                            onChange={(e) => setSelectedEcart({ ...selectedEcart, typeEcart: e.value })}
                            placeholder="Sélectionner un type"
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="montant" className="font-semibold">Montant</label>
                        <InputText id="montant" value={formatCurrency(selectedEcart.montant)} disabled />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="description" className="font-semibold">Description</label>
                        <InputText id="description" value={selectedEcart.description} onChange={(e) => setSelectedEcart({ ...selectedEcart, description: e.target.value })} />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="justification" className="font-semibold">Justification *</label>
                        <InputTextarea
                            id="justification"
                            value={selectedEcart.justification}
                            onChange={(e) => setSelectedEcart({ ...selectedEcart, justification: e.target.value })}
                            rows={4}
                            placeholder="Expliquez la raison de cet écart..."
                            className={!selectedEcart.justification ? 'p-invalid' : ''}
                        />
                        {!selectedEcart.justification && <small className="p-error">La justification est obligatoire</small>}
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
