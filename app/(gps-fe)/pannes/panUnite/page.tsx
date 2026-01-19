'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { PanUnite } from './PanUnite';
import PanUniteForm from './PanUniteForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PanUniteComponent() {
    const [panUnite, setPanUnite] = useState<PanUnite>(new PanUnite());
    const [panUniteEdit, setPanUniteEdit] = useState<PanUnite>(new PanUnite());
    const [editPanUniteDialog, setEditPanUniteDialog] = useState(false);
    const [panUnites, setPanUnites] = useState<PanUnite[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

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
            if (callType === 'loadPanUnites') {
                setPanUnites(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPanUnite((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPanUniteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        const panUniteToSend = { ...panUnite, uniteId: null };
        fetchData(panUniteToSend, 'POST', `${API_BASE_URL}/panUnites/new`, `createPanUnite`);
    }

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(panUniteEdit, 'PUT', `${API_BASE_URL}/panUnites/update/${panUniteEdit.uniteId}`, 'updatePanUnite');
    }

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updatePanUnite')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updatePanUnite')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des unités.');
        else if (data !== null && error === null) {
            if (callType === 'createPanUnite') {
                setPanUnite(new PanUnite());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updatePanUnite') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setPanUniteEdit(new PanUnite());
                setEditPanUniteDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterPanUnite = () => {
        setGlobalFilter('');
    }

    const loadPanUniteToEdit = (data: PanUnite) => {
        if (data) {
            setEditPanUniteDialog(true);
            setPanUniteEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadPanUniteToEdit(data)} raised severity='warning' />
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/panUnites/findall`, `loadPanUnites`);
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const filteredData = panUnites.filter(item => {
        return JSON.stringify({
            designationUnite: item.designationUnite || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterPanUnite} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher unité"
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Unité" visible={editPanUniteDialog} style={{ width: '30vw' }} modal onHide={() => setEditPanUniteDialog(false)}>
            <PanUniteForm panUnite={panUniteEdit} handleChange={handleChangeEdit} />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button label="Annuler" icon="pi pi-times" onClick={() => setEditPanUniteDialog(false)} className="p-button-text" />
                <Button label="Modifier" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
            </div>
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <PanUniteForm panUnite={panUnite} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setPanUnite(new PanUnite())} />
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
                                value={filteredData} 
                                header={renderSearch}
                                emptyMessage={"Pas d'unités à afficher"}
                                filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                paginator rows={10}
                            >
                                <Column field="uniteId" header="ID" sortable />
                                <Column field="designationUnite" header="Désignation" sortable />
                                <Column header="Actions" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default PanUniteComponent;