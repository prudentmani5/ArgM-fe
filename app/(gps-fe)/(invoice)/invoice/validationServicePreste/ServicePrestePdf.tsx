import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { FacServicePreste } from './FacServicePreste';

// Enregistrement des polices
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helvetica/v15/4iCv6KVjbNBYlgoCxCvTtw.ttf' }, // Regular
    { src: 'https://fonts.gstatic.com/s/helvetica/v15/4iCv6KVjbNBYlgoCxCvTtw.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 20,
    fontSize: 12,
    fontFamily: 'Helvetica'
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    borderLeft: '1px solid #000',
    borderRight: '1px solid #000'
  },
  label: {
    width: '60%',
    padding: 5,
    borderRight: '1px solid #000'
  },
  value: {
    width: '40%',
    padding: 5
  },
  espacement: {
    padding: '3px'
  },
  tableContainer: {
    marginTop: 10,
    border: '1px solid #000',
    width: '80%',
    alignSelf: 'center'
    ,fontSize: 9 
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #000'
  },
  headerCell: {
    padding: 5,
    fontWeight: 'bold',
    textAlign: 'center'
  },
   tvaEnLettres: {
        marginTop: 10,
        fontStyle: 'italic',
        textAlign: 'center'
    },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
     headerRight: {
        flex: 1,
        alignItems: 'flex-end'
    },
     boldText: {
        fontWeight: 'bold'
    },
  signature: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  }
});

const PdfLogo = () => (
    <View style={{ width: 110, height: 100, justifyContent: 'flex-end', backgroundColor: '#f0f0f0' }}>
        <Image
         src="/assets/images/logo.png"
         />     
    </View>
);



interface ServicePrestePdfProps {
  service: FacServicePreste;
  services: FacServicePreste[];
  exonere: boolean;
  redevance: boolean;
  isProforma?: boolean;
}

// Interface pour les nombres spéciaux
interface SpecialNumbers {
  [key: number]: string;
  11: string;
  12: string;
  13: string;
  14: string;
  15: string;
  16: string;
  17: string;
  18: string;
  19: string;
}

// Fonction pour convertir un nombre en lettres
const nombreEnLettres = (nombre: number): string => {
    if (nombre === 0) return 'zéro';
    
    const unite: string[] = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
    const dizaine: string[] = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];
    const specials: SpecialNumbers = {
        11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze', 15: 'quinze',
        16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf'
    };
    
    let resultat = '';
    let reste = Math.floor(nombre);
    
    // Milliards
    if (reste >= 1000000000) {
        const milliards = Math.floor(reste / 1000000000);
        resultat += nombreEnLettres(milliards) + ' milliard' + (milliards > 1 ? 's' : '') + ' ';
        reste %= 1000000000;
    }
    
    // Millions
    if (reste >= 1000000) {
        const millions = Math.floor(reste / 1000000);
        resultat += nombreEnLettres(millions) + ' million' + (millions > 1 ? 's' : '') + ' ';
        reste %= 1000000;
    }
    
    // Milliers
    if (reste >= 1000) {
        const milliers = Math.floor(reste / 1000);
        if (milliers === 1) {
            resultat += 'mille ';
        } else {
            resultat += nombreEnLettres(milliers) + ' mille ';
        }
        reste %= 1000;
    }
    
    // Centaines
    if (reste >= 100) {
        const centaines = Math.floor(reste / 100);
        if (centaines === 1) {
            resultat += 'cent ';
        } else {
            resultat += unite[centaines] + ' cent ';
        }
        reste %= 100;
    }
    
    // Dizaines et unités
    if (reste > 0) {
        if (specials[reste]) {
            resultat += specials[reste];
        } else {
            const d = Math.floor(reste / 10);
            const u = reste % 10;
            
            if (d > 0) {
                resultat += dizaine[d];
                if (u > 0) {
                    resultat += (d === 7 || d === 9) ? '-' + (u === 1 ? 'onze' : u === 2 ? 'douze' : u === 3 ? 'treize' : u === 4 ? 'quatorze' : u === 5 ? 'quinze' : u === 6 ? 'seize' : u === 7 ? 'dix-sept' : u === 8 ? 'dix-huit' : 'dix-neuf') : '-' + unite[u];
                }
            } else {
                resultat += unite[u];
            }
        }
    }
    
    return resultat.trim();
};

