// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { ClasseMarchandise } from './ClasseMarchandise';
import ClasseMarchandiseForm from './ClasseMarchandiseForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';


function ClasseMarchandiseComponent() {
    const [classeMarchandise, setClasseMarchandise] = useState<ClasseMarchandise>(new ClasseMarchandise());
    const [classeMarchandiseEdit, setClasseMarchandiseEdit] = useState<ClasseMarchandise>(new ClasseMarchandise());
    const [editClasseMarchandiseDialog, setEditClasseMarchandiseDialog] = useState(false);
    const [classeMarchandises, setClasseMarchandises] = useState<ClasseMarchandise[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/classemarchandises`;

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
            if (callType === 'loadClasseMarchandises') {
                setClasseMarchandises(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClasseMarchandise((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClasseMarchandiseEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(classeMarchandise, 'POST', `${BASE_URL}/new`, 'createClasseMarchandise');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(classeMarchandiseEdit, 'PUT', `${BASE_URL}/update/${classeMarchandiseEdit.classeMarchandiseId}`, 'updateClasseMarchandise');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateClasseMarchandise') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateClasseMarchandise') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des classes de marchandises.');
        } else if (data !== null && error === null) {
            if (callType === 'createClasseMarchandise') {
                setClasseMarchandise(new ClasseMarchandise());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateClasseMarchandise') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setClasseMarchandiseEdit(new ClasseMarchandise());
                setEditClasseMarchandiseDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterClasseMarchandise = () => {
        setClasseMarchandise(new ClasseMarchandise());
    };

    const loadClasseMarchandiseToEdit = (data: ClasseMarchandise) => {
        if (data) {
            setEditClasseMarchandiseDialog(true);
            setClasseMarchandiseEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadClasseMarchandiseToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadClasseMarchandises');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterClasseMarchandise} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Classe Marchandise"
                visible={editClasseMarchandiseDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditClasseMarchandiseDialog(false)}>
                <ClasseMarchandiseForm
                    classeMarchandise={classeMarchandiseEdit}
                    handleChange={handleChangeEdit} />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditClasseMarchandiseDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <ClasseMarchandiseForm
                        classeMarchandise={classeMarchandise}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterClasseMarchandise} />
                            </div>
                            <div className="md:field md:col-3">
                                <Button icon="pi pi-check" label="Enregistrer" loading={btnLoading} onClick={handleSubmit} />
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={classeMarchandises} 
                                    header={renderSearch} 
                                    emptyMessage={"Pas de classes de marchandises à afficher"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="classeMarchandiseId" header="ID" sortable />
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column field="compteImp" header="Compte Import" sortable />
                                    <Column field="compteExp" header="Compte Export" sortable />
                                    <Column header="Options" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default ClasseMarchandiseComponent;