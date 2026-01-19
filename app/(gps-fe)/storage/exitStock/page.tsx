'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { ExitStock } from './ExitStock';
import ExitStockForm from './ExitStockForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DropdownChangeEvent, InputNumberValueChangeEvent } from 'primereact/dropdown';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';

function ExitStockComponent() {
    const [exitStock, setExitStock] = useState<ExitStock>(new ExitStock());
    const [exitStockEdit, setExitStockEdit] = useState<ExitStock>(new ExitStock());
    const [editExitStockDialog, setEditExitStockDialog] = useState(false);
    const [exitStocks, setExitStocks] = useState<ExitStock[]>([]);
    const [entrepots, setEntrepots] = useState<any[]>([]);
    const [marchandises, setMarchandises] = useState<any[]>([]);
    const [importateurs, setImportateurs] = useState<any[]>([]);
    const [agencesDouane, setAgencesDouane] = useState<any[]>([]);
    const [barges, setBarges] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
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

    const BASE_URL = `${API_BASE_URL}/sortiemagasin`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Load all necessary dropdown data
        fetchData(null, 'GET', `${API_BASE_URL}/entrepots/findall`, 'loadEntrepots');
        fetchData(null, 'GET', `${API_BASE_URL}/marchandises/findall`, 'loadMarchandises');
        fetchData(null, 'GET', `${API_BASE_URL}/importateurs/findall`, 'loadImportateurs');
        fetchData(null, 'GET', `${API_BASE_URL}/agencesdouane/findall`, 'loadAgencesDouane');
        fetchData(null, 'GET', `${API_BASE_URL}/barges/findall`, 'loadBarges');
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadEntrepots') {
                setEntrepots(data.map((entrepot: any) => ({
                    label: entrepot.libelle,
                    value: entrepot.id
                })));
            } else if (callType === 'loadMarchandises') {
                setMarchandises(data.map((marchandise: any) => ({
                    label: marchandise.libelle,
                    value: marchandise.id
                })));
            } else if (callType === 'loadImportateurs') {
                setImportateurs(data.map((importateur: any) => ({
                    label: importateur.nom,
                    value: importateur.id
                })));
            } else if (callType === 'loadAgencesDouane') {
                setAgencesDouane(data.map((agence: any) => ({
                    label: agence.libelle,
                    value: agence.id
                })));
            } else if (callType === 'loadBarges') {
                setBarges(data.map((barge: any) => ({
                    label: barge.libelle,
                    value: barge.id
                })));
            } else if (callType === 'loadExitStocks') {
                setExitStocks(data.content || []);
                setTotalRecords(data.totalElements || 0);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExitStock((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExitStockEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setExitStock((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setExitStockEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setExitStock((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setExitStockEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setExitStock((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setExitStockEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setExitStock((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setExitStockEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(exitStock, 'POST', `${BASE_URL}/new`, 'createExitStock');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(exitStockEdit, 'PUT', `${BASE_URL}/update/${exitStockEdit.sortieMagasinId}`, 'updateExitStock');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateExitStock') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateExitStock') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des sorties de magasin.');
        } else if (data !== null && error === null) {
            if (callType === 'createExitStock') {
                setExitStock(new ExitStock());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateExitStock') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setExitStockEdit(new ExitStock());
                setEditExitStockDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterExitStock = () => {
        setExitStock(new ExitStock());
    };

    const loadExitStockToEdit = (data: ExitStock) => {
        if (data) {
            setEditExitStockDialog(true);
            setExitStockEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadExitStockToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows } = params;
        fetchData(null, 'GET', `${BASE_URL}/findall?page=${page}&size=${rows}`, 'loadExitStocks');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterExitStock} />
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
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Sortie Magasin"
                visible={editExitStockDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditExitStockDialog(false)}
            >
                <ExitStockForm
                    exitStock={exitStockEdit}
                    entrepots={entrepots}
                    marchandises={marchandises}
                    importateurs={importateurs}
                    agencesDouane={agencesDouane}
                    barges={barges}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditExitStockDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <ExitStockForm
                        exitStock={exitStock}
                        entrepots={entrepots}
                        marchandises={marchandises}
                        importateurs={importateurs}
                        agencesDouane={agencesDouane}
                        barges={barges}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterExitStock} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable
                                    value={exitStocks}
                                    header={renderSearch}
                                    emptyMessage={"Pas de sorties de magasin à afficher"}
                                    lazy
                                    paginator
                                    rows={lazyParams.rows}
                                    totalRecords={data?.totalElements || 0}
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
                                    <Column field="lettreTransport" header="Lettre Transport" sortable />
                                    <Column field="rsp" header="RSP" sortable />
                                    <Column field="noEntree" header="N° Entrée" sortable />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => formatDate(rowData.dateEntree)} sortable />
                                    <Column field="dateSortie" header="Date Sortie" body={(rowData) => formatDate(rowData.dateSortie)} sortable />
                                    <Column field="noConteneur" header="N° Conteneur" sortable />
                                    <Column field="nbreColis" header="Nbre Colis" sortable />
                                    <Column field="montant" header="Montant" body={(rowData) => formatCurrency(rowData.montant)} sortable />
                                    <Column field="typeTransportEntre" header="Transport Entrée" sortable />
                                    <Column field="typeTransportSortie" header="Transport Sortie" sortable />
                                    <Column field="poidsEntre" header="Poids Entrée (kg)" sortable />
                                    <Column field="poidsSortie" header="Poids Sortie (kg)" sortable />
                                    <Column field="sortie" header="Sortie" body={(rowData) => rowData.sortie ? 'Oui' : 'Non'} sortable />
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

export default ExitStockComponent;