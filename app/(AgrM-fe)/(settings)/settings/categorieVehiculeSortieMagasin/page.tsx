'use client';

import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { CategorieVehiculeSortieMagasin } from './CategorieVehiculeSortieMagasin';
import CategorieVehiculeSortieMagasinForm from './CategorieVehiculeSortieMagasinForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { buildApiUrl } from '../../../../../utils/apiConfig';

function CategorieVehiculeSortieMagasinComponent() {
    const [categorie, setCategorie] = useState<CategorieVehiculeSortieMagasin>(new CategorieVehiculeSortieMagasin());
    const [categorieEdit, setCategorieEdit] = useState<CategorieVehiculeSortieMagasin>(new CategorieVehiculeSortieMagasin());
    const [editDialog, setEditDialog] = useState(false);
    const [categories, setCategories] = useState<CategorieVehiculeSortieMagasin[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    const BASE_URL = buildApiUrl('/categorievehiculesortiemagazin');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
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
            handleAfterApiCall(activeIndex);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        if (!categorie.libelle) {
            accept('warn', 'Attention', 'Le libelle est obligatoire');
            return;
        }
        setBtnLoading(true);
        fetchData(categorie, 'POST', `${BASE_URL}/new`, 'createCategorie');
    };

    const handleSubmitEdit = () => {
        if (!categorieEdit.libelle) {
            accept('warn', 'Attention', 'Le libelle est obligatoire');
            return;
        }
        setBtnLoading(true);
        fetchData(categorieEdit, 'PUT', `${BASE_URL}/update/` + categorieEdit.categorieVehiculeId, 'updateCategorie');
    };

    const handleAfterApiCall = (chosenTab: number) => {
        if (error !== null && chosenTab === 0) {
            if (callType !== 'updateCategorie') {
                accept('warn', 'Attention', 'L\'enregistrement n\'a pas ete effectue.');
            } else {
                accept('warn', 'Attention', 'La mise a jour n\'a pas ete effectuee.');
            }
        } else if (error !== null && chosenTab === 1) {
            accept('warn', 'Attention', 'Impossible de charger la liste des categories.');
        } else if (data !== null && error === null) {
            if (callType === 'createCategorie') {
                setCategorie(new CategorieVehiculeSortieMagasin());
                accept('info', 'Succes', 'L\'enregistrement a ete effectue avec succes.');
            } else if (callType === 'updateCategorie') {
                accept('info', 'Succes', 'La modification a ete effectuee avec succes.');
                setCategorieEdit(new CategorieVehiculeSortieMagasin());
                setEditDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const clearFilter = () => {
        setCategorie(new CategorieVehiculeSortieMagasin());
    };

    const loadCategorieToEdit = (data: CategorieVehiculeSortieMagasin) => {
        if (data) {
            setEditDialog(true);
            setCategorieEdit(data);
        }
    };

    const optionButtons = (data: CategorieVehiculeSortieMagasin): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadCategorieToEdit(data)}
                    raised
                    severity='warning'
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'GET', `${BASE_URL}/findall`, 'loadCategories');
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button icon="pi pi-refresh" label="Reinitialiser" outlined onClick={clearFilter} />
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
                header="Modifier Categorie"
                visible={editDialog}
                style={{ width: '30vw' }}
                modal
                onHide={() => setEditDialog(false)}
            >
                <CategorieVehiculeSortieMagasinForm
                    categorie={categorieEdit}
                    handleChange={handleChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        label="Annuler"
                        icon="pi pi-times"
                        onClick={() => setEditDialog(false)}
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
                    <CategorieVehiculeSortieMagasinForm
                        categorie={categorie}
                        handleChange={handleChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Reinitialiser"
                                    onClick={clearFilter}
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
                    <div className="card">
                        <DataTable
                            value={categories}
                            rows={5}
                            header={renderSearch}
                            emptyMessage="Aucune categorie trouvee"
                        >
                            <Column field="libelle" header="Libelle" />
                            <Column header="Actions" body={optionButtons} />
                        </DataTable>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default CategorieVehiculeSortieMagasinComponent;
