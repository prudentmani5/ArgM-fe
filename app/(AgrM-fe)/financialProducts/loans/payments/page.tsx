'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { LoanPayment } from './LoanPayment';
import LoanPaymentForm from './LoanPaymentForm';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

const BASE_URL = buildApiUrl('/api/financial-products/payments');

const LoanPaymentPage = () => {
    const [entities, setEntities] = useState<LoanPayment[]>([]);
    const [entity, setEntity] = useState<LoanPayment>(new LoanPayment());
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const actionsApi = useConsumApi('');

    useEffect(() => {
        fetchEntities();
    }, []);

    // List response
    useEffect(() => {
        if (listApi.data) {
            setEntities(Array.isArray(listApi.data) ? listApi.data : []);
            setLoading(false);
        }
        if (listApi.error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des paiements',
                life: 3000
            });
            setLoading(false);
        }
    }, [listApi.data, listApi.error]);

    // Actions response
    useEffect(() => {
        if (actionsApi.data) {
            switch (actionsApi.callType) {
                case 'create':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Paiement créé avec succès',
                        life: 3000
                    });
                    fetchEntities();
                    hideDialog();
                    setActiveIndex(1);
                    break;
                case 'update':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Paiement modifié avec succès',
                        life: 3000
                    });
                    fetchEntities();
                    hideDialog();
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Paiement supprimé avec succès',
                        life: 3000
                    });
                    fetchEntities();
                    break;
            }
        }
        if (actionsApi.error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: actionsApi.error.message || 'Une erreur est survenue',
                life: 3000
            });
        }
    }, [actionsApi.data, actionsApi.error, actionsApi.callType]);

    const fetchEntities = () => {
        setLoading(true);
        listApi.fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAll');
    };

    const openNew = () => {
        setEntity(new LoanPayment());
        setIsEdit(false);
        setDisplayDialog(true);
        setActiveIndex(0);
    };

    const editEntity = (rowData: LoanPayment) => {
        setEntity({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanPayment());
        setIsEdit(false);
    };

    const saveEntity = () => {
        const dataToSend = { ...entity, userAction: getUserAction() };

        if (isEdit) {
            actionsApi.fetchData(dataToSend, 'PUT', `${BASE_URL}/update/${entity.id}`, 'update');
        } else {
            actionsApi.fetchData(dataToSend, 'POST', `${BASE_URL}/new`, 'create');
        }
    };

    const confirmDelete = (rowData: LoanPayment) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce paiement ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                actionsApi.fetchData({ userAction: getUserAction() }, 'DELETE', `${BASE_URL}/delete/${rowData.id}`, 'delete');
            },
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEntity(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: any) => {
        setEntity(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setEntity(prev => ({ ...prev, [name]: value }));
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'success';
            case 'PENDING': return 'warning';
            case 'REVERSED': return 'danger';
            case 'FAILED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'COMPLETED': 'TERMINÉ',
            'PENDING': 'EN ATTENTE',
            'REVERSED': 'ANNULÉ',
            'FAILED': 'ÉCHOUÉ'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: LoanPayment) => (
        <Badge value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status) as any} />
    );

    const actionBodyTemplate = (rowData: LoanPayment) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editEntity(rowData)} tooltip="Modifier" tooltipOptions={{ position: 'top' }} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} tooltip="Supprimer" tooltipOptions={{ position: 'top' }} />
        </div>
    );

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    const amountBodyTemplate = (rowData: LoanPayment) => formatCurrency(rowData.paymentAmount);

    const dialogFooter = (
        <div>
            <Button label="Annuler" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
            <Button label="Enregistrer" icon="pi pi-check" onClick={saveEntity} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h3>Gestion des Paiements de Prêt</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau">
                    <div className="card">
                        <LoanPaymentForm entity={entity} handleChange={handleChange} handleNumberChange={handleNumberChange} handleDropdownChange={handleDropdownChange} />
                        <div className="flex justify-content-end mt-3">
                            <Button label="Enregistrer" icon="pi pi-check" onClick={saveEntity} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Tous">
                    <div className="flex justify-content-end mb-3">
                        <Button label="Nouveau" icon="pi pi-plus" onClick={openNew} />
                    </div>
                    <DataTable value={entities} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading} responsiveLayout="scroll" emptyMessage="Aucun paiement trouvé">
                        <Column field="paymentNumber" header="Numéro" sortable filter />
                        <Column field="paymentDate" header="Date" sortable />
                        <Column field="paymentAmount" header="Montant" sortable body={amountBodyTemplate} />
                        <Column field="paymentMethod" header="Méthode" sortable />
                        <Column field="receiptNumber" header="Reçu" sortable />
                        <Column field="status" header="Statut" sortable body={statusBodyTemplate} />
                        <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog visible={displayDialog} style={{ width: '80vw' }} header={isEdit ? 'Modifier le Paiement' : 'Nouveau Paiement'} modal className="p-fluid" footer={dialogFooter} onHide={hideDialog}>
                <LoanPaymentForm entity={entity} handleChange={handleChange} handleNumberChange={handleNumberChange} handleDropdownChange={handleDropdownChange} />
            </Dialog>
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['REMBOURSEMENT_VIEW']}>
            <LoanPaymentPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
