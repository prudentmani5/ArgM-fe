'use client';

import { useEffect, useRef, useState } from "react";
import { InputText } from "primereact/inputtext";
import { Calendar } from "primereact/calendar";
import { InputNumber, InputNumberValueChangeEvent } from "primereact/inputnumber";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { StkSortie, StkSortieDetails, TypeMvt, StkArticle, StkExercice, StkMagasin, StkMagasinResponsable, StkServiceResponsable, StkUnite, StkSortieDetailField } from "./StkSortie";
import useConsumApi from '../../../../../hooks/fetchData/useConsumApi';

interface StkSortieFormProps {
    sortie: StkSortie;
    details: StkSortieDetails[];
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (e: InputNumberValueChangeEvent, field: string) => void;
    handleDateChange: (value: Date | null | undefined, field: string) => void;
    handleDropdownChange: (e: DropdownChangeEvent, field: string) => void;
    fetchByNumeroPiece: (numeroPiece: string) => void;
    addDetail: () => void;
    removeDetail: (index: number) => void;
    updateDetail: (index: number, field: StkSortieDetailField, value: any) => void;
    loading?: boolean;
    setDetails: React.Dispatch<React.SetStateAction<StkSortieDetails[]>>;
    typeMvts: TypeMvt[];
    articles: StkArticle[];
    exercices: StkExercice[];
    magasins: StkMagasin[];
    magasinResponsables: StkMagasinResponsable[];
    serviceResponsables: StkServiceResponsable[];
    unites: StkUnite[];
}

