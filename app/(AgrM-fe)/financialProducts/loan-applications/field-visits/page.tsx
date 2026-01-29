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
import { useRouter, useSearchParams } from 'next/navigation';
import { LoanFieldVisit, VisitTypeLabels, VisitTypeIcons, VisitTypeColors } from './LoanFieldVisit';
import LoanFieldVisitForm from './LoanFieldVisitForm';

const LoanFieldVisitPage = () => {
    const [fieldVisits, setFieldVisits] = useState<LoanFieldVisit[]>([]);
    const [selectedFieldVisit, setSelectedFieldVisit] = useState<LoanFieldVisit | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const applicationId = searchParams.get('applicationId');

    useEffect(() => {
        fetchFieldVisits();
    }, [applicationId]);

    const fetchFieldVisits = async () => {
        setLoading(true);
        try {
            const url = applicationId
                ? `/api/financial-products/loan-applications/${applicationId}/field-visits/`
                : '/api/financial-products/loan-applications/field-visits/';
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setFieldVisits(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch field visits',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch field visits',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedFieldVisit(null);
        setDialogVisible(true);
    };

    const editFieldVisit = (fieldVisit: LoanFieldVisit) => {
        setSelectedFieldVisit(fieldVisit);
        setDialogVisible(true);
    };

    const deleteFieldVisit = (fieldVisit: LoanFieldVisit) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this field visit?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const response = await fetch(
                        `/api/financial-products/loan-applications/${fieldVisit.applicationId}/field-visits/${fieldVisit.id}`,
                        { method: 'DELETE' }
                    );

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Field visit supprimé avec succès',
                            life: 3000
                        });
                        fetchFieldVisits();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de field visit',
                        life: 3000
                    });
                }
            }
        });
    };

    const saveFieldVisit = async (fieldVisit: LoanFieldVisit) => {
        try {
            const url = fieldVisit.id
                ? `/api/financial-products/loan-applications/${fieldVisit.applicationId}/field-visits/${fieldVisit.id}`
                : `/api/financial-products/loan-applications/${fieldVisit.applicationId}/field-visits/`;

            const method = fieldVisit.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fieldVisit)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Field visit ${fieldVisit.id ? 'updated' : 'created'} successfully`,
                    life: 3000
                });
                setDialogVisible(false);
                fetchFieldVisits();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Failed to ${fieldVisit.id ? 'update' : 'create'} field visit`,
                life: 3000
            });
        }
    };

    const navigateToPhotos = (fieldVisit: LoanFieldVisit) => {
        router.push(`/financialProducts/loan-applications/field-visits/photos?fieldVisitId=${fieldVisit.id}`);
    };

    const visitTypeBodyTemplate = (rowData: LoanFieldVisit) => {
        return (
            <Tag
                value={VisitTypeLabels[rowData.visitType]}
                severity={VisitTypeColors[rowData.visitType] as any}
                icon={`pi ${VisitTypeIcons[rowData.visitType]}`}
            />
        );
    };

    const visitDateBodyTemplate = (rowData: LoanFieldVisit) => {
        return new Date(rowData.visitDate).toLocaleDateString();
    };

    const coordinatesBodyTemplate = (rowData: LoanFieldVisit) => {
        if (rowData.latitude && rowData.longitude) {
            return (
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-map-marker text-primary"></i>
                    <span className="text-sm">
                        {rowData.latitude.toFixed(4)}°, {rowData.longitude.toFixed(4)}°
                    </span>
                </div>
            );
        }
        return <span className="text-500">Not captured</span>;
    };

    const actionBodyTemplate = (rowData: LoanFieldVisit) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-images"
                    rounded
                    outlined
                    className="p-button-info"
                    onClick={() => navigateToPhotos(rowData)}
                    tooltip="View Photos"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-success"
                    onClick={() => editFieldVisit(rowData)}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteFieldVisit(rowData)}
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
                    label="New Field Visit"
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
                value={fieldVisits}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No field visits found."
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} field visits"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            >
                <Column
                    field="visitType"
                    header="Visit Type"
                    body={visitTypeBodyTemplate}
                    sortable
                />
                <Column
                    field="visitDate"
                    header="Visit Date"
                    body={visitDateBodyTemplate}
                    sortable
                />
                <Column
                    field="locationAddress"
                    header="Location"
                    sortable
                    style={{ minWidth: '200px' }}
                />
                <Column
                    header="Coordinates"
                    body={coordinatesBodyTemplate}
                />
                <Column
                    field="conductedBy"
                    header="Conducted By"
                    sortable
                />
                <Column
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '180px' }}
                />
            </DataTable>

            <LoanFieldVisitForm
                visible={dialogVisible}
                fieldVisit={selectedFieldVisit}
                applicationId={applicationId ? parseInt(applicationId) : undefined}
                onHide={() => setDialogVisible(false)}
                onSave={saveFieldVisit}
            />
        </div>
    );
};

export default LoanFieldVisitPage;
