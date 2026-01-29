'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { TabView, TabPanel } from 'primereact/tabview';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Tag } from 'primereact/tag';
import { buildApiUrl } from '@/utils/apiConfig';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { StatutDemande, StatutDemandeClass } from '../../types/CreditTypes';
import StatutDemandeForm from './StatutDemandeForm';

const BASE_URL = buildApiUrl('/api/credit/application-statuses');

export default function StatutsDemandeePage() {
    const [statut, setStatut] = useState<StatutDemande>(new StatutDemandeClass());
    const [statuts, setStatuts] = useState<StatutDemande[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadStatuts();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadStatuts':
                    setStatuts(Array.isArray(data) ? data : data.content || []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Statut créé avec succès');
                    resetForm();
                    loadStatuts();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Statut modifié avec succès');
                    resetForm();
                    loadStatuts();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Statut supprimé avec succès');
                    loadStatuts();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadStatuts = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadStatuts');
    };

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        setStatut(new StatutDemandeClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStatut(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setStatut(prev => ({ ...prev, [name]: checked }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setStatut(prev => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (name: string, value: string) => {
        setStatut(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = (): boolean => {
        if (!statut.code?.trim()) {
            showToast('error', 'Erreur de validation', 'Le code est obligatoire');
            return false;
        }
        if (!statut.nameFr?.trim()) {
            showToast('error', 'Erreur de validation', 'Le nom en français est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (statut.id) {
            fetchData(statut, 'PUT', `${BASE_URL}/update/${statut.id}`, 'update');
        } else {
            fetchData(statut, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const handleEdit = (rowData: StatutDemande) => {
        setStatut({ ...rowData });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (rowData: StatutDemande) => {
        setStatut({ ...rowData });
        setIsViewMode(true);
        setActiveIndex(0);
    };

    const handleDelete = (rowData: StatutDemande) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le statut "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: StatutDemande) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const colorBodyTemplate = (rowData: StatutDemande) => {
        return (
            <div className="flex align-items-center gap-2">
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: rowData.color || '#000000',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
                <span>{rowData.color}</span>
            </div>
        );
    };

    const actionsBodyTemplate = (rowData: StatutDemande) => {
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
                <i className="pi pi-tag mr-2"></i>
                Gestion des Statuts de Demande de Crédit
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Statut" leftIcon="pi pi-plus mr-2">
                    <StatutDemandeForm
                        statut={statut}
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleNumberChange={handleNumberChange}
                        handleColorChange={handleColorChange}
                        isViewMode={isViewMode}
                    />

                    <div className="flex justify-content-end gap-2 mt-4">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            severity="secondary"
                            onClick={resetForm}
                        />
                        {!isViewMode && (
                            <Button
                                label={statut.id ? 'Modifier' : 'Enregistrer'}
                                icon={statut.id ? 'pi pi-check' : 'pi pi-save'}
                                onClick={handleSubmit}
                                loading={loading}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Statuts" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={statuts}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={loading && callType === 'loadStatuts'}
                        emptyMessage="Aucun statut trouvé"
                        className="p-datatable-sm"
                        sortField="sequenceOrder"
                        sortOrder={1}
                    >
                        <Column field="code" header="Code" sortable filter />
                        <Column field="nameFr" header="Nom" sortable filter />
                        <Column field="sequenceOrder" header="Ordre" sortable />
                        <Column header="Couleur" body={colorBodyTemplate} />
                        <Column
                            field="allowsEdit"
                            header="Modifiable"
                            body={(rowData) => (
                                <i className={`pi ${rowData.allowsEdit ? 'pi-check text-green-500' : 'pi-times text-red-500'}`} />
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
