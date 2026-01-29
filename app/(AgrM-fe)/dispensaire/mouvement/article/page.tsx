'use client';

import { useEffect, useRef, useState } from "react";
import { StkArticle } from "./StkArticle";
import { TabPanel, TabView, TabViewTabChangeEvent } from "primereact/tabview";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import StkArticleForm from "./StkArticleForm";
import { InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { CalendarChangeEvent } from 'primereact/calendar';
import { StkMagasin } from "./StkMagasin";
import { StkSousCategorie } from "./StkSousCategorie";
import { StkUnite } from "./StkUnite";
import { Stkservice } from "./Stkservice";
import { CategoryArticle } from "./CategoryArticle";
import { DropdownChangeEvent } from "primereact/dropdown";
import useConsumApi from "../../../../../hooks/fetchData/useConsumApi";
import { API_BASE_URL } from '@/utils/apiConfig';

const StkArticleComponent = () => {
    const BASE_URL = `${API_BASE_URL}`;
    const [article, setArticle] = useState<StkArticle>(new StkArticle());
    const [articleEdit, setArticleEdit] = useState<StkArticle>(new StkArticle());
    const [editArticleDialog, setEditArticleDialog] = useState(false);
    const [articles, setArticles] = useState<StkArticle[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const toast = useRef<Toast>(null);

    // Données pour les dropdowns
    const [magasins, setMagasins] = useState<StkMagasin[]>([]);
    const [sousCategories, setSousCategories] = useState<StkSousCategorie[]>([]);
    const [unites, setUnites] = useState<StkUnite[]>([]);
    const [services, setServices] = useState<Stkservice[]>([]);
    const [categories, setCategories] = useState<CategoryArticle[]>([]);

    // Create separate API instances for each data type
    const { data: magasinsData, loading: magasinsLoading, error: magasinsError, fetchData: fetchMagasins } = useConsumApi('');
    const { data: articlesData, loading: articlesLoading, error: articlesError, fetchData: fetchArticles } = useConsumApi('');
    const { data: sousCategoriesData, loading: sousCategoriesLoading, error: sousCategoriesError, fetchData: fetchSousCategories } = useConsumApi('');
    const { data: unitesData, loading: unitesLoading, error: unitesError, fetchData: fetchUnites } = useConsumApi('');
    const { data: servicesData, loading: servicesLoading, error: servicesError, fetchData: fetchServices } = useConsumApi('');
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, fetchData: fetchCategories } = useConsumApi('');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    useEffect(() => {
        // Load initial data
        Promise.all([
            fetchMagasins(null, 'GET', `${BASE_URL}/magasins/findall`),
            fetchSousCategories(null, 'GET', `${BASE_URL}/sousCategories/findall`),
            fetchUnites(null, 'GET', `${BASE_URL}/unites/findall`),
            fetchServices(null, 'GET', `${BASE_URL}/services/findall`),
            fetchCategories(null, 'GET', `${BASE_URL}/list_category_articles/findall`)
        ]);
    }, []);

    useEffect(() => {
        if (magasinsData) setMagasins(magasinsData);
        if (articlesData) setArticles(articlesData);
        if (sousCategoriesData) setSousCategories(sousCategoriesData);
        if (unitesData) setUnites(unitesData);
        if (servicesData) setServices(servicesData);
        if (categoriesData) setCategories(categoriesData);

        if (magasinsError || articlesError || sousCategoriesError || unitesError || servicesError || categoriesError) {
            accept('error', 'Erreur', 'Une erreur est survenue lors du chargement des données');
        }
    }, [magasinsData, articlesData, sousCategoriesData, unitesData, servicesData, categoriesData, 
        magasinsError, articlesError, sousCategoriesError, unitesError, servicesError, categoriesError]);

    const loadAllData = async () => {
        await fetchArticles(null, 'GET', `${BASE_URL}/articles/findall`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArticle((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setArticleEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onInputNumberChangeHandler = (e: InputNumberValueChangeEvent) => {
        setArticle((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const onInputNumberChangeHandlerEdit = (e: InputNumberValueChangeEvent) => {
        setArticleEdit((prev) => ({ ...prev, [e.target.name]: e.value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setArticle((prev) => ({ ...prev, [name]: value }));
    };

    const handleDateChangeEdit = (name: string, value: Date | null) => {
        setArticleEdit((prev) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setArticle((prev) => ({ ...prev, [name]: checked }));
    };

    const handleCheckboxChangeEdit = (name: string, checked: boolean) => {
        setArticleEdit((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async () => {
        setBtnLoading(true);
        try {
            await fetchArticles(article, 'POST', `${BASE_URL}/articles/new`);
            accept('info', 'Succès', 'Article créé avec succès');
            setArticle(new StkArticle());
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch {
            accept('error', 'Erreur', "Échec de la création de l'article");
        } finally {
            setBtnLoading(false);
        }
    };

    const handleSubmitEdit = async () => {
        setBtnLoading(true);
        try {
            await fetchArticles(articleEdit, 'PUT', `${BASE_URL}/articles/update/${articleEdit.articleId}`);
            accept('info', 'Succès', 'Article mis à jour avec succès');
            setArticleEdit(new StkArticle());
            setEditArticleDialog(false);
            loadAllData();
        } catch {
            accept('error', 'Erreur', "Échec de la mise à jour de l'article");
        } finally {
            setBtnLoading(false);
        }
    };

    const loadArticleToEdit = (data: StkArticle) => {
        if (data) {
            setEditArticleDialog(true);
            setArticleEdit(data);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadArticleToEdit(data)} raised severity='warning' />
            </div>
        );
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setArticle(new StkArticle());
        }
        setActiveIndex(e.index);
    };

    const onDropdownSelect = (e: DropdownChangeEvent) => {
        if (!editArticleDialog) {
            setArticle((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        } else {
            setArticleEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <Button
                    icon="pi pi-filter-slash"
                    label="Effacer filtres"
                    outlined
                    onClick={() => setGlobalFilter('')}
                />
                <span className="p-input-icon-left" style={{ width: '40%' }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher par code, libellé..."
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const filteredData = articles.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            codeArticle: item.codeArticle || '',
            libelle: item.libelle || '',
            qteStock: item.qteStock || '',
            pump: item.pump || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    

    const formatCurrency = (value: number | null) => {
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'BIF',  // Devise changée en BIF
        currencyDisplay: 'code' // Optionnel : affiche "BIF" au lieu du symbole
    }).format(value || 0);
};

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Modifier Article"
                visible={editArticleDialog}
                style={{ width: '50vw' }}
                modal
                onHide={() => setEditArticleDialog(false)}
            >
                <StkArticleForm
                    article={articleEdit}
                    magasins={magasins}
                    sousCategories={sousCategories}
                    unites={unites}
                    services={services}
                    categories={categories}
                    handleChange={handleChangeEdit}
                    handleValueChange={onInputNumberChangeHandlerEdit}
                    handleDropDownSelect={onDropdownSelect}
                    handleDateChange={handleDateChangeEdit}
                    handleCheckboxChange={handleCheckboxChangeEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button label="Annuler" icon="pi pi-times" onClick={() => setEditArticleDialog(false)} className="p-button-text" />
                    <Button label="Enregistrer" icon="pi pi-check" loading={btnLoading} onClick={handleSubmitEdit} />
                </div>
            </Dialog>

            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <StkArticleForm
                        article={article}
                        magasins={magasins}
                        sousCategories={sousCategories}
                        unites={unites}
                        services={services}
                        categories={categories}
                        handleChange={handleChange}
                        handleValueChange={onInputNumberChangeHandler}
                        handleDropDownSelect={onDropdownSelect}
                        handleDateChange={handleDateChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button
                                    icon="pi pi-refresh"
                                    outlined
                                    label="Réinitialiser"
                                    onClick={() => setArticle(new StkArticle())}
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
                                    value={filteredData}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'articles à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    loading={articlesLoading}
                                >
                                    <Column field="codeArticle" header="Code" sortable />
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column field="catalogue" header="Catalogue" sortable />
                                    <Column field="conditionnement" header="Catégorie" sortable />
                                    <Column field="qteStock" header="Stock" sortable />
                                    <Column field="uniteId" header="Unité" sortable />
                                   <Column field="prixUnitaire" header="PU" body={(rowData) => formatCurrency(rowData.pump)} sortable />
                                    <Column field="PUMP" header="PUMP" body={(rowData) => formatCurrency(rowData.pump)} sortable />
                                    <Column field="seuil" header="S.MIN" sortable />
                                    <Column field="seuilMax" header="S.MAX" sortable />
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

export default StkArticleComponent;