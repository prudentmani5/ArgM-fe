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
import { Currency } from './Currency';
import CurrencyForm from './CurrencyForm';

const BASE_URL = buildApiUrl('/api/financial-products/reference/currencies');

const CurrenciesPage = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currency, setCurrency] = useState<Currency>(new Currency());
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
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
        loadCurrencies();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadCurrencies':
                    const items = Array.isArray(data) ? data : data.content || [];
                    setCurrencies(items);
                    setTotalRecords(items.length);
                    break;
                case 'create':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise créée avec succès' });
                    loadCurrencies();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise modifiée avec succès' });
                    loadCurrencies();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Devise supprimée avec succès' });
                    loadCurrencies();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue' });
        }
    }, [data, error, callType]);

    const loadCurrencies = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadCurrencies');
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

    const saveCurrency = () => {
        if (!currency.code || !currency.name || !currency.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        const currencyToSave = { ...currency, userAction: getConnectedUser() };

        if (isEditing && currency.id) {
            fetchData(currencyToSave, 'PUT', `${BASE_URL}/update/${currency.id}`, 'update');
        } else {
            fetchData(currencyToSave, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const editCurrency = (rowData: Currency) => {
        setCurrency({ ...rowData });
        setIsEditing(true);
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: Currency) => {
        setSelectedCurrency(rowData);
        setDisplayDialog(true);
    };

    const deleteCurrencyConfirmed = () => {
        if (selectedCurrency?.id) {
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${selectedCurrency.id}`, 'delete');
            setDisplayDialog(false);
            setSelectedCurrency(null);
        }
    };

    const resetForm = () => {
        setCurrency(new Currency());
        setIsEditing(false);
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
                    <h5>Devises</h5>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
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
                                value={currencies}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading && callType === 'loadCurrencies'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucune devise trouvée"
                                className="p-datatable-sm"
                            >
                                <Column field="code" header="Code" sortable filter />
                                <Column field="name" header="Nom" sortable filter />
                                <Column field="nameFr" header="Nom (FR)" sortable filter />
                                <Column field="symbol" header="Symbole" />
                                <Column field="decimalPlaces" header="Décimales" />
                                <Column header="Par défaut" body={defaultBodyTemplate} />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deleteCurrencyConfirmed} autoFocus loading={loading && callType === 'delete'} />
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
