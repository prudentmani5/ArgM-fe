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
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { TypeGarantie, TypeGarantieClass } from '../../types/CreditTypes';

const BASE_URL = buildApiUrl('/api/credit/guarantee-types');

export default function TypesGarantiesPage() {
    const [typeGarantie, setTypeGarantie] = useState<TypeGarantie>(new TypeGarantieClass());
    const [typesGaranties, setTypesGaranties] = useState<TypeGarantie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadTypesGaranties(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadTypesGaranties':
                    setTypesGaranties(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Type de garantie créé avec succès');
                    resetForm();
                    loadTypesGaranties();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Type de garantie modifié avec succès');
                    resetForm();
                    loadTypesGaranties();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Type de garantie supprimé avec succès');
                    loadTypesGaranties();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadTypesGaranties = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadTypesGaranties');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setTypeGarantie(new TypeGarantieClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTypeGarantie(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setTypeGarantie(prev => ({ ...prev, [name]: checked }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setTypeGarantie(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!typeGarantie.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!typeGarantie.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (typeGarantie.id) {
            fetchData(typeGarantie, 'PUT', `${BASE_URL}/update/${typeGarantie.id}`, 'update');
        } else {
            fetchData(typeGarantie, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: TypeGarantie) => {
        setTypeGarantie({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: TypeGarantie) => {
        setTypeGarantie({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: TypeGarantie) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type de garantie "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: TypeGarantie) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: TypeGarantie) => (
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
                <i className="pi pi-shield mr-2"></i>
                Gestion des Types de Garanties
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Type" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-shield mr-2"></i>Informations du Type de Garantie</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={typeGarantie.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: EPARGNE_NANTIE" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={typeGarantie.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Pledged Savings" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={typeGarantie.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Épargne nantie" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={typeGarantie.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description du type de garantie..." />
                            </div>

                            <div className="field col-12 md:col-3">
                                <label htmlFor="coveragePercent" className="font-semibold">Pourcentage de couverture</label>
                                <InputNumber id="coveragePercent" value={typeGarantie.coveragePercent || 100} onValueChange={(e) => handleNumberChange('coveragePercent', e.value ?? 100)} className="w-full" disabled={isViewMode} suffix="%" min={0} max={100} />
                            </div>

                            <div className="field col-12 md:col-3">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox inputId="requiresValuation" checked={typeGarantie.requiresValuation || false} onChange={(e) => handleCheckboxChange('requiresValuation', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="requiresValuation" className="font-semibold">Nécessite évaluation</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={typeGarantie.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={typeGarantie.id ? 'Modifier' : 'Enregistrer'} icon={typeGarantie.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Types" leftIcon="pi pi-list mr-2">
                    <DataTable value={typesGaranties} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadTypesGaranties'} emptyMessage="Aucun type de garantie trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="coveragePercent" header="Couverture %" sortable body={(rowData) => `${rowData.coveragePercent || 0}%`} />
                        <Column field="requiresValuation" header="Évaluation requise" body={(rowData) => <i className={`pi ${rowData.requiresValuation ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
