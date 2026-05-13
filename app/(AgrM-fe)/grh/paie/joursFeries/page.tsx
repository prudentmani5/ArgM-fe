'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { JoursFeries } from './JoursFeries';
import JoursFeriesForm from './JoursFeriesForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';
import { dateToString, stringToDate } from '@/utils/dateUtils';

function JoursFeriesComponent() {

    const [joursFeries, setJoursFeries] = useState<JoursFeries>(new JoursFeries());
    const [joursFeriesEdit, setJoursFeriesEdit] = useState<JoursFeries>(new JoursFeries());
    const [editJoursFeriesDialog, setEditJoursFeriesDialog] = useState(false);
    const [joursFeriesList, setJoursFeriesList] = useState<JoursFeries[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadJoursFeries') {
                setJoursFeriesList(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setJoursFeries((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setJoursFeriesEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setJoursFeries((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleDateChangeEdit = (value: Date | null | undefined, field: string) => {
        setJoursFeriesEdit((prev) => ({ ...prev, [field]: dateToString(value) }));
    };

    const handleSubmit = () => {
        if (!joursFeries.dateFerie || !joursFeries.libelle) {
            showToast('warn', 'Attention', 'Veuillez remplir la date et le libellé.');
            return;
        }
        setBtnLoading(true);
        fetchData(joursFeries, 'Post', buildApiUrl('/jour-feries/new'), 'createJoursFeries');
        setJoursFeries(new JoursFeries());
    };

    const handleSubmitEdit = () => {
        if (!joursFeriesEdit.dateFerie || !joursFeriesEdit.libelle) {
            showToast('warn', 'Attention', 'Veuillez remplir la date et le libellé.');
            return;
        }
        setBtnLoading(true);
        fetchData(joursFeriesEdit, 'Put', buildApiUrl(`/jour-feries/update/${joursFeriesEdit.jourFerieId}`), 'updateJoursFeries');
    };

    const handleDelete = (id: number) => {
        setBtnLoading(true);
        fetchData(null, 'Delete', buildApiUrl(`/jour-feries/delete/${id}`), 'deleteJoursFeries');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateJoursFeries')
                showToast('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateJoursFeries')
                showToast('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            showToast('warn', 'Attention', 'Impossible de charger la liste des jours fériés.');
        else if (data !== null && error === null) {
            if (callType === 'createJoursFeries') {
                setJoursFeries(new JoursFeries());
                showToast('success', 'Succès', 'Le jour férié a été enregistré avec succès.');
            } else if (callType === 'updateJoursFeries') {
                showToast('success', 'Succès', 'Le jour férié a été modifié avec succès.');
                setJoursFeriesEdit(new JoursFeries());
                setEditJoursFeriesDialog(false);
                loadAllData();
            } else if (callType === 'deleteJoursFeries') {
                showToast('success', 'Succès', 'Le jour férié a été supprimé avec succès.');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setGlobalFilter('');
    };

    const loadJoursFeriesToEdit = (data: JoursFeries) => {
        if (data) {
            setEditJoursFeriesDialog(true);
            setJoursFeriesEdit(data);
        }
    };

    const formatDateForDisplay = (dateStr: string): string => {
        if (!dateStr) return '';
        const date = stringToDate(dateStr);
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const dateBodyTemplate = (rowData: JoursFeries): React.ReactNode => {
        return formatDateForDisplay(rowData.dateFerie);
    };

    const optionButtons = (data: JoursFeries): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadJoursFeriesToEdit(data)} raised severity='warning' />
                <Button icon="pi pi-trash" onClick={() => data.jourFerieId && handleDelete(data.jourFerieId)} raised severity='danger' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/jour-feries/findall'), 'loadJoursFeries');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={clearFilter}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher"
                    className="w-full"
                />
            </span>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog header="Modifier Jour Férié" visible={editJoursFeriesDialog} style={{ width: '50vw' }} modal onHide={() => setEditJoursFeriesDialog(false)}>
                <JoursFeriesForm joursFeries={joursFeriesEdit} handleChange={handleChangeEdit} handleDateChange={handleDateChangeEdit} />
                <div className="flex justify-content-end mt-3">
                    <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <JoursFeriesForm joursFeries={joursFeries} handleChange={handleChange} handleDateChange={handleDateChange} />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setJoursFeries(new JoursFeries())} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={loading} onClick={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable value={joursFeriesList} header={renderSearch} emptyMessage={"Pas de jour férié à afficher"} globalFilter={globalFilter}>
                                    <Column field="dateFerie" header="Date" body={dateBodyTemplate} sortable />
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column field="description" header="Description" />
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

export default JoursFeriesComponent;
