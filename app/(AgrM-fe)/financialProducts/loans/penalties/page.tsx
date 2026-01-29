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
import { LoanPenalty } from './LoanPenalty';
import LoanPenaltyForm from './LoanPenaltyForm';

const LoanPenaltyPage = () => {
    const [entities, setEntities] = useState<LoanPenalty[]>([]);
    const [entity, setEntity] = useState<LoanPenalty>(new LoanPenalty());
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
            const response = await fetch(`${apiUrl}/api/financial-products/penalties/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des pénalités',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setEntity(new LoanPenalty());
        setIsEdit(false);
        setDisplayDialog(true);
        setActiveIndex(0);
    };

    const editEntity = (rowData: LoanPenalty) => {
        setEntity({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanPenalty());
        setIsEdit(false);
    };

    const saveEntity = async () => {
        try {
            const url = isEdit
                ? `${apiUrl}/api/financial-products/penalties/update/${entity.id}`
                : `${apiUrl}/api/financial-products/penalties/new`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Pénalité ${isEdit ? 'modifiée' : 'créée'} avec succès`,
                    life: 3000
                });
                fetchEntities();
                hideDialog();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de la pénalité`,
                life: 3000
            });
        }
    };

    const confirmDelete = (rowData: LoanPenalty) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette pénalité ?',
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
            const response = await fetch(`${apiUrl}/api/financial-products/penalties/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Pénalité supprimée avec succès',
                    life: 3000
                });
                fetchEntities();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression de la pénalité',
                life: 3000
            });
        }
    };

    const confirmWaive = (rowData: LoanPenalty) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir exonérer cette pénalité ?',
            header: 'Confirmation d\'Exonération',
            icon: 'pi pi-exclamation-triangle',
            accept: () => waiveEntity(rowData),
            reject: () => { },
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const waiveEntity = async (rowData: LoanPenalty) => {
        try {
            const updatedEntity = {
                ...rowData,
                status: 'WAIVED',
                waivedDate: new Date().toISOString().split('T')[0]
            };

            const response = await fetch(`${apiUrl}/api/financial-products/penalties/update/${rowData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEntity)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Pénalité exonérée avec succès',
                    life: 3000
                });
                fetchEntities();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de l\'exonération de la pénalité',
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
            case 'PARTIALLY_PAID':
                return 'info';
            case 'PAID':
                return 'success';
            case 'WAIVED':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'EN ATTENTE',
            'PARTIALLY_PAID': 'PARTIELLEMENT PAYÉ',
            'PAID': 'PAYÉ',
            'WAIVED': 'EXONÉRÉ'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: LoanPenalty) => {
        return (
            <Badge
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanPenalty) => {
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
                {rowData.status !== 'WAIVED' && (
                    <Button
                        icon="pi pi-ban"
                        rounded
                        outlined
                        severity="warning"
                        className="mr-2"
                        onClick={() => confirmWaive(rowData)}
                        tooltip="Exonérer"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
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

    const amountBodyTemplate = (rowData: LoanPenalty, field: keyof LoanPenalty) => {
        return formatCurrency(rowData[field] as number);
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
            <h3>Gestion des Pénalités de Prêt</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau">
                    <div className="card">
                        <LoanPenaltyForm
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
                            emptyMessage="Aucune pénalité trouvée"
                        >
                            <Column field="loanId" header="ID Prêt" sortable filter />
                            <Column field="penaltyType" header="Type" sortable />
                            <Column field="penaltyDate" header="Date" sortable />
                            <Column
                                field="penaltyAmount"
                                header="Montant"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'penaltyAmount')}
                            />
                            <Column
                                field="amountPaid"
                                header="Payé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'amountPaid')}
                            />
                            <Column
                                field="amountOutstanding"
                                header="Impayé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'amountOutstanding')}
                            />
                            <Column field="status" header="Statut" sortable body={statusBodyTemplate} />
                            <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>

            <Dialog
                visible={displayDialog}
                style={{ width: '80vw' }}
                header={isEdit ? 'Modifier la Pénalité' : 'Nouvelle Pénalité'}
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanPenaltyForm
                    entity={entity}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
            </Dialog>
        </div>
    );
};

export default LoanPenaltyPage;
