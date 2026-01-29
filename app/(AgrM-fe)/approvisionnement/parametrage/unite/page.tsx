'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkUnite } from './StkUnite';
import StkUniteForm from './StkUniteForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkUniteComponent() {
    const [stkUnite, setStkUnite] = useState<StkUnite>(new StkUnite());
    const [stkUniteEdit, setStkUniteEdit] = useState<StkUnite>(new StkUnite());
    const [editStkUniteDialog, setEditStkUniteDialog] = useState(false);
    const [stkUnites, setStkUnites] = useState<StkUnite[]>([]);
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
            if (callType === 'loadStkUnites') {
                setStkUnites(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkUnite((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkUniteEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkUnite);
        fetchData(stkUnite, 'Post', `${API_BASE_URL}/unites/new`, 'createStkUnite');
        setStkUnite(new StkUnite());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkUniteEdit);
        fetchData(stkUniteEdit, 'Put', `${API_BASE_URL}/unites/update/` + stkUniteEdit.uniteId, 'updateStkUnite');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkUnite')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateStkUnite')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des unités.');
        else if (data !== null && error === null) {
            if (callType === 'createStkUnite') {
                setStkUnite(new StkUnite());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateStkUnite') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setStkUniteEdit(new StkUnite());
                setEditStkUniteDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStkUnite = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadStkUniteToEdit = (data: StkUnite) => {
        if (data) {
            setEditStkUniteDialog(true);
            console.log("id Unité " + data.uniteId);
            setStkUniteEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStkUniteToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/unites/findall`, 'loadStkUnites');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterStkUnite} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Unité" visible={editStkUniteDialog} style={{ width: '30vw' }} modal onHide={() => setEditStkUniteDialog(false)}>
            <StkUniteForm stkUnite={stkUniteEdit as StkUnite} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <StkUniteForm stkUnite={stkUnite as StkUnite} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setStkUnite(new StkUnite())} />
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
                            <DataTable value={stkUnites} header={renderSearch} emptyMessage={"Pas d'unités à afficher"}>
                                <Column field="uniteId" header="ID Unité" />
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

export default StkUniteComponent;