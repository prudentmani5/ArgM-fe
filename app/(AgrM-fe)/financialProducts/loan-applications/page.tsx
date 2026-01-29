'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { useRouter } from 'next/navigation';
import { LoanApplication } from './LoanApplication';
import { LoanApplicationForm } from './LoanApplicationForm';

export default function LoanApplicationPage() {
    const [applications, setApplications] = useState<LoanApplication[]>([]);
    const [selectedApplications, setSelectedApplications] = useState<LoanApplication[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editingApplication, setEditingApplication] = useState<LoanApplication | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [actionApplication, setActionApplication] = useState<LoanApplication | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const statusOptions = [
        { label: 'Tous les Statuts', value: '' },
        { label: 'En Attente', value: 'PENDING' },
        { label: 'Soumise', value: 'SUBMITTED' },
        { label: 'En Révision', value: 'UNDER_REVIEW' },
        { label: 'Approuvée', value: 'APPROVED' },
        { label: 'Rejetée', value: 'REJECTED' },
        { label: 'Retirée', value: 'WITHDRAWN' },
        { label: 'Décaissée', value: 'DISBURSED' }
    ];

    useEffect(() => {
        loadApplications();
    }, [statusFilter]);

    const loadApplications = async () => {
        setLoading(true);
        try {
            const url = statusFilter
                ? `/api/financial-products/loan-applications/?status=${statusFilter}`
                : '/api/financial-products/loan-applications/';
            const response = await fetch(url);
            const data = await response.json();
            setApplications(data);
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de demandes de prêt' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEditingApplication(undefined);
        setShowForm(true);
    };

    const editApplication = (application: LoanApplication) => {
        setEditingApplication(application);
        setShowForm(true);
    };

    const saveApplication = async (application: LoanApplication) => {
        try {
            const url = application.id
                ? `/api/financial-products/loan-applications/${application.id}/`
                : '/api/financial-products/loan-applications/';

            const response = await fetch(url, {
                method: application.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(application)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Demande de prêt enregistrée avec succès' });
                setShowForm(false);
                loadApplications();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de demande de prêt' });
        }
    };

    const deleteApplication = async (application: LoanApplication) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette demande de prêt?')) {
            try {
                const response = await fetch(`/api/financial-products/loan-applications/${application.id}/`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Demande de prêt supprimé avec succès' });
                    loadApplications();
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression de demande de prêt' });
            }
        }
    };

    const submitApplication = async () => {
        if (!actionApplication?.id) return;

        try {
            const response = await fetch(`/api/financial-products/loan-applications/${actionApplication.id}/submit/`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Application submitted successfully' });
                setShowSubmitDialog(false);
                loadApplications();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la soumission de application' });
        }
    };

    const approveApplication = async () => {
        if (!actionApplication?.id) return;

        try {
            const response = await fetch(`/api/financial-products/loan-applications/${actionApplication.id}/approve/`, {
                method: 'POST'
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Application approved successfully' });
                setShowApproveDialog(false);
                loadApplications();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de l\'approbation de application' });
        }
    };

    const rejectApplication = async () => {
        if (!actionApplication?.id) return;

        try {
            const response = await fetch(`/api/financial-products/loan-applications/${actionApplication.id}/reject/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectionReason })
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Application rejected' });
                setShowRejectDialog(false);
                setRejectionReason('');
                loadApplications();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du rejet de application' });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Nouveau" icon="pi pi-plus" severity="success" onClick={openNew} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Dropdown
                    value={statusFilter}
                    options={statusOptions}
                    onChange={(e) => setStatusFilter(e.value)}
                    placeholder="Filter by Status"
                />
            </div>
        );
    };

    const statusBodyTemplate = (rowData: LoanApplication) => {
        const statusConfig: any = {
            PENDING: { severity: 'warning', label: 'Pending' },
            SUBMITTED: { severity: 'info', label: 'Submitted' },
            UNDER_REVIEW: { severity: 'info', label: 'Under Review' },
            APPROVED: { severity: 'success', label: 'Approved' },
            REJECTED: { severity: 'danger', label: 'Rejected' },
            WITHDRAWN: { severity: 'secondary', label: 'Withdrawn' },
            DISBURSED: { severity: 'success', label: 'Disbursed' }
        };

        const config = statusConfig[rowData.status] || { severity: 'secondary', label: rowData.status };
        return <Tag value={config.label} severity={config.severity} />;
    };

    const workflowBodyTemplate = (rowData: LoanApplication) => {
        const stages = ['Application', 'Documents', 'Analysis', 'Assessment', 'Review', 'Decision'];
        const statusProgress: any = {
            PENDING: 0,
            SUBMITTED: 1,
            UNDER_REVIEW: 3,
            APPROVED: 6,
            REJECTED: 6,
            DISBURSED: 6
        };

        const progress = (statusProgress[rowData.status] || 0) * 100 / 6;
        return <ProgressBar value={progress} showValue={false} style={{ height: '6px' }} />;
    };

    const amountBodyTemplate = (rowData: LoanApplication) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: rowData.currency?.code || 'USD'
        }).format(rowData.requestedAmount);
    };

    const actionsBodyTemplate = (rowData: LoanApplication) => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="mr-2"
                    onClick={() => editApplication(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteApplication(rowData)}
                />
                {rowData.status === 'PENDING' && (
                    <Button
                        icon="pi pi-send"
                        rounded
                        outlined
                        severity="info"
                        tooltip="Submit"
                        onClick={() => {
                            setActionApplication(rowData);
                            setShowSubmitDialog(true);
                        }}
                    />
                )}
                {(rowData.status === 'SUBMITTED' || rowData.status === 'UNDER_REVIEW') && (
                    <>
                        <Button
                            icon="pi pi-check"
                            rounded
                            outlined
                            severity="success"
                            tooltip="Approve"
                            onClick={() => {
                                setActionApplication(rowData);
                                setShowApproveDialog(true);
                            }}
                        />
                        <Button
                            icon="pi pi-times"
                            rounded
                            outlined
                            severity="danger"
                            tooltip="Reject"
                            onClick={() => {
                                setActionApplication(rowData);
                                setShowRejectDialog(true);
                            }}
                        />
                    </>
                )}
            </div>
        );
    };

    const navigateBodyTemplate = (rowData: LoanApplication) => {
        return (
            <div className="flex flex-wrap gap-1">
                <Button
                    icon="pi pi-file"
                    rounded
                    text
                    size="small"
                    tooltip="Documents"
                    onClick={() => router.push(`/financialProducts/loan-applications/documents?applicationId=${rowData.id}`)}
                />
                <Button
                    icon="pi pi-money-bill"
                    rounded
                    text
                    size="small"
                    tooltip="Income Analysis"
                    onClick={() => router.push(`/financialProducts/loan-applications/income-analysis?applicationId=${rowData.id}`)}
                />
                <Button
                    icon="pi pi-shopping-cart"
                    rounded
                    text
                    size="small"
                    tooltip="Expense Analysis"
                    onClick={() => router.push(`/financialProducts/loan-applications/expense-analysis?applicationId=${rowData.id}`)}
                />
                <Button
                    icon="pi pi-chart-line"
                    rounded
                    text
                    size="small"
                    tooltip="Capacity Summary"
                    onClick={() => router.push(`/financialProducts/loan-applications/capacity-summary?applicationId=${rowData.id}`)}
                />
                <Button
                    icon="pi pi-shield"
                    rounded
                    text
                    size="small"
                    tooltip="Risk Assessment"
                    onClick={() => router.push(`/financialProducts/loan-applications/risk-assessment?applicationId=${rowData.id}`)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Loan Applications</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <input
                    type="search"
                    placeholder="Rechercher..."
                    className="p-inputtext p-component"
                    onInput={(e: any) => setGlobalFilter(e.target.value)}
                />
            </span>
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

            <DataTable
                value={applications}
                selection={selectedApplications}
                onSelectionChange={(e) => setSelectedApplications(e.value as LoanApplication[])}
                dataKey="id"
                paginator
                rows={10}
                loading={loading}
                globalFilter={globalFilter}
                header={header}
                emptyMessage="No demandes de prêt found."
            >
                <Column selectionMode="multiple" exportable={false} />
                <Column field="applicationNumber" header="Application #" sortable />
                <Column
                    field="client.name"
                    header="Client/Group"
                    sortable
                    body={(rowData) => rowData.client?.name || rowData.solidarityGroup?.name || 'N/A'}
                />
                <Column field="product.name" header="Produit" sortable />
                <Column field="requestedAmount" header="Requested Amount" body={amountBodyTemplate} sortable />
                <Column field="termMonths" header="Term (Months)" sortable />
                <Column field="status" header="Statut" body={statusBodyTemplate} sortable />
                <Column header="Workflow Progress" body={workflowBodyTemplate} />
                <Column field="applicationDate" header="Date de Demande" sortable />
                <Column header="Navigate To" body={navigateBodyTemplate} />
                <Column header="Actions" body={actionsBodyTemplate} exportable={false} />
            </DataTable>

            <LoanApplicationForm
                visible={showForm}
                application={editingApplication}
                onHide={() => setShowForm(false)}
                onSave={saveApplication}
            />

            {/* Submit Confirmation Dialog */}
            <Dialog
                visible={showSubmitDialog}
                style={{ width: '450px' }}
                header="Confirm Submit"
                modal
                onHide={() => setShowSubmitDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setShowSubmitDialog(false)} className="p-button-text" />
                        <Button label="Soumettre" icon="pi pi-check" onClick={submitApplication} autoFocus />
                    </div>
                }
            >
                <p>Are you sure you want to submit this demande de prêt?</p>
            </Dialog>

            {/* Approve Confirmation Dialog */}
            <Dialog
                visible={showApproveDialog}
                style={{ width: '450px' }}
                header="Confirm Approval"
                modal
                onHide={() => setShowApproveDialog(false)}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setShowApproveDialog(false)} className="p-button-text" />
                        <Button label="Approuver" icon="pi pi-check" onClick={approveApplication} severity="success" autoFocus />
                    </div>
                }
            >
                <p>Are you sure you want to approve this demande de prêt?</p>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                visible={showRejectDialog}
                style={{ width: '450px' }}
                header="Rejeter la Demande"
                modal
                onHide={() => {
                    setShowRejectDialog(false);
                    setRejectionReason('');
                }}
                footer={
                    <div>
                        <Button label="Annuler" icon="pi pi-times" onClick={() => {
                            setShowRejectDialog(false);
                            setRejectionReason('');
                        }} className="p-button-text" />
                        <Button label="Rejeter" icon="pi pi-times" onClick={rejectApplication} severity="danger" autoFocus />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="rejectionReason">Rejection Reason *</label>
                        <InputTextarea
                            id="rejectionReason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                            required
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
