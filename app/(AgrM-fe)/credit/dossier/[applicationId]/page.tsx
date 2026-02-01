'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';
import { buildApiUrl } from '@/utils/apiConfig';

// API URLs
const APP_URL = buildApiUrl('/api/credit/applications');
const INCOME_URL = buildApiUrl('/api/credit/income-analysis');
const EXPENSE_URL = buildApiUrl('/api/credit/expense-analysis');
const CAPACITY_URL = buildApiUrl('/api/credit/capacity-analysis');
const VISITS_URL = buildApiUrl('/api/credit/field-visits');
const INTERVIEWS_URL = buildApiUrl('/api/credit/client-interviews');
const DOCUMENTS_URL = buildApiUrl('/api/credit/application-documents');

// Status mapping for visits
const StatutsVisite = [
    { code: 'PLANNED', label: 'Planifiée', color: 'info' },
    { code: 'IN_PROGRESS', label: 'En cours', color: 'warning' },
    { code: 'COMPLETED', label: 'Terminée', color: 'success' },
    { code: 'CANCELLED', label: 'Annulée', color: 'danger' },
    { code: 'RESCHEDULED', label: 'Reportée', color: 'warning' }
];

export default function DossierCreditPage() {
    const params = useParams();
    const applicationId = Number(params.applicationId);

    // State
    const [application, setApplication] = useState<any>(null);
    const [revenus, setRevenus] = useState<any[]>([]);
    const [depenses, setDepenses] = useState<any[]>([]);
    const [capacite, setCapacite] = useState<any>(null);
    const [visites, setVisites] = useState<any[]>([]);
    const [entretiens, setEntretiens] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [showVisitDialog, setShowVisitDialog] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [selectedVisitInterview, setSelectedVisitInterview] = useState<any>(null);

    const toast = useRef<Toast>(null);

    // Fetch helper
    const fetchWithAuth = async (url: string) => {
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    };

    // Load all data
    useEffect(() => {
        if (applicationId) {
            loadAllData();
        }
    }, [applicationId]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [appData, incomeData, expenseData, capacityData, visitsData, documentsData] = await Promise.all([
                fetchWithAuth(`${APP_URL}/findbyid/${applicationId}`).catch(() => null),
                fetchWithAuth(`${INCOME_URL}/findbyapplication/${applicationId}`).catch(() => []),
                fetchWithAuth(`${EXPENSE_URL}/findbyapplication/${applicationId}`).catch(() => []),
                fetchWithAuth(`${CAPACITY_URL}/findbyapplication/${applicationId}`).catch(() => null),
                fetchWithAuth(`${VISITS_URL}/findbyapplication/${applicationId}`).catch(() => []),
                fetchWithAuth(`${DOCUMENTS_URL}/findbyapplication/${applicationId}`).catch(() => [])
            ]);

            setApplication(appData);
            setRevenus(Array.isArray(incomeData) ? incomeData : incomeData?.content || []);
            setDepenses(Array.isArray(expenseData) ? expenseData : expenseData?.content || []);
            setCapacite(capacityData);
            setVisites(Array.isArray(visitsData) ? visitsData : visitsData?.content || []);
            setDocuments(Array.isArray(documentsData) ? documentsData : documentsData?.content || []);

            // Load interviews for each visit
            if (visitsData && visitsData.length > 0) {
                const interviewPromises = visitsData.map(async (visit: any) => {
                    if (visit.id) {
                        try {
                            const response = await fetch(`${INTERVIEWS_URL}/findbyvisit/${visit.id}`, {
                                method: 'GET',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include'
                            });
                            if (response.ok) {
                                const interview = await response.json();
                                return { ...interview, fieldVisit: visit };
                            }
                        } catch (err) {
                            // No interview for this visit
                        }
                    }
                    return null;
                });
                const results = await Promise.all(interviewPromises);
                setEntretiens(results.filter(i => i !== null));
            }
        } catch (err) {
            console.error('Error loading data:', err);
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des données', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    // View visit details
    const handleViewVisit = async (visit: any) => {
        setSelectedVisit(visit);
        setSelectedVisitInterview(null);
        setShowVisitDialog(true);
        // Load interview
        if (visit.id) {
            try {
                const response = await fetch(`${INTERVIEWS_URL}/findbyvisit/${visit.id}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                if (response.ok) {
                    const interview = await response.json();
                    setSelectedVisitInterview(interview);
                }
            } catch (err) {
                console.log('No interview found');
            }
        }
    };

    // Format helpers
    const formatCurrency = (amount: number | undefined) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF', maximumFractionDigits: 0 }).format(amount || 0);

    const formatDate = (date: string | undefined) =>
        date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A';

    // Calculate totals
    const totalRevenus = revenus.reduce((sum, r) => sum + (r.monthlyAmount || 0), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
    const soldeDisponible = totalRevenus - totalDepenses;

    // Status template for visits
    const visitStatusTemplate = (row: any) => {
        const status = StatutsVisite.find(s => s.code === row.visitStatus);
        return <Tag value={status?.label || row.visitStatus} severity={status?.color as any || 'info'} />;
    };

    // Document status template
    const documentStatusTemplate = (row: any) => {
        if (row.isValidated) return <Tag value="Validé" severity="success" />;
        if (row.isReceived) return <Tag value="Reçu" severity="warning" />;
        return <Tag value="En attente" severity="danger" />;
    };

    if (loading) {
        return (
            <div className="flex align-items-center justify-content-center p-5">
                <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                <span className="ml-3 text-xl">Chargement du dossier...</span>
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="m-0">
                    <i className="pi pi-folder-open mr-2"></i>
                    Dossier de Crédit - {application?.applicationNumber || 'N/A'}
                </h4>
                <Button
                    label="Retour aux demandes"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    onClick={() => window.location.href = '/credit/demandes'}
                />
            </div>

            {/* Client Info Summary Card */}
            <Card className="mb-4 surface-100">
                <div className="grid">
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-user mr-2"></i>Client:</strong><br />
                        <span className="text-lg">{application?.client?.firstName} {application?.client?.lastName}</span>
                    </div>
                    <div className="col-12 md:col-3">
                        <strong><i className="pi pi-money-bill mr-2"></i>Montant demandé:</strong><br />
                        <span className="text-lg text-primary">{formatCurrency(application?.amountRequested)}</span>
                    </div>
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-clock mr-2"></i>Durée:</strong><br />
                        <span className="text-lg">{application?.durationMonths || 0} mois</span>
                    </div>
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-tag mr-2"></i>Objet:</strong><br />
                        <span>{application?.creditPurpose?.nameFr || 'N/A'}</span>
                    </div>
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-info-circle mr-2"></i>Statut:</strong><br />
                        <Tag
                            value={application?.status?.nameFr || 'N/A'}
                            style={{ backgroundColor: application?.status?.color || '#6c757d' }}
                        />
                    </div>
                </div>
            </Card>

            <TabView>
                {/* Tab 1: Résumé / Summary */}
                <TabPanel header="Résumé" leftIcon="pi pi-chart-pie mr-2">
                    <div className="grid">
                        {/* Financial Summary */}
                        <div className="col-12 md:col-6">
                            <Card title="Analyse Financière" className="h-full">
                                <div className="grid">
                                    <div className="col-6">
                                        <div className="text-500 mb-1">Total Revenus</div>
                                        <div className="text-2xl text-green-500 font-bold">{formatCurrency(totalRevenus)}</div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 mb-1">Total Dépenses</div>
                                        <div className="text-2xl text-red-500 font-bold">{formatCurrency(totalDepenses)}</div>
                                    </div>
                                    <div className="col-12">
                                        <Divider />
                                        <div className="text-500 mb-1">Solde Disponible</div>
                                        <div className={`text-3xl font-bold ${soldeDisponible >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(soldeDisponible)}
                                        </div>
                                    </div>
                                    {capacite && (
                                        <>
                                            <div className="col-12">
                                                <Divider />
                                                <div className="text-500 mb-2">Ratio d'Endettement</div>
                                                <ProgressBar
                                                    value={Math.min(capacite.debtToIncomeRatio || 0, 100)}
                                                    color={capacite.debtToIncomeRatio > 40 ? '#ef4444' : capacite.debtToIncomeRatio > 30 ? '#f59e0b' : '#22c55e'}
                                                />
                                                <div className="mt-1 text-sm">{(capacite.debtToIncomeRatio || 0).toFixed(1)}%</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Visits Summary */}
                        <div className="col-12 md:col-6">
                            <Card title="Visites & Entretiens" className="h-full">
                                <div className="grid">
                                    <div className="col-6">
                                        <div className="text-500 mb-1">Visites Terrain</div>
                                        <div className="text-3xl font-bold text-blue-500">{visites.length}</div>
                                        <div className="text-sm text-500 mt-1">
                                            {visites.filter(v => v.visitStatus === 'COMPLETED').length} terminée(s)
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="text-500 mb-1">Entretiens Client</div>
                                        <div className="text-3xl font-bold text-purple-500">{entretiens.length}</div>
                                    </div>
                                    <div className="col-12">
                                        <Divider />
                                        <div className="text-500 mb-1">Documents</div>
                                        <div className="flex gap-3 mt-2">
                                            <div>
                                                <Tag value={`${documents.filter(d => d.isValidated).length} validés`} severity="success" />
                                            </div>
                                            <div>
                                                <Tag value={`${documents.filter(d => d.isReceived && !d.isValidated).length} reçus`} severity="warning" />
                                            </div>
                                            <div>
                                                <Tag value={`${documents.filter(d => !d.isReceived).length} en attente`} severity="danger" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabPanel>

                {/* Tab 2: Analyse Financière */}
                <TabPanel header="Analyse Financière" leftIcon="pi pi-chart-line mr-2">
                    <div className="grid">
                        {/* Revenus */}
                        <div className="col-12 lg:col-6">
                            <h5><i className="pi pi-arrow-up text-green-500 mr-2"></i>Revenus ({revenus.length})</h5>
                            <DataTable value={revenus} emptyMessage="Aucun revenu enregistré" className="p-datatable-sm">
                                <Column field="incomeType.nameFr" header="Type" />
                                <Column field="sourceName" header="Source" />
                                <Column
                                    field="monthlyAmount"
                                    header="Montant Mensuel"
                                    body={(row) => formatCurrency(row.monthlyAmount)}
                                />
                                <Column field="isVerified" header="Vérifié" body={(row) => (
                                    row.isVerified ? <Tag value="Oui" severity="success" /> : <Tag value="Non" severity="warning" />
                                )} />
                            </DataTable>
                            <div className="mt-2 text-right">
                                <strong>Total: </strong>
                                <span className="text-green-500 font-bold">{formatCurrency(totalRevenus)}</span>
                            </div>
                        </div>

                        {/* Dépenses */}
                        <div className="col-12 lg:col-6">
                            <h5><i className="pi pi-arrow-down text-red-500 mr-2"></i>Dépenses ({depenses.length})</h5>
                            <DataTable value={depenses} emptyMessage="Aucune dépense enregistrée" className="p-datatable-sm">
                                <Column field="expenseType.nameFr" header="Type" />
                                <Column field="description" header="Description" />
                                <Column
                                    field="monthlyAmount"
                                    header="Montant Mensuel"
                                    body={(row) => formatCurrency(row.monthlyAmount)}
                                />
                                <Column field="isRecurring" header="Récurrent" body={(row) => (
                                    row.isRecurring ? <Tag value="Oui" severity="info" /> : <Tag value="Non" />
                                )} />
                            </DataTable>
                            <div className="mt-2 text-right">
                                <strong>Total: </strong>
                                <span className="text-red-500 font-bold">{formatCurrency(totalDepenses)}</span>
                            </div>
                        </div>

                        {/* Capacité de Remboursement */}
                        {capacite && (
                            <div className="col-12">
                                <Divider />
                                <h5><i className="pi pi-calculator mr-2"></i>Capacité de Remboursement</h5>
                                <div className="surface-100 p-3 border-round">
                                    <div className="grid">
                                        <div className="col-6 md:col-3">
                                            <strong>Revenu Net Mensuel:</strong><br />
                                            {formatCurrency(capacite.netMonthlyIncome)}
                                        </div>
                                        <div className="col-6 md:col-3">
                                            <strong>Capacité Mensuelle:</strong><br />
                                            {formatCurrency(capacite.monthlyRepaymentCapacity)}
                                        </div>
                                        <div className="col-6 md:col-3">
                                            <strong>Ratio Endettement:</strong><br />
                                            <span className={capacite.debtToIncomeRatio > 40 ? 'text-red-500' : 'text-green-500'}>
                                                {(capacite.debtToIncomeRatio || 0).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="col-6 md:col-3">
                                            <strong>Montant Maximum:</strong><br />
                                            <span className="text-primary font-bold">{formatCurrency(capacite.maxLoanAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </TabPanel>

                {/* Tab 3: Visites & Entretiens */}
                <TabPanel header="Visites & Entretiens" leftIcon="pi pi-map-marker mr-2">
                    <div className="grid">
                        {/* Visites */}
                        <div className="col-12">
                            <h5><i className="pi pi-map-marker mr-2"></i>Historique des Visites Terrain ({visites.length})</h5>
                            <DataTable value={visites} emptyMessage="Aucune visite enregistrée" className="p-datatable-sm">
                                <Column
                                    field="scheduledDate"
                                    header="Date Prévue"
                                    body={(row) => formatDate(row.scheduledDate)}
                                    sortable
                                />
                                <Column
                                    field="actualDate"
                                    header="Date Réelle"
                                    body={(row) => formatDate(row.actualDate)}
                                />
                                <Column field="userAction" header="Agent" />
                                <Column header="Statut" body={visitStatusTemplate} />
                                <Column field="recommendation.nameFr" header="Recommandation" />
                                <Column
                                    field="recommendedAmount"
                                    header="Montant Recommandé"
                                    body={(row) => formatCurrency(row.recommendedAmount)}
                                />
                                <Column
                                    header="Actions"
                                    body={(row) => (
                                        <Button
                                            icon="pi pi-eye"
                                            rounded
                                            text
                                            severity="info"
                                            onClick={() => handleViewVisit(row)}
                                            tooltip="Voir détails"
                                        />
                                    )}
                                />
                            </DataTable>
                        </div>

                        {/* Entretiens */}
                        <div className="col-12 mt-4">
                            <h5><i className="pi pi-comments mr-2"></i>Historique des Entretiens Client ({entretiens.length})</h5>
                            <DataTable value={entretiens} emptyMessage="Aucun entretien enregistré" className="p-datatable-sm">
                                <Column
                                    field="createdAt"
                                    header="Date Création"
                                    body={(row) => formatDate(row.createdAt)}
                                    sortable
                                />
                                <Column
                                    header="Visite Associée"
                                    body={(row) => formatDate(row.fieldVisit?.scheduledDate)}
                                />
                                <Column field="communicationQuality" header="Communication" />
                                <Column field="motivationLevel" header="Motivation" />
                                <Column field="honestyAssessment" header="Honnêteté" />
                                <Column
                                    header="Actions"
                                    body={(row) => (
                                        <Button
                                            icon="pi pi-eye"
                                            rounded
                                            text
                                            severity="info"
                                            onClick={() => {
                                                if (row.fieldVisit) handleViewVisit(row.fieldVisit);
                                            }}
                                            tooltip="Voir visite"
                                        />
                                    )}
                                />
                            </DataTable>
                        </div>
                    </div>
                </TabPanel>

                {/* Tab 4: Documents */}
                <TabPanel header="Documents" leftIcon="pi pi-file mr-2">
                    <h5><i className="pi pi-file mr-2"></i>Documents du Dossier ({documents.length})</h5>
                    <DataTable value={documents} emptyMessage="Aucun document enregistré" className="p-datatable-sm">
                        <Column field="documentType.nameFr" header="Type de Document" sortable />
                        <Column field="documentName" header="Nom du Fichier" />
                        <Column header="Statut" body={documentStatusTemplate} />
                        <Column
                            field="receivedDate"
                            header="Date Réception"
                            body={(row) => formatDate(row.receivedDate)}
                        />
                        <Column
                            field="validatedDate"
                            header="Date Validation"
                            body={(row) => formatDate(row.validatedDate)}
                        />
                        <Column field="validationNotes" header="Notes" />
                    </DataTable>

                    {/* Summary */}
                    <div className="surface-100 p-3 border-round mt-3">
                        <div className="flex gap-4">
                            <div>
                                <strong>Total: </strong>{documents.length}
                            </div>
                            <div>
                                <Tag value={`${documents.filter(d => d.isValidated).length} validés`} severity="success" />
                            </div>
                            <div>
                                <Tag value={`${documents.filter(d => d.isReceived && !d.isValidated).length} à valider`} severity="warning" />
                            </div>
                            <div>
                                <Tag value={`${documents.filter(d => !d.isReceived).length} en attente`} severity="danger" />
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>

            {/* Visit Details Dialog */}
            <Dialog
                header="Détails de la Visite"
                visible={showVisitDialog}
                style={{ width: '80vw' }}
                onHide={() => setShowVisitDialog(false)}
                maximizable
            >
                {selectedVisit && (
                    <div className="grid">
                        {/* Visit Info */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h5><i className="pi pi-calendar mr-2"></i>Informations de la Visite</h5>
                                <div className="grid">
                                    <div className="col-12 md:col-3">
                                        <strong>Date Prévue:</strong><br />
                                        {formatDate(selectedVisit.scheduledDate)}
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <strong>Date Réelle:</strong><br />
                                        {formatDate(selectedVisit.actualDate)}
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <strong>Agent:</strong><br />
                                        {selectedVisit.userAction || 'N/A'}
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <strong>Statut:</strong><br />
                                        {visitStatusTemplate(selectedVisit)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Housing & Business */}
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-3 h-full">
                                <h5><i className="pi pi-home mr-2"></i>Domicile</h5>
                                <p><strong>Statut:</strong> {selectedVisit.housingStatus?.nameFr || 'N/A'}</p>
                                <p><strong>Pièces:</strong> {selectedVisit.numberOfRooms || 'N/A'}</p>
                                <p><strong>Équipements:</strong> {selectedVisit.hasElectricity && 'Électricité '}{selectedVisit.hasWater && 'Eau'}</p>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="surface-100 p-3 border-round mb-3 h-full">
                                <h5><i className="pi pi-briefcase mr-2"></i>Activité</h5>
                                <p><strong>Vérifiée:</strong> {selectedVisit.businessVerified ? 'Oui' : 'Non'}</p>
                                <p><strong>Valeur Stock:</strong> {formatCurrency(selectedVisit.stockValueEstimated)}</p>
                                <p><strong>Condition:</strong> {selectedVisit.businessCondition || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Recommendation */}
                        <div className="col-12">
                            <div className="surface-100 p-3 border-round mb-3">
                                <h5><i className="pi pi-check-circle mr-2"></i>Recommandation</h5>
                                <div className="grid">
                                    <div className="col-4">
                                        <strong>Décision:</strong><br />
                                        {selectedVisit.recommendation?.nameFr || 'N/A'}
                                    </div>
                                    <div className="col-4">
                                        <strong>Montant Recommandé:</strong><br />
                                        {formatCurrency(selectedVisit.recommendedAmount)}
                                    </div>
                                    <div className="col-4">
                                        <strong>Durée:</strong><br />
                                        {selectedVisit.recommendedDuration ? `${selectedVisit.recommendedDuration} mois` : 'N/A'}
                                    </div>
                                </div>
                                {selectedVisit.positivePoints && (
                                    <div className="mt-3">
                                        <strong className="text-green-500">Points Positifs:</strong>
                                        <p>{selectedVisit.positivePoints}</p>
                                    </div>
                                )}
                                {selectedVisit.riskPoints && (
                                    <div className="mt-2">
                                        <strong className="text-orange-500">Points de Vigilance:</strong>
                                        <p>{selectedVisit.riskPoints}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interview */}
                        {selectedVisitInterview && (
                            <div className="col-12">
                                <div className="surface-100 p-3 border-round">
                                    <h5><i className="pi pi-comments mr-2"></i>Entretien Client</h5>
                                    <div className="grid">
                                        <div className="col-4">
                                            <strong>Communication:</strong><br />
                                            {selectedVisitInterview.communicationQuality || 'N/A'}
                                        </div>
                                        <div className="col-4">
                                            <strong>Honnêteté:</strong><br />
                                            {selectedVisitInterview.honestyAssessment || 'N/A'}
                                        </div>
                                        <div className="col-4">
                                            <strong>Motivation:</strong><br />
                                            {selectedVisitInterview.motivationLevel || 'N/A'}
                                        </div>
                                        {selectedVisitInterview.generalNotes && (
                                            <div className="col-12 mt-2">
                                                <strong>Notes:</strong>
                                                <p>{selectedVisitInterview.generalNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
}
