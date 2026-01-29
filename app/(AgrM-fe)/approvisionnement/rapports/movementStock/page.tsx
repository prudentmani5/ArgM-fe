'use client';

import { TabPanel, TabView } from 'primereact/tabview';
import { useEffect, useRef, useState } from 'react';
import { DataTable, DataTableExpandedRows } from 'primereact/datatable';
import { CategorieGroup } from './RapportMouvementStock';
import RapportMouvementStockForm from './RapportMouvementStockForm';
import { PDFDownloadLink } from '@react-pdf/renderer';
import RapportMouvementStockPdf from './RapportMouvementStockPdf';
import { endOfDay, format, startOfDay } from 'date-fns';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { API_BASE_URL } from '@/utils/apiConfig';
import Cookies from 'js-cookie';

// Add authentication utility function
const getAuthHeaders = (): HeadersInit => {
    const token = Cookies.get('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const RapportMouvementStockPage = () => {
    const baseUrl = `${API_BASE_URL}`;
    const [categorieGroups, setCategorieGroups] = useState<CategorieGroup[]>([]);
    const [searchParams, setSearchParams] = useState<{
        dateDebut: Date;
        dateFin: Date;
        magasinId?: string;
        sousCategorieId?: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});
    const toast = useRef<Toast>(null);
    const [visibleDialog, setVisibleDialog] = useState(false);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({ severity, summary, detail, life: 3000 });
    };

    const fetchRapport = async (params: {
        dateDebut: Date;
        dateFin: Date;
        magasinId?: string;
        sousCategorieId?: string;
    }) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                debut: format(startOfDay(params.dateDebut), 'yyyy-MM-dd'),
                fin: format(endOfDay(params.dateFin), 'yyyy-MM-dd')
            });

            if (params.magasinId) {
                queryParams.append('magasinId', params.magasinId);
            }
            if (params.sousCategorieId) {
                queryParams.append('sousCategorieId', params.sousCategorieId);
            }

            const response = await fetch(
                `${baseUrl}/stock/rapportMouvement?${queryParams.toString()}`,
                {
                    headers: getAuthHeaders()
                }
            );

            if (!response.ok) {
                if (response.status === 401) {
                    showToast('error', 'Non autorisé', 'Veuillez vous reconnecter');
                    return;
                }
                throw new Error('Erreur réseau');
            }

            const data = await response.json();
            setSearchParams(params);

            // Groupement: Catégorie > Articles
            const groupedData = data.reduce((acc: CategorieGroup[], item: any) => {
                let categorieGroup = acc.find(
                    c => c.categorieLibelle === item.categorieLibelle
                );

                if (!categorieGroup) {
                    categorieGroup = {
                        categorieLibelle: item.categorieLibelle,
                        items: [],
                        totalInitial: 0,
                        totalEntrees: 0,
                        totalSorties: 0,
                        totalStock: 0
                    };
                    acc.push(categorieGroup);
                }

                categorieGroup.items.push(item);
                categorieGroup.totalInitial += item.montantInitial;
                categorieGroup.totalEntrees += item.montantEntrees;
                categorieGroup.totalSorties += item.montantSorties;
                categorieGroup.totalStock += item.montantStock;

                return acc;
            }, []);

            setCategorieGroups(groupedData);
            setVisibleDialog(true);
        } catch (error) {
            showToast('error', 'Erreur', 'Échec de la récupération des données');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number | null) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'BIF',
            currencyDisplay: 'code',
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        })
            .format(value || 0)
            .replace(/\s/g, ' ')
            .replace(/BIF$/, ' ');
    };

    const formatQte = (value: number) => {
        return value.toFixed(2);
    };

    const isZeroRow = (item: CategorieGroup['items'][number]) => {
        const values = [
            item.qteInitiale,
            item.montantInitial,
            item.qteEntrees,
            item.montantEntrees,
            item.qteSorties,
            item.montantSorties,
            item.qteStock,
            item.prixUnitaireStock,
            item.montantStock
        ];

        return values.every((value) => (value ?? 0) === 0);
    };

    const isZeroCategory = (categorie: CategorieGroup) => {
        const values = [
            categorie.totalInitial,
            categorie.totalEntrees,
            categorie.totalSorties,
            categorie.totalStock
        ];

        return values.every((value) => (value ?? 0) === 0);
    };

    const visibleGroups = categorieGroups
        .map((categorie) => ({
            ...categorie,
            items: categorie.items.filter((item) => !isZeroRow(item))
        }))
        .filter((categorie) => !isZeroCategory(categorie));

    const categorieRowTemplate = (rowData: CategorieGroup) => {
        return (
            <div className="p-3 ml-4">
                <DataTable value={rowData.items} size="small">
                    <Column field="articleLibelle" header="Article" style={{ width: '20%' }} />
                    <Column
                        field="qteInitiale"
                        header="Qté Init."
                        style={{ width: '8%' }}
                        body={(d) => formatQte(d.qteInitiale)}
                    />
                    <Column
                        field="montantInitial"
                        header="Montant Init."
                        style={{ width: '12%' }}
                        body={(d) => formatCurrency(d.montantInitial)}
                    />
                    <Column
                        field="qteEntrees"
                        header="Qté Entrées"
                        style={{ width: '8%' }}
                        body={(d) => formatQte(d.qteEntrees)}
                    />
                    <Column
                        field="montantEntrees"
                        header="Montant Entrées"
                        style={{ width: '12%' }}
                        body={(d) => formatCurrency(d.montantEntrees)}
                    />
                    <Column
                        field="qteSorties"
                        header="Qté Sorties"
                        style={{ width: '8%' }}
                        body={(d) => formatQte(d.qteSorties)}
                    />
                    <Column
                        field="montantSorties"
                        header="Montant Sorties"
                        style={{ width: '12%' }}
                        body={(d) => formatCurrency(d.montantSorties)}
                    />
                    <Column
                        field="qteStock"
                        header="Qté Stock"
                        style={{ width: '8%' }}
                        body={(d) => formatQte(d.qteStock)}
                    />

                    <Column
                        field="prixUnitaireStock"
                        header="PU stock"
                        style={{ width: '8%' }}
                        body={(d) => formatCurrency(d.prixUnitaireStock)}
                    />

                    <Column
                        field="montantStock"
                        header="Montant Stock"
                        style={{ width: '12%' }}
                        body={(d) => formatCurrency(d.montantStock)}
                    />
                </DataTable>
                <div className="mt-2 p-2 bg-blue-50 border-round">
                    <strong>Totaux Catégorie:</strong>{' '}
                    Initial: {formatCurrency(rowData.totalInitial)} |{' '}
                    Entrées: {formatCurrency(rowData.totalEntrees)} |{' '}
                    Sorties: {formatCurrency(rowData.totalSorties)} |{' '}
                    Stock: {formatCurrency(rowData.totalStock)}
                </div>
            </div>
        );
    };

    const PdfDownloadButton = () => {
        if (!searchParams || visibleGroups.length === 0) return null;

        return (
            <PDFDownloadLink
                document={
                    <RapportMouvementStockPdf
                        data={visibleGroups}
                        dateDebut={searchParams.dateDebut}
                        dateFin={searchParams.dateFin}
                    />
                }
                fileName={`rapport-mouvement-stock-${format(searchParams.dateDebut, 'yyyyMMdd')}-${format(searchParams.dateFin, 'yyyyMMdd')}.pdf`}
            >
                {({ loading: pdfLinkLoading, error }) => (
                    <PdfLinkContent
                        loading={pdfLinkLoading}
                        error={error}
                        onError={() => showToast('error', 'Erreur', 'Échec de génération du PDF')}
                    />
                )}
            </PDFDownloadLink>
        );
    };

    const dialogFooter = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Fermer"
                icon="pi pi-times"
                onClick={() => setVisibleDialog(false)}
                className="p-button-text"
            />
            <PdfDownloadButton />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <TabView>
                <TabPanel header="Générer Rapport">
                    <Card title="Rapport de Mouvement de Stock">
                        <RapportMouvementStockForm onSearch={fetchRapport} loading={loading} />
                    </Card>
                </TabPanel>
            </TabView>

            <Dialog
                header="Rapport de Mouvement de Stock"
                visible={visibleDialog}
                footer={dialogFooter}
                style={{ width: '98vw' }}
                onHide={() => setVisibleDialog(false)}
                maximizable
            >
                <div className="card">
                    <DataTable
                        value={visibleGroups}
                        loading={loading}
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data as DataTableExpandedRows)}
                        rowExpansionTemplate={categorieRowTemplate}
                        dataKey="categorieLibelle"
                    >
                        <Column expander style={{ width: '3em' }} />
                        <Column field="categorieLibelle" header="Sous-Catégorie" sortable />
                        <Column
                            field="totalInitial"
                            header="Total Initial"
                            body={(d) => formatCurrency(d.totalInitial)}
                            sortable
                        />
                        <Column
                            field="totalEntrees"
                            header="Total Entrées"
                            body={(d) => formatCurrency(d.totalEntrees)}
                            sortable
                        />
                        <Column
                            field="totalSorties"
                            header="Total Sorties"
                            body={(d) => formatCurrency(d.totalSorties)}
                            sortable
                        />
                        <Column
                            field="totalStock"
                            header="Total Stock"
                            body={(d) => formatCurrency(d.totalStock)}
                            sortable
                        />
                    </DataTable>
                </div>
            </Dialog>
        </>
    );
};

export default RapportMouvementStockPage;

const PdfLinkContent = ({
    loading,
    error,
    onError
}: {
    loading: boolean;
    error?: Error | null;
    onError: () => void;
}) => {
    useEffect(() => {
        if (error) {
            onError();
        }
    }, [error, onError]);

    if (error) {
        return (
            <Button
                label="Erreur PDF"
                icon="pi pi-exclamation-triangle"
                className="p-button-danger"
            />
        );
    }

    return (
        <Button
            label={loading ? 'Génération...' : 'Télécharger PDF'}
            icon="pi pi-download"
            loading={loading}
            className="p-button-success"
        />
    );
};
