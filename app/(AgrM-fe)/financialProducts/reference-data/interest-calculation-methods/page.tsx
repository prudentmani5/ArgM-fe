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
import { InterestCalculationMethod } from './InterestCalculationMethod';
import InterestCalculationMethodForm from './InterestCalculationMethodForm';

const BASE_URL = buildApiUrl('/api/financial-products/reference/interest-calculation-methods');

const InterestCalculationMethodsPage = () => {
    const [interestCalculationMethods, setInterestCalculationMethods] = useState<InterestCalculationMethod[]>([]);
    const [interestCalculationMethod, setInterestCalculationMethod] = useState<InterestCalculationMethod>(new InterestCalculationMethod());
    const [selectedInterestCalculationMethod, setSelectedInterestCalculationMethod] = useState<InterestCalculationMethod | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [totalRecords, setTotalRecords] = useState(0);
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
        loadInterestCalculationMethods();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadInterestCalculationMethods':
                    const items = Array.isArray(data) ? data : data.content || [];
                    setInterestCalculationMethods(items);
                    setTotalRecords(items.length);
                    break;
                case 'create':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt créée avec succès' });
                    loadInterestCalculationMethods();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt modifiée avec succès' });
                    loadInterestCalculationMethods();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt supprimée avec succès' });
                    loadInterestCalculationMethods();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue' });
        }
    }, [data, error, callType]);

    const loadInterestCalculationMethods = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadInterestCalculationMethods');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInterestCalculationMethod(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setInterestCalculationMethod(prev => ({ ...prev, [name]: checked }));
    };

    const saveInterestCalculationMethod = () => {
        if (!interestCalculationMethod.code || !interestCalculationMethod.name || !interestCalculationMethod.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        const methodToSave = { ...interestCalculationMethod, userAction: getConnectedUser() };

        if (isEditing && interestCalculationMethod.id) {
            fetchData(methodToSave, 'PUT', `${BASE_URL}/update/${interestCalculationMethod.id}`, 'update');
        } else {
            fetchData(methodToSave, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const editInterestCalculationMethod = (rowData: InterestCalculationMethod) => {
        setInterestCalculationMethod({ ...rowData });
        setIsEditing(true);
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: InterestCalculationMethod) => {
        setSelectedInterestCalculationMethod(rowData);
        setDisplayDialog(true);
    };

    const deleteInterestCalculationMethodConfirmed = () => {
        if (selectedInterestCalculationMethod?.id) {
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${selectedInterestCalculationMethod.id}`, 'delete');
            setDisplayDialog(false);
            setSelectedInterestCalculationMethod(null);
        }
    };

    const resetForm = () => {
        setInterestCalculationMethod(new InterestCalculationMethod());
        setIsEditing(false);
    };

    const actionBodyTemplate = (rowData: InterestCalculationMethod) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-warning"
                    onClick={() => editInterestCalculationMethod(rowData)}
                    tooltip="Modifier"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: InterestCalculationMethod) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Méthodes de Calcul d'Intérêts</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <Toast ref={toast} />
            <div className="col-12">
                <div className="card">
                    <h5>Méthodes de Calcul d'Intérêts</h5>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
                            <InterestCalculationMethodForm
                                interestCalculationMethod={interestCalculationMethod}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button
                                    label={isEditing ? 'Modifier' : 'Enregistrer'}
                                    icon="pi pi-check"
                                    onClick={saveInterestCalculationMethod}
                                    loading={loading && (callType === 'create' || callType === 'update')}
                                />
                                <Button
                                    label="Annuler"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={resetForm}
                                />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
                            <DataTable
                                value={interestCalculationMethods}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading && callType === 'loadInterestCalculationMethods'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucune méthode de calcul d'intérêt trouvée"
                                className="p-datatable-sm"
                            >
                                <Column field="code" header="Code" sortable filter />
                                <Column field="name" header="Nom" sortable filter />
                                <Column field="nameFr" header="Nom (FR)" sortable filter />
                                <Column field="formula" header="Formule" />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteInterestCalculationMethodConfirmed} autoFocus loading={loading && callType === 'delete'} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedInterestCalculationMethod && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedInterestCalculationMethod.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default InterestCalculationMethodsPage;
