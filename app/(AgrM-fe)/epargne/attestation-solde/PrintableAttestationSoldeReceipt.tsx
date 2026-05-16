'use client';
import React, { forwardRef } from 'react';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableAttestationSoldeReceiptProps {
    request: any;
    savingsAccount: any;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableAttestationSoldeReceipt = forwardRef<HTMLDivElement, PrintableAttestationSoldeReceiptProps>(
    ({ request, savingsAccount, companyName = "AGRINOVA MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 69 21 01 93" }, ref) => {

        const formatCurrency = (value: number | undefined | null) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            }
            return dateString;
        };

        const getClientName = () => getClientDisplayName(request.client || savingsAccount?.client);
        const getClientNumber = () => request.client?.clientNumber || savingsAccount?.client?.clientNumber || '-';
        const getBranchName = () => request.branch?.name || savingsAccount?.branch?.name || '-';
        const getAccountNumber = () => savingsAccount?.accountNumber || '-';

        const soldeMatch = request.notes?.match(/SOLDE:\s*([\d\s]+FBU)/);
        const soldeAtteste = soldeMatch ? soldeMatch[1].trim() : formatCurrency(savingsAccount?.currentBalance);

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '15mm 20mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '11px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: '10px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '65px', width: '65px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a' }}>{companyName}</h1>
                                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#666' }}>{companyAddress} | Tel: {companyPhone}</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>N° {request.requestNumber || '-'}</p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#666' }}>Date: {formatDate(request.requestDate)}</p>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '25px 0 30px 0' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                        color: '#fff',
                        padding: '12px 30px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        display: 'inline-block'
                    }}>
                        ATTESTATION DE SOLDE
                    </div>
                </div>

                {/* Intro */}
                <div style={{ lineHeight: '1.8', fontSize: '12px', marginBottom: '25px' }}>
                    <p style={{ textAlign: 'justify' }}>
                        Nous soussignés, <strong>{companyName}</strong>, attestons par la présente que :
                    </p>
                </div>

                {/* Client Info */}
                <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '25px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                        Informations du Client
                    </div>
                    <div style={{ padding: '12px 15px' }}>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <tbody>
                                <tr><td style={{ padding: '4px 0', color: '#666', width: '35%' }}>Nom complet:</td><td style={{ fontWeight: 'bold', fontSize: '13px' }}>{getClientName()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Client:</td><td style={{ fontWeight: 'bold' }}>{getClientNumber()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Compte Epargne:</td><td style={{ fontWeight: 'bold' }}>{getAccountNumber()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>Agence:</td><td style={{ fontWeight: 'bold' }}>{getBranchName()}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Balance highlighted */}
                <div style={{
                    border: '2px solid #1e3a8a',
                    borderRadius: '6px',
                    padding: '25px',
                    marginBottom: '30px',
                    background: '#eff6ff',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 10px 0' }}>
                        Le solde du compte epargne N° <strong>{getAccountNumber()}</strong> au {formatDate(request.requestDate)} est de :
                    </p>
                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 10px 0', letterSpacing: '1px' }}>
                        {soldeAtteste}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                        (Solde disponible a la date de la demande)
                    </p>
                </div>

                {/* Statement */}
                <div style={{ lineHeight: '1.8', fontSize: '12px', marginBottom: '30px', textAlign: 'justify' }}>
                    <p>
                        Le/La client(e) <strong>{getClientName()}</strong>, titulaire du compte epargne
                        N° <strong>{getAccountNumber()}</strong> ouvert aupres de notre institution,
                        dispose d'un solde de <strong>{soldeAtteste}</strong> a la date du{' '}
                        <strong>{formatDate(request.requestDate)}</strong>.
                    </p>
                    <p style={{ marginTop: '12px' }}>
                        La presente attestation est delivree a la demande de l'interesse(e) pour servir et valoir ce que de droit.
                    </p>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '30px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Le Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>{getClientName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Pour {companyName}</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>{request.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '8px', color: '#999' }}>
                    <p style={{ margin: 0 }}>Ce document est une attestation officielle delivree par {companyName}. Toute falsification est passible de poursuites.</p>
                    <p style={{ margin: '3px 0 0 0' }}>Imprime le {new Date().toLocaleDateString('fr-FR')} a {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
        );
    }
);

PrintableAttestationSoldeReceipt.displayName = 'PrintableAttestationSoldeReceipt';
export default PrintableAttestationSoldeReceipt;
