// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Magasin } from './Magasin';
import MagasinForm from './MagasinForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputNumber } from 'primereact/inputnumber';
import { API_BASE_URL } from '@/utils/apiConfig';

function MagasinComponent() {
    const [magasin, setMagasin] = useState<Magasin>(new Magasin());
    const [magasinEdit, setMagasinEdit] = useState<Magasin>(new Magasin());
    const [editMagasinDialog, setEditMagasinDialog] = useState(false);
    const [magasins, setMagasins] = useState<Magasin[]>([]);
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
            if (callType === 'loadMagasins') {
                setMagasins(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMagasin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChange = (name: keyof Magasin, value: number | null) => {
        setMagasin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (name: keyof Magasin, checked: boolean) => {
        setMagasin(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', magasin);
        fetchData(magasin, 'Post', `${API_BASE_URL}/magasins/new`, 'createMagasin');
        setMagasin(new Magasin());
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMagasinEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNumberChangeEdit = (name: keyof Magasin, value: number | null) => {
        setMagasinEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChangeEdit = (name: keyof Magasin, checked: boolean) => {
        setMagasinEdit(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', magasinEdit);
        fetchData(magasinEdit, 'Put', `${API_BASE_URL}/magasins/update/` + magasinEdit.magasinId, 'updateMagasin');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateMagasin')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateMagasin')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des magasins.');
        else if (data !== null && error === null) {
            if (callType === 'createMagasin') {
                setMagasin(new Magasin());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateMagasin') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setMagasinEdit(new Magasin());
                setEditMagasinDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterMagasin = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadMagasinToEdit = (data: Magasin) => {
        if (data) {
            setEditMagasinDialog(true);
            console.log("id Magasin " + data.magasinId);
            setMagasinEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadMagasinToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/magasins/findall`, 'loadMagasins');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterMagasin} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Magasin" 
            visible={editMagasinDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditMagasinDialog(false)}
        >
            <MagasinForm 
                magasin={magasinEdit} 
                handleChange={handleChangeEdit} 
                handleCheckboxChange={handleCheckboxChangeEdit}
                handleNumberChange={handleNumberChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditMagasinDialog(false)} 
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
                <MagasinForm 
                    magasin={magasin} 
                    handleChange={handleChange} 
                    handleCheckboxChange={handleCheckboxChange}
                    handleNumberChange={handleNumberChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setMagasin(new Magasin())} />
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
                            <DataTable value={magasins} header={renderSearch} emptyMessage={"Pas de magasin à afficher"}>
                                <Column field="magasinId" header="ID Magasin" />
                                <Column field="nom" header="Nom" />
                                <Column field="adresse" header="Adresse" />
                                <Column field="type" header="Type" />
                                <Column field="pointVente" header="Point de vente" body={(data) => data.pointVente ? 'Oui' : 'Non'} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default MagasinComponent;