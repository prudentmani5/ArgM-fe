// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Stkservice } from './Stkservice';
import StkserviceForm from './StkserviceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkserviceComponent() {
    const [service, setService] = useState<Stkservice>(new Stkservice());
    const [serviceEdit, setServiceEdit] = useState<Stkservice>(new Stkservice());
    const [editServiceDialog, setEditServiceDialog] = useState(false);
    const [services, setServices] = useState<Stkservice[]>([]);
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
            if (callType === 'loadServices') {
                setServices(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setService(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', service);
        fetchData(service, 'Post', `${API_BASE_URL}/services/new`, 'createService');
        setService(new Stkservice());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', serviceEdit);
        fetchData(serviceEdit, 'Put', `${API_BASE_URL}/services/update/` + serviceEdit.serviceId, 'updateService');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateService')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateService')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des services.');
        else if (data !== null && error === null) {
            if (callType === 'createService') {
                setService(new Stkservice());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateService') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setServiceEdit(new Stkservice());
                setEditServiceDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterService = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadServiceToEdit = (data: Stkservice) => {
        if (data) {
            setEditServiceDialog(true);
            console.log("id Service " + data.serviceId);
            setServiceEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadServiceToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/services/findall`, 'loadServices');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterService} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setServiceEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Service" 
            visible={editServiceDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditServiceDialog(false)}
        >
            <StkserviceForm 
                service={serviceEdit} 
                handleChange={handleChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditServiceDialog(false)} 
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
                <StkserviceForm 
                    service={service} 
                    handleChange={handleChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setService(new Stkservice())} />
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
                            <DataTable value={services} header={renderSearch} emptyMessage={"Pas de service à afficher"}>
                                <Column field="serviceId" header="ID Service" />
                                <Column field="libelle" header="Libellé" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkserviceComponent;