'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Notation } from './Notation';
import NotationForm from './NotationForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';


function NotationComponent() {

    const [notation, setNotation] = useState<Notation>(new Notation());
    const [notationEdit, setNotationEdit] = useState<Notation>(new Notation());
    const [editNotationDialog, setEditNotationDialog] = useState(false);
    const [notations, setNotations] = useState<Notation[]>([]);
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
        if (data) {
           
            if (callType === 'loadNotations') {
                setNotations(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotation((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNotationEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setNotation((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setNotationEdit((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setNotation((prev) => ({ ...prev, [name]: value }));
    };

    const handleDropdownChangeEdit = (name: string, value: any) => {
        setNotationEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', notation);
        fetchData(notation, 'Post', buildApiUrl('/api/notations/new'), 'createNotation');
        setNotation(new Notation());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', notationEdit);
        fetchData(notationEdit, 'Put', buildApiUrl(`/api/notations/update/${notationEdit.notationId}`), 'updateNotation');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateNotation')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateNotation')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des notations.');
        else if (data !== null && error === null) {
            if (callType === 'createNotation') {
                setNotation(new Notation());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if(callType === 'updateNotation') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setNotationEdit(new Notation());
                setEditNotationDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterNotation = () => {

    }

    const loadNotationToEdit = (data: Notation) => {
        if (data) {
            setEditNotationDialog(true);
            console.log(" id Notation " + data.notationId);
            setNotationEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadNotationToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/notations/findall'), 'loadNotations');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatNumber = (value: number, decimals: number = 2) => {
        return value?.toFixed(decimals) || '0.00';
    };

    const limite1BodyTemplate = (rowData: Notation) => {
        return formatNumber(rowData.limite1, 2);
    };

    const limite2BodyTemplate = (rowData: Notation) => {
        return formatNumber(rowData.limite2, 2);
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
        <Dialog header="Modifier Notation" visible={editNotationDialog} style={{ width: '60vw' }} modal onHide={() => setEditNotationDialog(false)}>
            <NotationForm 
                notation={notationEdit as Notation} 
                handleChange={handleChangeEdit} 
                handleNumberChange={handleNumberChangeEdit}
                handleDropdownChange={handleDropdownChangeEdit}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <NotationForm 
                    notation={notation as Notation} 
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                    handleDropdownChange={handleDropdownChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setNotation(new Notation())} />
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
                            <DataTable value={notations} header={renderSearch} emptyMessage={"Pas de notation à afficher"} globalFilter={globalFilter}>
                                <Column field="notationId" header="Code" />
                                <Column field="statut" header="Statut" />
                                <Column field="notations" header="Notation" />
                                <Column field="nbreEchelonGagne" header="Nb Échelon" />
                                <Column field="anale" header="Anale" />
                                <Column header="De" body={limite1BodyTemplate} />
                                <Column header="A" body={limite2BodyTemplate} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default NotationComponent;