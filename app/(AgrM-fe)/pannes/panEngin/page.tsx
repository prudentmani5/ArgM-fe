'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { PanEngin } from './PanEngin';
import EnginsCategorie  from './EnginsCategorie';
import PanEnginForm from './PanEnginForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PanEnginComponent() {
    const [panEngin, setPanEngin] = useState<PanEngin>(new PanEngin());
    const [panEnginEdit, setPanEnginEdit] = useState<PanEngin>(new PanEngin());
    const [editPanEnginDialog, setEditPanEnginDialog] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const BASE_URL = `${API_BASE_URL}/PanEngins`;
    const CATEGORIES_URL = `${API_BASE_URL}/enginsCategories/findall`;

    // Utilisation de plusieurs instances de useConsumApi
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, fetchData: fetchCategories } = useConsumApi('');
    const { data: panEnginsData, loading: panEnginsLoading, error: panEnginsError, fetchData: fetchPanEngins } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        // Chargement initial des données
        fetchCategories(null, 'GET', CATEGORIES_URL);
    }, []);

    useEffect(() => {
        if (categoriesData) {
            fetchPanEngins(null, 'GET', `${BASE_URL}/findall`);
        }
    }, [categoriesData]);

    useEffect(() => {
        if (panEnginsData) {
            // Vérification supplémentaire pour s'assurer que les catégories sont chargées
            if (!categoriesData) {
                fetchCategories(null, 'GET', CATEGORIES_URL);
            }
        }
    }, [panEnginsData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPanEngin(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setPanEnginEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!panEngin.enginDesignation || !panEngin.categorieId) {
            accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        setBtnLoading(true);
        const panEnginToSend = { ...panEngin, enginId: null };
        fetchPanEngins(panEnginToSend, 'POST', `${BASE_URL}/new`, 'createPanEngin')
            .then(() => {
                setPanEngin(new PanEngin());
                accept('info', 'Succès', 'Engin créé avec succès');
                fetchPanEngins(null, 'GET', `${BASE_URL}/findall`, 'loadPanEngins');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création de l\'engin');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!panEnginEdit.enginId) {
            accept('error', 'Erreur', 'ID de l\'engin manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchPanEngins(
            panEnginEdit, 
            'PUT', 
            `${BASE_URL}/update/${panEnginEdit.enginId}`, 
            'updatePanEngin'
        )
        .then(() => {
            accept('info', 'Succès', 'Engin mis à jour avec succès');
            setPanEnginEdit(new PanEngin());
            setEditPanEnginDialog(false);
            fetchPanEngins(null, 'GET', `${BASE_URL}/findall`, 'loadPanEngins');
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour de l\'engin');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadPanEnginToEdit = (data: PanEngin) => {
        if (data) {
            setEditPanEnginDialog(true);
            setPanEnginEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPanEnginToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            fetchPanEngins(null, 'GET', `${BASE_URL}/findall`, 'loadPanEngins');
        }
        setActiveIndex(e.index);
    };

    const getCategorieDesignation = (categorieId: number) => {
        const categorie = Array.isArray(categoriesData) ? 
            categoriesData.find(c => c.enginCategorieId === categorieId) : null;
        return categorie ? categorie.categorieDesignation : 'Inconnu';
    };

    const filteredData = (Array.isArray(panEnginsData) ? panEnginsData : []).filter(item => {
        if (!item) return false;
        return JSON.stringify({
            enginDesignation: item.enginDesignation || '',
            modele: item.modele || '',
            marque: item.marque || '',
            categorie: getCategorieDesignation(item.categorieId)
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={() => setGlobalFilter('')} 
                />
                <span className="p-input-icon-left">
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
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Engin" 
                visible={editPanEnginDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPanEnginDialog(false)}
            >
                <PanEnginForm 
                    panEngin={panEnginEdit} 
                    handleChange={handleChangeEdit}
                    categories={Array.isArray(categoriesData) ? categoriesData : []}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPanEnginDialog(false)} 
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
                <TabPanel header="Nouveau">
                    <PanEnginForm 
                        panEngin={panEngin} 
                        handleChange={handleChange}
                        categories={Array.isArray(categoriesData) ? categoriesData : []}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setPanEngin(new PanEngin())} 
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
                
                <TabPanel header="Tous">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={filteredData} 
                                    header={renderSearch}
                                    emptyMessage={"Pas d'engins à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={panEnginsLoading}
                                    scrollable
                                    scrollHeight="400px"
                                >
                                    <Column field="enginDesignation" header="Désignation" />
                                    <Column field="modele" header="Modèle" />
                                    <Column field="marque" header="Marque" />
                                    <Column field="type" header="Type" />
                                    <Column 
                                        header="Catégorie" 
                                        body={(data) => getCategorieDesignation(data.categorieId)} 
                                    />
                                    <Column field="numeroSerie" header="Numéro de série" />
                                    <Column header="Actions" body={optionButtons} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PanEnginComponent;