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
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { LoanProductType } from './LoanProductType';
import LoanProductTypeForm from './LoanProductTypeForm';

const LoanProductTypesPage = () => {
    const [loanProductTypes, setLoanProductTypes] = useState<LoanProductType[]>([]);
    const [loanProductType, setLoanProductType] = useState<LoanProductType>(new LoanProductType());
    const [selectedLoanProductType, setSelectedLoanProductType] = useState<LoanProductType | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 0
    });
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: fetchData, loading: fetchLoading, error: fetchError } = useConsumApi('/api/financial-products/reference/loan-product-types/findall');
    const { data: createData, loading: createLoading, error: createError, postData } = useConsumApi('/api/financial-products/reference/loan-product-types/new');
    const { data: updateData, loading: updateLoading, error: updateError, putData } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, deleteData: deleteRecord } = useConsumApi('');

    useEffect(() => {
        loadLoanProductTypes();
    }, []);

    useEffect(() => {
        if (fetchData) {
            setLoanProductTypes(fetchData);
            setTotalRecords(fetchData.length);
        }
    }, [fetchData]);

    useEffect(() => {
        if (createData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit créé avec succès' });
            loadLoanProductTypes();
            resetForm();
        }
    }, [createData]);

    useEffect(() => {
        if (updateData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit modifié avec succès' });
            loadLoanProductTypes();
            resetForm();
        }
    }, [updateData]);

    useEffect(() => {
        if (deleteData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de produit de crédit supprimé avec succès' });
            loadLoanProductTypes();
        }
    }, [deleteData]);

    useEffect(() => {
        if (createError || updateError || deleteError || fetchError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: createError || updateError || deleteError || fetchError });
        }
    }, [createError, updateError, deleteError, fetchError]);

    const loadLoanProductTypes = () => {
        setLoading(true);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLoanProductType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setLoanProductType(prev => ({ ...prev, [name]: checked }));
    };

    const saveLoanProductType = async () => {
        if (!loanProductType.code || !loanProductType.name || !loanProductType.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        if (isEditing && loanProductType.id) {
            await putData(`/api/financial-products/reference/loan-product-types/update/${loanProductType.id}`, loanProductType);
        } else {
            await postData(loanProductType);
        }
    };

    const editLoanProductType = (rowData: LoanProductType) => {
        setLoanProductType({ ...rowData });
        setIsEditing(true);
    };

    const confirmDelete = (rowData: LoanProductType) => {
        setSelectedLoanProductType(rowData);
        setDisplayDialog(true);
    };

    const deleteLoanProductTypeConfirmed = async () => {
        if (selectedLoanProductType?.id) {
            await deleteRecord(`/api/financial-products/reference/loan-product-types/delete/${selectedLoanProductType.id}`);
            setDisplayDialog(false);
            setSelectedLoanProductType(null);
        }
    };

    const resetForm = () => {
        setLoanProductType(new LoanProductType());
        setIsEditing(false);
    };

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const actionBodyTemplate = (rowData: LoanProductType) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-warning"
                    onClick={() => editLoanProductType(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                />
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
                    <h5>Loan Product Types / Types de Produits de Crédit</h5>
                    <TabView>
                        <TabPanel header="Nouveau">
                            <LoanProductTypeForm
                                loanProductType={loanProductType}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button
                                    label={isEditing ? 'Modifier' : 'Enregistrer'}
                                    icon="pi pi-check"
                                    onClick={saveLoanProductType}
                                    loading={createLoading || updateLoading}
                                />
                                <Button
                                    label="Annuler"
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={resetForm}
                                />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous">
                            <DataTable
                                value={loanProductTypes}
                                lazy
                                paginator
                                first={lazyState.first}
                                rows={lazyState.rows}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                loading={loading || fetchLoading}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun type de produit de crédit trouvé"
                            >
                                <Column field="code" header="Code" sortable />
                                <Column field="name" header="Nom" sortable />
                                <Column field="nameFr" header="Nom (FR)" sortable />
                                <Column field="description" header="Description" />
                                <Column field="isActive" header="Statut" body={statusBodyTemplate} sortable />
                                <Column body={actionBodyTemplate} header="Actions" />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            </div>

            <Dialog
                visible={displayDialog}
                style={{ width: '450px' }}
                header="Confirmer"
                modal
                footer={
                    <>
                        <Button label="Non" icon="pi pi-times" onClick={() => setDisplayDialog(false)} className="p-button-text" />
                        <Button label="Oui" icon="pi pi-check" onClick={deleteLoanProductTypeConfirmed} autoFocus loading={deleteLoading} />
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
