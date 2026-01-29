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
import { Currency } from './Currency';
import CurrencyForm from './CurrencyForm';

const CurrenciesPage = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currency, setCurrency] = useState<Currency>(new Currency());
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
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
    const { data: fetchData, loading: fetchLoading, error: fetchError } = useConsumApi('/api/financial-products/reference/currencies/findall');
    const { data: createData, loading: createLoading, error: createError, postData } = useConsumApi('/api/financial-products/reference/currencies/new');
    const { data: updateData, loading: updateLoading, error: updateError, putData } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, deleteData: deleteRecord } = useConsumApi('');

    useEffect(() => {
        loadCurrencies();
    }, []);

    useEffect(() => {
        if (fetchData) {
            setCurrencies(fetchData);
            setTotalRecords(fetchData.length);
        }
    }, [fetchData]);

    useEffect(() => {
        if (createData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise créée avec succès' });
            loadCurrencies();
            resetForm();
        }
    }, [createData]);

    useEffect(() => {
        if (updateData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise modifiée avec succès' });
            loadCurrencies();
            resetForm();
        }
    }, [updateData]);

    useEffect(() => {
        if (deleteData) {
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise supprimée avec succès' });
            loadCurrencies();
        }
    }, [deleteData]);

    useEffect(() => {
        if (createError || updateError || deleteError || fetchError) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: createError || updateError || deleteError || fetchError });
        }
    }, [createError, updateError, deleteError, fetchError]);

    const loadCurrencies = () => {
        setLoading(true);
        // Trigger fetch - useConsumApi will handle it
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setCurrency(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setCurrency(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setCurrency(prev => ({ ...prev, [name]: checked }));
    };

    const saveCurrency = async () => {
        if (!currency.code || !currency.name || !currency.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        if (isEditing && currency.id) {
            await putData(`/api/financial-products/reference/currencies/update/${currency.id}`, currency);
        } else {
            await postData(currency);
        }
    };

    const editCurrency = (rowData: Currency) => {
        setCurrency({ ...rowData });
        setIsEditing(true);
    };

    const confirmDelete = (rowData: Currency) => {
        setSelectedCurrency(rowData);
        setDisplayDialog(true);
    };

    const deleteCurrencyConfirmed = async () => {
        if (selectedCurrency?.id) {
            await deleteRecord(`/api/financial-products/reference/currencies/delete/${selectedCurrency.id}`);
            setDisplayDialog(false);
            setSelectedCurrency(null);
        }
    };

    const resetForm = () => {
        setCurrency(new Currency());
        setIsEditing(false);
    };

    const onPage = (event: any) => {
        setLazyState(event);
    };

    const actionBodyTemplate = (rowData: Currency) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-warning"
                    onClick={() => editCurrency(rowData)}
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

    const statusBodyTemplate = (rowData: Currency) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const defaultBodyTemplate = (rowData: Currency) => {
        return rowData.isDefault ? <Tag value="Par défaut" severity="info" /> : null;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Devises</h4>
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
                    <h5>Currencies / Devises</h5>
                    <TabView>
                        <TabPanel header="Nouveau">
                            <CurrencyForm
                                currency={currency}
                                handleChange={handleChange}
                                handleNumberChange={handleNumberChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button
                                    label={isEditing ? 'Modifier' : 'Enregistrer'}
                                    icon="pi pi-check"
                                    onClick={saveCurrency}
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
                                value={currencies}
                                lazy
                                paginator
                                first={lazyState.first}
                                rows={lazyState.rows}
                                totalRecords={totalRecords}
                                onPage={onPage}
                                loading={loading || fetchLoading}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucune devise trouvée"
                            >
                                <Column field="code" header="Code" sortable />
                                <Column field="name" header="Nom" sortable />
                                <Column field="nameFr" header="Nom (FR)" sortable />
                                <Column field="symbol" header="Symbole" />
                                <Column field="decimalPlaces" header="Décimales" />
                                <Column header="Par défaut" body={defaultBodyTemplate} />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteCurrencyConfirmed} autoFocus loading={deleteLoading} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedCurrency && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedCurrency.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default CurrenciesPage;
