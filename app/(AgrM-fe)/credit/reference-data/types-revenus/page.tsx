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
import { TypeRevenu, TypeRevenuClass } from '../../types/CreditTypes';

const BASE_URL = buildApiUrl('/api/credit/income-types');

export default function TypesRevenusPage() {
    const [typeRevenu, setTypeRevenu] = useState<TypeRevenu>(new TypeRevenuClass());
    const [typesRevenus, setTypesRevenus] = useState<TypeRevenu[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadTypesRevenus();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadTypesRevenus':
                    setTypesRevenus(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Type de revenu créé avec succès');
                    resetForm();
                    loadTypesRevenus();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Type de revenu modifié avec succès');
                    resetForm();
                    loadTypesRevenus();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Type de revenu supprimé avec succès');
                    loadTypesRevenus();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadTypesRevenus = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadTypesRevenus');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setTypeRevenu(new TypeRevenuClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTypeRevenu(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setTypeRevenu(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!typeRevenu.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!typeRevenu.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (typeRevenu.id) {
            fetchData(typeRevenu, 'PUT', `${BASE_URL}/update/${typeRevenu.id}`, 'update');
        } else {
            fetchData(typeRevenu, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: TypeRevenu) => {
        setTypeRevenu({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: TypeRevenu) => {
        setTypeRevenu({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: TypeRevenu) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type de revenu "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: TypeRevenu) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const actionsBodyTemplate = (rowData: TypeRevenu) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
                <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
                <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-dollar mr-2"></i>
                Gestion des Types de Revenus
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Type" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-dollar mr-2"></i>Informations du Type de Revenu</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={typeRevenu.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: SALAIRE" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={typeRevenu.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Salary" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={typeRevenu.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Salaire" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="categoryName" className="font-semibold">Catégorie</label>
                                <InputText id="categoryName" name="categoryName" value={typeRevenu.categoryName || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Revenu salarié" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="verificationMethod" className="font-semibold">Méthode de vérification</label>
                                <InputText id="verificationMethod" name="verificationMethod" value={typeRevenu.verificationMethod || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Bulletin de salaire" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={typeRevenu.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description du type de revenu..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox inputId="isActive" checked={typeRevenu.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={typeRevenu.id ? 'Modifier' : 'Enregistrer'} icon={typeRevenu.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Types" leftIcon="pi pi-list mr-2">
                    <DataTable value={typesRevenus} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadTypesRevenus'} emptyMessage="Aucun type de revenu trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="categoryName" header="Catégorie" sortable filter />
                        <Column field="verificationMethod" header="Vérification" />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
