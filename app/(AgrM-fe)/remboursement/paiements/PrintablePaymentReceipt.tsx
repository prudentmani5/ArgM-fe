'use client';
import React, { forwardRef } from 'react';
import { PaiementCredit } from '../types/RemboursementTypes';

interface PrintablePaymentReceiptProps {
    payment: PaiementCredit;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintablePaymentReceipt = forwardRef<HTMLDivElement, PrintablePaymentReceiptProps>(
    ({ payment, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        const getPaymentMode = () => {
            if (payment.isAutoDebit) return 'Prélèvement automatique';
            if (payment.isHomeCollection) return 'Collecte à domicile';
            if (payment.isMobileMoney) return 'Mobile Money';
            if (payment.isBankTransfer) return 'Virement bancaire';
            return 'Paiement en agence';
        };

        const totalAllocated = (payment.allocatedToPrincipal || 0) +
            (payment.allocatedToInterest || 0) +
            (payment.allocatedToPenalty || 0) +
            (payment.allocatedToInsurance || 0) +
            (payment.allocatedToFees || 0);

        return (
            <div ref={ref} className="printable-receipt" style={{
                width: '210mm',
                minHeight: '148mm',
                padding: '15mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{
                    borderBottom: '3px double #333',
                    paddingBottom: '10px',
                    marginBottom: '15px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '80px', width: '80px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>
                                    {companyAddress}<br />
                                    Tél: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                REÇU DE PAIEMENT
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {payment.paymentNumber}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {/* Left Column - Client Info */}
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '12px',
                        backgroundColor: '#f8fafc'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            INFORMATIONS DU CLIENT
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{payment.clientName || '-'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Dossier:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{payment.applicationNumber || '-'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Décaissement:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{payment.disbursementNumber || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column - Payment Info */}
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '12px',
                        backgroundColor: '#f8fafc'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            DÉTAILS DU PAIEMENT
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Date:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(payment.paymentDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Date de Valeur:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(payment.valueDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Mode:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getPaymentMode()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Reçu:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{payment.receiptNumber || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Payment Allocation Table */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#fff'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                        RÉPARTITION DU PAIEMENT
                    </h3>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e2e8f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Rubrique</th>
                                <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(payment.allocatedToPenalty || 0) > 0 && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '6px 8px' }}>Pénalités</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', color: '#ea580c' }}>{formatCurrency(payment.allocatedToPenalty)}</td>
                                </tr>
                            )}
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '6px 8px' }}>Intérêts</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(payment.allocatedToInterest)}</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '6px 8px' }}>Capital</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(payment.allocatedToPrincipal)}</td>
                            </tr>
                            {(payment.allocatedToInsurance || 0) > 0 && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '6px 8px' }}>Assurance</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(payment.allocatedToInsurance)}</td>
                                </tr>
                            )}
                            {(payment.allocatedToFees || 0) > 0 && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '6px 8px' }}>Frais</td>
                                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(payment.allocatedToFees)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Amount Summary */}
                <div style={{
                    border: '2px solid #1e3a8a',
                    borderRadius: '5px',
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#eff6ff'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <table style={{ fontSize: '12px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Total alloué:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(totalAllocated)}</td>
                                    </tr>
                                    {(payment.amountReceived || 0) > totalAllocated && (
                                        <tr>
                                            <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Excédent:</td>
                                            <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency((payment.amountReceived || 0) - totalAllocated)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>MONTANT REÇU</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {formatCurrency(payment.amountReceived)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {payment.notes && (
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#fefce8',
                        fontSize: '11px'
                    }}>
                        <strong>Observations:</strong> {payment.notes}
                    </div>
                )}

                {/* Footer - Signatures */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '40px',
                    marginTop: '30px',
                    paddingTop: '20px',
                    borderTop: '1px dashed #ccc'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{payment.clientName || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature de l'Agent</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{payment.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer Info */}
                <div style={{
                    marginTop: '20px',
                    paddingTop: '10px',
                    borderTop: '1px solid #eee',
                    textAlign: 'center',
                    fontSize: '9px',
                    color: '#999'
                }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un reçu officiel de paiement de crédit. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Print Styles */}
                <style jsx>{`
                    @media print {
                        .printable-receipt {
                            width: 100% !important;
                            padding: 10mm !important;
                            margin: 0 !important;
                        }
                    }
                `}</style>
            </div>
        );
    }
);

PrintablePaymentReceipt.displayName = 'PrintablePaymentReceipt';

export default PrintablePaymentReceipt;
