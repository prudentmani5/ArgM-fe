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

const BASE_URL = buildApiUrl('/api/credit/recovery-stages');

interface EtapeRecouvrement {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    daysOverdueMin?: number;
    daysOverdueMax?: number;
    orderIndex?: number;
    isActive?: boolean;
}

export default function EtapesRecouvrementPage() {
    const [etape, setEtape] = useState<EtapeRecouvrement>({ isActive: true });
    const [etapes, setEtapes] = useState<EtapeRecouvrement[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadEtapes(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadEtapes':
                    setEtapes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Étape de recouvrement créée avec succès');
                    resetForm();
                    loadEtapes();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Étape de recouvrement modifiée avec succès');
                    resetForm();
                    loadEtapes();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Étape de recouvrement supprimée avec succès');
                    loadEtapes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadEtapes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEtapes');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setEtape({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEtape(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEtape(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setEtape(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!etape.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!etape.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (etape.id) {
            fetchData(etape, 'PUT', `${BASE_URL}/update/${etape.id}`, 'update');
        } else {
            fetchData(etape, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: EtapeRecouvrement) => {
        setEtape({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: EtapeRecouvrement) => {
        setEtape({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: EtapeRecouvrement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer l'étape "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const daysRangeTemplate = (rowData: EtapeRecouvrement) => (
        <span>{rowData.daysOverdueMin || 0} - {rowData.daysOverdueMax || '∞'} jours</span>
    );

    const statusBodyTemplate = (rowData: EtapeRecouvrement) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: EtapeRecouvrement) => (
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
                <i className="pi pi-clock mr-2"></i>
                Gestion des Étapes de Recouvrement
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Étape" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-clock mr-2"></i>Informations de l'Étape de Recouvrement</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={etape.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: STAGE_01" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={etape.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Early Collection" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={etape.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Recouvrement Précoce" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="daysOverdueMin" className="font-semibold">Jours de Retard (Min)</label>
                                <InputNumber id="daysOverdueMin" value={etape.daysOverdueMin} onValueChange={(e) => handleNumberChange('daysOverdueMin', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} suffix=" jours" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="daysOverdueMax" className="font-semibold">Jours de Retard (Max)</label>
                                <InputNumber id="daysOverdueMax" value={etape.daysOverdueMax} onValueChange={(e) => handleNumberChange('daysOverdueMax', e.value ?? 0)} className="w-full" disabled={isViewMode} min={0} suffix=" jours" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="orderIndex" className="font-semibold">Ordre d'Affichage</label>
                                <InputNumber id="orderIndex" value={etape.orderIndex} onValueChange={(e) => handleNumberChange('orderIndex', e.value ?? 0)} className="w-full" disabled={isViewMode} min={1} />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={etape.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de l'étape..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={etape.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={etape.id ? 'Modifier' : 'Enregistrer'} icon={etape.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Étapes" leftIcon="pi pi-list mr-2">
                    <DataTable value={etapes} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadEtapes'} emptyMessage="Aucune étape de recouvrement trouvée" className="p-datatable-sm">
                        <Column field="orderIndex" header="Ordre" sortable style={{ width: '80px' }} />
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Jours de Retard" body={daysRangeTemplate} />
                        <Column field="description" header="Description" />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
