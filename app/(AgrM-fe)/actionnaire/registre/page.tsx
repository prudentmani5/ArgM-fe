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
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { Actionnaire, ActionnaireClass, TypeActionnaire, StatutActionnaire, StatutKYC } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires');

const TYPES_ACTIONNAIRE = [
    { label: 'Membre fondateur', value: 'FONDATEUR' },
    { label: 'Membre ordinaire', value: 'ORDINAIRE' },
    { label: 'Investisseur institutionnel', value: 'INSTITUTIONNEL' },
    { label: 'Employé-actionnaire', value: 'EMPLOYE' },
    { label: 'État / Collectivité', value: 'ETAT' },
];

const STATUTS = [
    { label: 'Actif', value: 'ACTIF' },
    { label: 'Suspendu', value: 'SUSPENDU' },
    { label: 'Retiré', value: 'RETIRE' },
];

const STATUTS_KYC = [
    { label: 'Validé', value: 'VALIDE' },
    { label: 'En attente', value: 'EN_ATTENTE' },
    { label: 'Expiré', value: 'EXPIRE' },
];

export default function RegistreActionnairesPage() {
    const [actionnaire, setActionnaire] = useState<Actionnaire>(new ActionnaireClass());
    const [actionnaires, setActionnaires] = useState<Actionnaire[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [viewDialog, setViewDialog] = useState(false);
    const [selectedActionnaire, setSelectedActionnaire] = useState<Actionnaire | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const crudApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const loadActionnaires = () => {
        listApi.fetchData(null, 'GET', BASE_URL, 'loadActionnaires');
    };

    useEffect(() => {
        loadActionnaires();
    }, []);

    useEffect(() => {
        if (listApi.data && listApi.callType === 'loadActionnaires') {
            setActionnaires(Array.isArray(listApi.data) ? listApi.data : listApi.data.content || []);
        }
        if (listApi.error && listApi.callType === 'loadActionnaires') {
            showToast('error', 'Erreur', 'Impossible de charger les actionnaires');
        }
    }, [listApi.data, listApi.error, listApi.callType]);

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Actionnaire enregistré avec succès');
                    resetForm();
                    setActiveIndex(1);
                    loadActionnaires();
                    break;
                case 'update':
                    showToast('success', 'Succès', 'Actionnaire mis à jour avec succès');
                    resetForm();
                    setActiveIndex(1);
                    loadActionnaires();
                    break;
                case 'delete':
                    showToast('success', 'Succès', 'Actionnaire supprimé');
                    loadActionnaires();
                    break;
            }
        }
        if (crudApi.error) {
            showToast('error', 'Erreur', crudApi.error.message || 'Une erreur est survenue');
        }
    }, [crudApi.data, crudApi.error, crudApi.callType]);

    const resetForm = () => {
        setActionnaire(new ActionnaireClass());
        setIsViewMode(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setActionnaire(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setActionnaire(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setActionnaire(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setActionnaire(prev => ({ ...prev, [name]: value ? value.toISOString().split('T')[0] : '' }));
    };

    const handleSubmit = () => {
        if (!actionnaire.nom || !actionnaire.nif || !actionnaire.typeActionnaire) {
            showToast('warn', 'Attention', 'Veuillez remplir les champs obligatoires');
            return;
        }
        const dataToSend = { ...actionnaire, userAction: getUserAction() };
        if (actionnaire.id) {
            crudApi.fetchData(dataToSend, 'PUT', `${BASE_URL}/${actionnaire.id}`, 'update');
        } else {
            crudApi.fetchData(dataToSend, 'POST', BASE_URL, 'create');
        }
    };

    const handleEdit = (item: Actionnaire) => {
        setActionnaire({ ...item });
        setIsViewMode(false);
        setActiveIndex(0);
    };

    const handleView = (item: Actionnaire) => {
        setSelectedActionnaire(item);
        setViewDialog(true);
    };

    const handleDelete = (item: Actionnaire) => {
        confirmDialog({
            message: `Supprimer l'actionnaire "${item.nom}" ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Supprimer',
            rejectLabel: 'Annuler',
            acceptClassName: 'p-button-danger',
            accept: () => {
                crudApi.fetchData({ userAction: getUserAction() }, 'DELETE', `${BASE_URL}/${item.id}`, 'delete');
            }
        });
    };

    const formatCurrency = (val: number) =>
        (val || 0).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU';

    const statutBodyTemplate = (row: Actionnaire) => {
        const colors: Record<string, string> = { ACTIF: '#22c55e', SUSPENDU: '#f97316', RETIRE: '#6b7280' };
        const labels: Record<string, string> = { ACTIF: 'Actif', SUSPENDU: 'Suspendu', RETIRE: 'Retiré' };
        return <Tag value={labels[row.statut || ''] || row.statut} style={{ backgroundColor: colors[row.statut || ''] || '#6b7280' }} />;
    };

    const kycBodyTemplate = (row: Actionnaire) => {
        const colors: Record<string, string> = { VALIDE: '#22c55e', EN_ATTENTE: '#f97316', EXPIRE: '#ef4444' };
        const labels: Record<string, string> = { VALIDE: 'Validé', EN_ATTENTE: 'En attente', EXPIRE: 'Expiré' };
        return <Tag value={labels[row.statutKYC || ''] || row.statutKYC} style={{ backgroundColor: colors[row.statutKYC || ''] || '#6b7280' }} />;
    };

    const typeBodyTemplate = (row: Actionnaire) => {
        const labels: Record<string, string> = {
            FONDATEUR: 'Fondateur', ORDINAIRE: 'Ordinaire',
            INSTITUTIONNEL: 'Institutionnel', EMPLOYE: 'Employé', ETAT: 'État'
        };
        return labels[row.typeActionnaire || ''] || row.typeActionnaire;
    };

    const actionsBodyTemplate = (row: Actionnaire) => (
        <div className="flex gap-1">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => handleView(row)} tooltip="Voir" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => handleEdit(row)} tooltip="Modifier" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(row)} tooltip="Supprimer" />
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    value={globalFilter}
                    onChange={e => setGlobalFilter(e.target.value)}
                    placeholder="Rechercher..."
                />
            </span>
            <Button label="Nouvel actionnaire" icon="pi pi-plus" onClick={() => { resetForm(); setActiveIndex(0); }} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-users mr-2" />
                Registre des Actionnaires — SH-REG
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
                <TabPanel header={actionnaire.id ? 'Modifier' : 'Nouvel Actionnaire'} leftIcon="pi pi-user-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-user mr-2" />Identité de l'actionnaire</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label>Type d'actionnaire *</label>
                                    <Dropdown
                                        value={actionnaire.typeActionnaire}
                                        options={TYPES_ACTIONNAIRE}
                                        onChange={e => handleDropdownChange('typeActionnaire', e.value)}
                                        placeholder="Sélectionner le type"
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Nom / Raison sociale *</label>
                                    <InputText name="nom" value={actionnaire.nom || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>NIF / N° d'identification *</label>
                                    <InputText name="nif" value={actionnaire.nif || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Date de naissance / création</label>
                                    <Calendar
                                        value={actionnaire.dateNaissance ? new Date(actionnaire.dateNaissance) : null}
                                        onChange={e => handleDateChange('dateNaissance', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Nationalité</label>
                                    <InputText name="nationalite" value={actionnaire.nationalite || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Téléphone</label>
                                    <InputText name="telephone" value={actionnaire.telephone || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Email</label>
                                    <InputText name="email" value={actionnaire.email || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Profession</label>
                                    <InputText name="profession" value={actionnaire.profession || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Adresse complète</label>
                                    <InputText name="adresse" value={actionnaire.adresse || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Agence de rattachement</label>
                                    <InputText name="agenceRattachement" value={actionnaire.agenceRattachement || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-chart-pie mr-2" />Participation au capital</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-3">
                                    <label>Nombre de parts</label>
                                    <InputNumber value={actionnaire.nombreParts} onValueChange={e => handleNumberChange('nombreParts', e.value)} min={0} disabled={isViewMode} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Date d'entrée au capital</label>
                                    <Calendar
                                        value={actionnaire.dateEntreeCapital ? new Date(actionnaire.dateEntreeCapital) : null}
                                        onChange={e => handleDateChange('dateEntreeCapital', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Statut</label>
                                    <Dropdown
                                        value={actionnaire.statut}
                                        options={STATUTS}
                                        onChange={e => handleDropdownChange('statut', e.value)}
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Statut KYC</label>
                                    <Dropdown
                                        value={actionnaire.statutKYC}
                                        options={STATUTS_KYC}
                                        onChange={e => handleDropdownChange('statutKYC', e.value)}
                                        disabled={isViewMode}
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Compte épargne lié</label>
                                    <InputText name="compteEpargneLie" value={actionnaire.compteEpargneLie || ''} onChange={handleChange} disabled={isViewMode} />
                                </div>
                            </div>
                        </div>

                        {!isViewMode && (
                            <div className="flex gap-2 justify-content-end">
                                <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                                <Button
                                    label={actionnaire.id ? 'Mettre à jour' : 'Enregistrer'}
                                    icon="pi pi-check"
                                    onClick={handleSubmit}
                                    loading={crudApi.loading}
                                />
                            </div>
                        )}
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Actionnaires" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={actionnaires}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={listApi.loading}
                        emptyMessage="Aucun actionnaire enregistré"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        globalFilterFields={['numeroActionnaire', 'nom', 'nif', 'typeActionnaire']}
                        header={header}
                    >
                        <Column field="numeroActionnaire" header="N° Actionnaire" sortable style={{ minWidth: '130px' }} />
                        <Column field="nom" header="Nom / Raison sociale" sortable filter style={{ minWidth: '180px' }} />
                        <Column field="nif" header="NIF" sortable />
                        <Column header="Type" body={typeBodyTemplate} sortable />
                        <Column field="nombreParts" header="Parts" sortable body={r => r.nombreParts?.toLocaleString()} />
                        <Column
                            header="% Capital"
                            body={r => r.pourcentageCapital ? r.pourcentageCapital.toFixed(2) + ' %' : '-'}
                            sortable
                        />
                        <Column header="Valeur totale" body={r => formatCurrency(r.valeurTotale)} sortable />
                        <Column field="dateEntreeCapital" header="Entrée au capital" sortable />
                        <Column header="Statut" body={statutBodyTemplate} sortable />
                        <Column header="KYC" body={kycBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '140px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header="Fiche Actionnaire"
                visible={viewDialog}
                style={{ width: '700px' }}
                onHide={() => setViewDialog(false)}
            >
                {selectedActionnaire && (
                    <div className="p-fluid">
                        <div className="grid">
                            <div className="col-6"><strong>N° Actionnaire :</strong> {selectedActionnaire.numeroActionnaire}</div>
                            <div className="col-6"><strong>Nom :</strong> {selectedActionnaire.nom}</div>
                            <div className="col-6"><strong>NIF :</strong> {selectedActionnaire.nif}</div>
                            <div className="col-6"><strong>Type :</strong> {selectedActionnaire.typeActionnaire}</div>
                            <div className="col-6"><strong>Nombre de parts :</strong> {selectedActionnaire.nombreParts?.toLocaleString()}</div>
                            <div className="col-6"><strong>% Capital :</strong> {selectedActionnaire.pourcentageCapital?.toFixed(2)} %</div>
                            <div className="col-6"><strong>Valeur totale :</strong> {formatCurrency(selectedActionnaire.valeurTotale || 0)}</div>
                            <div className="col-6"><strong>Date entrée :</strong> {selectedActionnaire.dateEntreeCapital}</div>
                            <div className="col-6"><strong>Statut :</strong> {statutBodyTemplate(selectedActionnaire)}</div>
                            <div className="col-6"><strong>KYC :</strong> {kycBodyTemplate(selectedActionnaire)}</div>
                            <div className="col-6"><strong>Téléphone :</strong> {selectedActionnaire.telephone}</div>
                            <div className="col-6"><strong>Email :</strong> {selectedActionnaire.email}</div>
                            <div className="col-12"><strong>Adresse :</strong> {selectedActionnaire.adresse}</div>
                            <div className="col-6"><strong>Profession :</strong> {selectedActionnaire.profession}</div>
                            <div className="col-6"><strong>Agence :</strong> {selectedActionnaire.agenceRattachement}</div>
                            <div className="col-6"><strong>Compte épargne lié :</strong> {selectedActionnaire.compteEpargneLie}</div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
