'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { SortiePortGPS } from './SortiePortGPS';
import SortiePortGPSForm from './SortiePortGPSForm';
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
import { PontBascule } from '../../storage/pontBascule/PontBascule';
import { AgenceDouane } from '../../(settings)/settings/agence/AgenceDouane';
import { buildApiUrl } from '../../../../utils/apiConfig';
import { formatLocalDateTime } from '../../../../utils/dateUtils';
import { FacServicePreste } from '../../entryMagasin/(entryVehicule)/factServicePreste/FacServicePreste';


const typeOperationOptions = [
    { label: '[Aucun]', value: '' },
    { label: 'Déchargement à domicile 20\'', value: 'DAD 20\'' },
    { label: 'Déchargement à domicile 40\'', value: 'DAD 40\'' },
    { label: 'Déchargement au port 20\'', value: 'DP 20\'' },
    { label: 'Déchargement au port 40\'', value: 'DP 40\'' },
    { label: 'Autres (Chargement)', value: 'AD' }
];


function SortiePortGPSComponent() {
    const [sortiePortGPS, setSortiePortGPS] = useState<SortiePortGPS>(new SortiePortGPS());
    const [sortiePortGPSEdit, setSortiePortGPSEdit] = useState<SortiePortGPS>(new SortiePortGPS());
    const [editSortiePortGPSDialog, setEditSortiePortGPSDialog] = useState(false);
    const [sortiesPortGPS, setSortiesPortGPS] = useState<SortiePortGPS[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [agencesDouane, setAgencesDouane] = useState<AgenceDouane[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [savedSortiePortGPSId, setSavedSortiePortGPSId] = useState<number | null>(null);
    const [pontBasculeDialog, setPontBasculeDialog] = useState(false);
    const [facServicePresteList, setFacServicePresteList] = useState<FacServicePreste[]>([]);
    const [facServicePresteDialog, setFacServicePresteDialog] = useState(false);
    const [pendingFacture, setPendingFacture] = useState<{ facture: any; allFactures: FacServicePreste[] } | null>(null);

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: singleImportateurData, fetchData: fetchSingleImportateur, callType: singleImportateurCallType } = useConsumApi('');
    const { data: entryPaymentData, error: entryPaymentError, fetchData: fetchEntryPaymentData, callType: entryPaymentCallType } = useConsumApi('');
    const { data: pontBasculeData, fetchData: fetchPontBasculeData, callType: pontBasculeCallType } = useConsumApi('');
    const { data: facServicePresteData, fetchData: fetchFacServicePresteData, callType: facServicePresteCallType } = useConsumApi('');
    const { data: banqueData, fetchData: fetchBanqueData, callType: banqueCallType } = useConsumApi('');
    const { data: agenceDouaneData, fetchData: fetchAgenceDouaneData, callType: agenceDouaneCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null,
        filters: {
            searchTerm: { value: '', matchMode: 'contains' }
        }
    });
    const importateurValueRef = useRef('');
    const [importateurFilter, setImportateurFilter] = useState('');
    const fetchedImportateursRef = useRef<Set<number>>(new Set());
    const fetchedBanquesRef = useRef<Set<number>>(new Set());

    const BASE_URL = buildApiUrl('/sortiePortGPS');
    const URL_IMPORTATEUR = buildApiUrl('/importers/search');
    const URL_IMPORTATEUR_BY_ID = buildApiUrl('/importers/findbyid');
    const ENTRY_PAYEMENT_SEARCH_URL = buildApiUrl('/entryPayements/findByNumFactureWithDetails');
    const PONT_BASCULE_BY_FACTURE_URL = buildApiUrl('/pontbascules/byFacture');
    const FAC_SERVICE_PRESTE_BY_GPS_URL = buildApiUrl('/servicepreste/findByGpsWithServiceName');
    const URL_BANK = buildApiUrl('/banks/findbyid');
    const URL_AGENCE_DOUANE = buildApiUrl('/agencedouanes');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        loadAllImportateurs();
        loadAllAgencesDouane();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadSortiesPortGPS') {
                setSortiesPortGPS(data.content || []);
                setTotalRecords(data.totalElements || 0);
            }
            if (callType === 'createSortiePortGPS') {
                setSavedSortiePortGPSId(data.sortiePortGPSId);
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
                loadSortiesPortGPS();
            }
            if (callType === 'updateSortiePortGPS' && activeIndex === 0) {
                setSavedSortiePortGPSId(data.sortiePortGPSId);
                accept('info', 'Succès', 'La mise à jour a été effectuée avec succès.');
                loadSortiesPortGPS();
            }
        }
    }, [data, callType]);

    useEffect(() => {
        if (importateurData && importateurCallType === 'loadAllImportateur' && importateurData.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }

        if (singleImportateurData && singleImportateurCallType === 'loadSingleImportateur') {
            const importateurId = singleImportateurData.importateurId;
            console.log('========== CLIENT LOADED ==========');
            console.log('Client data:', singleImportateurData);
            console.log('Client ID:', importateurId);
            console.log('Client Name:', singleImportateurData.nomImportateur);
            console.log('===================================');

            if (importateurId) {
                const exists = importateurs.find(imp => imp.importateurId === importateurId);
                if (!exists) {
                    setImportateurs(prev => {
                        // Double-check to avoid race conditions
                        const stillNotExists = !prev.find(imp => imp.importateurId === importateurId);
                        if (stillNotExists) {
                            const newList = [singleImportateurData, ...prev];
                            console.log('Client added to dropdown. New list size:', newList.length);
                            return newList;
                        }
                        console.log('Client already in list (race condition avoided)');
                        return prev;
                    });
                } else {
                    console.log('Client already exists in dropdown list');
                }
            }
        }
    }, [importateurData, singleImportateurData]);

    // Separate useEffect for Bank to prevent loop and handle bank name/sigle
    useEffect(() => {
        if (banqueData && banqueCallType === 'loadBanque') {
            setSortiePortGPS(prev => {
                const updated = new SortiePortGPS();
                Object.assign(updated, prev);
                updated.banqueName = banqueData.sigle || banqueData.nomBanque || '';
                return updated;
            });
        }
    }, [banqueData, banqueCallType]);

    // Load AgenceDouane data
    useEffect(() => {
        if (agenceDouaneData && agenceDouaneCallType === 'loadAllAgencesDouane') {
            console.log('========== AgenceDouane DATA LOADED ==========');
            console.log('AgenceDouane data:', agenceDouaneData);
            const agences = Array.isArray(agenceDouaneData) ? agenceDouaneData : [];
            setAgencesDouane(agences);
            console.log('Total Agences loaded:', agences.length);
            console.log('==============================================');
        }
    }, [agenceDouaneData, agenceDouaneCallType]);

    useEffect(() => {
        // Handle EntryPayment search - loads N° Bordereau, Montant, and bank info
        // Only proceed with the rest of the flow if payment is found
        if (entryPaymentData && entryPaymentCallType === 'searchEntryPayement' && pendingFacture) {
            const payment = entryPaymentData as any;
            const { facture, allFactures } = pendingFacture;
            const numFacture = facture.numFacture || '';

            // Update sortiePortGPS with all data now that payment is confirmed
            setSortiePortGPS(prev => {
                const updated = new SortiePortGPS();
                Object.assign(updated, prev);
                // From FacServicePreste
                updated.clientId = facture.importateurId || null;
                updated.dateEntree = facture.dateDebut ? new Date(facture.dateDebut) : new Date();
                updated.dateSortie = facture.dateFin ? new Date(facture.dateFin) : new Date();
                updated.typeOperation = facture.typeDechargement || '';
                updated.numQuittance = numFacture;
                // From EntryPayment
                updated.numBordereau = payment.reference || '';
                updated.montant = payment.montantPaye || null;
                updated.banqueId = payment.banqueId || null;
                return updated;
            });

            // Fetch the Bank directly using banqueId to get the bank name/sigle
            if (payment.banqueId && !fetchedBanquesRef.current.has(payment.banqueId)) {
                fetchedBanquesRef.current.add(payment.banqueId);
                fetchBanqueData(
                    null,
                    'GET',
                    `${URL_BANK}/${payment.banqueId}`,
                    'loadBanque'
                );
            }

            // Now proceed with client fetch and PontBascule since payment was found
            // Fetch the client/importateur - check ref to prevent duplicates
            if (facture.importateurId && !fetchedImportateursRef.current.has(facture.importateurId)) {
                console.log('Fetching client with ID:', facture.importateurId);
                fetchedImportateursRef.current.add(facture.importateurId);
                fetchSingleImportateur(
                    null,
                    'GET',
                    `${URL_IMPORTATEUR_BY_ID}/${facture.importateurId}`,
                    'loadSingleImportateur'
                );
            } else if (facture.importateurId) {
                console.log('Client already fetched or being fetched, ID:', facture.importateurId);
            } else {
                console.warn('WARNING: No importateurId found in FacServicePreste data!');
            }

            // Check if ANY FacServicePreste has passPontBascule = true
            const hasAnyPassPontBascule = allFactures.some(f => f.passPontBascule === true);
            console.log('Has any passPontBascule:', hasAnyPassPontBascule);

            // Only load PontBascule instances if at least one FacServicePreste has passPontBascule = true
            if (numFacture && hasAnyPassPontBascule) {
                fetchPontBasculeData(
                    null,
                    'GET',
                    `${PONT_BASCULE_BY_FACTURE_URL}?factureId=${encodeURIComponent(numFacture)}`,
                    'searchPontBasculeByFacture'
                );
                accept('info', 'GPS trouvé', 'Les informations du service ont été chargées.');
            } else {
                // No passPontBascule, services are available for viewing
                accept('info', 'GPS trouvé', `${allFactures.length} service(s) trouvé(s). Cliquez sur "Voir Services" pour afficher les détails.`);
            }

            // Clear pending facture
            setPendingFacture(null);
        }
    }, [entryPaymentData, entryPaymentCallType, pendingFacture]);

    // Handle EntryPayment error (404 = not found or not paid)
    useEffect(() => {
        if (entryPaymentError && entryPaymentCallType === 'searchEntryPayement') {
            const errorStatus = (entryPaymentError as any)?.response?.status || (entryPaymentError as any)?.status;
            if (errorStatus === 404) {
                accept('warn', 'Non trouvé', 'Le GPS n\'existe pas ou n\'a pas encore été encaissé.');
            }
            // Clear pending facture and services list on error
            setPendingFacture(null);
            setFacServicePresteList([]);
            // Reset sortiePortGPS form data
            setSortiePortGPS(new SortiePortGPS());
        }
    }, [entryPaymentError, entryPaymentCallType]);

    useEffect(() => {
        // Handle FacServicePreste search by GPS
        if (facServicePresteData && facServicePresteCallType === 'searchFacServicePresteByGPS') {
            // Handle both single object and array responses
            let facture = null;
            let allFactures: FacServicePreste[] = [];

            if (Array.isArray(facServicePresteData) && facServicePresteData.length > 0) {
                allFactures = facServicePresteData as FacServicePreste[];
                facture = facServicePresteData[0];
            } else if (facServicePresteData && typeof facServicePresteData === 'object' && !Array.isArray(facServicePresteData)) {
                // Single object response
                facture = facServicePresteData;
                allFactures = [facServicePresteData as FacServicePreste];
            }

            // Store all FacServicePreste entries for dialog display
            setFacServicePresteList(allFactures);

            if (facture) {
                const numFacture = facture.numFacture || '';

                console.log('========== FacServicePreste LOADED ==========');
                console.log('Full FacServicePreste data:', JSON.stringify(facture, null, 2));
                console.log('---');
                console.log('CLIENT ID (importateurId):', facture.importateurId);
                console.log('TYPE DECHARGEMENT:', facture.typeDechargement);
                console.log('numFacture:', numFacture);
                console.log('dateDebut:', facture.dateDebut);
                console.log('dateFin:', facture.dateFin);
                console.log('lettreTransp:', facture.lettreTransp);
                console.log('plaque:', facture.plaque);
                console.log('Total FacServicePreste entries:', allFactures.length);
                console.log('============================================');

               

                console.log('State updated with:');
                console.log('- clientId:', facture.importateurId || null);
                console.log('- typeOperation:', facture.typeDechargement || '');

                // Store facture data for later processing after EntryPayment succeeds
                setPendingFacture({ facture, allFactures });

                // First, check if payment exists - this must succeed before proceeding
                if (numFacture) {
                    fetchEntryPaymentData(
                        null,
                        'GET',
                        `${ENTRY_PAYEMENT_SEARCH_URL}?factureId=${encodeURIComponent(numFacture)}`,
                        'searchEntryPayement'
                    );
                } else {
                    accept('warn', 'Aucun résultat', 'Aucun numéro de facture trouvé.');
                    setPendingFacture(null);
                }
            } else {
                console.log('No facture data found:', facServicePresteData);
                accept('warn', 'Aucun résultat', 'Aucun service trouvé pour ce GPS.');
            }
        }
    }, [facServicePresteData, facServicePresteCallType]);

    useEffect(() => {
        // Handle PontBascule search by Facture - stores list for dialog display
        if (pontBasculeData && pontBasculeCallType === 'searchPontBasculeByFacture') {
            if (Array.isArray(pontBasculeData) && pontBasculeData.length > 0) {
                const pontBascules = pontBasculeData as PontBascule[];

                setSortiePortGPS(prev => ({
                    ...prev,
                    pontBasculeList: pontBascules
                }));

                accept('info', 'Pesées trouvées', `${pontBascules.length} pesée(s) trouvée(s). Cliquez sur "Voir Pesées" pour sélectionner.`);
            } else {
                accept('warn', 'Aucune pesée', 'Aucune pesée trouvée pour cette facture.');
                setSortiePortGPS(prev => ({
                    ...prev,
                    pontBasculeList: []
                }));
            }
        }
    }, [pontBasculeData, pontBasculeCallType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    const loadAllImportateurs = (searchTerm: string = '', page: number = 0, size: number = 20) => {
        const url = `${URL_IMPORTATEUR}?nomImportateur=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`;
        fetchImportateurData(null, 'GET', url, 'loadAllImportateur');
    };

    const loadAllAgencesDouane = () => {
        console.log('Loading all AgencesDouane...');
        fetchAgenceDouaneData(null, 'GET', `${URL_AGENCE_DOUANE}/findall`, 'loadAllAgencesDouane');
    };

    const loadSortiesPortGPS = () => {
        const url = `${BASE_URL}/paginated?page=${lazyParams.page}&size=${lazyParams.rows}`;
        fetchData(null, 'GET', url, 'loadSortiesPortGPS');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSortiePortGPS((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setSortiePortGPS((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: string | Date | Date[] | null | undefined, field: string) => {
        // Handle Calendar's value which can be string, Date, Date[], null, or undefined
        let dateValue: Date;
        if (value instanceof Date) {
            dateValue = value;
        } else if (typeof value === 'string') {
            dateValue = new Date(value);
        } else if (Array.isArray(value) && value.length > 0) {
            dateValue = value[0];
        } else {
            dateValue = new Date();
        }
        setSortiePortGPS((prev) => ({ ...prev, [field]: dateValue }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setSortiePortGPS((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const page = Math.floor((e.first || 0) / (e.last || 20));
        loadAllImportateurs(importateurValueRef.current, page, 20);
    };

    const handleGpsBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const gpsValue = e.target.value.trim();
        if (gpsValue) {
            // Clear previous fetched data to allow fresh fetches
            fetchedImportateursRef.current.clear();
            fetchedBanquesRef.current.clear();

            // Search FacServicePreste by GPS (LT/PAC/T1) - this will trigger the cascade:
            // 1. FacServicePreste -> get numFacture, client, dates, Type Dechargement
            // 2. EntryPayment (from numFacture) -> get N° Bordereau (reference), Montant (montantPaye), Bank
            // 3. PontBascule list (from numFacture) -> show in dialog for selection
            fetchFacServicePresteData(
                null,
                'GET',
                `${FAC_SERVICE_PRESTE_BY_GPS_URL}?lettreTransp=${encodeURIComponent(gpsValue)}`,
                'searchFacServicePresteByGPS'
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setBtnLoading(true);

        const username = Cookies.get('username') || 'system';

        // Prepare data with dates converted to strings (format: yyyy-MM-dd HH:mm:ss)
        const sortieToSave = {
            sortiePortGPSId: sortiePortGPS.sortiePortGPSId,
            gps: sortiePortGPS.gps,
            clientId: sortiePortGPS.clientId,
            dateEntree: sortiePortGPS.dateEntree ? formatLocalDateTime(sortiePortGPS.dateEntree) : null,
            dateSortie: sortiePortGPS.dateSortie ? formatLocalDateTime(sortiePortGPS.dateSortie) : null,
            typeOperation: sortiePortGPS.typeOperation,
            numQuittance: sortiePortGPS.numQuittance,
            poids1erePesee: sortiePortGPS.poids1erePesee,
            poids2emePesee: sortiePortGPS.poids2emePesee,
            poidsNet: sortiePortGPS.poidsNet,
            numFiche: sortiePortGPS.numFiche,
            dmc: sortiePortGPS.dmc,
            banqueId: sortiePortGPS.banqueId,
            numBordereau: sortiePortGPS.numBordereau,
            montant: sortiePortGPS.montant,
            agenceDouaneId: sortiePortGPS.agenceDouaneId,
            plaque: sortiePortGPS.plaque,
            isExited: sortiePortGPS.isExited,
            userCreation: username,
            dateCreation: formatLocalDateTime(new Date())
        };

        // Debug logging - log the exact payload being sent
        console.log('========== SUBMIT DEBUG ==========');
        console.log('Payload to send:', JSON.stringify(sortieToSave, null, 2));
        console.log('Date formats (now as strings):');
        console.log('- dateEntree:', sortieToSave.dateEntree);
        console.log('- dateSortie:', sortieToSave.dateSortie);
        console.log('- dateCreation:', sortieToSave.dateCreation);
        console.log('===================================');

        fetchData(sortieToSave, 'POST', `${BASE_URL}/new`, 'createSortiePortGPS');
        setTimeout(() => {
            setBtnLoading(false);
            setSortiePortGPS(new SortiePortGPS());
        }, 1000);
    };

    const handleAfterApiCall = (index: number) => {
        if (index === 1) {
            loadSortiesPortGPS();
        }
    };

    const onPageChange = (event: any) => {
        setLazyParams({
            ...lazyParams,
            first: event.first,
            rows: event.rows,
            page: event.page
        });
    };

    useEffect(() => {
        if (activeIndex === 1) {
            loadSortiesPortGPS();
        }
    }, [lazyParams, activeIndex]);

    const editSortiePortGPS = (sortie: SortiePortGPS) => {
        setSortiePortGPSEdit({ ...sortie });
        setEditSortiePortGPSDialog(true);
    };

    const hideDialog = () => {
        setEditSortiePortGPSDialog(false);
    };

    const handleShowPontBasculeDialog = () => {
        setPontBasculeDialog(true);
    };

    const handleHidePontBasculeDialog = () => {
        setPontBasculeDialog(false);
    };

    const handleShowFacServicePresteDialog = () => {
        setFacServicePresteDialog(true);
    };

    const handleHideFacServicePresteDialog = () => {
        setFacServicePresteDialog(false);
    };

    const handleSelectPontBascule = (pontBascule: PontBascule) => {
        console.log('========== PontBascule SELECTED ==========');
        console.log('Selected PontBascule data:', JSON.stringify(pontBascule, null, 2));
        console.log('numDecl (DMC):', pontBascule.numDecl);
        console.log('==========================================');

        setSortiePortGPS(prev => ({
            ...prev,
            poids1erePesee: pontBascule.poidsVide || null,
            poids2emePesee: pontBascule.poidsCharge || null,
            poidsNet: pontBascule.poidsNet || null,
            numFiche: pontBascule.numPBId?.toString() || '',
            plaque: pontBascule.plaque || '',
            dmc: pontBascule.numDecl || ''
        }));
        setPontBasculeDialog(false);
        accept('success', 'Pesée sélectionnée', `Pesée N° ${pontBascule.numPBId} sélectionnée avec succès.`);
    };

    const actionBodyTemplate = (rowData: SortiePortGPS) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => editSortiePortGPS(rowData)}
                />
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <h5>Sortie Port GPS</h5>
                        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                            <TabPanel header="Nouvelle Sortie">
                                <form onSubmit={handleSubmit}>
                                    <SortiePortGPSForm
                                        sortiePortGPS={sortiePortGPS}
                                        importateurs={importateurs}
                                        agencesDouane={agencesDouane}
                                        loadingStatus={importateurLoading}
                                        handleChange={handleChange}
                                        handleNumberChange={handleNumberChange}
                                        handleDateChange={handleDateChange}
                                        handleDropdownChange={handleDropdownChange}
                                        handleLazyLoading={handleLazyLoading}
                                        handleGpsBlur={handleGpsBlur}
                                        importateurFilter={importateurFilter}
                                        onImportateurFilterChange={(value) => {
                                            setImportateurFilter(value);
                                            importateurValueRef.current = value;
                                        }}
                                        onShowPontBasculeDialog={handleShowPontBasculeDialog}
                                        facServicePresteList={facServicePresteList}
                                        onShowFacServicePresteDialog={handleShowFacServicePresteDialog}
                                    />
                                    <div className="flex justify-content-end mt-3">
                                        <Button
                                            label="Enregistrer"
                                            icon="pi pi-check"
                                            type="submit"
                                            loading={btnLoading}
                                        />
                                    </div>
                                </form>
                            </TabPanel>

                            <TabPanel header="Liste des Sorties">
                                <DataTable
                                    value={sortiesPortGPS}
                                    paginator
                                    lazy
                                    first={lazyParams.first}
                                    rows={lazyParams.rows}
                                    totalRecords={totalRecords}
                                    onPage={onPageChange}
                                    loading={loading}
                                    className="p-datatable-sm"
                                    emptyMessage="Aucune sortie trouvée"
                                >
                                    <Column field="sortiePortGPSId" header="ID" />
                                    <Column field="gps" header="GPS" />
                                    <Column field="clientName" header="Client" />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => rowData.dateEntree ? new Date(rowData.dateEntree).toLocaleDateString('fr-FR') : ''} />
                                    <Column field="dateSortie" header="Date Sortie" body={(rowData) => rowData.dateSortie ? new Date(rowData.dateSortie).toLocaleDateString('fr-FR') : ''} />
                                    <Column field="typeOperation" header="Type Opération" body={(rowData) => {
                                        const option = typeOperationOptions.find(opt => opt.value === rowData.typeOperation);
                                        return option ? option.label : rowData.typeOperation || '';
                                    }} />
                                    <Column field="poidsNet" header="Poids Net (kg)" />
                                    <Column body={actionBodyTemplate} header="Actions" />
                                </DataTable>
                            </TabPanel>
                        </TabView>
                    </div>
                </div>
            </div>

            <Dialog
                visible={editSortiePortGPSDialog}
                style={{ width: '80vw' }}
                header="Modifier Sortie Port GPS"
                modal
                className="p-fluid"
                onHide={hideDialog}
            >
                <p>Edit functionality to be implemented</p>
            </Dialog>

            {/* PontBascule Selection Dialog */}
            <Dialog
                visible={pontBasculeDialog}
                style={{ width: '90vw' }}
                header="Sélectionner une Pesée (Pont Bascule)"
                modal
                onHide={handleHidePontBasculeDialog}
            >
                <DataTable
                    value={sortiePortGPS.pontBasculeList || []}
                    emptyMessage="Aucune pesée disponible"
                    className="p-datatable-sm"
                    paginator
                    rows={10}
                >
                    <Column
                        header="Sélectionner"
                        body={(rowData: PontBascule) => (
                            <Button
                                icon="pi pi-check"
                                label="Sélectionner"
                                className="p-button-sm p-button-success"
                                onClick={() => handleSelectPontBascule(rowData)}
                            />
                        )}
                    />
                    <Column field="numPBId" header="N° PB" sortable />
                    <Column field="plaque" header="Plaque" sortable />
                    <Column field="numDecl" header="DMC" sortable />
                    <Column
                        field="poidsVide"
                        header="1ère Pesée (kg)"
                        sortable
                        body={(rowData: PontBascule) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(rowData.poidsVide || 0)}
                    />
                    <Column
                        field="poidsCharge"
                        header="2ème Pesée (kg)"
                        sortable
                        body={(rowData: PontBascule) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(rowData.poidsCharge || 0)}
                    />
                    <Column
                        field="poidsNet"
                        header="Poids Net (kg)"
                        sortable
                        body={(rowData: PontBascule) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(rowData.poidsNet || 0)}
                    />
                    <Column
                        field="datePont1"
                        header="Date 1ère Pesée"
                        sortable
                        body={(rowData: PontBascule) => rowData.datePont1 ? new Date(rowData.datePont1).toLocaleString('fr-FR') : ''}
                    />
                    <Column
                        field="datePont2"
                        header="Date 2ème Pesée"
                        sortable
                        body={(rowData: PontBascule) => rowData.datePont2 ? new Date(rowData.datePont2).toLocaleString('fr-FR') : ''}
                    />
                </DataTable>
            </Dialog>

            {/* FacServicePreste List Dialog */}
            <Dialog
                visible={facServicePresteDialog}
                style={{ width: '70vw' }}
                header="Services Prestés"
                modal
                onHide={handleHideFacServicePresteDialog}
            >
                <DataTable
                    value={facServicePresteList}
                    emptyMessage="Aucun service disponible"
                    className="p-datatable-sm"
                    paginator
                    rows={10}
                >
                    <Column field="numFacture" header="N° Facture" sortable />
                    <Column field="lettreTransp" header="GPS" sortable />
                    <Column field="plaque" header="Plaque" sortable />
                    <Column
                        field="typeDechargement"
                        header="Type Déchargement"
                        sortable
                        body={(rowData: FacServicePreste) => {
                            const option = typeOperationOptions.find(opt => opt.value === rowData.typeDechargement);
                            return option ? option.label : rowData.typeDechargement || '';
                        }}
                    />
                    <Column
                        field="montant"
                        header="Montant (BIF)"
                        sortable
                        body={(rowData: FacServicePreste) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(rowData.montant || 0)}
                    />
                    <Column field="libelleService" header="Service" sortable />
                </DataTable>
            </Dialog>
        </>
    );
}

export default SortiePortGPSComponent;
