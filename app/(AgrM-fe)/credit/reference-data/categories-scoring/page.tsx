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

const BASE_URL = buildApiUrl('/api/credit/scoring-categories');

interface CategorieScoring {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    weight?: number;
    maxScore?: number;
    orderIndex?: number;
    isActive?: boolean;
}

export default function CategoriesScoringPage() {
    const [categorie, setCategorie] = useState<CategorieScoring>({ isActive: true });
    const [categories, setCategories] = useState<CategorieScoring[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadCategories(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadCategories':
                    setCategories(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Catégorie de scoring créée avec succès');
                    resetForm();
                    loadCategories();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Catégorie de scoring modifiée avec succès');
                    resetForm();
                    loadCategories();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Catégorie de scoring supprimée avec succès');
                    loadCategories();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadCategories = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadCategories');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setCategorie({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCategorie(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setCategorie(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setCategorie(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!categorie.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!categorie.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (categorie.id) {
            fetchData(categorie, 'PUT', `${BASE_URL}/update/${categorie.id}`, 'update');
        } else {
            fetchData(categorie, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: CategorieScoring) => {
        setCategorie({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: CategorieScoring) => {
        setCategorie({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: CategorieScoring) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la catégorie "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const weightTemplate = (rowData: CategorieScoring) => (
        <Tag value={`${(rowData.weight || 0).toFixed(0)}%`} severity="info" />
    );

    const maxScoreTemplate = (rowData: CategorieScoring) => (
        <span className="font-bold">{rowData.maxScore || 0} pts</span>
    );

    const statusBodyTemplate = (rowData: CategorieScoring) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: CategorieScoring) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
        </div>
    );

    // Calculate total weight
    const totalWeight = categories.reduce((sum, c) => sum + (c.weight || 0), 0);

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-calculator mr-2"></i>
                Gestion des Catégories de Scoring
            </h4>

            {/* Weight Summary */}
            <div className="surface-100 p-3 border-round mb-4">
                <div className="flex align-items-center justify-content-between">
                    <span className="font-semibold">Pondération Totale:</span>
                    <Tag
                        value={`${totalWeight.toFixed(0)}%`}
                        severity={totalWeight === 100 ? 'success' : totalWeight > 100 ? 'danger' : 'warning'}
                        className="text-lg"
                    />
                </div>
                {totalWeight !== 100 && (
                    <small className="text-orange-500 block mt-2">
                        <i className="pi pi-exclamation-triangle mr-1"></i>
                        La pondération totale doit être égale à 100%
                    </small>
                )}
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Catégorie" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-calculator mr-2"></i>Informations de la Catégorie de Scoring</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={categorie.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: CAT_FINANCE" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={categorie.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Financial Capacity" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={categorie.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Capacité Financière" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="weight" className="font-semibold">Pondération (%)</label>
                                <InputNumber id="weight" value={categorie.weight} onValueChange={(e) => handleNumberChange('weight', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} max={100} suffix="%" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="maxScore" className="font-semibold">Score Maximum</label>
                                <InputNumber id="maxScore" value={categorie.maxScore} onValueChange={(e) => handleNumberChange('maxScore', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} suffix=" pts" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="orderIndex" className="font-semibold">Ordre d'Affichage</label>
                                <InputNumber id="orderIndex" value={categorie.orderIndex} onValueChange={(e) => handleNumberChange('orderIndex', e.value ?? 0)} className="w-full" disabled={isViewMode} min={1} />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={categorie.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de la catégorie..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={categorie.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={categorie.id ? 'Modifier' : 'Enregistrer'} icon={categorie.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Catégories" leftIcon="pi pi-list mr-2">
                    <DataTable value={categories} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadCategories'} emptyMessage="Aucune catégorie de scoring trouvée" className="p-datatable-sm">
                        <Column field="orderIndex" header="Ordre" sortable style={{ width: '80px' }} />
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Pondération" body={weightTemplate} />
                        <Column header="Score Max" body={maxScoreTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
