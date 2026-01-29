'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixConteneur } from './PrixConteneur';
import PrixConteneurForm from './PrixConteneurForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixConteneurComponent() {
    const [prixConteneur, setPrixConteneur] = useState<PrixConteneur>(new PrixConteneur());
    const [prixConteneurEdit, setPrixConteneurEdit] = useState<PrixConteneur>(new PrixConteneur());
    const [editPrixConteneurDialog, setEditPrixConteneurDialog] = useState(false);
    const [prixConteneurs, setPrixConteneurs] = useState<PrixConteneur[]>([]);
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
            if (callType === 'loadPrixConteneurs') {
                setPrixConteneurs(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixConteneur((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixConteneurEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixConteneur.nbreJr1 <= 0 || prixConteneur.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Le nombre de jours doit être positif');
            return;
        }

        if (prixConteneur.nbreJr1 >= prixConteneur.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours Max doit être supérieur au nombre de jours Min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixConteneur, 'POST', `${API_BASE_URL}/prixconteneurs/new`, 'createPrixConteneur');
    };

    const handleSubmitEdit = () => {
        if (prixConteneurEdit.nbreJr1 <= 0 || prixConteneurEdit.nbreJr2 <= 0) {
            accept('error', 'Erreur', 'Le nombre de jours doit être positif');
            return;
        }

        if (prixConteneurEdit.nbreJr1 >= prixConteneurEdit.nbreJr2) {
            accept('error', 'Erreur', 'Le nombre de jours Max doit être supérieur au nombre de jours Min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixConteneurEdit, 'PUT', `${API_BASE_URL}/prixconteneurs/update/` + prixConteneurEdit.paramConteneurId, 'updatePrixConteneur');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixConteneur') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de conteneurs');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixConteneur') {
                setPrixConteneur(new PrixConteneur());
                accept('success', 'Succès', 'Prix de conteneur créé avec succès');
            } else if(callType === 'updatePrixConteneur') {
                accept('success', 'Succès', 'Prix de conteneur modifié avec succès');
                setPrixConteneurEdit(new PrixConteneur());
                setEditPrixConteneurDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixConteneurToEdit = (data: PrixConteneur) => {
        if (data) {
            setEditPrixConteneurDialog(true);
            setPrixConteneurEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixConteneurToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixconteneurs/findall`, 'loadPrixConteneurs');
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
                header="Modifier Prix de Conteneur" 
                visible={editPrixConteneurDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixConteneurDialog(false)}
            >
                <PrixConteneurForm 
                    prixConteneur={prixConteneurEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixConteneurDialog(false)} 
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
                    <PrixConteneurForm 
                        prixConteneur={prixConteneur} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixConteneur(new PrixConteneur())} 
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
                            value={prixConteneurs} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de conteneur trouvé"
                        >
                            <Column field="nbreJr1" header="Jours Min" body={(rowData) => `${rowData.nbreJr1} jours`} sortable />
                            <Column field="nbreJr2" header="Jours Max" body={(rowData) => `${rowData.nbreJr2} jours`} sortable />
                            <Column field="prix20Pieds" header="Prix 20 Pieds" body={(rowData) => formatCurrency(rowData.prix20Pieds)} sortable />
                            <Column field="prix40Pieds" header="Prix 40 Pieds" body={(rowData) => formatCurrency(rowData.prix40Pieds)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixConteneurComponent;