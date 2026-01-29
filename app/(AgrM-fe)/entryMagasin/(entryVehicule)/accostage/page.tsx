'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Accostage } from './Accostage';
import AccostageForm from './AccostageForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Barge } from '../../../(settings)/settings/barge/Barge';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { Message } from 'primereact/message';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import useConsumApiWithPromise from '../../../../../hooks/fetchData/useConsumApiWIthPromise';
import { useAuthorities } from '../../../../../hooks/useAuthorities';
import { RedevanceInformatique } from '../../../(settings)/settings/redevanceInformatique/RedevanceInformatique';
import { API_BASE_URL } from '@/utils/apiConfig';
import { dateToString, stringToDate } from '../../../../../utils/dateUtils';

function AccostageComponent() {
    const [accostage, setAccostage] = useState<Accostage>(new Accostage());
    const [accostageEdit, setAccostageEdit] = useState<Accostage>(new Accostage());
    const [editAccostageDialog, setEditAccostageDialog] = useState(false);
    const [viewAccostageDialog, setViewAccostageDialog] = useState(false);
    const [accostageToView, setAccostageToView] = useState<Accostage>(new Accostage());
    const [accostages, setAccostages] = useState<Accostage[]>([]);
    const [accostagesValidation1, setAccostagesValidation1] = useState<Accostage[]>([]);
    const [accostagesValidation2, setAccostagesValidation2] = useState<Accostage[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [redevanceInformatique, setRedevanceInformatique] = useState<RedevanceInformatique>(new RedevanceInformatique());
    const { data: bargeData, loading: bargeLoading, fetchData: bargeFetchData, callType: bargeCallType } = useConsumApi('');
    const { data: redevanceData, loading: redevanceLoading, error: redevanceError, fetchData: fetchRedevanceData, callType: redevanceCallType } = useConsumApi('');
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: impLoading, error: impError, fetchData: impFetchData, callType: impCallType } = useConsumApi('');
    const { data: validationData, loading: validationLoading, error: validationError, fetchData: fetchValidationData, callType: validationCallType } = useConsumApi('');
    const { data: singleImportateurData, loading: singleImportateurLoading, fetchData: fetchSingleImportateur, callType: singleImportateurCallType } = useConsumApi('');
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [importateurFilter, setImportateurFilter] = useState('');
    const importateurFilterRef = useRef('');
    // Ref to track fetched importateurs to prevent infinite loop
    const fetchedImportateursRef = useRef<Set<number>>(new Set());
    const toast = useRef<Toast>(null);
    const [showInvoiceMessage, setShowInvoiceMessage] = useState<boolean>(false);

    // Date filter states for main tab
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());
    const [searchGPS, setSearchGPS] = useState<string>('');

    // Validation states
    const [dateDebutValidation1, setDateDebutValidation1] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFinValidation1, setDateFinValidation1] = useState<Date>(new Date());
    const [searchGPSValidation1, setSearchGPSValidation1] = useState<string>('');

    const [dateDebutValidation2, setDateDebutValidation2] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFinValidation2, setDateFinValidation2] = useState<Date>(new Date());
    const [searchGPSValidation2, setSearchGPSValidation2] = useState<string>('');

    const [totalRecords, setTotalRecords] = useState(0);
    const [totalRecordsValidation1, setTotalRecordsValidation1] = useState(0);
    const [totalRecordsValidation2, setTotalRecordsValidation2] = useState(0);
    const fetchApiForParameters = useConsumApiWithPromise('');

    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0
    });
    const [lazyParamsValidation1, setLazyParamsValidation1] = useState({
        first: 0,
        rows: 10,
        page: 0
    });
    const [lazyParamsValidation2, setLazyParamsValidation2] = useState({
        first: 0,
        rows: 10,
        page: 0
    });

    // Add user management
    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();

    // Add authorities management
    const { hasAuthority } = useAuthorities();

    const BASE_URL = `${API_BASE_URL}/accostages`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_BY_ID = `${API_BASE_URL}/importers/findbyid`;
    const URL_BARGE = `${API_BASE_URL}/barges/findall`;
    const URL_FACPARAM_ACCOSTAGE = `${API_BASE_URL}/facparamaccostage`;
    const URL_REDEVANCE = `${API_BASE_URL}/redevance-informatique`;


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
        loadAllBarges();
        loadRedevanceInformatique();
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadAccostages') {
                setAccostages(data.content || []);
                setTotalRecords(data.totalElements || 0);
            } else if (callType === 'loadAccostagesValidation1') {
                // Filter for non-validated level 1
                const filteredData = (data.content || []).filter((item: Accostage) => !item.valide1);
                setAccostagesValidation1(filteredData);
                setTotalRecordsValidation1(filteredData.length);
            } else if (callType === 'loadAccostagesValidation2') {
                // Filter for validated level 1 but not level 2
                const filteredData = (data.content || []).filter((item: Accostage) => item.valide1 && !item.valide2);
                setAccostagesValidation2(filteredData);
                setTotalRecordsValidation2(filteredData.length);
            }
        }

        if (importateurData?.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }

        if (bargeData) {
            setBarges(Array.isArray(bargeData) ? bargeData : [bargeData]);
        }

        if (redevanceData && redevanceCallType === 'loadRedevance') {
            console.log('=== FRONTEND: Redevance Informatique Loaded ===');
            console.log('Received data:', redevanceData);
            console.log('ID:', redevanceData.id);
            console.log('Montant:', redevanceData.montant);
            setRedevanceInformatique(redevanceData);

            // Pre-populate montantRedev with default nbreBateau = 1
            const nbreBateau = accostage.nbreBateau || 1;
            const montantRedev = Math.round((redevanceData.montant || 0) * nbreBateau);
            console.log('Pre-populating montantRedev:', montantRedev, '(nbreBateau:', nbreBateau, ')');
            setAccostage(prev => ({
                ...prev,
                montantRedev: montantRedev
            }));
        }

        if (redevanceError) {
            console.error('=== FRONTEND: Error loading Redevance Informatique ===');
            console.error('Error:', redevanceError);
        }

        handleAfterApiCall(activeIndex);
    }, [data, importateurData, bargeData, redevanceData, redevanceError]);

    // Separate useEffect for handling validation results
    useEffect(() => {
        if (validationData) {
            if (validationCallType === 'validateAccostage1') {
                accept('success', 'Validation réussie', 'L\'accostage a été validé au 1er niveau avec succès.');
                const newParams = { ...lazyParamsValidation1 };
                loadValidationData1(newParams);
            } else if (validationCallType === 'validateAccostage2') {
                accept('success', 'Validation réussie', 'L\'accostage a été validé au 2ème niveau avec succès.');
                const newParams = { ...lazyParamsValidation2 };
                loadValidationData2(newParams);
            } else if (validationCallType === 'invalidateAccostage1') {
                accept('success', 'Invalidation réussie', 'L\'accostage a été invalidé au 1er niveau avec succès.');
                const newParams = { ...lazyParamsValidation1 };
                loadValidationData1(newParams);
            } else if (validationCallType === 'invalidateAccostage2') {
                accept('success', 'Invalidation réussie', 'L\'accostage a été invalidé au 2ème niveau avec succès.');
                const newParams = { ...lazyParamsValidation2 };
                loadValidationData2(newParams);
            }
        }
    }, [validationData, validationCallType]);

    // Separate useEffect for handling single importateur fetch (for edit dialog)
    useEffect(() => {
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
    }, [singleImportateurData, singleImportateurCallType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurFilterRef.current) {
                loadAllImportateurs(importateurFilterRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    const loadAllBarges = () => {
        bargeFetchData(null, "GET", URL_BARGE, "loadAllBarges");
    };

    const loadRedevanceInformatique = () => {
        console.log('=== FRONTEND: Loading Redevance Informatique ===');
        console.log('URL:', URL_REDEVANCE);
        fetchRedevanceData(null, 'GET', URL_REDEVANCE, 'loadRedevance');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccostage((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccostageEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = async (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        // If tonageArrive is being changed, trigger calculations with tonageDepart = 0
        if (field === 'tonageArrive' && value !== null && value !== undefined) {
            const tonageArrive = value;
            const tonageDepart = 0; // Assume Départ starts at zero

            // Calculate total tonnage in metric tons (divide by 1000)
            const totalTonnage = (tonageArrive + tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveObj = stringToDate(accostage.dateArrive);
            const dateDepartObj = stringToDate(accostage.dateDepart);
            if (dateArriveObj && dateDepartObj) {
                // Set time to midnight for accurate day calculation
                dateArriveObj.setHours(0, 0, 0, 0);
                dateDepartObj.setHours(0, 0, 0, 0);
                const diffTime = dateDepartObj.getTime() - dateArriveObj.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostage.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostage.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount for first day + (remaining days * baseAmount/2)
                    const taxeAccostage = days > 0 ? Math.round(baseAmount + ((days - 1) * (baseAmount / 2))) : 0;

                    // Calculate Redevance Informatique (one-time charge, not dependent on days)
                    const nbreBateau = accostage.nbreBateau || 1;
                    const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                    const montRedevTaxe = accostage.taxe ? Math.round(montantRedev * 0.18) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostage.taxe ? totalTaxes * 0.18 : 0;

                    // DEBUG: Show complete calculation breakdown
                    console.log('=== CALCUL TAXE ACCOSTAGE (tonageArrive - handleNumberChange) ===');
                    console.log('Longueur du bateau:', accostage.longeur, 'm');
                    console.log('Tonnage Arrivée:', tonageArrive, 'kg =', tonageArrive / 1000, 'tonnes');
                    console.log('Tonnage Départ:', tonageDepart, 'kg =', tonageDepart / 1000, 'tonnes');
                    console.log('Tonnage Total:', totalTonnage, 'tonnes métriques');
                    console.log('---');
                    console.log('Date Arrivée:', accostage.dateArrive);
                    console.log('Date Départ:', accostage.dateDepart);
                    console.log('Nombre de jours (inclusif):', days);
                    console.log('---');
                    console.log('Base Amount (depuis DB pour longueur', accostage.longeur + 'm):', baseAmount, 'FBU');
                    console.log('Formule: baseAmount + ((days - 1) × (baseAmount / 2))');
                    console.log('Calcul:', baseAmount, '+ ((', days, '- 1) × (', baseAmount, '/ 2))');
                    console.log('      =', baseAmount, '+', ((days - 1) * (baseAmount / 2)));
                    console.log('      =', baseAmount + ((days - 1) * (baseAmount / 2)));
                    console.log('Taxe Accostage (arrondi):', taxeAccostage, 'FBU');
                    console.log('---');
                    console.log('Taxe Manutention (tonnage × 40):', totalTonnage, '× 40 =', taxeManut, 'FBU');
                    console.log('Total Taxes (Accostage + Manutention):', taxeAccostage, '+', taxeManut, '=', totalTaxes, 'FBU');
                    console.log('TVA 18% (si activée):', accostage.taxe ? 'OUI' : 'NON', '=', montTVA, 'FBU');
                    console.log('TOTAL GENERAL:', totalTaxes + montTVA, 'FBU');
                    console.log('Redevance Informatique:', montantRedev, 'FBU');
                    console.log('TVA Redevance:', montRedevTaxe, 'FBU');
                    console.log('================================================================');

                    // Update state with calculated values
                    setAccostage(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montantRedev: montantRedev,
                        montRedevTaxe: montRedevTaxe,
                        montTVA: montTVA
                    }));
                    return;
                } else {
                    // If no length, just update tonnages and taxeManut
                    setAccostage(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut
                    }));
                    return;
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
                // Still update the tonnage values even if calculation fails
                setAccostage(prev => ({
                    ...prev,
                    tonageArrive: tonageArrive,
                    tonageDepart: tonageDepart,
                    taxeManut: taxeManut
                }));
                return;
            }
        }

        // If tonageDepart is being changed, trigger calculations with the actual value
        if (field === 'tonageDepart' && value !== null && value !== undefined) {
            const tonageArrive = accostage.tonageArrive || 0;
            const tonageDepart = value;

            // Calculate total tonnage using absolute difference in metric tons (divide by 1000)
            const totalTonnage = Math.abs(tonageArrive - tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveObj2 = stringToDate(accostage.dateArrive);
            const dateDepartObj2 = stringToDate(accostage.dateDepart);
            if (dateArriveObj2 && dateDepartObj2) {
                // Set time to midnight for accurate day calculation
                dateArriveObj2.setHours(0, 0, 0, 0);
                dateDepartObj2.setHours(0, 0, 0, 0);
                const diffTime = dateDepartObj2.getTime() - dateArriveObj2.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostage.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostage.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount for first day + (remaining days * baseAmount/2)
                    const taxeAccostage = days > 0 ? Math.round(baseAmount + ((days - 1) * (baseAmount / 2))) : 0;

                    // Calculate Redevance Informatique (one-time charge, not dependent on days)
                    const nbreBateau = accostage.nbreBateau || 1;
                    const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                    const montRedevTaxe = accostage.taxe ? Math.round(montantRedev * 0.18) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostage.taxe ? totalTaxes * 0.18 : 0;

                    // DEBUG: Show complete calculation breakdown
                    console.log('=== CALCUL TAXE ACCOSTAGE (tonageDepart - handleNumberChange) ===');
                    console.log('Longueur du bateau:', accostage.longeur, 'm');
                    console.log('Tonnage Arrivée:', tonageArrive, 'kg =', tonageArrive / 1000, 'tonnes');
                    console.log('Tonnage Départ:', tonageDepart, 'kg =', tonageDepart / 1000, 'tonnes');
                    console.log('Différence absolue:', Math.abs(tonageArrive - tonageDepart), 'kg');
                    console.log('Tonnage Total:', totalTonnage, 'tonnes métriques');
                    console.log('---');
                    console.log('Date Arrivée:', accostage.dateArrive);
                    console.log('Date Départ:', accostage.dateDepart);
                    console.log('Nombre de jours (inclusif):', days);
                    console.log('---');
                    console.log('Base Amount (depuis DB pour longueur', accostage.longeur + 'm):', baseAmount, 'FBU');
                    console.log('Formule: baseAmount + ((days - 1) × (baseAmount / 2))');
                    console.log('Calcul:', baseAmount, '+ ((', days, '- 1) × (', baseAmount, '/ 2))');
                    console.log('      =', baseAmount, '+', ((days - 1) * (baseAmount / 2)));
                    console.log('      =', baseAmount + ((days - 1) * (baseAmount / 2)));
                    console.log('Taxe Accostage (arrondi):', taxeAccostage, 'FBU');
                    console.log('---');
                    console.log('Taxe Manutention (tonnage × 40):', totalTonnage, '× 40 =', taxeManut, 'FBU');
                    console.log('Total Taxes (Accostage + Manutention):', taxeAccostage, '+', taxeManut, '=', totalTaxes, 'FBU');
                    console.log('TVA 18% (si activée):', accostage.taxe ? 'OUI' : 'NON', '=', montTVA, 'FBU');
                    console.log('TOTAL GENERAL:', totalTaxes + montTVA, 'FBU');
                    console.log('Redevance Informatique:', montantRedev, 'FBU');
                    console.log('TVA Redevance:', montRedevTaxe, 'FBU');
                    console.log('================================================================');

                    // Update state with calculated values
                    setAccostage(prev => ({
                        ...prev,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montantRedev: montantRedev,
                        montRedevTaxe: montRedevTaxe,
                        montTVA: montTVA
                    }));
                    return;
                } else {
                    // If no length, just update tonnages and taxeManut
                    setAccostage(prev => ({
                        ...prev,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut
                    }));
                    return;
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
                // Still update the tonnage values even if calculation fails
                setAccostage(prev => ({
                    ...prev,
                    tonageDepart: tonageDepart,
                    taxeManut: taxeManut
                }));
                return;
            }
        }

        setAccostage((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleNumberChangeEdit = async (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;

        // If tonageArrive is being changed, trigger calculations with tonageDepart = 0
        if (field === 'tonageArrive' && value !== null && value !== undefined) {
            const tonageArrive = value;
            const tonageDepart = 0; // Assume Départ starts at zero

            // Calculate total tonnage in metric tons (divide by 1000)
            const totalTonnage = (tonageArrive + tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveEditObj = stringToDate(accostageEdit.dateArrive);
            const dateDepartEditObj = stringToDate(accostageEdit.dateDepart);
            if (dateArriveEditObj && dateDepartEditObj) {
                // Set time to midnight for accurate day calculation
                dateArriveEditObj.setHours(0, 0, 0, 0);
                dateDepartEditObj.setHours(0, 0, 0, 0);
                const diffTime = dateDepartEditObj.getTime() - dateArriveEditObj.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostageEdit.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostageEdit.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount + (baseAmount * days / 2) (rounded)
                    const taxeAccostage = Math.round(baseAmount * days);

                    // Calculate Redevance Informatique (one-time charge, not dependent on days)
                    const nbreBateau = accostageEdit.nbreBateau || 1;
                    const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                    const montRedevTaxe = accostageEdit.taxe ? Math.round(montantRedev * 0.18) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostageEdit.taxe ? totalTaxes * 0.18 : 0;

                    // Update state with calculated values
                    setAccostageEdit(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montantRedev: montantRedev,
                        montRedevTaxe: montRedevTaxe,
                        montTVA: montTVA
                    }));
                    return;
                } else {
                    // If no length, just update tonnages and taxeManut
                    setAccostageEdit(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut
                    }));
                    return;
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
                // Still update the tonnage values even if calculation fails
                setAccostageEdit(prev => ({
                    ...prev,
                    tonageArrive: tonageArrive,
                    tonageDepart: tonageDepart,
                    taxeManut: taxeManut
                }));
                return;
            }
        }

        // If tonageDepart is being changed, trigger calculations with the actual value
        if (field === 'tonageDepart' && value !== null && value !== undefined) {
            const tonageArrive = accostageEdit.tonageArrive || 0;
            const tonageDepart = value;

            // Calculate total tonnage using absolute difference in metric tons (divide by 1000)
            const totalTonnage = Math.abs(tonageArrive - tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveEditObj2 = stringToDate(accostageEdit.dateArrive);
            const dateDepartEditObj2 = stringToDate(accostageEdit.dateDepart);
            if (dateArriveEditObj2 && dateDepartEditObj2) {
                // Set time to midnight for accurate day calculation
                dateArriveEditObj2.setHours(0, 0, 0, 0);
                dateDepartEditObj2.setHours(0, 0, 0, 0);
                const diffTime = dateDepartEditObj2.getTime() - dateArriveEditObj2.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostageEdit.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostageEdit.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount for first day + (remaining days * baseAmount/2)
                    const taxeAccostage = days > 0 ? Math.round(baseAmount + ((days - 1) * (baseAmount / 2))) : 0;

                    // Calculate Redevance Informatique (one-time charge, not dependent on days)
                    const nbreBateau = accostageEdit.nbreBateau || 1;
                    const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                    const montRedevTaxe = accostageEdit.taxe ? Math.round(montantRedev * 0.18) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostageEdit.taxe ? totalTaxes * 0.18 : 0;

                    // Update state with calculated values
                    setAccostageEdit(prev => ({
                        ...prev,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montantRedev: montantRedev,
                        montRedevTaxe: montRedevTaxe,
                        montTVA: montTVA
                    }));
                    return;
                } else {
                    // If no length, just update tonnages and taxeManut
                    setAccostageEdit(prev => ({
                        ...prev,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut
                    }));
                    return;
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
                // Still update the tonnage values even if calculation fails
                setAccostageEdit(prev => ({
                    ...prev,
                    tonageDepart: tonageDepart,
                    taxeManut: taxeManut
                }));
                return;
            }
        }

        setAccostageEdit((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setAccostage((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setAccostageEdit((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const field = e.target.name;
        const value = e.target.value;

        // If barge is selected, auto-fill longueur
        if (field === 'bargeId') {
            const selectedBarge = barges.find(b => b.bargeId === value);
            if (selectedBarge) {
                setAccostage((prev) => ({
                    ...prev,
                    bargeId: value,
                    longeur: selectedBarge.longeur
                }));
                return;
            }
        }

        setAccostage((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        const field = e.target.name;
        const value = e.target.value;

        // If barge is selected, auto-fill longueur
        if (field === 'bargeId') {
            const selectedBarge = barges.find(b => b.bargeId === value);
            if (selectedBarge) {
                setAccostageEdit((prev) => ({
                    ...prev,
                    bargeId: value,
                    longeur: selectedBarge.longeur
                }));
                return;
            }
        }

        setAccostageEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setAccostage((prev) => {
            const updatedState = { ...prev, [e.target.name]: e.target.checked };

            // Calculate TVA when checkbox changes
            if (e.target.name === 'taxe') {
                if (e.target.checked) {
                    const totalTaxes = (updatedState.taxeAccostage || 0) + (updatedState.taxeManut || 0);
                    updatedState.montTVA = totalTaxes * 0.18;
                    // Recalculate Redevance Tax if Redevance Informatique is not zero
                    if (updatedState.montantRedev && updatedState.montantRedev > 0) {
                        updatedState.montRedevTaxe = Math.round(updatedState.montantRedev * 0.18);
                    }
                } else {
                    updatedState.montTVA = 0;
                    updatedState.montRedevTaxe = 0;
                }
            }

            return updatedState;
        });
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setAccostageEdit((prev) => {
            const updatedState = { ...prev, [e.target.name]: e.target.checked };

            // Calculate TVA when checkbox changes
            if (e.target.name === 'taxe') {
                if (e.target.checked) {
                    const totalTaxes = (updatedState.taxeAccostage || 0) + (updatedState.taxeManut || 0);
                    updatedState.montTVA = totalTaxes * 0.18;
                    // Recalculate Redevance Tax if Redevance Informatique is not zero
                    if (updatedState.montantRedev && updatedState.montantRedev > 0) {
                        updatedState.montRedevTaxe = Math.round(updatedState.montantRedev * 0.18);
                    }
                } else {
                    updatedState.montTVA = 0;
                    updatedState.montRedevTaxe = 0;
                }
            }

            return updatedState;
        });
    };

    const handleSubmit = () => {
        setBtnLoading(true);

        let userCreationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userCreationName = nameParts[1];
            } else {
                userCreationName = appUser.fullName;
            }
        }

        const dataToSubmit = {
            ...accostage,
            userCreation: userCreationName
        };

        fetchData(dataToSubmit, 'POST', `${BASE_URL}/new`, 'createAccostage');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);

        fetchData(accostageEdit, 'PUT', `${BASE_URL}/update`, 'updateAccostage');
    };

    // Validation functions
    const handleValidation1 = (accostageData: Accostage) => {
        let userValidationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userValidationName = nameParts[0] + ' ' + nameParts[1];
            } else {
                userValidationName = appUser.fullName;
            }
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir valider cet accostage au 1er niveau ?
                     
Accostage: ${accostageData.noArrive}
L.T: ${accostageData.lettreTransp}
Taxe Accostage: ${formatCurrency(accostageData.taxeAccostage)}`,
            header: 'Confirmation de validation 1er niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                const validationData = {
                    ...accostageData,
                    valide1: true,
                    userValide1: userValidationName
                };
                fetchValidationData(validationData, 'PUT', `${BASE_URL}/validateAccostage1?id=${encodeURIComponent(accostageData.noArrive)}`, 'validateAccostage1');
            }
        });
    };

    const handleValidation2 = (accostageData: Accostage) => {
        let userValidationName = 'Unknown';
        if (appUser?.fullName) {
            const nameParts = appUser.fullName.split(" ");
            if (nameParts.length >= 2) {
                userValidationName = nameParts[0] + ' ' + nameParts[1];
            } else {
                userValidationName = appUser.fullName;
            }
        }

        confirmDialog({
            message: `Êtes-vous sûr de vouloir valider cet accostage au 2ème niveau ?

Accostage: ${accostageData.noArrive}
L.T: ${accostageData.lettreTransp}
Taxe Accostage: ${formatCurrency(accostageData.taxeAccostage)}`,
            header: 'Confirmation de validation 2ème niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                const validationData = {
                    ...accostageData,
                    valide2: true,
                    userValide2: userValidationName
                };
                fetchValidationData(validationData, 'PUT', `${BASE_URL}/validateAccostage2?id=${encodeURIComponent(accostageData.noArrive)}`, 'validateAccostage2');
            }
        });
    };

    // Invalidation functions
    const handleInvalidation1 = (accostageData: Accostage) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir invalider cet accostage au 1er niveau ?

Accostage: ${accostageData.noArrive}
L.T: ${accostageData.lettreTransp}
Taxe Accostage: ${formatCurrency(accostageData.taxeAccostage)}

Cette action annulera la validation de 1er niveau.`,
            header: 'Confirmation d\'invalidation 1er niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const invalidationData = {
                    ...accostageData,
                    valide1: false,
                    userValide1: ''
                };
                fetchValidationData(invalidationData, 'PUT', `${BASE_URL}/invalidateAccostage1?id=${encodeURIComponent(accostageData.noArrive || '')}`, 'invalidateAccostage1');
            }
        });
    };

    const handleInvalidation2 = (accostageData: Accostage) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir invalider cet accostage au 2ème niveau ?

Accostage: ${accostageData.noArrive}
L.T: ${accostageData.lettreTransp}
Taxe Accostage: ${formatCurrency(accostageData.taxeAccostage)}

Cette action annulera la validation de 2ème niveau.`,
            header: 'Confirmation d\'invalidation 2ème niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            acceptClassName: 'p-button-danger',
            accept: () => {
                const invalidationData = {
                    ...accostageData,
                    valide2: false,
                    userValide2: ''
                };
                fetchValidationData(invalidationData, 'PUT', `${BASE_URL}/invalidateAccostage2?id=${encodeURIComponent(accostageData.noArrive || '')}`, 'invalidateAccostage2');
            }
        });
    };

    const handleBlurEvent = async (e: React.FocusEvent<HTMLInputElement>) => {
        // Handle both tonnageArrive and tonnageDepart on blur
        if ((e.target.name === 'tonageDepart' || e.target.name === 'tonageArrive') && e.target.value !== '') {
            const inputValue = parseFloat(e.target.value.toString().replaceAll(/\s/g, '').replaceAll(',', '.'));

            let tonageArrive = accostage.tonageArrive || 0;
            let tonageDepart = accostage.tonageDepart || 0;

            if (e.target.name === 'tonageArrive') {
                tonageArrive = inputValue;
            } else {
                tonageDepart = inputValue;
            }

            // Calculate total tonnage in metric tons (divide by 1000)
            const totalTonnage = (tonageArrive + tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveBlur = stringToDate(accostage.dateArrive);
            const dateDepartBlur = stringToDate(accostage.dateDepart);
            if (dateArriveBlur && dateDepartBlur) {
                // Set time to midnight for accurate day calculation
                dateArriveBlur.setHours(0, 0, 0, 0);
                dateDepartBlur.setHours(0, 0, 0, 0);
                const diffTime = dateDepartBlur.getTime() - dateArriveBlur.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostage.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostage.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount for first day + (remaining days * baseAmount/2)
                    const taxeAccostage = days > 0 ? Math.round(baseAmount + ((days - 1) * (baseAmount / 2))) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostage.taxe ? totalTaxes * 0.18 : 0;

                    // DEBUG: Show complete calculation breakdown
                    console.log('=== CALCUL TAXE ACCOSTAGE (BLUR EVENT) ===');
                    console.log('Champ modifié:', e.target.name);
                    console.log('Longueur du bateau:', accostage.longeur, 'm');
                    console.log('Tonnage Arrivée:', tonageArrive, 'kg =', tonageArrive / 1000, 'tonnes');
                    console.log('Tonnage Départ:', tonageDepart, 'kg =', tonageDepart / 1000, 'tonnes');
                    console.log('Tonnage Total:', totalTonnage, 'tonnes métriques');
                    console.log('---');
                    console.log('Date Arrivée:', accostage.dateArrive);
                    console.log('Date Départ:', accostage.dateDepart);
                    console.log('Nombre de jours (inclusif):', days);
                    console.log('---');
                    console.log('Base Amount (depuis DB pour longueur', accostage.longeur + 'm):', baseAmount, 'FBU');
                    console.log('Formule: baseAmount + ((days - 1) × (baseAmount / 2))');
                    console.log('Calcul:', baseAmount, '+ ((', days, '- 1) × (', baseAmount, '/ 2))');
                    console.log('      =', baseAmount, '+', ((days - 1) * (baseAmount / 2)));
                    console.log('      =', baseAmount + ((days - 1) * (baseAmount / 2)));
                    console.log('Taxe Accostage (arrondi):', taxeAccostage, 'FBU');
                    console.log('---');
                    console.log('Taxe Manutention (tonnage × 40):', totalTonnage, '× 40 =', taxeManut, 'FBU');
                    console.log('Total Taxes (Accostage + Manutention):', taxeAccostage, '+', taxeManut, '=', totalTaxes, 'FBU');
                    console.log('TVA 18% (si activée):', accostage.taxe ? 'OUI' : 'NON', '=', montTVA, 'FBU');
                    console.log('TOTAL GENERAL:', totalTaxes + montTVA, 'FBU');
                    console.log('=============================================');

                    // Update state with calculated values
                    setAccostage(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montTVA: montTVA
                    }));
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
            }
        }
    };

    const handleBlurEventEdit = async (e: React.FocusEvent<HTMLInputElement>) => {
        // Handle both tonnageArrive and tonnageDepart on blur
        if ((e.target.name === 'tonageDepart' || e.target.name === 'tonageArrive') && e.target.value !== '') {
            const inputValue = parseFloat(e.target.value.toString().replaceAll(/\s/g, '').replaceAll(',', '.'));

            let tonageArrive = accostageEdit.tonageArrive || 0;
            let tonageDepart = accostageEdit.tonageDepart || 0;

            if (e.target.name === 'tonageArrive') {
                tonageArrive = inputValue;
            } else {
                tonageDepart = inputValue;
            }

            // Calculate total tonnage in metric tons (divide by 1000)
            const totalTonnage = (tonageArrive + tonageDepart) / 1000;

            // Calculate taxeManut: totalTonnage * 40 (rounded)
            const taxeManut = Math.round(totalTonnage * 40);

            // Calculate days between dateArrive and dateDepart
            // Important: Count both arrival and departure days (inclusive)
            let days = 0;
            const dateArriveBlurEdit = stringToDate(accostageEdit.dateArrive);
            const dateDepartBlurEdit = stringToDate(accostageEdit.dateDepart);
            if (dateArriveBlurEdit && dateDepartBlurEdit) {
                // Set time to midnight for accurate day calculation
                dateArriveBlurEdit.setHours(0, 0, 0, 0);
                dateDepartBlurEdit.setHours(0, 0, 0, 0);
                const diffTime = dateDepartBlurEdit.getTime() - dateArriveBlurEdit.getTime();
                days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both days
            }

            try {
                // Fetch facParamAccostage based on boat length
                if (accostageEdit.longeur) {
                    const facParamAccostage = await fetchApiForParameters.fetchDataPromise({
                        method: 'GET',
                        url: `${URL_FACPARAM_ACCOSTAGE}/bylength?length=${accostageEdit.longeur}`,
                        skipAuth: false
                    });

                    const baseAmount = facParamAccostage.montant || 0;

                    // Calculate taxeAccostage: baseAmount for first day + (remaining days * baseAmount/2)
                    const taxeAccostage = days > 0 ? Math.round(baseAmount + ((days - 1) * (baseAmount / 2))) : 0;

                    // Calculate Redevance Informatique (one-time charge, not dependent on days)
                    const nbreBateau = accostageEdit.nbreBateau || 1;
                    const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                    const montRedevTaxe = accostageEdit.taxe ? Math.round(montantRedev * 0.18) : 0;

                    // Calculate TVA if taxe checkbox is enabled
                    const totalTaxes = taxeAccostage + taxeManut;
                    const montTVA = accostageEdit.taxe ? totalTaxes * 0.18 : 0;

                    // Update state with calculated values
                    setAccostageEdit(prev => ({
                        ...prev,
                        tonageArrive: tonageArrive,
                        tonageDepart: tonageDepart,
                        taxeManut: taxeManut,
                        taxeAccostage: taxeAccostage,
                        montantRedev: montantRedev,
                        montRedevTaxe: montRedevTaxe,
                        montTVA: montTVA
                    }));
                }
            } catch (error) {
                console.error('Error calculating taxes:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul des taxes');
            }
        }
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateAccostage') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateAccostage') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        }
        else if (error !== null && (chooseenTab === 1 || chooseenTab === 2 || chooseenTab === 3)) {
            accept('warn', 'Attention', 'Impossible de charger la liste des accostages.');
        }
        else if (data !== null && error === null) {
            if (callType === 'createAccostage') {
                // Update the accostage state with the returned data to show the noArrive (invoice number)
                if (data.noArrive) {
                    // dateArrive and dateDepart are now strings, keep other dates as Date objects
                    const accostageData = {
                        ...data,
                        dateArrive: data.dateArrive || '',
                        dateDepart: data.dateDepart || '',
                        dateCreation: data.dateCreation ? new Date(data.dateCreation) : null,
                        dateUpdate: data.dateUpdate ? new Date(data.dateUpdate) : null,
                        dateValidation: data.dateValidation ? new Date(data.dateValidation) : null
                    };
                    setAccostage(accostageData);
                    setShowInvoiceMessage(true);
                    accept('success', 'Succès', `Accostage enregistré avec succès. Num.Facture: ${data.noArrive}`);
                } else {
                    setAccostage(new Accostage());
                    accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
                }
            } else if (callType === 'updateAccostage') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setAccostageEdit(new Accostage());
                setEditAccostageDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterAccostage = () => {
        setAccostage(new Accostage());
        setShowInvoiceMessage(false);
        // Clear importateur filter and reload importateurs
        setImportateurFilter('');
        importateurFilterRef.current = '';
        setImportateurs([]);
        setLoadedPages(new Set([0]));
        loadAllImportateurs('', 0, 20);
    };

    const loadAccostageToEdit = (data: Accostage) => {
        if (data) {
            setEditAccostageDialog(true);
            // Auto-tick the taxe checkbox if montTVA has a value
            const updatedData = {
                ...data,
                taxe: (data.montTVA !== null && data.montTVA !== 0) ? true : data.taxe
            };
            setAccostageEdit(updatedData);

            // Fetch the specific importateur if we have an ID and haven't fetched it yet
            if (data.importateurId && !fetchedImportateursRef.current.has(data.importateurId)) {
                fetchSingleImportateur(
                    null,
                    'GET',
                    `${URL_IMPORTATEUR_BY_ID}/${data.importateurId}`,
                    'loadSingleImportateur'
                );
            }
        }
    };

    const viewAccostageDetails = (data: Accostage) => {
        if (data) {
            setAccostageToView(data);
            setViewAccostageDialog(true);
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
        impFetchData(null, "GET", url, "loadAllImportateur");
    };

    const handleLazyLoading = (e: VirtualScrollerLazyEvent) => {
        const pageSize = e.last - e.first;
        const pageNumber = Math.floor(e.first / pageSize);

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, 20);
        }
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurFilterRef.current = value;
        setImportateurFilter(value);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadAccostageToEdit(data)} raised severity='warning' />
                <Button icon="pi pi-eye" onClick={() => viewAccostageDetails(data)} raised severity='info' />
            </div>
        );
    };

    // Validation 1er niveau option buttons
    const optionButtonsValidation1 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {!data.valide1 ? (
                    <Button
                        icon="pi pi-check"
                        onClick={() => handleValidation1(data)}
                        raised
                        severity='success'
                        size="small"
                        tooltip="Valider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : (
                    <Button
                        icon="pi pi-times"
                        onClick={() => handleInvalidation1(data)}
                        raised
                        severity='danger'
                        size="small"
                        tooltip="Invalider"
                        tooltipOptions={{ position: 'top' }}
                    />
                )}
                <Button icon="pi pi-eye" onClick={() => viewAccostageDetails(data)} raised severity='info' size="small" />
            </div>
        );
    };

    // Validation 2ème niveau option buttons
    const optionButtonsValidation2 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {data.valide1 && !data.valide2 ? (
                    <Button
                        icon="pi pi-check"
                        onClick={() => handleValidation2(data)}
                        raised
                        severity='success'
                        size="small"
                        tooltip="Valider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : data.valide2 ? (
                    <Button
                        icon="pi pi-times"
                        onClick={() => handleInvalidation2(data)}
                        raised
                        severity='danger'
                        size="small"
                        tooltip="Invalider"
                        tooltipOptions={{ position: 'top' }}
                    />
                ) : null}
                <Button icon="pi pi-eye" onClick={() => viewAccostageDetails(data)} raised severity='info' size="small" />
            </div>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}`;

        if (dateDebut && dateFin) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebut)}&dateFin=${formatDate(dateFin)}`;
        }

        if (searchGPS.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPS.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadAccostages');
    };

    // Load validation data functions
    const loadValidationData1 = (params = lazyParamsValidation1) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}`;

        if (dateDebutValidation1 && dateFinValidation1) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebutValidation1)}&dateFin=${formatDate(dateFinValidation1)}`;
        }

        if (searchGPSValidation1.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPSValidation1.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadAccostagesValidation1');
    };

    const loadValidationData2 = (params = lazyParamsValidation2) => {
        const { page, rows } = params;

        let url = `${BASE_URL}/findall?page=${page}&size=${rows}`;

        if (dateDebutValidation2 && dateFinValidation2) {
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            url += `&dateDebut=${formatDate(dateDebutValidation2)}&dateFin=${formatDate(dateFinValidation2)}`;
        }

        if (searchGPSValidation2.trim()) {
            url += `&lettreTransp=${encodeURIComponent(searchGPSValidation2.trim())}`;
        }

        fetchData(null, 'GET', url, 'loadAccostagesValidation2');
    };

    const handleSearch = () => {
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const handleSearchValidation1 = () => {
        const newParams = { ...lazyParamsValidation1, first: 0, page: 0 };
        setLazyParamsValidation1(newParams);
        loadValidationData1(newParams);
    };

    const handleSearchValidation2 = () => {
        const newParams = { ...lazyParamsValidation2, first: 0, page: 0 };
        setLazyParamsValidation2(newParams);
        loadValidationData2(newParams);
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setSearchGPS('');
        const newParams = { ...lazyParams, first: 0, page: 0 };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const clearSearchValidation1 = () => {
        setDateDebutValidation1(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFinValidation1(new Date());
        setSearchGPSValidation1('');
        const newParams = { ...lazyParamsValidation1, first: 0, page: 0 };
        setLazyParamsValidation1(newParams);
        loadValidationData1(newParams);
    };

    const clearSearchValidation2 = () => {
        setDateDebutValidation2(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFinValidation2(new Date());
        setSearchGPSValidation2('');
        const newParams = { ...lazyParamsValidation2, first: 0, page: 0 };
        setLazyParamsValidation2(newParams);
        loadValidationData2(newParams);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else if (e.index === 2) {
            loadValidationData1();
        } else if (e.index === 3) {
            loadValidationData2();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche des accostages</h5>
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
                    <div className="field col-3">
                        <label htmlFor="dateDebut">Date Début</label>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFin">Date Fin</label>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="searchGPS">Lettre Transport</label>
                        <InputText
                            id="searchGPS"
                            value={searchGPS}
                            onChange={(e) => setSearchGPS(e.target.value)}
                            placeholder="Rechercher par lettre de transport"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSearchValidation1 = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche pour validation 1er niveau</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearchValidation1}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearchValidation1}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="dateDebutValidation1">Date Début</label>
                        <Calendar
                            id="dateDebutValidation1"
                            value={dateDebutValidation1}
                            onChange={(e) => setDateDebutValidation1(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFinValidation1">Date Fin</label>
                        <Calendar
                            id="dateFinValidation1"
                            value={dateFinValidation1}
                            onChange={(e) => setDateFinValidation1(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="searchGPSValidation1">Lettre Transport</label>
                        <InputText
                            id="searchGPSValidation1"
                            value={searchGPSValidation1}
                            onChange={(e) => setSearchGPSValidation1(e.target.value)}
                            placeholder="Rechercher par lettre de transport"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderSearchValidation2 = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex justify-content-between align-items-center">
                    <h5>Recherche pour validation 2ème niveau</h5>
                    <div className="flex gap-2">
                        <Button
                            icon="pi pi-search"
                            label="Rechercher"
                            onClick={handleSearchValidation2}
                            loading={loading}
                        />
                        <Button
                            icon="pi pi-times"
                            label="Effacer"
                            outlined
                            onClick={clearSearchValidation2}
                        />
                    </div>
                </div>

                <div className="formgrid grid">
                    <div className="field col-3">
                        <label htmlFor="dateDebutValidation2">Date Début</label>
                        <Calendar
                            id="dateDebutValidation2"
                            value={dateDebutValidation2}
                            onChange={(e) => setDateDebutValidation2(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-3">
                        <label htmlFor="dateFinValidation2">Date Fin</label>
                        <Calendar
                            id="dateFinValidation2"
                            value={dateFinValidation2}
                            onChange={(e) => setDateFinValidation2(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                        />
                    </div>
                    <div className="field col-6">
                        <label htmlFor="searchGPSValidation2">Lettre Transport</label>
                        <InputText
                            id="searchGPSValidation2"
                            value={searchGPSValidation2}
                            onChange={(e) => setSearchGPSValidation2(e.target.value)}
                            placeholder="Rechercher par lettre de transport"
                        />
                    </div>
                </div>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    const getValidationStatus1 = (rowData: any) => {
        if (rowData.valide1) {
            return <Badge value="Validé" severity="success" />;
        }
        return <Badge value="En attente" severity="warning" />;
    };

    const getValidationStatus2 = (rowData: any) => {
        if (rowData.valide2) {
            return <Badge value="Validé" severity="success" />;
        } else if (rowData.valide1) {
            return <Badge value="Prêt pour validation" severity="info" />;
        }
        return <Badge value="En attente 1er niv" severity="warning" />;
    };

    const getImportateurName = (importateurId: number | null): string => {
        if (!importateurId) return 'N/A';
        const importateur = importateurs.find(imp => imp.importateurId === importateurId);
        return importateur ? importateur.nom : `Client #${importateurId}`;
    };

    const getBargeName = (bargeId: number | null): string => {
        if (!bargeId) return 'N/A';
        const barge = barges.find(b => b.bargeId === bargeId);
        return barge ? barge.nom : `Barge #${bargeId}`;
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* View Dialog */}
            <Dialog
                header={`Détails Accostage - ${accostageToView.noArrive || 'N/A'}`}
                visible={viewAccostageDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => {
                    setViewAccostageDialog(false);
                    setAccostageToView(new Accostage());
                }}
            >
                <div className="grid">
                    <div className="col-12">
                        <div className="card">
                            <div className="grid">
                                <div className="col-6">
                                    <p><strong>Numéro Facture:</strong> {accostageToView.noArrive || 'N/A'}</p>
                                    <p><strong>Lettre Transport:</strong> {accostageToView.lettreTransp || 'N/A'}</p>
                                    <p><strong>Barge:</strong> {getBargeName(accostageToView.bargeId)}</p>
                                    <p><strong>Longueur:</strong> {accostageToView.longeur || 0} m</p>
                                    <p><strong>Date Arrivée:</strong> {formatDate(accostageToView.dateArrive)}</p>
                                    <p><strong>Date Départ:</strong> {formatDate(accostageToView.dateDepart)}</p>
                                </div>
                                <div className="col-6">
                                    <p><strong>Tonnage Arrivée:</strong> {formatCurrency(accostageToView.tonageArrive)} kg</p>
                                    <p><strong>Tonnage Départ:</strong> {formatCurrency(accostageToView.tonageDepart)} kg</p>
                                    <p><strong>Taxe Accostage:</strong> {formatCurrency(accostageToView.taxeAccostage)} FBU</p>
                                    <p><strong>Taxe Manutention:</strong> {formatCurrency(accostageToView.taxeManut)} FBU</p>
                                    <p><strong>Redevance Informatique:</strong> {formatCurrency(accostageToView.montantRedev)} FBU</p>
                                    <p><strong>TVA Redevance (18%):</strong> {formatCurrency(accostageToView.montRedevTaxe)} FBU</p>
                                    <p><strong>TVA (18%):</strong> {formatCurrency(accostageToView.montTVA)} FBU</p>
                                    <p><strong>Déclarant:</strong> {accostageToView.declarant || 'N/A'}</p>
                                    <p><strong>Mode Paiement:</strong> {accostageToView.modePayement || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-3 p-3 border-1 surface-border border-round">
                                <h6>Informations de validation</h6>
                                <div className="grid">
                                    <div className="col-6">
                                        <p><strong>Validation 1er niveau:</strong> {accostageToView.valide1 ? 'Oui' : 'Non'}</p>
                                        {accostageToView.valide1 && (
                                            <p><strong>Validé par:</strong> {accostageToView.userValide1 || 'N/A'}</p>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <p><strong>Validation 2ème niveau:</strong> {accostageToView.valide2 ? 'Oui' : 'Non'}</p>
                                        {accostageToView.valide2 && (
                                            <p><strong>Validé par:</strong> {accostageToView.userValide2 || 'N/A'}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 p-3 border-1 surface-border border-round">
                                <h6>Résumé financier</h6>
                                <div className="flex flex-column gap-2">
                                    <div className="flex justify-content-between">
                                        <span>Total Taxes (Accostage + Manutention):</span>
                                        <strong>{formatCurrency((accostageToView.taxeAccostage || 0) + (accostageToView.taxeManut || 0))} FBU</strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>TVA sur Taxes:</span>
                                        <strong>{formatCurrency(accostageToView.montTVA)} FBU</strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>Redevance Informatique:</span>
                                        <strong>{formatCurrency(accostageToView.montantRedev)} FBU</strong>
                                    </div>
                                    <div className="flex justify-content-between">
                                        <span>TVA Redevance:</span>
                                        <strong>{formatCurrency(accostageToView.montRedevTaxe)} FBU</strong>
                                    </div>
                                    <div className="flex justify-content-between border-top-1 surface-border pt-2">
                                        <span className="text-xl font-bold">Total à payer:</span>
                                        <strong className="text-xl text-primary">{formatCurrency((accostageToView.taxeAccostage || 0) + (accostageToView.taxeManut || 0) + (accostageToView.montTVA || 0) + (accostageToView.montantRedev || 0) + (accostageToView.montRedevTaxe || 0))} FBU</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                header="Modifier Accostage"
                visible={editAccostageDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditAccostageDialog(false)}
            >
                <AccostageForm
                    accostage={accostageEdit}
                    importateurs={importateurs}
                    barges={barges}
                    loadingStatus={impLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    importateurFilter={importateurFilter}
                    onImportateurFilterChange={handleImportateurFilterChange}
                    disabled={false}
                    handleBlurEvent={handleBlurEventEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditAccostageDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                {hasAuthority('ACCOSTAGE_CREATE') && (
                    <TabPanel header="Nouveau">
                        {showInvoiceMessage && accostage.noArrive && (
                            <div className="mb-3">
                                <Message
                                    severity="success"
                                    text={`Accostage créé avec succès! Numéro de facture: ${accostage.noArrive}`}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        )}
                        <AccostageForm
                            accostage={accostage}
                            importateurs={importateurs}
                            barges={barges}
                            loadingStatus={impLoading}
                            handleChange={handleChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleDropdownChange={handleDropdownChange}
                            handleCheckboxChange={handleCheckboxChange}
                            handleLazyLoading={handleLazyLoading}
                            importateurFilter={importateurFilter}
                            onImportateurFilterChange={handleImportateurFilterChange}
                            disabled={false}
                            handleBlurEvent={handleBlurEvent}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterAccostage} />
                                </div>
                                <div className="md:field md:col-3">
                                    <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}

                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={accostages}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'accostages à afficher"}
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
                                    <Column field="noArrive" header="N° Arrivée" sortable />
                                    <Column field="lettreTransp" header="L.T" sortable />
                                    <Column field="dateArrive" header="Date Arrivée" body={(rowData) => formatDate(rowData.dateArrive)} sortable />
                                    <Column field="dateDepart" header="Date Départ" body={(rowData) => formatDate(rowData.dateDepart)} sortable />
                                    <Column field="taxeAccostage" header="Taxe Accostage" body={(rowData) => `${formatCurrency(rowData.taxeAccostage)} FBU`} sortable />
                                    <Column field="taxeManut" header="Taxe Manut." body={(rowData) => `${formatCurrency(rowData.taxeManut)} FBU`} sortable />
                                    <Column field="declarant" header="Déclarant" sortable />
                                    <Column field="modePayement" header="Mode Paiement" sortable />
                                    <Column field="valide1" header="Valid. 1er Niv" body={(rowData) => rowData.valide1 ? 'Oui' : 'Non'} sortable />
                                    <Column field="valide2" header="Valid. 2ème Niv" body={(rowData) => rowData.valide2 ? 'Oui' : 'Non'} sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                {hasAuthority('ACCOSTAGE_VALIDATE_1') && (
                    <TabPanel header="Validation 1er Niveau">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={accostagesValidation1}
                                        header={renderSearchValidation1}
                                        emptyMessage={"Pas d'accostages à valider au 1er niveau"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="noArrive" header="N° Arrivée" sortable />
                                        <Column field="lettreTransp" header="L.T" sortable />
                                        <Column field="dateArrive" header="Date Arrivée" body={(rowData) => formatDate(rowData.dateArrive)} sortable />
                                        <Column field="taxeAccostage" header="Taxe Accostage" body={(rowData) => `${formatCurrency(rowData.taxeAccostage)} FBU`} sortable />
                                        <Column field="declarant" header="Déclarant" sortable />
                                        <Column field="userCreation" header="Créé par" sortable />
                                        <Column field="dateCreation" header="Date Création" body={(rowData) => formatDate(rowData.dateCreation)} sortable />
                                        <Column header="Statut" body={getValidationStatus1} />
                                        <Column header="Action" body={optionButtonsValidation1} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}

                {hasAuthority('ACCOSTAGE_VALIDATE_2') && (
                    <TabPanel header="Validation 2ème Niveau">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={accostagesValidation2}
                                        header={renderSearchValidation2}
                                        emptyMessage={"Pas d'accostages à valider au 2ème niveau"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="noArrive" header="N° Arrivée" sortable />
                                        <Column field="lettreTransp" header="L.T" sortable />
                                        <Column field="dateArrive" header="Date Arrivée" body={(rowData) => formatDate(rowData.dateArrive)} sortable />
                                        <Column field="taxeAccostage" header="Taxe Accostage" body={(rowData) => `${formatCurrency(rowData.taxeAccostage)} FBU`} sortable />
                                        <Column field="declarant" header="Déclarant" sortable />
                                        <Column field="userCreation" header="Créé par" sortable />
                                        <Column field="userValide1" header="Valid. 1er niv par" sortable />
                                        <Column header="Statut" body={getValidationStatus2} />
                                        <Column header="Action" body={optionButtonsValidation2} />
                                    </DataTable>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                )}
            </TabView>
        </>
    );
}

export default AccostageComponent;