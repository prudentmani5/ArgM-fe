'use client';

import { useEffect, useRef, useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { Banque } from './Banque';
import BanqueForm from './BanqueForm';
import { API_BASE_URL } from '@/utils/apiConfig';

const Page = () =>  {
    const [banque, setBanque] = useState<Banque>(new Banque());
    const [banqueEdit, setBanqueEdit] = useState<Banque>(new Banque());
    const [editDialog, setEditDialog] = useState(false);
    const [banques, setBanques] = useState<Banque[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const showToast = (severity: 'success'|'info'|'warn'|'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };
    
    useEffect(() => {
        if (data) {
            if (callType === 'loadBanques') {
                setBanques(Array.isArray(data) ? data : [data]);
            }
            handleApiResponse();
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBanque(prev => ({ ...prev, [name]: value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBanqueEdit(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        setBtnLoading(true);
        fetchData(
            banque, 
            'POST', 
            `${API_BASE_URL}/banques/new`, 
            'createBanque'
        );
    };

    const handleSubmitEdit = () => {
        setBtnLoading(true);
        fetchData(
            banqueEdit, 
            'PUT', 
            `${API_BASE_URL}/banques/update/${banqueEdit.banqueId}`, 
            'updateBanque'
        );
    };

    const handleApiResponse = () => {
        if (error) {
            showToast('error', 'Erreur', 
                callType === 'updateBanque' 
                    ? 'Échec de la mise à jour' 
                    : 'Échec de l\'enregistrement');
        } else if (data) {
            if (callType === 'createBanque') {
                showToast('success', 'Succès', 'Banque enregistrée');
                setBanque(new Banque());
            } else if (callType === 'updateBanque') {
                showToast('success', 'Succès', 'Banque mise à jour');
                setEditDialog(false);
                loadBanques();
            }
        }
        setBtnLoading(false);
    };

    const loadBanques = () => {
        fetchData(
            null, 
            'GET', 
            `${API_BASE_URL}/banques/findall`, 
            'loadBanques'
        );
    };

    const editBanque = (banque: Banque) => {
        setBanqueEdit({ ...banque });
        setEditDialog(true);
    };

    const actionBodyTemplate = (rowData: Banque) => {
        return (
            <Button 
                icon="pi pi-pencil" 
                rounded 
                severity="warning" 
                onClick={() => editBanque(rowData)} 
            />
        );
    };

    const onTabChange = (e: { index: number }) => {
        setActiveIndex(e.index);
        if (e.index === 1) loadBanques();
    };

    const renderHeader = () => (
        <div className="flex justify-content-between">
            <Button 
                icon="pi pi-refresh" 
                label="Réinitialiser" 
                outlined 
                onClick={() => setBanque(new Banque())} 
            />
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText placeholder="Rechercher" />
            </span>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog 
                header="Modifier Banque" 
                visible={editDialog} 
                style={{ width: '30vw' }}
                onHide={() => setEditDialog(false)}
            >
                <BanqueForm 
                    banque={banqueEdit} 
                    handleChange={handleChangeEdit} 
                />
                <div className="flex justify-content-end mt-3">
                    <Button 
                        label="Modifier" 
                        icon="pi pi-check" 
                        loading={btnLoading}
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>

            <TabView activeIndex={activeIndex} onTabChange={onTabChange}>
                <TabPanel header="Nouvelle Banque">
                    <BanqueForm 
                        banque={banque} 
                        handleChange={handleChange} 
                    />
                    <div className="flex justify-content-center gap-3 mt-3">
                        <Button 
                            label="Réinitialiser" 
                            icon="pi pi-times" 
                            outlined 
                            onClick={() => setBanque(new Banque())} 
                        />
                        <Button 
                            label="Enregistrer" 
                            icon="pi pi-check" 
                            loading={btnLoading}
                            onClick={handleSubmit} 
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste des Banques">
                    <DataTable
                        value={banques}
                        header={renderHeader()}
                        emptyMessage="Aucune banque trouvée"
                        className="mt-3"
                    >
                        <Column field="sigle" header="Sigle" />
                        <Column field="libelleBanque" header="Libellé Banque" />
                        <Column field="compte" header="Compte" />
                        <Column body={actionBodyTemplate} header="Actions" />
                    </DataTable>
                </TabPanel>
            </TabView>
        </>
    );
}
export default Page;