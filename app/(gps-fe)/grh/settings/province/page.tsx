'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Province } from './Province';
import ProvinceForm from './ProvinceForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';


function ProvinceComponent() {

    const [province, setProvince] = useState<Province>(new Province());
    const [provinceEdit, setProvinceEdit] = useState<Province>(new Province());
    const [editProvinceDialog, setEditProvinceDialog] = useState(false);
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
        if (data) {
           
            if (callType === 'loadProvinces') {
                setProvinces(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProvince((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProvinceEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', province);
        fetchData(province, 'Post', buildApiUrl('/api/provinces/new'), 'createProvince');
        setProvince(new Province());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', provinceEdit);
        fetchData(provinceEdit, 'Put', buildApiUrl(`/api/provinces/update/${provinceEdit.provinceId}`), 'updateProvince');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateProvince')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateProvince')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des provinces.');
        else if (data !== null && error === null) {
            if (callType === 'createProvince') {
                setProvince(new Province());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateProvince') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setProvinceEdit(new Province());
                setEditProvinceDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterProvince = () => {

    }

    const loadProvinceToEdit = (data: Province) => {
        if (data) {
            setEditProvinceDialog(true);
            console.log(" id Province " + data.provinceId);
            setProvinceEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadProvinceToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/provinces/findall'), 'loadProvinces');
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {

        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
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
        <Dialog header="Modifier Province" visible={editProvinceDialog} style={{ width: '30vw' }} modal onHide={() => setEditProvinceDialog(false)}>
            <ProvinceForm province={provinceEdit as Province} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <ProvinceForm province={province as Province} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={() => setProvince(new Province())} />
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
                            <DataTable value={provinces} header={renderSearch} emptyMessage={"Pas de province à afficher"}>
                                <Column field="provinceId" header="Code" />
                                <Column header="Nom" field="nom" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default ProvinceComponent;