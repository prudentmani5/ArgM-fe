'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { AgenceDouane } from './AgenceDouane';
import AgenceDouaneForm from './AgenceDouaneForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function AgenceDouaneComponent() {
    const [agenceDouane, setAgenceDouane] = useState<AgenceDouane>(new AgenceDouane());
    const [agenceDouaneEdit, setAgenceDouaneEdit] = useState<AgenceDouane>(new AgenceDouane());
    const [editAgenceDouaneDialog, setEditAgenceDouaneDialog] = useState(false);
    const [agencesDouane, setAgencesDouane] = useState<AgenceDouane[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/agencedouanes');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            // window.location.href = '/auth/login2'; // redirect to login if not logged in
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadAgencesDouane') {
                setAgencesDouane(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchAgencesDouane') {
            // Handle search results
            if (searchData.content) {
                setAgencesDouane(searchData.content);
            } else if (Array.isArray(searchData)) {
                setAgencesDouane(searchData);
            } else {
                setAgencesDouane([]);
            }
        }
        
        if (searchError && searchCallType === 'searchAgencesDouane') {
            accept('warn', 'Erreur', 'Erreur lors de la recherche');
            setAgencesDouane([]);
        }
    }, [searchData, searchError, searchCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgenceDouane((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAgenceDouaneEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!agenceDouane.libelle.trim()) {
            accept('warn', 'Attention', 'Le libellé est obligatoire');
            return;
        }
        setBtnLoading(true);
        console.log('Data sent to the backend:', agenceDouane);
        fetchData(agenceDouane, 'POST', `${BASE_URL}/new`, 'createAgenceDouane');
    };

    const handleSubmitEdit = () => {
        if (!agenceDouaneEdit.libelle.trim()) {
            accept('warn', 'Attention', 'Le libellé est obligatoire');
            return;
        }
        setBtnLoading(true);
        console.log('Data sent to the backend:', agenceDouaneEdit);
        fetchData(agenceDouaneEdit, 'PUT', `${BASE_URL}/update/${agenceDouaneEdit.agenceDouaneId}`, 'updateAgenceDouane');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateAgenceDouane')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateAgenceDouane')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chooseenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des agences de douane.');
        else if (data !== null && error === null) {
            if (callType === 'createAgenceDouane') {
                setAgenceDouane(new AgenceDouane());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateAgenceDouane') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setAgenceDouaneEdit(new AgenceDouane());
                setEditAgenceDouaneDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterAgenceDouane = () => {
        setSearchTerm('');
        loadAllData();
    };

    const loadAgenceDouaneToEdit = (data: AgenceDouane) => {
        if (data) {
            setEditAgenceDouaneDialog(true);
            console.log("id AgenceDouane " + data.agenceDouaneId);
            setAgenceDouaneEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadAgenceDouaneToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadAgencesDouane');
    };

    const performSearch = (query: string) => {
        if (query.trim() === '') {
            loadAllData();
        } else {
            fetchSearchData(null, 'GET', `${BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=100`, 'searchAgencesDouane');
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
                    onClick={clearFilterAgenceDouane} 
                />
                <span className="p-input-icon-left" style={{ width: '300px' }}>
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Rechercher par libellé..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    return <>
        <Toast ref={toast} />
        <Dialog 
            header="Modifier Agence Douane" 
            visible={editAgenceDouaneDialog} 
            style={{ width: '50vw' }} 
            modal 
            onHide={() => setEditAgenceDouaneDialog(false)}
        >
            <AgenceDouaneForm 
                agenceDouane={agenceDouaneEdit as AgenceDouane} 
                handleChange={handleChangeEdit} 
            />
            <div className="flex justify-content-end gap-2 mt-3">
                <Button 
                    label="Annuler" 
                    icon="pi pi-times" 
                    onClick={() => setEditAgenceDouaneDialog(false)} 
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
                <AgenceDouaneForm 
                    agenceDouane={agenceDouane as AgenceDouane} 
                    handleChange={handleChange} 
                />
                <div className="card p-fluid">
                    <div className="formgrid grid">
                        <div className="md:col-offset-3 md:field md:col-3">
                            <Button 
                                icon="pi pi-refresh" 
                                outlined 
                                label="Réinitialiser" 
                                onClick={() => setAgenceDouane(new AgenceDouane())} 
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
                                value={agencesDouane} 
                                header={renderSearch} 
                                emptyMessage={searchTerm ? "Aucune agence de douane trouvée pour cette recherche" : "Pas d'agence de douane à afficher"}
                                loading={loading || searchLoading}
                                paginator
                                rows={10}
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} agences"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            >
                                <Column field="libelle" header="Libellé" sortable />
                                <Column header="Responsable" field="responsable" sortable />
                                <Column header="Adresse" field="adresse" sortable />
                                <Column header="Tél" field="tel" sortable />
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

export default AgenceDouaneComponent;