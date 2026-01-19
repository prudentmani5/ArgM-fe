'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ValidRemorquage, RemorquageValidationRequest } from './ValidRemorquage';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { RemorquagePdf } from './RemorquagePdf';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { buildApiUrl } from '../../../../../utils/apiConfig';

export default function ValidRemorquageForm() {
    const [remorquage, setRemorquage] = useState<ValidRemorquage>({
        noRemorque: '',
        lettreTransp: '',
        bargeId: null,
        longeur: null,
        largeur: null,
        tirant: null,
        dateDebut: null,
        dateFin: null,
        montant: null,
        importateurId: null,
        manoeuvre: null,
        declarant: '',
        userCreation: '',
        dateCreation: null,
        valide1: null,
        valide2: null,
        userValide1: '',
        userValide2: '',
        userUpdate: '',
        dateUpdate: null,
        dossierId: '',
        modePayement: '',
        isValid: null,
        dateValidation: null,
        montantRedev: null,
        montTVA: null,
        nbreBateau: null,
        refAnnule: '',
        numeroOrdre: null,
        factureSignature: '',
        motifAnnulation: '',
        nomImportateur: '',
        nomBarge: '',
        dateAnnulation: null,
        userAnnulation: '',
        dateEnvoiOBR: null,
        statusEnvoiOBR: null,
        statusEnvoiCancelOBR: null,
        annuleFacture: 0
    });

    const [remorquageDetails, setRemorquageDetails] = useState<ValidRemorquage | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [showPdfProformatPreview, setShowPdfProformatPreview] = useState(false);
    const toast = useRef<Toast>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const { data, loading, error, fetchData } = useConsumApi('');

    // Use the useCurrentUser hook to get current user information
    const { user } = useCurrentUser();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemorquage({ ...remorquage, [e.target.name]: e.target.value });
    };

    const fetchRemorquageDetails = async () => {
        if (!remorquage.lettreTransp) {
            showToast('error', 'Erreur', 'Le numéro de Lettre de Transport est obligatoire');
            return;
        }

        const encodedLettreTransp = encodeURIComponent(remorquage.lettreTransp);

        try {
            // Récupération des détails principaux du remorquage
            const mainResponse = await fetch(buildApiUrl(`/remorquages/findByGPS?lettreTransp=${encodedLettreTransp}`));
            const mainData = await mainResponse.json();

            // Récupération du nom de l'importateur
            const importateurResponse = await fetch(buildApiUrl(`/remorquages/findNomImportateur?lettreTransp=${encodedLettreTransp}`));
            const importateurName = await importateurResponse.text();

            // Récupération du nom de la barge
            const bargeResponse = await fetch(buildApiUrl(`/remorquages/findNomBarge?lettreTransp=${encodedLettreTransp}`));
            const bargeName = await bargeResponse.text();

            // Mise à jour des données avec les noms récupérés
            if (mainData) {
                const updatedDetails = {
                    ...mainData,
                    nomImportateur: importateurName || mainData.nomImportateur || '-',
                    nomBarge: bargeName || mainData.nomBarge || '-'
                };

                setRemorquageDetails(updatedDetails);
                setShowPreview(true);
            } else {
                showToast('error', 'Erreur', 'Aucun remorquage trouvé ou déjà validé');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur de récupération');
        }
    };

    const validateRemorquage = async () => {
        if (!remorquageDetails) return;

        const validationRequest = {
            lettreTransp: remorquageDetails.lettreTransp,
            isValid: true
        };

        const encodedNoRemorque = encodeURIComponent(remorquageDetails.noRemorque);
        try {
            await fetchData(
                validationRequest,
                'PUT',
                buildApiUrl(`/remorquages/validate?id=${encodedNoRemorque}`),
                'validateRemorquage'
            );
            showToast('success', 'Succès', 'Remorquage validé avec succès');
            setRemorquageDetails({
                ...remorquageDetails,
                isValid: true,
                dateValidation: new Date(),
                userUpdate: user?.firstname || ''
            });
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur lors de la validation');
        }
    };

    const cancelRemorquage = async () => {
        if (!remorquageDetails || !cancelReason.trim()) {
            showToast('error', 'Erreur', 'Veuillez spécifier un motif d\'annulation');
            return;
        }

        setIsCancelling(true);
        const encodedNoRemorque = encodeURIComponent(remorquageDetails.noRemorque);

        try {
            const response = await fetch(buildApiUrl(`/remorquages/validate?id=${encodedNoRemorque}`),
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        lettreTransp: remorquageDetails.lettreTransp,
                        dateValidation: remorquageDetails.dateValidation,
                        isValid: true,
                        motifAnnulation: cancelReason,
                        userAnnulation: 'SYSTEM',
                        cancelledBy: 'SYSTEM'
                    })
                });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            showToast('success', 'Succès', 'Remorquage annulé avec succès');
            setRemorquageDetails({
                ...remorquageDetails,
                isValid: false,
                dateValidation: new Date(),
                motifAnnulation: cancelReason,
                userAnnulation: user?.firstname || ''
            });
            setShowCancelDialog(false);
            setCancelReason('');
        } catch (error) {
            console.error('Erreur lors de l\'annulation:', error);
            showToast('error', 'Erreur', 'Échec de l\'annulation du remorquage');
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

    const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
    } catch {
        return '-';
    }
};

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-6">
                    <label htmlFor="lettreTransp">Lettre de Transport</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={remorquage.lettreTransp}
                        onChange={handleChange}
                        placeholder="Entrez la Lettre de Transport"
                    />
                </div>

                <div className="field col-6 flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Vérifier Remorquage"
                        icon="pi pi-search"
                        onClick={fetchRemorquageDetails}
                    />
                </div>
            </div>

            <Dialog
                header="Détails du Remorquage"
                visible={showPreview}
                style={{ width: '70vw' }}
                modal
                onHide={() => setShowPreview(false)}
                footer={
                    <div>
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            onClick={() => setShowPreview(false)}
                            className="p-button-text"
                            severity="secondary"
                        />
                        <Button
                            label="Valider"
                            icon="pi pi-check"
                            onClick={validateRemorquage}
                            className="p-button-success"
                            severity="secondary"
                            disabled={remorquageDetails?.dateValidation !== null}
                        />
                        <Button
                            label="Imprimer Proformat"
                            icon="pi pi-print"
                            onClick={() => setShowPdfProformatPreview(true)}
                            className="p-button-warning"
                            severity="secondary"
                            disabled={remorquageDetails?.dateValidation !== null}
                        />
                        <Button
                            label="Annuler la facture Remorquage"
                            icon="pi pi-ban"
                            onClick={() => setShowCancelDialog(true)}
                            className="p-button-danger"
                            severity="secondary"
                            disabled={remorquageDetails?.dateAnnulation !== null || remorquageDetails?.dateValidation === null}
                        />
                        <Button
                            label="PDF"
                            icon="pi pi-file-pdf"
                            onClick={() => setShowPdfPreview(true)}
                            className="p-button-help"
                            severity="secondary"
                             disabled={remorquageDetails?.dateAnnulation !== null||remorquageDetails?.dateValidation == null}
                  
                        />
                    </div>
                }
            >
                {remorquageDetails && (
                    <div className="service-details-grid">
                        <Card className="info-card">
                            <div className="card-header">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>Informations Générales</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Numéro Remorquage</label>
                                    <div className="detail-value">{remorquageDetails.noRemorque}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Lettre de Transport</label>
                                    <div className="detail-value">{remorquageDetails.lettreTransp || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Importateur</label>
                                    <div className="detail-value">{remorquageDetails.nomImportateur || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Barge</label>
                                    <div className="detail-value">{remorquageDetails.nomBarge || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Déclarant</label>
                                    <div className="detail-value">{remorquageDetails.declarant || '-'}</div>
                                </div>
                            </div>
                        </Card>

                        <Card className="dates-card">
                            <div className="card-header">
                                <i className="pi pi-calendar mr-2"></i>
                                <span>Dates</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Date Début</label>
                                    <div className="detail-value">
                                        {remorquageDetails.dateDebut?.toLocaleString() || '-'}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Date Fin</label>
                                    <div className="detail-value">
                                        {remorquageDetails.dateFin?.toLocaleString() || '-'}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Date Création</label>
                                    <div className="detail-value">
                                        {remorquageDetails.dateCreation?.toLocaleString() || '-'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="montants-card">
                            <div className="card-header">
                                <i className="pi pi-money-bill mr-2"></i>
                                <span>Montants</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Montant</label>
                                    <div className="detail-value">
                                        {formatCurrency(remorquageDetails.montant)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Redevance</label>
                                    <div className="detail-value">
                                        {formatCurrency(remorquageDetails.montantRedev)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>TVA Redev</label>
                                    <div className="detail-value">
                                        {formatCurrency(remorquageDetails.montRedevTaxe)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>TVA</label>
                                    <div className="detail-value">
                                        {formatCurrency(remorquageDetails.montTVA)}
                                    </div>
                                </div>

                                <Divider />

                                <div className="detail-item">
                                    <label style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>TOTAL</label>
                                    <div className="detail-value" style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2196F3' }}>
                                        {formatCurrency(
                                            (remorquageDetails.montant || 0) +
                                            (remorquageDetails.montantRedev || 0) +
                                            (remorquageDetails.montRedevTaxe || 0) +
                                            (remorquageDetails.montTVA || 0)
                                        )}
                                    </div>
                                </div>

                                <Divider />

                                <div className="status-item">
                                    <label>Statut</label>
                                    <div className="status-value">
                                        <Tag
                                            severity={remorquageDetails.isValid ? 'success' : 'danger'}
                                            value={remorquageDetails.dateValidation ? 'Validée' : 'Non validée'}
                                        />
                                    </div>
                                </div>

                                {remorquageDetails.dateValidation && (
                                    <div className="detail-item">
                                        <label>Date Validation</label>
                                        <div className="detail-value">
                                            {new Date(remorquageDetails.dateValidation).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {remorquageDetails.dateAnnulation && (
                                    <>
                                        <div className="detail-item">
                                            <label>Annulé le</label>
                                            <div className="detail-value">
                                                {new Date(remorquageDetails.dateAnnulation).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label>Annulé par</label>
                                            <div className="detail-value">
                                                {remorquageDetails.userAnnulation || '-'}
                                            </div>
                                        </div>
                                    </>
                                )}

                                <Divider />

                                {/* OBR Status Information */}
                                <div className="obr-info mt-3">
                                    <div className="text-center mb-2">
                                        <span className="font-bold text-600">INFORMATIONS OBR</span>
                                    </div>

                                    {/* Status Envoi OBR */}
                                    <div className="detail-item">
                                        <label>Statut Envoi OBR</label>
                                        <div className="detail-value">
                                            <Tag
                                                value={remorquageDetails.statusEnvoiOBR === 1 ? 'Envoyée' : 'Non envoyée'}
                                                severity={remorquageDetails.statusEnvoiOBR === 1 ? 'success' : 'danger'}
                                                icon={remorquageDetails.statusEnvoiOBR === 1 ? 'pi pi-check' : 'pi pi-times'}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Envoi OBR */}
                                    {remorquageDetails.dateEnvoiOBR && (
                                        <div className="detail-item">
                                            <label>Date Envoi OBR</label>
                                            <div className="detail-value" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                                {new Date(remorquageDetails.dateEnvoiOBR).toLocaleString('fr-FR')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Envoi Cancel OBR */}
                                    {(remorquageDetails.annuleFacture === 1) && (
                                        <div className="detail-item">
                                            <label>Statut Annulation OBR</label>
                                            <div className="detail-value">
                                                <Tag
                                                    value={remorquageDetails.statusEnvoiCancelOBR === 1 ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                                    severity={remorquageDetails.statusEnvoiCancelOBR === 1 ? 'info' : 'warning'}
                                                    icon={remorquageDetails.statusEnvoiCancelOBR === 1 ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
                 </Dialog>
                <Dialog
                    header="Annulation de Remorquage"
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
                                onClick={cancelRemorquage}
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
                                document={<RemorquagePdf remorquage={remorquageDetails} />}
                                fileName={`validation_remorquage_${remorquageDetails?.noRemorque}.pdf`}
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
                    {remorquageDetails && (
                        <PDFViewer width="100%" height="500px">
                            <RemorquagePdf remorquage={remorquageDetails} />
                        </PDFViewer>
                    )}
                </Dialog>

                <Dialog
                    header="Prévisualisation Facture Proformat"
                    visible={showPdfProformatPreview}
                    style={{ width: '80vw', height: '90vh' }}
                    modal
                    onHide={() => setShowPdfProformatPreview(false)}
                    footer={
                        <div className="dialog-footer">
                            <PDFDownloadLink
                                document={<RemorquagePdf remorquage={remorquageDetails} isProforma={true} />}
                                fileName={`proforma_remorquage_${remorquageDetails?.noRemorque}.pdf`}
                            >
                                {({ loading }) => (
                                    <Button
                                        label={loading ? 'Chargement...' : 'Télécharger PDF Proformat'}
                                        icon="pi pi-download"
                                        disabled={loading}
                                    />
                                )}
                            </PDFDownloadLink>
                        </div>
                    }
                >
                    {remorquageDetails && (
                        <PDFViewer width="100%" height="500px">
                            <RemorquagePdf remorquage={remorquageDetails} isProforma={true} />
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