'use client';

import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown'; // Ajouter cette importation
import { Toast } from 'primereact/toast';
import { useRef, useState, useEffect } from 'react'; // Ajouter useEffect
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { ValidInvoice, InvoiceValidationRequest } from './ValidInvoice';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { FacturePDF } from './FacturePDF';
import { PDFModal } from '../calculFacture/PDFModal';
import { InvoiceService } from '../calculFacture/invoiceService';

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
        userAnnulation: '',
        dateEntree: null,
        typeFacture: '',
        typeConditionId: '',
        duree: 0,
        duree37: 0,
        montPrixMagasin: 0,
        montPrixMagasin37: 0,
        tonnage: 0,
        nbreColis: 0,
        dateSupplement: null,
        dateDerniere: null,
        statutEncaissement: false,
        tarifBarge: 0,
        tarifCamion: 0,
        fraisSrsp: 0,// salissage
        fraisArrimage: 0,//Arrimage
        SurtaxeClt: 0, //colis lourd
        userCreation: '',
        montMagasinage37: 0,
        //nobreColis: 0,
        dateEnvoiOBR: null,
        statusEnvoiOBR: null,
        statusEnvoiCancelOBR: null,
        SignatureCrypte: null,
        FactureSignature: null,
         annuleFacture : 0

    });

    // États pour le dropdown
    const [sortieIdOptions, setSortieIdOptions] = useState<any[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    const [invoiceDetails, setInvoiceDetails] = useState<ValidInvoice | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const toast = useRef<Toast>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const { data, loading, error, fetchData } = useConsumApi('');
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<ValidInvoice | null>(null);
    const [printLoading, setPrintLoading] = useState<boolean>(false);

    // Charger les options du dropdown lorsque le RSP change
    useEffect(() => {
        if (invoice.rsp && invoice.rsp.trim() !== '') {
            loadSortieIdOptions();
        } else {
            setSortieIdOptions([]);
            setInvoice(prev => ({ ...prev, sortieId: '' }));
        }
    }, [invoice.rsp]);

    const loadSortieIdOptions = async () => {
        if (!invoice.rsp) return;

        setLoadingOptions(true);
        const encodedRSP = encodeURIComponent(invoice.rsp);

        try {
            const response = await fetch(buildApiUrl(`/invoices/validateFacture?rsp=${encodedRSP}`));
            if (response.ok) {
                const data = await response.json();
                // Format: "TypeFacturation - SortieId" (e.g., "Supplement - INV001")
                const options = Array.isArray(data) ? data.map(item => {
                    const typeFacturation = item.typeFacturation || item.typefacturation || '';
                    const sortieId = item.sortieId || item.numFacture || '';
                    return {
                        label: `${typeFacturation} - ${sortieId}`,
                        value: sortieId,
                        typefacturation: typeFacturation
                    };
                }) : [];

                setSortieIdOptions(options);
            } else {
                setSortieIdOptions([]);
                showToast('error', 'Erreur', 'Aucune facture trouvée pour ce RSP');
            }
        } catch (error) {
            setSortieIdOptions([]);
            showToast('error', 'Erreur', 'Erreur de chargement des factures');
        } finally {
            setLoadingOptions(false);
        }
    };



    // Fonction pour récupérer les tarifs depuis l'API
    const fetchTarifs = async (rsp: string, sortieId: string) => {
        const encodedRSP = encodeURIComponent(rsp);
        const encodeFacture = encodeURIComponent(sortieId);

        try {
            const response = await fetch(buildApiUrl(`/invoices/tarifs?rsp=${encodedRSP}&sortieId=${encodeFacture}`));
            if (response.ok) {
                const tarifsData = await response.json();
                return {
                    tarifBarge: tarifsData.tarifBarge || 0,
                    tarifCamion: tarifsData.tarifCamion || 0,
                    fraisSrsp: tarifsData.fraisSrsp || 0,
                    fraisArrimage: tarifsData.fraisArrimage || 0,
                    SurtaxeClt: tarifsData.surtaxeClt || 0,
                };
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tarifs:', error);
        }

        // Retourner des valeurs par défaut en cas d'erreur
        return {
            tarifBarge: 0,
            tarifCamion: 0,
            fraisSrsp: 0,
            fraisArrimage: 0,
            SurtaxeClt: 0,
        };
    };

    // Fonction pour calculer le tonnage arrondi selon la logique métier
    const calculateTonnageArrondi = (tonnage: number, typeConditionId: string, nbreColis: number) => {
        let tonnageArrondi = Math.round(tonnage * 10 / 100) * 10;
        const dernierChiffre = tonnage * 10 % 10;

        // Ajustement du tonnage arrondi si nécessaire
        if (dernierChiffre === 5) {
            const lastTwoDigits = (tonnage * 100) % 100;
            if (![45, 25, 5, 35, 15].includes(lastTwoDigits)) {
                tonnageArrondi = Math.floor(tonnage * 10);
            }
        }

        // Si c'est un véhicule, on utilise le nombre de colis
        if (typeConditionId === 'VE') {
            tonnageArrondi = nbreColis || 0;
        }

        return tonnageArrondi;
    };

    // Fonction pour formater les nombres
    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('fr-FR').format(value || 0);
    };


    // Charger les options du dropdown lorsque le RSP change
    useEffect(() => {
        if (invoice.rsp && invoice.rsp.trim() !== '') {
            loadSortieIdOptions();
        } else {
            setSortieIdOptions([]);
            setInvoice(prev => ({ ...prev, sortieId: '' }));
        }
    }, [invoice.rsp]);





    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice({ ...invoice, [e.target.name]: e.target.value });
    };

    const handleDropdownChange = (e: any) => {
        setInvoice({ ...invoice, sortieId: e.value });
    };

    const fetchInvoiceDetails = async () => {
        if (!invoice.sortieId || !invoice.rsp) {
            showToast('error', 'Erreur', 'Les champs sont obligatoires');
            return;
        }

        const encodedRSP = encodeURIComponent(invoice.rsp);
        const encodeFacture = encodeURIComponent(invoice.sortieId);

        try {
            // Trouver le typeFacturation à partir des options chargées
            const selectedOption = sortieIdOptions.find(option => option.value === invoice.sortieId);
            const typeFacturation = selectedOption?.typefacturation || '';

            // Récupérer directement les données sauvegardées dans FacFactureSortie
            const mainResponse = await fetch(buildApiUrl(`/invoices/findBySortieIdAndRsp?rsp=${encodedRSP}&sortieId=${encodeFacture}`));

            if (!mainResponse.ok) {
                throw new Error('Erreur lors de la récupération des détails de la facture');
            }

            const mainData = await mainResponse.json();

            if (mainData) {
                // Toutes les données viennent directement de FacFactureSortie (mainData)
                const updatedDetails = {
                    // Informations de base
                    factureSortieId: mainData.factureSortieId || null,
                    sortieId: mainData.sortieId || '',
                    numFacture: mainData.numFacture || mainData.sortieId || '',
                    rsp: mainData.rsp || invoice.rsp || '',
                    lt: mainData.lt || '',

                    // Informations client et marchandise
                    nomClient: mainData.nomClient || '-',
                    nomMarchandise: mainData.nomMarchandise || '-',
                    declarant: mainData.declarant || '-',
                    nomImportateur: mainData.nomImportateur || '',
                    nif: mainData.nif || '',
                    adresse: mainData.adresse || '',

                    // Dates
                    dateEntree: mainData.dateEntree || null,
                    dateSortie: mainData.dateSortie || new Date(),
                    dateSupplement: mainData.dateSupplement || null,
                    dateDerniere: mainData.dateDerniereSortie || mainData.dateDerniere || null,
                    dateDerniereSortie: mainData.dateDerniereSortie || null,

                    // Type et conditions
                    typeConditionId: mainData.typeConditionId || '',
                    typeFacture: mainData.typeFacture || '',
                    typeFacturation: typeFacturation || mainData.typeFacture || '',

                    // Durées
                    duree: mainData.duree || 0,
                    duree37: mainData.duree37 || 0,

                    // Tonnage et colis
                    tonnage: mainData.tonnage || 0,
                    nbreColis: mainData.nbreColis || 0,
                    tonnageArrondi: mainData.tonnageArrondi || 0,
                    tonnageSolde: mainData.tonnageSolde || 0,
                    tonnageSoldeArrondi: mainData.tonnageSoldeArrondi || 0,
                    poids: mainData.poids || mainData.tonnage || 0,
                    poidsKg: mainData.poidsKg || 0,

                    // Montants principaux (depuis la base de données)
                    montTotalManut: mainData.montTotalManut || 0,
                    montTVA: mainData.montTVA || 0,
                    montantPaye: mainData.montantPaye || 0,
                    montGardienage: mainData.montGardienage || 0,
                    montMagasinage: mainData.montMagasinage || 0,

                    // Manutention
                    manutBateau: mainData.manutBateau || 0,
                    manutCamion: mainData.manutCamion || 0,

                    // Autres frais
                    surtaxeColisLourd: mainData.surtaxeColisLourd || 0,
                    montSalissage: mainData.montSalissage || 0,
                    montArrimage: mainData.montArrimage || 0,
                    montRedev: mainData.montRedev || 0,
                    montPalette: mainData.montPalette || 0,
                    montPesMag: mainData.montPesMag || 0,
                    montLais: mainData.montLais || 0,
                    peage: mainData.peage || 0,
                    montEtiquette: mainData.montEtiquette || 0,
                    montFixationPlaque: mainData.montFixationPlaque || 0,

                    // Réductions et TVA
                    montantReduction: mainData.montantReduction || 0,
                    tauxReduction: mainData.tauxReduction || 0,
                    montFixeTVA: mainData.montTVA || 0,

                    // Tarifs (depuis la base de données)
                    tarifBarge: mainData.tarifBarge || 0,
                    tarifCamion: mainData.tarifCamion || 0,
                    fraisSrsp: mainData.fraisSrsp || 0,
                    fraisArrimage: mainData.fraisArrimage || 0,
                    SurtaxeClt: mainData.surtaxeClt || 0,
                    surtaxeClt: mainData.surtaxeClt || 0,

                    // Quantités
                    nbrePalette: mainData.nbrePalette || 0,
                    nbreEtiquette: mainData.nbreEtiquette || 0,

                    // Storage prices
                    montMag: mainData.montMag || 0,
                    montMag37: mainData.montMag37 || 0,
                    montPrixMagasin: mainData.montMag || 0,
                    montPrixMagasin37: mainData.montMag37 || 0,

                    // Extended period amounts
                    montMagasinage37: mainData.montMagasinage37 || 0,
                    montGardienage37: mainData.montGardienage37 || 0,

                    // Other fields
                    montantDevise: mainData.montantDevise || 0,
                    mont: mainData.montantDevise || 0,
                    transit: mainData.transit || false,
                    exonere: mainData.exonere || false,
                    fixationPlaque: mainData.fixationPlaque || false,
                    etiquete: mainData.etiquete || false,

                    // IDs
                    clientId: mainData.clientId || 0,
                    marchandiseId: mainData.marchandiseId || 0,
                    dossierId: mainData.dossierId || '',

                    // Utilisateurs et validation
                    userCreation: mainData.userCreation || '',
                    userValidation: mainData.userValidation || '',
                    isValid: mainData.isValid || 0,
                    dateValidation: mainData.dateValidation || null,
                    dateAnnulation: mainData.dateAnnulation || null,
                    userAnnulation: mainData.userAnnulation || '',
                    statutEncaissement: mainData.statutEncaissement || '',

                    // Annulation
                    annule: mainData.annule || false,
                    annuleFacture: mainData.annuleFacture || false,
                    refAnnule: mainData.refAnnule || '',
                    motifAnnulation: mainData.motifAnnulation || '',
                    factureSignature: mainData.factureSignature || '',
                    modePayement: mainData.modePayement || '',
                    numeroOrdre: mainData.numeroOrdre || 0,
                    // NEW FIELDS
                    dateEnvoiOBR: mainData.dateEnvoiOBR || null,
                    statusEnvoiOBR: mainData.statusEnvoiOBR || null,
                    statusEnvoiCancelOBR: mainData.statusEnvoiCancelOBR || null,
                    SignatureCrypte: mainData.SignatureCrypte || null,
                    FactureSignature: mainData.FactureSignature || null

                };

                console.log('🔍 DEBUG fetchInvoiceDetails - Données récupérées de FacFactureSortie:', mainData);

                setInvoiceDetails(updatedDetails);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            showToast('error', 'Erreur', 'Erreur de récupération des données: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
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
                //buildApiUrl(`/invoices/validate?rsp=${encodedRSP}&sortieId=${encodeFacture}`),

                buildApiUrl(`/invoices/validate/${invoiceDetails.factureSortieId}`),
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


    // Fonction pour imprimer la facture validée
    const handlePrintInvoice = async () => {
        if (!invoiceDetails) {
            showToast('error', 'Erreur', 'Aucune facture sélectionnée');
            return;
        }

        if (!invoiceDetails.rsp || !invoiceDetails.sortieId) {
            showToast('error', 'Erreur', 'Données incomplètes pour l\'impression');
            return;
        }

        // Vérifier que la facture est validée (isValid = 1 OR dateValidation is not null)
        if (invoiceDetails.isValid !== 1 && !invoiceDetails.dateValidation) {
            showToast('warn', 'Attention', 'Cette facture n\'est pas encore validée. Veuillez la valider avant d\'imprimer.');
            return;
        }

        setPrintLoading(true);

        try {
            // Vérifier la validation avec l'API (double vérification)
            const validationResult = await InvoiceService.checkInvoiceValidation(
                invoiceDetails.rsp,
                invoiceDetails.sortieId
            );

            if (validationResult.isValid) {
                // Facture validée - ouvrir avec FacturePDF
                const safeInvoice = { ...invoiceDetails };
                setSelectedInvoice(safeInvoice);
                setShowPdfModal(true);
                showToast('success', 'Facture Validée', 'Ouverture de la facture validée pour impression...');
            } else {
                showToast('error', 'Erreur', 'Cette facture n\'est pas validée. Impossible d\'imprimer.');
            }
        } catch (error) {
            showToast('error', 'Erreur', 'Erreur lors de la vérification de la facture: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
        } finally {
            setPrintLoading(false);
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
                    <label htmlFor="rsp">RSP</label>
                    <InputText
                        id="rsp"
                        name="rsp"
                        value={invoice.rsp}
                        onChange={handleChange}
                        placeholder="Entrez le RSP"
                    />
                </div>

                <div className="field col-6">
                    <label htmlFor="sortieId">Numéro de Facture</label>
                    <Dropdown
                        id="sortieId"
                        name="sortieId"
                        value={invoice.sortieId}
                        options={sortieIdOptions}
                        onChange={handleDropdownChange}
                        placeholder="Sélectionnez une facture"
                        // loading={loadingOptions}
                        disabled={!invoice.rsp || loadingOptions}
                        filter
                        showClear
                        className="w-full"
                    />
                    {loadingOptions && (
                        <small className="text-primary">Chargement des factures...</small>
                    )}
                    {!loadingOptions && invoice.rsp && sortieIdOptions.length === 0 && (
                        <small className="text-red-500">Aucune facture trouvée pour ce RSP</small>
                    )}
                </div>

                <div className="field col-12 flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Vérifier Facture"
                        icon="pi pi-search"
                        onClick={fetchInvoiceDetails}
                        disabled={!invoice.sortieId || !invoice.rsp}
                    />
                </div>
            </div>

            {/* Dialog pour afficher les détails de la facture */}



            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-file-verify text-2xl text-primary"></i>
                        <span className="text-xl font-bold">Validation de la Facture</span>
                    </div>
                }
                visible={showPreview}
                style={{ width: '85vw', maxWidth: '1200px' }}
                modal
                className="invoice-validation-dialog"
                onHide={() => setShowPreview(false)}
                footer={
                    <div className="flex justify-content-between align-items-center w-full">
                        <div className="flex gap-2">
                            <Tag
                                value={invoiceDetails?.dateValidation ? 'STATUT: VALIDÉE' : 'STATUT: EN ATTENTE'}
                                severity={invoiceDetails?.dateValidation ? 'success' : 'warning'}
                                icon={invoiceDetails?.dateValidation ? 'pi pi-check-circle' : 'pi pi-clock'}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                label="Fermer"
                                icon="pi pi-times"
                                onClick={() => setShowPreview(false)}
                                className="p-button-outlined"
                                severity="secondary"
                            />
                            <Button
                                label="Imprimer"
                                icon="pi pi-print"
                                onClick={handlePrintInvoice}
                                className="p-button-help"
                                severity="help"
                                loading={printLoading}
                                disabled={invoiceDetails?.dateAnnulation !== null || invoiceDetails?.dateValidation == null}
                            />
                            <Button
                                label="Annuler Facture"
                                icon="pi pi-ban"
                                onClick={() => setShowCancelDialog(true)}
                                className="p-button-outlined p-button-danger"
                                disabled={invoiceDetails?.dateValidation == null || invoiceDetails?.dateAnnulation !== null}
                            />
                            <Button
                                label="Valider"
                                icon="pi pi-check"
                                onClick={validateInvoice}
                                className="p-button-success"
                                disabled={invoiceDetails?.dateValidation !== null}
                            />
                        </div>
                    </div>
                }
            >
                {invoiceDetails && (
                    <div className="invoice-preview-container">
                        {/* Header avec informations principales */}
                        <div className="invoice-header p-4 surface-ground border-round mb-4">
                            <div className="grid">
                                <div className="col-4">
                                    <div className="text-sm font-semibold text-600">
                                        NUMÉRO FACTURE
                                    </div>
                                    <div className="text-2xl font-bold text-900">{invoiceDetails.sortieId}</div>
                                </div>
                                <div className="col-4">
                                    <div className="text-sm font-semibold text-600">RSP</div>
                                    <div className="text-xl font-bold text-900">{invoiceDetails.rsp}</div>
                                </div>
                                <div className="col-4">
                                    <div className="text-sm font-semibold text-600">PERIODE</div>
                                    <div className="text-lg font-semibold text-900">
                                        {invoiceDetails.typeFacture === 'Supplement' ? (
                                            <>Du {invoiceDetails.dateSortie ? new Date(invoiceDetails.dateSortie).toLocaleDateString('fr-FR') : '-'} AU {invoiceDetails.dateSupplement ? new Date(invoiceDetails.dateSupplement).toLocaleDateString('fr-FR') : '-'}</>
                                        ) : invoiceDetails.typeFacture === 'Solde' ? (
                                            <>Du {invoiceDetails.dateSortie ? new Date(invoiceDetails.dateSortie).toLocaleDateString('fr-FR') : '-'} AU {invoiceDetails.dateDerniere ? new Date(invoiceDetails.dateDerniere).toLocaleDateString('fr-FR') : '-'}</>
                                        ) : (
                                            <>Du {invoiceDetails.dateEntree ? new Date(invoiceDetails.dateEntree).toLocaleDateString('fr-FR') : '-'} AU {invoiceDetails.dateSortie ? new Date(invoiceDetails.dateSortie).toLocaleDateString('fr-FR') : '-'}</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grid principal */}
                        <div className="grid">
                            {/* Colonne 1 - Informations Générales */}
                            <div className="col-12 md:col-4">
                                <Card className="h-full shadow-2 border-left-3 border-primary">
                                    <div className="card-header bg-primary-reverse">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-info-circle text-primary"></i>
                                            <span className="font-bold text-lg">Informations Générales</span>
                                        </div>
                                    </div>
                                    <div className="card-content p-3">
                                        <div className="space-y-3">
                                            <div className="field-group">
                                                <label className="text-sm font-semibold text-600 block mb-1">Lettre de Transport</label>
                                                <div className="text-900 font-medium p-2 border-1 surface-border border-round">
                                                    {invoiceDetails.lt || '-'}
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label className="text-sm font-semibold text-600 block mb-1">Client</label>
                                                <div className="text-900 font-medium p-2 border-1 surface-border border-round">
                                                    {invoiceDetails.nomClient || '-'}
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label className="text-sm font-semibold text-600 block mb-1">Marchandise</label>
                                                <div className="text-900 font-medium p-2 border-1 surface-border border-round">
                                                    {invoiceDetails.nomMarchandise || '-'}
                                                </div>
                                            </div>
                                            <div className="field-group">
                                                <label className="text-sm font-semibold text-600 block mb-1">Déclarant</label>
                                                <div className="text-900 font-medium p-2 border-1 surface-border border-round">
                                                    {invoiceDetails.declarant || '-'}
                                                </div>
                                            </div>
                                            <div className="grid">
                                                <div className="col-6">
                                                    <label className="text-sm font-semibold text-600 block mb-1">Durée</label>
                                                    <div className="text-900 font-bold p-2 border-1 surface-border border-round text-center">
                                                        {invoiceDetails.duree || 0} j
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <label className="text-sm font-semibold text-600 block mb-1">Durée 37</label>
                                                    <div className="text-900 font-bold p-2 border-1 surface-border border-round text-center">
                                                        {invoiceDetails.duree37 || 0} j
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Colonne 2 - Détails de Manutention */}
                            <div className="col-12 md:col-4">
                                <Card className="h-full shadow-2 border-left-3 border-blue-500">
                                    <div className="card-header bg-blue-50">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-box text-blue-600"></i>
                                            <span className="font-bold text-lg">Détails de Manutention</span>
                                        </div>
                                    </div>
                                    <div className="card-content p-3">
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Manutention Camion', value: invoiceDetails.manutCamion },
                                                { label: 'Manutention Bateau', value: invoiceDetails.manutBateau },
                                                { label: 'Surtaxe colis lourd', value: invoiceDetails.surtaxeColisLourd },
                                                { label: 'Salissage', value: invoiceDetails.montSalissage },
                                                { label: 'Arrimage', value: invoiceDetails.montArrimage },
                                                { label: 'Redevance Informatique', value: invoiceDetails.montRedev },
                                                { label: 'Pese Magasin', value: invoiceDetails.montPesMag },
                                                { label: 'Etiquette', value: invoiceDetails.montEtiquette },
                                                { label: 'Palette', value: invoiceDetails.montPalette },
                                                { label: 'Fixation Plaque', value: invoiceDetails.montFixationPlaque },
                                                { label: 'Laisser Suivre', value: invoiceDetails.montLais }
                                            ].map((item, index) => (
                                                <div key={index} className="flex justify-content-between align-items-center p-2 border-bottom-1 surface-border">
                                                    <span className="text-sm font-medium text-600">{item.label}</span>
                                                    <span className="font-semibold text-900">
                                                        {formatCurrency(item.value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Colonne 3 - Montants et Statut */}
                            <div className="col-12 md:col-4">
                                <Card className="h-full shadow-2 border-left-3 border-green-500">
                                    <div className="card-header bg-green-50">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-money-bill text-green-600"></i>
                                            <span className="font-bold text-lg">Montants & Statut</span>
                                        </div>
                                    </div>
                                    <div className="card-content p-3">
                                        {/* Montants principaux */}
                                        <div className="space-y-3 mb-4">
                                            {[
                                                { label: 'Magasinage', value: invoiceDetails.montMagasinage },
                                                { label: 'Magasinage 37', value: invoiceDetails.montMagasinage37 },

                                                { label: 'Gardiennage', value: invoiceDetails.montGardienage },
                                                { label: 'Total Manutention', value: invoiceDetails.montTotalManut, highlight: true },
                                                { label: 'TVA', value: invoiceDetails.montTVA },
                                                { label: 'Montant Payé', value: invoiceDetails.montantPaye, total: true }
                                            ].map((item, index) => (
                                                <div key={index} className={`flex justify-content-between align-items-center p-2 ${item.highlight ? 'bg-blue-50 border-round font-bold' :
                                                    item.total ? 'bg-green-50 border-round font-bold border-1 border-green-200' : ''
                                                    }`}>
                                                    <span className={`font-medium ${item.highlight ? 'text-blue-700' :
                                                        item.total ? 'text-green-700' : 'text-600'
                                                        }`}>
                                                        {item.label}
                                                    </span>
                                                    <span className={`font-bold ${item.highlight ? 'text-blue-700' :
                                                        item.total ? 'text-green-700 text-xl' : 'text-900'
                                                        }`}>
                                                        {formatCurrency(item.value)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <Divider />

                                        {/* Section Statut */}
                                        <div className="status-section">
                                            <div className="text-center mb-3">
                                                <Tag
                                                    severity={invoiceDetails.isValid ? 'success' : 'danger'}
                                                    value={invoiceDetails.dateValidation ? 'Facture Validée ' : 'En Attente de Validation'}
                                                    icon={invoiceDetails.dateValidation ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
                                                    className="text-lg p-2"
                                                />
                                            </div>

                                            {invoiceDetails.dateValidation && (
                                                <div className="validation-info p-3 border-1 surface-border border-round bg-green-50">
                                                    <div className="flex align-items-center gap-2 mb-2">
                                                        <i className="pi pi-calendar text-green-600"></i>
                                                        <span className="font-semibold text-green-700">Date Validation</span>
                                                    </div>
                                                    <div className="text-green-800">
                                                        {new Date(invoiceDetails.dateValidation).toLocaleString('fr-FR')}
                                                        {invoiceDetails.userValidation}
                                                    </div>

                                                </div>
                                            )}

                                            {invoiceDetails.dateAnnulation && (
                                                <div className="cancellation-info p-3 border-1 surface-border border-round bg-red-50 mt-3">
                                                    <div className="flex align-items-center gap-2 mb-2">
                                                        <i className="pi pi-times text-red-600"></i>
                                                        <span className="font-semibold text-red-700">Annulé le</span>
                                                    </div>
                                                    <div className="text-red-800">
                                                        {new Date(invoiceDetails.dateAnnulation).toLocaleString('fr-FR')}
                                                        <br />
                                                        <span className="text-sm">par {invoiceDetails.userAnnulation}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* OBR Status Information */}
                                            <Divider />
                                            <div className="obr-info mt-3">
                                                <div className="text-center mb-2">
                                                    <span className="font-bold text-600">INFORMATIONS OBR</span>
                                                </div>

                                                {/* Status Envoi OBR */}
                                                <div className="obr-status-item p-2 border-1 surface-border border-round mb-2">
                                                    <div className="flex justify-content-between align-items-center">
                                                        <span className="text-sm font-medium text-600">Statut Envoi OBR</span>
                                                        <Tag
                                                            value={invoiceDetails.statusEnvoiOBR === 1 ? 'Envoyée' : 'Non envoyée'}
                                                            severity={invoiceDetails.statusEnvoiOBR === 1 ? 'success' : 'danger'}
                                                            icon={invoiceDetails.statusEnvoiOBR === 1 ? 'pi pi-check' : 'pi pi-times'}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Date Envoi OBR */}
                                                {invoiceDetails.dateEnvoiOBR && (
                                                    <div className="obr-date-item p-2 border-1 surface-border border-round mb-2 bg-blue-50">
                                                        <div className="flex align-items-center gap-2">
                                                            <i className="pi pi-calendar text-blue-600"></i>
                                                            <span className="font-semibold text-blue-700">Date Envoi OBR</span>
                                                        </div>
                                                        <div className="text-blue-800 mt-1">
                                                            {new Date(invoiceDetails.dateEnvoiOBR).toLocaleString('fr-FR')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Envoi Cancel OBR */}
                                                {(invoiceDetails.annuleFacture === 1 ) && (
                                                    <div className="obr-cancel-item p-2 border-1 surface-border border-round bg-orange-50">
                                                        <div className="flex justify-content-between align-items-center">
                                                            <span className="text-sm font-medium text-600">Statut Annulation OBR</span>
                                                            <Tag
                                                                value={invoiceDetails.statusEnvoiCancelOBR === 1 ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                                                severity={invoiceDetails.statusEnvoiCancelOBR === 1 ? 'info' : 'warning'}
                                                                icon={invoiceDetails.statusEnvoiCancelOBR === 1 ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Résumé en bas */}
                        <div className="summary-footer mt-4 p-3 surface-ground border-round">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="text-sm text-600">Créé par: {invoiceDetails.userCreation || 'Système'}</div>
                                </div>
                                <div className="col-12 md:col-6 text-right">
                                    <div className="text-sm text-600">
                                        Dernière mise à jour: {invoiceDetails.dateValidation ?
                                            new Date(invoiceDetails.dateValidation).toLocaleString('fr-FR') :
                                            'Non validée'
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            <style jsx>{`
    .invoice-validation-dialog .p-dialog-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px 12px 0 0;
    }

    .invoice-validation-dialog .p-dialog-header .p-dialog-title {
        color: white;
    }

    .invoice-preview-container {
        font-family: 'Inter', sans-serif;
    }

    .card-header {
        background: #f8f9fa;
        border-bottom: 2px solid #e9ecef;
        padding: 1rem 1.5rem;
    }

    .field-group {
        margin-bottom: 1rem;
    }

    .status-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
    }

    .summary-footer {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border: 1px solid #dee2e6;
    }

    /* Animations */
    .invoice-preview-container {
        animation: fadeIn 0.3s ease-in-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .invoice-validation-dialog {
            width: 95vw !important;
            margin: 1rem;
        }
        
        .grid .col-12.md\:col-4 {
            margin-bottom: 1rem;
        }
    }

    /* Styles pour les cartes */
    .shadow-2 {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .border-left-3 {
        border-left-width: 3px !important;
    }

    .space-y-2 > * + * {
        margin-top: 0.5rem;
    }

    .space-y-3 > * + * {
        margin-top: 0.75rem;
    }
`}</style>


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

            {/* PDFModal pour l'impression de la facture validée */}
            {selectedInvoice && (
                <PDFModal
                    visible={showPdfModal}
                    onHide={() => setShowPdfModal(false)}
                    pdfComponent={FacturePDF}
                    invoice={selectedInvoice}
                />
            )}


            <Dialog
                header="Prévisualisation PDF"
                visible={showPdfPreview}
                style={{ width: '80vw', height: '90vh' }}
                modal
                onHide={() => setShowPdfPreview(false)}
            /*footer={
                <div className="dialog-footer">
                    <PDFDownloadLink
                        document={<FacturePDF invoice={invoiceDetails} />}
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
                */
            >
                {invoiceDetails && (
                    <PDFViewer width="100%" height="500px">
                        <FacturePDF invoice={invoiceDetails} />
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