'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { OperationType, OperationTypeClass, OperationClass } from './OperationType';
import OperationTypeForm from './OperationTypeForm';

const BASE_URL = `${API_BASE_URL}/api/epargne/operation-types`;

function OperationTypePage() {
    const [operationType, setOperationType] = useState<OperationType>(new OperationTypeClass());
    const [operationTypes, setOperationTypes] = useState<OperationType[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadOperationTypes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadOperationTypes':
                    setOperationTypes(Array.isArray(data) ? data : []);
                    break;
                case 'createOperationType':
                    showToast('success', 'Succès', 'Type d\'opération créé avec succès');
                    resetForm();
                    loadOperationTypes();
                    setActiveIndex(1);
                    break;
                case 'updateOperationType':
                    showToast('success', 'Succès', 'Type d\'opération mis à jour avec succès');
                    resetForm();
                    loadOperationTypes();
                    setActiveIndex(1);
                    break;
                case 'deleteOperationType':
                    showToast('success', 'Succès', 'Type d\'opération supprimé avec succès');
                    loadOperationTypes();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadOperationTypes = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadOperationTypes');
        setLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setOperationType(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setOperationType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setOperationType(prev => ({ ...prev, [name]: checked }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setOperationType(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const validateForm = (): boolean => {
        if (!operationType.code?.trim()) {
            showToast('warn', 'Attention', 'Le code est obligatoire');
            return false;
        }
        if (!operationType.name?.trim()) {
            showToast('warn', 'Attention', 'Le nom (anglais) est obligatoire');
            return false;
        }
        if (!operationType.nameFr?.trim()) {
            showToast('warn', 'Attention', 'Le nom (français) est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (operationType.id) {
            fetchData(operationType, 'PUT', `${BASE_URL}/update/${operationType.id}`, 'updateOperationType');
        } else {
            fetchData(operationType, 'POST', `${BASE_URL}/new`, 'createOperationType');
        }
    };

    const resetForm = () => {
        setOperationType(new OperationTypeClass());
    };

    const editOperationType = (rowData: OperationType) => {
        setOperationType({ ...rowData });
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: OperationType) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le type "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'deleteOperationType');
            }
        });
    };

    const operationClassBodyTemplate = (rowData: OperationType) => {
        return (
            <Tag
                value={rowData.operationClass === OperationClass.CREDIT ? 'Crédit' : 'Débit'}
                severity={rowData.operationClass === OperationClass.CREDIT ? 'success' : 'danger'}
            />
        );
    };

    const statusBodyTemplate = (rowData: OperationType) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const booleanBodyTemplate = (value: boolean) => {
        return value ? <i className="pi pi-check text-green-500"></i> : <i className="pi pi-times text-red-500"></i>;
    };

    const actionsBodyTemplate = (rowData: OperationType) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editOperationType(rowData)}
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Types d'Opération</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <h4 className="text-primary mb-4">
                <i className="pi pi-cog mr-2"></i>
                Gestion des Types d'Opération
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Type" leftIcon="pi pi-plus mr-2">
                    <OperationTypeForm
                        operationType={operationType}
                        handleChange={handleChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={operationType.id ? 'Mettre à jour' : 'Enregistrer'}
                            icon="pi pi-save"
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={resetForm}
                            className="p-button-secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Types" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={operationTypes}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun type d'opération trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="code" header="Code" sortable />
                        <Column field="nameFr" header="Nom (FR)" sortable />
                        <Column field="name" header="Nom (EN)" sortable />
                        <Column field="operationClass" header="Classe" body={operationClassBodyTemplate} sortable />
                        <Column field="requiresPassbookUpdate" header="MAJ Livret" body={(row) => booleanBodyTemplate(row.requiresPassbookUpdate)} />
                        <Column field="requiresAuthorization" header="Autorisation" body={(row) => booleanBodyTemplate(row.requiresAuthorization)} />
                        <Column field="sortOrder" header="Ordre" sortable />
                        <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}

export default OperationTypePage;
