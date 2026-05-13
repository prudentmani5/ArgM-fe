'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { ParametresCapital } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires/parametres');

const MODES_VOTE = [
    { label: 'Proportionnel (1 part = 1 voix)', value: 'PROPORTIONNEL' },
    { label: 'Plafonné', value: 'PLAFONNE' },
    { label: 'Égalitaire (1 actionnaire = 1 voix)', value: 'EGALITAIRE' },
];

const TYPES_PARTS_DEFAUT = [
    { type: 'FONDATEUR', label: 'Membre fondateur', minParts: 100, maxParts: null, cessibles: true },
    { type: 'ORDINAIRE', label: 'Membre ordinaire', minParts: 10, maxParts: 500, cessibles: true },
    { type: 'INSTITUTIONNEL', label: 'Investisseur institutionnel', minParts: 1000, maxParts: null, cessibles: true },
    { type: 'EMPLOYE', label: 'Employé-actionnaire', minParts: 5, maxParts: 100, cessibles: false },
    { type: 'ETAT', label: 'État / Collectivité', minParts: null, maxParts: null, cessibles: false },
];

export default function ParametresPage() {
    const [params, setParams] = useState<ParametresCapital>({
        valeurNominaleParPart: 10000,
        capitalSocialAutorise: 500000000,
        delaiPreavisRachat: 90,
        tauxIRCMDefaut: 15,
        modeCalculVote: 'PROPORTIONNEL',
        seuilNotificationBRB: 10,
        delaiLegalConvocationAG: 15,
    });
    const [typesParts, setTypesParts] = useState(TYPES_PARTS_DEFAUT);
    const [editingType, setEditingType] = useState<any>(null);
    const [saved, setSaved] = useState(false);
    const toast = useRef<Toast>(null);

    const paramsApi = useConsumApi('');
    const saveApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        paramsApi.fetchData(null, 'GET', BASE_URL, 'loadParams');
    }, []);

    useEffect(() => {
        if (paramsApi.data && paramsApi.callType === 'loadParams') {
            if (paramsApi.data.params) setParams(paramsApi.data.params);
            if (paramsApi.data.typesParts) setTypesParts(paramsApi.data.typesParts);
        }
    }, [paramsApi.data, paramsApi.callType]);

    useEffect(() => {
        if (saveApi.data && saveApi.callType === 'save') {
            setSaved(true);
            showToast('success', 'Succès', 'Paramètres enregistrés — modifications journalisées dans l\'audit');
            setTimeout(() => setSaved(false), 3000);
        }
        if (saveApi.error) {
            showToast('error', 'Erreur', saveApi.error.message || 'Erreur lors de la sauvegarde');
        }
    }, [saveApi.data, saveApi.error, saveApi.callType]);

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setParams(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setParams(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        confirmDialog({
            message: 'Enregistrer les modifications ? Tout changement est journalisé dans le journal d\'audit système.',
            header: 'Confirmation des modifications',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Enregistrer',
            rejectLabel: 'Annuler',
            accept: () => {
                saveApi.fetchData(
                    { params, typesParts, userAction: getUserAction() },
                    'PUT',
                    BASE_URL,
                    'save'
                );
            }
        });
    };

    const handleEditType = (type: any) => setEditingType({ ...type });

    const handleSaveType = () => {
        if (!editingType) return;
        setTypesParts(prev => prev.map(t => t.type === editingType.type ? editingType : t));
        setEditingType(null);
    };

    const cessibleBody = (row: any) => (
        <span style={{ color: row.cessibles ? '#22c55e' : '#ef4444' }}>
            {row.cessibles ? 'Oui' : 'Non'}
        </span>
    );

    const actionsTypesBody = (row: any) => (
        <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEditType(row)} tooltip="Modifier seuils" />
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-cog mr-2" />
                Paramètres du Module Actionnaires
            </h4>

            <Message
                severity="warn"
                className="w-full mb-4"
                text="Tout changement de paramètres est journalisé dans le journal d'audit. Certains changements (valeur nominale, mode de vote) nécessitent une résolution d'AG préalablement enregistrée."
            />

            {saved && <Message severity="success" text="Paramètres enregistrés avec succès." className="w-full mb-3" />}

            {/* Paramètres généraux */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary"><i className="pi pi-sliders-h mr-2" />Configuration générale du capital</h5>
                <div className="formgrid grid p-fluid">
                    <div className="field col-12 md:col-4">
                        <label>Valeur nominale par part (FBU)</label>
                        <InputNumber value={params.valeurNominaleParPart} onValueChange={e => handleNumberChange('valeurNominaleParPart', e.value)} min={1} />
                        <small className="text-500">Base de tous les calculs — nécessite résolution AG pour modification</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Capital social autorisé (FBU)</label>
                        <InputNumber value={params.capitalSocialAutorise} onValueChange={e => handleNumberChange('capitalSocialAutorise', e.value)} min={0} />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Délai de préavis de rachat (jours)</label>
                        <InputNumber value={params.delaiPreavisRachat} onValueChange={e => handleNumberChange('delaiPreavisRachat', e.value)} min={0} suffix=" jours" />
                        <small className="text-500">Délai minimum entre demande et exécution du rachat</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Taux IRCM par défaut (%)</label>
                        <InputNumber value={params.tauxIRCMDefaut} onValueChange={e => handleNumberChange('tauxIRCMDefaut', e.value)} min={0} max={100} suffix=" %" />
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Mode de calcul des droits de vote</label>
                        <Dropdown
                            value={params.modeCalculVote}
                            options={MODES_VOTE}
                            onChange={e => handleDropdownChange('modeCalculVote', e.value)}
                        />
                        <small className="text-500">Nécessite résolution AG pour modification</small>
                    </div>
                    <div className="field col-12 md:col-4">
                        <label>Délai légal de convocation AG (jours)</label>
                        <InputNumber value={params.delaiLegalConvocationAG} onValueChange={e => handleNumberChange('delaiLegalConvocationAG', e.value)} min={1} suffix=" jours" />
                    </div>
                </div>
            </div>

            {/* Paramètres BRB */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary"><i className="pi pi-shield mr-2" />Seuils de notification BRB</h5>
                <div className="formgrid grid p-fluid">
                    <div className="field col-12 md:col-6">
                        <label>Seuil d'alerte ratio de solvabilité (%)</label>
                        <InputNumber value={params.seuilNotificationBRB} onValueChange={e => handleNumberChange('seuilNotificationBRB', e.value)} min={8} max={100} suffix=" %" />
                        <small className="text-500">Alerte envoyée au DG et DAF si le ratio passe en dessous de ce seuil (seuil légal BRB : 8%)</small>
                    </div>
                </div>
            </div>

            {/* Types de parts et seuils */}
            <div className="surface-100 p-3 border-round mb-4">
                <h5 className="m-0 mb-3 text-primary"><i className="pi pi-list mr-2" />Types de parts et seuils min/max</h5>

                {editingType && (
                    <div className="surface-50 p-3 border-round mb-3 border-1">
                        <strong className="text-primary block mb-2">Modifier : {editingType.label}</strong>
                        <div className="formgrid grid p-fluid">
                            <div className="field col-12 md:col-4">
                                <label>Parts minimum</label>
                                <InputNumber
                                    value={editingType.minParts}
                                    onValueChange={e => setEditingType((prev: any) => ({ ...prev, minParts: e.value }))}
                                    min={0}
                                    placeholder="Aucun minimum"
                                />
                            </div>
                            <div className="field col-12 md:col-4">
                                <label>Parts maximum</label>
                                <InputNumber
                                    value={editingType.maxParts}
                                    onValueChange={e => setEditingType((prev: any) => ({ ...prev, maxParts: e.value }))}
                                    min={0}
                                    placeholder="Illimité"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button label="Enregistrer" icon="pi pi-check" size="small" onClick={handleSaveType} />
                            <Button label="Annuler" icon="pi pi-times" size="small" severity="secondary" onClick={() => setEditingType(null)} />
                        </div>
                    </div>
                )}

                <DataTable value={typesParts} className="p-datatable-sm" showGridlines>
                    <Column field="label" header="Type d'actionnaire" />
                    <Column field="type" header="Code" style={{ width: '120px', fontFamily: 'monospace' }} />
                    <Column field="minParts" header="Parts minimum" body={r => r.minParts ?? 'Aucun'} />
                    <Column field="maxParts" header="Parts maximum" body={r => r.maxParts ?? 'Illimité'} />
                    <Column header="Cessibles ?" body={cessibleBody} />
                    <Column header="Action" body={actionsTypesBody} style={{ width: '80px' }} />
                </DataTable>
            </div>

            <div className="flex justify-content-end">
                <Button
                    label="Enregistrer tous les paramètres"
                    icon="pi pi-save"
                    onClick={handleSave}
                    loading={saveApi.loading}
                    size="large"
                />
            </div>
        </div>
    );
}
