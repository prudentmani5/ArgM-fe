'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Remorquage } from './Remorquage';
import RemorquageForm from './RemorquageForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact/dropdown';
import { Barge } from '../../../(settings)/settings/barge/Barge';
import { Importer } from '../../../(settings)/settings/importateur/Importer';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Calendar } from 'primereact/calendar';
import { Badge } from 'primereact/badge';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { useCurrentUser } from '../../../../../hooks/fetchData/useCurrentUser';
import { useAuthorities } from '../../../../../hooks/useAuthorities';
import { RedevanceInformatique } from '../../../(settings)/settings/redevanceInformatique/RedevanceInformatique';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { API_BASE_URL } from '@/utils/apiConfig';

function RemorquageComponent() {
    const [remorquage, setRemorquage] = useState<Remorquage>(new Remorquage());
    const [remorquageEdit, setRemorquageEdit] = useState<Remorquage>(new Remorquage());
    const [editRemorquageDialog, setEditRemorquageDialog] = useState(false);
    const [remorquages, setRemorquages] = useState<Remorquage[]>([]);
    const [redevanceInformatique, setRedevanceInformatique] = useState<RedevanceInformatique>(new RedevanceInformatique());
    const [remorquagesValidation1, setRemorquagesValidation1] = useState<Remorquage[]>([]);
    const [remorquagesValidation2, setRemorquagesValidation2] = useState<Remorquage[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: bargesData, loading: brLoading, error: brError, fetchData: brFetchData, callType: brCallType } = useConsumApi('');
    const { data: importateurData, loading: impLoading, error: impError, fetchData: impFetchData, callType: impCallType } = useConsumApi('');
    const { data: validationData, loading: validationLoading, error: validationError, fetchData: fetchValidationData, callType: validationCallType } = useConsumApi('');
    const { data: redevanceData, loading: redevLoading, error: redevError, fetchData: redevFetchData, callType: redevCallType } = useConsumApi('');
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [filterValue, setFilterValue] = useState('');
    const filterValueRef = useRef('');
    const toast = useRef<Toast>(null);

    // Date filter states
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

    const { user: appUser, loading: userLoading, error: userError } = useCurrentUser();

    // Add authorities management
    const { hasAuthority } = useAuthorities();

    const BASE_URL = `${API_BASE_URL}/remorquages`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
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
        brFetchData(null, 'GET', `${API_BASE_URL}/barges/findall`, 'loadBarges');
        loadAllImportateurs();
        redevFetchData(null, 'GET', URL_REDEVANCE, 'loadRedevance');
    }, []);

    useEffect(() => {
        if (bargesData) {
            if (brCallType === 'loadBarges') {
                setBarges(Array.isArray(bargesData) ? bargesData : [bargesData]);
            }
        }

        if (redevanceData) {
            if (redevCallType === 'loadRedevance') {
                setRedevanceInformatique(redevanceData);
            }
        }

        if (importateurData?.content) {
            const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
            if (newItems.length > 0) {
                setImportateurs(prev => [...prev, ...newItems]);
            }
        }

        if (data) {
            if (callType === 'loadRemorquages') {
                setRemorquages(data.content || []);
                setTotalRecords(data.totalElements || 0);
            } else if (callType === 'loadRemorquagesValidation1') {
                const filteredData = (data.content || []).filter((item: Remorquage) => !item.valide1);
                setRemorquagesValidation1(filteredData);
                setTotalRecordsValidation1(filteredData.length);
            } else if (callType === 'loadRemorquagesValidation2') {
                const filteredData = (data.content || []).filter((item: Remorquage) => item.valide1 && !item.valide2);
                setRemorquagesValidation2(filteredData);
                setTotalRecordsValidation2(filteredData.length);
            } else if (callType === 'createRemorquage') {
                setRemorquage(prev => ({
                    ...prev,
                    noRemorque: data.noRemorque,
                    lettreTransp: data.lettreTransp
                }));
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data, bargesData, importateurData, redevanceData]);

    useEffect(() => {
        if (validationData) {
            if (validationCallType === 'validateRemorquage1') {
                accept('success', 'Validation réussie', 'Le remorquage a été validé au 1er niveau avec succès.');
                const newParams = { ...lazyParamsValidation1 };
                loadValidationData1(newParams);
            } else if (validationCallType === 'validateRemorquage2') {
                accept('success', 'Validation réussie', 'Le remorquage a été validé au 2ème niveau avec succès.');
                const newParams = { ...lazyParamsValidation2 };
                loadValidationData2(newParams);
            }
        }
    }, [validationData, validationCallType]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filterValueRef.current) {
                loadAllImportateurs(filterValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [filterValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemorquage((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRemorquageEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setRemorquage((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setRemorquageEdit((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setRemorquage((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setRemorquageEdit((prev) => ({ ...prev, [field]: value ?? null }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        const checked = e.checked ?? false;

        // Recalculate montTVA and montRedevTaxe when TVA checkbox changes
        const montant = remorquage.montant || 0;
        const montantRedev = remorquage.montantRedev || 0;
        const montTVA = checked ? Math.round(montant * 0.18) : 0;
        const montRedevTaxe = checked ? Math.round(montantRedev * 0.18) : 0;

        setRemorquage((prev) => ({
            ...prev,
            taxe: checked,
            montTVA: montTVA,
            montRedevTaxe: montRedevTaxe
        }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const field = e.target.name;
        const value = e.target.value;

        if (field === 'bargeId') {
            const selectedBarge = barges.find(b => b.bargeId === value);
            if (selectedBarge) {
                setRemorquage((prev) => ({
                    ...prev,
                    bargeId: value,
                    longeur: selectedBarge.longeur,
                    largeur: selectedBarge.largeur,
                    tirant: selectedBarge.tirant
                }));
                return;
            }
        }

        setRemorquage((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        const field = e.target.name;
        const value = e.target.value;

        if (field === 'bargeId') {
            const selectedBarge = barges.find(b => b.bargeId === value);
            if (selectedBarge) {
                setRemorquageEdit((prev) => ({
                    ...prev,
                    bargeId: value,
                    longeur: selectedBarge.longeur,
                    largeur: selectedBarge.largeur,
                    tirant: selectedBarge.tirant
                }));
                return;
            }
        }

        setRemorquageEdit((prev) => ({ ...prev, [field]: value }));
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
            loadAllImportateurs(filterValue, pageNumber, pageSize);
        }
    };

    const handleFilterChange = (value: string) => {
        filterValueRef.current = value;
        setFilterValue(value);
    };

    const handleSubmit = () => {

        if (!remorquage.manoeuvre || remorquage.manoeuvre < 1) {
            accept('error', 'Erreur', 'Vous avez mis une date erronée');
            return;
        }

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
            ...remorquage,
            userCreation: userCreationName
        };

        fetchData(dataToSubmit, 'POST', `${BASE_URL}/new`, 'createRemorquage');
        setBtnLoading(false);
    };

    const handleSubmitEdit = () => {

        if (!remorquageEdit.manoeuvre || remorquageEdit.manoeuvre < 1) {
            accept('error', 'Erreur', 'Vous avez mis une date erronée');
            return;
        }

        setBtnLoading(true);
        fetchData(remorquageEdit, 'PUT', `${BASE_URL}/update?id=${encodeURIComponent(remorquageEdit.noRemorque)}`, 'updateRemorquage');
    };

    const handleValidation1 = (remorquageData: Remorquage) => {
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
            message: `Êtes-vous sûr de vouloir valider ce remorquage au 1er niveau ?
                     
Remorquage: ${remorquageData.noRemorque}
Lettre Transport: ${remorquageData.lettreTransp}
Montant: ${formatCurrency(remorquageData.montant)}`,
            header: 'Confirmation de validation 1er niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                const validationData = {
                    ...remorquageData,
                    valide1: true,
                    userValide1: userValidationName
                };
                fetchValidationData(validationData, 'PUT', `${BASE_URL}/validateRemorquage1?id=${encodeURIComponent(remorquageData.noRemorque)}`, 'validateRemorquage1');
            }
        });
    };

    const handleValidation2 = (remorquageData: Remorquage) => {
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
            message: `Êtes-vous sûr de vouloir valider ce remorquage au 2ème niveau ?
                     
Remorquage: ${remorquageData.noRemorque}
Lettre Transport: ${remorquageData.lettreTransp}
Montant: ${formatCurrency(remorquageData.montant)}`,
            header: 'Confirmation de validation 2ème niveau',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                const validationData = {
                    ...remorquageData,
                    valide2: true,
                    userValide2: userValidationName
                };
                fetchValidationData(validationData, 'PUT', `${BASE_URL}/validateRemorquage2?id=${encodeURIComponent(remorquageData.noRemorque)}`, 'validateRemorquage2');
            }
        });
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateRemorquage' && callType !== 'createRemorquage') {
                accept('warn', 'Attention', 'L\'opération n\'a pas été effectuée.');
            } else if (callType === 'updateRemorquage') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && (chooseenTab === 1 || chooseenTab === 2 || chooseenTab === 3)) {
            accept('warn', 'Attention', 'Impossible de charger la liste des remorquages.');
        } else if (data !== null && error === null) {
            if (callType === 'updateRemorquage') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setRemorquageEdit(new Remorquage());
                setEditRemorquageDialog(false);
                loadAllData();
            }
        }
        if (callType !== 'createRemorquage') {
            setBtnLoading(false);
        }
    };

    const clearFilterRemorquage = () => {
        setRemorquage(new Remorquage());
    };

    const loadRemorquageToEdit = (data: Remorquage) => {
        if (data) {
            setRemorquageEdit(data);
            setEditRemorquageDialog(true);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {hasAuthority('REMORQUAGE_UPDATE') && (
                    <Button icon="pi pi-pencil" onClick={() => loadRemorquageToEdit(data)} raised severity='warning' />
                )}
            </div>
        );
    };

    const optionButtonsValidation1 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {!data.valide1 ? (
                    <Button
                        icon="pi pi-check"
                        label="Valider"
                        onClick={() => handleValidation1(data)}
                        raised
                        severity='success'
                        size="small"
                    />
                ) : (
                    <Badge value="Validé" severity="success" />
                )}
            </div>
        );
    };

    const optionButtonsValidation2 = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {data.valide1 && !data.valide2 ? (
                    <Button
                        icon="pi pi-check"
                        label="Valider"
                        onClick={() => handleValidation2(data)}
                        raised
                        severity='success'
                        size="small"
                    />
                ) : data.valide2 ? (
                    <Badge value="Validé" severity="success" />
                ) : (
                    <Badge value="En attente 1er niv" severity="warning" />
                )}
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

        fetchData(null, 'GET', url, 'loadRemorquages');
    };

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

        fetchData(null, 'GET', url, 'loadRemorquagesValidation1');
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

        fetchData(null, 'GET', url, 'loadRemorquagesValidation2');
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

    const handleBlurEvent = (field: string) => {
        if (field === 'dateFin' && remorquage.dateDebut && remorquage.dateFin) {
            try {
                // Calculate hours between dateDebut and dateFin
                const dateDebut = new Date(remorquage.dateDebut);
                const dateFin = new Date(remorquage.dateFin);

                // Calculate difference in milliseconds
                const diffMs = dateFin.getTime() - dateDebut.getTime();

                // Convert milliseconds to hours
                const hours = diffMs / (1000 * 60 * 60);

                // Always round up to the next full hour - any partial hour counts as full hour
                const billedHours = Math.ceil(hours);

                // Calculate montant: billedHours * 188023
                const montant = billedHours * 188023;

                // Calculate Redevance Informatique
                const nbreBateau = remorquage.nbreBateau || 1;
                const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                const montRedevTaxe = remorquage.taxe ? Math.round(montantRedev * 0.18) : 0;

                // Calculate TVA on montant if taxe checkbox is enabled
                const montTVA = remorquage.taxe ? Math.round(montant * 0.18) : 0;

                // Update state with calculated values
                setRemorquage(prev => ({
                    ...prev,
                    manoeuvre: billedHours, // Store billed hours in manoeuvre field
                    montant: montant,
                    montantRedev: montantRedev,
                    montRedevTaxe: montRedevTaxe,
                    montTVA: montTVA
                }));
            } catch (error) {
                console.error('Error calculating montant:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul du montant');
            }
        }
    };

    // Also update for edit form
    const handleBlurEventEdit = (field: string) => {
        if (field === 'dateFin' && remorquageEdit.dateDebut && remorquageEdit.dateFin) {
            try {
                const dateDebut = new Date(remorquageEdit.dateDebut);
                const dateFin = new Date(remorquageEdit.dateFin);

                const diffMs = dateFin.getTime() - dateDebut.getTime();
                const hours = diffMs / (1000 * 60 * 60);

                // Always round up to the next full hour
                const billedHours = Math.ceil(hours);
                const montant = billedHours * 188023;

                // Calculate Redevance Informatique
                const nbreBateau = remorquageEdit.nbreBateau || 1;
                const montantRedev = Math.round((redevanceInformatique.montant || 0) * nbreBateau);
                const montRedevTaxe = remorquageEdit.taxe ? Math.round(montantRedev * 0.18) : 0;

                // Calculate TVA on montant if taxe checkbox is enabled
                const montTVA = remorquageEdit.taxe ? Math.round(montant * 0.18) : 0;

                setRemorquageEdit(prev => ({
                    ...prev,
                    manoeuvre: billedHours,
                    montant: montant,
                    montantRedev: montantRedev,
                    montRedevTaxe: montRedevTaxe,
                    montTVA: montTVA
                }));
            } catch (error) {
                console.error('Error calculating montant:', error);
                accept('error', 'Erreur', 'Erreur lors du calcul du montant');
            }
        }
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
                    <h5>Recherche des remorquages</h5>
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
        return date ? new Date(date).toLocaleString() : '';
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

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog
                header="Modifier Remorquage"
                visible={editRemorquageDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditRemorquageDialog(false)}
            >
                <RemorquageForm
                    remorquage={remorquageEdit}
                    barges={barges}
                    importateurs={importateurs}
                    loadingStatus={impLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    onFilterChange={handleFilterChange}
                    filterValue={filterValue}
                    disabled={false}
                    handleBlurEvent={handleBlurEventEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditRemorquageDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                {hasAuthority('REMORQUAGE_CREATE') && (
                    <TabPanel header="Nouveau">
                        <RemorquageForm
                            remorquage={remorquage}
                            barges={barges}
                            importateurs={importateurs}
                            loadingStatus={impLoading}
                            handleChange={handleChange}
                            handleNumberChange={handleNumberChange}
                            handleDateChange={handleDateChange}
                            handleDropdownChange={handleDropdownChange}
                            handleCheckboxChange={handleCheckboxChange}
                            handleLazyLoading={handleLazyLoading}
                            onFilterChange={handleFilterChange}
                            filterValue={filterValue}
                            disabled={false}
                            handleBlurEvent={handleBlurEvent}
                        />
                        <div className="card p-fluid">
                            <div className="formgrid grid">
                                <div className="md:col-offset-3 md:field md:col-3">
                                    <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterRemorquage} />
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
                                    value={remorquages}
                                    header={renderSearch}
                                    emptyMessage={"Pas de remorquages à afficher"}
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
                                    <Column field="noRemorque" header="Numéro" sortable />
                                    <Column field="lettreTransp" header="L.T" sortable />
                                    <Column
                                        field="bargeId"
                                        header="Barge"
                                        body={(rowData) => {
                                            const barge = barges.find(b => b.bargeId === rowData.bargeId);
                                            return barge ? barge.nom : '';
                                        }}
                                        sortable
                                    />
                                    <Column field="dateDebut" header="Date Début" body={(rowData) => formatDate(rowData.dateDebut)} sortable />
                                    <Column field="dateFin" header="Date Fin" body={(rowData) => formatDate(rowData.dateFin)} sortable />
                                    <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
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

                {hasAuthority('REMORQUAGE_VALIDATE_1') && (
                    <TabPanel header="Validation 1er Niveau">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={remorquagesValidation1}
                                        header={renderSearchValidation1}
                                        emptyMessage={"Pas de remorquages à valider au 1er niveau"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="noRemorque" header="Numéro" sortable />
                                        <Column field="lettreTransp" header="L.T" sortable />
                                        <Column field="dateDebut" header="Date Début" body={(rowData) => formatDate(rowData.dateDebut)} sortable />
                                        <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
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

                {hasAuthority('REMORQUAGE_VALIDATE_2') && (
                    <TabPanel header="Validation 2ème Niveau">
                        <div className='grid'>
                            <div className='col-12'>
                                <div className='card'>
                                    <DataTable
                                        value={remorquagesValidation2}
                                        header={renderSearchValidation2}
                                        emptyMessage={"Pas de remorquages à valider au 2ème niveau"}
                                        paginator
                                        rows={10}
                                        rowsPerPageOptions={[5, 10, 25, 50]}
                                    >
                                        <Column field="noRemorque" header="Numéro" sortable />
                                        <Column field="lettreTransp" header="L.T" sortable />
                                        <Column field="dateDebut" header="Date Début" body={(rowData) => formatDate(rowData.dateDebut)} sortable />
                                        <Column field="montant" header="Montant" body={(rowData) => `${formatCurrency(rowData.montant)} FBU`} sortable />
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

export default RemorquageComponent;