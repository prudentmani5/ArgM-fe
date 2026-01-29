// page.tsx
'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkTypeMvt } from './StkTypeMvt';
import StkTypeMvtForm from './StkTypeMvtForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkTypeMvtComponent() {
    const [stkTypeMvt, setStkTypeMvt] = useState<StkTypeMvt>(new StkTypeMvt());
    const [stkTypeMvtEdit, setStkTypeMvtEdit] = useState<StkTypeMvt>(new StkTypeMvt());
    const [editStkTypeMvtDialog, setEditStkTypeMvtDialog] = useState(false);
    const [stkTypeMvts, setStkTypeMvts] = useState<StkTypeMvt[]>([]);
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
            if (callType === 'loadStkTypeMvts') {
                setStkTypeMvts(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkTypeMvt((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkTypeMvtEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkTypeMvt);
        fetchData(stkTypeMvt, 'Post', `${API_BASE_URL}/typeMvts/new`, 'createStkTypeMvt');
        setStkTypeMvt(new StkTypeMvt());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', stkTypeMvtEdit);
        fetchData(stkTypeMvtEdit, 'Put', `${API_BASE_URL}/typeMvts/update/` + stkTypeMvtEdit.typeMvtId, 'updateStkTypeMvt');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateStkTypeMvt')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateStkTypeMvt')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des types de mouvements.');
        else if (data !== null && error === null) {
            if (callType === 'createStkTypeMvt') {
                setStkTypeMvt(new StkTypeMvt());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateStkTypeMvt') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setStkTypeMvtEdit(new StkTypeMvt());
                setEditStkTypeMvtDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStkTypeMvt = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadStkTypeMvtToEdit = (data: StkTypeMvt) => {
        if (data) {
            setEditStkTypeMvtDialog(true);
            console.log("id Type Mouvement " + data.typeMvtId);
            setStkTypeMvtEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadStkTypeMvtToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/typeMvts/findall`, 'loadStkTypeMvts');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterStkTypeMvt} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Type Mouvement" visible={editStkTypeMvtDialog} style={{ width: '30vw' }} modal onHide={() => setEditStkTypeMvtDialog(false)}>
            <StkTypeMvtForm stkTypeMvt={stkTypeMvtEdit as StkTypeMvt} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <StkTypeMvtForm stkTypeMvt={stkTypeMvt as StkTypeMvt} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setStkTypeMvt(new StkTypeMvt())} />
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
                            <DataTable value={stkTypeMvts} header={renderSearch} emptyMessage={"Pas de types de mouvements à afficher"}>
                                <Column field="typeMvtId" header="Code" />
                                <Column field="libelle" header="Libellé" />
                                <Column field="sens" header="Sens" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default StkTypeMvtComponent;