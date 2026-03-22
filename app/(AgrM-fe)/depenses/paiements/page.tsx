'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import PrintableBonDeCaisse from './PrintableBonDeCaisse';
import PrintablePreuvePaiement from './PrintablePreuvePaiement';
import {
    DemandeDepense,
    CategorieDepense,
    ModePaiementDepense,
    BudgetDepense,
    STATUTS_DEMANDE_DEPENSE,
    MODES_PAIEMENT_DEPENSE
} from '../types/DepenseTypes';

const PaiementsDepensePage = () => {
    const [demandesApprouvees, setDemandesApprouvees] = useState<DemandeDepense[]>([]);
    const [demandesPayees, setDemandesPayees] = useState<DemandeDepense[]>([]);
    const [selectedDemande, setSelectedDemande] = useState<DemandeDepense | null>(null);
    const [modesPaiement, setModesPaiement] = useState<ModePaiementDepense[]>([]);
    const [categories, setCategories] = useState<CategorieDepense[]>([]);
    const [showHistoriqueDialog, setShowHistoriqueDialog] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');

    // Payment form state
    const [modePaiementId, setModePaiementId] = useState<string | number | null>(null);
    const [montantPaye, setMontantPaye] = useState<number>(0);
    const [datePaiement, setDatePaiement] = useState<string>(new Date().toISOString().split('T')[0]);
    const [referenceVirement, setReferenceVirement] = useState('');
    const [notesPaiement, setNotesPaiement] = useState('');
    const [typeCompte, setTypeCompte] = useState<string>('');
    const [compteDestination, setCompteDestination] = useState<number | null>(null);
    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [rawInternalAccounts, setRawInternalAccounts] = useState<any[]>([]);
    const [savingsAccounts, setSavingsAccounts] = useState<any[]>([]);

    // Dialogs
    const [showPaiementDialog, setShowPaiementDialog] = useState(false);
    const [showBonCaisseDialog, setShowBonCaisseDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: modesData, fetchData: fetchModes } = useConsumApi('');
    const { data: catData, fetchData: fetchCat } = useConsumApi('');
    const { data: intAccountsData, fetchData: fetchIntAccounts } = useConsumApi('');
    const { data: savAccountsData, fetchData: fetchSavAccounts } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');
    const { data: caissesData, fetchData: fetchCaisses } = useConsumApi('');
    const { data: budgetsData, fetchData: fetchBudgets } = useConsumApi('');

    const DEMANDES_URL = buildApiUrl('/api/depenses/demandes');
    const MODES_URL = buildApiUrl('/api/depenses/modes-paiement');
    const CATEGORIES_URL = buildApiUrl('/api/depenses/categories');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');
    const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');
    const CAISSES_URL = buildApiUrl('/api/depenses/petites-caisses');
    const BUDGETS_URL = buildApiUrl('/api/depenses/budgets');

    const [petitesCaisses, setPetitesCaisses] = useState<any[]>([]);
    const [budgets, setBudgets] = useState<BudgetDepense[]>([]);

    useEffect(() => {
        loadDemandes();
        loadModes();
        fetchCat(null, 'GET', `${CATEGORIES_URL}/findall`, 'loadCat');
        fetchIntAccounts(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadIntAccounts');
        fetchSavAccounts(null, 'GET', `${SAVINGS_ACCOUNTS_URL}/findall`, 'loadSavAccounts');
        fetchCaisses(null, 'GET', `${CAISSES_URL}/findall`, 'loadCaisses');
        fetchBudgets(null, 'GET', `${BUDGETS_URL}/findall`, 'loadBudgets');
    }, []);

    useEffect(() => {
        if (catData) setCategories(Array.isArray(catData) ? catData : catData.content || []);
    }, [catData]);

    useEffect(() => {
        if (intAccountsData) {
            const items = Array.isArray(intAccountsData) ? intAccountsData : intAccountsData.content || [];
            setRawInternalAccounts(items);
            setInternalAccounts(items.map((a: any) => ({ value: a.accountId, label: `${a.accountNumber} - ${a.libelle}` })));
        }
    }, [intAccountsData]);

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
            setPetitesCaisses(items);
        }
    }, [caissesData]);

    useEffect(() => {
        if (budgetsData) setBudgets(Array.isArray(budgetsData) ? budgetsData : budgetsData.content || []);
    }, [budgetsData]);

    useEffect(() => {
        if (listData) {
            const data = Array.isArray(listData) ? listData : listData.content || [];
            setDemandesApprouvees(data.filter((d: DemandeDepense) => d.status === 'APPROUVEE' || d.status === 'EN_PAIEMENT'));
            setDemandesPayees(data.filter((d: DemandeDepense) => d.status === 'PAYEE' || d.status === 'JUSTIFIEE' || d.status === 'CLOTUREE'));
        }
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (modesData) setModesPaiement(Array.isArray(modesData) ? modesData : modesData.content || []);
    }, [modesData]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'pay':
                    showToast('success', 'Succès', 'Paiement effectué avec succès');
                    setSelectedDemande(actionData);
                    setShowPaiementDialog(false);
                    setShowBonCaisseDialog(true);
                    loadDemandes();
                    break;
                case 'justify':
                    showToast('success', 'Succès', 'Justificatif enregistré');
                    loadDemandes(); break;
                case 'close':
                    showToast('success', 'Succès', 'Dépense clôturée');
                    loadDemandes(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadDemandes = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${DEMANDES_URL}/findbybranch/${branchId}` : `${DEMANDES_URL}/findall`;
        fetchList(null, 'GET', url, 'loadDemandes');
    };

    const loadModes = () => { fetchModes(null, 'GET', `${MODES_URL}/findallactive`, 'loadModes'); };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const openPaiementDialog = (demande: DemandeDepense) => {
        setSelectedDemande(demande);
        setMontantPaye(demande.montantEstimeFBU || 0);
        setModePaiementId(demande.modePaiementName || null);
        setDatePaiement(new Date().toISOString().split('T')[0]);
        setReferenceVirement('');
        setNotesPaiement('');
        setTypeCompte(demande.typeCompteDestination || '');
        setCompteDestination(demande.compteDestinationId || null);
        setShowPaiementDialog(true);
    };

    const handlePayer = () => {
        if (!selectedDemande || !modePaiementId || !montantPaye) {
            showToast('warn', 'Attention', 'Veuillez remplir le mode de paiement et le montant');
            return;
        }

        const isVirement = modePaiementId === 'VIREMENT_INTERNE' || modePaiementId === 'VIREMENT_BANCAIRE';
        if (isVirement && !compteDestination) {
            showToast('warn', 'Attention', 'Veuillez sélectionner le compte de destination');
            return;
        }
        const modeName = modesPaiement.length > 0
            ? modesPaiement.find(m => m.id === modePaiementId)?.nameFr || ''
            : MODES_PAIEMENT_DEPENSE.find(m => m.value === modePaiementId)?.label || '';
        const dataToSend = {
            modePaiementId: typeof modePaiementId === 'number' ? modePaiementId : null,
            modePaiementName: typeof modePaiementId === 'string' ? modePaiementId : modeName,
            montantPaye,
            datePaiement,
            referenceVirement,
            compteDestinationId: compteDestination,
            typeCompteDestination: typeCompte,
            notes: notesPaiement,
            userAction: getUserAction()
        };
        fetchAction(dataToSend, 'PUT', `${DEMANDES_URL}/pay/${selectedDemande.id}`, 'pay');
    };

    const handleJustifier = (demande: DemandeDepense) => {
        confirmDialog({
            message: `Marquer la dépense "${demande.numeroDemande}" comme justifiée ?`,
            header: 'Confirmation', icon: 'pi pi-check',
            acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => {
                fetchAction({ userAction: getUserAction() }, 'PUT', `${DEMANDES_URL}/justify/${demande.id}`, 'justify');
            }
        });
    };

    const handleCloturer = (demande: DemandeDepense) => {
        confirmDialog({
            message: `Clôturer la dépense "${demande.numeroDemande}" ?`,
            header: 'Confirmation', icon: 'pi pi-lock',
            acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => {
                fetchAction({ userAction: getUserAction() }, 'PUT', `${DEMANDES_URL}/close/${demande.id}`, 'close');
            }
        });
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML.replace(
                /src="\/layout\//g,
                `src="${window.location.origin}/layout/`
            );
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <!DOCTYPE html><html><head><title>${selectedDemande?.typeSource === 'COMPTE_INTERNE' ? 'Preuve de Paiement' : 'Recu'} - ${selectedDemande?.numeroBonCaisse || selectedDemande?.numeroDemande}</title>
                    <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: Arial, sans-serif; padding: 15mm; }
                    @page { margin: 15mm; } @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }</style>
                    </head><body>${printContent}</body></html>
                `);
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
            }
        }
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const dateBodyTemplate = (date: string | undefined) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    const statusBodyTemplate = (rowData: DemandeDepense) => {
        const severityMap: Record<string, any> = {
            'APPROUVEE': 'success', 'EN_PAIEMENT': 'info', 'PAYEE': 'success',
            'JUSTIFIEE': 'success', 'CLOTUREE': 'secondary'
        };
        const label = STATUTS_DEMANDE_DEPENSE.find(s => s.value === rowData.status)?.label || rowData.status;
        return <Tag value={label} severity={severityMap[rowData.status || ''] || 'info'} />;
    };

    const modePaiementBodyTemplate = (rowData: DemandeDepense) => {
        const mode = MODES_PAIEMENT_DEPENSE.find(m => m.value === rowData.modePaiementName);
        return <Tag value={mode?.label || rowData.modePaiementName || '-'} severity="info" />;
    };

    const approuvedActionsTemplate = (rowData: DemandeDepense) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }}
                onClick={() => { setSelectedDemande(rowData); setShowBonCaisseDialog(true); }} />
            <Button icon="pi pi-history" rounded text severity="help" tooltip="Historique Approbation" tooltipOptions={{ position: 'top' }}
                onClick={() => { setSelectedDemande(rowData); setShowHistoriqueDialog(true); }} />
            <Button icon="pi pi-money-bill" rounded text severity="success" tooltip="Payer" tooltipOptions={{ position: 'top' }}
                onClick={() => openPaiementDialog(rowData)} />
        </div>
    );

    const payedActionsTemplate = (rowData: DemandeDepense) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Détails" tooltipOptions={{ position: 'top' }}
                onClick={() => { setSelectedDemande(rowData); setShowDetailDialog(true); }} />
            <Button icon="pi pi-print" rounded text severity="help" tooltip="Recu" tooltipOptions={{ position: 'top' }}
                onClick={() => { setSelectedDemande(rowData); setShowBonCaisseDialog(true); }} />
            {rowData.status === 'PAYEE' && !rowData.justificatifFourni && (
                <Button icon="pi pi-file" rounded text severity="warning" tooltip="Justifier" tooltipOptions={{ position: 'top' }}
                    onClick={() => handleJustifier(rowData)} />
            )}
            {(rowData.status === 'JUSTIFIEE') && (
                <Button icon="pi pi-lock" rounded text severity="secondary" tooltip="Clôturer" tooltipOptions={{ position: 'top' }}
                    onClick={() => handleCloturer(rowData)} />
            )}
        </div>
    );

    const approuvedHeader = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-check-circle mr-2 text-green-500"></i>Dépenses Approuvées - En Attente de Paiement</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="A Payer" leftIcon="pi pi-money-bill mr-2" rightIcon={demandesApprouvees.length > 0 ? undefined : undefined}>
                    <DataTable value={demandesApprouvees} paginator rows={10} rowsPerPageOptions={[5, 10, 25]}
                        loading={loadingList} globalFilter={globalFilter} header={approuvedHeader}
                        emptyMessage="Aucune dépense en attente de paiement" className="p-datatable-sm"
                        sortField="dateDemande" sortOrder={-1}>
                        <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '12%' }} />
                        <Column field="dateDemande" header="Date" body={(row) => dateBodyTemplate(row.dateDemande)} sortable style={{ width: '8%' }} />
                        <Column header="Catégorie" sortable filter filterField="categorieDepenseName" body={(row) => row.categorieDepenseName || categories.find(c => c.id === row.categorieDepenseId)?.nameFr || '-'} style={{ width: '12%' }} />
                        <Column field="natureLibelle" header="Nature" sortable filter style={{ width: '18%' }} />
                        <Column field="beneficiaireFournisseur" header="Demandeur" sortable filter style={{ width: '15%' }} />
                        <Column header="Montant (FBU)" body={(row) => <span className="font-semibold text-primary">{currencyBodyTemplate(row.montantEstimeFBU)}</span>} sortable style={{ width: '13%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '10%' }} />
                        <Column header="Actions" body={approuvedActionsTemplate} style={{ width: '12%' }} />
                    </DataTable>
                </TabPanel>

                <TabPanel header="Payées" leftIcon="pi pi-check-circle mr-2">
                    <DataTable value={demandesPayees} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loadingList} globalFilter={globalFilter}
                        emptyMessage="Aucune dépense payée" className="p-datatable-sm"
                        sortField="datePaiement" sortOrder={-1}>
                        <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '10%' }} />
                        <Column field="numeroBonCaisse" header="N° Bon" sortable filter style={{ width: '10%' }} />
                        <Column field="datePaiement" header="Date Paiement" body={(row) => dateBodyTemplate(row.datePaiement)} sortable style={{ width: '10%' }} />
                        <Column header="Catégorie" body={(row) => row.categorieDepenseName || categories.find(c => c.id === row.categorieDepenseId)?.nameFr || '-'} sortable style={{ width: '10%' }} />
                        <Column field="natureLibelle" header="Nature" sortable filter style={{ width: '13%' }} />
                        <Column field="beneficiaireFournisseur" header="Demandeur" sortable style={{ width: '10%' }} />
                        <Column header="Montant Payé" body={(row) => currencyBodyTemplate(row.montantPaye)} sortable style={{ width: '12%' }} />
                        <Column header="Mode" body={modePaiementBodyTemplate} style={{ width: '10%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '8%' }} />
                        <Column header="Actions" body={payedActionsTemplate} style={{ width: '13%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Paiement Dialog */}
            <Dialog visible={showPaiementDialog} onHide={() => setShowPaiementDialog(false)}
                header={`Paiement - ${selectedDemande?.numeroDemande}`} style={{ width: '50vw' }} modal
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setShowPaiementDialog(false)} className="p-button-text" />
                        <Button label="Effectuer le Paiement" icon="pi pi-check" severity="success" onClick={handlePayer} loading={loadingAction} />
                    </div>
                }>
                <div className="mb-3 p-3 surface-100 border-round">
                    <div className="grid">
                        <div className="col-6"><small className="text-600">Nature:</small><p className="font-semibold">{selectedDemande?.natureLibelle}</p></div>
                        <div className="col-6"><small className="text-600">Demandeur:</small><p className="font-semibold">{selectedDemande?.beneficiaireFournisseur}</p></div>
                    </div>
                </div>

                {/* Résumé des comptes impactés */}
                {selectedDemande && (() => {
                    const cat = categories.find(c => c.id === selectedDemande.categorieDepenseId);
                    const catAcc = cat?.internalAccountId ? rawInternalAccounts.find(a => a.accountId === cat.internalAccountId) : null;
                    const isCompteInterne = selectedDemande.typeSource === 'COMPTE_INTERNE';
                    const isCaisse = selectedDemande.typeSource === 'CAISSE';

                    // Resolve source account: for COMPTE_INTERNE use directly, for CAISSE resolve via petiteCaisse.internalAccountId
                    let sourceAcc: any = null;
                    let sourceCaisse: any = null;
                    if (isCompteInterne && selectedDemande.compteSourceId) {
                        sourceAcc = rawInternalAccounts.find(a => a.accountId === selectedDemande.compteSourceId);
                    } else if (isCaisse && selectedDemande.compteSourceId) {
                        sourceCaisse = petitesCaisses.find(c => c.id === selectedDemande.compteSourceId);
                        if (sourceCaisse?.internalAccountId) {
                            sourceAcc = rawInternalAccounts.find(a => a.accountId === sourceCaisse.internalAccountId);
                        }
                    }
                    const isDestClient = selectedDemande.typeCompteDestination === 'CLIENT';
                    const isDestInterne = selectedDemande.typeCompteDestination === 'INTERNE';
                    const destAcc = selectedDemande.compteDestinationId ?
                        (isDestInterne ? rawInternalAccounts.find(a => a.accountId === selectedDemande.compteDestinationId) : null) : null;
                    const destSavAcc = selectedDemande.compteDestinationId && isDestClient ?
                        savingsAccounts.find(a => a.value === selectedDemande.compteDestinationId) : null;

                    return (
                        <div className="mb-3">
                            <h6 className="mt-0 mb-2"><i className="pi pi-sitemap mr-2"></i>Comptes Impactés par ce Paiement</h6>

                            {/* 1. Compte Principal Catégorie (accumule les dépenses = +) */}
                            {catAcc && (
                                <div className="mb-2 p-3 border-round border-1 border-blue-300" style={{ backgroundColor: '#f0f7ff' }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-bookmark text-blue-600"></i>
                                            <div>
                                                <small className="text-600 block">1. Compte Principal Catégorie - {cat?.nameFr}</small>
                                                <span className="font-semibold">{catAcc.accountNumber} - {catAcc.libelle}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <small className="text-600 block">Solde: {(catAcc.soldeActuel || 0).toLocaleString('fr-BI')} FBu</small>
                                            <span className="font-bold text-green-600">+ {montantPaye.toLocaleString('fr-BI')} FBu</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. Source - Compte Interne ou Caisse */}
                            {isCompteInterne && sourceAcc && (
                                <div className="mb-2 p-3 border-round border-1 border-orange-300" style={{ backgroundColor: '#fff8f0' }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-wallet text-orange-600"></i>
                                            <div>
                                                <small className="text-600 block">2. Compte Interne (Source)</small>
                                                <span className="font-semibold">{sourceAcc.accountNumber} - {sourceAcc.libelle}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <small className="text-600 block">Solde: {(sourceAcc.soldeActuel || 0).toLocaleString('fr-BI')} FBu</small>
                                            <span className="font-bold text-orange-600">- {montantPaye.toLocaleString('fr-BI')} FBu</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isCaisse && (
                                <div className="mb-2 p-3 border-round border-1 border-orange-300" style={{ backgroundColor: '#fff8f0' }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-inbox text-orange-600"></i>
                                            <div>
                                                <small className="text-600 block">2. Caisse (Source) - {sourceCaisse?.code || ''}</small>
                                                <span className="font-semibold">{sourceAcc ? `${sourceAcc.accountNumber} - ${sourceAcc.libelle}` : `Caisse ${sourceCaisse?.code || '#' + selectedDemande.compteSourceId}`}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <small className="text-600 block">Solde: {(sourceAcc?.soldeActuel || sourceCaisse?.soldeActuel || 0).toLocaleString('fr-BI')} FBu</small>
                                            <span className="font-bold text-orange-600">- {montantPaye.toLocaleString('fr-BI')} FBu</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Destination (only for COMPTE_INTERNE source) */}
                            {isCompteInterne && isDestInterne && destAcc && (
                                <div className="mb-2 p-3 border-round border-1 border-green-300" style={{ backgroundColor: '#f0fff4' }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-arrow-circle-down text-green-600"></i>
                                            <div>
                                                <small className="text-600 block">3. Compte Interne (Destination)</small>
                                                <span className="font-semibold">{destAcc.accountNumber} - {destAcc.libelle}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <small className="text-600 block">Solde: {(destAcc.soldeActuel || 0).toLocaleString('fr-BI')} FBu</small>
                                            <span className="font-bold text-green-600">+ {montantPaye.toLocaleString('fr-BI')} FBu</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {isCompteInterne && isDestClient && destSavAcc && (
                                <div className="mb-2 p-3 border-round border-1 border-green-300" style={{ backgroundColor: '#f0fff4' }}>
                                    <div className="flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-users text-green-600"></i>
                                            <div>
                                                <small className="text-600 block">3. Compte Épargne Client (Destination)</small>
                                                <span className="font-semibold">{destSavAcc.label}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-green-600">+ {montantPaye.toLocaleString('fr-BI')} FBu</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}

                {/* Budget */}
                {selectedDemande?.budgetId && (() => {
                    const bud = budgets.find(b => b.id === selectedDemande.budgetId);
                    if (!bud) return selectedDemande.budgetLibelle ? (
                        <div className="mb-3 p-3 border-round border-1 border-purple-300" style={{ backgroundColor: '#f8f0ff' }}>
                            <h6 className="mt-0 mb-1"><i className="pi pi-chart-bar mr-2 text-purple-600"></i>Budget: {selectedDemande.budgetLibelle}</h6>
                        </div>
                    ) : null;
                    const alloue = bud.montantAlloue || 0;
                    const depense = bud.montantDepense || 0;
                    const disponible = bud.montantDisponible || (alloue - depense);
                    const taux = alloue > 0 ? ((depense / alloue) * 100) : 0;
                    return (
                        <div className="mb-3 p-3 border-round border-1 border-purple-300" style={{ backgroundColor: '#f8f0ff' }}>
                            <h6 className="mt-0 mb-2"><i className="pi pi-chart-bar mr-2 text-purple-600"></i>Budget - {bud.libelle || bud.code}</h6>
                            <div className="grid">
                                <div className="col-6 md:col-3">
                                    <small className="text-600">Alloué</small>
                                    <p className="font-semibold mt-1 mb-0 text-blue-600">{(alloue).toLocaleString('fr-BI')} FBu</p>
                                </div>
                                <div className="col-6 md:col-3">
                                    <small className="text-600">Dépensé</small>
                                    <p className="font-semibold mt-1 mb-0 text-orange-600">{(depense).toLocaleString('fr-BI')} FBu</p>
                                </div>
                                <div className="col-6 md:col-3">
                                    <small className="text-600">Disponible</small>
                                    <p className={`font-bold mt-1 mb-0 ${disponible < 0 ? 'text-red-600' : 'text-green-600'}`}>{(disponible).toLocaleString('fr-BI')} FBu</p>
                                </div>
                                <div className="col-6 md:col-3">
                                    <small className="text-600">Taux</small>
                                    <p className="mt-1 mb-0">
                                        <Tag value={`${taux.toFixed(1)}%`} severity={taux >= 80 ? 'danger' : taux >= 50 ? 'warning' : 'success'} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {selectedDemande?.modePaiementName && (
                    <div className="mb-3 p-3 surface-50 border-round">
                        <h6 className="mt-0 mb-3"><i className="pi pi-info-circle mr-2"></i>Informations de Paiement (défini lors de l'approbation)</h6>
                        <div className="p-fluid formgrid grid">
                            {selectedDemande?.typeSource && (
                                <>
                                    <div className="field col-12 md:col-6">
                                        <label>Type de Source</label>
                                        <Dropdown value={selectedDemande.typeSource} options={[
                                            { label: 'Caisse', value: 'CAISSE' },
                                            { label: 'Compte Interne', value: 'COMPTE_INTERNE' }
                                        ]} disabled />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label>{selectedDemande.typeSource === 'CAISSE' ? 'Caisse' : 'Compte Interne'}</label>
                                        <InputText value={
                                            (() => {
                                                if (!selectedDemande.compteSourceId) return '-';
                                                if (selectedDemande.typeSource === 'CAISSE') {
                                                    const caisse = petitesCaisses.find(c => c.id === selectedDemande.compteSourceId);
                                                    if (caisse?.internalAccountId) {
                                                        const ia = rawInternalAccounts.find(a => a.accountId === caisse.internalAccountId);
                                                        if (ia) return `${ia.accountNumber} - ${ia.libelle}`;
                                                    }
                                                    return caisse ? `${caisse.code} - ${caisse.agenceName || ''}` : String(selectedDemande.compteSourceId);
                                                }
                                                const acc = internalAccounts.find(a => a.value === selectedDemande.compteSourceId);
                                                return acc?.label || String(selectedDemande.compteSourceId);
                                            })()
                                        } disabled />
                                    </div>
                                </>
                            )}
                            <div className="field col-12 md:col-6">
                                <label>Mode de Paiement</label>
                                <Dropdown value={selectedDemande.modePaiementName} options={MODES_PAIEMENT_DEPENSE}
                                    optionLabel="label" optionValue="value" disabled />
                            </div>
                            <div className="field col-12 md:col-6">
                                <label>Montant (FBU)</label>
                                <InputNumber value={montantPaye} disabled suffix=" FBu" />
                            </div>
                            {(selectedDemande.modePaiementName === 'VIREMENT_INTERNE' || selectedDemande.modePaiementName === 'VIREMENT_BANCAIRE') && (
                                <>
                                    <div className="field col-12 md:col-6">
                                        <label>Type de Compte</label>
                                        <Dropdown value={selectedDemande.typeCompteDestination} options={[
                                            { label: 'Compte Client (Épargne)', value: 'CLIENT' },
                                            { label: 'Compte Interne', value: 'INTERNE' }
                                        ]} disabled />
                                    </div>
                                    <div className="field col-12 md:col-6">
                                        <label>Compte de Destination</label>
                                        <Dropdown value={selectedDemande.compteDestinationId}
                                            options={selectedDemande.typeCompteDestination === 'CLIENT' ? savingsAccounts : internalAccounts}
                                            optionLabel="label" optionValue="value" disabled />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label>Date de Paiement</label>
                        <Calendar value={datePaiement ? new Date(datePaiement) : null}
                            onChange={(e) => setDatePaiement((e.value as Date)?.toISOString().split('T')[0] || '')} dateFormat="dd/mm/yy" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Référence (virement/chèque)</label>
                        <InputText value={referenceVirement} onChange={(e) => setReferenceVirement(e.target.value)} />
                    </div>
                    <div className="field col-12">
                        <label>Notes</label>
                        <InputTextarea value={notesPaiement} onChange={(e) => setNotesPaiement(e.target.value)} rows={3} />
                    </div>
                </div>
            </Dialog>

            {/* Historique Approbation Dialog */}
            <Dialog visible={showHistoriqueDialog} onHide={() => setShowHistoriqueDialog(false)}
                header={`Historique Approbation - ${selectedDemande?.numeroDemande}`} style={{ width: '55vw' }} modal
                footer={<Button label="Fermer" icon="pi pi-times" onClick={() => setShowHistoriqueDialog(false)} className="p-button-text" />}>
                {selectedDemande && (
                    <div>
                        <div className="mb-3 p-3 surface-100 border-round">
                            <div className="grid">
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Nature</small>
                                    <p className="font-semibold mt-1">{selectedDemande.natureLibelle}</p>
                                </div>
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Catégorie</small>
                                    <p className="font-semibold mt-1">{selectedDemande.categorieDepenseName || categories.find(c => c.id === selectedDemande.categorieDepenseId)?.nameFr || '-'}</p>
                                </div>
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Montant</small>
                                    <p className="font-semibold mt-1 text-primary">{currencyBodyTemplate(selectedDemande.montantEstimeFBU)}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid">
                            {selectedDemande.approbateurN1Name && (
                                <div className="col-12 md:col-4">
                                    <div className="p-3 surface-100 border-round">
                                        <Tag value="Niveau 1" severity="info" className="mb-2" />
                                        <p className="font-semibold mb-1">{selectedDemande.approbateurN1Name}</p>
                                        <small className="text-500">{selectedDemande.dateApprobationN1 ? new Date(selectedDemande.dateApprobationN1).toLocaleDateString('fr-FR') : ''}</small>
                                        {selectedDemande.commentaireN1 && <p className="text-sm text-600 mt-2">{selectedDemande.commentaireN1}</p>}
                                    </div>
                                </div>
                            )}
                            {selectedDemande.approbateurN2Name && (
                                <div className="col-12 md:col-4">
                                    <div className="p-3 surface-100 border-round">
                                        <Tag value="Niveau 2" severity="warning" className="mb-2" />
                                        <p className="font-semibold mb-1">{selectedDemande.approbateurN2Name}</p>
                                        <small className="text-500">{selectedDemande.dateApprobationN2 ? new Date(selectedDemande.dateApprobationN2).toLocaleDateString('fr-FR') : ''}</small>
                                        {selectedDemande.commentaireN2 && <p className="text-sm text-600 mt-2">{selectedDemande.commentaireN2}</p>}
                                    </div>
                                </div>
                            )}
                            {selectedDemande.approbateurN3Name && (
                                <div className="col-12 md:col-4">
                                    <div className="p-3 surface-100 border-round">
                                        <Tag value="Niveau 3" severity="success" className="mb-2" />
                                        <p className="font-semibold mb-1">{selectedDemande.approbateurN3Name}</p>
                                        <small className="text-500">{selectedDemande.dateApprobationN3 ? new Date(selectedDemande.dateApprobationN3).toLocaleDateString('fr-FR') : ''}</small>
                                        {selectedDemande.commentaireN3 && <p className="text-sm text-600 mt-2">{selectedDemande.commentaireN3}</p>}
                                    </div>
                                </div>
                            )}
                            {!selectedDemande.approbateurN1Name && !selectedDemande.approbateurN2Name && !selectedDemande.approbateurN3Name && (
                                <div className="col-12 text-center text-500 p-4">Aucun historique d'approbation disponible</div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Detail Dialog */}
            <Dialog visible={showDetailDialog} onHide={() => setShowDetailDialog(false)}
                header={`Détails - ${selectedDemande?.numeroDemande}`} style={{ width: '60vw' }} modal
                footer={<Button label="Fermer" icon="pi pi-times" onClick={() => setShowDetailDialog(false)} className="p-button-text" />}>
                {selectedDemande && (
                    <div>
                        <div className="p-3 surface-100 border-round mb-3">
                            <h6 className="mt-0 mb-3"><i className="pi pi-file mr-2"></i>Informations de la Demande</h6>
                            <div className="grid">
                                <div className="col-12 md:col-3">
                                    <small className="text-600">N° Demande</small>
                                    <p className="font-semibold mt-1">{selectedDemande.numeroDemande}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Date Demande</small>
                                    <p className="font-semibold mt-1">{dateBodyTemplate(selectedDemande.dateDemande)}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Catégorie</small>
                                    <p className="font-semibold mt-1">{selectedDemande.categorieDepenseName || categories.find(c => c.id === selectedDemande.categorieDepenseId)?.nameFr || '-'}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Nature</small>
                                    <p className="font-semibold mt-1">{selectedDemande.natureLibelle}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Demandeur</small>
                                    <p className="font-semibold mt-1">{selectedDemande.beneficiaireFournisseur}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Montant Estimé</small>
                                    <p className="font-semibold mt-1 text-primary">{currencyBodyTemplate(selectedDemande.montantEstimeFBU)}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Justification</small>
                                    <p className="font-semibold mt-1">{selectedDemande.justification || '-'}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Statut</small>
                                    <p className="mt-1">{statusBodyTemplate(selectedDemande)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 surface-100 border-round mb-3">
                            <h6 className="mt-0 mb-3"><i className="pi pi-credit-card mr-2"></i>Informations de Paiement</h6>
                            <div className="grid">
                                {selectedDemande.typeSource && (
                                    <>
                                        <div className="col-12 md:col-3">
                                            <small className="text-600">Type de Source</small>
                                            <p className="font-semibold mt-1">{selectedDemande.typeSource === 'CAISSE' ? 'Caisse' : 'Compte Interne'}</p>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <small className="text-600">Compte Source</small>
                                            <p className="font-semibold mt-1">{
                                                (() => {
                                                    if (selectedDemande.typeSource === 'CAISSE') {
                                                        const caisse = petitesCaisses.find(c => c.id === selectedDemande.compteSourceId);
                                                        if (caisse?.internalAccountId) {
                                                            const ia = rawInternalAccounts.find(a => a.accountId === caisse.internalAccountId);
                                                            if (ia) return `${ia.accountNumber} - ${ia.libelle}`;
                                                        }
                                                        return caisse ? `${caisse.code} - ${caisse.agenceName || ''}` : '-';
                                                    }
                                                    const acc = internalAccounts.find(a => a.value === selectedDemande.compteSourceId);
                                                    return acc?.label || selectedDemande.compteSourceId || '-';
                                                })()
                                            }</p>
                                        </div>
                                    </>
                                )}
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Mode de Paiement</small>
                                    <p className="font-semibold mt-1">
                                        <Tag value={MODES_PAIEMENT_DEPENSE.find(m => m.value === selectedDemande.modePaiementName)?.label || selectedDemande.modePaiementName || '-'} severity="info" />
                                    </p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Montant Payé</small>
                                    <p className="font-semibold mt-1 text-green-600">{currencyBodyTemplate(selectedDemande.montantPaye)}</p>
                                </div>
                                <div className="col-12 md:col-3">
                                    <small className="text-600">Date Paiement</small>
                                    <p className="font-semibold mt-1">{dateBodyTemplate(selectedDemande.datePaiement)}</p>
                                </div>
                                {selectedDemande.numeroBonCaisse && (
                                    <div className="col-12 md:col-3">
                                        <small className="text-600">N° Bon de Caisse</small>
                                        <p className="font-semibold mt-1">{selectedDemande.numeroBonCaisse}</p>
                                    </div>
                                )}
                                {selectedDemande.referenceVirement && (
                                    <div className="col-12 md:col-3">
                                        <small className="text-600">Référence</small>
                                        <p className="font-semibold mt-1">{selectedDemande.referenceVirement}</p>
                                    </div>
                                )}
                                {(selectedDemande.modePaiementName === 'VIREMENT_INTERNE' || selectedDemande.modePaiementName === 'VIREMENT_BANCAIRE') && selectedDemande.compteDestinationId && (
                                    <>
                                        <div className="col-12 md:col-3">
                                            <small className="text-600">Type Destination</small>
                                            <p className="font-semibold mt-1">{selectedDemande.typeCompteDestination === 'CLIENT' ? 'Compte Client' : 'Compte Interne'}</p>
                                        </div>
                                        <div className="col-12 md:col-3">
                                            <small className="text-600">Compte Destination</small>
                                            <p className="font-semibold mt-1">{
                                                (() => {
                                                    const options = selectedDemande.typeCompteDestination === 'CLIENT' ? savingsAccounts : internalAccounts;
                                                    const acc = options.find(a => a.value === selectedDemande.compteDestinationId);
                                                    return acc?.label || selectedDemande.compteDestinationId;
                                                })()
                                            }</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {(selectedDemande.approbateurN1Name || selectedDemande.approbateurN2Name || selectedDemande.approbateurN3Name) && (
                            <div className="p-3 surface-100 border-round">
                                <h6 className="mt-0 mb-3"><i className="pi pi-check-circle mr-2"></i>Historique d'Approbation</h6>
                                <div className="grid">
                                    {selectedDemande.approbateurN1Name && (
                                        <div className="col-12 md:col-4">
                                            <div className="p-2 surface-50 border-round">
                                                <Tag value="N1" severity="info" className="mb-1" />
                                                <p className="font-semibold mb-0">{selectedDemande.approbateurN1Name}</p>
                                                <small className="text-500">{dateBodyTemplate(selectedDemande.dateApprobationN1)}</small>
                                                {selectedDemande.commentaireN1 && <p className="text-sm text-600 mt-1 mb-0">{selectedDemande.commentaireN1}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {selectedDemande.approbateurN2Name && (
                                        <div className="col-12 md:col-4">
                                            <div className="p-2 surface-50 border-round">
                                                <Tag value="N2" severity="warning" className="mb-1" />
                                                <p className="font-semibold mb-0">{selectedDemande.approbateurN2Name}</p>
                                                <small className="text-500">{dateBodyTemplate(selectedDemande.dateApprobationN2)}</small>
                                                {selectedDemande.commentaireN2 && <p className="text-sm text-600 mt-1 mb-0">{selectedDemande.commentaireN2}</p>}
                                            </div>
                                        </div>
                                    )}
                                    {selectedDemande.approbateurN3Name && (
                                        <div className="col-12 md:col-4">
                                            <div className="p-2 surface-50 border-round">
                                                <Tag value="N3" severity="success" className="mb-1" />
                                                <p className="font-semibold mb-0">{selectedDemande.approbateurN3Name}</p>
                                                <small className="text-500">{dateBodyTemplate(selectedDemande.dateApprobationN3)}</small>
                                                {selectedDemande.commentaireN3 && <p className="text-sm text-600 mt-1 mb-0">{selectedDemande.commentaireN3}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Document Dialog (Bon de Caisse or Preuve de Paiement) */}
            <Dialog visible={showBonCaisseDialog} onHide={() => setShowBonCaisseDialog(false)}
                header={selectedDemande?.typeSource === 'CAISSE' || !selectedDemande?.typeSource ? 'Bon de Caisse' : 'Preuve de Paiement'}
                style={{ width: '60vw' }} modal
                footer={
                    <div>
                        <Button label="Fermer" icon="pi pi-times" onClick={() => setShowBonCaisseDialog(false)} className="p-button-text" />
                        <Button label="Imprimer" icon="pi pi-print" className="p-button-success" onClick={handlePrint} />
                    </div>
                }>
                {selectedDemande && (
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        {selectedDemande.typeSource === 'COMPTE_INTERNE' ? (
                            <PrintablePreuvePaiement ref={printRef} demande={selectedDemande}
                                internalAccounts={internalAccounts} savingsAccounts={savingsAccounts}
                                companyName="AGRINOVA MICROFINANCE" companyAddress="Bujumbura, Burundi" companyPhone="+257 22 XX XX XX" />
                        ) : (
                            <PrintableBonDeCaisse ref={printRef} demande={selectedDemande}
                                companyName="AGRINOVA MICROFINANCE" companyAddress="Bujumbura, Burundi" companyPhone="+257 22 XX XX XX" />
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default PaiementsDepensePage;
