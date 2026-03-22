'use client';

import React from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Tag } from 'primereact/tag';

import { getConnectedUser } from '../../../../hooks/fetchData/useConsumApi';
import {
    DemandeDepense,
    CategorieDepense,
    NiveauPriorite,
    Fournisseur,
    STATUTS_DEMANDE_DEPENSE
} from '../types/DepenseTypes';

interface DemandeDepenseFormProps {
    demande: DemandeDepense;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleDropdownChange: (name: string, value: any) => void;
    handleNumberChange: (name: string, value: number | null) => void;
    handleDateChange: (name: string, value: Date | null) => void;
    categories: CategorieDepense[];
    niveauxPriorite: NiveauPriorite[];
    isViewMode?: boolean;
}

const DemandeDepenseForm: React.FC<DemandeDepenseFormProps> = ({
    demande,
    handleChange,
    handleDropdownChange,
    handleNumberChange,
    handleDateChange,
    categories,
    niveauxPriorite,
    isViewMode = false
}) => {
    const getStatusSeverity = (status: string | undefined): any => {
        const map: Record<string, any> = {
            'BROUILLON': 'secondary', 'SOUMISE': 'info', 'ENGAGEE': 'info',
            'VALIDEE_N1': 'warning', 'VALIDEE_N2': 'warning', 'APPROUVEE': 'success',
            'EN_PAIEMENT': 'info', 'PAYEE': 'success', 'JUSTIFIEE': 'success',
            'CLOTUREE': 'secondary', 'REJETEE': 'danger', 'RETOURNEE': 'warning', 'ANNULEE': 'danger'
        };
        return map[status || ''] || 'info';
    };

    const getStatusLabel = (status: string | undefined): string => {
        return STATUTS_DEMANDE_DEPENSE.find(s => s.value === status)?.label || status || '';
    };

    return (
        <div className="p-fluid formgrid grid">
            {/* Informations de base */}
            <div className="col-12">
                <div className="p-3 surface-100 border-round mb-3">
                    <h5 className="mt-0 mb-3"><i className="pi pi-file mr-2"></i>Informations de la Demande</h5>
                    <div className="formgrid grid">
                        {demande.numeroDemande && (
                            <div className="field col-12 md:col-3">
                                <label>N° Demande</label>
                                <InputText value={demande.numeroDemande} disabled />
                            </div>
                        )}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="dateDemande">Date de Demande *</label>
                            <Calendar id="dateDemande" value={demande.dateDemande ? new Date(demande.dateDemande) : null}
                                onChange={(e) => handleDateChange('dateDemande', e.value as Date)} disabled={isViewMode} dateFormat="dd/mm/yy" />
                        </div>
                        {demande.status && (
                            <div className="field col-12 md:col-3">
                                <label>Statut</label>
                                <div className="mt-2">
                                    <Tag value={getStatusLabel(demande.status)} severity={getStatusSeverity(demande.status)} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Détails de la dépense */}
            <div className="col-12">
                <div className="p-3 surface-100 border-round mb-3">
                    <h5 className="mt-0 mb-3"><i className="pi pi-info-circle mr-2"></i>Détails de la Dépense</h5>
                    <div className="formgrid grid">
                        <div className="field col-12 md:col-4">
                            <label htmlFor="categorieDepenseId">Catégorie de Dépense *</label>
                            <Dropdown id="categorieDepenseId" value={demande.categorieDepenseId} options={categories}
                                optionLabel="nameFr" optionValue="id"
                                onChange={(e) => handleDropdownChange('categorieDepenseId', e.value)}
                                disabled={isViewMode} placeholder="Sélectionner une catégorie" filter />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="natureLibelle">Nature / Libellé *</label>
                            <InputText id="natureLibelle" name="natureLibelle" value={demande.natureLibelle}
                                onChange={handleChange} disabled={isViewMode} placeholder="Description de la dépense" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="niveauPrioriteId">Niveau de Priorité *</label>
                            <Dropdown id="niveauPrioriteId" value={demande.niveauPrioriteId} options={niveauxPriorite}
                                optionLabel="nameFr" optionValue="id"
                                onChange={(e) => handleDropdownChange('niveauPrioriteId', e.value)}
                                disabled={isViewMode} placeholder="Sélectionner" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="montantEstimeFBU">Montant Estimé (FBU) *</label>
                            <InputNumber id="montantEstimeFBU" value={demande.montantEstimeFBU}
                                onValueChange={(e) => handleNumberChange('montantEstimeFBU', e.value ?? null)}
                                disabled={isViewMode} mode="currency" currency="BIF" locale="fr-BI" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="montantEstimeUSD">Montant Estimé (USD)</label>
                            <InputNumber id="montantEstimeUSD" value={demande.montantEstimeUSD}
                                onValueChange={(e) => handleNumberChange('montantEstimeUSD', e.value ?? null)}
                                disabled={isViewMode} mode="currency" currency="USD" locale="en-US" />
                        </div>
                        <div className="field col-12 md:col-4">
                            <label htmlFor="demandeur">Demandeur *</label>
                            <InputText id="demandeur" value={demande.beneficiaireFournisseur || getConnectedUser()?.fullName || ''} disabled />
                        </div>
                    </div>
                </div>
            </div>

            {/* Justification */}
            <div className="col-12">
                <div className="p-3 surface-100 border-round mb-3">
                    <h5 className="mt-0 mb-3"><i className="pi pi-comment mr-2"></i>Justification</h5>
                    <div className="formgrid grid">
                        <div className="field col-12">
                            <label htmlFor="justification">Motif de la dépense *</label>
                            <InputTextarea id="justification" name="justification" value={demande.justification}
                                onChange={handleChange} disabled={isViewMode} rows={4}
                                placeholder="Décrivez le motif détaillé de cette dépense..." />
                        </div>
                    </div>
                </div>
            </div>

            {/* Budget info (view only) */}
            {demande.id && demande.budgetDisponible !== undefined && (
                <div className="col-12">
                    <div className="p-3 surface-100 border-round mb-3">
                        <h5 className="mt-0 mb-3"><i className="pi pi-chart-bar mr-2"></i>Information Budgétaire</h5>
                        <div className="formgrid grid">
                            <div className="col-12 md:col-4">
                                <small className="text-600">Budget Disponible</small>
                                <p className={`mt-1 mb-0 font-semibold ${(demande.budgetDisponible ?? 0) < (demande.montantEstimeFBU ?? 0) ? 'text-red-600' : 'text-green-600'}`}>
                                    {demande.budgetDisponible?.toLocaleString('fr-BI', { style: 'currency', currency: 'BIF' })}
                                </p>
                            </div>
                            {demande.budgetAlerte && (
                                <div className="col-12 md:col-8">
                                    <small className="text-600">Alerte</small>
                                    <p className="mt-1 mb-0">
                                        <Tag value={demande.budgetAlerte} severity="warning" />
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Approbation history (view only) */}
            {demande.id && (demande.approbateurN1Name || demande.approbateurN2Name || demande.approbateurN3Name) && (
                <div className="col-12">
                    <div className="p-3 surface-100 border-round mb-3">
                        <h5 className="mt-0 mb-3"><i className="pi pi-check-circle mr-2"></i>Historique d'Approbation</h5>
                        <div className="formgrid grid">
                            {demande.approbateurN1Name && (
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Niveau 1 (Chef Département)</small>
                                    <p className="mt-1 mb-0 font-semibold">{demande.approbateurN1Name}</p>
                                    <small className="text-500">{demande.dateApprobationN1 ? new Date(demande.dateApprobationN1).toLocaleDateString('fr-FR') : ''}</small>
                                    {demande.commentaireN1 && <p className="text-sm text-600 mt-1">{demande.commentaireN1}</p>}
                                </div>
                            )}
                            {demande.approbateurN2Name && (
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Niveau 2 (DAF)</small>
                                    <p className="mt-1 mb-0 font-semibold">{demande.approbateurN2Name}</p>
                                    <small className="text-500">{demande.dateApprobationN2 ? new Date(demande.dateApprobationN2).toLocaleDateString('fr-FR') : ''}</small>
                                    {demande.commentaireN2 && <p className="text-sm text-600 mt-1">{demande.commentaireN2}</p>}
                                </div>
                            )}
                            {demande.approbateurN3Name && (
                                <div className="col-12 md:col-4">
                                    <small className="text-600">Niveau 3 (DG)</small>
                                    <p className="mt-1 mb-0 font-semibold">{demande.approbateurN3Name}</p>
                                    <small className="text-500">{demande.dateApprobationN3 ? new Date(demande.dateApprobationN3).toLocaleDateString('fr-FR') : ''}</small>
                                    {demande.commentaireN3 && <p className="text-sm text-600 mt-1">{demande.commentaireN3}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DemandeDepenseForm;
