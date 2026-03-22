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
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

import useConsumApi, { getUserAction } from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { CategorieDepense, CategorieDepenseClass } from '../../types/DepenseTypes';

const CategoriesDepensePage = () => {
    const [categories, setCategories] = useState<CategorieDepense[]>([]);
    const [categorie, setCategorie] = useState<CategorieDepense>(new CategorieDepenseClass());
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [isViewMode, setIsViewMode] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: listData, loading: loadingList, error: listError, fetchData: fetchList } = useConsumApi('');
    const { data: actionData, loading: loadingAction, error: actionError, fetchData: fetchAction, callType } = useConsumApi('');

    const [internalAccounts, setInternalAccounts] = useState<any[]>([]);

    const { data: accountsData, fetchData: fetchAccounts } = useConsumApi('');

    const BASE_URL = buildApiUrl('/api/depenses/categories');
    const INTERNAL_ACCOUNTS_URL = buildApiUrl('/api/comptability/internal-accounts');

    useEffect(() => {
        loadCategories();
        fetchAccounts(null, 'GET', `${INTERNAL_ACCOUNTS_URL}/findall`, 'loadAccounts');
    }, []);

    useEffect(() => {
        if (accountsData) {
            const items = Array.isArray(accountsData) ? accountsData : accountsData.content || [];
            setInternalAccounts(items.map((a: any) => ({
                value: a.accountId,
                label: `${a.accountNumber} - ${a.libelle}`
            })));
        }
    }, [accountsData]);

    useEffect(() => {
        if (listData) {
            setCategories(Array.isArray(listData) ? listData : listData.content || []);
        }
        if (listError) {
            showToast('error', 'Erreur', listError.message || 'Erreur de chargement');
        }
    }, [listData, listError]);

    useEffect(() => {
        if (actionData) {
            switch (callType) {
                case 'create':
                case 'update':
                    showToast('success', 'Succès', 'Opération effectuée avec succès');
                    resetForm();
                    loadCategories();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Catégorie supprimée');
                    loadCategories();
                    break;
            }
        }
        if (actionError) {
            showToast('error', 'Erreur', actionError.message || 'Une erreur est survenue');
        }
    }, [actionData, actionError, callType]);

    const loadCategories = () => {
        fetchList(null, 'GET', `${BASE_URL}/findall`, 'loadCategories');
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setCategorie(new CategorieDepenseClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategorie(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setCategorie(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (name: string, value: boolean) => {
        setCategorie(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!categorie.code || !categorie.nameFr) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires (Code, Nom FR)');
            return;
        }

        const dataToSend = { ...categorie, name: categorie.nameFr, userAction: getUserAction() };
        if (categorie.id) {
            fetchAction(dataToSend, 'PUT', `${BASE_URL}/update/${categorie.id}`, 'update');
        } else {
            fetchAction(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleView = (rowData: CategorieDepense) => {
        setCategorie({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleEdit = (rowData: CategorieDepense) => {
        setCategorie({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: CategorieDepense) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la catégorie "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Non, annuler',
            accept: () => {
                fetchAction(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: CategorieDepense) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: CategorieDepense) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" tooltip="Voir" tooltipOptions={{ position: 'top' }} onClick={() => handleView(rowData)} />
            <Button icon="pi pi-pencil" rounded text severity="warning" tooltip="Modifier" tooltipOptions={{ position: 'top' }} onClick={() => handleEdit(rowData)} />
            <Button icon="pi pi-trash" rounded text severity="danger" tooltip="Supprimer" tooltipOptions={{ position: 'top' }} onClick={() => handleDelete(rowData)} />
        </div>
    );

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0"><i className="pi pi-tags mr-2"></i>Catégories de Dépenses</h4>
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
                <TabPanel header={categorie.id ? 'Modifier Catégorie' : 'Nouvelle Catégorie'} leftIcon="pi pi-plus mr-2">
                    <div className="p-fluid formgrid grid">
                        <div className="field col-12 md:col-3">
                            <label htmlFor="code">Code *</label>
                            <InputText id="code" name="code" value={categorie.code} onChange={handleChange} disabled={isViewMode} placeholder="Ex: DEP-OP" />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="nameFr">Nom (FR) *</label>
                            <InputText id="nameFr" name="nameFr" value={categorie.nameFr} onChange={handleChange} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="internalAccountId">Compte Interne</label>
                            <Dropdown
                                id="internalAccountId"
                                value={categorie.internalAccountId || null}
                                options={internalAccounts}
                                onChange={(e) => setCategorie(prev => ({ ...prev, internalAccountId: e.value }))}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Sélectionner un compte interne"
                                filter
                                showClear
                                filterPlaceholder="Rechercher..."
                                disabled={isViewMode}
                            />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label htmlFor="sortOrder">Ordre</label>
                            <InputNumber id="sortOrder" value={categorie.sortOrder} onValueChange={(e) => handleNumberChange('sortOrder', e.value ?? null)} disabled={isViewMode} />
                        </div>
                        <div className="field col-12 md:col-2">
                            <label htmlFor="isActive">Actif</label>
                            <div><InputSwitch checked={categorie.isActive ?? true} onChange={(e) => handleSwitchChange('isActive', e.value)} disabled={isViewMode} /></div>
                        </div>
                        <div className="field col-12 md:col-8">
                            <label htmlFor="description">Description</label>
                            <InputTextarea id="description" name="description" value={categorie.description} onChange={handleChange} disabled={isViewMode} rows={3} />
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={categorie.id ? 'Modifier' : 'Créer'} icon="pi pi-check" onClick={handleSubmit} loading={loadingAction} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Catégories" leftIcon="pi pi-list mr-2">
                    <DataTable value={categories} paginator rows={10} rowsPerPageOptions={[5, 10, 25]} loading={loadingList} globalFilter={globalFilter} header={header} emptyMessage="Aucune catégorie trouvée" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter style={{ width: '12%' }} />
                        <Column field="nameFr" header="Nom (FR)" sortable filter style={{ width: '20%' }} />
                        <Column
                            header="Compte Interne"
                            body={(row: CategorieDepense) => {
                                if (!row.internalAccountId) return <span className="text-500">—</span>;
                                const acc = internalAccounts.find(a => a.value === row.internalAccountId);
                                return <span>{acc?.label || row.internalAccountId}</span>;
                            }}
                            style={{ width: '15%' }}
                        />
                        <Column field="sortOrder" header="Ordre" sortable style={{ width: '8%' }} />
                        <Column header="Statut" body={statusBodyTemplate} style={{ width: '10%' }} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '15%' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
};

export default CategoriesDepensePage;
