'use client';
import React, { forwardRef } from 'react';

interface ScheduleRow {
    installmentNumber: number;
    dueDate: string;
    principalDue: number;
    interestDue: number;
    totalDue: number;
    remainingPrincipal: number;
}

interface PrintableScheduleReceiptProps {
    demande: any;
    schedule: ScheduleRow[];
    method: string;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableScheduleReceipt = forwardRef<HTMLDivElement, PrintableScheduleReceiptProps>(
    ({ demande, schedule, method, companyName = "AGRINOVA MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined | null) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(Math.round(value)) + ' FBU';
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

        const clientName = demande?.client ? `${demande.client.firstName || ''} ${demande.client.lastName || ''}`.trim() : 'N/A';
        const clientNumber = demande?.client?.clientNumber || '-';
        const branchName = demande?.branch?.name || '-';
        const applicationNumber = demande?.applicationNumber || '-';
        const amount = demande?.amountRequested || 0;
        const rate = demande?.interestRate || 0;
        const duration = demande?.durationMonths || 0;

        const totalCapital = schedule.reduce((sum, r) => sum + r.principalDue, 0);
        const totalInterest = schedule.reduce((sum, r) => sum + r.interestDue, 0);
        const totalGeneral = schedule.reduce((sum, r) => sum + r.totalDue, 0);

        return (
            <div ref={ref} style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '25mm 18mm 12mm 18mm',
                backgroundColor: '#fff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '10px',
                color: '#000'
            }}>
                {/* Header */}
                <div style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: '10px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/layout/images/logo/logoAgrinova.PNG" alt="Logo" style={{ height: '60px', width: '60px', objectFit: 'contain' }} />
                            <div>
                                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                    {companyName}
                                </h1>
                                <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#666' }}>
                                    {companyAddress} | Tel: {companyPhone}
                                </p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '4px 0 0 0', fontSize: '11px', fontWeight: 'bold' }}>
                                N° {applicationNumber}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '9px', color: '#666' }}>
                                Date: {formatDate(demande?.applicationDate || new Date().toISOString().split('T')[0])}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', margin: '15px 0 20px 0' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                        color: '#fff',
                        padding: '10px 30px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        letterSpacing: '2px',
                        display: 'inline-block'
                    }}>
                        ECHEANCIER DE REMBOURSEMENT
                    </div>
                </div>

                {/* Client & Loan Info */}
                <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                    <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '5px 10px', fontSize: '9px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                            Informations du Client
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                            <table style={{ width: '100%', fontSize: '10px' }}>
                                <tbody>
                                    <tr><td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Nom complet:</td><td style={{ fontWeight: 'bold' }}>{clientName}</td></tr>
                                    <tr><td style={{ padding: '3px 0', color: '#666' }}>N° Client:</td><td style={{ fontWeight: 'bold' }}>{clientNumber}</td></tr>
                                    <tr><td style={{ padding: '3px 0', color: '#666' }}>Agence:</td><td style={{ fontWeight: 'bold' }}>{branchName}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ background: '#f1f5f9', padding: '5px 10px', fontSize: '9px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', borderBottom: '1px solid #ddd' }}>
                            Informations du Credit
                        </div>
                        <div style={{ padding: '8px 10px' }}>
                            <table style={{ width: '100%', fontSize: '10px' }}>
                                <tbody>
                                    <tr><td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Montant:</td><td style={{ fontWeight: 'bold' }}>{formatCurrency(amount)}</td></tr>
                                    <tr><td style={{ padding: '3px 0', color: '#666' }}>Taux annuel:</td><td style={{ fontWeight: 'bold' }}>{rate} %</td></tr>
                                    <tr><td style={{ padding: '3px 0', color: '#666' }}>Duree:</td><td style={{ fontWeight: 'bold' }}>{duration} mois</td></tr>
                                    <tr><td style={{ padding: '3px 0', color: '#666' }}>Methode:</td><td style={{ fontWeight: 'bold' }}>{method}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Schedule Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '10px' }}>
                    <thead>
                        <tr style={{ background: '#1e3a8a', color: '#fff' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #1e3a8a', width: '5%' }}>N°</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', border: '1px solid #1e3a8a', width: '17%' }}>Date Echeance</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #1e3a8a', width: '18%' }}>Capital</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #1e3a8a', width: '18%' }}>Interets</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #1e3a8a', width: '20%' }}>Total a Payer</th>
                            <th style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #1e3a8a', width: '22%' }}>Capital Restant</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedule.map((row, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f8fafc' }}>
                                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{row.installmentNumber}</td>
                                <td style={{ padding: '5px 8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{formatDate(row.dueDate)}</td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{formatCurrency(row.principalDue)}</td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{formatCurrency(row.interestDue)}</td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #e2e8f0', fontWeight: 'bold' }}>{formatCurrency(row.totalDue)}</td>
                                <td style={{ padding: '5px 8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{formatCurrency(row.remainingPrincipal)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                            <td colSpan={2} style={{ padding: '6px 8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>TOTAUX</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{formatCurrency(totalCapital)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #e2e8f0', color: '#ea580c' }}>{formatCurrency(totalInterest)}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', border: '1px solid #e2e8f0', color: '#1e3a8a', fontSize: '11px' }}>{formatCurrency(totalGeneral)}</td>
                            <td style={{ padding: '6px 8px', border: '1px solid #e2e8f0' }}></td>
                        </tr>
                    </tfoot>
                </table>

                {/* Engagement Text */}
                <div style={{
                    border: '2px solid #1e3a8a',
                    borderRadius: '6px',
                    padding: '15px',
                    marginBottom: '20px',
                    background: '#eff6ff'
                }}>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a8a', margin: '0 0 8px 0', textAlign: 'center' }}>
                        ENGAGEMENT DU CLIENT
                    </p>
                    <p style={{ fontSize: '10px', lineHeight: '1.7', margin: 0, textAlign: 'justify' }}>
                        Je soussigne(e), <strong>{clientName}</strong>, reconnais avoir pris connaissance de l'echeancier de remboursement
                        ci-dessus relatif au credit N° <strong>{applicationNumber}</strong> d'un montant de <strong>{formatCurrency(amount)}</strong> au
                        taux annuel de <strong>{rate}%</strong> sur une duree de <strong>{duration} mois</strong>.
                    </p>
                    <p style={{ fontSize: '10px', lineHeight: '1.7', margin: '8px 0 0 0', textAlign: 'justify' }}>
                        Je m'engage a rembourser la mensualite de <strong>{formatCurrency(schedule.length > 0 ? schedule[0].totalDue : 0)}</strong> a
                        chaque echeance aux dates indiquees. En cas de retard de paiement, des penalites pourront etre appliquees
                        conformement aux conditions generales de credit de <strong>{companyName}</strong>.
                    </p>
                </div>

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginTop: '25px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 50px 0', fontSize: '10px', color: '#666' }}>Le Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#666' }}>{clientName}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 50px 0', fontSize: '10px', color: '#666' }}>L'Agent de Credit</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#666' }}>Nom et Signature</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 50px 0', fontSize: '10px', color: '#666' }}>Pour {companyName}</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '9px', color: '#666' }}>Le Directeur</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '15px', paddingTop: '8px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '8px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document constitue un engagement contractuel entre le client et {companyName}. Toute falsification est passible de poursuites.
                    </p>
                    <p style={{ margin: '3px 0 0 0' }}>
                        Imprime le {new Date().toLocaleDateString('fr-FR')} a {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableScheduleReceipt.displayName = 'PrintableScheduleReceipt';

export default PrintableScheduleReceipt;
