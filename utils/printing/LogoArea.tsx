'use client'

const LogoArea = ({ logoUrl }: { logoUrl: string }) => (

    <div className="col-12">
        <div className="grid">
            <div className="col-4">
                <img src={logoUrl} alt="Logo" style={{ width: '100px', height: 'auto' }} />
            </div>
            <div className="col-8">
                <h1 style={{ fontSize: '24px', margin: '0' }}>REÇU D'ENTRÉE RSP</h1>
            </div>
        </div>
    </div>

);

export default LogoArea;

