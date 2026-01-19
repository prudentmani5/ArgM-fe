'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { IndemniteParametre } from './IndemniteParametre';
import IndemniteParametreForm from './IndemniteParametreForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function IndemniteParametreComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [indemniteParametre, setIndemniteParametre] = useState<IndemniteParametre>(new IndemniteParametre());
    const [indemniteParametreEdit, setIndemniteParametreEdit] = useState<IndemniteParametre>(new IndemniteParametre());
    const [editIndemniteParametreDialog, setEditIndemniteParametreDialog] = useState(false);
    const [indemniteParametres, setIndemniteParametres] = useState<IndemniteParametre[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

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
            if (callType === 'loadIndemniteParametres') {
                setIndemniteParametres(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'codeInd') {
            setIndemniteParametre((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setIndemniteParametre((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIndemniteParametreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setIndemniteParametre((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setIndemniteParametreEdit((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setIndemniteParametre((prev) => ({ ...prev, [field]: checked }));
    };

    const handleCheckboxChangeEdit = (field: string, checked: boolean) => {
        setIndemniteParametreEdit((prev) => ({ ...prev, [field]: checked }));
    };

    const handleSubmit = () => {
        if (!indemniteParametre.codeInd || !indemniteParametre.libelleInd) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', indemniteParametre);
        fetchData(indemniteParametre, 'Post', `${baseUrl}/api/grh/paie/indemnites/new`, 'createIndemniteParametre');
    };

    const handleSubmitEdit = () => {
        if (!indemniteParametreEdit.libelleInd) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', indemniteParametreEdit);
        fetchData(indemniteParametreEdit, 'Put', `${baseUrl}/api/grh/paie/indemnites/update/${indemniteParametreEdit.codeInd}`, 'updateIndemniteParametre');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createIndemniteParametre')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateIndemniteParametre')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des paramètres d\'indemnité.');
        else if (data !== null && error === null) {
            if (callType === 'createIndemniteParametre') {
                setIndemniteParametre(new IndemniteParametre());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateIndemniteParametre') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setIndemniteParametreEdit(new IndemniteParametre());
                setEditIndemniteParametreDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterIndemniteParametre = () => {
        setGlobalFilter('');
    };

    const loadIndemniteParametreToEdit = (data: IndemniteParametre) => {
        if (data) {
            setEditIndemniteParametreDialog(true);
            console.log("Editing indemnite parametre: " + data.codeInd);
            setIndemniteParametreEdit(data);
        }
    };

    const optionButtons = (data: IndemniteParametre, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadIndemniteParametreToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                {/* <Button icon="pi pi-trash" raised severity='danger' tooltip="Supprimer" /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/indemnites/findall`, 'loadIndemniteParametres');
    };

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
                onClick={clearFilterIndemniteParametre}
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

    const imposableBodyTemplate = (rowData: IndemniteParametre) => {
        return (
            <span className={`p-badge ${rowData.imposable ? 'p-badge-success' : 'p-badge-secondary'}`}>
                {rowData.imposable ? 'Oui' : 'Non'}
            </span>
        );
    };

    const tauxBodyTemplate = (rowData: IndemniteParametre) => {
        return `${rowData.taux}%`;
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Paramètre d'Indemnité" 
                visible={editIndemniteParametreDialog} 
                style={{ width: '60vw' }} 
                modal 
                onHide={() => setEditIndemniteParametreDialog(false)}
            >
                <IndemniteParametreForm 
                    indemniteParametre={indemniteParametreEdit as IndemniteParametre} 
                    handleChange={handleChangeEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                    isEditMode={true}
                />
                <div className="flex justify-content-end mt-3">
                    <Button 
                        icon="pi pi-check" 
                        label="Modifier" 
                        loading={btnLoading} 
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <IndemniteParametreForm 
                        indemniteParametre={indemniteParametre as IndemniteParametre} 
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
                                    onClick={() => setIndemniteParametre(new IndemniteParametre())} 
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
                                    value={indemniteParametres} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucun paramètre d'indemnité à afficher"}
                                    globalFilter={globalFilter}
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="codeInd" header="Code" sortable />
                                    <Column field="libelleInd" header="Libellé" sortable />
                                    <Column 
                                        field="imposable" 
                                        header="Imposable" 
                                        body={imposableBodyTemplate}
                                        sortable 
                                    />
                                    <Column 
                                        field="taux" 
                                        header="Taux" 
                                        body={tauxBodyTemplate}
                                        sortable 
                                    />
                                    <Column field="compteCompta" header="Compte Comptable" sortable />
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

export default IndemniteParametreComponent;