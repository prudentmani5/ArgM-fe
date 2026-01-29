// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkDestination } from './StkDestination';
import StkDestinationForm from './StkDestinationForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkDestinationComponent() {
    const [destination, setDestination] = useState<StkDestination>(new StkDestination());
    const [destinationEdit, setDestinationEdit] = useState<StkDestination>(new StkDestination());
    const [editDestinationDialog, setEditDestinationDialog] = useState(false);
    const [destinations, setDestinations] = useState<StkDestination[]>([]);
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
            if (callType === 'loadDestinations') {
                setDestinations(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDestination(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', destination);
        fetchData(destination, 'Post', `${API_BASE_URL}/destinations/new`, 'createDestination');
        setDestination(new StkDestination());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', destinationEdit);
        fetchData(destinationEdit, 'Put', `${API_BASE_URL}/destinations/update/` + destinationEdit.pDestinationId, 'updateDestination');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateDestination')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateDestination')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des destinations.');
        else if (data !== null && error === null) {
            if (callType === 'createDestination') {
                setDestination(new StkDestination());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateDestination') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setDestinationEdit(new StkDestination());
                setEditDestinationDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterDestination = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadDestinationToEdit = (data: StkDestination) => {
        if (data) {
            setEditDestinationDialog(true);
            console.log("ID Destination " + data.pDestinationId);
            setDestinationEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadDestinationToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/destinations/findall`, 'loadDestinations');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterDestination} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDestinationEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Destination" 
            visible={editDestinationDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditDestinationDialog(false)}
        >
            <StkDestinationForm 
                destination={destinationEdit} 
                handleChange={handleChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditDestinationDialog(false)} 
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
                <StkDestinationForm 
                    destination={destination} 
                    handleChange={handleChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setDestination(new StkDestination())} />
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
                            <DataTable value={destinations} header={renderSearch} emptyMessage={"Pas de destination à afficher"}>
                                <Column field="pDestinationId" header="ID Destination" />
                                <Column field="pLibelle" header="Libellé" />
                                <Column field="pCompte" header="Compte" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkDestinationComponent;