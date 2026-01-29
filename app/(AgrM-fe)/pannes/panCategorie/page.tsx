'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { EnginsCategorie } from './EnginsCategorie';
import EnginsCategorieForm from './EnginsCategorieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function EnginsCategorieComponent() {
    const [enginsCategorie, setEnginsCategorie] = useState<EnginsCategorie>(new EnginsCategorie());
    const [enginsCategorieEdit, setEnginsCategorieEdit] = useState<EnginsCategorie>(new EnginsCategorie());
    const [editEnginsCategorieDialog, setEditEnginsCategorieDialog] = useState(false);
    const [enginsCategories, setEnginsCategories] = useState<EnginsCategorie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

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
            if (callType === 'loadEnginsCategories') {
                setEnginsCategories(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnginsCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnginsCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        const enginsCategorieToSend = { ...enginsCategorie, enginCategorieId: null };
        fetchData(enginsCategorieToSend, 'POST', `${API_BASE_URL}/enginsCategories/new`, `createEnginsCategorie`);
    }

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(enginsCategorieEdit, 'PUT', `${API_BASE_URL}/enginsCategories/update/${enginsCategorieEdit.enginCategorieId}`, 'updateEnginsCategorie');
    }

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEnginsCategorie')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateEnginsCategorie')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectueé.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des catégories.');
        else if (data !== null && error === null) {
            if (callType === 'createEnginsCategorie') {
                setEnginsCategorie(new EnginsCategorie());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateEnginsCategorie') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setEnginsCategorieEdit(new EnginsCategorie());
                setEditEnginsCategorieDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEnginsCategorie = () => {
        setGlobalFilter('');
    }

    const loadEnginsCategorieToEdit = (data: EnginsCategorie) => {
        if (data) {
            setEditEnginsCategorieDialog(true);
            setEnginsCategorieEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEnginsCategorieToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier" 
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/enginsCategories/findall`, `loadEnginsCategories`);
    }

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const filteredData = enginsCategories.filter(item => {
        return JSON.stringify({
            categorieDesignation: item.categorieDesignation || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-filter-slash" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={clearFilterEnginsCategorie} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher catégorie"
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Catégorie Engin" 
            visible={editEnginsCategorieDialog} 
            style={{ width: '30vw' }} 
            modal 
            onHide={() => setEditEnginsCategorieDialog(false)}
        >
            <EnginsCategorieForm 
                enginsCategorie={enginsCategorieEdit} 
                handleChange={handleChangeEdit} 
            />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditEnginsCategorieDialog(false)} 
                    className="p-button-text" 
                />
                <Button 
                    label="Modifier" 
                    icon="pi pi-check" 
                    loading={btnLoading} 
                    onClick={handleSubmitEdit} 
                />
            </div>
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouvelle Catégorie">
                <EnginsCategorieForm 
                    enginsCategorie={enginsCategorie} 
                    handleChange={handleChange} 
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button 
                                icon="pi pi-refresh" 
                                outlined 
                                label="Réinitialiser" 
                                onClick={() => setEnginsCategorie(new EnginsCategorie())} 
                            />
                        </div>
                        <div className="md:field md:col-3">
                            <Button 
                                icon="pi pi-check" 
                                label="Enregistrer" 
                                loading={btnLoading} 
                                onClick={handleSubmit} 
                            />
                        </div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel header="Liste des Catégories">
                <div className='grid'>
                    <div className='col-12'>
                        <div className='card'>
                            <DataTable 
                                value={filteredData} 
                                header={renderSearch}
                                emptyMessage={"Aucune catégorie à afficher"}
                                filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                paginator 
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            >
                                <Column field="enginCategorieId" header="ID" sortable />
                                <Column field="categorieDesignation" header="Désignation" sortable />
                                <Column header="Actions" body={optionButtons} style={{ width: '100px' }} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default EnginsCategorieComponent;