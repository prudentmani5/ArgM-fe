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
import { LoanGuaranteeType } from './LoanGuaranteeType';
import LoanGuaranteeTypeForm from './LoanGuaranteeTypeForm';

const LoanGuaranteeTypesPage = () => {
    const [loanGuaranteeTypes, setLoanGuaranteeTypes] = useState<LoanGuaranteeType[]>([]);
    const [loanGuaranteeType, setLoanGuaranteeType] = useState<LoanGuaranteeType>(new LoanGuaranteeType());
    const [selectedLoanGuaranteeType, setSelectedLoanGuaranteeType] = useState<LoanGuaranteeType | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setLazyState] = useState({ first: 0, rows: 10, page: 0 });
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const toast = useRef<Toast>(null);
    const { data: fetchData, loading: fetchLoading, error: fetchError } = useConsumApi('/api/financial-products/reference/loan-guarantee-types/findall');
    const { data: createData, loading: createLoading, error: createError, postData } = useConsumApi('/api/financial-products/reference/loan-guarantee-types/new');
    const { data: updateData, loading: updateLoading, error: updateError, putData } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, deleteData: deleteRecord } = useConsumApi('');

    useEffect(() => {
        if (fetchData) {
            setLoanGuaranteeTypes(fetchData);
            setTotalRecords(fetchData.length);
        }
    }, [fetchData]);

    useEffect(() => {
        if (createData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de garantie de prêt créé avec succès' });
            resetForm();
        }
    }, [createData]);

    useEffect(() => {
        if (updateData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de garantie de prêt modifié avec succès' });
            resetForm();
        }
    }, [updateData]);

    useEffect(() => {
        if (deleteData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Type de garantie de prêt supprimé avec succès' });
        }
    }, [deleteData]);

    useEffect(() => {
        if (createError || updateError || deleteError || fetchError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: createError || updateError || deleteError || fetchError });
        }
    }, [createError, updateError, deleteError, fetchError]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLoanGuaranteeType(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setLoanGuaranteeType(prev => ({ ...prev, [name]: checked }));
    };

    const saveLoanGuaranteeType = async () => {
        if (!loanGuaranteeType.code || !loanGuaranteeType.name || !loanGuaranteeType.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        if (isEditing && loanGuaranteeType.id) {
            await putData(`/api/financial-products/reference/loan-guarantee-types/update/${loanGuaranteeType.id}`, loanGuaranteeType);
        } else {
            await postData(loanGuaranteeType);
        }
    };

    const editLoanGuaranteeType = (rowData: LoanGuaranteeType) => {
        setLoanGuaranteeType({ ...rowData });
        setIsEditing(true);
    };

    const confirmDelete = (rowData: LoanGuaranteeType) => {
        setSelectedLoanGuaranteeType(rowData);
        setDisplayDialog(true);
    };

    const deleteLoanGuaranteeTypeConfirmed = async () => {
        if (selectedLoanGuaranteeType?.id) {
            await deleteRecord(`/api/financial-products/reference/loan-guarantee-types/delete/${selectedLoanGuaranteeType.id}`);
            setDisplayDialog(false);
            setSelectedLoanGuaranteeType(null);
        }
    };

    const resetForm = () => {
        setLoanGuaranteeType(new LoanGuaranteeType());
        setIsEditing(false);
    };

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const actionBodyTemplate = (rowData: LoanGuaranteeType) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined className="p-button-warning" onClick={() => editLoanGuaranteeType(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: LoanGuaranteeType) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Types de Garanties de Prêt</h4>
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
                    <h5>Loan Guarantee Types / Types de Garantie de Prêt</h5>
                    <TabView>
                        <TabPanel header="Nouveau">
                            <LoanGuaranteeTypeForm
                                loanGuaranteeType={loanGuaranteeType}
                                handleChange={handleChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button label={isEditing ? 'Modifier' : 'Enregistrer'} icon="pi pi-check" onClick={saveLoanGuaranteeType} loading={createLoading || updateLoading} />
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous">
                            <DataTable
                                value={loanGuaranteeTypes}
                                lazy
                                paginator
                                first={lazyState.first}
                                rows={lazyState.rows}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                loading={loading || fetchLoading}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucun(e) loan guarantee types trouvé(e)"
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteLoanGuaranteeTypeConfirmed} autoFocus loading={deleteLoading} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedLoanGuaranteeType && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedLoanGuaranteeType.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default LoanGuaranteeTypesPage;
