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
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/scoring-rules');
const CATEGORIES_URL = buildApiUrl('/api/credit/scoring-categories');

interface RegleScoring {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    categoryId?: number;
    categoryName?: string;
    minValue?: number;
    maxValue?: number;
    score?: number;
    orderIndex?: number;
    isActive?: boolean;
}

interface CategorieScoring {
    id: number;
    code: string;
    nameFr: string;
}

export default function ReglesScoringPage() {
    const [regle, setRegle] = useState<RegleScoring>({ isActive: true });
    const [regles, setRegles] = useState<RegleScoring[]>([]);
    const [categories, setCategories] = useState<CategorieScoring[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadRegles();
        loadCategories();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadRegles':
                    setRegles(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'loadCategories':
                    setCategories(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Règle de scoring créée avec succès');
                    resetForm();
                    loadRegles();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Règle de scoring modifiée avec succès');
                    resetForm();
                    loadRegles();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Règle de scoring supprimée avec succès');
                    loadRegles();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadRegles = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadRegles');
    };

    const loadCategories = () => {
        fetchData(null, 'GET', `${CATEGORIES_URL}/findall`, 'loadCategories');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setRegle({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setRegle(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setRegle(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!regle.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!regle.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        if (!regle.categoryId) {
            showToast('error', 'Erreur de validation', 'La catégorie est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (regle.id) {
            fetchData(regle, 'PUT', `${BASE_URL}/update/${regle.id}`, 'update');
        } else {
            fetchData(regle, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: RegleScoring) => {
        setRegle({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: RegleScoring) => {
        setRegle({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: RegleScoring) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la règle "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const categoryTemplate = (rowData: RegleScoring) => {
        const cat = categories.find(c => c.id === rowData.categoryId);
        return <Tag value={cat?.nameFr || rowData.categoryName || 'N/A'} severity="info" />;
    };

    const valueRangeTemplate = (rowData: RegleScoring) => (
        <span>{rowData.minValue ?? '-∞'} à {rowData.maxValue ?? '+∞'}</span>
    );

    const scoreTemplate = (rowData: RegleScoring) => (
        <span className="font-bold text-primary">{rowData.score || 0} pts</span>
    );

    const statusBodyTemplate = (rowData: RegleScoring) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: RegleScoring) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(rowData)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(rowData)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(rowData)} tooltip="Supprimer" />
        </div>
    );

    const categoryOptions = categories.map(c => ({
        label: c.nameFr,
        value: c.id
    }));

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-sliders-h mr-2"></i>
                Gestion des Règles de Scoring
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Règle" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-sliders-h mr-2"></i>Informations de la Règle de Scoring</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={regle.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: RULE_DTI_LOW" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={regle.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Low DTI Ratio" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={regle.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Ratio DTI Faible" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="categoryId" className="font-semibold">Catégorie *</label>
                                <Dropdown id="categoryId" value={regle.categoryId} options={categoryOptions} onChange={(e) => setRegle(prev => ({ ...prev, categoryId: e.value }))} className="w-full" disabled={isViewMode} placeholder="Sélectionner une catégorie" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="minValue" className="font-semibold">Valeur Minimum</label>
                                <InputNumber id="minValue" value={regle.minValue} onValueChange={(e) => handleNumberChange('minValue', e.value ?? null)} className="w-full" disabled={isViewMode} />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="maxValue" className="font-semibold">Valeur Maximum</label>
                                <InputNumber id="maxValue" value={regle.maxValue} onValueChange={(e) => handleNumberChange('maxValue', e.value ?? null)} className="w-full" disabled={isViewMode} />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="score" className="font-semibold">Score Attribué</label>
                                <InputNumber id="score" value={regle.score} onValueChange={(e) => handleNumberChange('score', e.value ?? 0)} className="w-full" disabled={isViewMode} suffix=" pts" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="orderIndex" className="font-semibold">Ordre d'Évaluation</label>
                                <InputNumber id="orderIndex" value={regle.orderIndex} onValueChange={(e) => handleNumberChange('orderIndex', e.value ?? 0)} className="w-full" disabled={isViewMode} min={1} />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={regle.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de la règle..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={regle.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={regle.id ? 'Modifier' : 'Enregistrer'} icon={regle.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Règles" leftIcon="pi pi-list mr-2">
                    <DataTable value={regles} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadRegles'} emptyMessage="Aucune règle de scoring trouvée" className="p-datatable-sm">
                        <Column field="orderIndex" header="Ordre" sortable style={{ width: '80px' }} />
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Catégorie" body={categoryTemplate} />
                        <Column header="Plage de Valeurs" body={valueRangeTemplate} />
                        <Column header="Score" body={scoreTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
