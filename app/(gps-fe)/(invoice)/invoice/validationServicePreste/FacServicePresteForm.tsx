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
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ServicePrestePdf } from './ServicePrestePdf';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { buildApiUrl } from '../../../../../utils/apiConfig';

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
        statusEnvoiOBR: null,
        statusEnvoiCancelOBR: null,
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
    const [printProformaVisible, setPrintProformaVisible] = useState(false);

    // Use the useCurrentUser hook to get current user information
    const { user } = useCurrentUser();

    const [loadingNumFacture, setLoadingNumFacture] = useState(false);
    const lettreTranspInputRef = useRef<HTMLInputElement>(null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setService(prev => ({ ...prev, [name]: value }));
    };

    // Gestionnaire pour la touche Espace
    const handleLettreTranspKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' && service.lettreTransp && service.lettreTransp.length > 0) {
            e.preventDefault(); // Empêche l'ajout d'un espace
            fetchNumFactureFromLettreTransp();
        }
    };

    // Fonction pour récupérer le numéro de facture
    const fetchNumFactureFromLettreTransp = async () => {
        if (!service.lettreTransp || service.lettreTransp.trim() === '') {
            showToast('warn', 'Attention', 'Veuillez d\'abord saisir une lettre de transport');
            return;
        }

        setLoadingNumFacture(true);
        try {
            const response = await fetch(buildApiUrl(`/servicepreste/findByNoFacture?lettreTransp=${encodeURIComponent(service.lettreTransp)}`));

            if (response.ok) {
                const numFacture = await response.text();

                if (numFacture && numFacture.trim() !== '') {
                    setService(prev => ({
                        ...prev,
                        numFacture: numFacture.trim()
                    }));
                    showToast('success', 'Succès', 'Numéro de facture chargé avec succès');
                } else {
                    showToast('warn', 'Attention', 'Aucun numéro de facture trouvé pour cette lettre de transport');
                    setService(prev => ({ ...prev, numFacture: '' }));
                }
            } else {
                showToast('error', 'Erreur', 'Erreur lors de la recherche du numéro de facture');
                setService(prev => ({ ...prev, numFacture: '' }));
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du numéro de facture:', error);
            showToast('error', 'Erreur', 'Impossible de récupérer le numéro de facture');
            setService(prev => ({ ...prev, numFacture: '' }));
        } finally {
            setLoadingNumFacture(false);
        }
    };

    // Fonction pour charger automatiquement quand on quitte le champ
    const handleLettreTranspBlur = () => {
        if (service.lettreTransp && service.lettreTransp.length > 0 && !service.numFacture) {
            fetchNumFactureFromLettreTransp();
        }
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

        if (!service.numFacture) {
            showToast('error', 'Erreur', 'Le numéro de facture est requis');
            return;
        }

        try {
            const mainResponse = await fetch(buildApiUrl(`/servicepreste/findByFactureandLT?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`));

            if (!mainResponse.ok) {
                throw new Error('Erreur lors de la récupération des détails');
            }

            const mainData = await mainResponse.json();

            const importateurResponse = await fetch(buildApiUrl(`/servicepreste/findNomImportateur?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`));
            const importateurName = await importateurResponse.text();

            const serviceResponse = await fetch(buildApiUrl(`/servicepreste/findNomService?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`));
            const bargeService = await serviceResponse.text();

            const servicesResponse = await fetch(buildApiUrl(`/servicepreste/findbyServiceMontant?lettreTransp=${encodeURIComponent(service.lettreTransp)}&numFacture=${encodeURIComponent(service.numFacture)}`));
            const servicesData = await servicesResponse.json();

            console.log('=== RECEIVED DATA FROM BACKEND ===');
            console.log('Raw servicesData:', servicesData);

            const formattedServices = Array.isArray(servicesData) ? servicesData : [servicesData];

            // Log each service's montTaxe when received from backend
            formattedServices.forEach((svc, index) => {
                console.log(`Service [${index}] - ${svc.nomService}:`);
                console.log('  montTaxe:', svc.montTaxe);
                console.log('  montTaxe type:', typeof svc.montTaxe);
                console.log('  montRedevTaxe:', svc.montRedevTaxe);
                console.log('  montant:', svc.montant);
            });
            console.log('==================================');

            setServices(formattedServices);

            if (mainData) {
                const updatedDetails = {
                    ...mainData,
                    nomImportateur: importateurName || mainData.nomImportateur || '-',
                    nomService: bargeService || mainData.nomService || '-'
                };

                setServiceDetails(updatedDetails);
                setExonere(mainData.taxe || false);
                setShowPreview(true);
            } else {
                showToast('error', 'Erreur', 'Aucun service trouvé ou déjà validé');
            }
        } catch (error) {
            console.error('Erreur de récupération:', error);
            showToast('error', 'Erreur', 'Erreur de récupération des données');
        }
    };

    // Le reste de vos fonctions reste inchangé...
    // Calculate totals with debug logging
    const totalHTVA = services.reduce((sum, service) => sum + (service.montant || 0), 0) + (redevance ? 0 : 0);
    const totalTVA = services.reduce((sum, service) => {
        console.log('Service:', service.nomService, 'montTaxe:', service.montTaxe, 'montRedevTaxe:', service.montRedevTaxe);
        return sum + (service.montTaxe || 0) + (service.montRedevTaxe || 0);
    }, 0);
    const totalTTC = services.reduce((sum, service) => {
        const serviceTotal = (service.montant || 0) + (service.montRedev || 0) + (service.montTaxe || 0) + (service.montRedevTaxe || 0);
        console.log('Service:', service.nomService,
            'montant:', service.montant,
            'montRedev:', service.montRedev,
            'montTaxe:', service.montTaxe,
            'montRedevTaxe:', service.montRedevTaxe,
            'serviceTotal:', serviceTotal);
        return sum + serviceTotal;
    }, 0);

    const totalMontantDevise = services.reduce((sum, service) => sum + (service.montantDevise || 0), 0);
    const tauxChange = services.length > 0 ? services[0].tauxChange : 0;

    console.log('=== TOTALS ===');
    console.log('Total HTVA:', totalHTVA);
    console.log('Total TVA:', totalTVA);
    console.log('Total TTC:', totalTTC);
    console.log('Total Mont. Dev.:', totalMontantDevise);
    console.log('Taux de change:', tauxChange);
    console.log('Services array:', services);

    const servicesAvecRedv = serviceDetails
        ? [
            ...services,
            {
               // nomService: 'Redevance Informatique',
               // montant: redevance ? 23395 : 0
            },
            {
                nomService: 'Total HTVA',
                montant: totalHTVA,
                isTotal: true
            },
            {
                nomService: 'Total TVA',
                montant: totalTVA,
                isDivision: true
            },
            {
                nomService: 'Total TTC',
                montant: totalTTC,
                isGrandTotal: true
            },
            {
                nomService: 'Mont. Dev.',
                montant: totalMontantDevise,
                isMontantDevise: true
            },
            {
                nomService: 'Taux de change',
                montant: tauxChange,
                isTauxChange: true
            }
        ]
        : services;

    const validateService = async () => {
        if (!serviceDetails) return;

        //const montRedevValue = redevance ? 23395 : 0;
        const montRedevValue = serviceDetails.montRedev ?? 0;

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
                montRedev: montRedevValue,
                userUpdate: user?.firstname || ''
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
                    dateValidation: new Date(),
                    userAnnulation: user?.firstname || ''
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

    const formatUSD = (value: number | null) => {
        return value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '';
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
                        placeholder="Le numéro de facture sera chargé automatiquement"
                        disabled={loadingNumFacture}
                        readOnly
                    />
                    {loadingNumFacture && (
                        <small className="text-blue-500">Chargement du numéro de facture...</small>
                    )}

                </div>

                <div className="field col-6">
                    <label htmlFor="lettreTransp">
                        Lettre de Transport
                        <Button
                            icon="pi pi-search"
                            className="p-button-text p-button-sm ml-2"
                            onClick={fetchNumFactureFromLettreTransp}
                            tooltip="Charger le numéro de facture (ou appuyez sur Espace)"
                            tooltipOptions={{ position: 'top' }}
                            disabled={!service.lettreTransp || loadingNumFacture}
                        />
                    </label>
                    <InputText
                        id="lettreTransp"
                        name="lettreTransp"
                        value={service.lettreTransp}
                        onChange={handleChange}
                        onKeyDown={handleLettreTranspKeyDown}
                        onBlur={handleLettreTranspBlur}
                        placeholder="Saisissez la lettre de transport puis appuyez sur Espace ou cliquez sur l'icône"
                        ref={lettreTranspInputRef}
                    />
                    <small className="text-gray-500">
                        Astuce : Après avoir saisi la lettre de transport, appuyez sur la touche Espace pour charger automatiquement le numéro de facture
                    </small>
                </div>

                <div className="field col-12 flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Vérifier Service"
                        icon="pi pi-search"
                        onClick={fetchServiceDetails}
                        disabled={loadingNumFacture || !service.lettreTransp || !service.numFacture}
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
                            label="Imprimer Proforma"
                            icon="pi pi-file-pdf"
                            onClick={() => setPrintProformaVisible(true)}
                            className="p-button-warning"
                            disabled={serviceDetails?.dateValidation !== null}
                        />
                        <Button
                            label="Imprimer"
                            icon="pi pi-print"
                            onClick={() => setPrintPreviewVisible(true)}
                            className="p-button-help"
                            disabled={serviceDetails?.dateAnnulation !== null || serviceDetails?.dateValidation == null}

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

                                <div className="detail-item">
    <label>Période</label>
    {serviceDetails.dateDebut ? new Date(serviceDetails.dateDebut).toLocaleDateString('fr-FR') : 'Non définie'}  AU  {serviceDetails.dateFin ? new Date(serviceDetails.dateFin).toLocaleDateString('fr-FR') : 'Non définie'}
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
                                                        rowData.isGrandTotal ? "grand-total-amount" :
                                                        rowData.isMontantDevise ? "montant-devise-amount" :
                                                        rowData.isTauxChange ? "taux-change-amount" : ""
                                            }>
                                                {rowData.isExonere ? "0" :
                                                 rowData.isMontantDevise ? formatUSD(rowData.montant) :
                                                 rowData.isTauxChange ? rowData.montant?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) :
                                                 formatCurrency(rowData.montant)}
                                            </span>
                                        )}
                                        style={{ width: '40%', textAlign: 'right' }}
                                    />

                                      <Column
                                        field="montantDevise" header="Montant Devise" 
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
                                                value={serviceDetails.statusEnvoiOBR === 1 ? 'Envoyée' : 'Non envoyée'}
                                                severity={serviceDetails.statusEnvoiOBR === 1 ? 'success' : 'danger'}
                                                icon={serviceDetails.statusEnvoiOBR === 1 ? 'pi pi-check' : 'pi pi-times'}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Envoi OBR */}
                                    {serviceDetails.dateEnvoiOBR && (
                                        <div className="detail-item">
                                            <label>Date Envoi OBR</label>
                                            <div className="detail-value" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                                {new Date(serviceDetails.dateEnvoiOBR).toLocaleString('fr-FR')}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Envoi Cancel OBR */}
                                    {(serviceDetails.annuleFacture === true) && (
                                        <div className="detail-item">
                                            <label>Statut Annulation OBR</label>
                                            <div className="detail-value">
                                                <Tag
                                                    value={serviceDetails.statusEnvoiCancelOBR == 1 ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                                    severity={serviceDetails.statusEnvoiCancelOBR == 1 ? 'info' : 'warning'}
                                                    icon={serviceDetails.statusEnvoiCancelOBR == 1 ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
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

            {/* Proforma Print Preview Dialog */}
            <Dialog
                header={`Prévisualisation Facture Proforma ${serviceDetails?.numFacture || ''}`}
                visible={printProformaVisible}
                style={{ width: '90vw', height: '90vh' }}
                modal
                onHide={() => setPrintProformaVisible(false)}
                footer={
                    <div>
                        <Button
                            label="Fermer"
                            icon="pi pi-times"
                            onClick={() => setPrintProformaVisible(false)}
                            className="p-button-text"
                        />
                        <PDFDownloadLink
                            document={<ServicePrestePdf
                                service={serviceDetails!}
                                services={services}
                                exonere={exonere}
                                redevance={redevance}
                                isProforma={true}
                            />}
                            fileName={`facture_proforma_${serviceDetails?.numFacture}.pdf`}
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
                            isProforma={true}
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