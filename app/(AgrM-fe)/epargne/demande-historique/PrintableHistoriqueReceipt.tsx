'use client';
import React, { forwardRef } from 'react';
import { StatementRequest } from '../demande-situation/StatementRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

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

interface PrintableHistoriqueReceiptProps {
    request: StatementRequest;
    operations: OperationHistory[];
    totals: {
        totalOperations: number;
        totalDebits: number;
        totalCredits: number;
        netMovement: number;
        openingBalance: number;
        closingBalance: number;
    };
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const operationTypeLabels: { [key: string]: string } = {
    'DEPOSIT': 'Dépôt',
    'WITHDRAWAL': 'Retrait',
    'FEE': 'Frais',
    'INTEREST': 'Intérêt',
    'TRANSFER_IN': 'Transfert +',
    'TRANSFER_OUT': 'Transfert -',
    'LOAN_PAYMENT': 'Remboursement',
    'ADJUSTMENT': 'Ajustement'
};

const PrintableHistoriqueReceipt = forwardRef<HTMLDivElement, PrintableHistoriqueReceiptProps>(
    ({ request, operations, totals, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined | null) => {
            if (value === undefined || value === null || value === 0) return '';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatCurrencyAlways = (value: number | undefined | null) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            // Parse as local date to avoid UTC timezone shift
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return dateString;
        };

        const getClientName = () => {
            return getClientDisplayName(request.client);
        };

        const getClientNumber = () => request.client?.clientNumber || '-';
        const getBranchName = () => request.branch?.name || '-';

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '10mm 12mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '10px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#666' }}>
                                    {companyAddress} | Tél: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ background: '#1e3a8a', color: '#fff', padding: '6px 14px', borderRadius: '5px', fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                HISTORIQUE DES OPÉRATIONS
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>
                                N° {request.requestNumber || '-'}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#666' }}>
                                Date: {formatDate(request.requestDate)}
                            </p>
                            {request.periodStart && request.periodEnd && (
                                <p style={{ margin: '2px 0 0 0', fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    Période: {formatDate(request.periodStart)} — {formatDate(request.periodEnd)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Client & Account Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '5px 10px', fontSize: '9px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                            Informations du Client
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                            <table style={{ width: '100%', fontSize: '10px' }}>
                                <tbody>
                                    <tr><td style={{ padding: '2px 0', color: '#666', width: '35%' }}>Client:</td><td style={{ fontWeight: 'bold' }}>{getClientName()}</td></tr>
                                    <tr><td style={{ padding: '2px 0', color: '#666' }}>N° Client:</td><td style={{ fontWeight: 'bold' }}>{getClientNumber()}</td></tr>
                                    <tr><td style={{ padding: '2px 0', color: '#666' }}>Agence:</td><td style={{ fontWeight: 'bold' }}>{getBranchName()}</td></tr>
                                    {request.periodStart && request.periodEnd && (
                                        <tr><td style={{ padding: '2px 0', color: '#666' }}>Période:</td><td style={{ fontWeight: 'bold', color: '#1e3a8a' }}>{formatDate(request.periodStart)} — {formatDate(request.periodEnd)}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '5px 10px', fontSize: '9px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                            Résumé Financier
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                            <table style={{ width: '100%', fontSize: '10px' }}>
                                <tbody>
                                    <tr><td style={{ padding: '2px 0', color: '#666', width: '50%' }}>Total Opérations:</td><td style={{ fontWeight: 'bold' }}>{totals.totalOperations}</td></tr>
                                    <tr><td style={{ padding: '2px 0', color: '#666' }}>Total Débits:</td><td style={{ fontWeight: 'bold', color: '#dc2626' }}>{formatCurrencyAlways(totals.totalDebits)}</td></tr>
                                    <tr><td style={{ padding: '2px 0', color: '#666' }}>Total Crédits:</td><td style={{ fontWeight: 'bold', color: '#16a34a' }}>{formatCurrencyAlways(totals.totalCredits)}</td></tr>
                                    <tr><td style={{ padding: '2px 0', color: '#666' }}>Frais historique:</td><td style={{ fontWeight: 'bold' }}>{formatCurrencyAlways(request.feeAmount)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Balance Summary Boxes */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, padding: '10px', borderRadius: '5px', textAlign: 'center', background: '#fefce8', border: '1px solid #fcd34d' }}>
                        <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#92400e', marginBottom: '3px' }}>Solde Ouverture</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#92400e' }}>{formatCurrencyAlways(totals.openingBalance)}</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px', borderRadius: '5px', textAlign: 'center', background: '#fef2f2', border: '1px solid #fca5a5' }}>
                        <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#991b1b', marginBottom: '3px' }}>Total Débits</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrencyAlways(totals.totalDebits)}</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px', borderRadius: '5px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#166534', marginBottom: '3px' }}>Total Crédits</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrencyAlways(totals.totalCredits)}</div>
                    </div>
                    <div style={{ flex: 1, padding: '10px', borderRadius: '5px', textAlign: 'center', background: '#f0fdf4', border: '1px solid #86efac' }}>
                        <div style={{ fontSize: '8px', textTransform: 'uppercase', color: '#166534', marginBottom: '3px' }}>Solde Clôture</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#166534' }}>{formatCurrencyAlways(totals.closingBalance)}</div>
                    </div>
                </div>

                {/* Operations Table */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                        DÉTAIL DES OPÉRATIONS ({operations.length})
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                        <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'left', fontSize: '8px' }}>Date</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'left', fontSize: '8px' }}>Type</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'left', fontSize: '8px' }}>Référence</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'left', fontSize: '8px' }}>Description</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'right', fontSize: '8px' }}>Débit</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'right', fontSize: '8px' }}>Crédit</th>
                                <th style={{ color: '#fff', fontWeight: 'bold', padding: '6px 4px', textAlign: 'right', fontSize: '8px' }}>Solde</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operations.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Aucune opération trouvée</td></tr>
                            ) : (
                                operations.map((op, index) => (
                                    <tr key={op.id || index} style={{ background: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace', fontSize: '8px' }}>{op.operationDate || '-'}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9' }}>{operationTypeLabels[op.operationType] || op.operationType || '-'}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace', fontSize: '7px' }}>{op.referenceNumber || '-'}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9' }}>{op.description || '-'}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#dc2626', fontWeight: op.debitAmount > 0 ? 'bold' : 'normal' }}>{formatCurrency(op.debitAmount)}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#16a34a', fontWeight: op.creditAmount > 0 ? 'bold' : 'normal' }}>{formatCurrency(op.creditAmount)}</td>
                                        <td style={{ padding: '5px 4px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatCurrencyAlways(op.balance)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {operations.length > 0 && (
                            <tfoot>
                                <tr style={{ background: '#1e3a8a' }}>
                                    <td colSpan={4} style={{ padding: '6px 4px', color: '#fff', fontWeight: 'bold', fontSize: '9px' }}>TOTAUX</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#fca5a5', fontWeight: 'bold', fontSize: '9px' }}>{formatCurrencyAlways(totals.totalDebits)}</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#86efac', fontWeight: 'bold', fontSize: '9px' }}>{formatCurrencyAlways(totals.totalCredits)}</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'right', color: '#fff', fontWeight: 'bold', fontSize: '9px' }}>{formatCurrencyAlways(totals.closingBalance)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 30px 0', fontSize: '10px', color: '#666' }}>Signature du Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#666' }}>{getClientName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 30px 0', fontSize: '10px', color: '#666' }}>Signature du Caissier</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#666' }}>{request.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '8px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un relevé officiel des opérations du compte. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '3px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableHistoriqueReceipt.displayName = 'PrintableHistoriqueReceipt';

export default PrintableHistoriqueReceipt;
