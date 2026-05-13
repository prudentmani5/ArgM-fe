'use client';
import React from 'react';
import { DecouvertRequest, STATUS_LABELS } from './DecouvertRequest';
import { getClientDisplayName } from '@/utils/clientUtils';

interface Props {
    decouvert: DecouvertRequest;
    savingsAccounts?: any[];
}

const fmt = (v?: number | null) =>
    v != null ? new Intl.NumberFormat('fr-BI').format(v) + ' FBU' : '–';

export default function PrintableDecouvertReceipt({ decouvert, savingsAccounts = [] }: Props) {
    const account = savingsAccounts.find((a) => a.id === decouvert.savingsAccountId);
    const clientName = account?.client
        ? getClientDisplayName(account.client)
        : account?.solidarityGroup?.groupName ?? '–';
    const accountNumber = account?.accountNumber ?? decouvert.savingsAccountId ?? '–';

    const printDate = new Date().toLocaleString('fr-BI');

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#222', padding: '20px', maxWidth: '750px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '2px solid #2c3e50', paddingBottom: '12px', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '18px' }}>REÇU DE DÉCOUVERT</h2>
                <h3 style={{ margin: '4px 0 0', color: '#2c3e50', fontSize: '15px' }}>Avance sur Épargne</h3>
                {decouvert.branch && (
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>
                        Agence : {(decouvert.branch as any).name ?? ''}
                    </p>
                )}
            </div>

            {/* Reference & Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                    <strong>N° Demande :</strong> {decouvert.requestNumber}<br />
                    <strong>Date de demande :</strong> {decouvert.requestDate}<br />
                    <strong>Référence comptable :</strong> {decouvert.pieceId ?? '–'}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <strong>Statut :</strong>{' '}
                    <span style={{
                        padding: '3px 10px', borderRadius: '4px',
                        background: decouvert.status === 'DISBURSED' ? '#27ae60' : decouvert.status === 'REJECTED' ? '#e74c3c' : '#f39c12',
                        color: '#fff', fontWeight: 'bold', fontSize: '12px'
                    }}>
                        {STATUS_LABELS[decouvert.status ?? 'PENDING']}
                    </span>
                </div>
            </div>

            {/* Client info */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <tbody>
                    <tr style={{ background: '#f0f4f8' }}>
                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold', width: '40%' }}>Titulaire du Compte</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{clientName}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>N° Compte</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{accountNumber}</td>
                    </tr>
                    <tr style={{ background: '#f0f4f8' }}>
                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Solde avant découvert</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{fmt(decouvert.balanceAtRequest)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Motif</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{decouvert.motif ?? '–'}</td>
                    </tr>
                </tbody>
            </table>

            {/* Amounts */}
            <h4 style={{ margin: '0 0 8px', color: '#2c3e50' }}>Détail du Découvert</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                    <tr style={{ background: '#2c3e50', color: '#fff' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Libellé</th>
                        <th style={{ padding: '8px', textAlign: 'right' }}>Montant</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>Montant découvert accordé</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right' }}>{fmt(decouvert.requestedAmount)}</td>
                    </tr>
                    <tr style={{ background: '#fff3cd' }}>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                            Intérêts ({decouvert.interestRate ?? 5}%)
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right', color: '#e74c3c', fontWeight: 'bold' }}>
                            {fmt(decouvert.interestAmount)}
                        </td>
                    </tr>
                    <tr style={{ background: '#e8f4fd', fontWeight: 'bold' }}>
                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>TOTAL DÉBITÉ DU COMPTE</td>
                        <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right', color: '#2980b9', fontSize: '15px' }}>
                            {fmt(decouvert.totalAmount)}
                        </td>
                    </tr>
                    {decouvert.balanceAfterDisbursement != null && (
                        <tr style={{ background: decouvert.balanceAfterDisbursement < 0 ? '#fdecea' : '#eafaf1', fontWeight: 'bold' }}>
                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>Solde après découvert</td>
                            <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'right',
                                color: decouvert.balanceAfterDisbursement < 0 ? '#e74c3c' : '#27ae60' }}>
                                {fmt(decouvert.balanceAfterDisbursement)}
                                {decouvert.balanceAfterDisbursement < 0 && ' ⚠ DÉBITEUR'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Approval workflow */}
            <h4 style={{ margin: '0 0 8px', color: '#2c3e50' }}>Traçabilité</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                <tbody>
                    {decouvert.userAction && (
                        <tr>
                            <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold', width: '40%' }}>Créé par</td>
                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{decouvert.userAction} — {decouvert.requestDate}</td>
                        </tr>
                    )}
                    {decouvert.verifiedBy && (
                        <tr style={{ background: '#f0f4f8' }}>
                            <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Vérifié par</td>
                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                                {decouvert.verifiedBy} — {decouvert.verifiedAt?.toString().substring(0, 16)}
                                {decouvert.verificationComments && <><br /><em>{decouvert.verificationComments}</em></>}
                            </td>
                        </tr>
                    )}
                    {decouvert.approvedBy && (
                        <tr>
                            <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Approuvé par</td>
                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                                {decouvert.approvedBy} — {decouvert.approvedAt?.toString().substring(0, 16)}
                                {decouvert.approvalComments && <><br /><em>{decouvert.approvalComments}</em></>}
                            </td>
                        </tr>
                    )}
                    {decouvert.disbursedBy && (
                        <tr style={{ background: '#eafaf1' }}>
                            <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Décaissé par</td>
                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>
                                {decouvert.disbursedBy} — {decouvert.disbursedAt?.toString().substring(0, 16)}
                            </td>
                        </tr>
                    )}
                    {decouvert.rejectionReason && (
                        <tr style={{ background: '#fdecea' }}>
                            <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>Motif rejet/annul.</td>
                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{decouvert.rejectionReason}</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                {[
                    'Signature du Client',
                    'Signature du Caissier',
                    'Visa du Directeur',
                ].map((label) => (
                    <div key={label} style={{ textAlign: 'center', width: '28%' }}>
                        <div style={{ borderBottom: '1px solid #333', height: '50px', marginBottom: '6px' }} />
                        <span style={{ fontSize: '11px' }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #ccc', paddingTop: '8px', textAlign: 'center', fontSize: '11px', color: '#777' }}>
                <em>
                    Le client s'engage à rembourser le montant du découvert (capital + intérêts) selon les conditions convenues.
                    Imprimé le {printDate}
                </em>
            </div>
        </div>
    );
}
