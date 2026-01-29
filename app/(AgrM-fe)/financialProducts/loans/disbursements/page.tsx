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

const LoanDisbursementPage = () => {
    const [entities, setEntities] = useState<LoanDisbursement[]>([]);
    const [entity, setEntity] = useState<LoanDisbursement>(new LoanDisbursement());
    const [displayDialog, setDisplayDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef<Toast>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/financial-products/disbursements/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des décaissements',
                life: 3000
            });
        }
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

    const saveEntity = async () => {
        try {
            const url = isEdit
                ? `${apiUrl}/api/financial-products/disbursements/update/${entity.id}`
                : `${apiUrl}/api/financial-products/disbursements/new`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Décaissement ${isEdit ? 'modifié' : 'créé'} avec succès`,
                    life: 3000
                });
                fetchEntities();
                hideDialog();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors de ${isEdit ? 'la modification' : 'la création'} du décaissement`,
                life: 3000
            });
        }
    };

    const confirmDelete = (rowData: LoanDisbursement) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce décaissement ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteEntity(rowData.id!),
            reject: () => { },
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const deleteEntity = async (id: number) => {
        try {
            const response = await fetch(`${apiUrl}/api/financial-products/disbursements/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Décaissement supprimé avec succès',
                    life: 3000
                });
                fetchEntities();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression du décaissement',
                life: 3000
            });
        }
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
            case 'PENDING':
                return 'warning';
            case 'APPROVED':
                return 'info';
            case 'DISBURSED':
                return 'success';
            case 'CANCELLED':
                return 'danger';
            default:
                return 'secondary';
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

    const statusBodyTemplate = (rowData: LoanDisbursement) => {
        return (
            <Badge
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanDisbursement) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editEntity(rowData)}
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const amountBodyTemplate = (rowData: LoanDisbursement) => {
        return formatCurrency(rowData.disbursedAmount);
    };

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
                        <LoanDisbursementForm
                            entity={entity}
                            handleChange={handleChange}
                            handleNumberChange={handleNumberChange}
                            handleDropdownChange={handleDropdownChange}
                        />
                        <div className="flex justify-content-end mt-3">
                            <Button label="Enregistrer" icon="pi pi-check" onClick={saveEntity} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Tous">
                    <div className="flex justify-content-end mb-3">
                        <Button label="Nouveau" icon="pi pi-plus" onClick={openNew} />
                    </div>
                    <div className="datatable-responsive">
                        <DataTable
                            value={entities}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            responsiveLayout="scroll"
                            emptyMessage="Aucun décaissement trouvé"
                        >
                            <Column field="disbursementNumber" header="Numéro" sortable filter />
                            <Column field="disbursementDate" header="Date" sortable />
                            <Column field="disbursedAmount" header="Montant" sortable body={amountBodyTemplate} />
                            <Column field="disbursementMethod" header="Méthode" sortable />
                            <Column field="status" header="Statut" sortable body={statusBodyTemplate} />
                            <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>

            <Dialog
                visible={displayDialog}
                style={{ width: '80vw' }}
                header={isEdit ? 'Modifier le Décaissement' : 'Nouveau Décaissement'}
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanDisbursementForm
                    entity={entity}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
            </Dialog>
        </div>
    );
};

export default LoanDisbursementPage;
