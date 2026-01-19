'use client';

import { useEffect, useRef, useState } from 'react';
import { TabPanel, TabView } from 'primereact/tabview';
import { FicheApurement, FicheApurementDetail, EnterRSP } from './FicheApurement';
import FicheApurementForm from './FicheApurementForm';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import useConsumApi from '../../../../hooks/fetchData/useConsumApi';
import { InputNumberValueChangeEvent } from 'primereact/inputnumber';
import { DropdownChangeEvent } from 'primereact/dropdown';
import { formatDate } from '@fullcalendar/core';
//import { formatDate } from '../../../../utils/dateUtils';
import { buildApiUrl } from '../../../../utils/apiConfig';

const BASE_URL = buildApiUrl('/ficheApurements');
const BASE_URLD = buildApiUrl('/ficheApurementdetails');

export default function FicheApurementPage() {
    const [fiche, setFiche] = useState<FicheApurement>(new FicheApurement());
    const [detail, setdetail] = useState<FicheApurementDetail>(new FicheApurementDetail());

    const [details, setDetails] = useState<FicheApurementDetail[]>([]);
    const [fiches, setFiches] = useState<FicheApurement[]>([]);
    const [rspData, setRspData] = useState<EnterRSP | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const [globalFilter, setGlobalFilter] = useState('');

    const { data: fichesData, fetchData: fetchFiches } = useConsumApi('');
    const { data: rspDataResponse, fetchData: fetchRSP } = useConsumApi('');

    const accept = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };
    const [printEnabled, setPrintEnabled] = useState(false);
    const [lastSavedFiche, setLastSavedFiche] = useState<FicheApurement | null>(null);
    const [lastSavedData, setLastSavedData] = useState<{
        fiche: FicheApurement;
        details: FicheApurementDetail[];
    } | null>(null);

    useEffect(() => {
        loadAllFiches();
    }, []);

    useEffect(() => {
        if (fichesData) {
            setFiches(fichesData);
        }
    }, [fichesData]);

    useEffect(() => {
        if (rspDataResponse) {
            setRspData(rspDataResponse);
            setFiche(prev => ({
                ...prev,
                numLT: rspDataResponse.noLettreTransport,
                clientId: rspDataResponse.importateurId,
                nbreColisTotal: rspDataResponse.nbreColis,
                poidsTotal: rspDataResponse.poids,
                numDMC: rspDataResponse.recuPalan,
                marchandiseId: rspDataResponse.marchandiseId,
                emballageId: rspDataResponse.emballageId,
                nomClient: rspDataResponse.nomClient,
                importateurNom: rspDataResponse.importateurNom,
                natureCoils: rspDataResponse.natureCoils,
                nomMarchandise: rspDataResponse.nomMarchandise,
                ficheId: rspDataResponse.ficheId,


            }));
            accept('success', 'Succès', 'Données RSP récupérées');
        }
    }, [rspDataResponse]);

    const loadAllFiches = () => {
        setLoading(true);
        fetchFiches(null, 'GET', `${BASE_URL}/findallDetails`)
            .finally(() => setLoading(false));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFiche(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (e: InputNumberValueChangeEvent, field: string) => {
        setFiche(prev => ({ ...prev, [field]: e.value }));
    };

    const handleDateChange = (value: Date | null | undefined, field: string) => {
        setFiche(prev => ({ ...prev, [field]: value }));
    };

    const handleDropdownChange = (e: DropdownChangeEvent) => {
        const { name, value } = e.target;
        setFiche(prev => ({ ...prev, [name]: value }));
    };

    const fetchRSPData = async (numDMC: string) => {
        setLoading(true);
        try {
            // D'abord vérifier si le numLT existe dans la table de vérification
            const verificationResponse = await fetch(buildApiUrl(`/ficheApurements/findbyVerificationRSP?rsp=${numDMC}`));

            if (verificationResponse.ok) {
                const verificationData = await verificationResponse.json();

                // Si des données sont retournées, utiliser l'endpoint de vérification
                if (verificationData) {
                    await fetchRSP(null, 'GET', buildApiUrl(`/ficheApurements/findbyVerificationRSP?rsp=${numDMC}`));
                    return;
                }
            }
            else {
                // Sinon, utiliser l'endpoint normal
                await fetchRSP(null, 'GET', buildApiUrl(`/ficheApurements/findbyRSP?rsp=${numDMC}`));
                return;
            }
        } catch (error) {
            accept('error', 'Erreur', 'RSP non trouvée');
        } finally {
            setLoading(false);
        }
    };

    const addDetail = () => {
        setDetails(prev => [...prev, new FicheApurementDetail()]);
    };

    const removeDetail = (index: number) => {
        setDetails(prev => prev.filter((_, i) => i !== index));
    };

    const verifyQuantities = (index: number, colis: number | undefined, poids: number | undefined) => {
        setDetails(prev => prev.map((detail, i) => {
            if (i !== index) return detail;

            const errors = {
                colisError: '',
                poidsError: ''
            };

            if (colis === undefined || colis === null || isNaN(colis)) {
                errors.colisError = 'La quantité de colis est requise';
            } else if (colis < 0) {
                errors.colisError = 'La quantité ne peut pas être négative';
            }

            if (poids === undefined || poids === null || isNaN(poids)) {
                errors.poidsError = 'Le poids est requis';
            } else if (poids < 0) {
                errors.poidsError = 'Le poids ne peut pas être négatif';
            }

            return { ...detail, ...errors };
        }));
    };

    // Modifier votre fonction updateDetail pour inclure la validation

    const updateDetail = (index: number, field: string, value: any) => {
        setDetails(prev => {
            const newDetails = [...prev];
            newDetails[index] = {
                ...newDetails[index],
                [field]: value
            };

            // Verify quantities when relevant fields change
            if (field === 'nbreColisSortis' || field === 'poidsSortis') {
                verifyQuantities(
                    index,
                    field === 'nbreColisSortis' ? value : newDetails[index].nbreColisSortis,
                    field === 'poidsSortis' ? value : newDetails[index].poidsSortis
                );
            }

            return newDetails;
        });
    };

    const calculateRestants = () => {
        // Convertir les valeurs en nombres (en gérant les cas vides/nuls)
        const nbreColisTotal = fiche.nbreColisTotal || 0;
        const nbreColisSortis = detail.nbreColisSortis || 0;
        const poidsTotal = fiche.poidsTotal || 0;
        const poidsSortis = detail.poidsSortis || 0;

        // Calculer les valeurs restantes
        const colisRestants = nbreColisTotal - nbreColisSortis;
        const poidsRestants = poidsTotal - poidsSortis;

        // Mettre à jour la fiche avec les nouvelles valeurs
        setFiche(prev => ({
            ...prev,
            colisRestants: colisRestants > 0 ? colisRestants : 0,
            poidsRestants: poidsRestants > 0 ? poidsRestants : 0
        }));
    };

    // Appeler cette fonction quand les valeurs de base changent
    useEffect(() => {
        calculateRestants();
    }, [fiche.nbreColisTotal, detail.nbreColisSortis, fiche.poidsTotal, detail.poidsSortis]);



    const handleSubmit = async () => {
        // Vérifier que toutes les quantités sont valides
        const hasErrors = details.some(detail =>
            detail.colisError || detail.colisError ||
            isNaN(detail.nbreColisSortis) || isNaN(detail.poidsSortis)
        );

        if (hasErrors) {
            accept('error', 'Erreur', 'Veuillez corriger les erreurs dans les détails');
            return;
        }

        try {
            // Vérifier d'abord si le numéro existe dans la table de vérification
            //const verificationResponse = await fetch(`${BASE_URL}/findbyVerificationRSP?rsp=${fiche.numDMC}`);
            const verificationResponse = await fetch(buildApiUrl(`/ficheApurements/findbyVerificationRSP?rsp=${fiche.numDMC}`));

            if (verificationResponse.ok) {
                const verificationData = await verificationResponse.json();

                if (verificationData) {
                    // Cas 1: Données existent dans verificationRSP - on ne sauvegarde que les détails
                    const detailsToSave = details.map(detail => ({
                        ...detail,
                        ficheApurementId: verificationData.ficheId, // Utiliser l'ID existant
                        ficheId: verificationData.ficheId,
                        nbreColisSortis: Number(detail.nbreColisSortis) || 0,
                        poidsSortis: Number(detail.poidsSortis) || 0,
                        dateCaisse: detail.dateCaisse?.toISOString(),
                        colisRestants: Number(verificationData.nbreColisTotal - detail.nbreColisSortis) || 0,
                        poidsRestants: Number(verificationData.poidsTotal - detail.poidsSortis) || 0
                    }));

                    await fetch(`${BASE_URLD}/new`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(detailsToSave)
                    });

                    accept('success', 'Success', 'Détails sauvegardés avec succès');
                    setFiche(new FicheApurement());
                    setDetails([]);
                    loadAllFiches();
                    return;
                }
            }

            else {
                // Cas 2: Aucune donnée dans verificationRSP - créer nouvelle fiche + détails
                const ficheToSend = {
                    ...fiche,
                    ficheId: undefined,
                    nbreColisTotal: Number(fiche.nbreColisTotal) || 0,
                    poidsTotal: Number(fiche.poidsTotal) || 0,
                    dateCreation: fiche.dateCreation?.toISOString()
                };

                // 1. Save main fiche
                const ficheResponse = await fetch(`${BASE_URL}/new`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(ficheToSend)
                }).then(res => res.json());

                if (!ficheResponse?.ficheId) {
                    throw new Error("Failed to save fiche");
                }

                // 2. Save details
                const detailsToSave = details.map(detail => ({
                    ...detail,
                    ficheApurementId: ficheResponse.ficheId,
                    ficheId: ficheResponse.ficheId,
                    nbreColisSortis: Number(detail.nbreColisSortis) || 0,
                    poidsSortis: Number(detail.poidsSortis) || 0,
                    dateCaisse: detail.dateCaisse?.toISOString(),
                    colisRestants: Number(ficheResponse.nbreColisTotal - detail.nbreColisSortis) || 0,
                    poidsRestants: Number(ficheResponse.poidsTotal - detail.poidsSortis) || 0
                }));

                await fetch(`${BASE_URLD}/new`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(detailsToSave)
                });

                // Success handling
                accept('success', 'Success', 'Fiche et détails sauvegardés avec succès');
                setFiche(new FicheApurement());
                setDetails([]);
                loadAllFiches();

            }

            setLastSavedData({
                fiche: { ...fiche },
                details: [...details]
            });
            setPrintEnabled(true);
        } catch (error) {
            accept('error', 'Error', 'Échec de la sauvegarde');
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

    const filteredFiches = fiches.filter(fiche =>
        fiche.numLT.toLowerCase().includes(globalFilter.toLowerCase()) ||
        fiche.numDMC.toLowerCase().includes(globalFilter.toLowerCase())
    );


    const handlePrint = async (numDMC?: string) => {
    try {
        // 1. Validation initiale
        if (!numDMC && !fiche.numDMC) {
            throw new Error('Aucun numéro DMC disponible');
        }

        // 2. Récupération des données
        const targetDMC = numDMC || fiche.numDMC;
        let ficheToPrint: FicheApurement;
        let detailsToPrint: FicheApurementDetail[] = [];

        if (numDMC) {
            // Mode impression depuis la liste
            const response = await fetch(buildApiUrl(`/ficheApurements/findallFicheDetails?rsp=${targetDMC}`));
            
            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const apiData = await response.json();
            console.log('API Response:', apiData); // Debug

            // Validation de la structure des données
            if (!apiData || (!apiData.fiche && !apiData.details)) {
                throw new Error('Structure de données invalide');
            }

            ficheToPrint = apiData.fiche || {
                numLT: 'N/A',
                nomClient: 'N/A',
                numDMC: targetDMC,
                dateCreation: new Date(),
                nbreColisTotal: 0,
                poidsTotal: 0
            };

            detailsToPrint = Array.isArray(apiData.details) 
                ? apiData.details.filter((d: any) => d) // Filtre les entrées null
                : [];
        } else {
            // Mode brouillon
            ficheToPrint = { 
                ...fiche,
                numLT: fiche.numLT || 'N/A',
                nomClient: fiche.nomClient || 'N/A',
                dateCreation: fiche.dateCreation || new Date()
            };
            detailsToPrint = Array.isArray(details) 
                ? details.filter(d => d) // Filtre les entrées null
                : [];
        }

        // 3. Validation des sorties
        if (detailsToPrint.length === 0) {
            console.warn('Aucun détail de sortie trouvé');
        }

        // 4. Formatage sécurisé des sorties
        const formatSortie = (sortie: FicheApurementDetail) => {
            try {
                return {
                    plaque: sortie?.plaque?.trim() || 'N/A',
                    date: sortie?.dateCaisse ? formatDate(sortie.dateCaisse) : 'N/A',
                    colis: Number(sortie?.nbreColisSortis) || 0,
                    poids: Number(sortie?.poidsSortis) || 0
                };
            } catch (error) {
                console.error('Erreur de formatage:', error);
                return {
                    plaque: 'ERREUR',
                    date: 'ERREUR',
                    colis: 0,
                    poids: 0
                };
            }
        };

        // 5. Calcul des totaux
        const { totalColis, totalPoids } = detailsToPrint.reduce(
            (acc, sortie) => {
                const formatted = formatSortie(sortie);
                return {
                    totalColis: acc.totalColis + formatted.colis,
                    totalPoids: acc.totalPoids + formatted.poids
                };
            },
            { totalColis: 0, totalPoids: 0 }
        );

        // 6. Génération du HTML
        const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>Fiche Apurement - ${ficheToPrint.numDMC}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; }
                    .number { text-align: right; }
                    .total-row { font-weight: bold; background-color: #f5f5f5; }
                </style>
            </head>
            <body>
                <h1>Fiche d'Apurement</h1>
                
                <div class="header">
                    <div>
                        <p><strong>N° LT:</strong> ${ficheToPrint.numLT}</p>
                        <p><strong>Client:</strong> ${ficheToPrint.nomClient}</p>
                    </div>
                    <div>
                        <p><strong>Date:</strong> ${formatDate(ficheToPrint.dateCreation)}</p>
                        <p><strong>DMC/RSP:</strong> ${ficheToPrint.numDMC}</p>
                    </div>
                </div>

                <h3>Détail des ${detailsToPrint.length} sortie(s)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Plaque</th>
                            <th>Date sortie</th>
                            <th class="number">Colis</th>
                            <th class="number">Poids (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${detailsToPrint.map(sortie => {
                            const f = formatSortie(sortie);
                            return `
                                <tr>
                                    <td>${f.plaque}</td>
                                    <td>${f.date}</td>
                                    <td class="number">${f.colis}</td>
                                    <td class="number">${f.poids}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="2">TOTAL</td>
                            <td class="number">${totalColis}</td>
                            <td class="number">${totalPoids}</td>
                        </tr>
                        <tr class="total-row">
                            <td colspan="2">RESTANT</td>
                            <td class="number">${(ficheToPrint.nbreColisTotal || 0) - totalColis}</td>
                            <td class="number">${(ficheToPrint.poidsTotal || 0) - totalPoids}</td>
                        </tr>
                    </tfoot>
                </table>

                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            setTimeout(window.close, 100);
                        }, 300);
                    }
                </script>
            </body>
        </html>
        `;

        // 7. Impression
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
        } else {
            throw new Error('Popup bloquée - Autorisez les popups pour imprimer');
        }

    } catch (error) {
        console.error('Erreur:', error);
        accept('error', 'Erreur','Échec de l\'mpression');
    }
};

    const optionButtons = (data: FicheApurement): React.ReactNode => {
    return (
        <div className='flex flex-wrap gap-2'>
            <Button 
                icon="pi pi-print" 
                onClick={() => handlePrint(data.numDMC)}
                raised 
                severity='info' 
                tooltip="Imprimer la fiche"
                loading={loading}
            />
        </div>
    );
};


    return (
        <>
            <Toast ref={toast} />
            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle fiche">
                    <FicheApurementForm
                        fiche={fiche}
                        details={details}
                        rspData={rspData}
                        handleChange={handleChange}
                        handleNumberChange={handleNumberChange}
                        handleDateChange={handleDateChange}
                        handleDropdownChange={handleDropdownChange}
                        fetchRSPData={fetchRSPData}
                        addDetail={addDetail}
                        removeDetail={removeDetail}
                        updateDetail={updateDetail}
                        loading={loading}
                        //verifyQuantities={verifyQuantities}
                        // details={details}
                        setDetails={setDetails}  // Add this line
                    />
                    <div className="flex justify-content-end gap-2 mt-3">
                        <Button
                            label="Enregistrer"
                            icon="pi pi-check"
                            loading={btnLoading}
                            onClick={handleSubmit}
                        />
                        <Button
                            icon="pi pi-print"
                            label="Imprimer"
                            onClick={() => handlePrint()} // Sans paramètre pour imprimer les données du formulaire
                            severity="info"
                            disabled={!fiche.numDMC} // Désactiver si aucun numéro DMC n'est saisi
                            tooltip={!fiche.numDMC ? "Veuillez d'abord saisir un numéro DMC" : "Imprimer les données actuelles"}
                        />
                    </div>
                </TabPanel>
                <TabPanel header="Liste des fiches">
                    <div className="mb-3 flex justify-content-between align-items-center">
                        <span className="p-input-icon-left" style={{ width: '40%' }}></span>
                        <span className="p-input-icon-right">
                            <i className="pi pi-search" />
                            <InputText
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                placeholder="Rechercher par LT ou DMC"
                            />
                        </span>
                    </div>
                    <DataTable
                        value={filteredFiches}
                        loading={loading}
                        paginator
                        rows={10}
                        emptyMessage="Aucune fiche trouvée"
                    >   <Column field="numDMC" header="DMC/RSP" sortable />
                        <Column field="numLT" header="LT" sortable />
                        <Column field="plaque" header="plaque" sortable />
                        <Column field="nbreColisSortis" header="Nbre clois Sortis" sortable />
                        <Column field="poidsSortis" header="Poids Sortis" sortable />
                        <Column field="colisRestants" header="Colis Restants" sortable />
                        <Column field="poidsRestants" header="Poids Restants" sortable />

                        <Column field="dateCaisse" header="Date Opération"
                            body={(rowData) => formatDate(rowData.dateCaisse)}
                            sortable
                        />
                        {/*<Column header="Options" body={optionButtons} /> */}
                    </DataTable>
                </TabPanel>
            </TabView>
        </>
    );
}