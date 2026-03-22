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
import Cookies from 'js-cookie';

// API URLs
const APP_URL = buildApiUrl('/api/credit/applications');
const SAVINGS_ACCOUNTS_URL = buildApiUrl('/api/savings-accounts');
const INCOME_URL = buildApiUrl('/api/credit/income-analysis');
const EXPENSE_URL = buildApiUrl('/api/credit/expense-analysis');
const CAPACITY_URL = buildApiUrl('/api/credit/capacity-analysis');
const VISITS_URL = buildApiUrl('/api/credit/field-visits');
const INTERVIEWS_URL = buildApiUrl('/api/credit/client-interviews');
const DOCUMENTS_URL = buildApiUrl('/api/credit/application-documents');
const PRODUCTS_URL = buildApiUrl('/api/financial-products/loan-products');

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
    const [savingsAccount, setSavingsAccount] = useState<any>(null);
    const [productFees, setProductFees] = useState<any[]>([]);
    const [productGuarantees, setProductGuarantees] = useState<any[]>([]);

    // Dialog states
    const [showVisitDialog, setShowVisitDialog] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState<any>(null);
    const [selectedVisitInterview, setSelectedVisitInterview] = useState<any>(null);

    const toast = useRef<Toast>(null);

    // Fetch helper
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
            // Fetch savings account for account number display
            if (appData?.savingsAccountId) {
                fetchWithAuth(`${SAVINGS_ACCOUNTS_URL}/findbyid/${appData.savingsAccountId}`)
                    .then(acc => setSavingsAccount(acc))
                    .catch(() => setSavingsAccount(null));
            }
            // Fetch product fees and guarantees
            if (appData?.loanProductId) {
                Promise.all([
                    fetchWithAuth(`${PRODUCTS_URL}/${appData.loanProductId}/fees`).catch(() => []),
                    fetchWithAuth(`${PRODUCTS_URL}/${appData.loanProductId}/guarantees`).catch(() => [])
                ]).then(([fees, guarantees]) => {
                    setProductFees(Array.isArray(fees) ? fees : []);
                    setProductGuarantees(Array.isArray(guarantees) ? guarantees : []);
                });
            }
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
                                headers: {
                                    'Content-Type': 'application/json',
                                    ...(Cookies.get('token') ? { 'Authorization': `Bearer ${Cookies.get('token')}` } : {})
                                },
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
                    headers: {
                        'Content-Type': 'application/json',
                        ...(Cookies.get('token') ? { 'Authorization': `Bearer ${Cookies.get('token')}` } : {})
                    },
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
    const totalRevenusVerifies = revenus.filter(r => r.isVerified).reduce((sum, r) => sum + (r.monthlyAmount || 0), 0);
    const totalDepenses = depenses.reduce((sum, d) => sum + (d.monthlyAmount || 0), 0);
    const soldeDisponible = totalRevenus - totalDepenses;
    const revenuDisponible = totalRevenusVerifies - totalDepenses;
    const capaciteCalculee = revenuDisponible * 0.6;
    const mensualiteDemandee = (application?.amountRequested || 0) / (application?.durationMonths || 1);
    const ratioEndettement = totalRevenusVerifies > 0 ? (mensualiteDemandee / totalRevenusVerifies) * 100 : 0;

    // Disbursement breakdown calculations
    const amountRequested = application?.amountRequested || 0;
    const totalFrais = productFees.reduce((sum, fee) => {
        if (fee.percentageRate != null && fee.percentageRate > 0) {
            return sum + (fee.percentageRate / 100) * amountRequested;
        }
        return sum + (fee.fixedAmount || 0);
    }, 0);
    const totalCaution = productGuarantees.reduce((sum, g) => {
        const pct = g.minCoveragePercentage || 0;
        return sum + (pct / 100) * amountRequested;
    }, 0);
    const montantNetClient = amountRequested - totalFrais - totalCaution;

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
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-user mr-2"></i>Client:</strong><br />
                        <span className="text-lg">{application?.client?.firstName} {application?.client?.lastName}</span>
                        <br />
                        <small className="text-500"><i className="pi pi-id-card mr-1"></i>N° Compte: {savingsAccount?.accountNumber || 'N/A'}</small>
                    </div>
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-money-bill mr-2"></i>Montant demandé:</strong><br />
                        <span className="text-lg text-primary">{formatCurrency(application?.amountRequested)}</span>
                    </div>
                    <div className="col-12 md:col-2">
                        <strong><i className="pi pi-percentage mr-2"></i>Taux:</strong><br />
                        <span className="text-lg text-green-600">{application?.interestRate != null ? `${Number(application.interestRate).toFixed(2)}%` : 'N/A'}</span>
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
                                    {totalRevenusVerifies > 0 && (
                                        <div className="col-12">
                                            <Divider />
                                            <div className="text-500 mb-2">Ratio d'Endettement</div>
                                            <ProgressBar
                                                value={Math.min(ratioEndettement, 100)}
                                                color={ratioEndettement > 40 ? '#ef4444' : ratioEndettement > 30 ? '#f59e0b' : '#22c55e'}
                                            />
                                            <div className="mt-1 text-sm">{ratioEndettement.toFixed(1)}%</div>
                                        </div>
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

                        {/* Fees & Guarantees */}
                        {(productFees.length > 0 || productGuarantees.length > 0) && (
                            <>
                                {productFees.length > 0 && (
                                    <div className="col-12 md:col-6">
                                        <Card title={`Frais du Produit (${productFees.length})`} className="h-full">
                                            <DataTable value={productFees} size="small" stripedRows>
                                                <Column header="Frais" body={(row: any) => row.feeNameFr || row.feeName || row.feeType?.nameFr || '-'} />
                                                <Column header="Montant/Taux" body={(row: any) => {
                                                    if (row.calculationMethod?.code === 'PERCENTAGE' || row.percentageRate) {
                                                        return `${row.percentageRate || 0} %`;
                                                    }
                                                    return row.fixedAmount != null ? formatCurrency(row.fixedAmount) : '-';
                                                }} />
                                                <Column header="Perception" body={(row: any) => {
                                                    const labels: any = { AT_DISBURSEMENT: 'Décaissement', MONTHLY: 'Mensuel', UPFRONT: 'Avance', AT_MATURITY: 'Échéance' };
                                                    return labels[row.collectionTime] || row.collectionTime || '-';
                                                }} />
                                                <Column header="Obligatoire" body={(row: any) => (
                                                    <Tag value={row.isMandatory ? 'Oui' : 'Non'} severity={row.isMandatory ? 'danger' : 'info'} />
                                                )} style={{ width: '100px' }} />
                                            </DataTable>
                                        </Card>
                                    </div>
                                )}

                                {productGuarantees.length > 0 && (
                                    <div className="col-12 md:col-6">
                                        <Card title={`Garanties Requises (${productGuarantees.length})`} className="h-full">
                                            <DataTable value={productGuarantees} size="small" stripedRows>
                                                <Column header="Type de Garantie" body={(row: any) => row.guaranteeType?.nameFr || row.guaranteeType?.name || '-'} />
                                                <Column header="Couverture Min (%)" body={(row: any) => row.minCoveragePercentage != null ? `${row.minCoveragePercentage} %` : '-'} />
                                                <Column header="Obligatoire" body={(row: any) => (
                                                    <Tag value={row.isMandatory ? 'Oui' : 'Non'} severity={row.isMandatory ? 'danger' : 'info'} />
                                                )} style={{ width: '100px' }} />
                                            </DataTable>
                                        </Card>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Disbursement Breakdown */}
                        <div className="col-12">
                            <Card title={<span><i className="pi pi-wallet mr-2 text-primary"></i>Simulation de Décaissement</span>}>
                                <div className="grid">
                                    <div className="col-12 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-500 mb-1 text-sm">Montant Total Demandé</div>
                                            <div className="text-2xl font-bold text-primary">{formatCurrency(amountRequested)}</div>
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-500 mb-1 text-sm">
                                                <i className="pi pi-minus-circle text-orange-500 mr-1"></i>
                                                Total Frais
                                            </div>
                                            <div className="text-2xl font-bold text-orange-500">{formatCurrency(totalFrais)}</div>
                                            {productFees.length > 0 && (
                                                <div className="mt-2 text-left">
                                                    {productFees.map((fee: any, idx: number) => {
                                                        const feeAmount = (fee.percentageRate != null && fee.percentageRate > 0)
                                                            ? (fee.percentageRate / 100) * amountRequested
                                                            : (fee.fixedAmount || 0);
                                                        return (
                                                            <div key={idx} className="text-xs text-500 flex justify-content-between">
                                                                <span>{fee.feeNameFr || fee.feeName || fee.feeType?.nameFr || 'Frais'}:</span>
                                                                <span className="font-semibold">{formatCurrency(feeAmount)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <div className="surface-100 p-3 border-round text-center">
                                            <div className="text-500 mb-1 text-sm">
                                                <i className="pi pi-minus-circle text-red-500 mr-1"></i>
                                                Caution / Garantie
                                            </div>
                                            <div className="text-2xl font-bold text-red-500">{formatCurrency(totalCaution)}</div>
                                            {productGuarantees.length > 0 && (
                                                <div className="mt-2 text-left">
                                                    {productGuarantees.map((g: any, idx: number) => {
                                                        const cautionAmount = ((g.minCoveragePercentage || 0) / 100) * amountRequested;
                                                        return (
                                                            <div key={idx} className="text-xs text-500 flex justify-content-between">
                                                                <span>{g.guaranteeType?.nameFr || g.guaranteeType?.name || 'Caution'}:</span>
                                                                <span className="font-semibold">{formatCurrency(cautionAmount)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-12 md:col-3">
                                        <div className="border-2 border-primary p-3 border-round text-center" style={{ borderStyle: 'solid' }}>
                                            <div className="text-500 mb-1 text-sm">
                                                <i className="pi pi-check-circle text-green-600 mr-1"></i>
                                                Montant Net Reçu par le Client
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">{formatCurrency(montantNetClient)}</div>
                                            <div className="text-xs text-500 mt-1">
                                                {amountRequested > 0 ? `${((montantNetClient / amountRequested) * 100).toFixed(1)}% du montant demandé` : ''}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="surface-50 p-2 border-round mt-3 text-sm text-500">
                                    <i className="pi pi-info-circle mr-1"></i>
                                    Formule: Montant Net = Montant Demandé − Frais − Caution
                                    {totalFrais > 0 && <span> ({formatCurrency(amountRequested)} − {formatCurrency(totalFrais)} − {formatCurrency(totalCaution)} = <strong className="text-green-600">{formatCurrency(montantNetClient)}</strong>)</span>}
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
                        <div className="col-12">
                            <Divider />
                            <h5><i className="pi pi-calculator mr-2"></i>Capacité de Remboursement</h5>
                            <div className="surface-100 p-3 border-round">
                                <div className="grid">
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Revenu vérifié:</div>
                                        <strong className="text-green-600">{formatCurrency(totalRevenusVerifies)}</strong>
                                    </div>
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Total Charges:</div>
                                        <strong className="text-red-500">{formatCurrency(totalDepenses)}</strong>
                                    </div>
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Revenu disponible:</div>
                                        <strong className={revenuDisponible >= 0 ? 'text-green-600' : 'text-red-500'}>{formatCurrency(revenuDisponible)}</strong>
                                    </div>
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Capacité (60%):</div>
                                        <strong className="text-primary">{formatCurrency(capaciteCalculee)}</strong>
                                    </div>
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Mensualité demandée:</div>
                                        <strong>{formatCurrency(mensualiteDemandee)}</strong>
                                    </div>
                                    <div className="col-6 md:col-2">
                                        <div className="text-500 mb-1">Ratio Endettement:</div>
                                        <strong className={ratioEndettement > 40 ? 'text-red-500' : ratioEndettement > 30 ? 'text-orange-500' : 'text-green-600'}>
                                            {ratioEndettement.toFixed(1)}%
                                        </strong>
                                    </div>
                                </div>
                                <Divider />
                                <div className="flex align-items-center gap-3 mt-2">
                                    <span className="text-500">Évaluation:</span>
                                    {capaciteCalculee >= mensualiteDemandee
                                        ? <Tag value="Capacité suffisante" severity="success" />
                                        : <Tag value="Capacité insuffisante" severity="danger" />
                                    }
                                    {capacite?.calculationNotes && (
                                        <span className="text-500 text-sm ml-3">{capacite.calculationNotes}</span>
                                    )}
                                </div>
                            </div>
                        </div>
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
                        <Column
                            field="documentName"
                            header="Nom du Fichier"
                            body={(row) => {
                                if (!row.filePath) return <span>{row.documentName || '—'}</span>;
                                const isPdfOrImage = row.mimeType?.startsWith('image/') ||
                                    row.filePath?.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp|pdf)$/);
                                const fileUrl = buildApiUrl(`/api/files/download?filePath=${encodeURIComponent(row.filePath)}`);
                                return (
                                    <span
                                        className="text-primary cursor-pointer hover:underline"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            if (isPdfOrImage) {
                                                window.open(fileUrl, '_blank');
                                            } else {
                                                const link = document.createElement('a');
                                                link.href = fileUrl;
                                                link.download = row.documentName || 'document';
                                                link.click();
                                            }
                                        }}
                                    >
                                        <i className="pi pi-file mr-1"></i>{row.documentName}
                                    </span>
                                );
                            }}
                        />
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
