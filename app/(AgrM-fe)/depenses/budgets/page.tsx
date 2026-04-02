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

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { shouldFilterByBranch } from '../../../../utils/branchFilter';
import {
    BudgetDepense,
    BudgetDepenseClass,
    CategorieDepense,
    NIVEAUX_BUDGET,
    STATUTS_BUDGET
} from '../types/DepenseTypes';

const BudgetsPage = () => {
    const [budgets, setBudgets] = useState<BudgetDepense[]>([]);
    const [budget, setBudget] = useState<BudgetDepense>(new BudgetDepenseClass());
    const [categories, setCategories] = useState<CategorieDepense[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: catData, error: catError, fetchData: fetchCat } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/budgets');
    const CATEGORIES_URL = buildApiUrl('/api/depenses/categories');

    useEffect(() => {
        loadBudgets();
        loadCategories();
    }, []);

    useEffect(() => {
        if (listData) setBudgets(Array.isArray(listData) ? listData : listData.content || []);
        if (listError) showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
    }, [listData, listError]);

    useEffect(() => {
        if (catData) setCategories(Array.isArray(catData) ? catData : catData.content || []);
    }, [catData]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create': case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm(); loadBudgets(); setActiveIndex(1); break;
                case 'delete':
                    showToast('success', 'Succès', 'Budget supprimé');
                    loadBudgets(); break;
            }
        }
        if (actionError) showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
    }, [actionData, actionError, callType]);

    const loadBudgets = () => {
        const { filter, branchId } = shouldFilterByBranch();
        const url = filter ? `${BASE_URL}/findbybranch/${branchId}` : `${BASE_URL}/findall`;
        fetchList(null, 'GET', url, 'loadBudgets');
    };

    const loadCategories = () => {
        fetchCat(null, 'GET', `${CATEGORIES_URL}/findallactive`, 'loadCategories');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => { setBudget(new BudgetDepenseClass()); setIsViewMode(false); };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBudget(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setBudget(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setBudget(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setBudget(prev => ({ ...prev, [name]: value?.toISOString().split('T')[0] }));
    };

    const handleSubmit = () => {
        if (!budget.libelle || !budget.exercice || !budget.montantAlloue) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires (Libellé, Exercice, Montant alloué)');
            return;
        }
        const dataToSend = { ...budget, userAction: getUserAction() };
        if (budget.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${budget.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: BudgetDepense) => { setBudget({ ...rowData }); setIsViewMode(true); setActiveIndex(0); };
    const handleEdit = (rowData: BudgetDepense) => { setBudget({ ...rowData }); setIsViewMode(false); setActiveIndex(0); };
    const handleDelete = (rowData: BudgetDepense) => {
        confirmDialog({
            message: `Supprimer le budget "${rowData.libelle}" ?`,
            header: 'Confirmation', icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger', acceptLabel: 'Oui', rejectLabel: 'Non',
            accept: () => { fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete'); }
        });
    };

    const currencyBodyTemplate = (value: number | undefined) => {
        return value?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' }) || '0 FBU';
    };

    const tauxConsommationBodyTemplate = (rowData: BudgetDepense) => {
        const taux = rowData.tauxConsommation ?? 0;
        const severity = taux >= 80 ? 'danger' : taux >= 50 ? 'warning' : 'success';
        return (
            <div>
                <ProgressBar value={taux} showValue={true} style={{ height: '20px' }}
                    color={severity === 'danger' ? '#ef4444' : severity === 'warning' ? '#f59e0b' : '#22c55e'} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: BudgetDepense) => {
        const severityMap: Record<string, any> = {
            'ACTIVE': 'success', 'SUSPENDU': 'warning', 'CLOTURE': 'secondary', 'REVISE': 'info'
        };
        const labelMap: Record<string, string> = {
            'ACTIVE': 'Actif', 'SUSPENDU': 'Suspendu', 'CLOTURE': 'Clôturé', 'REVISE': 'Révisé'
        };
        return <Tag value={labelMap[rowData.status || ''] || rowData.status} severity={severityMap[rowData.status || ''] || 'info'} />;
    };

    const actionsBodyTemplate = (rowData: BudgetDepense) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-chart-bar mr-2"></i>Gestion Budgétaire</h4>
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
                <TabPanel header={budget.id ? 'Modifier Budget' : 'Nouveau Budget'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="libelle">Libellé *</label>
                            <InputText id="libelle" name="libelle" value={budget.libelle} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="exercice">Exercice *</label>
                            <InputText id="exercice" name="exercice" value={budget.exercice} onChange={handleChange} disabled={isViewMode} placeholder="2026" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="niveauBudget">Niveau Budgétaire</label>
                            <Dropdown id="niveauBudget" value={budget.niveauBudget} options={NIVEAUX_BUDGET} onChange={(e) => handleDropdownChange('niveauBudget', e.value)} disabled={isViewMode} placeholder="Sélectionner" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="categorieDepenseId">Catégorie de Dépense</label>
                            <Dropdown id="categorieDepenseId" value={budget.categorieDepenseId} options={categories} optionLabel="nameFr" optionValue="id" onChange={(e) => handleDropdownChange('categorieDepenseId', e.value)} disabled={isViewMode} placeholder="Sélectionner" filter />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="montantAlloue">Montant Alloué (FBU) *</label>
                            <InputNumber id="montantAlloue" value={budget.montantAlloue} onValueChange={(e) => handleNumberChange('montantAlloue', e.value ?? null)} disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="dateDebut">Date Début</label>
                            <Calendar id="dateDebut" value={budget.dateDebut ? new Date(budget.dateDebut) : null} onChange={(e) => handleDateChange('dateDebut', e.value as Date)} disabled={isViewMode} dateFormat="dd/mm/yy" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="dateFin">Date Fin</label>
                            <Calendar id="dateFin" value={budget.dateFin ? new Date(budget.dateFin) : null} onChange={(e) => handleDateChange('dateFin', e.value as Date)} disabled={isViewMode} dateFormat="dd/mm/yy" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="status">Statut</label>
                            <Dropdown id="status" value={budget.status} options={STATUTS_BUDGET} onChange={(e) => handleDropdownChange('status', e.value)} disabled={isViewMode} placeholder="Sélectionner" />
                        </div>

                        {budget.id && (
                            <>
                                <div className="field col-12">
                                    <div className="p-3 surface-100 border-round">
                                        <h5 className="mt-0 mb-3"><i className="pi pi-chart-line mr-2"></i>Indicateurs de Suivi</h5>
                                        <div className="grid">
                                            <div className="col-12 md:col-3">
                                                <small className="text-600">Montant Dépensé</small>
                                                <p className="mt-1 mb-0 font-semibold text-orange-600">{currencyBodyTemplate(budget.montantDepense)}</p>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <small className="text-600">Montant Engagé</small>
                                                <p className="mt-1 mb-0 font-semibold text-blue-600">{currencyBodyTemplate(budget.montantEngage)}</p>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <small className="text-600">Montant Disponible</small>
                                                <p className="mt-1 mb-0 font-semibold text-green-600">{currencyBodyTemplate(budget.montantDisponible)}</p>
                                            </div>
                                            <div className="col-12 md:col-3">
                                                <small className="text-600">Taux de Consommation</small>
                                                <ProgressBar value={budget.tauxConsommation ?? 0} showValue={true} style={{ height: '24px', marginTop: '4px' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="field col-12">
                            <label htmlFor="notes">Notes</label>
                            <InputTextarea id="notes" name="notes" value={budget.notes} onChange={handleChange} disabled={isViewMode} rows={3} />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && <Button label={budget.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Budgets" leftIcon="pi pi-list mr-2">
                    <DataTable value={budgets} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucun budget trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '8%' }} />
                        <Column field="libelle" header="Libellé" sortable filter style={{ width: '15%' }} />
                        <Column field="exercice" header="Exercice" sortable style={{ width: '8%' }} />
                        <Column field="niveauBudget" header="Niveau" sortable style={{ width: '10%' }} />
                        <Column header="Alloué" body={(row) => currencyBodyTemplate(row.montantAlloue)} sortable style={{ width: '12%' }} />
                        <Column header="Dépensé" body={(row) => currencyBodyTemplate(row.montantDepense)} style={{ width: '12%' }} />
                        <Column header="Disponible" body={(row) => <span className={row.montantDisponible < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>{currencyBodyTemplate(row.montantDisponible)}</span>} style={{ width: '12%' }} />
                        <Column header="Consommation" body={tauxConsommationBodyTemplate} style={{ width: '12%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '8%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '12%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default BudgetsPage;
