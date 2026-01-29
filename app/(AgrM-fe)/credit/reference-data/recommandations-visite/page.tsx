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

const BASE_URL = buildApiUrl('/api/credit/visit-recommendations');

interface RecommandationVisite {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    isPositive?: boolean;
    isActive?: boolean;
}

export default function RecommandationsVisitePage() {
    const [recommandation, setRecommandation] = useState<RecommandationVisite>({ isActive: true, isPositive: true });
    const [recommandations, setRecommandations] = useState<RecommandationVisite[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadRecommandations(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadRecommandations':
                    setRecommandations(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Recommandation créée avec succès');
                    resetForm();
                    loadRecommandations();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Recommandation modifiée avec succès');
                    resetForm();
                    loadRecommandations();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Recommandation supprimée avec succès');
                    loadRecommandations();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadRecommandations = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRecommandations');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setRecommandation({ isActive: true, isPositive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRecommandation(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setRecommandation(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!recommandation.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!recommandation.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (recommandation.id) {
            fetchData(recommandation, 'PUT', `${BASE_URL}/update/${recommandation.id}`, 'update');
        } else {
            fetchData(recommandation, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: RecommandationVisite) => {
        setRecommandation({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: RecommandationVisite) => {
        setRecommandation({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: RecommandationVisite) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la recommandation "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const positiveBodyTemplate = (rowData: RecommandationVisite) => (
        <Tag value={rowData.isPositive ? 'Favorable' : 'Défavorable'} severity={rowData.isPositive ? 'success' : 'danger'} />
    );

    const statusBodyTemplate = (rowData: RecommandationVisite) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: RecommandationVisite) => (
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
                <i className="pi pi-check-circle mr-2"></i>
                Gestion des Recommandations de Visite
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Recommandation" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-check-circle mr-2"></i>Informations de la Recommandation</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={recommandation.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: FAVORABLE" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={recommandation.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Favorable" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={recommandation.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Favorable" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={recommandation.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de la recommandation..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isPositive" checked={recommandation.isPositive || false} onChange={(e) => handleCheckboxChange('isPositive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isPositive" className="font-semibold">Recommandation favorable</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={recommandation.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={recommandation.id ? 'Modifier' : 'Enregistrer'} icon={recommandation.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Recommandations" leftIcon="pi pi-list mr-2">
                    <DataTable value={recommandations} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadRecommandations'} emptyMessage="Aucune recommandation trouvée" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Type" body={positiveBodyTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
