
'use client';

import { useState, useEffect, useRef } from 'react';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

// Assurez-vous que ces imports correspondent à vos exports
import EntretiensTypeForm from './EntretiensTypeForm';
import EntretiensType from './EntretiensType';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';


function EntretiensTypeComponent() {
    const [entretiensType, setEntretiensType] = useState<EntretiensType>(new EntretiensType());
    const [entretiensTypeEdit, setEntretiensTypeEdit] = useState<EntretiensType>(new EntretiensType());
    const [editEntretiensTypeDialog, setEditEntretiensTypeDialog] = useState(false);
    const [entretiensTypes, setEntretiensTypes] = useState<EntretiensType[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    
    //const { data, loading, error, fetchData } = useFetchData();
    const { data, loading, error, fetchData } = useConsumApi('');
    
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = `${API_BASE_URL}/entretiensTypes`;

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        }); 
    };

    useEffect(() => {
        if (data) {
            if (Array.isArray(data)) {
                setEntretiensTypes(data);
            } else if (data.typeId) {
                // Si c'est une création/mise à jour, recharger les données
                loadAllData();
            }
        }
    }, [data]);

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setEntretiensType(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: any) => {
        const { name, value } = e.target;
        setEntretiensTypeEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!entretiensType.designation) {
            accept('warn', 'Attention', 'La désignation est obligatoire');
            return;
        }
        
        setBtnLoading(true);
        const typeToSend = { ...entretiensType, typeId: null };
        fetchData(typeToSend, 'POST', `${BASE_URL}/new`)
            .then(() => {
                setEntretiensType(new EntretiensType());
                accept('info', 'Succès', 'Type d\'entretien créé avec succès');
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la création du type d\'entretien');
            })
            .finally(() => setBtnLoading(false));
    };

    const handleSubmitEdit = () => {
        if (!entretiensTypeEdit.typeId) {
            accept('error', 'Erreur', 'ID du type d\'entretien manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchData(
            entretiensTypeEdit, 
            'PUT', 
            `${BASE_URL}/update/${entretiensTypeEdit.typeId}`
        )
        .then(() => {
            accept('info', 'Succès', 'Type d\'entretien mis à jour avec succès');
            setEntretiensTypeEdit(new EntretiensType());
            setEditEntretiensTypeDialog(false);
        })
        .catch(() => {
            accept('error', 'Erreur', 'Échec de la mise à jour du type d\'entretien');
        })
        .finally(() => setBtnLoading(false));
    };

    const loadEntretiensTypeToEdit = (data: EntretiensType) => {
        if (data) {
            setEditEntretiensTypeDialog(true);
            setEntretiensTypeEdit(data);
        }
    };

    const confirmDelete = (data: EntretiensType) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer ce type d\'entretien?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteEntretiensType(data),
            reject: () => {}
        });
    };

    const deleteEntretiensType = (data: EntretiensType) => {
        if (!data.typeId) return;
        
        fetchData(null, 'DELETE', `${BASE_URL}/delete/${data.typeId}`)
            .then(() => {
                accept('info', 'Succès', 'Type d\'entretien supprimé avec succès');
                loadAllData();
            })
            .catch(() => {
                accept('error', 'Erreur', 'Échec de la suppression du type d\'entretien');
            });
    };

    const optionButtons = (data: EntretiensType): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEntretiensTypeToEdit(data)} 
                    rounded 
                    severity='warning' 
                    className="mr-2"
                />
                <Button 
                    icon="pi pi-trash" 
                    onClick={() => confirmDelete(data)} 
                    rounded 
                    severity='danger' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const filteredData = entretiensTypes.filter(item => {
        if (!item) return false;
        return JSON.stringify(item).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-filter-slash" 
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
            <ConfirmDialog />
            <Dialog 
                header="Modifier Type d'Entretien" 
                visible={editEntretiensTypeDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditEntretiensTypeDialog(false)}
            >
                <EntretiensTypeForm 
                    entretiensType={entretiensTypeEdit} 
                    handleChange={handleChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditEntretiensTypeDialog(false)} 
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
                <TabPanel header="Nouveau Type">
                    <EntretiensTypeForm 
                        entretiensType={entretiensType} 
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setEntretiensType(new EntretiensType())} 
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
                
                <TabPanel header="Tous les Types">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={filteredData} 
                                    header={renderSearch}
                                    emptyMessage={"Aucun type d'entretien à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                    loading={loading}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                >
                                    <Column field="typeId" header="ID" sortable />
                                    <Column field="designation" header="Désignation" sortable />
                                    <Column header="Actions" body={optionButtons} style={{ width: '120px' }} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default EntretiensTypeComponent;