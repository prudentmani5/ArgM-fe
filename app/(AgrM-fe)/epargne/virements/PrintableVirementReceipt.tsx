'use client';
import React, { forwardRef } from 'react';
import { Virement, TRANSFER_TYPE_OPTIONS } from './Virement';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableVirementReceiptProps {
    virement: Virement;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableVirementReceipt = forwardRef<HTMLDivElement, PrintableVirementReceiptProps>(
    ({ virement, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const getTransferTypeLabel = () => {
            const opt = TRANSFER_TYPE_OPTIONS.find(o => o.value === virement.transferType);
            return opt ? opt.label : virement.transferType;
        };

        const getSourceName = () => {
            if (virement.sourceClient) {
                return getClientDisplayName(virement.sourceClient);
            }
            return virement.sourceAccountCode || '-';
        };

        const getSourceAccountNumber = () => {
            return virement.sourceSavingsAccount?.accountNumber || virement.sourceAccountCode || '-';
        };

        const getDestinationName = () => {
            if (virement.destinationClient) {
                return getClientDisplayName(virement.destinationClient);
            }
            return virement.destinationAccountCode || '-';
        };

        const getDestinationAccountNumber = () => {
            return virement.destinationSavingsAccount?.accountNumber || virement.destinationAccountCode || '-';
        };

        const getBranchName = () => {
            return virement.branch?.name || '-';
        };

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '148mm',
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
                                REÇU DE VIREMENT
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {virement.reference}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                                {getTransferTypeLabel()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Source and Destination Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Source */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#fef2f2' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#dc2626', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            COMPTE SOURCE (DÉBIT)
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '45%' }}>Titulaire:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getSourceName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Compte:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getSourceAccountNumber()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Solde avant:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(virement.sourceBalanceBefore)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Solde après:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(virement.sourceBalanceAfter)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Destination */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#f0fdf4' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#16a34a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            COMPTE DESTINATION (CRÉDIT)
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '45%' }}>Titulaire:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getDestinationName()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>N° Compte:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getDestinationAccountNumber()}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Solde avant:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(virement.destinationBalanceBefore)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Solde après:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(virement.destinationBalanceAfter)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Amount Summary */}
                <div style={{ border: '2px solid #1e3a8a', borderRadius: '5px', padding: '15px', marginBottom: '20px', backgroundColor: '#eff6ff' }}>
                    <table style={{ width: '100%', fontSize: '13px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '5px 0', color: '#666' }}>Montant du virement:</td>
                                <td style={{ padding: '5px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(virement.montant)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '5px 0', color: '#666' }}>Commission ({virement.commissionRate}%):</td>
                                <td style={{ padding: '5px 0', fontWeight: 'bold', textAlign: 'right' }}>{formatCurrency(virement.commissionAmount)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #1e3a8a' }}>
                                <td style={{ padding: '8px 0', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>TOTAL DÉBITÉ:</td>
                                <td style={{ padding: '8px 0', fontSize: '20px', fontWeight: 'bold', textAlign: 'right', color: '#1e3a8a' }}>{formatCurrency(virement.totalDebitAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Operation details */}
                <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', marginBottom: '20px', backgroundColor: '#f8fafc' }}>
                    <table style={{ width: '100%', fontSize: '11px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666', width: '30%' }}>Date:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(virement.dateVirement)}</td>
                                <td style={{ padding: '3px 0', color: '#666', width: '30%' }}>Agence:</td>
                                <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getBranchName()}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '3px 0', color: '#666' }}>Motif:</td>
                                <td colSpan={3} style={{ padding: '3px 0', fontWeight: 'bold' }}>{virement.motif || '-'}</td>
                            </tr>
                            {virement.notes && (
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Notes:</td>
                                    <td colSpan={3} style={{ padding: '3px 0' }}>{virement.notes}</td>
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
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{virement.userAction || '-'}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Chef d'Agence</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{virement.validatedBy || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '9px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un reçu officiel de virement. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableVirementReceipt.displayName = 'PrintableVirementReceipt';

export default PrintableVirementReceipt;
