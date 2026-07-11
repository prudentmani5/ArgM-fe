'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import useConsumApi, { getUserAction } from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

const BASE_URL = buildApiUrl('/api/actionnaires/comptabilisation');

const EXERCICES = Array.from({ length: 6 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: y };
});

const SCHEMAS = [
    {
        id: 1,
        titre: 'Schéma 1 — Souscription de parts',
        contexte: 'Entrée au capital, libération immédiate en caisse',
        lignes: [
            { debit: '571 Caisse principale', credit: '1011 Parts sociales des membres', montant: 'Nb parts × Prix/part', remarque: 'Souscription instantanée' },
        ],
    },
    {
        id: 2,
        titre: 'Schéma 2 — Rachat de parts',
        contexte: 'Sortie du capital, rachat à la valeur nominale',
        lignes: [
            { debit: '1011 Parts sociales des membres', credit: '521 Banque (compte IMF)', montant: 'Nb parts × Valeur nominale', remarque: 'Paiement du prix de rachat' },
        ],
    },
    {
        id: 3,
        titre: 'Schéma 3 — Déclaration de dividendes',
        contexte: "L'AGO vote la distribution. Constatation de la dette + retenue IRCM",
        lignes: [
            { debit: '5800 Report à nouveau / Bénéfice N-1', credit: '4600 Actionnaires — dividendes à payer', montant: 'Total dividendes bruts', remarque: 'Constatation de la dette' },
            { debit: '4600 Actionnaires — dividendes à payer', credit: '447 IRCM à reverser (OBR)', montant: '15% × Total dividendes', remarque: 'IRCM retenu à la source' },
        ],
    },
    {
        id: 4,
        titre: 'Schéma 4 — Paiement des dividendes nets',
        contexte: 'Paiement effectif après retenue IRCM',
        lignes: [
            { debit: '4600 Actionnaires — dividendes à payer', credit: '521 Banque / 571 Caisse / 2211 Épargne', montant: 'Dividende brut − IRCM retenu', remarque: 'Selon mode de paiement choisi' },
        ],
    },
];

const PLAN_COMPTES = [
    { numero: '1011', intitule: 'Parts sociales des membres', sens: 'Créditeur', usage: 'COMPTE PRINCIPAL — toutes souscriptions et rachats' },
    { numero: '1012', intitule: 'Parts sociales des fondateurs', sens: 'Créditeur', usage: 'Parts des membres fondateurs (SH-F)' },
    { numero: '104', intitule: 'Primes liées au capital', sens: 'Créditeur', usage: 'Prime d\'émission (prix > valeur nominale)' },
    { numero: '109', intitule: 'Capital souscrit non libéré', sens: 'Créditeur', usage: 'Parts souscrites non encore versées' },
    { numero: '111', intitule: 'Réserve légale', sens: 'Créditeur', usage: 'Dotation 10% du bénéfice jusqu\'à 20% du capital' },
    { numero: '121', intitule: 'Report à nouveau (créditeur)', sens: 'Créditeur', usage: 'Bénéfices non distribués des exercices antérieurs' },
    { numero: '271', intitule: 'Parts en auto-contrôle', sens: 'Débiteur', usage: 'Parts rachetées conservées en trésorerie' },
    { numero: '4600', intitule: 'Actionnaires — dividendes à payer', sens: 'Créditeur', usage: 'Dette de dividendes déclarés non encore payés' },
    { numero: '447', intitule: 'IRCM à reverser', sens: 'Créditeur', usage: 'Retenue fiscale sur dividendes à reverser à l\'OBR' },
    { numero: '5800', intitule: 'Report à nouveau / Résultat', sens: 'Variable', usage: 'Solde de résultat affecté lors de l\'AGO' },
];

