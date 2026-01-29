'use client';

import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { EmployeeAttendancyMapping } from './EmployeeAttendancyMapping';

interface EmployeeAttendancyMappingFormProps {
    mapping: EmployeeAttendancyMapping;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNumberChange: (field: string, value: number | null) => void;
    handleCheckboxChange: (field: string, checked: boolean) => void;
    handleMatriculeBlur?: (matriculeId: string) => void;
    isEditMode?: boolean;
    searchLoading?: boolean;
}

const EmployeeAttendancyMappingForm = ({
    mapping,
    handleChange,
    handleNumberChange,
    handleCheckboxChange,
    handleMatriculeBlur,
    isEditMode = false,
    searchLoading = false
}: EmployeeAttendancyMappingFormProps) => {
    return (
        <div className='card p-fluid'>
            <div className='formgrid grid'>
                {/* Matricule ID */}
                <div className='field col-12 md:col-4'>
                    <label htmlFor='matriculeId'>
                        Matricule ID <span className='text-red-500'>*</span>
                    </label>
                    <InputText
                        id='matriculeId'
                        name='matriculeId'
                        value={mapping.matriculeId}
                        onChange={handleChange}
                        onBlur={(e) => {
                            if (handleMatriculeBlur && e.target.value && !isEditMode) {
                                handleMatriculeBlur(e.target.value);
                            }
                        }}
                        disabled={isEditMode || searchLoading}
                        placeholder='Ex: EMP001'
                    />
                    {searchLoading && <small className="p-info">Recherche en cours...</small>}
                </div>

                {/* Display employee name if available */}
                {(mapping.lastName || mapping.firstName) && (
                    <>
                        <div className='field col-12 md:col-4'>
                            <label htmlFor='lastName'>Nom</label>
                            <InputText
                                id='lastName'
                                name='lastName'
                                value={mapping.lastName || ''}
                                readOnly
                                className="p-inputtext-readonly"
                            />
                        </div>

                        <div className='field col-12 md:col-4'>
                            <label htmlFor='firstName'>Prénom</label>
                            <InputText
                                id='firstName'
                                name='firstName'
                                value={mapping.firstName || ''}
                                readOnly
                                className="p-inputtext-readonly"
                            />
                        </div>
                    </>
                )}

                {/* User ID */}
                <div className='field col-12 md:col-4'>
                    <label htmlFor='userId'>
                        User ID (Système de Pointage) <span className='text-red-500'>*</span>
                    </label>
                    <InputNumber
                        id='userId'
                        name='userId'
                        value={mapping.userId}
                        onValueChange={(e) => handleNumberChange('userId', e.value)}
                        placeholder='ID du système de pointage'
                        useGrouping={false}
                    />
                </div>

                {/* Is Active */}
                {isEditMode && (
                    <div className='field col-12 md:col-6'>
                        <div className='flex align-items-center'>
                            <Checkbox
                                inputId='isActive'
                                name='isActive'
                                checked={mapping.isActive}
                                onChange={(e) => handleCheckboxChange('isActive', e.checked || false)}
                            />
                            <label htmlFor='isActive' className='ml-2'>
                                Actif
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeAttendancyMappingForm;
