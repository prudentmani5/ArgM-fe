// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { MagSortiePort } from './MagSortiePort';
import MagSortiePortForm from './MagSortiePortForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Marchandise } from '../../(settings)/settings/marchandise/Marchandise';
import { Importer } from '../../(settings)/settings/importateur/Importer';
import { Entrepos } from '../../(settings)/settings/entrepot/Entrepos';
import { Barge } from '../../(settings)/settings/barge/Barge';
import { useReactToPrint } from 'react-to-print';
import React from 'react';
import { CategorieVehiculeEntrepot } from '../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot';
import { InvoiceSearchResponse } from './InvoiceSearchResponse';
import { AgenceDouane } from '../../(settings)/settings/agence/AgenceDouane';
import { Bank } from '../../(settings)/settings/compteBanquaire/CompteBanque';
import { API_BASE_URL } from '../../../../utils/apiConfig';
import { CategorieVehiculeSortieMagasin } from '../../(settings)/settings/categorieVehiculeSortieMagasin/CategorieVehiculeSortieMagasin';

function MagSortiePortComponent() {
    const [magSortiePort, setMagSortiePort] = useState<MagSortiePort>(new MagSortiePort());
    const [setMagSortiePortEdit, setMagSortieMagasinEdit] = useState<MagSortiePort>(new MagSortiePort());
    const [editMagSortiePortDialog, setEditMagSortiePortDialog] = useState(false);
    const [magSortiePorts, setMagSortiePorts] = useState<MagSortiePort[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPrintButton, setShowPrintButton] = useState(false);
    const [printMagSortieMagasin, setPrintMagSortieMagasin] = useState<MagSortiePort>(new MagSortiePort());

    // Date filters for "Tous" tab - default to first day of current month and today
    const getFirstDayOfMonth = () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    };
    const [dateDebut, setDateDebut] = useState<Date>(getFirstDayOfMonth());
    const [dateFin, setDateFin] = useState<Date>(new Date());

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: marchandiseData, loading: marchandiseLoading, error: marchandiseError, fetchData: fetchMarchandiseData, callType: marchandiseCallType } = useConsumApi('');
    const { data: entrepotData, loading: entrepotLoading, error: entrepotError, fetchData: fetchEntrepotData, callType: entrepotCallType } = useConsumApi('');
    const { data: bargeData, loading: bargeLoading, error: bargeError, fetchData: fetchBargeData, callType: bargeCallType } = useConsumApi('');
    const { data: enterRSPData, loading: enterRSPLoading, error: enterRSPError, fetchData: fetchEnterRSPData, callType: enterRSPCallType } = useConsumApi('');
    const { data: invoiceData, loading: invoiceLoading, error: invoiceError, fetchData: fetchInvoiceData, callType: invoiceCallType } = useConsumApi('');
    const { data: agenceDouaneData, loading: agenceDouaneLoading, error: agenceDouaneError, fetchData: fetchAgenceDouaneData, callType: agenceDouaneCallType } = useConsumApi('');
    const { data: categorieVehiculeData, loading: categorieVehiculeLoading, error: categorieVehiculeError, fetchData: fetchCategorieVehiculeData, callType: categorieVehiculeCallType } = useConsumApi('');
    const { data: banqueData, loading: banqueLoading, error: banqueError, fetchData: fetchBanqueData, callType: banqueCallType } = useConsumApi('');
    const { data: entryPayementData, loading: entryPayementLoading, error: entryPayementError, fetchData: fetchEntryPayementData, callType: entryPayementCallType } = useConsumApi('');
    const { data: categorieVehSortieMagData, fetchData: fetchCategorieVehSortieMagData, callType: categorieVehSortieMagCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [invoices, setInvoices] = useState<InvoiceSearchResponse[]>([]);
    const [invoiceDialogVisible, setInvoiceDialogVisible] = useState(false);
    const [entryPayements, setEntryPayements] = useState<any[]>([]);
    const [entryPayementDialogVisible, setEntryPayementDialogVisible] = useState(false);
    const toast = useRef<Toast>(null);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [entrepos, setEntrepos] = useState<Entrepos[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [agencesDouane, setAgencesDouane] = useState<AgenceDouane[]>([]);
    const [categoriesVehicule, setCategoriesVehicule] = useState<CategorieVehiculeEntrepot[]>([]);
    const [categoriesVehiculeSortieMagasin, setCategoriesVehiculeSortieMagasin] = useState<CategorieVehiculeSortieMagasin[]>([]);
    const [banques, setBanques] = useState<Bank[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const componentRef = useRef<HTMLDivElement>(null);
    const [importateurFilter, setImportateurFilter] = useState('');


    const BASE_URL = `${API_BASE_URL}/magSortiePort`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_FIND_BY_ID = `${API_BASE_URL}/importers/`;
    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises`;
    const URL_ENTREPOT = `${API_BASE_URL}/entrepos`;
    const URL_BARGE = `${API_BASE_URL}/barges/findall`;
    const URL_AGENCE_DOUANE = `${API_BASE_URL}/agencedouanes`;
    const URL_CATEGORIE_VEHICULE = `${API_BASE_URL}/categorievehiculeentrepot`;
    const URL_BANQUE = `${API_BASE_URL}/banks`;
    const ENTERRSP_URL = `${API_BASE_URL}/enterRSP/findbyRSP?rsp=`;
    const URL_INVOICE_SEARCH = `${API_BASE_URL}/invoices/search`;
    const URL_INVOICE_BY_ID = `${API_BASE_URL}/invoices/findbyid`;
    const URL_IMPORTATEUR_BY_ID = `${API_BASE_URL}/importers`;
    const URL_ENTRY_PAYEMENT_BY_RSP = `${API_BASE_URL}/entryPayements/searchByRSPForSortiePort`;
    const URL_CATEGORIE_VEH_SORTIE_MAG = `${API_BASE_URL}/categorievehiculesortiemagazin`;
    const URL_ENTREE_VEH_PORT = `${API_BASE_URL}/entree_veh_port`;


    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadMagSortieMagasins') {
                setMagSortiePorts(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    useEffect(() => {
        if (importateurData) {
            if (importateurCallType === 'loadAllImportateur' && importateurData.content) {
                const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
                if (newItems.length > 0) {
                    setImportateurs(prev => [...prev, ...newItems]);
                }
            }
            else if (importateurCallType === 'loadImportateurById') {
                console.log('Importateur Data:', JSON.stringify(importateurData));
                //add importateur data to the importateurs tab so it can be retrieved later and return the new tab immediately
                setImportateurs(prev => [...prev, importateurData]);

                //update the magSortiePort with the importateur data
                setMagSortiePort((prev) => {
                    return {
                        ...prev,
                        importateurId: importateurData.importateurId,
                        declarant: importateurData.declarant,
                    };
                });
                console.log('MagSortiePort after importateur fetch:', JSON.stringify(magSortiePort));
            }
        }
    }, [importateurData]);

    useEffect(() => {
        if (marchandiseData && marchandiseCallType === 'loadAllMarchandises') {
            setMarchandises(Array.isArray(marchandiseData) ? marchandiseData : [marchandiseData]);
        }
    }, [marchandiseData]);

    useEffect(() => {
        if (enterRSPData && enterRSPCallType === 'loadEnterRSP') {
            console.log('Enter RSP Data:', JSON.stringify(enterRSPData));
            //fecth directly importateur in the backend because importateurs tab is lazy loaded and there can't be a guarantee that the importateur is already loaded
            fetchImportateurData(null, 'GET', `${URL_IMPORTATEUR_FIND_BY_ID} + ${enterRSPData.importateurId}`, 'loadImportateurById');

            setMagSortiePort((prev) => {
                return {
                    ...prev,
                    lettreTransport: enterRSPData.noLettreTransport,
                    marchandiseId: enterRSPData.marchandiseId,
                    importateurId: enterRSPData.importateurId,
                    plaqueEntree: enterRSPData.plaque,
                    nbreColis: enterRSPData.nbreColis,
                    poidsEntre: enterRSPData.poids * 1000,
                    typeTransportEntre: enterRSPData.typeTransport,
                    bargeIdEntree: enterRSPData.bargeId,
                    entreposId: enterRSPData.entreposId,
                    montant: enterRSPData.montant,
                    noEntree: enterRSPData.noEntree,
                    dateEntree: new Date(enterRSPData.dateEntree),
                }
            });
        }
    }, [enterRSPData]);

    useEffect(() => {
        if (entrepotData && entrepotCallType === 'loadAllEntrepots') {
            setEntrepos(Array.isArray(entrepotData) ? entrepotData : [entrepotData]);
        }
    }, [entrepotData]);

    useEffect(() => {
        if (bargeData && bargeCallType === 'loadAllBarges') {
            setBarges(Array.isArray(bargeData) ? bargeData : [bargeData]);
        }
    }, [bargeData]);

    useEffect(() => {
        if (agenceDouaneData && agenceDouaneCallType === 'loadAllAgencesDouane') {
            setAgencesDouane(Array.isArray(agenceDouaneData) ? agenceDouaneData : [agenceDouaneData]);
        }
    }, [agenceDouaneData]);

    useEffect(() => {
        if (categorieVehiculeData && categorieVehiculeCallType === 'loadAllCategoriesVehicule') {
            setCategoriesVehicule(Array.isArray(categorieVehiculeData) ? categorieVehiculeData : [categorieVehiculeData]);
        }
    }, [categorieVehiculeData]);

    useEffect(() => {
        if (categorieVehSortieMagData && categorieVehSortieMagCallType === 'loadAllCategoriesVehSortieMag') {
            setCategoriesVehiculeSortieMagasin(Array.isArray(categorieVehSortieMagData) ? categorieVehSortieMagData : [categorieVehSortieMagData]);
        }
    }, [categorieVehSortieMagData]);



    useEffect(() => {
        if (banqueData && banqueCallType === 'loadAllBanques') {
            setBanques(Array.isArray(banqueData) ? banqueData : [banqueData]);
        }
    }, [banqueData]);

    useEffect(() => {
        if (invoiceData && invoiceCallType === 'searchInvoicesByRsp') {
            setInvoices(Array.isArray(invoiceData) ? invoiceData : [invoiceData]);
            if (invoiceData.length > 0) {
                setInvoiceDialogVisible(true);
            } else {
                accept('info', 'Information', 'Aucune facture trouvée pour ce RSP.');
            }
        }
    }, [invoiceData]);

    useEffect(() => {
        if (entryPayementData && entryPayementCallType === 'searchEntryPayementByRSP') {
            const payments = Array.isArray(entryPayementData) ? entryPayementData : [entryPayementData];
            setEntryPayements(payments);
            if (payments.length > 0) {
                setEntryPayementDialogVisible(true);
            } else {
                accept('warn', 'Attention', 'La marchandise n\'est pas encore appurée.');
            }
        }
    }, [entryPayementData]);

    useEffect(() => {
        // Load all necessary data on component mount
        loadAllMarchandises();
        loadAllEntrepot();
        loadAllBarges();
        loadAllAgencesDouane();
        loadAllCategoriesVehicule();
        loadAllBanques();
        loadAllCategoriesVehiculeSortieMagasin();
    }, []);

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const rspValue = event.target.value.trim();

        if (!rspValue) {
            // If RSP is empty, don't call the API
            return;
        }

        console.log('Blurred RSP value:', rspValue);

        // Search EntryPayement by RSP
        const rspEncoded = encodeURIComponent(rspValue);
        fetchEntryPayementData(null, 'GET', `${URL_ENTRY_PAYEMENT_BY_RSP}?rsp=${rspEncoded}`, 'searchEntryPayementByRSP');
    };

    const loadAllMarchandises = () => {
        fetchMarchandiseData(null, 'GET', `${URL_MARCHANDISE}/findall`, 'loadAllMarchandises');
    };

    const loadAllEntrepot = () => {
        fetchEntrepotData(null, 'GET', `${URL_ENTREPOT}/findall`, 'loadAllEntrepots');
    };

    const loadAllBarges = () => {
        fetchBargeData(null, 'GET', URL_BARGE, 'loadAllBarges');
    };

    const loadAllAgencesDouane = () => {
        fetchAgenceDouaneData(null, 'GET', `${URL_AGENCE_DOUANE}/findall`, 'loadAllAgencesDouane');
    };

    const loadAllCategoriesVehicule = () => {
        fetchCategorieVehiculeData(null, 'GET', `${URL_CATEGORIE_VEHICULE}/findall`, 'loadAllCategoriesVehicule');
    };

    const loadAllBanques = () => {
        fetchBanqueData(null, 'GET', `${URL_BANQUE}/findall`, 'loadAllBanques');
    };

    const loadAllCategoriesVehiculeSortieMagasin = () => {
        fetchCategorieVehSortieMagData(null, 'GET', `${URL_CATEGORIE_VEH_SORTIE_MAG}/findall`, 'loadAllCategoriesVehSortieMag');
    };

    const handleCategorieVehChange = async (e: DropdownChangeEvent) => {
        // First update the dropdown value
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.value }));

        // Find the selected category
        const selectedCategorie = categoriesVehiculeSortieMagasin.find(
            cat => cat.categorieVehiculeId === e.value
        );

        // If "Importation" is selected and plaque exists, fetch the vehicle entry data
        if (selectedCategorie && selectedCategorie.libelle === 'Importation' && magSortiePort.plaqueEntree) {
            try {
                const response = await fetch(`${URL_ENTREE_VEH_PORT}/findbyplaque?plaque=${encodeURIComponent(magSortiePort.plaqueEntree)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.dateEntree) {
                        setMagSortiePort(prev => ({
                            ...prev,
                            dateSaisieEntree: new Date(data.dateEntree)
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching vehicle entry data:', error);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortieMagasinEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortiePort((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortieMagasinEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setMagSortiePort((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setMagSortieMagasinEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setMagSortieMagasinEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setMagSortieMagasinEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
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

    const handleSubmit = () => {
        setBtnLoading(true);
        if (magSortiePort.dateEntree === null) {
            accept('warn', 'Attention', 'La date d\'entrée est obligatoire.');
            setBtnLoading(false);
            return;
        }

        if (magSortiePort.dateSortie === null) {
            accept('warn', 'Attention', 'La date de sortie est obligatoire.');
            setBtnLoading(false);
            return;
        }

        fetchData(magSortiePort, 'POST', `${BASE_URL}/new`, 'createMagSortieMagasin');
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
        },
        onPrintError: (error) => {
            accept('error', 'Erreur', `Échec de l'impression: ${error}`);
        }
    });

    const openPrintDialog = (data: MagSortiePort) => {
        setPrintMagSortieMagasin(data);
        handlePrint();
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(setMagSortiePortEdit, 'PUT', `${BASE_URL}/update/${setMagSortiePortEdit.sortieMagasinId}`, 'updateMagSortieMagasin');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateMagSortieMagasin') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateMagSortieMagasin') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des sorties magasin.');
        } else if (data !== null && error === null) {
            if (callType === 'createMagSortieMagasin') {
                setMagSortiePort(data);
                setShowPrintButton(true);
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateMagSortieMagasin') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setMagSortieMagasinEdit(new MagSortiePort());
                setEditMagSortiePortDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterMagSortieMagasin = () => {
        setMagSortiePort(new MagSortiePort());
        setShowPrintButton(false);
    };

    const loadMagSortieMagasinToEdit = (data: MagSortiePort) => {
        if (data) {
            setEditMagSortiePortDialog(true);
            setMagSortieMagasinEdit(data);
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

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <>
                <div className='flex flex-wrap gap-2'>
                    <Button icon="pi pi-pencil" onClick={() => loadMagSortieMagasinToEdit(data)} raised severity='warning' />
                    <Button icon="pi pi-print" onClick={() => openPrintDialog(data)} raised severity='info' />
                </div>
            </>
        );
    };

    const formatDateForApi = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const loadAllData = () => {
        const dateDebutStr = formatDateForApi(dateDebut);
        const dateFinStr = formatDateForApi(dateFin);
        fetchData(null, 'GET', `${BASE_URL}/searchByDateRange?dateDebut=${dateDebutStr}&dateFin=${dateFinStr}`, 'loadMagSortieMagasins');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const handleSearchByDate = () => {
        loadAllData();
    };

    const renderSearch = () => {
        return (
            <div className="flex flex-column gap-3">
                <div className="flex flex-wrap align-items-center gap-3">
                    <div className="flex align-items-center gap-2">
                        <label htmlFor="dateDebut" className="font-semibold">Date Début:</label>
                        <Calendar
                            id="dateDebut"
                            value={dateDebut}
                            onChange={(e) => setDateDebut(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="Date début"
                        />
                    </div>
                    <div className="flex align-items-center gap-2">
                        <label htmlFor="dateFin" className="font-semibold">Date Fin:</label>
                        <Calendar
                            id="dateFin"
                            value={dateFin}
                            onChange={(e) => setDateFin(e.value as Date)}
                            dateFormat="dd/mm/yy"
                            showIcon
                            placeholder="Date fin"
                        />
                    </div>
                    <Button type="button" icon="pi pi-search" label="Rechercher" onClick={handleSearchByDate} />
                    <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={() => {
                        setDateDebut(getFirstDayOfMonth());
                        setDateFin(new Date());
                    }} />
                </div>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'FBU'
        }).format(amount || 0);
    };

    const handleSelectInvoice = async (invoice: InvoiceSearchResponse) => {
        try {
            // First, get the full invoice details to access clientId and marchandiseId
            const invoiceResponse = await fetch(
                `${API_BASE_URL}/invoices/findBySortieIdAndRsp?rsp=${encodeURIComponent(invoice.rsp)}&sortieId=${encodeURIComponent(invoice.sortieId)}`
            );
            if (!invoiceResponse.ok) {
                throw new Error('Failed to fetch invoice details');
            }
            const fullInvoice = await invoiceResponse.json();

            // Load EnterRSP by RSP to get entrepot and barge information
            const enterRSPResponse = await fetch(`${ENTERRSP_URL}${encodeURIComponent(invoice.rsp)}`);
            let enterRSPData = null;
            if (enterRSPResponse.ok) {
                enterRSPData = await enterRSPResponse.json();
            }

            // Load importateur by clientId
            if (fullInvoice.clientId) {
                const importateurResponse = await fetch(`${URL_IMPORTATEUR_BY_ID}/${fullInvoice.clientId}`);
                if (importateurResponse.ok) {
                    const importateurData = await importateurResponse.json();
                    // Add to importateurs list if not already present
                    setImportateurs(prev => {
                        const exists = prev.some(imp => imp.importateurId === importateurData.importateurId);
                        return exists ? prev : [...prev, importateurData];
                    });
                }
            }

            // Update the form with all invoice data and EnterRSP data
            setMagSortiePort((prev) => ({
                ...prev,
                rsp: invoice.rsp,
                sortieId: invoice.sortieId,
                noFacture: invoice.numFacture,
                lettreTransport: invoice.lt,
                importateurId: fullInvoice.clientId || prev.importateurId,
                marchandiseId: fullInvoice.marchandiseId || prev.marchandiseId,
                declarant: fullInvoice.declarant || prev.declarant,
                dateSortie: fullInvoice.dateSortie ? new Date(fullInvoice.dateSortie) : prev.dateSortie,
                // Load from EnterRSP if available
                entreposId: enterRSPData?.entreposId || prev.entreposId,
                bargeIdEntree: enterRSPData?.bargeId || prev.bargeIdEntree,
                dateEntree: enterRSPData?.dateEntree ? new Date(enterRSPData.dateEntree) : prev.dateEntree,
                poidsEntre: enterRSPData?.poids ? enterRSPData.poids * 1000 : prev.poidsEntre,
                typeTransportEntre: enterRSPData?.typeTransport || prev.typeTransportEntre,
                plaqueEntree: enterRSPData?.plaque || prev.plaqueEntree,
                nbreColis: enterRSPData?.nbreColis || prev.nbreColis,
                montant: enterRSPData?.montant || prev.montant,
                noEntree: enterRSPData?.noEntree || prev.noEntree,
            }));

            // Close the dialog
            setInvoiceDialogVisible(false);
            accept('success', 'Succès', 'Facture chargée avec succès.');
        } catch (error) {
            console.error('Error loading invoice details:', error);
            accept('error', 'Erreur', 'Erreur lors du chargement de la facture.');
        }
    };

    const invoiceActionTemplate = (rowData: InvoiceSearchResponse) => {
        return (
            <Button
                icon="pi pi-pencil"
                rounded
                outlined
                severity="success"
                onClick={() => handleSelectInvoice(rowData)}
                tooltip="Choisir cette facture"
                tooltipOptions={{ position: 'top' }}
            />
        );
    };

    const handleSelectEntryPayement = async (payment: any) => {
        try {
            console.log('Selected EntryPayement:', payment);

            // Load importateur by clientId
            if (payment.clientId) {
                const importateurResponse = await fetch(`${URL_IMPORTATEUR_BY_ID}/${payment.clientId}`);
                if (importateurResponse.ok) {
                    const importateurData = await importateurResponse.json();
                    // Add to importateurs list if not already present
                    setImportateurs(prev => {
                        const exists = prev.some(imp => imp.importateurId === importateurData.importateurId);
                        return exists ? prev : [...prev, importateurData];
                    });
                }
            }

            // Load EnterRSP by RSP to get additional data
            let enterRSPData = null;
            if (payment.rsp) {
                const enterRSPResponse = await fetch(`${ENTERRSP_URL}${encodeURIComponent(payment.rsp)}`);
                if (enterRSPResponse.ok) {
                    enterRSPData = await enterRSPResponse.json();
                    console.log('EnterRSP Data:', enterRSPData);
                }
            }

            // Update the form with EntryPayement data and EnterRSP data
            // magSortiePort.quittance will receive entryPayement.factureId
            // banqueId will use EntryPayement.banqueId (from settings/compteBanquaire Bank)
            setMagSortiePort(prev => ({
                ...prev,
                rsp: payment.rsp || prev.rsp,
                importateurId: payment.clientId || prev.importateurId,
                noFacture: payment.factureId || prev.noFacture,
                noBordereau: payment.reference || prev.noBordereau,
                banqueId: payment.banqueId || prev.banqueId,
                quittance: payment.factureId || prev.quittance,
                montant: payment.montantPaye ? Number(payment.montantPaye) : prev.montant,
                // Load from EnterRSP if available
                entreposId: enterRSPData?.entreposId || prev.entreposId,
                marchandiseId: enterRSPData?.marchandiseId || prev.marchandiseId,
                poidsEntre: enterRSPData?.poids ? enterRSPData.poids * 1000 : prev.poidsEntre,
                lettreTransport: enterRSPData?.noLettreTransport || prev.lettreTransport,
                bargeIdEntree: enterRSPData?.bargeId || prev.bargeIdEntree,
                dateEntree: enterRSPData?.dateEntree ? new Date(enterRSPData.dateEntree) : prev.dateEntree,
                typeTransportEntre: enterRSPData?.typeTransport || prev.typeTransportEntre,
                plaqueEntree: enterRSPData?.plaque || prev.plaqueEntree,
                nbreColis: enterRSPData?.nbreColis || prev.nbreColis,
                noEntree: enterRSPData?.noEntree || prev.noEntree,

            }));

            // Close the dialog
            setEntryPayementDialogVisible(false);
            accept('success', 'Succès', 'Paiement et données chargées avec succès.');
        } catch (error) {
            console.error('Error loading EntryPayement details:', error);
            accept('error', 'Erreur', 'Erreur lors du chargement du paiement.');
        }
    };

    const entryPayementActionTemplate = (rowData: any) => {
        return (
            <Button
                icon="pi pi-check"
                rounded
                outlined
                severity="success"
                onClick={() => handleSelectEntryPayement(rowData)}
                tooltip="Sélectionner ce paiement"
                tooltipOptions={{ position: 'top' }}
            />
        );
    };

    return (
        <>
            <Toast ref={toast} />

            {/* Invoice Selection Dialog */}
            <Dialog
                header="Sélectionner une facture"
                visible={invoiceDialogVisible}
                style={{ width: '60vw' }}
                modal
                onHide={() => setInvoiceDialogVisible(false)}>
                <DataTable
                    value={invoices}
                    loading={invoiceLoading}
                    emptyMessage="Aucune facture trouvée"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    scrollable
                    scrollHeight="400px">
                    <Column field="rsp" header="RSP" sortable />
                    <Column field="lt" header="LT" sortable />
                    <Column field="sortieId" header="N° Facture" sortable />
                    <Column
                        header="Action"
                        body={invoiceActionTemplate}
                        style={{ width: '80px', textAlign: 'center' }}
                    />
                </DataTable>
            </Dialog>

            {/* EntryPayement Selection Dialog */}
            <Dialog
                header="Sélectionner un paiement"
                visible={entryPayementDialogVisible}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEntryPayementDialogVisible(false)}>
                <DataTable
                    value={entryPayements}
                    loading={entryPayementLoading}
                    emptyMessage="Aucun paiement trouvé"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    scrollable
                    scrollHeight="400px">
                    <Column field="paiementId" header="ID Paiement" sortable />
                    <Column field="factureId" header="N° Facture" sortable />
                    <Column field="rsp" header="RSP" sortable />
                    <Column field="reference" header="Référence" sortable />
                    <Column field="modePaiement" header="Mode" sortable />
                    <Column
                        field="montantPaye"
                        header="Montant"
                        sortable
                        body={(rowData) => new Intl.NumberFormat('fr-FR').format(rowData.montantPaye || 0)}
                    />
                    <Column
                        field="datePaiement"
                        header="Date"
                        sortable
                        body={(rowData) => rowData.datePaiement ? new Date(rowData.datePaiement).toLocaleDateString('fr-FR') : ''}
                    />
                    <Column
                        header="Action"
                        body={entryPayementActionTemplate}
                        style={{ width: '100px', textAlign: 'center' }}
                    />
                </DataTable>
            </Dialog>

            <Dialog
                header="Modifier Sortie Magasin"
                visible={editMagSortiePortDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditMagSortiePortDialog(false)}>
                <MagSortiePortForm
                    magSortiePort={setMagSortiePortEdit}
                    importateurs={importateurs}
                    marchandises={marchandises}
                    entrepots={entrepos}
                    barges={barges}
                    agencesDouane={agencesDouane}
                    categoriesVehicule={categoriesVehicule}
                    banques={banques}
                    loadingStatus={importateurLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    importateurFilter={importateurFilter}
                    onImportateurFilterChange={handleImportateurFilterChangeEdit}
                    handleBlur={handleBlur}
                    categoriesVehiculeSortieMagasin={categoriesVehiculeSortieMagasin}
                    handleCategorieVehChange={handleCategorieVehChange}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditMagSortiePortDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <MagSortiePortForm
                        magSortiePort={magSortiePort}
                        importateurs={importateurs}
                        marchandises={marchandises}
                        entrepots={entrepos}
                        barges={barges}
                        agencesDouane={agencesDouane}
                        categoriesVehicule={categoriesVehicule}
                        banques={banques}
                        loadingStatus={importateurLoading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleLazyLoading={handleLazyLoading}
                        importateurFilter={importateurFilter}
                        onImportateurFilterChange={handleImportateurFilterChange}
                        handleBlur={handleBlur}
                        categoriesVehiculeSortieMagasin={categoriesVehiculeSortieMagasin}
                        handleCategorieVehChange={handleCategorieVehChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterMagSortieMagasin} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                            {showPrintButton && (
                                <div className="md:field md:col-3">
                                    <Button icon="pi pi-print" onClick={() => openPrintDialog(magSortiePort)} title='Imprimer la sortie magasin' />
                                </div>
                            )}
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={magSortiePorts}
                                    header={renderSearch}
                                    emptyMessage={"Pas de sorties magasin à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}>
                                    <Column field="dateCreation" header="Date Création" body={(rowData) => formatDate(rowData.dateCreation)} sortable />
                                    <Column field="lettreTransport" header="Lettre Transport" sortable />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => formatDate(rowData.dateEntree)} sortable />
                                    <Column field="dateSortie" header="Date Sortie" body={(rowData) => formatDate(rowData.dateSortie)} sortable />
                                    <Column field="noEntree" header="N° Entrée" sortable />
                                    <Column field="poidsEntre" header="Poids Entrée (kg)" sortable />
                                    <Column field="poidsSortie" header="Poids Sortie (kg)" sortable />
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

export default MagSortiePortComponent;