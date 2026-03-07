'use client';
import React, { forwardRef } from 'react';
import { VirementBatch } from './Virement';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableVirementBatchReceiptProps {
    batch: VirementBatch;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableVirementBatchReceipt = forwardRef<HTMLDivElement, PrintableVirementBatchReceiptProps>(
    ({ batch, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const getSourceName = () => {
            if (batch.sourceClient) {
                return getClientDisplayName(batch.sourceClient);
            }
            return '-';
        };

        const getSourceAccountNumber = () => {
            return batch.sourceSavingsAccount?.accountNumber || '-';
        };

        const getBranchName = () => {
            return batch.branch?.name || '-';
        };

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '200mm',
                padding: '15mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '12px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{ borderBottom: '3px double #333', paddingBottom: '10px', marginBottom: '15px' }}>
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
                                REÇU DE VIREMENT MULTIPLE
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {batch.batchNumber || '-'}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                                {batch.numberOfTransfers || batch.details?.length || 0} bénéficiaire(s)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Source Account Info */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', marginBottom: '15px', backgroundColor: '#fef2f2' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#dc2626', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                        COMPTE SOURCE (DÉBIT)
                    </h3>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666', width: '25%' }}>Titulaire:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '25%' }}>{getSourceName()}</td>
                                <td style={{ padding: '3px 0', color: '#666', width: '25%' }}>N° Compte:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '25%' }}>{getSourceAccountNumber()}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666' }}>Solde avant:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(batch.sourceBalanceBefore)}</td>
                                <td style={{ padding: '3px 0', color: '#666' }}>Solde après:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(batch.sourceBalanceAfter)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Destinations Table */}
                <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#16a34a' }}>
                        BÉNÉFICIAIRES ({batch.details?.length || 0})
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #16a34a' }}>
                                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>#</th>
                                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>N° Compte</th>
                                <th style={{ padding: '6px 4px', textAlign: 'left', fontWeight: 'bold' }}>Client</th>
                                <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Montant</th>
                                <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Solde Avant</th>
                                <th style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 'bold' }}>Solde Après</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold' }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(batch.details || []).map((detail, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #eee', backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                    <td style={{ padding: '5px 4px' }}>{detail.sequenceNumber || index + 1}</td>
                                    <td style={{ padding: '5px 4px' }}>{detail.destinationAccountNumber || detail.destinationSavingsAccount?.accountNumber || '-'}</td>
                                    <td style={{ padding: '5px 4px' }}>{detail.destinationClientName || getClientDisplayName(detail.destinationClient)}</td>
                                    <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(detail.amount)}</td>
                                    <td style={{ padding: '5px 4px', textAlign: 'right' }}>{detail.destinationBalanceBefore !== undefined && detail.destinationBalanceBefore !== null ? formatCurrency(detail.destinationBalanceBefore) : '-'}</td>
                                    <td style={{ padding: '5px 4px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>{detail.destinationBalanceAfter !== undefined && detail.destinationBalanceAfter !== null ? formatCurrency(detail.destinationBalanceAfter) : '-'}</td>
                                    <td style={{ padding: '5px 4px', textAlign: 'center', color: detail.status === 'SUCCESS' ? '#16a34a' : detail.status === 'FAILED' ? '#dc2626' : '#d97706', fontWeight: 'bold' }}>
                                        {detail.status === 'SUCCESS' ? 'OK' : detail.status === 'FAILED' ? 'ÉCHEC' : 'ATT'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Amount Summary */}
                <div style={{ border: '2px solid #1e3a8a', borderRadius: '5px', padding: '15px', marginBottom: '15px', backgroundColor: '#eff6ff' }}>
                    <table style={{ width: '100%', fontSize: '13px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '5px 0', color: '#666' }}>Total virements ({batch.numberOfTransfers || batch.details?.length || 0} bénéficiaires):</td>
                                <td style={{ padding: '5px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(batch.totalAmount)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '5px 0', color: '#666' }}>Commission ({batch.commissionRate}%):</td>
                                <td style={{ padding: '5px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(batch.commissionAmount)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #1e3a8a' }}>
                                <td style={{ padding: '8px 0', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>TOTAL DÉBITÉ:</td>
                                <td style={{ padding: '8px 0', fontSize: '20px', fontWeight: 'bold', textAlign: 'right', color: '#1e3a8a' }}>{formatCurrency(batch.totalDebitAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Operation details */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', marginBottom: '15px', backgroundColor: '#f8fafc' }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666', width: '20%' }}>Date:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '30%' }}>{formatDate(batch.dateVirement)}</td>
                                <td style={{ padding: '3px 0', color: '#666', width: '20%' }}>Agence:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold', width: '30%' }}>{getBranchName()}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666' }}>Motif:</td>
                                <td colSpan={3} style={{ padding: '3px 0', fontWeight: 'bold' }}>{batch.motif || '-'}</td>
                            </tr>
                            {batch.notes && (
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Notes:</td>
                                    <td colSpan={3} style={{ padding: '3px 0' }}>{batch.notes}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{getSourceName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Caissier</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{batch.userAction || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Chef d'Agence</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{batch.validatedBy || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '9px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un reçu officiel de virement multiple. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableVirementBatchReceipt.displayName = 'PrintableVirementBatchReceipt';

export default PrintableVirementBatchReceipt;
