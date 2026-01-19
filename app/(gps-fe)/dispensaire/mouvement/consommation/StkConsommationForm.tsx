'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import {
    StkConsommationDetails,
    StkEmploye,
    StkPartenaire,
    StkPrestation,
    GrhRensAyantDroit,
    StkArticle
} from "./StkConsommation";

import StkConsommation from "./StkConsommation";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import axios from "axios";
import { API_BASE_URL } from '@/utils/apiConfig';

interface StkConsommationFormProps {
    consommation: StkConsommation;
    details: StkConsommationDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: string, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkConsommationDetails[]>>;
    employes: StkEmploye[];
    partenaires: StkPartenaire[];
    prestations: StkPrestation[];
    ayantDroits: GrhRensAyantDroit[];
    articles: StkArticle[];
    checkConsommationId: (consommationId: string) => Promise<boolean>;
}

const StkConsommationForm: React.FC<StkConsommationFormProps> = ({
    consommation,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    employes,
    partenaires,
    prestations,
    ayantDroits,
    articles,
    checkConsommationId
}) => {
    const toast = useRef<Toast>(null);
    const [consommationIdExists, setConsommationIdExists] = useState(false);
    const [selectedEmploye, setSelectedEmploye] = useState<StkEmploye | null>(null);

    // Initialize selectedEmploye when consommation.matricule is set (for editing mode)
    useEffect(() => {
        console.log('🔄 useEffect triggered - matricule:', consommation.matricule, 'employes:', employes.length);
        if (consommation.matricule && employes.length > 0) {
            const employe = employes.find(emp => emp.matriculeId === consommation.matricule);
            if (employe) {
                console.log('✅ Initializing selectedEmploye for editing:', employe);
                setSelectedEmploye(employe);
            } else {
                console.log('⚠️ Employee not found in employes array for matricule:', consommation.matricule);
            }
        } else {
            console.log('⏸️ Waiting for matricule or employes:', {
                hasMatricule: !!consommation.matricule,
                employesCount: employes.length
            });
        }
    }, [consommation.matricule, employes]);

    // Pré-traiter les données pour avoir des noms complets
    const employesAvecNomComplet = employes.map(emp => ({
        ...emp,
        nomComplet: `${emp.nom} ${emp.prenom}`
    }));

    const ayantDroitsAvecNomComplet = ayantDroits.map((ad, index) => {
        // Format date for display
        const dateStr = ad.dateNaissance
            ? new Date(ad.dateNaissance).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })
            : 'Date inconnue';

        // Create a unique composite ID using timestamp to handle Date objects properly
        const dateTimestamp = ad.dateNaissance ? new Date(ad.dateNaissance).getTime() : 'null';

        return {
            ...ad,
            nomComplet: `${ad.nom} ${ad.prenom} (${ad.categorie || 'N/A'} - ${dateStr})`,
            compositeId: `${ad.matriculeId}_${ad.categorie}_${ad.nom}_${ad.prenom}_${dateTimestamp}_${ad.refExtraitActeNaissance || index}`, // For display uniqueness
            rensAyantDroitId: ad.rensAyantDroitId // The actual database ID to save
        };
    });

