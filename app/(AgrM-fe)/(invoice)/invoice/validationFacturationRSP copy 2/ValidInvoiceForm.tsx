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
import { ValidPdf } from './ValidPdf';
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
        statutEncaissement: '',
         tarifBarge: 0,
    tarifCamion:  0,
    fraisSrsp: 0,// salissage
    fraisArrimage: 0,//Arrimage
     SurtaxeClt: 0, //colis lourd

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
                // Adapter selon que vous retournez ValidateFactureResponse ou FactureSortie
                const options = Array.isArray(data) ? data.map(item => ({
                    label: item.typeFacturation || item.numFacture || 'N/A',
                    value: item.sortieId || item.numFacture || '',
                    typefacturation: item.typeFacturation || item.typefacturation || ''
                })) : [];

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
            // Effectuer toutes les requêtes en parallèle
            const [
                mainResponse,
                marchandiseResponse,
                clientResponse,
                dateEntreeResponse,
                typeConditionResponse,
                typeFactureResponse,
                calculDataResponse,
                dateSupplementResponse,
                dateDerniereResponse,
                tarifsResponse // Nouvel appel pour les tarifs
            ] = await Promise.all([
                fetch(buildApiUrl(`/invoices/findBySortieIdAndRsp?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/findNomMarchandise?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/findNomClient?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/dateentre?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/typeCondition?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/typeFacture?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/calculData?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/dateSuplement?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetch(buildApiUrl(`/invoices/dateDerniereSortie?rsp=${encodedRSP}&sortieId=${encodeFacture}`)),
                fetchTarifs(invoice.rsp, invoice.sortieId) // Appel de la nouvelle fonction
            ]);

            if (!mainResponse.ok) {
                throw new Error('Erreur lors de la récupération des détails de la facture');
            }

            const mainData = await mainResponse.json();
            const marchandiseName = await marchandiseResponse.text();
            const clientName = await clientResponse.text();
            const calculData = await calculDataResponse.json();

            // Traitement des dates
            let dateEntree = null;
            if (dateEntreeResponse.ok) {
                const dateEntreeText = await dateEntreeResponse.text();
                if (dateEntreeText && dateEntreeText.trim() !== '' && dateEntreeText !== 'null') {
                    dateEntree = new Date(dateEntreeText);
                }
            }

            let dateSupplement = null;
            if (dateSupplementResponse.ok) {
                const dateSupplementText = await dateSupplementResponse.text();
                if (dateSupplementText && dateSupplementText.trim() !== '' && dateSupplementText !== 'null') {
                    dateSupplement = new Date(dateSupplementText);
                }
            }

            let dateDerniere = null;
            if (dateDerniereResponse.ok) {
                const dateDerniereText = await dateDerniereResponse.text();
                if (dateDerniereText && dateDerniereText.trim() !== '' && dateDerniereText !== 'null') {
                    dateDerniere = new Date(dateDerniereText);
                }
            }

            // Récupération du typeConditionId
            let typeConditionId = '';
            if (typeConditionResponse.ok) {
                const typeConditionText = await typeConditionResponse.text();
                if (typeConditionText && typeConditionText.trim() !== '' && typeConditionText !== 'null') {
                    typeConditionId = typeConditionText.trim();
                }
            }

            // Récupération du typeFacture
            let typeFacture = '';
            if (typeFactureResponse.ok) {
                const typeFactureText = await typeFactureResponse.text();
                if (typeFactureText && typeFactureText.trim() !== '' && typeFactureText !== 'null') {
                    typeFacture = typeFactureText.trim();
                }
            }

            if (mainData) {
                 console.log('Données parsées:', mainData);
                // Calcul du tonnage arrondi
                const tonnageArrondi = calculateTonnageArrondi(
                    calculData.tonnage || 0,
                    typeConditionId,
                    calculData.nbreColis || 0
                );

                const updatedDetails = {
                    ...mainData,
                    nomMarchandise: marchandiseName || mainData.nomMarchandise || '-',
                    nomClient: clientName || mainData.nomClient || '-',
                    dateEntree: dateEntree || mainData.dateEntree || mainData.dateCreation,
                    dateSupplement: dateSupplement || mainData.dateSupplement || mainData.dateSupplement,
                    dateDerniere: dateDerniere || mainData.dateDerniere || mainData.dateDerniere,
                    typeConditionId: typeConditionId || mainData.typeConditionId || '',
                    typeFacture: typeFacture || mainData.typeFacture || '',
                    duree: calculData.duree || 0,
                    duree37: calculData.duree37 || 0,
                    montPrixMagasin: calculData.prixMagasin || 0,
                    montPrixMagasin37: calculData.prixMagasin37 || 0,
                    tonnage: calculData.tonnage || 0,
                    nbreColis: calculData.nbreColis || 0,
                    tonnageArrondi: tonnageArrondi,
                    // Ajout des tarifs récupérés
                    tarifBarge: tarifsResponse.tarifBarge,
                    tarifCamion: tarifsResponse.tarifCamion,
                    fraisSrsp: tarifsResponse.fraisSrsp,
                    fraisArrimage: tarifsResponse.fraisArrimage,
                    SurtaxeClt: tarifsResponse.SurtaxeClt,
                };

                setInvoiceDetails(updatedDetails);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Erreur détaillée:', error);
            showToast('error', 'Erreur', 'Erreur de récupération des données');
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
                            disabled={invoiceDetails?.dateAnnulation !== null || invoiceDetails?.dateValidation == null}
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

                                <div className="detail-item">
                                    <label>Dure</label>
                                    <div className="detail-value">{invoiceDetails.duree || 0}</div>
                                </div>

                                <div className="detail-item">
                                    <label>Dure37</label>
                                    <div className="detail-value">{invoiceDetails.duree37 || 0}</div>
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