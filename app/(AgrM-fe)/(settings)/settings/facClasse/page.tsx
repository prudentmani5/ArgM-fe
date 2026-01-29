// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { FacClasse } from './FacClasse';
import FacClasseForm from './FacClasseForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function FacClasseComponent() {
    const [facClasse, setFacClasse] = useState<FacClasse>(new FacClasse());
    const [facClasseEdit, setFacClasseEdit] = useState<FacClasse>(new FacClasse());
    const [editFacClasseDialog, setEditFacClasseDialog] = useState(false);
    const [facClasses, setFacClasses] = useState<FacClasse[]>([]);
    const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/facclasses');

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
            if (callType === 'loadFacClasses') {
                setFacClasses(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadCategories') {
                const formattedCategories = Array.isArray(data) 
                    ? data.map(cat => ({ label: cat.libelle, value: cat.categorieId }))
                    : [{ label: data.libelle, value: data.categorieId }];
                setCategories(formattedCategories);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    useEffect(() => {
        // Load categories when component mounts
        fetchData(null, 'GET', buildApiUrl('/categories'), 'loadCategories');
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacClasse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFacClasseEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setFacClasse((prev) => ({ ...prev, [field]: value }));
    };

    const handleNumberChangeEdit = (e: InputNumberValueChangeEvent) => {
        const field = e.target.name;
        const value = e.value;
        setFacClasseEdit((prev) => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        setFacClasse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDropdownChangeEdit = (e: DropdownChangeEvent) => {
        setFacClasseEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(facClasse, 'POST', `${BASE_URL}/new`, 'createFacClasse');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(facClasseEdit, 'PUT', `${BASE_URL}/update/${facClasseEdit.classeId}`, 'updateFacClasse');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateFacClasse') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateFacClasse') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des classes.');
        } else if (data !== null && error === null) {
            if (callType === 'createFacClasse') {
                setFacClasse(new FacClasse());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateFacClasse') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setFacClasseEdit(new FacClasse());
                setEditFacClasseDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFacClasse = () => {
        setFacClasse(new FacClasse());
    };

    const loadFacClasseToEdit = (data: FacClasse) => {
        if (data) {
            setEditFacClasseDialog(true);
            setFacClasseEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadFacClasseToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadFacClasses');
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
                    onClick={clearFilterFacClasse} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Rechercher..." 
                        onInput={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (input.value === '') {
                                loadAllData();
                            }
                        }}
                    />
                </span>
            </div>
        );
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR').format(value || 0);
    };

    const getCategoryLabel = (categorieId: string) => {
        const category = categories.find(cat => cat.value === categorieId);
        return category ? category.label : categorieId;
    };

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Classe"
                visible={editFacClasseDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditFacClasseDialog(false)}>
                <FacClasseForm
                    facClasse={facClasseEdit}
                    handleChange={handleChangeEdit}
                    handleNumberChange={handleNumberChangeEdit}
                    handleDropdownChange={handleDropdownChangeEdit}
                    categories={categories}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditFacClasseDialog(false)} 
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
                <TabPanel header="Nouvelle Classe">
                    <FacClasseForm
                        facClasse={facClasse}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDropdownChange={handleDropdownChange}
                        categories={categories}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={clearFilterFacClasse} 
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
                <TabPanel header="Liste des Classes">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={facClasses} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucune classe trouvée"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} classes"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                >
                                    <Column field="codeClasse" header="Code" sortable filter />
                                    <Column 
                                        field="categorieId" 
                                        header="Catégorie" 
                                        body={(rowData) => getCategoryLabel(rowData.categorieId)} 
                                        sortable 
                                    />
                                    <Column 
                                        field="prixCamion" 
                                        header="Prix Camion" 
                                        body={(rowData) => formatCurrency(rowData.prixCamion)} 
                                        sortable 
                                    />
                                    <Column 
                                        field="prixBarge" 
                                        header="Prix Barge" 
                                        body={(rowData) => formatCurrency(rowData.prixBarge)} 
                                        sortable 
                                    />
                                    <Column field="compte" header="Compte" sortable />
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

export default FacClasseComponent;