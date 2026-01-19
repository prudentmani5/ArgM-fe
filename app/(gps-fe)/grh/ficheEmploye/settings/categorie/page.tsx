'use client';

import { useEffect, useRef, useState } from "react";
import { Categorie } from "./categorie";
import useConsumApi from "../../../../../../hooks/fetchData/useConsumApi";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import CategorieForm from "./CategorieForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { API_BASE_URL } from '@/utils/apiConfig';

const CategorieComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [categorie, setCategorie] = useState<Categorie>(Categorie.createEmpty());
    const [categorieEdit, setCategorieEdit] = useState<Categorie>(Categorie.createEmpty());
    const [editCategorieDialog, setEditCategorieDialog] = useState(false);
    const [categories, setCategories] = useState<Categorie[]>([]);
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
            if (callType === 'loadCategories') {
                setCategories(Array.isArray(data) ? data : [data]);
            }
        }
        handleAfterApiCall(activeIndex);
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!categorie.CategorieId || !categorie.Libelle) {
            accept('warn', 'Attention', 'Les champs Catégorie ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(categorie, 'Post', baseUrl + '/categories/new', 'createCategorie');
    };

    const handleSubmitEdit = () => {
        if (!categorieEdit.CategorieId || !categorieEdit.Libelle) {
            accept('warn', 'Attention', 'Les champs Catégorie ID et Libellé sont obligatoires');
            return;
        }
        
        setBtnLoading(true);
        fetchData(categorieEdit, 'Put', baseUrl + '/categories/update/' + categorieEdit.CategorieId, 'updateCategorie');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateCategorie')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (callType === 'updateCategorie')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des catégories.');
        else if (data !== null && error === null) {
            if (callType === 'createCategorie') {
                setCategorie(Categorie.createEmpty());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (callType === 'updateCategorie') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCategorieEdit(Categorie.createEmpty());
                setEditCategorieDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilterCategorie = () => {
        // Implement filter clearing logic if needed
    };

    const loadCategorieToEdit = (data: Categorie) => {
        if (data) {
            setEditCategorieDialog(true);
            setCategorieEdit(data);
        }
    };

    const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCategorieToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', baseUrl + '/categories/findall', 'loadCategories');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setCategorie(Categorie.createEmpty());
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilterCategorie} />
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
                header="Modifier Catégorie"
                visible={editCategorieDialog}
                style={{ width: '40vw' }}
                modal
                onHide={() => setEditCategorieDialog(false)}
            >
                <CategorieForm
                    categorie={categorieEdit}
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
                    <CategorieForm
                        categorie={categorie}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setCategorie(Categorie.createEmpty())}
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
                                    value={categories}
                                    header={renderSearch}
                                    emptyMessage={"Pas de catégories à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                >
                                    <Column field="CategorieId" header="Catégorie ID" sortable />
                                    <Column field="Libelle" header="Libellé" sortable />
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

export default CategorieComponent;