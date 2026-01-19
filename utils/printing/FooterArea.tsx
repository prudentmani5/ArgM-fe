'use client'

const FooterArea = ({ line1, line2 }: { line1: string; line2: string }) => (
    <>
        <div style={{ fontSize: '8px', textAlign: 'center', marginTop: '5px' }}>
            <div>{line1}</div>
        </div>
        <div style={{ fontSize: '8px', textAlign: 'center', marginTop: '2px' }}>
            <div>{line2}</div>
        </div>
    </>
);

export default FooterArea;