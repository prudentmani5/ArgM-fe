'use client';
import React, { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import Cookies from 'js-cookie';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { FeeType } from './FeeType';
import FeeTypeForm from './FeeTypeForm';

const BASE_URL = buildApiUrl('/api/financial-products/reference/fee-types');

const FeeTypesPage = () => {
    const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);
    const [feeType, setFeeType] = useState<FeeType>(new FeeType());
    const [selectedFeeType, setSelectedFeeType] = useState<FeeType | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData, callType } = useConsumApi('');

    // Get connected user from cookies
    const getConnectedUser = (): string => {
        const appUserCookie = Cookies.get('appUser');
        if (appUserCookie) {
            try {
                const appUser = JSON.parse(appUserCookie);
                return appUser.email || `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || 'Unknown';
            } catch {
                return 'Unknown';
            }
        }
        return 'Unknown';
    };

    useEffect(() => {
        loadFeeTypes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadFeeTypes':
                    const items = Array.isArray(data) ? data : data.content || [];
                    setFeeTypes(items);
                    break;
                case 'create':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de frais créé avec succès' });
                    loadFeeTypes();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de frais modifié avec succès' });
                    loadFeeTypes();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de frais supprimé avec succès' });
                    loadFeeTypes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue' });
        }
    }, [data, error, callType]);

    const loadFeeTypes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadFeeTypes');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFeeType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFeeType(prev => ({ ...prev, [name]: checked }));
    };

    const saveFeeType = () => {
        if (!feeType.code || !feeType.name || !feeType.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        const feeTypeToSave = { ...feeType, userAction: getConnectedUser() };

        if (isEditing && feeType.id) {
            fetchData(feeTypeToSave, 'PUT', `${BASE_URL}/update/${feeType.id}`, 'update');
        } else {
            fetchData(feeTypeToSave, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const editFeeType = (rowData: FeeType) => {
        setFeeType({ ...rowData });
        setIsEditing(true);
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: FeeType) => {
        setSelectedFeeType(rowData);
        setDisplayDialog(true);
    };

    const deleteFeeTypeConfirmed = () => {
        if (selectedFeeType?.id) {
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${selectedFeeType.id}`, 'delete');
            setDisplayDialog(false);
            setSelectedFeeType(null);
        }
    };

    const resetForm = () => {
        setFeeType(new FeeType());
        setIsEditing(false);
    };

    const actionBodyTemplate = (rowData: FeeType) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined className="p-button-warning" onClick={() => editFeeType(rowData)} tooltip="Modifier" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} tooltip="Supprimer" />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: FeeType) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Types de Frais</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Types de Frais</h5>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
                            <FeeTypeForm
                                feeType={feeType}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button label={isEditing ? 'Modifier' : 'Enregistrer'} icon="pi pi-check" onClick={saveFeeType} loading={loading && (callType === 'create' || callType === 'update')} />
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
                            <DataTable
                                value={feeTypes}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading && callType === 'loadFeeTypes'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun type de frais trouvé"
                                className="p-datatable-sm"
                            >
                                <Column field="code" header="Code" sortable filter />
                                <Column field="name" header="Nom" sortable filter />
                                <Column field="nameFr" header="Nom (FR)" sortable filter />
                                <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                                <Column body={actionBodyTemplate} header="Actions" style={{ width: '120px' }} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            <Dialog
                visible={displayDialog}
                style={{ width: '450px' }}
                header="Confirmer la suppression"
                modal
                footer={
                    <>
                        <Button label="Non" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
                        <Button label="Oui" icon="pi pi-check" onClick={deleteFeeTypeConfirmed} autoFocus loading={loading && callType === 'delete'} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedFeeType && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedFeeType.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default FeeTypesPage;
