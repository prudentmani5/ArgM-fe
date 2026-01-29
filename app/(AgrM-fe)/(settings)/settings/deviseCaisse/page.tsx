'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { DeviseCaisse } from './DeviseCaisse';
import DeviseCaisseForm from './DeviseCaisseForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function DeviseCaisseComponent() {
    const [deviseCaisse, setDeviseCaisse] = useState<DeviseCaisse>(new DeviseCaisse());
    const [deviseCaisseEdit, setDeviseCaisseEdit] = useState<DeviseCaisse>(new DeviseCaisse());
    const [editDeviseCaisseDialog, setEditDeviseCaisseDialog] = useState(false);
    const [devisesCaisse, setDevisesCaisse] = useState<DeviseCaisse[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState<string>('');

    const BASE_URL = buildApiUrl('/deviseCaisses');

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
            if (callType === 'loadDevisesCaisse') {
                setDevisesCaisse(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeviseCaisse((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeviseCaisseEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!deviseCaisse.codeDevise || !deviseCaisse.libelle) {
            accept('warn', 'Attention', 'Veuillez remplir tous les champs obligatoires');
            return;
        }

        setBtnLoading(true);
        const deviseToSend = { ...deviseCaisse, deviseId: null };
        fetchData(deviseToSend, 'POST', `${BASE_URL}/new`, 'createDeviseCaisse');
        setDeviseCaisse(new DeviseCaisse());
    };

    const handleSubmitEdit = () => {
        if (!deviseCaisseEdit.deviseId) {
            accept('error', 'Erreur', 'ID de la devise manquant');
            return;
        }

        setBtnLoading(true);
        fetchData(
            deviseCaisseEdit, 
            'PUT', 
            `${BASE_URL}/update/${deviseCaisseEdit.deviseId}`, 
            'updateDeviseCaisse'
        );
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateDeviseCaisse') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas été effectué.');
            } else {
                accept('warn', 'Attention', 'La mise à jour n\'a pas été effectuée.');
            }
        } else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des devises.');
        } else if (data !== null && error === null) {
            if (callType === 'createDeviseCaisse') {
                setDeviseCaisse(new DeviseCaisse());
                accept('info', 'Succès', 'Devise créée avec succès.');
            } else if (callType === 'updateDeviseCaisse') {
                accept('info', 'Succès', 'Devise mise à jour avec succès.');
                setDeviseCaisseEdit(new DeviseCaisse());
                setEditDeviseCaisseDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setGlobalFilter('');
    };

    const loadDeviseCaisseToEdit = (data: DeviseCaisse) => {
        if (data) {
            setEditDeviseCaisseDialog(true);
            setDeviseCaisseEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadDeviseCaisseToEdit(data)} 
                    raised 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadDevisesCaisse');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const filteredData = devisesCaisse.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            codeDevise: item.codeDevise || '',
            libelle: item.libelle || ''
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
                header="Modifier Devise" 
                visible={editDeviseCaisseDialog} 
                style={{ width: '30vw' }} 
                modal 
                onHide={() => setEditDeviseCaisseDialog(false)}
            >
                <DeviseCaisseForm 
                    deviseCaisse={deviseCaisseEdit} 
                    handleChange={handleChangeEdit} 
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditDeviseCaisseDialog(false)} 
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
                    <DeviseCaisseForm 
                        deviseCaisse={deviseCaisse} 
                        handleChange={handleChange} 
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setDeviseCaisse(new DeviseCaisse())} 
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
                                    emptyMessage={"Pas de devises à afficher"}
                                    filters={{ global: { value: globalFilter, matchMode: 'contains' } }}
                                >
                                    <Column field="codeDevise" header="Code Devise" sortable />
                                    <Column field="libelle" header="Libellé" sortable />
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

export default DeviseCaisseComponent;