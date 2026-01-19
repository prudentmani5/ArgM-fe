'use client';

import { useEffect, useRef, useState } from "react";
import { Fonction } from "./fonction";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import FonctionForm from "./FonctionForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const FonctionComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [fonction, setFonction] = useState<Fonction>(Fonction.createEmpty());
    const [fonctionEdit, setFonctionEdit] = useState<Fonction>(Fonction.createEmpty());
    const [editFonctionDialog, setEditFonctionDialog] = useState(false);
    const [fonctions, setFonctions] = useState<Fonction[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        if (data) {
            if (callType === 'loadFonctions') {
                setFonctions(Array.isArray(data) ? data : [data]);
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFonction((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFonctionEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!fonction.FonctionId || !fonction.Libelle) {
            accept('warn', 'Attention', 'Les champs Fonction ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(fonction, 'Post', baseUrl + '/fonctions/new', 'createFonction');
    };

    const handleSubmitEdit = () => {
        if (!fonctionEdit.FonctionId || !fonctionEdit.Libelle) {
            accept('warn', 'Attention', 'Les champs Fonction ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(fonctionEdit, 'Put', baseUrl + '/fonctions/update/' + fonctionEdit.FonctionId, 'updateFonction');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateFonction')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateFonction')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des fonctions.');
        else if (data !== null && error === null) {
            if (callType === 'createFonction') {
                setFonction(Fonction.createEmpty());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateFonction') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setFonctionEdit(Fonction.createEmpty());
                setEditFonctionDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterFonction = () => {
        // Implement filter clearing logic if needed
    };

    const loadFonctionToEdit = (data: Fonction) => {
        if (data) {
            setEditFonctionDialog(true);
            setFonctionEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadFonctionToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/fonctions/findall', 'loadFonctions');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setFonction(Fonction.createEmpty());
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterFonction} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText placeholder="Recherche" />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Fonction"
                visible={editFonctionDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setEditFonctionDialog(false)}
            >
                <FonctionForm
                    fonction={fonctionEdit}
                    handleChange={handleChangeEdit}
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
                    <FonctionForm
                        fonction={fonction}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setFonction(Fonction.createEmpty())}
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
                                    value={fonctions}
                                    header={renderSearch}
                                    emptyMessage={"Pas de fonctions à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="FonctionId" header="Fonction ID" sortable />
                                    <Column field="Libelle" header="Libellé" sortable />
                                    <Column field="Description" header="Description" sortable />
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

export default FonctionComponent;