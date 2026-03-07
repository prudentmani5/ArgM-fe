'use client';
import React, { forwardRef } from 'react';
import { CheckbookOrder } from './CheckbookOrder';
import { getClientDisplayName } from '@/utils/clientUtils';

interface PrintableCheckbookReceiptProps {
    order: CheckbookOrder;
    companyName?: string;
    companyAddress?: string;
    companyPhone?: string;
}

const PrintableCheckbookReceipt = forwardRef<HTMLDivElement, PrintableCheckbookReceiptProps>(
    ({ order, companyName = "MICROFINANCE", companyAddress = "Bujumbura, Burundi", companyPhone = "+257 22 XX XX XX" }, ref) => {

        const formatCurrency = (value: number | undefined) => {
            if (value === undefined || value === null) return '0 FBU';
            return new Intl.NumberFormat('fr-BI', { style: 'decimal' }).format(value) + ' FBU';
        };

        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        };

        const getClientName = () => {
            return getClientDisplayName(order.client);
        };

        const getClientNumber = () => {
            return order.client?.clientNumber || '-';
        };

        const getBranchName = () => {
            return order.branch?.name || '-';
        };

        const getStatusLabel = () => {
            switch (order.status) {
                case 'PENDING': return 'En attente';
                case 'VALIDATED': return 'Validé';
                case 'RECEIVED': return 'Reçu';
                case 'DELIVERED': return 'Livré';
                case 'REJECTED': return 'Rejeté';
                case 'CANCELLED': return 'Annulé';
                default: return order.status;
            }
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
                                COMMANDE DE CARNET DE CHÈQUES
                            </h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '14px', fontWeight: 'bold' }}>
                                N° {order.orderNumber || '-'}
                            </p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#666' }}>
                                Statut: {getStatusLabel()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    {/* Client Info */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#f8fafc' }}>
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
                                    <td style={{ padding: '3px 0', color: '#666' }}>Agence:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{getBranchName()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Order Details */}
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '12px', backgroundColor: '#f8fafc' }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#1e3a8a', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            DÉTAILS DE LA COMMANDE
                        </h3>
                        <table style={{ width: '100%', fontSize: '11px' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666', width: '40%' }}>Date:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatDate(order.orderDate)}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Nombre de feuilles:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{order.numberOfLeaves}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '3px 0', color: '#666' }}>Prix du carnet:</td>
                                    <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(order.unitPrice)}</td>
                                </tr>
                                {(order.feeAmount !== undefined && order.feeAmount > 0) && (
                                    <tr>
                                        <td style={{ padding: '3px 0', color: '#666' }}>Commission:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#ea580c' }}>{formatCurrency(order.feeAmount)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Amount Summary */}
                <div style={{ border: '2px solid #1e3a8a', borderRadius: '5px', padding: '15px', marginBottom: '20px', backgroundColor: '#eff6ff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <table style={{ fontSize: '12px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Prix du carnet:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(order.unitPrice)}</td>
                                    </tr>
                                    {(order.feeAmount !== undefined && order.feeAmount > 0) && (
                                        <tr>
                                            <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Commission bancaire:</td>
                                            <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#ea580c' }}>{formatCurrency(order.feeAmount)}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde avant:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold' }}>{formatCurrency(order.balanceBefore)}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '3px 15px 3px 0', color: '#666' }}>Solde après:</td>
                                        <td style={{ padding: '3px 0', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(order.balanceAfter)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>MONTANT TOTAL DÉBITÉ</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#1e3a8a' }}>
                                {formatCurrency(order.totalAmount)}
                            </p>
                            {(order.feeAmount !== undefined && order.feeAmount > 0) && (
                                <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#666' }}>
                                    (dont commission: {formatCurrency(order.feeAmount)})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Motif */}
                {order.motif && (
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '20px', backgroundColor: '#fefce8', fontSize: '11px' }}>
                        <strong>Motif:</strong> {order.motif}
                    </div>
                )}

                {/* Delivery info */}
                {order.status === 'DELIVERED' && (
                    <div style={{ border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '20px', backgroundColor: '#f0fdf4', fontSize: '11px' }}>
                        <strong>Livré à:</strong> {order.deliveredToName || getClientName()} | <strong>Date:</strong> {formatDate(order.deliveredDate)} | <strong>Par:</strong> {order.deliveredBy || '-'}
                    </div>
                )}

                {/* Signatures */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px', paddingTop: '20px', borderTop: '1px dashed #ccc' }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Client</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{getClientName()}</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ margin: '0 0 40px 0', fontSize: '11px', color: '#666' }}>Signature du Caissier</p>
                        <div style={{ borderTop: '1px solid #333', width: '80%', margin: '0 auto' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', color: '#666' }}>{order.userAction || '-'}</p>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '9px', color: '#999' }}>
                    <p style={{ margin: 0 }}>
                        Ce document est un reçu officiel de commande de carnet de chèques. Veuillez le conserver précieusement.
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                        Imprimé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        );
    }
);

PrintableCheckbookReceipt.displayName = 'PrintableCheckbookReceipt';

export default PrintableCheckbookReceipt;
