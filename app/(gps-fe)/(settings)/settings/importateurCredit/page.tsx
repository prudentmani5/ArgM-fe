'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { ImportateurCredit } from './ImportateurCredit';
import ImportateurCreditForm from './ImportateurCreditForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function ImportateurCreditComponent() {
    const [importateurCredit, setImportateurCredit] = useState<ImportateurCredit>(new ImportateurCredit());
    const [importateurCreditEdit, setImportateurCreditEdit] = useState<ImportateurCredit>(new ImportateurCredit());
    const [editImportateurCreditDialog, setEditImportateurCreditDialog] = useState(false);
    const [importateurCredits, setImportateurCredits] = useState<ImportateurCredit[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

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
            if (callType === 'loadImportateurCredits') {
                setImportateurCredits(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImportateurCredit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setImportateurCreditEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!importateurCredit.nom) {
            accept('warn', 'Attention', 'Le nom est obligatoire');
            return;
        }
        
        setBtnLoading(true);
        const importateurToSend = { ...importateurCredit };
        fetchData(importateurToSend, 'POST', `${API_BASE_URL}/importateurCredits/new`, `createImportateurCredit`);
        setImportateurCredit(new ImportateurCredit());
    };

    const handleSubmitEdit = () => {
        if (!importateurCreditEdit.importateurCreditId) {
            accept('error', 'Erreur', 'ID de l\'importateur manquant');
            return;
        }
        
        setBtnLoading(true);
        fetchData(
            importateurCreditEdit, 
            'PUT', 
            `${API_BASE_URL}/importateurCredits/update/${importateurCreditEdit.importateurCreditId}`, 
            'updateImportateurCredit'
        );
    };

    const handleAfterApiCall = (chooseenTab: number) => {
        if (error !== null && chooseenTab === 0) {
            if (callType !== 'updateImportateurCredit') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chooseenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des importateurs.');
        } else if (data !== null && error === null) {
            if (callType === 'createImportateurCredit') {
                setImportateurCredit(new ImportateurCredit());
                accept('info', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateImportateurCredit') {
                accept('info', 'Succès', 'La modification a été effectuée avec succès.');
                setImportateurCreditEdit(new ImportateurCredit());
                setEditImportateurCreditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setGlobalFilter('');
    };

    const loadImportateurCreditToEdit = (data: ImportateurCredit) => {
        if (data) {
            setEditImportateurCreditDialog(true);
            setImportateurCreditEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadImportateurCreditToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/importateurCredits/findall`, `loadImportateurCredits`);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const filteredData = importateurCredits.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            importateurCreditId: item.importateurCreditId || '',
            nom: item.nom || ''
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
                    onClick={clearFilter} 
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
                header="Modifier Importateur" 
                visible={editImportateurCreditDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditImportateurCreditDialog(false)}
            >
                <ImportateurCreditForm 
                    importateurCredit={importateurCreditEdit} 
                    handleChange={handleChangeEdit} 
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditImportateurCreditDialog(false)} 
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
                    <ImportateurCreditForm 
                        importateurCredit={importateurCredit} 
                        handleChange={handleChange} 
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setImportateurCredit(new ImportateurCredit())} 
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
                                    emptyMessage={"Pas d'importateurs à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                >
                                    <Column field="importateurCreditId" header="ID Importateur" />
                                    <Column field="nom" header="Nom" />
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

export default ImportateurCreditComponent;