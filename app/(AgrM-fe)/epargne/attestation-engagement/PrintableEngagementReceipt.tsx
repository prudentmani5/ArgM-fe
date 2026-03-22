'use client';
import React, { forwardRef } from 'react';
import { getClientDisplayName } from '@/utils/clientUtils';

interface CreditInfo {
    applicationNumber: string;
    amount: number;
    status: string;
    remainingBalance: number;
    disbursementDate?: string;
}

interface PrintableEngagementReceiptProps {
    request: any;
    savingsAccount: any;
    credits: CreditInfo[];
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableEngagementReceipt = forwardRef<HTMLDivElement, PrintableEngagementReceiptProps>(
    ({ request, savingsAccount, credits, companyName = "AGRINOVA MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined | null) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const parts = dateString.split('-');
            if (parts.length === 3) {
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return dateString;
        };

        const getClientName = () => getClientDisplayName(request.client || savingsAccount?.client);
        const getClientNumber = () => request.client?.clientNumber || savingsAccount?.client?.clientNumber || '-';
        const getBranchName = () => request.branch?.name || savingsAccount?.branch?.name || '-';
        const getAccountNumber = () => savingsAccount?.accountNumber || '-';

        const activeCredits = credits.filter(c => c.remainingBalance > 0);
        const hasEngagement = savingsAccount != null || credits.length > 0;

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
                                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#666' }}>
                                    {companyAddress} | Tel: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>
                                N° {request.requestNumber || '-'}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#666' }}>
                                Date: {formatDate(request.requestDate || new Date().toISOString().split('T')[0])}
                            </p>
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
                        ATTESTATION D'ENGAGEMENT
                    </div>
                </div>

                {/* Body text */}
                <div style={{ lineHeight: '1.8', fontSize: '12px', marginBottom: '25px' }}>
                    <p style={{ textAlign: 'justify' }}>
                        Nous soussignes, <strong>{companyName}</strong>, attestons par la presente que :
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
                                <tr><td style={{ padding: '4px 0', color: '#666', width: '30%' }}>Nom complet:</td><td style={{ fontWeight: 'bold', fontSize: '13px' }}>{getClientName()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Client:</td><td style={{ fontWeight: 'bold' }}>{getClientNumber()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Compte Epargne:</td><td style={{ fontWeight: 'bold' }}>{getAccountNumber()}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>Agence:</td><td style={{ fontWeight: 'bold' }}>{getBranchName()}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Engagement Details */}
                <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '25px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                        Situation du Client
                    </div>
                    <div style={{ padding: '12px 15px' }}>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666', width: '50%' }}>Compte epargne actif:</td>
                                    <td style={{ fontWeight: 'bold', color: savingsAccount ? '#16a34a' : '#dc2626' }}>
                                        {savingsAccount ? 'Oui' : 'Non'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Credits obtenus:</td>
                                    <td style={{ fontWeight: 'bold' }}>
                                        {credits.length > 0 ? `${credits.length} credit(s)` : 'Aucun'}
                                    </td>
                                </tr>
                                {activeCredits.length > 0 && (
                                    <tr>
                                        <td style={{ padding: '5px 0', color: '#666' }}>Credits en cours de remboursement:</td>
                                        <td style={{ fontWeight: 'bold', color: '#2563eb' }}>
                                            {activeCredits.length} credit(s)
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Credits detail if any */}
                {credits.length > 0 && (
                    <div style={{ marginBottom: '25px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0' }}>
                            DETAIL DES CREDITS ({credits.length})
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                    <th style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>N° Dossier</th>
                                    <th style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Montant</th>
                                    <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Date Decaissement</th>
                                    <th style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Statut</th>
                                    <th style={{ padding: '6px 8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Reste a Payer</th>
                                </tr>
                            </thead>
                            <tbody>
                                {credits.map((c, i) => (
                                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9' }}>{c.applicationNumber}</td>
                                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right' }}>{formatCurrency(c.amount)}</td>
                                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>{formatDate(c.disbursementDate)}</td>
                                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                            {c.remainingBalance > 0 ? 'En cours' : 'Rembourse'}
                                        </td>
                                        <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold', color: c.remainingBalance > 0 ? '#2563eb' : '#16a34a' }}>
                                            {formatCurrency(c.remainingBalance)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Attestation statement */}
                <div style={{
                    border: '2px solid #1e3a8a',
                    borderRadius: '6px',
                    padding: '20px',
                    marginBottom: '30px',
                    background: '#eff6ff',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 8px 0' }}>
                        ATTESTATION D'ENGAGEMENT
                    </p>
                    <p style={{ fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                        {hasEngagement ? (
                            <>
                                Le/La client(e) <strong>{getClientName()}</strong>, titulaire du compte N° <strong>{getAccountNumber()}</strong>,
                                est un(e) client(e) actif(ve) de notre institution.
                                {activeCredits.length > 0
                                    ? ` Il/Elle a actuellement ${activeCredits.length} credit(s) en cours de remboursement aupres de notre institution.`
                                    : credits.length > 0
                                        ? ` Il/Elle a obtenu ${credits.length} credit(s) dont tous ont ete integralement rembourses.`
                                        : ` Il/Elle detient un compte d'epargne actif aupres de notre institution.`
                                }
                            </>
                        ) : (
                            <>
                                Le/La client(e) <strong>{getClientName()}</strong> n'a pas d'engagement actif aupres de notre institution.
                            </>
                        )}
                    </p>
                </div>

                <p style={{ fontSize: '11px', lineHeight: '1.6', textAlign: 'justify', marginBottom: '30px' }}>
                    En foi de quoi, la presente attestation est delivree pour servir et valoir ce que de droit.
                </p>

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
                    <p style={{ margin: 0 }}>
                        Ce document est une attestation officielle delivree par {companyName}. Toute falsification est passible de poursuites.
                    </p>
                    <p style={{ margin: '3px 0 0 0' }}>
                        Imprime le {new Date().toLocaleDateString('fr-FR')} a {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableEngagementReceipt.displayName = 'PrintableEngagementReceipt';

export default PrintableEngagementReceipt;
