import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const LegalContent = ({ type }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '120px 24px 60px',
    color: '#fefff4',
    lineHeight: '1.6'
  };

  const titleStyle = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '2.5rem',
    marginBottom: '32px',
    color: '#ffff80'
  };

  const h2Style = {
    fontFamily: "'Playfair Display', serif",
    fontSize: '1.5rem',
    marginTop: '32px',
    marginBottom: '16px',
    color: '#fefff4'
  };

  const pStyle = {
    marginBottom: '16px',
    opacity: '0.9'
  };

  const renderContent = () => {
    switch (type) {
      case 'mentions-legales':
        return (
          <>
            <h1 style={titleStyle}>Mentions Légales</h1>
            <p style={pStyle}>En vigueur au 08/12/2025</p>
            
            <h2 style={h2Style}>1. Éditeur du site</h2>
            <p style={pStyle}>
              Le site Sound Tales est édité par [Nom de la Société / Entrepreneur], [Forme Juridique] au capital de [Montant] euros, immatriculée au Registre du Commerce et des Sociétés de [Ville] sous le numéro [Numéro SIREN].
            </p>
            <p style={pStyle}>
              <strong>Siège social :</strong> [Adresse Complète]<br />
              <strong>Numéro de TVA intracommunautaire :</strong> [Numéro]<br />
              <strong>Directeur de la publication :</strong> [Nom du Directeur]
            </p>
            <p style={pStyle}>
              <strong>Contact :</strong><br />
              Email : contact@soundtales.com<br />
              Téléphone : [Numéro de téléphone]
            </p>

            <h2 style={h2Style}>2. Hébergement</h2>
            <p style={pStyle}>
              Le site est hébergé par [Nom de l'hébergeur] (ex: Vercel, Netlify, AWS).<br />
              Adresse : [Adresse de l'hébergeur]<br />
              Téléphone : [Téléphone de l'hébergeur]
            </p>

            <h2 style={h2Style}>3. Propriété intellectuelle</h2>
            <p style={pStyle}>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </>
        );
      
      case 'confidentialite':
        return (
          <>
            <h1 style={titleStyle}>Politique de Confidentialité</h1>
            <p style={pStyle}>
              Chez Sound Tales, nous accordons une grande importance à la confidentialité de vos données. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>

            <h2 style={h2Style}>1. Collecte des données</h2>
            <p style={pStyle}>
              Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, effectuez un achat ou nous contactez. Ces données peuvent inclure : nom, adresse email, informations de paiement (traitées de manière sécurisée par nos prestataires).
            </p>

            <h2 style={h2Style}>2. Utilisation des données</h2>
            <p style={pStyle}>
              Vos données sont utilisées pour :
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '16px', opacity: '0.9' }}>
              <li>Gérer votre compte et vos accès aux Tales.</li>
              <li>Traiter vos commandes et paiements.</li>
              <li>Vous envoyer des informations sur nos nouveautés (si vous l'avez accepté).</li>
              <li>Améliorer notre plateforme et votre expérience utilisateur.</li>
            </ul>

            <h2 style={h2Style}>3. Partage des données</h2>
            <p style={pStyle}>
              Nous ne vendons pas vos données personnelles. Elles peuvent être partagées avec des tiers de confiance uniquement pour les besoins du service (hébergement, paiement, analytique), dans le respect strict de la confidentialité.
            </p>

            <h2 style={h2Style}>4. Vos droits</h2>
            <p style={pStyle}>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. Pour exercer ces droits, contactez-nous à contact@soundtales.com.
            </p>
          </>
        );

      case 'cgu':
        return (
          <>
            <h1 style={titleStyle}>Conditions Générales d'Utilisation (CGU)</h1>
            <p style={pStyle}>En vigueur au 08/12/2025</p>

            <h2 style={h2Style}>1. Objet</h2>
            <p style={pStyle}>
              Les présentes CGU ont pour objet de définir les modalités de mise à disposition des services du site Sound Tales et les conditions d'utilisation du service par l'utilisateur.
            </p>

            <h2 style={h2Style}>2. Accès au service</h2>
            <p style={pStyle}>
              Le service est accessible gratuitement à tout utilisateur disposant d'un accès à internet. Certains services (lecture intégrale des Tales) sont réservés aux utilisateurs ayant créé un compte et/ou effectué un achat.
            </p>

            <h2 style={h2Style}>3. Compte utilisateur</h2>
            <p style={pStyle}>
              L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute action effectuée via son compte est réputée être effectuée par lui. Sound Tales ne saurait être tenu responsable en cas d'utilisation frauduleuse.
            </p>

            <h2 style={h2Style}>4. Propriété intellectuelle</h2>
            <p style={pStyle}>
              Les contenus présents sur Sound Tales (textes, musiques, images, voix) sont protégés par le droit d'auteur. Toute reproduction, distribution ou utilisation non autorisée est strictement interdite et passible de poursuites. L'achat d'un Tale donne un droit d'accès personnel et non cessible, et non un transfert de propriété.
            </p>

            <h2 style={h2Style}>5. Responsabilité</h2>
            <p style={pStyle}>
              Sound Tales s'efforce de fournir un service de qualité mais ne peut garantir une disponibilité absolue du site. Nous ne saurions être tenus responsables des dommages directs ou indirects résultant de l'utilisation du site.
            </p>

            <h2 style={h2Style}>6. Modification des CGU</h2>
            <p style={pStyle}>
              Sound Tales se réserve le droit de modifier les présentes CGU à tout moment. L'utilisateur est invité à les consulter régulièrement.
            </p>
          </>
        );

      default:
        return <p>Page non trouvée.</p>;
    }
  };

  return (
    <div className="page page--fade" style={containerStyle}>
      {renderContent()}
    </div>
  );
};

export default LegalContent;
