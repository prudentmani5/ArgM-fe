'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { TabView, TabPanel } from 'primereact/tabview';
import { buildApiUrl } from '@/utils/apiConfig';
import Cookies from 'js-cookie';

const STATUS_HISTORY_URL = buildApiUrl('/api/credit/application-status-history');
const APPLICATIONS_URL = buildApiUrl('/api/credit/applications');

interface StatusHistory {
    id: number;
    application?: any;
    previousStatus?: {
        id: number;
        code: string;
        nameFr: string;
        color?: string;
    };
    newStatus: {
        id: number;
        code: string;
        nameFr: string;
        color?: string;
    };
    changedBy?: {
        id: number;
        fullName?: string;
        firstName?: string;
        lastName?: string;
    };
    changeReason?: string;
    userAction?: string;
    createdAt: string;
}

interface Application {
    id: number;
    applicationNumber: string;
    client?: {
        firstName: string;
        lastName: string;
    };
    amountRequested?: number;
    durationMonths?: number;
    status?: {
        code: string;
        nameFr: string;
        color?: string;
    };
    applicationDate?: string;
}

export default function HistoriqueWorkflowPage() {
    const params = useParams();
    const router = useRouter();
    const applicationId = params.applicationId as string;

    const [histories, setHistories] = useState<StatusHistory[]>([]);
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    // Helper function for direct API calls
    const fetchWithAuth = async (url: string) => {
        const token = Cookies.get('token');
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    useEffect(() => {
        if (applicationId) {
            loadData();
        }
    }, [applicationId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [historiesData, applicationData] = await Promise.all([
                fetchWithAuth(`${STATUS_HISTORY_URL}/findbyapplication/${applicationId}`).catch(() => []),
                fetchWithAuth(`${APPLICATIONS_URL}/findbyid/${applicationId}`).catch(() => null)
            ]);

            // Sort histories by createdAt descending (most recent first)
            const sortedHistories = Array.isArray(historiesData)
                ? historiesData.sort((a: StatusHistory, b: StatusHistory) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                : [];

            setHistories(sortedHistories);
            setApplication(applicationData);
        } catch (err) {
            console.error('Error loading data:', err);
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des donnees', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(value || 0);
    };

    const getChangedByName = (history: StatusHistory) => {
        if (history.userAction) return history.userAction;
        if (history.changedBy) {
            return history.changedBy.fullName || `${history.changedBy.firstName || ''} ${history.changedBy.lastName || ''}`.trim() || 'N/A';
        }
        return 'Systeme';
    };

    // Timeline marker template
    const timelineMarker = (item: StatusHistory) => {
        const isApproval = ['APPROVED', 'APPROVED_CONDITIONS', 'APPROUVE_MONTANT_REDUIT'].includes(item.newStatus?.code || '');
        const isRejection = ['REJETE'].includes(item.newStatus?.code || '');
        const isPending = ['PENDING_COMMITTEE', 'PENDING_DOCS', 'PENDING_DISBURSEMENT'].includes(item.newStatus?.code || '');

        let icon = 'pi pi-check';
        let color = '#22c55e'; // green

        if (isRejection) {
            icon = 'pi pi-times';
            color = '#ef4444'; // red
        } else if (isPending) {
            icon = 'pi pi-clock';
            color = '#f59e0b'; // orange
        } else if (item.newStatus?.code === 'INITIALIZE') {
            icon = 'pi pi-plus';
            color = '#3b82f6'; // blue
        } else if (item.newStatus?.code === 'FIELD_VISIT' || item.newStatus?.code === 'VISIT_COMPLETED') {
            icon = 'pi pi-map-marker';
            color = '#8b5cf6'; // purple
        } else if (item.newStatus?.code === 'UNDER_ANALYSIS') {
            icon = 'pi pi-search';
            color = '#06b6d4'; // cyan
        } else if (item.newStatus?.code === 'DISBURSED') {
            icon = 'pi pi-wallet';
            color = '#10b981'; // emerald
        }

        return (
            <span
                className="flex align-items-center justify-content-center border-circle shadow-1"
                style={{
                    backgroundColor: color,
                    width: '2.5rem',
                    height: '2.5rem',
                    color: 'white'
                }}
            >
                <i className={icon}></i>
            </span>
        );
    };

    // Timeline content template
    const timelineContent = (item: StatusHistory) => {
        return (
            <Card className="mb-3 shadow-2">
                <div className="flex flex-column gap-2">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center gap-2">
                            {item.previousStatus && (
                                <>
                                    <Tag
                                        value={item.previousStatus.nameFr}
                                        style={{ backgroundColor: item.previousStatus.color || '#6c757d' }}
                                    />
                                    <i className="pi pi-arrow-right text-500"></i>
                                </>
                            )}
                            <Tag
                                value={item.newStatus?.nameFr || 'N/A'}
                                style={{ backgroundColor: item.newStatus?.color || '#22c55e' }}
                            />
                        </div>
                        <span className="text-500 text-sm">{formatDate(item.createdAt)}</span>
                    </div>

                    <div className="flex align-items-center gap-2 text-600">
                        <i className="pi pi-user"></i>
                        <span className="font-semibold">{getChangedByName(item)}</span>
                    </div>

                    {item.changeReason && (
                        <div className="surface-100 p-2 border-round">
                            <div className="text-500 text-sm mb-1"><i className="pi pi-comment mr-1"></i>Commentaire:</div>
                            <div className="text-700">{item.changeReason}</div>
                        </div>
                    )}
                </div>
            </Card>
        );
    };

    // Table templates
    const dateBodyTemplate = (rowData: StatusHistory) => formatDate(rowData.createdAt);

    const previousStatusTemplate = (rowData: StatusHistory) => {
        if (!rowData.previousStatus) return <span className="text-500">-</span>;
        return <Tag value={rowData.previousStatus.nameFr} style={{ backgroundColor: rowData.previousStatus.color || '#6c757d' }} />;
    };

    const newStatusTemplate = (rowData: StatusHistory) => {
        return <Tag value={rowData.newStatus?.nameFr || 'N/A'} style={{ backgroundColor: rowData.newStatus?.color || '#22c55e' }} />;
    };

    const userTemplate = (rowData: StatusHistory) => getChangedByName(rowData);

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header with application info */}
            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-3">
                    <Button
                        icon="pi pi-arrow-left"
                        rounded
                        text
                        onClick={() => router.push('/credit/demandes')}
                        tooltip="Retour"
                    />
                    <div>
                        <h4 className="m-0">
                            <i className="pi pi-history mr-2"></i>
                            Historique du Workflow
                        </h4>
                        {application && (
                            <span className="text-500">Dossier: {application.applicationNumber}</span>
                        )}
                    </div>
                </div>
                <Button
                    icon="pi pi-refresh"
                    label="Actualiser"
                    onClick={loadData}
                    loading={loading}
                />
            </div>

            {/* Application Summary Card */}
            {application && (
                <Card className="mb-4 bg-blue-50">
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="text-500 text-sm">Numero Dossier</div>
                            <div className="font-bold text-lg">{application.applicationNumber}</div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="text-500 text-sm">Client</div>
                            <div className="font-bold">
                                {application.client ? `${application.client.firstName} ${application.client.lastName}` : 'N/A'}
                            </div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="text-500 text-sm">Montant</div>
                            <div className="font-bold text-primary">{formatCurrency(application.amountRequested)}</div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="text-500 text-sm">Duree</div>
                            <div className="font-bold">{application.durationMonths} mois</div>
                        </div>
                        <div className="col-12 md:col-2">
                            <div className="text-500 text-sm">Statut Actuel</div>
                            <Tag
                                value={application.status?.nameFr || 'N/A'}
                                style={{ backgroundColor: application.status?.color || '#6c757d' }}
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* Tabs for Timeline and Table views */}
            <TabView>
                <TabPanel header="Vue Timeline" leftIcon="pi pi-clock mr-2">
                    {loading ? (
                        <div className="flex align-items-center justify-content-center p-5">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
                            <span className="ml-2">Chargement de l'historique...</span>
                        </div>
                    ) : histories.length === 0 ? (
                        <div className="text-center p-5">
                            <i className="pi pi-inbox text-500" style={{ fontSize: '3rem' }}></i>
                            <p className="text-500 mt-3">Aucun historique disponible pour ce dossier</p>
                        </div>
                    ) : (
                        <div className="p-3">
                            <Timeline
                                value={histories}
                                align="alternate"
                                marker={timelineMarker}
                                content={timelineContent}
                                className="customized-timeline"
                            />
                        </div>
                    )}
                </TabPanel>

                <TabPanel header="Vue Tableau" leftIcon="pi pi-table mr-2">
                    <DataTable
                        value={histories}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        loading={loading}
                        emptyMessage="Aucun historique disponible"
                        className="p-datatable-sm"
                        sortField="createdAt"
                        sortOrder={-1}
                    >
                        <Column header="Date/Heure" body={dateBodyTemplate} sortable style={{ width: '180px' }} />
                        <Column header="Statut Precedent" body={previousStatusTemplate} />
                        <Column header="Nouveau Statut" body={newStatusTemplate} />
                        <Column header="Utilisateur" body={userTemplate} />
                        <Column field="changeReason" header="Commentaire" style={{ maxWidth: '300px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            {/* Statistics Summary */}
            {histories.length > 0 && (
                <Card className="mt-4">
                    <h5 className="m-0 mb-3"><i className="pi pi-chart-bar mr-2"></i>Resume du Workflow</h5>
                    <div className="grid">
                        <div className="col-12 md:col-3">
                            <div className="surface-100 p-3 border-round text-center">
                                <div className="text-3xl font-bold text-primary">{histories.length}</div>
                                <div className="text-500">Total Changements</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-100 p-3 border-round text-center">
                                <div className="text-3xl font-bold text-green-600">
                                    {histories.filter(h => ['APPROVED', 'APPROVED_CONDITIONS', 'APPROUVE_MONTANT_REDUIT', 'DISBURSED'].includes(h.newStatus?.code || '')).length}
                                </div>
                                <div className="text-500">Etapes Validees</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-100 p-3 border-round text-center">
                                <div className="text-3xl font-bold text-orange-600">
                                    {histories.filter(h => h.newStatus?.code?.includes('PENDING')).length}
                                </div>
                                <div className="text-500">Etapes en Attente</div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="surface-100 p-3 border-round text-center">
                                <div className="text-3xl font-bold text-blue-600">
                                    {histories.length > 0 ? formatDate(histories[histories.length - 1].createdAt).split(' ')[0] : 'N/A'}
                                </div>
                                <div className="text-500">Date Debut</div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}
