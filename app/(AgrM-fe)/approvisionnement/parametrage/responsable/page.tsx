// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkResponsable } from './StkResponsable';
import StkResponsableForm from './StkResponsableForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkResponsableComponent() {
    const [responsable, setResponsable] = useState<StkResponsable>(new StkResponsable());
    const [responsableEdit, setResponsableEdit] = useState<StkResponsable>(new StkResponsable());
    const [editResponsableDialog, setEditResponsableDialog] = useState(false);
    const [responsables, setResponsables] = useState<StkResponsable[]>([]);
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
            if (callType === 'loadResponsables') {
                setResponsables(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResponsable(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', responsable);
        fetchData(responsable, 'Post', `${API_BASE_URL}/responsables/new`, 'createResponsable');
        setResponsable(new StkResponsable());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', responsableEdit);
        fetchData(responsableEdit, 'Put', `${API_BASE_URL}/responsables/update/` + responsableEdit.responsableId, 'updateResponsable');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateResponsable')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateResponsable')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des responsables.');
        else if (data !== null && error === null) {
            if (callType === 'createResponsable') {
                setResponsable(new StkResponsable());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateResponsable') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setResponsableEdit(new StkResponsable());
                setEditResponsableDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterResponsable = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadResponsableToEdit = (data: StkResponsable) => {
        if (data) {
            setEditResponsableDialog(true);
            console.log("id Responsable " + data.responsableId);
            setResponsableEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadResponsableToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/responsables/findall`, 'loadResponsables');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterResponsable} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setResponsableEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Responsable" 
            visible={editResponsableDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditResponsableDialog(false)}
        >
            <StkResponsableForm 
                responsable={responsableEdit} 
                handleChange={handleChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditResponsableDialog(false)} 
                    className="p-button-text" 
                />
                <Button 
                    icon="pi pi-check" 
                    label="Modifier" 
                    loading={btnLoading} 
                    onClick={handleSubmitEdit} 
                />
            </div>
        </Dialog>

        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <StkResponsableForm 
                    responsable={responsable} 
                    handleChange={handleChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setResponsable(new StkResponsable())} />
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
                            <DataTable value={responsables} header={renderSearch} emptyMessage={"Pas de responsable à afficher"}>
                                <Column field="responsableId" header="ID Responsable" />
                                <Column field="nom" header="Nom" />
                                <Column field="adresse" header="Adresse" />
                                <Column field="email" header="Email" />
                                <Column field="tel" header="Téléphone" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkResponsableComponent;