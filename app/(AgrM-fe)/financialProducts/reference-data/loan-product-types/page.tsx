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
import { LoanProductType } from './LoanProductType';
import LoanProductTypeForm from './LoanProductTypeForm';

const BASE_URL = buildApiUrl('/api/financial-products/reference/loan-product-types');

const LoanProductTypesPage = () => {
    const [loanProductTypes, setLoanProductTypes] = useState<LoanProductType[]>([]);
    const [loanProductType, setLoanProductType] = useState<LoanProductType>(new LoanProductType());
    const [selectedLoanProductType, setSelectedLoanProductType] = useState<LoanProductType | null>(null);
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
        loadLoanProductTypes();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadLoanProductTypes':
                    const items = Array.isArray(data) ? data : data.content || [];
                    setLoanProductTypes(items);
                    break;
                case 'create':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit créé avec succès' });
                    loadLoanProductTypes();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit modifié avec succès' });
                    loadLoanProductTypes();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit supprimé avec succès' });
                    loadLoanProductTypes();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue' });
        }
    }, [data, error, callType]);

    const loadLoanProductTypes = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadLoanProductTypes');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLoanProductType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setLoanProductType(prev => ({ ...prev, [name]: checked }));
    };

    const saveLoanProductType = () => {
        if (!loanProductType.code || !loanProductType.name || !loanProductType.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        const loanProductTypeToSave = { ...loanProductType, userAction: getConnectedUser() };

        if (isEditing && loanProductType.id) {
            fetchData(loanProductTypeToSave, 'PUT', `${BASE_URL}/update/${loanProductType.id}`, 'update');
        } else {
            fetchData(loanProductTypeToSave, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const editLoanProductType = (rowData: LoanProductType) => {
        setLoanProductType({ ...rowData });
        setIsEditing(true);
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: LoanProductType) => {
        setSelectedLoanProductType(rowData);
        setDisplayDialog(true);
    };

    const deleteLoanProductTypeConfirmed = () => {
        if (selectedLoanProductType?.id) {
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${selectedLoanProductType.id}`, 'delete');
            setDisplayDialog(false);
            setSelectedLoanProductType(null);
        }
    };

    const resetForm = () => {
        setLoanProductType(new LoanProductType());
        setIsEditing(false);
    };

    const actionBodyTemplate = (rowData: LoanProductType) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined className="p-button-warning" onClick={() => editLoanProductType(rowData)} tooltip="Modifier" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} tooltip="Supprimer" />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: LoanProductType) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Types de Produits de Crédit</h4>
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
                    <h5>Types de Produits de Crédit</h5>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
                            <LoanProductTypeForm
                                loanProductType={loanProductType}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button label={isEditing ? 'Modifier' : 'Enregistrer'} icon="pi pi-check" onClick={saveLoanProductType} loading={loading && (callType === 'create' || callType === 'update')} />
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
                            <DataTable
                                value={loanProductTypes}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading && callType === 'loadLoanProductTypes'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun type de produit de crédit trouvé"
                                className="p-datatable-sm"
                            >
                                <Column field="code" header="Code" sortable filter />
                                <Column field="name" header="Nom" sortable filter />
                                <Column field="nameFr" header="Nom (FR)" sortable filter />
                                <Column field="description" header="Description" />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteLoanProductTypeConfirmed} autoFocus loading={loading && callType === 'delete'} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedLoanProductType && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedLoanProductType.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default LoanProductTypesPage;
