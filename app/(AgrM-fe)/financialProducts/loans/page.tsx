'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { Loan } from './Loan';
import LoanForm from './LoanForm';

const LoanPage = () => {
    const [entities, setEntities] = useState<Loan[]>([]);
    const [entity, setEntity] = useState<Loan>(new Loan());
    const [displayDialog, setDisplayDialog] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef<Toast>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/financial-products/loans/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des prêts',
                life: 3000
            });
        }
    };

    const viewEntity = (rowData: Loan) => {
        setEntity({ ...rowData });
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new Loan());
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return 'info';
            case 'DISBURSED':
                return 'warning';
            case 'ACTIVE':
                return 'success';
            case 'OVERDUE':
                return 'danger';
            case 'RESTRUCTURED':
                return 'warning';
            case 'CLOSED':
                return 'secondary';
            case 'WRITTEN_OFF':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'APPROVED': 'APPROUVÉ',
            'DISBURSED': 'DÉCAISSÉ',
            'ACTIVE': 'ACTIF',
            'OVERDUE': 'EN RETARD',
            'RESTRUCTURED': 'RESTRUCTURÉ',
            'CLOSED': 'CLÔTURÉ',
            'WRITTEN_OFF': 'PASSÉ EN PERTE'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: Loan) => {
        return (
            <Badge
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: Loan) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => viewEntity(rowData)}
                    tooltip="Voir"
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

    const amountBodyTemplate = (rowData: Loan, field: keyof Loan) => {
        return formatCurrency(rowData[field] as number);
    };

    const dialogFooter = (
        <div>
            <Button label="Fermer" icon="pi pi-times" onClick={hideDialog} className="p-button-text" />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <h3>Gestion des Prêts Actifs</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Tous les Prêts">
                    <div className="datatable-responsive">
                        <DataTable
                            value={entities}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            responsiveLayout="scroll"
                            emptyMessage="Aucun prêt trouvé"
                        >
                            <Column field="loanNumber" header="Numéro Prêt" sortable filter />
                            <Column field="approvalDate" header="Date Approbation" sortable />
                            <Column
                                field="approvedAmount"
                                header="Montant Approuvé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'approvedAmount')}
                            />
                            <Column
                                field="disbursedAmount"
                                header="Montant Décaissé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'disbursedAmount')}
                            />
                            <Column
                                field="totalOutstanding"
                                header="Total Impayé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalOutstanding')}
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
                header="Détails du Prêt"
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanForm entity={entity} />
            </Dialog>
        </div>
    );
};

export default LoanPage;
