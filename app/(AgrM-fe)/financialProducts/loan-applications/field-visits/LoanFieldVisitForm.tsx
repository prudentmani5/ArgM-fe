'use client';

import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { LoanFieldVisit, VisitType, VisitTypeLabels } from './LoanFieldVisit';

interface LoanFieldVisitFormProps {
    visible: boolean;
    fieldVisit: LoanFieldVisit | null;
    applicationId?: number;
    onHide: () => void;
    onSave: (fieldVisit: LoanFieldVisit) => void;
}

interface User {
    id: number;
    name: string;
}

const LoanFieldVisitForm: React.FC<LoanFieldVisitFormProps> = ({
    visible,
    fieldVisit,
    applicationId,
    onHide,
    onSave
}) => {
    const toast = useRef<Toast>(null);
    const [formData, setFormData] = useState<LoanFieldVisit>({
        id: 0,
        applicationId: applicationId || 0,
        visitType: VisitType.HOME,
        visitDate: new Date(),
        locationAddress: '',
        latitude: null,
        longitude: null,
        findings: '',
        recommendation: '',
        conductedById: 0
    });

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [capturingGPS, setCapturingGPS] = useState(false);

    useEffect(() => {
        if (fieldVisit) {
            setFormData({
                ...fieldVisit,
                visitDate: fieldVisit.visitDate ? new Date(fieldVisit.visitDate) : new Date()
            });
        } else {
            setFormData({
                id: 0,
                applicationId: applicationId || 0,
                visitType: VisitType.HOME,
                visitDate: new Date(),
                locationAddress: '',
                latitude: null,
                longitude: null,
                findings: '',
                recommendation: '',
                conductedById: 0
            });
        }
    }, [fieldVisit, applicationId]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const captureGPS = () => {
        if (!navigator.geolocation) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Not Supported',
                detail: 'Geolocation not supported by browser',
                life: 3000
            });
            return;
        }

        setCapturingGPS(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                toast.current?.show({
                    severity: 'success',
                    summary: 'GPS Captured',
                    detail: 'Location captured successfully',
                    life: 3000
                });
                setCapturingGPS(false);
            },
            (error) => {
                toast.current?.show({
                    severity: 'error',
                    summary: 'GPS Error',
                    detail: `Failed to capture location: ${error.message}`,
                    life: 3000
                });
                setCapturingGPS(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    };

    const handleSubmit = () => {
        if (!formData.applicationId) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Application ID is required',
                life: 3000
            });
            return;
        }

        if (!formData.visitDate) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Visit date is required',
                life: 3000
            });
            return;
        }

        if (!formData.locationAddress.trim()) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Location address is required',
                life: 3000
            });
            return;
        }

        if (!formData.conductedById) {
            toast.current?.show({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Conducted by is required',
                life: 3000
            });
            return;
        }

        setLoading(true);
        onSave(formData);
    };

    const visitTypeOptions = Object.values(VisitType).map(type => ({
        label: VisitTypeLabels[type],
        value: type
    }));

    const dialogFooter = (
        <div>
            <Button
                label="Annuler"
                icon="pi pi-times"
                onClick={onHide}
                className="p-button-text"
                disabled={loading}
            />
            <Button
                label="Enregistrer"
                icon="pi pi-check"
                onClick={handleSubmit}
                disabled={loading}
                loading={loading}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                style={{ width: '800px' }}
                header={fieldVisit?.id ? 'Edit Field Visit' : 'New Field Visit'}
                modal
                className="p-fluid"
                footer={dialogFooter}
                onHide={onHide}
            >
                <div className="formgrid grid">
                    {/* Visit Type */}
                    <div className="field col-12 md:col-6">
                        <label htmlFor="visitType">Visit Type *</label>
                        <Dropdown
                            id="visitType"
                            value={formData.visitType}
                            options={visitTypeOptions}
                            onChange={(e) => setFormData({ ...formData, visitType: e.value })}
                            placeholder="Select visit type"
                        />
                    </div>

                    {/* Visit Date */}
                    <div className="field col-12 md:col-6">
                        <label htmlFor="visitDate">Visit Date *</label>
                        <Calendar
                            id="visitDate"
                            value={formData.visitDate}
                            onChange={(e) => setFormData({ ...formData, visitDate: e.value as Date })}
                            showIcon
                            dateFormat="yy-mm-dd"
                            maxDate={new Date()}
                        />
                    </div>

                    {/* Location Address */}
                    <div className="field col-12">
                        <label htmlFor="locationAddress">Location Address *</label>
                        <InputTextarea
                            id="locationAddress"
                            value={formData.locationAddress}
                            onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                            rows={3}
                            placeholder="Enter detailed location address"
                        />
                    </div>

                    <Divider align="left">
                        <span className="p-tag">GPS Coordinates</span>
                    </Divider>

                    {/* Latitude */}
                    <div className="field col-12 md:col-4">
                        <label htmlFor="latitude">Latitude</label>
                        <InputNumber
                            id="latitude"
                            value={formData.latitude}
                            onValueChange={(e) => setFormData({ ...formData, latitude: e.value })}
                            minFractionDigits={6}
                            maxFractionDigits={6}
                            suffix="°"
                            placeholder="0.000000"
                        />
                    </div>

                    {/* Longitude */}
                    <div className="field col-12 md:col-4">
                        <label htmlFor="longitude">Longitude</label>
                        <InputNumber
                            id="longitude"
                            value={formData.longitude}
                            onValueChange={(e) => setFormData({ ...formData, longitude: e.value })}
                            minFractionDigits={6}
                            maxFractionDigits={6}
                            suffix="°"
                            placeholder="0.000000"
                        />
                    </div>

                    {/* Capture GPS Button */}
                    <div className="field col-12 md:col-4 flex align-items-end">
                        <Button
                            label="Capturer GPS"
                            icon="pi pi-map-marker"
                            onClick={captureGPS}
                            loading={capturingGPS}
                            className="w-full"
                            type="button"
                        />
                    </div>

                    {/* Display Captured Coordinates */}
                    {formData.latitude && formData.longitude && (
                        <div className="field col-12">
                            <div className="p-3 bg-blue-50 border-round">
                                <i className="pi pi-info-circle mr-2"></i>
                                <span>
                                    Location: {formData.latitude.toFixed(6)}°, {formData.longitude.toFixed(6)}°
                                </span>
                            </div>
                        </div>
                    )}

                    <Divider />

                    {/* Findings */}
                    <div className="field col-12">
                        <label htmlFor="findings">Findings</label>
                        <InputTextarea
                            id="findings"
                            value={formData.findings}
                            onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                            rows={5}
                            placeholder="Enter detailed findings from the visit"
                        />
                    </div>

                    {/* Recommendation */}
                    <div className="field col-12">
                        <label htmlFor="recommendation">Recommendation</label>
                        <InputTextarea
                            id="recommendation"
                            value={formData.recommendation}
                            onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                            rows={3}
                            placeholder="Enter recommendations based on findings"
                        />
                    </div>

                    {/* Conducted By */}
                    <div className="field col-12">
                        <label htmlFor="conductedById">Conducted By *</label>
                        <Dropdown
                            id="conductedById"
                            value={formData.conductedById}
                            options={users}
                            onChange={(e) => setFormData({ ...formData, conductedById: e.value })}
                            optionLabel="name"
                            optionValue="id"
                            placeholder="Select user"
                            filter
                        />
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default LoanFieldVisitForm;
