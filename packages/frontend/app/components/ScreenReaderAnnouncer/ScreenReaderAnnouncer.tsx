import React from 'react';

interface ScreenReaderAnnouncerProps {
    text: string;
}

export default function ScreenReaderAnnouncer({
    text,
}: ScreenReaderAnnouncerProps) {
    return (
        <div
            aria-live='assertive'
            aria-atomic='true'
            className='sr-only'
            style={{
                position: 'absolute',
                left: '-10000px',
                width: '1px',
                height: '1px',
                overflow: 'hidden',
            }}
        >
            {text}
        </div>
    );
}
