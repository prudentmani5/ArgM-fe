'use client';
import React, { forwardRef } from 'react';
import { WithdrawalRequest } from './WithdrawalRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableWithdrawalReceiptProps {
    withdrawal: WithdrawalRequest;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableWithdrawalReceipt = forwardRef<HTMLDivElement, PrintableWithdrawalReceiptProps>(
    ({ withdrawal, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

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
            return getClientDisplayName(withdrawal.client);
        };

        const getClientNumber = () => {
            return withdrawal.client?.clientNumber || '-';
        };

        const getBranchName = () => {
            return withdrawal.branch?.name || '-';
        };

        const getStatusLabel = (status: string) => {
            const labels: { [key: string]: string } = {
                PENDING: 'En attente',
                ID_VERIFIED: 'ID Verifie',
                FIRST_VERIFIED: '1ere Verification',
                SECOND_VERIFIED: '2eme Verification',
                MANAGER_APPROVED: 'Approuve par Manager',
                APPROVED: 'Approuve',
                DISBURSED: 'Decaisse',
                REJECTED: 'Rejete',
                CANCELLED: 'Annule'
            };
            return labels[status] || status;
        };

        return (
            <div ref={ref} className="printable-receipt" style={{
                width: '210mm',
                minHeight: '148mm',
                padding: '15mm 20mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000',
                margin: '0 auto'
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
                                    Tel: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                RECU DE RETRAIT
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N&deg; {withdrawal.requestNumber}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                                Statut: {getStatusLabel(withdrawal.status)}
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
                                    <td style={{ padding: '3px 0', color: '#666', width: '45%' }}>Nom du Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N&deg; Client:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getClientNumber()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N&deg; Compte:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{withdrawal.savingsAccountId || '-'}</td>
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
                            DETAILS DE L'OPERATION
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '45%' }}>Date demande:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(withdrawal.requestDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Heure:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatTime(withdrawal.requestTime)}</td>
                                </tr>
                                {withdrawal.disbursementDate && (
                                    <tr>
                                        <td style={{ padding: '3px 0', color: '#666' }}>Date decaissement:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(withdrawal.disbursementDate)}</td>
                                    </tr>
                                )}
                                {withdrawal.receiptNumber && (
                                    <tr>
                                        <td style={{ padding: '3px 0', color: '#666' }}>N&deg; Recu:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{withdrawal.receiptNumber}</td>
                                    </tr>
                                )}
                                {withdrawal.withdrawalPurpose && (
                                    <tr>
                                        <td style={{ padding: '3px 0', color: '#666' }}>Motif:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{withdrawal.withdrawalPurpose}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Beneficiary Info (if different from account holder) */}
                {withdrawal.depositorName && (
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fefce8'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#92400e', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            BENEFICIAIRE DU RETRAIT
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '25%' }}>Nom:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold', width: '25%' }}>{withdrawal.depositorName}</td>
                                    <td style={{ padding: '3px 0', color: '#666', width: '25%' }}>Relation:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold', width: '25%' }}>
                                        {withdrawal.depositorRelationship === 'TITULAIRE' ? 'Titulaire du compte' :
                                         withdrawal.depositorRelationship || '-'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Telephone:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{withdrawal.depositorPhone || '-'}</td>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N&deg; Piece d'identite:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{withdrawal.depositorIdNumber || '-'}</td>
                                </tr>
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
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde avant retrait:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(withdrawal.balanceAtRequest)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde apres retrait:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(withdrawal.balanceAfterWithdrawal)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>MONTANT RETIRE</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                                {formatCurrency(withdrawal.disbursedAmount || withdrawal.requestedAmount)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Verification Trail */}
                <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    padding: '12px',
                    marginBottom: '20px',
                    backgroundColor: '#f0fdf4'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#166534', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                        VERIFICATIONS ET APPROBATIONS
                    </h3>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                        <tbody>
                            {withdrawal.firstVerifier && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '4px 0', color: '#666', width: '30%' }}>1ere Verification:</td>
                                    <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{withdrawal.firstVerifier}</td>
                                    <td style={{ padding: '4px 0', color: '#666', textAlign: 'right' }}>{formatDate(withdrawal.firstVerifiedAt)}</td>
                                </tr>
                            )}
                            {withdrawal.secondVerifier && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '4px 0', color: '#666' }}>2eme Verification:</td>
                                    <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{withdrawal.secondVerifier}</td>
                                    <td style={{ padding: '4px 0', color: '#666', textAlign: 'right' }}>{formatDate(withdrawal.secondVerifiedAt)}</td>
                                </tr>
                            )}
                            {withdrawal.manager && (
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '4px 0', color: '#666' }}>Approbation Manager:</td>
                                    <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{withdrawal.manager}</td>
                                    <td style={{ padding: '4px 0', color: '#666', textAlign: 'right' }}>{formatDate(withdrawal.managerApprovedAt)}</td>
                                </tr>
                            )}
                            <tr>
                                <td style={{ padding: '4px 0', color: '#666' }}>Operateur:</td>
                                <td style={{ padding: '4px 0', fontWeight: 'bold' }}>{withdrawal.userAction || '-'}</td>
                                <td style={{ padding: '4px 0', color: '#666', textAlign: 'right' }}></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Notes */}
                {withdrawal.notes && (
                    <div style={{
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        padding: '10px',
                        marginBottom: '20px',
                        backgroundColor: '#fefce8',
                        fontSize: '11px'
                    }}>
                        <strong>Observations:</strong> {withdrawal.notes}
                    </div>
                )}

                {/* Footer - Signatures */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '30px',
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
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{withdrawal.userAction || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Visa Chef d'Agence</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{withdrawal.manager || '-'}</p>
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
                        Ce document est un recu officiel de retrait. Veuillez le conserver precieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprime le {new Date().toLocaleDateString('fr-FR')} a {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                {/* Print Styles */}
                <style jsx>{`
                    @media print {
                        .printable-receipt {
                            width: 100% !important;
                            padding: 10mm 15mm !important;
                            margin: 0 !important;
                        }
                    }
                `}</style>
            </div>
        );
    }
);

PrintableWithdrawalReceipt.displayName = 'PrintableWithdrawalReceipt';

export default PrintableWithdrawalReceipt;
