'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixMarchandiseMagasin } from './PrixMarchandiseMagasin';
import PrixMarchandiseMagasinForm from './PrixMarchandiseMagasinForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixMarchandiseMagasinComponent() {
    const [prixMarchandiseMagasin, setPrixMarchandiseMagasin] = useState<PrixMarchandiseMagasin>(new PrixMarchandiseMagasin());
    const [prixMarchandiseMagasinEdit, setPrixMarchandiseMagasinEdit] = useState<PrixMarchandiseMagasin>(new PrixMarchandiseMagasin());
    const [editPrixMarchandiseMagasinDialog, setEditPrixMarchandiseMagasinDialog] = useState(false);
    const [prixMarchandiseMagasins, setPrixMarchandiseMagasins] = useState<PrixMarchandiseMagasin[]>([]);
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
            if (callType === 'loadPrixMarchandiseMagasins') {
                setPrixMarchandiseMagasins(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixMarchandiseMagasin((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixMarchandiseMagasinEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixMarchandiseMagasin.nbreJr1 <= 0 || prixMarchandiseMagasin.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMarchandiseMagasin.nbreJr1 >= prixMarchandiseMagasin.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMarchandiseMagasin, 'POST', `${API_BASE_URL}/prixmarchandisemagasins/new`, 'createPrixMarchandiseMagasin');
    };

    const handleSubmitEdit = () => {
        if (prixMarchandiseMagasinEdit.nbreJr1 <= 0 || prixMarchandiseMagasinEdit.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Les nombres de jours doivent être positifs');
            return;
        }

        if (prixMarchandiseMagasinEdit.nbreJr1 >= prixMarchandiseMagasinEdit.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours 2 doit être supérieur au nombre de jours 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixMarchandiseMagasinEdit, 'PUT', `${API_BASE_URL}/prixmarchandisemagasins/update/` + prixMarchandiseMagasinEdit.paramMagasinageMagId, 'updatePrixMarchandiseMagasin');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixMarchandiseMagasin') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de marchandise en magasin');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixMarchandiseMagasin') {
                setPrixMarchandiseMagasin(new PrixMarchandiseMagasin());
                accept('success', 'Succès', 'Prix de marchandise en magasin créé avec succès');
            } else if(callType === 'updatePrixMarchandiseMagasin') {
                accept('success', 'Succès', 'Prix de marchandise en magasin modifié avec succès');
                setPrixMarchandiseMagasinEdit(new PrixMarchandiseMagasin());
                setEditPrixMarchandiseMagasinDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixMarchandiseMagasinToEdit = (data: PrixMarchandiseMagasin) => {
        if (data) {
            setEditPrixMarchandiseMagasinDialog(true);
            setPrixMarchandiseMagasinEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixMarchandiseMagasinToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixmarchandisemagasins/findall`, 'loadPrixMarchandiseMagasins');
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
                header="Modifier Prix Marchandise Magasin" 
                visible={editPrixMarchandiseMagasinDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixMarchandiseMagasinDialog(false)}
            >
                <PrixMarchandiseMagasinForm 
                    prixMarchandiseMagasin={prixMarchandiseMagasinEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixMarchandiseMagasinDialog(false)} 
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
                    <PrixMarchandiseMagasinForm 
                        prixMarchandiseMagasin={prixMarchandiseMagasin} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixMarchandiseMagasin(new PrixMarchandiseMagasin())} 
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
                            value={prixMarchandiseMagasins} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de marchandise en magasin trouvé"
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

export default PrixMarchandiseMagasinComponent;