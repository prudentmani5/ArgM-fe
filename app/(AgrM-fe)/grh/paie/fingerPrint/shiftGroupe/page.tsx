'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { ShiftGroupe } from './ShiftGroupe';
import ShiftGroupeForm from './ShiftGroupeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';


function ShiftGroupeComponent() {

    const [shiftGroupe, setShiftGroupe] = useState<ShiftGroupe>(new ShiftGroupe());
    const [shiftGroupeEdit, setShiftGroupeEdit] = useState<ShiftGroupe>(new ShiftGroupe());
    const [editShiftGroupeDialog, setEditShiftGroupeDialog] = useState(false);
    const [shiftGroupes, setShiftGroupes] = useState<ShiftGroupe[]>([]);
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
           
            if (callType === 'loadShiftGroupes') {
                setShiftGroupes(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShiftGroupe((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShiftGroupeEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', shiftGroupe);
        fetchData(shiftGroupe, 'Post', `${API_BASE_URL}/shift-groupes/new`, 'createShiftGroupe');
        setShiftGroupe(new ShiftGroupe());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', shiftGroupeEdit);
        fetchData(shiftGroupeEdit, 'Put', `${API_BASE_URL}/shift-groupes/update/` + shiftGroupeEdit.groupeId, 'updateShiftGroupe');
    }

    const handleAfterApiCall = (chosenTab: number) => {

        if (error !== null && chosenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateShiftGroupe')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateShiftGroupe')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des groupes de quart.');
        else if (data !== null && error === null) {
            if (callType === 'createShiftGroupe') {
                setShiftGroupe(new ShiftGroupe());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if(callType === 'updateShiftGroupe') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setShiftGroupeEdit(new ShiftGroupe());
                setEditShiftGroupeDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterShiftGroupe = () => {
        setGlobalFilter('');
    }

    const loadShiftGroupeToEdit = (data: ShiftGroupe) => {
        if (data) {
            setEditShiftGroupeDialog(true);
            console.log(" id ShiftGroupe " + data.groupeId);
            setShiftGroupeEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadShiftGroupeToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/shift-groupes/findall`, 'loadShiftGroupes');
    }

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
                onClick={() => clearFilterShiftGroupe()}
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
        <Dialog header="Modifier Groupe de Quart" visible={editShiftGroupeDialog} style={{ width: '30vw' }} modal onHide={() => setEditShiftGroupeDialog(false)}>
            <ShiftGroupeForm shiftGroupe={shiftGroupeEdit as ShiftGroupe} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <ShiftGroupeForm shiftGroupe={shiftGroupe as ShiftGroupe} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setShiftGroupe(new ShiftGroupe())} />
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
                                value={shiftGroupes} 
                                header={renderSearch} 
                                emptyMessage={"Pas de groupes de quart à afficher"}
                                globalFilter={globalFilter}
                                paginator 
                                rows={10}
                                rowsPerPageOptions={[10, 20, 30]}
                            >
                                <Column field="groupeId" header="Code" sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column field="heureDebut" header="Heure Début" sortable />
                                <Column field="heureFin" header="Heure Fin" sortable />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default ShiftGroupeComponent;