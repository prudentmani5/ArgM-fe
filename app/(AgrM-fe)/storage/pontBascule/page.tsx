'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { PontBascule } from './PontBascule';
import PontBasculeForm from './PontBasculeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Importer } from '../../(settings)/settings/importateur/Importer';
import Cookies from 'js-cookie';
import { useReactToPrint } from 'react-to-print';
import PrintablePontBascule from './PrintablePontBascule';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { formatLocalDateTime } from '../../../../utils/dateUtils';

function PontBasculeComponent() {
    const [pontBascule, setPontBascule] = useState<PontBascule>(new PontBascule());
    const [pontBasculeEdit, setPontBasculeEdit] = useState<PontBascule>(new PontBascule());
    const [editPontBasculeDialog, setEditPontBasculeDialog] = useState(false);
    const [pontsBascule, setPontsBascule] = useState<PontBascule[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [savedPontBasculeId, setSavedPontBasculeId] = useState<number | null>(null);
    const [searchPlaque, setSearchPlaque] = useState<string>('');
    const [searchFactureId, setSearchFactureId] = useState<string>('');
    const [isUpdatingMode, setIsUpdatingMode] = useState<boolean>(false);
    const [clientNameForPrint, setClientNameForPrint] = useState<string>('');

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: factureData, loading: factureLoading, error: factureError, fetchData: fetchFactureData, callType: factureCallType } = useConsumApi('');
    const { data: searchPlaqueData, loading: searchPlaqueLoading, error: searchPlaqueError, fetchData: fetchSearchPlaque, callType: searchPlaqueCallType } = useConsumApi('');
    const { data: singleImportateurData, loading: singleImportateurLoading, error: singleImportateurError, fetchData: fetchSingleImportateur, callType: singleImportateurCallType } = useConsumApi('');
    const { data: banqueData, loading: banqueLoading, error: banqueError, fetchData: fetchBanqueData, callType: banqueCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const printRef = useRef<HTMLDivElement>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null,
        filters: {
            plaque: { value: '', matchMode: 'contains' }
        }
    });
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const [importateurFilter, setImportateurFilter] = useState('');

    // Add ref to track fetched importateurs to prevent infinite loop
    const fetchedImportateursRef = useRef<Set<number>>(new Set());
    // Add ref to track fetched banks to prevent infinite loop
    const fetchedBanquesRef = useRef<Set<number>>(new Set());
    // Add ref to track if facture data has been loaded (to prevent reloading)
    const factureDataLoadedRef = useRef<boolean>(false);

    const BASE_URL = `${API_BASE_URL}/pontbascules`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_BY_ID = `${API_BASE_URL}/importers/findbyid`;
    const FACTURE_SEARCH_URL = `${API_BASE_URL}/servicepreste/searchByFacture`;
    const ENTRY_PAYEMENT_SEARCH_URL = `${API_BASE_URL}/entryPayements/findByNumFactureWithDetails`;
    const URL_BANK = `${API_BASE_URL}/banks/findbyid`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllImportateurs();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadPontsBascule') {
                setPontsBascule(data.content || []);
                setTotalRecords(data.totalElements || 0);
            }
            if (callType === 'createPontBascule') {
                setSavedPontBasculeId(data.numPBId);
                // Update pontBascule with the returned ID so it appears in printable
                setPontBascule(prev => {
                    const updated = new PontBascule();
                    Object.assign(updated, prev);
                    updated.numPBId = data.numPBId;
                    return updated;
                });
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            }
            if (callType === 'updatePontBascule' && activeIndex === 0) {
                setSavedPontBasculeId(data.numPBId);
                // Update pontBascule with the returned ID so it appears in printable
                setPontBascule(prev => {
                    const updated = new PontBascule();
                    Object.assign(updated, prev);
                    updated.numPBId = data.numPBId;
                    return updated;
                });
                accept('info', 'Succès', 'La 2ème pesée a été enregistrée avec succès.');
                setIsUpdatingMode(false);
            }
        }

        if (importateurData && importateurCallType === 'loadAllImportateur' && importateurData.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }

        // Handle single importateur fetch result - FIXED to prevent infinite loop
        if (singleImportateurData && singleImportateurCallType === 'loadSingleImportateur') {
            const importateurId = singleImportateurData.importateurId;

            // Only process if we haven't already added this importateur
            if (importateurId && !fetchedImportateursRef.current.has(importateurId)) {
                // Mark as fetched
                fetchedImportateursRef.current.add(importateurId);

                // Check if this importateur is already in the list
                const exists = importateurs.find(imp => imp.importateurId === importateurId);
                if (!exists) {
                    setImportateurs(prev => [...prev, singleImportateurData]);
                }
            }
        }

        // Handle EntryPayement search with service details
        if (factureData && factureCallType === 'searchEntryPayement') {
            // Only load facture data once - prevent reloading until form is reset
            if (factureDataLoadedRef.current) {
                return; // Skip if already loaded
            }

            // Mark as loaded
            factureDataLoadedRef.current = true;

            // factureData is EntryPayementWithServiceDto
            const payment = factureData as any;

            // DEBUG: Log the received payment data
            console.log('=== PLAQUE FETCH DEBUG (Frontend) ===');
            console.log('Received payment data:', payment);
            console.log('Payment type:', payment.type);
            console.log('Payment plaque:', payment.plaque);
            console.log('Payment dateDebut:', payment.dateDebut);

            setPontBascule(prev => {
                const updated = new PontBascule();
                Object.assign(updated, prev);

                // Common fields for all types
                updated.clientId = payment.clientId || null;
                updated.numBorderau = payment.reference || ''; // Use EntryPayement reference for numBorderau

                // Check payment type to determine what fields to populate
                const isServiceType = payment.type &&
                    (payment.type === 'SERV' || payment.type === 'Service' || payment.type === 'SERVBUCECO' || payment.type === 'AutresBUCECO');

                if (isServiceType) {
                    // For Service type: Only populate plaque and dateEntree
                    // DO NOT populate lt (lettreTransp) or rsp
                    updated.plaque = payment.plaque || '';
                    updated.lt = ''; // Clear lettreTransp for Service type
                    updated.rsp = ''; // Clear RSP for Service type

                    // Use dateDebut from FacServicePreste
                    if (payment.dateDebut) {
                        updated.dateEntree = new Date(payment.dateDebut);
                    }

                    // DEBUG: Log plaque assignment for service type
                    console.log('isServiceType=true, assigned plaque:', updated.plaque);
                } else if (payment.rsp) {
                    // For RSP type: Populate lettreTransp, rsp, and dateEntree from MagSortiePort
                    updated.lt = payment.lettreTransp || '';
                    updated.rsp = payment.rsp || '';
                    updated.plaque = payment.plaque || '';

                    // Use rspDateEntree from MagSortiePort
                    if (payment.rspDateEntree) {
                        updated.dateEntree = new Date(payment.rspDateEntree);
                    }

                    // DEBUG: Log plaque assignment for RSP type
                    console.log('RSP type, assigned plaque:', updated.plaque);
                } else {
                    // DEBUG: Log when neither condition matches
                    console.log('Neither isServiceType nor RSP, plaque not assigned');
                }

                console.log('=== END PLAQUE FETCH DEBUG (Frontend) ===');
                return updated;
            });

            // Fetch the specific importateur if we have an ID and haven't fetched it yet
            const importateurIdToUse = payment.importateurId || payment.clientId;
            if (importateurIdToUse && !fetchedImportateursRef.current.has(importateurIdToUse)) {
                fetchSingleImportateur(
                    null,
                    'GET',
                    `${URL_IMPORTATEUR_BY_ID}/${importateurIdToUse}`,
                    'loadSingleImportateur'
                );
            }

            // Fetch the Bank directly using banqueId to get the sigle
            if (payment.banqueId && !fetchedBanquesRef.current.has(payment.banqueId)) {
                fetchedBanquesRef.current.add(payment.banqueId);
                fetchBanqueData(
                    null,
                    'GET',
                    `${URL_BANK}/${payment.banqueId}`,
                    'loadBanque'
                );
            }

            accept('info', 'Paiement trouvé', 'Les informations de paiement et service ont été chargées.');
        } else if (factureCallType === 'searchEntryPayement' && !factureData) {
            accept('warn', 'Aucun résultat', 'Aucun paiement trouvé avec ce numéro de facture.');
        }

        // Keep old searchFacture handler as fallback if needed
        if (factureData && factureCallType === 'searchFacture') {
            if (Array.isArray(factureData) && factureData.length > 0) {
                const facture = factureData[0];

                setPontBascule(prev => ({
                    ...prev,
                    plaque: facture.plaque || '',
                    lt: facture.lettreTransp || '',
                    clientId: facture.importateurId || null
                }));

                // Fetch the specific importateur if we have an ID and haven't fetched it yet
                if (facture.importateurId && !fetchedImportateursRef.current.has(facture.importateurId)) {
                    fetchSingleImportateur(
                        null,
                        'GET',
                        `${URL_IMPORTATEUR_BY_ID}/${facture.importateurId}`,
                        'loadSingleImportateur'
                    );
                }

                accept('info', 'Facture trouvée', 'Les informations de la facture ont été chargées.');
            } else {
                accept('warn', 'Aucun résultat', 'Aucune facture trouvée avec ce numéro.');
            }
        }

        // Handle search by plaque for incomplete weighing
        if (searchPlaqueData && searchPlaqueCallType === 'searchIncompleteByPlaque') {
            setPontBascule({
                ...searchPlaqueData,
                // Convert date strings from backend to Date objects for Calendar components
                datePont1: searchPlaqueData.datePont1 ? new Date(searchPlaqueData.datePont1) : null,
                datePont2: new Date(), // Set current date for 2nd weighing
                dateEntree: searchPlaqueData.dateEntree ? new Date(searchPlaqueData.dateEntree) : null
            });
            setIsUpdatingMode(true);
            setSavedPontBasculeId(searchPlaqueData.numPBId);
            
            // Also fetch the client if exists and not already fetched
            if (searchPlaqueData.clientId && !fetchedImportateursRef.current.has(searchPlaqueData.clientId)) {
                fetchSingleImportateur(
                    null, 
                    'GET', 
                    `${URL_IMPORTATEUR_BY_ID}/${searchPlaqueData.clientId}`, 
                    'loadSingleImportateur'
                );
            }
            
            accept('info', 'Pesée trouvée', 'Pesée incomplète trouvée. Veuillez compléter la 2ème pesée.');
        }

        if (searchPlaqueError && searchPlaqueCallType === 'searchIncompleteByPlaque') {
            accept('info', 'Aucun résultat', 'Aucune pesée incomplète trouvée pour cette plaque.');
        }

        handleAfterApiCall(activeIndex);
    }, [data, importateurData, factureData, searchPlaqueData, searchPlaqueError, singleImportateurData]);

    // Separate useEffect for Bank to prevent loop
    useEffect(() => {
        // Handle bank data and populate sigle field
        if (banqueData && banqueCallType === 'loadBanque') {
            setPontBascule(prev => {
                const updated = new PontBascule();
                Object.assign(updated, prev);
                updated.sigle = banqueData.sigle || '';
                return updated;
            });
        }
    }, [banqueData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    const handleSearchIncompleteByPlaque = () => {
        if (!searchPlaque.trim() && !searchFactureId.trim()) {
            accept('warn', 'Attention', 'Veuillez saisir une plaque ou un N° Facture.');
            return;
        }

        const params = new URLSearchParams();
        if (searchPlaque.trim()) {
            params.append('plaque', searchPlaque.trim());
        }
        if (searchFactureId.trim()) {
            params.append('factureId', searchFactureId.trim());
        }

        const url = `${BASE_URL}/search/incomplete?${params.toString()}`;
        fetchSearchPlaque(null, 'GET', url, 'searchIncompleteByPlaque');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPontBascule((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPontBasculeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        setPontBascule((prev) => {
            const updated = { ...prev, [field]: value };

            // Auto-calculate montantPalette when nbrePalette changes
            if (field === 'nbrePalette') {
                updated.montantPalette = (value || 0) * 100;
            }

            // Auto-calculate net weight when either weight changes or montantPalette changes
            if (field === 'poidsVide' || field === 'poidsCharge' || field === 'nbrePalette' || field === 'montantPalette') {
                const poids1 = field === 'poidsVide' ? (value || 0) : (updated.poidsVide || 0);
                const poids2 = field === 'poidsCharge' ? (value || 0) : (updated.poidsCharge || 0);
                const montant = updated.montantPalette || 0;
                updated.poidsNet = Math.abs(poids1 - poids2) - montant;
            }

            return updated;
        });
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        setPontBasculeEdit((prev) => {
            const updated = { ...prev, [field]: value };

            // Auto-calculate montantPalette when nbrePalette changes
            if (field === 'nbrePalette') {
                updated.montantPalette = (value || 0) * 100;
            }

            // Auto-calculate net weight when either weight changes or montantPalette changes
            if (field === 'poidsVide' || field === 'poidsCharge' || field === 'nbrePalette' || field === 'montantPalette') {
                const poids1 = field === 'poidsVide' ? (value || 0) : (updated.poidsVide || 0);
                const poids2 = field === 'poidsCharge' ? (value || 0) : (updated.poidsCharge || 0);
                const montant = updated.montantPalette || 0;
                updated.poidsNet = Math.abs(poids1 - poids2) - montant;
            }

            return updated;
        });
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setPontBascule((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setPontBasculeEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setPontBascule((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setPontBasculeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFactureBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const factureId = e.target.value;
        if (factureId && factureId.trim()) {
            // Search in EntryPayement (RCTPaiement) first to get payment details with bank info
            const url = `${ENTRY_PAYEMENT_SEARCH_URL}?factureId=${encodeURIComponent(factureId.trim())}`;
            fetchFactureData(null, 'GET', url, 'searchEntryPayement');
        }
    };

    const handleSubmit = () => {
        // Validation for first weighing
        if (!isUpdatingMode) {
            if (!pontBascule.plaque || !pontBascule.poidsVide || !pontBascule.datePont1) {
                accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires (Plaque, Poids 1ère Pesée, Date 1ère Pesée).');
                return;
            }
        } else {
            // Validation for second weighing
            if (!pontBascule.poidsCharge || !pontBascule.datePont2) {
                accept('warn', 'Attention', 'Veuillez remplir la 2ème pesée (Poids 2ème Pesée et Date 2ème Pesée).');
                return;
            }
        }

        setBtnLoading(true);

        // Prepare DTO with dates converted to strings to avoid timezone issues
        const pontBasculeToSave = {
            numPBId: pontBascule.numPBId,
            type: pontBascule.type,
            factureId: pontBascule.factureId,
            plaque: pontBascule.plaque,
            poidsVide: pontBascule.poidsVide,
            datePont1: pontBascule.datePont1 ? formatLocalDateTime(pontBascule.datePont1) : null,
            poidsCharge: pontBascule.poidsCharge,
            datePont2: pontBascule.datePont2 ? formatLocalDateTime(pontBascule.datePont2) : null,
            poidsNet: pontBascule.poidsNet,
            rsp: pontBascule.rsp,
            poidsRSP: pontBascule.poidsRSP,
            numDecl: pontBascule.numDecl,
            nbrePalette: pontBascule.nbrePalette,
            numBorderau: pontBascule.numBorderau,
            montantPalette: pontBascule.montantPalette,
            dateEntree: pontBascule.dateEntree ? formatLocalDateTime(pontBascule.dateEntree) : null,
            lt: pontBascule.lt,
            clientId: pontBascule.clientId,
            observation: pontBascule.observation,
            gardienage: pontBascule.gardienage,
            sigle: pontBascule.sigle
        };

        console.log('=== HANDLE SUBMIT DEBUG ===');
        console.log('poidsNet being saved:', pontBasculeToSave.poidsNet);
        console.log('poidsVide:', pontBasculeToSave.poidsVide);
        console.log('poidsCharge:', pontBasculeToSave.poidsCharge);
        console.log('montantPalette:', pontBasculeToSave.montantPalette);
        console.log('Full pontBascule DTO:', JSON.stringify(pontBasculeToSave, null, 2));
        console.log('=== END HANDLE SUBMIT DEBUG ===');

        if (isUpdatingMode) {
            // Update existing record
            fetchData(pontBasculeToSave, 'PUT', `${BASE_URL}/update/${pontBascule.numPBId}`, 'updatePontBascule');
        } else {
            // Create new record
            fetchData(pontBasculeToSave, 'POST', `${BASE_URL}/new`, 'createPontBascule');
        }

        setBtnLoading(false);
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);

        // Prepare DTO with dates converted to strings to avoid timezone issues
        const pontBasculeEditToSave = {
            numPBId: pontBasculeEdit.numPBId,
            type: pontBasculeEdit.type,
            factureId: pontBasculeEdit.factureId,
            plaque: pontBasculeEdit.plaque,
            poidsVide: pontBasculeEdit.poidsVide,
            datePont1: pontBasculeEdit.datePont1 ? formatLocalDateTime(pontBasculeEdit.datePont1) : null,
            poidsCharge: pontBasculeEdit.poidsCharge,
            datePont2: pontBasculeEdit.datePont2 ? formatLocalDateTime(pontBasculeEdit.datePont2) : null,
            poidsNet: pontBasculeEdit.poidsNet,
            rsp: pontBasculeEdit.rsp,
            poidsRSP: pontBasculeEdit.poidsRSP,
            numDecl: pontBasculeEdit.numDecl,
            nbrePalette: pontBasculeEdit.nbrePalette,
            numBorderau: pontBasculeEdit.numBorderau,
            montantPalette: pontBasculeEdit.montantPalette,
            dateEntree: pontBasculeEdit.dateEntree ? formatLocalDateTime(pontBasculeEdit.dateEntree) : null,
            lt: pontBasculeEdit.lt,
            clientId: pontBasculeEdit.clientId,
            observation: pontBasculeEdit.observation,
            gardienage: pontBasculeEdit.gardienage,
            sigle: pontBasculeEdit.sigle
        };

        fetchData(pontBasculeEditToSave, 'PUT', `${BASE_URL}/update/${pontBasculeEdit.numPBId}`, 'updatePontBascule');
    };

    const handlePrintPDF = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Fiche_Pesage_${pontBascule.numPBId || savedPontBasculeId || 'new'}`,
        onBeforePrint: async () => {
            // Update client name before printing
            if (pontBascule.clientId) {
                const client = importateurs.find(imp => imp.importateurId === pontBascule.clientId);
                if (client) {
                    setClientNameForPrint(client.nom);
                }
            }
        },
        onAfterPrint: () => {
            accept('success', 'Succès', 'L\'impression a été lancée avec succès.');
        }
    });

    const onPrintClick = () => {
        if (!savedPontBasculeId && !pontBascule.numPBId) {
            accept('warn', 'Attention', 'Veuillez d\'abord enregistrer la fiche de pesage.');
            return;
        }
        handlePrintPDF();
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updatePontBascule') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updatePontBascule') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des ponts bascule.');
        } else if (data !== null && error === null) {
            if (callType === 'updatePontBascule' && chooseenTab === 1) {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setPontBasculeEdit(new PontBascule());
                setEditPontBasculeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterPontBascule = () => {
        setPontBascule(new PontBascule());
        setSavedPontBasculeId(null);
        setSearchPlaque('');
        setSearchFactureId('');
        setIsUpdatingMode(false);
        // Reset the facture data loaded flag to allow loading new facture data
        factureDataLoadedRef.current = false;
    };

    const loadPontBasculeToEdit = (data: PontBascule) => {
        if (data) {
            setEditPontBasculeDialog(true);
            // Create a deep copy to avoid mutating the original data
            setPontBasculeEdit({
                ...data,
                datePont1: data.datePont1 ? new Date(data.datePont1) : null,
                datePont2: data.datePont2 ? new Date(data.datePont2) : null,
                dateEntree: data.dateEntree ? new Date(data.dateEntree) : null
            });

            // Also fetch the client if exists and not already fetched
            if (data.clientId && !fetchedImportateursRef.current.has(data.clientId)) {
                fetchSingleImportateur(
                    null,
                    'GET',
                    `${URL_IMPORTATEUR_BY_ID}/${data.clientId}`,
                    'loadSingleImportateur'
                );
            }
        }
    };

    const loadAllImportateurs = (searchName: string = '', page: number = 0, size: number = 20) => {
        let pageNumber = 0;
        let sizeNumber = 20;

        if (Number.isNaN(page) || page === 0 || page === 1) {
            setLoadedPages(new Set([0]));
            setImportateurs([]);
        } else {
            pageNumber = page;
        }

        if (Number.isNaN(size) || size === 0) {
            sizeNumber = 20;
        } else {
            sizeNumber = size;
        }

        const url = `${URL_IMPORTATEUR}?query=${encodeURIComponent(searchName)}&page=${pageNumber}&size=${sizeNumber}`;
        fetchImportateurData(null, "GET", url, "loadAllImportateur");
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;
        const pageNumber = Math.floor(e.first / pageSize);

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, pageSize);
        }
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadPontBasculeToEdit(data)} raised severity='warning' />
                <Button icon="pi pi-print" onClick={() => printPontBascule(data)} raised severity='info' />
            </div>
        );
    };

    const printPontBascule = async (data: PontBascule) => {
        try {
            // Load the pont bascule data into state
            setPontBascule(data);
            setSavedPontBasculeId(data.numPBId);

            // Update client name if exists
            if (data.clientId) {
                const client = importateurs.find(imp => imp.importateurId === data.clientId);
                if (client) {
                    setClientNameForPrint(client.nom);
                } else if (!fetchedImportateursRef.current.has(data.clientId)) {
                    // Fetch the client if not in list
                    await fetchSingleImportateur(
                        null,
                        'GET',
                        `${URL_IMPORTATEUR_BY_ID}/${data.clientId}`,
                        'loadSingleImportateur'
                    );
                }
            }

            // Small delay to ensure state is updated
            setTimeout(() => {
                handlePrintPDF();
            }, 100);
        } catch (error) {
            console.error('Error printing PDF:', error);
            accept('error', 'Erreur', 'Erreur lors de l\'impression.');
        }
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows, filters } = params;
        const searchParams = new URLSearchParams({
            page: page.toString(),
            size: rows.toString(),
            plaque: filters.plaque.value
        });
        fetchData(null, 'GET', `${BASE_URL}/findall?${searchParams.toString()}`, 'loadPontsBascule');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const onFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newParams = {
            ...lazyParams,
            filters: {
                ...lazyParams.filters,
                plaque: { value: e.target.value, matchMode: 'contains' }
            }
        };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={() => {
                    setLazyParams(prev => ({
                        ...prev,
                        filters: { plaque: { value: '', matchMode: 'contains' } }
                    }));
                    loadAllData();
                }} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        placeholder="Recherche par Plaque"
                        value={lazyParams.filters.plaque.value}
                        onChange={onFilter}
                    />
                </span>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) : '';
    };

    const formatNumber = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(value || 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Pont Bascule"
                visible={editPontBasculeDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditPontBasculeDialog(false)}
            >
                <PontBasculeForm
                    pontBascule={pontBasculeEdit}
                    importateurs={importateurs}
                    loadingStatus={importateurLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    handleFactureBlur={handleFactureBlur}
                    importateurFilter={importateurFilter}
                    onImportateurFilterChange={handleImportateurFilterChange}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditPontBasculeDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    {/* Search section for incomplete weighing */}
                    <div className="card mb-3">
                        <h5 className="mb-3">Rechercher une pesée incomplète</h5>
                        <div className="formgrid grid">
                            <div className="field col-12 md:col-5">
                                <label htmlFor="searchPlaque">Plaque</label>
                                <InputText
                                    id="searchPlaque"
                                    placeholder="Saisir la plaque"
                                    value={searchPlaque}
                                    onChange={(e) => setSearchPlaque(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchIncompleteByPlaque();
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-5">
                                <label htmlFor="searchFactureId">N° Facture</label>
                                <InputText
                                    id="searchFactureId"
                                    placeholder="Saisir le N° Facture"
                                    value={searchFactureId}
                                    onChange={(e) => setSearchFactureId(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearchIncompleteByPlaque();
                                        }
                                    }}
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-12 md:col-2 flex align-items-end">
                                <Button
                                    icon="pi pi-search"
                                    label="Rechercher"
                                    onClick={handleSearchIncompleteByPlaque}
                                    loading={searchPlaqueLoading}
                                    className="w-full"
                                />
                            </div>
                        </div>
                        {isUpdatingMode && (
                            <div className="mt-2">
                                <span className="text-blue-500 font-bold">
                                    <i className="pi pi-info-circle mr-2"></i>
                                    Mode mise à jour - Compléter la 2ème pesée pour la fiche N° {pontBascule.numPBId}
                                </span>
                            </div>
                        )}
                    </div>

                    <PontBasculeForm
                        pontBascule={pontBascule}
                        importateurs={importateurs}
                        loadingStatus={importateurLoading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleLazyLoading={handleLazyLoading}
                        handleFactureBlur={handleFactureBlur}
                        importateurFilter={importateurFilter}
                        onImportateurFilterChange={handleImportateurFilterChange}
                    />

                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-2 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={clearFilterPontBascule}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-check"
                                    label={isUpdatingMode ? "Compléter 2ème Pesée" : "Enregistrer"}
                                    loading={btnLoading}
                                    onClick={handleSubmit}
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button
                                    icon="pi pi-print"
                                    label="Imprimer la fiche"
                                    severity="info"
                                    onClick={onPrintClick}
                                    disabled={!savedPontBasculeId && !pontBascule.numPBId}
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
                                    value={pontsBascule}
                                    header={renderSearch}
                                    emptyMessage={"Pas de données de pont bascule à afficher"}
                                    lazy
                                    paginator
                                    rows={lazyParams.rows}
                                    totalRecords={totalRecords}
                                    first={lazyParams.first}
                                    onPage={(e) => {
                                        const newParams = {
                                            ...lazyParams,
                                            first: e.first,
                                            rows: e.rows,
                                            page: e.page
                                        };
                                        setLazyParams(newParams);
                                        loadAllData(newParams);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="numPBId" header="N° Fiche" sortable />
                                    <Column field="plaque" header="Plaque" sortable />
                                    <Column field="datePont1" header="Date 1ère Pesée" body={(rowData) => formatDate(rowData.datePont1)} sortable />
                                    <Column field="poidsVide" header="Poids 1ère (kg)" body={(rowData) => formatNumber(rowData.poidsVide)} sortable />
                                    <Column field="datePont2" header="Date 2ème Pesée" body={(rowData) => formatDate(rowData.datePont2)} sortable />
                                    <Column field="poidsCharge" header="Poids 2ème (kg)" body={(rowData) => formatNumber(rowData.poidsCharge)} sortable />
                                    <Column field="poidsNet" header="Poids Net (kg)" body={(rowData) => formatNumber(rowData.poidsNet)} sortable />
                                    <Column field="lt" header="L.T/T1/PAC" sortable />
                                    <Column field="factureId" header="N° Facture" sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>

            {/* Hidden printable component */}
            <div style={{ display: 'none' }}>
                <PrintablePontBascule
                    ref={printRef}
                    pontBascule={pontBascule}
                    clientName={clientNameForPrint}
                />
            </div>
        </>
    );
}

export default PontBasculeComponent;