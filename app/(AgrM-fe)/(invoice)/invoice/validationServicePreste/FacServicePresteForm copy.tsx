'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEffect, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { FacServicePreste, ServicePresteValidationRequest } from './FacServicePreste';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Dialog } from 'primereact/dialog';
import { Checkbox } from 'primereact/checkbox';
import { TabViewTabChangeEvent } from 'primereact/tabview';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ServicePrestePdf } from './ServicePrestePdf';
import { buildApiUrl } from '../../../../../utils/apiConfig';
//import {FacServicePrestePdf } from './FacServicePrestePdf';

export default function FacServicePresteForm() {
    const [service, setService] = useState<FacServicePreste>({
        servicePresteId: null,
        numFacture: '',
        serviceId: null,
        importateurId: null,
        date: null,
        lettreTransp: '',
        montant: null,
        peage: null,
        pesage: null,
        taxe: null,
        montTaxe: null,
        montRedev: 0,
        montRedevTaxe: null,
        taux: null,
        montantDevise: null,
        pac: '',
        typeVehicule: '',
        plaque: '',
        pesageVide: null,
        redPalette: null,
        noCont: '',
        nbreCont: null,
        poids: null,
        dateDebut: null,
        dateFin: null,
        supplement: false,
        dateSupplement: null,
        declarant: '',
        valide1: false,
        valide2: false,
        userValide1: '',
        userValide2: '',
        userCreation: '',
        dateCreation: null,
        userUpdate: '',
        dateUpdate: null,
        facture: false,
        dossierId: '',
        modePayement: '',
        isValid: null,
        dateValidation: null,
        refAnnule: '',
        numeroOrdre: null,
        factureSignature: '',
        motifAnnulation: '',
        annuleFacture: null,
        dateAnnulation: null,
        signatureCrypt: '',
        dateEnvoiOBR: null,
        statusEnvoiOBR: '',
        userAnnulation: '',
        nomImportateur: '',
        nomService: ''
    });

    const [serviceDetails, setServiceDetails] = useState<FacServicePreste | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [services, setServices] = useState<FacServicePreste[]>([]);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [exonere, setExonere] = useState(false);
    const [redevance, setRedevance] = useState(false);
    const toast = useRef<Toast>(null);
    const { data, loading, error, fetchData } = useConsumApi('');
    const [printPreviewVisible, setPrintPreviewVisible] = useState(false);
    const [loadingNumFacture, setLoadingNumFacture] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setService({ ...service, [e.target.name]: e.target.value });
    };

    useEffect(() => {
        if (data && Array.isArray(data)) {
            setServices(data);
        }
    }, [data]);

    const fetchServiceDetails = async () => {
        if (!service.lettreTransp) {
            showToast('error', 'Erreur', 'Le champ lettreTransp est obligatoire');
            return;
        }

        try {
            const mainResponse = await fetch(buildApiUrl(`/servicepreste/findByFactureandLT?lettreTransp=${encodeURIComponent(service.lettreTransp)}`));
            const mainData = await mainResponse.json();

            const importateurResponse = await fetch(buildApiUrl(`/servicepreste/findNomImportateur?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`))
            const importateurName = await importateurResponse.text();

            const serviceResponse = await fetch(buildApiUrl(`/servicepreste/findNomService?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`))
            const bargeService = await serviceResponse.text();

            const servicesResponse = await fetch(buildApiUrl(`/servicepreste/findbyServiceMontant?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`));
            const servicesData = await servicesResponse.json();

            const formattedServices = Array.isArray(servicesData) ? servicesData : [servicesData];
            setServices(formattedServices);

            if (mainData) {
                const updatedDetails = {
                    ...mainData,
                    nomImportateur: importateurName || mainData.nomImportateur || '-',
                    nomService: bargeService || mainData.nomService || '-'
                };

                setServiceDetails(updatedDetails);
                setServices(servicesData);
                setExonere(mainData.taxe || false);
                setShowPreview(true);
            } else {
                showToast('error', 'Erreur', 'Aucun service trouvé ou déjà validé');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur de récupération');
        }
    };


 // Ajoutez cet useEffect après vos autres useEffect
useEffect(() => {
    const fetchNumFactureFromLettreTransp = async () => {
        if (service.lettreTransp && service.lettreTransp.length > 0) {
            try {
                const response = await fetch(buildApiUrl(`/servicepreste/findByNoFacture=${encodeURIComponent(service.lettreTransp)}`));
                
                if (response.ok) {
                    const numFacture = await response.text(); // ou response.json() selon ce que retourne votre API
                    
                    // Mettez à jour seulement si on a récupéré une valeur valide
                    if (numFacture && numFacture.trim() !== '') {
                        setService(prev => ({ 
                            ...prev, 
                            numFacture: numFacture.trim() 
                        }));
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du numéro de facture:', error);
                // Optionnel: afficher un toast d'erreur
                // showToast('error', 'Erreur', 'Impossible de récupérer le numéro de facture');
            }
        }
    };

    // Déclencher la recherche après un délai pour éviter trop d'appels
    const timeoutId = setTimeout(fetchNumFactureFromLettreTransp, 500);
    
    return () => clearTimeout(timeoutId);
}, [service.lettreTransp]); // Se déclenche quand lettreTransp change

// OU version plus simple sans délai :
useEffect(() => {
    const fetchNumFactureFromLettreTransp = async () => {
        if (service.lettreTransp && service.lettreTransp.length > 0) {
            try {
                const response = await fetch(buildApiUrl(`/servicepreste/findByNoFacture=${encodeURIComponent(service.lettreTransp)}`));
                
                if (response.ok) {
                    const numFacture = await response.text(); // Adaptez selon le type de retour
                    
                    if (numFacture && numFacture.trim() !== '') {
                        setService(prev => ({ 
                            ...prev, 
                            numFacture: numFacture.trim() 
                        }));
                    }
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du numéro de facture:', error);
            }
        }
    };

    fetchNumFactureFromLettreTransp();
}, [service.lettreTransp]);


    // Modification de la fonction servicesAvecRedv pour prendre en compte l'état de la redevance
    const servicesAvecRedv = serviceDetails
        ? [
            ...services,
            { nomService: 'Redevance Informatique', montant: redevance ? 23395  : 0 },

            {
                nomService: 'Total HTVA',
                montant: services.reduce((sum, service) => sum + (service.montant || 0), 0) +
                    (redevance ? (serviceDetails.montRedev || 0) : 0),
                isTotal: true
            },
            {
                nomService: 'Total TVA',
                montant: exonere
                    ? 0 // Si exonéré, la division par 5 est à 0
                    : (services.reduce((sum, service) => sum + (service.montant || 0), 0) +
                        (redevance ? (serviceDetails.montRedev || 0) : 0)
                    ) * 0.18 + 0.5,
                isDivision: true,
                isExonere: exonere // Ajout d'un flag pour le style
            },
            {
                nomService: 'Total TTC',
                montant: services.reduce((sum, service) => sum + (service.montant || 0), 0) +
                    (redevance ? (serviceDetails.montRedev || 0) : 0) +
                    (exonere
                        ? 0
                        : (services.reduce((sum, service) => sum + (service.montant || 0), 0) +
                            (redevance ? (serviceDetails.montRedev || 0) : 0)) / 5),
                isGrandTotal: true
            }
        ]
        : services;
    const validateService = async () => {
        if (!serviceDetails) return;

        const montRedevValue = redevance ? 23395 : 0;

        const validationRequest = new ServicePresteValidationRequest(
            serviceDetails.numFacture,
            serviceDetails.lettreTransp,
            true,
            exonere,
            montRedevValue
        );
        
        try {
            await fetchData(
                validationRequest,
                'PUT',
                buildApiUrl(`/servicepreste/validate/${serviceDetails.servicePresteId}`),
                'validateService'
            );
            showToast('success', 'Succès', 'Service validé avec succès');
            setServiceDetails({
                ...serviceDetails,
                isValid: true,
                dateValidation: new Date(),
                taxe: exonere,
                 montRedev: montRedevValue  // Mettre à jour la valeur dans le state
            });
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur lors de la validation');
        }
    };

    const cancelService = async () => {
        if (!serviceDetails || !cancelReason.trim()) {
            showToast('error', 'Erreur', 'Veuillez spécifier un motif d\'annulation');
            return;
        }

        setIsCancelling(true);

        try {
            const response = await fetch(buildApiUrl(`/servicepreste/validate/${serviceDetails.servicePresteId}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    numFacture: serviceDetails.numFacture,
                    lettreTransp: serviceDetails.lettreTransp,
                    dateValidation: serviceDetails.dateValidation,
                    motifAnnulation: cancelReason,                             
                    cancelledBy: 'SYSTEM'
                })
            });

            if (response.ok) {
                showToast('success', 'Succès', 'Service annulé avec succès');
                setServiceDetails({
                    ...serviceDetails,
                    isValid: false,
                    dateValidation: new Date()
                });
                setShowCancelDialog(false);
                setCancelReason('');
            } else {
                throw new Error('Erreur lors de l\'annulation');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Échec de l\'annulation du service');
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
    <label htmlFor="numFacture">
        Numéro de Facture 
        {loadingNumFacture && <i className="pi pi-spinner pi-spin ml-2" style={{ fontSize: '0.8rem' }} />}
    </label>
    <InputText
        id="numFacture"
        name="numFacture"
        value={service.numFacture}
        onChange={handleChange}
        placeholder={loadingNumFacture ? "Récupération..." : "Entrez le numéro de facture"}
        disabled={loadingNumFacture}
    />
</div>

                <div className="field col-6">
                    <label htmlFor="lettreTransp">Lettre de Transport</label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={service.lettreTransp}
                        onChange={handleChange}
                        placeholder="Entrez la lettre de transport"
                    />
                </div>

                <div className="field col-12 flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Vérifier Service"
                        icon="pi pi-search"
                        onClick={fetchServiceDetails}
                    />
                </div>
            </div>

            <Dialog
                header={
                    <div className="dialog-header">
                        <h2>Détails des Services prestés</h2>
                        <div className="tax-options">
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="exonere"
                                    checked={exonere}
                                    onChange={(e) => setExonere(e.checked || false)}
                                />
                                <label htmlFor="exonere" className="ml-2">Exonéré de taxe</label>
                            </div>
                            <div className="flex align-items-center">
                                <Checkbox
                                    inputId="redevance"
                                    checked={redevance}
                                    onChange={(e) => setRedevance(e.checked || false)}
                                />
                                <label htmlFor="redevance" className="ml-2">Redevance Informatique</label>
                            </div>
                        </div>
                    </div>
                }
                visible={showPreview}
                style={{ width: '75vw', maxWidth: '1200px' }}
                modal
                onHide={() => setShowPreview(false)}
                footer={
                    <div className="dialog-footer">
                        <Button
                            label="Annuler"
                            icon="pi pi-times"
                            onClick={() => setShowPreview(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Valider"
                            icon="pi pi-check"
                            onClick={validateService}
                            className="p-button-success"
                            disabled={serviceDetails?.dateValidation !== null}
                        />
                        <Button
  label="Imprimer"
  icon="pi pi-print"
  onClick={() => setPrintPreviewVisible(true)}
  className="p-button-help"
/>
                        <Button
                            label="Annuler Service"
                            icon="pi pi-ban"
                            onClick={() => setShowCancelDialog(true)}
                            className="p-button-danger"
                            disabled={serviceDetails?.dateValidation == null || serviceDetails?.dateAnnulation !== null}
                        />
                    </div>
                }
            >
                {serviceDetails && (
                    <div className="service-details-grid">
                        <Card className="info-card">
                            <div className="card-header">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>Informations Générales</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Numéro Facture</label>
                                    <div className="detail-value">{serviceDetails.numFacture}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Lettre de Transport</label>
                                    <div className="detail-value">{serviceDetails.lettreTransp || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Type Véhicule</label>
                                    <div className="detail-value">{serviceDetails.typeVehicule || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Plaque</label>
                                    <div className="detail-value">{serviceDetails.plaque || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Importateur</label>
                                    <div className="detail-value">{serviceDetails.nomImportateur || '-'}</div>
                                </div>

                            </div>
                        </Card>

                        <Card className="montants-card">
                            <div className="card-header">
                                <i className="pi pi-money-bill mr-2"></i>
                                <span>Montants des services</span>
                            </div>
                            <div className="card-content">
                                <DataTable
                                    value={servicesAvecRedv}
                                    size="small"
                                    stripedRows
                                >
                                    <Column
                                        field="nomService"
                                        header="Service"
                                        style={{ width: '60%' }}
                                    />
                                    <Column
                                        field="montant"
                                        header="Montant"
                                        body={(rowData) => (
                                            <span className={
                                                rowData.isTotal ? "total-amount" :
                                                    rowData.isDivision ? (rowData.isExonere ? "exonere-amount" : "division-amount") :
                                                        rowData.isGrandTotal ? "grand-total-amount" : ""
                                            }>
                                                {rowData.isExonere ? "Exonéré" : formatCurrency(rowData.montant)}
                                            </span>
                                        )}
                                        style={{ width: '40%', textAlign: 'right' }}
                                    />
                                </DataTable>
                            </div>
                        </Card>

                        <Card className="status-card">
                            <div className="card-header">
                                <i className="pi pi-clock mr-2"></i>
                                <span>Statut</span>
                            </div>
                            <div className="card-content">
                                <div className="status-item">
                                    <label>Validation</label>
                                    <div className="status-value">
                                        <Tag
                                            severity={serviceDetails.isValid ? 'success' : 'danger'}
                                            icon={serviceDetails.isValid ? "pi pi-check" : "pi pi-times"}
                                            value={serviceDetails.dateValidation ? 'Validé' : 'Non validé'}
                                        />
                                    </div>
                                </div>

                                {serviceDetails.dateValidation && (
                                    <div className="detail-item">
                                        <label>Date Validation</label>
                                        <div className="detail-value">
                                            {new Date(serviceDetails.dateValidation).toLocaleString()}
                                        </div>
                                    </div>
                                )}

                                {serviceDetails.dateAnnulation && (
                                    <>
                                        <div className="detail-item">
                                            <label>Annulé le</label>
                                            <div className="detail-value">
                                                {new Date(serviceDetails.dateAnnulation).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label>Motif</label>
                                            <div className="detail-value">
                                                {serviceDetails.motifAnnulation || '-'}
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label>Annulé par</label>
                                            <div className="detail-value">
                                                {serviceDetails.userAnnulation || '-'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </Dialog>

            <Dialog
                header="Annulation de facture"
                visible={showCancelDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                }}
                footer={
                    <div>
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
                            onClick={cancelService}
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

            {/* Dialog de prévisualisation PDF */}
<Dialog
  header={`Prévisualisation Facture ${serviceDetails?.numFacture || ''}`}
  visible={printPreviewVisible}
  style={{ width: '90vw', height: '90vh' }}
  modal
  onHide={() => setPrintPreviewVisible(false)}
  footer={
    <div>
      <Button
        label="Fermer"
        icon="pi pi-times"
        onClick={() => setPrintPreviewVisible(false)}
        className="p-button-text"
      />
      <PDFDownloadLink
        document={<ServicePrestePdf 
          service={serviceDetails!} 
          services={services} 
          exonere={exonere}
          redevance={redevance}
        />}
        fileName={`facture_service_${serviceDetails?.numFacture}.pdf`}
      >
        {({ loading }) => (
          <Button
            label="Télécharger PDF"
            icon="pi pi-download"
            loading={loading}
          />
        )}
      </PDFDownloadLink>
    </div>
  }
>
  {serviceDetails && (
    <PDFViewer style={{ width: '100%', height: '100%' }}>
      <ServicePrestePdf 
        service={serviceDetails} 
        services={services} 
        exonere={exonere}
        redevance={redevance}
      />
    </PDFViewer>
  )}
</Dialog>

            <style jsx>{`
                react-pdf__Document {
  height: 100% !important;
}

.react-pdf__Page {
  margin: 0 auto;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
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