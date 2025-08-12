import styles from './Investors.module.css';
import blockTower from './logos/blocktower.svg';
import janeStreet from './logos/janeStreet.svg';
import circle from './logos/circle.svg';
import tensai from './logos/tensai.svg';
import naval from './logos/naval.svg';
import susa from './logos/susa.svg';
import quantStamp from './logos/quantstamp.svg';
import hypotenuse from './logos/hypotenuse.svg';
import julianKoh from './logos/julianKoh.svg';
import donSun from './logos/donSun.svg';
import lllvvuu from './logos/lllvvuu.svg';
import dogetoshi from './logos/dogetoshi.svg';
import positiveSum from './logos/positivesum.svg';
import motivate from './logos/motivate.svg';
import yunt from './logos/yunt.svg';
import afkbyte from './logos/afkbyte.svg';
import jaiPrasad from './logos/jaiPrasad.svg';

export default function Investors() {
    const investorsData = [
        { label: 'Blocktower', logo: blockTower },
        { label: 'Jane Street', logo: janeStreet },
        { label: 'Circle', logo: circle },
        { label: 'Tensai Capital', logo: tensai },
        { label: 'Naval Ravikant', logo: naval },
        { label: 'Yunt Capital', logo: yunt },
        { label: 'Susa Ventures', logo: susa },
        { label: 'Quantstamp', logo: quantStamp },
        { label: 'Hypotenuse Labs', logo: hypotenuse },
        { label: 'Julian Koh', logo: julianKoh },
        { label: 'Don Sun', logo: donSun },
        { label: 'lllvvuu', logo: lllvvuu },
        { label: 'Dogetoshi', logo: dogetoshi },
        { label: 'afkbyte', logo: afkbyte },
        { label: 'Jai Prasad', logo: jaiPrasad },
        { label: 'Positive Sum', logo: positiveSum },
        { label: 'Motivate Venture Capital', logo: motivate },
    ];

    return (
        <div className={`${styles.sub_container} ${styles.smaller_gap}`}>
            <h2>Backed by the best</h2>
            <div className={styles.investors_container}>
                {investorsData.map((data, idx) => (
                    <img
                        src={data.logo}
                        alt={`Logo for ${data.label}`}
                        key={data.label + idx}
                    />
                ))}
            </div>
        </div>
    );
}
