// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { TypePackaging } from './TypePackaging';
import TypePackagingForm from './TypePackagingForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { CheckboxChangeEvent } from 'primereact/checkbox';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function TypePackagingComponent() {
    const [typePackaging, setTypePackaging] = useState<TypePackaging>(new TypePackaging());
    const [typePackagingEdit, setTypePackagingEdit] = useState<TypePackaging>(new TypePackaging());
    const [editTypePackagingDialog, setEditTypePackagingDialog] = useState(false);
    const [typePackagings, setTypePackagings] = useState<TypePackaging[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/typepackagings');

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
            if (callType === 'loadTypePackagings') {
                setTypePackagings(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypePackaging((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTypePackagingEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (e: CheckboxChangeEvent) => {
        setTypePackaging((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleCheckboxChangeEdit = (e: CheckboxChangeEvent) => {
        setTypePackagingEdit((prev) => ({ ...prev, [e.target.name]: e.checked }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(typePackaging, 'POST', `${BASE_URL}/new`, 'createTypePackaging');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(typePackagingEdit, 'PUT', `${BASE_URL}/update/${typePackagingEdit.typeConditionId}`, 'updateTypePackaging');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateTypePackaging') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateTypePackaging') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des types de conditionnement.');
        } else if (data !== null && error === null) {
            if (callType === 'createTypePackaging') {
                setTypePackaging(new TypePackaging());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateTypePackaging') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setTypePackagingEdit(new TypePackaging());
                setEditTypePackagingDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterTypePackaging = () => {
        setTypePackaging(new TypePackaging());
    };

    const loadTypePackagingToEdit = (data: TypePackaging) => {
        if (data) {
            setEditTypePackagingDialog(true);
            setTypePackagingEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadTypePackagingToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadTypePackagings');
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
                    onClick={clearFilterTypePackaging} 
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

    const formatBoolean = (value: boolean) => {
        return value ? 'Oui' : 'Non';
    };

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Type de Conditionnement"
                visible={editTypePackagingDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditTypePackagingDialog(false)}>
                <TypePackagingForm
                    typePackaging={typePackagingEdit}
                    handleChange={handleChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditTypePackagingDialog(false)} 
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
                <TabPanel header="Nouveau Type">
                    <TypePackagingForm
                        typePackaging={typePackaging}
                        handleChange={handleChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={clearFilterTypePackaging} 
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
                <TabPanel header="Liste des Types">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={typePackagings} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucun type de conditionnement trouvé"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} types"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                >
                                    <Column field="typeConditionId" header="ID" sortable filter />
                                    <Column field="libelle" header="Libellé" sortable filter />
                                    <Column 
                                        field="fraisPompage" 
                                        header="Frais Pompage" 
                                        body={(rowData) => formatBoolean(rowData.fraisPompage)} 
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

export default TypePackagingComponent;