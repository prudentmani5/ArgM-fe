import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Requisition, RequisitionDetail } from './PanRequisitions';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20
    },
    section: {
        marginBottom: 10
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5
    },
    label: {
        width: '30%',
        fontWeight: 'bold'
    },
    value: {
        width: '70%'
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        paddingBottom: 5,
        marginBottom: 5
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: 3
    },
    col1: { width: '40%' },
    col2: { width: '20%' },
    col3: { width: '20%' },
    col4: { width: '20%' },
    totals: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#000'
    }
});

interface RequisitionPDFProps {
    requisition: Requisition;
    details: RequisitionDetail[];
}

export const RequisitionPDF = ({ requisition, details }: RequisitionPDFProps) => {
    const total = details.reduce((sum, d) => sum + (d.total || 0), 0);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text>VOTRE ENTREPRISE</Text>
                    <Text>FICHE DE RÉQUISITION N° {requisition.requisitionId}</Text>
                </View>

                <View style={styles.title}>
                    <Text>RÉQUISITION DE PIÈCES</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Matricule:</Text>
                        <Text style={styles.value}>{requisition.matricule}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>{new Date(requisition.date || '').toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Type:</Text>
                        <Text style={styles.value}>{requisition.typeRequisition}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Index:</Text>
                        <Text style={styles.value}>
                            {requisition.indexDepart} → {requisition.indexFin} (Diff: {requisition.diffIndex})
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>DÉTAILS DES PIÈCES:</Text>
                    
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Référence</Text>
                        <Text style={styles.col2}>Quantité</Text>
                        <Text style={styles.col3}>Prix Unitaire</Text>
                        <Text style={styles.col4}>Total</Text>
                    </View>

                    {details.map((detail, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>{detail.produitPieceId}</Text>
                            <Text style={styles.col2}>{detail.quantite}</Text>
                            <Text style={styles.col3}>{detail.prixUnitaire?.toFixed(2)} BIF</Text>
                            <Text style={styles.col4}>{detail.total?.toFixed(2)} BIF</Text>
                        </View>
                    ))}

                    <View style={[styles.tableRow, styles.totals]}>
                        <Text style={[styles.col1, { fontWeight: 'bold' }]}>TOTAL</Text>
                        <Text style={[styles.col2, { fontWeight: 'bold' }]}></Text>
                        <Text style={[styles.col3, { fontWeight: 'bold' }]}></Text>
                        <Text style={[styles.col4, { fontWeight: 'bold' }]}>{total.toFixed(2)} BIF</Text>
                    </View>
                </View>

                <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                        <Text>Signature demandeur</Text>
                        <Text>_________________________</Text>
                    </View>
                    <View>
                        <Text>Signature magasinier</Text>
                        <Text>_________________________</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};