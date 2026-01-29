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
import { LoanClosure } from './LoanClosure';
import LoanClosureForm from './LoanClosureForm';

const LoanClosurePage = () => {
    const [entities, setEntities] = useState<LoanClosure[]>([]);
    const [entity, setEntity] = useState<LoanClosure>(new LoanClosure());
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
            const response = await fetch(`${apiUrl}/api/financial-products/closures/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des clôtures',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setEntity(new LoanClosure());
        setIsEdit(false);
        setDisplayDialog(true);
        setActiveIndex(0);
    };

    const editEntity = (rowData: LoanClosure) => {
        setEntity({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanClosure());
        setIsEdit(false);
    };

    const saveEntity = async () => {
        try {
            const url = isEdit
                ? `${apiUrl}/api/financial-products/closures/update/${entity.id}`
                : `${apiUrl}/api/financial-products/closures/new`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Clôture ${isEdit ? 'modifiée' : 'créée'} avec succès`,
                    life: 3000
                });
                fetchEntities();
                hideDialog();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de la clôture`,
                life: 3000
            });
        }
    };

    const confirmDelete = (rowData: LoanClosure) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette clôture ?',
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
            const response = await fetch(`${apiUrl}/api/financial-products/closures/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Clôture supprimée avec succès',
                    life: 3000
                });
                fetchEntities();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression de la clôture',
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

    const getClosureTypeSeverity = (closureType: string) => {
        switch (closureType) {
            case 'MATURED':
                return 'success';
            case 'EARLY_REPAYMENT':
                return 'info';
            case 'WRITTEN_OFF':
                return 'danger';
            case 'RESTRUCTURED':
                return 'warning';
            case 'TRANSFERRED':
                return 'secondary';
            default:
                return 'secondary';
        }
    };

    const getClosureTypeLabel = (closureType: string) => {
        const typeMap: { [key: string]: string } = {
            'MATURED': 'ARRIVÉ À ÉCHÉANCE',
            'EARLY_REPAYMENT': 'REMBOURSEMENT ANTICIPÉ',
            'WRITTEN_OFF': 'PASSÉ EN PERTE',
            'RESTRUCTURED': 'RESTRUCTURÉ',
            'TRANSFERRED': 'TRANSFÉRÉ'
        };
        return typeMap[closureType] || closureType;
    };

    const closureTypeBodyTemplate = (rowData: LoanClosure) => {
        return (
            <Badge
                value={getClosureTypeLabel(rowData.closureType)}
                severity={getClosureTypeSeverity(rowData.closureType) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanClosure) => {
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

    const amountBodyTemplate = (rowData: LoanClosure, field: keyof LoanClosure) => {
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
            <h3>Gestion des Clôtures de Prêt</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau">
                    <div className="card">
                        <LoanClosureForm
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
                            emptyMessage="Aucune clôture trouvée"
                        >
                            <Column field="loanId" header="ID Prêt" sortable filter />
                            <Column field="closureDate" header="Date" sortable />
                            <Column field="closureType" header="Type" sortable body={closureTypeBodyTemplate} />
                            <Column
                                field="totalAmountPaid"
                                header="Total Payé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalAmountPaid')}
                            />
                            <Column
                                field="totalOutstanding"
                                header="Total Impayé"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'totalOutstanding')}
                            />
                            <Column body={actionBodyTemplate} header="Actions" exportable={false} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>

            <Dialog
                visible={displayDialog}
                style={{ width: '80vw' }}
                header={isEdit ? 'Modifier la Clôture' : 'Nouvelle Clôture'}
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanClosureForm
                    entity={entity}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
            </Dialog>
        </div>
    );
};

export default LoanClosurePage;
