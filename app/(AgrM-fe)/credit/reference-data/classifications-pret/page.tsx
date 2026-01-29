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

const BASE_URL = buildApiUrl('/api/credit/loan-classifications');

interface ClassificationPret {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    daysOverdueMin?: number;
    daysOverdueMax?: number;
    provisionRate?: number;
    colorCode?: string;
    isActive?: boolean;
}

export default function ClassificationsPretsPage() {
    const [classification, setClassification] = useState<ClassificationPret>({ isActive: true });
    const [classifications, setClassifications] = useState<ClassificationPret[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadClassifications(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadClassifications':
                    setClassifications(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Classification créée avec succès');
                    resetForm();
                    loadClassifications();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Classification modifiée avec succès');
                    resetForm();
                    loadClassifications();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Classification supprimée avec succès');
                    loadClassifications();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadClassifications = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadClassifications');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setClassification({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setClassification(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setClassification(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setClassification(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!classification.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!classification.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (classification.id) {
            fetchData(classification, 'PUT', `${BASE_URL}/update/${classification.id}`, 'update');
        } else {
            fetchData(classification, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: ClassificationPret) => {
        setClassification({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: ClassificationPret) => {
        setClassification({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: ClassificationPret) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la classification "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const classificationTemplate = (rowData: ClassificationPret) => {
        const colors: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
            'PERFORMANT': 'success',
            'SOUS_SURVEILLANCE': 'info',
            'DOUTEUX': 'warning',
            'CONTENTIEUX': 'danger',
            'PERTE': 'danger'
        };
        return <Tag value={rowData.nameFr || rowData.code} severity={colors[rowData.code || ''] || 'secondary'} />;
    };

    const daysRangeTemplate = (rowData: ClassificationPret) => (
        <span>{rowData.daysOverdueMin || 0} - {rowData.daysOverdueMax || '∞'} jours</span>
    );

    const provisionTemplate = (rowData: ClassificationPret) => (
        <span className="font-bold">{(rowData.provisionRate || 0).toFixed(1)}%</span>
    );

    const statusBodyTemplate = (rowData: ClassificationPret) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: ClassificationPret) => (
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
                <i className="pi pi-chart-bar mr-2"></i>
                Gestion des Classifications de Prêts
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Classification" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-chart-bar mr-2"></i>Informations de la Classification</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={classification.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: PERFORMANT" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={classification.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Performing" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={classification.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Performant" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="daysOverdueMin" className="font-semibold">Jours de Retard (Min)</label>
                                <InputNumber id="daysOverdueMin" value={classification.daysOverdueMin} onValueChange={(e) => handleNumberChange('daysOverdueMin', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} suffix=" jours" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="daysOverdueMax" className="font-semibold">Jours de Retard (Max)</label>
                                <InputNumber id="daysOverdueMax" value={classification.daysOverdueMax} onValueChange={(e) => handleNumberChange('daysOverdueMax', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} suffix=" jours" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="provisionRate" className="font-semibold">Taux de Provision (%)</label>
                                <InputNumber id="provisionRate" value={classification.provisionRate} onValueChange={(e) => handleNumberChange('provisionRate', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} max={100} suffix="%" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="colorCode" className="font-semibold">Code Couleur</label>
                                <InputText id="colorCode" name="colorCode" value={classification.colorCode || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: #22c55e" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={classification.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de la classification..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={classification.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={classification.id ? 'Modifier' : 'Enregistrer'} icon={classification.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Classifications" leftIcon="pi pi-list mr-2">
                    <DataTable value={classifications} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadClassifications'} emptyMessage="Aucune classification trouvée" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column header="Classification" body={classificationTemplate} />
                        <Column header="Jours de Retard" body={daysRangeTemplate} />
                        <Column header="Taux Provision" body={provisionTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
