'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useMemo, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { OtherInvoice, OtherInvoiceValidationRequest } from './OtherInvoice';
import { Importer } from './Importer';
import OtherInvoiceForm from './OtherInvoiceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar, CalendarChangeEvent } from 'primereact/calendar';
import { InvoiceValidationRequest } from '../validationFacturationRSP_false/ValidInvoice';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { OtherInvoicePdf } from './OtherInvoicePdf'; // Nous créerons ce composant ensuite
import { API_BASE_URL } from '@/utils/apiConfig';

function OtherInvoiceComponent() {
    const baseUrl = `${API_BASE_URL}`;
    const [otherInvoice, setOtherInvoice] = useState<OtherInvoice>(new OtherInvoice());
    const [otherInvoiceEdit, setOtherInvoiceEdit] = useState<OtherInvoice>(new OtherInvoice());
    const [editOtherInvoiceDialog, setEditOtherInvoiceDialog] = useState(false);
    const [otherInvoices, setOtherInvoices] = useState<OtherInvoice[]>([]);
    const [importers, setImporters] = useState<Importer[]>([]);
    const [selectedImporter, setSelectedImporter] = useState<Importer | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importersData, fetchData: fetchImporters } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [showValidateDialog, setShowValidateDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<OtherInvoice | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false);
    const [printPreviewVisible, setPrintPreviewVisible] = useState(false);
    const [invoiceToPrint, setInvoiceToPrint] = useState<OtherInvoice | null>(null);


    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllImporters();
    }, []);

    const paymentModes = [
        { label: 'Espèces', value: '1' },
        { label: 'Chèque', value: '2' },
        { label: 'Virement', value: '3' },
        { label: 'Carte Bancaire', value: '4' }
    ];

    const handlePrintPreview = (invoice: OtherInvoice) => {
        setInvoiceToPrint(invoice);
        setPrintPreviewVisible(true);
    };

    //  Amélioration du useEffect de chargement initial
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                await loadAllImporters();
                await loadAllData();
            } catch (error) {
                console.error("Erreur de chargement initial:", error);
                accept('error', 'Erreur', 'Échec du chargement des données initiales');
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadOtherInvoices') {
                setOtherInvoices(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
        if (importersData && callType === 'loadImporters') {
            setImporters(Array.isArray(importersData) ? importersData : [importersData]);
        }
    }, [data, importersData]);

    // Chargement initial
    useEffect(() => {
        const loadImporters = async () => {
            try {
                const response = await fetch(baseUrl + '/otherInvoices/findallImporters');

                //await fetchImporters(null, 'GET', `${baseUrl}/importers/findall`, 'loadImporters');
                if (!response.ok) throw new Error('Erreur réseau');
                const data = await response.json();
                setImporters(data);
            } catch (error) {
                console.error("Erreur de chargement:", error);
                accept('error', 'Erreur', 'Impossible de charger les services');
            }
        };
        loadImporters();
    }, []);

    // Gestion de la sélection
    const handleServiceSelect = (e: DropdownChangeEvent) => {
        const selectedId = e.value;
        const service = importers.find(s => s.importateurId === selectedId);
        setSelectedImporter(service || null);

        if (!editOtherInvoiceDialog) {
            setOtherInvoice(prev => ({ ...prev, importateurId: selectedId }));
        } else {
            setOtherInvoiceEdit(prev => ({ ...prev, importateurId: selectedId }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setOtherInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOtherInvoiceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleValueChange = (e: any) => {
        const { name, value } = e.target;
        setOtherInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleValueChangeEdit = (e: InputNumberValueChangeEvent) => {
        setOtherInvoiceEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    // Fonctions de chargement des données
    const loadData = async () => {
        try {
            const [invoicesRes, importersRes] = await Promise.all([
                fetch(`${baseUrl}/otherInvoices/findall`),
                fetch(`${baseUrl}/otherInvoices/findallImporters`)
            ]);

            const invoices = await invoicesRes.json();
            const importers = await importersRes.json();

            setOtherInvoices(Array.isArray(invoices) ? invoices : [invoices]);
            setImporters(Array.isArray(importers) ? importers : [importers]);
        } catch (error) {
            console.error("Erreur de chargement:", error);
            showToast('error', 'Erreur', 'Échec du chargement des données');
        }
    };
    // Et modifiez la partie serviceOptions
    const importerOptions = useMemo(() => {
        return importers.map(s => ({ label: s.nom, value: s.importateurId }));
    }, [importers]);

    const handleDropDownSelect = (e: DropdownChangeEvent) => {
        setOtherInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropDownSelectEdit = (e: DropdownChangeEvent) => {
        setOtherInvoiceEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (e: CalendarChangeEvent, field: string) => {
        const value = e.value as Date;
        if (!editOtherInvoiceDialog) {
            setOtherInvoice(prev => ({ ...prev, [field]: value }));
        } else {
            setOtherInvoiceEdit(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        if (!otherInvoice.libelle) {
            accept('error', 'Erreur', 'Le libellé est obligatoire');
            return;
        }

        if (!otherInvoice.clientId) {
            accept('error', 'Erreur', 'Veuillez sélectionner un importateur');
            return;
        }

        setBtnLoading(true);
        try {
            const response = await fetch(baseUrl + '/otherInvoices/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(otherInvoice)
            });

            if (!response.ok) throw new Error('Échec de l\'enregistrement');

            const savedInvoice = await response.json();

            // Mettre à jour l'état avec la facture complète renvoyée par le backend
            setOtherInvoice(savedInvoice);

            accept('success', 'Succès', `Facture ${savedInvoice.autreFactureId} créée avec succès`);
        } catch (error) {
            console.error("Erreur d'enregistrement:", error);
            accept('error', 'Erreur', 'Échec de l\'enregistrement');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = () => {
        if (!otherInvoiceEdit.libelle) {
            accept('error', 'Erreur', 'Le libellé est obligatoire');
            return;
        }

        if (!otherInvoiceEdit.clientId) {
            accept('error', 'Erreur', 'Veuillez sélectionner un importateur');
            return;
        }

        setBtnLoading(true);
        fetchData(otherInvoiceEdit, 'PUT', baseUrl + '/otherInvoices/update/' + otherInvoiceEdit.autreFactureId, 'updateOtherInvoice');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateOtherInvoice') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des autres factures');
        }
        else if (data !== null && error === null) {
            if (callType === 'createOtherInvoice') {
                setOtherInvoice(new OtherInvoice());
                accept('success', 'Succès', 'Autre facture créée avec succès');
            } else if (callType === 'updateOtherInvoice') {
                accept('success', 'Succès', 'Autre facture modifiée avec succès');
                setOtherInvoiceEdit(new OtherInvoice());
                setEditOtherInvoiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadOtherInvoiceToEdit = (data: OtherInvoice) => {
        if (data) {
            setEditOtherInvoiceDialog(true);
            setOtherInvoiceEdit(data);
            importers.forEach(importer => {
                if (importer.importateurId === data.clientId) {
                    setSelectedImporter(importer);
                }
            });
        }
    };

    const handleValidateRow = async () => {
        if (!selectedInvoice?.autreFactureId) {
            accept('error', 'Erreur', 'Facture invalide');
            return;
        }

        setBtnLoading(true);
        try {
            const response = await fetch(`${baseUrl}/otherInvoices/validate?id=${selectedInvoice.autreFactureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    motifAnnulation: null,
                    autreFactureId: selectedInvoice.autreFactureId
                })
            });

            if (!response.ok) throw new Error('Échec de validation');

            const result = await response.json();
            accept('success', 'Succès', `Facture ${result.autreFactureId} validée avec succès`);
            loadAllData();
            setShowValidateDialog(false);
            setSelectedInvoice(null);
            setViewInvoiceDialog(false); // Ajoutez cette ligne
        } catch (error) {
            console.error("Erreur de validation:", error);
            accept('error', 'Erreur', 'Échec de la validation');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleCancelRow = async () => {
        if (!selectedInvoice?.autreFactureId || cancelReason.trim() === '') {
            accept('error', 'Erreur', 'Motif d\'annulation requis');
            return;
        }

        setBtnLoading(true);
        try {
            const response = await fetch(`${baseUrl}/otherInvoices/validate?id=${selectedInvoice.autreFactureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    motifAnnulation: cancelReason,
                    autreFactureId: selectedInvoice.autreFactureId,
                    cancelledBy: 'SYSTEM',
                    dateValidation: selectedInvoice.dateValidation

                })
            });

            if (!response.ok) throw new Error('Échec de l\'annulation');

            const result = await response.json();
            accept('success', 'Succès', `Facture ${result.autreFactureId} annulée avec succès`);
            loadAllData();
            setShowCancelDialog(false);
            setSelectedInvoice(null);
            setCancelReason('');
        } catch (error) {
            console.error("Erreur d'annulation:", error);
            accept('error', 'Erreur', 'Échec de l\'annulation');
        } finally {
            setBtnLoading(false);
        }
    };


    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>

                <Button
                    icon="pi pi-eye"
                    onClick={() => {
                        setSelectedInvoice(data);
                        setViewInvoiceDialog(true);
                    }}
                    rounded
                    severity='info'
                    tooltip="Voir détails"
                    tooltipOptions={{ position: 'top' }}
                />

                {!data.dateValidation && (
                    <Button
                        icon="pi pi-pencil"
                        onClick={() => loadOtherInvoiceToEdit(data)}
                        rounded
                        severity='warning'
                        tooltip="Modifier"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}



            </div>
        );
    };



    //Modification de loadAllData et loadAllImporters
    const loadAllData = async () => {
        try {
            await fetchData(null, 'GET', `${baseUrl}/otherInvoices/findall`, 'loadOtherInvoices');
        } catch (error) {
            console.error("Erreur de chargement des factures:", error);
            accept('error', 'Erreur', 'Échec du chargement des factures');
        }
    };

    const loadAllImporters = async () => {
        try {
            await fetchImporters(null, 'GET', `${baseUrl}/otherInvoices/findallImporters`, 'loadImporters');
        } catch (error) {
            console.error("Erreur de chargement des importateurs:", error);
            accept('error', 'Erreur', 'Échec du chargement des importateurs');
        }
    };

    //Ajoutez ce useEffect pour debugger
    useEffect(() => {
        console.log("Données chargées:", {
            otherInvoices,
            importers,
            loading,
            error
        });
    }, [otherInvoices, importers, loading, error]);


    useEffect(() => {
        if (importersData && callType === 'loadImporters') {
            console.log('clients chargés:', importersData);
            setImporters(Array.isArray(importersData) ? importersData : [importersData]);
        }
        if (data && callType === 'loadOtherInvoices') {
            console.log('factures chargés:', data);
            setOtherInvoices(Array.isArray(data) ? data : [data]);
        }
    }, [data, importersData, callType]);

    function CompareString(a: number | string, b: number | string, caseSensitive = false): number {
        const strA = String(a);
        const strB = String(b);

        if (!caseSensitive) {
            return strA.localeCompare(strB, undefined, { sensitivity: 'base' });
        }
        return strA.localeCompare(strB);
    }

    useEffect(() => {
        const comparison = CompareString(otherInvoice.poidsPese, otherInvoice.poidsPaye, false);

        setOtherInvoice(prev => ({
            ...prev,
            soldePositif: comparison > 0 ? prev.poidsPese - prev.poidsPaye : 0,
            soldeNegatif: comparison <= 0 ? prev.poidsPaye - prev.poidsPese : 0
        }));
    }, [otherInvoice.poidsPese, otherInvoice.poidsPaye]);


    useEffect(() => {
        const poidsRoute = Number(otherInvoice.poidsRoute) || 0;
        const soldePositif = Number(otherInvoice.soldePositif) || 0;
        const soldeNegatif = Number(otherInvoice.soldeNegatif) || 0;

        let poidsNetAPayer = 0;

        if (soldePositif > 0) {
            poidsNetAPayer = poidsRoute + soldePositif;
        } else if (soldeNegatif > 0) {
            poidsNetAPayer = poidsRoute - soldeNegatif;
        } else {
            poidsNetAPayer = poidsRoute; // Default case if no solde
        }

        setOtherInvoice(prev => ({
            ...prev,
            poidsNetAPayer,
            qteBateau: poidsNetAPayer,
            qteSurtaxe: poidsNetAPayer * 10,
            qteSalissage: poidsNetAPayer
        }));

    }, [otherInvoice.poidsRoute, otherInvoice.soldePositif, otherInvoice.soldeNegatif]);




    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatCurrency = (value: number | null) => {
        if (value === null) return '-';
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    };

    const getImporterName = (importerId: number | null): string => {
        if (!importerId || !importers || importers.length === 0) return 'Inconnu';
        const importer = importers.find(i => i.importateurId === importerId);
        return importer ? importer.nom : 'Inconnu';
    };


    const handleValidate = async () => {
        if (!otherInvoice.autreFactureId) {
            accept('error', 'Erreur', 'Veuillez d\'abord enregistrer la facture');
            return;
        }
        const validationRequest = new OtherInvoiceValidationRequest(
            otherInvoice.autreFactureId,
            true,
        );

        setBtnLoading(true);
        try {
            const response = await fetch(`${baseUrl}/otherInvoices/validate?id=${otherInvoice.autreFactureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    motifAnnulation: null,
                    autreFactureId: otherInvoice.autreFactureId
                    // cancelledBy: 'SYSTEM',
                    //user              
                }


                )
            });

            if (!response.ok) throw new Error('Échec de validation');

            const result = await response.json();
            accept('success', 'Succès', `Facture ${result.autreFactureId} validée avec succès`);
        } catch (error) {
            console.error("Erreur de validation:", error);
            accept('error', 'Erreur', 'Échec de la validation');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleCancel = async (cancelReason: string) => {
        if (!otherInvoice.autreFactureId) {
            accept('error', 'Erreur', 'Veuillez d\'abord enregistrer la facture');
            return;
        }
        const validationRequest = new OtherInvoiceValidationRequest(
            otherInvoice.autreFactureId,
            true
        );
        setBtnLoading(true);
        try {
            const response = await fetch(`${baseUrl}/otherInvoices/validate?id=${otherInvoice.autreFactureId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    motifAnnulation: cancelReason,
                    cancelledBy: 'SYSTEM',
                    //user              
                }


                )
            });

            if (!response.ok) throw new Error('Échec de l\'annulation');

            const result = await response.json();
            accept('success', 'Succès', `Facture ${result.autreFactureId} annulée avec succès`);
            //setOtherInvoice(new OtherInvoice()); // Réinitialiser le formulaire
        } catch (error) {
            console.error("Erreur d'annulation:", error);
            accept('error', 'Erreur', 'Échec de l\'annulation');
        } finally {
            setBtnLoading(false);
        }
    };
    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={() => setGlobalFilter('')}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher par importateur, libellé ou montant..."
                    className="w-full"
                />
            </span>
        </div>
    );

    const filteredData = otherInvoices.filter(item => {
        return JSON.stringify({
            importer: getImporterName(item.clientId),
            libelle: item.libelle,
            montant: item.montantManut,
            autreFactureId: item.autreFactureId
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Autre Facture"
                visible={editOtherInvoiceDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditOtherInvoiceDialog(false)}
            >
                <OtherInvoiceForm
                    otherInvoice={otherInvoiceEdit}
                    importers={importers}
                    selectedImporter={selectedImporter}
                    handleChange={handleChangeEdit}
                    handleValueChange={handleValueChangeEdit}
                    handleDropDownSelect={handleDropDownSelectEdit}
                    handleDateChange={handleDateChange}
                //onValidate={() => {
                // Implémentez la logique de validation pour l'édition si nécessaire
                // accept('info', 'Information', 'Validation pour édition à implémenter');
                // }}
                // showValidateButton={true}
                />


                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditOtherInvoiceDialog(false)}
                        className="p-button-text"
                    />

                    <Button
                        label="Enregistrer"
                        icon="pi pi-check"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />

                </div>
            </Dialog>

            <Dialog
                header="Confirmation de validation"
                visible={showValidateDialog}
                style={{ width: '50vw' }}
                onHide={() => {
                    setShowValidateDialog(false);
                    setSelectedInvoice(null);
                }}
            >
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                    <span>Êtes-vous sûr de vouloir valider la facture <b>{selectedInvoice?.autreFactureId}</b> ?</span>
                </div>
                <div className="flex justify-content-end gap-2 mt-3">

                    <Button
                        label="Non"
                        icon="pi pi-times"
                        onClick={() => {
                            setShowValidateDialog(false);
                            setSelectedInvoice(null);
                        }}
                        className="p-button-text"
                    />

                    <Button
                        label="Oui"
                        icon="pi pi-check"
                        onClick={handleValidateRow}
                        loading={btnLoading}
                        severity="success"
                    />
                </div>
            </Dialog>


            {/* Dialogue d'annulation */}
            <Dialog
                header="Motif d'annulation"
                visible={showCancelDialog}
                style={{ width: '50vw' }}
                onHide={() => {
                    setShowCancelDialog(false);
                    setSelectedInvoice(null);
                    setCancelReason('');
                }}
            >
                <div className="p-field">
                    <label htmlFor="cancelReason">Veuillez saisir le motif d'annulation pour la facture <b>{selectedInvoice?.autreFactureId}</b></label>
                    <InputText
                        id="cancelReason"
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="w-full"
                        required
                        autoFocus
                    />
                </div>
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Retour"
                        icon="pi pi-arrow-left"
                        onClick={() => {
                            setShowCancelDialog(false);
                            setSelectedInvoice(null);
                            setCancelReason('');
                        }}
                        className="p-button-text"
                    />
                    <Button
                        label="Confirmer l'annulation"
                        icon="pi pi-check"
                        onClick={handleCancelRow}
                        disabled={!cancelReason.trim()}
                        loading={btnLoading}
                        severity="danger"
                    />
                </div>
            </Dialog>

            <Dialog
                header={`Détails de la facture ${selectedInvoice?.autreFactureId || ''}`}
                visible={viewInvoiceDialog}
                style={{ width: '80vw', maxWidth: '1200px' }}
                maximizable
                modal
                onHide={() => {
                    setViewInvoiceDialog(false);
                    setSelectedInvoice(null);
                }}
            >
                {selectedInvoice && (
                    <div className="service-details-grid">
                        {/* Carte Informations Générales */}
                        <Card className="info-card">
                            <div className="card-header">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>Informations Générales</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Numéro Facture</label>
                                    <div className="detail-value">{selectedInvoice.autreFactureId}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Référence</label>
                                    <div className="detail-value">{selectedInvoice.libelle || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Client</label>
                                    <div className="detail-value">{getImporterName(selectedInvoice.clientId) || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Bateau</label>
                                    <div className="detail-value">{selectedInvoice.nomBateau || '-'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Mode de Paiement</label>
                                    <div className="detail-value">
                                        {paymentModes.find(m => m.value === selectedInvoice.modePayement)?.label || 'Non spécifié'}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>Date Facture</label>
                                    <div className="detail-value">
                                        {selectedInvoice.dateFacture ? formatDate(selectedInvoice.dateFacture) : '-'}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Carte Poids et Quantités */}
                        <Card className="dates-card">
                            <div className="card-header">
                                <i className="pi pi-weight mr-2"></i>
                                <span>Poids et Quantités</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>Poids Bateau (kg)</label>
                                    <div className="detail-value">{selectedInvoice.qteBateau || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Poids Pesé (kg)</label>
                                    <div className="detail-value">{selectedInvoice.poidsPese || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Poids Net (kg)</label>
                                    <div className="detail-value">{selectedInvoice.poidsNetAPayer || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Nombre de Nuitées</label>
                                    <div className="detail-value">{selectedInvoice.nbreNuite || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Quantité Péage</label>
                                    <div className="detail-value">{selectedInvoice.qtePeage || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Solde Positif</label>
                                    <div className="detail-value">{selectedInvoice.soldePositif || '0'}</div>
                                </div>
                                <div className="detail-item">
                                    <label>Solde Négatif</label>
                                    <div className="detail-value">{selectedInvoice.soldeNegatif || '0'}</div>
                                </div>
                            </div>
                        </Card>

                        {/* Carte Montants */}
                        <Card className="montants-card">
                            <div className="card-header">
                                <i className="pi pi-money-bill mr-2"></i>
                                <span>Montants</span>
                            </div>
                            <div className="card-content">
                                <div className="detail-item">
                                    <label>PU Bateau</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.puBateau)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>PU Surtaxe</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.puSurtaxe)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>PU Salissage</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.puSalissage)}
                                    </div>
                                </div>


                                   <div className="detail-item">
                                    <label>Redevance</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.redevance)}
                                    </div>
                                </div>
                                 
                                  <div className="detail-item">
                                    <label>PU Peage</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.puPeage)}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label>AbonnementTour</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.abonnementTour)}
                                    </div>
                                </div>

                                 <div className="detail-item">
                                    <label>AbonnementTour</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.abonnementTour)}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label>RedevGardiennage</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.redevGardiennage)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label>TVA</label>
                                    <div className="detail-value">
                                        {formatCurrency(selectedInvoice.tva)}
                                    </div>
                                </div>

                                <Divider />

                                <div className="status-item">
                                    <label>Statut</label>
                                    <div className="status-value">
                                        <Tag
                                            severity={selectedInvoice.dateValidation ? 'success' : 'danger'}
                                            value={selectedInvoice.dateValidation ? 'Validée' : 'Non validée'}
                                        />
                                    </div>
                                </div>

                                {selectedInvoice.dateValidation && (
                                    <div className="detail-item">
                                        <label>Date Validation</label>
                                        <div className="detail-value">
                                            {formatDate(selectedInvoice.dateValidation)}
                                        </div>
                                    </div>
                                )}

                                {selectedInvoice.motifAnnulation && (
                                    <>
                                        <div className="detail-item">
                                            <label>Motif Annulation : {selectedInvoice.motifAnnulation}</label>

                                        </div>
                                        <div className="detail-item">
                                            <label>Annulé par {selectedInvoice.userAnnulation} le  {selectedInvoice.dateAnnulation ? formatDate(selectedInvoice.dateAnnulation) : '-'}
                                            </label>

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
                                                value={selectedInvoice.statusEnvoiOBR === 1 ? 'Envoyée' : 'Non envoyée'}
                                                severity={selectedInvoice.statusEnvoiOBR === 1 ? 'success' : 'danger'}
                                                icon={selectedInvoice.statusEnvoiOBR === 1 ? 'pi pi-check' : 'pi pi-times'}
                                            />
                                        </div>
                                    </div>

                                    {/* Date Envoi OBR */}
                                    {selectedInvoice.dateEnvoiOBR && (
                                        <div className="detail-item">
                                            <label>Date Envoi OBR</label>
                                            <div className="detail-value" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                                {formatDate(selectedInvoice.dateEnvoiOBR)}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Envoi Cancel OBR */}
                                    {(selectedInvoice.annuleFacture == 1 || selectedInvoice.annuleFacture === true) && (
                                        <div className="detail-item">
                                            <label>Statut Annulation OBR</label>
                                            <div className="detail-value">
                                                <Tag
                                                    value={(selectedInvoice.statusEnvoiCancelOBR == 1 || selectedInvoice.statusEnvoiCancelOBR === true) ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                                    severity={(selectedInvoice.statusEnvoiCancelOBR == 1 || selectedInvoice.statusEnvoiCancelOBR === true) ? 'info' : 'warning'}
                                                    icon={(selectedInvoice.statusEnvoiCancelOBR == 1 || selectedInvoice.statusEnvoiCancelOBR === true) ? 'pi pi-check' : 'pi pi-exclamation-triangle'}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                <div className="flex justify-content-end gap-2 mt-3">
                    {!!selectedInvoice?.dateValidation && !selectedInvoice?.dateAnnulation && (
                        <>
                            <Button
                                label="Annuler la facture"
                                icon="pi pi-times"
                                severity="danger"
                                onClick={() => {
                                    setViewInvoiceDialog(false);
                                    setShowCancelDialog(true);
                                    setCancelReason('');

                                }}
                            //disabled={selectedInvoice?.dateAnnulation!=null}
                            />
                        </>
                    )}
                    {!selectedInvoice?.dateValidation && (
                        <>
                            <Button
                                label="Valider la facture"
                                icon="pi pi-check"
                                severity="success"
                                onClick={() => {
                                    setViewInvoiceDialog(false);
                                    setShowValidateDialog(true);
                                }}
                                disabled={!!selectedInvoice?.dateValidation}
                            />
                        </>
                    )}
                    {selectedInvoice?.autreFactureId && (<PDFDownloadLink
                        document={<OtherInvoicePdf otherInvoice={selectedInvoice} />}
                        fileName={`facture_${selectedInvoice?.autreFactureId}.pdf`}
                    >
                        {({ loading }) => (
                            <Button
                                label="Imprimer"
                                icon="pi pi-print"
                                loading={loading}
                                disabled={loading}
                                className="p-button-text"
                            />
                        )}
                    </PDFDownloadLink>
                    )}
                    <Button
                        label="Fermer"
                        icon="pi pi-times"
                        onClick={() => setViewInvoiceDialog(false)}
                        className="p-button-text"
                    />
                </div>
            </Dialog>
            <style jsx>{`
                        /* Styles pour le dialog de visualisation */
.service-details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.card-header {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    font-weight: 600;
}

.card-content {
    padding: 1.25rem;
}

.detail-item {
    margin-bottom: 0.75rem;
}

.detail-item label {
    display: block;
    font-size: 0.875rem;
    color: #6c757d;
    margin-bottom: 0.25rem;
}

.detail-value {
    font-weight: 500;
    color: #495057;
}

.status-item {
    margin: 1rem 0;
}

.status-value {
    margin-top: 0.5rem;
}

/* Styles spécifiques pour chaque carte */
.info-card {
    border-top: 3px solid #17a2b8;
}

.dates-card {
    border-top: 3px solid #6f42c1;
}

.montants-card {
    border-top: 3px solid #28a745;
}
                
            `}</style>


            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouvelle Facture">
                    <OtherInvoiceForm
                        otherInvoice={otherInvoice}
                        importers={importers}
                        selectedImporter={selectedImporter}
                        handleChange={handleChange}
                        handleValueChange={handleValueChange}
                        handleDropDownSelect={handleDropDownSelect}
                        handleDateChange={handleDateChange}
                        onValidate={handleValidate}
                        showValidateButton={true}
                        //onValidate={handleValidate}
                        onCancel={handleCancel}
                        //showValidateButton={true}
                        showCancelButton={true}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setOtherInvoice(new OtherInvoice())}
                            severity="secondary"
                        />
                        {!otherInvoice.autreFactureId && (
                            <Button
                                label="Enregistrer"
                                icon="pi pi-save"
                                loading={btnLoading}
                                onClick={handleSubmit}
                                disabled={!!otherInvoice.autreFactureId}
                            />
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Factures">
                    <div className="card">
                        <DataTable
                            value={filteredData}
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucune autre facture trouvée"
                            filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                        >
                            <Column
                                field="autreFactureId"
                                header="No Facture"
                                sortable
                                filter
                                filterPlaceholder="Rechercher par No Facture"
                            />

                            <Column
                                field="libelle"
                                header="Libellé"
                                sortable
                                filter
                                filterPlaceholder="Rechercher par libellé"
                            />
                           {/* <Column
                                header="Importateur"
                                body={(rowData) => getImporterName(rowData.clientId)}
                                sortable
                                sortField="clientId"
                            /> */}
                            <Column
                                field="nomBateau"
                                header="Bateau"
                                sortable
                            />
                            <Column
                                field="dateFacture"
                                header="Date Facture"
                                body={(rowData) => formatDate(rowData.dateFacture)}
                                sortable
                            />
                            <Column
                                field="montantManut"
                                header="Montant Manut."
                                body={(rowData) => formatCurrency(rowData.montantManut)}
                                sortable
                            />

                            {/* OBR Status Columns */}
                            <Column
                                field="statusEnvoiOBR"
                                header="Statut Envoi OBR"
                                body={(rowData) => {
                                    const hasDateEnvoi = rowData.dateEnvoiOBR != null && rowData.dateEnvoiOBR !== '';
                                    return (
                                        <span
                                            className={`font-bold ${hasDateEnvoi
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                }`}
                                        >
                                            {hasDateEnvoi ? 'Envoyée' : 'Non envoyée'}
                                        </span>
                                    );
                                }}
                                sortable
                            />

                            <Column
                                field="dateEnvoiOBR"
                                header="Date Envoi OBR"
                                body={(rowData) => {
                                    if (!rowData.dateEnvoiOBR) return '';
                                    try {
                                        const date = new Date(rowData.dateEnvoiOBR);
                                        return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
                                    } catch {
                                        return '';
                                    }
                                }}
                                sortable
                            />

                            <Column
                                field="statusEnvoiCancelOBR"
                                header="Statut Annulation OBR"
                                body={(rowData) => {
                                    if (rowData.annuleFacture == 1 || rowData.annuleFacture === true) {
                                        const status = rowData.statusEnvoiCancelOBR;
                                        const isEnvoye = status == 1 || status === true;
                                        return (
                                            <span
                                                className={`font-bold ${isEnvoye
                                                        ? 'text-blue-600'
                                                        : 'text-orange-600'
                                                    }`}
                                            >
                                                {isEnvoye ? 'Annulation envoyée' : 'Annulation non envoyée'}
                                            </span>
                                        );
                                    } else {
                                        return <span className="text-gray-500">Non applicable</span>;
                                    }
                                }}
                                sortable
                            />

                            <Column
                                header="Actions"
                                body={optionButtons}
                                style={{ width: '100px' }}
                            />
                        </DataTable>

                    </div>
                </TabPanel>
            </TabView>

        </>
    );
}

export default OtherInvoiceComponent;

function showToast(arg0: string, arg1: string, arg2: string) {
    throw new Error('Function not implemented.');
}
