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

const BASE_URL = buildApiUrl('/api/credit/risk-levels');

interface NiveauRisque {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    minScore?: number;
    maxScore?: number;
    colorCode?: string;
    isActive?: boolean;
}

export default function NiveauxRisquePage() {
    const [niveau, setNiveau] = useState<NiveauRisque>({ isActive: true });
    const [niveaux, setNiveaux] = useState<NiveauRisque[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadNiveaux(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadNiveaux':
                    setNiveaux(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Niveau de risque créé avec succès');
                    resetForm();
                    loadNiveaux();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Niveau de risque modifié avec succès');
                    resetForm();
                    loadNiveaux();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Niveau de risque supprimé avec succès');
                    loadNiveaux();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadNiveaux = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadNiveaux');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setNiveau({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNiveau(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setNiveau(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setNiveau(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!niveau.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!niveau.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (niveau.id) {
            fetchData(niveau, 'PUT', `${BASE_URL}/update/${niveau.id}`, 'update');
        } else {
            fetchData(niveau, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: NiveauRisque) => {
        setNiveau({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: NiveauRisque) => {
        setNiveau({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: NiveauRisque) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le niveau de risque "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const riskBodyTemplate = (rowData: NiveauRisque) => {
        const colors: Record<string, string> = {
            'FAIBLE': 'success',
            'LOW': 'success',
            'MODERE': 'warning',
            'MEDIUM': 'warning',
            'ELEVE': 'danger',
            'HIGH': 'danger'
        };
        return <Tag value={rowData.nameFr || rowData.code} severity={colors[rowData.code || ''] as any || 'info'} />;
    };

    const scoreRangeTemplate = (rowData: NiveauRisque) => (
        <span>{rowData.minScore || 0} - {rowData.maxScore || 100}</span>
    );

    const statusBodyTemplate = (rowData: NiveauRisque) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: NiveauRisque) => (
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
                <i className="pi pi-exclamation-triangle mr-2"></i>
                Gestion des Niveaux de Risque
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Niveau" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-exclamation-triangle mr-2"></i>Informations du Niveau de Risque</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={niveau.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: FAIBLE" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={niveau.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Low" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={niveau.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Faible" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="minScore" className="font-semibold">Score Minimum</label>
                                <InputNumber id="minScore" value={niveau.minScore} onValueChange={(e) => handleNumberChange('minScore', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} max={100} />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="maxScore" className="font-semibold">Score Maximum</label>
                                <InputNumber id="maxScore" value={niveau.maxScore} onValueChange={(e) => handleNumberChange('maxScore', e.value ?? 100)} className="w-full" disabled={isViewMode} min={0} max={100} />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="colorCode" className="font-semibold">Code Couleur</label>
                                <InputText id="colorCode" name="colorCode" value={niveau.colorCode || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: #22c55e" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={niveau.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description du niveau de risque..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={niveau.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={niveau.id ? 'Modifier' : 'Enregistrer'} icon={niveau.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Niveaux" leftIcon="pi pi-list mr-2">
                    <DataTable value={niveaux} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadNiveaux'} emptyMessage="Aucun niveau de risque trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column header="Niveau" body={riskBodyTemplate} />
                        <Column header="Plage de Score" body={scoreRangeTemplate} />
                        <Column field="description" header="Description" />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
