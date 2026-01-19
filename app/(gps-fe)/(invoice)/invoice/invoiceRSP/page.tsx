'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Invoice, ManutentionResult } from './Invoice';
import InvoiceForm from './InvoiceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { ManutentionPDF } from './ManutentionPDF';
import { Image as PdfImage } from '@react-pdf/renderer';
import { API_BASE_URL } from '@/utils/apiConfig';

export default function InvoiceComponent() {
    const baseUrl = `${API_BASE_URL}`;
    const [invoice, setInvoice] = useState<Invoice>(new Invoice());
    const [invoiceEdit, setInvoiceEdit] = useState<Invoice>(new Invoice());
    const [editInvoiceDialog, setEditInvoiceDialog] = useState(false);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [showPdfPreview, setShowPdfPreview] = useState(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [viewInvoiceDialog, setViewInvoiceDialog] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadInvoices') {
                setInvoices(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const loadAllData = () => {
        fetchData(null, 'GET', baseUrl + '/invoices/findall', 'loadInvoices');
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

    const handleGeneratePdf = () => {
        setShowPdfPreview(true);
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setInvoice((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCalculate = async (endpointType: 'menutention' | 'supplement' | 'solde' = 'menutention'): Promise<ManutentionResult> => {
        if (!invoice.rsp) {
            accept('error', 'Erreur', 'Veuillez entrer un RSP');
            return new ManutentionResult();
        }

        let endpoint = '';
        switch (endpointType) {
            case 'menutention':
                endpoint = 'calculMenutention';
                break;
            case 'supplement':
                endpoint = 'calculSuplement';
                break;
            case 'solde':
                endpoint = 'calculSolde';
                break;
            default:
                endpoint = 'calculMenutention';
        }

        const encodedRSP = encodeURIComponent(invoice.rsp);
        setBtnLoading(true);

        try {
            const response = await fetchData(
                null,
                'GET',
                `${baseUrl}/invoices/${endpoint}?noRSP=${encodedRSP}&facture=true`,
                'calculateManutention'
            );

            const resultData = data;

            if (resultData && (callType === 'calculateManutention' || response)) {
                const manutentionResult = resultData as ManutentionResult;

                setInvoice(prev => ({
                    ...prev,
                    montTotalManut: manutentionResult.montantTotalManutention,
                    montTVA: manutentionResult.montantTVA,
                    montGardienage: manutentionResult.montantGardiennage,
                    montMagasinage: manutentionResult.montantMagasinage,
                    montantPaye: manutentionResult.montantPaye,
                    montColis: manutentionResult.montColis,
                    montMagasin: manutentionResult.montMagasin,
                    montMagasin37: manutentionResult.montMagasin37,
                    montArrimage: manutentionResult.montArrimage,
                    surtaxeColisLourd: manutentionResult.surtaxeColisLourd,
                    peage: manutentionResult.peage,
                    montEtiquette: manutentionResult.montEtiquette,
                    manutBateau: manutentionResult.manutBateau,
                    manutCamion: manutentionResult.manutCamion,
                    montSalissage: manutentionResult.montSalissage,
                    montPalette: manutentionResult.montPalette,
                    montPesageMagasin: manutentionResult.montPesageMagasin,
                    montFaireSuivre: manutentionResult.montFaireSuivre || 0,
                    montLais: manutentionResult.montFaireSuivre || 0,
                    montantTotalManutention: manutentionResult.montantTotalManutention,
                    montPesMag: manutentionResult.montPesMag,
                    montantReduction: manutentionResult.montantReduction,
                    montantTVA: manutentionResult.montantTVA,
                    montFixeTVA: manutentionResult.montantTVA,
                    numFacture: manutentionResult.facture,
                    sortieId: manutentionResult.facture,
                    lt: manutentionResult.lt,
                    montRedev: manutentionResult.redv,
                    tauxReduction: manutentionResult.tauxReduction,
                    declarant: manutentionResult.declarant,
                    nomClient: manutentionResult.nomClient,
                    nomMarchandise: manutentionResult.nomMarchandise,
                    clientId: manutentionResult.clientId,
                    marchandiseId: manutentionResult.marchandiseId,
                    dossierId: manutentionResult.dossierId,
                    montantFixationPlaque: manutentionResult.montantFixationPlaque || 0,
                    duree: manutentionResult.duree,
                    duree37: manutentionResult.duree37,
                    tonnageArrondi: manutentionResult.tonnageArrondi,
                    tonnage: manutentionResult.tonnage,
                }));

                accept('success', 'Succès', 'Calcul effectué avec succès');
                return manutentionResult;
            } else {
                accept('error', 'Erreur', 'Aucune donnée reçue du serveur');
                return new ManutentionResult();
            }
        } catch (error) {
            accept('error', 'Erreur', 'Erreur lors du calcul: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
            return new ManutentionResult();
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmit = () => {
        if (!invoice.numFacture) {
            accept('error', 'Erreur', 'Le numéro de facture est obligatoire');
            return;
        }

        if (!invoice.sortieId) {
            accept('error', 'Erreur', 'Le numéro de facture est obligatoire');
            return;
        }
        if (!invoice.rsp) {
            accept('error', 'Erreur', 'Le numéro de RSP est obligatoire');
            return;
        }

        if (!invoice.modePayement) {
            accept('error', 'Erreur', 'Le modePayement est obligatoire');
            return;
        }
        const submissionInvoice = {
            ...invoice,
            MontFixationPlaque: invoice.montFixationPlaque ?? 0
        };
        setBtnLoading(true);
        try {
            fetchData(invoice, 'POST', baseUrl + '/invoices/new', 'createInvoice');
            setInvoice(new Invoice());
            accept('success', 'Succès', 'Facture créée avec succès');
        } catch (err) {
            accept('error', 'Erreur', 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = () => {
        if (!invoiceEdit.numFacture) {
            accept('error', 'Erreur', 'Le numéro de facture est obligatoire');
            return;
        }

        setBtnLoading(true);
        fetchData(invoiceEdit, 'PUT', baseUrl + '/invoices/update/' + invoiceEdit.factureSortieId, 'updateInvoice');
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
        if (invoice.dateSupplement) {
            return 'Supplement';
        }
        if (invoice.dateDerniereSortie) {
            return 'Solde';
        }
        return '-';
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateInvoice') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des factures');
        }
        else if (data !== null && error === null) {
            if (callType === 'createInvoice') {
                setInvoice(new Invoice());
                accept('success', 'Succès', 'Facture créée avec succès');
            } else if (callType === 'updateInvoice') {
                accept('success', 'Succès', 'Facture modifiée avec succès');
                setInvoiceEdit(new Invoice());
                setEditInvoiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
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

    const generatePdfForInvoice = (data: Invoice) => {
        setSelectedInvoice(data);
        setShowPdfPreview(true);
    };

    const filteredData = Array.isArray(invoices)
        ? invoices.filter(item => {
            if (!item) return false;

            return JSON.stringify({
                factureId: item.sortieId || '',
                rsp: item.rsp || '',
                reference: item.lt || ''
            }).toLowerCase().includes(globalFilter.toLowerCase());
        })
        : [];

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

    const formatCurrency = (value: number | null) => {
        if (value === null || isNaN(value)) return '';
        return value.toLocaleString('fr-MG', {
            style: 'currency',
            currency: 'BIF'
        });
    };

    const formatDate = (dateString: string | Date | null) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
        } catch {
            return '';
        }
    };

    return (
        <>
            <Toast ref={toast} />

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
                            <p><strong>Date Sortie:</strong> {formatDate(selectedInvoice.dateSortie)}</p>
                            <p><strong>Type Facture:</strong> {getTypeFacture(selectedInvoice)}</p>
                        </div>
                        <div className="col-6">
                            <h4>Montants</h4>
                            <p><strong>Total Manutention:</strong> {formatCurrency(selectedInvoice.montTotalManut)}</p>
                            <p><strong>Magasinage:</strong> {formatCurrency(selectedInvoice.montMagasinage)}</p>
                            <p><strong>Gardiennage:</strong> {formatCurrency(selectedInvoice.montGardienage)}</p>
                            <p><strong>TVA:</strong> {formatCurrency(selectedInvoice.montTVA)}</p>
                            <p><strong>Réduction:</strong> {formatCurrency(selectedInvoice.montantReduction)}</p>
                            <p><strong>Montant Payé:</strong> {formatCurrency(selectedInvoice.montantPaye)}</p>
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
                                    label="Générer PDF"
                                    icon="pi pi-file-pdf"
                                    onClick={() => {
                                        setViewInvoiceDialog(false);
                                        generatePdfForInvoice(selectedInvoice);
                                    }}
                                    severity="danger"
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
                    handleGeneratePdf={handleGeneratePdf}
                    handleCalculate={handleCalculate}
                    handleDropdownChange={handleDropdownChange}
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

            {/* Dialog pour prévisualiser le PDF */}
            <Dialog
                header="Prévisualisation PDF"
                visible={showPdfPreview}
                style={{ width: '80vw', height: '90vh' }}
                onHide={() => setShowPdfPreview(false)}
            >
                <PDFViewer width="100%" height="100%">
                    <ManutentionPDF invoice={selectedInvoice || invoice} />
                </PDFViewer>
                <div className="flex justify-content-end gap-2 mt-3">
                    <PDFDownloadLink
                        document={<ManutentionPDF invoice={selectedInvoice || invoice} />}
                        fileName={`manutention_${(selectedInvoice || invoice).sortieId || 'facture'}.pdf`}
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
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <InvoiceForm
                        invoice={invoice}
                        handleChange={handleChange}
                        handleDateChange={handleDateChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleGeneratePdf={handleGeneratePdf}
                        handleCalculate={handleCalculate}
                        handleDropdownChange={handleDropdownChange}
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
                                body={(rowData) => formatDate(rowData.dateSortie)}
                                sortable
                            />
                            
                            <Column
                                field="montTotalManut"
                                header="Total Manutention"
                                body={(rowData) => formatCurrency(rowData.montTotalManut)}
                                sortable
                            />
                            <Column
                                field="montantReduction"
                                header="Réduction"
                                body={(rowData) => formatCurrency(rowData.montantReduction)}
                                sortable
                            />
                            <Column
                                field="montMagasinage"
                                header="Magasinage"
                                body={(rowData) => formatCurrency(rowData.montMagasinage)}
                                sortable
                            />
                            <Column
                                field="montGardienage"
                                header="Gardiennage"
                                body={(rowData) => formatCurrency(rowData.montGardienage)}
                                sortable
                            />
                            <Column
                                field="montTVA"
                                header="TVA"
                                body={(rowData) => formatCurrency(rowData.montTVA)}
                                sortable
                            />
                            <Column
                                field="montantPaye"
                                header="Montant Payé"
                                body={(rowData) => formatCurrency(rowData.montantPaye)}
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

