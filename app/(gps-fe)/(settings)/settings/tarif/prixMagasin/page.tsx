'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixMagasin } from './PrixMagasin';
import PrixMagasinForm from './PrixMagasinForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixMagasinComponent() {
    const [prixMagasin, setPrixMagasin] = useState<PrixMagasin>(new PrixMagasin());
    const [prixMagasinEdit, setPrixMagasinEdit] = useState<PrixMagasin>(new PrixMagasin());
    const [editPrixMagasinDialog, setEditPrixMagasinDialog] = useState(false);
    const [prixMagasins, setPrixMagasins] = useState<PrixMagasin[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity,
            summary,
            detail,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadPrixMagasins') {
                setPrixMagasins(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixMagasin((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixMagasinEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixMagasin.nbreJr1 <= 0 || prixMagasin.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMagasin.nbreJr1 >= prixMagasin.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMagasin, 'POST', `${API_BASE_URL}/prixmagasins/new`, 'createPrixMagasin');
    };

    const handleSubmitEdit = () => {
        if (prixMagasinEdit.nbreJr1 <= 0 || prixMagasinEdit.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMagasinEdit.nbreJr1 >= prixMagasinEdit.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMagasinEdit, 'PUT', `${API_BASE_URL}/prixmagasins/update/` + prixMagasinEdit.paramMagasinageId, 'updatePrixMagasin');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixMagasin') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de magasinage');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixMagasin') {
                setPrixMagasin(new PrixMagasin());
                accept('success', 'Succès', 'Prix de magasinage créé avec succès');
            } else if(callType === 'updatePrixMagasin') {
                accept('success', 'Succès', 'Prix de magasinage modifié avec succès');
                setPrixMagasinEdit(new PrixMagasin());
                setEditPrixMagasinDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixMagasinToEdit = (data: PrixMagasin) => {
        if (data) {
            setEditPrixMagasinDialog(true);
            setPrixMagasinEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixMagasinToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixmagasins/findall`, 'loadPrixMagasins');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(value);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={() => {}} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Rechercher..." />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Prix de Magasinage" 
                visible={editPrixMagasinDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixMagasinDialog(false)}
            >
                <PrixMagasinForm 
                    prixMagasin={prixMagasinEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixMagasinDialog(false)} 
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
                <TabPanel header="Nouveau">
                    <PrixMagasinForm 
                        prixMagasin={prixMagasin} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixMagasin(new PrixMagasin())} 
                            severity="secondary" 
                        />
                        <Button 
                            label="Enregistrer" 
                            icon="pi pi-save" 
                            loading={loading} 
                            onClick={handleSubmit} 
                        />
                    </div>
                </TabPanel>
                
                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable 
                            value={prixMagasins} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de magasinage trouvé"
                        >
                            <Column field="nbreJr1" header="Jours 1" body={(rowData) => `${rowData.nbreJr1} jours`} sortable />
                            <Column field="nbreJr2" header="Jours 2" body={(rowData) => `${rowData.nbreJr2} jours`} sortable />
                            <Column field="prixSac" header="Prix par sac" body={(rowData) => formatCurrency(rowData.prixSac)} sortable />
                            <Column field="prixAutre" header="Prix autre" body={(rowData) => formatCurrency(rowData.prixAutre)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixMagasinComponent;