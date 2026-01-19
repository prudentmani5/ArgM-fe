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
import { useCurrentUser } from '../../../../hooks/fetchData/useCurrentUser';
import { useReactToPrint } from 'react-to-print';
import PrintableRecuPaiement from './PrintableRecuPaiement';
import Cookies from 'js-cookie';
import { AppUserResponse } from '../../usermanagement/types';
import { API_BASE_URL } from '../../../../utils/apiConfig';

const paymentTypes = [
    { label: 'Espèces', value: 'CASH' },
    { label: 'Chèque', value: 'CHEQUE' },
    { label: 'Virement', value: 'VIREMENT' },
    { label: 'Carte Bancaire', value: 'CARTE' }
];

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
    const printRef = useRef<HTMLDivElement>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [referenceExists, setReferenceExists] = useState<boolean>(false);
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 100,
        page: 0
    });
    const [printEnabled, setPrintEnabled] = useState(false);
    const [lastSavedEntry, setLastSavedEntry] = useState<EntryPayement | null>(null);
    const [montantFacture, setMontantFacture] = useState<number>(0); // Nouvel état pour le montant de la facture
    const [showExistingPaymentDialog, setShowExistingPaymentDialog] = useState(false);
    const [existingPayment, setExistingPayment] = useState<EntryPayement | null>(null);
    const [referenceCheckTimeout, setReferenceCheckTimeout] = useState<NodeJS.Timeout | null>(null);
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Use the useCurrentUser hook to get current user information
    const { user } = useCurrentUser();

    // Create separate API instances for each data type
    const { data: banksData, loading: banksLoading, error: banksError, fetchData: fetchBanks } = useConsumApi('');
    const { data: accountsData, loading: accountsLoading, error: accountsError, fetchData: fetchAccounts } = useConsumApi('');
    const { data: importersData, loading: importersLoading, error: importersError, fetchData: fetchImporters } = useConsumApi('');
    const { data: entryPayementsData, loading: entryPayementsLoading, error: entryPayementsError, fetchData: fetchEntryPayements } = useConsumApi('');
    const { data: invoiceData, loading: invoiceLoading, error: invoiceError, fetchData: fetchInvoice } = useConsumApi('');

    const BASE_URL = `${API_BASE_URL}/entryPayements`;
    const BANKS_URL = `${API_BASE_URL}/banks/findall`;
    const ACCOUNTS_URL = `${API_BASE_URL}/compteBanques/findall`;
    const IMPORTERS_URL = `${API_BASE_URL}/importateurCredits/findall`;

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

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (referenceCheckTimeout) {
                clearTimeout(referenceCheckTimeout);
            }
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [referenceCheckTimeout, searchTimeout]);

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
            console.log('📊 Entry Payments Data Received:', entryPayementsData);
            // Handle paginated response
            if (entryPayementsData.content && Array.isArray(entryPayementsData.content)) {
                console.log('✅ Paginated response detected');
                console.log('   - Content length:', entryPayementsData.content.length);
                console.log('   - Total elements:', entryPayementsData.totalElements);
                console.log('   - Total pages:', entryPayementsData.totalPages);
                console.log('   - Current page:', entryPayementsData.currentPage);
                setEntryPayements(entryPayementsData.content);
                setTotalRecords(entryPayementsData.totalElements || 0);
            } else {
                // Handle non-paginated response (fallback)
                console.log('⚠️ Non-paginated response detected');
                console.log('   - Data length:', Array.isArray(entryPayementsData) ? entryPayementsData.length : 'Not an array');
                setEntryPayements(entryPayementsData);
                setTotalRecords(entryPayementsData.length);
            }
        }
        if (invoiceData && (invoiceData.noArrive || invoiceData.rsp || invoiceData.montantRedev)) {
            console.log('📦 INVOICE DATA RECEIVED:', invoiceData);
            console.log('  💰 montantRedev:', invoiceData.montantRedev);
            console.log('  💵 montantPaye:', invoiceData.montantPaye);

            const montantFactureRecu = invoiceData.montantRedev || invoiceData.montantPaye || 0;
            console.log('  ✅ Final montantFactureRecu (displayed):', montantFactureRecu);
            console.log('  📊 Difference:', 'montantRedev vs montantPaye =', invoiceData.montantRedev, 'vs', invoiceData.montantPaye);

            setMontantFacture(montantFactureRecu);

            setEntryPayement(prev => ({
                ...prev,
                factureId: invoiceData.noArrive,
                rsp: invoiceData.lettreTransp,
                montantPaye: invoiceData.montantPaye || 0,
                montantFacture: invoiceData.montantPaye || 0,
                clientId: invoiceData.importateurId,
                clientNom: invoiceData.nom,
                // Calcul automatique du montant excédent
                montantExcedent: calculateMontantExcedent(invoiceData.montantPaye || 0, montantFactureRecu)
            }));
            accept('success', 'Succès', 'Données de la facture récupérées');
        }
    }, [banksData, accountsData, importersData, entryPayementsData, invoiceData]);

    // Fonction pour calculer le montant excédent
    const calculateMontantExcedent = (montantPaye: number, montantFacture: number): number => {
        return montantPaye - montantFacture;
    };

    // Fonction pour gérer le changement du montant payé
    const handleMontantPayeChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value || 0;

        setEntryPayement((prev) => ({
            ...prev,
            [field]: value,
            // Recalcul automatique du montant excédent
            montantExcedent: calculateMontantExcedent(value, montantFacture)
        }));
    };

    const handleMontantPayeChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value || 0;

        setEntryPayementEdit((prev) => ({
            ...prev,
            [field]: value,
            // Recalcul automatique du montant excédent pour l'édition
            montantExcedent: calculateMontantExcedent(value, montantFacture)
        }));
    };

    // Fonction spécifique pour la gestion de la référence avec debounce
    const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setEntryPayement(prev => ({
            ...prev,
            reference: value
        }));

        // Clear existing timeout
        if (referenceCheckTimeout) {
            clearTimeout(referenceCheckTimeout);
        }

        // Reset states immediately when clearing the field
        if (!value || value.trim() === '') {
            setReferenceExists(false);
            setShowExistingPaymentDialog(false);
            setExistingPayment(null);
            return;
        }

        // Debounce: Wait 500ms after user stops typing before checking
        const timeoutId = setTimeout(() => {
            checkReferenceExists(value);
        }, 500);

        setReferenceCheckTimeout(timeoutId);
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

        // Si ce n'est pas le montant payé, utiliser la logique normale
        if (field !== 'montantPaye') {
            setEntryPayement((prev) => ({ ...prev, [field]: value }));
        }
        // Pour montantPaye, on utilise handleMontantPayeChange
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        // Si ce n'est pas le montant payé, utiliser la logique normale
        if (field !== 'montantPaye') {
            setEntryPayementEdit((prev) => ({ ...prev, [field]: value }));
        }
        // Pour montantPaye, on utilise handleMontantPayeChangeEdit
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
        // Prevent multiple simultaneous submissions
        if (btnLoading) return;

        // Vérifier si la référence existe - ne pas permettre l'enregistrement
        if (referenceExists) {
            accept('error', 'Erreur', 'Impossible d\'enregistrer - Ce bordereau existe déjà. Utilisez le bouton à côté du champ Bordereau pour voir les détails.');
            return;
        }

        // Validation du Type
        if (!entryPayement.type || entryPayement.type.trim() === '') {
            accept('error', 'Erreur', 'Le Type est requis. Veuillez sélectionner un type.');
            return;
        }

        // Validation du Mode de Paiement
        if (!entryPayement.modePaiement || entryPayement.modePaiement.trim() === '') {
            accept('error', 'Erreur', 'Le Mode de Paiement est requis. Veuillez sélectionner un mode de paiement.');
            return;
        }

        // Validation du ClientId
        if (!entryPayement.clientId || entryPayement.clientId === 0) {
            accept('error', 'Erreur', 'Le ClientId est requis. Veuillez rechercher une facture valide.');
            return;
        }

        // Validation du montant payé
        if (!entryPayement.montantPaye || entryPayement.montantPaye <= 0) {
            accept('error', 'Erreur', 'Le montant payé doit être supérieur à 0');
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

            // Update entryPayement with userCreation before saving
            const paymentToSave = {
                ...entryPayement,
                userCreation: userCreationName
            };

            console.log('💾 Saving payment with userCreation:', userCreationName);
            console.log('📦 Payment data to save:', paymentToSave);

            await fetchEntryPayements(paymentToSave, 'POST', `${BASE_URL}/new`);
            setLastSavedEntry({ ...paymentToSave, datePaiement: paymentToSave.datePaiement || new Date() });
             // Save the current reference before resetting
            const currentReference = entryPayement.reference || '';
            setEntryPayement(new EntryPayement());
            setMontantFacture(0); // Réinitialiser le montant de la facture
            setReferenceExists(false); // Réinitialiser l'état
               // Restore the reference if it exists
        if (currentReference) {
            setEntryPayement(prev => ({ ...prev, reference: currentReference }));
        }
            accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            setPrintEnabled(true);
        } catch {
            accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            setPrintEnabled(false);
        } finally {
            setBtnLoading(false);
        }
    };

    // Fonction pour formater l'affichage du mode de paiement
    const getPaymentModeLabel = (mode: string) => {
        const paymentMode = paymentTypes.find(pt => pt.value === mode);
        return paymentMode ? paymentMode.label : mode;
    };

    // Fonction d'impression avec informations bancaires (A7 format for E-PoS)
    const handlePrintPDF = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Recu_Paiement_${lastSavedEntry?.factureId || 'new'}`,
        pageStyle: `
            @page {
                size: 74mm 105mm;
                margin: 0;
            }
            @media print {
                body {
                    margin: 0;
                    padding: 0;
                }
                html, body {
                    width: 74mm;
                    height: 105mm;
                }
            }
        `,
        onAfterPrint: () => {
            toast.current?.show({
                severity: 'success',
                summary: 'Succès',
                detail: 'L\'impression a été lancée avec succès.'
            });
        }
    });

    const handlePrint = () => {
        if (!lastSavedEntry) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucun reçu à imprimer.'
            });
            return;
        }
        handlePrintPDF();
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
         const referenceValue = entryPayement.reference;
        setEntryPayement(new EntryPayement());
        setMontantFacture(0);
        
        
           // Restore the reference value if it exists
    if (referenceValue) {
        setEntryPayement(prev => ({ ...prev, reference: referenceValue }));
    }

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
                    onClick={async () => {
                        try {
                            console.log('🖨️ Print button clicked for payment:', data.paiementId);

                            // Fetch complete payment details to ensure all fields are populated
                            const response = await fetch(`${BASE_URL}/findById/${data.paiementId}`);

                            if (response.ok) {
                                const completeData = await response.json();
                                console.log('✅ Complete payment data received:', completeData);

                                // Map the data fields to ensure compatibility with PrintableRecuPaiement
                                const mappedData = {
                                    ...completeData,
                                    // Ensure clientNom is populated from nomClient if not present
                                    clientNom: completeData.clientNom || completeData.nomClient || completeData.fullName || 'N/A',
                                    // Ensure reference (bordereau) is present
                                    reference: completeData.reference || 'N/A',
                                    // Ensure userCreation (caissier name) is present - try multiple sources
                                    userCreation: completeData.userCreation ||
                                                 completeData.nomCaissier ||
                                                 completeData.fullName ||
                                                 (completeData.caissierId ? `Caissier #${completeData.caissierId}` : 'Caissier'),
                                    // Ensure datePaiement is a Date object
                                    datePaiement: completeData.datePaiement ? new Date(completeData.datePaiement) : new Date()
                                };

                                console.log('📝 Mapped data for printing:', {
                                    factureId: mappedData.factureId,
                                    clientNom: mappedData.clientNom,
                                    reference: mappedData.reference,
                                    userCreation: mappedData.userCreation,
                                    montantPaye: mappedData.montantPaye
                                });

                                setLastSavedEntry(mappedData);
                                // Small delay to ensure state is updated before printing
                                setTimeout(() => handlePrint(), 100);
                            } else {
                                console.warn('⚠️ API call failed, using table data');
                                // Fallback to table data if API fails
                                const mappedData = {
                                    ...data,
                                    clientNom: data.clientNom || data.nomClient || data.fullName || 'N/A',
                                    reference: data.reference || 'N/A',
                                    userCreation: data.userCreation ||
                                                 data.nomCaissier ||
                                                 data.fullName ||
                                                 (data.caissierId ? `Caissier #${data.caissierId}` : 'Caissier'),
                                    datePaiement: data.datePaiement ? new Date(data.datePaiement) : new Date()
                                };
                                setLastSavedEntry(mappedData);
                                setTimeout(() => handlePrint(), 100);
                            }
                        } catch (error) {
                            console.error('❌ Error fetching payment details:', error);
                            // Fallback to table data if fetch fails
                            const mappedData = {
                                ...data,
                                clientNom: data.clientNom || data.nomClient || data.fullName || 'N/A',
                                reference: data.reference || 'N/A',
                                userCreation: data.userCreation ||
                                             data.nomCaissier ||
                                             data.fullName ||
                                             (data.caissierId ? `Caissier #${data.caissierId}` : 'Caissier'),
                                datePaiement: data.datePaiement ? new Date(data.datePaiement) : new Date()
                            };
                            setLastSavedEntry(mappedData);
                            setTimeout(() => handlePrint(), 100);
                        }
                    }}
                    raised
                    severity='info'
                    tooltip="Imprimer le reçu"
                />
            </div>
        );
    };

    const loadAllData = (page: number = 0, rows: number = 100, search: string = '') => {
        setLoading(true);
        const apiUrl = `${BASE_URL}/findallCashPaginated?page=${page}&size=${rows}&search=${encodeURIComponent(search)}`;
        console.log('🔄 Loading paginated data:', { page, rows, search, apiUrl });
        fetchEntryPayements(null, 'GET', apiUrl)
            .then(() => {
                console.log('✅ Data loaded successfully');
            })
            .catch((error) => {
                console.error('❌ Error loading data:', error);
                accept('error', 'Erreur', 'Erreur lors du chargement des données');
            })
            .finally(() => {
                setLoading(false);
                console.log('🏁 Loading finished');
            });
    };

    const fetchInvoiceData = (factureId: string) => {
        if (!entryPayement.type) {
            accept('warn', 'Attention', 'Veuillez sélectionner un type avant de rechercher');
            return;
        }

        const encodedFactureId = encodeURIComponent(factureId);
        let apiUrl = '';
        switch (entryPayement.type) {
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

        console.log('🔍 FETCHING INVOICE DATA:');
        console.log('  📝 Type:', entryPayement.type);
        console.log('  📄 Facture ID (original):', factureId);
        console.log('  🔗 Facture ID (encoded):', encodedFactureId);
        console.log('  🌐 API URL:', apiUrl);
        console.log('  📊 Full URL:', apiUrl);

        fetchInvoice(null, 'GET', apiUrl)
            .then(() => {
                console.log('✅ RESPONSE RECEIVED:', invoiceData);
                if (!invoiceData || (!invoiceData.noArrive && !invoiceData.rsp && !invoiceData.montantRedev)) {
                    console.log('❌ No data found in response');
                    accept('error', 'Erreur', 'Aucune donnée trouvée pour cette recherche');
                    setEntryPayement(prev => ({
                        ...prev,
                        factureId: '',
                        rsp: '',
                        montantPaye: 0,
                        clientId: 0,
                        clientNom: '',
                        montantExcedent: 0
                    }));
                    setMontantFacture(0);
                } else {
                    console.log('✅ Data found:', invoiceData);
                }
            })
            .catch(error => {
                console.error('❌ ERROR fetching invoice data:', error);
                accept('error', 'Erreur', 'Une erreur est survenue lors de la recherche');
                console.error('Error fetching invoice data:', error);
            });
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData(0, lazyState.rows, globalFilter);
        }
        setActiveIndex(e.index);
    };

    // Handle page change in DataTable
    const onPage = (event: any) => {
        const newPage = event.page;
        const newRows = event.rows;
        setLazyState({
            first: event.first,
            rows: newRows,
            page: newPage
        });
        loadAllData(newPage, newRows, globalFilter);
    };

    // Handle filter change with debounce
    const onFilter = (value: string) => {
        setGlobalFilter(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Reset to first page when filtering
        setLazyState(prev => ({
            ...prev,
            first: 0,
            page: 0
        }));

        // Debounce: Wait 500ms after user stops typing before searching
        const timeoutId = setTimeout(() => {
            loadAllData(0, lazyState.rows, value);
        }, 500);

        setSearchTimeout(timeoutId);
    };

    // Set caissierId when user is loaded from useCurrentUser hook
    useEffect(() => {
        if (user && user.id) {
            const fullName = `${user.firstname} ${user.lastname}`;

            setEntryPayement(prev => ({
                ...prev,
                caissierId: user.id,
                fullName: fullName
            }));
        }
    }, [user]);

    const clearFilters = () => {
        setGlobalFilter('');
        setLazyState(prev => ({
            ...prev,
            first: 0,
            page: 0
        }));
        // Clear timeout if any
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        // Load data immediately without debounce
        loadAllData(0, lazyState.rows, '');
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilters}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => onFilter(e.target.value)}
                    placeholder="Rechercher par facture, rsp, borderaux ou type..."
                    className="w-full"
                />
            </span>
        </div>
    );

    // No longer need client-side filtering since we're using server-side filtering
    const filteredData = Array.isArray(entryPayements) ? entryPayements : [];

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value || 0);
    };

    const formatNumberForDisplay = (value: number | null) => {
        const num = value || 0;
        const decimalPart = num - Math.floor(num);
        const firstDecimal = Math.floor(decimalPart * 10);
        const rounded = firstDecimal > 0 ? Math.ceil(num) : Math.floor(num);
        return new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rounded) + ' BIF';
    };

    // Helper function to get bank name from ID
    const getBankName = (banqueId: number) => {
        if (!banqueId || banqueId === 0) return null;
        const bank = banks.find(b => b.banqueId === banqueId);
        return bank ? bank.libelleBanque : null;
    };

    // Helper function to get bank account number from ID
    const getBankAccountNumber = (compteBanqueId: number) => {
        if (!compteBanqueId || compteBanqueId === 0) return null;
        const account = bankAccounts.find(a => a.compteBanqueId === compteBanqueId);
        return account ? account.numeroCompte : null;
    };

    // Function to handle viewing existing payment from the form button
    const handleViewExistingPayment = async () => {
        if (!referenceExists || !entryPayement.reference) return;

        try {
            const response = await fetch(`${BASE_URL}/findall`);
            if (response.ok) {
                const allPayments = await response.json();
                const matchingPayment = allPayments.find((p: EntryPayement) => p.reference === entryPayement.reference);

                if (matchingPayment) {
                    setExistingPayment(matchingPayment);
                    setShowExistingPaymentDialog(true);
                }
            }
        } catch (error) {
            console.error('Error fetching payment details:', error);
        }
    };

    // Fonction pour vérifier l'existence de la référence
    const checkReferenceExists = async (reference: string) => {
        if (!reference || reference.trim() === '') {
            setReferenceExists(false);
            setShowExistingPaymentDialog(false);
            setExistingPayment(null);
            return;
        }

        console.log('🔎 Checking if reference exists:', reference);

        try {
            const checkUrl = `${BASE_URL}/checkReference?reference=${encodeURIComponent(reference)}`;
            console.log('📞 Calling checkReference API:', checkUrl);

            const response = await fetch(checkUrl);
            console.log('📥 checkReference response status:', response.status);

            if (response.ok) {
                const exists = await response.json();
                console.log('📊 Reference exists?', exists);
                setReferenceExists(exists);

                // Si la référence existe, récupérer automatiquement les détails et afficher le popup
                if (exists) {
                    console.log('🔍 Reference exists! Fetching all payments to find the matching one...');

                    try {
                        // Since /findByReference doesn't exist, we'll fetch all payments and filter
                        const paymentUrl = `${BASE_URL}/findall`;
                        console.log('📞 Calling findall API:', paymentUrl);

                        const paymentResponse = await fetch(paymentUrl);
                        console.log('📥 findall response status:', paymentResponse.status);

                        if (paymentResponse.ok) {
                            const allPayments = await paymentResponse.json();
                            console.log('✅ All payments loaded, searching for reference:', reference);

                            // Find the payment with matching reference
                            const matchingPayment = allPayments.find((p: EntryPayement) => p.reference === reference);

                            if (matchingPayment) {
                                console.log('✅ Found matching payment:', matchingPayment);
                                setExistingPayment(matchingPayment);
                                setShowExistingPaymentDialog(true);
                                console.log('🎯 Dialog state set to true with payment data');
                            } else {
                                console.warn('⚠️ Reference exists but payment not found in list');
                                setExistingPayment(null);
                                setShowExistingPaymentDialog(false);
                            }
                        } else {
                            console.error('❌ Failed to fetch payments - Status:', paymentResponse.status);
                            const errorText = await paymentResponse.text();
                            console.error('❌ Error response:', errorText);
                            setExistingPayment(null);
                            setShowExistingPaymentDialog(false);
                        }
                    } catch (error) {
                        console.error('❌ Error fetching payment details:', error);
                        setExistingPayment(null);
                        setShowExistingPaymentDialog(false);
                    }
                } else {
                    console.log('ℹ️ Reference does not exist');
                    setExistingPayment(null);
                    setShowExistingPaymentDialog(false);
                }
            } else {
                console.error('❌ checkReference API failed - Status:', response.status);
                setReferenceExists(false);
                setExistingPayment(null);
                setShowExistingPaymentDialog(false);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de la référence:', error);
            setReferenceExists(false);
            setExistingPayment(null);
            setShowExistingPaymentDialog(false);
        }
    };

    return (
        <>
            <Toast ref={toast} />

            {/* Dialog pour afficher le paiement existant */}
            <Dialog
                header="Bordereau Déjà Enregistré"
                visible={showExistingPaymentDialog}
                style={{ width: '600px', maxWidth: '90vw' }}
                modal
                onHide={() => setShowExistingPaymentDialog(false)}
            >
                {existingPayment && (
                    <div className="p-3">
                        <div className="mb-4 p-3 bg-red-50 border-red-200 border-1 border-round">
                            <i className="pi pi-exclamation-triangle text-red-500 mr-2"></i>
                            <span className="text-red-700 font-semibold">
                                Ce bordereau est déjà enregistré pour une autre facture
                            </span>
                        </div>

                        <div className="grid p-fluid">
                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Numéro Facture:</label>
                                <div className="text-900 mt-1">{existingPayment.factureId || 'N/A'}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Type:</label>
                                <div className="text-900 mt-1">{existingPayment.type || 'N/A'}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Client:</label>
                                <div className="text-900 mt-1">
                                    {existingPayment.clientNom || existingPayment.nomClient || existingPayment.fullName || 'N/A'}
                                </div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Mode Paiement:</label>
                                <div className="text-900 mt-1">{getPaymentModeLabel(existingPayment.modePaiement)}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Montant Payé:</label>
                                <div className="text-900 mt-1 font-bold text-xl text-green-600">
                                    {formatNumberForDisplay(existingPayment.montantPaye)}
                                </div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Date Paiement:</label>
                                <div className="text-900 mt-1">{formatDate(existingPayment.datePaiement)}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Bordereau:</label>
                                <div className="text-900 mt-1 font-semibold">{existingPayment.reference || 'N/A'}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">RSP:</label>
                                <div className="text-900 mt-1">{existingPayment.rsp || 'N/A'}</div>
                            </div>

                            <div className="col-12 md:col-6 mb-3">
                                <label className="font-bold text-600">Créé par:</label>
                                <div className="text-900 mt-1">{existingPayment.userCreation || 'N/A'}</div>
                            </div>

                            {(existingPayment.banqueId && existingPayment.banqueId !== 0) && (
                                <div className="col-12 md:col-6 mb-3">
                                    <label className="font-bold text-600">Banque:</label>
                                    <div className="text-900 mt-1">{getBankName(existingPayment.banqueId) || 'N/A'}</div>
                                </div>
                            )}

                            {(existingPayment.compteBanqueId && existingPayment.compteBanqueId !== 0) && (
                                <div className="col-12 md:col-6 mb-3">
                                    <label className="font-bold text-600">Compte Bancaire:</label>
                                    <div className="text-900 mt-1">{getBankAccountNumber(existingPayment.compteBanqueId) || 'N/A'}</div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-content-end gap-2 mt-4 pt-3 border-top-1 border-200">
                            <Button
                                label="Fermer"
                                icon="pi pi-times"
                                onClick={() => setShowExistingPaymentDialog(false)}
                                severity="secondary"
                            />
                        </div>
                    </div>
                )}
            </Dialog>

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
                    handleMontantPayeChange={handleMontantPayeChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleBankChange={handleBankChangeEdit}
                    fetchInvoiceData={fetchInvoiceData}
                    loading={loading}
                    referenceExists={referenceExists}
                    handleReferenceChange={handleReferenceChange}
                    montantFacture={montantFacture}
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
                        handleMontantPayeChange={handleMontantPayeChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDropdownChange={handleDropdownChange}
                        handleBankChange={handleBankChange}
                        fetchInvoiceData={fetchInvoiceData}
                        loading={loading}
                        referenceExists={referenceExists}
                        handleReferenceChange={handleReferenceChange}
                        montantFacture={montantFacture}
                        onViewExistingPayment={handleViewExistingPayment}
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
                                    disabled={btnLoading || referenceExists}
                                    tooltip={referenceExists ? "Impossible d'enregistrer - Ce bordereau existe déjà" : "Enregistrer le paiement"}
                                    severity="secondary"
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
                                    lazy
                                    paginator
                                    first={lazyState.first}
                                    rows={lazyState.rows}
                                    totalRecords={totalRecords}
                                    onPage={onPage}
                                    rowsPerPageOptions={[50, 100, 200, 500]}
                                    emptyMessage="Aucune autre facture trouvée"
                                    loading={loading}
                                >
                                    <Column field="factureId" header="Numéro Facture" sortable />
                                    <Column field="type" header="Type" sortable />
                                    <Column field="nomClient" header="Client" sortable />
                                    <Column field="modePaiement" header="Mode Paiement" sortable />
                                    <Column field="datePaiement" header="Date Paiement" body={(rowData) => formatDate(rowData.datePaiement)} sortable />
                                    <Column field="montantPaye" header="Montant Payé" body={(rowData) => formatCurrency(rowData.montantPaye)} sortable />
                                    <Column field="montantExcedent" header="Montant Excédent"
                                        body={(rowData) => {
                                            const montant = rowData.montantExcedent || 0;
                                            const className = montant > 0 ? 'text-green-500 font-bold' : montant < 0 ? 'text-red-500 font-bold' : '';
                                            return <span className={className}>{formatCurrency(montant)}</span>;
                                        }}
                                        sortable
                                    />
                                    <Column field="reference" header="Borderaux" sortable />
                                    <Column field="rsp" header="RSP" sortable />
                                    <Column field="credit" header="Crédit" body={(rowData) => rowData.credit ? 'Oui' : 'Non'} sortable />
                                    <Column field="userCreation" header="Caissier" sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>

            {/* Hidden printable component for A7 E-PoS printing */}
            <div style={{ display: 'none' }}>
                <PrintableRecuPaiement
                    ref={printRef}
                    entryPayement={lastSavedEntry || new EntryPayement()}
                    bank={banks.find(bank => bank.banqueId === lastSavedEntry?.banqueId)}
                    bankAccount={bankAccounts.find(account => account.compteBanqueId === lastSavedEntry?.compteBanqueId)}
                    paymentModeLabel={getPaymentModeLabel(lastSavedEntry?.modePaiement || '')}
                />
            </div>
        </>
    );
}

export default EntryPayementComponent;