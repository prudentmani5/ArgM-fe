'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Panel } from 'primereact/panel';
import { Chart } from 'primereact/chart';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { useSearchParams } from 'next/navigation';
import { LoanCommitteeReview } from './LoanCommitteeReview';
import LoanCommitteeReviewForm from './LoanCommitteeReviewForm';

const LoanCommitteeReviewPage = () => {
    const [reviews, setReviews] = useState<LoanCommitteeReview[]>([]);
    const [selectedReview, setSelectedReview] = useState<LoanCommitteeReview | null>(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const applicationId = searchParams.get('applicationId');

    useEffect(() => {
        fetchReviews();
    }, [sessionId, applicationId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            let url = '';
            if (sessionId) {
                url = `/api/financial-products/loan-applications/committee-sessions/${sessionId}/reviews/`;
            } else if (applicationId) {
                url = `/api/financial-products/loan-applications/${applicationId}/committee-reviews/`;
            } else {
                url = '/api/financial-products/loan-applications/committee-reviews/';
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Failed to fetch committee reviews',
                    life: 3000
                });
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Failed to fetch committee reviews',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedReview(null);
        setDialogVisible(true);
    };

    const editReview = (review: LoanCommitteeReview) => {
        setSelectedReview(review);
        setDialogVisible(true);
    };

    const deleteReview = (review: LoanCommitteeReview) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer this committee review?',
            header: 'Confirm Delete',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const url = sessionId
                        ? `/api/financial-products/loan-applications/committee-sessions/${sessionId}/reviews/${review.id}`
                        : `/api/financial-products/loan-applications/${review.applicationId}/committee-reviews/${review.id}`;

                    const response = await fetch(url, { method: 'DELETE' });

                    if (response.ok) {
                        toast.current?.show({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Committee review supprimé avec succès',
                            life: 3000
                        });
                        fetchReviews();
                    } else {
                        throw new Error('Delete failed');
                    }
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Échec de la suppression de committee review',
                        life: 3000
                    });
                }
            }
        });
    };

    const saveReview = async (review: LoanCommitteeReview) => {
        try {
            let url = '';
            if (review.id) {
                url = sessionId
                    ? `/api/financial-products/loan-applications/committee-sessions/${sessionId}/reviews/${review.id}`
                    : `/api/financial-products/loan-applications/${review.applicationId}/committee-reviews/${review.id}`;
            } else {
                url = sessionId
                    ? `/api/financial-products/loan-applications/committee-sessions/${sessionId}/reviews/`
                    : `/api/financial-products/loan-applications/${review.applicationId}/committee-reviews/`;
            }

            const method = review.id ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(review)
            });

            if (response.ok) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Committee review ${review.id ? 'updated' : 'created'} successfully`,
                    life: 3000
                });
                setDialogVisible(false);
                fetchReviews();
            } else {
                throw new Error('Save failed');
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur',
                detail: `Failed to ${review.id ? 'update' : 'create'} committee review`,
                life: 3000
            });
        }
    };

    const decisionTypeBodyTemplate = (rowData: LoanCommitteeReview) => {
        const decisionColors: any = {
            'APPROVED': 'success',
            'REJECTED': 'danger',
            'DEFERRED': 'warning',
            'CONDITIONAL': 'info'
        };
        const color = decisionColors[rowData.decisionType || ''] || 'secondary';
        return <Tag value={rowData.decisionType} severity={color} />;
    };

    const approvedAmountBodyTemplate = (rowData: LoanCommitteeReview) => {
        if (rowData.approvedAmount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(rowData.approvedAmount);
        }
        return <span className="text-500">N/A</span>;
    };

    const votingBodyTemplate = (rowData: LoanCommitteeReview) => {
        const total = rowData.votesFor + rowData.votesAgainst + rowData.votesAbstained;
        if (total === 0) return <span className="text-500">No votes</span>;

        return (
            <div className="flex align-items-center gap-2">
                <Tag value={`For: ${rowData.votesFor}`} severity="success" />
                <Tag value={`Against: ${rowData.votesAgainst}`} severity="danger" />
                {rowData.votesAbstained > 0 && (
                    <Tag value={`Abstained: ${rowData.votesAbstained}`} severity="warning" />
                )}
            </div>
        );
    };

    const rowExpansionTemplate = (data: LoanCommitteeReview) => {
        const chartData = {
            labels: ['Votes For', 'Votes Against', 'Votes Abstained'],
            datasets: [
                {
                    data: [data.votesFor, data.votesAgainst, data.votesAbstained],
                    backgroundColor: ['#4CAF50', '#F44336', '#FF9800'],
                    hoverBackgroundColor: ['#45a049', '#da190b', '#e68900']
                }
            ]
        };

        const chartOptions = {
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };

        return (
            <div className="p-3">
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <h4>Decision Rationale</h4>
                        <p>{data.decisionRationale || 'No rationale provided'}</p>

                        {data.conditions && (
                            <>
                                <h4>Conditions</h4>
                                <p>{data.conditions}</p>
                            </>
                        )}
                    </div>
                    <div className="col-12 md:col-6">
                        <h4>Voting Breakdown</h4>
                        <Chart type="pie" data={chartData} options={chartOptions} style={{ width: '300px', margin: '0 auto' }} />
                    </div>
                </div>
            </div>
        );
    };

    const actionBodyTemplate = (rowData: LoanCommitteeReview) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    className="p-button-success"
                    onClick={() => editReview(rowData)}
                    tooltip="Edit"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => deleteReview(rowData)}
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
                    label="New Committee Review"
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
                value={reviews}
                loading={loading}
                globalFilter={globalFilter}
                emptyMessage="No committee reviews found."
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} reviews"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
            >
                <Column expander style={{ width: '3rem' }} />
                <Column
                    field="application"
                    header="Application"
                    sortable
                />
                <Column
                    field="decisionType"
                    header="Décision"
                    body={decisionTypeBodyTemplate}
                    sortable
                />
                <Column
                    field="approvedAmount"
                    header="Approved Amount"
                    body={approvedAmountBodyTemplate}
                    sortable
                />
                <Column
                    field="approvedTermMonths"
                    header="Term (Months)"
                    sortable
                />
                <Column
                    field="approvedInterestRate"
                    header="Taux d'Intérêt"
                    body={(rowData) => rowData.approvedInterestRate ? `${rowData.approvedInterestRate}%` : 'N/A'}
                    sortable
                />
                <Column
                    header="Voting"
                    body={votingBodyTemplate}
                />
                <Column
                    field="reviewedBy"
                    header="Reviewed By"
                    sortable
                />
                <Column
                    body={actionBodyTemplate}
                    exportable={false}
                    style={{ minWidth: '120px' }}
                />
            </DataTable>

            <LoanCommitteeReviewForm
                visible={dialogVisible}
                review={selectedReview}
                applicationId={applicationId ? parseInt(applicationId) : undefined}
                sessionId={sessionId ? parseInt(sessionId) : undefined}
                onHide={() => setDialogVisible(false)}
                onSave={saveReview}
            />
        </div>
    );
};

export default LoanCommitteeReviewPage;
