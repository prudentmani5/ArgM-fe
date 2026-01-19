'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { PrixAccostage } from './PrixAccostage';
import PrixAccostageForm from './PrixAccostageForm';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { API_BASE_URL } from '@/utils/apiConfig';

function PrixAccostageComponent() {
    const [prixAccostage, setPrixAccostage] = useState<PrixAccostage>(new PrixAccostage());
    const [prixAccostageEdit, setPrixAccostageEdit] = useState<PrixAccostage>(new PrixAccostage());
    const [editDialog, setEditDialog] = useState(false);
    const [items, setItems] = useState<PrixAccostage[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (data) {
            if (callType === 'loadPrixAccostages') {
                setItems(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixAccostage(prev => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setPrixAccostageEdit(prev => ({ ...prev, [field]: value ?? 0 }));
    };

    const submit = () => {
        if (prixAccostage.longueur1 >= prixAccostage.longueur2) {
            showToast('error', 'Erreur', 'Longueur 2 doit être > à Longueur 1');
            return;
        }
        setBtnLoading(true);
        fetchData(prixAccostage, 'POST', `${API_BASE_URL}/prixaccostages/new`, `createPrixAccostage`);
    };

    const submitEdit = () => {
        if (prixAccostageEdit.longueur1 >= prixAccostageEdit.longueur2) {
            showToast('error', 'Erreur', 'Longueur 2 doit être > à Longueur 1');
            return;
        }
        setBtnLoading(true);
        fetchData(prixAccostageEdit, 'PUT', `${API_BASE_URL}/prixaccostages/update/${prixAccostageEdit.paramAccostageId}`, 'updatePrixAccostage');
    };

    const handleAfterApiCall = (tab: number) => {
        if (error) {
            showToast('warn', 'Échec', 'Une erreur est survenue');
        } else {
            if (callType === 'createPrixAccostage') {
                showToast('success', 'Succès', 'Prix ajouté');
                setPrixAccostage(new PrixAccostage());
            } else if (callType === 'updatePrixAccostage') {
                showToast('success', 'Succès', 'Prix modifié');
                setPrixAccostageEdit(new PrixAccostage());
                setEditDialog(false);
                loadAll();
            }
        }
        setBtnLoading(false);
    };

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const loadAll = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixaccostages/findall`, `loadPrixAccostages`);
    };

    const editRow = (row: PrixAccostage) => {
        setPrixAccostageEdit(row);
        setEditDialog(true);
    };

    const optionButtons = (row: PrixAccostage) => (
        <Button icon="pi pi-pencil" onClick={() => editRow(row)} rounded severity="warning" />
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog header="Modifier Prix d’Accostage" visible={editDialog} style={{ width: '50vw' }} onHide={() => setEditDialog(false)}>
                <PrixAccostageForm prixAccostage={prixAccostageEdit} handleNumberChange={handleNumberChangeEdit} />
                <div className="flex justify-content-end mt-3">
                    <Button label="Enregistrer" loading={btnLoading} onClick={submitEdit} />
                </div>
            </Dialog>

            <TabView activeIndex={activeIndex} onTabChange={(e) => {
                setActiveIndex(e.index);
                if (e.index === 1) loadAll();
            }}>
                <TabPanel header="Nouveau">
                    <PrixAccostageForm prixAccostage={prixAccostage} handleNumberChange={handleNumberChange} />
                    <Button label="Enregistrer" className="mt-3" loading={btnLoading} onClick={submit} />
                </TabPanel>

                <TabPanel header="Liste">
                    <div className="flex justify-content-between mb-3">
                        <Button icon="pi pi-refresh" label="Rafraîchir" onClick={loadAll} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText placeholder="Rechercher..." />
                        </span>
                    </div>

                    <DataTable value={items} paginator rows={5} stripedRows>
                        <Column field="longueur1" header="Longueur 1" />
                        <Column field="longueur2" header="Longueur 2" />
                        <Column field="montant" header="Montant" body={(row) => `${row.montant} BIF`} />
                        <Column body={optionButtons} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </>
    );
}

export default PrixAccostageComponent;
