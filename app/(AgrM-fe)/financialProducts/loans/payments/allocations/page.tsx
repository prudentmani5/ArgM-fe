'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { LoanPaymentAllocation } from './LoanPaymentAllocation';
import LoanPaymentAllocationForm from './LoanPaymentAllocationForm';

const LoanPaymentAllocationPage = () => {
    const [entities, setEntities] = useState<LoanPaymentAllocation[]>([]);
    const [entity, setEntity] = useState<LoanPaymentAllocation>(new LoanPaymentAllocation());
    const [displayDialog, setDisplayDialog] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const toast = useRef<Toast>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchEntities();
    }, []);

    const fetchEntities = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/financial-products/payment-allocations/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des allocations',
                life: 3000
            });
        }
    };

    const viewEntity = (rowData: LoanPaymentAllocation) => {
        setEntity({ ...rowData });
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanPaymentAllocation());
    };

    const actionBodyTemplate = (rowData: LoanPaymentAllocation) => {
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

    const amountBodyTemplate = (rowData: LoanPaymentAllocation, field: keyof LoanPaymentAllocation) => {
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
            <h3>Allocations de Paiement</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Toutes les Allocations">
                    <div className="datatable-responsive">
                        <DataTable
                            value={entities}
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            responsiveLayout="scroll"
                            emptyMessage="Aucune allocation trouvée"
                        >
                            <Column field="paymentId" header="ID Paiement" sortable filter />
                            <Column field="scheduleId" header="ID Échéance" sortable />
                            <Column
                                field="principalAmount"
                                header="Principal"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'principalAmount')}
                            />
                            <Column
                                field="interestAmount"
                                header="Intérêts"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'interestAmount')}
                            />
                            <Column
                                field="penaltyAmount"
                                header="Pénalités"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'penaltyAmount')}
                            />
                            <Column
                                field="totalAmount"
                                header="Total"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalAmount')}
                            />
                            <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>

            <Dialog
                visible={displayDialog}
                style={{ width: '70vw' }}
                header="Détails de l'Allocation"
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanPaymentAllocationForm entity={entity} />
            </Dialog>
        </div>
    );
};

export default LoanPaymentAllocationPage;
