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
import { PaymentFrequency } from './PaymentFrequency';
import PaymentFrequencyForm from './PaymentFrequencyForm';

const BASE_URL = buildApiUrl('/api/financial-products/reference/payment-frequencies');

const PaymentFrequenciesPage = () => {
    const [paymentFrequencies, setPaymentFrequencies] = useState<PaymentFrequency[]>([]);
    const [paymentFrequency, setPaymentFrequency] = useState<PaymentFrequency>(new PaymentFrequency());
    const [selectedPaymentFrequency, setSelectedPaymentFrequency] = useState<PaymentFrequency | null>(null);
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
        loadPaymentFrequencies();
    }, []);

    useEffect(() => {
        if (data) {
            switch (callType) {
                case 'loadPaymentFrequencies':
                    const items = Array.isArray(data) ? data : data.content || [];
                    setPaymentFrequencies(items);
                    break;
                case 'create':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Fréquence de paiement créée avec succès' });
                    loadPaymentFrequencies();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Fréquence de paiement modifiée avec succès' });
                    loadPaymentFrequencies();
                    resetForm();
                    setActiveIndex(1);
                    break;
                case 'delete':
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Fréquence de paiement supprimée avec succès' });
                    loadPaymentFrequencies();
                    break;
            }
        }
        if (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: error.message || 'Une erreur est survenue' });
        }
    }, [data, error, callType]);

    const loadPaymentFrequencies = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadPaymentFrequencies');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPaymentFrequency(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setPaymentFrequency(prev => ({ ...prev, [name]: value || 0 }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setPaymentFrequency(prev => ({ ...prev, [name]: checked }));
    };

    const savePaymentFrequency = () => {
        if (!paymentFrequency.code || !paymentFrequency.name || !paymentFrequency.nameFr) {
            toast.current?.show({ severity: 'warn', summary: 'Validation', detail: 'Veuillez remplir les champs obligatoires' });
            return;
        }

        const paymentFrequencyToSave = { ...paymentFrequency, userAction: getConnectedUser() };

        if (isEditing && paymentFrequency.id) {
            fetchData(paymentFrequencyToSave, 'PUT', `${BASE_URL}/update/${paymentFrequency.id}`, 'update');
        } else {
            fetchData(paymentFrequencyToSave, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const editPaymentFrequency = (rowData: PaymentFrequency) => {
        setPaymentFrequency({ ...rowData });
        setIsEditing(true);
        setActiveIndex(0);
    };

    const confirmDelete = (rowData: PaymentFrequency) => {
        setSelectedPaymentFrequency(rowData);
        setDisplayDialog(true);
    };

    const deletePaymentFrequencyConfirmed = () => {
        if (selectedPaymentFrequency?.id) {
            fetchData(null, 'DELETE', `${BASE_URL}/delete/${selectedPaymentFrequency.id}`, 'delete');
            setDisplayDialog(false);
            setSelectedPaymentFrequency(null);
        }
    };

    const resetForm = () => {
        setPaymentFrequency(new PaymentFrequency());
        setIsEditing(false);
    };

    const actionBodyTemplate = (rowData: PaymentFrequency) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" rounded outlined className="p-button-warning" onClick={() => editPaymentFrequency(rowData)} tooltip="Modifier" />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} tooltip="Supprimer" />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: PaymentFrequency) => {
        return <Tag value={rowData.isActive ? 'Actif' : 'Inactif'} severity={rowData.isActive ? 'success' : 'danger'} />;
    };

    const header = (
        <div className="flex justify-content-between">
            <h4 className="m-0">Gérer les Fréquences de Paiement</h4>
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
                    <h5>Fréquences de Paiement</h5>
                    <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                        <TabPanel header="Nouveau" leftIcon="pi pi-plus mr-2">
                            <PaymentFrequencyForm
                                paymentFrequency={paymentFrequency}
                                handleChange={handleChange}
                                handleNumberChange={handleNumberChange}
                                handleCheckboxChange={handleCheckboxChange}
                            />
                            <div className="flex gap-2 mt-4">
                                <Button label={isEditing ? 'Modifier' : 'Enregistrer'} icon="pi pi-check" onClick={savePaymentFrequency} loading={loading && (callType === 'create' || callType === 'update')} />
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            </div>
                        </TabPanel>
                        <TabPanel header="Tous" leftIcon="pi pi-list mr-2">
                            <DataTable
                                value={paymentFrequencies}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                loading={loading && callType === 'loadPaymentFrequencies'}
                                globalFilter={globalFilter}
                                header={header}
                                emptyMessage="Aucune fréquence de paiement trouvée"
                                className="p-datatable-sm"
                            >
                                <Column field="code" header="Code" sortable filter />
                                <Column field="name" header="Nom" sortable filter />
                                <Column field="nameFr" header="Nom (FR)" sortable filter />
                                <Column field="paymentsPerYear" header="Paiements/An" sortable />
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
                        <Button label="Oui" icon="pi pi-check" onClick={deletePaymentFrequencyConfirmed} autoFocus loading={loading && callType === 'delete'} />
                    </>
                }
                onHide={() => setDisplayDialog(false)}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    {selectedPaymentFrequency && <span>Êtes-vous sûr de vouloir supprimer <b>{selectedPaymentFrequency.name}</b>?</span>}
                </div>
            </Dialog>
        </div>
    );
};

export default PaymentFrequenciesPage;
