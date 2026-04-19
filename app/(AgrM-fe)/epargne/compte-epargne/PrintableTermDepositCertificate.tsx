'use client';
import React, { forwardRef } from 'react';

interface PrintableTermDepositCertificateProps {
    account: any;
    history: any[];
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableTermDepositCertificate = forwardRef<HTMLDivElement, PrintableTermDepositCertificateProps>(
    ({ account, history, companyName = "AGRINOVA MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined | null) => {
            if (value === undefined || value === null) return '0 BIF';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' BIF';
        };

        const formatDate = (dateString: string | undefined | null) => {
            if (!dateString) return '-';
            const parts = String(dateString).split('-');
            if (parts.length === 3) {
                const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
            return String(dateString);
        };

        const clientName = account?.client ? (account.client.businessName || `${account.client.firstName || ''} ${account.client.lastName || ''}`.trim() || '-') : '-';
        const clientNumber = account?.client?.clientNumber || '-';
        const branchName = account?.branch?.name || '-';
        const currCode = account?.currency?.code || 'BIF';
        const td = account?.termDuration;
        const capital = account?.blockedAmount || account?.currentBalance || 0;
        const interest = account?.accruedInterest || 0;
        const total = capital + interest;
        const isBlocked = account?.accountType === 'BLOCKED';

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
                            <p style={{ margin: 0, fontSize: '11px', fontWeight: 'bold' }}>
                                N° Compte: {account?.accountNumber || '-'}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#666' }}>
                                Date: {formatDate(new Date().toISOString().split('T')[0])}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '20px 0 25px 0' }}>
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
                        {isBlocked ? "CERTIFICAT D'EPARGNE BLOQUE" : "CERTIFICAT DE DEPOT A TERME"}
                    </div>
                </div>

                {/* Intro text */}
                <div style={{ lineHeight: '1.8', fontSize: '12px', marginBottom: '20px' }}>
                    <p style={{ textAlign: 'justify' }}>
                        Nous soussignes, <strong>{companyName}</strong>, certifions par la presente que le/la client(e)
                        ci-dessous a effectue un {isBlocked ? "depot d'epargne bloque" : "depot a terme"} dans notre institution selon les conditions suivantes :
                    </p>
                </div>

                {/* Client Info */}
                <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                        Informations du Client
                    </div>
                    <div style={{ padding: '12px 15px' }}>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <tbody>
                                <tr><td style={{ padding: '4px 0', color: '#666', width: '30%' }}>Nom complet:</td><td style={{ fontWeight: 'bold', fontSize: '13px' }}>{clientName}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Client:</td><td style={{ fontWeight: 'bold' }}>{clientNumber}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>N° Compte Epargne:</td><td style={{ fontWeight: 'bold' }}>{account?.accountNumber || '-'}</td></tr>
                                <tr><td style={{ padding: '4px 0', color: '#666' }}>Agence:</td><td style={{ fontWeight: 'bold' }}>{branchName}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Term Deposit Details */}
                <div style={{ border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                    <div style={{ background: '#f1f5f9', padding: '6px 12px', fontSize: '10px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                        {isBlocked ? "Details de l'Epargne Bloque" : "Details du Depot a Terme"}
                    </div>
                    <div style={{ padding: '12px 15px' }}>
                        <table style={{ width: '100%', fontSize: '12px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666', width: '35%' }}>{isBlocked ? "Capital bloque:" : "Capital depose:"}</td>
                                    <td style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e3a8a' }}>{formatCurrency(capital)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>{isBlocked ? "Duree du blocage:" : "Duree du terme:"}</td>
                                    <td style={{ fontWeight: 'bold' }}>{td ? `${td.nameFr || td.name || ''} (${td.months} mois)` : '-'}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Taux d'interet annuel:</td>
                                    <td style={{ fontWeight: 'bold' }}>{account?.interestRate || 0} %</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Interets attendus:</td>
                                    <td style={{ fontWeight: 'bold', color: '#ea580c' }}>{formatCurrency(interest)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Date de debut:</td>
                                    <td style={{ fontWeight: 'bold' }}>{formatDate(account?.termStartDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>{isBlocked ? "Date de deblocage:" : "Date d'echeance:"}</td>
                                    <td style={{ fontWeight: 'bold' }}>{formatDate(account?.maturityDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Devise:</td>
                                    <td style={{ fontWeight: 'bold' }}>{currCode}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '5px 0', color: '#666' }}>Cycle:</td>
                                    <td style={{ fontWeight: 'bold' }}>{account?.termDepositCount || 1}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary box */}
                <div style={{
                    border: '2px solid #1e3a8a',
                    borderRadius: '6px',
                    padding: '15px',
                    marginBottom: '20px',
                    background: '#eff6ff'
                }}>
                    <table style={{ width: '100%', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '4px 0', width: '50%' }}>Capital bloque:</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(capital)}</td>
                            </tr>
                            <tr>
                                <td style={{ padding: '4px 0' }}>Interets attendus:</td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ea580c' }}>+ {formatCurrency(interest)}</td>
                            </tr>
                            <tr style={{ borderTop: '2px solid #1e3a8a' }}>
                                <td style={{ padding: '8px 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {isBlocked ? "Montant total au deblocage:" : "Montant total a l'echeance:"}
                                </td>
                                <td style={{ textAlign: 'right', fontSize: '16px', fontWeight: 'bold', color: '#16a34a', padding: '8px 0 4px 0' }}>
                                    {formatCurrency(total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Conditions */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', marginBottom: '20px', fontSize: '10px', background: '#fafafa' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>CONDITIONS :</p>
                    <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: '1.8', color: '#555' }}>
                        {isBlocked ? (<>
                            <li>Le capital est bloque pendant toute la duree convenue et ne peut faire l'objet d'un retrait anticipe sauf conditions particulieres.</li>
                            <li>Les interets seront calcules au taux convenu et restitues avec le capital a la date de deblocage.</li>
                            <li>A la date de deblocage, le client pourra renouveler le blocage pour un nouveau cycle aux conditions en vigueur.</li>
                            <li>Ce certificat ne constitue pas un titre negociable.</li>
                        </>) : (<>
                            <li>Le capital est bloque pendant toute la duree du terme et ne peut faire l'objet d'un retrait anticipe sauf conditions particulieres.</li>
                            <li>Les interets seront calcules au taux convenu et restitues avec le capital a l'echeance.</li>
                            <li>A l'echeance, le client pourra renouveler le depot pour un nouveau cycle aux conditions en vigueur.</li>
                            <li>Ce certificat ne constitue pas un titre negociable.</li>
                        </>)}
                    </ul>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '25px', paddingTop: '15px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Le Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>{clientName}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Pour {companyName}</p>
                        <div style={{ borderTop: '1px solid #333', width: '70%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: '#666' }}>{account?.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '8px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un certificat officiel {isBlocked ? "d'epargne bloque" : "de depot a terme"} delivre par {companyName}. Toute falsification est passible de poursuites.
                    </p>
                    <p style={{ margin: '3px 0 0 0' }}>
                        Imprime le {new Date().toLocaleDateString('fr-FR')} a {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableTermDepositCertificate.displayName = 'PrintableTermDepositCertificate';

export default PrintableTermDepositCertificate;
