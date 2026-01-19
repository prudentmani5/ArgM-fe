// page.tsx
'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { Emballage } from './Emballage';
import EmballageForm from './EmballageForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function EmballageComponent() {
    const [emballage, setEmballage] = useState<Emballage>(new Emballage());
    const [emballageEdit, setEmballageEdit] = useState<Emballage>(new Emballage());
    const [editEmballageDialog, setEditEmballageDialog] = useState(false);
    const [emballages, setEmballages] = useState<Emballage[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/emballages');

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
            if (callType === 'loadEmballages') {
                setEmballages(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmballage((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmballageEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(emballage, 'POST', `${BASE_URL}/new`, 'createEmballage');
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(emballageEdit, 'PUT', `${BASE_URL}/update/${emballageEdit.emballageId}`, 'updateEmballage');
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateEmballage') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else if (callType === 'updateEmballage') {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des emballages.');
        } else if (data !== null && error === null) {
            if (callType === 'createEmballage') {
                setEmballage(new Emballage());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateEmballage') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setEmballageEdit(new Emballage());
                setEditEmballageDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterEmballage = () => {
        setEmballage(new Emballage());
    };

    const loadEmballageToEdit = (data: Emballage) => {
        if (data) {
            setEditEmballageDialog(true);
            setEmballageEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadEmballageToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadEmballages');
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
                    onClick={clearFilterEmballage} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Rechercher par nom..." 
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

    return (  
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Emballage"
                visible={editEmballageDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditEmballageDialog(false)}>
                <EmballageForm
                    emballage={emballageEdit}
                    handleChange={handleChangeEdit} />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditEmballageDialog(false)} 
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
                <TabPanel header="Nouvel Emballage">
                    <EmballageForm
                        emballage={emballage}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={clearFilterEmballage} 
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
                <TabPanel header="Liste des Emballages">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={emballages} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucun emballage trouvé"} 
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} emballages"
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                >
                                    
                                    <Column field="nom" header="Libellé du type d'emballage" sortable filter filterPlaceholder="Filtrer par nom" />
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

export default EmballageComponent;