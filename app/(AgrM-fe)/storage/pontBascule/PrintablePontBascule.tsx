'use client';

import React, { useEffect, useState } from 'react';
import { PontBascule } from './PontBascule';
import { useCurrentUser } from '../../../../hooks/fetchData/useCurrentUser';
import moment from 'moment';

interface PrintablePontBasculeProps {
    pontBascule: PontBascule;
    clientName?: string;
}

const PrintablePontBascule = React.forwardRef<HTMLDivElement, PrintablePontBasculeProps>(
    ({ pontBascule, clientName }, ref) => {
        const logoUrl = '/assets/images/gps_icon.png';
        const { user: appUser } = useCurrentUser();
        const [currentDate, setCurrentDate] = useState<string>('');

        useEffect(() => {
            // Set current date on client side only to avoid hydration mismatch
            setCurrentDate(moment().format('DD-MM-YYYY HH:mm:ss'));
        }, []);

        const formatDate = (date: Date | null) => {
            return date ? moment(date).format('DD-MM-YYYY HH:mm:ss') : '';
        };

        const formatNumber = (value: number | null) => {
            return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(value || 0);
        };

        return (
            <div
                ref={ref}
                style={{
                    width: '74mm', // A7 width
                    minHeight: '105mm', // A7 height
                    padding: '5mm',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '11px', // Increased from 9px for better visibility
                    lineHeight: '1.4', // Increased from 1.2 for better spacing
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
                            width: '40px', // Increased from 30px
                            height: 'auto',
                            display: 'inline-block'
                        }}
                    />
                </div>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h1
                        style={{
                            fontSize: '16px', // Increased from 14px
                            fontWeight: 'bold',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px' // Added for better readability
                        }}
                    >
                        FICHE PESAGE
                    </h1>
                    <h2
                        style={{
                            fontSize: '12px', // Increased from 10px
                            fontWeight: 'bold',
                            margin: '0'
                        }}
                    >
                        Global Port Services
                    </h2>
                </div>

                {/* Information Fields */}
                <div style={{ marginBottom: '3px' }}>
                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>N° Fiche:</span>
                        <span style={{ fontSize: '11px' }}>{pontBascule.numPBId || ''}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Plaque:</span>
                        <span style={{ fontSize: '11px' }}>{pontBascule.plaque || ''}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Date 1ère P:</span>
                        <span style={{ fontSize: '10px' }} suppressHydrationWarning>{formatDate(pontBascule.datePont1)}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Poids 1èreP:</span>
                        <span style={{ fontSize: '11px' }}>{formatNumber(pontBascule.poidsVide)} kg</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Date 2è Pes:</span>
                        <span style={{ fontSize: '10px' }} suppressHydrationWarning>
                            {pontBascule.datePont2 ? formatDate(pontBascule.datePont2) : '00:00:00'}
                        </span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Poids 2e Pes:</span>
                        <span style={{ fontSize: '11px' }}>{formatNumber(pontBascule.poidsCharge)} kg</span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginBottom: '3px',
                            padding: '4px 0', // Increased from 2px
                            borderTop: '2px solid #000', // Thicker border
                            borderBottom: '2px solid #000', // Thicker border
                            backgroundColor: '#f5f5f5' // Light background for emphasis
                        }}
                    >
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '12px' }}>Poids Net:</span>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}> {/* Increased from 10px */}
                            {formatNumber(pontBascule.poidsNet)} kg
                        </span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>NumDecl:</span>
                        <span style={{ fontSize: '11px' }}>{pontBascule.numDecl || ''}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Observation:</span>
                        <span style={{ fontSize: '10px' }}>{pontBascule.observation || ''}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Motif:</span>
                        <span style={{ fontSize: '11px' }}>{pontBascule.gardienage || ''}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>Client:</span>
                        <span style={{ fontSize: '10px' }}>
                            {clientName || pontBascule.clientId || ''}
                        </span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>NbrePalette:</span>
                        <span style={{ fontSize: '11px' }}>{pontBascule.nbrePalette || 0}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '11px' }}>MontantPalette:</span>
                        <span style={{ fontSize: '11px' }}>{formatNumber(pontBascule.montantPalette)} BIF</span>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            marginBottom: '3px',
                            marginTop: '6px',
                            paddingTop: '4px',
                            borderTop: '1px dashed #666'
                        }}
                    >
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '10px' }}>Imprimé par:</span>
                        <span style={{ fontSize: '10px' }}>{appUser ? `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || 'Utilisateur' : 'Utilisateur'}</span>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', minWidth: '75px', fontSize: '10px' }}>Date:</span>
                        <span style={{ fontSize: '10px' }} suppressHydrationWarning>{currentDate}</span>
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        marginTop: '8px',
                        paddingTop: '5px',
                        borderTop: '2px solid #000', // Thicker border
                        textAlign: 'center',
                        fontSize: '9px', // Increased from 7px
                        lineHeight: '1.4'
                    }}
                >
                    <div>Port de Bujumbura, Burundi</div>
                    <div>Tel: +257 22 22 68 10</div>
                    <div>www.gpsb.bi</div>
                </div>
            </div>
        );
    }
);

PrintablePontBascule.displayName = 'PrintablePontBascule';

export default PrintablePontBascule;
