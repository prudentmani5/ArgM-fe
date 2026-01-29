'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { TypeDepense, TypeDepenseClass } from '../../types/CreditTypes';

const BASE_URL = buildApiUrl('/api/credit/expense-types');

export default function TypesDepensesPage() {
    const [typeDepense, setTypeDepense] = useState<TypeDepense>(new TypeDepenseClass());
    const [typesDepenses, setTypesDepenses] = useState<TypeDepense[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadTypesDepenses();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadTypesDepenses':
                    setTypesDepenses(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Type de dépense créé avec succès');
                    resetForm();
                    loadTypesDepenses();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Type de dépense modifié avec succès');
                    resetForm();
                    loadTypesDepenses();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Type de dépense supprimé avec succès');
                    loadTypesDepenses();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadTypesDepenses = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadTypesDepenses');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setTypeDepense(new TypeDepenseClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTypeDepense(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setTypeDepense(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!typeDepense.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!typeDepense.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (typeDepense.id) {
            fetchData(typeDepense, 'PUT', `${BASE_URL}/update/${typeDepense.id}`, 'update');
        } else {
            fetchData(typeDepense, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: TypeDepense) => {
        setTypeDepense({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: TypeDepense) => {
        setTypeDepense({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: TypeDepense) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type de dépense "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: TypeDepense) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const fixedBodyTemplate = (rowData: TypeDepense) => (
        <Tag value={rowData.isFixed ? 'Fixe' : 'Variable'} severity={rowData.isFixed ? 'info' : 'warning'} />
    );

    const actionsBodyTemplate = (rowData: TypeDepense) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-credit-card mr-2"></i>
                Gestion des Types de Dépenses
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Type" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-credit-card mr-2"></i>Informations du Type de Dépense</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={typeDepense.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: LOYER" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={typeDepense.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Rent" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={typeDepense.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Loyer" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="categoryName" className="font-semibold">Catégorie</label>
                                <InputText id="categoryName" name="categoryName" value={typeDepense.categoryName || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Charges fixes" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={typeDepense.description || ''} onChange={handleChange} className="w-full" rows={2} disabled={isViewMode} placeholder="Description du type de dépense..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox inputId="isFixed" checked={typeDepense.isFixed || false} onChange={(e) => handleCheckboxChange('isFixed', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isFixed" className="font-semibold">Charge fixe</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox inputId="isActive" checked={typeDepense.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={typeDepense.id ? 'Modifier' : 'Enregistrer'} icon={typeDepense.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Types" leftIcon="pi pi-list mr-2">
                    <DataTable value={typesDepenses} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadTypesDepenses'} emptyMessage="Aucun type de dépense trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="categoryName" header="Catégorie" sortable filter />
                        <Column header="Type" body={fixedBodyTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
