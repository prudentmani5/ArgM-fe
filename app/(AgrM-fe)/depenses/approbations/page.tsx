'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import {
    DemandeDepense,
    CategorieDepense,
    NiveauPriorite,
    BudgetDepense,
    STATUTS_DEMANDE_DEPENSE,
    ACTIONS_APPROBATION,
    MODES_PAIEMENT_DEPENSE
} from '../types/DepenseTypes';

const ApprobationsPage = () => {
    const [demandes, setDemandes] = useState<DemandeDepense[]>([]);
    const [selectedDemande, setSelectedDemande] = useState<DemandeDepense | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showActionDialog, setShowActionDialog] = useState(false);
    const [actionType, setActionType] = useState('');
    const [commentaire, setCommentaire] = useState('');
    const [filterStatus, setFilterStatus] = useState('EN_ATTENTE');
    const [categories, setCategories] = useState<CategorieDepense[]>([]);
    const [niveauxPriorite, setNiveauxPriorite] = useState<NiveauPriorite[]>([]);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [internalAccountOptions, setInternalAccountOptions] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);

    // Payment fields for approval
    const [modePaiementId, setModePaiementId] = useState<string | null>(null);
    const [typeCompte, setTypeCompte] = useState<string>('');
    const [compteDestination, setCompteDestination] = useState<number | null>(null);
    const [typeSource, setTypeSource] = useState<string>('');
    const [compteSourceId, setCompteSourceId] = useState<number | null>(null);
    const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
    const [caisses, setCaisses] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<BudgetDepense[]>([]);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');
    const { data: catData, fetchData: fetchCat } = useConsumApi('');
    const { data: niveauData, fetchData: fetchNiveau } = useConsumApi('');
    const { data: accountsData, fetchData: fetchAccounts } = useConsumApi('');
    const { data: savAccountsData, fetchData: fetchSavAccounts } = useConsumApi('');
    const { data: caissesData, fetchData: fetchCaisses } = useConsumApi('');
    const { data: budgetsData, fetchData: fetchBudgets } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/demandes');
    const CATEGORIES_URL = buildApiUrl('/api/depenses/categories');
    const NIVEAUX_URL = buildApiUrl('/api/depenses/niveaux-priorite');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');
    const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');
    const CAISSES_URL = buildApiUrl('/api/depenses/petites-caisses');
    const BUDGETS_URL = buildApiUrl('/api/depenses/budgets');

    const FILTER_OPTIONS = [
        { label: 'En attente d\'approbation', value: 'EN_ATTENTE' },
        { label: 'Soumises', value: 'SOUMISE' },
        { label: 'Validées N1', value: 'VALIDEE_N1' },
        { label: 'Validées N2', value: 'VALIDEE_N2' },
        { label: 'Approuvées', value: 'APPROUVEE' },
        { label: 'Rejetées', value: 'REJETEE' },
        { label: 'Toutes', value: 'ALL' }
    ];

    useEffect(() => {
        fetchCat(null, 'GET', `${CATEGORIES_URL}/findall`, 'loadCat');
        fetchNiveau(null, 'GET', `${NIVEAUX_URL}/findallactive`, 'loadNiveaux');
        fetchAccounts(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadAccounts');
        fetchSavAccounts(null, 'GET', `${SAVINGS_ACCOUNTS_URL}/findall`, 'loadSavAccounts');
        fetchCaisses(null, 'GET', `${CAISSES_URL}/findall`, 'loadCaisses');
        fetchBudgets(null, 'GET', `${BUDGETS_URL}/findall`, 'loadBudgets');
    }, []);

    useEffect(() => {
        if (catData) setCategories(Array.isArray(catData) ? catData : catData.content || []);
    }, [catData]);

    useEffect(() => {
        if (niveauData) setNiveauxPriorite(Array.isArray(niveauData) ? niveauData : niveauData.content || []);
    }, [niveauData]);

    useEffect(() => {
        if (accountsData) {
            const items = Array.isArray(accountsData) ? accountsData : accountsData.content || [];
            setInternalAccounts(items);
            setInternalAccountOptions(items.map((a: any) => ({
                value: a.accountId,
                label: `${a.accountNumber || a.codeCompte} - ${a.libelle}`
            })));
        }
    }, [accountsData]);

    useEffect(() => {
        if (savAccountsData) {
            const items = Array.isArray(savAccountsData) ? savAccountsData : savAccountsData.content || [];
            setSavingsAccounts(items.map((a: any) => {
                const clientName = a.client ? (a.client.businessName || `${a.client.firstName || ''} ${a.client.lastName || ''}`.trim()) : '';
                return { value: a.id, label: `${a.accountNumber} - ${clientName || 'N/A'}` };
            }));
        }
    }, [savAccountsData]);

    useEffect(() => {
        if (caissesData) {
            const items = Array.isArray(caissesData) ? caissesData : caissesData.content || [];
            const iaItems = Array.isArray(accountsData) ? accountsData : accountsData?.content || [];
            setCaisses(items.filter((c: any) => c.status === 'ACTIVE').map((c: any) => {
                let solde = c.soldeActuel || 0;
                if (c.internalAccountId) {
                    const ia = iaItems.find((a: any) => a.accountId === c.internalAccountId);
                    if (ia) solde = ia.soldeActuel || 0;
                }
                return { value: c.id, label: `${c.code} - Solde: ${solde.toLocaleString('fr-BI')} FBu` };
            }));
        }
    }, [caissesData, accountsData]);

    useEffect(() => {
        if (budgetsData) setBudgets(Array.isArray(budgetsData) ? budgetsData : budgetsData.content || []);
    }, [budgetsData]);

    useEffect(() => { loadDemandes(); }, [filterStatus]);

    useEffect(() => {
        if (listData) {
            let data = Array.isArray(listData) ? listData : listData.content || [];
            if (filterStatus === 'EN_ATTENTE') {
                data = data.filter((d: DemandeDepense) =>
                    d.status === 'SOUMISE' || d.status === 'ENGAGEE' ||
                    d.status === 'VALIDEE_N1' || d.status === 'VALIDEE_N2'
                );
            } else if (filterStatus !== 'ALL') {
                data = data.filter((d: DemandeDepense) => d.status === filterStatus);
            }
            setDemandes(data);
        }
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'approve':
                    showToast('success', 'Succès', 'Demande approuvée avec succès');
                    loadDemandes(); setShowActionDialog(false); break;
                case 'reject':
                    showToast('success', 'Info', 'Demande rejetée');
                    loadDemandes(); setShowActionDialog(false); break;
                case 'return':
                    showToast('success', 'Info', 'Demande retournée en correction');
                    loadDemandes(); setShowActionDialog(false); break;
                case 'escalate':
                    showToast('success', 'Info', 'Demande escaladée au niveau supérieur');
                    loadDemandes(); setShowActionDialog(false); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadDemandes = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${BASE_URL}/findbybranch/${branchId}` : `${BASE_URL}/findall`;
        fetchList(null, 'GET', url, 'loadDemandes');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const openActionDialog = (demande: DemandeDepense, action: string) => {
        setSelectedDemande(demande);
        setActionType(action);
        setCommentaire('');
        // Pre-fill from existing data (for N2/N3 validations)
        setModePaiementId(demande.modePaiementName || null);
        setTypeCompte(demande.typeCompteDestination || '');
        setCompteDestination(demande.compteDestinationId || null);
        setTypeSource(demande.typeSource || '');
        setCompteSourceId(demande.compteSourceId || null);
        setSelectedBudgetId(demande.budgetId || null);
        setShowActionDialog(true);
    };

    const handleAction = () => {
        if (!selectedDemande) return;
        if (actionType === 'REJETER' && !commentaire.trim()) {
            showToast('warn', 'Attention', 'Le commentaire est obligatoire pour un rejet');
            return;
        }
        const isFirstValidation = selectedDemande.status === 'SOUMISE' || selectedDemande.status === 'ENGAGEE';
        if (actionType === 'APPROUVER' && isFirstValidation && !compteSourceId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte source');
            return;
        }
        if (actionType === 'APPROUVER' && isFirstValidation && !modePaiementId) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le mode de paiement');
            return;
        }
        const isVirement = modePaiementId === 'VIREMENT_INTERNE' || modePaiementId === 'VIREMENT_BANCAIRE';
        if (actionType === 'APPROUVER' && isVirement && !compteDestination) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte de destination');
            return;
        }

        const dataToSend: any = {
            commentaire,
            userAction: getUserAction()
        };
        if (actionType === 'APPROUVER') {
            dataToSend.modePaiementName = modePaiementId;
            dataToSend.typeSource = typeSource;
            dataToSend.compteSourceId = compteSourceId;
            dataToSend.compteDestinationId = compteDestination;
            dataToSend.typeCompteDestination = typeCompte;
            if (selectedBudgetId) {
                dataToSend.budgetId = selectedBudgetId;
                const bud = budgets.find(b => b.id === selectedBudgetId);
                dataToSend.budgetLibelle = bud?.libelle || bud?.code || '';
            }
        }

        let endpoint = '';
        if (actionType === 'APPROUVER') {
            const statusToApproveMap: Record<string, string> = {
                'SOUMISE': 'approve-n1',
                'ENGAGEE': 'approve-n1',
                'VALIDEE_N1': 'approve-n2',
                'VALIDEE_N2': 'approve-n3'
            };
            endpoint = statusToApproveMap[selectedDemande.status || ''] || 'approve-n1';
        } else if (actionType === 'REJETER') {
            endpoint = 'reject';
        } else if (actionType === 'RETOURNER') {
            endpoint = 'return';
        } else {
            endpoint = 'approve-n1';
        }

        const callTypeMap: Record<string, string> = {
            'APPROUVER': 'approve',
            'REJETER': 'reject',
            'RETOURNER': 'return'
        };
        fetchAction(dataToSend, 'PUT', `${BASE_URL}/${endpoint}/${selectedDemande.id}`, callTypeMap[actionType] || 'approve');
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const statusBodyTemplate = (rowData: DemandeDepense) => {
        const severityMap: Record<string, any> = {
            'BROUILLON': 'secondary', 'SOUMISE': 'info', 'ENGAGEE': 'info',
            'VALIDEE_N1': 'warning', 'VALIDEE_N2': 'warning', 'APPROUVEE': 'success',
            'EN_PAIEMENT': 'info', 'PAYEE': 'success', 'JUSTIFIEE': 'success',
            'CLOTUREE': 'secondary', 'REJETEE': 'danger', 'RETOURNEE': 'warning', 'ANNULEE': 'danger'
        };
        const label = STATUTS_DEMANDE_DEPENSE.find(s => s.value === rowData.status)?.label || rowData.status;
        return <Tag value={label} severity={severityMap[rowData.status || ''] || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: DemandeDepense) => {
        const canApprove = ['SOUMISE', 'ENGAGEE', 'VALIDEE_N1', 'VALIDEE_N2'].includes(rowData.status || '');
        return (
            <div className="flex gap-1">
                <Button icon="pi pi-eye" rounded text severity="info" tooltip="Détails" tooltipOptions={{ position: 'top' }}
                    onClick={() => { setSelectedDemande(rowData); setShowDetailDialog(true); }} />
                {canApprove && (
                    <>
                        <Button icon="pi pi-check" rounded text severity="success" tooltip="Approuver" tooltipOptions={{ position: 'top' }}
                            onClick={() => openActionDialog(rowData, 'APPROUVER')} />
                        <Button icon="pi pi-times" rounded text severity="danger" tooltip="Rejeter" tooltipOptions={{ position: 'top' }}
                            onClick={() => openActionDialog(rowData, 'REJETER')} />
                        <Button icon="pi pi-undo" rounded text severity="warning" tooltip="Retourner" tooltipOptions={{ position: 'top' }}
                            onClick={() => openActionDialog(rowData, 'RETOURNER')} />
                    </>
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-check-square mr-2"></i>Circuit d'Approbation des Dépenses</h4>
            <div className="flex gap-2 align-items-center">
                <Dropdown value={filterStatus} options={FILTER_OPTIONS} onChange={(e) => setFilterStatus(e.value)} placeholder="Filtrer par statut" />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                </span>
            </div>
        </div>
    );

    const getSelectedSourceAccount = () => {
        if (!compteSourceId) return null;
        return internalAccounts.find(a => a.accountId === compteSourceId) || null;
    };

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('fr-BI') + ' FBu';
    };

    const getActionLabel = () => {
        const map: Record<string, string> = {
            'APPROUVER': 'Approuver', 'REJETER': 'Rejeter',
            'RETOURNER': 'Retourner en correction', 'ESCALADER': 'Escalader'
        };
        return map[actionType] || actionType;
    };

    const getActionSeverity = (): any => {
        const map: Record<string, string> = {
            'APPROUVER': 'success', 'REJETER': 'danger', 'RETOURNER': 'warning', 'ESCALADER': 'help'
        };
        return map[actionType] || 'info';
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="mb-3">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 p-3 border-round text-center">
                            <i className="pi pi-clock text-4xl text-blue-500 mb-2"></i>
                            <div className="text-2xl font-bold">{demandes.filter(d => d.status === 'SOUMISE').length}</div>
                            <div className="text-sm text-500">Soumises</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 p-3 border-round text-center">
                            <i className="pi pi-check text-4xl text-orange-500 mb-2"></i>
                            <div className="text-2xl font-bold">{demandes.filter(d => d.status === 'VALIDEE_N1' || d.status === 'VALIDEE_N2').length}</div>
                            <div className="text-sm text-500">En validation</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 p-3 border-round text-center">
                            <i className="pi pi-check-circle text-4xl text-green-500 mb-2"></i>
                            <div className="text-2xl font-bold">{demandes.filter(d => d.status === 'APPROUVEE').length}</div>
                            <div className="text-sm text-500">Approuvées</div>
                        </div>
                    </div>
                    <div className="col-12 md:col-3">
                        <div className="surface-card shadow-1 p-3 border-round text-center">
                            <i className="pi pi-times-circle text-4xl text-red-500 mb-2"></i>
                            <div className="text-2xl font-bold">{demandes.filter(d => d.status === 'REJETEE').length}</div>
                            <div className="text-sm text-500">Rejetées</div>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable value={demandes} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                loading={loadingList} globalFilter={globalFilter} header={header}
                emptyMessage="Aucune demande trouvée" className="p-datatable-sm"
                sortField="dateDemande" sortOrder={-1}>
                <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '12%' }} />
                <Column field="dateDemande" header="Date" body={(row) => dateBodyTemplate(row.dateDemande)} sortable style={{ width: '8%' }} />
                <Column header="Demandeur" sortable filter filterField="beneficiaireFournisseur" body={(row) => row.beneficiaireFournisseur || row.agentDemandeurName || '-'} style={{ width: '12%' }} />
                <Column header="Catégorie" sortable filter filterField="categorieDepenseName" body={(row) => {
                    if (row.categorieDepenseName) return row.categorieDepenseName;
                    const cat = categories.find(c => c.id === row.categorieDepenseId);
                    return cat?.nameFr || '-';
                }} style={{ width: '10%' }} />
                <Column field="natureLibelle" header="Nature" sortable filter style={{ width: '14%' }} />
                <Column header="Montant" body={(row) => currencyBodyTemplate(row.montantEstimeFBU)} sortable style={{ width: '12%' }} />
                <Column header="Statut" body={statusBodyTemplate} style={{ width: '10%' }} />
                <Column header="Actions" body={actionsBodyTemplate} style={{ width: '16%' }} />
            </DataTable>

            {/* Detail Dialog */}
            <Dialog visible={showDetailDialog} onHide={() => setShowDetailDialog(false)}
                header="Détail de la Demande" style={{ width: '60vw' }} modal>
                {selectedDemande && (
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <small className="text-600">N° Demande</small>
                            <p className="font-semibold">{selectedDemande.numeroDemande}</p>
                        </div>
                        <div className="col-12 md:col-4">
                            <small className="text-600">Date</small>
                            <p className="font-semibold">{dateBodyTemplate(selectedDemande.dateDemande)}</p>
                        </div>
                        <div className="col-12 md:col-4">
                            <small className="text-600">Statut</small>
                            <p>{statusBodyTemplate(selectedDemande)}</p>
                        </div>
                        <div className="col-12 md:col-4">
                            <small className="text-600">Catégorie</small>
                            <p className="font-semibold">{selectedDemande.categorieDepenseName || categories.find(c => c.id === selectedDemande.categorieDepenseId)?.nameFr || '-'}</p>
                        </div>
                        <div className="col-12 md:col-4">
                            <small className="text-600">Nature</small>
                            <p className="font-semibold">{selectedDemande.natureLibelle}</p>
                        </div>
                        <div className="col-12 md:col-4">
                            <small className="text-600">Montant (FBU)</small>
                            <p className="font-semibold text-primary">{currencyBodyTemplate(selectedDemande.montantEstimeFBU)}</p>
                        </div>
                        <div className="col-12 md:col-6">
                            <small className="text-600">Demandeur</small>
                            <p className="font-semibold">{selectedDemande.beneficiaireFournisseur || selectedDemande.agentDemandeurName || '-'}</p>
                        </div>
                        <div className="col-12">
                            <small className="text-600">Justification</small>
                            <p className="font-semibold">{selectedDemande.justification}</p>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Action Dialog */}
            <Dialog visible={showActionDialog} onHide={() => setShowActionDialog(false)}
                header={`${getActionLabel()} - ${selectedDemande?.numeroDemande}`}
                style={{ width: '40vw' }} modal
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setShowActionDialog(false)} className="p-button-text" />
                        <Button label={getActionLabel()} icon={actionType === 'APPROUVER' ? 'pi pi-check' : actionType === 'REJETER' ? 'pi pi-times' : 'pi pi-undo'}
                            severity={getActionSeverity()} onClick={handleAction} loading={loadingAction}
                            disabled={actionType === 'APPROUVER' && (selectedDemande?.status === 'SOUMISE' || selectedDemande?.status === 'ENGAGEE') && (() => {
                                if (!compteSourceId || !typeSource) return false;
                                let solde = 0;
                                if (typeSource === 'COMPTE_INTERNE') {
                                    const account = getSelectedSourceAccount();
                                    solde = account?.soldeActuel || 0;
                                } else if (typeSource === 'CAISSE') {
                                    const rawCaisses = Array.isArray(caissesData) ? caissesData : caissesData?.content || [];
                                    const caisse = rawCaisses.find((c: any) => c.id === compteSourceId);
                                    solde = caisse?.soldeActuel || 0;
                                    if (caisse?.internalAccountId) {
                                        const iaItems = Array.isArray(accountsData) ? accountsData : accountsData?.content || [];
                                        const ia = iaItems.find((a: any) => a.accountId === caisse.internalAccountId);
                                        if (ia) solde = ia.soldeActuel || 0;
                                    }
                                }
                                return solde < (selectedDemande?.montantEstimeFBU || 0);
                            })()} />
                    </div>
                }>
                <div className="mb-3">
                    <p className="text-600">
                        <strong>Demande:</strong> {selectedDemande?.numeroDemande}<br />
                        <strong>Nature:</strong> {selectedDemande?.natureLibelle}<br />
                        <strong>Montant:</strong> {currencyBodyTemplate(selectedDemande?.montantEstimeFBU)}
                    </p>
                </div>

                {selectedDemande && (() => {
                    const cat = categories.find(c => c.id === selectedDemande.categorieDepenseId);
                    if (!cat?.internalAccountId) return null;
                    const acc = internalAccounts.find(a => a.accountId === cat.internalAccountId);
                    if (!acc) return null;
                    return (
                        <div className="mb-3 p-3 border-round surface-100">
                            <h6 className="mt-0 mb-2"><i className="pi pi-building mr-2"></i>Compte Principal de la Catégorie</h6>
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Catégorie</small>
                                    <p className="font-semibold mt-1 mb-0">{cat.nameFr}</p>
                                </div>
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Compte Interne</small>
                                    <p className="font-semibold mt-1 mb-0">{acc.accountNumber} - {acc.libelle}</p>
                                </div>
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Solde</small>
                                    <p className="font-semibold mt-1 mb-0 text-blue-600">{formatCurrency(acc.soldeActuel || 0)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {actionType === 'APPROUVER' && (() => {
                    const isFirstValidation = selectedDemande?.status === 'SOUMISE' || selectedDemande?.status === 'ENGAGEE';

                    const isN2Validation = selectedDemande?.status === 'VALIDEE_N1';
                    const isN3Validation = selectedDemande?.status === 'VALIDEE_N2';

                    // N2 and N3: read-only display of what was set at N1
                    if ((isN2Validation || isN3Validation) && selectedDemande?.modePaiementName) {
                        return (<>
                            <div className="mb-3 p-3 border-round surface-100">
                                <h6 className="mt-0 mb-2"><i className="pi pi-wallet mr-2"></i>Compte Source (défini au N1)</h6>
                                <div className="p-fluid formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label>Type de Source</label>
                                        <Dropdown value={typeSource} options={[
                                            { label: 'Caisse', value: 'CAISSE' },
                                            { label: 'Compte Interne', value: 'COMPTE_INTERNE' }
                                        ]} disabled />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label>{typeSource === 'CAISSE' ? 'Caisse' : 'Compte Interne'}</label>
                                        <Dropdown value={compteSourceId}
                                            options={typeSource === 'CAISSE' ? caisses : internalAccountOptions}
                                            optionLabel="label" optionValue="value" disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3 p-3 border-round surface-50">
                                <h6 className="mt-0 mb-3"><i className="pi pi-credit-card mr-2"></i>Mode de Paiement (défini au N1)</h6>
                                <div className="p-fluid formgrid grid">
                                    <div className="field col-12 md:col-6">
                                        <label>Mode de Paiement</label>
                                        <Dropdown value={modePaiementId} options={MODES_PAIEMENT_DEPENSE}
                                            optionLabel="label" optionValue="value" disabled />
                                    </div>
                                    {(modePaiementId === 'VIREMENT_INTERNE' || modePaiementId === 'VIREMENT_BANCAIRE') && (
                                        <>
                                            <div className="field col-12 md:col-6">
                                                <label>Type de Compte</label>
                                                <Dropdown value={typeCompte} options={[
                                                    { label: 'Compte Client (Épargne)', value: 'CLIENT' },
                                                    { label: 'Compte Interne', value: 'INTERNE' }
                                                ]} disabled />
                                            </div>
                                            <div className="field col-12">
                                                <label>Compte de Destination</label>
                                                <Dropdown value={compteDestination}
                                                    options={typeCompte === 'CLIENT' ? savingsAccounts : internalAccountOptions}
                                                    optionLabel="label" optionValue="value" disabled />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            {selectedDemande.budgetId && (() => {
                                const bud = budgets.find(b => b.id === selectedDemande.budgetId);
                                if (!bud) return (
                                    <div className="mb-3 p-3 border-round border-1 border-purple-300" style={{ backgroundColor: '#f8f0ff' }}>
                                        <h6 className="mt-0 mb-1"><i className="pi pi-chart-bar mr-2 text-purple-600"></i>Budget</h6>
                                        <p className="font-semibold mb-0">{selectedDemande.budgetLibelle || `Budget #${selectedDemande.budgetId}`}</p>
                                    </div>
                                );
                                return (
                                    <div className="mb-3 p-3 border-round border-1 border-purple-300" style={{ backgroundColor: '#f8f0ff' }}>
                                        <h6 className="mt-0 mb-2"><i className="pi pi-chart-bar mr-2 text-purple-600"></i>Budget - {bud.libelle || bud.code}</h6>
                                        <div className="grid">
                                            <div className="col-6 md:col-3">
                                                <small className="text-600">Alloué</small>
                                                <p className="font-semibold mt-1 mb-0 text-blue-600">{formatCurrency(bud.montantAlloue || 0)}</p>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <small className="text-600">Dépensé</small>
                                                <p className="font-semibold mt-1 mb-0 text-orange-600">{formatCurrency(bud.montantDepense || 0)}</p>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <small className="text-600">Disponible</small>
                                                <p className={`font-bold mt-1 mb-0 ${(bud.montantDisponible || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(bud.montantDisponible || 0)}</p>
                                            </div>
                                            <div className="col-6 md:col-3">
                                                <small className="text-600">Taux</small>
                                                <p className="mt-1 mb-0">
                                                    <Tag value={`${((bud.tauxConsommation || 0)).toFixed(1)}%`} severity={(bud.tauxConsommation || 0) >= 80 ? 'danger' : (bud.tauxConsommation || 0) >= 50 ? 'warning' : 'success'} />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </>);
                    }

                    // N1: show editable fields
                    return (<>
                    <div className="mb-3 p-3 border-round surface-100">
                        <h6 className="mt-0 mb-2"><i className="pi pi-wallet mr-2"></i>Compte Source *</h6>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label>Type de Source *</label>
                                <Dropdown value={typeSource} options={[
                                    { label: 'Caisse', value: 'CAISSE' },
                                    { label: 'Compte Interne', value: 'COMPTE_INTERNE' }
                                ]} onChange={(e) => {
                                    setTypeSource(e.value);
                                    setCompteSourceId(null);
                                    setModePaiementId(e.value === 'CAISSE' ? 'ESPECES' : null);
                                    setTypeCompte('');
                                    setCompteDestination(null);
                                }}
                                placeholder="Sélectionner le type" />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label>{typeSource === 'CAISSE' ? 'Caisse *' : 'Compte Interne *'}</label>
                                <Dropdown value={compteSourceId}
                                    options={typeSource === 'CAISSE' ? caisses : typeSource === 'COMPTE_INTERNE' ? internalAccountOptions : []}
                                    optionLabel="label" optionValue="value"
                                    onChange={(e) => setCompteSourceId(e.value)}
                                    placeholder={typeSource ? 'Sélectionner' : 'Choisir le type d\'abord'}
                                    filter showClear filterPlaceholder="Rechercher..."
                                    disabled={!typeSource} />
                            </div>
                        </div>
                        {(() => {
                            if (!compteSourceId || !typeSource) return null;
                            let solde = 0;
                            if (typeSource === 'COMPTE_INTERNE') {
                                const account = getSelectedSourceAccount();
                                solde = account?.soldeActuel || 0;
                            } else if (typeSource === 'CAISSE') {
                                const rawCaisses = Array.isArray(caissesData) ? caissesData : caissesData?.content || [];
                                const caisse = rawCaisses.find((c: any) => c.id === compteSourceId);
                                solde = caisse?.soldeActuel || 0;
                                // Use linked internal account balance if available
                                if (caisse?.internalAccountId) {
                                    const iaItems = Array.isArray(accountsData) ? accountsData : accountsData?.content || [];
                                    const ia = iaItems.find((a: any) => a.accountId === caisse.internalAccountId);
                                    if (ia) solde = ia.soldeActuel || 0;
                                }
                            }
                            const montant = selectedDemande?.montantEstimeFBU || 0;
                            const reste = solde - montant;
                            return (
                                <div className="grid mt-2">
                                    <div className="col-12 md:col-4">
                                        <small className="text-600">Solde Actuel</small>
                                        <p className="font-semibold mt-1 mb-0 text-blue-600">{formatCurrency(solde)}</p>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <small className="text-600">Montant Dépense</small>
                                        <p className="font-semibold mt-1 mb-0 text-orange-600">- {formatCurrency(montant)}</p>
                                    </div>
                                    <div className="col-12 md:col-4">
                                        <small className="text-600">Solde Restant</small>
                                        <p className={`font-bold mt-1 mb-0 ${reste < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(reste)}</p>
                                    </div>
                                    {reste < 0 && (
                                        <div className="col-12">
                                            <Tag icon="pi pi-exclamation-triangle" severity="danger" value="Solde insuffisant !" />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="mb-3 p-3 border-round border-1 border-purple-300" style={{ backgroundColor: '#f8f0ff' }}>
                        <h6 className="mt-0 mb-2"><i className="pi pi-chart-bar mr-2 text-purple-600"></i>Budget *</h6>
                        <div className="p-fluid">
                            <Dropdown value={selectedBudgetId}
                                options={budgets.filter(b => b.status === 'ACTIVE').map(b => ({
                                    value: b.id,
                                    label: `${b.code || ''} - ${b.libelle || ''} (Disponible: ${(b.montantDisponible || 0).toLocaleString('fr-BI')} FBu)`
                                }))}
                                optionLabel="label" optionValue="value"
                                onChange={(e) => setSelectedBudgetId(e.value)}
                                placeholder="Sélectionner le budget" filter showClear filterPlaceholder="Rechercher..." />
                        </div>
                        {selectedBudgetId && (() => {
                            const bud = budgets.find(b => b.id === selectedBudgetId);
                            if (!bud) return null;
                            const alloue = bud.montantAlloue || 0;
                            const depense = bud.montantDepense || 0;
                            const disponible = bud.montantDisponible || (alloue - depense);
                            const montant = selectedDemande?.montantEstimeFBU || 0;
                            const taux = alloue > 0 ? ((depense / alloue) * 100) : 0;
                            return (
                                <div className="grid mt-2">
                                    <div className="col-6 md:col-3">
                                        <small className="text-600">Alloué</small>
                                        <p className="font-semibold mt-1 mb-0 text-blue-600">{formatCurrency(alloue)}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <small className="text-600">Dépensé</small>
                                        <p className="font-semibold mt-1 mb-0 text-orange-600">{formatCurrency(depense)}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <small className="text-600">Disponible</small>
                                        <p className={`font-bold mt-1 mb-0 ${disponible < 0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(disponible)}</p>
                                    </div>
                                    <div className="col-6 md:col-3">
                                        <small className="text-600">Taux</small>
                                        <p className="mt-1 mb-0">
                                            <Tag value={`${taux.toFixed(1)}%`} severity={taux >= 80 ? 'danger' : taux >= 50 ? 'warning' : 'success'} />
                                        </p>
                                    </div>
                                    {disponible < montant && (
                                        <div className="col-12">
                                            <Tag icon="pi pi-exclamation-triangle" severity="warning" value="Le montant dépasse le budget disponible" />
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="mb-3 p-3 border-round surface-50">
                        <h6 className="mt-0 mb-3"><i className="pi pi-credit-card mr-2"></i>Mode de Paiement</h6>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label>Mode de Paiement *</label>
                                <Dropdown value={modePaiementId}
                                    options={typeSource === 'CAISSE'
                                        ? MODES_PAIEMENT_DEPENSE.filter(m => m.value === 'ESPECES')
                                        : typeSource === 'COMPTE_INTERNE'
                                            ? MODES_PAIEMENT_DEPENSE.filter(m => m.value !== 'ESPECES')
                                            : MODES_PAIEMENT_DEPENSE}
                                    optionLabel="label" optionValue="value"
                                    onChange={(e) => { setModePaiementId(e.value); setTypeCompte(''); setCompteDestination(null); }}
                                    placeholder="Sélectionner" />
                            </div>
                            {(modePaiementId === 'VIREMENT_INTERNE' || modePaiementId === 'VIREMENT_BANCAIRE') && (
                                <>
                                    <div className="field col-12 md:col-6">
                                        <label>Type de Compte *</label>
                                        <Dropdown value={typeCompte} options={[
                                            { label: 'Compte Client (Épargne)', value: 'CLIENT' },
                                            { label: 'Compte Interne', value: 'INTERNE' }
                                        ]} onChange={(e) => { setTypeCompte(e.value); setCompteDestination(null); }} placeholder="Sélectionner le type" />
                                    </div>
                                    <div className="field col-12">
                                        <label>Compte de Destination *</label>
                                        <Dropdown value={compteDestination}
                                            options={typeCompte === 'CLIENT' ? savingsAccounts : typeCompte === 'INTERNE' ? internalAccountOptions : []}
                                            optionLabel="label" optionValue="value"
                                            onChange={(e) => setCompteDestination(e.value)}
                                            placeholder={typeCompte ? 'Sélectionner le compte' : 'Choisir le type d\'abord'}
                                            filter showClear filterPlaceholder="Rechercher..."
                                            disabled={!typeCompte} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                    </>);
                })()}

                <div className="field">
                    <label htmlFor="commentaire">Commentaire {actionType === 'REJETER' ? '*' : ''}</label>
                    <InputTextarea id="commentaire" value={commentaire} onChange={(e) => setCommentaire(e.target.value)}
                        rows={3} placeholder="Saisissez votre commentaire..." className="w-full" />
                </div>
            </Dialog>
        </div>
    );
};

export default ApprobationsPage;
