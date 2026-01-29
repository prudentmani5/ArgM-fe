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
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
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
    const [searchTerm, setSearchTerm] = useState<string>('');

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: string, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 3000
        });
    };

    // Fonction de validation (alternative à la méthode dans la classe)
    const validateCategory = (cat: CategoryArticle): { valid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (!cat.id.trim()) {
            errors.push("Le code catégorie est obligatoire");
        }
        
        if (!cat.libelle.trim()) {
            errors.push("Le libellé est obligatoire");
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    };

const fetchData = async (url: string, method: string = 'GET', body?: any) => {
    setLoading(true);
    setError(null);
    
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                // Ajouter d'autres headers d'authentification si nécessaire
                // 'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            credentials: 'include' // Important pour les cookies de session
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (response.status === 401) {
            throw new Error('Non authentifié. Veuillez vous reconnecter.');
        }

        if (response.status === 403) {
            throw new Error('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `Erreur HTTP! statut: ${response.status}`);
        }

        // Si la réponse est 204 No Content (comme pour DELETE), retourner null
        if (response.status === 204) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue';
        setError(errorMessage);
        throw err;
    } finally {
        setLoading(false);
    }
};
    useEffect(() => {
        loadAllMagasins();
    }, []);

    const handleAfterApiCall = (chosenTab: number, success: boolean, actionType?: string, message?: string) => {
        if (error !== null) {
            accept('error', 'Erreur', message || error);
        } else if (success) {
            if (actionType === 'createCategory') {
                setCategory(new CategoryArticle());
                accept('success', 'Succès', 'L\'enregistrement a été effectué avec succès.');
            } else if (actionType === 'updateCategory') {
                accept('success', 'Succès', 'La modification a été effectuée avec succès.');
                setCategoryEdit(new CategoryArticle());
                setEditCategoryDialog(false);
                loadAllData();
            } else if (actionType === 'deleteCategory') {
                accept('success', 'Succès', 'La suppression a été effectuée avec succès.');
                loadAllData();
            }
        }
        setBtnLoading(false);
    };

    const handleSubmit = async () => {
        // Validation côté client
        const validation = validateCategory(category);
        if (!validation.valid) {
            accept('error', 'Erreur de validation', validation.errors.join(', '));
            return;
        }

        setBtnLoading(true);
        try {
            await fetchData(baseUrl + '/list_category_articles/new', 'POST', category);
            handleAfterApiCall(0, true, 'createCategory');
        } catch (err: any) {
            handleAfterApiCall(0, false, 'createCategory', err.message);
        }
    };

    const handleSubmitEdit = async () => {
        // Validation côté client
        const validation = validateCategory(categoryEdit);
        if (!validation.valid) {
            accept('error', 'Erreur de validation', validation.errors.join(', '));
            return;
        }

        setBtnLoading(true);
        try {
            await fetchData(baseUrl + '/list_category_articles/update/' + categoryEdit.id, 'PUT', categoryEdit);
            handleAfterApiCall(0, true, 'updateCategory');
        } catch (err: any) {
            handleAfterApiCall(0, false, 'updateCategory', err.message);
        }
    };

    const loadAllData = async () => {
        try {
            const data = await fetchData(baseUrl + '/list_category_articles/findall');
            // Convertir les données brutes en objets CategoryArticle
            const categoriesData = Array.isArray(data) ? data : [data];
            const categoryArticles = categoriesData.map(item => 
                new CategoryArticle(
                    item.id,
                    item.libelle,
                    item.compte,
                    item.type,
                    item.magasinId
                )
            );
            setCategories(categoryArticles);
        } catch {
            handleAfterApiCall(1, false);
        }
    };

    const loadAllMagasins = async () => {
    try {
        console.log("🔄 Chargement des magasins depuis:", baseUrl + '/magasins/findall');
        const data = await fetchData(baseUrl + '/magasins/findall');
        console.log("📦 Données magasins brutes:", data);
        
        if (Array.isArray(data)) {
            // Mapper les données StkMagasin vers Magasin
            const magasinsMapped = data.map((stkMagasin: any) => {
                console.log("🔍 Mapping magasin:", stkMagasin);
                return new Magasin(
                    stkMagasin.magasinId,  // magasinId depuis StkMagasin
                    stkMagasin.nom,        // nom depuis StkMagasin  
                    stkMagasin.adresse,    // adresse depuis StkMagasin
                    stkMagasin.pointVente, // pointVente depuis StkMagasin
                    stkMagasin.type        // type depuis StkMagasin
                );
            });
            console.log("✅ Magasins mappés:", magasinsMapped);
            setMagasins(magasinsMapped);
        } else {
            console.error("❌ Les données des magasins ne sont pas un tableau:", data);
            setMagasins([]);
        }
    } catch (err) {
        console.error("💥 Erreur lors du chargement des magasins:", err);
        accept('error', 'Erreur', 'Impossible de charger la liste des magasins');
        setMagasins([]);
    }
};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCategory(prev => {
            const updated = prev.clone();
            (updated as any)[name] = value;
            return updated;
        });
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCategoryEdit(prev => {
            const updated = prev.clone();
            (updated as any)[name] = value;
            return updated;
        });
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        } else {
            setCategory(new CategoryArticle());
        }
        setActiveIndex(e.index);
    };

    function onDropdownSelect(e: DropdownChangeEvent) {
        const { name, value } = e.target;
        setCategory(prev => {
            const updated = prev.clone();
            (updated as any)[name] = value;
            return updated;
        });
    }

    function onDropdownSelectEdit(e: DropdownChangeEvent) {
        const { name, value } = e.target;
        setCategoryEdit(prev => {
            const updated = prev.clone();
            (updated as any)[name] = value;
            return updated;
        });
    }

    const optionButtons = (data: CategoryArticle): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button icon="pi pi-pencil" onClick={() => loadCategoryToEdit(data)} raised severity='warning' />
                <Button icon="pi pi-trash" onClick={() => confirmDelete(data)} raised severity='danger' />
            </div>
        );
    };

    const loadCategoryToEdit = (data: CategoryArticle) => {
        if (data) {
            setEditCategoryDialog(true);
            setCategoryEdit(data.clone());
        }
    };

  const confirmDelete = (category: CategoryArticle) => {
    console.log('✅ Confirm delete called with:', category);
    
    if (!category.id || category.id.trim() === '') {
        accept('error', 'Erreur', 'ID de catégorie invalide');
        return;
    }
    
    confirmDialog({
        message: `Êtes-vous sûr de vouloir supprimer la catégorie "${category.libelle}" ?`,
        header: 'Confirmation de suppression',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            console.log('🗑️ Suppression acceptée pour ID:', category.id);
            deleteCategory(category.id);
        },
        reject: () => {
            console.log('❌ Suppression annulée');
        }
    });
};

    const deleteCategory = async (id: string) => {
    setBtnLoading(true);
    try {
        // CORRECTION : Vérifier et nettoyer l'ID
        if (!id || id.trim() === '') {
            throw new Error('ID de catégorie invalide');
        }
        
        // URL corrigée - supprimer le ?null
        const url = `${baseUrl}/list_category_articles/delete/${encodeURIComponent(id)}`;
        console.log('🗑️ URL de suppression:', url);
        
        await fetchData(url, 'DELETE');
        handleAfterApiCall(1, true, 'deleteCategory');
    } catch (err: any) {
        console.error('❌ Erreur suppression:', err);
        handleAfterApiCall(1, false, 'deleteCategory', err.message);
    }
};


    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadAllData();
            return;
        }

        try {
            const data = await fetchData(baseUrl + `/list_category_articles/search?libelle=${encodeURIComponent(searchTerm)}`);
            const categoriesData = Array.isArray(data) ? data : [data];
            const categoryArticles = categoriesData.map(item => 
                new CategoryArticle(
                    item.id,
                    item.libelle,
                    item.compte,
                    item.type,
                    item.magasinId
                )
            );
            setCategories(categoryArticles);
        } catch (err: any) {
            accept('error', 'Erreur', 'Erreur lors de la recherche');
        }
    };

    const clearFilter = () => {
        setSearchTerm('');
        loadAllData();
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <Button type="button" icon="pi pi-refresh" label="Réinitialiser" outlined onClick={clearFilter} />
                <div className="flex gap-2">
                    <InputText 
                        placeholder="Rechercher par libellé" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button icon="pi pi-search" onClick={handleSearch} />
                </div>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
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
                    handleDropDownSelect={onDropdownSelectEdit}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        icon="pi pi-times"
                        label="Annuler"
                        severity="secondary"
                        onClick={() => setEditCategoryDialog(false)}
                    />
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
                                    loading={loading}
                                >
                                    <Column field="id" header="Code" sortable /> 
                                    <Column field="libelle" header="Libellé" sortable />
                                    <Column field="compte" header="Compte" sortable />
                                    <Column field="type" header="Type" sortable />
                                    <Column field="magasinId" header="Magasin" sortable />
                                    <Column header="Actions" body={optionButtons} style={{ width: '120px' }} />
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