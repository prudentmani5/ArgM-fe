'use client';

import { useEffect, useRef, useState } from "react";
import { StkArticle } from "./StkArticle";
import { StkArticleStock } from "./StkArticleStock";
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
    const [articleStocks, setArticleStocks] = useState<StkArticleStock[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [calculationProgress, setCalculationProgress] = useState<string>('');
    const [calculatedStocks, setCalculatedStocks] = useState<Map<string, number>>(new Map());
    const [isCalculating, setIsCalculating] = useState<boolean>(false);
    const toast = useRef<Toast>(null);

    // Données pour les dropdowns
    const [magasins, setMagasins] = useState<StkMagasin[]>([]);
    const [sousCategories, setSousCategories] = useState<StkSousCategorie[]>([]);
    const [unites, setUnites] = useState<StkUnite[]>([]);
    const [services, setServices] = useState<Stkservice[]>([]);
    const [categories, setCategories] = useState<CategoryArticle[]>([]);

    // Create separate API instances for each data type
    const { data: magasinsData, loading: magasinsLoading, error: magasinsError, fetchData: fetchMagasins } = useConsumApi('');
    const { data: articleStocksData, loading: articleStocksLoading, error: articleStocksError, fetchData: fetchArticleStocks } = useConsumApi('');
    const { data: sousCategoriesData, loading: sousCategoriesLoading, error: sousCategoriesError, fetchData: fetchSousCategories } = useConsumApi('');
    const { data: unitesData, loading: unitesLoading, error: unitesError, fetchData: fetchUnites } = useConsumApi('');
    const { data: servicesData, loading: servicesLoading, error: servicesError, fetchData: fetchServices } = useConsumApi('');
    const { data: categoriesData, loading: categoriesLoading, error: categoriesError, fetchData: fetchCategories } = useConsumApi('');
    const { data: articlesData, loading: articlesLoading, error: articlesError, fetchData: fetchArticles } = useConsumApi('');

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
        if (articleStocksData) setArticleStocks(articleStocksData);
        if (sousCategoriesData) setSousCategories(sousCategoriesData);
        if (unitesData) setUnites(unitesData);
        if (servicesData) setServices(servicesData);
        if (categoriesData) setCategories(categoriesData);
        if (articlesData) setArticles(articlesData);

        if (magasinsError || articleStocksError || sousCategoriesError || unitesError || servicesError || categoriesError || articlesError) {
            accept('error', 'Erreur', 'Une erreur est survenue lors du chargement des données');
        }
    }, [magasinsData, articleStocksData, sousCategoriesData, unitesData, servicesData, categoriesData, articlesData,
        magasinsError, articleStocksError, sousCategoriesError, unitesError, servicesError, categoriesError, articlesError]);

    // Fonction pour obtenir le libellé de la catégorie à partir de l'ID
    const getCategorieLibelle = (categorieId: string | null) => {
        if (!categorieId) return '';
        const categorie = categories.find(cat => cat.id === categorieId);
        return categorie ? categorie.libelle : categorieId;
    };

    // Fonction pour obtenir le libellé de la sous-catégorie à partir de l'ID
    const getSousCategorieLibelle = (sousCategorieId: string | null) => {
        if (!sousCategorieId) return '';
        const sousCategorie = sousCategories.find(sc => sc.sousCategorieId === sousCategorieId);
        return sousCategorie ? sousCategorie.libelle : sousCategorieId;
    };

    // Fonction pour obtenir le libellé du magasin à partir de l'ID
    const getMagasinNom = (magasinId: string | null) => {
        if (!magasinId) return '';
        const magasin = magasins.find(mag => mag.magasinId === magasinId);
        return magasin ? magasin.nom : magasinId;
    };

    // Fonction pour obtenir le libellé de l'unité à partir de l'ID
    const getUniteLibelle = (uniteId: string | null) => {
        if (!uniteId) return '';
        const unite = unites.find(u => u.uniteId === uniteId);
        return unite ? unite.libelle : uniteId;
    };

    // Fonction pour obtenir le libellé du service à partir de l'ID
    const getServiceLibelle = (serviceId: string | null) => {
        if (!serviceId) return '';
        const service = services.find(s => s.serviceId === serviceId);
        return service ? service.libelle : serviceId;
    };

    // Fonction pour combiner les données d'articles et de stock
    const getCombinedArticles = () => {
        // Créer un map des stocks par articleId
        const stockMap = new Map();
        articleStocks.forEach(stock => {
            if (stock.articleId) {
                stockMap.set(stock.articleId, stock);
            }
        });

        // Combiner les données avec les libellés
        return articles.map(article => {
            const stock = stockMap.get(article.articleId);
            return {
                ...article,
                // Ajouter les informations de stock si disponibles
                qteStock: stock?.qteStock ? Number(stock.qteStock) : (article.qteStock ? Number(article.qteStock) : 0),
                pump: stock?.pump ? Number(stock.pump) : (article.pump ? Number(article.pump) : null),
                qtePhysique: stock?.qtePhysique ? Number(stock.qtePhysique) : (article.qtePhysique ? Number(article.qtePhysique) : 0),
                prixUnitaire: stock?.prixUnitaire ? Number(stock.prixUnitaire) : (article.prixUnitaire || null),
                prixVente: stock?.prixVente ? Number(stock.prixVente) : (article.prixVente ? Number(article.prixVente) : null),
                // Ajouter les libellés
                categorieLibelle: getCategorieLibelle(article.categorie),
                sousCategorieLibelle: getSousCategorieLibelle(article.sousCategorieId),
                magasinNom: getMagasinNom(article.magasinId),
                uniteLibelle: getUniteLibelle(article.uniteId),
                serviceLibelle: getServiceLibelle(article.serviceId)
            };
        });
    };

    const loadAllData = async () => {
        // Charger à la fois les articles et les stocks
        await Promise.all([
            fetchArticles(null, 'GET', `${BASE_URL}/articles/findall1`),
            fetchArticleStocks(null, 'GET', `${BASE_URL}/articles/findall`)
        ]);
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

    const loadArticleToEdit = (data: any) => {
        if (data) {
            setEditArticleDialog(true);
            // Convertir les données combinées en StkArticle
            const articleToEdit = new StkArticle();
            articleToEdit.articleId = data.articleId;
            articleToEdit.codeArticle = data.codeArticle;
            articleToEdit.magasinId = data.magasinId;
            articleToEdit.libelle = data.libelle;
            articleToEdit.sousCategorieId = data.sousCategorieId;
            articleToEdit.catalogue = data.catalogue;
            articleToEdit.categorie = data.categorie;
            articleToEdit.conditionnement = data.conditionnement;
            articleToEdit.uniteId = data.uniteId;
            articleToEdit.qteStock = data.qteStock;
            articleToEdit.qtePhysique = data.qtePhysique;
            articleToEdit.pump = data.pump;
            articleToEdit.prixVente = data.prixVente;
            articleToEdit.prixUnitaire = data.prixUnitaire;
            articleToEdit.seuil = data.seuil;
            articleToEdit.seuilMax = data.seuilMax;
            articleToEdit.peremption = data.peremption;
            articleToEdit.lot = data.lot;
            articleToEdit.visible = data.visible;
            articleToEdit.description = data.description;
            articleToEdit.serviceId = data.serviceId;
            articleToEdit.dateCreation = data.dateCreation;
            articleToEdit.dateTarif = data.dateTarif;
            setArticleEdit(articleToEdit);
        }
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button
                    icon="pi pi-pencil"
                    onClick={() => loadArticleToEdit(data)}
                    raised
                    severity='warning'
                    tooltip="Modifier"
                />
               
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

    const calculateStockForArticle = async (articleId: string, currentExerciceAnnee: string) => {
        try {
            let totQteI = 0;
            let totQteE = 0;
            let totQteS = 0;

            // 1. Get max inventory date for current fiscal year and calculate TotQteI
            try {
                const inventairesResponse = await fetch(`${BASE_URL}/../stkinventaire/findall`);
                if (inventairesResponse.ok) {
                    const inventaires = await inventairesResponse.json();

                    // Filter inventories by current year and get max date
                    const currentYearInventaires = inventaires.filter((inv: any) => {
                        try {
                            const invDate = new Date(inv.dateInventaire);
                            return invDate.getFullYear().toString() === currentExerciceAnnee;
                        } catch {
                            return false;
                        }
                    });

                    if (currentYearInventaires.length > 0) {
                        const maxInventaireDate = new Date(
                            Math.max(...currentYearInventaires.map((inv: any) => new Date(inv.dateInventaire).getTime()))
                        );

                        const inventaire = currentYearInventaires.find((inv: any) =>
                            new Date(inv.dateInventaire).getTime() === maxInventaireDate.getTime()
                        );

                        if (inventaire) {
                            const inventaireDetailsResponse = await fetch(
                                `${BASE_URL}/../inventaireDetails/findbyinventaire?inventaireId=${inventaire.inventaireId}`
                            );
                            if (inventaireDetailsResponse.ok) {
                                const inventaireDetails = await inventaireDetailsResponse.json();

                                // Sum quantities for this article
                                totQteI = inventaireDetails
                                    .filter((detail: any) => detail.articleId === articleId)
                                    .reduce((sum: number, detail: any) => sum + (detail.quantitePhysique || 0), 0);
                            }
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not fetch inventory data for article ${articleId}:`, error);
            }

            // 2. Get TotQteE from entries for current fiscal year
            try {
                const entreesResponse = await fetch(`${BASE_URL}/../stkEntrees/findall`);
                if (entreesResponse.ok) {
                    const entrees = await entreesResponse.json();

                    // Get all entry details for current year
                    for (const entree of entrees) {
                        try {
                            const entreeDate = new Date(entree.dateEntree);
                            if (entreeDate.getFullYear().toString() === currentExerciceAnnee) {
                                const entreeDetailsResponse = await fetch(
                                    `${BASE_URL}/../stkEntreeDetails/findbyentree?entreeId=${entree.entreeId}`
                                );
                                if (entreeDetailsResponse.ok) {
                                    const entreeDetails = await entreeDetailsResponse.json();

                                    totQteE += entreeDetails
                                        .filter((detail: any) => detail.articleId === articleId)
                                        .reduce((sum: number, detail: any) => sum + (detail.qteE || 0), 0);
                                }
                            }
                        } catch {
                            // Skip this entry if there's an error
                            continue;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not fetch entry data for article ${articleId}:`, error);
            }

            // 3. Get TotQteS from exits for current fiscal year
            try {
                const sortiesResponse = await fetch(`${BASE_URL}/../stkSorties/findall`);
                if (sortiesResponse.ok) {
                    const sorties = await sortiesResponse.json();

                    // Get all exit details for current year
                    for (const sortie of sorties) {
                        try {
                            const sortieDate = new Date(sortie.dateSortie);
                            if (sortieDate.getFullYear().toString() === currentExerciceAnnee) {
                                const sortieDetailsResponse = await fetch(
                                    `${BASE_URL}/../stkSortieDetails/findbysortie?sortieId=${sortie.sortieId}`
                                );
                                if (sortieDetailsResponse.ok) {
                                    const sortieDetails = await sortieDetailsResponse.json();

                                    totQteS += sortieDetails
                                        .filter((detail: any) => detail.articleId === articleId)
                                        .reduce((sum: number, detail: any) => sum + (detail.qteS || 0), 0);
                                }
                            }
                        } catch {
                            // Skip this sortie if there's an error
                            continue;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Could not fetch exit data for article ${articleId}:`, error);
            }

            // 4. Calculate: qteStock = (TotQteE + TotQteI) - TotQteS
            const calculatedStock = (totQteE + totQteI) - totQteS;

            return {
                articleId,
                calculatedStock,
                totQteI,
                totQteE,
                totQteS
            };
        } catch (error) {
            console.error(`Error calculating stock for article ${articleId}:`, error);
            return null;
        }
    };

    const handleCalculateStock = async (articleId?: string) => {
        setBtnLoading(true);
        setIsCalculating(true);
        try {
            // Get current fiscal year
            const currentYear = new Date().getFullYear().toString();

            if (articleId) {
                // Calculate for single article
                const result = await calculateStockForArticle(articleId, currentYear);
                if (result) {
                    // Store calculated stock in state
                    setCalculatedStocks(prev => {
                        const newMap = new Map(prev);
                        newMap.set(articleId, result.calculatedStock);
                        return newMap;
                    });

                    accept('success', 'Succès',
                        `Stock calculé: ${result.calculatedStock} (Inventaire: ${result.totQteI}, Entrées: ${result.totQteE}, Sorties: ${result.totQteS})`
                    );
                }
            } else {
                // Calculate for all articles
                let calculatedCount = 0;
                const combinedArticles = getCombinedArticles();
                const totalArticles = combinedArticles.filter(a => a.articleId).length;
                const newStocksMap = new Map<string, number>();

                for (let i = 0; i < combinedArticles.length; i++) {
                    const article = combinedArticles[i];
                    if (!article.articleId) continue;

                    setCalculationProgress(`Calcul en cours... ${calculatedCount + 1}/${totalArticles}`);

                    const result = await calculateStockForArticle(article.articleId, currentYear);
                    if (result) {
                        newStocksMap.set(article.articleId, result.calculatedStock);
                        calculatedCount++;
                    }
                }

                // Update all calculated stocks at once
                setCalculatedStocks(newStocksMap);
                setCalculationProgress('');
                accept('success', 'Succès', `Stock calculé pour ${calculatedCount} articles`);
            }
        } catch (error) {
            console.error('Error in handleCalculateStock:', error);
            accept('error', 'Erreur', `Échec du calcul du stock: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            setCalculationProgress('');
        } finally {
            setBtnLoading(false);
            setIsCalculating(false);
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center mb-3">
                <div className="flex gap-2">
                    <Button
                        icon="pi pi-filter-slash"
                        label="Effacer filtres"
                        outlined
                        onClick={() => setGlobalFilter('')}
                    />
                   
                </div>
                <span className="p-input-icon-left" style={{ width: '40%' }}>
                    <i className="pi pi-search" />
                    <InputText
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Rechercher par code, libellé, catalogue, catégorie..."
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const combinedArticles = getCombinedArticles();

    const filteredData = combinedArticles.filter(item => {
        if (!item) return false;
        return JSON.stringify({
            codeArticle: item.codeArticle || '',
            libelle: item.libelle || '',
            catalogue: item.catalogue || '',
            categorieLibelle: item.categorieLibelle || '',
            conditionnement: item.conditionnement || '',
            qteStock: item.qteStock || '',
            pump: item.pump || ''
        }).toLowerCase().includes(globalFilter.toLowerCase());
    });

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            currencyDisplay: 'code'
        }).format(value || 0);
    };

    const stockBodyTemplate = (rowData: any) => {
        // Always use calculated stock if available
        const articleId = rowData.articleId || '';
        const qteStock = calculatedStocks.has(articleId)
            ? calculatedStocks.get(articleId)!
            : (rowData.qteStock || 0);
        const seuil = rowData.seuil || 0;
        const seuilMax = rowData.seuilMax || 0;

        let severity: 'danger' | 'warning' | 'success' | 'info' = 'info';
        let icon = '';

        if (qteStock <= 0) {
            severity = 'danger';
            icon = 'pi pi-exclamation-triangle';
        } else if (qteStock <= seuil) {
            severity = 'warning';
            icon = 'pi pi-exclamation-circle';
        } else if (seuilMax > 0 && qteStock >= seuilMax) {
            severity = 'success';
            icon = 'pi pi-check-circle';
        } else {
            severity = 'info';
        }

        return (
            <div className={`flex align-items-center gap-2 text-${severity}`}>
                {icon && <i className={icon}></i>}
                <span className="font-semibold">
                    {new Intl.NumberFormat('fr-FR').format(qteStock)}
                </span>
            </div>
        );
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
                            {isCalculating && (
                                <div className="bg-blue-100 border-blue-500 text-blue-700 p-3 mb-3 border-l-4 flex align-items-center gap-2">
                                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '1.5rem' }}></i>
                                    <span className="font-semibold">Calcul du stock en cours... Veuillez patienter.</span>
                                </div>
                            )}
                            <div className='card'>
                                <DataTable
                                    value={filteredData}
                                    header={renderSearch}
                                    emptyMessage={"Pas d'articles à afficher"}
                                    paginator
                                    rows={10}
                                    rowsPerPageOptions={[10, 20, 30]}
                                    loading={articlesLoading || articleStocksLoading || categoriesLoading || isCalculating}
                                >
                                    <Column field="codeArticle" header="Code Article" sortable />
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column  field="catalogue" header="Catalogue" sortable />
                                    <Column hidden field="categorieLibelle" header="Catégorie" sortable />
                                    <Column hidden field="conditionnement" header="Conditionnement" sortable />
                                    <Column field="sousCategorieLibelle" header="Sous Catégorie" sortable />
                                    <Column field="qteStock" header="Stock" body={stockBodyTemplate} sortable />
                                    <Column field="uniteLibelle" header="Unité" sortable />
                                    <Column hidden field="prixUnitaire" header="Prix Unitaire" 
                                        body={(rowData) => formatCurrency(rowData.prixUnitaire)} 
                                        sortable />
                                    <Column field="pump" header="PUMP" 
                                        body={(rowData) => formatCurrency(rowData.pump)} 
                                        sortable />
                                    <Column hidden field="prixVente" header="Prix Vente" 
                                        body={(rowData) => formatCurrency(rowData.prixVente)} 
                                        sortable />
                                    <Column hidden field="seuil" header="Seuil Min" 
                                        body={(rowData) => rowData.seuil || 0} 
                                        sortable />
                                    <Column hidden field="seuilMax" header="Seuil Max" 
                                        body={(rowData) => rowData.seuilMax || 0} 
                                        sortable />
                                    <Column hidden field="peremption" header="Péremption" 
                                        body={(rowData) => rowData.peremption ? 'Oui' : 'Non'} 
                                        sortable />
                                    <Column hidden field="lot" header="Gestion par lot" 
                                        body={(rowData) => rowData.lot ? 'Oui' : 'Non'} 
                                        sortable />
                                    <Column hidden field="visible" header="Visible" 
                                        body={(rowData) => rowData.visible ? 'Oui' : 'Non'} 
                                        sortable />
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