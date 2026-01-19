'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { EnginsPartieType } from './EnginsPartieType';
import { PanEngin } from './PanEngin';
import EnginsPartieTypeForm from './EnginsPartieTypeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';


function EnginsPartieTypeComponent() { 
    const [enginsPartieType, setEnginsPartieType] = useState<EnginsPartieType>(new EnginsPartieType());
    const [enginsPartieTypeEdit, setEnginsPartieTypeEdit] = useState<EnginsPartieType>(new EnginsPartieType());
    const [editEnginsPartieTypeDialog, setEditEnginsPartieTypeDialog] = useState(false);
    const [enginsPartieTypes, setEnginsPartieTypes] = useState<EnginsPartieType[]>([]);
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const { data: enginsData, loading: enginsLoading, error: enginsError, fetchData: fetchEngins } = useConsumApi('');
    const { data: enginsPartieTypesData, loading: enginsPartieTypesLoading, error: enginsPartieTypesError, fetchData: fetchEnginsPartieTypes } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/enginsPartiesTypes`;
    const ENGINS_URL = `${API_BASE_URL}/PanEngins/findall`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        }); 
    };

    useEffect(() => {
        // Chargement initial des données
        fetchEngins(null, 'GET', ENGINS_URL);
    }, []);

    useEffect(() => {
        if (enginsData) {
            setEngins(enginsData);
        }
        if (enginsPartieTypesData) {
            setEnginsPartieTypes(Array.isArray(enginsPartieTypesData) ? enginsPartieTypesData : [enginsPartieTypesData]);
        }
    }, [enginsData, enginsPartieTypesData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setEnginsPartieType(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setEnginsPartieTypeEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!enginsPartieType.partieDesignation || !enginsPartieType.enginId) {
            accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        setBtnLoading(true);
        const enginsPartieTypeToSend = { ...enginsPartieType, enginPartieId: null };
        fetchEnginsPartieTypes(enginsPartieTypeToSend, 'POST', `${BASE_URL}/new`, 'createEnginsPartieType')
            .then(() => {
                setEnginsPartieType(new EnginsPartieType());
                accept('info', 'Succès', 'Partie d\'engin créée avec succès');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création de la partie d\'engin');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!enginsPartieTypeEdit.enginPartieId) {
            accept('error', 'Erreur', 'ID de la partie d\'engin manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchEnginsPartieTypes(
            enginsPartieTypeEdit, 
            'PUT', 
            `${BASE_URL}/update/${enginsPartieTypeEdit.enginPartieId}`, 
            'updateEnginsPartieType'
        )
        .then(() => {
            accept('info', 'Succès', 'Partie d\'engin mise à jour avec succès');
            setEnginsPartieTypeEdit(new EnginsPartieType());
            setEditEnginsPartieTypeDialog(false);
            loadAllData();
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour de la partie d\'engin');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadEnginsPartieTypeToEdit = (data: EnginsPartieType) => {
        if (data) {
            setEditEnginsPartieTypeDialog(true);
            setEnginsPartieTypeEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEnginsPartieTypeToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchEnginsPartieTypes(null, 'GET', `${BASE_URL}/findall`, 'loadEnginsPartieTypes');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const getEnginDesignation = (enginId: string) => {
        const engin = engins.find(e => e.enginId === enginId);
        return engin ? engin.enginDesignation : 'Inconnu';
    };

    const filteredData = enginsPartieTypes.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            partieDesignation: item.partieDesignation || '',
            engin: getEnginDesignation(item.enginId),
            categorie: item.categorie || '',
            unite: item.unite || ''
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
                header="Modifier Partie d'Engin" 
                visible={editEnginsPartieTypeDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditEnginsPartieTypeDialog(false)}
            >
                <EnginsPartieTypeForm 
                    enginsPartieType={enginsPartieTypeEdit} 
                    handleChange={handleChangeEdit}
                    engins={engins}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditEnginsPartieTypeDialog(false)} 
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
                    <EnginsPartieTypeForm 
                        enginsPartieType={enginsPartieType} 
                        handleChange={handleChange}
                        engins={engins}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setEnginsPartieType(new EnginsPartieType())} 
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
                                    emptyMessage={"Pas de parties d'engins à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={enginsPartieTypesLoading}
                                    scrollable
                                    scrollHeight="400px"
                                >
                                    <Column field="partieDesignation" header="Partie" />
                                    <Column 
                                        header="Engin" 
                                        body={(data) => getEnginDesignation(data.enginId)} 
                                    />
                                    <Column field="categorie" header="Catégorie" />
                                    <Column field="unite" header="Unité" />
                                    <Column field="periodicite" header="Périodicité" />
                                    <Column field="mesure" header="Mesure" />
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

export default EnginsPartieTypeComponent;