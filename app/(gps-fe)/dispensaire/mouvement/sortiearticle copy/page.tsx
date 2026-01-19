'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { StkSortie, StkSortieDetails, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable, StkServiceResponsable, StkUnite } from './StkSortie';
import StkSortieForm from './StkSortieForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';

const BASE_URL = 'http://localhost:8080/stkSorties';
const BASE_URLD = 'http://localhost:8080/stkSortieDetails';

export default function StkSortiePage() {
    const [sortie, setSortie] = useState<StkSortie>(new StkSortie());
    const [details, setDetails] = useState<StkSortieDetails[]>([]);
    const [sorties, setSorties] = useState<StkSortie[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    // Données pour les dropdowns
    const [typeMvts, setTypeMvts] = useState<TypeMvt[]>([]);
    const [articles, setArticles] = useState<StkArticle[]>([]);
    const [exercices, setExercices] = useState<StkExercice[]>([]);
    const [magasins, setMagasins] = useState<StkMagasin[]>([]);
    const [magasinResponsables, setMagasinResponsables] = useState<StkMagasinResponsable[]>([]);
    const [serviceResponsables, setServiceResponsables] = useState<StkServiceResponsable[]>([]);
    const [unites, setUnites] = useState<StkUnite[]>([]);

    const { data: sortiesData, fetchData: fetchSorties } = useConsumApi('');
    const { data: dropdownData, fetchData: fetchDropdownData } = useConsumApi('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    useEffect(() => {
        loadAllSorties();
        loadDropdownData();
    }, []);

    useEffect(() => {
        if (sortiesData) {
            setSorties(sortiesData);
        }
    }, [sortiesData]);

    useEffect(() => {
        if (dropdownData) {
            // Selon votre API, vous devrez peut-être adapter cette partie
            setTypeMvts(dropdownData.typeMvts || []);
            setArticles(dropdownData.articles || []);
            setExercices(dropdownData.exercices || []);
            setMagasins(dropdownData.magasins || []);
            setMagasinResponsables(dropdownData.magasinResponsables || []);
            setServiceResponsables(dropdownData.serviceResponsables || []);
            setUnites(dropdownData.unites || []);
        }
    }, [dropdownData]);

    const loadAllSorties = () => {
        setLoading(true);
        fetchSorties(null, 'GET', `${BASE_URL}/findall`)
            .finally(() => setLoading(false));
    };

    const loadDropdownData = async () => {
    try {
        setLoading(true);
        
        const endpoints = [
            { url: 'http://localhost:8080/magasins/findall', setter: setMagasins },
            { url: 'http://localhost:8080/typeMvts/findall', setter: setTypeMvts },
            { url: 'http://localhost:8080/stkExercices/findall', setter: setExercices },            
            { url: 'http://localhost:8080/articles/findall', setter: setArticles },
            { url: 'http://localhost:8080/serviceResponsables/findall', setter: setServiceResponsables },
            { url: 'http://localhost:8080/stkMagasinResponsables/findall', setter: setMagasinResponsables },
            { url: 'http://localhost:8080/unites/findall', setter: setUnites }
        ];

        // Exécute toutes les requêtes en parallèle
        const responses = await Promise.all(
            endpoints.map(endpoint => fetch(endpoint.url))
        );

        // Vérifie les réponses
        const errors = responses.filter(response => !response.ok);
        if (errors.length > 0) {
            throw new Error(`${errors.length} requêtes ont échoué`);
        }

        // Convertit les réponses en JSON
        const data = await Promise.all(
            responses.map(response => response.json())
        );

        // Met à jour les états correspondants
        endpoints.forEach((endpoint, index) => {
            endpoint.setter(data[index]);
        });

    } catch (error) {
        console.error("Error in loadDropdownData:", error);
        accept('error', 'Erreur', 'Problème lors du chargement des données');
    } finally {
        setLoading(false);
    }
};






    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSortie(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setSortie(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setSortie(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent, field: string) => {
        setSortie(prev => ({ ...prev, [field]: e.value }));
    };

    const fetchByNumeroPiece = async (numeroPiece: string) => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/findByNumeroPiece?numeroPiece=${numeroPiece}`);
            if (response.ok) {
                const data = await response.json();
                setSortie(data.sortie);
                setDetails(data.details || []);
                accept('success', 'Succès', 'Données chargées avec succès');
            } else {
                accept('info', 'Information', 'Aucune donnée trouvée pour ce numéro');
            }
        } catch (error) {
            accept('error', 'Erreur', 'Échec de la recherche');
        } finally {
            setLoading(false);
        }
    };

    const addDetail = () => {
        setDetails(prev => [...prev, new StkSortieDetails()]);
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

            // Calcul automatique du prix total si PUMP ou quantité changent
            if (field === 'pUMP' || field === 'qteS') {
                newDetails[index].prixTotal = (newDetails[index].pUMP || 0) * (newDetails[index].qteS || 0);
            }

            return newDetails;
        });
    };

    const verifyQuantities = (index: number, qteS: number | undefined) => {
        setDetails(prev => prev.map((detail, i) => {
            if (i !== index) return detail;

            const errors = {
                qteError: ''
            };

            if (qteS === undefined || qteS === null || isNaN(qteS)) {
                errors.qteError = 'La quantité est requise';
            } else if (qteS <= 0) {
                errors.qteError = 'La quantité doit être positive';
            }

            return { ...detail, ...errors };
        }));
    };

    const handleSubmit = async () => {
        // Vérification des erreurs
        const hasErrors = details.some(detail => 
            detail.qteError || isNaN(detail.qteS) || detail.qteS <= 0
        );

        if (hasErrors) {
            accept('error', 'Erreur', 'Veuillez corriger les erreurs dans les détails');
            return;
        }

        setBtnLoading(true);
        try {
            // Envoi de la sortie principale
            const sortieResponse = await fetch(`${BASE_URL}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sortie)
            }).then(res => res.json());

            if (!sortieResponse?.sortieId) {
                throw new Error("Failed to save sortie");
            }

            // Préparation des détails avec l'ID de la sortie
            const detailsToSave = details.map(detail => ({
                ...detail,
                sortieId: sortieResponse.sortieId,
                prixTotal: (detail.pUMP || 0) * (detail.qteS || 0)
            }));

            // Envoi des détails
            await fetch(`${BASE_URLD}/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(detailsToSave)
            });

            accept('success', 'Succès', 'Sortie enregistrée avec succès');
            setSortie(new StkSortie());
            setDetails([]);
            loadAllSorties();
        } catch (error) {
            accept('error', 'Erreur', 'Échec de l\'enregistrement');
            console.error("Save error:", error);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredSorties = sorties.filter(sortie =>
        sortie.numeroPiece.toLowerCase().includes(globalFilter.toLowerCase()) ||
        sortie.reference.toLowerCase().includes(globalFilter.toLowerCase())
    );

    const calculateTotal = (field: string) => {
        return details.reduce((sum, detail) => sum + (detail[field] || 0), 0);
    };

    return (
        <>
            <Toast ref={toast} />
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle sortie">
                    <StkSortieForm
                        sortie={sortie}
                        details={details}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        fetchByNumeroPiece={fetchByNumeroPiece}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        setDetails={setDetails}
                        typeMvts={typeMvts}
                        articles={articles}
                        exercices={exercices}
                        magasins={magasins}
                        magasinResponsables={magasinResponsables}
                        serviceResponsables={serviceResponsables}
                        unites={unites}
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste des sorties">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-left" style={{ width: '40%' }}></span>
                        <span className="p-input-icon-right">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par numéro ou référence"
                            />
                        </span>
                    </div>
                    <DataTable
                        value={filteredSorties}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune sortie trouvée"
                    >
                        <Column field="numeroPiece" header="Numéro pièce" sortable />
                        <Column field="reference" header="Référence" sortable />
                        <Column field="dateSortie" header="Date sortie" 
                            body={(rowData) => formatDate(rowData.dateSortie)}
                            sortable
                        />
                        <Column field="montant" header="Montant" 
                            body={(rowData) => rowData.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                            sortable
                        />
                    </DataTable>
                </TabPanel>
            </TabView>
        </>
    );
}