'use client'

const TitleArea = ({ logoUrl, title, documentTime }: { logoUrl: string, title: string, documentTime: string }) => (

    <div className="col-12">
        <div className="grid">
            <div className="col-3">
                <img src={logoUrl} alt="Logo" style={{ width: '100px', height: 'auto' }} />
            </div>
            <div className="col-6">
                <h6 style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '80px',
                    fontSize: '12px',
                    borderBottom: '2px solid #000', // Strong, solid underline
                    marginBottom: '14px',           // Margin below the underline
                    paddingBottom: '4px'            // Space between text and underline
                }}>
                    {title}
                </h6>
            </div>
            
            <div className="col-3">
                <h6 style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    height: '80px',
                    fontSize: '12px',
                    borderBottom: '2px solid #000', // Strong, solid underline
                    marginBottom: '14px',           // Margin below the underline
                    paddingBottom: '4px'            // Space between text and underline
                }}>
                    {documentTime}
                </h6>
            </div>
        </div>
    </div>
);

export default TitleArea;