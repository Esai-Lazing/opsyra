import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = title ? `${title} - Opsyra` : 'Opsyra';
        
        return () => {
            document.title = previousTitle;
        };
    }, [title]);
};

