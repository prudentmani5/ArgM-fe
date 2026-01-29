'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSearchParams } from 'next/navigation';
import { LoanDisbursementCondition, ConditionStatus, ConditionStatusLabels, ConditionStatusColors } from './LoanDisbursementCondition';
import LoanDisbursementConditionForm from './LoanDisbursementConditionForm';

const LoanDisbursementConditionPage = () => {
    const [conditions, setConditions] = useState<LoanDisbursementCondition[]>([]);
    const [selectedCondition, setSelectedCondition] = useState<LoanDisbursementCondition | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = searchParams.get('applicationId');

    useEffect(() => {
        if (applicationId) {
            fetchConditions();
        }
    }, [applicationId, statusFilter]);

    const fetchConditions = async () => {
        if (!applicationId) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/financial-products/loan-applications/${applicationId}/disbursement-conditions/`
            );
            if (response.ok) {
                const data = await response.json();
                setConditions(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch disbursement conditions',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch disbursement conditions',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedCondition(null);
        setDialogVisible(true);
    };

    const editCondition = (condition: LoanDisbursementCondition) => {
        setSelectedCondition(condition);
        setDialogVisible(true);
    };

    const deleteCondition = (condition: LoanDisbursementCondition) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this disbursement condition?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(
                        `/api/financial-products/loan-applications/${applicationId}/disbursement-conditions/${condition.id}`,
                        { method: 'DELETE' }
                    );

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Disbursement condition supprimé avec succès',
                            life: 3000
                        });
                        fetchConditions();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de disbursement condition',
                        life: 3000
                    });
                }
            }
        });
    };

    const saveCondition = async (condition: LoanDisbursementCondition) => {
        try {
            const url = condition.id
                ? `/api/financial-products/loan-applications/${applicationId}/disbursement-conditions/${condition.id}`
                : `/api/financial-products/loan-applications/${applicationId}/disbursement-conditions/`;

            const method = condition.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(condition)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Disbursement condition ${condition.id ? 'updated' : 'created'} successfully`,
                    life: 3000
                });
                setDialogVisible(false);
                fetchConditions();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Failed to ${condition.id ? 'update' : 'create'} disbursement condition`,
                life: 3000
            });
        }
    };

    const getFilteredConditions = () => {
        let filtered = conditions;

        if (statusFilter === 'mandatory') {
            filtered = filtered.filter(c => c.isMandatory);
        } else if (statusFilter === 'optional') {
            filtered = filtered.filter(c => !c.isMandatory);
        } else if (statusFilter === 'pending') {
            filtered = filtered.filter(c => c.status === ConditionStatus.PENDING);
        } else if (statusFilter === 'verified') {
            filtered = filtered.filter(c => c.status === ConditionStatus.VERIFIED);
        } else if (statusFilter === 'overdue') {
            const today = new Date();
            filtered = filtered.filter(c =>
                c.deadlineDate &&
                new Date(c.deadlineDate) < today &&
                c.status !== ConditionStatus.VERIFIED
            );
        }

        return filtered;
    };

    const getCompletionPercentage = () => {
        if (conditions.length === 0) return 0;
        const verified = conditions.filter(c => c.status === ConditionStatus.VERIFIED || c.status === ConditionStatus.WAIVED).length;
        return Math.round((verified / conditions.length) * 100);
    };

    const conditionTypeBodyTemplate = (rowData: LoanDisbursementCondition) => {
        return rowData.conditionType;
    };

    const isMandatoryBodyTemplate = (rowData: LoanDisbursementCondition) => {
        return (
            <Tag
                value={rowData.isMandatory ? 'Mandatory' : 'Optional'}
                severity={rowData.isMandatory ? 'danger' : 'info'}
            />
        );
    };

    const deadlineDateBodyTemplate = (rowData: LoanDisbursementCondition) => {
        if (!rowData.deadlineDate) return <span className="text-500">No deadline</span>;

        const deadline = new Date(rowData.deadlineDate);
        const today = new Date();
        const isOverdue = deadline < today && rowData.status !== ConditionStatus.VERIFIED;

        return (
            <div className={isOverdue ? 'text-red-500 font-bold' : ''}>
                {deadline.toLocaleDateString()}
                {isOverdue && <i className="pi pi-exclamation-triangle ml-2"></i>}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: LoanDisbursementCondition) => {
        return (
            <Tag
                value={ConditionStatusLabels[rowData.status]}
                severity={ConditionStatusColors[rowData.status] as any}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanDisbursementCondition) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-success"
                    onClick={() => editCondition(rowData)}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteCondition(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const filterOptions = [
        { label: 'All Conditions', value: 'all' },
        { label: 'Mandatory Only', value: 'mandatory' },
        { label: 'Optional Only', value: 'optional' },
        { label: 'Pending', value: 'pending' },
        { label: 'Verified', value: 'verified' },
        { label: 'Overdue', value: 'overdue' }
    ];

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="New Condition"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                    disabled={!applicationId}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex gap-2">
                <Dropdown
                    value={statusFilter}
                    options={filterOptions}
                    onChange={(e) => setStatusFilter(e.value)}
                    placeholder="Filter"
                    className="w-full md:w-14rem"
                />
                <InputText
                    type="search"
                    placeholder="Rechercher..."
                    onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                    className="w-full md:w-auto"
                />
            </div>
        );
    };

    if (!applicationId) {
        return (
            <div className="card">
                <div className="text-center p-5">
                    <i className="pi pi-exclamation-circle text-4xl text-orange-500"></i>
                    <p className="text-xl mt-3">Please select a demande de prêt to view disbursement conditions</p>
                </div>
            </div>
        );
    }

    const filteredConditions = getFilteredConditions();

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Progress Card */}
            <Card className="mb-4">
                <div className="flex justify-content-between align-items-center mb-3">
                    <h3 className="m-0">Conditions Completion Progress</h3>
                    <span className="text-2xl font-bold">{getCompletionPercentage()}%</span>
                </div>
                <ProgressBar value={getCompletionPercentage()} />
                <div className="mt-3 text-sm text-500">
                    {conditions.filter(c => c.status === ConditionStatus.VERIFIED || c.status === ConditionStatus.WAIVED).length} of {conditions.length} conditions verified
                </div>
            </Card>

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                value={filteredConditions}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No disbursement conditions found."
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} conditions"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            >
                <Column
                    field="conditionType"
                    header="Condition Type"
                    body={conditionTypeBodyTemplate}
                    sortable
                />
                <Column
                    field="description"
                    header="Description"
                    style={{ minWidth: '250px' }}
                />
                <Column
                    field="isMandatory"
                    header="Type"
                    body={isMandatoryBodyTemplate}
                    sortable
                />
                <Column
                    field="deadlineDate"
                    header="Deadline"
                    body={deadlineDateBodyTemplate}
                    sortable
                />
                <Column
                    field="status"
                    header="Statut"
                    body={statusBodyTemplate}
                    sortable
                />
                <Column
                    field="verifiedBy"
                    header="Verified By"
                    sortable
                />
                <Column
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '120px' }}
                />
            </DataTable>

            <LoanDisbursementConditionForm
                visible={dialogVisible}
                condition={selectedCondition}
                applicationId={applicationId ? parseInt(applicationId) : undefined}
                onHide={() => setDialogVisible(false)}
                onSave={saveCondition}
            />
        </div>
    );
};

export default LoanDisbursementConditionPage;
