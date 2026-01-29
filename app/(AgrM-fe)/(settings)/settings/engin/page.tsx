'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Engin } from './Engin';
import EnginForm from './EnginForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function EnginComponent() {
    const [engin, setEngin] = useState<Engin>(new Engin());
    const [enginEdit, setEnginEdit] = useState<Engin>(new Engin());
    const [editEnginDialog, setEditEnginDialog] = useState(false);
    const [engins, setEngins] = useState<Engin[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/engins`;

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
            if (callType === 'loadEngins') {
                setEngins(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchEngins') {
            // Handle search results
            if (searchData.content) {
                setEngins(searchData.content);
            } else if (Array.isArray(searchData)) {
                setEngins(searchData);
            } else {
                setEngins([]);
            }
        }
        
        if (searchError && searchCallType === 'searchEngins') {
            accept('warn', 'Erreur', 'Erreur lors de la recherche');
            setEngins([]);
        }
    }, [searchData, searchError, searchCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEngin((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEnginEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (name: string, value: number | null) => {
        setEngin((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleNumberChangeEdit = (name: string, value: number | null) => {
        setEnginEdit((prev) => ({ ...prev, [name]: value || 0 }));
    };

    const handleSubmit = () => {
        if (!engin.nom.trim()) {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        setBtnLoading(true);
        console.log('Data sent to the backend:', engin);
        fetchData(engin, 'POST', `${BASE_URL}/new`, 'createEngin');
    };

    const handleSubmitEdit = () => {
        if (!enginEdit.nom.trim()) {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        setBtnLoading(true);
        console.log('Data sent to the backend:', enginEdit);
        fetchData(enginEdit, 'PUT', `${BASE_URL}/update/${enginEdit.enginId}`, 'updateEngin');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEngin')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateEngin')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des engins.');
        else if (data !== null && error === null) {
            if (callType === 'createEngin') {
                setEngin(new Engin());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if(callType === 'updateEngin') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setEnginEdit(new Engin());
                setEditEnginDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEngin = () => {
        setSearchTerm('');
        loadAllData();
    };

    const loadEnginToEdit = (data: Engin) => {
        if (data) {
            setEditEnginDialog(true);
            console.log("ID Engin: " + data.enginId);
            setEnginEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEnginToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEngins');
    };

    const performSearch = (query: string) => {
        if (query.trim() === '') {
            loadAllData();
        } else {
            fetchSearchData(null, 'GET', `${BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=100`, 'searchEngins');
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const newTimeout = setTimeout(() => {
            performSearch(value);
        }, 500); // 500ms delay

        setSearchTimeout(newTimeout);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={clearFilterEngin} 
                />
                <span className="p-input-icon-left" style={{ width: '300px' }}>
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Rechercher par nom..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const formatCurrency = (value: number) => {
        return value?.toLocaleString('fr-FR', { style: 'currency', currency: 'BIF' });
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Engin" 
            visible={editEnginDialog} 
            style={{ width: '60vw' }} 
            modal 
            onHide={() => setEditEnginDialog(false)}
        >
            <EnginForm 
                engin={enginEdit} 
                handleChange={handleChangeEdit}
                handleNumberChange={handleNumberChangeEdit}
            />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditEnginDialog(false)} 
                    className="p-button-text" 
                />
                <Button 
                    label="Enregistrer" 
                    icon="pi pi-check" 
                    loading={btnLoading} 
                    onClick={handleSubmitEdit} 
                />
            </div>
        </Dialog>
        <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
            <TabPanel header="Nouveau">
                <EnginForm 
                    engin={engin} 
                    handleChange={handleChange}
                    handleNumberChange={handleNumberChange}
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button 
                                icon="pi pi-refresh" 
                                outlined 
                                label="Réinitialiser" 
                                onClick={() => setEngin(new Engin())} 
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
                                value={engins} 
                                header={renderSearch} 
                                emptyMessage={searchTerm ? "Aucun engin trouvé pour cette recherche" : "Pas d'engins à afficher"}
                                loading={loading || searchLoading}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} engins"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            >
                                <Column field="nom" header="Nom" sortable />
                                <Column field="prix" header="Prix 1" body={(rowData) => formatCurrency(rowData.prix)} sortable />
                                <Column field="prix2" header="Prix 2" body={(rowData) => formatCurrency(rowData.prix2)} sortable />
                                <Column field="prix3" header="Prix 3" body={(rowData) => formatCurrency(rowData.prix3)} sortable />
                                <Column field="prix4" header="Prix 4" body={(rowData) => formatCurrency(rowData.prix4)} sortable />
                                <Column field="prix5" header="Prix 5" body={(rowData) => formatCurrency(rowData.prix5)} sortable />
                                <Column 
                                    header="Actions" 
                                    body={optionButtons} 
                                    style={{ width: '100px' }}
                                />
                            </DataTable>
                        </div>
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </>;
}

export default EnginComponent;