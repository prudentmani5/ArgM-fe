// page.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkConsommationDetails } from './StkConsommation';
import StkConsommation from './StkConsommation';
import StkConsommationForm from './StkConsommationForm';
import { Button } from 'primereact/button';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { InputNumber, InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import axios from 'axios';
import { Dialog } from 'primereact/dialog';
import { format } from 'date-fns';
import { API_BASE_URL } from '@/utils/apiConfig';
import Cookies from 'js-cookie';

const BASE_URL = `${API_BASE_URL}/stkConsommations`;
const BASE_URLD = `${API_BASE_URL}/stkConsommationDetails`;

export default function StkConsommationPage() {
    const [consommation, setConsommation] = useState<StkConsommation>(new StkConsommation());
    const [details, setDetails] = useState<StkConsommationDetails[]>([]);
    const [consommations, setConsommations] = useState<StkConsommation[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Date filter states
    const [dateDebut, setDateDebut] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [dateFin, setDateFin] = useState<Date>(new Date());

    // Data for dropdowns
    const [employes, setEmployes] = useState<any[]>([]);
    const [partenaires, setPartenaires] = useState<any[]>([]);
    const [prestations, setPrestations] = useState<any[]>([]);
    const [ayantDroits, setAyantDroits] = useState<any[]>([]);
    const [articles, setArticles] = useState<any[]>([]);
    const [selectedConsommation, setSelectedConsommation] = useState<StkConsommation | null>(null);
    const [consommationDetails, setConsommationDetails] = useState<StkConsommationDetails[]>([]);
    const [detailsDialogVisible, setDetailsDialogVisible] = useState(false);
     const [groupedConsommations, setGroupedConsommations] = useState<any[]>([]);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows | null>(null);
    const [editingConsommation, setEditingConsommation] = useState<StkConsommation | null>(null);
    const [editDialogVisible, setEditDialogVisible] = useState(false);
    const [editingDetail, setEditingDetail] = useState<StkConsommationDetails | null>(null);
    const [editDetailDialogVisible, setEditDetailDialogVisible] = useState(false);

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    // Get authorization headers with JWT token from cookies
    const getAuthHeaders = () => {
        const token = Cookies.get('token');
        return {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
    };

    useEffect(() => {
        loadDropdownData();
        // Don't auto-load consommations - user must select date range and click search
    }, []);

    const loadDropdownData = async () => {
        try {
            setLoading(true);

            const endpoints = [
                //{ url: `${API_BASE_URL}/employes/findall`, setter: setEmployes },
                { url: `${API_BASE_URL}/identifications/findall`, setter: setEmployes },
                { url: `${API_BASE_URL}/partenaires/findall`, setter: setPartenaires },
                { url: `${API_BASE_URL}/prestations/findall`, setter: setPrestations },
                { url: `${API_BASE_URL}/ayantDroits/findall`, setter: setAyantDroits },
                { url: `${API_BASE_URL}/articles/findall`, setter: setArticles }
            ];

            const results = await Promise.allSettled(
                endpoints.map(endpoint => axios.get(endpoint.url))
            );

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    endpoints[index].setter(result.value.data);
                } else {
                    console.error(`Erreur de chargement pour ${endpoints[index].url}:`, result.reason);
                    accept('error', 'Erreur', `Échec du chargement des données pour ${endpoints[index].url.split('/')[3]}`);
                }
            });

        } catch (error) {
            console.error("Erreur globale lors du chargement des données:", error);
            accept('error', 'Erreur', 'Échec du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour regrouper par matricule
    const groupByMatricule = (data: StkConsommation[]) => {
        const grouped = data.reduce((acc: any[], item: StkConsommation) => {
            const existingGroup = acc.find(group => group.matricule === item.matricule);
            if (existingGroup) {
                existingGroup.items.push(item);
                existingGroup.totalConsommations += 1;
            } else {
                const employe = employes.find(emp => emp.matriculeId === item.matricule);
                acc.push({
                    matricule: item.matricule,
                    nomEmploye: employe ? `${employe.nom} ${employe.prenom}` : 'Inconnu',
                    totalConsommations: 1,
                    items: [item]
                });
            }
            return acc;
        }, []);
        
        return grouped;
    };

    const loadAllConsommations = async () => {
        try {
            setLoading(true);

            // Format dates to ISO format (YYYY-MM-DD)
            const formatDate = (date: Date) => date.toISOString().split('T')[0];
            let url = `${BASE_URL}/findall`;

            if (dateDebut && dateFin) {
                url += `?dateDebut=${formatDate(dateDebut)}&dateFin=${formatDate(dateFin)}`;
            }

            const response = await axios.get(url);
            setConsommations(response.data);
        } catch (error) {
            console.error("Error loading entries:", error);
            accept('error', 'Erreur', 'Échec du chargement des consommations');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        loadAllConsommations();
    };

    const clearSearch = () => {
        setDateDebut(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
        setDateFin(new Date());
        setGlobalFilter('');
        setConsommations([]); // Clear data when clearing search
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConsommation(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setConsommation(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setConsommation(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setConsommation(prev => ({ ...prev, [name]: value }));
    };

    const addDetail = () => {
        setDetails(prev => [...prev, {
            ...new StkConsommationDetails(),
            consommationDetailsId: undefined
        }]);
    };

    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const updateDetail = (index: number, field: string, value: any) => {
        setDetails(prev => {
            const newDetails = [...prev];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };

            // Recalculer le prix total si qte ou pu change
            if (field === 'qte' || field === 'pu') {
                const qte = field === 'qte' ? value : newDetails[index].qte;
                const pu = field === 'pu' ? value : newDetails[index].pu;
                newDetails[index].prixTotal = qte * pu;
            }

            return newDetails;
        });
    };

    const checkConsommationId = async (consommationId: string): Promise<boolean> => {
        try {
            const response = await axios.get(`${BASE_URL}/exists?consommationId=${consommationId}`);
            return response.data;
        } catch (error) {
            console.error("Error checking consommationId:", error);
            return false;
        }
    };

    

    const handleSubmit = async () => {
        try {
            setBtnLoading(true);
            const now = new Date().toISOString();

            // 1. Enregistrer la consommation principale
            const formattedData = {
                ...consommation,
                dateConsommation: consommation.dateConsommationD
                    ? format(consommation.dateConsommationD, 'yyyy-MM-dd')
                    : null,
                dateConsommationD: null // Ne pas envoyer le champ transient
            };
            const consommationResponse = await axios.post(`${BASE_URL}/new`, {
                ...consommation,
                consommationId: consommation.consommationId || null,
                dateConsommation: consommation.dateConsommation?.toISOString()
            });

            if (!consommationResponse.data?.consommationId) {
                throw new Error("Failed to save main entry");
            }

            // 2. Préparer les détails
            const detailsToSave = details.map(({ ...detail }) => ({
                ...detail,
                consommationDetailsId: null,
                consommationId: consommationResponse.data.consommationId
            }));

            // 3. Enregistrer les détails
            if (detailsToSave.length > 0) {
                await axios.post(`${BASE_URLD}/new`, detailsToSave);
            }

            accept('success', 'Succès', 'Consommation créée avec succès');
            setConsommation(new StkConsommation());
            setDetails([]);
            loadAllConsommations();
        } catch (error) {
            console.error("Erreur:", error);
            accept('error', 'Erreur', 'Échec de la création');
        } finally {
            setBtnLoading(false);
        }
    };

    const formatDate = (date: Date | string | null | undefined): string => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Edit consommation handler
    const handleEditConsommation = async (rowData: StkConsommation) => {
        const startTime = performance.now();
        console.log('⏱️ Starting edit consommation load...');

        try {
            setLoading(true);

            const setDataStart = performance.now();
            setEditingConsommation({
                ...rowData,
                dateConsommationD: rowData.dateConsommation ? new Date(rowData.dateConsommation) : null
            });
            console.log(`✅ Set editing consommation: ${(performance.now() - setDataStart).toFixed(2)}ms`);

            // Load details for this consommation
            const apiStart = performance.now();
            const response = await axios.get(`${BASE_URLD}/findbyconsommation?consommationId=${encodeURIComponent(rowData.consommationId)}`);
            console.log(`✅ API call completed: ${(performance.now() - apiStart).toFixed(2)}ms`);
            console.log(`📊 Loaded ${response.data?.length || 0} details for editing`);

            const setDetailsStart = performance.now();
            const loadedDetails = response.data || [];
            console.log('📦 Loaded details from API:', loadedDetails);
            console.log('📊 Available articles:', articles.length);
            console.log('📊 Available ayantDroits:', ayantDroits.length);

            // Log each detail to see the values
            loadedDetails.forEach((detail: StkConsommationDetails, index: number) => {
                console.log(`Detail ${index}:`, {
                    articleId: detail.articleId,
                    ayantDroit: detail.ayantDroit,
                    partenaireId: detail.partenaireId,
                    prestationId: detail.prestationId
                });

                // Check if article exists in articles array
                const articleExists = articles.find(a => a.articleId === detail.articleId);
                console.log(`  Article ${detail.articleId} exists:`, !!articleExists, articleExists?.libelle);

                // Check if ayant droit exists in ayantDroits array
                const ayantDroitExists = ayantDroits.find(ad => ad.rensAyantDroitId === detail.ayantDroit);
                console.log(`  Ayant droit ${detail.ayantDroit} exists:`, !!ayantDroitExists, ayantDroitExists?.nom);
            });

            setDetails(loadedDetails);
            console.log(`✅ Set details: ${(performance.now() - setDetailsStart).toFixed(2)}ms`);

            setEditDialogVisible(true);

            console.log(`⏱️ Total edit load time: ${(performance.now() - startTime).toFixed(2)}ms`);
        } catch (error) {
            console.error("Error loading details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
            setDetails([]);
        } finally {
            setLoading(false);
        }
    };

    // Update consommation handler
    const handleUpdateConsommation = async () => {
        if (!editingConsommation) return;

        console.log('🚀 ===== STARTING UPDATE PROCESS =====');
        console.log('📝 Consommation to update:', editingConsommation);
        console.log('📋 Details to save:', details);

        // Validation
        if (!editingConsommation.matricule) {
            accept('warn', 'Attention', 'Veuillez sélectionner un employé');
            return;
        }

        if (details.length === 0) {
            if (!confirm('Aucun détail n\'a été ajouté. Voulez-vous continuer?')) {
                return;
            }
        }

        try {
            setBtnLoading(true);
            const encodedConsommationId = encodeURIComponent(editingConsommation.consommationId);

            // STEP 1: Update consommation
            console.log('📤 STEP 1: Updating consommation...');
            console.log(`   URL: ${BASE_URL}/update?consommationId=${encodedConsommationId}`);

            const consommationPayload = {
                ...editingConsommation,
                dateConsommation: editingConsommation.dateConsommationD?.toISOString(),
                dateConsommationD: undefined // Remove the transient field
            };
            console.log('   Payload:', JSON.stringify(consommationPayload, null, 2));

            try {
                const updateResponse = await axios.put(
                    `${BASE_URL}/update?consommationId=${encodedConsommationId}`,
                    consommationPayload,
                    getAuthHeaders()
                );
                console.log('✅ STEP 1 SUCCESS - Consommation updated:', updateResponse.data);
            } catch (err: any) {
                console.error('❌ STEP 1 FAILED - Error updating consommation:');
                console.error('   Status:', err.response?.status);
                console.error('   Status Text:', err.response?.statusText);
                console.error('   Error Data:', err.response?.data);
                console.error('   Full Error:', err);
                throw new Error(`Failed to update consommation: ${err.response?.data?.message || err.message}`);
            }

            // STEP 2: Delete old details
            console.log('📤 STEP 2: Deleting old details...');
            console.log(`   URL: ${BASE_URLD}/deletebyconsommation?consommationId=${encodeURIComponent(editingConsommation.consommationId)}`);

            try {
                const deleteResponse = await axios.delete(
                    `${BASE_URLD}/deletebyconsommation?consommationId=${encodeURIComponent(editingConsommation.consommationId)}`,
                    getAuthHeaders()
                );
                console.log('✅ STEP 2 SUCCESS - Old details deleted:', deleteResponse.data);
            } catch (err: any) {
                console.error('❌ STEP 2 FAILED - Error deleting old details:');
                console.error('   Status:', err.response?.status);
                console.error('   Status Text:', err.response?.statusText);
                console.error('   Error Data:', err.response?.data);
                console.error('   Full Error:', err);
                throw new Error(`Failed to delete old details: ${err.response?.data?.message || err.message}`);
            }

            // STEP 3: Create new details
            if (details.length > 0) {
                console.log('📤 STEP 3: Creating new details...');
                console.log(`   URL: ${BASE_URLD}/new`);

                const detailsToSave = details.map(detail => ({
                    ...detail,
                    consommationDetailsId: null,
                    consommationId: editingConsommation.consommationId
                }));
                console.log('   Details payload:', JSON.stringify(detailsToSave, null, 2));

                try {
                    const createResponse = await axios.post(
                        `${BASE_URLD}/new`,
                        detailsToSave,
                        getAuthHeaders()
                    );
                    console.log('✅ STEP 3 SUCCESS - New details created:', createResponse.data);
                } catch (err: any) {
                    console.error('❌ STEP 3 FAILED - Error creating new details:');
                    console.error('   Status:', err.response?.status);
                    console.error('   Status Text:', err.response?.statusText);
                    console.error('   Error Data:', err.response?.data);
                    console.error('   Full Error:', err);
                    throw new Error(`Failed to create new details: ${err.response?.data?.message || err.message}`);
                }
            } else {
                console.log('⏭️  STEP 3 SKIPPED - No details to create');
            }

            console.log('🎉 ===== UPDATE PROCESS COMPLETED SUCCESSFULLY =====');
            accept('success', 'Succès', `Consommation mise à jour avec succès (${details.length} détail(s))`);
            setEditDialogVisible(false);
            setEditingConsommation(null);
            setDetails([]);
            loadAllConsommations();
        } catch (error) {
            console.error('💥 ===== UPDATE PROCESS FAILED =====');
            console.error('Error details:', error);
            accept('error', 'Erreur', 'Échec de la mise à jour: ' + (error as Error).message);
        } finally {
            setBtnLoading(false);
        }
    };

    // Delete consommation handler
    const handleDeleteConsommation = async (rowData: StkConsommation) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer la consommation ${rowData.consommationId}?`)) {
            return;
        }
        try {
            setLoading(true);
            const encodedId = encodeURIComponent(rowData.consommationId);
            // Delete details first
            await axios.delete(`${BASE_URLD}/deletebyconsommation?consommationId=${encodedId}`, getAuthHeaders());
            // Then delete consommation
            await axios.delete(`${BASE_URL}/delete?consommationId=${encodedId}`, getAuthHeaders());
            accept('success', 'Succès', 'Consommation supprimée avec succès');
            loadAllConsommations();
        } catch (error) {
            console.error("Error deleting consommation:", error);
            accept('error', 'Erreur', 'Échec de la suppression');
        } finally {
            setLoading(false);
        }
    };

    // Edit detail handler
    const handleEditDetail = (rowData: StkConsommationDetails) => {
        setEditingDetail({ ...rowData });
        setEditDetailDialogVisible(true);
    };

    // Update detail handler
    const handleUpdateDetail = async () => {
        if (!editingDetail) return;
        try {
            setBtnLoading(true);
            await axios.put(`${BASE_URLD}/update/${editingDetail.consommationDetailsId}`, editingDetail, getAuthHeaders());
            accept('success', 'Succès', 'Détail mis à jour avec succès');
            setEditDetailDialogVisible(false);
            setEditingDetail(null);
            // Reload details
            if (selectedConsommation) {
                loadConsommationDetails(selectedConsommation.consommationId);
            }
        } catch (error) {
            console.error("Error updating detail:", error);
            accept('error', 'Erreur', 'Échec de la mise à jour');
        } finally {
            setBtnLoading(false);
        }
    };

    // Delete detail handler
    const handleDeleteDetail = async (rowData: StkConsommationDetails) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer ce détail?`)) {
            return;
        }
        try {
            setLoading(true);
            await axios.delete(`${BASE_URLD}/delete/${rowData.consommationDetailsId}`, getAuthHeaders());
            accept('success', 'Succès', 'Détail supprimé avec succès');
            // Reload details
            if (selectedConsommation) {
                loadConsommationDetails(selectedConsommation.consommationId);
            }
        } catch (error) {
            console.error("Error deleting detail:", error);
            accept('error', 'Erreur', 'Échec de la suppression');
        } finally {
            setLoading(false);
        }
    };

    const filteredConsommations = consommations.filter(consommation =>
        consommation.consommationId?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        consommation.refBonCommande?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        consommation.matricule?.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const loadConsommationDetails = async (consommationId: string) => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URLD}/findbyconsommation?consommationId=${encodeURIComponent(consommationId)}`);
            setConsommationDetails(response.data);
            setDetailsDialogVisible(true);
        } catch (error) {
            console.error("Error loading entry details:", error);
            accept('error', 'Erreur', 'Échec du chargement des détails');
        } finally {
            setLoading(false);
        }
    };



    // Fonctions pour mapper les IDs aux libellés
    const getEmployeName = (matricule: string) => {
        const employe = employes.find(emp => emp.matriculeId === matricule);
        return employe ? `${employe.nom} ${employe.prenom}` : matricule;
    };

    const getPartenaireLibelle = (partenaireId: string) => {
        const partenaire = partenaires.find(p => p.partenaireId === partenaireId);
        return partenaire ? partenaire.libelle : partenaireId;
    };

    const getPrestationLibelle = (prestationId: string) => {
        const prestation = prestations.find(p => p.prestationId === prestationId);
        return prestation ? prestation.libellePrestation : prestationId;
    };

    const getArticleLibelle = (articleId: string) => {
        const article = articles.find(a => a.articleId === articleId);
        return article ? article.libelle : articleId;
    };

 const getAyantDroitName = (ayantDroitId: number | string) => {
    if (!ayantDroitId) return 'N/A';

    // Find ayant droit by rensAyantDroitId
    const ayantDroit = ayantDroits.find(ad => ad.rensAyantDroitId?.toString() === ayantDroitId.toString());
    if (ayantDroit) {
        const dateStr = ayantDroit.dateNaissance
            ? new Date(ayantDroit.dateNaissance).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })
            : '';
        return `${ayantDroit.nom} ${ayantDroit.prenom}${ayantDroit.categorie ? ` (${ayantDroit.categorie}${dateStr ? ' - ' + dateStr : ''})` : ''}`;
    }

    return ayantDroitId?.toString() || 'N/A';
};

useEffect(() => {
    if (ayantDroits.length > 0) {
        console.log("Structure d'un ayant droit:", ayantDroits[0]);
    }
}, [ayantDroits]);
    return (
        <div className="card">
            <Toast ref={toast} />
            <TabView
                activeIndex={activeIndex}
                onTabChange={(e) => setActiveIndex(e.index)}
                className="p-tabview"
            >
                <TabPanel header="Nouvelle" className="p-tabview-panel">
                    <StkConsommationForm
                        consommation={consommation}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        employes={employes}
                        partenaires={partenaires}
                        prestations={prestations}
                        ayantDroits={ayantDroits}
                        articles={articles}
                        checkConsommationId={checkConsommationId}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            loading={btnLoading}
                            onClick={handleSubmit}
                            className="p-button-success"
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste " className="p-tabview-panel">
                    {/* Search Section */}
                    <div className="mb-4">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0">Recherche des consommations par période</h5>
                            <div className="flex gap-2">
                                <Button
                                    icon="pi pi-search"
                                    label="Rechercher"
                                    onClick={handleSearch}
                                    loading={loading}
                                />
                                <Button
                                    icon="pi pi-times"
                                    label="Effacer"
                                    outlined
                                    onClick={clearSearch}
                                />
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col-3">
                                <label htmlFor="dateDebut">Date Début</label>
                                <Calendar
                                    id="dateDebut"
                                    value={dateDebut}
                                    onChange={(e) => setDateDebut(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-3">
                                <label htmlFor="dateFin">Date Fin</label>
                                <Calendar
                                    id="dateFin"
                                    value={dateFin}
                                    onChange={(e) => setDateFin(e.value as Date)}
                                    dateFormat="dd/mm/yy"
                                    showIcon
                                    className="w-full"
                                />
                            </div>
                            <div className="field col-6">
                                <label htmlFor="globalFilter">Recherche (ID, Référence, Matricule)</label>
                                <InputText
                                    id="globalFilter"
                                    value={globalFilter}
                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                    placeholder="Rechercher par ID, référence ou matricule"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dans le DataTable principal, modifiez les colonnes : */}
                    <DataTable
                        value={filteredConsommations}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune consommation trouvée"
                        className="p-datatable-sm"
                        scrollable
                        scrollHeight="flex"
                    >
                        {/*<Column field="consommationId" header="ID Consommation" sortable />*/}
                        <Column field="matricule" header="matricule" sortable />
                        <Column
                            field="matricule"
                            header="Employé"
                            body={(rowData) => getEmployeName(rowData.matricule)}
                            sortable
                        />
                        <Column field="refBonCommande" header="Référence Bon" sortable />
                        <Column
                            field="dateConsommation"
                            header="Date Consommation"
                            body={(rowData) => formatDate(rowData.dateConsommation)}
                            sortable
                            style={{ minWidth: '120px' }}
                        />
                        <Column field="typeConsommation" header="Type" sortable />
                        <Column field="numeroOrdre" header="N° Ordre" sortable />
                        <Column field="exercice" header="Exercice" sortable />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className="flex gap-2">
                                    <Button
                                        icon="pi pi-eye"
                                        className="p-button-info p-button-sm"
                                        onClick={() => {
                                            setSelectedConsommation(rowData);
                                            loadConsommationDetails(rowData.consommationId);
                                        }}
                                        tooltip="Voir détails"
                                        tooltipOptions={{ position: 'top' }}
                                    />
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-warning p-button-sm"
                                        onClick={() => handleEditConsommation(rowData)}
                                        tooltip="Modifier"
                                        tooltipOptions={{ position: 'top' }}
                                    />
                                    {/*<Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm"
                                        onClick={() => handleDeleteConsommation(rowData)}
                                        tooltip="Supprimer"
                                        tooltipOptions={{ position: 'top' }}
                                    /> */}
                                </div>
                            )}
                            style={{ minWidth: '150px' }}
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
            <Dialog
                header={`Détails de la consommation du matricule:  ${selectedConsommation?.matricule}`}
                visible={detailsDialogVisible}
                style={{ width: '75vw' }}
                onHide={() => setDetailsDialogVisible(false)}
            >
                {loading ? (
                    <div className="flex justify-content-center">
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                    </div>
                ) : (
                    <DataTable
                        value={consommationDetails}
                        emptyMessage="Aucun détail trouvé"
                        className="p-datatable-sm"
                    >
                        <Column
                            field="partenaireId"
                            header="Partenaire"
                            body={(rowData) => getPartenaireLibelle(rowData.partenaireId)}
                        />
                        <Column
                            field="prestationId"
                            header="Prestation"
                            body={(rowData) => getPrestationLibelle(rowData.prestationId)}
                        />
                        <Column
        field="ayantDroit"
        header="Ayant Droit"
        body={(rowData) => getAyantDroitName(rowData.ayantDroit)}
    />
                        <Column
                            field="articleId"
                            header="Article"
                            body={(rowData) => getArticleLibelle(rowData.articleId)}
                        />
                        <Column field="qte" header="Quantité" />
                        <Column field="pu" header="Prix Unitaire"
                            body={(rowData) => rowData.pu?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                        />
                        <Column field="prixTotal" header="Prix Total"
                            body={(rowData) => rowData.prixTotal?.toLocaleString('fr-FR', {
                                style: 'currency',
                                currency: 'BIF',
                                minimumFractionDigits: 0
                            })}
                        />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className="flex gap-2">
                                    <Button
                                        icon="pi pi-pencil"
                                        className="p-button-warning p-button-sm"
                                        onClick={() => handleEditDetail(rowData)}
                                        tooltip="Modifier"
                                        tooltipOptions={{ position: 'top' }}
                                    />
                                    {/*<Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm"
                                        onClick={() => handleDeleteDetail(rowData)}
                                        tooltip="Supprimer"
                                        tooltipOptions={{ position: 'top' }}
                                    /> */}
                                </div>
                            )}
                            style={{ minWidth: '120px' }}
                        />
                    </DataTable>
                )}
            </Dialog>

            {/* Edit Consommation Dialog */}
            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-pencil"></i>
                        <span>Modifier la consommation</span>
                        {editingConsommation && (
                            <span className="text-sm text-500">
                                (ID: {editingConsommation.consommationId})
                            </span>
                        )}
                    </div>
                }
                visible={editDialogVisible}
                style={{ width: '90vw', maxHeight: '90vh' }}
                onHide={() => {
                    setEditDialogVisible(false);
                    setEditingConsommation(null);
                    setDetails([]);
                }}
                maximizable
            >
                {loading ? (
                    <div className="flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                        <i className="pi pi-spinner pi-spin" style={{ fontSize: '2rem' }}></i>
                        <span className="ml-3">Chargement des détails...</span>
                    </div>
                ) : editingConsommation ? (
                    <>
                        <div className="mb-3 p-3 surface-100 border-round">
                            <i className="pi pi-info-circle mr-2"></i>
                            <span className="text-sm">
                                Vous pouvez modifier les informations de la consommation et éditer, ajouter ou supprimer des détails ci-dessous.
                            </span>
                        </div>
                        <StkConsommationForm
                            consommation={editingConsommation}
                            details={details}
                            handleChange={(e) => {
                                const { name, value } = e.target;
                                setEditingConsommation(prev => prev ? { ...prev, [name]: value } : null);
                            }}
                            handleNumberChange={(e, field) => {
                                setEditingConsommation(prev => prev ? { ...prev, [field]: e.value } : null);
                            }}
                            handleDateChange={(value, field) => {
                                setEditingConsommation(prev => prev ? { ...prev, [field]: value } : null);
                            }}
                            handleDropdownChange={(e) => {
                                const { name, value } = e.target;
                                setEditingConsommation(prev => prev ? { ...prev, [name]: value } : null);
                            }}
                            addDetail={addDetail}
                            removeDetail={removeDetail}
                            updateDetail={updateDetail}
                            loading={loading}
                            setDetails={setDetails}
                            employes={employes}
                            partenaires={partenaires}
                            prestations={prestations}
                            ayantDroits={ayantDroits}
                            articles={articles}
                            checkConsommationId={checkConsommationId}
                        />
                        <div className="flex justify-content-between align-items-center gap-2 mt-4 p-3 surface-50 border-round">
                            <div className="text-sm text-500">
                                {details.length} détail(s) dans cette consommation
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    label="Annuler"
                                    icon="pi pi-times"
                                    onClick={() => {
                                        setEditDialogVisible(false);
                                        setEditingConsommation(null);
                                        setDetails([]);
                                    }}
                                    className="p-button-secondary"
                                />
                                <Button
                                    label="Enregistrer les modifications"
                                    icon="pi pi-check"
                                    loading={btnLoading}
                                    onClick={handleUpdateConsommation}
                                    className="p-button-success"
                                />
                            </div>
                        </div>
                    </>
                ) : null}
            </Dialog>

            {/* Edit Detail Dialog */}
            <Dialog
                header="Modifier le détail"
                visible={editDetailDialogVisible}
                style={{ width: '50vw' }}
                onHide={() => {
                    setEditDetailDialogVisible(false);
                    setEditingDetail(null);
                }}
            >
                {editingDetail && (
                    <div className="p-fluid">
                        <div className="field mb-3">
                            <label htmlFor="partenaireId">Partenaire</label>
                            <Dropdown
                                id="partenaireId"
                                value={editingDetail.partenaireId}
                                options={partenaires.map(p => ({ label: p.libelle, value: p.partenaireId }))}
                                onChange={(e) => setEditingDetail(prev => prev ? { ...prev, partenaireId: e.value } : null)}
                                placeholder="Sélectionner un partenaire"
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="prestationId">Prestation</label>
                            <Dropdown
                                id="prestationId"
                                value={editingDetail.prestationId}
                                options={prestations.map(p => ({ label: p.libellePrestation, value: p.prestationId }))}
                                onChange={(e) => setEditingDetail(prev => prev ? { ...prev, prestationId: e.value } : null)}
                                placeholder="Sélectionner une prestation"
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="ayantDroit">Ayant Droit</label>
                            <Dropdown
                                id="ayantDroit"
                                value={editingDetail.ayantDroit}
                                options={ayantDroits.map(ad => ({
                                    label: `${ad.nom} ${ad.prenom}${ad.categorie ? ` (${ad.categorie})` : ''}`,
                                    value: ad.rensAyantDroitId
                                }))}
                                onChange={(e) => setEditingDetail(prev => prev ? { ...prev, ayantDroit: e.value } : null)}
                                placeholder="Sélectionner un ayant droit"
                                filter
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="articleId">Article</label>
                            <Dropdown
                                id="articleId"
                                value={editingDetail.articleId}
                                options={articles.map(a => ({ label: a.libelle, value: a.articleId }))}
                                onChange={(e) => setEditingDetail(prev => prev ? { ...prev, articleId: e.value } : null)}
                                placeholder="Sélectionner un article"
                                filter
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="qte">Quantité</label>
                            <InputNumber
                                id="qte"
                                value={editingDetail.qte}
                                onValueChange={(e) => {
                                    const newQte = e.value || 0;
                                    setEditingDetail(prev => prev ? {
                                        ...prev,
                                        qte: newQte,
                                        prixTotal: newQte * (prev.pu || 0)
                                    } : null);
                                }}
                                min={0}
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="pu">Prix Unitaire</label>
                            <InputNumber
                                id="pu"
                                value={editingDetail.pu}
                                onValueChange={(e) => {
                                    const newPu = e.value || 0;
                                    setEditingDetail(prev => prev ? {
                                        ...prev,
                                        pu: newPu,
                                        prixTotal: (prev.qte || 0) * newPu
                                    } : null);
                                }}
                                mode="currency"
                                currency="BIF"
                                locale="fr-FR"
                            />
                        </div>

                        <div className="field mb-3">
                            <label htmlFor="prixTotal">Prix Total</label>
                            <InputNumber
                                id="prixTotal"
                                value={editingDetail.prixTotal}
                                mode="currency"
                                currency="BIF"
                                locale="fr-FR"
                                disabled
                            />
                        </div>

                        <div className="flex justify-content-end gap-2 mt-3">
                            <Button
                                label="Annuler"
                                icon="pi pi-times"
                                onClick={() => {
                                    setEditDetailDialogVisible(false);
                                    setEditingDetail(null);
                                }}
                                className="p-button-secondary"
                            />
                            <Button
                                label="Enregistrer"
                                icon="pi pi-check"
                                loading={btnLoading}
                                onClick={handleUpdateDetail}
                                className="p-button-success"
                            />
                        </div>
                    </div>
                )}
            </Dialog>

            <style jsx>{`
                .cursor-pointer {
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}