'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ValidInvoice, InvoiceValidationRequest } from './ValidInvoice';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ValidPdf } from './ValidPdf';
import { Image as PdfImage } from '@react-pdf/renderer';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function ValidInvoiceForm() {
    const [invoice, setInvoice] = useState<ValidInvoice>({
        factureSortieId: null,
        sortieId: '',
        numFacture: '',
        rsp: '',
        lt: '',
        montTotalManut: null,
        montTVA: null,
        montantPaye: null,
        dateSortie: null,
        nomClient: '',
        nomMarchandise: '',
        declarant: '',
        isValid: 0,
        dateValidation: null,
        userValidation: 'SYSTEM',
        manutBateau: null,
        manutCamion: 0,
        surtaxeColisLourd: 0,
        montSalissage: 0,
        montArrimage: 0,
        montRedev: 0,
        montPalette: 0,
        montPesMag: 0,
        montLais: 0,
        peage: 0,
        montEtiquette: 0,
        montFixationPlaque: 0,
        montMagasinage: 0,
        montGardienage: 0,
        montFixeTVA: 0,
        dateAnnulation: null,
        userAnnulation: ''

    });

    const [invoiceDetails, setInvoiceDetails] = useState<ValidInvoice | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const toast = useRef<Toast>(null);
    // 1. Ajoutez ces nouveaux états en haut de votre composant
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const { data, loading, error, fetchData } = useConsumApi('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice({ ...invoice, [e.target.name]: e.target.value });
    };

    const fetchInvoiceDetails = async () => {
        if (!invoice.sortieId || !invoice.rsp) {
            showToast('error', 'Erreur', 'Les champs sont obligatoires');
            return;
        }
        const encodedRSP = encodeURIComponent(invoice.rsp);
        const encodeFacture = encodeURIComponent(invoice.sortieId);

        try {
            // Récupération des détails principaux de la facture
            const mainResponse = await fetch(buildApiUrl(`/invoices/findBySortieIdAndRsp?rsp=${encodedRSP}&sortieId=${encodeFacture}`));
            const mainData = await mainResponse.json();

            // Récupération du nom de la marchandise
            const marchandiseResponse = await fetch(buildApiUrl(`/invoices/findNomMarchandise?rsp=${encodedRSP}&sortieId=${encodeFacture}`));
            const marchandiseName = await marchandiseResponse.text();

            // Récupération du nom du client
            const clientResponse = await fetch(buildApiUrl(`/invoices/findNomClient?rsp=${encodedRSP}&sortieId=${encodeFacture}`));
            const clientName = await clientResponse.text();

            // Mise à jour des données avec les noms récupérés
            if (mainData) {
                const updatedDetails = {
                    ...mainData,
                    nomMarchandise: marchandiseName || mainData.nomMarchandise || '-',
                    nomClient: clientName || mainData.nomClient || '-'
                };

                setInvoiceDetails(updatedDetails);
                setShowPreview(true);
            } else {
                showToast('error', 'Erreur', 'Aucune facture trouvée ou la facture a été validé');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur de récupération');
        }
    };

    const validateInvoice = async () => {
        if (!invoiceDetails) return;

        const validationRequest = new InvoiceValidationRequest(
            invoiceDetails.sortieId,
            invoiceDetails.rsp,
            true
        );

        const encodedRSP = encodeURIComponent(invoice.rsp);
        const encodeFacture = encodeURIComponent(invoice.sortieId);
        const dataValid = new Date();

        try {
            await fetchData(
                validationRequest,
                'PUT',
                //`${baseUrl}/invoices/validate?rsp=${encodedRSP}&sortieId=${encodeFacture}`,

                `${baseUrl}/invoices/validate/${invoiceDetails.factureSortieId}`,
                'validateInvoice'
            );
            showToast('success', 'Succès', 'Facture validée avec succès');
            setInvoiceDetails({
                ...invoiceDetails,
                isValid: 1,
                dateValidation: new Date()
            });
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur lors de la validation');
        }
    };


    // 2. Ajoutez cette fonction pour gérer l'annulation
    const cancelInvoice = async () => {
        if (!invoiceDetails || !cancelReason.trim()) {
            showToast('error', 'Erreur', 'Veuillez spécifier un motif d\'annulation');
            return;
        }

        setIsCancelling(true);

        try {
            const response = await fetch(buildApiUrl(`/invoices/validate/${invoiceDetails.factureSortieId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sortieId: invoiceDetails.sortieId,
                    rsp: invoiceDetails.rsp,
                    dateValidation: invoiceDetails.dateValidation,
                    motifAnnulation: cancelReason,
                    cancelledBy: 'SYSTEM' // ou l'utilisateur connecté
                })
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Facture annulée avec succès');
                setInvoiceDetails({
                    ...invoiceDetails,
                    isValid: -1, // ou tout autre statut indiquant l'annulation
                    dateValidation: new Date() // ou dateAnnulation si vous avez ce champ
                });
                setShowCancelDialog(false);
                setCancelReason('');
            } else {
                throw new Error('Erreur lors de l\'annulation');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Échec de l\'annulation de la facture');
        } finally {
            setIsCancelling(false);
        }
    };


    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const formatCurrency = (value: number | null) => {
        return value?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' }) || '';
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="sortieId">Numéro de Facture</label>
                    <InputText
                        id="sortieId"
                        name="sortieId"
                        value={invoice.sortieId}
                        onChange={handleChange}
                        placeholder="Entrez le numéro de facture"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="rsp">RSP</label>
                    <InputText
                        id="rsp"
                        name="rsp"
                        value={invoice.rsp}
                        onChange={handleChange}
                        placeholder="Entrez le RSP"
                    />
                </div>

                <div className="field col-12 flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Vérifier Facture"
                        icon="pi pi-search"
                        onClick={fetchInvoiceDetails}
                    />

                </div>
            </div>

            {/* Dialog pour afficher les détails de la facture */}
            <Dialog
                header="Détails de la Facture"
                visible={showPreview}
                style={{ width: '70vw' }}
                modal
                onHide={() => setShowPreview(false)}
                footer={
                    <div>
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            onClick={() => setShowPreview(false)}
                            className="p-button-text"
                            severity="secondary"
                        />
                        <Button
                            label="Valider"
                            icon="pi pi-check"
                            onClick={validateInvoice}
                            className="p-button-success"
                            severity="secondary"
                            disabled={invoiceDetails?.dateValidation !== null}
                        />
                        <Button
                            label="Annuler Facture"
                            icon="pi pi-ban"
                            onClick={() => setShowCancelDialog(true)}
                            className="p-button-danger"
                            severity="secondary"
                            //disabled={invoiceDetails?.dateValidation == null}
                            disabled={invoiceDetails?.dateValidation == null || invoiceDetails?.dateAnnulation !== null}
                        // Désactivé si déjà validée/annulée
                        />
                        <Button
                            label="PDF"
                            icon="pi pi-file-pdf"
                            onClick={() => setShowPdfPreview(true)}
                            className="p-button-help"
                            severity="secondary"
                        />
                    </div>
                }
            >


                {invoiceDetails && (
                    <div className="service-details-grid">
                        <Card className="info-card">
                            <div className="card-header">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>Informations Générales</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Numéro Facture</label>
                                    <div className="detail-value">{invoiceDetails.sortieId}</div>
                                </div>
                                <div className="detail-item">
                                    <label>RSP</label>
                                    <div className="detail-value">{invoiceDetails.rsp}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Lettre de Transport</label>
                                    <div className="detail-value">{invoiceDetails.lt || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Client</label>
                                    <div className="detail-value">{invoiceDetails.nomClient || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Marchandise</label>
                                    <div className="detail-value">{invoiceDetails.nomMarchandise || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Déclarant</label>
                                    <div className="detail-value">{invoiceDetails.declarant || '-'}</div>
                                </div>
                            </div>
                        </Card>

                        <Card className="manutention-card">
                            <div className="card-header">
                                <i className="pi pi-box mr-2"></i>
                                <span>Détails de Manutention</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>Manutention Camion</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.manutCamion)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Manutention Bateau</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.manutBateau)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Surtaxe colis lourd</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.surtaxeColisLourd)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Surtaxe volume</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.surtaxeColisLourd)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Salissage</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montSalissage)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Arimage</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montSalissage)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Redevance Informatique</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montRedev)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Pese Magasin</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montPesMag)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Etiquette</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montEtiquette)}</div>
                                    </div>
                                    <div className="detail-item">
                                        <label>Palette</label>
                                        <div className="detail-value">{formatCurrency(invoiceDetails.montPalette)}</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="montants-card">
                            <div className="card-header">
                                <i className="pi pi-money-bill mr-2"></i>
                                <span>Montant total</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Magasinage</label>
                                    <div className="detail-value">{formatCurrency(invoiceDetails.montMagasinage)}</div>
                                </div>

                                 <div className="detail-item">
                                    <label>Gardienage</label>
                                    <div className="detail-value">{formatCurrency(invoiceDetails.montGardienage)}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Total Manutention</label>
                                    <div className="detail-value">{formatCurrency(invoiceDetails.montTotalManut)}</div>
                                </div>
                                <div className="detail-item">
                                    <label>TVA</label>
                                    <div className="detail-value">{formatCurrency(invoiceDetails.montTVA)}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Montant Payé</label>
                                    <div className="detail-value">{formatCurrency(invoiceDetails.montantPaye)}</div>
                                </div>

                                <Divider />

                                <div className="status-item">
                                    <label>Statut</label>
                                    <div className="status-value">
                                        <Tag
                                            severity={invoiceDetails.isValid ? 'success' : 'danger'}
                                            value={invoiceDetails.dateValidation ? 'Validée' : 'Non validée'}
                                        />
                                    </div>
                                </div>

                                {invoiceDetails.dateValidation && (
                                    <div className="detail-item">
                                        <label>Date Validation</label>
                                        <div className="detail-value">
                                            {new Date(invoiceDetails.dateValidation).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {invoiceDetails.dateAnnulation && (
                                    <div className="detail-item">
                                        <label>Annulé le</label>
                                        <div className="detail-value">
                                            {new Date(invoiceDetails.dateAnnulation).toLocaleString()} par {invoiceDetails.userAnnulation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </Dialog>
            <Dialog
                header="Annulation de Facture"
                visible={showCancelDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                }}
                footer={
                    <div className="dialog-footer">
                        <Button
                            label="Non"
                            icon="pi pi-times"
                            onClick={() => {
                                setShowCancelDialog(false);
                                setCancelReason('');
                            }}
                            className="p-button-text"
                        />
                        <Button
                            label="Oui, Annuler"
                            icon="pi pi-check"
                            onClick={cancelInvoice}
                            className="p-button-danger"
                            loading={isCancelling}
                            disabled={!cancelReason.trim()}
                        />
                    </div>
                }
            >
                <div className="p-fluid">
                    <div className="field">
                        <label htmlFor="cancelReason">Motif d'annulation</label>
                        <InputText
                            id="cancelReason"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Veuillez spécifier le motif d'annulation"
                            required
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                header="Prévisualisation PDF"
                visible={showPdfPreview}
                style={{ width: '80vw', height: '90vh' }}
                modal
                onHide={() => setShowPdfPreview(false)}
                footer={
                    <div className="dialog-footer">
                        <PDFDownloadLink
                            document={<ValidPdf invoice={invoiceDetails} />}
                            fileName={`validation_${invoiceDetails?.sortieId}.pdf`}
                        >
                            {({ loading }) => (
                                <Button
                                    label={loading ? 'Chargement...' : 'Télécharger PDF'}
                                    icon="pi pi-download"
                                    disabled={loading}
                                />
                            )}
                        </PDFDownloadLink>
                    </div>
                }
            >
                {invoiceDetails && (
                    <PDFViewer width="100%" height="500px">
                        <ValidPdf invoice={invoiceDetails} />
                    </PDFViewer>
                )}
            </Dialog>
            <style jsx>{`
                .dialog-header {
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .dialog-header h2 {
                    margin: 0 0 1rem 0;
                    color: #1e293b;
                    font-size: 1.5rem;
                }
                
                .tax-options {
                    display: flex;
                    gap: 2rem;
                    padding: 0.5rem 0;
                }
                    .exonere-amount {
    font-weight: 600;
    color: #6b7280; /* Gris */
    font-style: italic;
}
                
                .service-details-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .info-card, .montants-card, .status-card {
                    height: 100%;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                }
                
                .card-header {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f8fafc;
                    font-weight: 600;
                    color: #334155;
                }
                .total-amount {
    font-weight: 700;
    color: #1e40af; /* Bleu foncé */
}

.division-amount {
    font-weight: 700;
    color: #dc2626; /* Rouge */
    border-top: 1px dashed #64748b;
}

.grand-total-amount {
    font-weight: 800;
    color: #047857; /* Vert foncé */
    border-top: 2px solid #064e3b;
    padding-top: 0.5rem;
    font-size: 1.1em;
}
                .card-content {
                    padding: 1rem;
                }
                
                .detail-item {
                    margin-bottom: 1rem;
                }
                
                .detail-item label {
                    display: block;
                    font-size: 0.875rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }
                
                .detail-value {
                    font-weight: 500;
                    color: #1e293b;
                }
                
                .status-item {
                    margin-bottom: 1.5rem;
                }
                
                .total-amount {
                    font-weight: 700;
                    color: #1e40af;
                }
                    .total-amount {
    font-weight: 700;
    color: #1e40af; /* Bleu foncé */
}

.division-amount {
    font-weight: 700;
    color: #dc2626; /* Rouge */
    border-top: 1px dashed #64748b;
    padding-top: 0.5rem;
}
                
                .dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.5rem;
                    padding: 1rem 0;
                    border-top: 1px solid #e5e7eb;
                }
                    .font-bold {
    font-weight: 700;
}
.text-primary {
    color: #3B82F6; /* ou votre couleur primaire */
}
                
                @media (max-width: 992px) {
                    .service-details-grid {
                        grid-template-columns: 1fr;
                    }
                }
                    
            `}</style>
        </div>
    );
}