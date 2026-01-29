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
import { TypeDocument, TypeDocumentClass } from '../../types/CreditTypes';

const BASE_URL = buildApiUrl('/api/credit/document-types');

export default function TypesDocumentsPage() {
    const [typeDoc, setTypeDoc] = useState<TypeDocument>(new TypeDocumentClass());
    const [typeDocs, setTypeDocs] = useState<TypeDocument[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadTypeDocs();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadTypeDocs':
                    setTypeDocs(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Type de document créé avec succès');
                    resetForm();
                    loadTypeDocs();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Type de document modifié avec succès');
                    resetForm();
                    loadTypeDocs();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Type de document supprimé avec succès');
                    loadTypeDocs();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadTypeDocs = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadTypeDocs');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setTypeDoc(new TypeDocumentClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setTypeDoc(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setTypeDoc(prev => ({ ...prev, [name]: checked }));
    };

    const validateForm = (): boolean => {
        if (!typeDoc.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!typeDoc.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (typeDoc.id) {
            fetchData(typeDoc, 'PUT', `${BASE_URL}/update/${typeDoc.id}`, 'update');
        } else {
            fetchData(typeDoc, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: TypeDocument) => {
        setTypeDoc({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: TypeDocument) => {
        setTypeDoc({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: TypeDocument) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type de document "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: TypeDocument) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const requiredBodyTemplate = (rowData: TypeDocument) => {
        return (
            <Tag
                value={rowData.isRequired ? 'Obligatoire' : 'Optionnel'}
                severity={rowData.isRequired ? 'danger' : 'info'}
            />
        );
    };

    const actionsBodyTemplate = (rowData: TypeDocument) => {
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
                <i className="pi pi-file mr-2"></i>
                Gestion des Types de Documents
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Type" leftIcon="pi pi-plus mr-2">
                    <div className="surface-100 p-3 border-round mb-4">
                        <h5 className="mb-3">
                            <i className="pi pi-file mr-2"></i>
                            Informations du Type de Document
                        </h5>

                        <div className="formgrid grid">
                            <div className="field col-12 md:col-4">
                                <label htmlFor="code" className="font-semibold">Code *</label>
                                <InputText
                                    id="code"
                                    name="code"
                                    value={typeDoc.code || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: ID_CARD"
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="name" className="font-semibold">Nom (Anglais)</label>
                                <InputText
                                    id="name"
                                    name="name"
                                    value={typeDoc.name || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: Identity Card"
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <label htmlFor="nameFr" className="font-semibold">Nom (Français) *</label>
                                <InputText
                                    id="nameFr"
                                    name="nameFr"
                                    value={typeDoc.nameFr || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    disabled={isViewMode}
                                    placeholder="Ex: Pièce d'identité"
                                />
                            </div>

                            <div className="field col-12">
                                <label htmlFor="description" className="font-semibold">Description</label>
                                <InputTextarea
                                    id="description"
                                    name="description"
                                    value={typeDoc.description || ''}
                                    onChange={handleChange}
                                    className="w-full"
                                    rows={3}
                                    disabled={isViewMode}
                                    placeholder="Description du type de document..."
                                />
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox
                                        inputId="isRequired"
                                        checked={typeDoc.isRequired || false}
                                        onChange={(e) => handleCheckboxChange('isRequired', e.checked ?? false)}
                                        disabled={isViewMode}
                                    />
                                    <label htmlFor="isRequired" className="font-semibold">
                                        Document obligatoire
                                    </label>
                                </div>
                            </div>

                            <div className="field col-12 md:col-4">
                                <div className="flex align-items-center gap-2 mt-4">
                                    <Checkbox
                                        inputId="isActive"
                                        checked={typeDoc.isActive || false}
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
                                label={typeDoc.id ? 'Modifier' : 'Enregistrer'}
                                icon={typeDoc.id ? 'pi pi-check' : 'pi pi-save'}
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Types" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={typeDocs}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading && callType === 'loadTypeDocs'}
                        emptyMessage="Aucun type de document trouvé"
                        className="p-datatable-sm"
                    >
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="description" header="Description" />
                        <Column header="Obligatoire" body={requiredBodyTemplate} />
                        <Column header="Statut" body={statusBodyTemplate} />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '150px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}
