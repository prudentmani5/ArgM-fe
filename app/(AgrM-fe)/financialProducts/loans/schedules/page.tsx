'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Badge } from 'primereact/badge';
import { LoanSchedule } from './LoanSchedule';
import LoanScheduleForm from './LoanScheduleForm';

const LoanSchedulePage = () => {
    const [entities, setEntities] = useState<LoanSchedule[]>([]);
    const [entity, setEntity] = useState<LoanSchedule>(new LoanSchedule());
    const [displayDialog, setDisplayDialog] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef<Toast>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/financial-products/schedules/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des échéanciers',
                life: 3000
            });
        }
    };

    const viewEntity = (rowData: LoanSchedule) => {
        setEntity({ ...rowData });
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanSchedule());
    };

    const getStatusSeverity = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'PARTIALLY_PAID':
                return 'info';
            case 'FULLY_PAID':
                return 'success';
            case 'OVERDUE':
                return 'danger';
            case 'WRITTEN_OFF':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'EN ATTENTE',
            'PARTIALLY_PAID': 'PARTIELLEMENT PAYÉ',
            'FULLY_PAID': 'ENTIÈREMENT PAYÉ',
            'OVERDUE': 'EN RETARD',
            'WRITTEN_OFF': 'PASSÉ EN PERTE'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: LoanSchedule) => {
        return (
            <Badge
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanSchedule) => {
        return (
            <Button
                icon="pi pi-eye"
                rounded
                outlined
                onClick={() => viewEntity(rowData)}
                tooltip="Voir"
                tooltipOptions={{ position: 'top' }}
            />
        );
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    };

    const amountBodyTemplate = (rowData: LoanSchedule, field: keyof LoanSchedule) => {
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
            <h3>Échéanciers de Prêt</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Tous les Échéanciers">
                    <div className="datatable-responsive">
                        <DataTable
                            value={entities}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            responsiveLayout="scroll"
                            emptyMessage="Aucun échéancier trouvé"
                        >
                            <Column field="loanId" header="ID Prêt" sortable filter />
                            <Column field="installmentNumber" header="N° Échéance" sortable />
                            <Column field="dueDate" header="Date d'Échéance" sortable />
                            <Column
                                field="totalDue"
                                header="Total Dû"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalDue')}
                            />
                            <Column
                                field="totalPaid"
                                header="Total Payé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalPaid')}
                            />
                            <Column field="daysOverdue" header="Jours Retard" sortable />
                            <Column field="status" header="Statut" sortable body={statusBodyTemplate} />
                            <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>

            <Dialog
                visible={displayDialog}
                style={{ width: '80vw' }}
                header="Détails de l'Échéancier"
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanScheduleForm entity={entity} />
            </Dialog>
        </div>
    );
};

export default LoanSchedulePage;
