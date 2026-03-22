'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import useConsumApi, { getUserAction, getConnectedUser } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import DemandeDepenseForm from './DemandeDepenseForm';
import {
    DemandeDepense,
    DemandeDepenseClass,
    CategorieDepense,
    NiveauPriorite,
    Fournisseur,
    STATUTS_DEMANDE_DEPENSE
} from '../types/DepenseTypes';

const DemandesDepensePage = () => {
    const [demandes, setDemandes] = useState<DemandeDepense[]>([]);
    const [demande, setDemande] = useState<DemandeDepense>(new DemandeDepenseClass());
    const [categories, setCategories] = useState<CategorieDepense[]>([]);
    const [niveauxPriorite, setNiveauxPriorite] = useState<NiveauPriorite[]>([]);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: catData, fetchData: fetchCat } = useConsumApi('');
    const { data: niveauData, fetchData: fetchNiveau } = useConsumApi('');
    const { data: fournisseurData, fetchData: fetchFournisseur } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/demandes');
    const CATEGORIES_URL = buildApiUrl('/api/depenses/categories');
    const NIVEAUX_URL = buildApiUrl('/api/depenses/niveaux-priorite');
    const FOURNISSEURS_URL = buildApiUrl('/api/depenses/fournisseurs');

    useEffect(() => {
        loadDemandes();
        loadCategories();
        loadNiveaux();
        loadFournisseurs();
    }, []);

    useEffect(() => {
        if (listData) {
            const data = Array.isArray(listData) ? listData : listData.content || [];
            setDemandes(data);
        }
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (catData) setCategories(Array.isArray(catData) ? catData : catData.content || []);
    }, [catData]);

    useEffect(() => {
        if (niveauData) setNiveauxPriorite(Array.isArray(niveauData) ? niveauData : niveauData.content || []);
    }, [niveauData]);

    useEffect(() => {
        if (fournisseurData) setFournisseurs(Array.isArray(fournisseurData) ? fournisseurData : fournisseurData.content || []);
    }, [fournisseurData]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create':
                    showToast('success', 'Succès', 'Demande créée avec succès');
                    resetForm(); loadDemandes(); setActiveIndex(1); break;
                case 'update':
                    showToast('success', 'Succès', 'Demande modifiée avec succès');
                    resetForm(); loadDemandes(); setActiveIndex(1); break;
                case 'submit':
                    showToast('success', 'Succès', 'Demande soumise pour approbation');
                    loadDemandes(); break;
                case 'delete':
                    showToast('success', 'Succès', 'Demande supprimée');
                    loadDemandes(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadDemandes = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${BASE_URL}/findbybranch/${branchId}` : `${BASE_URL}/findall`;
        fetchList(null, 'GET', url, 'loadDemandes');
    };

    const loadCategories = () => { fetchCat(null, 'GET', `${CATEGORIES_URL}/findallactive`, 'loadCat'); };
    const loadNiveaux = () => { fetchNiveau(null, 'GET', `${NIVEAUX_URL}/findallactive`, 'loadNiveaux'); };
    const loadFournisseurs = () => { fetchFournisseur(null, 'GET', `${FOURNISSEURS_URL}/findallactive`, 'loadFournisseurs'); };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setDemande(new DemandeDepenseClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDemande(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'categorieDepenseId') {
                const cat = categories.find(c => c.id === value);
                updated.categorieDepenseCode = cat?.code || '';
                updated.categorieDepenseName = cat?.nameFr || '';
            }
            if (name === 'niveauPrioriteId') {
                const niv = niveauxPriorite.find(n => n.id === value);
                updated.niveauPrioriteName = niv?.nameFr || '';
            }
            return updated;
        });
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setDemande(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDemande(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleSubmit = () => {
        if (!demande.natureLibelle || !demande.categorieDepenseId || !demande.montantEstimeFBU || !demande.justification) {
            showToast('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        const connectedUser = getConnectedUser();
        const dataToSend = { ...demande, beneficiaireFournisseur: demande.beneficiaireFournisseur || connectedUser?.fullName || '', userAction: getUserAction() };
        if (demande.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${demande.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/create`, 'create');
        }
    };

    const handleSoumettre = (rowData: DemandeDepense) => {
        confirmDialog({
            message: `Soumettre la demande "${rowData.numeroDemande}" pour approbation ?`,
            header: 'Confirmation', icon: 'pi pi-send',
            acceptLabel: 'Oui, soumettre', rejectLabel: 'Non',
            accept: () => {
                fetchAction({ userAction: getUserAction() }, 'PUT', `${BASE_URL}/submit/${rowData.id}`, 'submit');
            }
        });
    };

    const handleView = (rowData: DemandeDepense) => { setDemande({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: DemandeDepense) => { setDemande({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: DemandeDepense) => {
        confirmDialog({
            message: `Supprimer la demande "${rowData.numeroDemande}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete'); }
        });
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

    const prioriteBodyTemplate = (rowData: DemandeDepense) => {
        const name = rowData.niveauPrioriteName || niveauxPriorite.find(n => n.id === rowData.niveauPrioriteId)?.nameFr || '-';
        const colorMap: Record<string, any> = { 'P1': 'info', 'P2': 'warning', 'P3': 'danger', 'P4': 'danger' };
        return <Tag value={name} severity={colorMap[name] || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: DemandeDepense) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            {rowData.status === 'BROUILLON' && (
                <>
                    <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
                    <Button icon="pi pi-send" rounded text severity="success" tooltip="Soumettre" tooltipOptions={{ position: 'top' }} onClick={() => handleSoumettre(rowData)} />
                    <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
                </>
            )}
            {rowData.status === 'RETOURNEE' && (
                <>
                    <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Corriger" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
                    <Button icon="pi pi-send" rounded text severity="success" tooltip="Soumettre" tooltipOptions={{ position: 'top' }} onClick={() => handleSoumettre(rowData)} />
                </>
            )}
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-file mr-2"></i>Demandes de Dépenses</h4>
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
                <TabPanel header={demande.id ? 'Modifier Demande' : 'Nouvelle Demande'} leftIcon="pi pi-plus mr-2">
                    <DemandeDepenseForm
                        demande={demande}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        categories={categories}
                        niveauxPriorite={niveauxPriorite}
                        isViewMode={isViewMode}
                    />
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={demande.id ? 'Modifier' : 'Créer la Demande'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Demandes" leftIcon="pi pi-list mr-2">
                    <div className="mb-2 text-sm text-500">
                        <i className="pi pi-info-circle mr-1"></i>
                        Total demandes: {demandes.length}
                    </div>
                    <DataTable value={demandes} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucune demande trouvée" className="p-datatable-sm" sortField="dateDemande" sortOrder={-1}>
                        <Column field="numeroDemande" header="N° Demande" sortable filter style={{ width: '12%' }} />
                        <Column field="dateDemande" header="Date" body={(row) => dateBodyTemplate(row.dateDemande)} sortable style={{ width: '8%' }} />
                        <Column header="Catégorie" sortable filter filterField="categorieDepenseName" body={(row) => {
                            if (row.categorieDepenseName) return row.categorieDepenseName;
                            const cat = categories.find(c => c.id === row.categorieDepenseId);
                            return cat?.nameFr || '-';
                        }} style={{ width: '12%' }} />
                        <Column field="natureLibelle" header="Nature" sortable filter style={{ width: '15%' }} />
                        <Column field="beneficiaireFournisseur" header="Demandeur" sortable filter style={{ width: '12%' }} />
                        <Column header="Montant (FBU)" body={(row) => currencyBodyTemplate(row.montantEstimeFBU)} sortable style={{ width: '12%' }} />
                        <Column header="Priorité" body={prioriteBodyTemplate} style={{ width: '8%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '10%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '14%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default DemandesDepensePage;
