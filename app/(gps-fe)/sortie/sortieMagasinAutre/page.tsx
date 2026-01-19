// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { MagSortieMagasinAutre } from './MagSortieMagasinAutre';
import MagSortieMagasinAutreForm from './MagSortieMagasinAutreForm';
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
import { Barge } from '../../(settings)/settings/barge/Barge';
import { useReactToPrint } from 'react-to-print';
import React from 'react';
import { CategorieVehiculeEntrepot } from '../../(settings)/settings/categorieVehicule/CategorieVehiculeEntrepot';
import { AgenceDouane } from '../../(settings)/settings/agence/AgenceDouane';
import { API_BASE_URL } from '@/utils/apiConfig';

function MagSortieMagasinAutreComponent() {
    const [magSortieMagasinAutre, setMagSortieMagasinAutre] = useState<MagSortieMagasinAutre>(new MagSortieMagasinAutre());
    const [magSortieMagasinAutreEdit, setMagSortieMagasinAutreEdit] = useState<MagSortieMagasinAutre>(new MagSortieMagasinAutre());
    const [editMagSortieMagasinAutreDialog, setEditMagSortieMagasinAutreDialog] = useState(false);
    const [magSortieMagasinAutres, setMagSortieMagasinAutres] = useState<MagSortieMagasinAutre[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPrintButton, setShowPrintButton] = useState(false);
    const [printMagSortieMagasinAutre, setPrintMagSortieMagasinAutre] = useState<MagSortieMagasinAutre>(new MagSortieMagasinAutre());

    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: importateurData, loading: importateurLoading, error: importateurError, fetchData: fetchImportateurData, callType: importateurCallType } = useConsumApi('');
    const { data: marchandiseData, loading: marchandiseLoading, error: marchandiseError, fetchData: fetchMarchandiseData, callType: marchandiseCallType } = useConsumApi('');
    const { data: entrepotData, loading: entrepotLoading, error: entrepotError, fetchData: fetchEntrepotData, callType: entrepotCallType } = useConsumApi('');
    const { data: bargeData, loading: bargeLoading, error: bargeError, fetchData: fetchBargeData, callType: bargeCallType } = useConsumApi('');
    const { data: agenceDouaneData, loading: agenceDouaneLoading, error: agenceDouaneError, fetchData: fetchAgenceDouaneData, callType: agenceDouaneCallType } = useConsumApi('');

    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [importateurs, setImportateurs] = useState<Importer[]>([]);
    const [marchandises, setMarchandises] = useState<Marchandise[]>([]);
    const [entrepos, setEntrepos] = useState<Entrepos[]>([]);
    const [barges, setBarges] = useState<Barge[]>([]);
    const [agencesDouane, setAgencesDouane] = useState<AgenceDouane[]>([]);
    const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
    const importateurValueRef = useRef('');
    const componentRef = useRef<HTMLDivElement>(null);
    const [importateurFilter, setImportateurFilter] = useState('');


    const BASE_URL = `${API_BASE_URL}/magSortieMagasinAutre`;
    const URL_IMPORTATEUR = `${API_BASE_URL}/importers/search`;
    const URL_IMPORTATEUR_FIND_BY_ID = `${API_BASE_URL}/importers/`;
    const URL_MARCHANDISE = `${API_BASE_URL}/marchandises`;
    const URL_ENTREPOT = `${API_BASE_URL}/entrepos`;
    const URL_BARGE = `${API_BASE_URL}/barges/findall`;
    const URL_AGENCE_DOUANE = `${API_BASE_URL}/agencedouanes`;
    const URL_IMPORTATEUR_BY_ID = `${API_BASE_URL}/importers`;

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
            if (callType === 'loadMagSortieMagasinAutres') {
                setMagSortieMagasinAutres(Array.isArray(data) ? data : [data]);
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

                //update the magSortieMagasinAutre with the importateur data
                setMagSortieMagasinAutre((prev) => {
                    return {
                        ...prev,
                        importateurId: importateurData.importateurId,
                        declarant: importateurData.declarant,
                    };
                });
                console.log('MagSortieMagasinAutre after importateur fetch:', JSON.stringify(magSortieMagasinAutre));
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
        // Load all necessary data on component mount
        loadAllMarchandises();
        loadAllEntrepot();
        loadAllBarges();
        loadAllAgencesDouane();
    }, []);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortieMagasinAutre((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMagSortieMagasinAutreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortieMagasinAutre((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setMagSortieMagasinAutreEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setMagSortieMagasinAutre((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setMagSortieMagasinAutreEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setMagSortieMagasinAutre((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setMagSortieMagasinAutreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setMagSortieMagasinAutre((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setMagSortieMagasinAutreEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
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
        if (magSortieMagasinAutre.dateEntree === null) {
            accept('warn', 'Attention', 'La date d\'entrée est obligatoire.');
            setBtnLoading(false);
            return;
        }

        if (magSortieMagasinAutre.dateSortie === null) {
            accept('warn', 'Attention', 'La date de sortie est obligatoire.');
            setBtnLoading(false);
            return;
        }

        if (!magSortieMagasinAutre.plaqueSortie || magSortieMagasinAutre.plaqueSortie.trim() === '') {
            accept('warn', 'Attention', 'La plaque sortie est obligatoire.');
            setBtnLoading(false);
            return;
        }

        if (!magSortieMagasinAutre.dmc || magSortieMagasinAutre.dmc.trim() === '') {
            accept('warn', 'Attention', 'Le DMC est obligatoire.');
            setBtnLoading(false);
            return;
        }

        fetchData(magSortieMagasinAutre, 'POST', `${BASE_URL}/new`, 'createMagSortieMagasinAutre');
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

    const openPrintDialog = (data: MagSortieMagasinAutre) => {
        setPrintMagSortieMagasinAutre(data);
        handlePrint();
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);

        if (!magSortieMagasinAutreEdit.plaqueSortie || magSortieMagasinAutreEdit.plaqueSortie.trim() === '') {
            accept('warn', 'Attention', 'La plaque sortie est obligatoire.');
            setBtnLoading(false);
            return;
        }

        if (!magSortieMagasinAutreEdit.dmc || magSortieMagasinAutreEdit.dmc.trim() === '') {
            accept('warn', 'Attention', 'Le DMC est obligatoire.');
            setBtnLoading(false);
            return;
        }

        fetchData(magSortieMagasinAutreEdit, 'PUT', `${BASE_URL}/update/${magSortieMagasinAutreEdit.sortieMagasinId}`, 'updateMagSortieMagasinAutre');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateMagSortieMagasinAutre') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateMagSortieMagasinAutre') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des sorties magasin.');
        } else if (data !== null && error === null) {
            if (callType === 'createMagSortieMagasinAutre') {
                setMagSortieMagasinAutre(data);
                setShowPrintButton(true);
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateMagSortieMagasinAutre') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setMagSortieMagasinAutreEdit(new MagSortieMagasinAutre());
                setEditMagSortieMagasinAutreDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterMagSortieMagasinAutre = () => {
        setMagSortieMagasinAutre(new MagSortieMagasinAutre());
        setShowPrintButton(false);
    };

    const loadMagSortieMagasinAutreToEdit = (data: MagSortieMagasinAutre) => {
        if (data) {
            setEditMagSortieMagasinAutreDialog(true);
            setMagSortieMagasinAutreEdit(data);
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

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <>
                <div className='flex flex-wrap gap-2'>
                    <Button icon="pi pi-pencil" onClick={() => loadMagSortieMagasinAutreToEdit(data)} raised severity='warning' />
                    <Button icon="pi pi-print" onClick={() => openPrintDialog(data)} raised severity='info' />
                </div>
            </>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findAll`, 'loadMagSortieMagasinAutres');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterMagSortieMagasinAutre} />
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
                header="Modifier Sortie Magasin"
                visible={editMagSortieMagasinAutreDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditMagSortieMagasinAutreDialog(false)}>
                <MagSortieMagasinAutreForm
                    magSortieMagasinAutre={magSortieMagasinAutreEdit}
                    importateurs={importateurs}
                    marchandises={marchandises}
                    entrepots={entrepos}
                    barges={barges}
                    agencesDouane={agencesDouane}
                    loadingStatus={importateurLoading}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleLazyLoading={handleLazyLoading}
                    importateurFilter={importateurFilter}
                    onImportateurFilterChange={handleImportateurFilterChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditMagSortieMagasinAutreDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <MagSortieMagasinAutreForm
                        magSortieMagasinAutre={magSortieMagasinAutre}
                        importateurs={importateurs}
                        marchandises={marchandises}
                        entrepots={entrepos}
                        barges={barges}
                        agencesDouane={agencesDouane}
                        loadingStatus={importateurLoading}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleLazyLoading={handleLazyLoading}
                        importateurFilter={importateurFilter}
                        onImportateurFilterChange={handleImportateurFilterChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterMagSortieMagasinAutre} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                            {showPrintButton && (
                                <div className="md:field md:col-3">
                                    <Button icon="pi pi-print" onClick={() => openPrintDialog(magSortieMagasinAutre)} title='Imprimer la sortie magasin' />
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
                                    value={magSortieMagasinAutres}
                                    header={renderSearch}
                                    emptyMessage={"Pas de sorties magasin à afficher"}
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

export default MagSortieMagasinAutreComponent;
