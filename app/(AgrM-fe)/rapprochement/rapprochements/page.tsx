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
    EcartRapprochement, MOIS_OPTIONS
} from '../types';
import { CptEcriture } from '../../comptability/types';
import { ProtectedPage } from '@/components/ProtectedPage';
import { useAuthorizedAction } from '@/hooks/useAuthorizedAction';

function RapprochementsPage() {
    const { can } = useAuthorizedAction();
    const [rapprochements, setRapprochements] = useState<RapprochementBancaire[]>([]);
    const [rapprochement, setRapprochement] = useState<RapprochementBancaire>(new RapprochementBancaire());
    const [releves, setReleves] = useState<ReleveBancaire[]>([]);
    // Bank accounts come from comptes-internes on the BQ (bank) journal
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [journaux, setJournaux] = useState<any[]>([]);
    const [soldePreview, setSoldePreview] = useState<any>(null);
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
    const [wsSoldePreview, setWsSoldePreview] = useState<any>(null);
    const [internalMovements, setInternalMovements] = useState<any[]>([]);
    const [loadingReconcile, setLoadingReconcile] = useState(false);
    const [loadingWorkspace, setLoadingWorkspace] = useState(false);

    // Validation dialog
    const [validateDialogVisible, setValidateDialogVisible] = useState(false);
    const [approveDialogVisible, setApproveDialogVisible] = useState(false);
    const [signatureInput, setSignatureInput] = useState('');

    const toast = useRef<Toast>(null);

    // Separate hooks for each data source to avoid race conditions
    const { data: rapprochementsData, error: rapprochementsError, fetchData: fetchRapprochements } = useConsumApi('');
    const { data: relevesData, error: relevesError, fetchData: fetchReleves } = useConsumApi('');
    const { data: comptesData, error: comptesError, fetchData: fetchComptes } = useConsumApi('');
    const { data: journauxData, fetchData: fetchJournaux } = useConsumApi('');
    const { data: soldeData, fetchData: fetchSolde } = useConsumApi('');
    const { data: actionData, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    // Separate hooks for workspace data - each with its own hook to prevent race conditions
    const { data: wsLignesData, error: wsLignesError, fetchData: fetchWsLignes } = useConsumApi('');
    const { data: wsEcrituresData, error: wsEcrituresError, fetchData: fetchWsEcritures } = useConsumApi('');
    const { data: wsMatchesData, error: wsMatchesError, fetchData: fetchWsMatches } = useConsumApi('');
    const { data: wsEcartsData, error: wsEcartsError, fetchData: fetchWsEcarts } = useConsumApi('');
    const { data: wsReconcileData, error: wsReconcileError, fetchData: fetchWsReconcile } = useConsumApi('');
    const { data: wsManualData, error: wsManualError, fetchData: fetchWsManual, callType: wsManualCallType } = useConsumApi('');
    const { data: wsDetailData, error: wsDetailError, fetchData: fetchWsDetail } = useConsumApi('');
    const { data: wsSoldeData, fetchData: fetchWsSolde } = useConsumApi('');
    const { data: wsMvtData, fetchData: fetchWsMvt } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/rapprochement/rapprochements');
    const RELEVES_URL = buildApiUrl('/api/rapprochement/releves');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');
    const JOURNAUX_URL = buildApiUrl('/api/comptability/journaux');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Initial data load
    useEffect(() => {
        loadRapprochements();
        loadReleves();
        loadInternalAccounts();
        loadJournaux();
    }, []);

    // Handle rapprochements list data
    useEffect(() => {
        if (rapprochementsData) {
            const arr = Array.isArray(rapprochementsData) ? rapprochementsData : rapprochementsData.content || [];
            setRapprochements(arr);
        }
        if (rapprochementsError) {
            showToast('error', 'Erreur', rapprochementsError.message || 'Erreur de chargement des rapprochements');
        }
    }, [rapprochementsData, rapprochementsError]);

    // Handle releves data
    useEffect(() => {
        if (relevesData) {
            const arr = Array.isArray(relevesData) ? relevesData : [];
            setReleves(arr);
        }
    }, [relevesData, relevesError]);

    // Handle internal accounts data (comptes-internes)
    useEffect(() => {
        if (comptesData) {
            const arr = Array.isArray(comptesData) ? comptesData : comptesData.content || [];
            setInternalAccounts(arr);
        }
    }, [comptesData, comptesError]);

    // Handle journaux data
    useEffect(() => {
        if (journauxData) {
            setJournaux(Array.isArray(journauxData) ? journauxData : []);
        }
    }, [journauxData]);

    // Handle solde comptable preview
    useEffect(() => {
        if (soldeData) setSoldePreview(soldeData);
    }, [soldeData]);

    // Load the book-balance preview whenever the bank account + period are set on the form
    useEffect(() => {
        if (rapprochement.compteComptableId && rapprochement.mois && rapprochement.annee) {
            fetchSolde(null, 'GET',
                `${BASE_URL}/solde-comptable?compteId=${rapprochement.compteComptableId}&mois=${rapprochement.mois}&annee=${rapprochement.annee}`,
                'loadSolde');
        } else {
            setSoldePreview(null);
        }
    }, [rapprochement.compteComptableId, rapprochement.mois, rapprochement.annee]);

    // Handle CRUD action responses
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

    // Handle workspace lignes data
    useEffect(() => {
        if (wsLignesData) {
            setLignesBanque(Array.isArray(wsLignesData) ? wsLignesData : []);
        }
        if (wsLignesError) {
            showToast('error', 'Erreur', wsLignesError.message || 'Erreur de chargement des lignes bancaires');
        }
    }, [wsLignesData, wsLignesError]);

    // Handle workspace ecritures data
    useEffect(() => {
        if (wsEcrituresData) {
            setEcrituresComptables(Array.isArray(wsEcrituresData) ? wsEcrituresData : []);
        }
        if (wsEcrituresError) {
            showToast('error', 'Erreur', wsEcrituresError.message || 'Erreur de chargement des écritures');
        }
    }, [wsEcrituresData, wsEcrituresError]);

    // Handle workspace matches data
    useEffect(() => {
        if (wsMatchesData) {
            setMatchedLines(Array.isArray(wsMatchesData) ? wsMatchesData : []);
        }
        if (wsMatchesError) {
            showToast('error', 'Erreur', wsMatchesError.message || 'Erreur de chargement des correspondances');
        }
    }, [wsMatchesData, wsMatchesError]);

    // Handle workspace ecarts data
    useEffect(() => {
        if (wsEcartsData) {
            setEcarts(Array.isArray(wsEcartsData) ? wsEcartsData : []);
        }
        if (wsEcartsError) {
            showToast('error', 'Erreur', wsEcartsError.message || 'Erreur de chargement des écarts');
        }
    }, [wsEcartsData, wsEcartsError]);

    // Handle workspace detail data
    useEffect(() => {
        if (wsDetailData) {
            setSelectedRapprochement(wsDetailData as RapprochementBancaire);
            setLoadingWorkspace(false);
        }
        if (wsDetailError) {
            setLoadingWorkspace(false);
        }
    }, [wsDetailData, wsDetailError]);

    // Handle workspace book-balance preview (for the état de rapprochement)
    useEffect(() => {
        if (wsSoldeData) setWsSoldePreview(wsSoldeData);
    }, [wsSoldeData]);

    // Handle internal account movements (relevé du compte interne — read-only comparison)
    useEffect(() => {
        if (wsMvtData) setInternalMovements(Array.isArray(wsMvtData) ? wsMvtData : []);
    }, [wsMvtData]);

    // Handle auto-reconcile response
    useEffect(() => {
        if (wsReconcileData) {
            setAutoReconcileResult(wsReconcileData);
            showToast('success', 'Rapprochement automatique',
                `${(wsReconcileData as any).matchCount || 0} correspondances trouvées, ${(wsReconcileData as any).ecartCount || 0} écarts détectés`);
            setLoadingReconcile(false);
            if (selectedRapprochement?.id) {
                loadWorkspaceData(selectedRapprochement.id);
                loadRapprochements();
            }
        }
        if (wsReconcileError) {
            setLoadingReconcile(false);
            showToast('error', 'Erreur', wsReconcileError.message || 'Erreur lors du rapprochement automatique');
        }
    }, [wsReconcileData, wsReconcileError]);

    // Handle manual match / unmatch response
    useEffect(() => {
        if (wsManualData) {
            if (wsManualCallType === 'manualMatch') {
                showToast('success', 'Succès', 'Correspondance manuelle créée');
                setSelectedLigneBanque(null);
                setSelectedEcriture(null);
            } else if (wsManualCallType === 'unmatch') {
                showToast('success', 'Succès', 'Correspondance supprimée');
            }
            if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id);
        }
        if (wsManualError) {
            showToast('error', 'Erreur', wsManualError.message || 'Erreur');
        }
    }, [wsManualData, wsManualError, wsManualCallType]);

    const loadRapprochements = () => {
        fetchRapprochements(null, 'GET', `${BASE_URL}/findall`, 'loadRapprochements');
    };

    const loadReleves = () => {
        fetchReleves(null, 'GET', `${RELEVES_URL}/findall`, 'loadReleves');
    };

    const loadInternalAccounts = () => {
        fetchComptes(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findactive`, 'loadInternalAccounts');
    };

    const loadJournaux = () => {
        fetchJournaux(null, 'GET', `${JOURNAUX_URL}/findall`, 'loadJournaux');
    };

    // Internal accounts on the BQ (bank) journal — the only valid bank accounts for reconciliation
    const bqJournalIds = journaux
        .filter((j: any) => String(j.codeJournal).toUpperCase() === 'BQ')
        .map((j: any) => String(j.journalId));
    const bankAccounts = internalAccounts.filter(
        (a: any) => a.compteComptableId != null && bqJournalIds.includes(String(a.journalId))
    );

    const loadWorkspaceData = (rapprochementId: number) => {
        setLoadingWorkspace(true);
        // Load rapprochement detail
        fetchWsDetail(null, 'GET', `${BASE_URL}/findbyid/${rapprochementId}`, 'loadDetail');

        // Load lignes bancaires
        const rap = rapprochements.find(r => r.id === rapprochementId) || selectedRapprochement;
        if (rap?.releveBancaire?.id) {
            fetchWsLignes(null, 'GET', `${RELEVES_URL}/lignes/${rap.releveBancaire.id}`, 'loadLignes');
        }

        // Load matches
        fetchWsMatches(null, 'GET', `${BASE_URL}/matches/${rapprochementId}`, 'loadMatches');

        // Load ecarts
        fetchWsEcarts(null, 'GET', `${BASE_URL}/ecarts/${rapprochementId}`, 'loadEcarts');

        // Load unreconciled ecritures + book-balance preview (for the état de rapprochement)
        if (rap?.compteComptableId) {
            fetchWsEcritures(null, 'GET', `${BASE_URL}/ecritures-non-rapprochees?compteId=${rap.compteComptableId}&mois=${rap.mois}&annee=${rap.annee}`, 'loadEcritures');
            fetchWsSolde(null, 'GET', `${BASE_URL}/solde-comptable?compteId=${rap.compteComptableId}&mois=${rap.mois}&annee=${rap.annee}`, 'loadWsSolde');

            // Relevé du compte interne (mouvements) — read-only comparison side
            const acc = internalAccounts.find((a: any) => a.compteComptableId === rap.compteComptableId);
            if (acc?.accountId && rap.mois && rap.annee) {
                const dateFrom = `${rap.annee}-${String(rap.mois).padStart(2, '0')}-01`;
                const lastDay = new Date(rap.annee, rap.mois, 0).getDate();
                const dateTo = `${rap.annee}-${String(rap.mois).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                fetchWsMvt(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/mouvements/${acc.accountId}?dateFrom=${dateFrom}&dateTo=${dateTo}`, 'loadMvt');
            }
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
        setSelectedLigneBanque(null);
        setSelectedEcriture(null);
        setLignesBanque([]);
        setEcrituresComptables([]);
        setMatchedLines([]);
        setEcarts([]);
        setWsSoldePreview(null);
        setInternalMovements([]);
        if (rowData.id) loadWorkspaceData(rowData.id);
        setWorkspaceVisible(true);
    };

    const getEcartTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            'CHEQUE_NON_DEBITE': 'Chèque non encaissé',
            'VIREMENT_EN_COURS': 'Virement / dépôt en transit',
            'FRAIS_BANCAIRES': 'Frais bancaires / agios',
            'ERREUR_SAISIE': 'Erreur de saisie',
            'AUTRE': 'Autre'
        };
        return labels[type] || type;
    };

    const handleAutoReconcile = () => {
        if (!selectedRapprochement?.id) return;
        setLoadingReconcile(true);
        fetchWsReconcile({ userAction: getUserAction() }, 'POST', `${BASE_URL}/auto-reconcile/${selectedRapprochement.id}`, 'autoReconcile');
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
        fetchWsManual(body, 'POST', `${BASE_URL}/match-manual`, 'manualMatch');
    };

    const handleUnmatch = (match: LigneRapprochement) => {
        confirmDialog({
            message: 'Supprimer cette correspondance?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchWsManual(null, 'DELETE', `${BASE_URL}/unmatch/${match.id}`, 'unmatch');
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

    const getStatutSeverity = (statut: string): 'info' | 'warning' | 'success' | 'danger' | null => {
        const map: Record<string, 'info' | 'warning' | 'success' | 'danger' | null> = {
            'BROUILLON': null,
            'EN_COURS': 'warning',
            'TERMINE': 'info',
            'VALIDE': 'success'
        };
        return map[statut] || 'info';
    };

    const getStatutLabel = (statut: string): string => {
        const map: Record<string, string> = {
            'BROUILLON': 'Brouillon',
            'EN_COURS': 'En cours',
            'TERMINE': 'Terminé',
            'VALIDE': 'Validé'
        };
        return map[statut] || statut;
    };

    const statutBodyTemplate = (rowData: RapprochementBancaire) => (
        <Tag value={getStatutLabel(rowData.statut)} severity={getStatutSeverity(rowData.statut)} />
    );

    const ecartBodyTemplate = (rowData: RapprochementBancaire) => {
        const ecartVal = rowData.ecart || 0;
        return (
            <span className={ecartVal !== 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>
                {formatCurrency(ecartVal)}
            </span>
        );
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
            {rowData.statut !== 'VALIDE' && can('RAPPROCHEMENT_UPDATE') && (
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            )}
            {rowData.statut === 'BROUILLON' && can('RAPPROCHEMENT_DELETE') && (
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
            )}
        </div>
    );

    const releveOptionTemplate = (option: ReleveBancaire) => (
        <span>{option.nomBanque} - {option.numeroCompte} ({getMoisLabel(option.moisReleve)} {option.anneeReleve})</span>
    );

    const compteOptionTemplate = (option: any) => (
        <span>{option.codeCompte} - {option.libelle} <span className="text-500">({formatCurrency(option.soldeActuel)})</span></span>
    );

    const lignesBanqueNonRapprochees = lignesBanque.filter(l => !l.rapprochee);
    const lignesBanqueRapprochees = lignesBanque.filter(l => l.rapprochee).length;
    const ecartsNonResolus = ecarts.filter(e => !e.resolu).length;

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h2><i className="pi pi-check-circle mr-2"></i>Rapprochements Bancaires</h2>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Rapprochement" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-3">
                        <h5 className="mb-3">
                            <i className="pi pi-folder mr-2"></i>
                            Informations du rapprochement
                        </h5>
                        <div className="p-fluid formgrid grid">
                            <div className="field col-12 md:col-6">
                                <label htmlFor="releveBancaireId" className="font-semibold">Relevé bancaire *</label>
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
                                <label htmlFor="compteComptableId" className="font-semibold">Compte bancaire (compte interne - Journal BQ) *</label>
                                <Dropdown
                                    id="compteComptableId"
                                    value={rapprochement.compteComptableId}
                                    options={bankAccounts}
                                    onChange={(e) => {
                                        const selectedCompte = bankAccounts.find((c: any) => c.compteComptableId === e.value);
                                        setRapprochement({
                                            ...rapprochement,
                                            compteComptableId: e.value,
                                            codeCompte: selectedCompte?.codeCompte || ''
                                        });
                                    }}
                                    optionLabel="libelle"
                                    optionValue="compteComptableId"
                                    itemTemplate={compteOptionTemplate}
                                    placeholder="Sélectionner un compte bancaire (BQ)"
                                    emptyMessage="Aucun compte interne sur le journal BQ"
                                    filter
                                    filterBy="codeCompte,libelle"
                                    showClear
                                />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label htmlFor="mois" className="font-semibold">Mois *</label>
                                <Dropdown id="mois" value={rapprochement.mois} options={MOIS_OPTIONS} onChange={(e) => setRapprochement({ ...rapprochement, mois: e.value })} placeholder="Mois" />
                            </div>
                            <div className="field col-12 md:col-3">
                                <label htmlFor="annee" className="font-semibold">Année *</label>
                                <InputNumber id="annee" value={rapprochement.annee} onValueChange={(e) => setRapprochement({ ...rapprochement, annee: e.value || new Date().getFullYear() })} useGrouping={false} />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label htmlFor="notes" className="font-semibold">Notes</label>
                                <InputTextarea id="notes" value={rapprochement.notes} onChange={(e) => setRapprochement({ ...rapprochement, notes: e.target.value })} rows={2} />
                            </div>
                        </div>
                    </div>

                    {/* Book-balance preview from the BQ bank account's accounting entries */}
                    {soldePreview && (
                        <div className="surface-100 p-3 border-round mb-3">
                            <h5 className="mb-3"><i className="pi pi-book mr-2"></i>Aperçu comptable (Journal BQ) — {getMoisLabel(rapprochement.mois)} {rapprochement.annee}</h5>
                            <div className="grid">
                                <div className="col-6 md:col-3">
                                    <div className="surface-card p-3 border-round shadow-1 text-center">
                                        <div className="text-500 mb-1 text-sm">Solde comptable (livre)</div>
                                        <div className="text-lg font-bold">{formatCurrency(soldePreview.soldeComptable)}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-card p-3 border-round shadow-1 text-center">
                                        <div className="text-500 mb-1 text-sm">Solde banque (relevé)</div>
                                        <div className="text-lg font-bold">{formatCurrency(releves.find(r => r.id === rapprochement.releveBancaireId)?.soldeFin)}</div>
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-card p-3 border-round shadow-1 text-center">
                                        <div className="text-500 mb-1 text-sm">Écart prévisionnel</div>
                                        {(() => {
                                            const soldeBanque = releves.find(r => r.id === rapprochement.releveBancaireId)?.soldeFin || 0;
                                            const ecart = soldeBanque - (soldePreview.soldeComptable || 0);
                                            return <div className={`text-lg font-bold ${Math.abs(ecart) > 0.01 ? 'text-red-500' : 'text-green-500'}`}>{formatCurrency(ecart)}</div>;
                                        })()}
                                    </div>
                                </div>
                                <div className="col-6 md:col-3">
                                    <div className="surface-card p-3 border-round shadow-1 text-center">
                                        <div className="text-500 mb-1 text-sm">Écritures non rapprochées</div>
                                        <div className="text-lg font-bold">{soldePreview.nbNonRapprochees}</div>
                                        <div className="text-xs text-500">Mouv: déb {formatCurrency(soldePreview.totalDebitPeriode)} / créd {formatCurrency(soldePreview.totalCreditPeriode)}</div>
                                    </div>
                                </div>
                            </div>
                            <small className="text-500">Le solde comptable est le solde du compte interne (BQ) à la fin de la période, calculé à partir des écritures comptables. Aucune donnée n'est modifiée.</small>
                        </div>
                    )}

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
                        <Column header="N° Compte" body={(row) => row.releveBancaire?.numeroCompte || '-'} />
                        <Column header="Période" body={(row) => `${getMoisLabel(row.mois)} ${row.annee}`} />
                        <Column field="soldeBanque" header="Solde Banque" body={(row) => formatCurrency(row.soldeBanque)} sortable />
                        <Column field="soldeComptable" header="Solde Comptable" body={(row) => formatCurrency(row.soldeComptable)} sortable />
                        <Column field="ecart" header="Écart" body={ecartBodyTemplate} sortable />
                        <Column header="Statut" body={statutBodyTemplate} sortable sortField="statut" />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Reconciliation Workspace Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-cog"></i>
                        <span>Espace de rapprochement - {selectedRapprochement?.reference || ''}</span>
                        {selectedRapprochement && statutBodyTemplate(selectedRapprochement)}
                    </div>
                }
                visible={workspaceVisible}
                style={{ width: '95vw' }}
                onHide={() => setWorkspaceVisible(false)}
                maximizable
            >
                {selectedRapprochement && (
                    <div>
                        {loadingWorkspace && <ProgressBar mode="indeterminate" className="mb-3" />}

                        {/* Summary cards */}
                        <div className="grid mb-3">
                            <div className="col-12 md:col-2">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-500 mb-1 text-sm">Lignes Banque</div>
                                    <div className="text-xl font-bold">{lignesBanque.length}</div>
                                    <div className="text-xs text-500">{lignesBanqueRapprochees} rapprochées</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-2">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-500 mb-1 text-sm">Correspondances</div>
                                    <div className="text-xl font-bold text-green-500">{matchedLines.length}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-2">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-500 mb-1 text-sm">Écarts</div>
                                    <div className={`text-xl font-bold ${ecartsNonResolus > 0 ? 'text-orange-500' : 'text-green-500'}`}>{ecarts.length}</div>
                                    <div className="text-xs text-500">{ecartsNonResolus} non résolu(s)</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-500 mb-1 text-sm">Solde Banque</div>
                                    <div className="text-lg font-bold">{formatCurrency(selectedRapprochement.soldeBanque)}</div>
                                </div>
                            </div>
                            <div className="col-12 md:col-3">
                                <div className="surface-card p-3 border-round shadow-1 text-center">
                                    <div className="text-500 mb-1 text-sm">Écart</div>
                                    <div className={`text-lg font-bold ${selectedRapprochement.ecart !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {formatCurrency(selectedRapprochement.ecart)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mb-3 flex-wrap">
                            {selectedRapprochement.statut !== 'VALIDE' && can('RAPPROCHEMENT_RECONCILE') && (
                                <Button
                                    label="Rapprochement automatique"
                                    icon="pi pi-bolt"
                                    onClick={handleAutoReconcile}
                                    loading={loadingReconcile}
                                />
                            )}
                            {selectedRapprochement.statut !== 'VALIDE' && can('RAPPROCHEMENT_RECONCILE') && (
                                <Button
                                    label="Correspondance manuelle"
                                    icon="pi pi-link"
                                    severity="info"
                                    onClick={handleManualMatch}
                                    disabled={!selectedLigneBanque || !selectedEcriture}
                                />
                            )}
                            <Button
                                label="Rafraîchir"
                                icon="pi pi-refresh"
                                severity="secondary"
                                outlined
                                onClick={() => { if (selectedRapprochement?.id) loadWorkspaceData(selectedRapprochement.id); }}
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
                            <div className="surface-card p-3 border-round shadow-1 mb-3 border-left-3 border-blue-500">
                                <i className="pi pi-info-circle mr-2 text-blue-500"></i>
                                <strong>Résultat du rapprochement automatique:</strong>{' '}
                                {autoReconcileResult.matchCount} correspondances trouvées sur {autoReconcileResult.totalLignesBanque} lignes bancaires
                                et {autoReconcileResult.totalEcritures} écritures. {autoReconcileResult.ecartCount} écarts détectés.
                            </div>
                        )}

                        {/* Read-only comparison: relevé bancaire vs relevé du compte interne (mouvements) */}
                        {(() => {
                            const totalEntrees = internalMovements.reduce((s: number, m: any) => s + (m.entree || 0), 0);
                            const totalSorties = internalMovements.reduce((s: number, m: any) => s + (m.sortie || 0), 0);
                            const soldeInterne = internalMovements.length > 0
                                ? (internalMovements[internalMovements.length - 1].soldeApres ?? 0)
                                : (wsSoldePreview?.soldeFin ?? 0);
                            const soldeBanque = selectedRapprochement.soldeBanque || 0;
                            const ecartComparatif = soldeBanque - soldeInterne;
                            return (
                                <div className="mb-3">
                                    <div className="surface-100 p-2 border-round mb-2 flex align-items-center justify-content-between">
                                        <h5 className="m-0"><i className="pi pi-sync mr-2 text-primary"></i>Relevé du compte interne (mouvements) — {getMoisLabel(selectedRapprochement.mois)} {selectedRapprochement.annee}</h5>
                                        <div className="flex gap-3 align-items-center text-sm">
                                            <span>Solde banque: <strong>{formatCurrency(soldeBanque)}</strong></span>
                                            <span>Solde compte interne: <strong>{formatCurrency(soldeInterne)}</strong></span>
                                            <Tag value={`Écart: ${formatCurrency(ecartComparatif)}`} severity={Math.abs(ecartComparatif) < 0.01 ? 'success' : 'danger'} />
                                        </div>
                                    </div>
                                    <DataTable
                                        value={internalMovements}
                                        paginator
                                        rows={5}
                                        className="p-datatable-sm"
                                        emptyMessage="Aucun mouvement du compte interne pour cette période"
                                        scrollable
                                        scrollHeight="260px"
                                        stripedRows
                                    >
                                        <Column field="date" header="Date" body={(row) => formatDate(row.date)} style={{ width: '12%' }} />
                                        <Column field="operationType" header="Type" style={{ width: '14%' }} />
                                        <Column field="reference" header="Réf" style={{ width: '14%' }} />
                                        <Column field="libelle" header="Libellé" />
                                        <Column header="Entrée" body={(row) => (row.entree || 0) > 0 ? <span className="text-green-500">{formatCurrency(row.entree)}</span> : '-'} style={{ width: '12%' }} />
                                        <Column header="Sortie" body={(row) => (row.sortie || 0) > 0 ? <span className="text-red-500">{formatCurrency(row.sortie)}</span> : '-'} style={{ width: '12%' }} />
                                        <Column header="Solde" body={(row) => formatCurrency(row.soldeApres)} style={{ width: '12%' }} />
                                    </DataTable>
                                    <div className="text-500 text-sm mt-1">Total entrées: <strong className="text-green-600">{formatCurrency(totalEntrees)}</strong> · Total sorties: <strong className="text-red-500">{formatCurrency(totalSorties)}</strong> · Vue lecture seule (comparaison).</div>
                                </div>
                            );
                        })()}

                        <Divider />

                        {/* Split view: Bank lines vs Accounting entries */}
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="surface-100 p-2 border-round mb-2">
                                    <h5 className="m-0"><i className="pi pi-building mr-2"></i>Lignes bancaires non rapprochées ({lignesBanqueNonRapprochees.length})</h5>
                                </div>
                                <DataTable
                                    value={lignesBanqueNonRapprochees}
                                    selection={selectedLigneBanque}
                                    onSelectionChange={(e) => setSelectedLigneBanque(e.value as LigneReleve)}
                                    selectionMode="single"
                                    paginator
                                    rows={5}
                                    className="p-datatable-sm"
                                    emptyMessage="Toutes les lignes sont rapprochées"
                                    scrollable
                                    scrollHeight="300px"
                                    stripedRows
                                >
                                    <Column selectionMode="single" style={{ width: '3em' }} />
                                    <Column field="dateOperation" header="Date" body={(row) => formatDate(row.dateOperation)} style={{ width: '15%' }} />
                                    <Column field="reference" header="Réf" style={{ width: '15%' }} />
                                    <Column field="description" header="Description" />
                                    <Column header="Débit" body={(row) => row.montantDebit > 0 ? <span className="text-red-500">{formatCurrency(row.montantDebit)}</span> : '-'} style={{ width: '15%' }} />
                                    <Column header="Crédit" body={(row) => row.montantCredit > 0 ? <span className="text-green-500">{formatCurrency(row.montantCredit)}</span> : '-'} style={{ width: '15%' }} />
                                </DataTable>
                            </div>
                            <div className="col-12 md:col-6">
                                <div className="surface-100 p-2 border-round mb-2">
                                    <h5 className="m-0">
                                        <i className="pi pi-book mr-2"></i>
                                        Écritures comptables non rapprochées ({ecrituresComptables.length})
                                        {selectedRapprochement.codeCompte && <span className="text-sm text-500 ml-2">Compte: {selectedRapprochement.codeCompte}</span>}
                                    </h5>
                                </div>
                                <DataTable
                                    value={ecrituresComptables}
                                    selection={selectedEcriture}
                                    onSelectionChange={(e) => setSelectedEcriture(e.value as CptEcriture)}
                                    selectionMode="single"
                                    dataKey="ecritureId"
                                    paginator
                                    rows={5}
                                    className="p-datatable-sm"
                                    emptyMessage="Aucune écriture non rapprochée trouvée pour ce compte et cette période"
                                    scrollable
                                    scrollHeight="300px"
                                    stripedRows
                                >
                                    <Column selectionMode="single" style={{ width: '3em' }} />
                                    <Column field="dateEcriture" header="Date" body={(row) => formatDate(row.dateEcriture)} style={{ width: '12%' }} />
                                    <Column field="numeroPiece" header="N° Pièce" style={{ width: '10%' }} />
                                    <Column field="codeJournal" header="Journal" style={{ width: '8%' }} />
                                    <Column field="reference" header="Réf" style={{ width: '10%' }} />
                                    <Column field="libelle" header="Libellé" />
                                    <Column header="Débit" body={(row) => (row.debit || 0) > 0 ? <span className="text-red-500">{formatCurrency(row.debit)}</span> : '-'} style={{ width: '12%' }} />
                                    <Column header="Crédit" body={(row) => (row.credit || 0) > 0 ? <span className="text-green-500">{formatCurrency(row.credit)}</span> : '-'} style={{ width: '12%' }} />
                                </DataTable>
                            </div>
                        </div>

                        <Divider />

                        {/* Matched lines */}
                        <div className="surface-100 p-2 border-round mb-2">
                            <h5 className="m-0"><i className="pi pi-check-circle mr-2 text-green-500"></i>Correspondances ({matchedLines.length})</h5>
                        </div>
                        <DataTable
                            value={matchedLines}
                            paginator
                            rows={5}
                            className="p-datatable-sm"
                            emptyMessage="Aucune correspondance"
                            stripedRows
                        >
                            <Column field="ligneReleveId" header="Ligne Bancaire ID" />
                            <Column field="ecritureId" header="Écriture ID" />
                            <Column field="typeMatch" header="Type" body={(row) => <Tag value={row.typeMatch === 'AUTO' ? 'Automatique' : 'Manuel'} severity={row.typeMatch === 'AUTO' ? 'info' : 'warning'} />} />
                            <Column field="confiance" header="Confiance" body={(row) => (
                                <div className="flex align-items-center gap-2">
                                    <ProgressBar value={row.confiance} showValue={false} style={{ width: '60px', height: '8px' }} />
                                    <span>{row.confiance}%</span>
                                </div>
                            )} />
                            <Column field="notes" header="Notes" />
                            <Column header="" body={(row) => (
                                selectedRapprochement.statut !== 'VALIDE' && (
                                    <Button icon="pi pi-times" rounded text severity="danger" onClick={() => handleUnmatch(row)} tooltip="Supprimer la correspondance" />
                                )
                            )} style={{ width: '80px' }} />
                        </DataTable>

                        <Divider />

                        {/* Ecarts */}
                        <div className="surface-100 p-2 border-round mb-2">
                            <h5 className="m-0"><i className="pi pi-exclamation-triangle mr-2 text-orange-500"></i>Écarts ({ecarts.length})</h5>
                        </div>
                        <DataTable
                            value={ecarts}
                            paginator
                            rows={5}
                            className="p-datatable-sm"
                            emptyMessage="Aucun écart"
                            stripedRows
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
                            <Column field="justification" header="Justification" body={(row) => row.justification || <span className="text-500 font-italic">Non justifié</span>} />
                            <Column field="resolu" header="Statut" body={(row) => <Tag value={row.resolu ? 'Résolu' : 'Non résolu'} severity={row.resolu ? 'success' : 'danger'} />} />
                        </DataTable>

                        <Divider />

                        {/* État de Rapprochement Bancaire — two-column statement */}
                        {(() => {
                            const soldeBanque = selectedRapprochement.soldeBanque || 0;
                            const soldeComptable = (wsSoldePreview?.soldeComptable != null)
                                ? wsSoldePreview.soldeComptable
                                : (selectedRapprochement.soldeComptable || 0);
                            // Accounting-only items (écart has an ecritureId) adjust the BANK column
                            const bankAdj = ecarts.filter(e => e.ecritureId != null);
                            // Bank-only items (écart has a ligneReleveId) adjust the IMF column
                            const imfAdj = ecarts.filter(e => e.ligneReleveId != null);
                            const sumBankAdj = bankAdj.reduce((s, e) => s + (e.montant || 0), 0);
                            const sumImfAdj = imfAdj.reduce((s, e) => s + (e.montant || 0), 0);
                            const soldeBanqueRapproche = soldeBanque + sumBankAdj;
                            const soldeComptableRapproche = soldeComptable + sumImfAdj;
                            const equilibre = Math.abs(soldeBanqueRapproche - soldeComptableRapproche) < 0.01;
                            return (
                                <div>
                                    <div className="surface-100 p-2 border-round mb-2 flex align-items-center justify-content-between">
                                        <h5 className="m-0"><i className="pi pi-file-edit mr-2 text-primary"></i>État de Rapprochement Bancaire — {getMoisLabel(selectedRapprochement.mois)} {selectedRapprochement.annee}</h5>
                                        <Tag value={equilibre ? 'Équilibré' : 'Non équilibré'} severity={equilibre ? 'success' : 'danger'} icon={equilibre ? 'pi pi-check' : 'pi pi-times'} />
                                    </div>
                                    <div className="grid">
                                        {/* Côté Banque */}
                                        <div className="col-12 md:col-6">
                                            <div className="surface-card p-3 border-round shadow-1 h-full">
                                                <h6 className="mt-0 mb-3"><i className="pi pi-building mr-2"></i>Côté Banque (Relevé)</h6>
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="font-semibold">Solde du relevé bancaire</span>
                                                    <span className="font-bold">{formatCurrency(soldeBanque)}</span>
                                                </div>
                                                <div className="text-500 text-sm mb-1">Ajustements (opérations comptabilisées par l'IMF, pas encore à la banque)</div>
                                                {bankAdj.length === 0 && <div className="text-500 font-italic text-sm mb-2">Aucun</div>}
                                                {bankAdj.map((e, i) => (
                                                    <div key={i} className="flex justify-content-between text-sm mb-1">
                                                        <span>{getEcartTypeLabel(e.typeEcart)}{e.description ? ` — ${e.description}` : ''}</span>
                                                        <span className={e.montant >= 0 ? 'text-green-600' : 'text-red-500'}>{e.montant >= 0 ? '+' : ''}{formatCurrency(e.montant)}</span>
                                                    </div>
                                                ))}
                                                <Divider />
                                                <div className="flex justify-content-between">
                                                    <span className="font-bold">Solde rapproché</span>
                                                    <span className="font-bold text-lg">{formatCurrency(soldeBanqueRapproche)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Côté IMF */}
                                        <div className="col-12 md:col-6">
                                            <div className="surface-card p-3 border-round shadow-1 h-full">
                                                <h6 className="mt-0 mb-3"><i className="pi pi-book mr-2"></i>Côté IMF (Comptabilité - Journal BQ)</h6>
                                                <div className="flex justify-content-between mb-2">
                                                    <span className="font-semibold">Solde comptable (livre)</span>
                                                    <span className="font-bold">{formatCurrency(soldeComptable)}</span>
                                                </div>
                                                <div className="text-500 text-sm mb-1">Ajustements (opérations à la banque, pas encore enregistrées par l'IMF)</div>
                                                {imfAdj.length === 0 && <div className="text-500 font-italic text-sm mb-2">Aucun</div>}
                                                {imfAdj.map((e, i) => (
                                                    <div key={i} className="flex justify-content-between text-sm mb-1">
                                                        <span>{getEcartTypeLabel(e.typeEcart)}{e.description ? ` — ${e.description}` : ''}</span>
                                                        <span className={e.montant >= 0 ? 'text-green-600' : 'text-red-500'}>{e.montant >= 0 ? '+' : ''}{formatCurrency(e.montant)}</span>
                                                    </div>
                                                ))}
                                                <Divider />
                                                <div className="flex justify-content-between">
                                                    <span className="font-bold">Solde rapproché</span>
                                                    <span className="font-bold text-lg">{formatCurrency(soldeComptableRapproche)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {!equilibre && (
                                        <div className="mt-2 p-2 border-round bg-orange-50" style={{ border: '1px solid #fb923c' }}>
                                            <i className="pi pi-exclamation-triangle text-orange-500 mr-2"></i>
                                            <span className="text-700">Les deux soldes rapprochés diffèrent de <strong>{formatCurrency(Math.abs(soldeBanqueRapproche - soldeComptableRapproche))}</strong>. Il reste des écarts à identifier ou à justifier (frais bancaires/intérêts non saisis, dépôts en transit, chèques non encaissés, erreurs de saisie).</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                )}
            </Dialog>

            {/* Validate Dialog */}
            <Dialog
                header="Validation du comptable"
                visible={validateDialogVisible}
                style={{ width: '450px' }}
                onHide={() => { setValidateDialogVisible(false); setSignatureInput(''); }}
                footer={
                    <div className="flex gap-2 justify-content-end">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => { setValidateDialogVisible(false); setSignatureInput(''); }} />
                        <Button label="Valider" icon="pi pi-check" severity="success" onClick={handleValidate} disabled={!signatureInput} />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-600 mb-3">En validant, vous confirmez que ce rapprochement a été vérifié et est conforme.</p>
                    <label htmlFor="comptableSignature" className="font-semibold">Nom du comptable (signature) *</label>
                    <InputText id="comptableSignature" value={signatureInput} onChange={(e) => setSignatureInput(e.target.value)} placeholder="Entrez votre nom" className="mt-2" />
                </div>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog
                header="Approbation du directeur financier"
                visible={approveDialogVisible}
                style={{ width: '450px' }}
                onHide={() => { setApproveDialogVisible(false); setSignatureInput(''); }}
                footer={
                    <div className="flex gap-2 justify-content-end">
                        <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={() => { setApproveDialogVisible(false); setSignatureInput(''); }} />
                        <Button label="Approuver" icon="pi pi-verified" severity="success" onClick={handleApprove} disabled={!signatureInput} />
                    </div>
                }
            >
                <div className="p-fluid">
                    <p className="text-600 mb-3">En approuvant, vous donnez votre visa final. Le rapprochement sera verrouillé.</p>
                    <label htmlFor="directeurSignature" className="font-semibold">Nom du directeur financier (visa) *</label>
                    <InputText id="directeurSignature" value={signatureInput} onChange={(e) => setSignatureInput(e.target.value)} placeholder="Entrez votre nom" className="mt-2" />
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
