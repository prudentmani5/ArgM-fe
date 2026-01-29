'use client';

import Cookies from 'js-cookie';
import { TabPanel, TabView, TabViewTabChangeEvent } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { StkSousCategorie } from './StkSousCategorie';
import StkSousCategorieForm from './StkSousCategorieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { API_BASE_URL } from '@/utils/apiConfig';

function StkSousCategorieComponent() {
    const [stkSousCategorie, setStkSousCategorie] = useState<StkSousCategorie>(new StkSousCategorie());
    const [stkSousCategorieEdit, setStkSousCategorieEdit] = useState<StkSousCategorie>(new StkSousCategorie());
    const [editStkSousCategorieDialog, setEditStkSousCategorieDialog] = useState(false);
    const [stkSousCategories, setStkSousCategories] = useState<StkSousCategorie[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const { data, loading, error, fetchData, callType } = useConsumApi('');
    const [btnLoading, setBtnLoading] = useState<boolean>(false);
    const [categoriesLoading, setCategoriesLoading] = useState<boolean>(false);
    const [globalFilter, setGlobalFilter] = useState<string>('');
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const accept = (sever: 'success' | 'info' | 'warn' | 'error', summa: String, det: string) => {
        toast.current?.show({
            severity: sever,
            summary: summa,
            detail: det,
            life: 5000
        });
    };

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            window.location.href = '/auth/login2';
        }
    }, []);

    useEffect(() => {
        if (data) {
            if (callType === 'loadStkSousCategories') {
                setStkSousCategories(Array.isArray(data) ? data : [data]);
            } else if (callType === 'loadCategories') {
                setCategories(Array.isArray(data) ? data : [data]);
            }
            handleAfterApiCall();
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            handleAfterApiCall();
        }
    }, [error]);

    // Charger les catégories au montage du composant
    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = () => {
        setCategoriesLoading(true);
        // Remplacez par votre endpoint réel pour les catégories
        fetchData(null, 'GET', `${API_BASE_URL}/list_category_articles/findall`, `loadCategories`)
            .finally(() => setCategoriesLoading(false));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkSousCategorie((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStkSousCategorieEdit((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        // Validation des champs obligatoires
        if (!stkSousCategorie.sousCategorieId || !stkSousCategorie.categorieId || !stkSousCategorie.libelle) {
            accept('error', 'Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        // Vérifier si l'ID existe déjà dans la liste locale (validation côté client)
        const existingItem = stkSousCategories.find(item => 
            item.sousCategorieId === stkSousCategorie.sousCategorieId
        );
        
        if (existingItem) {
            accept('error', 'ID déjà existant', `L'ID "${stkSousCategorie.sousCategorieId}" existe déjà. Veuillez utiliser un ID unique.`);
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', stkSousCategorie);
        fetchData(stkSousCategorie, 'Post', `${API_BASE_URL}/sousCategories/new`, `createStkSousCategorie`);
        setStkSousCategorie(new StkSousCategorie());
    };

    const handleSubmitEdit = () => {
        // Validation des champs obligatoires
        if (!stkSousCategorieEdit.sousCategorieId || !stkSousCategorieEdit.categorieId || !stkSousCategorieEdit.libelle) {
            accept('error', 'Erreur', 'Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        setBtnLoading(true);
        console.log('Data sent to the backend:', stkSousCategorieEdit);
        fetchData(stkSousCategorieEdit, 'Put', `${API_BASE_URL}/sousCategories/update/` + stkSousCategorieEdit.sousCategorieId, `updateStkSousCategorie`);
    };

    const handleAfterApiCall = () => {
        if (error !== null) {
            let errorMessage = 'Une erreur est survenue';
            
            // Gestion spécifique des erreurs selon le type d'appel
            switch (callType) {
                case 'createStkSousCategorie':
                    if (error.message && error.message.includes('existe déjà')) {
                        errorMessage = `Une sous-catégorie avec l'ID "${stkSousCategorie.sousCategorieId}" existe déjà. Veuillez utiliser un ID unique.`;
                    } else {
                        errorMessage = 'L\'enregistrement n\'a pas été effectué.';
                    }
                    break;
                case 'updateStkSousCategorie':
                    errorMessage = 'La mise à jour n\'a pas été effectuée.';
                    break;
                case 'deleteStkSousCategorie':
                    errorMessage = 'La suppression n\'a pas été effectuée.';
                    break;
                case 'loadStkSousCategories':
                    errorMessage = 'Impossible de charger la liste des sous-catégories.';
                    break;
                default:
                    errorMessage = 'Une erreur est survenue lors de l\'opération.';
            }
            
            accept('error', 'Erreur', errorMessage);
            
        } else if (data !== null) {
            switch (callType) {
                case 'createStkSousCategorie':
                    setStkSousCategorie(new StkSousCategorie());
                    accept('success', 'Succès', 'L\'enregistrement a été effectué avec succès.');
                    loadAllData(); // Recharger la liste
                    break;
                case 'updateStkSousCategorie':
                    accept('success', 'Succès', 'La modification a été effectuée avec succès.');
                    setStkSousCategorieEdit(new StkSousCategorie());
                    setEditStkSousCategorieDialog(false);
                    loadAllData();
                    break;
                case 'deleteStkSousCategorie':
                    accept('success', 'Succès', 'La suppression a été effectuée avec succès.');
                    // Mise à jour immédiate de l'état local en utilisant l'ID stocké
                    if (itemToDelete) {
                        setStkSousCategories(prev => 
                            prev.filter(item => item.sousCategorieId !== itemToDelete)
                        );
                        setItemToDelete(null);
                    }
                    break;
            }
        }
        setBtnLoading(false);
    };

    const clearFilterStkSousCategorie = () => {
        setGlobalFilter('');
        loadAllData();
    };

    const loadStkSousCategorieToEdit = (data: StkSousCategorie) => {
        if (data) {
            setEditStkSousCategorieDialog(true);
            console.log("id Sous-Catégorie " + data.sousCategorieId);
            setStkSousCategorieEdit(data);
        }
    };

    const confirmDelete = (data: StkSousCategorie) => {
        confirmDialog({
            message: 'Êtes-vous sûr de vouloir supprimer la sous-catégorie "' + data.libelle + '" ?',
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteStkSousCategorie(data),
            reject: () => accept('warn', 'Annulé', 'Suppression annulée.')
        });
    };

    const deleteStkSousCategorie = (data: StkSousCategorie) => {
        setBtnLoading(true);
        setItemToDelete(data.sousCategorieId);
        
        // CORRECTION : Utiliser une URL propre sans paramètres
        const deleteUrl = `${API_BASE_URL}/sousCategories/delete/${data.sousCategorieId}`;
        console.log('Deleting with URL:', deleteUrl);
        
        // CORRECTION : Utiliser fetch directement si le hook ajoute des paramètres
        fetchDataDirect(deleteUrl, 'DELETE', 'deleteStkSousCategorie');
    };

    // NOUVELLE FONCTION : Fetch direct pour éviter les paramètres ajoutés par le hook
    const fetchDataDirect = async (url: string, method: string, type: string) => {
        setBtnLoading(true);
        
        try {
            const token = Cookies.get('token');
            const options: RequestInit = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };

            console.log(`Making ${method} request to: ${url}`);

            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Pour DELETE, on considère que c'est un succès si le statut est 2xx
            if (response.status === 204 || response.status === 200) {
                handleAfterApiCallDirect(type, null, null);
            } else {
                const result = await response.json();
                handleAfterApiCallDirect(type, result, null);
            }
            
        } catch (err) {
            console.error('Fetch error:', err);
            handleAfterApiCallDirect(type, null, err);
        }
    };

    const handleAfterApiCallDirect = (type: string, result: any, err: any) => {
        if (err) {
            accept('error', 'Erreur', 'La suppression n\'a pas été effectuée.');
        } else {
            accept('success', 'Succès', 'La suppression a été effectuée avec succès.');
            // Mise à jour immédiate de l'état local
            if (itemToDelete) {
                setStkSousCategories(prev => 
                    prev.filter(item => item.sousCategorieId !== itemToDelete)
                );
                setItemToDelete(null);
            }
        }
        setBtnLoading(false);
    };

    const optionButtons = (data: any): React.ReactNode => {
        return (
            <div className='flex flex-wrap gap-2'>
                <Button 
                    icon="pi pi-pencil" 
                    onClick={() => loadStkSousCategorieToEdit(data)} 
                    raised 
                    severity='warning' 
                    size="small"
                    tooltip="Modifier"
                    tooltipOptions={{ position: 'top' }}
                />
                <Button 
                    icon="pi pi-trash" 
                    onClick={() => confirmDelete(data)} 
                    raised 
                    severity='danger' 
                    size="small"
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                />
            </div>
        );
    };

    const loadAllData = () => {
        fetchData(null, 'Get', `${API_BASE_URL}/sousCategories/findall`, `loadStkSousCategories`);
    };

    const tableChangeHandle = (e: TabViewTabChangeEvent) => {
        if (e.index === 1) {
            loadAllData();
        }
        setActiveIndex(e.index);
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setGlobalFilter(value);
        
        if (value.trim().length > 2) {
            // Recherche côté serveur
            fetchData(null, 'GET', `${API_BASE_URL}/sousCategories/search?libelle=${encodeURIComponent(value)}`, 'loadStkSousCategories');
        } else if (value.trim().length === 0) {
            // Recharger toutes les données si le filtre est vide
            loadAllData();
        }
    };

    const renderSearch = () => {
        return (
            <div className="flex justify-content-between align-items-center">
                <Button 
                    type="button" 
                    icon="pi pi-refresh" 
                    label="Réinitialiser" 
                    outlined 
                    onClick={clearFilterStkSousCategorie} 
                />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        placeholder="Recherche par libellé" 
                        value={globalFilter}
                        onChange={onGlobalFilterChange}
                        style={{ width: '250px' }}
                    />
                </span>
            </div>
        );
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            <Dialog 
                header="Modifier Sous-Catégorie" 
                visible={editStkSousCategorieDialog} 
                style={{ width: '50vw' }} 
                modal 
                onHide={() => {
                    setEditStkSousCategorieDialog(false);
                    setStkSousCategorieEdit(new StkSousCategorie());
                }}
            >
                <StkSousCategorieForm 
                    stkSousCategorie={stkSousCategorieEdit} 
                    handleChange={handleChangeEdit} 
                    categories={categories}
                    loading={categoriesLoading}
                    existingIds={stkSousCategories.map(item => item.sousCategorieId)}
                />
                <div className="flex justify-content-end gap-2 mt-3">
                    <Button 
                        icon="pi pi-times" 
                        label="Annuler" 
                        severity="secondary" 
                        onClick={() => {
                            setEditStkSousCategorieDialog(false);
                            setStkSousCategorieEdit(new StkSousCategorie());
                        }} 
                    />
                    <Button 
                        icon="pi pi-pencil" 
                        label="Modifier" 
                        loading={btnLoading} 
                        onClick={handleSubmitEdit} 
                    />
                </div>
            </Dialog>
            
            <TabView onTabChange={tableChangeHandle} activeIndex={activeIndex}>
                <TabPanel header="Nouveau">
                    <StkSousCategorieForm 
                        stkSousCategorie={stkSousCategorie} 
                        handleChange={handleChange} 
                        categories={categories}
                        loading={categoriesLoading}
                        existingIds={stkSousCategories.map(item => item.sousCategorieId)}
                    />
                    <div className="card p-fluid">
                        <div className="formgrid grid">
                            <div className="md:col-offset-3 md:field md:col-3">
                                <Button 
                                    icon="pi pi-refresh" 
                                    outlined 
                                    label="Réinitialiser" 
                                    onClick={() => setStkSousCategorie(new StkSousCategorie())} 
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
                                    value={stkSousCategories} 
                                    header={renderSearch} 
                                    emptyMessage={"Pas de sous-catégories à afficher"}
                                    paginator 
                                    rows={10}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                    loading={loading}
                                    size="small"
                                >
                                    <Column field="sousCategorieId" header="ID Sous-Catégorie" sortable style={{ width: '15%' }} />
                                    <Column field="categorieId" header="ID Catégorie" sortable style={{ width: '15%' }} />
                                    <Column field="magasinId" header="ID Magasin" sortable style={{ width: '15%' }} />
                                    <Column field="libelle" header="Libellé" sortable style={{ width: '25%' }} />
                                    <Column field="compte" header="Compte" sortable style={{ width: '15%' }} />
                                    <Column header="Actions" body={optionButtons} style={{ width: '15%' }} />
                                </DataTable>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </TabView>
        </>
    );
}

export default StkSousCategorieComponent;