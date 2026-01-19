'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Entrepos } from './Entrepos';
import EntreposForm from './EntreposForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function EntreposComponent() {
    const [entrepos, setEntrepos] = useState<Entrepos>(new Entrepos());
    const [entreposEdit, setEntreposEdit] = useState<Entrepos>(new Entrepos());
    const [editEntreposDialog, setEditEntreposDialog] = useState(false);
    const [entreposList, setEntreposList] = useState<Entrepos[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadEntreposList') {
                setEntreposList(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntrepos((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntreposEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEntrepos((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setEntreposEdit((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', entrepos);
        fetchData(entrepos, 'Post', buildApiUrl('/engins/new'), 'createEntrepos');
        setEntrepos(new Entrepos());
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        console.log('Data sent to the backend:', entreposEdit);
        fetchData(entreposEdit, 'Put', buildApiUrl(`/engins/update/${entreposEdit.entreposId}`), 'updateEntrepos');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateEntrepos') {
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            } else {
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'A votre attention', 'Impossible de charger la liste des entrepôts.');
        }
        else if (data !== null && error === null) {
            if (callType === 'createEntrepos') {
                setEntrepos(new Entrepos());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if(callType === 'updateEntrepos') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setEntreposEdit(new Entrepos());
                setEditEntreposDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEntrepos = () => {
        // Implémentez la logique de réinitialisation des filtres si nécessaire
    };

    const loadEntreposToEdit = (data: Entrepos) => {
        if (data) {
            setEditEntreposDialog(true);
            console.log("ID Entrepôt: " + data.entreposId);
            setEntreposEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEntreposToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', buildApiUrl('/entrepos/findall'), 'loadEntreposList');
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
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={clearFilterEntrepos} 
                />
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
                header="Modifier Entrepôt" 
                visible={editEntreposDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditEntreposDialog(false)}
            >
                <EntreposForm 
                    entrepos={entreposEdit} 
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                />
                <Button 
                    icon="pi pi-pencil" 
                    label="Modifier" 
                    loading={btnLoading} 
                    onClick={handleSubmitEdit} 
                />
            </Dialog>
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <EntreposForm 
                        entrepos={entrepos} 
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-check" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setEntrepos(new Entrepos())} 
                                />
                            </div>
                            <div className="md:field md:col-3">
                                <Button 
                                    icon="pi pi-check" 
                                    label="Enregistrer" 
                                    loading={loading} 
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
                                    value={entreposList} 
                                    header={renderSearch} 
                                    emptyMessage={"Pas d'entrepôts à afficher"}
                                >
                                    <Column field="nom" header="Nom" />
                                    <Column field="nbrePaletteTotal" header="Nombre de palettes" />
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

export default EntreposComponent;