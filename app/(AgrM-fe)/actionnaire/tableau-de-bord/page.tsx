'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Divider } from 'primereact/divider';
import useConsumApi from '@/hooks/fetchData/useConsumApi';
import { buildApiUrl } from '@/utils/apiConfig';

const BASE_URL = buildApiUrl('/api/actionnaires/dashboard');

export default function TableauDeBordPage() {
    const [dashboard, setDashboard] = useState<any>(null);
    const toast = useRef<Toast>(null);

    const dashApi = useConsumApi('');

    const showToast = (severity: 'success' | 'error' | 'warn', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 4000 });
    };

    useEffect(() => {
        dashApi.fetchData(null, 'GET', BASE_URL, 'dashboard');
    }, []);

    useEffect(() => {
        if (dashApi.data && dashApi.callType === 'dashboard') {
            setDashboard(dashApi.data);
        }
        if (dashApi.error) {
            showToast('warn', 'Attention', 'Impossible de charger le tableau de bord');
        }
    }, [dashApi.data, dashApi.error, dashApi.callType]);

    const formatCurrency = (val: number) =>
        (val || 0).toLocaleString('fr-BI', { minimumFractionDigits: 0 }) + ' FBU';

    const ratioBlock = (label: string, value: string | number, seuil: number, unit = '%') => {
        const numVal = typeof value === 'number' ? value : parseFloat(String(value));
        const ok = numVal >= seuil;
        return (
            <div className="flex justify-content-between align-items-center p-2 border-round mb-1"
                style={{ background: ok ? '#f0fdf4' : '#fef2f2', border: `1px solid ${ok ? '#86efac' : '#fca5a5'}` }}>
                <span className="text-sm font-medium">{label}</span>
                <div className="flex align-items-center gap-2">
                    <strong style={{ color: ok ? '#16a34a' : '#dc2626' }}>
                        {typeof value === 'number' ? value.toFixed(1) : value}{unit}
                    </strong>
                    <Tag
                        value={ok ? 'Conforme' : 'Non conforme'}
                        severity={ok ? 'success' : 'danger'}
                        style={{ fontSize: '0.7rem' }}
                    />
                </div>
            </div>
        );
    };

    const d = dashboard;

    return (
        <div className="card">
            <Toast ref={toast} />
            <div className="flex justify-content-between align-items-center mb-4">
                <h4 className="text-primary m-0">
                    <i className="pi pi-th-large mr-2" />
                    Tableau de Bord Actionnariat — MOD-SH
                </h4>
                <Button
                    icon="pi pi-refresh"
                    rounded
                    text
                    onClick={() => dashApi.fetchData(null, 'GET', BASE_URL, 'dashboard')}
                    loading={dashApi.loading}
                    tooltip="Actualiser"
                />
            </div>

            <div className="grid">
                {/* Bloc Capital */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full" style={{ borderTop: '4px solid #3b82f6' }}>
                        <div className="text-primary font-bold mb-3"><i className="pi pi-chart-pie mr-2" />Capital Social</div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Capital souscrit</div>
                            <div className="text-xl font-bold">{formatCurrency(d?.capitalSouscrit)}</div>
                        </div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Capital libéré</div>
                            <div className="text-xl font-bold text-green-600">{formatCurrency(d?.capitalLibere)}</div>
                        </div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Valeur nominale / part</div>
                            <div className="font-bold">{formatCurrency(d?.valeurNominale)}</div>
                        </div>
                        <div>
                            <div className="text-500 text-sm">Nombre total de parts</div>
                            <div className="font-bold">{(d?.totalParts || 0).toLocaleString()}</div>
                        </div>
                    </Card>
                </div>

                {/* Bloc Actionnaires */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full" style={{ borderTop: '4px solid #22c55e' }}>
                        <div className="text-primary font-bold mb-3"><i className="pi pi-users mr-2" />Actionnaires</div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Actionnaires actifs</div>
                            <div className="text-2xl font-bold text-green-600">{d?.totalActionnaires || 0}</div>
                        </div>
                        {d?.top3Actionnaires && (
                            <div>
                                <div className="text-500 text-sm mb-1">Top 3 actionnaires</div>
                                {d.top3Actionnaires.map((a: any, i: number) => (
                                    <div key={i} className="flex justify-content-between text-sm mb-1">
                                        <span className="text-800">{a.nom}</span>
                                        <strong>{a.pourcentage?.toFixed(1)}%</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                        {d?.repartitionParType && (
                            <div className="mt-2">
                                <div className="text-500 text-sm mb-1">Par type</div>
                                {Object.entries(d.repartitionParType).map(([type, count]: [string, any]) => (
                                    <div key={type} className="flex justify-content-between text-sm mb-1">
                                        <span>{type}</span><strong>{count}</strong>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Bloc Dividendes */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full" style={{ borderTop: '4px solid #8b5cf6' }}>
                        <div className="text-primary font-bold mb-3"><i className="pi pi-percentage mr-2" />Dividendes</div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Dernier dividende déclaré</div>
                            <div className="font-bold">{d?.dernierDividende?.exercice || '—'}</div>
                        </div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Total distribué</div>
                            <div className="font-bold">{formatCurrency(d?.dernierDividende?.totalDistribue)}</div>
                        </div>
                        <div className="mb-2">
                            <div className="text-500 text-sm">Taux de distribution</div>
                            <div className="font-bold">{d?.dernierDividende?.tauxDistribution || 0}%</div>
                        </div>
                        <div>
                            <div className="text-500 text-sm">IRCM versé</div>
                            <div className="font-bold">{formatCurrency(d?.dernierDividende?.ircmVerse)}</div>
                        </div>
                    </Card>
                </div>

                {/* Bloc Conformité BRB */}
                <div className="col-12 md:col-6 lg:col-3">
                    <Card className="h-full" style={{ borderTop: '4px solid #ef4444' }}>
                        <div className="text-primary font-bold mb-3"><i className="pi pi-shield mr-2" />Conformité BRB</div>
                        {ratioBlock('Solvabilité (min 8%)', d?.ratios?.solvabilite || 0, 8)}
                        {ratioBlock('Levier (min 5%)', d?.ratios?.levier || 0, 5)}
                        {ratioBlock('Tier 1', d?.ratios?.tier1Pct || 0, 50, ' M FBU')}
                        <div className="text-sm text-500 mt-2">
                            <i className="pi pi-calendar mr-1" />
                            Prochaine échéance BRB : {d?.prochaineEcheanceBRB || '—'}
                        </div>
                    </Card>
                </div>
            </div>

            <Divider />

            <div className="grid">
                {/* Alertes */}
                <div className="col-12 md:col-6">
                    <h5 className="text-primary"><i className="pi pi-bell mr-2" />Alertes en cours</h5>
                    {d?.alertes && d.alertes.length > 0 ? (
                        <div>
                            {d.alertes.map((alerte: any, i: number) => (
                                <div key={i} className="flex align-items-center gap-2 p-2 border-round mb-2"
                                    style={{ background: alerte.niveau === 'CRITIQUE' ? '#fef2f2' : '#fffbeb', border: `1px solid ${alerte.niveau === 'CRITIQUE' ? '#fca5a5' : '#fcd34d'}` }}>
                                    <i className={alerte.niveau === 'CRITIQUE' ? 'pi pi-exclamation-triangle text-red-500' : 'pi pi-exclamation-circle text-yellow-500'} />
                                    <span className="text-sm">{alerte.message}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="surface-100 p-3 border-round text-center text-500">
                            <i className="pi pi-check-circle text-green-500 mr-2" />
                            Aucune alerte en cours
                        </div>
                    )}
                </div>

                {/* Agenda */}
                <div className="col-12 md:col-6">
                    <h5 className="text-primary"><i className="pi pi-calendar mr-2" />Agenda</h5>
                    {d?.agenda && d.agenda.length > 0 ? (
                        <div>
                            {d.agenda.map((evt: any, i: number) => (
                                <div key={i} className="flex align-items-center gap-2 p-2 border-round mb-2 surface-100">
                                    <i className="pi pi-calendar-clock text-primary" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{evt.titre}</div>
                                        <div className="text-xs text-500">{evt.date}</div>
                                    </div>
                                    <Tag value={evt.type} severity="info" style={{ fontSize: '0.7rem' }} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="surface-100 p-3 border-round text-center text-500">
                            <i className="pi pi-calendar mr-2" />
                            Aucun événement planifié
                        </div>
                    )}
                </div>
            </div>

            {/* Derniers mouvements */}
            <Divider />
            <h5 className="text-primary"><i className="pi pi-history mr-2" />Derniers mouvements sur le capital</h5>
            <DataTable
                value={d?.derniersMouvements || []}
                className="p-datatable-sm"
                emptyMessage="Aucun mouvement récent"
                rows={5}
            >
                <Column field="date" header="Date" style={{ width: '110px' }} />
                <Column field="libelle" header="Libellé" />
                <Column field="actionnaireNom" header="Actionnaire" />
                <Column
                    header="Type"
                    body={(r: any) => {
                        const colors: Record<string, string> = { SOUSCRIPTION: '#22c55e', RACHAT: '#ef4444', TRANSFERT: '#0ea5e9' };
                        return <Tag value={r.type} style={{ backgroundColor: colors[r.type] || '#6b7280', fontSize: '0.75rem' }} />;
                    }}
                />
                <Column header="Montant" body={(r: any) => formatCurrency(r.montant)} />
            </DataTable>
        </div>
    );
}
