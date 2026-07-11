'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { Souscription, SouscriptionClass } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires/souscriptions');
const ACTIONNAIRES_URL = buildApiUrl('/api/actionnaires');

const TYPES_ACTIONNAIRE = [
    { label: 'Membre fondateur', value: 'FONDATEUR' },
    { label: 'Membre ordinaire', value: 'ORDINAIRE' },
    { label: 'Investisseur institutionnel', value: 'INSTITUTIONNEL' },
    { label: 'Employé-actionnaire', value: 'EMPLOYE' },
    { label: 'État / Collectivité', value: 'ETAT' },
];

const MODES_LIBERATION = [
    { label: 'Immédiate (paiement comptant)', value: 'IMMEDIATE' },
    { label: 'Échelonnée (versements)', value: 'ECHELONNEE' },
];

const MODES_PAIEMENT = [
    { label: 'Versement en caisse (571)', value: 'CAISSE' },
    { label: 'Virement bancaire (521)', value: 'BANQUE' },
    { label: 'Débit compte épargne (2211)', value: 'EPARGNE' },
];

export default function SouscriptionPage() {
    const [souscription, setSouscription] = useState<Souscription>(new SouscriptionClass());
    const [souscriptions, setSouscriptions] = useState<Souscription[]>([]);
    const [actionnaires, setActionnaires] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Souscription | null>(null);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const crudApi = useConsumApi('');
    const actionnaireApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        listApi.fetchData(null, 'GET', BASE_URL, 'loadSouscriptions');
        actionnaireApi.fetchData(null, 'GET', `${ACTIONNAIRES_URL}?statut=ACTIF`, 'loadActionnaires');
    }, []);

    useEffect(() => {
        if (listApi.data && listApi.callType === 'loadSouscriptions') {
            setSouscriptions(Array.isArray(listApi.data) ? listApi.data : listApi.data.content || []);
        }
        if (actionnaireApi.data && actionnaireApi.callType === 'loadActionnaires') {
            const data = Array.isArray(actionnaireApi.data) ? actionnaireApi.data : actionnaireApi.data.content || [];
            setActionnaires(data.map((a: any) => ({ label: `${a.numeroActionnaire} — ${a.nom}`, value: a.id, data: a })));
        }
    }, [listApi.data, actionnaireApi.data, listApi.callType, actionnaireApi.callType]);

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Souscription enregistrée avec succès');
                    resetForm();
                    setActiveIndex(1);
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadSouscriptions');
                    break;
                case 'validate':
                    showToast('success', 'Succès', 'Souscription validée — écriture comptable générée');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadSouscriptions');
                    break;
                case 'reject':
                    showToast('success', 'Info', 'Souscription rejetée');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadSouscriptions');
                    break;
            }
        }
        if (crudApi.error) {
            showToast('error', 'Erreur', crudApi.error.message || 'Une erreur est survenue');
        }
    }, [crudApi.data, crudApi.error, crudApi.callType]);

    const resetForm = () => setSouscription(new SouscriptionClass());

    const handleDropdownChange = (name: string, value: any) => {
        setSouscription(prev => ({ ...prev, [name]: value }));
        if (name === 'actionnaireId') {
            const found = actionnaires.find(a => a.value === value);
            if (found?.data) {
                setSouscription(prev => ({
                    ...prev,
                    actionnaireId: value,
                    actionnaireNom: found.data.nom,
                    typeActionnaire: found.data.typeActionnaire,
                }));
            }
        }
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setSouscription(prev => {
            const updated = { ...prev, [name]: value ?? 0 };
            if (name === 'nombreParts' || name === 'prixParPart') {
                updated.montantTotal = (updated.nombreParts || 0) * (updated.prixParPart || 0);
            }
            return updated;
        });
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setSouscription(prev => ({ ...prev, [name]: value ? value.toISOString().split('T')[0] : '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSouscription(prev => ({ ...prev, [name]: value }));
    };

    const validate = (): boolean => {
        const errors: string[] = [];
        if (!souscription.actionnaireId) errors.push('Veuillez sélectionner un actionnaire.');
        if (!souscription.typeActionnaire) errors.push('Le type de parts est requis.');
        if (!souscription.nombreParts || souscription.nombreParts <= 0) errors.push('Le nombre de parts doit être supérieur à 0.');
        if (!souscription.prixParPart || souscription.prixParPart <= 0) errors.push('Le prix par part doit être supérieur à 0.');
        if (!souscription.dateSouscription) errors.push('La date de souscription est requise.');
        if (!souscription.referenceJustificatif) errors.push('La référence du justificatif est requise.');
        setValidationErrors(errors);
        return errors.length === 0;
    };

    const handleSubmit = () => {
        if (!validate()) return;
        const dataToSend = { ...souscription, userAction: getUserAction() };
        crudApi.fetchData(dataToSend, 'POST', BASE_URL, 'create');
    };

    const handleValidate = (item: Souscription) => {
        confirmDialog({
            message: `Valider la souscription de ${item.nombreParts} parts pour ${item.actionnaireNom} ? L'écriture comptable sera générée automatiquement.`,
            header: 'Validation de souscription',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Valider',
            rejectLabel: 'Annuler',
            accept: () => {
                crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/valider`, 'validate');
            }
        });
    };

    const handleReject = (item: Souscription) => {
        confirmDialog({
            message: `Rejeter la souscription de ${item.actionnaireNom} ?`,
            header: 'Rejet de souscription',
            icon: 'pi pi-times-circle',
            acceptLabel: 'Rejeter',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/rejeter`, 'reject');
            }
        });
    };

    const formatCurrency = (val: number) =>
        (val || 0).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU';

    const statutBodyTemplate = (row: Souscription) => {
        const colors: Record<string, string> = { EN_ATTENTE: '#f97316', VALIDEE: '#22c55e', REJETEE: '#ef4444' };
        const labels: Record<string, string> = { EN_ATTENTE: 'En attente', VALIDEE: 'Validée', REJETEE: 'Rejetée' };
        return <Tag value={labels[row.statut || ''] || row.statut} style={{ backgroundColor: colors[row.statut || ''] || '#6b7280' }} />;
    };

    const modePaiementLabel = (val: string) => {
        const m: Record<string, string> = { CAISSE: 'Caisse (571)', BANQUE: 'Banque (521)', EPARGNE: 'Épargne (2211)' };
        return m[val] || val;
    };

    const actionsBodyTemplate = (row: Souscription) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => { setSelectedItem(row); setViewDialog(true); }} tooltip="Voir" />
            {row.statut === 'EN_ATTENTE' && (
                <>
                    <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleValidate(row)} tooltip="Valider" />
                    <Button icon="pi pi-times" rounded text severity="danger" onClick={() => handleReject(row)} tooltip="Rejeter" />
                </>
            )}
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
            <Button label="Nouvelle souscription" icon="pi pi-plus" onClick={() => { resetForm(); setActiveIndex(0); }} />
        </div>
    );

    const ecritureInfo = () => {
        if (!souscription.modePaiement || !souscription.montantTotal) return null;
        const debit = souscription.modePaiement === 'CAISSE' ? '571 Caisse' : souscription.modePaiement === 'BANQUE' ? '521 Banque' : '2211 Épargne';
        return (
            <div className="surface-50 border-1 border-round p-3 mt-3">
                <strong className="text-primary"><i className="pi pi-info-circle mr-2" />Écriture comptable générée automatiquement :</strong>
                <div className="mt-2">
                    Débit : <strong>{debit}</strong> &nbsp;|&nbsp;
                    Crédit : <strong>1011 Parts sociales des membres</strong> &nbsp;|&nbsp;
                    Montant : <strong>{formatCurrency(souscription.montantTotal || 0)}</strong>
                </div>
            </div>
        );
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-plus-circle mr-2" />
                Souscription de Parts — SH-SUB
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Souscription" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        {validationErrors.length > 0 && (
                            <div className="mb-3">
                                {validationErrors.map((e, i) => (
                                    <Message key={i} severity="warn" text={e} className="w-full mb-1" />
                                ))}
                            </div>
                        )}

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-user mr-2" />Actionnaire</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-6">
                                    <label>Actionnaire *</label>
                                    <Dropdown
                                        value={souscription.actionnaireId}
                                        options={actionnaires}
                                        onChange={e => handleDropdownChange('actionnaireId', e.value)}
                                        placeholder="Rechercher un actionnaire..."
                                        filter
                                        showClear
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label>Type de parts *</label>
                                    <Dropdown
                                        value={souscription.typeActionnaire}
                                        options={TYPES_ACTIONNAIRE}
                                        onChange={e => handleDropdownChange('typeActionnaire', e.value)}
                                        placeholder="Type de parts"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-money-bill mr-2" />Détails de la souscription</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-3">
                                    <label>Nombre de parts à souscrire *</label>
                                    <InputNumber value={souscription.nombreParts} onValueChange={e => handleNumberChange('nombreParts', e.value)} min={1} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Prix par part (FBU) *</label>
                                    <InputNumber value={souscription.prixParPart} onValueChange={e => handleNumberChange('prixParPart', e.value)} min={1} mode="decimal" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Montant total (FBU)</label>
                                    <InputNumber value={souscription.montantTotal} disabled className="font-bold" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Date de souscription *</label>
                                    <Calendar
                                        value={souscription.dateSouscription ? new Date(souscription.dateSouscription) : null}
                                        onChange={e => handleDateChange('dateSouscription', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Mode de libération</label>
                                    <Dropdown
                                        value={souscription.modeLiberation}
                                        options={MODES_LIBERATION}
                                        onChange={e => handleDropdownChange('modeLiberation', e.value)}
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Mode de paiement</label>
                                    <Dropdown
                                        value={souscription.modePaiement}
                                        options={MODES_PAIEMENT}
                                        onChange={e => handleDropdownChange('modePaiement', e.value)}
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Référence justificatif *</label>
                                    <InputText name="referenceJustificatif" value={souscription.referenceJustificatif || ''} onChange={handleChange} placeholder="N° reçu, référence virement..." />
                                </div>
                            </div>
                            {ecritureInfo()}
                        </div>

                        <div className="flex gap-2 justify-content-end">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            <Button label="Soumettre" icon="pi pi-check" onClick={handleSubmit} loading={crudApi.loading} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Souscriptions" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={souscriptions}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={listApi.loading}
                        emptyMessage="Aucune souscription enregistrée"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        globalFilterFields={['actionnaireNom', 'typeActionnaire', 'referenceJustificatif']}
                        header={header}
                    >
                        <Column field="actionnaireNom" header="Actionnaire" sortable filter style={{ minWidth: '180px' }} />
                        <Column header="Type" body={r => r.typeActionnaire} sortable />
                        <Column field="nombreParts" header="Parts" sortable body={r => r.nombreParts?.toLocaleString()} />
                        <Column header="Prix/part" body={r => formatCurrency(r.prixParPart)} sortable />
                        <Column header="Montant total" body={r => formatCurrency(r.montantTotal)} sortable />
                        <Column header="Mode paiement" body={r => modePaiementLabel(r.modePaiement)} />
                        <Column field="dateSouscription" header="Date" sortable />
                        <Column field="referenceJustificatif" header="Référence" />
                        <Column header="Statut" body={statutBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '130px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header="Détail de la souscription"
                visible={viewDialog}
                style={{ width: '600px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedItem && (
                    <div className="grid">
                        <div className="col-6"><strong>Actionnaire :</strong> {selectedItem.actionnaireNom}</div>
                        <div className="col-6"><strong>Type :</strong> {selectedItem.typeActionnaire}</div>
                        <div className="col-6"><strong>Nombre de parts :</strong> {selectedItem.nombreParts?.toLocaleString()}</div>
                        <div className="col-6"><strong>Prix par part :</strong> {formatCurrency(selectedItem.prixParPart || 0)}</div>
                        <div className="col-6"><strong>Montant total :</strong> {formatCurrency(selectedItem.montantTotal || 0)}</div>
                        <div className="col-6"><strong>Mode libération :</strong> {selectedItem.modeLiberation}</div>
                        <div className="col-6"><strong>Mode paiement :</strong> {modePaiementLabel(selectedItem.modePaiement || '')}</div>
                        <div className="col-6"><strong>Date :</strong> {selectedItem.dateSouscription}</div>
                        <div className="col-6"><strong>Référence :</strong> {selectedItem.referenceJustificatif}</div>
                        <div className="col-6"><strong>Statut :</strong> {statutBodyTemplate(selectedItem)}</div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
