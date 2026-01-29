// utils/printing/PrintableContent.tsx
import React, { useEffect, useState } from 'react';
import LogoArea from '../../../../utils/printing/LogoArea';
import TitleArea from '../../../../utils/printing/TitleArea ';
import DateTimeArea from '../../../../utils/printing/DocumentTime';
import MainContentArea from '../../../../utils/printing/MainContentArea';
import SeparatorArea from '../../../../utils/printing/SeparatorArea';
import FooterArea from '../../../../utils/printing/FooterArea';
import Cookies from 'js-cookie';

import { EnterRSP } from './EnterRSP';
import moment from 'moment';
import { AppUser } from '../../usermanagement/AppUser';

interface PrintableContentProps {
    enterRSP: EnterRSP;
    destinataireName: string;
    destinataireNif: string;
    typeConditionnementLibelle: string;
    entrepotLibelle: string
    emballageLibelle: string
    marchandiseNom: string; // Added marchandise name
}

const PrintableContent = React.forwardRef<HTMLDivElement, PrintableContentProps>(({ 
    enterRSP, 
    destinataireName, 
    destinataireNif, 
    typeConditionnementLibelle, 
    entrepotLibelle, 
    emballageLibelle,
    marchandiseNom 
}, ref) => {
    const logoUrl = '/assets/images/gps_icon.png'; // Adjust the path to your logo
    const [appUser, setAppUser] = useState<AppUser>(null);

    // Function to get cookie value


    useEffect(() => {
        const appUserCookie = Cookies.get('appUser');

        // If appUser is not null, parse it and set it to state
        if (appUserCookie) {
            try {
                const parsedUser = JSON.parse(appUserCookie);
                setAppUser(parsedUser);
            } catch (error) {
                console.error('Error parsing appUser cookie:', error);
            }
        }
    }, []);

    const formatDate = (date: Date | null) => date ? new Date(date).toLocaleString() : '';
    const formatCurrency = (amount: number | null) =>
        new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'FBU' }).format(amount || 0);
    const loadDestinataire = (destinataireId: number) => {

    }

    const mainContent = (
        <>
            <div className="grid" style={{
                padding: '14px',
                border: '3px solid #000' // Strong, solid black border
            }}>
                <div id='main1' className='col-12' style={{
                    boxSizing: 'border-box',
                    overflowX: 'auto',
                    border: '1px solid #000'
                }}>
                    <div className='grid'>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Lettre de transp.:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.noLettreTransport || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Plaque:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.plaque || 'N/A'}</h3>
                        </div>

                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Destinataire :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{destinataireName}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Nif:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{destinataireNif || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Transporteur:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.transporteur || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Nombre de Palettes:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.nbrePalette || '0'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Contenu:</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{marchandiseNom || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Poids manifestés :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.poids || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Emballage :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{emballageLibelle || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Conditionnement :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{typeConditionnementLibelle || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Nombre de Colis :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.nbreColis || '0'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Magasin :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{entrepotLibelle || 'N/A'}</h3>
                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>Nbre Etiquette :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.nbreEtiquette || '0'}</h3>
                        </div>

                    </div>
                </div>
                <div className='col-12' style={{
                    marginTop: "2px",
                    display: 'inline-block',
                    textAlign: 'center'
                }}>
                    <h5 style={{ fontSize: '12px', margin: '0' }}> CONSTATATIONS   :</h5>
                </div>
                <div className='col-12' style={{
                    border: '1px solid #000', // Strong, solid black border\
                }}>
                    <div className='grid'>

                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>1. Nbre de Colis intacts :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.observation || 'N/A'}</h3>
                        </div>
                        <div className='col-12'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>2. Nbre de Colis manquants ou avariés :</h3>
                        </div>
                        {/* <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.colisManquants || 'N/A'}</h3>
                        </div> */}
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>2.1 Nbre de Colis manquants  :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.colisManquants || 'N/A'}</h3>
                        </div>

                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>2.2 Nbre de Colis avariés  :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.colisAvaries || 'N/A'}</h3>
                        </div>

                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>* Inventaire et état du contenu  :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{' '}</h3>
                        </div>

                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>* Poids constaté  :</h3>
                        </div>
                        <div className='col-8'>
                            <h3 style={{ fontSize: '12px', margin: '0', lineHeight: '1.0' }}>{enterRSP.constatation || 'N/A'}</h3>
                        </div>
                    </div>
                </div>
                <div className='col-12' style={{
                    marginTop: '5px'
                }}>
                    <div className='grid'>
                        <div className='col-4'>

                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline' }}> Responsable Douane :</h3>
                            <h6 style={{ fontSize: '12px', marginTop: '10px' }}> Signature </h6>
                            <h6 style={{ fontSize: '12px', marginTop: '15px' }}> Nom et Prénom </h6>

                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline' }}>La partie prénante</h3>
                            <h6 style={{ fontSize: '12px', marginTop: '10px' }}>Chef de service</h6>
                            <h6 style={{ fontSize: '12px', marginTop: '10px' }}>Signature </h6>
                            <h6 style={{ fontSize: '12px', marginTop: '15px' }}>Nom et Prénom </h6>

                        </div>
                        <div className='col-4'>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline' }}>La partie cédante </h3>
                            <h5 style={{ fontSize: '12px', marginTop: '10px' }}>Signature </h5>
                            <h5 style={{ fontSize: '12px', marginTop: '15px' }}>{enterRSP.declarant} </h5>
                        </div>
                    </div>

                    <div className='grid' style={{
                    marginTop: '10px'
                }}>
                        <div className='col-4'>
                        </div>
                        <div className='col-6'>
                            <h3 style={{ fontSize: '12px', margin: '0', textDecoration: 'underline' }}>
                                Imprimé par : {appUser ? `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim() || 'Utilisateur' : 'Utilisateur'}
                            </h3>
                            <h6 style={{ fontSize: '12px', marginTop: '10px' }}>Signature</h6>
                        </div>
                        <div className='col-2'>
                        </div>
                    </div>

                </div>
            </div>
        </>

    );

    return (
        <div ref={ref} style={{ padding: '20px', fontFamily: 'Arial' }}>

            <DateTimeArea dateTime={new Date()} />
            <TitleArea logoUrl={logoUrl} title={`RECU SOUS PALAN N° : ${enterRSP.recuPalan}`} documentTime={`Du ${moment(enterRSP.dateEntree).format('DD/MM/YYYY HH:mm')}`} />
            <MainContentArea content={mainContent} />
            <SeparatorArea color="#E0E0E0" />
            {/* <FooterArea
                line1="Port de Bujumbura, 1 Avenue Tanzanie, Bujumbura, Burundi, PO Box 6440 Kinindo * Tel: +257 22 22 68 10"
                line2=". www.gpsb.bi . Compte: IBB701-8733001-37 . R.C85744 .NIF:4000155053"
            /> */}
        </div>
    );
});

PrintableContent.displayName = 'PrintableContent';

export default PrintableContent;