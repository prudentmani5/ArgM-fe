'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
//import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixAbonnement } from './PrixAbonnement';
import PrixAbonnementForm from './PrixAbonnementForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixAbonnementComponent() {
    const [prixAbonnement, setPrixAbonnement] = useState<PrixAbonnement>(new PrixAbonnement());
    const [prixAbonnementEdit, setPrixAbonnementEdit] = useState<PrixAbonnement>(new PrixAbonnement());
    const [editPrixAbonnementDialog, setEditPrixAbonnementDialog] = useState(false);
    const [prixAbonnements, setPrixAbonnements] = useState<PrixAbonnement[]>([]);
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
            if (callType === 'loadPrixAbonnements') {
                setPrixAbonnements(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixAbonnement((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixAbonnementEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixAbonnement.poids1 <= 0 || prixAbonnement.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixAbonnement.poids1 >= prixAbonnement.poids2) {
            accept('error', 'Erreur', 'Le poids 2 doit être supérieur au poids 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixAbonnement, 'POST', `${API_BASE_URL}/prixabonnements/new`, 'createPrixAbonnement');
    };

    const handleSubmitEdit = () => {
        if (prixAbonnementEdit.poids1 <= 0 || prixAbonnementEdit.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixAbonnementEdit.poids1 >= prixAbonnementEdit.poids2) {
            accept('error', 'Erreur', 'Le poids 2 doit être supérieur au poids 1');
            return;
        }

        setBtnLoading(true);
        fetchData(prixAbonnementEdit, 'PUT', `${API_BASE_URL}/prixabonnements/update/` + prixAbonnementEdit.paramAboneId, 'updatePrixAbonnement');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixAbonnement') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix d\'abonnement');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixAbonnement') {
                setPrixAbonnement(new PrixAbonnement());
                accept('success', 'Succès', 'Prix d\'abonnement créé avec succès');
            } else if(callType === 'updatePrixAbonnement') {
                accept('success', 'Succès', 'Prix d\'abonnement modifié avec succès');
                setPrixAbonnementEdit(new PrixAbonnement());
                setEditPrixAbonnementDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixAbonnementToEdit = (data: PrixAbonnement) => {
        if (data) {
            setEditPrixAbonnementDialog(true);
            setPrixAbonnementEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixAbonnementToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixabonnements/findall`, 'loadPrixAbonnements');
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
                header="Modifier Prix d'Abonnement" 
                visible={editPrixAbonnementDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixAbonnementDialog(false)}
            >
                <PrixAbonnementForm 
                    prixAbonnement={prixAbonnementEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixAbonnementDialog(false)} 
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
                    <PrixAbonnementForm 
                        prixAbonnement={prixAbonnement} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixAbonnement(new PrixAbonnement())} 
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
                            value={prixAbonnements} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix d'abonnement trouvé"
                        >
                            <Column field="poids1" header="Poids Min (kg)" body={(rowData) => `${rowData.poids1} kg`} sortable />
                            <Column field="poids2" header="Poids Max (kg)" body={(rowData) => `${rowData.poids2} kg`} sortable />
                            <Column field="montantMois" header="Mensuel" body={(rowData) => formatCurrency(rowData.montantMois)} sortable />
                            <Column field="montantTour" header="Par Tour" body={(rowData) => formatCurrency(rowData.montantTour)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixAbonnementComponent;