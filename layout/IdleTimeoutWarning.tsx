'use client';

import React from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

interface IdleTimeoutWarningProps {
    visible: boolean;
    remainingSeconds: number;
    onStayLoggedIn: () => void;
    onLogout: () => void;
}

const IdleTimeoutWarning: React.FC<IdleTimeoutWarningProps> = ({
    visible,
    remainingSeconds,
    onStayLoggedIn,
    onLogout
}) => {
    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Se déconnecter"
                icon="pi pi-sign-out"
                severity="secondary"
                outlined
                onClick={onLogout}
            />
            <Button
                label="Rester connecté"
                icon="pi pi-check"
                onClick={onStayLoggedIn}
                autoFocus
            />
        </div>
    );

    return (
        <Dialog
            visible={visible}
            onHide={onStayLoggedIn}
            header="Session inactive"
            footer={footer}
            modal
            closable={false}
            draggable={false}
            resizable={false}
            style={{ width: '400px' }}
        >
            <div className="flex flex-column align-items-center gap-3 py-3">
                <i
                    className="pi pi-clock"
                    style={{ fontSize: '3rem', color: 'var(--orange-500)' }}
                />
                <p className="text-center m-0" style={{ fontSize: '1rem' }}>
                    Votre session va expirer dans
                </p>
                <div
                    className="text-center font-bold"
                    style={{
                        fontSize: '2.5rem',
                        color: remainingSeconds <= 10 ? 'var(--red-500)' : 'var(--primary-color)'
                    }}
                >
                    {remainingSeconds}
                </div>
                <p className="text-center m-0" style={{ fontSize: '1rem' }}>
                    {remainingSeconds === 1 ? 'seconde' : 'secondes'}
                </p>
                <p className="text-center text-500 m-0" style={{ fontSize: '0.875rem' }}>
                    Cliquez sur &quot;Rester connecté&quot; pour continuer votre session.
                </p>
            </div>
        </Dialog>
    );
};

export default IdleTimeoutWarning;
