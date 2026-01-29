// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { EntryCaffe } from './EntryCaffe';
import EntryCaffeForm from './EntryCaffeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumberValueChangeEvent } from 'primereact';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '../../../../utils/apiConfig';

function EntryCaffeComponent() {
    const [entryCaffe, setEntryCaffe] = useState<EntryCaffe>(new EntryCaffe());
    const [entryCaffeEdit, setEntryCaffeEdit] = useState<EntryCaffe>(new EntryCaffe());
    const [editEntryCaffeDialog, setEditEntryCaffeDialog] = useState(false);
    const [entryCaffes, setEntryCaffes] = useState<EntryCaffe[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/entryCoffes`;

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
            if (callType === 'loadEntryCaffes') {
                setEntryCaffes(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryCaffe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntryCaffeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryCaffe((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setEntryCaffeEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setEntryCaffe((prev) => ({ ...prev, [field]: value }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setEntryCaffeEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(entryCaffe, 'POST', `${BASE_URL}/new`, 'createEntryCaffe');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(entryCaffeEdit, 'PUT', `${BASE_URL}/update/${entryCaffeEdit.entreeCafeId}`, 'updateEntryCaffe');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEntryCaffe') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateEntryCaffe') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des entrées café.');
        } else if (data !== null && error === null) {
            if (callType === 'createEntryCaffe') {
                setEntryCaffe(new EntryCaffe());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateEntryCaffe') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEntryCaffeEdit(new EntryCaffe());
                setEditEntryCaffeDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEntryCaffe = () => {
        setEntryCaffe(new EntryCaffe());
    };

    const loadEntryCaffeToEdit = (data: EntryCaffe) => {
        if (data) {
            setEditEntryCaffeDialog(true);
            setEntryCaffeEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadEntryCaffeToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEntryCaffes');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterEntryCaffe} />
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

    const formatWeight = (weight: number | null) => {
        return weight ? `${weight} kg` : '';
    };

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Entrée Café"
                visible={editEntryCaffeDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEntryCaffeDialog(false)}>
                <EntryCaffeForm
                    entryCaffe={entryCaffeEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDateChange={handleDateChangeEdit} />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditEntryCaffeDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <EntryCaffeForm
                        entryCaffe={entryCaffe}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterEntryCaffe} />
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
                                    value={entryCaffes} 
                                    header={renderSearch} 
                                    emptyMessage={"Pas d'entrées café à afficher"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="numeroOrdre" header="Numéro d'Ordre" sortable />
                                    <Column field="dateEntree" header="Date Entrée" body={(rowData) => formatDate(rowData.dateEntree)} sortable />
                                    <Column field="plaqueEntre" header="Plaque" sortable />
                                    <Column field="noLot" header="N° Lot" sortable />
                                    <Column field="qualite" header="Qualité" sortable />
                                    <Column field="poidsBrut" header="Poids Brut" body={(rowData) => formatWeight(rowData.poidsBrut)} sortable />
                                    <Column field="poidsNet" header="Poids Net" body={(rowData) => formatWeight(rowData.poidsNet)} sortable />
                                    <Column field="nbreSac" header="Nbre Sacs" sortable />
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

export default EntryCaffeComponent;