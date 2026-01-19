'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Armateur } from './Armateur';
import ArmateurForm from './ArmateurForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';


function ArmateurComponent() {

    const [armateur, setArmateur] = useState<Armateur>(new Armateur());
    const [armateurEdit, setArmateurEdit] = useState<Armateur>(new Armateur());
    const [editArmateurDialog, setEditArmateurDialog] = useState(false);
    const [armateurs, setArmateurs] = useState<Armateur[]>([]);
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
           
            if (callType === 'loadArmateurs') {
                setArmateurs(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArmateur((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArmateurEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', armateur);
        fetchData(armateur, 'Post', buildApiUrl('/armateurs/new'), 'createArmateur');
        setArmateur(new Armateur());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', armateur);
        fetchData(armateurEdit, 'Put', buildApiUrl(`/armateurs/update/${armateurEdit.id}`), 'updateArmateur');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateArmateur')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateArmateur')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des familles des articles.');
        else if (data !== null && error === null) {
            if (callType === 'createArmateur') {
                setArmateur(new Armateur());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateArmateur') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setArmateurEdit(new Armateur());
                setEditArmateurDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterArmateur = () => {

    }

    const loadArmateurToEdit = (data: Armateur) => {
        if (data) {
            setEditArmateurDialog(true);
            console.log(" id Armateur " + data.id);
            setArmateurEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadArmateurToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/armateurs/findall'), 'loadArmateurs');
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
        <Dialog header="Dialog" visible={editArmateurDialog} style={{ width: '30vw' }} modal onHide={() => setEditArmateurDialog(false)}>
            <ArmateurForm armateur={armateurEdit as Armateur} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <ArmateurForm armateur={armateur as Armateur} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-check" outlined label="Réinitialiser" onClick={handleSubmit} />
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
                            <DataTable value={armateurs} header={renderSearch} emptyMessage={"Pas d'armateur à afficher"}>
                                <Column field="nom" header="Nom" />
                                <Column header="Responsable" field="responsable" />
                                <Column header="Tél" field="tel" />
                                <Column header="Fax" field="fax" />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>


        </TabView>
    </>;
}

export default ArmateurComponent;


