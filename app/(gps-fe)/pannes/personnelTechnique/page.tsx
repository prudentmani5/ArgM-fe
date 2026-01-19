'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { PersonnelTechnique } from './PersonnelTechnique';
import PersonnelTechniqueForm from './PersonnelTechniqueForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PersonnelTechniqueComponent() {
    const [personnel, setPersonnel] = useState<PersonnelTechnique>(new PersonnelTechnique());
    const [personnelEdit, setPersonnelEdit] = useState<PersonnelTechnique>(new PersonnelTechnique());
    const [editDialog, setEditDialog] = useState(false);
    const [personnels, setPersonnels] = useState<PersonnelTechnique[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    const { data: personnelsData, loading: personnelsLoading, fetchData: fetchPersonnels } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/personnelTechnique`;

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        fetchPersonnels(null, 'GET', `${BASE_URL}/findall`);
    }, []);

    useEffect(() => {
        if (personnelsData) {
            setPersonnels(Array.isArray(personnelsData) ? personnelsData : [personnelsData]);
        }
    }, [personnelsData]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setPersonnel(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setPersonnelEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!personnel.matricule || !personnel.nom) {
            accept('warn', 'Attention', 'Matricule et Nom sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchPersonnels(personnel, 'POST', `${BASE_URL}/new`, 'createPersonnel')
            .then(() => {
                setPersonnel(new PersonnelTechnique());
                accept('info', 'Succès', 'Personnel technique créé');
                fetchPersonnels(null, 'GET', `${BASE_URL}/findall`);
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!personnelEdit.matricule) {
            accept('error', 'Erreur', 'Matricule manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchPersonnels(
            personnelEdit, 
            'PUT', 
            `${BASE_URL}/update/${personnelEdit.matricule}`, 
            'updatePersonnel'
        )
        .then(() => {
            accept('info', 'Succès', 'Personnel mis à jour');
            setPersonnelEdit(new PersonnelTechnique());
            setEditDialog(false);
            fetchPersonnels(null, 'GET', `${BASE_URL}/findall`);
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadPersonnelToEdit = (data: PersonnelTechnique) => {
        if (data) {
            setEditDialog(true);
            setPersonnelEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPersonnelToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            fetchPersonnels(null, 'GET', `${BASE_URL}/findall`);
        }
        setActiveIndex(e.index);
    };

    const filteredData = personnels.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            matricule: item.matricule || '',
            nom: item.nom || '',
            prenom: item.prenom || ''
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
                header="Modifier Personnel Technique" 
                visible={editDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditDialog(false)}
            >
                <PersonnelTechniqueForm 
                    personnel={personnelEdit} 
                    handleChange={handleChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditDialog(false)} 
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
                    <PersonnelTechniqueForm 
                        personnel={personnel} 
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setPersonnel(new PersonnelTechnique())} 
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
                                    emptyMessage={"Aucun personnel technique trouvé"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={personnelsLoading}
                                    scrollable
                                    scrollHeight="400px"
                                >
                                    <Column field="matricule" header="Matricule" />
                                    <Column field="nom" header="Nom" />
                                    <Column field="prenom" header="Prénom" />
                                    <Column 
                                        field="salaireHoraire" 
                                        header="Salaire Horaire" 
                                        body={(data) => data.salaireHoraire?.toFixed(2)}
                                    />
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

export default PersonnelTechniqueComponent;