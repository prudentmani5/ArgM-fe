import React from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { AyantDroit } from './AyantDroit';
import { ProgressSpinner } from 'primereact/progressspinner';

interface AyantDroitFormProps {
    ayantDroit: AyantDroit;
    employeeName: string;
    employeeFirstName?: string;
    employeeLastName?: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCalendarChange: (e: any) => void;
    handleDropDownSelect: (e: DropdownChangeEvent) => void;
    handleCheckboxChange: (e: any) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    searchLoading?: boolean;
    isEditMode?: boolean;
}

const AyantDroitForm: React.FC<AyantDroitFormProps> = ({
    ayantDroit,
    employeeName,
    employeeFirstName = '',
    employeeLastName = '',
    handleChange,
    handleCalendarChange,
    handleDropDownSelect,
    handleCheckboxChange,
    handleMatriculeBlur,
    searchLoading = false,
    isEditMode = false
}) => {
    const categorieOptions = [
        { label: 'Conjoint', value: 'Conjoint' },
        { label: 'Enfant', value: 'Enfant' }
    ];

    const parseDateString = (dateStr: string | undefined): Date | null => {
        if (!dateStr) return null;

        // Handle DD/MM/YYYY format
        if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }

        // Handle ISO 8601 format: yyyy-MM-ddTHH:mm:ss (our format)
        if (dateStr.includes('T')) {
            return new Date(dateStr);
        }

        // Handle backend format: yyyy-MM-dd HH:mm:ss
        if (dateStr.includes(' ') && dateStr.includes('-')) {
            const [datePart, timePart] = dateStr.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart ? timePart.split(':') : ['0', '0', '0'];
            return new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hours),
                parseInt(minutes),
                parseInt(seconds)
            );
        }

        // Handle standard ISO format as fallback
        return new Date(dateStr);
    };

    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                {/* Matricule and Employee Name */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="matriculeId">Matricule *</label>
                    <div className="p-inputgroup">
                        <InputText
                            id="matriculeId"
                            name="matriculeId"
                            value={ayantDroit.matriculeId || ''}
                            onChange={handleChange}
                            onBlur={(e) => handleMatriculeBlur && handleMatriculeBlur(e.target.value)}
                            disabled={isEditMode}
                            required
                        />
                        {searchLoading && <ProgressSpinner style={{ width: '30px', height: '30px' }} />}
                    </div>
                </div>

                {!isEditMode ? (
                    <>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="employeeName">Nom de l&apos;employé</label>
                            <InputText
                                id="employeeName"
                                value={employeeName || ''}
                                disabled
                                placeholder="Nom de l'employé"
                            />
                        </div>

                        {/* Categorie */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="categorie">Catégorie *</label>
                            <Dropdown
                                id="categorie"
                                name="categorie"
                                value={ayantDroit.categorie || ''}
                                options={categorieOptions}
                                onChange={handleDropDownSelect}
                                placeholder="Sélectionner une catégorie"
                                required
                            />
                        </div>

                        {/* Prise en Charge */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="priseEnCharge">Prise en Charge</label>
                            <div className="flex align-items-center mt-2">
                                <Checkbox
                                    inputId="priseEnCharge"
                                    name="priseEnCharge"
                                    checked={ayantDroit.priseEnCharge || false}
                                    onChange={handleCheckboxChange}
                                />
                                <label htmlFor="priseEnCharge" className="ml-2">
                                    {ayantDroit.priseEnCharge ? 'Oui' : 'Non'}
                                </label>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="employeeLastName">Nom de l&apos;employé</label>
                            <InputText
                                id="employeeLastName"
                                value={employeeLastName || ''}
                                disabled
                                placeholder="Nom"
                            />
                        </div>
                        <div className="field col-12 md:col-3">
                            <label htmlFor="employeeFirstName">Prénom de l&apos;employé</label>
                            <InputText
                                id="employeeFirstName"
                                value={employeeFirstName || ''}
                                disabled
                                placeholder="Prénom"
                            />
                        </div>

                        {/* Categorie */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="categorie">Catégorie *</label>
                            <Dropdown
                                id="categorie"
                                name="categorie"
                                value={ayantDroit.categorie || ''}
                                options={categorieOptions}
                                onChange={handleDropDownSelect}
                                placeholder="Sélectionner une catégorie"
                                required
                            />
                        </div>

                        {/* Prise en Charge */}
                        <div className="field col-12 md:col-3">
                            <label htmlFor="priseEnCharge">Prise en Charge</label>
                            <div className="flex align-items-center mt-2">
                                <Checkbox
                                    inputId="priseEnCharge"
                                    name="priseEnCharge"
                                    checked={ayantDroit.priseEnCharge || false}
                                    onChange={handleCheckboxChange}
                                />
                                <label htmlFor="priseEnCharge" className="ml-2">
                                    {ayantDroit.priseEnCharge ? 'Oui' : 'Non'}
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {/* Nom */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="nom">Nom *</label>
                    <InputText
                        id="nom"
                        name="nom"
                        value={ayantDroit.nom || ''}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Prenom */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="prenom">Prénom</label>
                    <InputText
                        id="prenom"
                        name="prenom"
                        value={ayantDroit.prenom || ''}
                        onChange={handleChange}
                    />
                </div>

                {/* Date de Naissance */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateNaissance">Date de Naissance *</label>
                    <Calendar
                        id="dateNaissance"
                        name="dateNaissance"
                        value={parseDateString(ayantDroit.dateNaissance)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="JJ/MM/AAAA"
                        required
                    />
                </div>

                {/* Date de Mariage - Show only for Conjoint */}
                {ayantDroit.categorie === 'Conjoint' && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateMariage">Date de Mariage <span className="text-red-500">*</span></label>
                        <Calendar
                            id="dateMariage"
                            name="dateMariage"
                            value={parseDateString(ayantDroit.dateMariage)}
                            onChange={handleCalendarChange}
                            showIcon
                            dateFormat="dd/mm/yy"
                            placeholder="JJ/MM/AAAA"
                            required
                        />
                    </div>
                )}

                {/* Date de Divorce - Show only for Conjoint */}
                {ayantDroit.categorie === 'Conjoint' && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="dateDivorce">Date de Divorce</label>
                        <Calendar
                            id="dateDivorce"
                            name="dateDivorce"
                            value={parseDateString(ayantDroit.dateDivorce)}
                            onChange={handleCalendarChange}
                            showIcon
                            dateFormat="dd/mm/yy"
                            placeholder="JJ/MM/AAAA"
                        />
                    </div>
                )}

                {/* Date de Deces */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="dateDeces">Date de Décès</label>
                    <Calendar
                        id="dateDeces"
                        name="dateDeces"
                        value={parseDateString(ayantDroit.dateDeces)}
                        onChange={handleCalendarChange}
                        showIcon
                        dateFormat="dd/mm/yy"
                        placeholder="JJ/MM/AAAA"
                    />
                </div>

                {/* Reference Extrait Acte de Naissance */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="refExtraitActeNaissance">Réf. Acte de Naissance</label>
                    <InputText
                        id="refExtraitActeNaissance"
                        name="refExtraitActeNaissance"
                        value={ayantDroit.refExtraitActeNaissance || ''}
                        onChange={handleChange}
                        maxLength={20}
                    />
                </div>

                {/* Reference Extrait Acte de Mariage - Show only for Conjoint */}
                {ayantDroit.categorie === 'Conjoint' && (
                    <div className="field col-12 md:col-3">
                        <label htmlFor="refExtraitActeMariage">Réf. Acte de Mariage</label>
                        <InputText
                            id="refExtraitActeMariage"
                            name="refExtraitActeMariage"
                            value={ayantDroit.refExtraitActeMariage || ''}
                            onChange={handleChange}
                            maxLength={20}
                        />
                    </div>
                )}

                {/* Reference Certificat de Deces */}
                <div className="field col-12 md:col-3">
                    <label htmlFor="refCertificatDeces">Réf. Certificat de Décès</label>
                    <InputText
                        id="refCertificatDeces"
                        name="refCertificatDeces"
                        value={ayantDroit.refCertificatDeces || ''}
                        onChange={handleChange}
                        maxLength={20}
                    />
                </div>
            </div>
        </div>
    );
};

export default AyantDroitForm;
