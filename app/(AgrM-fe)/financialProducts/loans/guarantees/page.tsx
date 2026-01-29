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
import { LoanGuarantee } from './LoanGuarantee';
import LoanGuaranteeForm from './LoanGuaranteeForm';

const LoanGuaranteePage = () => {
    const [entities, setEntities] = useState<LoanGuarantee[]>([]);
    const [entity, setEntity] = useState<LoanGuarantee>(new LoanGuarantee());
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
            const response = await fetch(`${apiUrl}/api/financial-products/guarantees/findall`);
            if (response.ok) {
                const data = await response.json();
                setEntities(data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la récupération des garanties',
                life: 3000
            });
        }
    };

    const openNew = () => {
        setEntity(new LoanGuarantee());
        setIsEdit(false);
        setDisplayDialog(true);
        setActiveIndex(0);
    };

    const editEntity = (rowData: LoanGuarantee) => {
        setEntity({ ...rowData });
        setIsEdit(true);
        setDisplayDialog(true);
    };

    const hideDialog = () => {
        setDisplayDialog(false);
        setEntity(new LoanGuarantee());
        setIsEdit(false);
    };

    const saveEntity = async () => {
        try {
            const url = isEdit
                ? `${apiUrl}/api/financial-products/guarantees/update/${entity.id}`
                : `${apiUrl}/api/financial-products/guarantees/new`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entity)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Garantie ${isEdit ? 'modifiée' : 'créée'} avec succès`,
                    life: 3000
                });
                fetchEntities();
                hideDialog();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Erreur lors de ${isEdit ? 'la modification' : 'la création'} de la garantie`,
                life: 3000
            });
        }
    };

    const confirmDelete = (rowData: LoanGuarantee) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer cette garantie ?',
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
            const response = await fetch(`${apiUrl}/api/financial-products/guarantees/delete/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Garantie supprimée avec succès',
                    life: 3000
                });
                fetchEntities();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la suppression de la garantie',
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
            case 'VERIFIED':
                return 'success';
            case 'RELEASED':
                return 'info';
            case 'SEIZED':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'EN ATTENTE',
            'VERIFIED': 'VÉRIFIÉ',
            'RELEASED': 'LIBÉRÉ',
            'SEIZED': 'SAISI'
        };
        return statusMap[status] || status;
    };

    const statusBodyTemplate = (rowData: LoanGuarantee) => {
        return (
            <Badge
                value={getStatusLabel(rowData.status)}
                severity={getStatusSeverity(rowData.status) as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanGuarantee) => {
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

    const amountBodyTemplate = (rowData: LoanGuarantee, field: keyof LoanGuarantee) => {
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
            <h3>Gestion des Garanties de Prêt</h3>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouveau">
                    <div className="card">
                        <LoanGuaranteeForm
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
                            emptyMessage="Aucune garantie trouvée"
                        >
                            <Column field="loanId" header="ID Prêt" sortable filter />
                            <Column field="description" header="Description" sortable />
                            <Column field="ownerName" header="Propriétaire" sortable />
                            <Column
                                field="estimatedValue"
                                header="Valeur Estimée"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'estimatedValue')}
                            />
                            <Column
                                field="verifiedValue"
                                header="Valeur Vérifiée"
                                sortable
                                body={(rowData) => amountBodyTemplate(rowData, 'verifiedValue')}
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
                header={isEdit ? 'Modifier la Garantie' : 'Nouvelle Garantie'}
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={hideDialog}
            >
                <LoanGuaranteeForm
                    entity={entity}
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
            </Dialog>
        </div>
    );
};

export default LoanGuaranteePage;
