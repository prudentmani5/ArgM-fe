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
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { ColorPicker } from 'primereact/colorpicker';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';
import { PassbookStatus, PassbookStatusClass } from './PassbookStatus';

const BASE_URL = `${API_BASE_URL}/api/epargne/passbook-statuses`;

function PassbookStatusPage() {
    const [passbookStatus, setPassbookStatus] = useState<PassbookStatus>(new PassbookStatusClass());
    const [passbookStatuses, setPassbookStatuses] = useState<PassbookStatus[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const { data, error, fetchData, callType } = useConsumApi('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadData':
                    setPassbookStatuses(Array.isArray(data) ? data : []);
                    break;
                case 'create':
                    showToast('success', 'Succès', 'Statut créé avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Statut mis à jour avec succès');
                    resetForm();
                    loadData();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Statut supprimé avec succès');
                    loadData();
                    break;
            }
        }
        if (error) {
            showToast('error', 'Erreur', error.message || 'Une erreur est survenue');
        }
    }, [data, error, callType]);

    const loadData = () => {
        setLoading(true);
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadData');
        setLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPassbookStatus(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setPassbookStatus(prev => ({ ...prev, [name]: checked }));
    };

    const handleColorChange = (value: string) => {
        setPassbookStatus(prev => ({ ...prev, colorCode: '#' + value }));
    };

    const validateForm = (): boolean => {
        if (!passbookStatus.code?.trim()) {
            showToast('warn', 'Attention', 'Le code est obligatoire');
            return false;
        }
        if (!passbookStatus.name?.trim()) {
            showToast('warn', 'Attention', 'Le nom (anglais) est obligatoire');
            return false;
        }
        if (!passbookStatus.nameFr?.trim()) {
            showToast('warn', 'Attention', 'Le nom (français) est obligatoire');
            return false;
        }
        return true;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        if (passbookStatus.id) {
            fetchData(passbookStatus, 'PUT', `${BASE_URL}/update/${passbookStatus.id}`, 'update');
        } else {
            fetchData(passbookStatus, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const resetForm = () => {
        setPassbookStatus(new PassbookStatusClass());
    };

    const editItem = (rowData: PassbookStatus) => {
        setPassbookStatus({ ...rowData });
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: PassbookStatus) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer le statut "${rowData.nameFr}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Oui, supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchData(null, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            }
        });
    };

    const statusBodyTemplate = (rowData: PassbookStatus) => {
        return (
            <Tag
                value={rowData.isActive ? 'Actif' : 'Inactif'}
                severity={rowData.isActive ? 'success' : 'danger'}
            />
        );
    };

    const colorBodyTemplate = (rowData: PassbookStatus) => {
        return (
            <div className="flex align-items-center gap-2">
                <div
                    style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: rowData.colorCode || '#ccc',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />
                <span>{rowData.colorCode}</span>
            </div>
        );
    };

    const actionsBodyTemplate = (rowData: PassbookStatus) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-warning p-button-sm"
                    onClick={() => editItem(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h5 className="m-0">Liste des Statuts de Livret</h5>
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
                <i className="pi pi-bookmark mr-2"></i>
                Gestion des Statuts de Livret
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau Statut" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary">Informations du Statut</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="code" className="font-medium">Code *</label>
                                    <InputText
                                        id="code"
                                        name="code"
                                        value={passbookStatus.code}
                                        onChange={handleChange}
                                        placeholder="Ex: ACTIF, PERDU, FERME"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="name" className="font-medium">Nom (Anglais) *</label>
                                    <InputText
                                        id="name"
                                        name="name"
                                        value={passbookStatus.name}
                                        onChange={handleChange}
                                        placeholder="Ex: Active, Lost, Closed"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="nameFr" className="font-medium">Nom (Français) *</label>
                                    <InputText
                                        id="nameFr"
                                        name="nameFr"
                                        value={passbookStatus.nameFr}
                                        onChange={handleChange}
                                        placeholder="Ex: Actif, Perdu, Fermé"
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12">
                                    <label htmlFor="description" className="font-medium">Description</label>
                                    <InputTextarea
                                        id="description"
                                        name="description"
                                        value={passbookStatus.description || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label htmlFor="colorCode" className="font-medium">Couleur</label>
                                    <div className="flex align-items-center gap-2">
                                        <ColorPicker
                                            value={passbookStatus.colorCode?.replace('#', '')}
                                            onChange={(e) => handleColorChange(e.value as string)}
                                        />
                                        <InputText
                                            value={passbookStatus.colorCode || ''}
                                            onChange={(e) => setPassbookStatus(prev => ({ ...prev, colorCode: e.target.value }))}
                                            placeholder="#28a745"
                                            className="w-8rem"
                                        />
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center mt-4">
                                        <Checkbox
                                            inputId="allowsTransactions"
                                            checked={passbookStatus.allowsTransactions}
                                            onChange={(e) => handleCheckboxChange('allowsTransactions', e.checked || false)}
                                        />
                                        <label htmlFor="allowsTransactions" className="ml-2">Autorise les transactions</label>
                                    </div>
                                </div>
                                <div className="field col-12 md:col-4">
                                    <div className="flex align-items-center mt-4">
                                        <Checkbox
                                            inputId="isActive"
                                            checked={passbookStatus.isActive}
                                            onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                                        />
                                        <label htmlFor="isActive" className="ml-2">Actif</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <Button
                            label={passbookStatus.id ? 'Mettre à jour' : 'Enregistrer'}
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

                <TabPanel header="Liste des Statuts" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={passbookStatuses}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        emptyMessage="Aucun statut trouvé"
                        stripedRows
                        showGridlines
                        size="small"
                    >
                        <Column field="code" header="Code" sortable />
                        <Column field="nameFr" header="Nom (FR)" sortable />
                        <Column field="name" header="Nom (EN)" sortable />
                        <Column field="colorCode" header="Couleur" body={colorBodyTemplate} />
                        <Column field="allowsTransactions" header="Transactions" body={(row) => row.allowsTransactions ? 'Oui' : 'Non'} />
                        <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '120px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </div>
    );
}

export default PassbookStatusPage;
