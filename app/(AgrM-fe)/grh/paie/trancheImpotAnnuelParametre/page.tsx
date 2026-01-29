'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { TrancheImpotAnnuelParametre } from './TrancheImpotAnnuelParametre';
import { TrancheImpotAnnuelParametreDetail } from './TrancheImpotAnnuelParametreDetail';
import TrancheImpotAnnuelParametreForm from './TrancheImpotAnnuelParametreForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function TrancheImpotAnnuelParametreComponent() {
    const baseUrl = `${API_BASE_URL}`;
    
    const [trancheImpotAnnuelParametre, setTrancheImpotAnnuelParametre] = useState<TrancheImpotAnnuelParametre>(new TrancheImpotAnnuelParametre());
    const [trancheImpotAnnuelParametreEdit, setTrancheImpotAnnuelParametreEdit] = useState<TrancheImpotAnnuelParametre>(new TrancheImpotAnnuelParametre());
    const [editTrancheImpotAnnuelParametreDialog, setEditTrancheImpotAnnuelParametreDialog] = useState(false);
    const [trancheImpotAnnuelParametres, setTrancheImpotAnnuelParametres] = useState<TrancheImpotAnnuelParametre[]>([]);
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
            if (callType === 'loadTrancheImpotAnnuelParametres') {
                setTrancheImpotAnnuelParametres(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTrancheImpotAnnuelParametre((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTrancheImpotAnnuelParametreEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNumberChange = (field: string, value: number | null) => {
        setTrancheImpotAnnuelParametre((prev) => ({ ...prev, [field]: value || 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setTrancheImpotAnnuelParametreEdit((prev) => ({ ...prev, [field]: value || 0 }));
    };

    // Detail management functions
    const addDetail = () => {
        const newDetail = new TrancheImpotAnnuelParametreDetail();
        newDetail.numero = trancheImpotAnnuelParametre.details.length + 1;
        setTrancheImpotAnnuelParametre((prev) => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));
    };

    const addDetailEdit = () => {
        const newDetail = new TrancheImpotAnnuelParametreDetail();
        newDetail.numero = trancheImpotAnnuelParametreEdit.details.length + 1;
        setTrancheImpotAnnuelParametreEdit((prev) => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));
    };

    const removeDetail = (index: number) => {
        setTrancheImpotAnnuelParametre((prev) => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index).map((detail, i) => ({
                ...detail,
                numero: i + 1
            }))
        }));
    };

    const removeDetailEdit = (index: number) => {
        setTrancheImpotAnnuelParametreEdit((prev) => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index).map((detail, i) => ({
                ...detail,
                numero: i + 1
            }))
        }));
    };

    const onDetailChange = (index: number, field: string, value: number | null) => {
        setTrancheImpotAnnuelParametre((prev) => ({
            ...prev,
            details: prev.details.map((detail, i) => 
                i === index ? { ...detail, [field]: value || 0 } : detail
            )
        }));
    };

    const onDetailChangeEdit = (index: number, field: string, value: number | null) => {
        setTrancheImpotAnnuelParametreEdit((prev) => ({
            ...prev,
            details: prev.details.map((detail, i) => 
                i === index ? { ...detail, [field]: value || 0 } : detail
            )
        }));
    };

    const handleSubmit = () => {
        if (!trancheImpotAnnuelParametre.dateEnVigueur || trancheImpotAnnuelParametre.dateEnVigueur.trim() === '') {
            accept('warn', 'Validation', 'Veuillez saisir la date d\'entrée en vigueur.');
            return;
        }

        // Validate date format
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(trancheImpotAnnuelParametre.dateEnVigueur)) {
            accept('warn', 'Validation', 'Le format de la date doit être YYYY/MM/DD.');
            return;
        }

        if (trancheImpotAnnuelParametre.details.length === 0) {
            accept('warn', 'Validation', 'Veuillez ajouter au moins un détail de tranche.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', trancheImpotAnnuelParametre);
        fetchData(trancheImpotAnnuelParametre, 'Post', `${baseUrl}/api/grh/paie/tranches-impot-annuel/new`, 'createTrancheImpotAnnuelParametre');
    };

    const handleSubmitEdit = () => {
        if (!trancheImpotAnnuelParametreEdit.dateEnVigueur || trancheImpotAnnuelParametreEdit.dateEnVigueur.trim() === '') {
            accept('warn', 'Validation', 'Veuillez saisir la date d\'entrée en vigueur.');
            return;
        }

        // Validate date format
        if (!/^\d{4}\/\d{2}\/\d{2}$/.test(trancheImpotAnnuelParametreEdit.dateEnVigueur)) {
            accept('warn', 'Validation', 'Le format de la date doit être YYYY/MM/DD.');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', trancheImpotAnnuelParametreEdit);
        fetchData(trancheImpotAnnuelParametreEdit, 'Put', `${baseUrl}/api/grh/paie/tranches-impot-annuel/update/${trancheImpotAnnuelParametreEdit.trancheId}`, 'updateTrancheImpotAnnuelParametre');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType === 'createTrancheImpotAnnuelParametre')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été effectué.');
            else if (callType === 'updateTrancheImpotAnnuelParametre')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été effectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des tranches d\'impôt annuel.');
        else if (data !== null && error === null) {
            if (callType === 'createTrancheImpotAnnuelParametre') {
                setTrancheImpotAnnuelParametre(new TrancheImpotAnnuelParametre());
                accept('info', 'OK', 'L\'enregistrement a été effectué avec succès.');
            } else if (callType === 'updateTrancheImpotAnnuelParametre') {
                accept('info', 'OK', 'La modification a été effectuée avec succès.');
                setTrancheImpotAnnuelParametreEdit(new TrancheImpotAnnuelParametre());
                setEditTrancheImpotAnnuelParametreDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterTrancheImpotAnnuelParametre = () => {
        setGlobalFilter('');
    };

    const loadTrancheImpotAnnuelParametreToEdit = (data: TrancheImpotAnnuelParametre) => {
        if (data) {
            setEditTrancheImpotAnnuelParametreDialog(true);
            console.log("Editing tranche impot annuel parametre: " + data.trancheId);
            setTrancheImpotAnnuelParametreEdit({ ...data });
        }
    };

    const optionButtons = (data: TrancheImpotAnnuelParametre, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadTrancheImpotAnnuelParametreToEdit(data)} 
                    raised 
                    severity='warning' 
                    tooltip="Modifier"
                />
                {/* <Button icon="pi pi-trash" raised severity='danger' tooltip="Supprimer" /> */}
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${baseUrl}/api/grh/paie/tranches-impot-annuel/findall`, 'loadTrancheImpotAnnuelParametres');
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
                onClick={clearFilterTrancheImpotAnnuelParametre}
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

    const dateBodyTemplate = (rowData: TrancheImpotAnnuelParametre) => {
        return rowData.dateEnVigueur || 'N/A';
    };

    const detailsBodyTemplate = (rowData: TrancheImpotAnnuelParametre) => {
        return `${rowData.details ? rowData.details.length : 0} tranche(s)`;
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Tranche d'Impôt Annuel" 
                visible={editTrancheImpotAnnuelParametreDialog} 
                style={{ width: '90vw' }} 
                modal 
                onHide={() => setEditTrancheImpotAnnuelParametreDialog(false)}
            >
                <TrancheImpotAnnuelParametreForm 
                    trancheImpotAnnuelParametre={trancheImpotAnnuelParametreEdit as TrancheImpotAnnuelParametre} 
                    handleChange={handleChangeEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                    onAddDetail={addDetailEdit}
                    onRemoveDetail={removeDetailEdit}
                    onDetailChange={onDetailChangeEdit}
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
                    <TrancheImpotAnnuelParametreForm 
                        trancheImpotAnnuelParametre={trancheImpotAnnuelParametre as TrancheImpotAnnuelParametre} 
                        handleChange={handleChange} 
                        handleNumberChange={handleNumberChange}
                        onAddDetail={addDetail}
                        onRemoveDetail={removeDetail}
                        onDetailChange={onDetailChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setTrancheImpotAnnuelParametre(new TrancheImpotAnnuelParametre())} 
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
                                    value={trancheImpotAnnuelParametres} 
                                    header={renderSearch} 
                                    emptyMessage={"Aucune tranche d'impôt annuel à afficher"}
                                    globalFilter={globalFilter}
                                    paginator 
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="trancheId" header="Code" sortable />
                                    <Column 
                                        field="dateEnVigueur" 
                                        header="Date d'entrée en vigueur" 
                                        body={dateBodyTemplate}
                                        sortable 
                                    />
                                    <Column 
                                        header="Nombre de tranches" 
                                        body={detailsBodyTemplate}
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

export default TrancheImpotAnnuelParametreComponent;