'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSearchParams } from 'next/navigation';
import { LoanReferenceCheck, CheckMethodLabels, CheckMethodIcons } from './LoanReferenceCheck';
import LoanReferenceCheckForm from './LoanReferenceCheckForm';

const LoanReferenceCheckPage = () => {
    const [referenceChecks, setReferenceChecks] = useState<LoanReferenceCheck[]>([]);
    const [selectedReferenceCheck, setSelectedReferenceCheck] = useState<LoanReferenceCheck | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = searchParams.get('applicationId');

    useEffect(() => {
        fetchReferenceChecks();
    }, [applicationId]);

    const fetchReferenceChecks = async () => {
        setLoading(true);
        try {
            const url = applicationId
                ? `/api/financial-products/loan-applications/${applicationId}/reference-checks/`
                : '/api/financial-products/loan-applications/reference-checks/';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setReferenceChecks(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch reference checks',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch reference checks',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedReferenceCheck(null);
        setDialogVisible(true);
    };

    const editReferenceCheck = (referenceCheck: LoanReferenceCheck) => {
        setSelectedReferenceCheck(referenceCheck);
        setDialogVisible(true);
    };

    const deleteReferenceCheck = (referenceCheck: LoanReferenceCheck) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this reference check?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(
                        `/api/financial-products/loan-applications/${referenceCheck.applicationId}/reference-checks/${referenceCheck.id}`,
                        { method: 'DELETE' }
                    );

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Reference check supprimé avec succès',
                            life: 3000
                        });
                        fetchReferenceChecks();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de reference check',
                        life: 3000
                    });
                }
            }
        });
    };

    const saveReferenceCheck = async (referenceCheck: LoanReferenceCheck) => {
        try {
            const url = referenceCheck.id
                ? `/api/financial-products/loan-applications/${referenceCheck.applicationId}/reference-checks/${referenceCheck.id}`
                : `/api/financial-products/loan-applications/${referenceCheck.applicationId}/reference-checks/`;

            const method = referenceCheck.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(referenceCheck)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Reference check ${referenceCheck.id ? 'updated' : 'created'} successfully`,
                    life: 3000
                });
                setDialogVisible(false);
                fetchReferenceChecks();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Failed to ${referenceCheck.id ? 'update' : 'create'} reference check`,
                life: 3000
            });
        }
    };

    const checkMethodBodyTemplate = (rowData: LoanReferenceCheck) => {
        return (
            <div className="flex align-items-center gap-2">
                <i className={`pi ${CheckMethodIcons[rowData.checkMethod]}`}></i>
                <span>{CheckMethodLabels[rowData.checkMethod]}</span>
            </div>
        );
    };

    const characterAssessmentBodyTemplate = (rowData: LoanReferenceCheck) => {
        const text = rowData.characterAssessment || '';
        return text.length > 50 ? text.substring(0, 50) + '...' : text;
    };

    const isPositiveBodyTemplate = (rowData: LoanReferenceCheck) => {
        return (
            <Tag
                value={rowData.isPositive ? 'Positive' : 'Negative'}
                severity={rowData.isPositive ? 'success' : 'danger'}
                icon={rowData.isPositive ? 'pi pi-check' : 'pi pi-times'}
            />
        );
    };

    const actionBodyTemplate = (rowData: LoanReferenceCheck) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-success"
                    onClick={() => editReferenceCheck(rowData)}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteReferenceCheck(rowData)}
                    tooltip="Delete"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="New Reference Check"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={openNew}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <InputText
                type="search"
                placeholder="Rechercher..."
                onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)}
                className="w-full md:w-auto"
            />
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />

            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                value={referenceChecks}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No reference checks found."
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} reference checks"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            >
                <Column
                    field="referenceName"
                    header="Reference Name"
                    sortable
                />
                <Column
                    field="relationshipToApplicant"
                    header="Relationship"
                    sortable
                />
                <Column
                    field="checkMethod"
                    header="Check Method"
                    body={checkMethodBodyTemplate}
                    sortable
                />
                <Column
                    field="characterAssessment"
                    header="Character Assessment"
                    body={characterAssessmentBodyTemplate}
                    style={{ minWidth: '200px' }}
                />
                <Column
                    field="isPositive"
                    header="Feedback"
                    body={isPositiveBodyTemplate}
                    sortable
                />
                <Column
                    field="conductedBy"
                    header="Conducted By"
                    sortable
                />
                <Column
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '120px' }}
                />
            </DataTable>

            <LoanReferenceCheckForm
                visible={dialogVisible}
                referenceCheck={selectedReferenceCheck}
                applicationId={applicationId ? parseInt(applicationId) : undefined}
                onHide={() => setDialogVisible(false)}
                onSave={saveReferenceCheck}
            />
        </div>
    );
};

export default LoanReferenceCheckPage;
