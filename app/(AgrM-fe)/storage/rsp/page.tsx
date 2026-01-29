// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { EnterRSP } from './EnterRSP';
import EnterRSPForm from './EnterRSPForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Calendar } from 'primereact/calendar';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { TypePackaging } from '../../(settings)/settings/typePackaging/TypePackaging';
import { Emballage } from '../../(settings)/settings/emballage/Emballage';
import { Marchandise } from '../../(settings)/settings/marchandise/Marchandise';
import { Importer } from '../../(settings)/settings/importateur/Importer';
import { Barge } from '../../(settings)/settings/barge/Barge';
import { Entrepos } from '../../(settings)/settings/entrepot/Entrepos';
import { Provenance } from '../../(settings)/settings/provenance/Provenance';
import { useReactToPrint } from 'react-to-print';
import React from 'react';
import PrintableContent from './PrintableEnterRSP';
import { FacParamColis } from '../../(settings)/settings/facParamColis/FacParamColis';
import { FacParamSurtaxe } from '../../(settings)/settings/facParamaSurtaxe/FacParamSurtaxe';
import { FacParamArrimage } from '../../(settings)/settings/facParamArrimage/FacParamArrimage';
import useConsumApiWithPromise from '../../../../hooks/fetchData/useConsumApiWIthPromise';
import { set } from 'date-fns';
import EnterRSPWizardForm from './EnterRSPWizardForm';
import { log } from 'console';
import { useCurrentUser } from '../../../../hooks/fetchData/useCurrentUser';
import { json } from 'stream/consumers';
import Cookies from 'js-cookie';
import { API_BASE_URL } from '../../../../utils/apiConfig';

