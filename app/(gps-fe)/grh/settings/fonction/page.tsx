'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { RHFonction } from './RHFonction';
import RHFonctionForm from './RHFonctionForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function RHFonctionComponent() {

    const [rhfonction, setRHFonction] = useState<RHFonction>(new RHFonction());
    const [rhfonctionEdit, setRHFonctionEdit] = useState<RHFonction>(new RHFonction());
    const [editRHFonctionDialog, setEditRHFonctionDialog] = useState(false);
    const [rhfonctions, setRHFonctions] = useState<RHFonction[]>([]);
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
            if (callType === 'loadRHFonctions') {
                setRHFonctions(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRHFonction((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRHFonctionEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', rhfonction);
        fetchData(rhfonction, 'Post', buildApiUrl('/rhfonctions/new'), 'createRHFonction');
    }

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', rhfonctionEdit);
        fetchData(rhfonctionEdit, 'Put', buildApiUrl(`/rhfonctions/update/${rhfonctionEdit.id}`), 'updateRHFonction');
    }

    const handleReset = () => {
        setRHFonction(new RHFonction());
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            console.log(' ===> || I\'m here');
            if (callType !== 'updateRHFonction' && callType !== 'deleteRHFonction')
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateRHFonction')
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            else if (callType === 'deleteRHFonction')
                accept('warn', 'Attention', 'La suppression n\'a pas été effectuée.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'Attention', 'Impossible de charger la liste des fonctions.');
        else if (data !== null && error === null) {
            if (callType === 'createRHFonction') {
                setRHFonction(new RHFonction());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if(callType === 'updateRHFonction') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setRHFonctionEdit(new RHFonction());
                setEditRHFonctionDialog(false);
                loadAllData();
            } else if(callType === 'deleteRHFonction') {
                accept('info', 'OK', 'La suppression a été effectuée avec succès.');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadRHFonctionToEdit = (data: RHFonction) => {
        if (data) {
            setEditRHFonctionDialog(true);
            console.log(" id RHFonction " + data.id);
            setRHFonctionEdit(data);
        }
    };

    const confirmDelete = (rhfonction: RHFonction) => {
        confirmDialog({
            message: `Êtes-vous sûr de vouloir supprimer la fonction "${rhfonction.libelle}" ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: () => deleteRHFonction(rhfonction.id),
            acceptLabel: 'Oui',
            rejectLabel: 'Non'
        });
    };

    const deleteRHFonction = (id: number) => {
        setBtnLoading(true);
        fetchData(null, 'Delete', buildApiUrl(`/rhfonctions/delete/${id}`), 'deleteRHFonction');
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadRHFonctionToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                <Button 
                    icon="pi pi-trash" 
                    onClick={() => confirmDelete(data)} 
                    raised 
                    severity='danger' 
                    tooltip="Supprimer"
                />
            </div>
        );
    }

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/rhfonctions/findall'), 'loadRHFonctions');
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
        <ConfirmDialog />
        <Dialog 
            header="Modifier Fonction" 
            visible={editRHFonctionDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditRHFonctionDialog(false)}
        >
            <RHFonctionForm rhfonction={rhfonctionEdit as RHFonction} handleChange={handleChangeEdit} />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button 
                    icon="pi pi-times" 
                    label="Annuler" 
                    outlined 
                    onClick={() => setEditRHFonctionDialog(false)} 
                />
                <Button 
                    icon="pi pi-pencil" 
                    label="Modifier" 
                    loading={btnLoading} 
                    onClick={handleSubmitEdit} 
                />
            </div>
        </Dialog>
        
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <RHFonctionForm rhfonction={rhfonction as RHFonction} handleChange={handleChange} />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button 
                                icon="pi pi-refresh" 
                                outlined 
                                label="Réinitialiser" 
                                onClick={handleReset} 
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
                                value={rhfonctions} 
                                header={renderSearch} 
                                emptyMessage={"Pas de fonction à afficher"}
                                globalFilter={globalFilter}
                                paginator 
                                rows={10} 
                                rowsPerPageOptions={[5, 10, 25]}
                            >
                                <Column field="fonctionid" header="Code" sortable />
                                <Column field="libelle" header="Libellé" sortable />
                                <Column header="Options" body={optionButtons} style={{ width: '12rem' }} />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default RHFonctionComponent;