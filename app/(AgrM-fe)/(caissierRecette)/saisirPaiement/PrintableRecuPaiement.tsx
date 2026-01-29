'use client';

import React, { useEffect, useState } from 'react';
import { EntryPayement, Bank, CompteBanque } from './entryPayement';
import moment from 'moment';

interface PrintableRecuPaiementProps {
    entryPayement: EntryPayement;
    bank?: Bank;
    bankAccount?: CompteBanque;
    paymentModeLabel: string;
}

const PrintableRecuPaiement = React.forwardRef<HTMLDivElement, PrintableRecuPaiementProps>(
    ({ entryPayement, bank, bankAccount, paymentModeLabel }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';
        const [currentDate, setCurrentDate] = useState<string>('');

        useEffect(() => {
            // Set current date on client side only to avoid hydration mismatch
            setCurrentDate(moment().format('DD-MM-YYYY HH:mm:ss'));
        }, []);

        const formatDate = (date: Date | null) => {
            return date ? moment(date).format('DD-MM-YYYY HH:mm') : '';
        };

        const formatNumber = (value: number | null) => {
            const num = value || 0;
            // Get the first decimal digit (tenths place)
            const decimalPart = num - Math.floor(num);
            const firstDecimal = Math.floor(decimalPart * 10);

            // Round UP only if first decimal is non-zero, otherwise truncate
            const rounded = firstDecimal > 0 ? Math.ceil(num) : Math.floor(num);
            return new Intl.NumberFormat('fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(rounded);
        };

        return (
            <div
                ref={ref}
                style={{
                    width: '74mm',        // A7 width - CRITICAL FOR E-POS
                    minHeight: '105mm',   // A7 height - CRITICAL FOR E-POS
                    padding: '5mm',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px',     // Increased for better visibility
                    lineHeight: '1.4',
                    color: '#000',
                    backgroundColor: '#fff'
                }}
            >
                {/* Logo centered at top */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <img
                        src={logoUrl}
                        alt="GPS Logo"
                        style={{
                            width: '40px',
                            height: 'auto',
                            display: 'inline-block'
                        }}
                    />
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h1
                        style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}
                    >
                        REÇU DE PAIEMENT
                    </h1>
                    <h2
                        style={{
                            fontSize: '12px',
                            fontWeight: 'bold',
                            margin: '0'
                        }}
                    >
                        Global Port Service
                    </h2>
                </div>

                {/* Payment Information */}
                <div style={{ marginBottom: '3px' }}>
                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '11px' }}>N° Facture:</span>
                        <span style={{ fontSize: '11px' }}>{entryPayement.factureId || 'N/A'}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '11px' }}>Client:</span>
                        <span style={{ fontSize: '10px' }}>{entryPayement.clientNom || 'N/A'}</span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginBottom: '3px',
                            padding: '4px 0',
                            borderTop: '2px solid #000',
                            borderBottom: '2px solid #000',
                            backgroundColor: '#f5f5f5'
                        }}
                    >
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '12px' }}>Montant Payé:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                            {formatNumber(entryPayement.montantPaye)} BIF
                        </span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '11px' }}>Mode Paiement:</span>
                        <span style={{ fontSize: '11px' }}>{paymentModeLabel}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '11px' }}>Date:</span>
                        <span style={{ fontSize: '10px' }}>
                            {formatDate(entryPayement.datePaiement)}
                        </span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '70px', fontSize: '11px' }}>Bordereau:</span>
                        <span style={{ fontSize: '11px' }}>{entryPayement.reference || 'N/A'}</span>
                    </div>
                </div>

                {/* Bank Information Section */}
                {(bank || bankAccount) && (
                    <div
                        style={{
                            marginTop: '6px',
                            marginBottom: '3px',
                            padding: '3mm',
                            border: '1px solid #000',
                            backgroundColor: '#f8f9fa'
                        }}
                    >
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: '11px',
                                marginBottom: '3px',
                                textAlign: 'center',
                                textDecoration: 'underline'
                            }}
                        >
                            INFOS BANCAIRES
                        </div>

                        {bank && (
                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 'bold', minWidth: '60px', fontSize: '10px' }}>Banque:</span>
                                <span style={{ fontSize: '10px' }}>{bank.libelleBanque || 'N/A'}</span>
                            </div>
                        )}

                        {bankAccount && (
                            <div style={{ display: 'flex', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 'bold', minWidth: '60px', fontSize: '10px' }}>N° Compte:</span>
                                <span style={{ fontSize: '10px' }}>{bankAccount.numeroCompte || 'N/A'}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Signature Section */}
                <div style={{ marginTop: '6px', fontSize: '9px', lineHeight: '1.1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ width: '48%', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>Client</div>
                            <div style={{ borderBottom: '1px solid #000', marginTop: '10px' }}></div>
                            <div style={{ fontSize: '8px', marginTop: '2px' }}>Signature</div>
                        </div>
                        <div style={{ width: '48%', textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>Caissier</div>
                            <div style={{ borderBottom: '1px solid #000', marginTop: '10px' }}></div>
                            <div style={{ fontSize: '8px', marginTop: '2px' }}>Signature</div>
                        </div>
                    </div>
                </div>

                {/* Footer - Printed by */}
                <div
                    style={{
                        marginTop: '4px',
                        paddingTop: '3px',
                        borderTop: '1px dashed #666',
                        fontSize: '9px'
                    }}
                >
                    <div style={{ display: 'flex', marginBottom: '1px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '50px' }}>Émis par:</span>
                        <span>{entryPayement.userCreation || 'Caissier'}</span>
                    </div>
                    <div style={{ display: 'flex' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '50px' }}>Le:</span>
                        <span>{currentDate}</span>
                    </div>
                </div>

                {/* Footer - Company Info */}
                <div
                    style={{
                        marginTop: '6px',
                        paddingTop: '4px',
                        borderTop: '2px solid #000',
                        textAlign: 'center',
                        fontSize: '9px',
                        lineHeight: '1.4'
                    }}
                >
                    <div>Merci pour votre confiance!</div>
                    <div style={{ marginTop: '2px' }}>Port de Bujumbura, Burundi</div>
                    <div>Tel: +257 22 22 68 10</div>
                    <div>www.gpsb.bi</div>
                </div>
            </div>
        );
    }
);

PrintableRecuPaiement.displayName = 'PrintableRecuPaiement';

export default PrintableRecuPaiement;
