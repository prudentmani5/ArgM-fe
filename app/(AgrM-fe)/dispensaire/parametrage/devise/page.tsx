// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Devise } from './Devise';
import DeviseForm from './DeviseForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function DeviseComponent() {
    const [devise, setDevise] = useState<Devise>(new Devise());
    const [deviseEdit, setDeviseEdit] = useState<Devise>(new Devise());
    const [editDeviseDialog, setEditDeviseDialog] = useState(false);
    const [devises, setDevises] = useState<Devise[]>([]);
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
            if (callType === 'loadDevises') {
                setDevises(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDevise(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name: keyof Devise, value: number | null) => {
        setDevise(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', devise);
        fetchData(devise, 'Post', `${API_BASE_URL}/devises/new`, 'createDevise');
        setDevise(new Devise());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', deviseEdit);
        fetchData(deviseEdit, 'Put', `${API_BASE_URL}/devises/update/` + deviseEdit.deviseId, 'updateDevise');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateDevise')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateDevise')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des devises.');
        else if (data !== null && error === null) {
            if (callType === 'createDevise') {
                setDevise(new Devise());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateDevise') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setDeviseEdit(new Devise());
                setEditDeviseDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterDevise = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadDeviseToEdit = (data: Devise) => {
    if (data) {
        // Créez un nouvel objet avec toutes les propriétés
        setDeviseEdit({
            deviseId: data.deviseId,
            LibelleDevise: data.LibelleDevise || '',
            Symbole: data.Symbole || '',
            TauxChange: data.TauxChange || null
        });
        setEditDeviseDialog(true);
    }
};

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadDeviseToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/devises/findall`, 'loadDevises');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterDevise} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeviseEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChangeEdit = (name: keyof Devise, value: number | null) => {
        setDeviseEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Devise" 
            visible={editDeviseDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditDeviseDialog(false)}
        >
            <DeviseForm 
                devise={deviseEdit} 
                handleChange={handleChangeEdit}
                handleNumberChange={handleNumberChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditDeviseDialog(false)} 
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
                <DeviseForm 
                    devise={devise} 
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setDevise(new Devise())} />
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
                            <DataTable value={devises} header={renderSearch} emptyMessage={"Pas de devise à afficher"}>
                                <Column field="deviseId" header="ID Devise" />
                                <Column field="LibelleDevise" header="Libellé" />
                                <Column field="Symbole" header="Symbole" />
                                <Column field="TauxChange" header="Taux de Change" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default DeviseComponent;