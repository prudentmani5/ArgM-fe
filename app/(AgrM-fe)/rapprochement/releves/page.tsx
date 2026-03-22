'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { ReleveBancaire, LigneReleve, MOIS_OPTIONS } from '../types';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

function RelevesPage() {
    const { can } = useAuthorizedAction();
    const [releves, setReleves] = useState<ReleveBancaire[]>([]);
    const [releve, setReleve] = useState<ReleveBancaire>(new ReleveBancaire());
    const [lignes, setLignes] = useState<LigneReleve[]>([]);
    const [ligne, setLigne] = useState<LigneReleve>(new LigneReleve());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [ligneDialogVisible, setLigneDialogVisible] = useState(false);
    const [isEditLigne, setIsEditLigne] = useState(false);
    const [viewDialogVisible, setViewDialogVisible] = useState(false);
    const [selectedReleve, setSelectedReleve] = useState<ReleveBancaire | null>(null);

    const toast = useRef<Toast>(null);

    const { data: relevesData, error: relevesError, fetchData: fetchReleves } = useConsumApi('');
    const { data: actionData, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');
    const { data: lignesData, error: lignesError, fetchData: fetchLignes } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/rapprochement/releves');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadReleves();
    }, []);

    useEffect(() => {
        if (relevesData) {
            const arr = Array.isArray(relevesData) ? relevesData : relevesData.content || [];
            setReleves(arr);
        }
        if (relevesError) {
            showToast('error', 'Erreur', relevesError.message || 'Erreur de chargement');
        }
    }, [relevesData, relevesError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create':
                    showToast('success', 'Succès', 'Relevé bancaire créé avec succès');
                    resetForm();
                    loadReleves();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Relevé bancaire modifié avec succès');
                    resetForm();
                    loadReleves();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Relevé bancaire supprimé avec succès');
                    loadReleves();
                    break;
                case 'createLigne':
                    showToast('success', 'Succès', 'Ligne ajoutée avec succès');
                    setLigneDialogVisible(false);
                    if (selectedReleve?.id) loadLignes(selectedReleve.id);
                    loadReleves();
                    break;
                case 'updateLigne':
                    showToast('success', 'Succès', 'Ligne modifiée avec succès');
                    setLigneDialogVisible(false);
                    if (selectedReleve?.id) loadLignes(selectedReleve.id);
                    break;
                case 'deleteLigne':
                    showToast('success', 'Succès', 'Ligne supprimée avec succès');
                    if (selectedReleve?.id) loadLignes(selectedReleve.id);
                    loadReleves();
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    useEffect(() => {
        if (lignesData) {
            const arr = Array.isArray(lignesData) ? lignesData : [];
            setLignes(arr);
        }
        if (lignesError) {
            showToast('error', 'Erreur', lignesError.message || 'Erreur de chargement des lignes');
        }
    }, [lignesData, lignesError]);

    const loadReleves = () => {
        fetchReleves(null, 'GET', `${BASE_URL}/findall`, 'loadReleves');
    };

    const loadLignes = (releveId: number) => {
        fetchLignes(null, 'GET', `${BASE_URL}/lignes/${releveId}`, 'loadLignes');
    };

    const resetForm = () => {
        setReleve(new ReleveBancaire());
        setLignes([]);
        setIsEdit(false);
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!releve.nomBanque) errors.push('Nom de la banque est obligatoire');
        if (!releve.numeroCompte) errors.push('Numéro de compte est obligatoire');
        if (!releve.moisReleve) errors.push('Mois est obligatoire');
        if (!releve.anneeReleve) errors.push('Année est obligatoire');
        if (errors.length > 0) {
            showToast('error', 'Validation', errors.join(' | '));
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const dataToSend = { ...releve, userAction: getUserAction() };
        if (isEdit && releve.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${releve.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: ReleveBancaire) => {
        setReleve({ ...rowData });
        setIsEdit(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: ReleveBancaire) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le relevé de ${rowData.nomBanque} (${MOIS_OPTIONS.find(m => m.value === rowData.moisReleve)?.label} ${rowData.anneeReleve})?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const handleView = (rowData: ReleveBancaire) => {
        setSelectedReleve(rowData);
        setLignes([]);
        if (rowData.id) loadLignes(rowData.id);
        setViewDialogVisible(true);
    };

    // Ligne handlers
    const openNewLigneDialog = () => {
        const newLigne = new LigneReleve();
        newLigne.releveBancaireId = selectedReleve?.id || null;
        setLigne(newLigne);
        setIsEditLigne(false);
        setLigneDialogVisible(true);
    };

    const openEditLigneDialog = (rowData: LigneReleve) => {
        setLigne({ ...rowData });
        setIsEditLigne(true);
        setLigneDialogVisible(true);
    };

    const validateLigne = (): boolean => {
        const errors: string[] = [];
        if (!ligne.dateOperation) errors.push('Date opération est obligatoire');
        if (!ligne.description) errors.push('Description est obligatoire');
        if (ligne.montantDebit === 0 && ligne.montantCredit === 0) errors.push('Montant débit ou crédit est obligatoire');
        if (errors.length > 0) {
            showToast('error', 'Validation', errors.join(' | '));
            return false;
        }
        return true;
    };

    const handleSubmitLigne = () => {
        if (!validateLigne()) return;
        const dataToSend = { ...ligne, userAction: getUserAction() };
        if (isEditLigne && ligne.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/lignes/update/${ligne.id}`, 'updateLigne');
        } else {
            dataToSend.releveBancaireId = selectedReleve?.id || null;
            fetchAction(dataToSend, 'POST', `${BASE_URL}/lignes/new`, 'createLigne');
        }
    };

    const handleDeleteLigne = (rowData: LigneReleve) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette ligne?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchAction(null, 'DELETE', `${BASE_URL}/lignes/delete/${rowData.id}`, 'deleteLigne');
            }
        });
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatDate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const getMoisLabel = (mois: number) => {
        return MOIS_OPTIONS.find(m => m.value === mois)?.label || '';
    };

    // DataTable header with search
    const tableHeader = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Liste des relevés bancaires</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const actionsBodyTemplate = (rowData: ReleveBancaire) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir les lignes" />
            {can('RAPPROCHEMENT_UPDATE') && (
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            )}
            {can('RAPPROCHEMENT_DELETE') && (
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
            )}
        </div>
    );

    const periodeBodyTemplate = (rowData: ReleveBancaire) => (
        <span>{getMoisLabel(rowData.moisReleve)} {rowData.anneeReleve}</span>
    );

    const nbLignesBodyTemplate = (rowData: ReleveBancaire) => {
        const count = rowData.lignes?.length || 0;
        return <Tag value={`${count} ligne(s)`} severity={count > 0 ? 'info' : null} />;
    };

    const rapprocheeBodyTemplate = (rowData: LigneReleve) => (
        <Tag value={rowData.rapprochee ? 'Rapprochée' : 'Non rapprochée'} severity={rowData.rapprochee ? 'success' : 'warning'} />
    );

    const ligneActionsBodyTemplate = (rowData: LigneReleve) => (
        <div className="flex gap-1">
            {!rowData.rapprochee && can('RAPPROCHEMENT_UPDATE') && (
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => openEditLigneDialog(rowData)} tooltip="Modifier" />
            )}
            {!rowData.rapprochee && can('RAPPROCHEMENT_DELETE') && (
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteLigne(rowData)} tooltip="Supprimer" />
            )}
            {rowData.rapprochee && (
                <Tag value="Verrouillée" />
            )}
        </div>
    );

    // Stats for view dialog
    const totalDebit = lignes.reduce((sum, l) => sum + (l.montantDebit || 0), 0);
    const totalCredit = lignes.reduce((sum, l) => sum + (l.montantCredit || 0), 0);
    const lignesRapprochees = lignes.filter(l => l.rapprochee).length;

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2><i className="pi pi-file-import mr-2"></i>Gestion des Relevés Bancaires</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header={isEdit ? 'Modifier le Relevé' : 'Nouveau Relevé'} leftIcon={isEdit ? 'pi pi-pencil mr-2' : 'pi pi-plus mr-2'}>
                    <div className="surface-100 p-3 border-round mb-3">
                        <h5 className="mb-3">
                            <i className="pi pi-building mr-2"></i>
                            Informations du relevé bancaire
                        </h5>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="nomBanque" className="font-semibold">Nom de la banque *</label>
                                <InputText id="nomBanque" value={releve.nomBanque} onChange={(e) => setReleve({ ...releve, nomBanque: e.target.value })} placeholder="Ex: BANCOBU, INTERBANK..." />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="numeroCompte" className="font-semibold">Numéro de compte *</label>
                                <InputText id="numeroCompte" value={releve.numeroCompte} onChange={(e) => setReleve({ ...releve, numeroCompte: e.target.value })} placeholder="Ex: 04001-12345-001" />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label htmlFor="moisReleve" className="font-semibold">Mois *</label>
                                <Dropdown id="moisReleve" value={releve.moisReleve} options={MOIS_OPTIONS} onChange={(e) => setReleve({ ...releve, moisReleve: e.value })} placeholder="Mois" />
                            </div>
                            <div className="field col-12 md:col-2">
                                <label htmlFor="anneeReleve" className="font-semibold">Année *</label>
                                <InputNumber id="anneeReleve" value={releve.anneeReleve} onValueChange={(e) => setReleve({ ...releve, anneeReleve: e.value || new Date().getFullYear() })} useGrouping={false} />
                            </div>
                        </div>
                    </div>

                    <div className="surface-100 p-3 border-round mb-3">
                        <h5 className="mb-3">
                            <i className="pi pi-money-bill mr-2"></i>
                            Soldes de la période
                        </h5>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="soldeDebut" className="font-semibold">Solde début de période</label>
                                <InputNumber id="soldeDebut" value={releve.soldeDebut} onValueChange={(e) => setReleve({ ...releve, soldeDebut: e.value || 0 })} mode="currency" currency="BIF" locale="fr-BI" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="soldeFin" className="font-semibold">Solde fin de période</label>
                                <InputNumber id="soldeFin" value={releve.soldeFin} onValueChange={(e) => setReleve({ ...releve, soldeFin: e.value || 0 })} mode="currency" currency="BIF" locale="fr-BI" />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label htmlFor="dateImport" className="font-semibold">Date d'import</label>
                                <Calendar id="dateImport" value={releve.dateImport ? new Date(releve.dateImport) : null} onChange={(e) => setReleve({ ...releve, dateImport: e.value ? (e.value as Date).toISOString().split('T')[0] : '' })} dateFormat="dd/mm/yy" showIcon />
                            </div>
                            <div className="field col-12">
                                <label htmlFor="notes" className="font-semibold">Notes</label>
                                <InputTextarea id="notes" value={releve.notes} onChange={(e) => setReleve({ ...releve, notes: e.target.value })} rows={2} placeholder="Remarques ou observations..." />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                        <Button label={isEdit ? 'Modifier' : 'Créer'} icon={isEdit ? 'pi pi-check' : 'pi pi-plus'} onClick={handleSubmit} />
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Relevés" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={releves}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        header={tableHeader}
                        emptyMessage="Aucun relevé bancaire trouvé"
                        className="p-datatable-sm"
                        stripedRows
                        showGridlines
                        sortField="anneeReleve"
                        sortOrder={-1}
                    >
                        <Column field="nomBanque" header="Banque" sortable filter />
                        <Column field="numeroCompte" header="N° Compte" sortable filter />
                        <Column header="Période" body={periodeBodyTemplate} sortable sortField="moisReleve" />
                        <Column field="soldeDebut" header="Solde Début" body={(row) => formatCurrency(row.soldeDebut)} sortable />
                        <Column field="soldeFin" header="Solde Fin" body={(row) => formatCurrency(row.soldeFin)} sortable />
                        <Column header="Lignes" body={nbLignesBodyTemplate} style={{ width: '100px' }} />
                        <Column field="dateImport" header="Date Import" body={(row) => formatDate(row.dateImport)} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Dialog: View Releve Lines */}
            <Dialog
                header={
                    selectedReleve ? (
                        <div>
                            <span>Lignes du relevé - {selectedReleve.nomBanque}</span>
                            <span className="text-500 text-sm ml-2">
                                ({getMoisLabel(selectedReleve.moisReleve)} {selectedReleve.anneeReleve})
                            </span>
                        </div>
                    ) : 'Lignes du relevé'
                }
                visible={viewDialogVisible}
                style={{ width: '90vw' }}
                onHide={() => setViewDialogVisible(false)}
            >
                {/* Summary stats */}
                {lignes.length > 0 && (
                    <div className="grid mb-3">
                        <div className="col-12 md:col-3">
                            <div className="surface-card p-3 border-round shadow-1 text-center">
                                <div className="text-500 mb-1 text-sm">Total Lignes</div>
                                <div className="text-xl font-bold">{lignes.length}</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card p-3 border-round shadow-1 text-center">
                                <div className="text-500 mb-1 text-sm">Total Débits</div>
                                <div className="text-xl font-bold text-red-500">{formatCurrency(totalDebit)}</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card p-3 border-round shadow-1 text-center">
                                <div className="text-500 mb-1 text-sm">Total Crédits</div>
                                <div className="text-xl font-bold text-green-500">{formatCurrency(totalCredit)}</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-card p-3 border-round shadow-1 text-center">
                                <div className="text-500 mb-1 text-sm">Rapprochées</div>
                                <div className="text-xl font-bold">{lignesRapprochees}/{lignes.length}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-content-between align-items-center mb-3">
                    {can('RAPPROCHEMENT_CREATE') && (
                        <Button label="Ajouter une ligne" icon="pi pi-plus" onClick={openNewLigneDialog} />
                    )}
                </div>

                <DataTable
                    value={lignes}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="Aucune ligne trouvée"
                    className="p-datatable-sm"
                    stripedRows
                    showGridlines
                    sortField="dateOperation"
                    sortOrder={1}
                >
                    <Column field="dateOperation" header="Date" body={(row) => formatDate(row.dateOperation)} sortable style={{ width: '10%' }} />
                    <Column field="reference" header="Référence" sortable style={{ width: '12%' }} />
                    <Column field="description" header="Description" sortable />
                    <Column field="montantDebit" header="Débit" body={(row) => row.montantDebit > 0 ? <span className="text-red-500">{formatCurrency(row.montantDebit)}</span> : '-'} sortable style={{ width: '12%' }} />
                    <Column field="montantCredit" header="Crédit" body={(row) => row.montantCredit > 0 ? <span className="text-green-500">{formatCurrency(row.montantCredit)}</span> : '-'} sortable style={{ width: '12%' }} />
                    <Column field="solde" header="Solde" body={(row) => formatCurrency(row.solde)} sortable style={{ width: '12%' }} />
                    <Column header="Statut" body={rapprocheeBodyTemplate} style={{ width: '10%' }} />
                    <Column header="Actions" body={ligneActionsBodyTemplate} style={{ width: '120px' }} />
                </DataTable>
            </Dialog>

            {/* Dialog: Add/Edit Ligne */}
            <Dialog
                header={isEditLigne ? 'Modifier la ligne' : 'Ajouter une ligne'}
                visible={ligneDialogVisible}
                style={{ width: '650px' }}
                onHide={() => setLigneDialogVisible(false)}
                footer={
                    <div className="flex gap-2 justify-content-end">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => setLigneDialogVisible(false)} />
                        <Button label={isEditLigne ? 'Modifier' : 'Ajouter'} icon="pi pi-check" onClick={handleSubmitLigne} />
                    </div>
                }
            >
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="dateOperation" className="font-semibold">Date opération *</label>
                        <Calendar id="dateOperation" value={ligne.dateOperation ? new Date(ligne.dateOperation) : null} onChange={(e) => setLigne({ ...ligne, dateOperation: e.value ? (e.value as Date).toISOString().split('T')[0] : '' })} dateFormat="dd/mm/yy" showIcon />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="reference" className="font-semibold">Référence</label>
                        <InputText id="reference" value={ligne.reference} onChange={(e) => setLigne({ ...ligne, reference: e.target.value })} placeholder="Ex: VIR-2026-001" />
                    </div>
                    <div className="field col-12">
                        <label htmlFor="description" className="font-semibold">Description *</label>
                        <InputText id="description" value={ligne.description} onChange={(e) => setLigne({ ...ligne, description: e.target.value })} placeholder="Libellé de l'opération" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="montantDebit" className="font-semibold">Montant Débit</label>
                        <InputNumber id="montantDebit" value={ligne.montantDebit} onValueChange={(e) => setLigne({ ...ligne, montantDebit: e.value || 0 })} mode="currency" currency="BIF" locale="fr-BI" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="montantCredit" className="font-semibold">Montant Crédit</label>
                        <InputNumber id="montantCredit" value={ligne.montantCredit} onValueChange={(e) => setLigne({ ...ligne, montantCredit: e.value || 0 })} mode="currency" currency="BIF" locale="fr-BI" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label htmlFor="solde" className="font-semibold">Solde</label>
                        <InputNumber id="solde" value={ligne.solde} onValueChange={(e) => setLigne({ ...ligne, solde: e.value || 0 })} mode="currency" currency="BIF" locale="fr-BI" />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RelevesPage />
        </ProtectedPage>
    );
}
