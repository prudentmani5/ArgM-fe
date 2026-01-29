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
import { ObjetCredit, ObjetCreditClass } from '../../types/CreditTypes';

const BASE_URL = buildApiUrl('/api/credit/purposes');

export default function ObjetsCreditPage() {
    const [objet, setObjet] = useState<ObjetCredit>(new ObjetCreditClass());
    const [objets, setObjets] = useState<ObjetCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadObjets();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadObjets':
                    setObjets(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Objet de crédit créé avec succès');
                    resetForm();
                    loadObjets();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Objet de crédit modifié avec succès');
                    resetForm();
                    loadObjets();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Objet de crédit supprimé avec succès');
                    loadObjets();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadObjets = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadObjets');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setObjet(new ObjetCreditClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setObjet(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setObjet(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!objet.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!objet.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (objet.id) {
            fetchData(objet, 'PUT', `${BASE_URL}/update/${objet.id}`, 'update');
        } else {
            fetchData(objet, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: ObjetCredit) => {
        setObjet({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: ObjetCredit) => {
        setObjet({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: ObjetCredit) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer l'objet de crédit "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: ObjetCredit) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const actionsBodyTemplate = (rowData: ObjetCredit) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    text
                    severity="info"
                    onClick={() => handleView(rowData)}
                    tooltip="Voir"
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => handleEdit(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => handleDelete(rowData)}
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="mb-4">
                <i className="pi pi-briefcase mr-2"></i>
                Gestion des Objets de Crédit
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvel Objet" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3">
                            <i className="pi pi-briefcase mr-2"></i>
                            Informations de l'Objet de Crédit
                        </h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText
                                    id="code"
                                    name="code"
                                    value={objet.code || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: FONDS_ROULEMENT"
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText
                                    id="name"
                                    name="name"
                                    value={objet.name || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: Working Capital"
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText
                                    id="nameFr"
                                    name="nameFr"
                                    value={objet.nameFr || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: Fonds de roulement commerce"
                                />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea
                                    id="description"
                                    name="description"
                                    value={objet.description || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    rows={3}
                                    disabled={isViewMode}
                                    placeholder="Description de l'objet de crédit..."
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox
                                        inputId="requiresBusinessPlan"
                                        checked={objet.requiresBusinessPlan || false}
                                        onChange={(e) => handleCheckboxChange('requiresBusinessPlan', e.checked ?? false)}
                                        disabled={isViewMode}
                                    />
                                    <label htmlFor="requiresBusinessPlan" className="font-semibold">
                                        Requiert un plan d'affaires
                                    </label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox
                                        inputId="isActive"
                                        checked={objet.isActive || false}
                                        onChange={(e) => handleCheckboxChange('isActive', e.checked ?? false)}
                                        disabled={isViewMode}
                                    />
                                    <label htmlFor="isActive" className="font-semibold">
                                        Actif
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label={objet.id ? 'Modifier' : 'Enregistrer'}
                                icon={objet.id ? 'pi pi-check' : 'pi pi-save'}
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Objets" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={objets}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading && callType === 'loadObjets'}
                        emptyMessage="Aucun objet de crédit trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="description" header="Description" />
                        <Column
                            field="requiresBusinessPlan"
                            header="Plan d'affaires"
                            body={(rowData) => (
                                <i className={`pi ${rowData.requiresBusinessPlan ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />
                            )}
                        />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
