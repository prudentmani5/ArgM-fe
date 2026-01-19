'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Categorie } from './Categorie';
import CategorieForm from './CategorieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';


function CategorieComponent() {

    const [categorie, setCategorie] = useState<Categorie>(new Categorie());
    const [categorieEdit, setCategorieEdit] = useState<Categorie>(new Categorie());
    const [editCategorieDialog, setEditCategorieDialog] = useState(false);
    const [categories, setCategories] = useState<Categorie[]>([]);
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
           
            if (callType === 'loadCategories') {
                setCategories(Array.isArray(data) ? data : [data]);
            }

            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', categorie);
        fetchData(categorie, 'Post', `${API_BASE_URL}/api/categories/new`, 'createCategorie');
        setCategorie(new Categorie());


    }

    const handleSubmitEdit = () => {

        setBtnLoading(true);
        console.log('Data sent to the backend:', categorieEdit);
        fetchData(categorieEdit, 'Put', `${API_BASE_URL}/api/categories/update/` + categorieEdit.categorieId, 'updateCategorie');
    }

    const handleAfterApiCall = (chooseenTab: number) => {

        if (error !== null && chooseenTab === 0) {

            console.log(' ===> || I\'m here');
            if (callType !== 'updateCategorie')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateCategorie')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des catégories.');
        else if (data !== null && error === null) {
            if (callType === 'createCategorie') {
                setCategorie(new Categorie());
                accept('info', 'OK', 'L\'enregistrement a pas été éffectué avec succès.');
            } else if(callType === 'updateCategorie') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCategorieEdit(new Categorie());
                setEditCategorieDialog(false);
                loadAllData();
            }
            
        }

        setBtnLoading(false);
    };

    const clearFilterCategorie = () => {
        setGlobalFilter('');
    }

    const loadCategorieToEdit = (data: Categorie) => {
        if (data) {
            setEditCategorieDialog(true);
            console.log(" id Categorie " + data.categorieId);
            setCategorieEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCategorieToEdit(data)} raised severity='warning' />
                {/* <Button icon="pi pi-trash" raised severity='danger' /> */}
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/categories/findall`, 'loadCategories');
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
                onClick={clearFilterCategorie}
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
        <Dialog header="Modifier Catégorie" visible={editCategorieDialog} style={{ width: '30vw' }} modal onHide={() => setEditCategorieDialog(false)}>
            <CategorieForm categorie={categorieEdit as Categorie} handleChange={handleChangeEdit} />
            <Button icon="pi pi-pencil" label="Modifier" loading={btnLoading} onClick={handleSubmitEdit} />
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <CategorieForm categorie={categorie as Categorie} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button icon="pi pi-refresh" outlined label="Réinitialiser" onClick={() => setCategorie(new Categorie())} />
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
                            <DataTable value={categories} header={renderSearch} emptyMessage={"Pas de catégorie à afficher"} globalFilter={globalFilter}>
                                <Column field="categorieId" header="Code" sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column header="Options" body={optionButtons} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default CategorieComponent;