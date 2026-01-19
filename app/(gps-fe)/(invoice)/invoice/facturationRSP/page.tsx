// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { FacFactureSortie } from './FacFactureSortie';
import FacFactureSortieForm from './FacFactureSortieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { DropdownChangeEvent } from 'primereact/dropdown';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';

function FacFactureSortieComponent() {
    const [facFactureSortie, setFacFactureSortie] = useState<FacFactureSortie>(new FacFactureSortie());
    const [facFactureSortieEdit, setFacFactureSortieEdit] = useState<FacFactureSortie>(new FacFactureSortie());
    const [editFacFactureSortieDialog, setEditFacFactureSortieDialog] = useState(false);
    const [facFacturesSortie, setFacFacturesSortie] = useState<FacFactureSortie[]>([]);
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
        sortOrder: null as number | null,
        filters: {
            numFacture: { value: '', matchMode: 'contains' }
        }
    });

    const BASE_URL = `${API_BASE_URL}/facfacturesortie`;

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
            if (callType === 'loadFacFacturesSortie') {
                setFacFacturesSortie(data.content || []);
                setTotalRecords(data.totalElements || 0);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacFactureSortie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacFactureSortieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setFacFactureSortie((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setFacFactureSortieEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setFacFactureSortie((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setFacFactureSortieEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setFacFactureSortie((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setFacFactureSortieEdit((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setFacFactureSortie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setFacFactureSortieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(facFactureSortie, 'POST', `${BASE_URL}/new`, 'createFacFactureSortie');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(facFactureSortieEdit, 'PUT', `${BASE_URL}/update/${facFactureSortieEdit.factureSortieId}`, 'updateFacFactureSortie');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFacFactureSortie') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateFacFactureSortie') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des factures de sortie.');
        } else if (data !== null && error === null) {
            if (callType === 'createFacFactureSortie') {
                setFacFactureSortie(new FacFactureSortie());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateFacFactureSortie') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setFacFactureSortieEdit(new FacFactureSortie());
                setEditFacFactureSortieDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFacFactureSortie = () => {
        setFacFactureSortie(new FacFactureSortie());
    };

    const loadFacFactureSortieToEdit = (data: FacFactureSortie) => {
        if (data) {
            setEditFacFactureSortieDialog(true);
            setFacFactureSortieEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFacFactureSortieToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = (params = lazyParams) => {
        const { page, rows, filters } = params;
        const searchParams = new URLSearchParams({
            page: page.toString(),
            size: rows.toString(),
            numFacture: filters.numFacture.value
        });
        fetchData(null, 'GET', `${BASE_URL}/findall?${searchParams.toString()}`, 'loadFacFacturesSortie');
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
                numFacture: { value: e.target.value, matchMode: 'contains' }
            }
        };
        setLazyParams(newParams);
        loadAllData(newParams);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFacFactureSortie} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Recherche par numéro de facture" 
                        value={lazyParams.filters.numFacture.value}
                        onChange={onFilter}
                    />
                </span>
            </div>
        );
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleString() : '';
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value || 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Facture de Sortie"
                visible={editFacFactureSortieDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditFacFactureSortieDialog(false)}
            >
                <FacFactureSortieForm
                    facFactureSortie={facFactureSortieEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditFacFactureSortieDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <FacFactureSortieForm
                        facFactureSortie={facFactureSortie}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleDropdownChange={handleDropdownChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterFacFactureSortie} />
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
                                    value={facFacturesSortie}
                                    header={renderSearch}
                                    emptyMessage={"Pas de factures de sortie à afficher"}
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
                                    <Column field="rsp" header="RSP" sortable />
                                    <Column field="lt" header="Lettre Transport" sortable />
                                    <Column field="dateSortie" header="Date Sortie" body={(rowData) => formatDate(rowData.dateSortie)} sortable />
                                    <Column field="montTotalManut" header="Total Manutention" body={(rowData) => formatCurrency(rowData.montTotalManut)} sortable />
                                    <Column field="montMagasinage" header="Magasinage" body={(rowData) => formatCurrency(rowData.montMagasinage)} sortable />
                                    <Column field="montTVA" header="TVA" body={(rowData) => formatCurrency(rowData.montTVA)} sortable />
                                    <Column field="montantPaye" header="Montant Payé" body={(rowData) => formatCurrency(rowData.montantPaye)} sortable />
                                    <Column field="isValid" header="Validé" body={(rowData) => rowData.isValid ? 'Oui' : 'Non'} sortable />
                                    <Column field="annule" header="Annulé" body={(rowData) => rowData.annule ? 'Oui' : 'Non'} sortable />
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

export default FacFactureSortieComponent;