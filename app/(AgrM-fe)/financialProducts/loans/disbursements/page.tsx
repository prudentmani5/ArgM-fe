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
import { LoanDisbursement } from './LoanDisbursement';
import LoanDisbursementForm from './LoanDisbursementForm';
import { ProtectedPage } from '@/components/ProtectedPage';
import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

const BASE_URL = buildApiUrl('/api/financial-products/disbursements');

const LoanDisbursementPage = () => {
    const [entities, setEntities] = useState<LoanDisbursement[]>([]);
    const [entity, setEntity] = useState<LoanDisbursement>(new LoanDisbursement());
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
                detail: 'Erreur lors de la récupération des décaissements',
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
                        detail: 'Décaissement créé avec succès',
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
                        detail: 'Décaissement modifié avec succès',
                        life: 3000
                    });
                    fetchEntities();
                    hideDialog();
                    break;
                case 'delete':
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Décaissement supprimé avec succès',
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
        setEntity(new LoanDisbursement());
        setIsEdit(false);
        setDisplayDialog(true);
        setActiveIndex(0);
    };

    const editEntity = (rowData: LoanDisbursement) => {
        setEntity({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanDisbursement());
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

    const confirmDelete = (rowData: LoanDisbursement) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce décaissement ?',
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
            case 'PENDING': return 'warning';
            case 'APPROVED': return 'info';
            case 'DISBURSED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'EN ATTENTE',
            'APPROVED': 'APPROUVÉ',
            'DISBURSED': 'DÉCAISSÉ',
            'CANCELLED': 'ANNULÉ'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: LoanDisbursement) => (
        <Badge value={getStatusLabel(rowData.status)} severity={getStatusSeverity(rowData.status) as any} />
    );

    const actionBodyTemplate = (rowData: LoanDisbursement) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editEntity(rowData)} tooltip="Modifier" tooltipOptions={{ position: 'top' }} />
            <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} tooltip="Supprimer" tooltipOptions={{ position: 'top' }} />
        </div>
    );

    const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

    const amountBodyTemplate = (rowData: LoanDisbursement) => formatCurrency(rowData.disbursedAmount);

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
            <h3>Gestion des Décaissements</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau">
                    <div className="card">
                        <LoanDisbursementForm entity={entity} handleChange={handleChange} handleNumberChange={handleNumberChange} handleDropdownChange={handleDropdownChange} />
                        <div className="flex justify-content-end mt-3">
                            <Button label="Enregistrer" icon="pi pi-check" onClick={saveEntity} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Tous">
                    <div className="flex justify-content-end mb-3">
                        <Button label="Nouveau" icon="pi pi-plus" onClick={openNew} />
                    </div>
                    <DataTable value={entities} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} loading={loading} responsiveLayout="scroll" emptyMessage="Aucun décaissement trouvé">
                        <Column field="disbursementNumber" header="Numéro" sortable filter />
                        <Column field="disbursementDate" header="Date" sortable />
                        <Column field="disbursedAmount" header="Montant" sortable body={amountBodyTemplate} />
                        <Column field="disbursementMethod" header="Méthode" sortable />
                        <Column field="status" header="Statut" sortable body={statusBodyTemplate} />
                        <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog visible={displayDialog} style={{ width: '80vw' }} header={isEdit ? 'Modifier le Décaissement' : 'Nouveau Décaissement'} modal className="p-fluid" footer={dialogFooter} onHide={hideDialog}>
                <LoanDisbursementForm entity={entity} handleChange={handleChange} handleNumberChange={handleNumberChange} handleDropdownChange={handleDropdownChange} />
            </Dialog>
        </div>
    );
};

function ProtectedPageWrapper() {
    return (
        <ProtectedPage requiredAuthorities={['CREDIT_DISBURSE']}>
            <LoanDisbursementPage />
        </ProtectedPage>
    );
}
export default ProtectedPageWrapper;
