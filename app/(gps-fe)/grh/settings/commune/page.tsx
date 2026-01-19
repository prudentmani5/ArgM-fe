'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Commune } from './Commune';
import { Province } from '../province/Province';
import CommuneForm from './CommuneForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';


function CommuneComponent() {

    const [commune, setCommune] = useState<Commune>(new Commune());
    const [communeEdit, setCommuneEdit] = useState<Commune>(new Commune());
    const [editCommuneDialog, setEditCommuneDialog] = useState(false);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
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
        // Load provinces on component mount
        loadProvinces();
    }, []);

    useEffect(() => {
        if (data) {
           
            if (callType === 'loadCommunes') {
                setCommunes(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadProvinces') {
                setProvinces(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommune((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCommuneEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChange = (e: any) => {
        setCommune((prev) => ({ ...prev, provinceId: e.value }));
    };

    const handleDropdownChangeEdit = (e: any) => {
        setCommuneEdit((prev) => ({ ...prev, provinceId: e.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', commune);
        fetchData(commune, 'Post', buildApiUrl('/api/communes/new'), 'createCommune');
        setCommune(new Commune());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', communeEdit);
        fetchData(communeEdit, 'Put', buildApiUrl(`/api/communes/update/${communeEdit.communeId}`), 'updateCommune');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateCommune')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateCommune')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des communes.');
        else if (data !== null && error === null) {
            if (callType === 'createCommune') {
                setCommune(new Commune());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if(callType === 'updateCommune') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCommuneEdit(new Commune());
                setEditCommuneDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterCommune = () => {

    }

    const loadCommuneToEdit = (data: Commune) => {
        if (data) {
            setEditCommuneDialog(true);
            console.log(" id Commune " + data.communeId);
            setCommuneEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCommuneToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/communes/findall'), 'loadCommunes');
    }

    const loadProvinces = () => {
        fetchData(null, 'Get', buildApiUrl('/provinces/findall'), 'loadProvinces');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getProvinceName = (provinceId: string) => {
        const province = provinces.find(p => p.provinceId === provinceId);
        return province ? province.nom : provinceId;
    };

    const provinceBodyTemplate = (rowData: Commune) => {
        return getProvinceName(rowData.provinceId);
    };

     const renderSearch = () => (
        <div className="flex justify-content-between align-items-center mb-3">
            <Button
                icon="pi pi-filter-slash"
                label="Effacer filtres"
                outlined
                onClick={() => setGlobalFilter('')}
            />
            <span className="p-input-icon-left" style={{ width: '40%' }}>
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher"
                    className="w-full"
                />
            </span>
        </div>
    );

    return <>
        <Toast ref={toast} />
        <Dialog header="Modifier Commune" visible={editCommuneDialog} style={{ width: '50vw' }} modal onHide={() => setEditCommuneDialog(false)}>
            <CommuneForm 
                commune={communeEdit as Commune} 
                provinces={provinces}
                handleChange={handleChangeEdit} 
                handleDropdownChange={handleDropdownChangeEdit}
            />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <CommuneForm 
                    commune={commune as Commune} 
                    provinces={provinces}
                    handleChange={handleChange}
                    handleDropdownChange={handleDropdownChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setCommune(new Commune())} />
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
                            <DataTable value={communes} header={renderSearch} emptyMessage={"Pas de commune à afficher"} globalFilter={globalFilter}>
                                <Column field="communeId" header="Code" />
                                <Column header="Nom" field="nom" />
                                <Column header="Province" body={provinceBodyTemplate} />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default CommuneComponent;