'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import {
    FondPensionComplementaireResponseDto,
    FondPensionComplementaireEmployeeDto,
    formatCurrency,
    getFullName
} from './FondPensionComplementaire';
import { API_BASE_URL } from '@/utils/apiConfig';

const FondPensionComplementaireComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [fpcData, setFpcData] = useState<FondPensionComplementaireResponseDto | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');
    const { data: fpcDataResponse, error: fpcError, fetchData: fetchFpc, callType } = useConsumApi('');
    const { data: pdfData, error: pdfError, fetchData: fetchPdf, callType: pdfCallType } = useConsumApi('');

    // Load periodes by year
    useEffect(() => {
        setLoadingPeriodes(true);
        setSelectedPeriode(null);
        fetchPeriodes(null, 'Get', `${baseUrl}/api/grh/paie/periods/year/${selectedYear}`, 'loadPeriodes');
    }, [selectedYear]);

    // Handle periodes response
    useEffect(() => {
        if (periodesData) {
            const data = Array.isArray(periodesData) ? periodesData : [periodesData];
            setPeriodes(data);
            setLoadingPeriodes(false);
        }
    }, [periodesData]);

    // Handle FPC data response
    useEffect(() => {
        if (fpcDataResponse && callType === 'loadFpc') {
            setFpcData(fpcDataResponse as FondPensionComplementaireResponseDto);
            setLoading(false);
        }

        if (fpcError && callType === 'loadFpc') {
            showToast('error', 'Erreur', 'Impossible de charger les donnees.');
            setFpcData(null);
            setLoading(false);
        }
    }, [fpcDataResponse, fpcError, callType]);

    // Handle PDF download response
    useEffect(() => {
        if (pdfData && pdfCallType === 'downloadPdf') {
            const blob = new Blob([pdfData], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `FPC_BHB_${selectedPeriode?.periodeId || 'report'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
            showToast('success', 'Succes', 'PDF telecharge avec succes.');
            setLoading(false);
        }

        if (pdfError && pdfCallType === 'downloadPdf') {
            showToast('error', 'Erreur', 'Impossible de telecharger le PDF.');
            setLoading(false);
        }
    }, [pdfData, pdfError, pdfCallType]);

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleLoadFpc = () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);

        // Download PDF from backend using authenticated request
        const pdfUrl = `${baseUrl}/api/grh/paie/fond-pension-complementaire/${selectedPeriode.periodeId}/pdf`;
        fetchPdf(null, 'GET', pdfUrl, 'downloadPdf', false, 'blob');

        // Also load data for display
        const dataUrl = `${baseUrl}/api/grh/paie/fond-pension-complementaire/${selectedPeriode.periodeId}`;
        fetchFpc(null, 'Get', dataUrl, 'loadFpc');
    };

    const getMonthName = (mois: number): string => {
        const months = [
            'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
        ];
        return mois >= 1 && mois <= 12 ? months[mois - 1] : String(mois);
    };

    const periodeOptionTemplate = (option: PeriodePaie) => (
        <span>{getMonthName(option.mois)} / {option.annee}</span>
    );

    const selectedPeriodeTemplate = (option: PeriodePaie | null) => {
        if (option) {
            return <span>{getMonthName(option.mois)} / {option.annee}</span>;
        }
        return <span>Selectionner une periode</span>;
    };

    // Get the BHB bank group (there's only one)
    const bankGroup = fpcData?.banqueGroups?.[0];

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Cotisation au Fonds de Pension Complementaire</h5>

                {/* Filter Section */}
                <div className="formgrid grid mb-4">
                    <div className="field col-12 md:col-2">
                        <label htmlFor="selectedYear">Exercice</label>
                        <InputNumber
                            id="selectedYear"
                            value={selectedYear}
                            onValueChange={(e) => setSelectedYear(e.value || new Date().getFullYear())}
                            useGrouping={false}
                            min={2020}
                            max={2100}
                            className="w-full"
                        />
                    </div>
                    <div className="field col-12 md:col-3">
                        <label htmlFor="periode">Periode</label>
                        <Dropdown
                            id="periode"
                            value={selectedPeriode}
                            options={periodes}
                            onChange={(e) => setSelectedPeriode(e.value)}
                            optionLabel="periodeId"
                            itemTemplate={periodeOptionTemplate}
                            valueTemplate={selectedPeriodeTemplate}
                            placeholder="Selectionner"
                            className="w-full"
                            loading={loadingPeriodes}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-4 flex align-items-end gap-2">
                        <Button
                            icon="pi pi-download"
                            label="Charger"
                            onClick={handleLoadFpc}
                            loading={loading}
                        />
                    </div>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-content-center align-items-center p-5">
                        <ProgressSpinner />
                    </div>
                )}

                {/* Report Display */}
                {!loading && fpcData && bankGroup && (
                    <div>
                        {/* Header Info */}
                        <div className="surface-100 p-3 border-round mb-4">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <div className="text-lg font-bold text-primary mb-2">
                                        {getMonthName(fpcData.mois)} {fpcData.annee}
                                    </div>
                                    <div className="text-sm mb-2">
                                        {fpcData.periodeLibelle}
                                    </div>
                                    <div className="font-bold">
                                        BANQUE: {bankGroup.sigleBanque}
                                    </div>
                                </div>
                                <div className="col-12 md:col-6 text-right">
                                    <div className="text-lg font-bold">
                                        {fpcData.grandTotalEmployeeCount} Employes
                                    </div>
                                    <div className="flex justify-content-end gap-4 mt-2">
                                        <span>FPC Pers: {formatCurrency(fpcData.grandTotalFpcPers)}</span>
                                        <span>FPC Patr: {formatCurrency(fpcData.grandTotalFpcPatr)}</span>
                                        <span className="text-xl font-bold text-green-700">
                                            Total: {formatCurrency(fpcData.grandTotalAmount)} BIF
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Employee Table */}
                        <DataTable
                            value={bankGroup.employees}
                            size="small"
                            stripedRows
                            paginator
                            rows={20}
                            rowsPerPageOptions={[10, 20, 50, 100]}
                            emptyMessage="Aucun employe"
                        >
                            <Column field="matriculeId" header="Matricule" style={{ width: '80px' }} sortable />
                            <Column field="compte" header="Compte" style={{ width: '150px' }} sortable />
                            <Column
                                header="Nom"
                                body={(row: FondPensionComplementaireEmployeeDto) => (
                                    <span className="text-red-700">{getFullName(row)}</span>
                                )}
                                sortable
                                sortField="nom"
                            />
                            <Column
                                header="FPC Pers"
                                body={(row: FondPensionComplementaireEmployeeDto) => formatCurrency(row.fpcPers)}
                                style={{ textAlign: 'right', width: '100px' }}
                                sortable
                                sortField="fpcPers"
                            />
                            <Column
                                header="FPC Patr"
                                body={(row: FondPensionComplementaireEmployeeDto) => formatCurrency(row.fpcPatr)}
                                style={{ textAlign: 'right', width: '100px' }}
                                sortable
                                sortField="fpcPatr"
                            />
                            <Column
                                header="Total"
                                body={(row: FondPensionComplementaireEmployeeDto) => (
                                    <span className="text-red-700 font-bold">{formatCurrency(row.total)}</span>
                                )}
                                style={{ textAlign: 'right', width: '100px' }}
                                sortable
                                sortField="total"
                            />
                        </DataTable>
                    </div>
                )}

                {/* No Data Message */}
                {!loading && fpcData && (!bankGroup || bankGroup.employees.length === 0) && (
                    <div className="text-center p-5 text-500">
                        <i className="pi pi-info-circle text-4xl mb-3"></i>
                        <p>Aucune donnee trouvee pour cette periode.</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default FondPensionComplementaireComponent;
