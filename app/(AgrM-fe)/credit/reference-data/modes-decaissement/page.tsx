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

const BASE_URL = buildApiUrl('/api/credit/disbursement-modes');

interface ModeDecaissement {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    requiresReference?: boolean;
    isActive?: boolean;
}

export default function ModesDecaissementPage() {
    const [mode, setMode] = useState<ModeDecaissement>({ isActive: true });
    const [modes, setModes] = useState<ModeDecaissement[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadModes(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadModes':
                    setModes(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Mode de décaissement créé avec succès');
                    resetForm();
                    loadModes();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Mode de décaissement modifié avec succès');
                    resetForm();
                    loadModes();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Mode de décaissement supprimé avec succès');
                    loadModes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadModes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadModes');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setMode({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setMode(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setMode(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!mode.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!mode.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (mode.id) {
            fetchData(mode, 'PUT', `${BASE_URL}/update/${mode.id}`, 'update');
        } else {
            fetchData(mode, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: ModeDecaissement) => {
        setMode({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: ModeDecaissement) => {
        setMode({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: ModeDecaissement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le mode de décaissement "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const referenceBodyTemplate = (rowData: ModeDecaissement) => (
        <i className={`pi ${rowData.requiresReference ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />
    );

    const statusBodyTemplate = (rowData: ModeDecaissement) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: ModeDecaissement) => (
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
                <i className="pi pi-money-bill mr-2"></i>
                Gestion des Modes de Décaissement
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Mode" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-money-bill mr-2"></i>Informations du Mode de Décaissement</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={mode.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: VIREMENT" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={mode.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Bank Transfer" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={mode.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Virement Bancaire" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={mode.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description du mode de décaissement..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="requiresReference" checked={mode.requiresReference || false} onChange={(e) => handleCheckboxChange('requiresReference', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="requiresReference" className="font-semibold">Référence requise</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={mode.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={mode.id ? 'Modifier' : 'Enregistrer'} icon={mode.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Modes" leftIcon="pi pi-list mr-2">
                    <DataTable value={modes} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadModes'} emptyMessage="Aucun mode de décaissement trouvé" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Réf. Requise" body={referenceBodyTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
