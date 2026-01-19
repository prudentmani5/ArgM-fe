'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixMarchandiseMagasinTransit } from './PrixMarchandiseMagasinTransit';
import PrixMarchandiseMagasinTransitForm from './PrixMarchandiseMagasinTransitForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixMarchandiseMagasinTransitComponent() {
    const [prixMarchandiseMagasinTransit, setPrixMarchandiseMagasinTransit] = useState<PrixMarchandiseMagasinTransit>(new PrixMarchandiseMagasinTransit());
    const [prixMarchandiseMagasinTransitEdit, setPrixMarchandiseMagasinTransitEdit] = useState<PrixMarchandiseMagasinTransit>(new PrixMarchandiseMagasinTransit());
    const [editPrixMarchandiseMagasinTransitDialog, setEditPrixMarchandiseMagasinTransitDialog] = useState(false);
    const [prixMarchandiseMagasinTransits, setPrixMarchandiseMagasinTransits] = useState<PrixMarchandiseMagasinTransit[]>([]);
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
            if (callType === 'loadPrixMarchandiseMagasinTransits') {
                setPrixMarchandiseMagasinTransits(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixMarchandiseMagasinTransit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixMarchandiseMagasinTransitEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixMarchandiseMagasinTransit.nbreJr1 <= 0 || prixMarchandiseMagasinTransit.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMarchandiseMagasinTransit.nbreJr1 >= prixMarchandiseMagasinTransit.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMarchandiseMagasinTransit, 'POST', `${API_BASE_URL}/prixmarchandisemagasintransits/new`, 'createPrixMarchandiseMagasinTransit');
    };

    const handleSubmitEdit = () => {
        if (prixMarchandiseMagasinTransitEdit.nbreJr1 <= 0 || prixMarchandiseMagasinTransitEdit.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMarchandiseMagasinTransitEdit.nbreJr1 >= prixMarchandiseMagasinTransitEdit.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMarchandiseMagasinTransitEdit, 'PUT', `${API_BASE_URL}/prixmarchandisemagasintransits/update/` + prixMarchandiseMagasinTransitEdit.paramMagasinageTransitId, 'updatePrixMarchandiseMagasinTransit');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixMarchandiseMagasinTransit') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de marchandise en transit');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixMarchandiseMagasinTransit') {
                setPrixMarchandiseMagasinTransit(new PrixMarchandiseMagasinTransit());
                accept('success', 'Succès', 'Prix de marchandise en transit créé avec succès');
            } else if(callType === 'updatePrixMarchandiseMagasinTransit') {
                accept('success', 'Succès', 'Prix de marchandise en transit modifié avec succès');
                setPrixMarchandiseMagasinTransitEdit(new PrixMarchandiseMagasinTransit());
                setEditPrixMarchandiseMagasinTransitDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixMarchandiseMagasinTransitToEdit = (data: PrixMarchandiseMagasinTransit) => {
        if (data) {
            setEditPrixMarchandiseMagasinTransitDialog(true);
            setPrixMarchandiseMagasinTransitEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixMarchandiseMagasinTransitToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixmarchandisemagasintransits/findall`, 'loadPrixMarchandiseMagasinTransits');
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
                    onClick={loadAllData} 
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
                header="Modifier Prix Marchandise en Transit" 
                visible={editPrixMarchandiseMagasinTransitDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixMarchandiseMagasinTransitDialog(false)}
            >
                <PrixMarchandiseMagasinTransitForm 
                    prixMarchandiseMagasinTransit={prixMarchandiseMagasinTransitEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixMarchandiseMagasinTransitDialog(false)} 
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
                    <PrixMarchandiseMagasinTransitForm 
                        prixMarchandiseMagasinTransit={prixMarchandiseMagasinTransit} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixMarchandiseMagasinTransit(new PrixMarchandiseMagasinTransit())} 
                            severity="secondary" 
                        />
                        <Button 
                            label="Enregistrer" 
                            icon="pi pi-save" 
                            loading={btnLoading} 
                            onClick={handleSubmit} 
                        />
                    </div>
                </TabPanel>
                
                <TabPanel header="Liste">
                    <div className="card">
                        <DataTable 
                            value={prixMarchandiseMagasinTransits} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de marchandise en transit trouvé"
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

export default PrixMarchandiseMagasinTransitComponent;