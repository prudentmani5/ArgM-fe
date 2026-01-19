'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { ProgressSpinner } from 'primereact/progressspinner';
import Cookies from 'js-cookie';
import useConsumApi from '../../../../../../hooks/fetchData/useConsumApi';
import { PeriodePaie } from '../../periodePaie/PeriodePaie';
import { API_BASE_URL } from '@/utils/apiConfig';

const ListingIreRecapitulatifComponent = () => {
    const baseUrl = `${API_BASE_URL}`;
    const toast = useRef<Toast>(null);

    // State
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedPeriode, setSelectedPeriode] = useState<PeriodePaie | null>(null);
    const [periodes, setPeriodes] = useState<PeriodePaie[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingPeriodes, setLoadingPeriodes] = useState<boolean>(false);

    // API hooks
    const { data: periodesData, fetchData: fetchPeriodes } = useConsumApi('');

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

    const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
        toast.current?.show({
            severity: severity,
            summary: summary,
            detail: detail,
            life: 3000
        });
    };

    const handleDownloadExcel = async () => {
        if (!selectedPeriode) {
            showToast('warn', 'Validation', 'Veuillez selectionner une periode.');
            return;
        }

        setLoading(true);

        try {
            const token = Cookies.get('token');
            const response = await fetch(
                `${baseUrl}/api/grh/paie/listing-ire-recapitulatif/${selectedPeriode.periodeId}`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Erreur lors du telechargement');
            }

            // Get the blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Listing_IRE_Recapitulatif_${selectedPeriode.periodeId}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showToast('success', 'Succes', 'Fichier Excel telecharge avec succes.');
        } catch (error) {
            console.error('Download error:', error);
            showToast('error', 'Erreur', 'Impossible de telecharger le fichier Excel.');
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (mois: number): string => {
        const months = [
            'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
        ];
        return mois >= 1 && mois <= 12 ? months[mois - 1] : String(mois);
    };

    const periodeOptionTemplate = (option: PeriodePaie) => {
        return (
            <div className="flex align-items-center">
                <span>{getMonthName(option.mois)} / {option.annee}</span>
            </div>
        );
    };

    const selectedPeriodeTemplate = (option: PeriodePaie | null) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <span>{getMonthName(option.mois)} / {option.annee}</span>
                </div>
            );
        }
        return <span>Selectionner une periode</span>;
    };

    return (
        <>
            <Toast ref={toast} />

            <div className="card">
                <h5>Listing IRE Recapitulatif - Declaration Detaillee de l'Impot sur les Revenues d'Emploi</h5>
                <p className="text-500 mb-4">
                    Ce rapport genere un fichier Excel contenant le recapitulatif detaille de l'IRE pour la periode selectionnee.
                </p>

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
                            placeholder="Selectionner une periode"
                            className="w-full"
                            loading={loadingPeriodes}
                            filter
                            showClear
                        />
                    </div>
                    <div className="field col-12 md:col-3 flex align-items-end">
                        <Button
                            icon="pi pi-file-excel"
                            label="Telecharger Excel"
                            onClick={handleDownloadExcel}
                            loading={loading}
                            severity="success"
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-content-center align-items-center p-5">
                        <ProgressSpinner />
                        <span className="ml-3">Generation du fichier Excel en cours...</span>
                    </div>
                )}

                {/* Info Section */}
                <div className="surface-100 p-4 border-round">
                    <h6 className="mt-0 mb-3">Colonnes du rapport Excel:</h6>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <ul className="list-none p-0 m-0">
                                <li className="mb-2"><strong>N</strong> - Numero de ligne</li>
                                <li className="mb-2"><strong>Matr</strong> - Matricule de l'employe</li>
                                <li className="mb-2"><strong>NomPrenom</strong> - Nom complet</li>
                                <li className="mb-2"><strong>Base</strong> - Salaire de base</li>
                                <li className="mb-2"><strong>Logement</strong> - Indemnite de logement</li>
                                <li className="mb-2"><strong>AllocFam</strong> - Allocations familiales</li>
                                <li className="mb-2"><strong>Deplacement</strong> - Indemnite de deplacement</li>
                                <li className="mb-2"><strong>Autres ind+Prime</strong> - Autres indemnites et primes</li>
                            </ul>
                        </div>
                        <div className="col-12 md:col-6">
                            <ul className="list-none p-0 m-0">
                                <li className="mb-2"><strong>Rappel</strong> - Rappels de salaire</li>
                                <li className="mb-2"><strong>Brut</strong> - Salaire brut</li>
                                <li className="mb-2"><strong>INSS</strong> - Cotisation INSS personnelle</li>
                                <li className="mb-2"><strong>Tot Pension</strong> - Total cotisations pension</li>
                                <li className="mb-2"><strong>Base Imposable</strong> - Base imposable</li>
                                <li className="mb-2"><strong>IRE</strong> - Impot sur les revenues d'emploi</li>
                                <li className="mb-2"><strong>Autres Ret</strong> - Autres retenues</li>
                                <li className="mb-2"><strong>Net</strong> - Salaire net</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListingIreRecapitulatifComponent;
