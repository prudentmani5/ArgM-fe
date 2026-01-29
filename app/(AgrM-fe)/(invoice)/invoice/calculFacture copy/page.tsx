'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Invoice, ManutentionResult } from './Invoice';
import InvoiceForm from './InvoiceForm';
import { InvoiceService } from '../calculFacture/invoiceService';
import { ProformaPDF } from '../calculFacture/ProformaPDF';
import { FacturePDF } from '../calculFacture/FacturePDF';
import { PDFModal } from '../calculFacture/PDFModal';
import { PDFComponentType } from '../calculFacture/pdfTypes';
import Cookies from 'js-cookie';
import { AppUserResponse } from '../../../usermanagement/types';



export default function InvoiceComponent() {
    const [invoice, setInvoice] = useState<Invoice>(new Invoice());
    const [invoiceEdit, setInvoiceEdit] = useState<Invoice>(new Invoice());
    const [editInvoiceDialog, setEditInvoiceDialog] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [printLoading, setPrintLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false);
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [pdfComponent, setPdfComponent] = useState(() => ProformaPDF);
    //const [pdfComponent, setPdfComponent] = useState(() => ProformaPDF);

    const showMessage = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        if (activeIndex === 1) {
            loadAllData();
        }
    }, [activeIndex]);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const data = await InvoiceService.getAllInvoices();
            setInvoices(data);
        } catch (error) {
            showMessage('error', 'Erreur', 'Impossible de charger la liste des factures');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoice(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInvoiceEdit(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setInvoiceEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setInvoice(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setInvoiceEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        const { name, checked } = e.target;

        setInvoice(prev => {
            const updates: Partial<Invoice> = { [name]: checked };

            if (name === 'fixationPlaque') {
                updates.montFixationPlaque = checked ? 11700 : 0;
            }

            if (name === 'exonere') {
                updates.montTVA = checked ? 0 : invoice.montFixeTVA;
            }

            if (name === 'etiquete') {
                updates.montEtiquette = checked ? 0 : invoice.montEtiquette;
            }

            return { ...prev, ...updates };
        });
    };

   // Fonction pour générer la facture proforma
const handleGenerateProforma = () => {
    if (!invoice.rsp) {
        showMessage('error', 'Erreur', 'Veuillez d\'abord calculer la facture avec un RSP');
        return;
    }
    
    if (!invoice.montantPaye || invoice.montantPaye === 0) {
        showMessage('warn', 'Attention', 'Aucun montant calculé. Veuillez effectuer le calcul d\'abord.');
        return;
    }

    showMessage('info', 'Facture Proforma', 'Génération de la facture proforma en cours...');
    
    // Créer une copie sécurisée de l'invoice
    const safeInvoice = { ...invoice };
    setSelectedInvoice(safeInvoice);
    setPdfComponent(() => ProformaPDF); // Utiliser une fonction pour s'assurer du re-rendu
    setShowPdfModal(true);
};

   // Fonction pour imprimer la facture validée
const handlePrintInvoice = async () => {
    if (!invoice.rsp) {
        showMessage('error', 'Erreur', 'Veuillez d\'abord calculer la facture avec un RSP');
        return;
    }
    
    if (!invoice.sortieId) {
        showMessage('error', 'Erreur', 'Le numéro de facture est obligatoire pour l\'impression');
        return;
    }
    
    if (!invoice.montantPaye || invoice.montantPaye === 0) {
        showMessage('warn', 'Attention', 'Aucun montant calculé. Veuillez effectuer le calcul d\'abord.');
        return;
    }

    setPrintLoading(true);

    try {
        // Vérifier si la facture est validée
        const validationResult = await InvoiceService.checkInvoiceValidation(invoice.rsp, invoice.sortieId);
        
        if (validationResult.isValid) {
            // Facture validée - ouvrir directement avec FacturePDF
            const safeInvoice = { ...invoice };
            setSelectedInvoice(safeInvoice);
            setPdfComponent(() => FacturePDF);
            setShowPdfModal(true);
            showMessage('success', 'Facture Validée', 'Ouverture de la facture validée pour impression...');
        } else {
            // Facture non validée - demander confirmation
            confirmDialog({
                message: `Cette facture n'est pas encore validée. Voulez-vous générer une facture proforma à la place ?`,
                header: 'Facture non validée',
                icon: 'pi pi-exclamation-triangle',
                acceptClassName: 'p-button-warning',
                accept: () => {
                    // Générer une proforma à la place
                    const safeInvoice = { ...invoice };
                    setSelectedInvoice(safeInvoice);
                    setPdfComponent(() => ProformaPDF);
                    setShowPdfModal(true);
                    showMessage('warn', 'Attention', 'Génération d\'une facture proforma');
                },
                reject: () => {
                    showMessage('info', 'Information', 'Opération annulée');
                }
            });
        }
    } catch (error) {
        showMessage('error', 'Erreur', 'Erreur lors de la vérification de la facture: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
        
        // En cas d'erreur, proposer de générer une proforma
        confirmDialog({
            message: `La facture n'est pas encore validée. Voulez-vous générer une facture proforma ?`,
            header: 'Vérification impossible',
            icon: 'pi pi-exclamation-circle',
            acceptClassName: 'p-button-warning',
            accept: () => {
                const safeInvoice = { ...invoice };
                setSelectedInvoice(safeInvoice);
                setPdfComponent(() => ProformaPDF);
                setShowPdfModal(true);
                showMessage('warn', 'Attention', 'Génération d\'une facture proforma');
            },
            reject: () => {
                showMessage('info', 'Information', 'Opération annulée');
            }
        });
    } finally {
        setPrintLoading(false);
    }
};

// Fonction pour imprimer depuis la liste
const handlePrintInvoiceFromList = async (data: Invoice) => {
    if (!data.rsp || !data.sortieId) {
        showMessage('error', 'Erreur', 'Données incomplètes pour l\'impression');
        return;
    }

    setPrintLoading(true);

    try {
        const validationResult = await InvoiceService.checkInvoiceValidation(data.rsp, data.sortieId);
        
        if (validationResult.isValid) {
            const safeInvoice = { ...data };
            setSelectedInvoice(safeInvoice);
            setPdfComponent(() => FacturePDF);
            setShowPdfModal(true);
            showMessage('success', 'Facture Validée', 'Ouverture de la facture validée pour impression...');
        } else {
            confirmDialog({
                message: `La facture ${data.sortieId} n'est pas encore validée. Voulez-vous générer une facture proforma ?`,
                header: 'Facture non validée',
                icon: 'pi pi-exclamation-triangle',
                acceptClassName: 'p-button-warning',
                accept: () => {
                    const safeInvoice = { ...data };
                    setSelectedInvoice(safeInvoice);
                    setPdfComponent(() => ProformaPDF);
                    setShowPdfModal(true);
                    showMessage('warn', 'Attention', 'Génération d\'une facture proforma');
                },
                reject: () => {
                    showMessage('info', 'Information', 'Opération annulée');
                }
            });
        }
    } catch (error) {
        showMessage('error', 'Erreur', 'Erreur lors de la vérification de la facture: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
        
        confirmDialog({
            message: `Impossible de vérifier le statut de validation. Voulez-vous générer une facture proforma pour ${data.sortieId} ?`,
            header: 'Vérification impossible',
            icon: 'pi pi-exclamation-circle',
            acceptClassName: 'p-button-warning',
            accept: () => {
                const safeInvoice = { ...data };
                setSelectedInvoice(safeInvoice);
                setPdfComponent(() => ProformaPDF);
                setShowPdfModal(true);
                showMessage('warn', 'Attention', 'Génération d\'une facture proforma');
            },
            reject: () => {
                showMessage('info', 'Information', 'Opération annulée');
            }
        });
    } finally {
        setPrintLoading(false);
    }
};

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setInvoice((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCalculate = async (endpointType: 'menutention' | 'supplement' | 'solde' = 'menutention'): Promise<ManutentionResult> => {
        if (!invoice.rsp) {
            showMessage('error', 'Erreur', 'Veuillez entrer un RSP');
            return new ManutentionResult();
        }

        setBtnLoading(true);

        try {
            let result: ManutentionResult;

            switch (endpointType) {
                case 'menutention':
                    result = await InvoiceService.calculateManutention(invoice.rsp);
                    break;
                case 'supplement':
                    result = await InvoiceService.calculateSupplement(invoice.rsp);
                    break;
                case 'solde':
                    result = await InvoiceService.calculateSolde(invoice.rsp);
                    break;
                default:
                    result = await InvoiceService.calculateManutention(invoice.rsp);
            }

            console.log("🔍 DEBUG API RESPONSE - result complet:", result);
            console.log("🔍 DEBUG API RESPONSE - result.tonnageSolde:", result.tonnageSolde);
            console.log("🔍 DEBUG API RESPONSE - result.tonnageSoldeArrondi:", result.tonnageSoldeArrondi);
            console.log("🔍 DEBUG API RESPONSE - result.typeFacture:", result.typeFacture);

            setInvoice(prev => ({
                ...prev,
                montTotalManut: result.montantTotalManutention,
                montTVA: result.montantTVA,
                montGardienage: result.montantGardiennage,
                montMagasinage: result.montantMagasinage,
                montantPaye: result.montantPaye,
                montEtiquette: result.montEtiquette,
                manutBateau: result.manutBateau,
                manutCamion: result.manutCamion,
                montSalissage: result.montSalissage,
                montPalette: result.montPalette,
                montArrimage : result.montArrimage,
                surtaxeColisLourd:result.surtaxeColisLourd,
                montPesMag: result.montPesMag,
                montLais: result.montFaireSuivre,
                montantReduction: result.montantReduction,
                montFixeTVA: result.montantTVA,
                numFacture: result.facture,
                sortieId: result.facture,
                lt: result.lt || '',
                montRedev: result.redv,
                tauxReduction: result.tauxReduction,
                declarant: result.declarant,
                nomClient: result.nomClient,
                nomMarchandise: result.nomMarchandise,
                clientId: result.clientId,
                marchandiseId: result.marchandiseId,
                dossierId: result.dossierId,
                montantFixationPlaque: result.montantFixationPlaque || 0,
                duree: result.duree,
                duree37: result.duree37,
                tonnageArrondi: result.tonnageArrondi,
                tonnage: result.tonnage,
                dateEntree: result.dateEntree || null,
                dateSortie: result.dateSortie || null,
                nomImportateur: result.nomImportateur || '',
                typeFacture: result.typeFacture || '',
                typeConditionId: result.typeConditionId || '',
                transit:result.transit || false,
                montantDevise: result.montantDevise || 0,
                mont: result.montantDevise || 0,
                peage: result.peage || 0,
                montFixationPlaque: result.montFixationPlaque || 0,
                tarifBarge:result.tarifBarge || 0,
                tarifCamion: result.tarifCamion || 0,
                surtaxeClt: result.surtaxeClt || 0,
                fraisSrsp: result.fraisSrsp || 0,
                fraisArrimage: result.fraisArrimage || 0,
                montMag :result.montMag || 0,
                montMag37 :result.montMag37 || 0,
                tonnageSolde :result.tonnageSolde || 0,
                tonnageSoldeArrondi :result.tonnageSoldeArrondi || 0,
                userCreation: result.userCreation || '',
                userValidation: result.userValidation || '',


            }));

            console.log("🔍 DEBUG APRÈS SETINVOICE - invoice.tonnageSolde devrait être:", result.tonnageSolde || 0);
            console.log("🔍 DEBUG APRÈS SETINVOICE - invoice.tonnageSoldeArrondi devrait être:", result.tonnageSoldeArrondi || 0);

            showMessage('success', 'Succès', 'Calcul effectué avec succès');
            return result;
        } catch (error) {
            showMessage('error', 'Erreur', 'Erreur lors du calcul: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
            return new ManutentionResult();
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!invoice.numFacture) {
            showMessage('error', 'Erreur', 'Le numéro de facture est obligatoire');
            return;
        }

        if (!invoice.rsp) {
            showMessage('error', 'Erreur', 'Le numéro de RSP est obligatoire');
            return;
        }

        if (!invoice.modePayement) {
            showMessage('error', 'Erreur', 'Le mode de paiement est obligatoire');
            return;
        }

        setBtnLoading(true);
        try {
            // Get user data from cookies and concatenate firstname and lastname
            const appUserCookie = Cookies.get('appUser');
            let userCreationName = '';

            if (appUserCookie) {
                try {
                    const userData: AppUserResponse = JSON.parse(appUserCookie);
                    userCreationName = `${userData.firstname} ${userData.lastname}`.trim();
                } catch (error) {
                    console.error('Error parsing user from cookies:', error);
                }
            }

            // Update invoice with userCreation before saving
            const invoiceToSave = {
                ...invoice,
                userCreation: userCreationName
            };

            console.log('💾 Saving invoice with userCreation:', userCreationName);
            console.log('📦 Invoice data to save:', invoiceToSave);

            await InvoiceService.createInvoice(invoiceToSave);
            setInvoice(new Invoice());
            showMessage('success', 'Succès', 'Facture créée avec succès');
            loadAllData();
        } catch (error) {
            showMessage('error', 'Erreur', 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!invoiceEdit.numFacture || !invoiceEdit.factureSortieId) {
            showMessage('error', 'Erreur', 'Le numéro de facture est obligatoire');
            return;
        }

        setBtnLoading(true);
        try {
            await InvoiceService.updateInvoice(invoiceEdit.factureSortieId, invoiceEdit);
            showMessage('success', 'Succès', 'Facture modifiée avec succès');
            setEditInvoiceDialog(false);
            loadAllData();
        } catch (error) {
            showMessage('error', 'Erreur', 'Échec de la modification');
        } finally {
            setBtnLoading(false);
        }
    };

    const getTypeFacture = (invoice: Invoice): string => {
        if (invoice.dateSortie && invoice.dateDerniereSortie) {
            return 'Solde';
        }
        if (invoice.dateSortie && invoice.dateSupplement) {
            return 'Supplement';
        }
        if (invoice.dateSortie && !invoice.dateDerniereSortie && !invoice.dateSupplement) {
            return 'Menutation';
        }
        return '-';
    };

    const loadInvoiceToEdit = (data: Invoice) => {
        if (data) {
            setEditInvoiceDialog(true);
            setInvoiceEdit(data);
        }
    };

    const viewInvoiceDetails = (data: Invoice) => {
        setSelectedInvoice(data);
        setViewInvoiceDialog(true);
    };

   

    const optionButtons = (data: Invoice): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-eye"
                    onClick={() => viewInvoiceDetails(data)}
                    rounded
                    severity='info'
                    tooltip="Voir les détails"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadInvoiceToEdit(data)}
                    rounded
                    severity='warning'
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button
                    icon="pi pi-print"
                    onClick={() => handlePrintInvoiceFromList(data)}
                    rounded
                    severity='help'
                    tooltip="Imprimer la facture"
                    tooltipOptions={{ position: 'top' }}
                    loading={printLoading}
                />
            </div>
        );
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <div className="flex gap-2">
                    <Button type="button" icon="pi pi-refresh" label="Actualiser" outlined onClick={loadAllData} />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher par facture, rsp, LT"
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <PDFModal 
                visible={showPdfModal}
                onHide={() => setShowPdfModal(false)}
                invoice={selectedInvoice || invoice}
                pdfComponent={pdfComponent}
                
            />

            {/* Dialog pour voir les détails d'une facture */}
            <Dialog
                header="Détails de la Facture"
                visible={viewInvoiceDialog}
                style={{ width: '80vw' }}
                modal
                onHide={() => setViewInvoiceDialog(false)}
            >
                {selectedInvoice && (
                    <div className="grid p-fluid">
                        <div className="col-6">
                            <h4>Informations de base</h4>
                            <p><strong>Numéro Facture:</strong> {selectedInvoice.sortieId || '-'}</p>
                            <p><strong>RSP:</strong> {selectedInvoice.rsp || '-'}</p>
                            <p><strong>Lettre Transport:</strong> {selectedInvoice.lt || '-'}</p>
                            <p><strong>Date Sortie:</strong> {InvoiceService.formatDate(selectedInvoice.dateSortie)}</p>
                            <p><strong>Type Facture:</strong> {getTypeFacture(selectedInvoice)}</p>
                        </div>
                        <div className="col-6">
                            <h4>Montants</h4>
                            <p><strong>Total Manutention:</strong> {InvoiceService.formatCurrency(selectedInvoice.montTotalManut)}</p>
                            <p><strong>Magasinage:</strong> {InvoiceService.formatCurrency(selectedInvoice.montMagasinage)}</p>
                            <p><strong>Gardiennage:</strong> {InvoiceService.formatCurrency(selectedInvoice.montGardienage)}</p>
                            <p><strong>TVA:</strong> {InvoiceService.formatCurrency(selectedInvoice.montTVA)}</p>
                            <p><strong>Réduction:</strong> {InvoiceService.formatCurrency(selectedInvoice.montantReduction)}</p>
                            <p><strong>Montant Payé:</strong> {InvoiceService.formatCurrency(selectedInvoice.montantPaye)}</p>
                        </div>
                        <div className="col-12">
                            <div className="flex justify-content-end gap-2 mt-3">
                                <Button
                                    label="Fermer"
                                    icon="pi pi-times"
                                    onClick={() => setViewInvoiceDialog(false)}
                                    className="p-button-text"
                                />
                                <Button
                                    label="Imprimer la facture"
                                    icon="pi pi-print"
                                    onClick={() => {
                                        setViewInvoiceDialog(false);
                                        handlePrintInvoiceFromList(selectedInvoice);
                                    }}
                                    severity="help"
                                    loading={printLoading}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Dialog pour modifier une facture */}
            <Dialog
                header="Modifier Facture"
                visible={editInvoiceDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditInvoiceDialog(false)}
            >
                <InvoiceForm
                    invoice={invoiceEdit}
                    handleChange={handleChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleCheckboxChange={handleCheckboxChange}
                    handleGenerateProforma={handleGenerateProforma}
                    handlePrintInvoice={handlePrintInvoice}
                    handleCalculate={handleCalculate}
                    handleDropdownChange={handleDropdownChange}
                    btnLoading={btnLoading}
                    printLoading={printLoading}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditInvoiceDialog(false)}
                        className="p-button-text"
                    />
                    <Button
                        label="Enregistrer"
                        icon="pi pi-save"
                        loading={btnLoading}
                        onClick={handleSubmitEdit}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <InvoiceForm
                        invoice={invoice}
                        handleChange={handleChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleGenerateProforma={handleGenerateProforma}
                        handlePrintInvoice={handlePrintInvoice}
                        handleCalculate={handleCalculate}
                        handleDropdownChange={handleDropdownChange}
                        btnLoading={btnLoading}
                        printLoading={printLoading}
                    />

                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Réinitialiser"
                            icon="pi pi-refresh"
                            onClick={() => setInvoice(new Invoice())}
                            severity="secondary"
                        />
                        <Button
                            label="Enregistrer"
                            icon="pi pi-save"
                            loading={btnLoading}
                            onClick={handleSubmit}
                            severity="secondary"
                        />
                    </div>
                </TabPanel>

                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable
                            value={invoices}
                            header={renderSearch}
                            paginator
                            rows={10}
                            loading={loading}
                            emptyMessage="Aucune facture trouvée"
                            filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                            selectionMode="single"
                            onSelectionChange={(e) => setSelectedInvoice(e.value as Invoice)}
                        >
                            <Column field="sortieId" header="Numéro Facture" sortable />
                            <Column field="rsp" header="RSP" sortable />
                            <Column field="lt" header="Lettre Transport" sortable />
                            <Column
                                field="dateSortie"
                                header="Date Operation"
                                body={(rowData) => InvoiceService.formatDate(rowData.dateSortie)}
                                sortable
                            />
                            
                            <Column
                                field="montTotalManut"
                                header="Total Manutention"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montTotalManut)}
                                sortable
                            />
                            <Column
                                field="montantReduction"
                                header="Réduction"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montantReduction)}
                                sortable
                            />
                            <Column
                                field="montMagasinage"
                                header="Magasinage"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montMagasinage)}
                                sortable
                            />
                            <Column
                                field="montGardienage"
                                header="Gardiennage"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montGardienage)}
                                sortable
                            />
                            <Column
                                field="montTVA"
                                header="TVA"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montTVA)}
                                sortable
                            />
                            <Column
                                field="montantPaye"
                                header="Montant Payé"
                                body={(rowData) => InvoiceService.formatCurrency(rowData.montantPaye)}
                                sortable
                            />
                            <Column header="Actions" body={optionButtons} style={{ width: '200px' }} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}