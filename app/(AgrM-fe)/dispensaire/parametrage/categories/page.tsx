'use client';

import { useEffect, useRef, useState } from "react";
import { CategoryArticle } from "./CategoryArticle";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import CategoryArticleForm from "./CategoryArticleForm";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Magasin } from "./Magasin";
import { DropdownChangeEvent } from "primereact/dropdown";
import { API_BASE_URL } from '@/utils/apiConfig';

const CategoryArticleComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [category, setCategory] = useState<CategoryArticle>(new CategoryArticle());
    const [categoryEdit, setCategoryEdit] = useState<CategoryArticle>(new CategoryArticle());
    const [editCategoryDialog, setEditCategoryDialog] = useState(false);
    const [categories, setCategories] = useState<CategoryArticle[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const toast = useRef<Toast>(null);
    const [magasins, setMagasins] = useState<Magasin[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    const fetchData = async (url: string, method: string = 'GET', body?: any) => {
        setLoading(true);
        setError(null);
        
        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (body && method !== 'GET') {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllMagasins();
    }, []);

    const handleAfterApiCall = (chosenTab: number, success: boolean, actionType?: string) => {
        if (error !== null && chosenTab === 0) {
            if (actionType !== 'updateCategory')
                accept('warn', 'A votre attention', 'L\'enregistrement n\'a pas été éffectué.');
            else if (actionType === 'updateCategory')
                accept('warn', 'A votre attention', 'La mise à jour n\'a pas été éffectuée.');
        }
        else if (error !== null && chosenTab === 1)
            accept('warn', 'A votre attention', 'Impossible de charger la liste des catégories.');
        else if (success) {
            if (actionType === 'createCategory') {
                setCategory(new CategoryArticle());
                accept('info', 'OK', 'L\'enregistrement a été éffectué avec succès.');
            } else if (actionType === 'updateCategory') {
                accept('info', 'OK', 'La modification a été éffectuée avec succès.');
                setCategoryEdit(new CategoryArticle());
                setEditCategoryDialog(false);
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const handleSubmit = async () => {
        setBtnLoading(true);
        try {
            await fetchData(baseUrl + '/list_category_articles/new', 'POST', category);
            handleAfterApiCall(0, true, 'createCategory');
        } catch {
            handleAfterApiCall(0, false, 'createCategory');
        }
    };

    const handleSubmitEdit = async () => {
        setBtnLoading(true);
        try {
            await fetchData(baseUrl + '/list_category_articles/update/' + categoryEdit.id, 'PUT', categoryEdit);
            handleAfterApiCall(0, true, 'updateCategory');
        } catch {
            handleAfterApiCall(0, false, 'updateCategory');
        }
    };

    const loadAllData = async () => {
        try {
            const data = await fetchData(baseUrl + '/list_category_articles/findall');
            setCategories(Array.isArray(data) ? data : [data]);
        } catch {
            handleAfterApiCall(1, false);
        }
    };

    const loadAllMagasins = async () => {
        try {
            const data = await fetchData(baseUrl + '/magasins/findall');
            setMagasins(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error("Erreur lors du chargement des magasins:", err);
        }
    };

     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ... (le reste du code reste inchangé)
    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setCategory(new CategoryArticle());
        }
        setActiveIndex(e.index);
    };

    function onDropdownSelect(e: DropdownChangeEvent) {
        setCategory((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

     const optionButtons = (data: any, options: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCategoryToEdit(data)} raised severity='warning' />
            </div>
        );
    };

     const loadCategoryToEdit = (data: CategoryArticle) => {
        if (data) {
            setEditCategoryDialog(true);
            setCategoryEdit(data);
        }
    };

      const clearFilter = () => {
        // Implement filter clearing logic if needed
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilter} />
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
                visible={editCategoryDialog}
                style={{ width: '30vw' }}
                modal
                onHide={() => setEditCategoryDialog(false)}
            >
                <CategoryArticleForm
                    category={categoryEdit}
                    magasins={magasins}
                    handleChange={handleChangeEdit}
                    handleDropDownSelect={onDropdownSelect}
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
                    <CategoryArticleForm
                        category={category}
                        magasins={magasins}
                        handleChange={handleChange}
                        handleDropDownSelect={onDropdownSelect}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setCategory(new CategoryArticle())}
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
                                    <Column field="id" header="Code" sortable /> 
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column field="compte" header="Compte" sortable />
                                   
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

export default CategoryArticleComponent;