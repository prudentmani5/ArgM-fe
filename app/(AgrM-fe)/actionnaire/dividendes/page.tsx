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
import { Divider } from 'primereact/divider';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';
import { DeclarationDividende, DeclarationDividendeClass } from '../Actionnaire';

const BASE_URL = buildApiUrl('/api/actionnaires/dividendes');

const EXERCICES = Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() - 1 - i;
    return { label: String(y), value: y };
});

export default function DividendesPage() {
    const [declaration, setDeclaration] = useState<DeclarationDividende>(new DeclarationDividendeClass());
    const [declarations, setDeclarations] = useState<DeclarationDividende[]>([]);
    const [repartition, setRepartition] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [globalFilter, setGlobalFilter] = useState('');
    const [repartitionDialog, setRepartitionDialog] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState<DeclarationDividende | null>(null);
    const toast = useRef<Toast>(null);

    const listApi = useConsumApi('');
    const crudApi = useConsumApi('');
    const repartitionApi = useConsumApi('');
    const paiementApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 5000 });
    };

    useEffect(() => {
        listApi.fetchData(null, 'GET', BASE_URL, 'loadDeclarations');
    }, []);

    useEffect(() => {
        if (listApi.data && listApi.callType === 'loadDeclarations') {
            setDeclarations(Array.isArray(listApi.data) ? listApi.data : listApi.data.content || []);
        }
        if (repartitionApi.data && repartitionApi.callType === 'repartition') {
            setRepartition(Array.isArray(repartitionApi.data) ? repartitionApi.data : []);
            setRepartitionDialog(true);
        }
    }, [listApi.data, repartitionApi.data, listApi.callType, repartitionApi.callType]);

    useEffect(() => {
        if (crudApi.data) {
            switch (crudApi.callType) {
                case 'create':
                    showToast('success', 'Succès', 'Déclaration enregistrée — en attente d\'approbation DG');
                    resetForm();
                    setActiveIndex(1);
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadDeclarations');
                    break;
                case 'approve':
                    showToast('success', 'Succès', 'Déclaration approuvée par le DG');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadDeclarations');
                    break;
                case 'pay':
                    showToast('success', 'Succès', 'Paiements déclenchés — écritures comptables générées');
                    listApi.fetchData(null, 'GET', BASE_URL, 'loadDeclarations');
                    break;
            }
        }
        if (crudApi.error) {
            showToast('error', 'Erreur', crudApi.error.message || 'Une erreur est survenue');
        }
        if (paiementApi.error) {
            showToast('error', 'Erreur paiement', paiementApi.error.message || 'Erreur lors du paiement');
        }
    }, [crudApi.data, crudApi.error, paiementApi.data, paiementApi.error, crudApi.callType]);

    const resetForm = () => setDeclaration(new DeclarationDividendeClass());

    const handleNumberChange = (name: string, value: number | null | undefined) => {
        setDeclaration(prev => {
            const updated = { ...prev, [name]: value ?? 0 };
            if (name === 'beneficeNet' || name === 'tauxDistribution') {
                const bn = updated.beneficeNet || 0;
                const tx = updated.tauxDistribution || 0;
                updated.reserveLegale = Math.round(bn * 0.10);
                updated.totalDividendes = Math.round(bn * tx / 100);
                updated.reportANouveau = bn - updated.totalDividendes - updated.reserveLegale;
            }
            return updated;
        });
    };

    const handleDropdownChange = (name: string, value: any) => {
        setDeclaration(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (name: string, value: Date | null) => {
        setDeclaration(prev => ({ ...prev, [name]: value ? value.toISOString().split('T')[0] : '' }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setDeclaration(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!declaration.exercice || !declaration.beneficeNet || !declaration.referenceResolutionAGO) {
            showToast('warn', 'Attention', 'Exercice, bénéfice net et référence résolution AGO sont obligatoires');
            return;
        }
        crudApi.fetchData({ ...declaration, userAction: getUserAction() }, 'POST', BASE_URL, 'create');
    };

    const handleApprove = (item: DeclarationDividende) => {
        confirmDialog({
            message: `Approuver la déclaration de dividendes de l'exercice ${item.exercice} ? Total : ${formatCurrency(item.totalDividendes || 0)}`,
            header: 'Approbation DG',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Approuver',
            rejectLabel: 'Annuler',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/approuver`, 'approve')
        });
    };

    const handlePay = (item: DeclarationDividende) => {
        confirmDialog({
            message: `Déclencher les paiements pour l'exercice ${item.exercice} ? Les écritures comptables seront générées automatiquement.`,
            header: 'Déclenchement des paiements',
            icon: 'pi pi-money-bill',
            acceptLabel: 'Déclencher',
            rejectLabel: 'Annuler',
            accept: () => crudApi.fetchData({ userAction: getUserAction() }, 'POST', `${BASE_URL}/${item.id}/payer`, 'pay')
        });
    };

    const handleViewRepartition = (item: DeclarationDividende) => {
        setSelectedDeclaration(item);
        repartitionApi.fetchData(null, 'GET', `${BASE_URL}/${item.id}/repartition`, 'repartition');
    };

    const formatCurrency = (val: number) =>
        (val || 0).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU';

    const statutBodyTemplate = (row: DeclarationDividende) => {
        const colors: Record<string, string> = { EN_ATTENTE: '#f97316', APPROUVE: '#22c55e', PAYE: '#3b82f6', REINVESTI: '#8b5cf6' };
        const labels: Record<string, string> = { EN_ATTENTE: 'En attente', APPROUVE: 'Approuvé', PAYE: 'Payé', REINVESTI: 'Réinvesti' };
        return <Tag value={labels[row.statut || ''] || row.statut} style={{ backgroundColor: colors[row.statut || ''] || '#6b7280' }} />;
    };

    const statutPaiementBody = (row: any) => {
        const colors: Record<string, string> = { EN_ATTENTE: '#f97316', PAYE: '#22c55e', REINVESTI: '#8b5cf6' };
        const labels: Record<string, string> = { EN_ATTENTE: 'En attente', PAYE: 'Payé', REINVESTI: 'Réinvesti' };
        return <Tag value={labels[row.statutPaiement] || row.statutPaiement} style={{ backgroundColor: colors[row.statutPaiement] || '#6b7280' }} />;
    };

    const actionsBodyTemplate = (row: DeclarationDividende) => (
        <div className="flex gap-1">
            <Button icon="pi pi-table" rounded text severity="info" onClick={() => handleViewRepartition(row)} tooltip="Voir répartition" />
            {row.statut === 'EN_ATTENTE' && (
                <Button icon="pi pi-check" rounded text severity="success" onClick={() => handleApprove(row)} tooltip="Approuver (DG)" />
            )}
            {row.statut === 'APPROUVE' && (
                <Button icon="pi pi-money-bill" rounded text severity="warning" onClick={() => handlePay(row)} tooltip="Déclencher paiements" />
            )}
        </div>
    );

    const header = (
        <div className="flex justify-content-between align-items-center">
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
            </span>
            <Button label="Nouvelle déclaration" icon="pi pi-plus" onClick={() => { resetForm(); setActiveIndex(0); }} />
        </div>
    );

    return (
        <div className="card">
            <Toast ref={toast} />
            <ConfirmDialog />
            <h4 className="text-primary mb-3">
                <i className="pi pi-percentage mr-2" />
                Gestion des Dividendes — SH-DIV
            </h4>

            <TabView activeIndex={activeIndex} onTabChange={e => setActiveIndex(e.index)}>
                <TabPanel header="Nouvelle Déclaration" leftIcon="pi pi-plus mr-2">
                    <div className="card p-fluid">
                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-calendar mr-2" />Paramètres de la déclaration</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-3">
                                    <label>Exercice concerné *</label>
                                    <Dropdown
                                        value={declaration.exercice}
                                        options={EXERCICES}
                                        onChange={e => handleDropdownChange('exercice', e.value)}
                                        placeholder="Sélectionner l'exercice"
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Référence résolution AGO *</label>
                                    <InputText name="referenceResolutionAGO" value={declaration.referenceResolutionAGO || ''} onChange={handleChange} />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Date de mise en paiement</label>
                                    <Calendar
                                        value={declaration.dateMiseEnPaiement ? new Date(declaration.dateMiseEnPaiement) : null}
                                        onChange={e => handleDateChange('dateMiseEnPaiement', e.value as Date | null)}
                                        dateFormat="dd/mm/yy"
                                        showIcon
                                    />
                                </div>
                                <div className="field col-12 md:col-3">
                                    <label>Taux IRCM (%)</label>
                                    <InputNumber value={declaration.tauxIRCM} onValueChange={e => handleNumberChange('tauxIRCM', e.value)} min={0} max={100} suffix=" %" />
                                </div>
                            </div>
                        </div>

                        <div className="surface-100 p-3 border-round mb-4">
                            <h5 className="m-0 mb-3 text-primary"><i className="pi pi-calculator mr-2" />Calcul de la distribution</h5>
                            <div className="formgrid grid">
                                <div className="field col-12 md:col-4">
                                    <label>Bénéfice net de l'exercice (FBU) *</label>
                                    <InputNumber value={declaration.beneficeNet} onValueChange={e => handleNumberChange('beneficeNet', e.value)} min={0} />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Taux de distribution (%)</label>
                                    <InputNumber value={declaration.tauxDistribution} onValueChange={e => handleNumberChange('tauxDistribution', e.value)} min={0} max={100} suffix=" %" />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Total dividendes à distribuer (FBU)</label>
                                    <InputNumber value={declaration.totalDividendes} disabled className="font-bold text-green-600" />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Réserve légale dotée (10%) (FBU)</label>
                                    <InputNumber value={declaration.reserveLegale} disabled />
                                </div>
                                <div className="field col-12 md:col-4">
                                    <label>Report à nouveau prévu (FBU)</label>
                                    <InputNumber value={declaration.reportANouveau} disabled />
                                </div>
                            </div>

                            <Divider />
                            <div className="surface-50 p-3 border-round">
                                <strong className="text-primary"><i className="pi pi-info-circle mr-2" />Écritures comptables générées à la validation :</strong>
                                <div className="grid mt-2 text-sm">
                                    <div className="col-12">1. Dotation réserve légale : Débit <strong>5800</strong> / Crédit <strong>111</strong> — {formatCurrency(declaration.reserveLegale || 0)}</div>
                                    <div className="col-12">2. Constatation dette dividendes : Débit <strong>5800</strong> / Crédit <strong>4600</strong> — {formatCurrency(declaration.totalDividendes || 0)}</div>
                                    <div className="col-12">3. IRCM à reverser : Débit <strong>4600</strong> / Crédit <strong>447</strong> — {formatCurrency(Math.round((declaration.totalDividendes || 0) * (declaration.tauxIRCM || 15) / 100))}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-content-end">
                            <Button label="Annuler" icon="pi pi-times" severity="secondary" onClick={resetForm} />
                            <Button label="Soumettre pour approbation DG" icon="pi pi-send" onClick={handleSubmit} loading={crudApi.loading} />
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Liste des Déclarations" leftIcon="pi pi-list mr-2">
                    <DataTable
                        value={declarations}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        loading={listApi.loading}
                        emptyMessage="Aucune déclaration enregistrée"
                        className="p-datatable-sm"
                        globalFilter={globalFilter}
                        globalFilterFields={['exercice', 'referenceResolutionAGO']}
                        header={header}
                    >
                        <Column field="exercice" header="Exercice" sortable style={{ width: '100px' }} />
                        <Column header="Bénéfice net" body={r => formatCurrency(r.beneficeNet)} sortable />
                        <Column header="Taux distrib." body={r => (r.tauxDistribution || 0) + ' %'} />
                        <Column header="Total dividendes" body={r => formatCurrency(r.totalDividendes)} sortable />
                        <Column header="Dividende/part" body={r => formatCurrency(r.dividendeParPart)} />
                        <Column header="IRCM (%)" body={r => (r.tauxIRCM || 0) + ' %'} />
                        <Column field="dateMiseEnPaiement" header="Date paiement" sortable />
                        <Column field="referenceResolutionAGO" header="Réf. AGO" />
                        <Column header="Statut" body={statutBodyTemplate} sortable />
                        <Column header="Actions" body={actionsBodyTemplate} style={{ width: '140px' }} />
                    </DataTable>
                </TabPanel>
            </TabView>

            <Dialog
                header={`Aperçu de répartition — Exercice ${selectedDeclaration?.exercice}`}
                visible={repartitionDialog}
                style={{ width: '900px' }}
                onHide={() => setRepartitionDialog(false)}
            >
                <DataTable value={repartition} className="p-datatable-sm" emptyMessage="Aucune donnée">
                    <Column field="actionnaireNom" header="Actionnaire" sortable />
                    <Column field="nombreParts" header="Parts" body={r => r.nombreParts?.toLocaleString()} />
                    <Column header="Dividende brut" body={r => formatCurrency(r.dividendeBrut)} sortable />
                    <Column header="IRCM retenu" body={r => formatCurrency(r.ircmRetenu)} />
                    <Column header="Dividende net" body={r => <strong>{formatCurrency(r.dividendeNet)}</strong>} sortable />
                    <Column field="modePaiement" header="Mode paiement" />
                    <Column header="Statut" body={statutPaiementBody} />
                </DataTable>
            </Dialog>
        </div>
    );
}
