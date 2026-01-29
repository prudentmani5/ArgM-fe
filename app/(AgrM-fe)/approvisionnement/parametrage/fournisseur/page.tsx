// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Fournisseur } from './Fournisseur';
import FournisseurForm from './FournisseurForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function FournisseurComponent() {
    const [fournisseur, setFournisseur] = useState<Fournisseur>(new Fournisseur());
    const [fournisseurEdit, setFournisseurEdit] = useState<Fournisseur>(new Fournisseur());
    const [editFournisseurDialog, setEditFournisseurDialog] = useState(false);
    const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
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
            if (callType === 'loadFournisseurs') {
                setFournisseurs(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFournisseur(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
};



    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', fournisseur);
        fetchData(fournisseur, 'Post', `${API_BASE_URL}/fournisseurs/new`, 'createFournisseur');
        setFournisseur(new Fournisseur());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', fournisseurEdit);
        fetchData(fournisseurEdit, 'Put', `${API_BASE_URL}/fournisseurs/update/` + fournisseurEdit.fournisseurId, 'updateFournisseur');
    };

    const handleCheckboxChange = (name: keyof Fournisseur, checked: boolean) => {
    setFournisseur(prev => ({
        ...prev,
        [name]: checked
    }));
};

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFournisseur')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateFournisseur')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des fournisseurs.');
        else if (data !== null && error === null) {
            if (callType === 'createFournisseur') {
                setFournisseur(new Fournisseur());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateFournisseur') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setFournisseurEdit(new Fournisseur());
                setEditFournisseurDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFournisseur = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadFournisseurToEdit = (data: Fournisseur) => {
        if (data) {
            setEditFournisseurDialog(true);
            console.log("id Fournisseur " + data.fournisseurId);
            setFournisseurEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFournisseurToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/fournisseurs/findall`, 'loadFournisseurs');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFournisseur} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    const handleCheckboxChangeEdit = (name: keyof Fournisseur, checked: boolean) => {
        setFournisseurEdit(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFournisseurEdit(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
};

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Fournisseur" 
            visible={editFournisseurDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditFournisseurDialog(false)}
        >
            <FournisseurForm 
                fournisseur={fournisseurEdit} 
                handleChange={handleChangeEdit} 
                handleCheckboxChange={handleCheckboxChangeEdit} 
            />
            <div className="flex justify-content-end gap-2 mt-4">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditFournisseurDialog(false)} 
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
                <FournisseurForm 
                     fournisseur={fournisseur} 
                    handleChange={handleChange} 
                    handleCheckboxChange={handleCheckboxChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setFournisseur(new Fournisseur())} />
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
                            <DataTable value={fournisseurs} header={renderSearch} emptyMessage={"Pas de fournisseur à afficher"}>
                                <Column field="fournisseurId" header="ID Fournisseur" />
                                <Column field="nom" header="Nom" />
                                <Column field="adresse" header="Adresse" />
                                <Column field="tel" header="Téléphone" />
                                <Column field="email" header="Email" />
                                <Column field="local" header="Local" body={(data) => data.local ? 'Oui' : 'Non'} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default FournisseurComponent;