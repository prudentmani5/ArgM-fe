// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkFrais } from './StkFrais';
import StkFraisForm from './StkFraisForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkFraisComponent() {
    const [frais, setFrais] = useState<StkFrais>(new StkFrais());
    const [fraisEdit, setFraisEdit] = useState<StkFrais>(new StkFrais());
    const [editFraisDialog, setEditFraisDialog] = useState(false);
    const [fraisList, setFraisList] = useState<StkFrais[]>([]);
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
            if (callType === 'loadFrais') {
                setFraisList(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFrais(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', frais);
        fetchData(frais, 'Post', `${API_BASE_URL}/stkfrais/new`, 'createFrais');
        setFrais(new StkFrais());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', fraisEdit);
        fetchData(fraisEdit, 'Put', `${API_BASE_URL}/stkfrais/update/` + fraisEdit.FraisId, 'updateFrais');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFrais')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateFrais')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des frais.');
        else if (data !== null && error === null) {
            if (callType === 'createFrais') {
                setFrais(new StkFrais());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateFrais') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setFraisEdit(new StkFrais());
                setEditFraisDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFrais = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadFraisToEdit = (data: StkFrais) => {
        if (data) {
            const fraisToEdit = new StkFrais();
        fraisToEdit.FraisId = data.FraisId;
        fraisToEdit.libelle = data.libelle;
            // Crée une nouvelle instance avec toutes les propriétés copiées
            setFraisEdit({ ...data });
            setEditFraisDialog(true);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFraisToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/stkfrais/findall`, 'loadFrais');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFrais} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFraisEdit(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Frais" 
            visible={editFraisDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditFraisDialog(false)}
        >
            <StkFraisForm 
                frais={fraisEdit} 
                handleChange={handleChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditFraisDialog(false)} 
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
                <StkFraisForm 
                    frais={frais} 
                    handleChange={handleChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setFrais(new StkFrais())} />
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
                            <DataTable value={fraisList} header={renderSearch} emptyMessage={"Pas de frais à afficher"}>
                                <Column field="FraisId" header="ID Frais" />
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

export default StkFraisComponent;