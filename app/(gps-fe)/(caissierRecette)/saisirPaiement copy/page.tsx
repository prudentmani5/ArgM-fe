'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { EntryPayement, Bank, CompteBanque, ImportateurCredit } from './entryPayement';
import EntryPayementForm from './EntryPayementForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { DropdownChangeEvent } from 'primereact/dropdown';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../utils/apiConfig';

function EntryPayementComponent() {
    const [entryPayement, setEntryPayement] = useState<EntryPayement>(new EntryPayement());
    const [entryPayementEdit, setEntryPayementEdit] = useState<EntryPayement>(new EntryPayement());
    const [editEntryPayementDialog, setEditEntryPayementDialog] = useState(false);
    const [entryPayements, setEntryPayements] = useState<EntryPayement[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [bankAccounts, setBankAccounts] = useState<CompteBanque[]>([]);
    const [creditImporters, setCreditImporters] = useState<ImportateurCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [referenceExists, setReferenceExists] = useState<boolean>(false);
    const [printEnabled, setPrintEnabled] = useState(false);
    const [lastSavedEntry, setLastSavedEntry] = useState<EntryPayement | null>(null);
    const [caissierId, setCaissierId] = useState<number | null>(null);
    const [fullName, setFullName] = useState<string>('');

    // Create separate API instances for each data type
    const { data: banksData, loading: banksLoading, error: banksError, fetchData: fetchBanks } = useConsumApi('');
    const { data: accountsData, loading: accountsLoading, error: accountsError, fetchData: fetchAccounts } = useConsumApi('');
    const { data: importersData, loading: importersLoading, error: importersError, fetchData: fetchImporters } = useConsumApi('');
    const { data: entryPayementsData, loading: entryPayementsLoading, error: entryPayementsError, fetchData: fetchEntryPayements } = useConsumApi('');
    const { data: invoiceData, loading: invoiceLoading, error: invoiceError, fetchData: fetchInvoice } = useConsumApi('');

    const BASE_URL = buildApiUrl('/entryPayements');
    const BANKS_URL = buildApiUrl('/banks/findall');
    const ACCOUNTS_URL = buildApiUrl('/compteBanques/findall');
    const IMPORTERS_URL = buildApiUrl('/importateurCredits/findall');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        if (!entryPayement.annee) {
            setEntryPayement(prev => ({
                ...prev,
                annee: new Date().getFullYear().toString()
            }));
        }
    }, []);

    useEffect(() => {
        // Load initial data
        setLoading(true);
        Promise.all([
            fetchBanks(null, 'GET', BANKS_URL),
            fetchAccounts(null, 'GET', ACCOUNTS_URL),
            fetchImporters(null, 'GET', IMPORTERS_URL)
        ]).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (banksData) {
            setBanks(banksData);
        }
        if (accountsData) {
            setBankAccounts(accountsData);
        }
        if (importersData) {
            setCreditImporters(importersData);
        }
        if (entryPayementsData) {
            setEntryPayements(entryPayementsData);
            setTotalRecords(entryPayementsData.length);
        }
        if (invoiceData && (invoiceData.noArrive || invoiceData.rsp || invoiceData.montantRedev)) {
            setEntryPayement(prev => ({
                ...prev,
                factureId: invoiceData.noArrive,
                rsp: invoiceData.lettreTransp,
                montantPaye: invoiceData.montantPaye,
                clientId: invoiceData.importateurId,
                clientNom: invoiceData.nom,
            }));
            accept('success', 'Succès', 'Données de la facture récupérées');
        }
    }, [banksData, accountsData, importersData, entryPayementsData, invoiceData]);

    // Fonction spécifique pour la gestion de la référence
    const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEntryPayement(prev => ({ 
            ...prev, 
            reference: value 
        }));
        
        // Vérifier si la référence existe
        checkReferenceExists(value);
    };

    // Fonction générale pour les autres champs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEntryPayement(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryPayement((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryPayementEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntryPayement((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEntryPayementEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setEntryPayement((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setEntryPayement((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setEntryPayementEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBankChange = (e: DropdownChangeEvent) => {
        setEntryPayement((prev) => ({
            ...prev,
            banqueId: e.target.value,
            compteBanqueId: 0
        }));
    };

    const handleBankChangeEdit = (e: DropdownChangeEvent) => {
        setEntryPayementEdit((prev) => ({
            ...prev,
            banqueId: e.target.value,
            compteBanqueId: 0
        }));
    };

    const handleSubmit = async () => {
        // Vérifier une dernière fois avant soumission
        if (referenceExists) {
            accept('error', 'Erreur', 'Cet borderau est déjà enregistré sur un autre facture');
            return;
        }

        // Validation du ClientId
    if (!entryPayement.clientId || entryPayement.clientId === 0) {
        accept('error', 'Erreur', 'Le ClientId est requis. Veuillez rechercher une facture valide.');
        return;
    }
        
        setBtnLoading(true);
        try {
            await fetchEntryPayements(entryPayement, 'POST', `${BASE_URL}/new`);
            setLastSavedEntry({...entryPayement, datePaiement: entryPayement.datePaiement || new Date()});
            setEntryPayement(new EntryPayement());
            setReferenceExists(false); // Réinitialiser l'état
            accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            setPrintEnabled(true);
        } catch {
            accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            setPrintEnabled(false);
        } finally {
            setBtnLoading(false);
        }
    };

    // Ajoutez cette fonction pour gérer l'impression
   const handlePrint = () => {
    if (!lastSavedEntry) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Reçu de paiement</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .header { 
                            display: flex; 
                            align-items: center; 
                            margin-bottom: 20px; 
                            border-bottom: 2px solid #333; 
                            padding-bottom: 15px; 
                        }
                        .logo { 
                            max-width: 150px; 
                            max-height: 80px; 
                            margin-right: 20px; 
                        }
                        .company-info { 
                            flex-grow: 1; 
                        }
                        h1 { 
                            color: #333; 
                            margin: 0; 
                            font-size: 24px; 
                        }
                        .company-name { 
                            font-weight: bold; 
                            font-size: 18px; 
                            color: #2c3e50; 
                        }
                        .receipt { 
                            border: 1px solid #ddd; 
                            padding: 20px; 
                            max-width: 500px; 
                            margin: 0 auto; 
                        }
                        .receipt-info { 
                            margin-bottom: 15px; 
                        }
                        .label { 
                            font-weight: bold; 
                            color: #2c3e50; 
                        }
                        .footer { 
                            margin-top: 20px; 
                            text-align: center; 
                            font-style: italic; 
                            color: #666; 
                        }
                        @media print {
                            body { margin: 0; }
                            .receipt { border: none; box-shadow: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <!-- En-tête avec logo -->
                        <div class="header">
                            <img src="/assets/images/logo.png" 
                                 alt="GLOBAL PORT SERVICES BURUNDI" 
                                 class="logo"
                                 onerror="this.style.display='none'">
                            <div class="company-info">
                                <div class="company-name">GLOBAL PORT SERVICES BURUNDI</div>
                               
                            </div>
                        </div>
                        
                        <div class="receipt-info">
                         <h1>Reçu de paiement</h1>
                            <span class="label">Numéro Facture:</span> ${lastSavedEntry.factureId || 'N/A'}<br>
                            <span class="label">Client:</span> ${lastSavedEntry.clientNom || 'N/A'}<br>
                            <span class="label">Montant:</span> ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(lastSavedEntry.montantPaye || 0)}<br>
                            <span class="label">Mode de paiement:</span> ${lastSavedEntry.modePaiement || 'N/A'}<br>
                            <span class="label">Date:</span> ${new Date(lastSavedEntry.datePaiement || new Date()).toLocaleString()}<br>
                            <span class="label">Référence:</span> ${lastSavedEntry.reference || 'N/A'}<br>
                             
                            <span class="label">Caissier:</span> ${fullName || 'N/A'}<br>
                        </div>
                        
                        <div class="footer">
                            <p>Merci pour votre confiance!</p>
                            <small>Reçu émis le ${new Date().toLocaleString()}</small>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
};

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchEntryPayements(entryPayementEdit, 'PUT', `${BASE_URL}/update/${entryPayementEdit.paiementId}`)
            .then(() => {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEntryPayementEdit(new EntryPayement());
                setEditEntryPayementDialog(false);
                loadAllData();
            })
            .catch(() => {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            })
            .finally(() => setBtnLoading(false));
    };

    const clearFilterEntryPayement = () => {
        setEntryPayement(new EntryPayement());
    };

    const loadEntryPayementToEdit = (data: EntryPayement) => {
        if (data) {
            const entryToEdit = {
                ...data,
                datePaiement: data.datePaiement ? new Date(data.datePaiement) : null,
            };
            setEntryPayementEdit(entryToEdit);
            setEditEntryPayementDialog(true);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-print" 
                    onClick={() => {
                        setLastSavedEntry(data);
                        handlePrint();
                    }} 
                    raised 
                    severity='info' 
                    tooltip="Imprimer le reçu"
                />
            </div>
        );
    };

    const loadAllData = () => {
        setLoading(true);
        fetchEntryPayements(null, 'GET', `${BASE_URL}/findallCash`)
            .finally(() => setLoading(false));
    };

    const fetchInvoiceData = (factureId: string) => {
        if (!entryPayement.type) {
            accept('warn', 'Attention', 'Veuillez sélectionner un type avant de rechercher');
            return;
        }

        const encodedFactureId = encodeURIComponent(factureId);
        let apiUrl = '';
        switch(entryPayement.type) {
            case 'RSP':
                apiUrl = `${BASE_URL}/findbyRSP?numFacture=${encodedFactureId}`;
                break;
            case 'Service':
                apiUrl = `${BASE_URL}/findbyService?numFacture=${encodedFactureId}`;
                break;
            case 'Accostage':
                apiUrl = `${BASE_URL}/findbyid?numFacture=${encodedFactureId}`;
                break;
            case 'Romarquage':
                apiUrl = `${BASE_URL}/findbyRemorquage?numFacture=${encodedFactureId}`;
                break;
            case 'AutresBUCECO':
                apiUrl = `${BASE_URL}/findbyBUCECO?numFacture=${encodedFactureId}`;
                break;
            default:
                accept('warn', 'Attention', 'Type non pris en charge');
                return;
        }

        fetchInvoice(null, 'GET', apiUrl)
            .then(() => {
                if (!invoiceData || (!invoiceData.noArrive && !invoiceData.rsp && !invoiceData.montantRedev)) {
                    accept('error', 'Erreur', 'Aucune donnée trouvée pour cette recherche');
                    setEntryPayement(prev => ({
                        ...prev,
                        factureId: '',
                        rsp: '',
                        montantPaye: 0,
                        clientId: 0,
                        clientNom: '',
                    }));
                }
            })
            .catch(error => {
                accept('error', 'Erreur', 'Une erreur est survenue lors de la recherche');
                console.error('Error fetching invoice data:', error);
            });
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    function getCookieValue(name: string): string | null {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
            const [cookieName, cookieValue] = cookie.trim().split('=');
            if (cookieName === name) {
                return decodeURIComponent(cookieValue);
            }
        }
        return null;
    }

    useEffect(() => {
        const getAppUserFromCookies = () => {
            try {
                const appUserStr = getCookieValue('AppUser');
                if (!appUserStr) {
                    console.warn("Le cookie AppUser n'existe pas");
                    return;
                }

                const appUser = JSON.parse(appUserStr);
                if (!appUser.id || !appUser.fullName) {
                    console.error("Le cookie AppUser ne contient pas les champs requis");
                    return;
                }

                setCaissierId(Number(appUser.id));
                setFullName(appUser.fullName);
                
                setEntryPayement(prev => ({
                    ...prev,
                    caissierId: Number(appUser.id),
                    fullName: appUser.fullName
                }));
            } catch (err) {
                console.error("Erreur lors de la récupération des données utilisateur:", err);
            }
        };

        getAppUserFromCookies();
    }, []);

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
                    placeholder="Rechercher par facture, rsp, borderaux ou type..."
                    className="w-full"
                />
            </span>
        </div>
    );

    const filteredData = Array.isArray(entryPayements) 
        ? entryPayements.filter(item => {
            if (!item) return false;
            
            return JSON.stringify({
                factureId: item.factureId || '',
                rsp: item.rsp || '',
                reference: item.reference || '',
                type: item.type || ''
            }).toLowerCase().includes(globalFilter.toLowerCase());
          })
        : [];

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    // Fonction pour vérifier l'existence de la référence
    const checkReferenceExists = async (reference: string) => {
        if (!reference || reference.trim() === '') {
            setReferenceExists(false);
            return;
        }
        
        try {
            const response = await fetch(buildApiUrl(`/entryPayements/checkReference?reference=${encodeURIComponent(reference)}`));
            if (response.ok) {
                const exists = await response.json();
                setReferenceExists(exists);
            } else {
                setReferenceExists(false);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de la référence:', error);
            setReferenceExists(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Paiement"
                visible={editEntryPayementDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEntryPayementDialog(false)}
            >
                <EntryPayementForm
                    entryPayement={entryPayementEdit}
                    banks={banks}
                    bankAccounts={bankAccounts}
                    creditImporters={creditImporters}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleBankChange={handleBankChangeEdit}
                    fetchInvoiceData={fetchInvoiceData}
                    loading={loading}
                    referenceExists={referenceExists}
                    handleReferenceChange={handleReferenceChange} // ← Passez la fonction spécifique
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditEntryPayementDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <EntryPayementForm
                        entryPayement={entryPayement}
                        banks={banks}
                        bankAccounts={bankAccounts}
                        creditImporters={creditImporters}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDropdownChange={handleDropdownChange}
                        handleBankChange={handleBankChange}
                        fetchInvoiceData={fetchInvoiceData}
                        loading={loading}
                        referenceExists={referenceExists}
                        handleReferenceChange={handleReferenceChange} // ← Passez la fonction spécifique
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterEntryPayement} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check" 
                                    label="Enregistrer" 
                                    loading={btnLoading} 
                                    onClick={handleSubmit} 
                                    disabled={referenceExists || btnLoading}
                                    tooltip={referenceExists ? "Cette référence existe déjà" : ""}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button 
                                    icon="pi pi-print" 
                                    label="Imprimer" 
                                    disabled={!printEnabled} 
                                    onClick={handlePrint}
                                    severity="info"
                                />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={filteredData}
                                    header={renderSearch}
                                    paginator
                                    rows={10}
                                    emptyMessage="Aucune autre facture trouvée"
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={loading}
                                >
                                    <Column field="factureId" header="Numéro Facture" sortable />
                                    <Column field="type" header="Type" sortable />
                                    <Column field="nomClient" header="Client" sortable />
                                    <Column field="modePaiement" header="Mode Paiement" sortable />
                                    <Column field="datePaiement" header="Date Paiement" body={(rowData) => formatDate(rowData.datePaiement)} sortable />
                                    <Column field="montantPaye" header="Montant Payé" body={(rowData) => formatCurrency(rowData.montantPaye)} sortable />
                                    <Column field="reference" header="Borderaux" sortable />
                                    <Column field="rsp" header="RSP" sortable />
                                    <Column field="credit" header="Crédit" body={(rowData) => rowData.credit ? 'Oui' : 'Non'} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default EntryPayementComponent;