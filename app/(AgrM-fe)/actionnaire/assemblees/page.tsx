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
import { InputTextarea } from 'primereact/inputtextarea';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { AssembleeGenerale, AssembleeGeneraleClass } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires/assemblees');

const TYPES_AG = [
    { label: 'Assemblée Générale Ordinaire (AGO)', value: 'AGO' },
    { label: 'Assemblée Générale Extraordinaire (AGE)', value: 'AGE' },
    { label: 'Assemblée Générale Mixte (AGM)', value: 'AGM' },
];

const STATUTS_AG = [
    { label: 'Planifiée', value: 'PLANIFIEE' },
    { label: 'En cours', value: 'EN_COURS' },
    { label: 'Clôturée', value: 'CLOTUREE' },
    { label: 'Annulée', value: 'ANNULEE' },
];

export default function AssembleesPage() {
    const [ag, setAg] = useState<AssembleeGenerale>(new AssembleeGeneraleClass());
    const [assemblees, setAssemblees] = useState<AssembleeGenerale[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [presencesDialog, setPresencesDialog] = useState(false);
    const [selectedAG, setSelectedAG] = useState<AssembleeGenerale | null>(null);
    const [presences, setPresences] = useState<any[]>([]);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const crudApi = useConsumApi('');
    const presencesApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        listApi.fetchData(null, 'GET', BASE_URL, 'loadAssemblees');
    }, []);

    useEffect(() => {
        if (listApi.data && listApi.callType === 'loadAssemblees') {
            setAssemblees(Array.isArray(listApi.data) ? listApi.data : listApi.data.content || []);
        }
        if (presencesApi.data && presencesApi.callType === 'presences') {
            setPresences(Array.isArray(presencesApi.data) ? presencesApi.data : []);
            setPresencesDialog(true);
        }
    }, [listApi.data, presencesApi.data, listApi.callType, presencesApi.callType]);

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Assemblée Générale planifiée avec succès');
                    resetForm();
                    setActiveIndex(1);
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadAssemblees');
                    break;
                case 'update':
                    showToast('success', 'Succès', 'AG mise à jour');
                    resetForm();
                    setActiveIndex(1);
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadAssemblees');
                    break;
                case 'open':
                    showToast('success', 'Info', 'Séance AG ouverte');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadAssemblees');
                    break;
                case 'close':
                    showToast('success', 'Succès', 'Séance AG clôturée — PV généré');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadAssemblees');
                    break;
            }
        }
        if (crudApi.error) {
            showToast('error', 'Erreur', crudApi.error.message || 'Une erreur est survenue');
        }
    }, [crudApi.data, crudApi.error, crudApi.callType]);

    const resetForm = () => setAg(new AssembleeGeneraleClass());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setAg(prev => ({ ...prev, [name]: value }));
    };

    const handleDropdownChange = (name: string, value: any) => {
        setAg(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setAg(prev => ({ ...prev, [name]: value ?? 0 }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setAg(prev => ({ ...prev, [name]: value ? value.toISOString().split('T')[0] : '' }));
    };

    const handleSubmit = () => {
        if (!ag.typeAG || !ag.dateAG || !ag.lieu) {
            showToast('warn', 'Attention', 'Type, date et lieu sont obligatoires');
            return;
        }
        const dataToSend = { ...ag, userAction: getUserAction() };
        if (ag.id) {
            crudApi.fetchData(dataToSend, 'PUT', `${BASE_URL}/${ag.id}`, 'update');
        } else {
            crudApi.fetchData(dataToSend, 'POST', BASE_URL, 'create');
        }
    };

    const handleOpen = (item: AssembleeGenerale) => {
        confirmDialog({
            message: `Ouvrir la séance de l'AG du ${item.dateAG} ?`,
            header: 'Ouverture de séance',
            icon: 'pi pi-play',
            acceptLabel: 'Ouvrir',
            rejectLabel: 'Annuler',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/ouvrir`, 'open')
        });
    };

    const handleClose = (item: AssembleeGenerale) => {
        confirmDialog({
            message: `Clôturer la séance de l'AG du ${item.dateAG} ? Le PV sera généré automatiquement.`,
            header: 'Clôture de séance',
            icon: 'pi pi-stop',
            acceptLabel: 'Clôturer',
            rejectLabel: 'Annuler',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/cloturer`, 'close')
        });
    };

    const handleViewPresences = (item: AssembleeGenerale) => {
        setSelectedAG(item);
        presencesApi.fetchData(null, 'GET', `${BASE_URL}/${item.id}/presences`, 'presences');
    };

    const statutBodyTemplate = (row: AssembleeGenerale) => {
        const colors: Record<string, string> = { PLANIFIEE: '#3b82f6', EN_COURS: '#22c55e', CLOTUREE: '#6b7280', ANNULEE: '#ef4444' };
        const labels: Record<string, string> = { PLANIFIEE: 'Planifiée', EN_COURS: 'En cours', CLOTUREE: 'Clôturée', ANNULEE: 'Annulée' };
        return <Tag value={labels[row.statut || ''] || row.statut} style={{ backgroundColor: colors[row.statut || ''] || '#6b7280' }} />;
    };

    const typeAGBodyTemplate = (row: AssembleeGenerale) => {
        const colors: Record<string, string> = { AGO: '#0ea5e9', AGE: '#f97316', AGM: '#8b5cf6' };
        return <Tag value={row.typeAG} style={{ backgroundColor: colors[row.typeAG || ''] || '#6b7280' }} />;
    };

    const quorumBodyTemplate = (row: AssembleeGenerale) => {
        const atteint = row.quorumAtteint || 0;
        const requis = row.quorumRequis || 1;
        const pct = Math.round(atteint / requis * 100);
        const ok = atteint >= requis;
        return <span style={{ color: ok ? '#22c55e' : '#ef4444' }}>{pct}% {ok ? '✓' : '✗'}</span>;
    };

    const actionsBodyTemplate = (row: AssembleeGenerale) => (
        <div className="flex gap-1">
            <Button icon="pi pi-users" rounded text severity="info" onClick={() => handleViewPresences(row)} tooltip="Présences" />
            <Button icon="pi pi-pencil" rounded text severity="warning" onClick={() => { setAg({ ...row }); setActiveIndex(0); }} tooltip="Modifier" />
            {row.statut === 'PLANIFIEE' && (
                <Button icon="pi pi-play" rounded text severity="success" onClick={() => handleOpen(row)} tooltip="Ouvrir séance" />
            )}
            {row.statut === 'EN_COURS' && (
                <Button icon="pi pi-stop" rounded text severity="danger" onClick={() => handleClose(row)} tooltip="Clôturer séance" />
            )}
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
            <Button label="Planifier une AG" icon="pi pi-plus" onClick={() => { resetForm(); setActiveIndex(0); }} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-calendar mr-2" />
                Assemblées Générales — SH-AGM
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
                <TabPanel header={ag.id ? "Modifier l'AG" : "Planifier une AG"} leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-calendar mr-2" />Informations de l'AG</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label>Type d'AG *</label>
                                    <Dropdown
                                        value={ag.typeAG}
                                        options={TYPES_AG}
                                        onChange={e => handleDropdownChange('typeAG', e.value)}
                                        placeholder="Sélectionner le type"
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Date de l'AG *</label>
                                    <Calendar
                                        value={ag.dateAG ? new Date(ag.dateAG) : null}
                                        onChange={e => handleDateChange('dateAG', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Lieu *</label>
                                    <InputText name="lieu" value={ag.lieu || ''} onChange={handleChange} placeholder="Lieu de tenue de l'AG" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Heure de début</label>
                                    <InputText name="heureDebut" value={ag.heureDebut || ''} onChange={handleChange} placeholder="08:00" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Heure de fin</label>
                                    <InputText name="heureFin" value={ag.heureFin || ''} onChange={handleChange} placeholder="12:00" />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Quorum requis (parts)</label>
                                    <InputNumber value={ag.quorumRequis} onValueChange={e => handleNumberChange('quorumRequis', e.value)} min={0} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Statut</label>
                                    <Dropdown
                                        value={ag.statut}
                                        options={STATUTS_AG}
                                        onChange={e => handleDropdownChange('statut', e.value)}
                                    />
                                </div>
                                <div className="field col-12 md:col-6">
                                    <label>Référence PV</label>
                                    <InputText name="referencePV" value={ag.referencePV || ''} onChange={handleChange} />
                                </div>
                                <div className="field col-12">
                                    <label>Ordre du jour</label>
                                    <InputTextarea
                                        name="ordreduJour"
                                        value={ag.ordreduJour || ''}
                                        onChange={handleChange}
                                        rows={5}
                                        placeholder="Points inscrits à l'ordre du jour..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-content-end">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            <Button
                                label={ag.id ? 'Mettre à jour' : 'Planifier'}
                                icon="pi pi-check"
                                onClick={handleSubmit}
                                loading={crudApi.loading}
                            />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Liste des AG" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={assemblees}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={listApi.loading}
                        emptyMessage="Aucune AG enregistrée"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        globalFilterFields={['lieu', 'referencePV']}
                        header={header}
                    >
                        <Column header="Type" body={typeAGBodyTemplate} style={{ width: '80px' }} />
                        <Column field="dateAG" header="Date" sortable style={{ minWidth: '110px' }} />
                        <Column field="lieu" header="Lieu" sortable filter />
                        <Column field="heureDebut" header="Heure début" />
                        <Column header="Quorum" body={quorumBodyTemplate} />
                        <Column field="quorumAtteint" header="Parts présentes" body={r => r.quorumAtteint?.toLocaleString()} />
                        <Column field="referencePV" header="Réf. PV" />
                        <Column header="Statut" body={statutBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '160px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header={`Présences — AG du ${selectedAG?.dateAG}`}
                visible={presencesDialog}
                style={{ width: '800px' }}
                onHide={() => setPresencesDialog(false)}
            >
                <DataTable value={presences} className="p-datatable-sm" emptyMessage="Aucune présence enregistrée">
                    <Column field="actionnaireNom" header="Actionnaire" sortable />
                    <Column field="nombreParts" header="Parts" body={r => r.nombreParts?.toLocaleString()} sortable />
                    <Column field="presence" header="Présence" body={r => r.presence ? <Tag value="Présent" severity="success" /> : <Tag value="Absent" severity="danger" />} />
                    <Column field="votesExprimes" header="Votes exprimés" body={r => r.votesExprimes?.toLocaleString()} />
                    <Column field="procurationPour" header="Procuration accordée à" />
                </DataTable>
            </Dialog>
        </div>
    );
}
