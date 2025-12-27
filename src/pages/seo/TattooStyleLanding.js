/**
 * Landing Page SEO pour les styles de tatouage
 * Pages dédiées au référencement local Nancy
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { apiBase } from '../../lib/api';
import Layout from '../../layouts/Layout';
import SEO from '../../components/SEO';
import styles from './TattooStyleLanding.module.scss';

// Configuration SEO par style
const STYLE_CONFIG = {
    japonais: {
        title: "Tatouage Japonais Nancy | Tatoueur Spécialisé Style Japonais - Mystic Tattoo",
        h1: "Tatouage Japonais à Nancy",
        description: "Spécialiste du tatouage japonais à Nancy. Dragons, carpes koï, fleurs de cerisier, samouraïs. Tatoueur expert en style traditionnel japonais. Devis gratuit.",
        keywords: "tatouage japonais nancy, tatoueur japonais nancy, irezumi nancy, dragon japonais tatouage, carpe koi tatouage nancy, tatouage oriental nancy, style japonais nancy",
        intro: "Le tatouage japonais, ou Irezumi, est un art ancestral riche en symbolisme. Chez Mystic Tattoo à Nancy, nous maîtrisons les codes traditionnels du tatouage japonais pour créer des œuvres authentiques et personnalisées.",
        features: [
            { title: "Dragons", desc: "Symbole de force, sagesse et protection dans la tradition japonaise" },
            { title: "Carpes Koï", desc: "Représentent la persévérance, le courage et la détermination" },
            { title: "Fleurs de cerisier", desc: "Sakura, symbole de beauté éphémère et renouveau" },
            { title: "Masques Oni & Hannya", desc: "Esprits protecteurs de la mythologie japonaise" }
        ],
        faq: [
            { q: "Combien coûte un tatouage japonais à Nancy ?", a: "Le prix dépend de la taille et de la complexité. Une pièce japonaise commence autour de 150€ pour un petit motif, jusqu'à plusieurs séances pour une grande pièce (manchette, dos complet). Devis gratuit sur rendez-vous." },
            { q: "Combien de temps pour un tatouage japonais ?", a: "Un petit motif prend 2-3h. Une manchette complète nécessite 3-5 séances de 4h. Un dos complet peut demander 8-12 séances." },
            { q: "Quels sont les motifs japonais traditionnels ?", a: "Dragons, carpes koï (courage), fleurs de cerisier (beauté éphémère), vagues, pivoines, masques Oni/Hannya, tigres, phénix, et motifs de fond traditionnels." }
        ]
    },
    realiste: {
        title: "Tatouage Réaliste Nancy | Portrait & Réalisme - Mystic Tattoo",
        h1: "Tatouage Réaliste à Nancy",
        description: "Expert en tatouage réaliste et portrait à Nancy. Photos, visages, animaux réalistes. Technique hyperréaliste pour des tatouages saisissants de vérité.",
        keywords: "tatouage realiste nancy, tatoueur realiste nancy, portrait tatouage nancy, tatouage photo nancy, tatouage hyperrealiste nancy, tatouage animal realiste nancy",
        intro: "Le tatouage réaliste requiert une maîtrise technique exceptionnelle pour reproduire fidèlement photos, portraits et scènes de vie. Notre tatoueur à Nancy excelle dans l'art du réalisme pour immortaliser vos souvenirs sur votre peau.",
        features: [
            { title: "Portraits", desc: "Reproduction fidèle de visages, proches ou personnalités" },
            { title: "Animaux", desc: "Compagnons à quatre pattes immortalisés avec précision" },
            { title: "Nature", desc: "Paysages, fleurs et éléments naturels hyperréalistes" },
            { title: "Objets", desc: "Montres, bijoux, instruments avec effet 3D" }
        ],
        faq: [
            { q: "Comment préparer une photo pour un tatouage portrait ?", a: "Fournissez une photo haute résolution, bien éclairée, avec un visage net. Plusieurs angles aident à capturer l'essence du portrait." },
            { q: "Le tatouage réaliste vieillit-il bien ?", a: "Avec un bon entretien et une protection solaire, un tatouage réaliste reste beau pendant des décennies. Les retouches sont possibles après quelques années." },
            { q: "Quelle taille minimum pour un portrait réaliste ?", a: "Pour un portrait détaillé, comptez minimum 15cm de hauteur. Plus le tatouage est grand, plus les détails seront précis et durables." }
        ]
    },
    blackwork: {
        title: "Tatouage Blackwork Nancy | Noir Intense & Géométrique - Mystic Tattoo",
        h1: "Tatouage Blackwork à Nancy",
        description: "Tatoueur blackwork à Nancy. Noir intense, motifs géométriques, dotwork, tribal contemporain. Art du noir absolu pour des tatouages puissants.",
        keywords: "tatouage blackwork nancy, tatoueur blackwork nancy, tatouage noir nancy, dotwork nancy, tatouage geometrique noir nancy, blackout tatouage nancy",
        intro: "Le Blackwork est l'art du noir absolu. Des motifs géométriques aux larges aplats d'encre, ce style audacieux crée des tatouages d'une intensité visuelle remarquable. À Nancy, Mystic Tattoo maîtrise toutes les techniques du blackwork.",
        features: [
            { title: "Géométrique", desc: "Formes précises, symétrie parfaite, motifs hypnotiques" },
            { title: "Dotwork", desc: "Technique pointilliste pour dégradés et textures uniques" },
            { title: "Tribal moderne", desc: "Réinterprétation contemporaine des motifs tribaux" },
            { title: "Blackout", desc: "Larges zones de noir intense pour un impact maximal" }
        ],
        faq: [
            { q: "Le blackwork fait-il plus mal qu'un autre style ?", a: "Les larges aplats de noir peuvent être plus intenses car ils nécessitent plusieurs passages. Cependant, la douleur reste subjective et gérable." },
            { q: "Peut-on couvrir un ancien tatouage en blackwork ?", a: "Oui, le blackwork est excellent pour les cover-ups grâce à sa densité d'encre. Consultation gratuite pour évaluer les possibilités." },
            { q: "Comment vieillit le blackwork ?", a: "Le noir est le pigment le plus stable. Un blackwork bien réalisé reste intense pendant des décennies avec un entretien minimal." }
        ]
    },
    graphique: {
        title: "Tatouage Graphique Nancy | Style Artistique & Moderne - Mystic Tattoo",
        h1: "Tatouage Graphique à Nancy",
        description: "Tatoueur style graphique à Nancy. Aquarelle, abstrait, géométrique, brush strokes. Créations artistiques uniques et contemporaines.",
        keywords: "tatouage graphique nancy, tatoueur graphique nancy, tatouage aquarelle nancy, tatouage abstrait nancy, tatouage artistique nancy, tatouage moderne nancy",
        intro: "Le tatouage graphique repousse les limites de l'art corporel. Mélangeant techniques d'illustration, aquarelle et abstraction, ce style permet des créations véritablement uniques. Chez Mystic Tattoo Nancy, nous créons des œuvres d'art sur mesure.",
        features: [
            { title: "Aquarelle", desc: "Effets de peinture fluide, couleurs vibrantes et fondues" },
            { title: "Abstrait", desc: "Compositions uniques, formes libres et expressives" },
            { title: "Brush strokes", desc: "Coups de pinceau dynamiques, style illustration" },
            { title: "Mixed media", desc: "Fusion de styles pour des pièces originales" }
        ],
        faq: [
            { q: "Les tatouages aquarelle tiennent-ils bien ?", a: "Avec les techniques modernes et des encres de qualité, les tatouages aquarelle tiennent très bien. Un léger rafraîchissement peut être utile après 5-10 ans." },
            { q: "Peut-on mélanger graphique et réaliste ?", a: "Absolument ! Les mélanges de styles sont notre spécialité. Nous créons des pièces hybrides uniques selon vos envies." },
            { q: "Comment créer un design graphique personnalisé ?", a: "Lors de la consultation, partagez vos inspirations, couleurs préférées et concepts. Nous dessinons un design unique pour vous." }
        ]
    },
    minimaliste: {
        title: "Tatouage Minimaliste Nancy | Fine Line & Discret - Mystic Tattoo",
        h1: "Tatouage Minimaliste à Nancy",
        description: "Tatoueur minimaliste à Nancy. Fine line, micro tatouage, designs épurés et discrets. Élégance et simplicité pour des tatouages raffinés.",
        keywords: "tatouage minimaliste nancy, tatoueur minimaliste nancy, fine line nancy, micro tatouage nancy, tatouage discret nancy, petit tatouage nancy, tatouage fin nancy",
        intro: "Le minimalisme en tatouage célèbre l'élégance de la simplicité. Lignes fines, designs épurés et motifs discrets créent des tatouages raffinés et intemporels. Mystic Tattoo à Nancy excelle dans l'art du 'less is more'.",
        features: [
            { title: "Fine line", desc: "Lignes ultra-fines pour des designs délicats" },
            { title: "Micro tatouage", desc: "Petits motifs précis, parfaits pour une première expérience" },
            { title: "Single needle", desc: "Technique une aiguille pour une finesse maximale" },
            { title: "Symboles", desc: "Designs significatifs, épurés et intemporels" }
        ],
        faq: [
            { q: "Un tatouage minimaliste fait-il moins mal ?", a: "Généralement oui, car les séances sont plus courtes et les zones travaillées plus petites. C'est idéal pour un premier tatouage." },
            { q: "Les lignes fines s'estompent-elles vite ?", a: "Avec un bon tatoueur et des soins appropriés, les fine lines restent nettes. Une retouche légère peut être nécessaire après plusieurs années." },
            { q: "Quelle taille minimum pour un tatouage minimaliste ?", a: "On peut réaliser des tatouages de 1-2cm, mais certains détails nécessitent une taille minimum pour rester lisibles dans le temps." }
        ]
    },
    oldschool: {
        title: "Tatouage Old School Nancy | Traditional Américain - Mystic Tattoo",
        h1: "Tatouage Old School à Nancy",
        description: "Tatoueur old school à Nancy. Style traditionnel américain, couleurs vives, contours épais. Ancres, roses, pin-ups, hirondelles authentiques.",
        keywords: "tatouage oldschool nancy, tatoueur old school nancy, tatouage traditionnel nancy, traditional tattoo nancy, tatouage americain nancy, tatouage vintage nancy",
        intro: "Le Old School, ou Traditional Américain, est le style qui a défini le tatouage moderne. Contours noirs épais, couleurs primaires vives et motifs iconiques : ancres, roses, aigles et pin-ups. Mystic Tattoo perpétue cette tradition à Nancy.",
        features: [
            { title: "Ancres & Nautique", desc: "Symboles marins traditionnels, heritage des marins" },
            { title: "Roses & Cœurs", desc: "Motifs romantiques classiques aux couleurs vives" },
            { title: "Hirondelles", desc: "Symbole de voyage, liberté et retour au foyer" },
            { title: "Pin-ups", desc: "Figures féminines iconiques du style américain" }
        ],
        faq: [
            { q: "Pourquoi choisir un tatouage old school ?", a: "Le style old school est intemporel, vieillit extrêmement bien grâce aux contours épais, et possède une esthétique immédiatement reconnaissable." },
            { q: "Les couleurs old school sont-elles vives ?", a: "Oui ! Les couleurs primaires (rouge, jaune, bleu, vert) utilisées en traditional sont les plus stables et restent vives pendant des décennies." },
            { q: "Peut-on personnaliser un motif old school ?", a: "Absolument ! Nous adaptons les motifs traditionnels à vos souhaits tout en respectant les codes du style." }
        ]
    }
};

const TattooStyleLanding = ({ styleKey }) => {
    const navigate = useNavigate();
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const config = STYLE_CONFIG[styleKey];

    if (!config) {
        return <Layout><div>Style non trouvé</div></Layout>;
    }

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await api.get(`/media?style=${styleKey}&limit=6`);
                setPreviewImages(res.data.slice(0, 6));
            } catch (err) {
                console.error('Erreur chargement aperçu:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchImages();
    }, [styleKey]);

    const schemaOrg = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": `Tatouage ${styleKey}`,
        "provider": {
            "@type": "TattooParlor",
            "name": "Mystic Tattoo",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "19 Boulevard Jean Jaurès",
                "addressLocality": "Nancy",
                "postalCode": "54000",
                "addressCountry": "FR"
            },
            "telephone": "+33688862646",
            "priceRange": "€€"
        },
        "areaServed": {
            "@type": "City",
            "name": "Nancy"
        },
        "description": config.description
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": config.faq.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };

    return (
        <Layout>
            <SEO
                title={config.title}
                description={config.description}
                keywords={config.keywords}
                url={`https://www.mystic-tattoo.fr/tatouage-${styleKey}-nancy`}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            <div className={styles.landing}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <h1>{config.h1}</h1>
                    <p className={styles.intro}>{config.intro}</p>
                    <div className={styles.cta}>
                        <Link to="/reservation" className={styles.ctaPrimary}>
                            Prendre rendez-vous
                        </Link>
                        <Link to={`/gallery/${styleKey}`} className={styles.ctaSecondary}>
                            Voir la galerie complète
                        </Link>
                    </div>
                </section>

                {/* Preview Gallery */}
                <section className={styles.preview}>
                    <h2>Nos réalisations {styleKey}</h2>
                    {loading ? (
                        <div className={styles.loading}>Chargement...</div>
                    ) : (
                        <div className={styles.previewGrid}>
                            {previewImages.map((img, idx) => (
                                <div key={idx} className={styles.previewItem}>
                                    <img
                                        src={img.cloudinaryUrl || `${apiBase}${img.path}`}
                                        alt={`Tatouage ${styleKey} Nancy - Exemple ${idx + 1}`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    <Link to={`/gallery/${styleKey}`} className={styles.viewAll}>
                        Voir toute la galerie {styleKey} →
                    </Link>
                </section>

                {/* Features */}
                <section className={styles.features}>
                    <h2>Nos spécialités {styleKey}</h2>
                    <div className={styles.featuresGrid}>
                        {config.features.map((feature, idx) => (
                            <div key={idx} className={styles.featureCard}>
                                <h3>{feature.title}</h3>
                                <p>{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className={styles.faq}>
                    <h2>Questions fréquentes - Tatouage {styleKey} Nancy</h2>
                    <div className={styles.faqList}>
                        {config.faq.map((item, idx) => (
                            <details key={idx} className={styles.faqItem}>
                                <summary>{item.q}</summary>
                                <p>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* CTA Final */}
                <section className={styles.ctaSection}>
                    <h2>Prêt pour votre tatouage {styleKey} ?</h2>
                    <p>
                        Contactez Mystic Tattoo à Nancy pour discuter de votre projet.
                        Consultation et devis gratuits.
                    </p>
                    <div className={styles.ctaButtons}>
                        <Link to="/reservation" className={styles.ctaPrimary}>
                            Réserver ma séance
                        </Link>
                        <Link to="/contact" className={styles.ctaSecondary}>
                            Nous contacter
                        </Link>
                    </div>
                    <p className={styles.address}>
                        📍 19 Boulevard Jean Jaurès, 54000 Nancy<br />
                        📞 06 88 86 26 46
                    </p>
                </section>
            </div>
        </Layout>
    );
};

export default TattooStyleLanding;
