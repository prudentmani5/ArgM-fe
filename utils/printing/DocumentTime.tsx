'use client'

import moment from "moment";

const DateTimeArea = ({ dateTime }: { dateTime: Date }) => (
    <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '12px' }}>
        Imprimé le: {moment(dateTime).format('DD/MM/YYYY HH:mm')}
    </div>
);

export default DateTimeArea;