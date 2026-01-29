'use client';
import React, { forwardRef } from 'react';
import { DepositSlip } from './DepositSlip';

interface PrintableDepositSlipProps {
    depositSlip: DepositSlip;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableDepositSlip = forwardRef<HTMLDivElement, PrintableDepositSlipProps>(
    ({ depositSlip, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

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

        const formatTime = (timeString: string | undefined) => {
            if (!timeString) return '-';
            return timeString.substring(0, 5);
        };

        const getClientName = () => {
            if (depositSlip.client) {
                return `${depositSlip.client.firstName || ''} ${depositSlip.client.lastName || ''}`.trim();
            }
            return '-';
        };

        const getClientNumber = () => {
            return depositSlip.client?.clientNumber || '-';
        };

        const getBranchName = () => {
            return depositSlip.branch?.name || '-';
        };

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
                        <div>
                            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {companyName}
                            </h1>
                            <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#666' }}>
                                {companyAddress}<br />
                                Tél: {companyPhone}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                BORDEREAU DE DÉPÔT
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {depositSlip.slipNumber}
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
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Nom du Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientNumber()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Compte:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{depositSlip.savingsAccountId || '-'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Agence:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getBranchName()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column - Operation Info */}
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '12px',
                        backgroundColor: '#f8fafc'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            DÉTAILS DE L'OPÉRATION
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Date:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(depositSlip.depositDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Heure:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatTime(depositSlip.depositTime)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Déposant:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{depositSlip.depositorName || getClientName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Relation:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>
                                        {depositSlip.depositorRelationship === 'TITULAIRE' ? 'Titulaire du compte' :
                                         depositSlip.depositorRelationship || '-'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Cash Denominations */}
                {depositSlip.cashDenominations && depositSlip.cashDenominations.length > 0 && (
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fff'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            DÉCOMPTE DES BILLETS
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#e2e8f0' }}>
                                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>Coupure</th>
                                    <th style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid #ccc' }}>Quantité</th>
                                    <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ccc' }}>Sous-total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {depositSlip.cashDenominations.map((denom, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '6px 8px' }}>{formatCurrency(denom.denomination)}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>× {denom.quantity}</td>
                                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(denom.totalAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

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
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde avant dépôt:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(depositSlip.balanceBefore)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde après dépôt:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(depositSlip.balanceAfter)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>MONTANT DÉPOSÉ</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {formatCurrency(depositSlip.totalAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {depositSlip.notes && (
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#fefce8',
                        fontSize: '11px'
                    }}>
                        <strong>Observations:</strong> {depositSlip.notes}
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
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{getClientName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Caissier</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{depositSlip.userAction || '-'}</p>
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
                        Ce document est un reçu officiel de dépôt. Veuillez le conserver précieusement.
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

PrintableDepositSlip.displayName = 'PrintableDepositSlip';

export default PrintableDepositSlip;
