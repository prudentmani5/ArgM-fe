'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { EnginsEntretiensType } from './EnginsEntretiensType';
import { PanEngin } from './PanEngin';
import { EntretiensType } from './EntretiensType';
import EnginsEntretiensTypeForm from './EnginsEntretiensTypeForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function EnginsEntretiensTypeComponent() {
    const [enginsEntretiensType, setEnginsEntretiensType] = useState<EnginsEntretiensType>(new EnginsEntretiensType());
    const [enginsEntretiensTypeEdit, setEnginsEntretiensTypeEdit] = useState<EnginsEntretiensType>(new EnginsEntretiensType());
    const [editEnginsEntretiensTypeDialog, setEditEnginsEntretiensTypeDialog] = useState(false);
    const [enginsEntretiensTypes, setEnginsEntretiensTypes] = useState<EnginsEntretiensType[]>([]);
    const [engins, setEngins] = useState<PanEngin[]>([]);
    const [entretiensTypes, setEntretiensTypes] = useState<EntretiensType[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const { data: enginsData, loading: enginsLoading, error: enginsError, fetchData: fetchEngins } = useConsumApi('');
    const { data: entretiensTypesData, loading: entretiensTypesLoading, error: entretiensTypesError, fetchData: fetchEntretiensTypes } = useConsumApi('');
    const { data: enginsEntretiensTypesData, loading: enginsEntretiensTypesLoading, error: enginsEntretiensTypesError, fetchData: fetchEnginsEntretiensTypes } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/enginsEntretiensType`;
    const ENGINS_URL = `${API_BASE_URL}/PanEngins/findall`;
    const ENTRETIENS_TYPES_URL = `${API_BASE_URL}/entretiensTypes/findall`;

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
        fetchEntretiensTypes(null, 'GET', ENTRETIENS_TYPES_URL);
    }, []);

    useEffect(() => {
        if (enginsData) {
            setEngins(enginsData);
        }
        if (entretiensTypesData) {
            setEntretiensTypes(entretiensTypesData);
        }
        if (enginsEntretiensTypesData) {
            setEnginsEntretiensTypes(Array.isArray(enginsEntretiensTypesData) ? enginsEntretiensTypesData : [enginsEntretiensTypesData]);
        }
    }, [enginsData, entretiensTypesData, enginsEntretiensTypesData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setEnginsEntretiensType(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setEnginsEntretiensTypeEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!enginsEntretiensType.enginId || !enginsEntretiensType.entretiensTypeId || !enginsEntretiensType.periodicite) {
            accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        
        setBtnLoading(true);
        const enginsEntretiensTypeToSend = { ...enginsEntretiensType, enginEntretiensTypeId: null };
        fetchEnginsEntretiensTypes(enginsEntretiensTypeToSend, 'POST', `${BASE_URL}/new`, 'createEnginsEntretiensType')
            .then(() => {
                setEnginsEntretiensType(new EnginsEntretiensType());
                accept('info', 'Succès', 'Association engin/type d\'entretien créée avec succès');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création de l\'association');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!enginsEntretiensTypeEdit.enginEntretiensTypeId) {
            accept('error', 'Erreur', 'ID de l\'association manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchEnginsEntretiensTypes(
            enginsEntretiensTypeEdit, 
            'PUT', 
            `${BASE_URL}/update/${enginsEntretiensTypeEdit.enginEntretiensTypeId}`, 
            'updateEnginsEntretiensType'
        )
        .then(() => {
            accept('info', 'Succès', 'Association mise à jour avec succès');
            setEnginsEntretiensTypeEdit(new EnginsEntretiensType());
            setEditEnginsEntretiensTypeDialog(false);
            loadAllData();
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour de l\'association');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadEnginsEntretiensTypeToEdit = (data: EnginsEntretiensType) => {
        if (data) {
            setEditEnginsEntretiensTypeDialog(true);
            setEnginsEntretiensTypeEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEnginsEntretiensTypeToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchEnginsEntretiensTypes(null, 'GET', `${BASE_URL}/findall`, 'loadEnginsEntretiensTypes');
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

    const getEntretienTypeDesignation = (typeId: number) => {
        const type = entretiensTypes.find(t => t.typeId === typeId);
        return type ? type.designation : 'Inconnu';
    };

    const filteredData = enginsEntretiensTypes.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            engin: getEnginDesignation(item.enginId),
            type: getEntretienTypeDesignation(item.entretiensTypeId),
            periodicite: item.periodicite
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
                header="Modifier Association Engin/Type d'entretien" 
                visible={editEnginsEntretiensTypeDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditEnginsEntretiensTypeDialog(false)}
            >
                <EnginsEntretiensTypeForm 
                    enginsEntretiensType={enginsEntretiensTypeEdit} 
                    handleChange={handleChangeEdit}
                    engins={engins}
                    entretiensTypes={entretiensTypes}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditEnginsEntretiensTypeDialog(false)} 
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
                    <EnginsEntretiensTypeForm 
                        enginsEntretiensType={enginsEntretiensType} 
                        handleChange={handleChange}
                        engins={engins}
                        entretiensTypes={entretiensTypes}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setEnginsEntretiensType(new EnginsEntretiensType())} 
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
                                    emptyMessage={"Pas d'associations à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={enginsEntretiensTypesLoading}
                                >
                                    <Column 
                                        header="Engin" 
                                        body={(data) => getEnginDesignation(data.enginId)} 
                                    />
                                    <Column 
                                        header="Type d'entretien" 
                                        body={(data) => getEntretienTypeDesignation(data.entretiensTypeId)} 
                                    />
                                    <Column field="periodicite" header="Périodicité (heures)" />
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

export default EnginsEntretiensTypeComponent;