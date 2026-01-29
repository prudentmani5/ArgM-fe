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
import { BillPaymentType } from './BillPaymentType';
import BillPaymentTypeForm from './BillPaymentTypeForm';

const BillPaymentTypesPage = () => {
    const [billPaymentTypes, setBillPaymentTypes] = useState<BillPaymentType[]>([]);
    const [billPaymentType, setBillPaymentType] = useState<BillPaymentType>(new BillPaymentType());
    const [selectedBillPaymentType, setSelectedBillPaymentType] = useState<BillPaymentType | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({ first: 0, rows: 10, page: 0 });
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: fetchData, loading: fetchLoading, error: fetchError } = useConsumApi('/api/financial-products/reference/bill-payment-types/findall');
    const { data: createData, loading: createLoading, error: createError, postData } = useConsumApi('/api/financial-products/reference/bill-payment-types/new');
    const { data: updateData, loading: updateLoading, error: updateError, putData } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, deleteData: deleteRecord } = useConsumApi('');

    useEffect(() => {
        if (fetchData) {
            setBillPaymentTypes(fetchData);
            setTotalRecords(fetchData.length);
        }
    }, [fetchData]);

    useEffect(() => {
        if (createData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de paiement de facture créé avec succès' });
            resetForm();
        }
    }, [createData]);

    useEffect(() => {
        if (updateData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de paiement de facture modifié avec succès' });
            resetForm();
        }
    }, [updateData]);

    useEffect(() => {
        if (deleteData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de paiement de facture supprimé avec succès' });
        }
    }, [deleteData]);

    useEffect(() => {
        if (createError || updateError || deleteError || fetchError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: createError || updateError || deleteError || fetchError });
        }
    }, [createError, updateError, deleteError, fetchError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setBillPaymentType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setBillPaymentType(prev => ({ ...prev, [name]: checked }));
    };

    const saveBillPaymentType = async () => {
        if (!billPaymentType.code || !billPaymentType.name || !billPaymentType.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        if (isEditing && billPaymentType.id) {
            await putData(`/api/financial-products/reference/bill-payment-types/update/${billPaymentType.id}`, billPaymentType);
        } else {
            await postData(billPaymentType);
        }
    };

    const editBillPaymentType = (rowData: BillPaymentType) => {
        setBillPaymentType({ ...rowData });
        setIsEditing(true);
    };

    const confirmDelete = (rowData: BillPaymentType) => {
        setSelectedBillPaymentType(rowData);
        setDisplayDialog(true);
    };

    const deleteBillPaymentTypeConfirmed = async () => {
        if (selectedBillPaymentType?.id) {
            await deleteRecord(`/api/financial-products/reference/bill-payment-types/delete/${selectedBillPaymentType.id}`);
            setDisplayDialog(false);
            setSelectedBillPaymentType(null);
        }
    };

    const resetForm = () => {
        setBillPaymentType(new BillPaymentType());
        setIsEditing(false);
    };

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const actionBodyTemplate = (rowData: BillPaymentType) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined className="p-button-warning" onClick={() => editBillPaymentType(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: BillPaymentType) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Types de Paiements de Facture</h4>
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
                    <h5>Bill Payment Types / Types de Paiement de Factures</h5>
                    <TabView>
                        <TabPanel header="Nouveau">
                            <BillPaymentTypeForm
                                billPaymentType={billPaymentType}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button label={isEditing ? 'Modifier' : 'Enregistrer'} icon="pi pi-check" onClick={saveBillPaymentType} loading={createLoading || updateLoading} />
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous">
                            <DataTable
                                value={billPaymentTypes}
                                lazy
                                paginator
                                first={lazyState.first}
                                rows={lazyState.rows}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                loading={loading || fetchLoading}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun(e) bill payment types trouvé(e)"
                            >
                                <Column field="code" header="Code" sortable />
                                <Column field="name" header="Nom" sortable />
                                <Column field="nameFr" header="Nom (FR)" sortable />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteBillPaymentTypeConfirmed} autoFocus loading={deleteLoading} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedBillPaymentType && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedBillPaymentType.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default BillPaymentTypesPage;
