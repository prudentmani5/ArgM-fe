'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../../utils/apiConfig';

const BRANCHES_URL = `${API_BASE_URL}/api/reference-data/branches`;
const SAVINGS_URL = `${API_BASE_URL}/api/savings-accounts`;
const REPORTS_URL = `${API_BASE_URL}/api/epargne/reports`;

interface OperationHistory {
    id: number;
    operationDate: string;
    operationType: string;
    referenceNumber: string;
    description: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    status: string;
    processedBy: string;
    accountNumber: string;
    clientName: string;
}

interface AccountSuggestion {
    id: number;
    accountNumber: string;
    currentBalance: number;
    clientId: number;
    clientName: string;
    clientNumber: string;
    status: any;
}

const RapportHistoriqueOperationsPage = () => {
    const toast = useRef<Toast>(null);

    // API hooks
    const branchesApi = useConsumApi('');
    const savingsApi = useConsumApi('');
    const reportApi = useConsumApi('');

    // Filter states
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);
    const [branchId, setBranchId] = useState<number | null>(null);
    const [operationType, setOperationType] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<AccountSuggestion | null>(null);
    const [accountSuggestions, setAccountSuggestions] = useState<AccountSuggestion[]>([]);
    const [clientName, setClientName] = useState<string>('');

    // Reference data
    const [branches, setBranches] = useState<any[]>([]);

    // Report data
    const [reportData, setReportData] = useState<OperationHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalOperations: 0,
        totalDebits: 0,
        totalCredits: 0,
        netMovement: 0,
        openingBalance: 0,
        closingBalance: 0
    });

    const operationTypeOptions = [
        { label: 'Tous', value: null },
        { label: 'Dépôt', value: 'DEPOSIT' },
        { label: 'Retrait', value: 'WITHDRAWAL' },
        { label: 'Frais', value: 'FEE' },
        { label: 'Intérêt', value: 'INTEREST' },
        { label: 'Transfert Entrant', value: 'TRANSFER_IN' },
        { label: 'Transfert Sortant', value: 'TRANSFER_OUT' },
        { label: 'Ajustement', value: 'ADJUSTMENT' }
    ];

    useEffect(() => {
        loadReferenceData();
    }, []);

    // Handle branches data
    useEffect(() => {
        if (branchesApi.data) {
            setBranches(Array.isArray(branchesApi.data) ? branchesApi.data : []);
        }
        if (branchesApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors du chargement des agences' });
        }
    }, [branchesApi.data, branchesApi.error]);

    // Handle account search results
    useEffect(() => {
        if (savingsApi.data && savingsApi.callType === 'searchAccounts') {
            const accounts = Array.isArray(savingsApi.data) ? savingsApi.data : (savingsApi.data.content || []);
            const suggestions = accounts.map((acc: any) => ({
                id: acc.id,
                accountNumber: acc.accountNumber,
                currentBalance: acc.currentBalance || 0,
                clientId: acc.client?.id,
                clientName: acc.client ? `${acc.client.firstName} ${acc.client.lastName}` : '',
                clientNumber: acc.client?.clientNumber || '',
                status: acc.status
            }));
            setAccountSuggestions(suggestions);
        }
    }, [savingsApi.data, savingsApi.callType]);

    // Handle report data
    useEffect(() => {
        if (reportApi.data) {
            const response = reportApi.data;
            const dataArray = Array.isArray(response) ? response : (response.data || response.content || []);
            setReportData(dataArray);
            setTotals({
                totalOperations: response.totalOperations || dataArray.length,
                totalDebits: response.totalDebits || 0,
                totalCredits: response.totalCredits || 0,
                netMovement: response.netMovement || 0,
                openingBalance: response.openingBalance || 0,
                closingBalance: response.closingBalance || 0
            });
            toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Historique généré avec succès' });
            setLoading(false);
        }
        if (reportApi.error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la génération de l\'historique' });
            setLoading(false);
        }
    }, [reportApi.data, reportApi.error]);

    const loadReferenceData = () => {
        branchesApi.fetchData(null, 'GET', `${BRANCHES_URL}/findall`, 'loadBranches');
    };

    const searchAccounts = (event: { query: string }) => {
        if (event.query.length >= 2) {
            savingsApi.fetchData(null, 'GET', `${SAVINGS_URL}/search?searchTerm=${encodeURIComponent(event.query)}&page=0&size=15`, 'searchAccounts');
        }
    };

    const onAccountSelect = (e: any) => {
        const account = e.value as AccountSuggestion;
        setSelectedAccount(account);
        // Auto-fill client name from the selected account
        if (account) {
            setClientName(account.clientNumber ? `${account.clientNumber} - ${account.clientName}` : account.clientName);
        } else {
            setClientName('');
        }
    };

    const onAccountClear = () => {
        setSelectedAccount(null);
        setClientName('');
    };

    const generateReport = () => {
        if (!selectedAccount) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Veuillez sélectionner un compte' });
            return;
        }

        setLoading(true);
        const params = new URLSearchParams();
        if (dateFrom) params.append('dateFrom', dateFrom.toISOString().split('T')[0]);
        if (dateTo) params.append('dateTo', dateTo.toISOString().split('T')[0]);
        if (branchId) params.append('branchId', branchId.toString());
        if (operationType) params.append('operationType', operationType);
        if (selectedAccount.clientId) params.append('clientId', selectedAccount.clientId.toString());
        params.append('accountId', selectedAccount.id.toString());

        reportApi.fetchData(null, 'GET', `${REPORTS_URL}/operation-history?${params.toString()}`, 'generateReport');
    };

    const exportToPdf = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        const companyName = 'AgrM MICROFINANCE';
        const companyAddress = 'Bujumbura, Burundi';
        const companyPhone = '+257 22 XX XX XX';

        const reportTitle = 'RELEVÉ DE COMPTE';
        const accountNumber = selectedAccount?.accountNumber || '-';
        const clientFullName = clientName || '-';
        const currentBalance = selectedAccount?.currentBalance || totals.closingBalance || 0;

        const dateRange = dateFrom && dateTo
            ? `Du ${dateFrom.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} au ${dateTo.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`
            : 'Toutes les opérations';

        const operationTypeLabels: { [key: string]: string } = {
            'DEPOSIT': 'Dépôt',
            'WITHDRAWAL': 'Retrait',
            'FEE': 'Frais',
            'INTEREST': 'Intérêt',
            'TRANSFER_IN': 'Transfert +',
            'TRANSFER_OUT': 'Transfert -',
            'ADJUSTMENT': 'Ajustement'
        };

        const statusLabels: { [key: string]: string } = {
            'COMPLETED': 'Validé',
            'VALIDATED': 'Validé',
            'PENDING': 'En attente',
            'CANCELLED': 'Annulé',
            'DISBURSED': 'Décaissé'
        };

        const tableRows = reportData.map((row, index) => `
            <tr class="${index % 2 === 0 ? 'even-row' : 'odd-row'}">
                <td class="date-cell">${row.operationDate || '-'}</td>
                <td class="type-cell">${operationTypeLabels[row.operationType] || row.operationType || '-'}</td>
                <td class="ref-cell">${row.referenceNumber || '-'}</td>
                <td class="desc-cell">${row.description || '-'}</td>
                <td class="debit-cell">${row.debitAmount > 0 ? formatCurrency(row.debitAmount) : ''}</td>
                <td class="credit-cell">${row.creditAmount > 0 ? formatCurrency(row.creditAmount) : ''}</td>
                <td class="balance-cell">${formatCurrency(row.balance || 0)}</td>
            </tr>
        `).join('');

        const printContent = `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>${reportTitle} - ${accountNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }

                    @page {
                        size: A4;
                        margin: 12mm 10mm;
                    }

                    body {
                        font-family: 'Segoe UI', Arial, sans-serif;
                        font-size: 10px;
                        color: #1a1a1a;
                        line-height: 1.4;
                        background: #fff;
                    }

                    .document {
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 5mm;
                    }

                    /* Header */
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        padding-bottom: 5mm;
                        border-bottom: 3px solid #1e40af;
                        margin-bottom: 5mm;
                    }

                    .logo-section {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }

                    .logo {
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, #1e40af, #3b82f6);
                        border-radius: 8px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #fff;
                        font-size: 16px;
                        font-weight: bold;
                    }

                    .company-name {
                        font-size: 20px;
                        font-weight: 700;
                        color: #1e40af;
                        margin: 0;
                    }

                    .company-subtitle {
                        font-size: 9px;
                        color: #64748b;
                        margin-top: 2px;
                    }

                    .company-contact {
                        font-size: 8px;
                        color: #94a3b8;
                        margin-top: 2px;
                    }

                    .document-title-section {
                        text-align: right;
                    }

                    .document-title {
                        background: #1e40af;
                        color: #fff;
                        padding: 8px 16px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 600;
                        letter-spacing: 1px;
                        margin-bottom: 6px;
                    }

                    .document-date {
                        font-size: 9px;
                        color: #64748b;
                    }

                    /* Account Info Section */
                    .account-section {
                        display: flex;
                        gap: 5mm;
                        margin-bottom: 5mm;
                    }

                    .info-card {
                        flex: 1;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .info-card-header {
                        background: #f1f5f9;
                        padding: 6px 10px;
                        font-size: 9px;
                        font-weight: 600;
                        color: #475569;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        border-bottom: 1px solid #e2e8f0;
                    }

                    .info-card-body {
                        padding: 10px;
                    }

                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 3px 0;
                        font-size: 9px;
                    }

                    .info-label {
                        color: #64748b;
                    }

                    .info-value {
                        font-weight: 600;
                        color: #1a1a1a;
                    }

                    .info-value.highlight {
                        color: #1e40af;
                        font-family: monospace;
                        font-size: 10px;
                    }

                    /* Balance Summary */
                    .balance-summary {
                        display: flex;
                        gap: 4mm;
                        margin-bottom: 5mm;
                    }

                    .balance-box {
                        flex: 1;
                        padding: 12px;
                        border-radius: 8px;
                        text-align: center;
                    }

                    .balance-box.opening {
                        background: #fefce8;
                        border: 1px solid #fcd34d;
                    }

                    .balance-box.closing {
                        background: #f0fdf4;
                        border: 1px solid #86efac;
                    }

                    .balance-box.debit {
                        background: #fef2f2;
                        border: 1px solid #fca5a5;
                    }

                    .balance-box.credit {
                        background: #f0fdf4;
                        border: 1px solid #86efac;
                    }

                    .balance-box.net {
                        background: #eff6ff;
                        border: 1px solid #93c5fd;
                    }

                    .balance-label {
                        font-size: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        margin-bottom: 4px;
                    }

                    .balance-box.opening .balance-label { color: #92400e; }
                    .balance-box.closing .balance-label { color: #166534; }
                    .balance-box.debit .balance-label { color: #991b1b; }
                    .balance-box.credit .balance-label { color: #166534; }
                    .balance-box.net .balance-label { color: #1e40af; }

                    .balance-amount {
                        font-size: 14px;
                        font-weight: 700;
                    }

                    .balance-box.opening .balance-amount { color: #92400e; }
                    .balance-box.closing .balance-amount { color: #166534; }
                    .balance-box.debit .balance-amount { color: #dc2626; }
                    .balance-box.credit .balance-amount { color: #16a34a; }
                    .balance-box.net .balance-amount { color: #1e40af; }

                    /* Table */
                    .table-section {
                        margin-bottom: 5mm;
                    }

                    .table-title {
                        font-size: 10px;
                        font-weight: 600;
                        color: #475569;
                        margin-bottom: 3mm;
                        padding-bottom: 2mm;
                        border-bottom: 1px solid #e2e8f0;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 8px;
                    }

                    thead tr {
                        background: linear-gradient(135deg, #1e40af, #3b82f6);
                    }

                    th {
                        color: #fff;
                        font-weight: 600;
                        padding: 8px 6px;
                        text-align: left;
                        font-size: 8px;
                        text-transform: uppercase;
                        letter-spacing: 0.3px;
                    }

                    th:nth-child(5), th:nth-child(6), th:nth-child(7) {
                        text-align: right;
                    }

                    td {
                        padding: 6px;
                        border-bottom: 1px solid #f1f5f9;
                    }

                    .even-row { background: #fff; }
                    .odd-row { background: #f8fafc; }

                    .date-cell { width: 70px; font-family: monospace; }
                    .type-cell { width: 70px; }
                    .ref-cell { width: 90px; font-family: monospace; font-size: 7px; }
                    .desc-cell { }
                    .debit-cell { width: 80px; text-align: right; color: #dc2626; font-weight: 500; }
                    .credit-cell { width: 80px; text-align: right; color: #16a34a; font-weight: 500; }
                    .balance-cell { width: 90px; text-align: right; font-weight: 700; color: #1e40af; }

                    /* Operations count */
                    .operations-count {
                        text-align: right;
                        font-size: 9px;
                        color: #64748b;
                        margin-top: 3mm;
                        padding-top: 2mm;
                        border-top: 1px solid #e2e8f0;
                    }

                    /* Footer */
                    .footer {
                        margin-top: 8mm;
                        padding-top: 4mm;
                        border-top: 2px solid #e2e8f0;
                    }

                    .footer-notice {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 6px;
                        padding: 8px 10px;
                        font-size: 7px;
                        color: #64748b;
                        line-height: 1.5;
                        margin-bottom: 4mm;
                    }

                    .footer-notice strong {
                        color: #475569;
                    }

                    .footer-company {
                        text-align: center;
                    }

                    .footer-company-name {
                        font-size: 9px;
                        font-weight: 600;
                        color: #475569;
                    }

                    .footer-generated {
                        font-size: 7px;
                        color: #94a3b8;
                        margin-top: 2px;
                    }

                    /* Print adjustments */
                    @media print {
                        body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .document { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="document">
                    <!-- Header -->
                    <div class="header">
                        <div class="logo-section">
                            <div class="logo">AgrM</div>
                            <div>
                                <h1 class="company-name">${companyName}</h1>
                                <p class="company-subtitle">Institution de Microfinance Agréée</p>
                                <p class="company-contact">${companyAddress} | Tél: ${companyPhone}</p>
                            </div>
                        </div>
                        <div class="document-title-section">
                            <div class="document-title">${reportTitle}</div>
                            <p class="document-date">${dateRange}</p>
                        </div>
                    </div>

                    <!-- Account Info -->
                    <div class="account-section">
                        <div class="info-card">
                            <div class="info-card-header">Informations du Compte</div>
                            <div class="info-card-body">
                                <div class="info-row">
                                    <span class="info-label">N° Compte</span>
                                    <span class="info-value highlight">${accountNumber}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Titulaire</span>
                                    <span class="info-value">${clientFullName}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Solde actuel</span>
                                    <span class="info-value" style="color: #166534;">${formatCurrency(currentBalance)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="info-card">
                            <div class="info-card-header">Résumé de la Période</div>
                            <div class="info-card-body">
                                <div class="info-row">
                                    <span class="info-label">Nombre d'opérations</span>
                                    <span class="info-value">${totals.totalOperations}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Total des entrées</span>
                                    <span class="info-value" style="color: #16a34a;">+${formatCurrency(totals.totalCredits)}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Total des sorties</span>
                                    <span class="info-value" style="color: #dc2626;">-${formatCurrency(totals.totalDebits)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Balance Summary -->
                    <div class="balance-summary">
                        <div class="balance-box opening">
                            <div class="balance-label">Solde d'ouverture</div>
                            <div class="balance-amount">${formatCurrency(totals.openingBalance)}</div>
                        </div>
                        <div class="balance-box credit">
                            <div class="balance-label">Total Crédits</div>
                            <div class="balance-amount">+${formatCurrency(totals.totalCredits)}</div>
                        </div>
                        <div class="balance-box debit">
                            <div class="balance-label">Total Débits</div>
                            <div class="balance-amount">-${formatCurrency(totals.totalDebits)}</div>
                        </div>
                        <div class="balance-box net">
                            <div class="balance-label">Mouvement Net</div>
                            <div class="balance-amount">${totals.netMovement >= 0 ? '+' : ''}${formatCurrency(totals.netMovement)}</div>
                        </div>
                        <div class="balance-box closing">
                            <div class="balance-label">Solde de clôture</div>
                            <div class="balance-amount">${formatCurrency(totals.closingBalance)}</div>
                        </div>
                    </div>

                    <!-- Transactions Table -->
                    <div class="table-section">
                        <div class="table-title">Détail des Opérations</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Référence</th>
                                    <th>Description</th>
                                    <th>Débit</th>
                                    <th>Crédit</th>
                                    <th>Solde</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                        <div class="operations-count">
                            Total: <strong>${totals.totalOperations}</strong> opération(s)
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <div class="footer-notice">
                            <strong>AVIS IMPORTANT:</strong> Ce relevé de compte est un document officiel.
                            Veuillez vérifier attentivement toutes les opérations. En cas de réclamation,
                            veuillez contacter notre service client dans un délai de 30 jours suivant la réception de ce relevé.
                            Passé ce délai, les opérations sont réputées approuvées.
                        </div>
                        <div class="footer-company">
                            <p class="footer-company-name">${companyName} - Votre partenaire financier de confiance</p>
                            <p class="footer-generated">Document généré le ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 250);
        }

        toast.current?.show({ severity: 'success', summary: 'Export PDF', detail: 'Le document est prêt pour impression/enregistrement en PDF' });
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            toast.current?.show({ severity: 'warn', summary: 'Attention', detail: 'Aucune donnée à exporter' });
            return;
        }

        // Create CSV content with BOM for Excel UTF-8 support
        let csvContent = '\uFEFF';

        // Header info
        if (selectedAccount) {
            csvContent += `Compte;${selectedAccount.accountNumber}\n`;
        }
        if (clientName) {
            csvContent += `Client;${clientName}\n`;
        }
        csvContent += '\n';

        // Summary
        csvContent += 'RESUME\n';
        csvContent += `Nombre d'opérations;${totals.totalOperations}\n`;
        csvContent += `Total Débits;${totals.totalDebits}\n`;
        csvContent += `Total Crédits;${totals.totalCredits}\n`;
        csvContent += `Mouvement Net;${totals.netMovement}\n`;
        csvContent += `Solde d'ouverture;${totals.openingBalance}\n`;
        csvContent += `Solde de clôture;${totals.closingBalance}\n`;
        csvContent += '\n';

        // Data
        csvContent += 'DETAIL DES OPERATIONS\n';
        const headers = ['Date', 'Type', 'Référence', 'Description', 'N° Compte', 'Client', 'Débit', 'Crédit', 'Solde', 'Statut', 'Traité par'];
        csvContent += headers.join(';') + '\n';

        reportData.forEach(row => {
            csvContent += [
                row.operationDate || '',
                row.operationType || '',
                row.referenceNumber || '',
                `"${row.description || ''}"`,
                row.accountNumber || '',
                `"${row.clientName || ''}"`,
                String(row.debitAmount || 0),
                String(row.creditAmount || 0),
                String(row.balance || 0),
                row.status || '',
                row.processedBy || ''
            ].join(';') + '\n';
        });

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `historique_operations_${selectedAccount?.accountNumber || ''}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.current?.show({ severity: 'success', summary: 'Export Excel', detail: 'Le fichier CSV a été téléchargé avec succès' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
    };

    const debitTemplate = (rowData: OperationHistory) => {
        return rowData.debitAmount > 0 ? (
            <span className="font-bold text-red-600">-{formatCurrency(rowData.debitAmount)}</span>
        ) : <span>-</span>;
    };

    const creditTemplate = (rowData: OperationHistory) => {
        return rowData.creditAmount > 0 ? (
            <span className="font-bold text-green-600">+{formatCurrency(rowData.creditAmount)}</span>
        ) : <span>-</span>;
    };

    const balanceTemplate = (rowData: OperationHistory) => {
        return <span className="font-bold">{formatCurrency(rowData.balance)}</span>;
    };

    const operationTypeTemplate = (rowData: OperationHistory) => {
        const getSeverity = (type: string) => {
            switch (type?.toUpperCase()) {
                case 'DEPOSIT': case 'TRANSFER_IN': case 'INTEREST': return 'success';
                case 'WITHDRAWAL': case 'TRANSFER_OUT': case 'FEE': return 'danger';
                case 'ADJUSTMENT': return 'warning';
                default: return 'info';
            }
        };
        const labels: { [key: string]: string } = {
            'DEPOSIT': 'Dépôt',
            'WITHDRAWAL': 'Retrait',
            'FEE': 'Frais',
            'INTEREST': 'Intérêt',
            'TRANSFER_IN': 'Transfert +',
            'TRANSFER_OUT': 'Transfert -',
            'ADJUSTMENT': 'Ajustement'
        };
        return <Tag value={labels[rowData.operationType] || rowData.operationType} severity={getSeverity(rowData.operationType)} />;
    };

    const statusTemplate = (rowData: OperationHistory) => {
        const getSeverity = (status: string) => {
            switch (status?.toUpperCase()) {
                case 'COMPLETED': case 'VALIDATED': case 'DISBURSED': return 'success';
                case 'PENDING': return 'warning';
                case 'CANCELLED': case 'REJECTED': return 'danger';
                default: return 'info';
            }
        };
        return <Tag value={rowData.status} severity={getSeverity(rowData.status)} />;
    };

    const accountItemTemplate = (account: AccountSuggestion) => {
        return (
            <div className="flex align-items-center gap-2">
                <div>
                    <span className="font-bold">{account.accountNumber}</span>
                    <span className="text-500 ml-2">- {account.clientNumber} {account.clientName}</span>
                </div>
                <Tag value={formatCurrency(account.currentBalance)} severity="info" className="ml-auto" />
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />

            <div className="flex align-items-center justify-content-between mb-4">
                <div className="flex align-items-center gap-2">
                    <i className="pi pi-history text-4xl text-primary"></i>
                    <div>
                        <h2 className="m-0">Historique des Opérations</h2>
                        <p className="m-0 text-500">Consultez l'historique des mouvements par compte</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button label="PDF" icon="pi pi-file-pdf" severity="danger" onClick={exportToPdf} disabled={reportData.length === 0} />
                    <Button label="Excel" icon="pi pi-file-excel" severity="success" onClick={exportToExcel} disabled={reportData.length === 0} />
                </div>
            </div>

            <Divider />

            {/* Filtres */}
            <Card className="mb-4">
                <h5 className="m-0 mb-3">
                    <i className="pi pi-filter mr-2"></i>
                    Critères de Recherche
                </h5>
                <div className="formgrid grid">
                    <div className="field col-12 md:col-6">
                        <label htmlFor="account">N° Compte *</label>
                        <AutoComplete
                            id="account"
                            value={selectedAccount}
                            suggestions={accountSuggestions}
                            completeMethod={searchAccounts}
                            field="accountNumber"
                            onChange={(e) => {
                                if (typeof e.value === 'string') {
                                    setSelectedAccount(null);
                                    setClientName('');
                                } else if (e.value) {
                                    const account = e.value as AccountSuggestion;
                                    setSelectedAccount(account);
                                    setClientName(account.clientNumber ? `${account.clientNumber} - ${account.clientName}` : account.clientName);
                                }
                            }}
                            onSelect={onAccountSelect}
                            onClear={onAccountClear}
                            placeholder="Rechercher un compte (N° compte, nom client)..."
                            className="w-full"
                            dropdown
                            itemTemplate={accountItemTemplate}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="clientName">Client (auto-rempli)</label>
                        <InputText
                            id="clientName"
                            value={clientName}
                            readOnly
                            className="w-full"
                            placeholder="Le nom du client sera affiché automatiquement"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateFrom">Date Début</label>
                        <Calendar
                            id="dateFrom"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateTo">Date Fin</label>
                        <Calendar
                            id="dateTo"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="operationType">Type d'Opération</label>
                        <Dropdown
                            id="operationType"
                            value={operationType}
                            options={operationTypeOptions}
                            onChange={(e) => setOperationType(e.value)}
                            placeholder="Tous les types"
                            showClear
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="branch">Agence</label>
                        <Dropdown
                            id="branch"
                            value={branchId}
                            options={branches}
                            onChange={(e) => setBranchId(e.value)}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Toutes les agences"
                            showClear
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-content-end mt-3">
                    <Button
                        label="Générer l'Historique"
                        icon="pi pi-search"
                        onClick={generateReport}
                        loading={loading}
                        disabled={!selectedAccount}
                    />
                </div>
            </Card>

            {/* Statistiques */}
            {reportData.length > 0 && (
                <>
                    <div className="grid mb-4">
                        <div className="col-12 md:col-2">
                            <Card className="bg-blue-50">
                                <div className="text-center">
                                    <i className="pi pi-list text-3xl text-blue-500"></i>
                                    <p className="text-500 m-0 mt-2">Opérations</p>
                                    <p className="text-2xl font-bold m-0">{totals.totalOperations}</p>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-2">
                            <Card className="bg-red-50">
                                <div className="text-center">
                                    <i className="pi pi-arrow-up text-3xl text-red-500"></i>
                                    <p className="text-500 m-0 mt-2">Total Débits</p>
                                    <p className="text-lg font-bold m-0 text-red-600">{formatCurrency(totals.totalDebits)}</p>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-2">
                            <Card className="bg-green-50">
                                <div className="text-center">
                                    <i className="pi pi-arrow-down text-3xl text-green-500"></i>
                                    <p className="text-500 m-0 mt-2">Total Crédits</p>
                                    <p className="text-lg font-bold m-0 text-green-600">{formatCurrency(totals.totalCredits)}</p>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-2">
                            <Card className="bg-purple-50">
                                <div className="text-center">
                                    <i className="pi pi-sync text-3xl text-purple-500"></i>
                                    <p className="text-500 m-0 mt-2">Mouvement Net</p>
                                    <p className={`text-lg font-bold m-0 ${totals.netMovement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(totals.netMovement)}
                                    </p>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-2">
                            <Card className="bg-gray-50">
                                <div className="text-center">
                                    <i className="pi pi-calendar-plus text-3xl text-gray-500"></i>
                                    <p className="text-500 m-0 mt-2">Solde Ouverture</p>
                                    <p className="text-lg font-bold m-0">{formatCurrency(totals.openingBalance)}</p>
                                </div>
                            </Card>
                        </div>
                        <div className="col-12 md:col-2">
                            <Card className="bg-cyan-50">
                                <div className="text-center">
                                    <i className="pi pi-calendar-minus text-3xl text-cyan-500"></i>
                                    <p className="text-500 m-0 mt-2">Solde Clôture</p>
                                    <p className="text-lg font-bold m-0">{formatCurrency(totals.closingBalance)}</p>
                                </div>
                            </Card>
                        </div>
                    </div>
                </>
            )}

            {/* Tableau des résultats */}
            {loading ? (
                <div className="flex justify-content-center p-5">
                    <ProgressSpinner />
                </div>
            ) : (
                <DataTable
                    value={reportData}
                    paginator
                    rows={15}
                    rowsPerPageOptions={[15, 30, 50, 100]}
                    emptyMessage="Aucune donnée. Sélectionnez un compte et générez l'historique."
                    className="p-datatable-sm"
                    stripedRows
                    sortField="operationDate"
                    sortOrder={-1}
                >
                    <Column field="operationDate" header="Date" sortable style={{ width: '100px' }} />
                    <Column field="operationType" header="Type" body={operationTypeTemplate} sortable style={{ width: '110px' }} />
                    <Column field="referenceNumber" header="Référence" sortable style={{ width: '120px' }} />
                    <Column field="description" header="Description" sortable />
                    <Column field="accountNumber" header="N° Compte" sortable style={{ width: '120px' }} />
                    <Column field="debitAmount" header="Débit" body={debitTemplate} sortable style={{ width: '120px' }} />
                    <Column field="creditAmount" header="Crédit" body={creditTemplate} sortable style={{ width: '120px' }} />
                    <Column field="balance" header="Solde" body={balanceTemplate} sortable style={{ width: '120px' }} />
                    <Column field="status" header="Statut" body={statusTemplate} sortable style={{ width: '100px' }} />
                    <Column field="processedBy" header="Par" sortable style={{ width: '100px' }} />
                </DataTable>
            )}
        </div>
    );
};

export default RapportHistoriqueOperationsPage;
