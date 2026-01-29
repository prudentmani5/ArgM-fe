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
import { Dropdown } from 'primereact/dropdown';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';

const BASE_URL = buildApiUrl('/api/credit/recovery-actions');

interface ActionRecouvrement {
    id?: number;
    code?: string;
    name?: string;
    nameFr?: string;
    description?: string;
    actionType?: string;
    requiresFollowUp?: boolean;
    isActive?: boolean;
}

const actionTypes = [
    { label: 'Appel Téléphonique', value: 'PHONE_CALL' },
    { label: 'SMS', value: 'SMS' },
    { label: 'Email', value: 'EMAIL' },
    { label: 'Visite à Domicile', value: 'HOME_VISIT' },
    { label: 'Lettre de Relance', value: 'REMINDER_LETTER' },
    { label: 'Mise en Demeure', value: 'FORMAL_NOTICE' },
    { label: 'Action Judiciaire', value: 'LEGAL_ACTION' }
];

export default function ActionsRecouvrementPage() {
    const [action, setAction] = useState<ActionRecouvrement>({ isActive: true });
    const [actions, setActions] = useState<ActionRecouvrement[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => { loadActions(); }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadActions':
                    setActions(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Action de recouvrement créée avec succès');
                    resetForm();
                    loadActions();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Action de recouvrement modifiée avec succès');
                    resetForm();
                    loadActions();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Action de recouvrement supprimée avec succès');
                    loadActions();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadActions = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadActions');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setAction({ isActive: true });
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAction(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setAction(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!action.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!action.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (action.id) {
            fetchData(action, 'PUT', `${BASE_URL}/update/${action.id}`, 'update');
        } else {
            fetchData(action, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: ActionRecouvrement) => {
        setAction({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: ActionRecouvrement) => {
        setAction({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: ActionRecouvrement) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer l'action "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const actionTypeTemplate = (rowData: ActionRecouvrement) => {
        const type = actionTypes.find(t => t.value === rowData.actionType);
        const icons: Record<string, string> = {
            'PHONE_CALL': 'pi-phone',
            'SMS': 'pi-mobile',
            'EMAIL': 'pi-envelope',
            'HOME_VISIT': 'pi-home',
            'REMINDER_LETTER': 'pi-file',
            'FORMAL_NOTICE': 'pi-exclamation-triangle',
            'LEGAL_ACTION': 'pi-briefcase'
        };
        return (
            <span>
                <i className={`pi ${icons[rowData.actionType || ''] || 'pi-question'} mr-2`}></i>
                {type?.label || rowData.actionType}
            </span>
        );
    };

    const followUpTemplate = (rowData: ActionRecouvrement) => (
        <i className={`pi ${rowData.requiresFollowUp ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />
    );

    const statusBodyTemplate = (rowData: ActionRecouvrement) => (
        <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />
    );

    const actionsBodyTemplate = (rowData: ActionRecouvrement) => (
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
                <i className="pi pi-bolt mr-2"></i>
                Gestion des Actions de Recouvrement
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Action" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3"><i className="pi pi-bolt mr-2"></i>Informations de l'Action de Recouvrement</h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText id="code" name="code" value={action.code || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: ACT_CALL" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText id="name" name="name" value={action.name || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Phone Call" />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText id="nameFr" name="nameFr" value={action.nameFr || ''} onChange={handleChange} className="w-full" disabled={isViewMode} placeholder="Ex: Appel Téléphonique" />
                            </div>

                            <div className="field col-12 md:col-6">
                                <label htmlFor="actionType" className="font-semibold">Type d'Action</label>
                                <Dropdown id="actionType" value={action.actionType} options={actionTypes} onChange={(e) => setAction(prev => ({ ...prev, actionType: e.value }))} className="w-full" disabled={isViewMode} placeholder="Sélectionner un type" />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea id="description" name="description" value={action.description || ''} onChange={handleChange} className="w-full" rows={3} disabled={isViewMode} placeholder="Description de l'action..." />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="requiresFollowUp" checked={action.requiresFollowUp || false} onChange={(e) => handleCheckboxChange('requiresFollowUp', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="requiresFollowUp" className="font-semibold">Nécessite un Suivi</label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2">
                                    <Checkbox inputId="isActive" checked={action.isActive || false} onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)} disabled={isViewMode} />
                                    <label htmlFor="isActive" className="font-semibold">Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button label="Réinitialiser" icon="pi pi-refresh" severity="secondary" onClick={resetForm} />
                        {!isViewMode && (
                            <Button label={action.id ? 'Modifier' : 'Enregistrer'} icon={action.id ? 'pi pi-check' : 'pi pi-save'} onClick={handleSubmit} loading={loading} />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Actions" leftIcon="pi pi-list mr-2">
                    <DataTable value={actions} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading && callType === 'loadActions'} emptyMessage="Aucune action de recouvrement trouvée" className="p-datatable-sm">
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column header="Type d'Action" body={actionTypeTemplate} />
                        <Column header="Suivi Requis" body={followUpTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
