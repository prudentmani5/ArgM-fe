'use client'

const SeparatorArea = ({ color = '#000000' }: { color?: string }) => (
    <hr style={{ borderTop: `2px solid ${color}`, margin: '20px 0' }} />
);

export default SeparatorArea;