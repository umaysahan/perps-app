import { useEffect } from 'react';

export default function RuntimeDomManipulation() {
    // if want to enable spellcheck for a specific element, add the class spellcheck-enabled to the element
    useEffect(() => {
        const disableSpellcheck = (root: HTMLElement) => {
            const inputs = root.querySelectorAll('input, textarea');
            inputs.forEach((el) =>
                el.classList.contains('spellcheck-enabled')
                    ? el.setAttribute('spellcheck', 'true')
                    : el.setAttribute('spellcheck', 'false'),
            );
            inputs.forEach((el) => {
                el.setAttribute('autocomplete', 'off');
            });
        };

        // Initial run
        disableSpellcheck(document.body);

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node instanceof HTMLElement) {
                        disableSpellcheck(node);
                    }
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => observer.disconnect();
    }, []);

    return <></>;
}
