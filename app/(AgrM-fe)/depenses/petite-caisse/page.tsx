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
import { ProgressBar } from 'primereact/progressbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import {
    PetiteCaisse,
    PetiteCaisseClass,
    MouvementPetiteCaisse,
    MouvementPetiteCaisseClass,
    TYPES_MOUVEMENT_PC,
    STATUTS_MOUVEMENT_PC,
    STATUTS_PETITE_CAISSE
} from '../types/DepenseTypes';

const PetiteCaissePage = () => {
    const [caisses, setCaisses] = useState<PetiteCaisse[]>([]);
    const [caisse, setCaisse] = useState<PetiteCaisse>(new PetiteCaisseClass());
    const [mouvements, setMouvements] = useState<MouvementPetiteCaisse[]>([]);
    const [mouvement, setMouvement] = useState<MouvementPetiteCaisse>(new MouvementPetiteCaisseClass());
    const [selectedCaisse, setSelectedCaisse] = useState<PetiteCaisse | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);
    const [showMouvementDialog, setShowMouvementDialog] = useState(false);
    const [showMouvementsListDialog, setShowMouvementsListDialog] = useState(false);

    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);
    const [rawInternalAccounts, setRawInternalAccounts] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: mouvData, loading: loadingMouv, error: mouvError, fetchData: fetchMouv } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');
    const { data: accountsData, fetchData: fetchAccounts } = useConsumApi('');
    const { data: branchesData, fetchData: fetchBranches } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/petites-caisses');
    const MOUVEMENTS_URL = buildApiUrl('/api/depenses/mouvements-petite-caisse');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');
    const BRANCHES_URL = buildApiUrl('/api/reference-data/branches');

    useEffect(() => {
        loadCaisses();
        fetchAccounts(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadAccounts');
        fetchBranches(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    }, []);

    useEffect(() => {
        if (accountsData) {
            const items = Array.isArray(accountsData) ? accountsData : accountsData.content || [];
            setRawInternalAccounts(items);
            setInternalAccounts(items.map((a: any) => ({
                value: a.accountId,
                label: `${a.accountNumber} - ${a.libelle}`
            })));
        }
    }, [accountsData]);

    useEffect(() => {
        if (branchesData) {
            const items = Array.isArray(branchesData) ? branchesData : branchesData.content || [];
            setBranches(items.map((b: any) => ({ value: b.id, label: b.name })));
        }
    }, [branchesData]);

    useEffect(() => {
        if (listData) setCaisses(Array.isArray(listData) ? listData : listData.content || []);
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (mouvData) setMouvements(Array.isArray(mouvData) ? mouvData : mouvData.content || []);
    }, [mouvData]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'createCaisse': case 'updateCaisse':
                    showToast('success', 'Succès', 'Petite caisse enregistrée');
                    resetForm(); loadCaisses(); setActiveIndex(1); break;
                case 'deleteCaisse':
                    showToast('success', 'Succès', 'Petite caisse supprimée');
                    loadCaisses(); break;
                case 'createMouvement':
                    showToast('success', 'Succès', 'Mouvement enregistré');
                    setShowMouvementDialog(false);
                    if (selectedCaisse) loadMouvements(selectedCaisse.id!);
                    loadCaisses();
                    break;
                case 'validateMouvement':
                    showToast('success', 'Succès', 'Mouvement validé');
                    if (selectedCaisse) loadMouvements(selectedCaisse.id!);
                    loadCaisses();
                    break;
                case 'reapprovisionner':
                    showToast('success', 'Succès', 'Réapprovisionnement effectué');
                    loadCaisses();
                    if (selectedCaisse) loadMouvements(selectedCaisse.id!);
                    break;
                case 'arrete':
                    showToast('success', 'Succès', 'Arrêté de caisse effectué');
                    loadCaisses(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadCaisses = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${BASE_URL}/findbybranch/${branchId}` : `${BASE_URL}/findall`;
        fetchList(null, 'GET', url, 'loadCaisses');
    };

    const loadMouvements = (caisseId: number) => {
        fetchMouv(null, 'GET', `${MOUVEMENTS_URL}/findbycaisse/${caisseId}`, 'loadMouvements');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setCaisse(new PetiteCaisseClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCaisse(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setCaisse(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitCaisse = () => {
        if (!caisse.code || !caisse.plafond) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }
        const dataToSend = { ...caisse, userAction: getUserAction() };
        if (caisse.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${caisse.id}`, 'updateCaisse');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'createCaisse');
        }
    };

    const handleNewMouvement = (pc: PetiteCaisse) => {
        setSelectedCaisse(pc);
        setMouvement(new MouvementPetiteCaisseClass({ petiteCaisseId: pc.id }));
        setShowMouvementDialog(true);
    };

    const handleSubmitMouvement = () => {
        if (!mouvement.montant || !mouvement.motif) {
            showToast('warn', 'Attention', 'Veuillez remplir le montant et le motif');
            return;
        }
        if (mouvement.type === 'SORTIE' && (mouvement.montant || 0) > (selectedCaisse?.montantMaxParSortie || 50000)) {
            showToast('warn', 'Attention', `Le montant dépasse le maximum par sortie (${selectedCaisse?.montantMaxParSortie?.toLocaleString()} FBU)`);
            return;
        }
        const dataToSend = { ...mouvement, userAction: getUserAction() };
        fetchAction(dataToSend, 'POST', `${MOUVEMENTS_URL}/new`, 'createMouvement');
    };

    const handleViewMouvements = (pc: PetiteCaisse) => {
        setSelectedCaisse(pc);
        loadMouvements(pc.id!);
        setShowMouvementsListDialog(true);
    };

    const handleReapprovisionner = (pc: PetiteCaisse) => {
        confirmDialog({
            message: `Réapprovisionner la petite caisse "${pc.code}" ?`,
            header: 'Réapprovisionnement', icon: 'pi pi-wallet',
            acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => {
                fetchAction({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/reapprovisionner/${pc.id}`, 'reapprovisionner');
            }
        });
    };

    const handleArrete = (pc: PetiteCaisse) => {
        confirmDialog({
            message: `Effectuer l'arrêté journalier de la petite caisse "${pc.code}" ?`,
            header: 'Arrêté de Caisse', icon: 'pi pi-lock',
            acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => {
                fetchAction({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/arrete/${pc.id}`, 'arrete');
            }
        });
    };

    const handleView = (rowData: PetiteCaisse) => { setCaisse({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: PetiteCaisse) => { setCaisse({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: PetiteCaisse) => {
        confirmDialog({
            message: `Supprimer la petite caisse "${rowData.code}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'deleteCaisse'); }
        });
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const soldeBodyTemplate = (rowData: PetiteCaisse) => {
        let solde = rowData.soldeActuel || 0;
        if (rowData.internalAccountId) {
            const acc = rawInternalAccounts.find(a => a.accountId === rowData.internalAccountId);
            if (acc) solde = acc.soldeActuel || 0;
        }
        const pct = rowData.plafond ? (solde / rowData.plafond) * 100 : 0;
        const isLow = pct <= 20;
        return (
            <div>
                <span className={`font-semibold ${isLow ? 'text-red-600' : ''}`}>
                    {currencyBodyTemplate(solde)}
                </span>
                {isLow && <Tag value="Bas" severity="danger" className="ml-2" />}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: PetiteCaisse) => {
        const map: Record<string, any> = { 'ACTIVE': 'success', 'SUSPENDUE': 'warning', 'FERMEE': 'danger' };
        const labelMap: Record<string, string> = { 'ACTIVE': 'Active', 'SUSPENDUE': 'Suspendue', 'FERMEE': 'Fermée' };
        return <Tag value={labelMap[rowData.status || ''] || rowData.status} severity={map[rowData.status || ''] || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: PetiteCaisse) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-list" rounded text severity="help" tooltip="Mouvements" tooltipOptions={{ position: 'top' }} onClick={() => handleViewMouvements(rowData)} />
            <Button icon="pi pi-lock" rounded text severity="secondary" tooltip="Arrêté" tooltipOptions={{ position: 'top' }} onClick={() => handleArrete(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
        </div>
    );

    const mouvementTypeTemplate = (rowData: MouvementPetiteCaisse) => {
        const map: Record<string, any> = { 'SORTIE': 'danger', 'REAPPROVISIONNEMENT': 'success', 'REGULARISATION': 'warning' };
        const label = TYPES_MOUVEMENT_PC.find(t => t.value === rowData.type)?.label || rowData.type;
        return <Tag value={label} severity={map[rowData.type || ''] || 'info'} />;
    };

    const mouvementStatusTemplate = (rowData: MouvementPetiteCaisse) => {
        const map: Record<string, any> = { 'EN_ATTENTE': 'warning', 'VALIDE': 'success', 'REJETE': 'danger' };
        const label = STATUTS_MOUVEMENT_PC.find(s => s.value === rowData.status)?.label || rowData.status;
        return <Tag value={label} severity={map[rowData.status || ''] || 'info'} />;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-wallet mr-2"></i>Petites Caisses</h4>
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
                <TabPanel header={caisse.id ? 'Modifier Petite Caisse' : 'Nouvelle Petite Caisse'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={caisse.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: PC-001" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="agenceId">Agence *</label>
                            <Dropdown id="agenceId" value={caisse.agenceId || null}
                                options={branches} optionLabel="label" optionValue="value"
                                onChange={(e) => {
                                    const branch = branches.find(b => b.value === e.value);
                                    setCaisse(prev => ({ ...prev, agenceId: e.value, agenceName: branch?.label || '' }));
                                }}
                                placeholder="Sélectionner une agence" filter showClear filterPlaceholder="Rechercher..."
                                disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="plafond">Plafond (FBU) *</label>
                            <InputNumber id="plafond" value={caisse.plafond} onValueChange={(e) => handleNumberChange('plafond', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="seuilReapprovisionnement">Seuil Réappro. (FBU)</label>
                            <InputNumber id="seuilReapprovisionnement" value={caisse.seuilReapprovisionnement} onValueChange={(e) => handleNumberChange('seuilReapprovisionnement', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="montantMaxParSortie">Max / Sortie (FBU)</label>
                            <InputNumber id="montantMaxParSortie" value={caisse.montantMaxParSortie} onValueChange={(e) => handleNumberChange('montantMaxParSortie', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="internalAccountId">Compte Interne</label>
                            <Dropdown
                                id="internalAccountId"
                                value={caisse.internalAccountId || null}
                                options={internalAccounts}
                                onChange={(e) => setCaisse(prev => ({ ...prev, internalAccountId: e.value }))}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Sélectionner un compte interne"
                                filter
                                showClear
                                filterPlaceholder="Rechercher..."
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="status">Statut</label>
                            <Dropdown id="status" value={caisse.status} options={STATUTS_PETITE_CAISSE} onChange={(e) => setCaisse(prev => ({ ...prev, status: e.value }))} disabled={isViewMode} />
                        </div>
                        {caisse.id && (
                            <div className="field col-12 md:col-3">
                                <label>Solde Actuel</label>
                                <div className="mt-2">
                                    {(() => {
                                        let solde = caisse.soldeActuel || 0;
                                        if (caisse.internalAccountId) {
                                            const acc = rawInternalAccounts.find(a => a.accountId === caisse.internalAccountId);
                                            if (acc) solde = acc.soldeActuel || 0;
                                        }
                                        return (
                                            <span className={`font-bold text-xl ${solde < (caisse.seuilReapprovisionnement || 0) ? 'text-red-600' : 'text-green-600'}`}>
                                                {currencyBodyTemplate(solde)}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && <Button label={caisse.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmitCaisse} loading={loadingAction} />}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Petites Caisses" leftIcon="pi pi-list mr-2">
                    <DataTable value={caisses} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucune petite caisse" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '10%' }} />
                        <Column field="agenceName" header="Agence" sortable filter style={{ width: '15%' }} />
                        <Column header="Plafond" body={(row) => currencyBodyTemplate(row.plafond)} sortable style={{ width: '12%' }} />
                        <Column header="Solde" body={soldeBodyTemplate} sortable style={{ width: '15%' }} />
                        <Column header="Seuil Réappro." body={(row) => currencyBodyTemplate(row.seuilReapprovisionnement)} style={{ width: '10%' }} />
                        <Column
                            header="Compte Interne"
                            body={(row: PetiteCaisse) => {
                                if (!row.internalAccountId) return <span className="text-500">—</span>;
                                const acc = internalAccounts.find(a => a.value === row.internalAccountId);
                                return <span>{acc?.label || row.internalAccountId}</span>;
                            }}
                            style={{ width: '12%' }}
                        />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '8%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '22%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Nouveau Mouvement Dialog */}
            <Dialog visible={showMouvementDialog} onHide={() => setShowMouvementDialog(false)}
                header={`Nouveau Mouvement - ${selectedCaisse?.code}`} style={{ width: '45vw' }} modal
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setShowMouvementDialog(false)} className="p-button-text" />
                        <Button label="Enregistrer" icon="pi pi-check" onClick={handleSubmitMouvement} loading={loadingAction} />
                    </div>
                }>
                <div className="mb-3 p-3 surface-100 border-round">
                    <div className="flex justify-content-between">
                        <div><small className="text-600">Solde actuel:</small><p className="font-bold text-lg">{currencyBodyTemplate(selectedCaisse?.soldeActuel)}</p></div>
                        <div><small className="text-600">Max / sortie:</small><p className="font-bold">{currencyBodyTemplate(selectedCaisse?.montantMaxParSortie)}</p></div>
                    </div>
                </div>
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label>Type *</label>
                        <Dropdown value={mouvement.type} options={TYPES_MOUVEMENT_PC} onChange={(e) => setMouvement(prev => ({ ...prev, type: e.value }))} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Montant (FBU) *</label>
                        <InputNumber value={mouvement.montant} onValueChange={(e) => setMouvement(prev => ({ ...prev, montant: e.value ?? 0 }))} mode="currency" currency="BIF" locale="fr-BI" />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Bénéficiaire</label>
                        <InputText value={mouvement.beneficiaire} onChange={(e) => setMouvement(prev => ({ ...prev, beneficiaire: e.target.value }))} />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label>Date Opération</label>
                        <Calendar value={mouvement.dateOperation ? new Date(mouvement.dateOperation) : null}
                            onChange={(e) => setMouvement(prev => ({ ...prev, dateOperation: (e.value as Date)?.toISOString().split('T')[0] }))} dateFormat="dd/mm/yy" />
                    </div>
                    <div className="field col-12">
                        <label>Motif *</label>
                        <InputTextarea value={mouvement.motif} onChange={(e) => setMouvement(prev => ({ ...prev, motif: e.target.value }))} rows={3} />
                    </div>
                </div>
            </Dialog>

            {/* Liste Mouvements Dialog */}
            <Dialog visible={showMouvementsListDialog} onHide={() => setShowMouvementsListDialog(false)}
                header={`Mouvements - ${selectedCaisse?.code}`} style={{ width: '70vw' }} modal>
                <DataTable value={mouvements} paginator rows={10} loading={loadingMouv}
                    emptyMessage="Aucun mouvement" className="p-datatable-sm" sortField="dateOperation" sortOrder={-1}>
                    <Column field="dateOperation" header="Date" body={(row) => row.dateOperation ? new Date(row.dateOperation).toLocaleDateString('fr-FR') : '-'} sortable style={{ width: '12%' }} />
                    <Column header="Type" body={mouvementTypeTemplate} style={{ width: '15%' }} />
                    <Column header="Montant" body={(row) => <span className={row.type === 'SORTIE' ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>{currencyBodyTemplate(row.montant)}</span>} style={{ width: '15%' }} />
                    <Column field="beneficiaire" header="Bénéficiaire" sortable style={{ width: '15%' }} />
                    <Column field="motif" header="Motif" style={{ width: '20%' }} />
                    <Column header="Statut" body={mouvementStatusTemplate} style={{ width: '10%' }} />
                    <Column field="operateurName" header="Opérateur" style={{ width: '13%' }} />
                </DataTable>
            </Dialog>
        </div>
    );
};

export default PetiteCaissePage;
