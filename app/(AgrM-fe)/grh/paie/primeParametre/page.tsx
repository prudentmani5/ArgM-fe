'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { PrimeParametre } from './PrimeParametre';
import PrimeParametreForm from './PrimeParametreForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrimeParametreComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [primeParametre, setPrimeParametre] = useState<PrimeParametre>(new PrimeParametre());
    const [primeParametreEdit, setPrimeParametreEdit] = useState<PrimeParametre>(new PrimeParametre());
    const [editPrimeParametreDialog, setEditPrimeParametreDialog] = useState(false);
    const [primeParametres, setPrimeParametres] = useState<PrimeParametre[]>([]);
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
            if (callType === 'loadPrimeParametres') {
                setPrimeParametres(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'codePrime') {
            setPrimeParametre((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setPrimeParametre((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrimeParametreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setPrimeParametre((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrimeParametreEdit((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setPrimeParametre((prev) => ({ ...prev, [field]: checked }));
    };

    const handleCheckboxChangeEdit = (field: string, checked: boolean) => {
        setPrimeParametreEdit((prev) => ({ ...prev, [field]: checked }));
    };

    const handleSubmit = () => {
        if (!primeParametre.codePrime || !primeParametre.libellePrime) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', primeParametre);
        fetchData(primeParametre, 'Post', `${baseUrl}/api/grh/paie/primes/new`, 'createPrimeParametre');
    };

    const handleSubmitEdit = () => {
        if (!primeParametreEdit.libellePrime) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', primeParametreEdit);
        fetchData(primeParametreEdit, 'Put', `${baseUrl}/api/grh/paie/primes/update/${primeParametreEdit.codePrime}`, 'updatePrimeParametre');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createPrimeParametre')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updatePrimeParametre')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des paramètres de prime.');
        else if (data !== null && error === null) {
            if (callType === 'createPrimeParametre') {
                setPrimeParametre(new PrimeParametre());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updatePrimeParametre') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setPrimeParametreEdit(new PrimeParametre());
                setEditPrimeParametreDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterPrimeParametre = () => {
        setGlobalFilter('');
    };

    const loadPrimeParametreToEdit = (data: PrimeParametre) => {
        if (data) {
            setEditPrimeParametreDialog(true);
            console.log("Editing prime parametre: " + data.codePrime);
            setPrimeParametreEdit(data);
        }
    };

    const optionButtons = (data: PrimeParametre, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrimeParametreToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                {/* <Button icon="pi pi-trash" raised severity='danger' tooltip="Supprimer" /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/primes/findall`, 'loadPrimeParametres');
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
                onClick={clearFilterPrimeParametre}
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

    const imposableBodyTemplate = (rowData: PrimeParametre) => {
        return (
            <span className={`p-badge ${rowData.imposable ? 'p-badge-success' : 'p-badge-secondary'}`}>
                {rowData.imposable ? 'Oui' : 'Non'}
            </span>
        );
    };

    const tauxBodyTemplate = (rowData: PrimeParametre) => {
        return `${rowData.taux}%`;
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Paramètre de Prime" 
                visible={editPrimeParametreDialog} 
                style={{ width: '60vw' }} 
                modal 
                onHide={() => setEditPrimeParametreDialog(false)}
            >
                <PrimeParametreForm 
                    primeParametre={primeParametreEdit as PrimeParametre} 
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
                    <PrimeParametreForm 
                        primeParametre={primeParametre as PrimeParametre} 
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
                                    onClick={() => setPrimeParametre(new PrimeParametre())} 
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
                                    value={primeParametres} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucun paramètre de prime à afficher"}
                                    globalFilter={globalFilter}
                                    paginator 
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="codePrime" header="Code" sortable />
                                    <Column field="libellePrime" header="Libellé" sortable />
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

export default PrimeParametreComponent;