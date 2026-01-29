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
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { VirtualScrollerLazyEvent } from 'primereact/virtualscroller';
import { Marchandise } from '../../(settings)/settings/marchandise/Marchandise';
import { Importer } from '../../(settings)/settings/importateur/Importer';
import { Entrepos } from '../../(settings)/settings/entrepot/Entrepos';
import { useReactToPrint } from 'react-to-print';
import React from 'react';
import PrintableContent from './PrintableMagSortiePort';
import { EnterRSP } from '../../storage/rsp/EnterRSP';
import { CategorieVehiculeEntrepot } from '../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot';
import { API_BASE_URL } from '@/utils/apiConfig';

function MagSortiePortComponent() {
    const [magSortiePort, setMagSortiePort] = useState<MagSortiePort>(new MagSortiePort());
    const [magSortiePortEdit, setMagSortiePortEdit] = useState<MagSortiePort>(new MagSortiePort());
    const [editMagSortiePortDialog, setEditMagSortiePortDialog] = useState(false);
    const [magSortiePorts, setMagSortiePorts] = useState<MagSortiePort[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPrintButton, setShowPrintButton] = useState(false);
    const [printMagSortiePort, setPrintMagSortiePort] = useState<MagSortiePort>(new MagSortiePort());

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: marchandiseData, loading: marchandiseLoading, error: marchandiseError, fetchData: fetchMarchandiseData, callType: marchandiseCallType } = useConsumApi('');
    const { data: entrepotData, loading: entrepotLoading, error: entrepotError, fetchData: fetchEntrepotData, callType: entrepotCallType } = useConsumApi('');
    const { data: enterRSPData, loading: enterRSPLoading, error: enterRSPError, fetchData: fetchEnterRSPData, callType: enterRSPCallType } = useConsumApi('');
    const { data: enterVehData, loading: enterVehLoading, error: enterVehError, fetchData: fetchEnterVehData, callType: enterVehCallType } = useConsumApi('');
    const { data: catVehicleData, loading: cvLoading, error: cvError, fetchData: cvFetchData, callType: cvCallType } = useConsumApi('');


    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [entrepos, setEntrepos] = useState<Entrepos[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const componentRef = useRef<HTMLDivElement>(null);
    const [importateurFilter, setImportateurFilter] = useState('');
    const [currentEnterRSP, setCurrentEnterRSP] = useState<EnterRSP>(new EnterRSP());
    const [catVehicules, setCatVehicules] = useState<CategorieVehiculeEntrepot[]>([]);

    const BASE_URL = `${API_BASE_URL}/magSortiePort`;
    const URL_CATEGORIE_VEHICLE = `${API_BASE_URL}/categorievehiculeentrepot/findall`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_FIND_BY_ID = `${API_BASE_URL}/importers/`;
    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises`;
    const URL_ENTREPOT = `${API_BASE_URL}/entrepos`;
    const ENTERRSP_URL = `${API_BASE_URL}/enterRSP/findbyRSP?rsp=`;
    const ENTERVEH_URL = `${API_BASE_URL}/entree_veh_port/findbyplaque?plaque=`;


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
            if (callType === 'loadMagSortiePorts') {
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

                //update the magSortieMagasin with the importateur data
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
        if (entrepotData && entrepotCallType === 'loadAllEntrepots') {
            setEntrepos(Array.isArray(entrepotData) ? entrepotData : [entrepotData]);
        }
    }, [entrepotData]);

     useEffect(() => {
        if (catVehicleData && cvCallType === 'loadAllCatVehicles') {
            setCatVehicules(Array.isArray(catVehicleData) ? catVehicleData : [catVehicleData]);
        }
    }, [catVehicleData]);

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
        if (enterVehData && enterVehCallType === 'loadEnterVeh') {
            console.log('Enter Veh Data:', JSON.stringify(enterVehData));
            //loop catVehicules and dislay item id and item libelle
            catVehicules.forEach((item) => {
                console.log(`Categorie ID: ${item.id}, Libelle: ${item.libelle}`);
            })

            //find categorieVehiculeId in catVehicules
            const foundCatVehicule = catVehicules.find(cat => cat.id === enterVehData.categorieVehId);


            setMagSortiePort((prev) => {
                return {
                    ...prev,
                    plaqueEntree: enterVehData.plaque,
                    categorieVehiculeId: foundCatVehicule?.id,
                    dateEntree: new Date(enterVehData.dateEntree),
                }
            });
        }
    }, [enterVehData]);

    useEffect(() => {
        // Load all necessary data on component mount
        loadAllMarchandises();
        loadAllEntrepot();
        loadAllCatVehicles();
    }, []);

    const loadAllMarchandises = () => {
        fetchMarchandiseData(null, 'GET', `${URL_MARCHANDISE}/findall`, 'loadAllMarchandises');
    };

    const loadAllEntrepot = () => {
        fetchEntrepotData(null, 'GET', `${URL_ENTREPOT}/findall`, 'loadAllEntrepots');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortiePortEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortiePort((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortiePortEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        console.log('Blurred value:', event.target.value);

        if (event.target.name === 'plaqueEntree') {
            const plaqueEncoded = encodeURIComponent(event.target.value.trim());
            fetchEnterVehData(null, 'GET', `${ENTERVEH_URL} + ${plaqueEncoded}`, 'loadEnterVeh');
        } else {
            const rspEncoded = encodeURIComponent(event.target.value.trim());
            fetchEnterRSPData(null, 'GET', `${ENTERRSP_URL} + ${rspEncoded}`, 'loadEnterRSP');

        }
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setMagSortiePort((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setMagSortiePortEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setMagSortiePort((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setMagSortiePortEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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

        fetchData(magSortiePort, 'POST', `${BASE_URL}/new`, 'createMagSortiePort');
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
        setPrintMagSortiePort(data);
        handlePrint();
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(magSortiePortEdit, 'PUT', `${BASE_URL}/update/${magSortiePortEdit.sortiePortId}`, 'updateMagSortiePort');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateMagSortiePort') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateMagSortiePort') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des sorties port.');
        } else if (data !== null && error === null) {
            if (callType === 'createMagSortiePort') {
                setMagSortiePort(data);
                setShowPrintButton(true);
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateMagSortiePort') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setMagSortiePortEdit(new MagSortiePort());
                setEditMagSortiePortDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterMagSortiePort = () => {
        setMagSortiePort(new MagSortiePort());
        setShowPrintButton(false);
    };

    const loadMagSortiePortToEdit = (data: MagSortiePort) => {
        if (data) {
            setEditMagSortiePortDialog(true);
            setMagSortiePortEdit(data);
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

    const loadAllCatVehicles = () => {
        cvFetchData(null, "GET", URL_CATEGORIE_VEHICLE, "loadAllCatVehicles");
    }

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <>
                <div className='flex flex-wrap gap-2'>
                    <Button icon="pi pi-pencil" onClick={() => loadMagSortiePortToEdit(data)} raised severity='warning' />
                    <Button icon="pi pi-print" onClick={() => openPrintDialog(data)} raised severity='info' />
                </div>
            </>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findAll`, 'loadMagSortiePorts');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterMagSortiePort} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
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

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Sortie Port"
                visible={editMagSortiePortDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditMagSortiePortDialog(false)}>
                <MagSortiePortForm
                    magSortiePort={magSortiePortEdit}
                    importateurs={importateurs}
                    marchandises={marchandises}
                    entrepots={entrepos}
                    loadingStatus={importateurLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    importateurFilter={importateurFilter}
                    onImportateurFilterChange={handleImportateurFilterChangeEdit}
                    handleBlur={handleBlur}
                    vehicleCategories={catVehicules}
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
                        loadingStatus={importateurLoading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleLazyLoading={handleLazyLoading}
                        importateurFilter={importateurFilter}
                        onImportateurFilterChange={handleImportateurFilterChange}
                        handleBlur={handleBlur}
                        vehicleCategories={catVehicules}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterMagSortiePort} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                            {showPrintButton && (
                                <div className="md:field md:col-3">
                                    <Button icon="pi pi-print" onClick={() => openPrintDialog(magSortiePort)} title='Imprimer la sortie port' />
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
                                    emptyMessage={"Pas de sorties port à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}>
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