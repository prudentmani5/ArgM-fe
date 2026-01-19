'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkSousCategorie } from './StkSousCategorie';
import StkSousCategorieForm from './StkSousCategorieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkSousCategorieComponent() {
    const [stkSousCategorie, setStkSousCategorie] = useState<StkSousCategorie>(new StkSousCategorie());
    const [stkSousCategorieEdit, setStkSousCategorieEdit] = useState<StkSousCategorie>(new StkSousCategorie());
    const [editStkSousCategorieDialog, setEditStkSousCategorieDialog] = useState(false);
    const [stkSousCategories, setStkSousCategories] = useState<StkSousCategorie[]>([]);
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
            window.location.href = '/auth/login2'; // redirect to login if not logged in
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadStkSousCategories') {
                setStkSousCategories(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkSousCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkSousCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkSousCategorie);
        fetchData(stkSousCategorie, 'Post', `${API_BASE_URL}/sousCategories/new`, 'createStkSousCategorie');
        setStkSousCategorie(new StkSousCategorie());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkSousCategorieEdit);
        fetchData(stkSousCategorieEdit, 'Put', `${API_BASE_URL}/sousCategories/update/` + stkSousCategorieEdit.sousCategorieId, 'updateStkSousCategorie');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkSousCategorie')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateStkSousCategorie')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des sous-catégories.');
        else if (data !== null && error === null) {
            if (callType === 'createStkSousCategorie') {
                setStkSousCategorie(new StkSousCategorie());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateStkSousCategorie') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setStkSousCategorieEdit(new StkSousCategorie());
                setEditStkSousCategorieDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStkSousCategorie = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadStkSousCategorieToEdit = (data: StkSousCategorie) => {
        if (data) {
            setEditStkSousCategorieDialog(true);
            console.log("id Sous-Catégorie " + data.sousCategorieId);
            setStkSousCategorieEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStkSousCategorieToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/sousCategories/findall`, 'loadStkSousCategories');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterStkSousCategorie} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Sous-Catégorie" visible={editStkSousCategorieDialog} style={{ width: '30vw' }} modal onHide={() => setEditStkSousCategorieDialog(false)}>
            <StkSousCategorieForm stkSousCategorie={stkSousCategorieEdit as StkSousCategorie} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <StkSousCategorieForm stkSousCategorie={stkSousCategorie as StkSousCategorie} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setStkSousCategorie(new StkSousCategorie())} />
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
                            <DataTable value={stkSousCategories} header={renderSearch} emptyMessage={"Pas de sous-catégories à afficher"}>
                                <Column field="sousCategorieId" header="ID Sous-Catégorie" />
                                <Column field="categorieId" header="ID Catégorie" />
                                <Column field="magasinId" header="ID Magasin" />
                                <Column field="libelle" header="Libellé" />
                                <Column field="compte" header="Compte" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkSousCategorieComponent;