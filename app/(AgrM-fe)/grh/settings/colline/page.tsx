'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Colline } from './Colline';
import { Commune } from '../commune/Commune';
import CollineForm from './CollineForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';


function CollineComponent() {

    const [colline, setColline] = useState<Colline>(new Colline());
    const [collineEdit, setCollineEdit] = useState<Colline>(new Colline());
    const [editCollineDialog, setEditCollineDialog] = useState(false);
    const [collines, setCollines] = useState<Colline[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);
    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Load communes on component mount
        loadCommunes();
    }, []);

    useEffect(() => {
        if (data) {
           
            if (callType === 'loadCollines') {
                setCollines(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadCommunes') {
                setCommunes(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColline((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCollineEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (e: any) => {
        setColline((prev) => ({ ...prev, communeId: e.value }));
    };

    const handleDropdownChangeEdit = (e: any) => {
        setCollineEdit((prev) => ({ ...prev, communeId: e.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', colline);
        fetchData(colline, 'Post', `${API_BASE_URL}/api/collines/new`, 'createColline');
        setColline(new Colline());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', collineEdit);
        fetchData(collineEdit, 'Put', `${API_BASE_URL}/api/collines/update/` + collineEdit.collineId, 'updateColline');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateColline')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateColline')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des collines.');
        else if (data !== null && error === null) {
            if (callType === 'createColline') {
                setColline(new Colline());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if(callType === 'updateColline') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCollineEdit(new Colline());
                setEditCollineDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterColline = () => {

    }

    const loadCollineToEdit = (data: Colline) => {
        if (data) {
            setEditCollineDialog(true);
            console.log(" id Colline " + data.collineId);
            setCollineEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCollineToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/collines/findall`, 'loadCollines');
    }

    const loadCommunes = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/communes/findall`, 'loadCommunes');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getCommuneName = (communeId: string) => {
        const commune = communes.find(c => c.communeId === communeId);
        return commune ? commune.nom : communeId;
    };

    const communeBodyTemplate = (rowData: Colline) => {
        return getCommuneName(rowData.communeId);
    };

     const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={() => setGlobalFilter('')}
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

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Colline" visible={editCollineDialog} style={{ width: '50vw' }} modal onHide={() => setEditCollineDialog(false)}>
            <CollineForm 
                colline={collineEdit as Colline} 
                communes={communes}
                handleChange={handleChangeEdit} 
                handleDropdownChange={handleDropdownChangeEdit}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <CollineForm 
                    colline={colline as Colline} 
                    communes={communes}
                    handleChange={handleChange}
                    handleDropdownChange={handleDropdownChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setColline(new Colline())} />
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
                            <DataTable value={collines} header={renderSearch} emptyMessage={"Pas de colline à afficher"} globalFilter={globalFilter}>
                                <Column field="collineId" header="Code" />
                                <Column header="Nom" field="nom" />
                                <Column header="Commune" body={communeBodyTemplate} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default CollineComponent;