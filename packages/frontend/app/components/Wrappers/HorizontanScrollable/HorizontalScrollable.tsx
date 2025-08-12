import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './HorizontalScrollable.module.css';
import { motion } from 'framer-motion';

interface HorizontalScrollableProps {
    children: React.ReactNode;
    className?: string;
    maxWidth?: string;
    wrapperId?: string;
    excludes?: string[];
    offset?: number;
}

export function HorizontalScrollable(props: HorizontalScrollableProps) {
    const { children, className, maxWidth, wrapperId, excludes, offset } =
        props;

    const contentRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const scrollLeftBtnRef = useRef<HTMLButtonElement>(null);
    const scrollRightBtnRef = useRef<HTMLButtonElement>(null);

    const calculateMaxWidth = useCallback(() => {
        if (wrapperId && excludes && excludes.length > 0) {
            const wrapper = document.getElementById(wrapperId);
            if (wrapper) {
                const wrapperWidth = wrapper.getBoundingClientRect().width;
                let excludeSum = 0;

                excludes.forEach((exclude) => {
                    const excludeElement = document.getElementById(exclude);
                    if (excludeElement) {
                        excludeSum += parseFloat(
                            excludeElement
                                .getBoundingClientRect()
                                .width.toString(),
                        );
                    }
                });
                const maxWidth = wrapperWidth - excludeSum - (offset || 0);
                if (maxWidth && wrapperRef.current) {
                    wrapperRef.current.style.maxWidth = `${maxWidth}px`;
                }
            }
        }
    }, [wrapperId, excludes, offset]);

    useEffect(() => {
        if (wrapperId && excludes && excludes.length > 0) {
            calculateMaxWidth();
        }
        window.addEventListener('resize', calculateMaxWidth);
        return () => window.removeEventListener('resize', calculateMaxWidth);
    }, [calculateMaxWidth]);

    const checkScroll = () => {
        if (wrapperRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = wrapperRef.current;

            // Can scroll left if we're not at the beginning
            setCanScrollLeft(scrollLeft > 1);

            // Can scroll right if we're not at the end
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
        }
    };

    const scrollLeft = () => {
        setCanScrollLeft(false);
        setCanScrollRight(false);

        if (wrapperRef.current) {
            const { clientWidth } = wrapperRef.current;
            // Scroll half the width of the container
            wrapperRef.current.scrollBy({
                left: -clientWidth / 2,
                behavior: 'smooth',
            });

            setTimeout(() => {
                checkScroll();
            }, 350);
        }
    };

    const scrollRight = () => {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        if (wrapperRef.current) {
            const { clientWidth } = wrapperRef.current;
            // Scroll half the width of the container
            wrapperRef.current.scrollBy({
                left: clientWidth / 2,
                behavior: 'smooth',
            });

            setTimeout(() => {
                checkScroll();
            }, 350);
        }
    };

    const scrollLeftBtn = useCallback(() => {
        if (canScrollLeft) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <button
                        className={`${styles.scrollArrow} ${styles.scrollArrowLeft}`}
                        onClick={scrollLeft}
                        ref={scrollLeftBtnRef}
                        aria-label='Scroll tabs left'
                    >
                        <svg viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z' />
                        </svg>
                    </button>
                </motion.div>
            );
        }
        return null;
    }, [canScrollLeft]);

    const scrollRightBtn = useCallback(() => {
        if (canScrollRight) {
            return (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <button
                        className={`${styles.scrollArrow} ${styles.scrollArrowRight}`}
                        onClick={scrollRight}
                        ref={scrollRightBtnRef}
                        aria-label='Scroll tabs right'
                    >
                        <svg viewBox='0 0 24 24' fill='currentColor'>
                            <path d='M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z' />
                        </svg>
                    </button>
                </motion.div>
            );
        }
        return null;
    }, [canScrollRight]);

    useEffect(() => {
        checkScroll();

        const handleResize = () => {
            checkScroll();
        };

        window.addEventListener('resize', handleResize);

        // Initialize scroll state
        if (contentRef.current) {
            contentRef.current.addEventListener('scroll', checkScroll);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (contentRef.current) {
                contentRef.current.removeEventListener('scroll', checkScroll);
            }
        };
    }, []);

    useEffect(() => {
        checkScroll();
    }, [children]);

    return (
        <>
            <div style={{ position: 'relative' }}>
                <div className={styles.scrollButtonsWrapper}>
                    {scrollLeftBtn()}
                    {scrollRightBtn()}
                </div>
                <div
                    ref={wrapperRef}
                    className={`${styles.horizontalScrollable} ${className}`}
                    style={{ ...(maxWidth && { maxWidth }) }}
                >
                    <div
                        className={styles.horizontalScrollableContent}
                        ref={contentRef}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