function EnterRSPComponent() {
    const [enterRSP, setEnterRSP] = useState<EnterRSP>(new EnterRSP());
    const [enterRSPEdit, setEnterRSPEdit] = useState<EnterRSP>(new EnterRSP());
    const [isEditMode, setIsEditMode] = useState(false);
    const [enterRSPs, setEnterRSPs] = useState<EnterRSP[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPrintButton, setShowPrintButton] = useState(false);

    // Date filter states for consultation
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [searchRecuPalan, setSearchRecuPalan] = useState<string>('');

    // Pagination states
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0
    });

    const [printRSP, setPrintRSP] = useState<EnterRSP>(new EnterRSP());
    const [facParamSurtaxe, setFacParamSurtaxe] = useState<FacParamSurtaxe>(new FacParamSurtaxe());
    const [facParamColis, setFacParamColis] = useState<FacParamColis>(new FacParamColis());
    const [facParamArrimage, setFacParamArrimage] = useState<FacParamArrimage>(new FacParamArrimage());

    // Cache the auth token at component level to prevent race conditions
    const tokenRef = useRef<string | null>(null);




    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: reloadData, loading: reloadLoading, error: reloadError, fetchData: fetchReloadData, callType: reloadCallType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: marchandiseData, loading: marchandiseLoading, error: marchandiseError, fetchData: fetchMarchandiseData, callType: marchandiseCallType } = useConsumApi('');
    const { data: typeConditionData, loading: typeConditionLoading, error: typeConditionError, fetchData: fetchTypeConditionData, callType: typeConditionCallType } = useConsumApi('');
    const { data: emballageData, loading: emballageLoading, error: emballageError, fetchData: fetchEmballageData, callType: emballageCallType } = useConsumApi('');
    const { data: bargeData, loading: bargeLoading, error: bargeError, fetchData: fetchBargeData, callType: bargeCallType } = useConsumApi('');
    const { data: entrepotData, loading: entrepotLoading, error: entrepotError, fetchData: fetchEntrepotData, callType: entrepotCallType } = useConsumApi('');
    const { data: destinataireData, loading: destinataireLoading, error: destinataireError, fetchData: fecthDestinataireName, callType: destinataireCallType } = useConsumApi('');
    const { data: facParamSurtaxeData, loading: facParamSurtaxeLoading, error: facParamSurtaxeError, fetchData: fecthFacParamSurtaxe, callType: facParamSurtaxeCallType } = useConsumApi('');
    const { data: facParamColisData, loading: facParamColisLoading, error: facParamColisError, fetchData: fecthFacParamColis, callType: facParamColisCallType } = useConsumApiWithPromise('');
    const { data: facParamArrimageData, loading: facParamArrimageLoading, error: facParamArrimageError, fetchData: fecthFacParamArrimage, callType: facParamArrimageCallType } = useConsumApi('');
    const { data: deleteData, loading: deleteLoading, error: deleteError, fetchData: fetchDeleteData, callType: deleteCallType } = useConsumApi('');


    const fetchApiForParameters = useConsumApiWithPromise('');


    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [typeConditions, setTypeConditions] = useState<TypePackaging[]>([]);
    const [emballages, setEmballages] = useState<Emballage[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [entrepos, setEntrepos] = useState<Entrepos[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const componentRef = useRef<HTMLDivElement>(null);
    const [importateurFilter, setImportateurFilter] = useState('');
    const { data: provenanceData, loading: provenanceLoading, error: provenanceError, fetchData: fetchProvenanceData, callType: provenanceCallType } = useConsumApi('');
    const [provenances, setProvenances] = useState<Provenance[]>([]);
    const [printDialogVisible, setPrintDialogVisible] = useState(false);
    const [destinataireName, setDestinataireName] = useState('');
    const [destinataireNif, setDestinataireNif] = useState('');
    const [typeConditionnementLibelle, setTypeConditionnementLibelle] = useState('');
    const [entrepotLibelle, setEntrepotLibelle] = useState('');
    const [emballageLibelle, setEmballageLibelle] = useState('');
    const [marchandiseNom, setMarchandiseNom] = useState(''); // Added for marchandise name
    const [salissageComponent, setSalissageComponent] = useState(false);
    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();


    const BASE_URL = `${API_BASE_URL}/enterRSP`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_NAME = `${API_BASE_URL}/importers/findminimalinfobyid/`;

    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises`;
    const URL_TYPE_CONDITION = `${API_BASE_URL}/typepackagings`;
    const URL_EMBALLAGE = `${API_BASE_URL}/emballages`;
    const URL_BARGE = `${API_BASE_URL}/barges/findall`;
    const URL_ENTREPOT = `${API_BASE_URL}/entrepos`;
    const URL_PROVENANCE = `${API_BASE_URL}/provenances/findall`;
    const URL_FACPARAM_SURTAX = `${API_BASE_URL}/facparamsurtaxe`;
    const URL_FACPARAM_NATURE = `${API_BASE_URL}/facparamnature`;
    const URL_FACPARAM_CONTENEUR = `${API_BASE_URL}/facparamconteneur`;
    const URL_FACPARAM_COLIS = `${API_BASE_URL}/facparamcolis`;
    const URL_FACPARAM_ARRIMAGE = `${API_BASE_URL}/facparamarrimage`;
    const URL_FACPARAM_VEHICULE = `${API_BASE_URL}/facparamvehicule`;


    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 30000,
            closable: true
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadEnterRSPs') {
                // Handle paginated response
                if (data.content && Array.isArray(data.content)) {
                    setEnterRSPs(data.content);
                    const rawTotal = Number(data.totalElements);
                    const safeTotal = Number.isFinite(rawTotal) && rawTotal >= 0 ? rawTotal : 0;
                    setTotalRecords(safeTotal);
                } else {
                    setEnterRSPs(Array.isArray(data) ? data : [data]);
                    setTotalRecords(0);
                }
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    // Separate effect for reload after save/update
    useEffect(() => {
        if (reloadData && reloadCallType === 'reloadEnterRSP') {
            setEnterRSP(reloadData);
            setShowPrintButton(true);
            accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès. Le RSP : ' + (reloadData?.recuPalan || 'N/A') + ". Numéro d'entrée " + (reloadData?.noEntree || 'N/A'));
            setBtnLoading(false);
        }
    }, [reloadData, reloadCallType]);

    // Handle delete response
    useEffect(() => {
        if (deleteCallType === 'deleteRSP' && !deleteLoading) {
            if (deleteError) {
                accept('error', 'Erreur', deleteError.message || 'La suppression a échoué.');
            } else if (deleteData?.message) {
                accept('info', 'Succès', 'L\'entrée RSP a été supprimée avec succès.');
                loadAllData();
            }
        }
    }, [deleteData, deleteError, deleteCallType, deleteLoading]);

    useEffect(() => {
        if (facParamSurtaxeData) {
            setFacParamSurtaxe(facParamSurtaxeData);
        }

        if (facParamColisData && facParamColisCallType == 'loadFacParamColis') {
            console.log(" Get fac param colis " + facParamColisData.montant);
            setFacParamColis(facParamColisData);
        } if (facParamArrimage) {
            setFacParamArrimage(facParamArrimage);
        }
    }, [facParamSurtaxeData, facParamColisData, facParamArrimageData]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    useEffect(() => {
        if (importateurData && importateurCallType === 'loadAllImportateur' && importateurData.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        } else if (importateurData && importateurCallType === 'loadSpecificImportateur') {
            // Add the specific importateur to the list if not already present
            const clientExists = importateurs.some(imp => imp.importateurId === importateurData.importateurId);
            if (!clientExists) {
                setImportateurs(prev => [importateurData, ...prev]);
            }
        }
    }, [importateurData, importateurCallType]);

    useEffect(() => {
        if (marchandiseData && marchandiseCallType === 'loadAllMarchandises') {
            setMarchandises(Array.isArray(marchandiseData) ? marchandiseData : [marchandiseData]);
        }
    }, [marchandiseData]);

    useEffect(() => {
        if (typeConditionData && typeConditionCallType === 'loadAllTypeConditions') {
            setTypeConditions(Array.isArray(typeConditionData) ? typeConditionData : [typeConditionData]);
        }
    }, [typeConditionData]);

    useEffect(() => {
        if (emballageData && emballageCallType === 'loadAllEmballages') {
            setEmballages(Array.isArray(emballageData) ? emballageData : [emballageData]);
        }
    }, [emballageData]);

    useEffect(() => {
        if (bargeData && bargeCallType === 'loadAllBarges') {
            setBarges(Array.isArray(bargeData) ? bargeData : [bargeData]);
        }
    }, [bargeData]);
    useEffect(() => {

        if (entrepotData && entrepotCallType === 'loadAllEntrepots') {
            setEntrepos(Array.isArray(entrepotData) ? entrepotData : [entrepotData]);
        }
    }, [entrepotData]);

    useEffect(() => {
        if (provenanceData && provenanceCallType === 'loadAllProvenances') {
            setProvenances(Array.isArray(provenanceData) ? provenanceData : [provenanceData]);
        }
    }, [provenanceData]);

    useEffect(() => {
        if (printRSP && printDialogVisible) {
            fecthDestinataireName(null, 'GET', `${URL_IMPORTATEUR_NAME}` + printRSP.importateurId, 'loadDestinatire');
            fetchTypeConditionData(null, 'GET', `${URL_TYPE_CONDITION}/findbyid/${printRSP.typeConditionId}`, 'loadTypeCondition');
            fetchEntrepotData(null, 'GET', `${URL_ENTREPOT}/findbyid/${printRSP.entreposId}`, 'findEntrepotById');
            fetchEmballageData(null, 'GET', `${URL_EMBALLAGE}/findbyid/${printRSP.emballageId}`, 'findEmballageById');
            // Add fetch for marchandise name
            fetchMarchandiseData(null, 'GET', `${URL_MARCHANDISE}/findbyid/${printRSP.marchandiseId}`, 'findMarchandiseById');

            console.log("destinataire " + printRSP.destinationId + " Transporteur " + printRSP.transporteur + " ==> Conditionnement " + printRSP.typeConditionId + " nbre de palette " + printRSP.nbrePalette + " contenu " + printRSP.constatation + " nbre de colis " + printRSP.nbreColis + " ==> nbre etiquette " + printRSP.nbreEtiquette);
        }
    }, [printRSP]);

    useEffect(() => {
        let allowDialog = false;
        if (destinataireData && destinataireCallType == 'loadDestinatire') {
            setDestinataireName(destinataireData.nom);
            setDestinataireNif(destinataireData.nif);
            allowDialog = true;
        }
        if (typeConditionData && typeConditionCallType == 'loadTypeCondition') {
            setTypeConditionnementLibelle(typeConditionData.libelle);
            allowDialog = true;
        }

        if (entrepotData && entrepotCallType == 'findEntrepotById') {
            setEntrepotLibelle(entrepotData.nom);
            allowDialog = true;
        }

        if (emballageData && emballageCallType == 'findEmballageById') {
            setEmballageLibelle(emballageData.nom);
            allowDialog = true;
        }

        // Handle marchandise name for printing
        if (marchandiseData && marchandiseCallType == 'findMarchandiseById') {
            setMarchandiseNom(marchandiseData.nom);
            allowDialog = true;
        }


        // add clean up fucntion
        return () => {
            setPrintDialogVisible(allowDialog);
        }

    }, [destinataireData, typeConditionData, marchandiseData, entrepotData, emballageData]);



    useEffect(() => {
        // Load all necessary data on component mount
        loadAllMarchandises();
        loadAllTypeConditions();
        loadAllEmballages();
        loadAllBarges();
        loadAllEntrepot();
        loadAllProvenances();


    }, []);

    // Keep the token cache updated
    useEffect(() => {
        // Initial token load
        tokenRef.current = Cookies.get('token') || null;

        // Set up an interval to refresh the cached token every 30 seconds
        const tokenRefreshInterval = setInterval(() => {
            tokenRef.current = Cookies.get('token') || null;
        }, 30000); // 30 seconds

        // Cleanup interval on unmount
        return () => clearInterval(tokenRefreshInterval);
    }, []);

    const loadAllMarchandises = () => {
        fetchMarchandiseData(null, 'GET', `${URL_MARCHANDISE}/findByActifTrue`, 'loadAllMarchandises');
    };

    const loadAllTypeConditions = () => {
        fetchTypeConditionData(null, 'GET', `${URL_TYPE_CONDITION}/findall`, 'loadAllTypeConditions');
    };

    const loadAllEmballages = () => {
        fetchEmballageData(null, 'GET', `${URL_EMBALLAGE}/findall`, 'loadAllEmballages');
    };

    const loadAllBarges = () => {
        fetchBargeData(null, 'GET', URL_BARGE, 'loadAllBarges');
    };
    const loadAllEntrepot = () => {
        fetchEntrepotData(null, 'GET', `${URL_ENTREPOT}/findall`, 'loadAllEntrepots');
    };

    const loadAllProvenances = () => {
        fetchProvenanceData(null, 'GET', URL_PROVENANCE, 'loadAllProvenances');
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnterRSP((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnterRSPEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    async function handleBlurEvent(e: React.FocusEvent<HTMLInputElement>): Promise<void> {
        // Validate token before making API calls
        if (!tokenRef.current) {
            console.error('No authentication token available');
            accept('error', 'Session expirée', 'Veuillez vous reconnecter');
            return;
        }

        const numericValue = parseFloat(e.target.value.toString().replaceAll(/\s/g, '').replaceAll(',', '.'));

        // Use the correct state based on edit mode
        const currentRSP = isEditMode ? enterRSPEdit : enterRSP;
        const setCurrentRSP = isEditMode ? setEnterRSPEdit : setEnterRSP;

        const selectedMarchandise = marchandises.find(m => m.marchandiseId === currentRSP.marchandiseId);

        console.log("=== DEBUG START: handleBlurEvent ===");
        console.log("Field changed:", e.target.name);
        console.log("numericValue:", numericValue, "isNaN:", isNaN(numericValue));
        console.log("Edit mode:", isEditMode);
        console.log("currentRSP state:", {
            nbreColis: currentRSP.nbreColis,
            montantCamion: currentRSP.montantCamion,
            montantBarge: currentRSP.montantBarge,
            poidsExonere: currentRSP.poidsExonere,
            exonere: currentRSP.exonere,
            doubleManut: currentRSP.doubleManut,
            transit: currentRSP.transit,
            marchandiseId: currentRSP.marchandiseId,
            bargeId: currentRSP.bargeId,
            nature: currentRSP.nature,
            tauxSalissage: currentRSP.tauxSalissage
        });

        // Validate nbreColis to prevent division by zero
        if (!currentRSP.nbreColis || currentRSP.nbreColis <= 0) {
            console.error('nbreColis is invalid:', currentRSP.nbreColis);
            accept('warn', 'Attention', 'Veuillez d\'abord saisir le nombre de colis');
            return;
        }

        // Validate tauxSalissage for scenarios that use it
        if ((currentRSP.doubleManut || currentRSP.transit) && (currentRSP.tauxSalissage === undefined || currentRSP.tauxSalissage === null)) {
            console.error('tauxSalissage is invalid:', currentRSP.tauxSalissage);
            accept('warn', 'Attention', 'Veuillez d\'abord saisir le taux de salissage');
            return;
        }

        // Validate montantCamion is set
        if (currentRSP.montantCamion === undefined || currentRSP.montantCamion === null || currentRSP.montantCamion === 0) {
            console.error('montantCamion is invalid:', currentRSP.montantCamion);
            accept('warn', 'Attention', 'Veuillez d\'abord sélectionner une marchandise valide');
            return;
        }

        // Do ALL API calls first (before any state updates)
        const amountPerPackage = numericValue / currentRSP.nbreColis * 1000;

        try {
            const [facParamSurtaxe, facParamColis, facParamNature, facParamVehicule, facParamArrimage] = await Promise.all([
                fetchApiForParameters.fetchDataPromise({
                    method: 'Get',
                    url: URL_FACPARAM_SURTAX + '/byweight?weight=' + numericValue,
                    skipAuth: false
                }),
                fetchApiForParameters.fetchDataPromise({
                    method: 'Get',
                    url: URL_FACPARAM_COLIS + '/byweight?weight=' + amountPerPackage,
                    skipAuth: false
                }),
                fetchApiForParameters.fetchDataPromise({
                    method: 'Get',
                    url: URL_FACPARAM_NATURE + '/byweight?weight=' + numericValue,
                    skipAuth: false
                }),
                fetchApiForParameters.fetchDataPromise({
                    method: 'Get',
                    url: URL_FACPARAM_VEHICULE + '/byweight?weight=' + (numericValue * 1000),
                    skipAuth: false
                }),
                fetchApiForParameters.fetchDataPromise({
                    method: 'Get',
                    url: URL_FACPARAM_ARRIMAGE + '/byweight?weight=' + (numericValue * 1000),
                    skipAuth: false
                })
            ]);

        console.log("=== API RESPONSE DATA ===");
        console.log("facParamSurtaxe:", facParamSurtaxe);
        console.log("facParamColis:", facParamColis);
        console.log("facParamNature:", facParamNature);
        console.log("facParamVehicule:", facParamVehicule);
        console.log("facParamArrimage:", facParamArrimage);

        // Single state update with all calculations
        setCurrentRSP(prev => {
            // Use prev values for current state with safe defaults
            const safePoidsExonere = prev.poidsExonere ?? 0;
            const adjustedWeight = prev.exonere ? numericValue - safePoidsExonere : numericValue;

            // IMPORTANT: Use original rates from merchandise to avoid accumulation
            // prev.montantCamion/montantBarge might have been modified (e.g., doubled for transit)
            const safeMontantCamion = selectedMarchandise?.prixCamion ?? prev.montantCamion ?? 0;
            const safeMontantBarge = selectedMarchandise?.prixBarge ?? prev.montantBarge ?? 0;
            const safeTauxSalissage = prev.tauxSalissage ?? 0;
            const safeFacParamColisMontant = facParamColis?.montant ?? 0;
            const safeFacParamSurtaxeTaux = facParamSurtaxe?.taux ?? 0;
            const safeFacParamArrimageMontant = facParamArrimage?.montant ?? 0;

            console.log("=== WEIGHT CALCULATION ===");
            console.log("numericValue:", numericValue);
            console.log("prev.exonere:", prev.exonere);
            console.log("prev.poidsExonere:", prev.poidsExonere, "=> safe:", safePoidsExonere);
            console.log("adjustedWeight:", adjustedWeight, "isNaN:", isNaN(adjustedWeight));
            console.log("safeTauxSalissage:", safeTauxSalissage);
            console.log("safeMontantCamion:", safeMontantCamion);
            console.log("safeMontantBarge:", safeMontantBarge);

            let calculatedValues = {
                tarifCamion: 0,
                tarifBarge: 0,
                surtaxeCrsp: 0,
                surtaxePrsp: 0,
                taxe: 0,
                montant: 0,
                fraisSrsp: 0,
                montantPeseMagasin: 0,
                surtaxeClt: safeFacParamColisMontant,
                surtaxePlt: safeFacParamSurtaxeTaux,
                montantFaireSuivre: 0,
                // Note: montantCamion and montantBarge are NOT included here
                // They should remain as the original rates from merchandise
            };

            console.log("=== INITIAL calculatedValues ===", calculatedValues);

            // Calculate fraisSrsp (same for all scenarios with some variations)
            if (!prev.doubleManut) {
                console.log("=== SCENARIO 1: Normal Processing (doubleManut=false) ===");
                // Scenario 1: Normal Processing
                calculatedValues.fraisSrsp = numericValue * safeTauxSalissage;

                console.log("selectedMarchandise?.typeConditionId:", selectedMarchandise?.typeConditionId);
                switch (selectedMarchandise?.typeConditionId) {
                    case 'SA':
                    case 'SAC':
                        console.log("--- Case SA/SAC ---");
                        console.log("Calculating tarifCamion:", numericValue, "*", safeMontantCamion);
                        calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                        console.log("tarifCamion =", calculatedValues.tarifCamion);

                        console.log("Calculating surtaxeCrsp:", numericValue, "*", safeMontantCamion, "*", safeFacParamColisMontant);
                        calculatedValues.surtaxeCrsp = numericValue * safeMontantCamion * safeFacParamColisMontant;
                        console.log("surtaxeCrsp =", calculatedValues.surtaxeCrsp);

                        console.log("Calculating surtaxePrsp:", numericValue, "*", safeMontantCamion, "*", safeFacParamSurtaxeTaux / 100);
                        calculatedValues.surtaxePrsp = numericValue * safeMontantCamion * (safeFacParamSurtaxeTaux / 100);
                        console.log("surtaxePrsp =", calculatedValues.surtaxePrsp);

                        console.log("Calculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 0.18");
                        calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                        console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));

                        calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.taxe;
                        calculatedValues.tarifBarge = 0;
                        break;

                    case 'HY':
                        console.log("--- Case HY ---");
                        // Note: Original C# code calculated num2 but never used it
                        // If you want to implement this, add: calculatedValues.tarifBarge = numericValue * prev.montantBarge;
                        break;

                    case 'VE':
                        console.log("--- Case VE ---");
                        console.log("Entering scenario 1 ... with " + prev.marchandiseId);

                        if (prev.marchandiseId === 442) {
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            calculatedValues.tarifBarge = 0;
                        } else if (prev.marchandiseId === 525) {
                            calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                            calculatedValues.montant = calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            calculatedValues.tarifCamion = 0;
                        } else {
                            calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                            calculatedValues.surtaxeCrsp = 0;
                            calculatedValues.montantPeseMagasin = 0;
                            calculatedValues.montant = 0;
                            calculatedValues.tarifCamion = 0;
                        }
                        break;

                    case 'AU':
                    case 'AUC':
                    case 'AUT':
                        console.log("--- Case AU/AUC/AUT ---");
                        console.log("prev.nature:", prev.nature);
                        if (prev.nature === 'volumineux') {
                            console.log("Nature = volumineux");
                            const safeSurtaxePrspTaux = prev.surtaxePrspTaux ?? 0;
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.surtaxePrsp = numericValue * safeMontantCamion * safeSurtaxePrspTaux / 100;
                            console.log("Calculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 0.18");
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                            console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxePrsp + calculatedValues.taxe;
                            calculatedValues.surtaxeCrsp = 0;
                            calculatedValues.tarifBarge = 0;
                        } else {
                            console.log("Nature != volumineux");
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.surtaxeCrsp = numericValue * safeMontantCamion * safeFacParamColisMontant;
                            console.log("Calculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 0.18");
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                            console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.taxe;
                            calculatedValues.surtaxePrsp = 0;
                            calculatedValues.tarifBarge = 0;
                        }
                        break;
                }

            } else if (prev.transit) {
                console.log("=== SCENARIO 2: Transit Mode (transit=true) ===");
                // Scenario 2: Transit Mode
                calculatedValues.fraisSrsp = numericValue * safeTauxSalissage;
                console.log("Initial taxe calculation:", adjustedWeight, "*", safeTauxSalissage, "* 0.18");
                calculatedValues.taxe = adjustedWeight * safeTauxSalissage * 0.18;
                console.log("Initial taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));

                switch (selectedMarchandise?.typeConditionId) {
                    case 'SA':
                    case 'SAC':
                        console.log("--- Case SA/SAC (Transit) ---");
                        calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                        calculatedValues.surtaxeCrsp = numericValue * safeMontantCamion * 2 * safeFacParamColisMontant;
                        calculatedValues.surtaxePrsp = numericValue * safeMontantCamion * 2 * (safeFacParamSurtaxeTaux / 100);
                        console.log("Recalculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 2 * 0.18");
                        calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                        console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
                        calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.taxe;
                        calculatedValues.tarifBarge = 0;
                        break;

                    case 'HY':
                        calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                        calculatedValues.taxe = prev.nbreColis * safeMontantCamion * 2 * 0.18;
                        calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.taxe;
                        break;

                    case 'VE':
                        if (prev.marchandiseId === 442) {
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            calculatedValues.tarifBarge = 0;
                        } else if (prev.marchandiseId === 525) {
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            calculatedValues.tarifBarge = 0;
                        } else {
                            calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                            calculatedValues.montant = calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            calculatedValues.tarifCamion = 0;
                        }
                        break;

                    case 'AU':
                    case 'AUC':
                    case 'AUT':
                        if (prev.nature === 'volumineux') {
                            const safeSurtaxePrspTaux = prev.surtaxePrspTaux ?? 0;
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                            calculatedValues.surtaxePrsp = numericValue * safeMontantCamion * 2 * safeSurtaxePrspTaux / 100;
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxePrsp + calculatedValues.taxe;
                            calculatedValues.surtaxeCrsp = 0;
                            calculatedValues.tarifBarge = 0;
                        } else {
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                            calculatedValues.surtaxeCrsp = numericValue * safeMontantCamion * safeFacParamColisMontant;
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.taxe;
                            calculatedValues.surtaxePrsp = 0;
                            calculatedValues.tarifBarge = 0;
                        }
                        break;
                }

            } else {
                console.log("=== SCENARIO 3: Double Handling (doubleManut=true) ===");
                // Scenario 3: Double Handling
                calculatedValues.fraisSrsp = safeTauxSalissage * numericValue;
                console.log("Initial taxe calculation:", safeTauxSalissage, "*", adjustedWeight, "* 0.18");
                calculatedValues.taxe = safeTauxSalissage * adjustedWeight * 0.18;
                console.log("Initial taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));

                console.log("prev.bargeId:", prev.bargeId);
                if (prev.bargeId === 33) {
                    console.log("--- Special Barge 33 calculations ---");
                    // Special Barge 33 calculations
                    switch (selectedMarchandise?.typeConditionId) {
                        case 'SA':
                        case 'SAC':
                            console.log("--- Case SA/SAC (Barge 33) ---");
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            console.log("Recalculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 2 * 0.18");
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                            console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.surtaxePrsp + calculatedValues.taxe;
                            calculatedValues.tarifBarge = 0;
                            break;

                        case 'HY':
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                            calculatedValues.taxe = prev.nbreColis * safeMontantCamion * 2 * 0.18;
                            break;

                        case 'VE':
                            if (prev.marchandiseId === 442) {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifBarge = 0;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            } else if (prev.marchandiseId === 525) {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifBarge = 0;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            } else {
                                calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifCamion = 0;
                                calculatedValues.montant = calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            }
                            break;

                        case 'AU':
                        case 'AUC':
                        case 'AUT':
                            if (prev.nature === 'volumineux') {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp;
                                calculatedValues.surtaxePrsp = 0;
                                calculatedValues.tarifBarge = 0;
                            } else {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion * 2;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp;
                                calculatedValues.surtaxePrsp = 0;
                                calculatedValues.tarifBarge = 0;
                            }
                            break;
                    }
                } else {
                    console.log("--- Standard barges calculations ---");
                    // Standard barges calculations
                    switch (selectedMarchandise?.typeConditionId) {
                        case 'SA':
                        case 'SAC':
                            console.log("--- Case SA/SAC (Standard Barge) ---");
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                            calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                            console.log("Recalculating taxe:", adjustedWeight, "*", safeMontantCamion, "* 2 * 0.18");
                            calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                            console.log("taxe =", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
                            calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.taxe;

                            console.log(" ==> numericValue " + numericValue);
                            console.log(" ==> tarifCamion " + calculatedValues.tarifCamion);
                            console.log(" ==> tarifBarge " + calculatedValues.tarifBarge);
                            console.log(" ==> taxe " + calculatedValues.taxe);
                            console.log(" ==> montant " + calculatedValues.montant);



                            break;

                        case 'HY':
                            calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                            calculatedValues.taxe = numericValue * safeMontantCamion * 0.18;
                            break;

                        case 'VE':
                            if (prev.marchandiseId === 442) {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifBarge = 0;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            } else if (prev.marchandiseId === 525) {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifBarge = 0;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            } else {
                                calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.montantPeseMagasin = numericValue * safeFacParamArrimageMontant;
                                calculatedValues.tarifCamion = 0;
                                calculatedValues.montantPeseMagasin = 0; // Override to 0 as per original code
                                calculatedValues.montant = calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.montantPeseMagasin;
                            }
                            break;

                        case 'AU':
                        case 'AUC':
                        case 'AUT':
                            if (prev.nature === 'volumineux') {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.taxe = adjustedWeight * safeMontantCamion * 2 * 0.18;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.taxe;
                                calculatedValues.surtaxePrsp = 0;
                            } else {
                                calculatedValues.tarifCamion = numericValue * safeMontantCamion;
                                calculatedValues.tarifBarge = numericValue * safeMontantBarge;
                                calculatedValues.surtaxeCrsp = numericValue * 1000 * safeFacParamColisMontant;
                                calculatedValues.taxe = adjustedWeight * safeMontantCamion * 0.18;
                                calculatedValues.montant = calculatedValues.tarifCamion + calculatedValues.tarifBarge + calculatedValues.surtaxeCrsp + calculatedValues.surtaxePrsp + calculatedValues.taxe;
                                calculatedValues.surtaxePrsp = 0; // Set to 0 as per original code anomaly
                            }
                            break;
                    }
                }
            }

            // Add faireSuivre amount if applicable
            if (prev.faireSuivre) {
                calculatedValues.montantFaireSuivre = 36270;
                calculatedValues.montant += 36270;
            }

            console.log("=== FINAL CALCULATED VALUES ===");
            console.log("calculatedValues:", calculatedValues);
            console.log("Final taxe:", calculatedValues.taxe, "isNaN:", isNaN(calculatedValues.taxe));
            console.log("Final montant:", calculatedValues.montant);
            console.log("=== DEBUG END: handleBlurEvent ===");

            return {
                ...prev,
                ...calculatedValues,
                montant: Math.round(calculatedValues.montant)
            };
        });
        } catch (error: any) {
            console.error('=== ERROR in handleBlurEvent ===');
            console.error('Error fetching calculation parameters:', error);

            // Handle authentication errors
            if (error?.status === 401) {
                accept('error', 'Session expirée', 'Veuillez vous reconnecter. La page va se recharger.');
                // Token refresh should have been attempted automatically by the hook
                // If we get here, it means refresh failed
                setTimeout(() => {
                    window.location.href = '/auth/login2';
                }, 2000);
            } else {
                // Handle other errors
                accept('error', 'Erreur', 'Impossible de calculer les paramètres. Veuillez réessayer.');
            }
        }
    }



    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        console.log(" === " + e.target.name);
        if (e.value !== undefined && e.value !== null) {
            const numericValue = parseFloat(e.value.toString().replaceAll(/\s/g, '').replaceAll(',', '.'));
            setEnterRSP((prev) => ({ ...prev, [field]: numericValue }));
        }

    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEnterRSPEdit((prev) => ({ ...prev, [field]: value }));
        // Note: All calculations are now handled by handleBlurEvent to avoid duplicate calculation paths
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEnterRSP((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEnterRSPEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setEnterRSP((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (e.target.name === 'marchandiseId') {

            const selectedMarchandise = marchandises.find(m => m.marchandiseId === e.target.value);
            if (selectedMarchandise) {
                setEnterRSP((prev) => ({ ...prev, montantBarge: selectedMarchandise.prixBarge ?? 0 }));
                setEnterRSP((prev) => ({ ...prev, montantCamion: selectedMarchandise.prixCamion ?? 0 }));
                setEnterRSP((prev) => ({ ...prev, typeConditionId: selectedMarchandise.typeConditionId }));
                setEnterRSP((prev) => ({ ...prev, salissage: selectedMarchandise.sallissage }));
                setSalissageComponent(!selectedMarchandise.sallissage);
            }

        }

        //importateurId
        if (e.target.name === 'importateurId') {
            const selectedImportateur = importateurs.find(m => m.importateurId === e.target.value);
            if (selectedImportateur) {
                setEnterRSP((prev) => ({ ...prev, nif: selectedImportateur.nif }));
            }
        }
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setEnterRSPEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));

        if (e.target.name === 'marchandiseId') {

            const selectedMarchandise = marchandises.find(m => m.marchandiseId === e.target.value);
            if (selectedMarchandise) {
                setEnterRSPEdit((prev) => ({
                    ...prev,
                    montantBarge: selectedMarchandise.prixBarge ?? 0,
                    montantCamion: selectedMarchandise.prixCamion ?? 0,
                    typeConditionId: selectedMarchandise.typeConditionId,
                    salissage: selectedMarchandise.sallissage,
                    tauxSalissage: selectedMarchandise.sallissage ? (selectedMarchandise.surtaxe ?? 0) : 0
                }));
                setSalissageComponent(!selectedMarchandise.sallissage);
            }
        }


        //importateurId
        if (e.target.name === 'importateurId') {
            const selectedImportateur = importateurs.find(m => m.importateurId === e.target.value);
            if (selectedImportateur) {
                setEnterRSPEdit((prev) => ({ ...prev, nif: selectedImportateur.nif }));
            }
        }
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 5000,
            closable: true
        });
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnterRSP((prev) => {
            return {
                ...prev,
                [e.target.name]: e.target.checked
            }
        });
        if (e.target.name === 'faireSuivre') {
            if (e.target.checked)
                setEnterRSP((prev) => {
                    return {
                        ...prev,
                        montantFaireSuivre: 36270,
                        montant: prev.montant + 36270
                    }
                });
            else {
                setEnterRSP((prev) => {
                    return {
                        ...prev,
                        montantFaireSuivre: 0,
                        montant: prev.montant - 36270
                    }
                });
            }

        }
    };

    const handleCheckboxChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnterRSPEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));

        if (e.target.name === 'faireSuivre') {
            if (e.target.checked) {
                setEnterRSPEdit((prev) => ({
                    ...prev,
                    montantFaireSuivre: 36270,
                    montant: prev.montant + 36270
                }));
            } else {
                setEnterRSPEdit((prev) => ({
                    ...prev,
                    montantFaireSuivre: 0,
                    montant: prev.montant - 36270
                }));
            }
        }
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        //check if dateEntree is not null
        if (enterRSP.dateEntree === null) {
            accept('warn', 'Attention', 'La date d\'entrée est obligatoire.');
            setBtnLoading(false);
            return;
        }

        // Handle the user name properly with null safety
        let userCreationName = 'Unknown';
        if (appUser?.email) {
            userCreationName = appUser.email;
        } else if (appUser?.firstname || appUser?.lastname) {
            userCreationName = `${appUser.firstname || ''} ${appUser.lastname || ''}`.trim();
        }

        // Format dateEntree to prevent timezone conversion issues
        // Backend expects: yyyy-MM-dd HH:mm:ss format
        const formatDateForBackend = (date: Date | null): string | null => {
            if (!date) return null;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        // Ensure userCreation is set before submitting
        const dataToSubmit = {
            ...enterRSP,
            dateEntree: formatDateForBackend(enterRSP.dateEntree),
            userCreation: userCreationName
        };

        console.log('Data being sent to backend:', JSON.stringify(dataToSubmit));

        fetchData(dataToSubmit, 'POST', `${BASE_URL}/new`, 'createEnterRSP');
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        onBeforePrint: () => {
            if (!componentRef.current) {
                accept('error', 'Erreur', 'Le contenu à imprimer est indisponible');
                return Promise.reject('No content to print');
            }
            return Promise.resolve();
        },
        pageStyle: `
            @page {
                size: A4;
                margin: 10mm;
            }
            @media print {
                body {
                    padding: 10mm;
                }
            }
        `,
        onAfterPrint: () => {
            accept('info', 'Succès', 'Impression effectuée avec succès');
            setPrintDialogVisible(false);
        },
        onPrintError: (error) => {
            accept('error', 'Erreur', `Échec de l'impression: ${error}`);
        }
    });

    const openPrintDialog = (rsp: EnterRSP) => {
        setPrintDialogVisible(true);
        setPrintRSP(rsp);

    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        // Handle the user name properly with null safety
        const userUpdateName = appUser?.email || 'Unknown';

        // Format dateEntree to prevent timezone conversion issues
        const formatDateForBackend = (date: Date | null): string | null => {
            if (!date) return null;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        };

        const dataToUpdate = {
            ...enterRSPEdit,
            dateEntree: formatDateForBackend(enterRSPEdit.dateEntree),
            userUpdate: userUpdateName
        };
        fetchData(dataToUpdate, 'PUT', `${BASE_URL}/update?id=${encodeURIComponent(enterRSPEdit.entreeImportId)}`, 'updateEnterRSP');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEnterRSP') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
                setBtnLoading(false);
            } else if (callType === 'updateEnterRSP') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
                setBtnLoading(false);
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des entrées RSP.');
        } else if (data !== null && error === null) {
            if (callType === 'createEnterRSP') {
                // Reload the created EnterRSP with a separate API call
                fetchReloadData(null, 'GET', `${BASE_URL}/findbyEnterRSPId?id=${encodeURIComponent(data.entreeImportId)}`, 'reloadEnterRSP');
            } else if (callType === 'updateEnterRSP') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEnterRSPEdit(new EnterRSP());
                setIsEditMode(false);
                setActiveIndex(1); // Switch to consultation tab
                loadAllData();
                setBtnLoading(false);
            }
        }
    };

    const clearFilterEnterRSP = () => {
        setEnterRSP(new EnterRSP(appUser?.fullName));
        setShowPrintButton(false);
        setIsEditMode(false);
        setEnterRSPEdit(new EnterRSP());
    };

    const cancelEdit = () => {
        setIsEditMode(false);
        setEnterRSPEdit(new EnterRSP());
        setActiveIndex(1); // Go back to consultation tab
    };

    const loadEnterRSPToEdit = (data: EnterRSP) => {
        if (data) {
            setIsEditMode(true);

            // Convert date string to Date object if needed
            const dateEntree = data.dateEntree ? new Date(data.dateEntree) : null;

            // Get salissage and tauxSalissage from the marchandise
            let salissageValue = false;
            let tauxSalissageValue = data.tauxSalissage ?? 0;

            if (data.marchandiseId) {
                const selectedMarchandise = marchandises.find(m => m.marchandiseId === data.marchandiseId);
                if (selectedMarchandise) {
                    salissageValue = Boolean(selectedMarchandise.sallissage);
                    // If salissage is true and data doesn't have tauxSalissage, use marchandise's surtaxe
                    if (salissageValue && (!data.tauxSalissage || data.tauxSalissage === 0)) {
                        tauxSalissageValue = selectedMarchandise.surtaxe ?? 0;
                    }
                }
            }

            // Set the edit state directly
            setEnterRSPEdit({
                ...data,
                salissage: salissageValue,
                tauxSalissage: tauxSalissageValue,
                dateEntree: dateEntree,
                userUpdate: appUser?.email || ''
            } as EnterRSP);

            // Set salissageComponent based on the marchandise's salissage value
            // If salissage is true, the taux salissage field should be enabled (salissageComponent = false)
            // salissageComponent = true means the field is DISABLED
            setSalissageComponent(!salissageValue);

            // Load the client (importateur) for this RSP if it's not already in the list
            if (data.importateurId) {
                const clientExists = importateurs.some(imp => imp.importateurId === data.importateurId);
                if (!clientExists) {
                    // Fetch the specific client and add it to the list
                    fetchImportateurData(null, 'GET', `${URL_IMPORTATEUR_NAME}${data.importateurId}`, 'loadSpecificImportateur');
                }
            }

            setActiveIndex(0); // Switch to first tab (edit mode)
        }
    };

    const loadAllImportateurs = (searchName: string = '', page: number = 0, size: number = 20) => {
        let pageNumber = 0;
        let sizeNumber = 20;

        // Reset list if page is 0 or 1, or invalid
        if (Number.isNaN(page) || page === 0 || page === 1 || page < 0 || !Number.isFinite(page)) {
            setLoadedPages(new Set([0]));
            setImportateurs([]);
            pageNumber = 0;
        } else {
            pageNumber = page;
        }

        // Ensure size is valid and positive
        if (Number.isNaN(size) || size <= 0 || !Number.isFinite(size)) {
            sizeNumber = 20;
        } else {
            sizeNumber = size;
        }

        const url = `${URL_IMPORTATEUR}?query=${encodeURIComponent(searchName)}&page=${pageNumber}&size=${sizeNumber}`;
        fetchImportateurData(null, "GET", url, "loadAllImportateur");
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;

        // Prevent invalid calculations when pageSize is 0 or negative
        if (pageSize <= 0) {
            return;
        }

        const pageNumber = Math.floor(e.first / pageSize);

        // Validate pageNumber is a valid positive integer
        if (!Number.isFinite(pageNumber) || pageNumber < 0) {
            return;
        }

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, pageSize);
        }
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleImportateurFilterChangeEdit = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleDeleteRSP = (rspData: EnterRSP) => {
        confirmDialog({
            message: `Voulez-vous vraiment supprimer l'entrée RSP ${rspData.recuPalan} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            accept: () => {
                fetchDeleteData(null, 'DELETE', `${BASE_URL}/delete?id=${encodeURIComponent(rspData.entreeImportId)}`, 'deleteRSP');
            }
        });
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <>
                <div className='flex flex-wrap gap-2'>
                    <Button icon="pi pi-pencil" onClick={() => loadEnterRSPToEdit(data)} raised severity='warning' />
                    <Button icon="pi pi-print" onClick={() => openPrintDialog(data)} raised severity='info' />
                    <Button icon="pi pi-trash" onClick={() => handleDeleteRSP(data)} raised severity='danger' />
                </div>
            </>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const safeRows = Number.isFinite(params.rows) && params.rows > 0 ? params.rows : 10;
        const safePage = Number.isFinite(params.page) && params.page >= 0 ? params.page : 0;
        let url = `${BASE_URL}/findall?page=${safePage}&size=${safeRows}`;

        if (dateDebut && dateFin) {
            // Use local date components to avoid UTC timezone conversion
            const formatDate = (date: Date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            url += `&dateDebut=${formatDate(dateDebut)}&dateFin=${formatDate(dateFin)}`;
        }

        if (searchRecuPalan && searchRecuPalan.trim() !== '') {
            url += `&recuPalan=${encodeURIComponent(searchRecuPalan.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadEnterRSPs');
    };

    const handleSearch = () => {
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setSearchRecuPalan('');
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const onPage = (event: any) => {
        const safeRows = Number.isFinite(event?.rows) && event.rows > 0 ? event.rows : lazyParams.rows;
        const safePage = Number.isFinite(event?.page) && event.page >= 0 ? event.page : 0;
        const safeFirst = Number.isFinite(event?.first) && event.first >= 0 ? event.first : safePage * safeRows;
        const newParams = {
            first: safeFirst,
            rows: safeRows,
            page: safePage
        };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des entrées RSP</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearch}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearch}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-4">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-4">
                        <label htmlFor="searchRecuPalan">RSP (Reçu Palan)</label>
                        <InputText
                            id="searchRecuPalan"
                            value={searchRecuPalan}
                            onChange={(e) => setSearchRecuPalan(e.target.value)}
                            placeholder="Rechercher par RSP"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatDateOnly = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString('fr-FR') : '';
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'FBU'
        }).format(amount || 0);
    };



    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Print Dialog */}
            <Dialog
                header="Aperçu d'impression"
                visible={printDialogVisible}
                style={{ width: '70vw' }}
                modal
                onHide={() => setPrintDialogVisible(false)}
                footer={
                    <div className="flex justify-content-end">
                        <Button label="Annuler" icon="pi pi-times" onClick={() => setPrintDialogVisible(false)} className="p-button-text" />
                        <Button label="Imprimer" icon="pi pi-print" onClick={handlePrint} />
                    </div>
                }>
                <div ref={componentRef}>
                    <PrintableContent 
                        enterRSP={printRSP} 
                        destinataireName={destinataireName} 
                        destinataireNif={destinataireNif} 
                        typeConditionnementLibelle={typeConditionnementLibelle} 
                        entrepotLibelle={entrepotLibelle} 
                        emballageLibelle={emballageLibelle}
                        marchandiseNom={marchandiseNom}
                    />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>

                <TabPanel header={isEditMode ? "Modifier" : "Nouveau"}>
                    {isEditMode ? (
                        <>
                            <div className="mb-3 p-3 bg-yellow-100 border-round">
                                <div className="flex justify-content-between align-items-center">
                                    <div>
                                        <i className="pi pi-info-circle mr-2"></i>
                                        <strong>Mode Édition:</strong> Modification de l'entrée RSP {enterRSPEdit.recuPalan}
                                    </div>
                                    <Button
                                        label="Annuler"
                                        icon="pi pi-times"
                                        severity="secondary"
                                        outlined
                                        onClick={cancelEdit}
                                    />
                                </div>
                            </div>
                            <EnterRSPWizardForm
                                enterRSP={enterRSPEdit}
                                importateurs={importateurs}
                                marchandises={marchandises}
                                typeConditions={typeConditions}
                                emballages={emballages}
                                barges={barges}
                                entrepots={entrepos}
                                provenances={provenances}
                                loadingStatus={importateurLoading}
                                handleChange={handleChangeEdit}
                                handleNumberChange={handleNumberChangeEdit}
                                handleDateChange={handleDateChangeEdit}
                                handleDropdownChange={handleDropdownChangeEdit}
                                handleCheckboxChange={handleCheckboxChangeEdit}
                                handleLazyLoading={handleLazyLoading}
                                importateurFilter={importateurFilter}
                                onImportateurFilterChange={handleImportateurFilterChangeEdit}
                                salissageComponent={salissageComponent}
                                onSubmit={handleSubmitEdit}
                                onReset={cancelEdit}
                                btnLoading={btnLoading}
                                handleBlurEvent={handleBlurEvent}
                                showToast={showToast}
                                isEditMode={true}
                            />
                        </>
                    ) : (
                        <EnterRSPWizardForm
                            enterRSP={enterRSP}
                            importateurs={importateurs}
                            marchandises={marchandises}
                            typeConditions={typeConditions}
                            emballages={emballages}
                            barges={barges}
                            entrepots={entrepos}
                            provenances={provenances}
                            loadingStatus={importateurLoading}
                            handleChange={handleChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleDropdownChange={handleDropdownChange}
                            handleCheckboxChange={handleCheckboxChange}
                            handleLazyLoading={handleLazyLoading}
                            importateurFilter={importateurFilter}
                            onImportateurFilterChange={handleImportateurFilterChange}
                            salissageComponent={salissageComponent}
                            onSubmit={handleSubmit}
                            onReset={clearFilterEnterRSP}
                            btnLoading={btnLoading}
                            handleBlurEvent={handleBlurEvent}
                            showToast={showToast}
                            isEditMode={false}
                        />
                    )}
                    {showPrintButton && (
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-9 md:field md:col-3">
                                    <Button icon="pi pi-print" onClick={() => openPrintDialog(enterRSP)} title='Imprimer le rsp' />
                                </div>
                            </div>
                        </div>
                    )}
                </TabPanel>
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={enterRSPs}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'entrées RSP à afficher"}
                                    lazy
                                    paginator
                                    first={lazyParams.first}
                                    rows={lazyParams.rows}
                                    totalRecords={totalRecords}
                                    onPage={onPage}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    loading={loading}>
                                    <Column field="recuPalan" header="RSP" sortable />
                                    <Column field="noEntree" header="N° Entrée" sortable />
                                    <Column field="importateurNom" header="Client" sortable />
                                    <Column field="noLettreTransport" header="Lettre Transport" sortable />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => formatDateOnly(rowData.dateEntree)} sortable />
                                    <Column field="nbreColis" header="Nbre Colis" sortable />
                                    <Column field="poids" header="Poids (kg)" sortable />
                                    <Column field="montant" header="Montant" body={(rowData) => formatCurrency(rowData.montant)} sortable />
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

export default EnterRSPComponent;