export default function ComptabilisationPage() {
    const [exercice, setExercice] = useState(new Date().getFullYear());
    const [dateDebut, setDateDebut] = useState<Date | null>(null);
    const [dateFin, setDateFin] = useState<Date | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const [mouvements, setMouvements] = useState<any[]>([]);
    const [solde1011, setSolde1011] = useState(0);
    const toast = useRef<Toast>(null);

    const grandLivreApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    const loadGrandLivre = () => {
        let url = `${BASE_URL}/grand-livre-1011?exercice=${exercice}`;
        if (dateDebut) url += `&dateDebut=${dateDebut.toISOString().split('T')[0]}`;
        if (dateFin) url += `&dateFin=${dateFin.toISOString().split('T')[0]}`;
        grandLivreApi.fetchData(null, 'GET', url, 'grandLivre');
    };

    useEffect(() => {
        loadGrandLivre();
    }, []);

    useEffect(() => {
        if (grandLivreApi.data && grandLivreApi.callType === 'grandLivre') {
            const data = grandLivreApi.data;
            setMouvements(Array.isArray(data.mouvements) ? data.mouvements : []);
            setSolde1011(data.soldeActuel || 0);
        }
        if (grandLivreApi.error) {
            showToast('error', 'Erreur', 'Impossible de charger le grand livre');
        }
    }, [grandLivreApi.data, grandLivreApi.error, grandLivreApi.callType]);

    const formatCurrency = (val: number) =>
        val ? (val).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU' : '—';

    const typeBodyTemplate = (row: any) => {
        const colors: Record<string, string> = { SOUSCRIPTION: '#22c55e', RACHAT: '#ef4444', DIVIDENDE: '#8b5cf6', TRANSFERT: '#0ea5e9' };
        return <Tag value={row.typeOperation} style={{ backgroundColor: colors[row.typeOperation] || '#6b7280', fontSize: '0.75rem' }} />;
    };

    return (
        <div className="card">
            <Toast ref={toast} />
            <h4 className="text-primary mb-3">
                <i className="pi pi-book mr-2" />
                Comptabilisation — Compte 1011 (SH-ACC)
            </h4>

            {/* Solde actuel */}
            <div className="grid mb-4">
                <div className="col-12 md:col-4">
                    <Card className="text-center border-2" style={{ borderColor: '#3b82f6' }}>
                        <div className="text-500 text-sm mb-1">Solde compte 1011 (Parts sociales des membres)</div>
                        <div className="text-3xl font-bold text-primary">{formatCurrency(solde1011)}</div>
                        <div className="text-400 text-xs mt-1">Mis à jour en temps réel</div>
                    </Card>
                </div>
            </div>

            {/* Schémas d'écritures */}
            <div className="mb-4">
                <h5 className="text-primary"><i className="pi pi-list mr-2" />Les 4 schémas d'écritures standards</h5>
                <div className="grid">
                    {SCHEMAS.map(schema => (
                        <div key={schema.id} className="col-12 md:col-6 mb-3">
                            <div className="surface-100 border-round p-3 h-full">
                                <strong className="text-primary block mb-1">{schema.titre}</strong>
                                <small className="text-500 block mb-2">{schema.contexte}</small>
                                <DataTable value={schema.lignes} className="p-datatable-sm" showGridlines>
                                    <Column field="debit" header="Débit" style={{ fontSize: '0.8rem' }} />
                                    <Column field="credit" header="Crédit" style={{ fontSize: '0.8rem' }} />
                                    <Column field="montant" header="Montant" style={{ fontSize: '0.8rem' }} />
                                    <Column field="remarque" header="Remarque" style={{ fontSize: '0.8rem' }} />
                                </DataTable>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Divider />

            {/* Grand livre compte 1011 */}
            <div className="mb-4">
                <h5 className="text-primary"><i className="pi pi-book mr-2" />Grand Livre — Compte 1011 — Exercice en cours</h5>
                <div className="flex gap-3 mb-3 align-items-end flex-wrap">
                    <div>
                        <label className="block mb-1 text-sm">Exercice</label>
                        <Dropdown value={exercice} options={EXERCICES} onChange={e => setExercice(e.value)} style={{ width: '120px' }} />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Date début</label>
                        <Calendar value={dateDebut} onChange={e => setDateDebut(e.value as Date | null)} dateFormat="dd/mm/yy" showIcon />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm">Date fin</label>
                        <Calendar value={dateFin} onChange={e => setDateFin(e.value as Date | null)} dateFormat="dd/mm/yy" showIcon />
                    </div>
                    <Button label="Filtrer" icon="pi pi-filter" onClick={loadGrandLivre} loading={grandLivreApi.loading} />
                    <Button label="Exporter PDF" icon="pi pi-file-pdf" severity="secondary" />
                    <Button label="Exporter Excel" icon="pi pi-file-excel" severity="secondary" />
                </div>

                <DataTable
                    value={mouvements}
                    paginator
                    rows={15}
                    rowsPerPageOptions={[10, 15, 25, 50]}
                    loading={grandLivreApi.loading}
                    emptyMessage="Aucun mouvement pour cette période"
                    className="p-datatable-sm"
                    globalFilter={globalFilter}
                    globalFilterFields={['libelle', 'reference', 'actionnaireNom']}
                    header={
                        <div className="flex justify-content-between">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText value={globalFilter} onChange={e => setGlobalFilter(e.target.value)} placeholder="Rechercher..." />
                            </span>
                        </div>
                    }
                >
                    <Column field="date" header="Date" sortable style={{ width: '110px' }} />
                    <Column field="libelle" header="Libellé" sortable style={{ minWidth: '200px' }} />
                    <Column header="Type" body={typeBodyTemplate} style={{ width: '110px' }} />
                    <Column field="reference" header="Référence" />
                    <Column header="Débit (FBU)" body={r => r.debit ? formatCurrency(r.debit) : '—'} sortable />
                    <Column header="Crédit (FBU)" body={r => r.credit ? formatCurrency(r.credit) : '—'} sortable />
                    <Column header="Solde (FBU)" body={r => <strong>{formatCurrency(r.solde)}</strong>} sortable />
                </DataTable>
            </div>

            <Divider />

            {/* Plan de comptes */}
            <div>
                <h5 className="text-primary"><i className="pi pi-list mr-2" />Plan de comptes — Module Actionnaires</h5>
                <DataTable value={PLAN_COMPTES} className="p-datatable-sm" showGridlines>
                    <Column field="numero" header="N° Compte" sortable style={{ width: '110px', fontFamily: 'monospace' }} />
                    <Column field="intitule" header="Intitulé" sortable />
                    <Column
                        field="sens"
                        header="Sens normal"
                        body={r => <Tag value={r.sens} style={{ backgroundColor: r.sens === 'Créditeur' ? '#22c55e' : r.sens === 'Débiteur' ? '#ef4444' : '#6b7280' }} />}
                    />
                    <Column field="usage" header="Usage dans MOD-SH" />
                </DataTable>
            </div>
        </div>
    );
}
