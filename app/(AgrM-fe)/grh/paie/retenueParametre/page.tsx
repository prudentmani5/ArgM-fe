'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { RetenueParametre } from './RetenueParametre';
import RetenueParametreForm from './RetenueParametreForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function RetenueParametreComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [retenueParametre, setRetenueParametre] = useState<RetenueParametre>(new RetenueParametre());
    const [retenueParametreEdit, setRetenueParametreEdit] = useState<RetenueParametre>(new RetenueParametre());
    const [editRetenueParametreDialog, setEditRetenueParametreDialog] = useState(false);
    const [retenueParametres, setRetenueParametres] = useState<RetenueParametre[]>([]);
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
            if (callType === 'loadRetenueParametres') {
                setRetenueParametres(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'codeRet') {
            setRetenueParametre((prev) => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setRetenueParametre((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRetenueParametreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setRetenueParametre((prev) => ({ ...prev, [field]: checked }));
    };

    const handleCheckboxChangeEdit = (field: string, checked: boolean) => {
        setRetenueParametreEdit((prev) => ({ ...prev, [field]: checked }));
    };

    const handleSubmit = () => {
        if (!retenueParametre.codeRet || !retenueParametre.libelleRet) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', retenueParametre);
        fetchData(retenueParametre, 'Post', `${baseUrl}/api/grh/paie/retenues/new`, 'createRetenueParametre');
    };

    const handleSubmitEdit = () => {
        if (!retenueParametreEdit.libelleRet) {
            accept('warn', 'Validation', 'Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', retenueParametreEdit);
        fetchData(retenueParametreEdit, 'Put', `${baseUrl}/api/grh/paie/retenues/update/${retenueParametreEdit.codeRet}`, 'updateRetenueParametre');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createRetenueParametre')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateRetenueParametre')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des paramètres de retenue.');
        else if (data !== null && error === null) {
            if (callType === 'createRetenueParametre') {
                setRetenueParametre(new RetenueParametre());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateRetenueParametre') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setRetenueParametreEdit(new RetenueParametre());
                setEditRetenueParametreDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterRetenueParametre = () => {
        setGlobalFilter('');
    };

    const loadRetenueParametreToEdit = (data: RetenueParametre) => {
        if (data) {
            setEditRetenueParametreDialog(true);
            console.log("Editing retenue parametre: " + data.codeRet);
            setRetenueParametreEdit(data);
        }
    };

    const optionButtons = (data: RetenueParametre, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadRetenueParametreToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                {/* <Button icon="pi pi-trash" raised severity='danger' tooltip="Supprimer" /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/retenues/findall-including-inactive`, 'loadRetenueParametres');
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
                onClick={clearFilterRetenueParametre}
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

    const imposableBodyTemplate = (rowData: RetenueParametre) => {
        return (
            <span className={`p-badge ${rowData.imposable ? 'p-badge-success' : 'p-badge-secondary'}`}>
                {rowData.imposable ? 'Oui' : 'Non'}
            </span>
        );
    };

    const creditBodyTemplate = (rowData: RetenueParametre) => {
        return (
            <span className={`p-badge ${rowData.estCredit ? 'p-badge-info' : 'p-badge-secondary'}`}>
                {rowData.estCredit ? 'Oui' : 'Non'}
            </span>
        );
    };

    const actifBodyTemplate = (rowData: RetenueParametre) => {
        return (
            <span className={`p-badge ${rowData.actif ? 'p-badge-success' : 'p-badge-danger'}`}>
                {rowData.actif ? 'Oui' : 'Non'}
            </span>
        );
    };

    const displayInPaymentToDOBodyTemplate = (rowData: RetenueParametre) => {
        return (
            <span className={`p-badge ${rowData.displayInPaymentToDO ? 'p-badge-info' : 'p-badge-secondary'}`}>
                {rowData.displayInPaymentToDO ? 'Oui' : 'Non'}
            </span>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Paramètre de Retenue" 
                visible={editRetenueParametreDialog} 
                style={{ width: '60vw' }} 
                modal 
                onHide={() => setEditRetenueParametreDialog(false)}
            >
                <RetenueParametreForm 
                    retenueParametre={retenueParametreEdit as RetenueParametre} 
                    handleChange={handleChangeEdit} 
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
                    <RetenueParametreForm 
                        retenueParametre={retenueParametre as RetenueParametre} 
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
                                    onClick={() => setRetenueParametre(new RetenueParametre())} 
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
                <TabPanel header="Consultation">
                    <div className='grid'>
                        <div className='col-12'>
                            <div className='card'>
                                <DataTable 
                                    value={retenueParametres} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucun paramètre de retenue à afficher"}
                                    globalFilter={globalFilter}
                                    paginator 
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="codeRet" header="Code" sortable />
                                    <Column field="libelleRet" header="Libellé" sortable />
                                    <Column 
                                        field="imposable" 
                                        header="Imposable" 
                                        body={imposableBodyTemplate}
                                        sortable 
                                    />
                                    <Column 
                                        field="estCredit" 
                                        header="Crédit" 
                                        body={creditBodyTemplate}
                                        sortable 
                                    />
                                    <Column field="compteCompta" header="Compte Comptable" sortable />
                                    <Column
                                        field="actif"
                                        header="Actif"
                                        body={actifBodyTemplate}
                                        sortable
                                    />
                                    <Column
                                        field="displayInPaymentToDO"
                                        header="Afficher dans la liste des paiements à effectuer"
                                        body={displayInPaymentToDOBodyTemplate}
                                        sortable
                                    />
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

export default RetenueParametreComponent;