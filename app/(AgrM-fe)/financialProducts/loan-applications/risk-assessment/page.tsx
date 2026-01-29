'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
import { useSearchParams } from 'next/navigation';
import { LoanRiskAssessment } from './LoanRiskAssessment';
import { LoanRiskAssessmentForm } from './LoanRiskAssessmentForm';

export default function LoanRiskAssessmentPage() {
    const [assessment, setAssessment] = useState<LoanRiskAssessment | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const searchParams = useSearchParams();
    const applicationId = Number(searchParams.get('applicationId')) || 0;

    useEffect(() => {
        if (applicationId) {
            loadAssessment();
        }
    }, [applicationId]);

    const loadAssessment = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/financial-products/loan-applications/${applicationId}/risk-assessment/`);
            if (response.ok) {
                const data = await response.json();
                setAssessment(data);
            } else if (response.status === 404) {
                setAssessment(null);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec du chargement de risk assessment' });
        } finally {
            setLoading(false);
        }
    };

    const saveAssessment = async (assessmentData: LoanRiskAssessment) => {
        try {
            const url = assessmentData.id
                ? `/api/financial-products/loan-applications/${applicationId}/risk-assessment/${assessmentData.id}/`
                : `/api/financial-products/loan-applications/${applicationId}/risk-assessment/`;

            const response = await fetch(url, {
                method: assessmentData.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assessmentData)
            });

            if (response.ok) {
                toast.current?.show({ severity: 'success', summary: 'Succès', detail: 'Risk assessment saved successfully' });
                setShowForm(false);
                loadAssessment();
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Erreur', detail: 'Échec de la sauvegarde de risk assessment' });
        }
    };

    const getRiskLevelTag = (score: number) => {
        if (score >= 350) {
            return <Tag value="Low Risk" severity="success" />;
        } else if (score >= 200) {
            return <Tag value="Medium Risk" severity="warning" />;
        } else {
            return <Tag value="High Risk" severity="danger" />;
        }
    };

    const getRadarChartData = () => {
        if (!assessment) return {};

        return {
            labels: ['Character', 'Capacity', 'Capital', 'Collateral', 'Conditions'],
            datasets: [
                {
                    label: '5C Risk Scores',
                    data: [
                        assessment.characterScore,
                        assessment.capacityScore,
                        assessment.capitalScore,
                        assessment.collateralScore,
                        assessment.conditionsScore
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
                }
            ]
        };
    };

    const radarChartOptions = {
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const
            }
        }
    };

    if (loading) {
        return (
            <div className="card">
                <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                </div>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div className="card">
                <Toast ref={toast} />
                <div className="text-center p-5">
                    <i className="pi pi-shield text-6xl text-gray-400 mb-4"></i>
                    <h3>No Risk Assessment Available</h3>
                    <p className="text-gray-600 mb-4">
                        Create a risk assessment using the 5 C's of credit analysis
                    </p>
                    <Button
                        label="Create Assessment"
                        icon="pi pi-plus-circle"
                        onClick={() => setShowForm(true)}
                    />
                </div>

                <LoanRiskAssessmentForm
                    visible={showForm}
                    assessment={undefined}
                    applicationId={applicationId}
                    onHide={() => setShowForm(false)}
                    onSave={saveAssessment}
                />
            </div>
        );
    }

    return (
        <div className="card">
            <Toast ref={toast} />

            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4">
                <h3>Loan Risk Assessment (Application #{applicationId})</h3>
                <Button
                    label="Edit Assessment"
                    icon="pi pi-pencil"
                    onClick={() => setShowForm(true)}
                />
            </div>

            {/* Total Risk Score Card */}
            <Card title="Overall Risk Score" className="mb-3">
                <div className="p-3 bg-blue-50 border-round">
                    <div className="flex justify-content-between align-items-center mb-3">
                        <span className="text-xl font-semibold">Total Risk Score:</span>
                        <div className="flex align-items-center gap-3">
                            <span className="text-3xl font-bold text-blue-700">
                                {assessment.totalRiskScore} / 500
                            </span>
                            {getRiskLevelTag(assessment.totalRiskScore)}
                        </div>
                    </div>
                    <ProgressBar
                        value={(assessment.totalRiskScore / 500) * 100}
                        showValue={false}
                        style={{ height: '16px' }}
                    />
                    <div className="flex justify-content-between mt-2">
                        <small className="text-red-600 font-semibold">High Risk (0-200)</small>
                        <small className="text-orange-600 font-semibold">Medium Risk (200-350)</small>
                        <small className="text-green-600 font-semibold">Low Risk (350-500)</small>
                    </div>
                </div>
                {assessment.riskLevel && (
                    <div className="mt-3">
                        <span className="font-semibold">Risk Level Classification: </span>
                        <Tag value={assessment.riskLevel.name} severity="info" />
                    </div>
                )}
            </Card>

            {/* 5C Scores Grid */}
            <div className="grid mb-3">
                <div className="col-12 lg:col-6">
                    <Card title="The 5 C's Breakdown">
                        <div className="mb-3">
                            <div className="flex justify-content-between mb-2">
                                <span className="font-semibold">1. Character</span>
                                <span className="text-lg font-bold">{assessment.characterScore} / 100</span>
                            </div>
                            <ProgressBar value={assessment.characterScore} showValue={false} style={{ height: '10px' }} />
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-content-between mb-2">
                                <span className="font-semibold">2. Capacity</span>
                                <span className="text-lg font-bold">{assessment.capacityScore} / 100</span>
                            </div>
                            <ProgressBar value={assessment.capacityScore} showValue={false} style={{ height: '10px' }} />
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-content-between mb-2">
                                <span className="font-semibold">3. Capital</span>
                                <span className="text-lg font-bold">{assessment.capitalScore} / 100</span>
                            </div>
                            <ProgressBar value={assessment.capitalScore} showValue={false} style={{ height: '10px' }} />
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-content-between mb-2">
                                <span className="font-semibold">4. Collateral</span>
                                <span className="text-lg font-bold">{assessment.collateralScore} / 100</span>
                            </div>
                            <ProgressBar value={assessment.collateralScore} showValue={false} style={{ height: '10px' }} />
                        </div>

                        <div className="mb-3">
                            <div className="flex justify-content-between mb-2">
                                <span className="font-semibold">5. Conditions</span>
                                <span className="text-lg font-bold">{assessment.conditionsScore} / 100</span>
                            </div>
                            <ProgressBar value={assessment.conditionsScore} showValue={false} style={{ height: '10px' }} />
                        </div>
                    </Card>
                </div>

                <div className="col-12 lg:col-6">
                    <Card title="5C Risk Profile - Radar Chart">
                        <Chart type="radar" data={getRadarChartData()} options={radarChartOptions} />
                    </Card>
                </div>
            </div>

            {/* Assessment Notes */}
            {assessment.assessmentNotes && (
                <Card title="Assessment Notes" className="mb-3">
                    <div className="p-3 bg-gray-50 border-round">
                        <p className="m-0 text-gray-700 white-space-pre-wrap">{assessment.assessmentNotes}</p>
                    </div>
                </Card>
            )}

            {/* Assessment Metadata */}
            {assessment.assessedBy && (
                <div className="mt-3 text-gray-600">
                    <small>
                        Assessed by: {assessment.assessedBy.name} on {assessment.assessedAt ? new Date(assessment.assessedAt).toLocaleString() : 'N/A'}
                    </small>
                </div>
            )}

            <LoanRiskAssessmentForm
                visible={showForm}
                assessment={assessment}
                applicationId={applicationId}
                onHide={() => setShowForm(false)}
                onSave={saveAssessment}
            />
        </div>
    );
}