const StkSortieForm: React.FC<StkSortieFormProps> = ({
    sortie,
    details,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleDropdownChange,
    fetchByNumeroPiece,
    addDetail,
    removeDetail,
    updateDetail,
    loading = false,
    setDetails,
    typeMvts,
    articles,
    exercices,
    magasins,
    magasinResponsables,
    serviceResponsables,
    unites
}: StkSortieFormProps) => {
    const [numeroPieceSearch, setNumeroPieceSearch] = useState<string>('');
    const toast = useRef<Toast>(null);

    const handleNumeroPieceSearch = () => {
        if (numeroPieceSearch) {
            fetchByNumeroPiece(numeroPieceSearch);
        }
    };

    const verifyQuantities = (rowIndex: number, qteS: number | undefined) => {
        setDetails((prev: any[]) => prev.map((detail: any, index: number) => {
            if (index !== rowIndex) return detail;

            const errors = {
                qteError: ''
            };

            if (qteS === undefined || qteS === null || isNaN(qteS)) {
                errors.qteError = 'La quantité est requise';
            } else if (qteS <= 0) {
                errors.qteError = 'La quantité doit être positive';
            }

            return {
                ...detail,
                ...errors
            };
        }));
    };

    const formatDate = (date: Date | null) => {
        return date ? new Date(date).toLocaleDateString() : '';
    };

    return (
        <div className="card p-fluid">
            <Toast ref={toast} />
            <div className="formgrid grid">
                <div className="field col-12 md:col-4">
                    <label htmlFor="numeroPiece">Rechercher par numéro de pièce</label>
                    <div className="p-inputgroup">
                        <InputText
                            id="numeroPieceSearch"
                            value={numeroPieceSearch}
                            onChange={(e) => setNumeroPieceSearch(e.target.value)}
                            placeholder="Entrez le numéro de pièce"
                            disabled={loading}
                        />
                        <Button
                            icon="pi pi-search"
                            onClick={handleNumeroPieceSearch}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="numeroPiece">Numéro de pièce</label>
                    <InputText
                        id="numeroPiece"
                        name="numeroPiece"
                        value={sortie.numeroPiece}
                        onChange={handleChange}
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="dateSortie">Date de sortie</label>
                    <Calendar
                        id="dateSortie"
                        value={sortie.dateSortie}
                        onChange={(e) => handleDateChange(e.value as Date, 'dateSortie')}
                        showTime
                        hourFormat="24"
                        dateFormat="dd/mm/yy"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magasinId">Magasin</label>
                    <Dropdown
                        id="magasinId"
                        name="magasinId"
                        value={sortie.magasinId}
                        options={magasins}
                        optionLabel="nom"
                        optionValue="magasinId"
                        onChange={(e) => handleDropdownChange(e, 'magasinId')}
                        placeholder="Sélectionnez un magasin"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="exerciceId">Exercice</label>
                    <Dropdown
                        id="exerciceId"
                        name="exerciceId"
                        value={sortie.exerciceId}
                        options={exercices}
                        optionLabel="libelle"
                        optionValue="exerciceId"
                        onChange={(e) => handleDropdownChange(e, 'exerciceId')}
                        placeholder="Sélectionnez un exercice"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="typeMvtId">Type de mouvement</label>
                    <Dropdown
                        id="typeMvtId"
                        name="typeMvtId"
                        value={sortie.typeMvtId}
                        options={typeMvts}
                        optionLabel="libelle"
                        optionValue="typeMvtId"
                        onChange={(e) => handleDropdownChange(e, 'typeMvtId')}
                        placeholder="Sélectionnez un type"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="servRespIdSuperviseur">Superviseur</label>
                    <Dropdown
                        id="servRespIdSuperviseur"
                        name="servRespIdSuperviseur"
                        value={sortie.servRespIdSuperviseur}
                        options={serviceResponsables}
                        optionLabel="responsableId"
                        optionValue="servRespId"
                        onChange={(e) => handleDropdownChange(e, 'servRespIdSuperviseur')}
                        placeholder="Sélectionnez un superviseur"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="servRespIdDemandeur">Demandeur</label>
                    <Dropdown
                        id="servRespIdDemandeur"
                        name="servRespIdDemandeur"
                        value={sortie.servRespIdDemandeur}
                        options={serviceResponsables}
                        optionLabel="responsableId"
                        optionValue="servRespId"
                        onChange={(e) => handleDropdownChange(e, 'servRespIdDemandeur')}
                        placeholder="Sélectionnez un demandeur"
                    />
                </div>

                <div className="field col-12 md:col-4">
                    <label htmlFor="magRespId">Responsable magasin</label>
                    <Dropdown
                        id="magRespId"
                        name="magRespId"
                        value={sortie.magRespId}
                        options={magasinResponsables}
                        optionLabel="responsableId"
                        optionValue="magRespId"
                        onChange={(e) => handleDropdownChange(e, 'magRespId')}
                        placeholder="Sélectionnez un responsable"
                    />
                </div>

                <div className="col-12">
                    <h4>Détails des articles sortis</h4>
                    <Button 
                        icon="pi pi-plus" 
                        label="Ajouter un article" 
                        onClick={addDetail}
                        className="mb-3"
                    />
                    
                    <DataTable value={details} responsiveLayout="scroll">
                        <Column field="articleId" header="Article" 
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.articleId}
                                    options={articles}
                                    optionLabel="libelle"
                                    optionValue="articleId"
                                    onChange={(e) => {
                                        updateDetail(rowIndex, 'articleId', e.value);
                                        // Mettre à jour l'unité par défaut
                                        const selectedArticle = articles.find(a => a.articleId === e.value);
                                        if (selectedArticle) {
                                            updateDetail(rowIndex, 'uniteId', selectedArticle.uniteId);
                                        }
                                    }}
                                    placeholder="Sélectionnez un article"
                                />
                            )}
                        />
                        <Column field="datePeremption" header="Date péremption" 
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.datePeremption || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'datePeremption', e.target.value)}
                                />
                            )}
                        />
                        <Column field="lot" header="Lot" 
                            body={(rowData, { rowIndex }) => (
                                <InputText
                                    value={rowData.lot || ''}
                                    onChange={(e) => updateDetail(rowIndex, 'lot', e.target.value)}
                                />
                            )}
                        />
                        <Column field="uniteId" header="Unité" 
                            body={(rowData, { rowIndex }) => (
                                <Dropdown
                                    value={rowData.uniteId}
                                    options={unites}
                                    optionLabel="libelle"
                                    optionValue="uniteId"
                                    onChange={(e) => updateDetail(rowIndex, 'uniteId', e.value)}
                                    placeholder="Sélectionnez une unité"
                                />
                            )}
                        />
                        <Column field="qteS" header="Quantité" 
                            body={(rowData, { rowIndex }) => (
                                <div className="p-inputgroup">
                                    <InputNumber
                                        value={rowData.qteS || 0}
                                        onValueChange={(e) => {
                                            if (e.value !== null && e.value !== undefined) {
                                                updateDetail(rowIndex, 'qteS', e.value);
                                                verifyQuantities(rowIndex, e.value);
                                            }
                                        }}
                                        mode="decimal"
                                        min={0}
                                    />
                                    {rowData.qteError && (
                                        <span className="p-inputgroup-addon p-error">
                                            <i className="pi pi-exclamation-triangle" title={rowData.qteError}/>
                                        </span>
                                    )}
                                </div>
                            )}
                        />
                        <Column field="pUMP" header="PUMP" 
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.pUMP || 0}
                                    onValueChange={(e) => {
                                        if (e.value !== null && e.value !== undefined) {
                                            updateDetail(rowIndex, 'pUMP', e.value);
                                            // Calcul automatique du prix total
                                            updateDetail(rowIndex, 'prixTotal', (e.value || 0) * (rowData.qteS || 0));
                                        }
                                    }}
                                    mode="currency"
                                    currency="XOF"
                                    locale="fr-FR"
                                />
                            )}
                        />
                        <Column field="prixTotal" header="Prix total" 
                            body={(rowData, { rowIndex }) => (
                                <InputNumber
                                    value={rowData.prixTotal || 0}
                                    mode="currency"
                                    currency="XOF"
                                    locale="fr-FR"
                                    readOnly
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

export default StkSortieForm;