export const ServicePrestePdf = ({ service, services, exonere, redevance, isProforma = false }: ServicePrestePdfProps) => {
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'BIF',
      minimumFractionDigits: 0
    }).format(value).replace(/\s/g, ' ').replace(/BIF$/, ' BIF');
  };

  const formatUSD = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };


  // Calcul des totaux from database values
  const totalHT = services.reduce((sum, s) => sum + (s.montant || 0), 0);
  const totalTVA = services.reduce((sum, s) => sum + (s.montTaxe || 0) + (s.montRedevTaxe || 0), 0);
  const totalRedevance = services.reduce((sum, s) => sum + (s.montRedev || 0), 0);
  const totalTTC = services.reduce((sum, s) =>
    sum + (s.montant || 0) + (s.montRedev || 0) + (s.montTaxe || 0) + (s.montRedevTaxe || 0), 0);
  const totalMontantDevise = services.reduce((sum, s) => sum + (s.montantDevise || 0), 0);
  const tauxChange = services.length > 0 ? services[0].tauxChange : 0;

   const montTVAEnLettres = totalTTC
        ? nombreEnLettres(totalTTC) + ' francs burundais'
        : 'zéro franc burundais';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête avec informations vendeur/client */}
        <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start', fontSize: 9 }}>
          <View style={{ textAlign: 'left' }}>
            <Text style={styles.boldText}>A. IDENTIFICATION DU VENDEUR:</Text>
            <Text>RAISON SOCIALE: Global PORT SERVICE BURUNDI</Text>
            <Text>NIF: 4000155053</Text>
            <Text>ADRESSE: Avenue de la Tanzanie</Text>
            <Text>BP: 6440 Bujumbura</Text>
            <Text>TEL: 22216810</Text>
            <Text>ASSUJETTI TVA: Oui</Text>
            <Text>CENTRE FISCALE: DGC</Text>
            <Text>SECTEUR ACTIVITE: Autres services marchands</Text>
            <Text>FORME JURIDIQUE: Société mixte</Text>
            <View style={styles.espacement}></View>
            <Text style={styles.boldText}>B. IDENTIFICATION DU CLIENT:</Text>
            <Text>RAISON SOCIALE: {service.nomImportateur || '-'}</Text>
            <Text>NIF: [NIF CLIENT]</Text>
            <Text>ADRESSE: [ADRESSE CLIENT]</Text>
            <Text>Assujetti TVA: {exonere ? 'Non' : 'Oui'}</Text>
          </View>
            <View style={styles.headerRight}>
                                  <PdfLogo />
                              </View>

        </View>

        <View style={styles.espacement}></View>
        <View style={styles.espacement}></View>
        <View style={styles.espacement}></View>

        {/* Titre de la facture */}
        <View style={{ textAlign: 'center' }}>
          <Text style={styles.title}>
            {isProforma ? 'FACTURE PROFORMA' : 'FACTURE DE SERVICES PRESTES'} N° {service.numFacture} le {formatDate(service.date) || new Date().toLocaleDateString('fr-FR')}
          </Text>
          <Text>Du {formatDate(service.dateDebut) || new Date().toLocaleDateString('fr-FR')} AU {formatDate(service.dateFin) || new Date().toLocaleDateString('fr-FR')}</Text>
          <Text>________________________________________________________________</Text>
        </View>

        <View style={styles.espacement}></View>

        {/* Tableau des informations de base */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.headerCell, width: '100%' }}>Informations sur le service</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Lettre de Transport:</Text>
            <Text style={styles.value}>{service.lettreTransp || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type Véhicule:</Text>
            <Text style={styles.value}>{service.typeVehicule || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Plaque:</Text>
            <Text style={styles.value}>{service.plaque || '-'}</Text>
          </View>
        </View>

        <View style={styles.espacement}></View>

        {/* Tableau des services */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.headerCell, width: '100%' }}>Détail des services</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={{ ...styles.headerCell, width: '60%' }}>Désignation</Text>
            <Text style={{ ...styles.headerCell, width: '40%' }}>Montant</Text>
          </View>

          {services.map((s, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.label}>{s.nomService}:</Text>
              <Text style={styles.value}>{formatCurrency(s.montant)}</Text>
            </View>
          ))}

          {totalRedevance > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Redevance Informatique:</Text>
              <Text style={styles.value}>{formatCurrency(totalRedevance)}</Text>
            </View>
          )}

          <View style={styles.tableHeader}>
            <Text style={{ ...styles.headerCell, width: '60%' }}>Total HTVA:</Text>
            <Text style={{ ...styles.value, fontWeight: 'bold' }}>{formatCurrency(totalHT + totalRedevance)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>TVA (18%):</Text>
            <Text style={styles.value}>{formatCurrency(totalTVA)}</Text>
          </View>

          <View style={styles.tableHeader}>
            <Text style={{ ...styles.headerCell, width: '60%' }}>Total TTC:</Text>
            <Text style={{ ...styles.value, fontWeight: 'bold' }}>{formatCurrency(totalTTC)}</Text>
          </View>

          {totalMontantDevise > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Mont. Dev.:</Text>
              <Text style={styles.value}>{formatUSD(totalMontantDevise)}</Text>
            </View>
          )}

          {tauxChange > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>Taux de change:</Text>
              <Text style={styles.value}>{tauxChange.toFixed(2)}</Text>
            </View>
          )}
        </View>

                         <View style={styles.row}>
                                <Text style={styles.label}>Montant Devise</Text>
                                <Text style={styles.value}>{formatCurrency(service.montantDevise)}</Text>
                            </View>

        <View style={styles.espacement}></View>
           <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' ,alignContent:'center'}}>
                            <View style={{ textAlign: 'center',fontSize: 9 }}>
                                 {/* Texte TVA en lettres */}
                            <View style={styles.tvaEnLettres}>
                                <Text>Nous disons: {montTVAEnLettres}</Text>
                            </View>
        
                                
                            </View>
                        </View>
        <View style={styles.espacement}></View>
        {/* Signature */}
     <View style={{ marginTop: 10, flexDirection: 'row', justifyContent: 'flex-start' }}>
                         <View style={{ textAlign: 'center',fontSize: 9 }}>

                             <Text>_______________________________________________________________________________________</Text>
                             <Text>Cpte BGF no 1502257311BIF, Cpte Bancobu no O2198120102619BIF,cpte Bancobu no 02198120201-68USB,</Text>
                             <Text>Cpte IBB no 701-087330-01-01BIF, Cpte BCB no 20073950009BIF, cpte BCB no 20073950012USD,</Text>
                             <Text>Cpte Finbank no 10031455011BIF, Cpte Finbank no 10031455012USD,</Text>


                         </View>
                     </View>

        {/* Signature électronique OBR */}
        {service.factureSignature && (
          <View style={{ marginTop: 20, textAlign: 'center', fontSize: 8 }}>
            <Text style={{ fontWeight: 'bold' }}>Signature Électronique OBR:</Text>
            <Text style={{ marginTop: 5 }}>{service.factureSignature}</Text>
          </View>
        )}
                 </Page>
             </Document>
  );
};