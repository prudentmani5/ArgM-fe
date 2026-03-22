'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';

import useConsumApi, { getUserAction } from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { ProtectedPage } from '@/components/ProtectedPage';

function RapprochementCreditsPage() {
    const [loans, setLoans] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
    const [selectedLoan, setSelectedLoan] = useState<any>(null);
    const [paymentTotals, setPaymentTotals] = useState<any>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [globalFilterPayments, setGlobalFilterPayments] = useState('');

    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const { data: loansData, error: loansError, fetchData: fetchLoans } = useConsumApi('');
    const { data: paymentsData, error: paymentsError, fetchData: fetchPayments } = useConsumApi('');
    const { data: schedulesData, error: schedulesError, fetchData: fetchSchedules } = useConsumApi('');
    const { data: totalsData, error: totalsError, fetchData: fetchTotals } = useConsumApi('');

    const CREDIT_URL = buildApiUrl('/api/credit/applications');
    const PAYMENT_URL = buildApiUrl('/api/remboursement/payments');
    const SCHEDULE_URL = buildApiUrl('/api/remboursement/schedules');

    const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        fetchLoans(null, 'GET', `${CREDIT_URL}/findall`, 'loadLoans');
    }, []);

    // Helper to get status code from status (can be string or object with .code)
    const getStatusCode = (status: any): string => {
        if (!status) return '';
        if (typeof status === 'string') return status;
        return status.code || status.name || '';
    };

    const getStatusLabel = (status: any): string => {
        if (!status) return '-';
        if (typeof status === 'string') return status;
        return status.nameFr || status.name || status.code || '-';
    };

    const getStatusColor = (status: any): string => {
        if (!status) return '#6c757d';
        if (typeof status === 'object' && status.colorCode) return status.colorCode;
        const code = getStatusCode(status);
        if (code === 'DISBURSED' || code === 'ACTIVE') return '#22c55e';
        if (code === 'IN_ARREARS') return '#ef4444';
        if (code === 'CLOSED') return '#6c757d';
        return '#3b82f6';
    };

    useEffect(() => {
        if (loansData) {
            const arr = Array.isArray(loansData) ? loansData : loansData.content || [];
            // Filter only disbursed/active loans
            const disbursedStatuses = ['DISBURSED', 'ACTIVE', 'IN_ARREARS', 'CLOSED'];
            const activeLoans = arr.filter((l: any) =>
                disbursedStatuses.includes(getStatusCode(l.status))
            );
            setLoans(activeLoans.length > 0 ? activeLoans : arr);
        }
        if (loansError) showToast('error', 'Erreur', loansError.message || 'Erreur de chargement');
    }, [loansData, loansError]);

    useEffect(() => {
        if (paymentsData) {
            const arr = Array.isArray(paymentsData) ? paymentsData : paymentsData.content || [];
            setPayments(arr);
        }
    }, [paymentsData, paymentsError]);

    useEffect(() => {
        if (schedulesData) {
            const arr = Array.isArray(schedulesData) ? schedulesData : schedulesData.content || [];
            setSchedules(arr);
        }
    }, [schedulesData, schedulesError]);

    useEffect(() => {
        if (totalsData) setPaymentTotals(totalsData);
    }, [totalsData, totalsError]);

    const getLoanId = (loan: any): number => loan?.applicationId || loan?.id || 0;

    const getClientName = (loan: any): string => {
        if (loan?.clientName) return loan.clientName;
        if (loan?.client) return `${loan.client.firstName || ''} ${loan.client.lastName || ''}`.trim();
        return '';
    };

    const handleLoanSelect = (loanId: number) => {
        setSelectedLoanId(loanId);
        const loan = loans.find((l: any) => getLoanId(l) === loanId) || null;
        setSelectedLoan(loan);
        if (loanId) {
            fetchPayments(null, 'GET', `${PAYMENT_URL}/findbyloanidordered/${loanId}`, 'loadPayments');
            fetchSchedules(null, 'GET', `${SCHEDULE_URL}/findbyloanid/${loanId}`, 'loadSchedules');
            fetchTotals(null, 'GET', `${PAYMENT_URL}/totals/${loanId}`, 'loadTotals');
        } else {
            setSelectedLoan(null);
            setPayments([]);
            setSchedules([]);
            setPaymentTotals(null);
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContents = printRef.current.innerHTML;
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html><head><title>Rapprochement Portefeuille - ${selectedLoan?.applicationNumber}</title>
                    <style>
                        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px 30px; font-size: 11px; }
                        h1 { text-align: center; font-size: 16px; text-transform: uppercase; }
                        h2 { font-size: 13px; border-bottom: 2px solid #2196F3; padding-bottom: 4px; color: #1565C0; }
                        h3 { text-align: center; color: #666; font-size: 11px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                        th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
                        th { background-color: #E3F2FD; font-weight: 600; color: #1565C0; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .summary-box { border: 2px solid #1565C0; padding: 10px; margin: 10px 0; border-radius: 4px; }
                        .summary-box td { border: none; padding: 4px 8px; }
                        .ecart-ok { color: #2E7D32; font-weight: bold; }
                        .ecart-nok { color: #C62828; font-weight: bold; }
                        .overdue { background-color: #FFEBEE; }
                        @media print { body { margin: 10px; } }
                    </style></head><body>${printContents}</body></html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const formatCurrency = (value: number | undefined | null) => {
        return new Intl.NumberFormat('fr-BI', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatDate = (date: string | undefined | null) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '-';
    };

    // Computed stats
    const totalDecaisse = selectedLoan?.amountApproved || selectedLoan?.amountRequested || 0;
    const totalPaye = paymentTotals?.totalPrincipal || payments.reduce((sum: number, p: any) => sum + (p.amountReceived || 0), 0);
    const totalInteret = paymentTotals?.totalInterest || 0;
    const totalPenalites = paymentTotals?.totalPenalties || 0;
    const soldeRestant = totalDecaisse - (paymentTotals?.totalPrincipal || 0);

    const echeancesEchues = schedules.filter((s: any) => {
        const dueDate = new Date(s.dueDate || s.dateEcheance);
        return dueDate < new Date() && !s.paid && getStatusCode(s.status) !== 'PAID';
    });

    const echeancesPayees = schedules.filter((s: any) => s.paid || getStatusCode(s.status) === 'PAID');

    const loanOptionTemplate = (option: any) => {
        const statusCode = getStatusCode(option.status);
        const statusLabel = getStatusLabel(option.status);
        const clientName = getClientName(option);
        return (
            <div className="flex align-items-center justify-content-between w-full">
                <div>
                    <span className="font-bold">{option.applicationNumber}</span>
                    {clientName && <span className="text-500 ml-2">- {clientName}</span>}
                </div>
                <Tag value={statusLabel} severity={statusCode === 'DISBURSED' || statusCode === 'ACTIVE' ? 'success' : statusCode === 'IN_ARREARS' ? 'danger' : 'info'} className="ml-2" />
            </div>
        );
    };

    // Portfolio overview (all loans)
    const portfolioStats = {
        totalLoans: loans.length,
        totalDisbursed: loans.reduce((sum, l) => sum + (l.amountApproved || l.amountRequested || 0), 0),
        activeLoans: loans.filter(l => { const c = getStatusCode(l.status); return c === 'DISBURSED' || c === 'ACTIVE'; }).length,
        inArrears: loans.filter(l => getStatusCode(l.status) === 'IN_ARREARS').length,
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <h2><i className="pi pi-briefcase mr-2"></i>Rapprochement du Portefeuille de Crédits</h2>
            <p className="text-500 mb-4">Vérification de la concordance entre les montants décaissés, remboursés et en cours</p>

            {/* Portfolio Overview */}
            <div className="grid mb-4">
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <span className="block text-500 font-medium mb-1">Total Crédits</span>
                                <div className="text-900 font-bold text-2xl">{portfolioStats.totalLoans}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-briefcase text-blue-500 text-lg"></i>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <span className="block text-500 font-medium mb-1">Crédits Actifs</span>
                                <div className="text-green-500 font-bold text-2xl">{portfolioStats.activeLoans}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-check-circle text-green-500 text-lg"></i>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <span className="block text-500 font-medium mb-1">En Retard</span>
                                <div className={`font-bold text-2xl ${portfolioStats.inArrears > 0 ? 'text-red-500' : 'text-green-500'}`}>{portfolioStats.inArrears}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-red-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-exclamation-triangle text-red-500 text-lg"></i>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className="col-12 md:col-3">
                    <Card className="shadow-1">
                        <div className="flex align-items-center">
                            <div className="flex-1">
                                <span className="block text-500 font-medium mb-1">Total Portefeuille</span>
                                <div className="text-900 font-bold text-lg">{formatCurrency(portfolioStats.totalDisbursed)}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                <i className="pi pi-money-bill text-purple-500 text-lg"></i>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Loan Selector */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="mb-3"><i className="pi pi-search mr-2"></i>Sélectionner un crédit à vérifier</h5>
                <div className="p-fluid formgrid grid">
                    <div className="field col-12 md:col-8">
                        <Dropdown
                            value={selectedLoanId}
                            options={loans}
                            onChange={(e) => handleLoanSelect(e.value)}
                            optionLabel="applicationNumber"
                            optionValue="applicationId"
                            itemTemplate={loanOptionTemplate}
                            placeholder="Rechercher par N° dossier..."
                            filter
                            showClear
                            filterBy="applicationNumber"
                        />
                    </div>
                    <div className="field col-12 md:col-4 flex align-items-end gap-2">
                        {selectedLoan && (
                            <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                        )}
                    </div>
                </div>
            </div>

            {!selectedLoan && (
                <div className="text-center text-500 p-5">
                    <i className="pi pi-briefcase text-4xl mb-3 block"></i>
                    <p>Sélectionnez un crédit pour vérifier le rapprochement</p>
                </div>
            )}

            {selectedLoan && (
                <div ref={printRef}>
                    <h1>RAPPROCHEMENT DU PORTEFEUILLE DE CRÉDITS</h1>
                    <h3>Dossier N° {selectedLoan.applicationNumber} - {getClientName(selectedLoan)}</h3>

                    {/* Loan info */}
                    <div className="grid mb-4">
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Montant Décaissé</span>
                                    <div className="text-blue-500 font-bold text-xl">{formatCurrency(totalDecaisse)}</div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Total Remboursé</span>
                                    <div className="text-green-500 font-bold text-xl">{formatCurrency(totalPaye)}</div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Solde Restant</span>
                                    <div className={`font-bold text-xl ${soldeRestant > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                                        {formatCurrency(soldeRestant)}
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-3">
                            <Card className="shadow-1">
                                <div className="text-center">
                                    <span className="block text-500 font-medium mb-1">Échéances échues</span>
                                    <div className={`font-bold text-xl ${echeancesEchues.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                        {echeancesEchues.length}
                                    </div>
                                    <span className="text-xs text-500">{echeancesPayees.length}/{schedules.length} payées</span>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Reconciliation summary */}
                    <h2>Tableau de Rapprochement</h2>
                    <table>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%' }}>Montant décaissé (capital)</td>
                                <td className="text-right"><strong>{formatCurrency(totalDecaisse)}</strong></td>
                            </tr>
                            <tr>
                                <td>(-) Total principal remboursé</td>
                                <td className="text-right">{formatCurrency(totalPaye)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #333' }}>
                                <td><strong>Solde capital restant dû</strong></td>
                                <td className="text-right"><strong>{formatCurrency(soldeRestant)}</strong></td>
                            </tr>
                            <tr><td colSpan={2}>&nbsp;</td></tr>
                            <tr>
                                <td>Total intérêts payés</td>
                                <td className="text-right">{formatCurrency(totalInteret)}</td>
                            </tr>
                            <tr>
                                <td>Total pénalités payées</td>
                                <td className="text-right">{formatCurrency(totalPenalites)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #333' }}>
                                <td><strong>Total encaissé (tous types)</strong></td>
                                <td className="text-right"><strong>{formatCurrency((totalPaye || 0) + (totalInteret || 0) + (totalPenalites || 0))}</strong></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Schedule */}
                    <h4 className="mt-4"><i className="pi pi-calendar mr-2"></i>Échéancier ({schedules.length} échéances)</h4>
                    <DataTable
                        value={schedules}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="p-datatable-sm"
                        emptyMessage="Aucun échéancier trouvé"
                        stripedRows
                        showGridlines
                        rowClassName={(data) => {
                            const dueDate = new Date(data.dueDate || data.dateEcheance);
                            const sc = getStatusCode(data.status);
                            if (dueDate < new Date() && !data.paid && sc !== 'PAID') return 'bg-red-50';
                            if (data.paid || sc === 'PAID') return 'bg-green-50';
                            return '';
                        }}
                    >
                        <Column field="installmentNumber" header="N°" style={{ width: '5%' }} body={(row) => row.installmentNumber || row.numeroEcheance || '-'} />
                        <Column header="Date échéance" body={(row) => formatDate(row.dueDate || row.dateEcheance)} sortable style={{ width: '12%' }} />
                        <Column header="Capital" body={(row) => formatCurrency(row.principalAmount || row.capital)} style={{ width: '12%' }} />
                        <Column header="Intérêts" body={(row) => formatCurrency(row.interestAmount || row.interet)} style={{ width: '12%' }} />
                        <Column header="Total dû" body={(row) => formatCurrency((row.principalAmount || row.capital || 0) + (row.interestAmount || row.interet || 0))} style={{ width: '12%' }} />
                        <Column header="Payé" body={(row) => formatCurrency(row.amountPaid || row.montantPaye)} style={{ width: '12%' }} />
                        <Column header="Statut" body={(row) => {
                            const sc = getStatusCode(row.status);
                            const isPaid = row.paid || sc === 'PAID';
                            const dueDate = new Date(row.dueDate || row.dateEcheance);
                            const isOverdue = dueDate < new Date() && !isPaid;
                            return <Tag value={isPaid ? 'Payée' : isOverdue ? 'En retard' : 'À venir'} severity={isPaid ? 'success' : isOverdue ? 'danger' : 'info'} />;
                        }} style={{ width: '10%' }} />
                    </DataTable>

                    {/* Payments */}
                    <h4 className="mt-4"><i className="pi pi-money-bill mr-2"></i>Paiements reçus ({payments.length})</h4>
                    <DataTable
                        value={payments}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25]}
                        globalFilter={globalFilterPayments}
                        header={
                            <div className="flex justify-content-end">
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText value={globalFilterPayments} onChange={(e) => setGlobalFilterPayments(e.target.value)} placeholder="Rechercher..." />
                                </span>
                            </div>
                        }
                        className="p-datatable-sm"
                        emptyMessage="Aucun paiement trouvé"
                        stripedRows
                        showGridlines
                    >
                        <Column field="paymentNumber" header="N° Paiement" sortable style={{ width: '12%' }} />
                        <Column header="Date" body={(row) => formatDate(row.paymentDate)} sortable style={{ width: '10%' }} />
                        <Column header="Montant" body={(row) => (
                            <span className="text-green-500 font-bold">{formatCurrency(row.amountReceived)}</span>
                        )} sortable style={{ width: '12%' }} />
                        <Column field="repaymentMode" header="Mode" body={(row) => (
                            <Tag value={row.repaymentMode || 'AGENCY'} severity="info" />
                        )} style={{ width: '10%' }} />
                        <Column field="receiptNumber" header="N° Reçu" />
                        <Column header="Auto-débit" body={(row) => row.isAutoDebit ? <Tag value="Oui" severity="info" /> : '-'} style={{ width: '8%' }} />
                    </DataTable>
                </div>
            )}
        </div>
    );
}

export default function Page() {
    return (
        <ProtectedPage requiredAuthorities={['RAPPROCHEMENT_VIEW']}>
            <RapprochementCreditsPage />
        </ProtectedPage>
    );
}
