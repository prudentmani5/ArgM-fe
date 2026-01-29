'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixColis } from './PrixColis';
import PrixColisForm from './PrixColisForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixColisComponent() {
    const [prixColis, setPrixColis] = useState<PrixColis>(new PrixColis());
    const [prixColisEdit, setPrixColisEdit] = useState<PrixColis>(new PrixColis());
    const [editPrixColisDialog, setEditPrixColisDialog] = useState(false);
    const [prixColisList, setPrixColisList] = useState<PrixColis[]>([]);
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
            if (callType === 'loadPrixColis') {
                setPrixColisList(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixColis((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixColisEdit((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleSubmit = () => {
        if (prixColis.poids1 <= 0 || prixColis.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixColis.poids1 >= prixColis.poids2) {
            accept('error', 'Erreur', 'Le poids Max doit être supérieur au poids Min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixColis, 'POST', `${API_BASE_URL}/prixcolis/new`, 'createPrixColis');
    };

    const handleSubmitEdit = () => {
        if (prixColisEdit.poids1 <= 0 || prixColisEdit.poids2 <= 0) {
            accept('error', 'Erreur', 'Les poids doivent être positifs');
            return;
        }

        if (prixColisEdit.poids1 >= prixColisEdit.poids2) {
            accept('error', 'Erreur', 'Le poids Max doit être supérieur au poids Min');
            return;
        }

        setBtnLoading(true);
        fetchData(prixColisEdit, 'PUT', `${API_BASE_URL}/prixcolis/update/` + prixColisEdit.paramColisId, 'updatePrixColis');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updatePrixColis') {
                accept('warn', 'Attention', 'L\'enregistrement a échoué');
            } else {
                accept('warn', 'Attention', 'La mise à jour a échoué');
            }
        }
        else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des prix de colis');
        }
        else if (data !== null && error === null) {
            if (callType === 'createPrixColis') {
                setPrixColis(new PrixColis());
                accept('success', 'Succès', 'Prix de colis créé avec succès');
            } else if(callType === 'updatePrixColis') {
                accept('success', 'Succès', 'Prix de colis modifié avec succès');
                setPrixColisEdit(new PrixColis());
                setEditPrixColisDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const loadPrixColisToEdit = (data: PrixColis) => {
        if (data) {
            setEditPrixColisDialog(true);
            setPrixColisEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadPrixColisToEdit(data)} 
                    rounded 
                    severity='warning' 
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixcolis/findall`, 'loadPrixColis');
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
                header="Modifier Prix de Colis" 
                visible={editPrixColisDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => setEditPrixColisDialog(false)}
            >
                <PrixColisForm 
                    prixColis={prixColisEdit} 
                    handleNumberChange={handleNumberChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        label="Annuler" 
                        icon="pi pi-times" 
                        onClick={() => setEditPrixColisDialog(false)} 
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
                    <PrixColisForm 
                        prixColis={prixColis} 
                        handleNumberChange={handleNumberChange}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-refresh" 
                            onClick={() => setPrixColis(new PrixColis())} 
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
                            value={prixColisList} 
                            header={renderSearch}
                            paginator
                            rows={10}
                            emptyMessage="Aucun prix de colis trouvé"
                        >
                            <Column field="poids1" header="Poids Min (kg)" body={(rowData) => `${rowData.poids1} kg`} sortable />
                            <Column field="poids2" header="Poids Max (kg)" body={(rowData) => `${rowData.poids2} kg`} sortable />
                            <Column field="montant" header="Montant" body={(rowData) => formatCurrency(rowData.montant)} sortable />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixColisComponent;