// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { ClasseCategory } from './ClasseCategory';
import ClasseCategoryForm from './ClasseCategoryForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function ClasseCategoryComponent() {
    const [classeCategory, setClasseCategory] = useState<ClasseCategory>(new ClasseCategory());
    const [classeCategoryEdit, setClasseCategoryEdit] = useState<ClasseCategory>(new ClasseCategory());
    const [editClasseCategoryDialog, setEditClasseCategoryDialog] = useState(false);
    const [classeCategories, setClasseCategories] = useState<ClasseCategory[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/classecotegory');

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
            if (callType === 'loadClasseCategories') {
                setClasseCategories(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClasseCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setClasseCategoryEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(classeCategory, 'POST', `${BASE_URL}/new`, 'createClasseCategory');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(classeCategoryEdit, 'PUT', `${BASE_URL}/update/${classeCategoryEdit.categorieId}`, 'updateClasseCategory');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateClasseCategory') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateClasseCategory') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des catégories.');
        } else if (data !== null && error === null) {
            if (callType === 'createClasseCategory') {
                setClasseCategory(new ClasseCategory());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateClasseCategory') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setClasseCategoryEdit(new ClasseCategory());
                setEditClasseCategoryDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterClasseCategory = () => {
        setClasseCategory(new ClasseCategory());
    };

    const loadClasseCategoryToEdit = (data: ClasseCategory) => {
        if (data) {
            setEditClasseCategoryDialog(true);
            setClasseCategoryEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadClasseCategoryToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadClasseCategories');
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
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterClasseCategory} />
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
                header="Modifier Catégorie"
                visible={editClasseCategoryDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditClasseCategoryDialog(false)}>
                <ClasseCategoryForm
                    classeCategory={classeCategoryEdit}
                    handleChange={handleChangeEdit} />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditClasseCategoryDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <ClasseCategoryForm
                        classeCategory={classeCategory}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={clearFilterClasseCategory} />
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
                                    value={classeCategories} 
                                    header={renderSearch} 
                                    emptyMessage={"Pas de catégories à afficher"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="categorieId" header="ID Catégorie" sortable />
                                    <Column field="libelle" header="Libellé" sortable />
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

export default ClasseCategoryComponent;