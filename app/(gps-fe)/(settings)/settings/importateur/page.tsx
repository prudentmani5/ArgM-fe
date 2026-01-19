// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Importer } from './Importer';
import ImporterForm from './ImporterForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import { API_BASE_URL } from '@/utils/apiConfig';

function ImporterComponent() {
    const [importer, setImporter] = useState<Importer>(new Importer());
    const [importerEdit, setImporterEdit] = useState<Importer>(new Importer());
    const [editImporterDialog, setEditImporterDialog] = useState(false);
    const [importers, setImporters] = useState<Importer[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const { data: searchData, loading: searchLoading, error: searchError, fetchData: fetchSearchData, callType: searchCallType } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const BASE_URL = `${API_BASE_URL}/importers`;

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
            if (callType === 'loadImporters') {
                setImporters(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        if (searchData && searchCallType === 'searchImporters') {
            // Handle search results
            if (searchData.content) {
                setImporters(searchData.content);
            } else if (Array.isArray(searchData)) {
                setImporters(searchData);
            } else {
                setImporters([]);
            }
        }
        
        if (searchError && searchCallType === 'searchImporters') {
            accept('warn', 'Erreur', 'Erreur lors de la recherche');
            setImporters([]);
        }
    }, [searchData, searchError, searchCallType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImporter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImporterEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setImporter((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setImporterEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setImporter((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setImporterEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleSubmit = () => {
        if (!importer.nom) {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        setBtnLoading(true);
        fetchData(importer, 'POST', `${BASE_URL}/new`, 'createImporter');
    };

    const handleSubmitEdit = () => {
        if (!importerEdit.nom || !importerEdit.nif) {
            accept('warn', 'Attention', 'Le nom et le NIF sont obligatoires');
            return;
        }
        setBtnLoading(true);
        fetchData(importerEdit, 'PUT', `${BASE_URL}/update/${importerEdit.importateurId}`, 'updateImporter');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateImporter') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateImporter') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des importateurs.');
        } else if (data !== null && error === null) {
            if (callType === 'createImporter') {
                setImporter(new Importer());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateImporter') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setImporterEdit(new Importer());
                setEditImporterDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterImporter = () => {
        setSearchTerm('');
        loadAllData();
    };

    const loadImporterToEdit = (data: Importer) => {
        if (data) {
            setEditImporterDialog(true);
            setImporterEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadImporterToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadImporters');
    };

    const performSearch = (query: string) => {
        if (query.trim() === '') {
            loadAllData();
        } else {
            fetchSearchData(null, 'GET', `${BASE_URL}/search?query=${encodeURIComponent(query)}&page=0&size=100`, 'searchImporters');
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
                    onClick={clearFilterImporter} 
                />
                <span className="p-input-icon-left" style={{ width: '300px' }}>
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Rechercher par nom ou NIF..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const formatBoolean = (value: boolean) => {
        return value ? 'Oui' : 'Non';
    };

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Importateur"
                visible={editImporterDialog}
                style={{ width: '70vw' }}
                modal
                onHide={() => setEditImporterDialog(false)}>
                <ImporterForm
                    importer={importerEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditImporterDialog(false)} 
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
                <TabPanel header="Nouvel Importateur">
                    <ImporterForm
                        importer={importer}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setImporter(new Importer())} 
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
                <TabPanel header="Liste des Importateurs">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={importers} 
                                    header={renderSearch} 
                                    emptyMessage={searchTerm ? "Aucun importateur trouvé pour cette recherche" : "Aucun importateur trouvé"}
                                    loading={loading || searchLoading}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} importateurs"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                >
                                    <Column field="nom" header="Nom" sortable />
                                    <Column field="nif" header="NIF" sortable />
                                    <Column field="tel" header="Téléphone" sortable />
                                    <Column field="email" header="Email" sortable />
                                    <Column 
                                        field="actif" 
                                        header="Actif" 
                                        body={(rowData) => formatBoolean(rowData.actif)} 
                                        sortable 
                                    />
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
        </>
    );
}

export default ImporterComponent;