// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkExercice } from './StkExercice';
import StkExerciceForm from './StkExerciceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

function StkExerciceComponent() {
    const [stkExercice, setStkExercice] = useState<StkExercice>(new StkExercice());
    const [stkExerciceEdit, setStkExerciceEdit] = useState<StkExercice>(new StkExercice());
    const [editStkExerciceDialog, setEditStkExerciceDialog] = useState(false);
    const [stkExercices, setStkExercices] = useState<StkExercice[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
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
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/auth/login2';
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadStkExercices') {
                setStkExercices(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkExercice((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkExerciceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (name: string, value: string) => {
        setStkExercice((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: string) => {
        setStkExerciceEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkExercice);
        fetchData(stkExercice, 'Post', 'http://localhost:8080/stkExercices/new', 'createStkExercice');
        setStkExercice(new StkExercice());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkExerciceEdit);
        fetchData(stkExerciceEdit, 'Put', 'http://localhost:8080/stkExercices/update/' + stkExerciceEdit.exerciceId, 'updateStkExercice');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkExercice')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateStkExercice')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des exercices.');
        else if (data !== null && error === null) {
            if (callType === 'createStkExercice') {
                setStkExercice(new StkExercice());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateStkExercice') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setStkExerciceEdit(new StkExercice());
                setEditStkExerciceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStkExercice = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadStkExerciceToEdit = (data: StkExercice) => {
        if (data) {
            setEditStkExerciceDialog(true);
            console.log("id StkExercice " + data.exerciceId);
            setStkExerciceEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStkExerciceToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', 'http://localhost:8080/stkExercices/findall', 'loadStkExercices');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterStkExercice} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Exercice" visible={editStkExerciceDialog} style={{ width: '50vw' }} modal onHide={() => setEditStkExerciceDialog(false)}>
            <StkExerciceForm 
                stkExercice={stkExerciceEdit as StkExercice} 
                handleChange={handleChangeEdit} 
                handleDateChange={handleDateChangeEdit} 
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <StkExerciceForm 
                    stkExercice={stkExercice as StkExercice} 
                    handleChange={handleChange} 
                    handleDateChange={handleDateChange} 
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setStkExercice(new StkExercice())} />
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
                            <DataTable value={stkExercices} header={renderSearch} emptyMessage={"Pas d'exercice à afficher"}>
                                <Column field="exerciceId" header="ID Exercice" />
                                <Column field="libelle" header="Libellé" />
                                <Column field="annee" header="Année" />
                                <Column field="magasinId" header="Magasin" />
                                <Column field="dateDebut" header="Date Début" />
                                <Column field="dateFin" header="Date Fin" />
                                <Column field="dateOuverture" header="Date d'ouverture" />
                                <Column field="dateCloture" header="Date de Cloture" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkExerciceComponent;