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
import { InterestCalculationMethod } from './InterestCalculationMethod';
import InterestCalculationMethodForm from './InterestCalculationMethodForm';

const InterestCalculationMethodsPage = () => {
    const [interestCalculationMethods, setInterestCalculationMethods] = useState<InterestCalculationMethod[]>([]);
    const [interestCalculationMethod, setInterestCalculationMethod] = useState<InterestCalculationMethod>(new InterestCalculationMethod());
    const [selectedInterestCalculationMethod, setSelectedInterestCalculationMethod] = useState<InterestCalculationMethod | null>(null);
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
    const { data: fetchData, loading: fetchLoading, error: fetchError } = useConsumApi('/api/financial-products/reference/interest-calculation-methods/findall');
    const { data: createData, loading: createLoading, error: createError, postData } = useConsumApi('/api/financial-products/reference/interest-calculation-methods/new');
    const { data: updateData, loading: updateLoading, error: updateError, putData } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, deleteData: deleteRecord } = useConsumApi('');

    useEffect(() => {
        loadInterestCalculationMethods();
    }, []);

    useEffect(() => {
        if (fetchData) {
            setInterestCalculationMethods(fetchData);
            setTotalRecords(fetchData.length);
        }
    }, [fetchData]);

    useEffect(() => {
        if (createData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt créée avec succès' });
            loadInterestCalculationMethods();
            resetForm();
        }
    }, [createData]);

    useEffect(() => {
        if (updateData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt modifiée avec succès' });
            loadInterestCalculationMethods();
            resetForm();
        }
    }, [updateData]);

    useEffect(() => {
        if (deleteData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Méthode de calcul d\'intérêt supprimée avec succès' });
            loadInterestCalculationMethods();
        }
    }, [deleteData]);

    useEffect(() => {
        if (createError || updateError || deleteError || fetchError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: createError || updateError || deleteError || fetchError });
        }
    }, [createError, updateError, deleteError, fetchError]);

    const loadInterestCalculationMethods = () => {
        setLoading(true);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setInterestCalculationMethod(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setInterestCalculationMethod(prev => ({ ...prev, [name]: checked }));
    };

    const saveInterestCalculationMethod = async () => {
        if (!interestCalculationMethod.code || !interestCalculationMethod.name || !interestCalculationMethod.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        if (isEditing && interestCalculationMethod.id) {
            await putData(`/api/financial-products/reference/interest-calculation-methods/update/${interestCalculationMethod.id}`, interestCalculationMethod);
        } else {
            await postData(interestCalculationMethod);
        }
    };

    const editInterestCalculationMethod = (rowData: InterestCalculationMethod) => {
        setInterestCalculationMethod({ ...rowData });
        setIsEditing(true);
    };

    const confirmDelete = (rowData: InterestCalculationMethod) => {
        setSelectedInterestCalculationMethod(rowData);
        setDisplayDialog(true);
    };

    const deleteInterestCalculationMethodConfirmed = async () => {
        if (selectedInterestCalculationMethod?.id) {
            await deleteRecord(`/api/financial-products/reference/interest-calculation-methods/delete/${selectedInterestCalculationMethod.id}`);
            setDisplayDialog(false);
            setSelectedInterestCalculationMethod(null);
        }
    };

    const resetForm = () => {
        setInterestCalculationMethod(new InterestCalculationMethod());
        setIsEditing(false);
    };

    const onPage = (event: any) => {
        setLazyState(event);
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
                    <h5>Interest Calculation Methods / Méthodes de Calcul d'Intérêts</h5>
                    <TabView>
                        <TabPanel header="Nouveau">
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
                                value={interestCalculationMethods}
                                lazy
                                paginator
                                first={lazyState.first}
                                rows={lazyState.rows}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                loading={loading || fetchLoading}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucune méthode de calcul d'intérêt trouvée"
                            >
                                <Column field="code" header="Code" sortable />
                                <Column field="name" header="Nom" sortable />
                                <Column field="nameFr" header="Nom (FR)" sortable />
                                <Column field="formula" header="Formule" />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteInterestCalculationMethodConfirmed} autoFocus loading={deleteLoading} />
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
