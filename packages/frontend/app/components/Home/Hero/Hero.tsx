import TradeButton from '../TradeButton/TradeButton';
import AnimatedPath from './AnimatedPath';
import styles from './Hero.module.css';

export default function Hero() {
    return (
        <div className={styles.hero_container}>
            {/* Animated Background with multiple layers for depth */}
            <div className={styles.animated_background}>
                {/* Primary animation layer */}
                <AnimatedPath
                    className={styles.animated_path_primary}
                    color1='#1E1E24'
                    color2='#7371FC'
                    color3='#CDC1FF'
                    beamLength={8}
                    skew={0.8}
                    strokeWidth='2'
                />
                {/* Secondary animation layer with different timing */}
                {/* <AnimatedPath
                    className={styles.animated_path_secondary}
                    color1='#2A2A35'
                    color2='#5B59E8'
                    color3='#A099FF'
                    beamLength={6}
                    skew={0.9}
                    strokeWidth='1.5'
                /> */}
                {/* Tertiary animation layer for extra depth */}
                {/* <AnimatedPath
                    className={styles.animated_path_tertiary}
                    color1='#0F0F13'
                    color2='#4543D9'
                    color3='#8B84F0'
                    beamLength={10}
                    skew={0.7}
                    strokeWidth='1'
                /> */}
            </div>

            {/* Hero Content */}
            <div className={styles.hero_heading}>
                <h2>
                    Zero-to-<span>One</span>{' '}
                </h2>
                <h2>Decentralized Trading Protocol</h2>
            </div>

            <p>
                Ambient is an entirely new kind of decentralized perp DEX
                combining unique DeFi native products with a user experience
                rivaling CEXes
            </p>
            <TradeButton />
        </div>
    );
}
