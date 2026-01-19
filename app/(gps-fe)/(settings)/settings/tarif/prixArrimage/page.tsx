'use client';

import { useEffect, useRef, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PrixArrimage } from './PrixArrimage';
import PrixArrimageForm from './PrixArrimageForm';
import { API_BASE_URL } from '@/utils/apiConfig';

export default function PrixArrimagePage() {
    const [prixArrimage, setPrixArrimage] = useState(new PrixArrimage());
    const [prixArrimages, setPrixArrimages] = useState<PrixArrimage[]>([]);
    const [editDialog, setEditDialog] = useState(false);
    const [editingItem, setEditingItem] = useState(new PrixArrimage());
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, error, callType, fetchData } = useConsumApi('');
    const toast = useRef<Toast>(null);

    const showToast = (severity: any, summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadAll') {
                setPrixArrimages(Array.isArray(data) ? data : [data]);
            } else if (callType === 'create') {
                showToast('success', 'Création réussie', 'Prix d\'arrimage ajouté');
                setPrixArrimage(new PrixArrimage());
            } else if (callType === 'update') {
                showToast('success', 'Modification réussie', 'Prix d\'arrimage mis à jour');
                setEditDialog(false);
            }
        }

        if (error) {
            showToast('error', 'Erreur', 'Une erreur est survenue');
        }
    }, [data, error]);

    const handleNumberChange = (field: string, value: number | null) => {
        setPrixArrimage((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const handleNumberChangeEdit = (field: string, value: number | null) => {
        setEditingItem((prev) => ({ ...prev, [field]: value ?? 0 }));
    };

    const submitNew = () => {
        if (prixArrimage.poids1 <= 0 || prixArrimage.poids2 <= 0 || prixArrimage.poids1 >= prixArrimage.poids2) {
            showToast('warn', 'Validation', 'Poids invalides');
            return;
        }
        fetchData(prixArrimage, 'POST', `${API_BASE_URL}/prixarrimages/new`, `create`);
    };

    const submitEdit = () => {
        if (editingItem.poids1 <= 0 || editingItem.poids2 <= 0 || editingItem.poids1 >= editingItem.poids2) {
            showToast('warn', 'Validation', 'Poids invalides');
            return;
        }
        fetchData(editingItem, 'PUT', `${API_BASE_URL}/prixarrimages/update/${editingItem.paramArrimageId}`, 'update');
    };

    const loadAll = () => {
        fetchData(null, 'GET', `${API_BASE_URL}/prixarrimages/findall`, `loadAll`);
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog header="Modifier Prix Arrimage" visible={editDialog} onHide={() => setEditDialog(false)}>
                <PrixArrimageForm prixArrimage={editingItem} handleNumberChange={handleNumberChangeEdit} />
                <Button label="Modifier" onClick={submitEdit} />
            </Dialog>

            <TabView activeIndex={activeIndex} onTabChange={(e) => { setActiveIndex(e.index); if (e.index === 1) loadAll(); }}>
                <TabPanel header="Créer">

                    <PrixArrimageForm prixArrimage={prixArrimage} handleNumberChange={handleNumberChange} />
                    <div className="flex justify-content-end gap-2 mt-3">
               
                    <Button 
                                    label="Réinitialiser" 
                                                  icon="pi pi-refresh" 
                                                  onClick={() => setPrixArrimage(new PrixArrimage())} 
                                                  severity="secondary" 
                                              />
                    <Button label="Enregistrer" icon="pi pi-save" onClick={submitNew} />
                    </div>
                </TabPanel>
                <TabPanel header="Liste">
                    <div className="flex justify-content-between mb-3">
                        <Button label="Initilialiser" icon="pi pi-refresh" onClick={loadAll} />
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText placeholder="Recherche..." />
                        </span>
                    </div>
                    <DataTable value={prixArrimages} paginator rows={10}>
                        <Column field="poids1" header="Poids 1" />
                        <Column field="poids2" header="Poids 2" />
                        <Column field="montant" header="Montant" body={(data) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'BIF' }).format(data.montant)} />
                        <Column body={(rowData) => <Button icon="pi pi-pencil" onClick={() => { setEditingItem(rowData); setEditDialog(true); }} />} />
                    </DataTable>
                </TabPanel>
            </TabView>
        </>
    );
}
