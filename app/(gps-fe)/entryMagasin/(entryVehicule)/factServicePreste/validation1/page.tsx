'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { FacServicePreste } from '../FacServicePreste';
import FacServicePresteForm from '../FacServicePresteForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact/dropdown';
import { FacService } from '../../../../(settings)/settings/facService/FacService';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Importer } from '../../../../(settings)/settings/importateur/Importer';
import { parseDateString } from '../../../../../../utils/component/dateUtils';
import { API_BASE_URL } from '@/utils/apiConfig';

function FacServicePresteComponent() {
    const [facServicePreste, setFacServicePreste] = useState<FacServicePreste>(new FacServicePreste());
    const [facServicePresteEdit, setFacServicePresteEdit] = useState<FacServicePreste>(new FacServicePreste());
    const [editFacServicePresteDialog, setEditFacServicePresteDialog] = useState(false);
    const [facServicesPrestes, setFacServicesPrestes] = useState<FacServicePreste[]>([]);
    const [services, setServices] = useState<FacService[]>([]);
    const [numFacture, setNumFacture] = useState('');
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [servicePrestESize, setServicePrestESize] = useState(0);
    const [allServicePrestE, setAllServicePrestE] = useState<FacServicePreste[]>([]);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: serviceData, loading: serviceLoading, error: serviceError, fetchData: serviceFetchData, callType: serviceCallType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyParams, setLazyParams] = useState({
        first: 0,
        rows: 10,
        page: 0,
        sortField: '',
        sortOrder: null as number | null
    });
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [importateurFilter, setImportateurFilter] = useState('');

    const BASE_URL = `${API_BASE_URL}/servicepreste`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        serviceFetchData(null, 'GET', `${API_BASE_URL}/facservices/findall`, 'loadServices');
        loadAllImportateurs();
    }, []);

    useEffect(() => {
        fectAllFacServicePreste();
    }, [numFacture]);


    

    useEffect(() => {
        if (serviceData) {
            if (serviceCallType === 'loadServices') {
                setServices(serviceData);
            }
        }

        if (data)
            if (callType === 'loadFacServicesPreste') {
                setFacServicesPrestes(data || []);
                // setTotalRecords(data.totalElements || 0);
            }

        if (callType === 'addFacServicePreste') {

            const newService: FacServicePreste = {
                ...new FacServicePreste(),  // Spread all default values
                numFacture: data.numFacture,   // Override specific properties
                lettreTransp: data.lettreTransp
            };
            setFacServicePreste(newService);
            console.log('data :' + JSON.stringify(data));
            setAllServicePrestE(prev => [...prev, data]);
            setServicePrestESize(prevSize => prevSize + 1);
            accept('info', 'C\'est fait', 'Le service a été ajouté avec succès.');
        }

        if (importateurData)
            if (importateurCallType === 'loadAllImportateur' && importateurData.content) {
                const newItems = Array.isArray(importateurData.content) ? importateurData.content : [];
                if (newItems.length > 0) {
                    setImportateurs(prev => [...prev, ...newItems]);
                }
            }
        handleAfterApiCall(activeIndex);

    }, [data, serviceData, importateurData]);



    useEffect(() => {
        const timer = setTimeout(() => {
            if (importateurValueRef.current) {
                loadAllImportateurs(importateurValueRef.current, 0, 20);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [importateurFilter]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacServicePreste((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setFacServicePresteEdit((prev) => ({ ...prev, [field]: value }));
    };


    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [field]: value }));
    };



    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setFacServicePreste((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
        if (e.target.name === 'valide1') {
            setFacServicePreste((prev) => ({ ...prev, userValide1: 'ARAKAZA Wilfried' }));
        }
        else if (e.target.name === 'valide2') {
            setFacServicePreste((prev) => ({ ...prev, userValide2: 'Prudence MANIRAKIZA' }));
        }
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setFacServicePresteEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
        if (e.target.name === 'valide1') {
            setFacServicePresteEdit((prev) => ({ ...prev, userValide1: 'ARAKAZA Wilfried' }));
        }
        else if (e.target.name === 'valide2') {
            setFacServicePresteEdit((prev) => ({ ...prev, userValide2: 'Prudence MANIRAKIZA' }));
        }
    };
    const checkIfFormIsOk = () => {
        let checkForm = { status: true, errorMessage: '' };
        if (facServicePreste.serviceId == null || facServicePreste.serviceId == 0) {
            checkForm.status = false;
            checkForm.errorMessage = "Veuillez préciser le service presté";
        }

        return checkForm;
    }

    const handleSubmit = () => {

        const formValidation = checkIfFormIsOk();
        const summary = "A votre attention SVP";
        if (!formValidation.status) {
            accept('warn', summary, formValidation.errorMessage);
            setBtnLoading(false);
            return;
        }
        setBtnLoading(true);
        fetchData(facServicePreste, 'POST', `${BASE_URL}/new`, 'addFacServicePreste');
        console.log('sent ' + JSON.stringify(facServicePreste));
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        facServicePresteEdit.valide1 = true;
        fetchData(facServicePresteEdit, 'PUT', `${BASE_URL}/validateFacServicePreste/${facServicePresteEdit.servicePresteId}`, 'updateFacServicePreste');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'loadFacServicesPreste') {
                accept('warn', 'Oupss', 'Aucun service presté pour cette facture.');
            }
            if (callType === 'updateFacServicePreste') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
                
            }
        }
        else if (data !== null && error === null) {
            if (callType === 'updateFacServicePreste') {
                accept('info', 'Succès', 'Le service a été validé avec succès.');
                setFacServicePresteEdit(new FacServicePreste);
                setEditFacServicePresteDialog(false);
                fectAllFacServicePreste();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFacServicePreste = () => {
        setFacServicePreste(new FacServicePreste());
    };

    const loadFacServicePresteToEdit = (data: FacServicePreste) => {
        if (data) {
            // Convert string dates to Date objects
        const editedData = {
            ...data,
            date: parseDateString(data.date as unknown as string),
            dateFin: parseDateString(data.dateFin as unknown as string)
        };
        setEditFacServicePresteDialog(true);
        console.log('Edited data with parsed dates:', {
            originalDate: data.date,
            parsedDate: editedData.date,
            originalDateFin: data.dateFin,
            parsedDateFin: editedData.dateFin
        });
        setFacServicePresteEdit(editedData);
        // setFacServicePresteEdit(new FacServicePreste());
        setEditFacServicePresteDialog(true);
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

        // Prevent negative page numbers to avoid 401 and refresh token loop
        if (pageNumber < 0 || pageSize <= 0) {
            return;
        }

        if (!loadedPages.has(pageNumber)) {
            setLoadedPages(prev => new Set(prev).add(pageNumber));
            loadAllImportateurs(importateurFilter, pageNumber, pageSize);
        }
    };

    const handleServiceFilterChange = (value: string) => {
        // filterValueRef.current = value;
        setServiceFilter(value);
    };

    const handleImportateurFilterChange = (value: string) => {
        importateurValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleServiceFilterChangeEdit = (value: string) => {
        // filterValueRef.current = value;
        setServiceFilter(value);
    };

    const handleImportateurFilterChangeEdit = (value: string) => {
        // filterValueRef.current = value;
        setImportateurFilter(value);
    };

    const handleFactureSelect = (facServicePresteSelected: FacServicePreste) => {
        setFacServicePreste(facServicePresteSelected);
        // setFactureSearchResults([]);
    };

    const clearFactureSearchResults = () => {
        // setFactureSearchResults([]);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFacServicePresteToEdit(data)} raised severity='warning' />
            </div>
        );
    };
    const showService = (data: FacServicePreste): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                {services.map((service) => (
                    service.id === data.serviceId && <span key={service.id}>{service.libelleService}</span>
                ))}
            </div>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows } = params;
        fetchData(null, 'GET', `${BASE_URL}/findall?page=${page}&size=${rows}`, 'loadFacServicesPreste');
    };
    const loadAllFacServicePreste = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNumFacture(e.target.value);
    };

    const fectAllFacServicePreste = () => {
        fetchData(null, 'GET', `${BASE_URL}/findFacServicePresteForValidate1?numFacture=${encodeURIComponent(numFacture)}&validation=false`, 'loadFacServicesPreste');
   
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 2) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFacServicePreste} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche par N° de Facture" onChange={loadAllFacServicePreste} />
                </span>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (amount: number | null) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Validation premier niveau"
                visible={editFacServicePresteDialog}
                style={{ width: '70vw' }} breakpoints={{ '960px': '75vw', '641px': '100vw' }}
                modal
                onHide={() => setEditFacServicePresteDialog(false)}
            >
                <FacServicePresteForm
                    facServicePreste={facServicePresteEdit}
                    services={services}
                    importateurs={importateurs}
                    loadingStatus={loading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    serviceFilter={serviceFilter}
                    importateurFilter={importateurFilter}
                    onServiceFilterChange={handleServiceFilterChangeEdit}
                    onImportateurFilterChange={handleImportateurFilterChangeEdit}
                    disabled={true}
                />
                {/* <div className="flex justify-content-center gap-2 mt-3">
                </div> */}
                <div className="p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-1 md:field md:col-5">
                            <Button label="Annuler" icon="pi pi-times" onClick={() => setEditFacServicePresteDialog(false)} className="p-button-text" />
                        </div>
                        <div className="md:field md:col-6">
                            <Button label="Valider" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                        </div>
                    </div>
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>

                <TabPanel header="Validation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={facServicesPrestes}
                                    header={renderSearch}
                                    emptyMessage={"Pas de services prestés à afficher"}
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
                                    <Column field="numFacture" header="Numéro Facture" sortable />
                                    {/* <Column field="date" header="Date" body={(rowData) => formatDate(rowData.date)} sortable />
                                    <Column field="dateFin" header="Date Fin" body={(rowData) => formatDate(rowData.dateFin)} sortable />*/}
                                    <Column field="lettreTransp" header="Lettre Transport" />
                                    <Column field="montant" header="Montant" body={(rowData) => formatCurrency(rowData.montant)} sortable />
                                    <Column header="Service" body={showService} />
                                    <Column field="plaque" header="Plaque" sortable />
                                    <Column field="nbreCont" header="Nbre Véh" sortable />
                                    <Column header="Valider" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>

            </TabView>
        </>
    );
}

export default FacServicePresteComponent;