// Filtrer les ayants droits pour n'afficher que ceux de l'employé sélectionné
const filteredAyantDroits = selectedEmploye
    ? ayantDroitsAvecNomComplet
        .filter(ad => {
            // Convertir le matriculeId de l'ayant droit (number) en string pour la comparaison
            return ad.matriculeId?.toString() === selectedEmploye.matriculeId;
        })
        .map((ad, index) => ({
            ...ad,
            // Add index to make each entry unique in case of duplicates
            compositeId: `${ad.compositeId}_${index}`,
            nomComplet: ad.nomComplet + (
                // Check if there are duplicates with the same display name
                ayantDroitsAvecNomComplet.filter(
                    other => other.nom === ad.nom &&
                             other.prenom === ad.prenom &&
                             other.categorie === ad.categorie &&
                             other.matriculeId?.toString() === selectedEmploye.matriculeId
                ).length > 1
                    ? ` [${index + 1}]`
                    : ''
            )
        }))
    : [];

    // Log when details change
    useEffect(() => {
        console.log('📝 Details changed:', details.length, 'items');
        details.forEach((detail, index) => {
            console.log(`  Detail ${index}:`, {
                articleId: detail.articleId,
                ayantDroit: detail.ayantDroit
            });
        });
    }, [details]);

    // Log when filteredAyantDroits changes
    useEffect(() => {
        console.log('👥 filteredAyantDroits changed:', filteredAyantDroits.length, 'items for employee:', selectedEmploye?.matriculeId);
        if (filteredAyantDroits.length > 0) {
            console.log('  Available ayant droits:', filteredAyantDroits.map(ad => ({
                id: ad.rensAyantDroitId,
                nom: ad.nomComplet
            })));
        }
    }, [filteredAyantDroits, selectedEmploye]);

    // Log when articles change
    useEffect(() => {
        console.log('📦 Articles available:', articles.length);
        if (articles.length > 0 && details.length > 0) {
            details.forEach((detail, index) => {
                const article = articles.find(a => a.articleId === detail.articleId);
                console.log(`  Detail ${index} article ${detail.articleId}:`, article ? `Found - ${article.libelle}` : 'NOT FOUND');
            });
        }
    }, [articles, details]);

    const handleEmployeChange = (e: DropdownChangeEvent) => {
        // Mettre à jour la valeur du matricule
        handleDropdownChange(e);

        // Trouver l'employé sélectionné pour filtrer les ayants droits
        const selected = employes.find(emp => emp.matriculeId === e.value);
        setSelectedEmploye(selected || null);

        if (selected) {
            const filtered = ayantDroitsAvecNomComplet.filter(ad => 
                ad.matriculeId?.toString() === selected.matriculeId?.toString()
            );
            console.log("Employé sélectionné:", selected);
            console.log("Ayants droits filtrés:", filtered);
        }

    };



    /*const handleDropdownChange = (e: DropdownChangeEvent) => {
         const { name, value } = e.target;
         setEntree(prev => ({ ...prev, [name]: value }));
     };
       */
    const handleConsommationIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const consommationId = e.target.value;
        if (consommationId) {
            const exists = await checkConsommationId(consommationId);
            setConsommationIdExists(exists);
            if (exists) {
                try {
                    const response = await axios.get(`${API_BASE_URL}/stkConsommations/findbyid?consommationId=${consommationId}`);
                    const existingConsommation = response.data;
                    Object.keys(existingConsommation).forEach(key => {
                        if (key in consommation) {
                            //consommation[key as keyof StkConsommation] = existingConsommation[key];
                        }
                    });
                } catch (error) {
                    console.error("Error loading existing entry:", error);
                }
            }
        }
    };

    const calculatePrixTotal = (qte: number, pu: number) => {
        return qte * pu;
    };

    const verifyQuantities = (rowIndex: number, qte: number | undefined, pu: number | undefined) => {
        const errors = {
            qteError: '',
            puError: ''
        };

        if (qte === undefined || qte === null || isNaN(qte)) {
            errors.qteError = 'La quantité est requise';
        } else if (qte < 0) {
            errors.qteError = 'La quantité ne peut pas être négative';
        }

        if (pu === undefined || pu === null || isNaN(pu)) {
            errors.puError = 'Le prix unitaire est requis';
        } else if (pu < 0) {
            errors.puError = 'Le prix unitaire ne peut pas être négatif';
        }

        if (errors.qteError || errors.puError) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erreur de validation',
                detail: `${errors.qteError ? errors.qteError + ' ' : ''}${errors.puError || ''}`,
                life: 3000
            });
        }
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <style jsx>{`
                :global(.editable-cells-table .p-datatable-tbody > tr > td) {
                    padding: 0.5rem;
                }
                :global(.editable-cells-table .p-dropdown),
                :global(.editable-cells-table .p-inputnumber) {
                    width: 100%;
                }
                :global(.editable-cells-table .p-datatable-tbody > tr:hover) {
                    background-color: #f8f9fa;
                }
            `}</style>
            <div className="formgrid grid">
                {/*<div className="field col-12 md:col-3">
                    <label htmlFor="consommationId">ID Consommation</label>
                    <InputText
                        id="consommationId"
                        name="consommationId"
                        value={consommation.consommationId}
                        onChange={handleChange}
                        onBlur={handleConsommationIdBlur}
                        className={consommationIdExists ? 'p-invalid' : ''}
                    />
                    {consommationIdExists && <small className="p-error">Cet ID existe déjà</small>}
                </div>
                */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="matricule">Employé</label>
                    <Dropdown
                        id="matricule"
                        name="matricule" // ← Changez à "matricule"
                        value={consommation.matricule}
                        options={employesAvecNomComplet}
                        optionLabel="nomComplet"
                        optionValue="matriculeId"
                        onChange={handleEmployeChange}
                        placeholder="Sélectionnez un employé"
                        filter
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="refBonCommande">Référence Bon Commande</label>
                    <InputText
                        id="refBonCommande"
                        name="refBonCommande"
                        value={consommation.refBonCommande}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="dateConsommationD">Date Consommation</label>
                    <Calendar
                        id="dateConsommationD"
                        value={consommation.dateConsommationD}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateConsommationD')}
                        showIcon
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-3">
                    <label htmlFor="typeConsommation">Type Consommation</label>
                    <InputText
                        id="typeConsommation"
                        name="typeConsommation"
                        value={consommation.typeConsommation}
                        onChange={handleChange}
                    />
                </div>

               {/*<div className="field col-12 md:col-3">
                    <label htmlFor="numeroOrdre">Numéro d'Ordre</label>
                    <InputNumber
                        id="numeroOrdre"
                        value={consommation.numeroOrdre}
                        onValueChange={(e) => handleNumberChange(e, 'numeroOrdre')}
                        min={0}
                    />
                </div>
                */}

                <div className="field col-12 md:col-2">
                    <label htmlFor="exercice">Exercice</label>
                    <InputNumber
                        id="exercice"
                        value={consommation.exercice}
                        onValueChange={(e) => handleNumberChange(e, 'exercice')}
                        min={0}
                    />
                </div>

                <div className="col-12">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <div>
                            <h4 className="mb-2">Détails de la consommation</h4>
                          
                        </div>
                        <Button
                            icon="pi pi-plus"
                            label="Ajouter un détail"
                            onClick={addDetail}
                            className="p-button-success"
                        />
                    </div>

                    <DataTable
                        value={details}
                        responsiveLayout="scroll"
                        emptyMessage="Aucun détail. Cliquez sur 'Ajouter un détail' pour commencer."
                        className="editable-cells-table"
                        stripedRows
                    >
                        <Column
                            field="partenaireId"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Partenaire</span>}
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.partenaireId}
                                    options={partenaires}
                                    optionLabel="libelle"
                                    optionValue="partenaireId"
                                    onChange={(e) => updateDetail(rowIndex, 'partenaireId', e.value)}
                                    placeholder="Sélectionnez"
                                    filter
                                />
                            )}
                        />
                        <Column
                            field="prestationId"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Prestation</span>}
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.prestationId}
                                    options={prestations}
                                    optionLabel="libellePrestation"
                                    optionValue="prestationId"
                                    onChange={(e) => updateDetail(rowIndex, 'prestationId', e.value)}
                                    placeholder="Sélectionnez"
                                    filter
                                />
                            )}
                        />
                        <Column
                            field="articleId"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Article</span>}
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.articleId}
                                    options={articles}
                                    optionLabel="libelle"
                                    optionValue="articleId"
                                    onChange={(e) => {
                                        // Update article ID
                                        updateDetail(rowIndex, 'articleId', e.value);

                                        // Find selected article and update unit price
                                        const selectedArticle = articles.find(art => art.articleId === e.value);
                                        if (selectedArticle) {
                                            const prixUnitaire = selectedArticle.prixVente || 0;
                                            updateDetail(rowIndex, 'pu', prixUnitaire);

                                            // Recalculate total price
                                            const currentQte = rowData.qte || 0;
                                            updateDetail(rowIndex, 'prixTotal', calculatePrixTotal(currentQte, prixUnitaire));
                                        }
                                    }}
                                    placeholder="Sélectionnez"
                                    filter
                                />
                            )}
                        />
                        <Column
                            field="ayantDroit"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Ayant Droit</span>}
                            body={(rowData, { rowIndex }) => (
                                <div className="flex flex-column">
                                    <Dropdown
                                        value={rowData.ayantDroit}
                                        options={filteredAyantDroits}
                                        optionLabel="nomComplet"
                                        optionValue="rensAyantDroitId" // Use database ID for saving
                                        onChange={(e) => updateDetail(rowIndex, 'ayantDroit', e.value)}
                                        placeholder={selectedEmploye ? `Choisir un ayant droit` : "Sélectionnez un employé d'abord"}
                                        disabled={!selectedEmploye}
                                        filter
                                        className="mb-1"
                                    />
                                    {selectedEmploye && (
                                        <small className="text-xs text-500">
                                            {filteredAyantDroits.length} ayant(s) droit disponible(s) pour cet employé
                                        </small>
                                    )}
                                </div>
                            )}
                        />
                        <Column
                            field="qte"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Quantité</span>}
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.qte || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'qte', e.value);
                                                const newPu = rowData.pu || 0;
                                                updateDetail(rowIndex, 'prixTotal', calculatePrixTotal(e.value, newPu));
                                                verifyQuantities(rowIndex, e.value, newPu);
                                            }
                                        }}
                                        mode="decimal"
                                        min={0}
                                    />
                                </div>
                            )}
                        />
                        <Column
                            field="pu"
                            header={<span><i className="pi pi-pencil mr-1" style={{ fontSize: '0.8rem' }}></i>Prix Unitaire</span>}
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.pu || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'pu', e.value);
                                                const newQte = rowData.qte || 0;
                                                updateDetail(rowIndex, 'prixTotal', calculatePrixTotal(newQte, e.value));
                                                verifyQuantities(rowIndex, newQte, e.value);
                                            }
                                        }}
                                        mode="currency"
                                        currency="BIF"
                                        locale="fr-FR"
                                        min={0}
                                    />
                                </div>
                            )}
                        />
                        <Column field="prixTotal" header="Prix Total"
                            body={(rowData) => (
                                <InputNumber
                                    value={rowData.prixTotal || 0}
                                    mode="currency"
                                    currency="BIF"
                                    locale="fr-FR"
                                    disabled
                                />
                            )}
                        />
                        <Column header="Action"
                            body={(rowData, { rowIndex }) => (
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-danger"
                                    onClick={() => removeDetail(rowIndex)}
                                />
                            )}
                        />
                    </DataTable>
                </div>
            </div>
        </div>
    );
};

export default StkConsommationForm;