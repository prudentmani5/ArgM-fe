'use client';

import { InputText } from "primereact/inputtext";
import EntretiensType from './EntretiensType'; 

interface EntretiensTypeProps {
    entretiensType: EntretiensType;
    handleChange: (e: any) => void;
}

const EntretiensTypeForm: React.FC<EntretiensTypeProps> = ({ 
    entretiensType, 
    handleChange
}) => {
    return (
        <div className="card p-fluid">
            <div className="formgrid grid">
                <div className="field col-12">
                    <label htmlFor="designation">Désignation*</label>
                    <InputText 
                        id="designation" 
                        type="text" 
                        name="designation" 
                        value={entretiensType.designation} 
                        onChange={handleChange} 
                        required
                    />
                </div>
            </div>
        </div>
    );
};

export default EntretiensTypeForm;