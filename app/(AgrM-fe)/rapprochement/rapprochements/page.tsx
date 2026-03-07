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
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import {
    RapprochementBancaire, ReleveBancaire, LigneReleve, LigneRapprochement,
    EcartRapprochement, MOIS_OPTIONS, STATUTS_RAPPROCHEMENT
} from '../types';
import { CptEcriture } from '../../comptability/types';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

function RapprochementsPage() {
    const { can } = useAuthorizedAction();
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);
    const [rapprochement, setRapprochement] = useState<RapprochementBancaire>(new RapprochementBancaire());
    const [releves, setReleves] = useState<ReleveBancaire[]>([]);
    const [comptes, setComptes] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isEdit, setIsEdit] = useState(false);

    // Reconciliation workspace
    const [workspaceVisible, setWorkspaceVisible] = useState(false);
    const [selectedRapprochement, setSelectedRapprochement] = useState<RapprochementBancaire | null>(null);
    const [lignesBanque, setLignesBanque] = useState<LigneReleve[]>([]);
    const [ecrituresComptables, setEcrituresComptables] = useState<CptEcriture[]>([]);
    const [matchedLines, setMatchedLines] = useState<LigneRapprochement[]>([]);
    const [ecarts, setEcarts] = useState<EcartRapprochement[]>([]);
    const [selectedLigneBanque, setSelectedLigneBanque] = useState<LigneReleve | null>(null);
    const [selectedEcriture, setSelectedEcriture] = useState<CptEcriture | null>(null);
    const [autoReconcileResult, setAutoReconcileResult] = useState<any>(null);
    const [loadingReconcile, setLoadingReconcile] = useState(false);

    // Validation dialog
    const [validateDialogVisible, setValidateDialogVisible] = useState(false);
    const [approveDialogVisible, setApproveDialogVisible] = useState(false);
    const [signatureInput, setSignatureInput] = useState('');

    const toast = useRef<Toast>(null);

    const { data: rapprochementsData, error: rapprochementsError, fetchData: fetchRapprochements } = useConsumApi('');
    const { data: relevesData, error: relevesError, fetchData: fetchReleves } = useConsumApi('');
    const { data: comptesData, error: comptesError, fetchData: fetchComptes } = useConsumApi('');
    const { data: actionData, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');
    const { data: workspaceData, error: workspaceError, fetchData: fetchWorkspace, callType: workspaceCallType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/rapprochement/rapprochements');
    const RELEVES_URL = buildApiUrl('/api/rapprochement/releves');
    const COMPTES_URL = buildApiUrl('/api/comptability/comptes');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadRapprochements();
        loadReleves();
        loadComptes();
    }, []);

    useEffect(() => {
        if (rapprochementsData) {
            const arr = Array.isArray(rapprochementsData) ? rapprochementsData : rapprochementsData.content || [];
            setRapprochements(arr);
        }
        if (rapprochementsError) {
            showToast('error', 'Erreur', rapprochementsError.message || 'Erreur de chargement des rapprochements');
        }
    }, [rapprochementsData, rapprochementsError]);

    useEffect(() => {
        if (relevesData) {
            const arr = Array.isArray(relevesData) ? relevesData : [];
            setReleves(arr);
        }
    }, [relevesData, relevesError]);

    useEffect(() => {
        if (comptesData) {
            const arr = Array.isArray(comptesData) ? comptesData : comptesData.content || [];
            setComptes(arr);
        }
    }, [comptesData, comptesError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create':
                    showToast('success', 'Succès', 'Rapprochement créé avec succès');
                    resetForm();
                    loadRapprochements();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Rapprochement modifié avec succès');
                    resetForm();
                    loadRapprochements();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Rapprochement supprimé avec succès');
                    loadRapprochements();
                    break;
                case 'validate':
                    showToast('success', 'Succès', 'Rapprochement validé par le comptable');
                    setValidateDialogVisible(false);
                    setSignatureInput('');
                    loadRapprochements();
                    if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id);
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Rapprochement approuvé par le directeur financier');
                    setApproveDialogVisible(false);
                    setSignatureInput('');
                    loadRapprochements();
                    if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id);
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    useEffect(() => {
        if (workspaceData) {
            switch (workspaceCallType) {
                case 'autoReconcile':
                    setAutoReconcileResult(workspaceData);
                    showToast('success', 'Rapprochement automatique', `${(workspaceData as any).matchCount || 0} correspondances trouvées, ${(workspaceData as any).ecartCount || 0} écarts détectés`);
                    setLoadingReconcile(false);
                    if (selectedRapprochement?.id) {
                        loadWorkspaceData(selectedRapprochement.id);
                        loadRapprochements();
                    }
                    break;
                case 'loadLignes':
                    setLignesBanque(Array.isArray(workspaceData) ? workspaceData : []);
                    break;
                case 'loadEcritures':
                    setEcrituresComptables(Array.isArray(workspaceData) ? workspaceData : []);
                    break;
                case 'loadMatches':
                    setMatchedLines(Array.isArray(workspaceData) ? workspaceData : []);
                    break;
                case 'loadEcarts':
                    setEcarts(Array.isArray(workspaceData) ? workspaceData : []);
                    break;
                case 'manualMatch':
                    showToast('success', 'Succès', 'Correspondance manuelle créée');
                    setSelectedLigneBanque(null);
                    setSelectedEcriture(null);
                    if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id);
                    break;
                case 'unmatch':
                    showToast('success', 'Succès', 'Correspondance supprimée');
                    if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id);
                    break;
            }
        }
        if (workspaceError) {
            setLoadingReconcile(false);
            showToast('error', 'Erreur', workspaceError.message || 'Erreur');
        }
    }, [workspaceData, workspaceError, workspaceCallType]);

    const loadRapprochements = () => {
        fetchRapprochements(null, 'GET', `${BASE_URL}/findall`, 'loadRapprochements');
    };

    const loadReleves = () => {
        fetchReleves(null, 'GET', `${RELEVES_URL}/findall`, 'loadReleves');
    };

    const loadComptes = () => {
        fetchComptes(null, 'GET', `${COMPTES_URL}/findall`, 'loadComptes');
    };

    const loadWorkspaceData = (rapprochementId: number) => {
        // Load rapprochement detail
        fetchRapprochements(null, 'GET', `${BASE_URL}/findbyid/${rapprochementId}`, 'loadDetail');
        // We need to load lignes, ecritures, matches, ecarts separately
        // Using workspace hook for sequential calls
        const rap = rapprochements.find(r => r.id === rapprochementId) || selectedRapprochement;
        if (rap?.releveBancaire?.id) {
            fetchWorkspace(null, 'GET', `${RELEVES_URL}/lignes/${rap.releveBancaire.id}`, 'loadLignes');
        }
        // Load matches
        setTimeout(() => {
            fetchWorkspace(null, 'GET', `${BASE_URL}/matches/${rapprochementId}`, 'loadMatches');
        }, 200);
        // Load ecarts
        setTimeout(() => {
            fetchWorkspace(null, 'GET', `${BASE_URL}/ecarts/${rapprochementId}`, 'loadEcarts');
        }, 400);
        // Load unreconciled ecritures
        if (rap?.compteComptableId) {
            setTimeout(() => {
                fetchWorkspace(null, 'GET', `${BASE_URL}/ecritures-non-rapprochees?compteId=${rap.compteComptableId}&mois=${rap.mois}&annee=${rap.annee}`, 'loadEcritures');
            }, 600);
        }
    };

    const resetForm = () => {
        setRapprochement(new RapprochementBancaire());
        setIsEdit(false);
    };

    const validateForm = (): boolean => {
        const errors: string[] = [];
        if (!rapprochement.releveBancaireId) errors.push('Relevé bancaire est obligatoire');
        if (!rapprochement.compteComptableId) errors.push('Compte comptable est obligatoire');
        if (!rapprochement.mois) errors.push('Mois est obligatoire');
        if (!rapprochement.annee) errors.push('Année est obligatoire');
        if (errors.length > 0) {
            showToast('error', 'Validation', errors.join(' | '));
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;
        const dataToSend = { ...rapprochement, userAction: getUserAction() };
        if (isEdit && rapprochement.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${rapprochement.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: RapprochementBancaire) => {
        setRapprochement({
            ...rowData,
            releveBancaireId: rowData.releveBancaire?.id || null
        });
        setIsEdit(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: RapprochementBancaire) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le rapprochement ${rowData.reference}?`,
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

    const openWorkspace = (rowData: RapprochementBancaire) => {
        setSelectedRapprochement(rowData);
        setAutoReconcileResult(null);
        if (rowData.id) loadWorkspaceData(rowData.id);
        setWorkspaceVisible(true);
    };

    const handleAutoReconcile = () => {
        if (!selectedRapprochement?.id) return;
        setLoadingReconcile(true);
        fetchWorkspace({ userAction: getUserAction() }, 'POST', `${BASE_URL}/auto-reconcile/${selectedRapprochement.id}`, 'autoReconcile');
    };

    const handleManualMatch = () => {
        if (!selectedRapprochement?.id || !selectedLigneBanque?.id || !selectedEcriture?.ecritureId) {
            showToast('warn', 'Attention', 'Sélectionnez une ligne bancaire et une écriture comptable');
            return;
        }
        const body = {
            rapprochementId: selectedRapprochement.id,
            ligneReleveId: selectedLigneBanque.id,
            ecritureId: selectedEcriture.ecritureId,
            userAction: getUserAction()
        };
        fetchWorkspace(body, 'POST', `${BASE_URL}/match-manual`, 'manualMatch');
    };

    const handleUnmatch = (match: LigneRapprochement) => {
        confirmDialog({
            message: 'Supprimer cette correspondance?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchWorkspace(null, 'DELETE', `${BASE_URL}/unmatch/${match.id}`, 'unmatch');
            }
        });
    };

    const handleValidate = () => {
        if (!selectedRapprochement?.id || !signatureInput) {
            showToast('warn', 'Attention', 'Veuillez saisir la signature du comptable');
            return;
        }
        fetchAction({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/validate/${selectedRapprochement.id}?comptableSignature=${encodeURIComponent(signatureInput)}`, 'validate');
    };

    const handleApprove = () => {
        if (!selectedRapprochement?.id || !signatureInput) {
            showToast('warn', 'Attention', 'Veuillez saisir la signature du directeur');
            return;
        }
        fetchAction({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/approve/${selectedRapprochement.id}?directeurSignature=${encodeURIComponent(signatureInput)}`, 'approve');
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

    const statutBodyTemplate = (rowData: RapprochementBancaire) => {
        const severityMap: Record<string, 'info' | 'warning' | 'success' | 'danger'> = {
            'BROUILLON': 'info',
            'EN_COURS': 'warning',
            'TERMINE': 'success',
            'VALIDE': 'success'
        };
        const labelMap: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'VALIDE': 'Validé'
        };
        return <Tag value={labelMap[rowData.statut] || rowData.statut} severity={severityMap[rowData.statut] || 'info'} />;
    };

    const tableHeader = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Liste des rapprochements</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    const actionsBodyTemplate = (rowData: RapprochementBancaire) => (
        <div className="flex gap-1">
            <Button icon="pi pi-cog" rounded text severity="info" onClick={() => openWorkspace(rowData)} tooltip="Espace de travail" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" disabled={rowData.statut === 'VALIDE'} />
        </div>
    );

    const releveOptionTemplate = (option: ReleveBancaire) => (
        <span>{option.nomBanque} - {option.numeroCompte} ({getMoisLabel(option.moisReleve)} {option.anneeReleve})</span>
    );

    const compteOptionTemplate = (option: any) => (
        <span>{option.codeCompte} - {option.libelle}</span>
    );

    const lignesBanqueNonRapprochees = lignesBanque.filter(l => !l.rapprochee);
    const lignesBanqueRapprochees = lignesBanque.filter(l => l.rapprochee);

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2><i className="pi pi-check-circle mr-2"></i>Rapprochements Bancaires</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Rapprochement" leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-6">
                            <label htmlFor="releveBancaireId">Relevé bancaire *</label>
                            <Dropdown
                                id="releveBancaireId"
                                value={rapprochement.releveBancaireId}
                                options={releves}
                                onChange={(e) => {
                                    const selected = releves.find(r => r.id === e.value);
                                    setRapprochement({
                                        ...rapprochement,
                                        releveBancaireId: e.value,
                                        mois: selected?.moisReleve || rapprochement.mois,
                                        annee: selected?.anneeReleve || rapprochement.annee
                                    });
                                }}
                                optionLabel="nomBanque"
                                optionValue="id"
                                itemTemplate={releveOptionTemplate}
                                placeholder="Sélectionner un relevé"
                                filter
                                showClear
                            />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="compteComptableId">Compte comptable (banque) *</label>
                            <Dropdown
                                id="compteComptableId"
                                value={rapprochement.compteComptableId}
                                options={comptes.filter((c: any) => c.compteBanque)}
                                onChange={(e) => setRapprochement({ ...rapprochement, compteComptableId: e.value })}
                                optionLabel="libelle"
                                optionValue="compteId"
                                itemTemplate={compteOptionTemplate}
                                placeholder="Sélectionner un compte"
                                filter
                                showClear
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="mois">Mois *</label>
                            <Dropdown id="mois" value={rapprochement.mois} options={MOIS_OPTIONS} onChange={(e) => setRapprochement({ ...rapprochement, mois: e.value })} placeholder="Mois" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="annee">Année *</label>
                            <InputNumber id="annee" value={rapprochement.annee} onValueChange={(e) => setRapprochement({ ...rapprochement, annee: e.value || new Date().getFullYear() })} useGrouping={false} />
                        </div>
                        <div className="field col-12 md:col-6">
                            <label htmlFor="notes">Notes</label>
                            <InputTextarea id="notes" value={rapprochement.notes} onChange={(e) => setRapprochement({ ...rapprochement, notes: e.target.value })} rows={2} />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <Button label={isEdit ? 'Modifier' : 'Créer'} icon={isEdit ? 'pi pi-check' : 'pi pi-plus'} onClick={handleSubmit} />
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Rapprochements" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={rapprochements}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilter}
                        header={tableHeader}
                        emptyMessage="Aucun rapprochement trouvé"
                        className="p-datatable-sm"
                        stripedRows
                        showGridlines
                        sortField="annee"
                        sortOrder={-1}
                    >
                        <Column field="reference" header="Référence" sortable filter />
                        <Column header="Banque" body={(row) => row.releveBancaire?.nomBanque || '-'} sortable />
                        <Column header="Période" body={(row) => `${getMoisLabel(row.mois)} ${row.annee}`} />
                        <Column field="soldeBanque" header="Solde Banque" body={(row) => formatCurrency(row.soldeBanque)} sortable />
                        <Column field="soldeComptable" header="Solde Comptable" body={(row) => formatCurrency(row.soldeComptable)} sortable />
                        <Column field="ecart" header="Écart" body={(row) => formatCurrency(row.ecart)} sortable />
                        <Column header="Statut" body={statutBodyTemplate} sortable sortField="statut" />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Reconciliation Workspace Dialog */}
            <Dialog
                header={`Espace de rapprochement - ${selectedRapprochement?.reference || ''}`}
                visible={workspaceVisible}
                style={{ width: '95vw' }}
                onHide={() => setWorkspaceVisible(false)}
                maximizable
            >
                {selectedRapprochement && (
                    <div>
                        {/* Summary bar */}
                        <div className="grid mb-3">
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1">
                                    <div className="text-500 mb-1">Statut</div>
                                    {statutBodyTemplate(selectedRapprochement)}
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1">
                                    <div className="text-500 mb-1">Solde Banque</div>
                                    <div className="text-xl font-bold">{formatCurrency(selectedRapprochement.soldeBanque)}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1">
                                    <div className="text-500 mb-1">Solde Comptable</div>
                                    <div className="text-xl font-bold">{formatCurrency(selectedRapprochement.soldeComptable)}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1">
                                    <div className="text-500 mb-1">Écart</div>
                                    <div className={`text-xl font-bold ${selectedRapprochement.ecart !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatCurrency(selectedRapprochement.ecart)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mb-3">
                            <Button
                                label="Rapprochement automatique"
                                icon="pi pi-bolt"
                                onClick={handleAutoReconcile}
                                loading={loadingReconcile}
                                disabled={selectedRapprochement.statut === 'VALIDE' || !can('RAPPROCHEMENT_AUTO_RECONCILE')}
                            />
                            <Button
                                label="Correspondance manuelle"
                                icon="pi pi-link"
                                severity="info"
                                onClick={handleManualMatch}
                                disabled={!selectedLigneBanque || !selectedEcriture || selectedRapprochement.statut === 'VALIDE' || !can('RAPPROCHEMENT_MANUAL_MATCH')}
                            />
                            <div className="flex-grow-1"></div>
                            {selectedRapprochement.statut === 'EN_COURS' && can('RAPPROCHEMENT_VALIDATE') && (
                                <Button label="Valider (Comptable)" icon="pi pi-check" severity="success" onClick={() => setValidateDialogVisible(true)} />
                            )}
                            {selectedRapprochement.statut === 'TERMINE' && can('RAPPROCHEMENT_APPROVE') && (
                                <Button label="Approuver (Directeur)" icon="pi pi-verified" severity="success" onClick={() => setApproveDialogVisible(true)} />
                            )}
                        </div>

                        {loadingReconcile && <ProgressBar mode="indeterminate" className="mb-3" />}

                        {/* Auto-reconcile results */}
                        {autoReconcileResult && (
                            <div className="surface-card p-3 border-round shadow-1 mb-3 bg-blue-50">
                                <i className="pi pi-info-circle mr-2"></i>
                                <strong>Résultat:</strong> {autoReconcileResult.matchCount} correspondances trouvées sur {autoReconcileResult.totalLignesBanque} lignes bancaires et {autoReconcileResult.totalEcritures} écritures. {autoReconcileResult.ecartCount} écarts détectés.
                            </div>
                        )}

                        {/* Split view: Bank lines vs Accounting entries */}
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h5><i className="pi pi-building mr-2"></i>Lignes bancaires non rapprochées ({lignesBanqueNonRapprochees.length})</h5>
                                <DataTable
                                    value={lignesBanqueNonRapprochees}
                                    selection={selectedLigneBanque}
                                    onSelectionChange={(e) => setSelectedLigneBanque(e.value)}
                                    selectionMode="single"
                                    paginator
                                    rows={5}
                                    className="p-datatable-sm"
                                    emptyMessage="Toutes les lignes sont rapprochées"
                                    scrollable
                                    scrollHeight="300px"
                                >
                                    <Column selectionMode="single" style={{ width: '3em' }} />
                                    <Column field="dateOperation" header="Date" body={(row) => formatDate(row.dateOperation)} style={{ width: '15%' }} />
                                    <Column field="reference" header="Réf" style={{ width: '15%' }} />
                                    <Column field="description" header="Description" />
                                    <Column header="Montant" body={(row) => formatCurrency((row.montantCredit || 0) - (row.montantDebit || 0))} style={{ width: '20%' }} />
                                </DataTable>
                            </div>
                            <div className="col-12 md:col-6">
                                <h5><i className="pi pi-book mr-2"></i>Écritures non rapprochées ({ecrituresComptables.length})</h5>
                                <DataTable
                                    value={ecrituresComptables}
                                    selection={selectedEcriture}
                                    onSelectionChange={(e) => setSelectedEcriture(e.value)}
                                    selectionMode="single"
                                    dataKey="ecritureId"
                                    paginator
                                    rows={5}
                                    className="p-datatable-sm"
                                    emptyMessage="Toutes les écritures sont rapprochées"
                                    scrollable
                                    scrollHeight="300px"
                                >
                                    <Column selectionMode="single" style={{ width: '3em' }} />
                                    <Column field="dateEcriture" header="Date" body={(row) => formatDate(row.dateEcriture)} style={{ width: '15%' }} />
                                    <Column field="reference" header="Réf" style={{ width: '15%' }} />
                                    <Column field="libelle" header="Libellé" />
                                    <Column header="Montant" body={(row) => formatCurrency((row.debit || 0) - (row.credit || 0))} style={{ width: '20%' }} />
                                </DataTable>
                            </div>
                        </div>

                        <Divider />

                        {/* Matched lines */}
                        <h5><i className="pi pi-check-circle mr-2 text-green-500"></i>Correspondances ({matchedLines.length})</h5>
                        <DataTable
                            value={matchedLines}
                            paginator
                            rows={5}
                            className="p-datatable-sm"
                            emptyMessage="Aucune correspondance"
                        >
                            <Column field="ligneReleveId" header="Ligne Bancaire ID" />
                            <Column field="ecritureId" header="Écriture ID" />
                            <Column field="typeMatch" header="Type" body={(row) => <Tag value={row.typeMatch} severity={row.typeMatch === 'AUTO' ? 'info' : 'warning'} />} />
                            <Column field="confiance" header="Confiance" body={(row) => `${row.confiance}%`} />
                            <Column header="" body={(row) => (
                                <Button icon="pi pi-times" rounded text severity="danger" onClick={() => handleUnmatch(row)} tooltip="Supprimer" disabled={selectedRapprochement.statut === 'VALIDE'} />
                            )} style={{ width: '80px' }} />
                        </DataTable>

                        <Divider />

                        {/* Ecarts */}
                        <h5><i className="pi pi-exclamation-triangle mr-2 text-orange-500"></i>Écarts ({ecarts.length})</h5>
                        <DataTable
                            value={ecarts}
                            paginator
                            rows={5}
                            className="p-datatable-sm"
                            emptyMessage="Aucun écart"
                        >
                            <Column field="typeEcart" header="Type" body={(row) => {
                                const labels: Record<string, string> = {
                                    'CHEQUE_NON_DEBITE': 'Chèque non débité',
                                    'VIREMENT_EN_COURS': 'Virement en cours',
                                    'FRAIS_BANCAIRES': 'Frais bancaires',
                                    'ERREUR_SAISIE': 'Erreur de saisie',
                                    'AUTRE': 'Autre'
                                };
                                return labels[row.typeEcart] || row.typeEcart;
                            }} />
                            <Column field="description" header="Description" />
                            <Column field="montant" header="Montant" body={(row) => formatCurrency(row.montant)} />
                            <Column field="resolu" header="Statut" body={(row) => <Tag value={row.resolu ? 'Résolu' : 'Non résolu'} severity={row.resolu ? 'success' : 'danger'} />} />
                        </DataTable>
                    </div>
                )}
            </Dialog>

            {/* Validate Dialog */}
            <Dialog
                header="Validation du comptable"
                visible={validateDialogVisible}
                style={{ width: '400px' }}
                onHide={() => { setValidateDialogVisible(false); setSignatureInput(''); }}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => { setValidateDialogVisible(false); setSignatureInput(''); }} />
                        <Button label="Valider" icon="pi pi-check" severity="success" onClick={handleValidate} />
                    </div>
                }
            >
                <div className="p-fluid">
                    <label htmlFor="comptableSignature">Nom du comptable (signature)</label>
                    <InputText id="comptableSignature" value={signatureInput} onChange={(e) => setSignatureInput(e.target.value)} placeholder="Entrez votre nom" />
                </div>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
                header="Approbation du directeur financier"
                visible={approveDialogVisible}
                style={{ width: '400px' }}
                onHide={() => { setApproveDialogVisible(false); setSignatureInput(''); }}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => { setApproveDialogVisible(false); setSignatureInput(''); }} />
                        <Button label="Approuver" icon="pi pi-verified" severity="success" onClick={handleApprove} />
                    </div>
                }
            >
                <div className="p-fluid">
                    <label htmlFor="directeurSignature">Nom du directeur financier (visa)</label>
                    <InputText id="directeurSignature" value={signatureInput} onChange={(e) => setSignatureInput(e.target.value)} placeholder="Entrez votre nom" />
                </div>
            </Dialog>
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RapprochementsPage />
        </ProtectedPage>
    );
}
