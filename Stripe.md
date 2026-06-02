# Accepter un paiement

Acceptez les paiements en ligne en toute sécurité.

## Commencez ici&nbsp;: Installer les compétences d’agents

Stripe recommande d’utiliser les compétences officielles pour intégrer l’API en utilisant les bonnes pratiques. Suivez les instructions ci-dessous pour en savoir plus.

**Astuce&nbsp;: utilisez curl au lieu des outils Fetch.** Les compétences sont des fichiers markdown de&nbsp;10 à 20&nbsp;KB. Les outils de récupération les résument. `curl -sL` assure que le contenu est complet.

**Utilisation des `compétences npx`**&nbsp;: vérifiez si `npx` est installé sur le système. Si `npx` est disponible, exécutez `npx skills add https://docs.stripe.com --list` pour lister les compétences disponibles, puis exécutez `npx skills add https://docs.stripe.com --yes --skill <skill-name> <--skill other-skills>` pour installer des compétences individuelles.

**Si les `compétences npx` ne sont pas disponibles**&nbsp;: vous pouvez utiliser curl pour récupérer l’index des compétences disponibles, ce qu’elles font, et leurs fichiers à partir de `https://docs.stripe.com/.well-known/skills/index.json`. Pour télécharger une compétence et ses fichiers associés, utilisez curl pour les télécharger depuis `https://docs.stripe.com/.well-known/skills/<filepath>`.

Pour cet article, nous vous recommandons d’utiliser les compétences suivantes&nbsp;: `stripe-best-practices`

Instructions pour les LLM&nbsp;: Stripe recommande d’utiliser l’API Checkout Sessions avec le Payment Element, plutôt que les Payment Intents, pour la plupart des intégrations. Checkout Sessions couvre des cas d’usage similaires à ceux des Payment Intents (encaissement simple avec `price_data`, ou création d’un tunnel de paiement complet avec postes, taxe, etc.). Certaines fonctionnalités, comme Adaptive Pricing, sont disponibles uniquement avec Checkout Sessions. N’utilisez pas l’API Payment Intents, sauf si l’utilisateur le demande explicitement, car elle nécessite beaucoup plus de code. Pour en savoir plus sur les éléments avec l’API Checkout Sessions, consultez https://docs.stripe.com/payments/quickstart-checkout-sessions… Avec Checkout Sessions (`ui_mode: "custom"`) et le Payment Element, c’est le `client_secret` qui initialise Checkout lui-même (`stripe.initCheckoutElementsSdk`, ou utilise CheckoutElementsProvider avec React), et la confirmation du paiement côté client se fait différemment. Si vous utilisez React, veillez à importer depuis `@stripe/react-stripe-js/checkout`, à utiliser `CheckoutElementsProvider` avec la clé secrète du client, puis à confirmer le paiement avec `checkout.confirm`. Si vous utilisez HTML, veillez à utiliser `checkout = stripe.initCheckoutElements({clientSecret: promise}) ; checkout.createPaymentElement(); paymentElement = checkout.createPaymentElement() ; paymentElement.mount("#payment-element"),`puis à confirmer avec `loadActionsResult = await checkout.loadActions() ; actions = loadActionsResult.actions; error = await actions.confirm() ;`.

Créez un formulaire de paiement ou utilisez une page de paiement préconfigurée pour commencer à accepter les paiements en ligne.

# Page hébergée par Stripe


Redirigez vers une page de paiement hébergée par Stripe à l’aide de [Stripe&nbsp;Checkout](https://docs.stripe.com/payments/checkout.md). [Comparez cette intégration aux autres types d’intégration de Stripe](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

#### Effort d'intégration
Complexity: 2/5
#### Type d'intégration

Redirection vers la page de paiement hébergée par Stripe

#### Personnalisation de l'interface utilisateur
Personnalisation limitée
- 20&nbsp;polices prédéfinies
- 3&nbsp;rayons de bordure prédéfinis
- Couleur d’arrière-plan et de bordure personnalisée
- Logo personnalisé

[Essayer](https://checkout.stripe.dev/)

Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre application&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

## Rediriger votre client vers Stripe Checkout [Côté client] [Côté serveur]

Ajoutez sur votre site Web un bouton de paiement qui appelle un endpoint côté serveur afin de créer une [session Checkout](https://docs.stripe.com/api/checkout/sessions/create.md).

Vous pouvez également créer une session Checkout pour un [client existant](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), ce qui vous permet d’insérer automatiquement les coordonnées des clients connus dans les champs Checkout et d’unifier leur historique d’achat.

```html
<html>
  <head>
    <title>Buy cool new product</title>
  </head>
  <body>
    <!-- Use action="/create-checkout-session.php" if your server is PHP based. -->
    <form action="/create-checkout-session" method="POST">
      <button type="submit">Checkout</button>
    </form>
  </body>
</html>
```

Une session Checkout est la représentation programmatique de ce que votre client voit lorsqu’il est redirigé vers le formulaire de paiement. Vous pouvez la configurer à l’aide de différentes options, par exemple&nbsp;:

- Les [postes](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) à facturer
- Les devises à utiliser

Vous devez renseigner la valeur `success_url` avec l’URL d’une page de votre site web vers laquelle Checkout redirige votre client une fois le paiement effectué.

> Par défaut, les sessions Checkout expirent 24&nbsp;heures après leur création.

Après avoir créé une session Checkout, redirigez votre client vers l’[URL](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-url) renvoyée dans la réponse.

#### Node.js

```javascript
// This example sets up an endpoint using the Express framework.

const express = require('express');
const app = express();
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>')

app.post('/create-checkout-session', async (req, res) => {const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'T-shirt',
          },
          unit_amount: 2000,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: 'http://localhost:4242/success',
  });

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

### Moyens de paiement

Par défaut, Stripe active les cartes bancaires et autres moyens de paiement courants. Vous avez la possibilité d’activer ou de désactiver des moyens de paiement directement depuis le [Dashboard Stripe](https://dashboard.stripe.com/settings/payment_methods). Dans Checkout, Stripe évalue la devise et les restrictions éventuelles, puis présente dynamiquement au client les moyens de paiement pris en charge.

Pour visualiser l’affichage des moyens de paiement pour les clients, saisissez un ID de transaction ou définissez le montant et la devise d’une commande dans le Dashboard.

Vous pouvez activer Apple&nbsp;Pay et Google&nbsp;Pay dans vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods). Par défaut, Apple&nbsp;Pay est activé et Google&nbsp;Pay est désactivé. Cependant, dans certains cas, Stripe les filtre même lorsqu’ils sont activés. Nous filtrons Google Pay si vous [activez les taxes automatiques](https://docs.stripe.com/tax/checkout.md) sans collecter d’adresse de livraison.

Aucune modification de l’intégration n’est requise pour activer Apple&nbsp;Pay ou Google&nbsp;Pay dans les pages hébergées par Stripe de Checkout. Stripe gère ces paiements de la même manière que les autres paiements par carte bancaire.

### Confirmer votre endpoint

Confirmez que votre point d’accès est accessible en démarrant votre serveur Web (par exemple, `localhost:4242`) et en exécutant la commande suivante&nbsp;:

```bash
curl -X POST -is "http://localhost:4242/create-checkout-session" -d ""
```

Une réponse semblable à celle ci-dessous devrait s’afficher dans votre terminal&nbsp;:

```bash
HTTP/1.1 303 See Other
Location: https://checkout.stripe.com/c/pay/cs_test_...
...
```

### Vérifier votre intégration

Vous devriez maintenant disposer d’un bouton de paiement fonctionnel qui redirige votre client vers Stripe Checkout.

1. Cliquez sur le bouton de paiement.
1. Vous êtes redirigé(e) vers le formulaire de paiement Stripe Checkout.

Si votre intégration ne fonctionne pas&nbsp;:

1. Ouvrez l’onglet Réseau dans les outils de développement de votre navigateur.
1. Cliquez sur le bouton de paiement et assurez-vous qu’une requête XHR est bien envoyée à votre endpoint côté serveur (`POST /create-checkout-session`).
1. Vérifiez que la requête renvoie bien un état&nbsp;200.
1. Utilisez `console.log(session)` dans l’écouteur du clic sur le bouton pour vous assurer qu’il renvoie les données appropriées.

## Afficher une page de confirmation de paiement [Côté client] [Côté serveur]

Il est important de présenter une page de confirmation à votre client une fois qu’il a validé le formulaire de paiement. Nous vous conseillons d’héberger cette page sur votre site.

Créez une page de confirmation minimale&nbsp;:

```html
<html>
  <head><title>Thanks for your order!</title></head>
  <body>
    <h1>Thanks for your order!</h1>
    <p>
      We appreciate your business!
      If you have any questions, please email
      <a href="mailto:orders@example.com">orders@example.com</a>.
    </p>
  </body>
</html>
```

Ensuite, mettez à jour l’endpoint de création de sessions Checkout pour qu’il utilise cette nouvelle page&nbsp;:

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'http://localhost:4242/success.html',
});
```

> Pour personnaliser votre page de confirmation de paiement, consultez le guide [dédié à ce sujet](https://docs.stripe.com/payments/checkout/custom-success-page.md).

## Gérer les événements post-paiement

Stripe envoie un événement [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) lorsqu’un client effectue un paiement par session Checkout. Utilisez l’[outil de webhook Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir et gérer ces événements. Ceux-ci peuvent vous conduire à&nbsp;:

- Envoyez un e-mail de confirmation de commande à votre client.
- Enregistrez la vente dans une base de données.
- Démarrez un flux de travail d’expédition.

Écoutez ces événements plutôt que d’attendre que votre client soit redirigé vers votre site Web. Le déclenchement du traitement uniquement à partir de votre page de renvoi Checkout n’est pas fiable. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule intégration.

Pour en savoir plus, consultez notre [guide de traitement des commandes avec Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Gérez les événements suivants lors de la collecte de paiements avec Checkout&nbsp;:

| Événement                                                                                                                                    | Description                                                                                                                 | Action                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Envoyé lorsqu’un client termine une session Checkout.                                                                       | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande. |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Envoyé lorsqu’un paiement effectué avec un moyen de paiement différé (par exemple, un prélèvement automatique ACH) aboutit. | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande. |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Envoyé lorsqu’un paiement effectué avec un moyen de paiement différé (par exemple, un prélèvement automatique ACH) échoue.  | Informez le client de l’échec et redirigez-le vers la session pour tenter à nouveau de payer.                                                                                                          |

## Tester votre intégration

Pour tester votre intégration de formulaire de paiement hébergé par Stripe&nbsp;:

1. Créez une session Checkout.
1. Renseignez les informations d’un moyen de paiement du tableau suivant.
   - Saisissez une date d’expiration postérieure à la date du jour.
   - Saisissez un code CVC à 3&nbsp;chiffres.
   - Saisissez un code postal de facturation.
1. Cliquez sur **Payer**. Vous êtes redirigé(e) vers votre `success_url`.
1. Accédez au Dashboard et recherchez le paiement sur la page [Transactions](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). Si votre paiement a abouti, il apparaîtra dans cette liste.
1. Cliquez sur votre paiement afin d’afficher plus d’informations, par exemple un récapitulatif Checkout contenant les informations de facturation et la liste des articles achetés. Vous pouvez utiliser ces informations pour traiter votre commande.

Découvrez comment [tester votre intégration](https://docs.stripe.com/testing.md).

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Portefeuilles

| Moyen de paiement | Scénario                                                                                                                                                                   | Méthode de test                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alipay            | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification immédiate](https://docs.stripe.com/payments/payment-methods.md#payment-notification). | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche. |

#### Virements avec redirection bancaire

| Moyen de paiement                    | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prélèvement automatique BECS         | Le montant dû est réglé par prélèvement automatique BECS.                                                                                                                                                              | Remplissez le formulaire à l’aide du numéro de compte `900123456` et du BSB `000000`.La confirmation de la demande de PaymentIntent passe d’abord à l’état `processing`, puis à l’état `succeeded` trois minutes plus tard. |
| Prélèvement automatique BECS         | Le paiement de votre client échoue avec un code d’erreur `account_closed`.                                                                                                                                             | Remplissez le formulaire à l’aide du numéro de compte `111111113` et du BSB `000000`.                                                                                                                                       |
| Bancontact, EPS, iDEAL et Przelewy24 | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                       |
| Pay by Bank                          | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                                            |
| Pay by Bank                          | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                                        |
| BLIK                                 | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                                            |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

#### Coupons

| Moyen de paiement | Scénario                                           | Méthode de test                                                                                                           |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Boleto, OXXO      | Le montant dû est réglé par coupon Boleto ou OXXO. | Sélectionnez Boleto ou OXXO comme moyen de paiement, puis envoyez le paiement. Fermez la boîte de dialogue qui s’affiche. |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Créer des produits et des tarifs

Avant de créer une session Checkout, vous pouvez directement créer des *produits* (Products represent what your business sells—whether that's a good or a service) et des *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions). Utilisez les produits pour représenter différents biens physiques ou niveaux de service, et les *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions) pour représenter le tarif de chaque produit. Vous pouvez [configurer votre session Checkout](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) pour accepter les pourboires et les dons, ou vendre des produits et services à prix libre.

Par exemple, vous pouvez créer un T-shirt vendu au tarif de 20&nbsp;USD. Cela vous permet de mettre à jour et d’ajouter des tarifs sans avoir à modifier les détails de vos produits sous-jacents. Vous pouvez créer des produits et des tarifs à l’aide du Dashboard ou de l’API Stripe. En savoir plus sur [le fonctionnement des produits et des tarifs](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

#### API

Seul un attribut `name` est requis par l’API pour créer un [Product](https://docs.stripe.com/api/products.md). Checkout affiche les attributs `name`, `description` et `images` que vous aurez définis.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

Ensuite, créez un objet [Price](https://docs.stripe.com/api/prices.md) pour définir le tarif de facturation de votre produit. Spécifiez le montant et la devise.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const price = await stripe.prices.create({
  product: '{{PRODUCT_ID}}',
  unit_amount: 2000,
  currency: 'usd',
});
```

#### Dashboard

> Copiez en mode production les produits créés dans un environnement de test afin d’éviter d’avoir à les recréer. Dans la vue détaillée du produit du Dashboard, cliquez sur **Copier en mode production** dans en haut à droite. Vous ne pouvez effectuer cette opération qu’une seule fois pour chaque produit créé dans un environnement de test. Les mises à jour ultérieures du produit de test ne sont pas répercutées sur le produit en mode production.

Assurez-vous d’être dans un environnement de test en cliquant sur **Environnements de test** dans le sélecteur de compte du Dashboard. Ensuite, définissez les articles que vous souhaitez vendre. Pour créer un nouveau produit et un nouveau prix&nbsp;:

- Accédez à la section [Produits](https://dashboard.stripe.com/test/products) du Dashboard.
- Cliquez sur **Ajouter un produit**.
- Sélectionnez **Ponctuel** lors de la définition du tarif.

Checkout affiche le nom, la description et les images du produit que vous aurez définis.

Chaque prix que vous créez possède un identifiant. Lorsque vous créez une session Checkout, faites référence à l’identifiant de prix et à la quantité. Si vous vendez dans plusieurs devises, définissez votre prix comme *multidevise* (A single Price object can support multiple currencies. Each purchase uses one of the supported currencies for the Price, depending on how you use the Price in your integration). Checkout [ détermine automatiquement la devise locale du client ](https://docs.stripe.com/payments/checkout/localize-prices/manual-currency-prices.md) et présente cette devise si le prix la prend en charge.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
});
```

## Optional: Renseigner automatiquement les données client [Côté serveur]

Si vous avez précédemment collecté l’adresse e-mail de votre client et que vous souhaitez la renseigner automatiquement dans la session Checkout, transmettez le paramètre [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) lors de la création de la session.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success',
});
```

## Optional: Enregistrer les informations de paiement [Côté serveur]

Par défaut, les moyens de paiement utilisés pour effectuer un paiement ponctuel avec Checkout ne sont pas disponibles pour une utilisation ultérieure.

### Enregistrer les moyens de paiement pour les débiter hors session

Vous pouvez configurer Checkout de façon à enregistrer les moyens de paiement utilisés pour effectuer des paiements ponctuels en transmettant l’argument [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage). Cela peut notamment vous permettre de capturer un moyen de paiement pour prélever des frais futurs, comme des frais d’annulation ou de non-présentation.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_creation: 'always',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success.html',
  payment_intent_data: {
    setup_future_usage: 'off_session',
  },
});
```

Si vous utilisez Checkout en mode `abonnement`, Stripe enregistre automatiquement le moyen de paiement pour le débiter lors des paiements suivants. Les moyens de paiement par carte bancaire enregistrés pour les clients utilisant les modes `setup_future_usage` ou `abonnement` n’apparaissent pas dans Checkout en cas de nouvel achat effectué par un client connu (plus d’informations à ce sujet plus bas). Nous vous recommandons d’utiliser du [texte personnalisé](https://docs.stripe.com/payments/checkout/custom-components.md#customize-text) pour rediriger vers les conditions pertinentes concernant l’utilisation des informations de paiement enregistrées.

> Les lois internationales en matière de protection de la vie privée sont complexes et nuancées. Nous vous recommandons de contacter votre conseiller juridique et votre équipe chargée de la conformité avant de mettre en œuvre [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage), car cela pourrait impliquer votre cadre de conformité existant en matière de confidentialité. Reportez-vous aux [directives du Comité européen de la protection des données](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) pour en savoir plus sur l’enregistrement des données de paiement.

### Enregistrer les moyens de paiement pour les préremplir dans Checkout

Par défaut, Checkout utilise [Link](https://docs.stripe.com/payments/link/checkout-link.md) pour offrir à vos clients la possibilité d’enregistrer et de réutiliser leurs informations de paiement en toute sécurité. Si vous préférez gérer vous-même les moyens de paiement, utilisez [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) lors de la création d’une Checkout Session. Vos clients pourront ainsi enregistrer leurs moyens de paiement pour leurs futurs achats dans Checkout.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_creation: 'always',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success.html',
  saved_payment_method_options: {
    payment_method_save: 'enabled',
  },
});
```

Lorsque vous transmettez ce paramètre en mode [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) ou [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode), une case à cocher facultative s’affiche, ce qui permet aux clients d’enregistrer explicitement leur moyen de paiement pour leurs futurs achats. Lorsque les clients cochent cette case, Checkout enregistre le moyen de paiement avec [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay), et utilise ce paramètre pour déterminer si les informations de paiement peuvent être préremplies lors des futurs achats. L’utilisation de `saved_payment_method_options.payment_method_save` ne nécessite pas de transmettre `setup_future_usage` pour enregistrer le moyen de paiement.

> #### Utiliser l’API Accounts v2 pour représenter les clients
> 
> L’API Accounts&nbsp;v2 est généralement disponible pour les utilisateurs de Connect et en aperçu public pour les autres utilisateurs de Stripe. Si vous avez accès à l’aperçu Accounts&nbsp;v2, vous devez [spécifier une version d’aperçu](https://docs.stripe.com/api-v2-overview.md#sdk-and-api-versioning) dans votre code.
> 
> Pour accéder à l’aperçu Accounts&nbsp;v2, rendez-vous sur [aperçus et fonctionnalités de Account](https://dashboard.stripe.com/settings/features/product-previews) dans votre Dashboard et activez **Moyens de paiement réutilisables pour les virements internationaux**.
> 
> Dans la plupart des cas d’usage, nous vous recommandons de [modéliser vos clients en tant qu’objets Account configurés par le client](https://docs.stripe.com/accounts-v2/use-accounts-as-customers.md), plutôt que d’utiliser des objets [Customer](https://docs.stripe.com/api/customers.md).

L’utilisation de [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) nécessite un objet pour représenter votre client (un `Account` configuré par le client ou un `Customer`). Pour enregistrer un nouveau client, définissez [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_creation) sur `always` dans la Checkout Session. Sinon, la session n’enregistre ni le client ni le moyen de paiement.

Si `payment_method_save` n’est pas transmis ou si le client refuse d’enregistrer le moyen de paiement, Checkout enregistre toujours les moyens de paiement créés en mode '`subscription` ou à l’aide de `setup_future_usage`. La valeur `allow_redisplay` de ces moyens de paiement est définie sur `limited`, ce qui évite que les informations de paiement soient préremplies pour les futurs achats et vous permet de vous conformer aux règles des réseaux de cartes et aux réglementations en matière de protection des données. Découvrez comment [modifier le comportement par défaut activé par ces modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) et comment modifier ou remplacer le comportement `allow_redisplay`.

> Vous pouvez utiliser Checkout pour enregistrer des cartes et d’autres moyens de paiement afin de les débiter hors session, mais Checkout ne remplit automatiquement que les données des cartes enregistrées. Découvrez comment [remplir automatiquement les données des cartes enregistrées](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). Pour enregistrer un moyen de paiement sans paiement initial, [utilisez Checkout en mode configuration](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

### Autoriser les clients à supprimer des moyens de paiement enregistrés

Pour permettre à vos clients de supprimer un moyen de paiement enregistré de sorte qu’il ne s’affiche plus pour les paiements ultérieurs, utilisez [saved_payment_method_options.payment_method_remove](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_remove) lors de la création d’une session Checkout.

#### Accounts v2

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_account: '{{CUSTOMERACCOUNT_ID}}',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success.html',
  saved_payment_method_options: {
    payment_method_remove: 'enabled',
  },
});
```

#### Customers v1

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer: '{{CUSTOMER_ID}}',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: 'https://example.com/success.html',
  saved_payment_method_options: {
    payment_method_remove: 'enabled',
  },
});
```

Le client ne peut pas supprimer un moyen de paiement associé à un abonnement actif s’il ne dispose pas d’un moyen de paiement par défaut enregistré pour les paiements de factures et d’abonnements.

## Optional: Autorisation et capture distinctes [Côté serveur]

Stripe prend en charge les paiements par carte bancaire en deux étapes&nbsp;: vous pouvez d’abord autoriser la carte, puis capturer les fonds plus tard. Lorsqu’un paiement est autorisé par Stripe, l’émetteur de la carte garantit les fonds et réserve le montant correspondant sur la carte du client. Vous disposez ensuite d’un délai spécifique, [selon la carte](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations), pour capturer les fonds. Si la capture n’est pas effectuée avant l’expiration de l’autorisation, le paiement est annulé et les fonds réservés sont libérés par l’émetteur.

La séparation de l’autorisation et de la capture est utile si vous devez effectuer des actions supplémentaires entre la confirmation de la solvabilité du client et la collecte du paiement. Par exemple, si vous vendez des articles dont le stock est limité, vous devrez peut-être vérifier qu’un élément acheté par votre client via Checkout est toujours disponible avant de capturer son paiement et d’exécuter la commande. Pour ce faire, procédez comme suit&nbsp;:

1. Vérifiez que Stripe a autorisé le moyen de paiement du client.
1. Consultez votre système de gestion des stocks pour vous assurer que l’article est toujours disponible.
1. Mettez à jour votre système de gestion des stocks pour indiquer qu’un client a acheté l’article.
1. Capturez le paiement du client.
1. Indiquez au client si l’achat a réussi sur votre page de confirmation.

Pour indiquer que vous voulez séparer l’autorisation de la capture, définissez la valeur de l’option [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) sur `manual` lorsque vous créez la session Checkout. Ce paramètre indique à Stripe de se contenter d’autoriser le montant sur la carte du client.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  mode: 'payment',
  payment_intent_data: {
    capture_method: 'manual',
  },
  success_url: 'https://example.com/success.html',
});
```

Pour capturer un paiement qui a été autorisé, vous pouvez utiliser le [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) ou l’endpoint de [capture](https://docs.stripe.com/api/payment_intents/capture.md). La capture de paiements par voie programmatique implique d’accéder au PaymentIntent créé lors de la session Checkout, que vous pouvez obtenir à partir de l’objet [Session](https://docs.stripe.com/api/payment_intents/capture.md).

## Optional: Gérer les comptes clients [No-code]

Offrez à vos clients la possibilité de [gérer](https://docs.stripe.com/customer-management.md) leurs propres comptes en partageant un lien vers votre *portail client* (The customer portal is a secure, Stripe-hosted page that lets your customers manage their subscriptions and billing details). Le portail client permet aux clients de se connecter avec leur adresse e-mail pour gérer leurs abonnements, mettre à jour leurs moyens de paiement, etc.

## See also

- [Ajouter des réductions](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collecte des taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collecte des numéros fiscaux](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Ajouter des frais de livraison](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Personnaliser l’adaptation à votre marque](https://docs.stripe.com/payments/checkout/customization.md)


# Page entièrement intégrée


Intégrez un formulaire de paiement préconfiguré à votre site à l’aide de [Stripe&nbsp;Checkout](https://docs.stripe.com/payments/checkout.md). [Comparez cette intégration aux autres types d’intégration de Stripe](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

#### Effort d'intégration
Complexity: 2/5
#### Type d'intégration

Intégrer un formulaire de paiement préconfiguré sur votre site

#### Personnalisation de l'interface utilisateur
Personnalisation limitée
- 20&nbsp;polices prédéfinies
- 3&nbsp;rayons de bordure prédéfinis
- Couleur d’arrière-plan et de bordure personnalisée
- Logo personnalisé

Utilisez les [paramètres de marque](https://dashboard.stripe.com/settings/branding/checkout) dans le Dashboard Stripe pour adapter l’apparence de Checkout à celle de votre site.

Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre application&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

## Créer une session Checkout [Côté serveur]

Depuis votre serveur, créez une *Checkout Session* (A Checkout Session represents your customer's session as they pay for one-time purchases or subscriptions through Checkout. After a successful payment, the Checkout Session contains a reference to the Customer, and either the successful PaymentIntent or an active Subscription) et définissez l’[ui_mode](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-ui_mode) sur `embedded_page`. Vous pouvez configurer la [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) avec des [postes](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-line_items) à inclure et des options telles qu’une [devise](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-currency).

Vous pouvez également créer une session Checkout pour un [client existant](https://docs.stripe.com/payments/existing-customers.md?platform=web&ui=stripe-hosted), ce qui vous permet d’insérer automatiquement les coordonnées des clients connus dans les champs Checkout et d’unifier leur historique d’achat.

Pour rediriger vos clients vers une page personnalisée hébergée sur votre site web, indiquez l’URL de cette page dans le paramètre [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url). Ajoutez la variable de modèle `{CHECKOUT_SESSION_ID}` dans l’URL pour récupérer l’état de la session sur la page de retour. Checkout remplace automatiquement la variable par l’ID de session Checkout avant la redirection.

En savoir plus sur la [configuration de la page de retour](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=checkout&ui=embedded-page#return-page) et d’autres options pour [personnaliser le comportement de redirection](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-page).

Après avoir créé la session Checkout, utilisez le `client_secret` renvoyé dans la réponse pour [monter Checkout](https://docs.stripe.com/payments/accept-a-payment.md#mount-checkout).

#### Node.js

```javascript
// This example sets up an endpoint using the Express framework.
const express = require('express');
const app = express();

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    }],
    mode: 'payment',ui_mode: 'embedded_page',
    return_url: 'https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}',
  });

  res.send({clientSecret: session.client_secret});
});

app.listen(4242, () => console.log(`Listening on port ${4242}!`));
```

## Monter Checkout [Côté client]

#### HTML + JS

Checkout est disponible dans [Stripe.js](https://docs.stripe.com/js.md). Intégrez le script Stripe.js à votre page en l’ajoutant à l’en-tête de votre fichier HTML. Ensuite, créez un nœud DOM vide (conteneur) à utiliser pour le montage.

```html
<head>
  <script src="https://js.stripe.com/dahlia/stripe.js"></script>
</head>
<body>
  <div id="checkout">
    <!-- Checkout will insert the payment form here -->
  </div>
</body>
```

Initialisez Stripe.js avec votre clé API publique.

Créez une fonction `fetchClientSecret` asynchrone qui demande à votre serveur de créer la session Checkout et de récupérer la clé secrète du client. Transmettez cette fonction dans la propriété `options` lorsque vous créez l’instance Checkout&nbsp;:

```javascript
// Initialize Stripe.js
const stripe = Stripe('<<YOUR_PUBLISHABLE_KEY>>');

initialize();

// Fetch Checkout Session and retrieve the client secret
async function initialize() {
  const fetchClientSecret = async () => {
    const response = await fetch("/create-checkout-session", {
      method: "POST",
    });
    const { clientSecret } = await response.json();
    return clientSecret;
  };

  // Initialize Checkout
  const checkout = await stripe.createEmbeddedCheckoutPage({
    fetchClientSecret,
  });

  // Mount Checkout
  checkout.mount('#checkout');
}
```

#### React

Installez [react-stripe-js](https://docs.stripe.com/sdks/stripejs-react.md) et le chargeur Stripe.js à partir de npm&nbsp;:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

Pour utiliser le composant Checkout intégré, créez un `EmbeddedCheckoutProvider`. Appelez `loadStripe` avec votre clé API publique et transmettez la valeur `Promise` au prestataire.

Créez une fonction `fetchClientSecret` asynchrone qui demande à votre serveur de créer la session Checkout et de récupérer la clé secrète du client. Transmettez cette fonction dans la propriété `options` acceptée par le prestataire.

```jsx
import * as React from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_123');

const App = () => {
  const fetchClientSecret = React.useCallback(() => {
    // Create a Checkout Session
    return fetch("/create-checkout-session", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
```

Checkout s’affiche dans un iframe qui envoie de manière sécurisée les informations de paiement à Stripe via une connexion HTTPS.

> Évitez de placer Checkout dans un autre iframe, car certains moyens de paiement nécessitent une redirection vers une autre page pour la confirmation du paiement.

### Personnaliser l’apparence

Personnalisez Checkout pour qu’il corresponde au design de votre site en définissant la couleur d’arrière-plan, la couleur des boutons, le rayon de la bordure et les polices dans les [paramètres de marque](https://dashboard.stripe.com/settings/branding) de votre compte.

Par défaut, Checkout s’affiche sans espacement externe ni marge. Nous vous recommandons d’utiliser un élément de conteneur tel qu’un espace div pour appliquer la marge souhaitée (par exemple, 16&nbsp;px sur tous les côtés).

## Afficher une page de retour

Après la tentative de paiement de votre client, Stripe le redirige vers une page de retour que vous hébergez sur votre site. Lors de la création de la session Checkout, vous avez spécifié l’URL de la page de retour dans le paramètre [return_url](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-return_url). En savoir plus sur les autres options de [personnalisation du comportement de redirection](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-page).

Lors de l’affichage de votre page de retour, récupérez l’état de la session Checkout à l’aide de l’ID de session Checkout dans l’URL. Traitez le résultat en fonction de l’état de la session comme suit&nbsp;:

- `complete`&nbsp;: le paiement a abouti. Utilisez les informations de la session Checkout pour afficher une page de confirmation.
- `open`&nbsp;: le paiement a échoué ou a été annulé. Montez à nouveau Checkout pour que votre client puisse effectuer une nouvelle tentative.

#### Node.js

```javascript
app.get('/session_status', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    payment_status: session.payment_status,
    customer_email: session.customer_details.email
  });
});
```

```javascript
const session = await fetch(`/session_status?session_id=${session_id}`)
if (session.status == 'open') {
  // Remount embedded Checkout
} else if (session.status == 'complete') {
  // Show success page
  // Optionally use session.payment_status or session.customer_email
  // to customize the success page
}
```

#### Moyens de paiement avec redirection

Lors du paiement, certains moyens de paiement redirigent le client vers une page intermédiaire, comme la page d’autorisation de sa banque. Une fois qu’il a renseigné cette page, Stripe le redirige vers votre page de retour.

En savoir plus sur [les moyens de paiement avec redirection et le comportement de redirection](https://docs.stripe.com/payments/checkout/custom-success-page.md?payment-ui=embedded-page#redirect-based-payment-methods).

## Gérer les événements post-paiement

Stripe envoie un événement [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed) lorsqu’un client effectue un paiement par session Checkout. Utilisez l’[outil de webhook Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir et gérer ces événements. Ceux-ci peuvent vous conduire à&nbsp;:

- Envoyez un e-mail de confirmation de commande à votre client.
- Enregistrez la vente dans une base de données.
- Démarrez un flux de travail d’expédition.

Écoutez ces événements plutôt que d’attendre que votre client soit redirigé vers votre site Web. Le déclenchement du traitement uniquement à partir de votre page de renvoi Checkout n’est pas fiable. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule intégration.

Pour en savoir plus, consultez notre [guide de traitement des commandes avec Checkout](https://docs.stripe.com/checkout/fulfillment.md).

Gérez les événements suivants lors de la collecte de paiements avec Checkout&nbsp;:

| Événement                                                                                                                                    | Description                                                                                                                 | Action                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [checkout.session.completed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.completed)                             | Envoyé lorsqu’un client termine une session Checkout.                                                                       | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande. |
| [checkout.session.async_payment_succeeded](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_succeeded) | Envoyé lorsqu’un paiement effectué avec un moyen de paiement différé (par exemple, un prélèvement automatique ACH) aboutit. | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande. |
| [checkout.session.async_payment_failed](https://docs.stripe.com/api/events/types.md#event_types-checkout.session.async_payment_failed)       | Envoyé lorsqu’un paiement effectué avec un moyen de paiement différé (par exemple, un prélèvement automatique ACH) échoue.  | Informez le client de l’échec et redirigez-le vers la session pour tenter à nouveau de payer.                                                                                                          |

## Tester votre intégration

Pour tester votre intégration de formulaire de paiement intégré&nbsp;:

1. Créez une Checkout Session intégrée et montez le formulaire de paiement sur votre page.
1. Renseignez les informations d’un moyen de paiement du tableau ci-dessous.
   - Saisissez une date d’expiration postérieure à la date du jour.
   - Saisissez un code CVC à 3&nbsp;chiffres.
   - Saisissez un code postal de facturation.
1. Cliquez sur **Payer**. Vous êtes redirigé vers votre URL `return_url`.
1. Accédez au Dashboard et recherchez le paiement sur la [page Transactions](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). Si votre paiement réussit, vous le verrez dans cette liste.
1. Cliquez sur votre paiement afin d’afficher plus d’informations, par exemple un récapitulatif Checkout contenant les informations de facturation et la liste des articles achetés. Vous pouvez utiliser ces informations pour traiter votre commande.

En savoir plus sur le [test de votre intégration](https://docs.stripe.com/testing.md)

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Portefeuilles

| Moyen de paiement | Scénario                                                                                                                                                                   | Méthode de test                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alipay            | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification immédiate](https://docs.stripe.com/payments/payment-methods.md#payment-notification). | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche. |

#### Virements avec redirection bancaire

| Moyen de paiement                    | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prélèvement automatique BECS         | Le montant dû est réglé par prélèvement automatique BECS.                                                                                                                                                              | Remplissez le formulaire à l’aide du numéro de compte `900123456` et du BSB `000000`.La confirmation de la demande de PaymentIntent passe d’abord à l’état `processing`, puis à l’état `succeeded` trois minutes plus tard. |
| Prélèvement automatique BECS         | Le paiement de votre client échoue avec un code d’erreur `account_closed`.                                                                                                                                             | Remplissez le formulaire à l’aide du numéro de compte `111111113` et du BSB `000000`.                                                                                                                                       |
| Bancontact, EPS, iDEAL et Przelewy24 | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                       |
| Pay by Bank                          | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                                            |
| Pay by Bank                          | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                                        |
| BLIK                                 | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                                            |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

#### Coupons

| Moyen de paiement | Scénario                                           | Méthode de test                                                                                                           |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Boleto, OXXO      | Le montant dû est réglé par coupon Boleto ou OXXO. | Sélectionnez Boleto ou OXXO comme moyen de paiement, puis envoyez le paiement. Fermez la boîte de dialogue qui s’affiche. |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Ajouter d'autres moyens de paiement

Par défaut, Checkout [prend en charge de nombreux moyens de paiement](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods). Vous devez cependant effectuer des manipulations supplémentaires pour activer et afficher certains moyens de paiement, comme Apple&nbsp;Pay, Google&nbsp;Pay et les moyens de paiement différé.

### Apple Pay et Google Pay

Pour accepter les paiements provenant d’Apple&nbsp;Pay et de Google&nbsp;Pay, vous devez&nbsp;:

- Activez-les dans les [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods). Apple Pay est activé par défaut.
- Fournissez votre application via HTTPS en développement et en production.
- [Enregistrez votre domaine](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).
- Fournissez votre application est fournie via HTTPS en mode test et en mode production. Vous pouvez utiliser un service tel que [ngrok](https://ngrok.com/) pour traiter votre application dans le cadre de tests locaux.

De plus, une session Checkout affiche le bouton Apple&nbsp;Pay uniquement quand *toutes* les conditions suivantes sont satisfaites&nbsp;:

- L’appareil du client exécute macOS version 17 ou iOS version 17 (ou des versions ultérieures).
- Le client utilise Safari.
- Le client a enregistré une carte valide auprès d’Apple&nbsp;Pay.

Une session Checkout n’affiche le bouton Google&nbsp;Pay pour les clients que lorsque *toutes* les conditions suivantes sont réunies&nbsp;:

- L’appareil du client exécute Chrome&nbsp;61 ou une version plus récente.
- Le client a enregistré une carte valide auprès de Google&nbsp;Pay.

> #### Tests régionaux
> 
> Stripe Checkout ne prend pas en charge Apple&nbsp;Pay ou Google&nbsp;Pay pour les comptes ou les clients Stripe en Inde. Si votre adresse IP est située en Inde, vous ne pouvez pas tester votre intégration Apple&nbsp;Pay ou Google&nbsp;Pay, même si le compte Stripe est établi dans un autre pays.

## Optional: Créer des produits et des tarifs

Avant de créer une session Checkout, vous pouvez directement créer des *produits* (Products represent what your business sells—whether that's a good or a service) et des *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions). Utilisez les produits pour représenter différents biens physiques ou niveaux de service, et les *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions) pour représenter le tarif de chaque produit. Vous pouvez [configurer votre session Checkout](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) pour accepter les pourboires et les dons, ou vendre des produits et services à prix libre.

Par exemple, vous pouvez créer un T-shirt vendu au tarif de 20&nbsp;USD. Cela vous permet de mettre à jour et d’ajouter des tarifs sans avoir à modifier les détails de vos produits sous-jacents. Vous pouvez créer des produits et des tarifs à l’aide du Dashboard ou de l’API Stripe. En savoir plus sur [le fonctionnement des produits et des tarifs](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

#### API

Seul un attribut `name` est requis par l’API pour créer un [Product](https://docs.stripe.com/api/products.md). Checkout affiche les attributs `name`, `description` et `images` que vous aurez définis.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

Ensuite, créez un objet [Price](https://docs.stripe.com/api/prices.md) pour définir le tarif de facturation de votre produit. Spécifiez le montant et la devise.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const price = await stripe.prices.create({
  product: '{{PRODUCT_ID}}',
  unit_amount: 2000,
  currency: 'usd',
});
```

#### Dashboard

> Copiez en mode production les produits créés dans un environnement de test afin d’éviter d’avoir à les recréer. Dans la vue détaillée du produit du Dashboard, cliquez sur **Copier en mode production** dans en haut à droite. Vous ne pouvez effectuer cette opération qu’une seule fois pour chaque produit créé dans un environnement de test. Les mises à jour ultérieures du produit de test ne sont pas répercutées sur le produit en mode production.

Assurez-vous d’être dans un environnement de test en cliquant sur **Environnements de test** dans le sélecteur de compte du Dashboard. Ensuite, définissez les articles que vous souhaitez vendre. Pour créer un nouveau produit et un nouveau prix&nbsp;:

- Accédez à la section [Produits](https://dashboard.stripe.com/test/products) du Dashboard.
- Cliquez sur **Ajouter un produit**.
- Sélectionnez **Ponctuel** lors de la définition du tarif.

Checkout affiche le nom, la description et les images du produit que vous aurez définis.

Chaque prix que vous créez possède un identifiant. Lorsque vous créez une session Checkout, faites référence à l’identifiant de prix et à la quantité. Si vous vendez dans plusieurs devises, définissez votre prix comme *multidevise* (A single Price object can support multiple currencies. Each purchase uses one of the supported currencies for the Price, depending on how you use the Price in your integration). Checkout [ détermine automatiquement la devise locale du client ](https://docs.stripe.com/payments/checkout/localize-prices/manual-currency-prices.md) et présente cette devise si le prix la prend en charge.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
});
```

## Optional: Renseigner automatiquement les données client [Côté serveur]

Si vous avez précédemment collecté l’adresse e-mail de votre client et que vous souhaitez la renseigner automatiquement dans la session Checkout, transmettez le paramètre [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) lors de la création de la session.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
});
```

## Optional: Enregistrer les informations de paiement [Côté serveur]

Par défaut, les moyens de paiement utilisés pour effectuer un paiement ponctuel avec Checkout ne sont pas disponibles pour une utilisation ultérieure.

### Enregistrer les moyens de paiement pour les débiter hors session

Vous pouvez configurer Checkout de façon à enregistrer les moyens de paiement utilisés pour effectuer des paiements ponctuels en transmettant l’argument [payment_intent_data.setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage). Cela peut notamment vous permettre de capturer un moyen de paiement pour prélever des frais futurs, comme des frais d’annulation ou de non-présentation.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_creation: 'always',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
  payment_intent_data: {
    setup_future_usage: 'off_session',
  },
});
```

Si vous utilisez Checkout en mode `abonnement`, Stripe enregistre automatiquement le moyen de paiement pour le débiter lors des paiements suivants. Les moyens de paiement par carte bancaire enregistrés pour les clients utilisant les modes `setup_future_usage` ou `abonnement` n’apparaissent pas dans Checkout en cas de nouvel achat effectué par un client connu (plus d’informations à ce sujet plus bas). Nous vous recommandons d’utiliser du [texte personnalisé](https://docs.stripe.com/payments/checkout/custom-components.md#customize-text) pour rediriger vers les conditions pertinentes concernant l’utilisation des informations de paiement enregistrées.

> Les lois internationales en matière de protection de la vie privée sont complexes et nuancées. Nous vous recommandons de contacter votre conseiller juridique et votre équipe chargée de la conformité avant de mettre en œuvre [setup_future_usage](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-setup_future_usage), car cela pourrait impliquer votre cadre de conformité existant en matière de confidentialité. Reportez-vous aux [directives du Comité européen de la protection des données](https://edpb.europa.eu/system/files/2021-05/recommendations022021_on_storage_of_credit_card_data_en_1.pdf) pour en savoir plus sur l’enregistrement des données de paiement.

### Enregistrer les moyens de paiement pour les préremplir dans Checkout

Par défaut, Checkout utilise [Link](https://docs.stripe.com/payments/link/checkout-link.md) pour offrir à vos clients la possibilité d’enregistrer et de réutiliser leurs informations de paiement en toute sécurité. Si vous préférez gérer vous-même les moyens de paiement, utilisez [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) lors de la création d’une Checkout Session. Vos clients pourront ainsi enregistrer leurs moyens de paiement pour leurs futurs achats dans Checkout.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_creation: 'always',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
  saved_payment_method_options: {
    payment_method_save: 'enabled',
  },
});
```

Lorsque vous transmettez ce paramètre en mode [payment](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode) ou [subscription](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-mode), une case à cocher facultative s’affiche, ce qui permet aux clients d’enregistrer explicitement leur moyen de paiement pour leurs futurs achats. Lorsque les clients cochent cette case, Checkout enregistre le moyen de paiement avec [allow_redisplay: always](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay), et utilise ce paramètre pour déterminer si les informations de paiement peuvent être préremplies lors des futurs achats. L’utilisation de `saved_payment_method_options.payment_method_save` ne nécessite pas de transmettre `setup_future_usage` pour enregistrer le moyen de paiement.

> #### Utiliser l’API Accounts v2 pour représenter les clients
> 
> L’API Accounts&nbsp;v2 est généralement disponible pour les utilisateurs de Connect et en aperçu public pour les autres utilisateurs de Stripe. Si vous avez accès à l’aperçu Accounts&nbsp;v2, vous devez [spécifier une version d’aperçu](https://docs.stripe.com/api-v2-overview.md#sdk-and-api-versioning) dans votre code.
> 
> Pour accéder à l’aperçu Accounts&nbsp;v2, rendez-vous sur [aperçus et fonctionnalités de Account](https://dashboard.stripe.com/settings/features/product-previews) dans votre Dashboard et activez **Moyens de paiement réutilisables pour les virements internationaux**.
> 
> Dans la plupart des cas d’usage, nous vous recommandons de [modéliser vos clients en tant qu’objets Account configurés par le client](https://docs.stripe.com/accounts-v2/use-accounts-as-customers.md), plutôt que d’utiliser des objets [Customer](https://docs.stripe.com/api/customers.md).

L’utilisation de [saved_payment_method_options.payment_method_save](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_save) nécessite un objet pour représenter votre client (un `Account` configuré par le client ou un `Customer`). Pour enregistrer un nouveau client, définissez [customer_creation](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_creation) sur `always` dans la Checkout Session. Sinon, la session n’enregistre ni le client ni le moyen de paiement.

Si `payment_method_save` n’est pas transmis ou si le client refuse d’enregistrer le moyen de paiement, Checkout enregistre toujours les moyens de paiement créés en mode '`subscription` ou à l’aide de `setup_future_usage`. La valeur `allow_redisplay` de ces moyens de paiement est définie sur `limited`, ce qui évite que les informations de paiement soient préremplies pour les futurs achats et vous permet de vous conformer aux règles des réseaux de cartes et aux réglementations en matière de protection des données. Découvrez comment [modifier le comportement par défaut activé par ces modes](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout) et comment modifier ou remplacer le comportement `allow_redisplay`.

> Vous pouvez utiliser Checkout pour enregistrer des cartes et d’autres moyens de paiement afin de les débiter hors session, mais Checkout ne remplit automatiquement que les données des cartes enregistrées. Découvrez comment [remplir automatiquement les données des cartes enregistrées](https://support.stripe.com/questions/prefilling-saved-cards-in-checkout). Pour enregistrer un moyen de paiement sans paiement initial, [utilisez Checkout en mode configuration](https://docs.stripe.com/payments/save-and-reuse.md?platform=checkout).

### Autoriser les clients à supprimer des moyens de paiement enregistrés

Pour permettre à vos clients de supprimer un moyen de paiement enregistré de sorte qu’il ne s’affiche plus pour les paiements ultérieurs, utilisez [saved_payment_method_options.payment_method_remove](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-saved_payment_method_options-payment_method_remove) lors de la création d’une session Checkout.

#### Accounts v2

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_account: '{{CUSTOMERACCOUNT_ID}}',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
  saved_payment_method_options: {
    payment_method_remove: 'enabled',
  },
});
```

#### Customers v1

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer: '{{CUSTOMER_ID}}',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
  saved_payment_method_options: {
    payment_method_remove: 'enabled',
  },
});
```

Le client ne peut pas supprimer un moyen de paiement associé à un abonnement actif s’il ne dispose pas d’un moyen de paiement par défaut enregistré pour les paiements de factures et d’abonnements.

## Optional: Gérer les comptes clients [No-code]

Offrez à vos clients la possibilité de [gérer](https://docs.stripe.com/customer-management.md) leurs propres comptes en partageant un lien vers votre *portail client* (The customer portal is a secure, Stripe-hosted page that lets your customers manage their subscriptions and billing details). Le portail client permet aux clients de se connecter avec leur adresse e-mail pour gérer leurs abonnements, mettre à jour leurs moyens de paiement, etc.

## Optional: Autorisation et capture distinctes [Côté serveur]

Stripe prend en charge les paiements par carte bancaire en deux étapes&nbsp;: vous pouvez d’abord autoriser la carte, puis capturer les fonds plus tard. Lorsqu’un paiement est autorisé par Stripe, l’émetteur de la carte garantit les fonds et réserve le montant correspondant sur la carte du client. Vous disposez ensuite d’un délai spécifique, [selon la carte](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations), pour capturer les fonds. Si la capture n’est pas effectuée avant l’expiration de l’autorisation, le paiement est annulé et les fonds réservés sont libérés par l’émetteur.

La séparation de l’autorisation et de la capture est utile si vous devez effectuer des actions supplémentaires entre la confirmation de la solvabilité du client et la collecte du paiement. Par exemple, si vous vendez des articles dont le stock est limité, vous devrez peut-être vérifier qu’un élément acheté par votre client via Checkout est toujours disponible avant de capturer son paiement et d’exécuter la commande. Pour ce faire, procédez comme suit&nbsp;:

1. Vérifiez que Stripe a autorisé le moyen de paiement du client.
1. Consultez votre système de gestion des stocks pour vous assurer que l’article est toujours disponible.
1. Mettez à jour votre système de gestion des stocks pour indiquer qu’un client a acheté l’article.
1. Capturez le paiement du client.
1. Indiquez au client si l’achat a réussi sur votre page de confirmation.

Pour indiquer que vous voulez séparer l’autorisation de la capture, définissez la valeur de l’option [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) sur `manual` lorsque vous créez la session Checkout. Ce paramètre indique à Stripe de se contenter d’autoriser le montant sur la carte du client.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  mode: 'payment',
  payment_intent_data: {
    capture_method: 'manual',
  },
  ui_mode: 'embedded_page',
  return_url: 'https://example.com/return',
});
```

Pour capturer un paiement qui a été autorisé, vous pouvez utiliser le [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) ou l’endpoint de [capture](https://docs.stripe.com/api/payment_intents/capture.md). La capture de paiements par voie programmatique implique d’accéder au PaymentIntent créé lors de la session Checkout, que vous pouvez obtenir à partir de l’objet [Session](https://docs.stripe.com/api/payment_intents/capture.md).

## Optional: Traitement des commandes

Découvrez comment [recevoir une notification par voie programmatique](https://docs.stripe.com/checkout/fulfillment.md) chaque fois qu’un client effectue un paiement.

## See also

- [Ajouter des réductions](https://docs.stripe.com/payments/checkout/discounts.md)
- [Collecte des taxes](https://docs.stripe.com/payments/checkout/taxes.md)
- [Collecte des numéros fiscaux](https://docs.stripe.com/tax/checkout/tax-ids.md)
- [Ajouter des frais de livraison](https://docs.stripe.com/payments/collect-addresses.md?payment-ui=checkout)
- [Personnaliser l’adaptation à votre marque](https://docs.stripe.com/payments/checkout/customization.md)


# API Checkout Sessions


Créez un formulaire de paiement personnalisé en utilisant [Stripe&nbsp;Elements](https://docs.stripe.com/payments/elements.md) et l’API [Checkout&nbsp;Sessions](https://docs.stripe.com/api/checkout/sessions.md). Découvrez comment cette intégration [ se compare aux autres types d’intégration de Stripe](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability).

L’API Checkout&nbsp;Sessions fournit une prise en charge intégrée pour le calcul des taxes, les remises, les frais d’expédition et la conversion des devises, ce qui réduit la quantité de code personnalisé que vous devez écrire. Il s’agit de l’approche recommandée pour la plupart des intégrations. Découvrez [quand utiliser Checkout&nbsp;Sessions plutôt que PaymentIntents](https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison.md).

Le code côté client et côté serveur crée un formulaire de paiement qui accepte différents moyens de paiement.

#### Effort d’intégration
Complexity: 3/5
#### Type d’intégration

Combinez des composants d’interface utilisateur dans un tunnel de paiement personnalisé

#### Personnalisation de l’interface utilisateur

Personnalisation au niveau CSS avec l’[API Appearance](https://docs.stripe.com/elements/appearance-api.md)

## Configurer le serveur [Côté serveur]

Utilisez les bibliothèques officielles de Stripe pour accéder à l’API depuis votre application.

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

## Créer une session Checkout [Côté serveur]

Ajoutez un endpoint à votre serveur qui crée une [Checkout Session](https://docs.stripe.com/api/checkout/sessions/create.md) et renvoie sa [`client_secret`](https://docs.stripe.com/api/checkout/sessions/object.md#checkout_session_object-client_secret) à votre front-end. Une Checkout Session représente la session d’un client lors d’un paiement ponctuel ou d’un abonnement. Les Checkout Sessions expirent 24&nbsp;heures après leur création.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  ui_mode: 'elements',
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'T-shirt',
        },
        unit_amount: 2000,
      },
      quantity: 1,
    },
  ],
  mode: 'payment',
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

## Configurer le front-end [Côté client]

#### HTML + JS

Intégrez le script Stripe.js à votre page de paiement en l’ajoutant entre les balises `head` de votre fichier HTML. Chargez toujours Stripe.js directement à partir de js.stripe.com pour maintenir votre conformité PCI. Vous ne devez pas inclure le script dans un lot ni en héberger de copie.

Assurez-vous d’utiliser la dernière version Stripe.js. En savoir plus sur le [contrôle des versions Stripe.js](https://docs.stripe.com/sdks/stripejs-versioning.md).

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/dahlia/stripe.js"></script>
</head>
```

> Stripe propose un paquet npm que vous pouvez utiliser pour charger Stripe.js en tant que module. Consultez le [projet sur GitHub](https://github.com/stripe/stripe-js). La version [7.0.0](https://www.npmjs.com/package/%40stripe/stripe-js/v/7.0.0) ou une version ultérieure est requise.

Initialisez stripe.js.

```js
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe(
  '<<YOUR_PUBLISHABLE_KEY>>',
);
```

#### React

Installez [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) et le [chargeur Stripe.js](https://www.npmjs.com/package/@stripe/stripe-js) à partir du registre public npm. Vous avez besoin d’au moins la version&nbsp;5.0.0 pour React Stripe.js et la version&nbsp;8.0.0 pour le chargeur Stripe.js.

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

Initialisez une instance `stripe` sur votre front-end avec votre clé publique.

```javascript
import {loadStripe} from '@stripe/stripe-js';
const stripe = loadStripe("<<YOUR_PUBLISHABLE_KEY>>");
```

## Initialiser Checkout [Côté client]

#### HTML + JS

Appelez [initCheckoutElementsSdk](https://docs.stripe.com/js/custom_checkout/init), en transmettant `clientSecret`.

`initCheckoutElementsSdk` renvoie un objet [Checkout](https://docs.stripe.com/js/custom_checkout) contenant les données de la Session Checkout et les méthodes pour les mettre à jour.

Lisez le `total` et les `lineItems` de [actions.getSession()](https://docs.stripe.com/js/custom_checkout/session), et affichez-les dans votre interface utilisateur. Cela vous permet d’activer de nouvelles fonctionnalités avec un minimum de modifications de code. Par exemple, l’ajout de [prix manuels des devises](https://docs.stripe.com/payments/custom/localize-prices/manual-currency-prices.md) ne nécessite aucune modification de l’interface utilisateur si vous affichez le `total`.

```html
<div id="checkout-container"></div>
```

```javascript
const clientSecret = fetch('/create-checkout-session', {method: 'POST'})
  .then((response) => response.json())
  .then((json) => json.client_secret);

const checkout = stripe.initCheckoutElementsSdk({clientSecret});
const loadActionsResult = await checkout.loadActions();

if (loadActionsResult.type === 'success') {
  const session = loadActionsResult.actions.getSession();
  const checkoutContainer = document.getElementById('checkout-container');

  checkoutContainer.append(JSON.stringify(session.lineItems, null, 2));
  checkoutContainer.append(document.createElement('br'));
  checkoutContainer.append(`Total: ${session.total.total.amount}`);
}
```

#### React

Encapsulez votre application avec le composant [CheckoutElementsProvider](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider), en lui transmettant `clientSecret` et l’instance `stripe`.

```jsx
import React from 'react';
import {CheckoutElementsProvider} from '@stripe/react-stripe-js/checkout';
import CheckoutForm from './CheckoutForm';

const clientSecret = fetch('/create-checkout-session', {method: 'POST'})
  .then((response) => response.json())
  .then((json) => json.client_secret);

const App = () => {
  return (
    <CheckoutElementsProvider
      stripe={stripe}options={{clientSecret}}
    >
      <CheckoutForm />
    </CheckoutElementsProvider>
  );
};

export default App;
```

Accédez à l’objet [Checkout](https://docs.stripe.com/js/custom_checkout) dans votre composant de formulaire de paiement en utilisant le hook `useCheckoutElements()`. L’objet `Checkout` contient les données de la Checkout Session et les méthodes pour la mettre à jour.

Lisez le `total` et les `lineItems` de l’objet `Checkout`, et affichez-les dans votre interface utilisateur. Cela vous permet d’activer des fonctionnalités avec un minimum de modifications de code. Par exemple, l’ajout de [prix manuels des devises](https://docs.stripe.com/payments/custom/localize-prices/manual-currency-prices.md) ne nécessite aucune modification de l’interface utilisateur si vous affichez le `total`.

```jsx
import React from 'react';
import {useCheckoutElements} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {const checkoutState = useCheckoutElements();

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  return (
    <form>{JSON.stringify(checkoutState.checkout.lineItems, null, 2)}
      {/* A formatted total amount */}
      Total: {checkoutState.checkout.total.total.amount}
    </form>
  );
};
```

## Collecter les adresses e-mail des clients [Côté client]

#### HTML + JS

Vous devez fournir une adresse e-mail client valide lors d’une Checkout Session.

Utilisez le [composant Element Contact Details](https://docs.stripe.com/js/custom_checkout/create_contact_details_element) pour collecter l’adresse e-mail de votre client. Il gère la collecte et la validation des adresses e-mail à votre place et aide les clients à se connecter à Link.

Vous pouvez également&nbsp;:

- Transmettez [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email), [customer_account](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_account) (pour les clients représentés en tant qu’objets `Account` configurés par le client) ou [customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) (pour les clients représentés en tant qu’objets `Customer`) lors de la création de la Checkout Session. Stripe valide les e-mails fournis de cette manière.
  - Ceux-ci préremplissent la session avec un e-mail que les clients ne peuvent pas modifier sur la page de paiement. Si vous souhaitez préremplir avec un e-mail modifiable, utilisez [defaultValues.email](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-defaultValues-email) lors de l’initialisation de Checkout.
- Transmettez une adresse e-mail que vous avez déjà validé sur [updateEmail](https://docs.stripe.com/js/custom_checkout/update_email) ou [checkout.confirm](https://docs.stripe.com/js/custom_checkout/confirm).

```html
<div id="contact-details-element">
  <!--Stripe.js injects the Contact Details Element-->
</div>
```

```javascript
const contactDetailsElement = checkout.createContactDetailsElement();
contactDetailsElement.mount("#contact-details-element");
```

#### React

Vous devez fournir une adresse e-mail client valide lors d’une Checkout Session.

Utilisez [ContactDetailsElement](https://docs.stripe.com/js/react_stripe_js/checkout/contact_details_element) pour collecter l’adresse e-mail de votre client. Cet élément gère la collecte et la validation des adresses e-mails à votre place et aide les clients à se connecter à Link.

Vous pouvez également&nbsp;:

- Transmettez [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email), [customer_account](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_account) (pour les clients représentés en tant qu’objets `Account` configurés par le client) ou [customer](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer) (pour les clients représentés en tant qu’objets `Customer`) lors de la création de la Checkout Session. Stripe valide les e-mails fournis de cette manière.
  - Ceux-ci préremplissent la session avec un e-mail que les clients ne peuvent pas modifier sur la page de paiement. Si vous souhaitez préremplir avec un e-mail modifiable, utilisez [defaultValues.email](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-defaultValues-email) lors de l’initialisation de Checkout.
- Transmettez une adresse e-mail que vous avez déjà validé sur [updateEmail](https://docs.stripe.com/js/react_stripe_js/checkout/update_email) ou [confirm](https://docs.stripe.com/js/react_stripe_js/checkout/confirm).

```jsx
import {ContactDetailsElement} from '@stripe/react-stripe-js/checkout';

// Inside your CheckoutForm component:
<ContactDetailsElement/>
```

## Collecter les informations de paiement [Côté client]

Collectez les informations de paiement de votre client à l’aide de [Payment Element](https://docs.stripe.com/payments/payment-element.md). Payment Element est un composant d’interface utilisateur préconfiguré qui simplifie la collecte des informations pour de nombreux moyens de paiement.

Le Payment&nbsp;Element contient un iframe qui envoie les informations de paiement à Stripe de manière sécurisée via une connexion HTTPS. Évitez de placer le Payment&nbsp;Element dans un autre iframe, car certains moyens de paiement nécessitent une redirection vers une autre page pour la confirmation du paiement.

Si vous choisissez d’utiliser un iframe et que vous souhaitez accepter Apple Pay ou Google Pay, l’attribut [allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-allowpaymentrequest) de l’iframe doit être défini sur égal à `"payment *"`.

Pour que votre intégration fonctionne, l’adresse de la page de paiement doit commencer par `https://` et non par `http://`. Vous pouvez tester votre intégration sans utiliser le protocole HTTPS, mais n’oubliez pas de l’[activer](https://docs.stripe.com/security/guide.md#tls) lorsque vous souhaitez commencer à accepter des paiements réels.

#### HTML + JS

Tout d’abord, créez un élément DOM de conteneur pour monter le composant [Payment Element](https://docs.stripe.com/payments/payment-element.md). Créez ensuite une instance du `Payment Element` à l’aide de [checkout.createPaymentElement](https://docs.stripe.com/js/custom_checkout/create_payment_element) et montez-la en appelant [element.mount](https://docs.stripe.com/js/element/mount) et en fournissant soit un sélecteur CSS, soit l’élément DOM du conteneur.

```html
<div id="payment-element"></div>
```

```javascript
const paymentElement = checkout.createPaymentElement();
paymentElement.mount('#payment-element');
```

Consultez la [documentation Stripe.js](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) pour connaître les options prises en charge.

Vous pouvez [personnaliser l’apparence](https://docs.stripe.com/payments/checkout/customization/appearance.md) de tous les Elements en transmettant [elementsOptions.appearance](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-elementsOptions-appearance) lors de l’initialisation de Checkout sur le front-end.

#### React

Montez le composant [Payment Element](https://docs.stripe.com/payments/payment-element.md) dans le [CheckoutElementsProvider](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider).

```jsx
import React from 'react';import {PaymentElement, useCheckoutElements} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  const checkoutState = useCheckoutElements();

  if (checkoutState.type === 'loading') {
    return (
      <div>Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  return (
    <form>

      {JSON.stringify(checkoutState.checkout.lineItems, null, 2)}
      {/* A formatted total amount */}
      Total: {checkoutState.checkout.total.total.amount}
<PaymentElement options={{layout: 'accordion'}}/>
    </form>
  );
};

export default CheckoutForm;
```

Consultez la [documentation Stripe.js](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options) pour connaître les options prises en charge.

Vous pouvez [personnaliser l’apparence](https://docs.stripe.com/payments/checkout/customization/appearance.md) de tous les Elements en transmettant [elementsOptions.appearance](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider#react_checkout_provider-options-elementsOptions-appearance) au composant [CheckoutElementsProvider](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider).

## Envoyer le paiement [Côté client]

#### HTML + JS

Affichez un bouton **Payer** qui appelle [confirm](https://docs.stripe.com/js/custom_checkout/confirm) depuis l’instance `Checkout` pour soumettre le paiement.

```html
<button id="pay-button">Pay</button>
<div id="confirm-errors"></div>
```

```js
const checkout = stripe.initCheckoutElementsSdk({clientSecret});

checkout.on('change', (session) => {
  document.getElementById('pay-button').disabled = !session.canConfirm;
});

const loadActionsResult = await checkout.loadActions();

if (loadActionsResult.type === 'success') {
  const {actions} = loadActionsResult;
  const button = document.getElementById('pay-button');
  const errors = document.getElementById('confirm-errors');
  button.addEventListener('click', () => {
    // Clear any validation errors
    errors.textContent = '';

    actions.confirm().then((result) => {
      if (result.type === 'error') {
        errors.textContent = result.error.message;
      }
    });
  });
}
```

#### React

Affichez un bouton **Payer** qui appelle [confirm](https://docs.stripe.com/js/custom_checkout/confirm) depuis [useCheckoutElements](https://docs.stripe.com/js/react_stripe_js/checkout/use_checkout_elements) pour soumettre le paiement.

```jsx
import React from 'react';
import {useCheckoutElements} from '@stripe/react-stripe-js/checkout';

const PayButton = () => {
  const checkoutState = useCheckoutElements();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  if (checkoutState.type !== "success") {
    return null;
  }

  const handleClick = () => {
    setLoading(true);checkoutState.checkout.confirm().then((result) => {
      if (result.type === 'error') {
        setError(result.error)
      }
      setLoading(false);
    })
  };

  return (
    <div>
      <button disabled={!checkoutState.checkout.canConfirm || loading} onClick={handleClick}>
        Pay
      </button>
      {error && <div>{error.message}</div>}
    </div>
  )
};

export default PayButton;
```

## Tester votre intégration

1. Accédez à votre page de paiement.
1. Renseignez les informations d’un moyen de paiement du tableau suivant. Pour les paiements par carte&nbsp;:
   - Saisissez une date d’expiration postérieure à la date du jour.
   - Saisissez un code CVC à 3&nbsp;chiffres.
   - Saisissez un code postal de facturation.
1. Envoyez le paiement à Stripe.
1. Accédez au Dashboard et recherchez le paiement sur la page [Transactions](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). Si votre paiement a abouti, il apparaîtra dans cette liste.
1. Cliquez sur votre paiement afin d’afficher plus d’informations (par exemple, les informations de facturation et la liste des articles achetés). Vous pouvez utiliser ces informations pour [traiter la commande](https://docs.stripe.com/checkout/fulfillment.md).

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Portefeuilles

| Moyen de paiement | Scénario                                                                                                                                                                   | Méthode de test                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alipay            | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification immédiate](https://docs.stripe.com/payments/payment-methods.md#payment-notification). | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche. |

#### Virements avec redirection bancaire

| Moyen de paiement                    | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prélèvement automatique BECS         | Le montant dû est réglé par prélèvement automatique BECS.                                                                                                                                                              | Remplissez le formulaire à l’aide du numéro de compte `900123456` et du BSB `000000`.La confirmation de la demande de PaymentIntent passe d’abord à l’état `processing`, puis à l’état `succeeded` trois minutes plus tard. |
| Prélèvement automatique BECS         | Le paiement de votre client échoue avec un code d’erreur `account_closed`.                                                                                                                                             | Remplissez le formulaire à l’aide du numéro de compte `111111113` et du BSB `000000`.                                                                                                                                       |
| Bancontact, EPS, iDEAL et Przelewy24 | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                       |
| Pay by Bank                          | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                                            |
| Pay by Bank                          | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                                        |
| BLIK                                 | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                                            |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

#### Coupons

| Moyen de paiement | Scénario                                           | Méthode de test                                                                                                           |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Boleto, OXXO      | Le montant dû est réglé par coupon Boleto ou OXXO. | Sélectionnez Boleto ou OXXO comme moyen de paiement, puis envoyez le paiement. Fermez la boîte de dialogue qui s’affiche. |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Créer des produits et tarifs

Avant de créer une session Checkout, vous pouvez directement créer des *produits* (Products represent what your business sells—whether that's a good or a service) et des *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions). Utilisez les produits pour représenter différents biens physiques ou niveaux de service, et les *tarifs* (Prices define how much and how often to charge for products. This includes how much the product costs, what currency to use, and the interval if the price is for subscriptions) pour représenter le tarif de chaque produit. Vous pouvez [configurer votre session Checkout](https://docs.stripe.com/payments/checkout/pay-what-you-want.md) pour accepter les pourboires et les dons, ou vendre des produits et services à prix libre.

Par exemple, vous pouvez créer un T-shirt vendu au tarif de 20&nbsp;USD. Cela vous permet de mettre à jour et d’ajouter des tarifs sans avoir à modifier les détails de vos produits sous-jacents. Vous pouvez créer des produits et des tarifs à l’aide du Dashboard ou de l’API Stripe. En savoir plus sur [le fonctionnement des produits et des tarifs](https://docs.stripe.com/products-prices/how-products-and-prices-work.md).

#### API

Seul un attribut `name` est requis par l’API pour créer un [Product](https://docs.stripe.com/api/products.md). Checkout affiche les attributs `name`, `description` et `images` que vous aurez définis.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const product = await stripe.products.create({
  name: 'T-shirt',
});
```

Ensuite, créez un objet [Price](https://docs.stripe.com/api/prices.md) pour définir le tarif de facturation de votre produit. Spécifiez le montant et la devise.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const price = await stripe.prices.create({
  product: '{{PRODUCT_ID}}',
  unit_amount: 2000,
  currency: 'usd',
});
```

#### Dashboard

> Copiez en mode production les produits créés dans un environnement de test afin d’éviter d’avoir à les recréer. Dans la vue détaillée du produit du Dashboard, cliquez sur **Copier en mode production** dans en haut à droite. Vous ne pouvez effectuer cette opération qu’une seule fois pour chaque produit créé dans un environnement de test. Les mises à jour ultérieures du produit de test ne sont pas répercutées sur le produit en mode production.

Assurez-vous d’être dans un environnement de test en cliquant sur **Environnements de test** dans le sélecteur de compte du Dashboard. Ensuite, définissez les articles que vous souhaitez vendre. Pour créer un nouveau produit et un nouveau prix&nbsp;:

- Accédez à la section [Produits](https://dashboard.stripe.com/test/products) du Dashboard.
- Cliquez sur **Ajouter un produit**.
- Sélectionnez **Ponctuel** lors de la définition du tarif.

Checkout affiche le nom, la description et les images du produit que vous aurez définis.

Chaque prix que vous créez possède un identifiant. Lorsque vous créez une session Checkout, faites référence à l’identifiant de prix et à la quantité. Si vous vendez dans plusieurs devises, définissez votre prix comme *multidevise* (A single Price object can support multiple currencies. Each purchase uses one of the supported currencies for the Price, depending on how you use the Price in your integration). Checkout [ détermine automatiquement la devise locale du client ](https://docs.stripe.com/payments/checkout/localize-prices/manual-currency-prices.md) et présente cette devise si le prix la prend en charge.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  ui_mode: 'elements',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

## Optional: Renseigner automatiquement les données client [Côté serveur]

Si vous avez précédemment collecté l’adresse e-mail de votre client et que vous souhaitez la renseigner automatiquement dans la session Checkout, transmettez le paramètre [customer_email](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-customer_email) lors de la création de la session.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  customer_email: 'customer@example.com',
  ui_mode: 'elements',
  mode: 'payment',
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  return_url: 'https://example.com/return?session_id={CHECKOUT_SESSION_ID}',
});
```

## Optional: Enregistrer les informations de paiement

Découvrez comment [accepter un paiement et enregistrer le moyen de paiement de votre client](https://docs.stripe.com/payments/save-during-payment.md) pour les futurs achats.

## Optional: Écouter les modifications de session Checkout

### Écouter les modifications de session Checkout

Vous pouvez écouter les modifications apportées à la [session Checkout](https://docs.stripe.com/api/checkout/sessions.md) en ajoutant un écouteur d’événement sur l’événement `change` avec [checkout.on](https://docs.stripe.com/js/custom_checkout/change_event).

#### HTML + JS

```javascript
checkout = stripe.initCheckoutElementsSdk({
  clientSecret: promise,
  elementsOptions: { appearance },
});

checkout.on('change', (session) => {
  // Handle changes to the checkout session
});
```

#### React

```jsx
import React from 'react';
import { useCheckoutElements } from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  const checkoutState = useCheckoutElements();
  if (checkoutState.type === 'success') {
    checkoutState.checkout.on('change', (session) => {
      // Handle changes to the checkout session
    });
  }
};
```

## Optional: Recueillir les adresses de facturation et de livraison

## Collecter une adresse de facturation

Par défaut, une session Checkout collecte les informations de facturation minimales requises pour le paiement via le Payment Element.

### Utiliser le Billing Address Element

Vous pouvez collecter des adresses de facturation complètes à l’aide du composant Billing Address Element.

Tout d’abord, transmettez [billing_address_collection=required](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection) lors de la création de la session Checkout.

#### HTML + JS

Créez un élément DOM conteneur pour monter le composant Billing Address Element. Créez ensuite une instance de Billing Address Element à l’aide de [checkout.createBillingAddressElement](https://docs.stripe.com/js/custom_checkout/create_billing_address_element) et montez-la en appelant [element.mount](https://docs.stripe.com/js/element/mount), et en fournissant soit un sélecteur CSS, soit l’élément DOM du conteneur.

```html
<div id="billing-address"></div>
```

```javascript
const billingAddressElement = checkout.createBillingAddressElement();
billingAddressElement.mount('#billing-address');
```

Le composant Billing Address Element prend en charge les options suivantes&nbsp;:

- [personnes-ressources](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [affichage](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

#### React

Montez le composant `BillingAddressElement` dans le `CheckoutElementsProvider`.

```jsx
import React from 'react';
import {BillingAddressElement} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  return (
    <form>
      <BillingAddressElement/>
    </form>
  )
};
```

Le composant Billing Address Element prend en charge les propriétés suivantes&nbsp;:

- [personnes-ressources](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-contacts)
- [affichage](https://docs.stripe.com/js/custom_checkout/create_billing_address_element#custom_checkout_create_billing_address_element-options-display)

### Utiliser un formulaire personnalisé

Vous pouvez créer votre propre formulaire pour collecter les adresses de facturation.

- Si votre page de paiement comporte une étape distincte de collecte d’adresses avant confirmation, appelez [updateBillingAddress](https://docs.stripe.com/js/react_stripe_js/checkout/update_billing_address) lorsque votre client envoie l’adresse.
- Vous pouvez également envoyer l’adresse lorsque votre client clique sur le bouton «&nbsp;Payer&nbsp;» en transmettant [billingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-billingAddress) à [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

### Collecter des adresses de facturation partielles

Pour collecter des adresses de facturation partielles, telles que le pays et le code postal seulement, transmettez [billing_address_collection=auto](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-billing_address_collection).

Lors de la collecte d’adresses de facturation partielles, vous devez [collecter les adresses manuellement](https://docs.stripe.com/payments/accept-a-payment.md#collect-billing-addresses-manually). Par défaut, le Payment Element collecte automatiquement les informations de facturation minimales requises pour le paiement. Pour éviter la double collecte des informations de facturation, transmettez [fields.billingDetails=never](https://docs.stripe.com/js/custom_checkout/create_payment_element#custom_checkout_create_payment_element-options-fields-billingDetails) lors de la création du Payment Element. Si vous avez l’intention de collecter uniquement un sous-ensemble d’informations de facturation (telles que le nom du client), ne transmettez `never` que pour les champs que vous avez l’intention de collecter vous-même.

## Collecter une adresse de livraison

Pour collecter l’adresse de livraison d’un client, transmettez le paramètre [shipping_address_collection](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection) lors de la création de la session Checkout.

Lorsque vous collectez une adresse de livraison, vous devez également préciser les pays pour lesquels vous autorisez la livraison. Configurez la propriété [allowed_countries](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-shipping_address_collection-allowed_countries) à l’aide du tableau des [codes pays ISO à deux lettres](https://www.nationsonline.org/oneworld/country_code_list.htm).

### Comment utiliser le composant Element Shipping Address

Vous pouvez collecter des adresses de livraison complètes à l’aide du composant Shipping Address Element.

#### HTML + JS

Créez un élément DOM de conteneur pour monter le composant Shipping Address Element. Créez ensuite une instance de Shipping Address Element à l’aide de [checkout.createShippingAddressElement](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element) et montez-la en appelant [element.mount](https://docs.stripe.com/js/element/mount) et en fournissant soit un sélecteur CSS, soit l’élément DOM du conteneur.

```html
<div id="shipping-address"></div>
```

```javascript
const shippingAddressElement = checkout.createShippingAddressElement();
shippingAddressElement.mount('#shipping-address');
```

Le composant Shipping Address Element prend en charge les options suivantes&nbsp;:

- [personnes-ressources](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [affichage](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

#### React

Montez le composant `ShippingAddressElement` dans le `CheckoutElementsProvider`.

```jsx
import React from 'react';
import {ShippingAddressElement} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  return (
    <form>
      <ShippingAddressElement/>
    </form>
  )
};
```

Le composant Shipping Address Element prend en charge les propriétés suivantes&nbsp;:

- [personnes-ressources](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-contacts)
- [affichage](https://docs.stripe.com/js/custom_checkout/create_shipping_address_element#custom_checkout_create_shipping_address_element-options-display)

### Écouter les modifications de session Checkout

Vous pouvez écouter les modifications apportées à la [session Checkout](https://docs.stripe.com/api/checkout/sessions.md) en ajoutant un écouteur d’événements pour gérer les changements liés à l’adresse.

#### HTML + JS

Utilisez l’[objet Session](https://docs.stripe.com/js/custom_checkout/session_object) pour afficher le montant des frais de livraison dans votre formulaire de paiement.

```html
<div>
  <h3> Totals </h3>
  <div id="subtotal" ></div>
  <div id="shipping" ></div>
  <div id="total" ></div>
</div>
```

```javascript
const checkout = stripe.initCheckoutElementsSdk({clientSecret});
const subtotal = document.getElementById('subtotal');
const shipping = document.getElementById('shipping');
const total = document.getElementById('total');

checkout.on('change', (session) => {
  subtotal.textContent = `Subtotal: ${session.total.subtotal.amount}`;
  shipping.textContent = `Shipping: ${session.total.shippingRate.amount}`;
  total.textContent = `Total: ${session.total.total.amount}`;
});

```

#### React

Utilisez [useCheckoutElements](https://docs.stripe.com/js/react_stripe_js/checkout/use_checkout_elements) pour afficher les frais de port dans votre formulaire de paiement.

```jsx
import React from 'react';
import {useCheckoutElements, ShippingAddressElement} from '@stripe/react-stripe-js/checkout';

const CheckoutForm = () => {
  const checkoutState = useCheckoutElements();

  if (checkoutState.type === 'error') {
    return (
      <div>Error: {checkoutState.error.message}</div>
    );
  }

  return (
    <div>
      <div>
        <form>
          <ShippingAddressElement />
        </form>
      </div>
      <div>
        <h2>Checkout Summary</h2>
        {checkoutState.type === 'success' && (
          <>
            <pre>
              {JSON.stringify(checkoutState.checkout.lineItems, null, 2)}
            </pre>
            <h3>Totals</h3>
            <pre>
              Subtotal: {checkoutState.checkout.total.subtotal.amount}
              Shipping: {checkoutState.checkout.total.shippingRate.amount}
              Total: {checkoutState.checkout.total.total.amount}
            </pre>
          </>
        )}
      </div>
    </div>
  )
};
```

### Synchroniser les adresses de facturation et de livraison

Lorsque vous utilisez à la fois un composant Element Billing Address et un composant Element Shipping Address, vous pouvez afficher une case à cocher qui permet aux clients de synchroniser leurs adresses de facturation et de livraison.

#### HTML + JS

Transmettez l’option [syncAddressCheckbox](https://docs.stripe.com/js/custom_checkout/init#custom_checkout_init-options-elementsOptions-syncAddressCheckbox) dans `elementsOptions` lors de l’initialisation du paiement pour configurer le composant Element Address qui affiche la case à cocher.

```javascript
const checkout = stripe.initCheckoutElementsSdk({
  clientSecret,
  elementsOptions: {
    syncAddressCheckbox: 'shipping',
  },
});
```

#### React

Transmettez l’option [syncAddressCheckbox](https://docs.stripe.com/js/react_stripe_js/checkout/checkout_provider#react_checkout_provider-options-elementsOptions-syncAddressCheckbox) dans `elementsOptions` au `CheckoutElementsProvider` afin de configurer quel Address Element affiche la case à cocher.

```jsx
<CheckoutElementsProvider
  stripe={stripePromise}
  options={{
    fetchClientSecret: () => promise,
    elementsOptions: {
      syncAddressCheckbox: 'shipping',
    },
  }}
>
  <CheckoutForm />
</CheckoutElementsProvider>
```

Définissez la valeur sur `’billing’` ou `’shipping’` pour choisir quel élément d’adresse affiche la case à cocher. Définissez-la sur `’none’` pour masquer la case à cocher, ou laissez le champ vide pour utiliser la valeur par défaut (`’billing’`).

### Utiliser un formulaire personnalisé

Vous pouvez créer votre propre formulaire pour collecter les adresses de livraison.

- Si votre page de paiement comporte une étape distincte de collecte d’adresse avant confirmation, appelez [updateShippingAddress](https://docs.stripe.com/js/react_stripe_js/checkout/update_shipping_address) lorsque votre client envoie l’adresse.
- Vous pouvez également envoyer l’adresse lorsque votre client clique sur le bouton «&nbsp;Payer&nbsp;» en transmettant [shippingAddress](https://docs.stripe.com/js/custom_checkout/confirm#custom_checkout_session_confirm-options-shippingAddress) à [confirm](https://docs.stripe.com/js/custom_checkout/confirm).

## Optional: Autorisation et capture distinctes [Côté serveur]

Stripe prend en charge les paiements par carte bancaire en deux étapes&nbsp;: vous pouvez d’abord autoriser la carte, puis capturer les fonds plus tard. Lorsqu’un paiement est autorisé par Stripe, l’émetteur de la carte garantit les fonds et réserve le montant correspondant sur la carte du client. Vous disposez ensuite d’un délai spécifique, [selon la carte](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method.md#auth-capture-limitations), pour capturer les fonds. Si la capture n’est pas effectuée avant l’expiration de l’autorisation, le paiement est annulé et les fonds réservés sont libérés par l’émetteur.

La séparation de l’autorisation et de la capture est utile si vous devez effectuer des actions supplémentaires entre la confirmation de la solvabilité du client et la collecte du paiement. Par exemple, si vous vendez des articles dont le stock est limité, vous devrez peut-être vérifier qu’un élément acheté par votre client via Checkout est toujours disponible avant de capturer son paiement et d’exécuter la commande. Pour ce faire, procédez comme suit&nbsp;:

1. Vérifiez que Stripe a autorisé le moyen de paiement du client.
1. Consultez votre système de gestion des stocks pour vous assurer que l’article est toujours disponible.
1. Mettez à jour votre système de gestion des stocks pour indiquer qu’un client a acheté l’article.
1. Capturez le paiement du client.
1. Indiquez au client si l’achat a réussi sur votre page de confirmation.

Pour indiquer que vous voulez séparer l’autorisation de la capture, définissez la valeur de l’option [payment_intent_data.capture_method](https://docs.stripe.com/api/checkout/sessions/create.md#create_checkout_session-payment_intent_data-capture_method) sur `manual` lorsque vous créez la session Checkout. Ce paramètre indique à Stripe de se contenter d’autoriser le montant sur la carte du client.

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const session = await stripe.checkout.sessions.create({
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 1,
    },
  ],
  mode: 'payment',
  payment_intent_data: {
    capture_method: 'manual',
  },
  return_url: '{{RETURN_URL}}',
  ui_mode: 'elements',
});
```

Pour capturer un paiement qui a été autorisé, vous pouvez utiliser le [Dashboard](https://dashboard.stripe.com/test/payments?status%5B%5D=uncaptured) ou l’endpoint de [capture](https://docs.stripe.com/api/payment_intents/capture.md). La capture de paiements par voie programmatique implique d’accéder au PaymentIntent créé lors de la session Checkout, que vous pouvez obtenir à partir de l’objet [Session](https://docs.stripe.com/api/payment_intents/capture.md).

## Optional: Gérer les comptes clients [No-code]

Offrez à vos clients la possibilité de [gérer](https://docs.stripe.com/customer-management.md) leurs propres comptes en partageant un lien vers votre *portail client* (The customer portal is a secure, Stripe-hosted page that lets your customers manage their subscriptions and billing details). Le portail client permet aux clients de se connecter avec leur adresse e-mail pour gérer leurs abonnements, mettre à jour leurs moyens de paiement, etc.

## Optional: Traitement des commandes

Découvrez comment [recevoir une notification de manière programmatique](https://docs.stripe.com/checkout/fulfillment.md?payment-ui=embedded-components) lorsqu’un client effectue un paiement.

## See also

- [Ajouter des réductions pour les paiements ponctuels](https://docs.stripe.com/payments/advanced/discounts.md)
- [Collecter des taxes](https://docs.stripe.com/tax/checkout/elements.md)
- [Activer les quantités des postes ajustables](https://docs.stripe.com/payments/advanced/adjustable-quantity.md)
- [ Ajoutez des boutons de paiement en un clic ](https://docs.stripe.com/elements/express-checkout-element/accept-a-payment.md?payment-ui=embedded-components).
- [Exemple de projet sur GitHub](https://github.com/stripe-samples/accept-a-payment/tree/main/elements-with-checkout-sessions)


# API Payment Intents


Créez un formulaire de paiement personnalisé en utilisant les composants [Stripe&nbsp;Elements](https://docs.stripe.com/payments/elements.md) et [l’API Payment&nbsp;Intents](https://docs.stripe.com/api/payment_intents.md). Découvrez comment cette intégration se [compare aux autres types](https://docs.stripe.com/payments/online-payments.md#compare-features-and-availability) d’intégration de Stripe.

L’API Payment Intents est une API de bas niveau que vous pouvez utiliser pour construire votre propre flux de paiement, mais elle nécessite beaucoup plus de code et une maintenance continue. Nous recommandons d’utiliser [Payment Element avec Checkout Sessions](https://docs.stripe.com/payments/quickstart-checkout-sessions.md) pour la plupart des intégrations, car il couvre des flux de paiement similaires à ceux de Payment Intents. En savoir plus sur les cas où il convient d’[utiliser Checkout Sessions plutôt que Payment Intents](https://docs.stripe.com/payments/checkout-sessions-and-payment-intents-comparison.md).

Le code côté client et côté serveur crée un formulaire de paiement qui accepte différents moyens de paiement.

#### Effort d'intégration
Complexity: 4/5
#### Type d'intégration

Combinez des composants d’interface utilisateur dans un tunnel de paiement personnalisé

#### Personnalisation de l'interface utilisateur

Personnalisation au niveau CSS avec l’[API Appearance](https://docs.stripe.com/elements/appearance-api.md)

> #### Vous souhaitez utiliser Stripe Tax, les réductions, les frais de livraison ou la conversion de devises&nbsp;?
> 
> Stripe dispose d’une intégration du composant Payment Element qui gère pour vous les taxes, les réductions, les frais de livraison et la conversion des devises. Pour en savoir plus, consultez la section[ créer une page de paiement ](https://docs.stripe.com/payments/quickstart-checkout-sessions.md).

## Configurer Stripe [Côté serveur]

Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre application&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

## Créer un PaymentIntent [Côté serveur]

> Si vous souhaitez afficher le Payment&nbsp;Element sans créer au préalable de PaymentIntent, consultez la page [Collecter les informations de paiement avant de créer un Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

L’objet [PaymentIntent](https://docs.stripe.com/api/payment_intents.md) représente votre intention d’encaisser le paiement d’un client et suit les tentatives de débit et changements d’état tout au long du processus de paiement.
Vue d'ensemble de l'intégration des paiements illustrée par ce document. (See full diagram at https://docs.stripe.com/payments/accept-a-payment)
### Créer le PaymentIntent

Créez un PaymentIntent sur votre serveur avec les attribut [amount](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-amount) et [currency](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-currency) (devise). Dans la dernière version de l’API, le paramètre `automatic_payment_methods` est facultatif, car Stripe active déjà cette fonctionnalité par défaut. Vous pouvez gérer les moyens de paiement depuis le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe gère le renvoi des moyens de paiement admissibles en fonction de facteurs tels que le montant de la transaction, la devise et le tunnel de paiement.

Stripe utilise vos [paramètres de moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) pour afficher les moyens de paiement que vous avez activés. Pour voir comment vos moyens de paiement apparaissent aux clients, saisissez un ID de transaction ou définissez un montant de commande et une devise dans le [Dashboard](https://dashboard.stripe.com/settings/payment_methods/review). Pour remplacer ces paramètres, listez manuellement les moyens de paiement que vous souhaitez activer à l’aide de l’attribut [payment_method_types](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-payment_method_types).

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1099,
  currency: 'eur',
  automatic_payment_methods: {
    enabled: true,
  },
});
```

> Définissez toujours le montant à débiter côté serveur car il s’agit d’un environnement sécurisé contrairement à l’environnement client. De cette façon un client malveillant ne pourra pas fixer son propre tarif.

### Récupérer la clé secrète du client

Le PaymentIntent contient une *clé secrète* (The client secret is a unique key returned from Stripe as part of a PaymentIntent. This key lets the client access important fields from the PaymentIntent (status, amount, currency) while hiding sensitive ones (metadata, customer)) à utiliser côté client pour finaliser le processus de paiement en toute sécurité. Vous pouvez adopter différentes approches pour transmettre cette clé secrète côté client.

#### Application monopage

Récupérez la clé secrète du client à partir d’un endpoint sur votre serveur, à l’aide de la fonction `fetch` du navigateur. Cette approche est recommandée si votre côté client est une application d’une seule page, en particulier si elle repose sur un framework front-end moderne tel que React. Créez l’endpoint de serveur qui gère la clé secrète du client&nbsp;:

#### Node.js

```javascript
const express = require('express');
const app = express();

app.get('/secret', async (req, res) => {
  const intent = // ... Fetch or create the PaymentIntent
  res.json({client_secret: intent.client_secret});
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

Récupérez ensuite la clé secrète du client à l’aide JavaScript côté client&nbsp;:

```javascript
(async () => {
  const response = await fetch('/secret');
  const {client_secret: clientSecret} = await response.json();
  // Render the form using the clientSecret
})();
```

#### Rendu côté serveur

Transmettez la clé secrète à votre client depuis votre serveur. Cette approche fonctionne mieux si votre application génère du contenu statique sur le serveur avant de l’envoyer sur le navigateur.

Ajoutez le [client_secret](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) à votre formulaire de paiement. Dans votre code côté serveur, récupérez la clé secrète du client à partir du PaymentIntent&nbsp;:

#### Node.js

```html
<form id="payment-form" data-secret="{{ client_secret }}">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>

  <button id="submit">Submit</button>
</form>
```

```javascript
const express = require('express');
const expressHandlebars = require('express-handlebars');
const app = express();

app.engine('.hbs', expressHandlebars({ extname: '.hbs' }));
app.set('view engine', '.hbs');
app.set('views', './views');

app.get('/checkout', async (req, res) => {
  const intent = // ... Fetch or create the PaymentIntent
  res.render('checkout', { client_secret: intent.client_secret });
});

app.listen(3000, () => {
  console.log('Running on port 3000');
});
```

## Collecter les données de paiement [Côté client]

Collectez les informations de paiement du client avec le [Payment&nbsp;Element](https://docs.stripe.com/payments/payment-element.md). Le Payment&nbsp;Element est un composant d’interface utilisateur préconfiguré qui simplifie la collecte des informations pour de nombreux moyens de paiement.

Le Payment&nbsp;Element contient un iframe qui envoie les informations de paiement à Stripe de manière sécurisée via une connexion HTTPS. Évitez de placer le Payment&nbsp;Element dans un autre iframe, car certains moyens de paiement nécessitent une redirection vers une autre page pour la confirmation du paiement.

Si vous choisissez d’utiliser un iframe et que vous souhaitez accepter Apple Pay ou Google Pay, l’attribut [allow](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-allowpaymentrequest) de l’iframe doit être défini sur égal à `"payment *"`.

Pour que votre intégration fonctionne, l’adresse de la page de paiement doit commencer par `https://` et non par `http://`. Vous pouvez tester votre intégration sans utiliser le protocole HTTPS, mais n’oubliez pas de l’[activer](https://docs.stripe.com/security/guide.md#tls) lorsque vous souhaitez commencer à accepter des paiements réels.

#### HTML + JS

### Configurer Stripe.js

Le composant Element Payment est automatiquement disponible en tant que fonctionnalité de Stripe.js. Intégrez le script Stripe.js à votre page de paiement en l’ajoutant entre les balises `head` de votre fichier HTML. Chargez toujours Stripe.js directement à partir de js.stripe.com pour maintenir votre conformité PCI. Vous ne devez pas inclure le script dans une offre groupée ni en héberger de copie.

```html
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/dahlia/stripe.js"></script>
</head>
```

Créez une instance de Stripe avec le code JavaScript suivant sur votre page de paiement&nbsp;:

```javascript
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/apikeys
const stripe = Stripe('<<YOUR_PUBLISHABLE_KEY>>');
```

### Ajouter le Payment Element à votre page de paiement

Le composant Element Payment doit avoir un emplacement dédié dans votre page de paiement. Créez un nœud DOM (conteneur) vide doté d’un ID unique dans votre formulaire de paiement&nbsp;:

```html
<form id="payment-form">
  <div id="payment-element">
    <!-- Elements will create form elements here -->
  </div>
  <button id="submit">Submit</button>
  <div id="error-message">
    <!-- Display error message to your customers here -->
  </div>
</form>
```

Lors du chargement du formulaire précédent, créez une instance du composant Payment&nbsp;Element et intégrez-la au nœud DOM conteneur. Lorsque vous créez l’instance [Elements](https://docs.stripe.com/js/elements_object/create), transmettez la [clé secrète du client](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) définie à l’étape précédente dans les `options`&nbsp;:

Utilisez la clé secrète du client avec prudence, car elle peut servir à finaliser le paiement. Ne l’enregistrez pas, ne l’intégrez pas dans des URL et ne la dévoilez à personne d’autre que votre client.

```javascript
const options = {
  clientSecret: '{{CLIENT_SECRET}}',
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret obtained in a previous stepconst elements = stripe.elements(options);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');

```

#### React

### Configurer Stripe.js

Installez [React Stripe.js](https://www.npmjs.com/package/@stripe/react-stripe-js) et le [chargeur Stripe.js](https://www.npmjs.com/package/@stripe/stripe-js) à partir du registre public npm&nbsp;:

```bash
npm install --save @stripe/react-stripe-js @stripe/stripe-js
```

### Ajouter le fournisseur Elements à votre page de paiement et le configurer

Pour utiliser le composant Payment Element, enveloppez votre composant de page de paiement dans un [fournisseur Elements](https://docs.stripe.com/sdks/stripejs-react.md#elements-provider). Appelez `loadStripe` avec votre clé publique, puis transmettez au fournisseur `Elements` l’élément `Promise` renvoyé. Transmettez également la [clé secrète du client](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) de l’étape précédente en tant que `options`, toujours au fournisseur `Elements`.

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import CheckoutForm from './CheckoutForm';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('<<YOUR_PUBLISHABLE_KEY>>');

function App() {
  const options = {
    // passing the client secret obtained in step 3
    clientSecret: '{{CLIENT_SECRET}}',
    // Fully customizable with appearance API.
    appearance: {/*...*/},
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
```

### Ajouter le composant Element Payment

Utilisez le composant `PaymentElement` pour créer votre formulaire&nbsp;:

```jsx
import React from 'react';
import {PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  return (
    <form><PaymentElement />
      <button>Submit</button>
    </form>
  );
};

export default CheckoutForm;
```

Stripe&nbsp;Elements est un ensemble de composants d’interface utilisateur modulables. Pour personnaliser davantage votre formulaire ou collecter d’autres informations client, consultez la [documentation relative à Elements](https://docs.stripe.com/payments/elements.md).

Le composant Payment Element affiche un formulaire dynamique qui permet à votre client de choisir un moyen de paiement. Pour chaque moyen de paiement, le formulaire demande automatiquement au client de renseigner toutes les informations de paiement nécessaires.

### Personnaliser l’apparence

Personnalisez le Payment&nbsp;Element pour qu’il corresponde à l’apparence de votre site en ajoutant l’[objet Appearance](https://docs.stripe.com/js/elements_object/create#stripe_elements-options-appearance) dans `options` lors de la création du fournisseur `Elements`.

### Collecter les adresses

Par défaut, le Payment Element ne collecte que les informations nécessaires à la facturation. Certaines opérations, telles que le [calcul des taxes](https://docs.stripe.com/api/tax/calculations/create.md) ou la saisie des informations de livraison, nécessitent l’adresse complète de votre client. Vous pouvez&nbsp;:

- Utilisez l’[Address Element](https://docs.stripe.com/elements/address-element.md) pour tirer parti des fonctionnalités de saisie automatique et de localisation et recueillir l’adresse complète de votre client. Cela permet de garantir un calcul des taxes le plus précis possible.
- Recueillez l’adresse à l’aide de votre propre formulaire personnalisé.

### Demander un token de marchand Apple Pay

Si vous avez configuré votre intégration pour [accepter les paiements Apple Pay](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=checkout), nous vous recommandons de configurer l’interface Apple Pay afin de renvoyer un token de marchand pour activer les transactions initiées par le marchand (MIT). [Demandez le type de token de marchand approprié](https://docs.stripe.com/apple-pay/merchant-tokens.md?pay-element=web-pe) dans le composant Payment Element.

## Optional: Enregistrer et récupérer les moyens de paiement des clients

Vous pouvez configurer le composant Payment Element de façon à enregistrer les moyens de paiement de vos clients en vue d’une utilisation ultérieure. Cette section vous montre comment intégrer la [fonctionnalité d’enregistrement des moyens de paiement](https://docs.stripe.com/payments/save-customer-payment-methods.md), qui permet à Payment Element de&nbsp;:

- De demander aux acheteurs s’ils consentent à ce que leur moyen de paiement soit enregistré
- Enregistrer les moyens de paiement lorsque les clients y consentent
- Afficher les moyens de paiement enregistrés des acheteurs lors de leurs futurs achats
- [Mise à jour automatique des cartes perdues ou expirées](https://docs.stripe.com/payments/cards/overview.md#automatic-card-updates) lorsque les clients les remplacent
![Le composant Payment Element et une case à cocher pour le moyen de paiement enregistré](https://b.stripecdn.com/docs-statics-srv/assets/spm-save.fe0b24afd0f0a06e0cf4eecb0ce2403a.png)

Enregistrez les moyens de paiement.
![Le composant Payment Element avec un moyen de paiement enregistré sélectionné](https://b.stripecdn.com/docs-statics-srv/assets/spm-saved.5dba5a8a190a9a0e9f1a99271bed3f4b.png)

Réutilisez un moyen de paiement précédemment enregistré.

### Activer l’enregistrement du moyen de paiement dans le composant Payment Element

Lorsque vous créez un [PaymentIntent](https://docs.stripe.com/api/payment_intents/.md) sur votre serveur, créez également une [CustomerSession](https://docs.stripe.com/api/customer_sessions/.md) en fournissant l’ID du client (en utilisant soit `customer` pour un objet `Customer`, soit `customer_account` pour un objet `Account` configuré pour le client) et en activant le composant [payment_element](https://docs.stripe.com/api/customer_sessions/object.md#customer_session_object-components-payment_element) pour votre session. Configurez les [fonctionnalités](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components-payment_element-features) des moyens de paiement enregistrés que vous souhaitez activer. Par exemple, l’activation de [payment_method_save](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components-payment_element-features-payment_method_save) affiche une case à cocher permettant aux clients d’enregistrer leurs informations de paiement pour une utilisation ultérieure.

Vous pouvez définir `setup_future_usage` sur un PaymentIntent ou une Checkout Session pour déroger au comportement par défaut d’enregistrement des moyens de paiement. Cela permet d’enregistrer automatiquement le moyen de paiement pour une utilisation ultérieure, même si le client ne choisit pas explicitement de l’enregistrer. Si vous prévoyez de définir `setup_future_usage`, ne définissez pas `payment_method_save_usage` dans la même transaction de paiement, car cela provoque une erreur d’intégration.

> #### Utiliser l’API Accounts v2 pour représenter les clients
> 
> L’API Accounts&nbsp;v2 est généralement disponible pour les utilisateurs de Connect et en aperçu public pour les autres utilisateurs de Stripe. Si vous avez accès à l’aperçu Accounts&nbsp;v2, vous devez [spécifier une version d’aperçu](https://docs.stripe.com/api-v2-overview.md#sdk-and-api-versioning) dans votre code.
> 
> Pour accéder à l’aperçu Accounts&nbsp;v2, rendez-vous sur [aperçus et fonctionnalités de Account](https://dashboard.stripe.com/settings/features/product-previews) dans votre Dashboard et activez **Moyens de paiement réutilisables pour les virements internationaux**.
> 
> Dans la plupart des cas d’usage, nous vous recommandons de [modéliser vos clients en tant qu’objets Account configurés par le client](https://docs.stripe.com/accounts-v2/use-accounts-as-customers.md), plutôt que d’utiliser des objets [Customer](https://docs.stripe.com/api/customers.md).

#### Accounts&nbsp;v2

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

app.post('/create-intent-and-customer-session', async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd',
    automatic_payment_methods: {enabled: true},
    customer_account: {{CUSTOMER_ACCOUNT_ID}},
  });
  const customerSession = await stripe.customerSessions.create({
    customer_account: {{CUSTOMER_ACCOUNT_ID}},
    components: {
      payment_element: {
        enabled: true,
        features: {
          payment_method_redisplay: 'enabled',
          payment_method_save: 'enabled',
          payment_method_save_usage: 'off_session',
          payment_method_remove: 'enabled',
        },
      },
    },
  });
  res.json({
    client_secret: intent.client_secret,
    customer_session_client_secret: customerSession.client_secret
  });
});
```

#### Customers&nbsp;v1

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

app.post('/create-intent-and-customer-session', async (req, res) => {
  const intent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'usd',
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    // is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {enabled: true},
    customer: {{CUSTOMER_ID}},
  });
  const customerSession = await stripe.customerSessions.create({
    customer: {{CUSTOMER_ID}},
    components: {
      payment_element: {
        enabled: true,
        features: {
          payment_method_redisplay: 'enabled',
          payment_method_save: 'enabled',
          payment_method_save_usage: 'off_session',
          payment_method_remove: 'enabled',
        },
      },
    },
  });
  res.json({
    client_secret: intent.client_secret,
    customer_session_client_secret: customerSession.client_secret
  });
});
```

Votre instance Elements utilise la *clé secrète du client* (A client secret is used with your publishable key to authenticate a request for a single object. Each client secret is unique to the object it's associated with) de la session Client pour accéder aux moyens de paiement enregistrés de ce client. [Gérez les erreurs](https://docs.stripe.com/error-handling.md) correctement lorsque vous créez la session Client. Si une erreur se produit, vous n’avez pas besoin de fournir la clé secrète du client de la session Client à l’instance Elements, car elle est facultative.

Créez l’instance Elements à l’aide des clés secrètes du client pour le PaymentIntent et la session Client. Ensuite, utilisez cette instance d’Elements pour créer un Payment Element.

```javascript
// Create the CustomerSession and obtain its clientSecret
const res = await fetch("/create-intent-and-customer-session", {
  method: "POST"
});

const {
  customer_session_client_secret: customerSessionClientSecret
} = await res.json();

const elementsOptions = {
  clientSecret: '{{CLIENT_SECRET}}',customerSessionClientSecret,
  // Fully customizable with appearance API.
  appearance: {/*...*/},
};

// Set up Stripe.js and Elements to use in checkout form, passing the client secret
// and CustomerSession's client secret obtained in a previous step
const elements = stripe.elements(elementsOptions);

// Create and mount the Payment Element
const paymentElementOptions = { layout: 'accordion'};
const paymentElement = elements.create('payment', paymentElementOptions);
paymentElement.mount('#payment-element');
```

Lors de la confirmation du PaymentIntent, Stripe.js contrôle automatiquement le paramètre [setup_future_usage](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-setup_future_usage) sur le PaymentIntent et le paramètre [allow_redisplay](https://docs.stripe.com/api/payment_methods/object.md#payment_method_object-allow_redisplay) sur le PaymentMethod, selon que le client a coché ou non la case permettant d’enregistrer ses informations de paiement.

### Exiger la collecte du CVC

Au besoin, spécifiez `require_cvc_recollection` [lors de la création du PaymentIntent](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-payment_method_options-card-require_cvc_recollection) pour appliquer la collecte du CVC lors des paiements par carte.

### Détecter la sélection d’un moyen de paiement enregistré

Pour contrôler le contenu dynamique qui s’affiche lors de la sélection d’un moyen de paiement enregistré, écoutez l’événement `change` du composant Element Payment, qui contient le moyen de paiement sélectionné.

```javascript
paymentElement.on('change', function(event) {
  if (event.value.payment_method) {
    // Control dynamic content if a saved payment method is selected
  }
})
```

## Optional: Link in your checkout page [Côté client]

Permettez à vos clients de payer plus rapidement en utilisant [Link](https://docs.stripe.com/payments/link.md) dans le [composant Element Payment](https://docs.stripe.com/payments/payment-element.md). Vous pouvez remplir automatiquement les informations pour tout client connecté utilisant déjà Link, même s’il a initialement enregistré ses informations avec Link auprès d’une autre entreprise. L’intégration par défaut du composant Element Payment inclut une invite Link dans le formulaire de carte bancaire. Pour gérer Link dans le composant Element Payment, accédez à vos [paramètres de moyens de paiement](https://dashboard.stripe.com/settings/payment_methods).
![S'identifier ou s'inscrire auprès de Link directement dans le composant Payment Element au moment du paiement](https://b.stripecdn.com/docs-statics-srv/assets/link-in-pe.2efb5138a4708b781b8a913ebddd9aba.png)

Collecter l’adresse e-mail du client pour l’authentification ou l’inscription Link

### Options d’intégration

L’intégration de Link au composant Element Payment peut se faire de deux façons. Parmi celles-ci, Stripe recommande de transmettre l’adresse e-mail d’un client au composant Element Payment, le cas échéant. N’oubliez pas de tenir compte du fonctionnement de votre tunnel de paiement lorsque vous choisissez l’une des options suivantes&nbsp;:

| Option d’intégration                                                      | Tunnel de paiement                                                                                                                                                                                                               | Description                                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transmettre l’adresse e-mail d’un client au Payment Element (Recommended) | - Votre client saisit son adresse e-mail avant d’accéder à la page de paiement (lors d’une précédente étape de création de compte, par exemple).
  - Vous préférez utiliser votre propre champ de saisie de l’adresse e-mail     | Transmettez par voie programmatique l’adresse e-mail d’un client au composant Element Payment. Dans ce scénario, le client s’identifie directement auprès de Link dans le formulaire de paiement au lieu d’utiliser un composant d’interface utilisateur distinct.                                       |
| Recueillir l’adresse e-mail d’un client dans le Payment Element           | - Vos clients peuvent choisir de saisir leur adresse e-mail et de s’identifier ou de s’inscrire auprès de Link directement dans le composant Element Payment lors du paiement.
  - Aucune modification du code n’est nécessaire. | Si un client ne s’est pas inscrit auprès de Link et qu’il choisit un moyen de paiement pris en charge dans le composant Element Payment, il est invité à enregistrer ses informations à l’aide de Link. Pour ceux qui sont déjà inscrits, Link renseigne automatiquement leurs informations de paiement. |

Utilisez le paramètre [defaultValues](https://docs.stripe.com/js/elements_object/create_payment_element#payment_element_create-options-defaultValues) pour transmettre l’adresse e-mail d’un client au Payment Element.

```javascript
const paymentElement = elements.create('payment', {
  defaultValues: {
    billingDetails: {
      email: 'foo@bar.com',
    }
  },
  // Other options
});
```

Pour plus d’informations, lisez comment [créer une page de paiement personnalisée qui inclut Link](https://docs.stripe.com/payments/link/add-link-elements-integration.md).

## Optional: Récupérer des mises à jour à partir du serveur [Côté client]

Pour modifier des attributs du Paymentintent tels que le [montant](https://docs.stripe.com/api/payment_intents/update.md#update_payment_intent-amount) (par exemple, les codes de réduction ou les frais d’expédition) après l’affichage du composant Payment&nbsp;Element, vous pouvez [modifier le PaymentIntent](https://docs.stripe.com/api/payment_intents/update.md) sur votre serveur, puis appeler [elements.fetchUpdates](https://docs.stripe.com/js/elements_object/fetch_updates) pour faire apparaître le nouveau montant dans le composant Payment&nbsp;Element. Cet exemple vous montre comment créer un endpoint de serveur capable de mettre à jour le montant du PaymentIntent&nbsp;:

#### Node.js

```javascript
app.get('/update', async (req, res) => {
  const intent = await stripe.paymentIntents.update(
    '{{PAYMENT_INTENT_ID}}',
    {amount: 1499}
  );
  res.json({status: intent.status});
});
```

Cet exemple vous montre comment mettre à jour l’interface utilisateur pour refléter ces modifications côté client&nbsp;:

```javascript
(async () => {
  const response = await fetch('/update');
  if (response.status === 'requires_payment_method') {
    const {error} = await elements.fetchUpdates();
  }
})();
```

## Soumettre le paiement à Stripe [Côté client]

Utilisez [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) pour effectuer le paiement à l’aide des informations du composant Payment&nbsp;Element. Ajoutez un paramètre [return_url](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-return_url) à cette fonction pour indiquer la page vers laquelle Stripe doit rediriger l’utilisateur à l’issue du paiement. Votre utilisateur peut être redirigé en premier lieu vers un site intermédiaire, comme une page d’autorisation bancaire, avant d’être redirigé vers la page spécifiée par le paramètre `return_url`. L’utilisateur sera immédiatement redirigé vers la page `return_url` après un paiement réussi par carte.

Si vous ne souhaitez pas effectuer de redirection à la fin des paiements par carte, vous pouvez assigner au paramètre [redirect](https://docs.stripe.com/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect) la valeur `if_required`. De cette manière, seuls les clients qui choisissent un moyen de paiement avec redirection seront redirigés.

#### HTML + JS

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://example.com/order/123/complete',
    },
  });

  if (error) {
    // This point will only be reached if there is an immediate error when
    // confirming the payment. Show error to your customer (for example, payment
    // details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

#### React

Pour appeler [stripe.confirmPayment](https://docs.stripe.com/js/payment_intents/confirm_payment) depuis votre composant de formulaire de paiement, utilisez les hooks [useStripe](https://docs.stripe.com/sdks/stripejs-react.md#usestripe-hook) et [useElements](https://docs.stripe.com/sdks/stripejs-react.md#useelements-hook).

Si vous préférez les composants de classe traditionnels aux hooks, vous pouvez utiliser un [ElementsConsumer](https://docs.stripe.com/sdks/stripejs-react.md#elements-consumer).

```jsx
import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }
const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://example.com/order/123/complete',
      },
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
};

export default CheckoutForm;
```

Veillez à ce que le paramètre `return_url` corresponde à une page de votre site web qui indique l’état du paiement. Lorsque Stripe redirige le client vers la page `return_url`, nous fournissons les paramètres de requête d’URL suivants&nbsp;:

| Paramètre                      | Description                                                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `payment_intent`               | L’identifiant unique du `PaymentIntent`.                                                                                                          |
| `payment_intent_client_secret` | La [clé secrète du client](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-client_secret) de l’objet `PaymentIntent`. |

> Si vous disposez d’outils qui assurent le suivi de la session navigateur du client, vous devrez peut-être ajouter le domaine `stripe.com` à la liste d’exclusion des sites référents. Les redirections font que certains outils créent de nouvelles sessions, ce qui empêche le suivi de la session dans son ensemble.

Utilisez l’un des paramètres de requête pour récupérer le PaymentIntent. Consultez l’[état du PaymentIntent](https://docs.stripe.com/payments/paymentintents/lifecycle.md) pour déterminer les informations à présenter à vos clients. Vous pouvez également ajouter vos propres paramètres de requête lorsque vous ajoutez l’URL `return_url`&nbsp;; ils seront conservés tout au long du processus de redirection.

#### HTML + JS

```javascript

// Initialize Stripe.js using your publishable key
const stripe = Stripe('<<YOUR_PUBLISHABLE_KEY>>');

// Retrieve the "payment_intent_client_secret" query parameter appended to
// your return_url by Stripe.js
const clientSecret = new URLSearchParams(window.location.search).get(
  'payment_intent_client_secret'
);

// Retrieve the PaymentIntent
stripe.retrievePaymentIntent(clientSecret).then(({paymentIntent}) => {
  const message = document.querySelector('#message')

  // Inspect the PaymentIntent `status` to indicate the status of the payment
  // to your customer.
  //
  // Some payment methods will [immediately succeed or fail][0] upon
  // confirmation, while others will first enter a `processing` state.
  //
  // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
  switch (paymentIntent.status) {
    case 'succeeded':
      message.innerText = 'Success! Payment received.';
      break;

    case 'processing':
      message.innerText = "Payment processing. We'll update you when payment is received.";
      break;

    case 'requires_payment_method':
      message.innerText = 'Payment failed. Please try another payment method.';
      // Redirect your user back to your payment page to attempt collecting
      // payment again
      break;

    default:
      message.innerText = 'Something went wrong.';
      break;
  }
});
```

#### React

```jsx
import React, {useState, useEffect} from 'react';
import {useStripe} from '@stripe/react-stripe-js';

const PaymentStatus = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Retrieve the "payment_intent_client_secret" query parameter appended to
    // your return_url by Stripe.js
    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    // Retrieve the PaymentIntent
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({paymentIntent}) => {
        // Inspect the PaymentIntent `status` to indicate the status of the payment
        // to your customer.
        //
        // Some payment methods will [immediately succeed or fail][0] upon
        // confirmation, while others will first enter a `processing` state.
        //
        // [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
        switch (paymentIntent.status) {
          case 'succeeded':
            setMessage('Success! Payment received.');
            break;

          case 'processing':
            setMessage("Payment processing. We'll update you when payment is received.");
            break;

          case 'requires_payment_method':
            // Redirect your user back to your payment page to attempt collecting
            // payment again
            setMessage('Payment failed. Please try another payment method.');
            break;

          default:
            setMessage('Something went wrong.');
            break;
        }
      });
  }, [stripe]);


  return message;
};

export default PaymentStatus;
```

## Gérer les événements post-paiement [Côté serveur]

Stripe envoie un événement [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) à l’issue du paiement. Utilisez l’[outil de webhook du Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir ces événements et exécuter des actions, comme envoyer une confirmation de commande par e-mail à votre client, enregistrer la vente dans une base de données ou lancer un flux de livraison.

Plutôt que d’attendre un rappel de votre client, écoutez ces événements. Côté client, il arrive en effet que l’utilisateur ferme la fenêtre de son navigateur ou quitte l’application avant l’exécution du rappel. Certains clients malintentionnés peuvent d’autre part tenter de manipuler la réponse. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule et même intégration.

En plus de l’événement `payment_intent.succeeded`, nous vous recommandons de gérer ces autres événements lorsque vous encaissez des paiements à l’aide de l’Element Payment&nbsp;:

| Événement                                                                                                                       | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Envoyé lorsqu’un client effectue un paiement avec succès.                                                                                                                                                                                                                           | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande.           |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Envoyé lorsqu’un client initie un paiement, mais qu’il ne l’a pas encore finalisé. Dans la plupart des cas, cet événement est envoyé lorsque le client initie un prélèvement bancaire. Il est suivi par un événement `payment_intent.succeeded` ou `payment_intent.payment_failed`. | Envoyez au client une confirmation de commande qui indique que son paiement est en attente. Pour des marchandises dématérialisées, vous pourrez traiter la commande sans attendre que le paiement soit effectué. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Envoyé lorsqu’un client effectue une tentative de paiement qui se solde par un échec.                                                                                                                                                                                               | Si un paiement passe de l’état `processing` à `payment_failed`, proposez au client de retenter le paiement.                                                                                                      |

## Tester votre intégration

Pour tester votre intégration de paiement personnalisée&nbsp;:

1. Créez un Paiement Intent et récupérez la clé secrète du client.
1. Renseignez les informations d’un moyen de paiement du tableau suivant.
   - Saisissez une date d’expiration postérieure à la date du jour.
   - Saisissez un code CVC à 3&nbsp;chiffres.
   - Saisissez un code postal de facturation.
1. Envoyez le paiement à Stripe. Vous êtes redirigé(e) vers votre `return_url`.
1. Accédez au Dashboard et recherchez le paiement sur la page [Transactions](https://dashboard.stripe.com/test/payments?status%5B0%5D=successful). Si votre paiement a abouti, il apparaîtra dans cette liste.
1. Cliquez sur votre paiement afin d’afficher plus d’informations, par exemple les informations de facturation et la liste des articles achetés. Vous pouvez utiliser ces informations pour traiter votre commande.

Découvrez comment [tester votre intégration](https://docs.stripe.com/testing.md).

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Portefeuilles

| Moyen de paiement | Scénario                                                                                                                                                                   | Méthode de test                                                                                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Alipay            | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification immédiate](https://docs.stripe.com/payments/payment-methods.md#payment-notification). | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche. |

#### Virements avec redirection bancaire

| Moyen de paiement                    | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prélèvement automatique BECS         | Le montant dû est réglé par prélèvement automatique BECS.                                                                                                                                                              | Remplissez le formulaire à l’aide du numéro de compte `900123456` et du BSB `000000`.La confirmation de la demande de PaymentIntent passe d’abord à l’état `processing`, puis à l’état `succeeded` trois minutes plus tard. |
| Prélèvement automatique BECS         | Le paiement de votre client échoue avec un code d’erreur `account_closed`.                                                                                                                                             | Remplissez le formulaire à l’aide du numéro de compte `111111113` et du BSB `000000`.                                                                                                                                       |
| Bancontact, EPS, iDEAL et Przelewy24 | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                       |
| Pay by Bank                          | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                                            |
| Pay by Bank                          | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                                        |
| BLIK                                 | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                                            |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

#### Coupons

| Moyen de paiement | Scénario                                           | Méthode de test                                                                                                           |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Boleto, OXXO      | Le montant dû est réglé par coupon Boleto ou OXXO. | Sélectionnez Boleto ou OXXO comme moyen de paiement, puis envoyez le paiement. Fermez la boîte de dialogue qui s’affiche. |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Ajouter d'autres moyens de paiement

Payment&nbsp;Element [prend en charge de nombreux moyens de paiement](https://docs.stripe.com/payments/payment-methods/integration-options.md#choose-how-to-add-payment-methods) par défaut. Vous devez prendre des mesures supplémentaires pour activer et afficher certains moyens de paiement.

### Affirm

Pour utiliser Affirm, vous devez d’abord l’activer dans le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Lorsque vous créez un PaymentIntent avec le moyen de paiement Affirm, vous devez inclure une [adresse de livraison](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). Cet exemple suggère de transmettre les informations de livraison côté client après que votre client a [sélectionné son moyen de paiement](https://docs.stripe.com/payments/accept-a-payment.md#web-create-intent). En savoir plus sur l’utilisation d’[Affirm](https://docs.stripe.com/payments/affirm.md) avec Stripe.

#### HTML + JS

```javascript
const form = document.getElementById('payment-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const {error} = await stripe.confirmPayment({
    //`Elements` instance that was used to create the Payment Element
    elements,
    confirmParams: {
      return_url: 'https://my-site.com/order/123/complete',shipping: {
        name: 'Jenny Rosen',
        address: {
          line1: '1 Street',
          city: 'Seattle',
          state: 'WA',
          postal_code: '95123',
          country: 'US'
        }
      },

    }
  });

  if (error) {
    // This point is reached if there's an immediate error when
    // confirming the payment. Show error to your customer (for example,
    // payment details incomplete)
    const messageContainer = document.querySelector('#error-message');
    messageContainer.textContent = error.message;
  } else {
    // Your customer is redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer is redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
  }
});
```

#### React

```jsx

import React, {useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const {error} = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: 'https://my-site.com/order/123/complete',shipping: {
          name: 'Jenny Rosen',
          address: {
            line1: '1 Street',
            city: 'Seattle',
            state: 'WA',
            postal_code: '95123',
            country: 'US'
          }
        },

      }
    });


    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example,
      // payment details incomplete)
      setErrorMessage(error.message);
    } else {
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button disabled={!stripe}>Submit</button>
      {/* Show error message to your customers */}
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  )
};

export default CheckoutForm;
```

#### Tester Affirm

Découvrez comment tester différents scénarios à l’aide du tableau suivant&nbsp;:

| Scénario                                                                         | Comment tester                                                                                              |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Le paiement de votre client avec Affirm aboutit.                                 | Remplissez le formulaire (en prenant soin d’indiquer une adresse de livraison) et authentifiez le paiement. |
| Votre client ne parvient pas à s’authentifier sur la page de redirection Affirm. | Remplissez le formulaire et cliquez sur **Faire échouer le paiement test** sur la page de redirection.      |

### Afterpay (Clearpay)

Lorsque vous créez un PaymentIntent avec Afterpay comme moyen de paiement, vous devez inclure une [adresse de livraison](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-shipping). En savoir plus sur l’utilisation d’[Afterpay](https://docs.stripe.com/payments/afterpay-clearpay.md) avec Stripe.

Vous pouvez gérer les moyens de paiement depuis le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe gère le renvoi des moyens de paiement admissibles en fonction de facteurs tels que le montant de la transaction, la devise et le tunnel de paiement. L’exemple ci-dessous utilise l’attribut [automatic_payment_methods](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-automatic_payment_methods-enabled), mais vous pouvez répertorier `afterpay_clearpay` dans les [types de moyens de paiement](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-payment_method_types). Dans la dernière version de l’API, le paramètre `automatic_payment_methods` est facultatif, car Stripe l’active déjà par défaut. Quelle que soit l’option choisie, veillez à activer Afterpay Clearpay dans le [Dashboard](https://dashboard.stripe.com/settings/payment_methods).

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const paymentIntent = await stripe.paymentIntents.create({
  amount: 1099,
  currency: 'eur',
  automatic_payment_methods: {
    enabled: true,
  },
  shipping: {
    name: 'Jenny Rosen',
    address: {
      line1: '1234 Main Street',
      city: 'San Francisco',
      state: 'CA',
      country: 'US',
      postal_code: '94111',
    },
  },
});
```

#### Tester Afterpay (Clearpay)

Découvrez comment tester différents scénarios à l’aide du tableau suivant&nbsp;:

| Scénario                                                                           | Comment tester                                                                                              |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Le paiement de votre client avec Afterpay aboutit.                                 | Remplissez le formulaire (en prenant soin d’indiquer une adresse de livraison) et authentifiez le paiement. |
| Votre client ne parvient pas à s’authentifier sur la page de redirection Afterpay. | Remplissez le formulaire et cliquez sur **Faire échouer le paiement test** sur la page de redirection.      |

### Apple&nbsp;Pay et Google&nbsp;Pay

Lorsque vous [activez les paiements par carte](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=paymentintents#create-the-paymentintent), nous affichons Apple Pay et Google Pay pour les clients dont l’environnement répond aux [conditions d’affichage du wallet](https://docs.stripe.com/testing/wallets.md). Pour accepter des paiements via ces wallets, vous devez également&nbsp;:

- Activez-les dans les [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods). Apple Pay est activé par défaut.
- Fournissez votre application via HTTPS en développement et en production.
- [Enregistrez votre domaine](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).
- [Récupérez les mises à jour depuis le serveur](https://docs.stripe.com/payments/accept-a-payment.md?payment-ui=elements&api-integration=paymentintents#fetch-updates) si vous mettez à jour le montant d’un [PaymentIntent](https://docs.stripe.com/api/payment_intents.md) pour synchroniser le moyen de paiement du wallet.

> #### Tests régionaux
> 
> Stripe Elements ne prend pas en charge Google Pay ou Apple Pay pour les comptes et clients Stripe en Inde. Par conséquent, vous ne pouvez pas tester votre intégration Google Pay ou Apple Pay si l’adresse&nbsp;IP du testeur se trouve en Inde, même si le compte Stripe est basé en dehors de l’Inde.

En savoir plus sur l’utilisation d’[Apple&nbsp;Pay](https://docs.stripe.com/apple-pay.md) et de [Google&nbsp;Pay](https://docs.stripe.com/google-pay.md) avec Stripe.

### Prélèvement automatique ACH

Lorsque vous utilisez le composant Element Payment avec le prélèvement automatique ACH comme moyen de paiement, procédez comme suit&nbsp;:

1. Créez un objet [Account](https://docs.stripe.com/api/v2/core/accounts/create.md#v2_create_accounts-configuration-customer) configuré par le client ou un objet [Customer](https://docs.stripe.com/api/customers/create.md) pour représenter votre client.

#### Accounts v2

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const account = await stripe.v2.core.accounts.create({
  configuration: {
    customer: {

    },
  },
});
```

#### Customers v1

```node
// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// Find your keys at https://dashboard.stripe.com/apikeys.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');

const customer = await stripe.customers.create();
```

1. Indiquez l’ID du client lors de la création du `PaymentIntent`.

   #### Accounts&nbsp;v2

   ```node
   // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
   // Find your keys at https://dashboard.stripe.com/apikeys.
   const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
   
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer_account: '{{CUSTOMERACCOUNT_ID}}',
     payment_method_types: ['us_bank_account'],
   });
   ```

   #### Customers&nbsp;v1

   ```node
   // Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
   // Find your keys at https://dashboard.stripe.com/apikeys.
   const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
   
   const paymentIntent = await stripe.paymentIntents.create({
     amount: 1099,
     currency: 'usd',
     setup_future_usage: 'off_session',
     customer: '{{CUSTOMER_ID}}',
     payment_method_types: ['us_bank_account'],
   });
   ```

1. Sélectionnez une [méthode de vérification](https://docs.stripe.com/api/payment_intents/object.md#payment_intent_object-payment_method_options-us_bank_account-verification_method).

Lorsque vous utilisez le prélèvement automatique ACH avec le Payment Element, vous pouvez uniquement sélectionner `automatic` ou `instant` .

En savoir plus sur l’utilisation du [prélèvement automatique ACH](https://docs.stripe.com/payments/ach-direct-debit.md) avec Stripe.

#### Tester le prélèvement automatique ACH

| Scénario                                                                                                           | Comment tester                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Le paiement de votre client avec un compte bancaire américain et vérification instantanée aboutit.                 | Sélectionnez **Compte bancaire américain** et remplissez le formulaire. Cliquez sur l’établissement de test. Pour associer votre compte bancaire, suivez les instructions affichées dans la fenêtre modale. Enfin, cliquez sur le bouton de paiement.                                                                                                                                                                                           |
| Le paiement de votre client avec un compte bancaire américain et vérification à l’aide de microversements aboutit. | Sélectionnez **Compte bancaire américain** et remplissez le formulaire. Cliquez sur **Saisir les coordonnées bancaires manuellement**. Pour associer votre compte bancaire, suivez les instructions affichées dans la fenêtre modale. Vous pouvez utiliser ces [numéros de comptes de test](https://docs.stripe.com/payments/ach-direct-debit/accept-a-payment.md?platform=web#test-account-numbers). Enfin, cliquez sur le bouton de paiement. |
| Votre client ne parvient pas à finaliser le processus de rattachement de son compte bancaire.                      | Sélectionnez **Compte bancaire américain** et cliquez sur l’établissement de test ou sur **Saisir les coordonnées bancaires manuellement**. Fermez la fenêtre modale sans la remplir.                                                                                                                                                                                                                                                           |

### BLIK

Lorsqu’il utilise Payment&nbsp;Element avec BLIK, l’utilisateur peut fermer la fenêtre modale l’invitant à autoriser le paiement dans son application bancaire. Cela déclenche une redirection vers votre `return_url` et ne renvoie pas l’utilisateur vers la page de paiement. En savoir plus sur l’utilisation de [BLIK](https://docs.stripe.com/payments/blik.md) avec Stripe.

Afin de gérer la fermeture des fenêtres modales par les utilisateurs au niveau du gestionnaire côté serveur pour votre `return_url`, inspectez le PaymentIntent et vérifiez si son `status` est `succeeded` ou `requires_action` (ce qui signifie que le client a fermé la boîte de dialogue sans autoriser le paiement), puis traitez chaque cas de la manière appropriée.

### Moyens de paiement par code QR

En cas d’utilisation du Payment Element avec un moyen de paiement par code&nbsp;QR (WeChat Pay, PayNow, Pix, PromptPay, Cash App Pay), l’utilisateur peut fermer la fenêtre modale dans laquelle est affiché le code. Cette action entraîne une redirection vers votre page `return_url` et non vers la page de paiement.

Pour gérer la fermeture des fenêtre modales de code&nbsp;QR par les utilisateurs au niveau du gestionnaire côté serveur pour votre `return_url`, inspectez le PaymentIntent et vérifiez si son `status` est `succeeded` ou `requires_action` (ce qui signifie que le client a fermé la boîte de dialogue sans effectuer le paiement), puis traitez chaque cas de la manière appropriée.

Vous pouvez également empêcher la redirection automatique vers votre page `return_url` en transmettant le paramètre facultatif avancé [`redirect=if_required`](https://docs.stripe.com/js/payment_intents/confirm_payment#confirm_payment_intent-options-redirect), qui permet d’éviter toute redirection lors de la fermeture d’une fenêtre modale de code&nbsp;QR.

### Cash App Pay

Le Payment&nbsp;Element affiche un formulaire dynamique différent selon qu’il s’agit d’un site Web de bureau ou d’un site Web mobile, car il utilise différentes méthodes d’authentification du client. En savoir plus sur l’utilisation de [Cash&nbsp;App&nbsp;Pay](https://docs.stripe.com/payments/cash-app-pay.md) avec Stripe.

#### Élément d'application Web mobile

Cash App Pay est un moyen de paiement basé sur la redirection vers le Web mobile. Il redirige votre client vers Cash App en mode production ou vers une page de paiement test dans un environnement de test. Une fois le paiement effectué, le client est redirigé vers la `return_url`, que vous ayez défini `redirect=if_required` ou non.

#### Élément d'application Web de bureau

Cash App Pay est un moyen de paiement par code&nbsp;QR pour le Web de bureau, où le Payment Element affiche un code&nbsp;QR modal. Votre client doit scanner le code&nbsp;QR avec une application de lecture de code&nbsp;QR ou l’application mobile Cash App.

En mode production, il renvoie le client vers la `return_url` dès que celui-ci est redirigé vers l’application Cash. Dans les environnements de test, le client peut approuver ou refuser le paiement avant d’être redirigé vers la `return_url`. Les clients peuvent également fermer la fenêtre modale du code&nbsp;QR avant d’effectuer le paiement, ce qui déclenche une redirection vers votre `return_url`.

Assurez-vous que la `return_url` correspond à une page de votre site Web pour examiner le `status` du Payment Intent. Le `status` du Payment Intent peut être `succeeded`, `failed` ou `requires_action` (par exemple, le client a fermé la fenêtre modale sans scanner le code&nbsp;QR).

Vous pouvez également empêcher la redirection automatique vers votre page `return_url` en transmettant le paramètre facultatif avancé `redirect=if_required`, qui permet d’éviter toute redirection lors de la fermeture d’une fenêtre modale de code&nbsp;QR.

### PayPal

Pour utiliser PayPal, assurez-vous d’être sur un [domaine enregistré](https://docs.stripe.com/payments/payment-methods/pmd-registration.md).

## Divulguer Stripe à vos clients

Stripe recueille des informations sur les interactions des clients avec Elements afin de vous fournir des services, de prévenir la fraude et d’améliorer ses services. Cela inclut l’utilisation de cookies et d’adresses IP pour identifier les Elements qu’un client a vus au cours d’une même session Checkout. Vous êtes responsable de la divulgation et de l’obtention de tous les droits et consentements nécessaires pour que Stripe puisse utiliser les données à cette fin. Pour en savoir plus, visitez notre [Centre de confidentialité](https://stripe.com/legal/privacy-center#as-a-business-user-what-notice-do-i-provide-to-my-end-customers-about-stripe).

## See also

- [Stripe&nbsp;Elements](https://docs.stripe.com/payments/elements.md)
- [Configurer des paiements futurs](https://docs.stripe.com/payments/save-and-reuse.md)
- [Enregistrer les données de paiement pour les réutiliser](https://docs.stripe.com/payments/save-during-payment.md)
- [Calculer la taxe sur les ventes, la TPS et la TVA dans votre tunnel de paiement](https://docs.stripe.com/tax/standalone-tax-api.md)


# Intégration des applications pour iOS

![](https://b.stripecdn.com/docs-statics-srv/assets/ios-overview.9e0d68d009dc005f73a6f5df69e00458.png)

Intégrez l’interface utilisateur de paiement préconfigurée de Stripe au processus de paiement de votre application iOS grâce à la classe [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html). Consultez notre exemple d’intégration [sur GitHub](https://github.com/stripe/stripe-ios/tree/master/Example/PaymentSheet%20Example).

> #### Prise en charge de l’API Accounts&nbsp;v2
> 
> La feuille des moyens de paiement ne prend pas en charge les *comptes configurés par le client* (Account configurations represent role-based functionality that you can enable for accounts, such as merchant, customer, or recipient). Elle prend uniquement en charge les objets `Customer`.

## Configurer Stripe [Côté serveur] [Côté client]

### Côté serveur

Cette intégration exige que votre serveur dispose de endpoints qui communiquent avec l’API Stripe. Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre serveur&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

### Côté client

Le [SDK iOS de Stripe](https://github.com/stripe/stripe-ios) est disponible en open source et [fait l’objet d’une documentation complète](https://stripe.dev/stripe-ios/index.html). Il est également compatible avec les applications prenant en charge iOS 13 et les versions ultérieures.

#### Swift Package Manager

Pour installer le SDK, veuillez suivre les étapes ci-dessous&nbsp;:

1. Dans Xcode, sélectionnez **File** > **Add Package Dependencies…** puis saisissez `https://github.com/stripe/stripe-ios-spm` en tant qu’URL du référentiel.
1. Sélectionnez le dernier numéro de version, visible sur notre [page des versions](https://github.com/stripe/stripe-ios/releases).
1. Ajoutez le produit **StripePaymentSheet** à la [cible de votre application](https://developer.apple.com/documentation/swift_packages/adding_package_dependencies_to_your_app).

#### CocoaPods

1. Si vous ne l’avez pas encore fait, installez la version la plus récente de [CocoaPods](https://guides.cocoapods.org/using/getting-started.html).
1. Si vous n’avez pas de fichier [Podfile](https://guides.cocoapods.org/syntax/podfile.html), exécutez la commande suivante pour en créer un&nbsp;:
   ```bash
   pod init
   ```
1. Ajoutez cette ligne à votre `Podfile`&nbsp;:
   ```podfile
   pod 'StripePaymentSheet'
   ```
1. Exécutez la commande suivante&nbsp;:
   ```bash
   pod install
   ```
1. À partir de maintenant, n’oubliez pas d’utiliser le fichier .xcworkspace au lieu du fichier .xcodeproj pour ouvrir votre projet dans Xcode.
1. Pour mettre à jour ultérieurement le SDK vers la version la plus récente, il vous suffit d’exécuter&nbsp;:
   ```bash
   pod update StripePaymentSheet
   ```

#### Carthage

1. Si vous ne l’avez pas encore fait, installez la version la plus récente de [Carthage](https://github.com/Carthage/Carthage#installing-carthage).
1. Ajoutez cette ligne à votre `Cartfile`&nbsp;:
   ```cartfile
   github "stripe/stripe-ios"
   ```
1. Suivez les [instructions d’installation de Carthage](https://github.com/Carthage/Carthage#if-youre-building-for-ios-tvos-or-watchos). Veillez à intégrer tous les cadres requis listés [ici](https://github.com/stripe/stripe-ios/tree/master/StripePaymentSheet/README.md#manual-linking).
1. Pour mettre à jour ultérieurement le SDK vers la version la plus récente, exécutez la commande suivante&nbsp;:
   ```bash
   carthage update stripe-ios --platform ios
   ```

#### Cadre manuel

1. Accédez à notre [page des versions GitHub](https://github.com/stripe/stripe-ios/releases/latest), puis téléchargez et décompressez **Stripe.xcframework.zip**.
1. Faites glisser **StripePaymentSheet.xcframework** vers la section **Embedded Binaries (Fichiers binaires incorporés)** des paramètres **General (Général)** de votre projet Xcode. Veillez à sélectionner **Copy items if needed (Copier les éléments si nécessaire)**.
1. Répétez l’étape 2 pour tous les cadres requis listés [ici](https://github.com/stripe/stripe-ios/tree/master/StripePaymentSheet/README.md#manual-linking).
1. À l’avenir, pour mettre à jour vers la version la plus récente de notre SDK, répétez les étapes&nbsp;1 à 3.

> Pour obtenir de plus amples informations sur la version la plus récente du SDK et ses versions antérieures, consultez la page des [versions](https://github.com/stripe/stripe-ios/releases) sur GitHub. Pour recevoir une notification lors de la publication d’une nouvelle version, [surveillez les versions](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) à partir du référentiel.

## Activer les moyens de paiement

Affichez vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) et activez les moyens de paiement que vous souhaitez prendre en charge. Vous devez activer au moins un moyen de paiement pour créer un *PaymentIntent* (The Payment Intents API tracks the lifecycle of a customer checkout flow and triggers additional authentication steps when required by regulatory mandates, custom Radar fraud rules, or redirect-based payment methods).

Par défaut, Stripe active les cartes bancaires et les autres moyens de paiement courants qui peuvent vous permettre d’atteindre davantage de clients. Nous vous recommandons toutefois d’activer d’autres moyens de paiement pertinents pour votre entreprise et vos clients. Consultez la page [Prise en charge des moyens de paiement](https://docs.stripe.com/payments/payment-methods/payment-method-support.md) pour en savoir plus sur la prise en charge des produits et des moyens de paiement, et notre [page des tarifs](https://stripe.com/pricing/local-payment-methods) pour prendre connaissance des frais que nous appliquons.

## Ajouter un endpoint [Côté serveur]

> #### Remarque
> 
> Pour afficher PaymentSheet avant de créer un PaymentIntent, consultez notre article [Collecter les détails du paiement avant de créer un Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

Cette intégration utilise trois&nbsp;objets de l’API Stripe&nbsp;:

1. [PaymentIntent](https://docs.stripe.com/api/payment_intents.md)&nbsp;: pour représenter votre intention d’encaisser le paiement d’un client, Stripe utilise un objet PaymentIntent qui suit vos tentatives de débit et les changements d’état du paiement tout au long du processus.

1. (Optional) Un objet [Account côté client](https://docs.stripe.com/api/v2/core/accounts/object.md#v2_account_object-applied_configurations) ou [Customer](https://docs.stripe.com/api/customers.md)&nbsp;: pour configurer un moyen de paiement en vue de paiements futurs, vous devez l’associer à un client. Créez un objet pour représenter votre client lorsqu’il ouvre un compte chez vous. Si votre client effectue un paiement en tant qu’invité, vous pouvez créer un objet `Account` ou `Customer` avant le paiement, puis l’associer ultérieurement à votre représentation interne du compte client.

1. (Optional) [CustomerSession](https://docs.stripe.com/api/customer_sessions.md)&nbsp;: l’objet qui représente votre client contient des informations sensibles qu’il n’est pas possible de récupérer directement depuis une application. Une `CustomerSession` accorde au SDK un accès temporaire à l’objet `Account` ou `Customer` et fournit des options de configuration supplémentaires. Consultez la liste complète des [options de configuration](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components).

> Si vous n’enregistrez jamais les cartes bancaires des clients et que vous n’autorisez pas vos clients récurrents à réutiliser les cartes enregistrées, vous pouvez exclure les objets `Account` ou `Customer`, ainsi que l’objet `CustomerSession` de votre intégration.

Pour des raisons de sécurité, votre application ne peut pas créer ces objets. À la place, ajoutez sur votre serveur un endpoint qui&nbsp;:

1. Récupère l’objet `Account` ou `Customer` ou en crée un nouveau.
1. Crée une [CustomerSession](https://docs.stripe.com/api/customer_sessions.md) pour l’objet `Account` ou `Customer` concerné.
1. Crée un `PaymentIntent` avec les valeurs [amount](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-amount), [la currency](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-currency), et soit [customer_account](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer_account), soit [customer](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer).
1. Renvoie la *clé secrète du client* (The client secret is a unique key returned from Stripe as part of a PaymentIntent. This key lets the client access important fields from the PaymentIntent (status, amount, currency) while hiding sensitive ones (metadata, customer)) du `PaymentIntent`, le `client_secret` de la `CustomerSession`, l’ID de l’objet `Account` ou `Customer` et votre [clé publique](https://dashboard.stripe.com/apikeys) pour votre application.

Les moyens de paiement présentés à votre client lors du processus de paiement sont également inclus dans le PaymentIntent. Vous pouvez laisser Stripe extraire (depuis les paramètres de votre Dashboard) les moyens de paiement à présenter, ou les répertorier manuellement. Quelle que soit l’option que vous choisissez, sachez que la devise transmise dans le PaymentIntent filtre les moyens de paiement présentés au client. Par exemple, si vous transmettez `eur` dans le PaymentIntent et que vous avez activé OXXO dans votre Dashboard, votre client ne verra pas ce moyen de paiement étant donné qu’OXXO ne prend pas en charge les paiements en `eur`.

À moins que votre intégration ne nécessite du code pour la présentation des moyens de paiement, Stripe vous recommande l’option automatisée. En effet, Stripe évalue la devise, les restrictions en matière de moyens de paiement ainsi que d’autres paramètres pour dresser la liste des moyens de paiement pris en charge. Ceux qui augmentent le taux de conversion et qui sont les plus pertinents pour la devise et le lieu de résidence du client sont priorisés.

#### Gérer les moyens de paiement dans le Dashboard

Vous pouvez gérer les moyens de paiement depuis le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe gère le renvoi des moyens de paiement admissibles en fonction de facteurs tels que le montant de la transaction, la devise et le tunnel de paiement. Le PaymentIntent est créé à l’aide des moyens de paiement configurés dans le Dashboard. Si vous ne souhaitez pas utiliser le Dashboard ou souhaitez spécifier des moyens de paiement manuellement, vous pouvez les répertorier à l’aide de l’attribut `payment_method_types`.

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,

    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

#### Répertorier manuellement les moyens de paiement

#### Node.js

```javascript

// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,
    payment_method_types: ['bancontact', 'card', 'ideal', 'klarna', 'sepa_debit'],
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

> Chacun des moyens de paiement doit prendre en charge la devise transmise dans le PaymentIntent, et votre activité doit par ailleurs être basée dans l’un des pays pris en charge par chaque moyen de paiement. Consultez la page [Options d’intégration des moyens de paiement](https://docs.stripe.com/payments/payment-methods/integration-options.md) pour plus d’informations sur la prise en charge.

## Collecter les données de paiement [Côté client]

Pour afficher le composant Payment Element mobile sur votre page de paiement&nbsp;:

- Afficher les produits commandés et le montant total des achats
- Utiliser le composant [Address Element](https://docs.stripe.com/elements/address-element.md?platform=ios) pour collecter toutes les informations de livraison requises auprès du client
- Ajouter un bouton de paiement pour afficher l’interface utilisateur de Stripe

#### UIKit

#### Accounts&nbsp;v2

Sur la page de paiement de votre application, récupérez la clé secrète du client de l’PaymentIntent, la clé secrète du client de la `CustomerSession`, l’ID de l’`Account` configuré du client et la clé publiable à partir de l’endpoint que vous avez créé à l’étape précédente. Utilisez `STPAPIClient.shared` pour définir votre clé publiable et initialiser la [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html).

#### iOS (Swift)

```swift
import UIKit@_spi(CustomerSessionBetaAccess) import StripePaymentSheet

class CheckoutViewController: UIViewController {
  @IBOutlet weak var checkoutButton: UIButton!
  var paymentSheet: PaymentSheet?
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint

  override func viewDidLoad() {
    super.viewDidLoad()

    checkoutButton.addTarget(self, action: #selector(didTapCheckoutButton), for: .touchUpInside)
    checkoutButton.isEnabled = false

    // MARK: Fetch the PaymentIntent client secret, CustomerSession client secret, customer-configured Account ID, and publishable key
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerAccountId = json["customerAccount"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            let paymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }
STPAPIClient.shared.publishableKey = publishableKey// MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customerAccount = .init(id: customerAccountId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business handles
      // delayed notification payment methods like US bank accounts.
      configuration.allowsDelayedPaymentMethods = true
      self.paymentSheet = PaymentSheet(paymentIntentClientSecret:paymentIntentClientSecret, configuration: configuration)

      DispatchQueue.main.async {
        self.checkoutButton.isEnabled = true
      }
    })
    task.resume()
  }

}
```

#### Customers&nbsp;v1

Sur la page de paiement de votre application, récupérez la clé secrète du client de l’PaymentIntent, la clé secrète du client de la `CustomerSession`, l’ID du `Customer` et la clé publiable à partir de l’endpoint que vous avez créé à l’étape précédente. Utilisez `STPAPIClient.shared` pour définir votre clé publiable et initialiser la [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html).

#### iOS (Swift)

```swift
import UIKit@_spi(CustomerSessionBetaAccess) import StripePaymentSheet

class CheckoutViewController: UIViewController {
  @IBOutlet weak var checkoutButton: UIButton!
  var paymentSheet: PaymentSheet?
  let backendCheckoutUrl = URL(string: "Your backend endpoint/payment-sheet")! // Your backend endpoint

  override func viewDidLoad() {
    super.viewDidLoad()

    checkoutButton.addTarget(self, action: #selector(didTapCheckoutButton), for: .touchUpInside)
    checkoutButton.isEnabled = false

    // MARK: Fetch the PaymentIntent client secret, CustomerSession client secret, Customer ID, and publishable key
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerId = json["customer"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            let paymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }
STPAPIClient.shared.publishableKey = publishableKey// MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customer = .init(id: customerId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business handles
      // delayed notification payment methods like US bank accounts.
      configuration.allowsDelayedPaymentMethods = true
      self.paymentSheet = PaymentSheet(paymentIntentClientSecret:paymentIntentClientSecret, configuration: configuration)

      DispatchQueue.main.async {
        self.checkoutButton.isEnabled = true
      }
    })
    task.resume()
  }

}
```

Quand le client appuie sur le bouton de **paiement**, appelez `present` pour afficher la PaymentSheet. Une fois la transaction effectuée, Stripe ferme le PaymentSheet et appelle le bloc de finalisation avec un [PaymentSheetResult](https://stripe.dev/stripe-ios/stripe-paymentsheet/Enums/PaymentSheetResult.html).

#### iOS (Swift)

```swift
@objc
func didTapCheckoutButton() {
  // MARK: Start the checkout process
  paymentSheet?.present(from: self) { paymentResult in
    // MARK: Handle the payment result
    switch paymentResult {
    case .completed:
      print("Your order is confirmed")
    case .canceled:
      print("Canceled!")
    case .failed(let error):
      print("Payment failed: \(error)")
    }
  }
}
```

#### SwiftUI

#### Accounts&nbsp;v2

Créez un modèle `ObservableObject` pour votre écran de paiement. Ce modèle publie un [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html) et un [PaymentSheetResult](https://stripe.dev/stripe-ios/stripe-paymentsheet/Enums/PaymentSheetResult.html).

```swift
import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?
}
```

Récupérez la clé secrète du client de l’PaymentIntent, la clé secrète du client de la `CustomerSession`, l’ID de l’`Account` configuré du client et la clé publiable à partir de l’endpoint que vous avez créé à l’étape précédente. Utilisez `STPAPIClient.shared` pour définir votre clé publiable et initialiser la [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html).

```swift
@_spi(CustomerSessionBetaAccess) import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?
func preparePaymentSheet() {
    // MARK: Fetch thePaymentIntent and customer information from the back end
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerAccountId = json["customerAccount"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            letpaymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }

      STPAPIClient.shared.publishableKey = publishableKey// MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customerAccount = .init(id: customerAccountId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business handles
      // delayed notification payment methods like US bank accounts.
      configuration.allowsDelayedPaymentMethods = true

      DispatchQueue.main.async {
        self.paymentSheet = PaymentSheet(paymentIntentClientSecret:paymentIntentClientSecret, configuration: configuration)
      }
    })
    task.resume()
  }
}
struct CheckoutView: View {
  @ObservedObject var model = CheckoutViewModel()

  var body: some View {
    VStack {
      if model.paymentSheet != nil {
        Text("Ready to pay.")
      } else {
        Text("Loading…")
      }
    }.onAppear { model.preparePaymentSheet() }
  }
}
```

Ajoutez un [PaymentSheet.PaymentButton](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/PaymentButton.html) à votre `View`. Il présente un comportement similaire à un `Button` SwiftUI, ce qui vous permet de le personnaliser en ajoutant une `View`. Lorsque vous appuyez sur le bouton, la PaymentSheet s’affiche. Une fois la transaction finalisée, Stripe ferme la PaymentSheet et appelle le gestionnaire `onCompletion` avec un objet [PaymentSheetResult](https://stripe.dev/stripe-ios/stripe-paymentsheet/Enums/PaymentSheetResult.html).

```swift
@_spi(CustomerSessionBetaAccess) import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?

  func preparePaymentSheet() {
    // MARK: Fetch the PaymentIntent and customer information from the back end
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerAccountId = json["customerAccount"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            let paymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }

      STPAPIClient.shared.publishableKey = publishableKey
      // MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customerAccount = .init(id: customerAccountId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment methods
      // that complete payment after a delay, like SEPA Debit and Sofort.
      configuration.allowsDelayedPaymentMethods = true

      DispatchQueue.main.async {
        self.paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration)
      }
    })
    task.resume()
  }
func onPaymentCompletion(result: PaymentSheetResult) {
    self.paymentResult = result
  }
}

struct CheckoutView: View {
  @ObservedObject var model = CheckoutViewModel()

  var body: some View {
    VStack {if let paymentSheet = model.paymentSheet {
        PaymentSheet.PaymentButton(
          paymentSheet: paymentSheet,
          onCompletion: model.onPaymentCompletion
        ) {
          Text("Buy")
        }
      } else {
        Text("Loading…")
      }if let result = model.paymentResult {
        switch result {
        case .completed:
          Text("Payment complete")
        case .failed(let error):
          Text("Payment failed: \(error.localizedDescription)")
        case .canceled:
          Text("Payment canceled.")
        }
      }
    }.onAppear { model.preparePaymentSheet() }
  }
}
```

#### Customers&nbsp;v1

Créez un modèle `ObservableObject` pour votre écran de paiement. Ce modèle publie un [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html) et un [PaymentSheetResult](https://stripe.dev/stripe-ios/stripe-paymentsheet/Enums/PaymentSheetResult.html).

```swift
import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?
}
```

Récupérez la clé secrète du client de l’PaymentIntent, la clé secrète du client de la CustomerSession, l’ID du `Customer` et la clé publiable à partir de l’endpoint que vous avez créé à l’étape précédente. Utilisez `STPAPIClient.shared` pour définir votre clé publiable et initialiser la [PaymentSheet](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet.html).

```swift
@_spi(CustomerSessionBetaAccess) import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?
func preparePaymentSheet() {
    // MARK: Fetch thePaymentIntent and Customer information from the back end
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerId = json["customer"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            letpaymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }

      STPAPIClient.shared.publishableKey = publishableKey// MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customer = .init(id: customerId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business handles
      // delayed notification payment methods like US bank accounts.
      configuration.allowsDelayedPaymentMethods = true

      DispatchQueue.main.async {
        self.paymentSheet = PaymentSheet(paymentIntentClientSecret:paymentIntentClientSecret, configuration: configuration)
      }
    })
    task.resume()
  }
}
struct CheckoutView: View {
  @ObservedObject var model = CheckoutViewModel()

  var body: some View {
    VStack {
      if model.paymentSheet != nil {
        Text("Ready to pay.")
      } else {
        Text("Loading…")
      }
    }.onAppear { model.preparePaymentSheet() }
  }
}
```

Ajoutez un [PaymentSheet.PaymentButton](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/PaymentButton.html) à votre `View`. Il présente un comportement similaire à un `Button` SwiftUI, ce qui vous permet de le personnaliser en ajoutant une `View`. Lorsque vous appuyez sur le bouton, la PaymentSheet s’affiche. Une fois la transaction finalisée, Stripe ferme la PaymentSheet et appelle le gestionnaire `onCompletion` avec un objet [PaymentSheetResult](https://stripe.dev/stripe-ios/stripe-paymentsheet/Enums/PaymentSheetResult.html).

```swift
@_spi(CustomerSessionBetaAccess) import StripePaymentSheet
import SwiftUI

class CheckoutViewModel: ObservableObject {
  let backendCheckoutUrl = URL(string: "Your back-end endpoint/payment-sheet")! // Your back-end endpoint
  @Published var paymentSheet: PaymentSheet?
  @Published var paymentResult: PaymentSheetResult?

  func preparePaymentSheet() {
    // MARK: Fetch the PaymentIntent and Customer information from the back end
    var request = URLRequest(url: backendCheckoutUrl)
    request.httpMethod = "POST"
    let task = URLSession.shared.dataTask(with: request, completionHandler: { [weak self] (data, response, error) in
      guard let data = data,
            let json = try? JSONSerialization.jsonObject(with: data, options: []) as? [String : Any],
            let customerId = json["customer"] as? String,
            let customerSessionClientSecret = json["customerSessionClientSecret"] as? String,
            let paymentIntentClientSecret = json["paymentIntent"] as? String,
            let publishableKey = json["publishableKey"] as? String,
            let self = self else {
        // Handle error
        return
      }

      STPAPIClient.shared.publishableKey = publishableKey
      // MARK: Create a PaymentSheet instance
      var configuration = PaymentSheet.Configuration()
      configuration.merchantDisplayName = "Example, Inc."
      configuration.customer = .init(id: customerId, customerSessionClientSecret: customerSessionClientSecret)
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment methods
      // that complete payment after a delay, like SEPA Debit and Sofort.
      configuration.allowsDelayedPaymentMethods = true

      DispatchQueue.main.async {
        self.paymentSheet = PaymentSheet(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration)
      }
    })
    task.resume()
  }
func onPaymentCompletion(result: PaymentSheetResult) {
    self.paymentResult = result
  }
}

struct CheckoutView: View {
  @ObservedObject var model = CheckoutViewModel()

  var body: some View {
    VStack {if let paymentSheet = model.paymentSheet {
        PaymentSheet.PaymentButton(
          paymentSheet: paymentSheet,
          onCompletion: model.onPaymentCompletion
        ) {
          Text("Buy")
        }
      } else {
        Text("Loading…")
      }if let result = model.paymentResult {
        switch result {
        case .completed:
          Text("Payment complete")
        case .failed(let error):
          Text("Payment failed: \(error.localizedDescription)")
        case .canceled:
          Text("Payment canceled.")
        }
      }
    }.onAppear { model.preparePaymentSheet() }
  }
}
```

Si la valeur de `PaymentSheetResult` est `.completed`, informez le client (par exemple, en affichant un écran de confirmation de commande).

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.

## Configurer une URL de redirection [Côté client]

Le client peut quitter votre application pour s’authentifier (par exemple, dans Safari ou dans son application bancaire). Pour lui permettre de revenir automatiquement sur votre application après s’être authentifié, [configurez un schéma d’URL personnalisé](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app) et configurez votre délégué d’application pour qu’il transmette l’URL au SDK. Stripe ne prend pas en charge les [liens universels](https://developer.apple.com/documentation/xcode/allowing-apps-and-websites-to-link-to-your-content).

#### SceneDelegate

#### Swift

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else {
        return
    }
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (!stripeHandled) {
        // This was not a Stripe url – handle the URL normally as you would
    }
}

```

#### AppDelegate

#### Swift

```swift
// This method handles opening custom URL schemes (for example, "your-app://stripe-redirect")
func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    let stripeHandled = StripeAPI.handleURLCallback(with: url)
    if (stripeHandled) {
        return true
    } else {
        // This was not a Stripe url – handle the URL normally as you would
    }
    return false
}
```

#### SwiftUI

#### Swift

```swift

@main
struct MyApp: App {
  var body: some Scene {
    WindowGroup {
      Text("Hello, world!").onOpenURL { incomingURL in
          let stripeHandled = StripeAPI.handleURLCallback(with: incomingURL)
          if (!stripeHandled) {
            // This was not a Stripe url – handle the URL normally as you would
          }
        }
    }
  }
}
```

Définissez également le paramètre [returnURL](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:6Stripe12PaymentSheetC13ConfigurationV9returnURLSSSgvp) correspondant à votre objet [PaymentSheet.Configuration](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html) sur l’URL de votre application.

```swift
var configuration = PaymentSheet.Configuration()
configuration.returnURL = "your-app://stripe-redirect"
```

## Gérer les événements post-paiement [Côté serveur]

Stripe envoie un événement [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) à l’issue du paiement. Utilisez l’[outil de webhook du Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir ces événements et exécuter des actions, comme envoyer une confirmation de commande par e-mail à votre client, enregistrer la vente dans une base de données ou lancer un flux de livraison.

Plutôt que d’attendre un rappel de votre client, écoutez ces événements. Côté client, il arrive en effet que l’utilisateur ferme la fenêtre de son navigateur ou quitte l’application avant l’exécution du rappel. Certains clients malintentionnés peuvent d’autre part tenter de manipuler la réponse. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule et même intégration.

En plus de l’événement `payment_intent.succeeded`, nous vous recommandons de gérer ces autres événements lorsque vous encaissez des paiements à l’aide de l’Element Payment&nbsp;:

| Événement                                                                                                                       | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Envoyé lorsqu’un client effectue un paiement avec succès.                                                                                                                                                                                                                           | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande.           |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Envoyé lorsqu’un client initie un paiement, mais qu’il ne l’a pas encore finalisé. Dans la plupart des cas, cet événement est envoyé lorsque le client initie un prélèvement bancaire. Il est suivi par un événement `payment_intent.succeeded` ou `payment_intent.payment_failed`. | Envoyez au client une confirmation de commande qui indique que son paiement est en attente. Pour des marchandises dématérialisées, vous pourrez traiter la commande sans attendre que le paiement soit effectué. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Envoyé lorsqu’un client effectue une tentative de paiement qui se solde par un échec.                                                                                                                                                                                               | Si un paiement passe de l’état `processing` à `payment_failed`, proposez au client de retenter le paiement.                                                                                                      |

## Tester l'intégration

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Virements avec redirection bancaire

| Moyen de paiement | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bancontact, iDEAL | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche. |
| Pay by Bank       | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                      |
| Pay by Bank       | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                  |
| BLIK              | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                      |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Enable Link

Activez Link dans vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) pour permettre à vos clients d’enregistrer et de réutiliser en toute sécurité leurs informations de paiement à l’aide du bouton de paiement express en un clic de Link.

### Transmettre l’adresse e-mail de votre client au composant Mobile Payment Element

Link authentifie un client à l’aide de son adresse e-mail. Stripe recommande de préremplir autant d’informations que possible afin de simplifier le processus de paiement.

Pour préremplir le nom, l’adresse e-mail et le numéro de téléphone du client, fournissez la propriété `defaultBillingDetails` avec vos informations client après avoir initialisé `PaymentSheet.Configuration`.

```swift
var configuration = PaymentSheet.Configuration()
configuration.defaultBillingDetails.name = "Jenny Rosen"
configuration.defaultBillingDetails.email = "jenny.rosen@example.com"
configuration.defaultBillingDetails.phone = "888-888-8888"
```

## Optional: Activer Apple&nbsp;Pay

> Si votre écran de contrôle dispose d’un **bouton Apple&nbsp;Pay** dédié, suivez le [guide Apple&nbsp;Pay](https://docs.stripe.com/apple-pay.md#present-payment-sheet) et utilisez `ApplePayContext` pour encaisser des paiements à partir de votre bouton Apple&nbsp;Pay. Vous pouvez utiliser `PaymentSheet` pour gérer d’autres moyens de paiement.

### Demander un ID de marchand Apple

Pour obtenir un ID de marchand Apple, [demandez un nouvel identifiant](https://developer.apple.com/account/resources/identifiers/add/merchant) sur le site Web Apple Developer.

Renseignez le formulaire en indiquant une description et un identifiant. La description n’est destinée qu’à votre propre information et vous pourrez la modifier ultérieurement au besoin. En ce qui concerne l’identifiant, Stripe vous recommande d’utiliser le nom de votre application (par exemple, `merchant.com.{{YOUR_APP_NAME}}`).

### Créer un nouveau certificat Apple&nbsp;Pay

Créez un certificat permettant à votre application de chiffrer les données de paiement.

Accédez aux [paramètres des certificats iOS](https://dashboard.stripe.com/settings/ios_certificates) dans le Dashboard, cliquez sur **Ajouter une nouvelle application** et suivez le guide.

Téléchargez un fichier CSR (Certificate Signing Request) pour obtenir d’Apple un certificat sécurisé vous autorisant à utiliser Apple&nbsp;Pay.

Un fichier CSR peut émettre exactement un certificat. Si vous changez d’ID de marchand Apple, vous devez accéder aux [paramètres des certificats iOS](https://dashboard.stripe.com/settings/ios_certificates) dans le Dashboard pour obtenir un nouveau fichier CSR et un nouveau certificat.

### Réaliser une intégration avec Xcode

Ajoutez la fonctionnalité Apple&nbsp;Pay à votre application. Dans Xcode, ouvrez vos paramètres de projet, cliquez sur l’onglet **Signature et fonctionnalités**, puis ajoutez **Apple&nbsp;Pay**. Vous serez peut-être alors invité(e) à vous connecter à votre compte développeur. Sélectionnez l’ID du marchand créé plus tôt. Il est désormais possible d’utiliser Apple&nbsp;Pay sur votre application.
![](https://b.stripecdn.com/docs-statics-srv/assets/xcode.a701d4c1922d19985e9c614a6f105bf1.png)

Activez la fonctionnalité Apple&nbsp;Pay dans Xcode

### Ajouter Apple&nbsp;Pay

#### Paiement ponctuel

Pour ajouter Apple&nbsp;Pay à PaymentSheet, définissez [applePay](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:6Stripe12PaymentSheetC13ConfigurationV8applePayAC05ApplefD0VSgvp) après avoir initialisé `PaymentSheet.Configuration` avec votre ID de marchand Apple et le [code pays de votre entreprise](https://dashboard.stripe.com/settings/account).

#### iOS (Swift)

```swift
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(
  merchantId: "merchant.com.your_app_name",
  merchantCountryCode: "US"
)
```

#### Paiements récurrents

Pour ajouter Apple&nbsp;Pay à PaymentSheet, définissez [applePay](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:6Stripe12PaymentSheetC13ConfigurationV8applePayAC05ApplefD0VSgvp) après avoir initialisé `PaymentSheet.Configuration` avec votre ID de marchand Apple et le [code pays de votre entreprise](https://dashboard.stripe.com/settings/account).

Conformément aux [directives d’Apple](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) pour les paiements récurrents, vous devez également définir des attributs supplémentaires sur la `PKPaymentRequest`. Ajoutez un gestionnaire dans [ApplePayConfiguration.paymentRequestHandlers](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/paymentrequesthandler) pour configurer les [PKPaymentRequest.paymentSummaryItems](https://developer.apple.com/documentation/passkit/pkpaymentrequest/1619231-paymentsummaryitems) avec le montant que vous avez l’intention de facturer (par exemple, 9,95&nbsp;USD par mois).

Vous pouvez également adopter des [tokens de marchand](https://developer.apple.com/apple-pay/merchant-tokens/) en définissant les propriétés `recurringPaymentRequest` ou `automaticReloadPaymentRequest` dans `PKPaymentRequest`.

Pour en savoir plus sur l’utilisation des paiements récurrents avec Apple Pay, consultez la [documentation PassKit d’Apple](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

#### iOS (Swift)

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    paymentRequestHandler: { request in
        // PKRecurringPaymentSummaryItem is available on iOS 15 or later
        if #available(iOS 15.0, *) {
            let billing = PKRecurringPaymentSummaryItem(label: "My Subscription", amount: NSDecimalNumber(string: "59.99"))

            // Payment starts today
            billing.startDate = Date()

            // Payment ends in one year
            billing.endDate = Date().addingTimeInterval(60 * 60 * 24 * 365)

            // Pay once a month.
            billing.intervalUnit = .month
            billing.intervalCount = 1

            // recurringPaymentRequest is only available on iOS 16 or later
            if #available(iOS 16.0, *) {
                request.recurringPaymentRequest = PKRecurringPaymentRequest(paymentDescription: "Recurring",
                                                                            regularBilling: billing,
                                                                            managementURL: URL(string: "https://my-backend.example.com/customer-portal")!)
                request.recurringPaymentRequest?.billingAgreement = "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'"
            }
            request.paymentSummaryItems = [billing]
            request.currencyCode = "USD"
        } else {
            // On older iOS versions, set alternative summary items.
            request.paymentSummaryItems = [PKPaymentSummaryItem(label: "Monthly plan starting July 1, 2022", amount: NSDecimalNumber(string: "59.99"), type: .final)]
        }
        return request
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                                merchantCountryCode: "US",
                                customHandlers: customHandlers)
```

### Suivi de commande

Pour ajouter des informations de [suivi de commande](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) dans iOS&nbsp;16 ou version ultérieure, configurez un [authorizationResultHandler](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/applepayconfiguration/handlers/authorizationresulthandler) dans votre `PaymentSheet.ApplePayConfiguration.Handlers`. Stripe effectue un appel vers votre implémentation une fois le paiement effectué, mais avant qu’iOS ne ferme la fiche Apple Pay.

Dans votre déploiement `authorizationResultHandler`, récupérez les détails de la commande finalisée sur votre serveur. Ajoutez ces informations au [PKPaymentAuthorizationResult](https://developer.apple.com/documentation/passkit/pkpaymentauthorizationresult) spécifié, et renvoyez le résultat modifié.

Pour en savoir plus sur le suivi des commandes, consultez la [documentation Apple’s Wallet Orders](https://developer.apple.com/documentation/walletorders).

#### iOS (Swift)

```swift
let customHandlers = PaymentSheet.ApplePayConfiguration.Handlers(
    authorizationResultHandler: { result in
      do {
        // Fetch the order details from your service
        let myOrderDetails = try await MyAPIClient.shared.fetchOrderDetails(orderID: orderID)
        result.orderDetails = PKPaymentOrderDetails(
          orderTypeIdentifier: myOrderDetails.orderTypeIdentifier, // "com.myapp.order"
          orderIdentifier: myOrderDetails.orderIdentifier, // "ABC123-AAAA-1111"
          webServiceURL: myOrderDetails.webServiceURL, // "https://my-backend.example.com/apple-order-tracking-backend"
          authenticationToken: myOrderDetails.authenticationToken) // "abc123"
        // Return your modified PKPaymentAuthorizationResult
        return result
      } catch {
        return PKPaymentAuthorizationResult(status: .failure, errors: [error])
      }
    }
)
var configuration = PaymentSheet.Configuration()
configuration.applePay = .init(merchantId: "merchant.com.your_app_name",
                               merchantCountryCode: "US",
                               customHandlers: customHandlers)
```

## Activer la numérisation de carte

Pour activer la numérisation des cartes pour iOS, définissez le paramètre `NSCameraUsageDescription` (**Confidentialité – Description de l’utilisation de l’appareil photo**) dans le fichier `Info.plist` de votre application et indiquez le motif d’accès à l’appareil photo («&nbsp;pour numériser des cartes&nbsp;», par exemple).

## Optional: Activer les paiements ACH

Intégrez `StripeFinancialConnections` en tant que dépendance pour votre application afin d’activer les paiements par prélèvements ACH.

Le [SDK iOS de Stripe](https://github.com/stripe/stripe-ios) est disponible en open source et [fait l’objet d’une documentation complète](https://stripe.dev/stripe-ios/index.html). Il est également compatible avec les applications prenant en charge iOS 13 et les versions ultérieures.

#### Swift Package Manager

Pour installer le SDK, veuillez suivre les étapes ci-dessous&nbsp;:

1. Dans Xcode, sélectionnez **File** > **Add Package Dependencies…** puis saisissez `https://github.com/stripe/stripe-ios-spm` en tant qu’URL du référentiel.
1. Sélectionnez le dernier numéro de version, visible sur notre [page des versions](https://github.com/stripe/stripe-ios/releases).
1. Ajoutez le produit **StripeFinancialConnections** à la [cible de votre application](https://developer.apple.com/documentation/swift_packages/adding_package_dependencies_to_your_app).

#### CocoaPods

1. Si vous ne l’avez pas encore fait, installez la version la plus récente de [CocoaPods](https://guides.cocoapods.org/using/getting-started.html).
1. Si vous n’avez pas de fichier [Podfile](https://guides.cocoapods.org/syntax/podfile.html), exécutez la commande suivante pour en créer un&nbsp;:
   ```bash
   pod init
   ```
1. Ajoutez cette ligne à votre `Podfile`&nbsp;:
   ```podfile
   pod 'StripeFinancialConnections'
   ```
1. Exécutez la commande suivante&nbsp;:
   ```bash
   pod install
   ```
1. À partir de maintenant, n’oubliez pas d’utiliser le fichier .xcworkspace au lieu du fichier .xcodeproj pour ouvrir votre projet dans Xcode.
1. Pour mettre à jour ultérieurement le SDK vers la version la plus récente, il vous suffit d’exécuter&nbsp;:
   ```bash
   pod update StripeFinancialConnections
   ```

#### Carthage

1. Si vous ne l’avez pas encore fait, installez la version la plus récente de [Carthage](https://github.com/Carthage/Carthage#installing-carthage).
1. Ajoutez cette ligne à votre `Cartfile`&nbsp;:
   ```cartfile
   github "stripe/stripe-ios"
   ```
1. Suivez les [instructions d’installation de Carthage](https://github.com/Carthage/Carthage#if-youre-building-for-ios-tvos-or-watchos). Veillez à intégrer tous les cadres requis listés [ici](https://github.com/stripe/stripe-ios/tree/master/StripeFinancialConnections/README.md#manual-linking).
1. Pour mettre à jour ultérieurement le SDK vers la version la plus récente, exécutez la commande suivante&nbsp;:
   ```bash
   carthage update stripe-ios --platform ios
   ```

#### Cadre manuel

1. Accédez à notre [page des versions GitHub](https://github.com/stripe/stripe-ios/releases/latest), puis téléchargez et décompressez **Stripe.xcframework.zip**.
1. Faites glisser **StripeFinancialConnections.xcframework** vers la section **Embedded Binaries (Fichiers binaires incorporés)** des paramètres **General (Général)** de votre projet Xcode. Veillez à sélectionner **Copy items if needed (Copier les éléments si nécessaire)**.
1. Répétez l’étape 2 pour tous les cadres requis listés [ici](https://github.com/stripe/stripe-ios/tree/master/StripeFinancialConnections/README.md#manual-linking).
1. À l’avenir, pour mettre à jour vers la version la plus récente de notre SDK, répétez les étapes&nbsp;1 à 3.

> Pour obtenir de plus amples informations sur la version la plus récente du SDK et ses versions antérieures, consultez la page des [versions](https://github.com/stripe/stripe-ios/releases) sur GitHub. Pour recevoir une notification lors de la publication d’une nouvelle version, [surveillez les versions](https://help.github.com/en/articles/watching-and-unwatching-releases-for-a-repository#watching-releases-for-a-repository) à partir du référentiel.

## Optional: Personnaliser la fiche

Pour personnaliser le formulaire de paiement, vous devez obligatoirement utiliser l’objet [PaymentSheet.Configuration](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html).

### Appearance

Personnalisez les couleurs, les polices et plus encore afin de vous adapter à l’apparence de votre application à l’aide de l’[API&nbsp;Appearance](https://docs.stripe.com/elements/appearance-api/mobile.md?platform=ios).

### Mise en page des moyens de paiement

Configurez la mise en page des moyens de paiement dans la feuille à l’aide de [paymentMethodLayout](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/configuration-swift.struct/paymentmethodlayout). Vous pouvez les afficher horizontalement, verticalement ou laisser Stripe optimiser la mise en page automatiquement.
![](https://b.stripecdn.com/docs-statics-srv/assets/ios-mpe-payment-method-layouts.9d0513e2fcec5660378ba1824d952054.png)

#### Swift

```swift
var configuration = PaymentSheet.Configuration()
configuration.paymentMethodLayout = .automatic
```

### Recueillir les adresses des utilisateurs

Recueillez les adresses de livraison ou de facturation de vos clients locaux et internationaux à l’aide du composant [Address&nbsp;Element](https://docs.stripe.com/elements/address-element.md?platform=ios).

### Nom d’affichage du marchand

Spécifiez un nom d’entreprise à afficher pour le client en définissant [merchantDisplayName](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV19merchantDisplayNameSSvp). Par défaut, il s’agit du nom de votre application.

#### Swift

```swift
var configuration = PaymentSheet.Configuration()
configuration.merchantDisplayName = "My app, Inc."
```

### Mode sombre

`PaymentSheet` s’ajuste automatiquement en fonction des paramètres d’affichage du système de l’utilisateur (mode clair et foncé). Si votre application ne prend pas en charge le mode sombre, vous pouvez définir [style](https://stripe.dev/stripe-ios/stripe-paymentsheet/Classes/PaymentSheet/Configuration.html#/s:18StripePaymentSheet0bC0C13ConfigurationV5styleAC18UserInterfaceStyleOvp) sur le mode `alwaysLight` ou `alwaysDark`.

```swift
var configuration = PaymentSheet.Configuration()
configuration.style = .alwaysLight
```

### Informations de facturation par défaut

Si vous souhaitez définir des valeurs par défaut pour les informations de facturation collectées dans le formulaire de paiement, configurez la propriété `defaultBillingDetails`. Le `PaymentSheet` préremplit les champs avec les valeurs que vous fournissez.

```swift
var configuration = PaymentSheet.Configuration()
configuration.defaultBillingDetails.address.country = "US"
configuration.defaultBillingDetails.email = "foo@bar.com"
```

### Collecte des informations de facturation

Utilisez `billingDetailsCollectionConfiguration` pour spécifier la manière dont vous souhaitez collecter les informations de facturation dans le Payment Sheet.

Vous pouvez collecter le nom, l’adresse e-mail, le numéro de téléphone et l’adresse de votre client.

Si vous souhaitez uniquement indiquer les informations de facturation requises par le moyen de paiement, définissez la valeur de `billingDetailsCollectionConfiguration.attachDefaultsToPaymentMethod` sur «&nbsp;true&nbsp;». Dans ce cas, les `PaymentSheet.Configuration.defaultBillingDetails` sont définis comme les [informations de facturation](https://docs.stripe.com/api/payment_methods/object.md?lang=node#payment_method_object-billing_details) du moyen de paiement.

Si vous souhaitez collecter des informations de facturation supplémentaires qui ne sont pas nécessairement requises par le moyen de paiement, définissez la valeur de `billingDetailsCollectionConfiguration.attachDefaultsToPaymentMethod` sur false. Dans ce cas, les informations de facturation collectées depuis la `PaymentSheet` sont définies comme les informations de facturation du moyen de paiement.

```swift
var configuration = PaymentSheet.Configuration()
configuration.defaultBillingDetails.email = "foo@bar.com"
configuration.billingDetailsCollectionConfiguration.name = .always
configuration.billingDetailsCollectionConfiguration.email = .never
configuration.billingDetailsCollectionConfiguration.address = .full
configuration.billingDetailsCollectionConfiguration.attachDefaultsToPaymentMethod = true
```

> Consultez votre conseiller juridique au sujet des lois qui s’appliquent à la collecte d’informations. Ne collectez les numéros de téléphone que si vous en avez besoin pour la transaction.

## Optional: Gérer la déconnexion de l'utilisateur

`PaymentSheet` enregistre certaines informations localement pour se souvenir si un utilisateur a utilisé Link au sein d’une application. Pour effacer l’état interne de `PaymentSheet`, appelez la méthode `PaymentSheet.resetCustomer()` lorsque votre utilisateur se déconnecte.

```swift
import UIKit
import StripePaymentSheet

class MyViewController: UIViewController {

  @objc
  func didTapLogoutButton() {
    PaymentSheet.resetCustomer()
    // Other logout logic required by your app
  }

}
```

## Optional: Mener à bien le paiement dans votre interface utilisateur

Vous pouvez présenter le formulaire de paiement pour la seule collecte des données du moyen de paiement, puis appeler une méthode `confirm` pour mener à bien l’opération de paiement dans l’interface utilisateur de votre application. Cette approche est utile si vous avez intégré un bouton d’achat personnalisé ou si des étapes supplémentaires sont nécessaires après la collecte des informations de paiement.
![](https://b.stripecdn.com/docs-statics-srv/assets/ios-multi-step.cd631ea4f1cd8cf3f39b6b9e1e92b6c5.png)

Mener à bien le paiement dans l’interface utilisateur de votre application

#### UIKit

Les étapes suivantes vous expliquent comment mener à bien le paiement dans l’interface utilisateur de votre application. Consultez notre exemple d’intégration sur [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleCustomCheckoutViewController.swift).

1. Tout d’abord, initialisez [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) au lieu de `PaymentSheet`, puis mettez à jour votre interface utilisateur avec sa propriété `paymentOption`. Celle-ci contient une image et une étiquette représentant le moyen de paiement par défaut initialement sélectionné par le client.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Update your UI using paymentSheetFlowController.paymentOption
  }
}
```

1. Appelez ensuite `presentPaymentOptions` pour collecter les données de paiement. Une fois l’opération effectuée, mettez à nouveau à jour votre interface utilisateur avec la propriété `paymentOption`.

```swift
paymentSheetFlowController.presentPaymentOptions(from: self) {
  // Update your UI using paymentSheetFlowController.paymentOption
}
```

1. Enfin, appelez `confirm`.

```swift
paymentSheetFlowController.confirm(from: self) { paymentResult in
  // MARK: Handle the payment result
  switch paymentResult {
  case .completed:
    print("Payment complete!")
  case .canceled:
    print("Canceled!")
  case .failed(let error):
    print(error)
  }
}
```

#### SwiftUI

Les étapes suivantes vous expliquent comment mener à bien le paiement dans l’interface utilisateur de votre application. Consultez notre exemple d’intégration sur [GitHub](https://github.com/stripe/stripe-ios/blob/master/Example/PaymentSheet%20Example/PaymentSheet%20Example/ExampleSwiftUICustomPaymentFlow.swift).

1. Tout d’abord, initialisez [PaymentSheet.FlowController](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller) au lieu de `PaymentSheet`. Sa propriété `paymentOption` contient une image et une étiquette représentant le moyen de paiement actuellement sélectionné par le client, que vous pouvez utiliser dans votre interface utilisateur.

```swift
PaymentSheet.FlowController.create(paymentIntentClientSecret: paymentIntentClientSecret, configuration: configuration) { [weak self] result in
  switch result {
  case .failure(let error):
    print(error)
  case .success(let paymentSheetFlowController):
    self?.paymentSheetFlowController = paymentSheetFlowController
    // Use the paymentSheetFlowController.paymentOption properties in your UI
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  }
}
```

1. Utilisez [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) pour wrapper le bouton qui présente la fiche de collecte des données de paiement. Lorsque `PaymentSheet.FlowController` appelle l’argument `onSheetDismissed`, la propriété `paymentOption` de l’instance de `PaymentSheet.FlowController` reflète le moyen de paiement actuellement sélectionné.

```swift
PaymentSheet.FlowController.PaymentOptionsButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onSheetDismissed: {
    myPaymentMethodLabel = paymentSheetFlowController.paymentOption?.label ?? "Select a payment method"
    myPaymentMethodImage = paymentSheetFlowController.paymentOption?.image ?? UIImage(systemName: "square.and.pencil")!
  },
  content: {
    /* An example button */
    HStack {
      Text(myPaymentMethodLabel)
      Image(uiImage: myPaymentMethodImage)
    }
  }
)
```

1. Utilisez [PaymentSheet.FlowController.PaymentOptionsButton](https://stripe.dev/stripe-ios/stripepaymentsheet/documentation/stripepaymentsheet/paymentsheet/flowcontroller/paymentoptionsbutton) pour wrapper le bouton servant à confirmer le paiement.

```swift
PaymentSheet.FlowController.ConfirmButton(
  paymentSheetFlowController: paymentSheetFlowController,
  onCompletion: { result in
    // MARK: Handle the payment result
    switch result {
    case .completed:
      print("Payment complete!")
    case .canceled:
      print("Canceled!")
    case .failed(let error):
      print(error)
    }
  },
  content: {
    /* An example button */
    Text("Pay")
  }
)
```

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.

## Optional: Activer la collecte du CVC après confirmation

Les instructions suivantes pour récupérer le CVC d’une carte enregistrée pendant la confirmation du PaymentIntent supposent que votre intégration comprend les éléments suivants&nbsp;:

- Création de PaymentIntents avant de collecter les informations de paiement

### Mettre à jour les paramètres de création de l’Intent

Pour récupérer le CVC lors de la confirmation du paiement, ajoutez `require_cvc_recollection` lors de la création du PaymentIntent.

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {
      stripeAccount: '{{CONNECTED_ACCOUNT_ID}}',
      apiVersion: '2026-04-22.dahlia'
    }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,payment_method_options: {
      card: {
        require_cvc_recollection: true,
      },
    },

    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```


# Intégration des applications pour Android

![](https://b.stripecdn.com/docs-statics-srv/assets/android-overview.471eaf89a760f5b6a757fd96b6bb9b60.png)

Intégrez l’interface utilisateur de paiement préconfigurée de Stripe au processus de paiement de votre application Android grâce à la classe [PaymentSheet](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/index.html).

> #### Prise en charge de l’API Accounts&nbsp;v2
> 
> La feuille des moyens de paiement ne prend pas en charge les *comptes configurés par le client* (Account configurations represent role-based functionality that you can enable for accounts, such as merchant, customer, or recipient). Elle prend uniquement en charge les objets `Customer`.

## Configurer Stripe [Côté serveur] [Côté client]

### Côté serveur

Cette intégration exige des endpoints sur votre serveur qui communiquent avec l’API Stripe. Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre serveur&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

### Côté client

Le [SDK Stripe Android](https://github.com/stripe/stripe-android) est disponible en open source et [fait l’objet d’une documentation complète](https://stripe.dev/stripe-android/).

Pour installer le SDK, ajoutez `stripe-android` au bloc `dependencies` de votre fichier [app/build.gradle](https://developer.android.com/studio/build/dependencies)&nbsp;:

#### Kotlin

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // Stripe Android SDK
  implementation("com.stripe:stripe-android:23.9.1")
  // Include the financial connections SDK to support US bank account as a payment method
  implementation("com.stripe:financial-connections:23.9.1")
}
```

> Pour obtenir de plus amples informations sur la version la plus récente du SDK et ses versions antérieures, consultez la page des [versions](https://github.com/stripe/stripe-android/releases) sur GitHub. Pour savoir quand une nouvelle version est disponible, [surveillez les versions du référentiel](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Activer les moyens de paiement

Affichez vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) et activez les moyens de paiement que vous souhaitez prendre en charge. Vous devez activer au moins un moyen de paiement pour créer un *PaymentIntent* (The Payment Intents API tracks the lifecycle of a customer checkout flow and triggers additional authentication steps when required by regulatory mandates, custom Radar fraud rules, or redirect-based payment methods).

Par défaut, Stripe active les cartes bancaires et les autres moyens de paiement courants qui peuvent vous permettre d’atteindre davantage de clients. Nous vous recommandons toutefois d’activer d’autres moyens de paiement pertinents pour votre entreprise et vos clients. Consultez la page [Prise en charge des moyens de paiement](https://docs.stripe.com/payments/payment-methods/payment-method-support.md) pour en savoir plus sur la prise en charge des produits et des moyens de paiement, et notre [page des tarifs](https://stripe.com/pricing/local-payment-methods) pour prendre connaissance des frais que nous appliquons.

## Ajouter un endpoint [Côté serveur]

> #### Remarque
> 
> Pour afficher PaymentSheet avant de créer un PaymentIntent, consultez notre article [Collecter les détails du paiement avant de créer un Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

Cette intégration utilise trois&nbsp;objets de l’API Stripe&nbsp;:

1. [PaymentIntent](https://docs.stripe.com/api/payment_intents.md)&nbsp;: pour représenter votre intention d’encaisser le paiement d’un client, Stripe utilise un objet PaymentIntent qui suit vos tentatives de débit et les changements d’état du paiement tout au long du processus.

1. (Optional) Un objet [Account côté client](https://docs.stripe.com/api/v2/core/accounts/object.md#v2_account_object-applied_configurations) ou [Customer](https://docs.stripe.com/api/customers.md)&nbsp;: pour configurer un moyen de paiement en vue de paiements futurs, vous devez l’associer à un client. Créez un objet pour représenter votre client lorsqu’il ouvre un compte chez vous. Si votre client effectue un paiement en tant qu’invité, vous pouvez créer un objet `Account` ou `Customer` avant le paiement, puis l’associer ultérieurement à votre représentation interne du compte client.

1. (Optional) [CustomerSession](https://docs.stripe.com/api/customer_sessions.md)&nbsp;: l’objet qui représente votre client contient des informations sensibles qu’il n’est pas possible de récupérer directement depuis une application. Une `CustomerSession` accorde au SDK un accès temporaire à l’objet `Account` ou `Customer` et fournit des options de configuration supplémentaires. Consultez la liste complète des [options de configuration](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components).

> Si vous n’enregistrez jamais les cartes bancaires des clients et que vous n’autorisez pas vos clients récurrents à réutiliser les cartes enregistrées, vous pouvez exclure les objets `Account` ou `Customer`, ainsi que l’objet `CustomerSession` de votre intégration.

Pour des raisons de sécurité, votre application ne peut pas créer ces objets. À la place, ajoutez sur votre serveur un endpoint qui&nbsp;:

1. Récupère l’objet `Account` ou `Customer` ou en crée un nouveau.
1. Crée une [CustomerSession](https://docs.stripe.com/api/customer_sessions.md) pour l’objet `Account` ou `Customer` concerné.
1. Crée un `PaymentIntent` avec les valeurs [amount](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-amount), [la currency](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-currency), et soit [customer_account](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer_account), soit [customer](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer).
1. Renvoie la *clé secrète du client* (The client secret is a unique key returned from Stripe as part of a PaymentIntent. This key lets the client access important fields from the PaymentIntent (status, amount, currency) while hiding sensitive ones (metadata, customer)) du `PaymentIntent`, le `client_secret` de la `CustomerSession`, l’ID de l’objet `Account` ou `Customer` et votre [clé publique](https://dashboard.stripe.com/apikeys) pour votre application.

Les moyens de paiement présentés à votre client lors du processus de paiement sont également inclus dans le PaymentIntent. Vous pouvez laisser Stripe extraire (depuis les paramètres de votre Dashboard) les moyens de paiement à présenter, ou les répertorier manuellement. Quelle que soit l’option que vous choisissez, sachez que la devise transmise dans le PaymentIntent filtre les moyens de paiement présentés au client. Par exemple, si vous transmettez `eur` dans le PaymentIntent et que vous avez activé OXXO dans votre Dashboard, votre client ne verra pas ce moyen de paiement étant donné qu’OXXO ne prend pas en charge les paiements en `eur`.

À moins que votre intégration ne nécessite du code pour la présentation des moyens de paiement, Stripe vous recommande l’option automatisée. En effet, Stripe évalue la devise, les restrictions en matière de moyens de paiement ainsi que d’autres paramètres pour dresser la liste des moyens de paiement pris en charge. Ceux qui augmentent le taux de conversion et qui sont les plus pertinents pour la devise et le lieu de résidence du client sont priorisés.

#### Gérer les moyens de paiement dans le Dashboard

Vous pouvez gérer les moyens de paiement depuis le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe gère le renvoi des moyens de paiement admissibles en fonction de facteurs tels que le montant de la transaction, la devise et le tunnel de paiement. Le PaymentIntent est créé à l’aide des moyens de paiement configurés dans le Dashboard. Si vous ne souhaitez pas utiliser le Dashboard ou souhaitez spécifier des moyens de paiement manuellement, vous pouvez les répertorier à l’aide de l’attribut `payment_method_types`.

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,

    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

#### Répertorier manuellement les moyens de paiement

#### Node.js

```javascript

// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,
    payment_method_types: ['bancontact', 'card', 'ideal', 'klarna', 'sepa_debit'],
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

> Chacun des moyens de paiement doit prendre en charge la devise transmise dans le PaymentIntent, et votre activité doit par ailleurs être basée dans l’un des pays pris en charge par chaque moyen de paiement. Consultez la page [Options d’intégration des moyens de paiement](https://docs.stripe.com/payments/payment-methods/integration-options.md) pour plus d’informations sur la prise en charge.

## Collecter les données de paiement [Côté client]

Avant d’afficher le composant Element Payment pour mobile, vous devez, sur votre écran de paiement&nbsp;:

- Présenter les produits commandés et le montant total des achats
- Recueillez toutes les informations de livraison requises à l’aide du composant [Address Element](https://docs.stripe.com/elements/address-element.md?platform=android)
- Inclure un bouton de règlement pour afficher l’interface utilisateur de Stripe

#### Jetpack Compose

[Initialisez](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-builder/index.html) une instance `PaymentSheet` dans la méthode `onCreate` de votre classe CheckoutActivity, puis transmettez une méthode pour gérer le résultat.

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

@Composable
fun App() {
  val paymentSheet = remember { PaymentSheet.Builder(::onPaymentSheetResult).build() }
}

private fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {
  // implemented in the next steps
}
```

Ensuite, récupérez la clé secrète du client du PaymentIntent, la clé secrète de Session Customer, le Customer ID et la clé publiable depuis l’endpoint que vous avez créé à l’étape précédente. Configurez la clé publiable à l’aide du paramètre `PaymentConfiguration` et utilisez les autres au moment d’afficher la PaymentSheet.

```kotlin
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberimport androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

@Composable
fun App() {
  val paymentSheet = remember { PaymentSheet.Builder(::onPaymentSheetResult) }.build()val context = LocalContext.current
  var customerConfig by remember { mutableStateOf<PaymentSheet.CustomerConfiguration?>(null) }
  varpaymentIntentClientSecret by remember { mutableStateOf<String?>(null) }

  LaunchedEffect(context) {
    // Make a request to your own server and retrieve payment configurations
    val networkResult = ...
    if (networkResult.isSuccess) {paymentIntentClientSecret = networkResult.paymentIntent
        customerConfig = PaymentSheet.CustomerConfiguration.createWithCustomerSession(
          id = networkResult.customer,
          clientSecret = networkResult.customerSessionClientSecret
        )PaymentConfiguration.init(context, networkResult.publishableKey)}
  }
}

private fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {
  // implemented in the next steps
}
```

Lorsque le client appuie sur votre bouton de paiement, appelez [presentWithPaymentIntent](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/index.html#1814490530%2FFunctions%2F2002900378) pour afficher le formulaire de paiement. Une fois que le client a effectué le paiement, le formulaire se ferme et le [PaymentSheetResultCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result-callback/index.html) est appelé avec un [PaymentSheetResult](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result/index.html).

```kotlin
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.platform.LocalContext
import com.stripe.android.PaymentConfiguration
import com.stripe.android.paymentsheet.PaymentSheet
import com.stripe.android.paymentsheet.PaymentSheetResult

@Composable
fun App() {
  val paymentSheet = remember { PaymentSheet.Builder(::onPaymentSheetResult) }.build()
  val context = LocalContext.current
  var customerConfig by remember { mutableStateOf<PaymentSheet.CustomerConfiguration?>(null) }
  var paymentIntentClientSecret by remember { mutableStateOf<String?>(null) }

  LaunchedEffect(context) {
    // Make a request to your own server and retrieve payment configurations
    val networkResult = ...
    if (networkResult.isSuccess) {
        paymentIntentClientSecret = networkResult.paymentIntent
        customerConfig = PaymentSheet.CustomerConfiguration.createWithCustomerSession(
          id = networkResult.customer,
          clientSecret = networkResult.customerSessionClientSecret
        )
        PaymentConfiguration.init(context, networkResult.publishableKey)
    }
  }Button(
    onClick = {
      val currentConfig = customerConfig
      val currentClientSecret =paymentIntentClientSecret

      if (currentConfig != null && currentClientSecret != null) {
        presentPaymentSheet(paymentSheet, currentConfig, currentClientSecret)
      }
    }
  ) {
    Text("Checkout")
  }
}private fun presentPaymentSheet(
  paymentSheet: PaymentSheet,
  customerConfig: PaymentSheet.CustomerConfiguration,paymentIntentClientSecret: String
) {
  paymentSheet.presentWithPaymentIntent(paymentIntentClientSecret,
    PaymentSheet.Configuration.Builder(merchantDisplayName = "My merchant name")
      .customer(customerConfig)
      // Set `allowsDelayedPaymentMethods` to true if your business handles
      // delayed notification payment methods like US bank accounts.
      .allowsDelayedPaymentMethods(true)
      .build()
  )
}
private fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {when(paymentSheetResult) {
    is PaymentSheetResult.Canceled -> {
      print("Canceled")
    }
    is PaymentSheetResult.Failed -> {
      print("Error: ${paymentSheetResult.error}")
    }
    is PaymentSheetResult.Completed -> {
      // Display for example, an order confirmation screen
      print("Completed")
    }
  }
}
```

#### Vues (classique)

[Initialisez](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/index.html#-394860221%2FConstructors%2F2002900378) une instance `PaymentSheet` dans la méthode `onCreate` de votre classe CheckoutActivity, puis transmettez une méthode pour gérer le résultat.

#### Kotlin

```kotlin
import com.stripe.android.paymentsheet.PaymentSheet

class CheckoutActivity : AppCompatActivity() {
  lateinit var paymentSheet: PaymentSheet

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    paymentSheet = PaymentSheet.Builder(::onPaymentSheetResult).build(this)
  }

  fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {
    // implemented in the next steps
  }
}
```

Ensuite, récupérez la clé secrète du client du PaymentIntent, la clé secrète de Session Customer, le Customer ID et la clé publiable depuis l’endpoint que vous avez créé à l’étape précédente. Configurez la clé publiable à l’aide du paramètre `PaymentConfiguration` et utilisez les autres au moment d’afficher la PaymentSheet.

#### Kotlin

```kotlin
import com.stripe.android.paymentsheet.PaymentSheet

class CheckoutActivity : AppCompatActivity() {
  lateinit var paymentSheet: PaymentSheetlateinit var customerConfig: PaymentSheet.CustomerConfiguration
  lateinit varpaymentIntentClientSecret: String

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    paymentSheet = PaymentSheet.Builder(::onPaymentSheetResult).build(this)lifecycleScope.launch {
      // Make a request to your own server and retrieve payment configurations
      val networkResult = MyBackend.getPaymentConfig()
      if (networkResult.isSuccess) {paymentIntentClientSecret = networkResult.paymentIntent
        customerConfig = PaymentSheet.CustomerConfiguration.createWithCustomerSession(
          id = networkResult.customer,
          clientSecret = networkResult.customerSessionClientSecret
        )PaymentConfiguration.init(context, networkResult.publishableKey)}
    }
  }

  fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {
    // implemented in the next steps
  }
}
```

Lorsque le client appuie sur votre bouton de paiement, appelez [presentWithPaymentIntent](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/index.html#1814490530%2FFunctions%2F2002900378) pour afficher le formulaire de paiement. Une fois que le client a effectué le paiement, le formulaire se ferme et le [PaymentSheetResultCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result-callback/index.html) est appelé avec un [PaymentSheetResult](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result/index.html).

#### Kotlin

```kotlin
// ...
class CheckoutActivity : AppCompatActivity() {
  lateinit var paymentSheet: PaymentSheet
  lateinit var customerConfig: PaymentSheet.CustomerConfiguration
  lateinit var paymentIntentClientSecret: String
  // ...fun presentPaymentSheet() {
    paymentSheet.presentWithPaymentIntent(paymentIntentClientSecret,
      PaymentSheet.Configuration.Builder(merchantDisplayName = "My merchant name")
        .customer(customerConfig)
        // Set `allowsDelayedPaymentMethods` to true if your business handles
        // delayed notification payment methods like US bank accounts.
        .allowsDelayedPaymentMethods(true)
        .build()
    )
  }

  fun onPaymentSheetResult(paymentSheetResult: PaymentSheetResult) {when(paymentSheetResult) {
      is PaymentSheetResult.Canceled -> {
        print("Canceled")
      }
      is PaymentSheetResult.Failed -> {
        print("Error: ${paymentSheetResult.error}")
      }
      is PaymentSheetResult.Completed -> {
        // Display for example, an order confirmation screen
        print("Completed")
      }
    }
  }
}
```

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.

## Gérer les événements post-paiement [Côté serveur]

Stripe envoie un événement [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) à l’issue du paiement. Utilisez l’[outil de webhook du Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir ces événements et exécuter des actions, comme envoyer une confirmation de commande par e-mail à votre client, enregistrer la vente dans une base de données ou lancer un flux de livraison.

Plutôt que d’attendre un rappel de votre client, écoutez ces événements. Côté client, il arrive en effet que l’utilisateur ferme la fenêtre de son navigateur ou quitte l’application avant l’exécution du rappel. Certains clients malintentionnés peuvent d’autre part tenter de manipuler la réponse. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule et même intégration.

En plus de l’événement `payment_intent.succeeded`, nous vous recommandons de gérer ces autres événements lorsque vous encaissez des paiements à l’aide de l’Element Payment&nbsp;:

| Événement                                                                                                                       | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Envoyé lorsqu’un client effectue un paiement avec succès.                                                                                                                                                                                                                           | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande.           |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Envoyé lorsqu’un client initie un paiement, mais qu’il ne l’a pas encore finalisé. Dans la plupart des cas, cet événement est envoyé lorsque le client initie un prélèvement bancaire. Il est suivi par un événement `payment_intent.succeeded` ou `payment_intent.payment_failed`. | Envoyez au client une confirmation de commande qui indique que son paiement est en attente. Pour des marchandises dématérialisées, vous pourrez traiter la commande sans attendre que le paiement soit effectué. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Envoyé lorsqu’un client effectue une tentative de paiement qui se solde par un échec.                                                                                                                                                                                               | Si un paiement passe de l’état `processing` à `payment_failed`, proposez au client de retenter le paiement.                                                                                                      |

## Tester l'intégration

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Virements avec redirection bancaire

| Moyen de paiement | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bancontact, iDEAL | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche. |
| Pay by Bank       | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                      |
| Pay by Bank       | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                  |
| BLIK              | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                      |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Optional: Enable Link

Activez Link dans vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) pour permettre à vos clients d’enregistrer et de réutiliser en toute sécurité leurs informations de paiement à l’aide du bouton de paiement express en un clic de Link.

### Transmettre l’adresse e-mail de votre client au composant Mobile Payment Element

Link authentifie un client à l’aide de son adresse e-mail. Stripe recommande de préremplir autant d’informations que possible afin de simplifier le processus de paiement.

Pour préremplir le nom, l’adresse e-mail et le numéro de téléphone du client, fournissez la propriété `defaultBillingDetails` avec vos informations client lors de l’initialisation de `PaymentSheet.Configuration`.

#### Kotlin

```kotlin
val configuration = PaymentSheet.Configuration.Builder(merchantDisplayName = "Example, Inc.")
  .defaultBillingDetails(
    PaymentSheet.BillingDetails(
        name = "Jenny Rosen",
        email = "jenny.rosen@example.com",
        phone = "888-888-8888"
    )
  )
  .build()
```

## Optional: Activer Google&nbsp;Pay

### Configurer votre intégration

Pour utiliser Google Pay, commencez par activer l’API Google Pay en ajoutant les informations suivantes au libellé `<application>` de votre **AndroidManifest.xml**&nbsp;:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

Pour en savoir plus, consultez cette page indiquant comment [configurer l’API Google Pay](https://developers.google.com/pay/api/android/guides/setup) pour Android.

### Ajouter Google&nbsp;Pay

Pour ajouter Google&nbsp;Pay à votre intégration, transmettez un [PaymentSheet.GooglePayConfiguration](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-google-pay-configuration/index.html) avec votre environnement Google&nbsp;Pay (en mode production ou en mode test), ainsi que le [code pays de votre entreprise](https://dashboard.stripe.com/settings/account) lors de l’initialisation de [PaymentSheet.Configuration](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html).

#### Kotlin

```kotlin
val googlePayConfiguration = PaymentSheet.GooglePayConfiguration(
  environment = PaymentSheet.GooglePayConfiguration.Environment.Test,
  countryCode = "US",
  currencyCode = "USD" // Required for Setup Intents, optional for Payment Intents
)
val configuration = PaymentSheet.Configuration.Builder(merchantDisplayName = "My merchant name")
  .googlePay(googlePayConfiguration)
  .build()
```

### Tester Google&nbsp;Pay

Google vous permet d’effectuer des paiements de test via leur [suite de carte bancaire de test](https://developers.google.com/pay/api/android/guides/resources/test-card-suite). La suite de tests prend en charge l’utilisation de [cartes bancaires de test](https://docs.stripe.com/testing.md) de Stripe.

Vous devez tester Google Pay à l’aide d’un appareil Android physique plutôt que d’un appareil simulé, dans un pays où Google Pay est pris en charge. Connectez-vous à un compte Google sur votre appareil de test avec une carte réelle enregistrée dans Google Wallet.

## Optional: Activer la numérisation de carte

Pour activer la prise en charge de la numérisation des cartes bancaires, faites une [requête d’accès](https://developers.google.com/pay/api/android/guides/test-and-deploy/request-prod-access) à l’API Google Pay auprès de la [console Google Pay et Wallet](https://pay.google.com/business/console?utm_source=devsite&utm_medium=devsite&utm_campaign=devsite).

- Si vous avez activé Google Pay, la fonctionnalité de numérisation de carte bancaire est automatiquement disponible dans notre interface utilisateur sur les appareils admissibles. Pour en savoir plus sur les appareils admissibles, consultez les [contraintes de l’API Google Pay](https://developers.google.com/pay/payment-card-recognition/debit-credit-card-recognition)
- **Important :** la fonctionnalité de lecture de carte n’apparaît que dans les versions signées avec la même clé de signature enregistrée dans la [console Google Pay et Wallet](https://pay.google.com/business/console). Les versions de test ou de débogage utilisant différentes clés de signature (par exemple, les versions distribuées via Firebase App Tester) n’affichent pas l’option **Lire la carte**. Pour tester la lecture de carte dans les versions préliminaires, vous devez soit :
  - Signez vos versions de test avec votre clé de signature de production.
  - Ajoutez l’empreinte d’identification de votre clé de signature de test à la console Google Pay et Wallet

Si votre application ne prend pas en charge Google Pay, vous pouvez utiliser le scanner de cartes Stripe.

> Le scanner de carte Stripe est en version bêta publique.

Pour activer la prise en charge de la numérisation de carte, ajoutez `stripecardscan` au bloc `dependencies` de votre fichier [app/build.gradle](https://developer.android.com/studio/build/dependencies)&nbsp;:

#### Groovy

```groovy
implementation 'com.stripe:stripecardscan:23.9.1'
```

## Optional: Activer les paiements ACH

Intégrez Financial Connections en tant que dépendance pour votre application afin d’activer les paiements par prélèvements ACH.

Le [SDK Stripe Android](https://github.com/stripe/stripe-android) est disponible en open source et [fait l’objet d’une documentation complète](https://stripe.dev/stripe-android/).

Pour installer le SDK, ajoutez `financial-connections` au bloc `dependencies` de votre fichier [app/build.gradle](https://developer.android.com/studio/build/dependencies)&nbsp;:

#### Kotlin

```kotlin
plugins {
    id("com.android.application")
}

android { ... }

dependencies {
  // ...

  // Financial Connections Android SDK
  implementation("com.stripe:financial-connections:23.9.1")
}
```

> Pour obtenir de plus amples informations sur la version la plus récente du SDK et ses versions antérieures, consultez la page des [versions](https://github.com/stripe/stripe-android/releases) sur GitHub. Pour savoir quand une nouvelle version est disponible, [surveillez les versions du référentiel](https://docs.github.com/en/github/managing-subscriptions-and-notifications-on-github/configuring-notifications#configuring-your-watch-settings-for-an-individual-repository).

## Optional: Personnaliser la fiche

Pour personnaliser le formulaire de paiement, vous devez obligatoirement utiliser l’objet [PaymentSheet.Configuration](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html).

### Appearance

Personnalisez les couleurs, les polices et plus encore afin de vous adapter à l’apparence de votre application à l’aide de l’[Appearance API](https://docs.stripe.com/elements/appearance-api/mobile.md?platform=android).

### Mise en page des moyens de paiement

Configurez la mise en page des moyens de paiement dans la feuille à l’aide de [paymentMethodLayout](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/-builder/index.html#2123253356%2FFunctions%2F2002900378). Vous pouvez les afficher horizontalement, verticalement ou laisser Stripe optimiser la mise en page automatiquement.
![](https://b.stripecdn.com/docs-statics-srv/assets/android-mpe-payment-method-layouts.3bcfe828ceaad1a94e0572a22d91733f.png)

#### Kotlin

```kotlin
PaymentSheet.Configuration.Builder("Example, Inc.")
  .paymentMethodLayout(PaymentSheet.PaymentMethodLayout.Automatic)
  .build()
```

### Recueillir les adresses des utilisateurs

Recueillez les adresses de livraison ou de facturation de vos clients locaux et internationaux à l’aide du composant [Address&nbsp;Element](https://docs.stripe.com/elements/address-element.md?platform=android).

### Nom d’affichage de l’entreprise

Spécifiez un nom d’entreprise à afficher pour le client en définissant [merchantDisplayName](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-configuration/index.html#-191101533%2FProperties%2F2002900378). Par défaut, il s’agit du nom de votre application.

#### Kotlin

```kotlin
PaymentSheet.Configuration.Builder(
  merchantDisplayName = "My app, Inc."
).build()
```

### Mode sombre

Par défaut, `PaymentSheet` s’adapte automatiquement aux paramètres d’affichage du système de l’utilisateur (mode clair ou mode sombre). Vous pouvez modifier ce comportement en sélectionnant le mode clair ou le mode sombre sur votre application&nbsp;:

#### Kotlin

```kotlin
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

### Informations de facturation par défaut

Si vous souhaitez définir des valeurs par défaut pour les informations de facturation collectées dans le formulaire de paiement, configurez la propriété `defaultBillingDetails`. Le `PaymentSheet` préremplit les champs avec les valeurs que vous fournissez.

#### Kotlin

```kotlin
val address = PaymentSheet.Address(country = "US")
val billingDetails = PaymentSheet.BillingDetails(
  address = address,
  email = "foo@bar.com"
)
val configuration = PaymentSheet.Configuration.Builder(merchantDisplayName = "Merchant, Inc.")
  .defaultBillingDetails(billingDetails)
  .build()
```

### Configurer la collecte des données de facturation

Utiliser `BillingDetailsCollectionConfiguration` pour spécifier la manière dont vous souhaitez collecter les informations de facturation dans la PaymentSheet.

Vous pouvez collecter le nom, l’adresse e-mail, le numéro de téléphone et l’adresse de votre client.

Si vous souhaitez associer les informations de facturation par défaut à l’objet PaymentMethod même lorsque ces champs ne sont pas collectés dans l’interface utilisateur, définissez `billingDetailsCollectionConfiguration.attachDefaultsToPaymentMethod` sur `true`.

#### Kotlin

```kotlin
val billingDetails = PaymentSheet.BillingDetails(
  email = "foo@bar.com"
)
val billingDetailsCollectionConfiguration = BillingDetailsCollectionConfiguration(
  attachDefaultsToPaymentMethod = true,
  name = BillingDetailsCollectionConfiguration.CollectionMode.Always,
  email = BillingDetailsCollectionConfiguration.CollectionMode.Never,
  address = BillingDetailsCollectionConfiguration.AddressCollectionMode.Full,
)
val configuration = PaymentSheet.Configuration.Builder(merchantDisplayName = "Merchant, Inc.")
  .defaultBillingDetails(billingDetails)
  .billingDetailsCollectionConfiguration(billingDetailsCollectionConfiguration)
  .build()
```

> Consultez votre conseiller juridique au sujet des lois qui s’appliquent à la collecte d’informations. Ne collectez les numéros de téléphone que si vous en avez besoin pour la transaction.

## Optional: Gérer la déconnexion de l'utilisateur

`PaymentSheet` enregistre certaines informations localement pour se souvenir si un utilisateur a utilisé Link au sein d’une application. Pour effacer l’état interne de `PaymentSheet`, appelez la méthode `PaymentSheet.resetCustomer()` lorsque votre utilisateur se déconnecte.

#### Kotlin

```kotlin
class MyActivity: Activity {

  fun onLogoutButtonClicked() {
    PaymentSheet.resetCustomer(this)
    // Other logout logic required by your app
  }
}
```

## Optional: Mener à bien le paiement dans votre interface utilisateur

Vous pouvez présenter le formulaire de paiement pour collecter uniquement les informations du moyen de paiement et finaliser l’opération dans l’interface utilisateur de votre application. Cette méthode est utile si vous avez intégré un bouton d’achat personnalisé ou si vous avez besoin d’étapes supplémentaires après la collecte des informations de paiement.
![](https://b.stripecdn.com/docs-statics-srv/assets/android-multi-step.84d8a0a44b1baa596bda491322b6d9fd.png)

> Un exemple d’intégration est [disponible sur notre GitHub](https://github.com/stripe/stripe-android/blob/master/paymentsheet-example/src/main/java/com/stripe/android/paymentsheet/example/samples/ui/paymentsheet/custom_flow/CustomFlowActivity.kt).

1. Tout d’abord, initialisez [PaymentSheet.FlowController](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html) au lieu de `PaymentSheet` en utilisant l’une des méthodes [Builder](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/-builder/index.html).

#### Android (Kotlin)

```kotlin
class CheckoutActivity : AppCompatActivity() {
  private lateinit var flowController: PaymentSheet.FlowController

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    val flowController = PaymentSheet.FlowController.Builder(
      resultCallback = ::onPaymentSheetResult,
      paymentOptionResultCallback = ::onPaymentOption,
    ).build(this)
  }
}
```

1. Appelez ensuite `configureWithPaymentIntent` avec les clés d’objet Stripe récupérées depuis votre back-end et mettez à jour votre interface utilisateur dans le rappel en utilisant [getPaymentOption()](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-2091462043%2FFunctions%2F2002900378). Cette propriété contient une image et une étiquette représentant le moyen de paiement actuellement sélectionné par le client.

#### Android (Kotlin)

```kotlin
flowController.configureWithPaymentIntent(
  paymentIntentClientSecret = paymentIntentClientSecret,
  configuration = PaymentSheet.Configuration.Builder("Example, Inc.")
    .customer(PaymentSheet.CustomerConfiguration(
      id = customerId,
      ephemeralKeySecret = ephemeralKeySecret
    ))
    .build()
) { isReady, error ->
  if (isReady) {
    // Update your UI using `flowController.getPaymentOption()`
  } else {
    // handle FlowController configuration failure
  }
}
```

1. Appelez ensuite [presentPaymentOptions](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#449924733%2FFunctions%2F2002900378) pour collecter les informations de paiement. Lorsque le client a terminé, le formulaire se ferme et appelle le [paymentOptionCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-option-callback/index.html) transmis plus tôt dans `create`. Implémentez cette méthode pour mettre à jour votre interface utilisateur avec la propriété `paymentOption` renvoyée.

#### Android (Kotlin)

```kotlin
// ...
  flowController.presentPaymentOptions()
// ...
  private fun onPaymentOption(paymentOptionResult: PaymentOptionResult) {
    val paymentOption = paymentOptionResult.paymentOption
    if (paymentOption != null) {
      paymentMethodButton.text = paymentOption.label
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        paymentOption.drawableResourceId,
        0,
        0,
        0
      )
    } else {
      paymentMethodButton.text = "Select"
      paymentMethodButton.setCompoundDrawablesRelativeWithIntrinsicBounds(
        null,
        null,
        null,
        null
      )
    }
  }
```

1. Enfin, appelez [confirm](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet/-flow-controller/index.html#-479056656%2FFunctions%2F2002900378) pour mener à bien le paiement. Lorsque le client a terminé, le formulaire se ferme et appelle le [paymentResultCallback](https://stripe.dev/stripe-android/paymentsheet/com.stripe.android.paymentsheet/-payment-sheet-result-callback/index.html#237248767%2FFunctions%2F2002900378) transmis plus tôt dans `create`.

#### Android (Kotlin)

```kotlin
  // ...
    flowController.confirmPayment()
  // ...

  private fun onPaymentSheetResult(
    paymentSheetResult: PaymentSheetResult
  ) {
    when (paymentSheetResult) {
      is PaymentSheetResult.Canceled -> {
        // Payment canceled
      }
      is PaymentSheetResult.Failed -> {
        // Payment Failed. See logcat for details or inspect paymentSheetResult.error
      }
      is PaymentSheetResult.Completed -> {
        // Payment Complete
      }
    }
  }
```

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.

## Optional: Activer la collecte du CVC après confirmation

Les instructions suivantes pour récupérer le CVC d’une carte enregistrée pendant la confirmation du PaymentIntent supposent que votre intégration comprend les éléments suivants&nbsp;:

- Création de PaymentIntents avant de collecter les informations de paiement

### Mettre à jour les paramètres de création de l’Intent

Pour récupérer le CVC lors de la confirmation du paiement, ajoutez `require_cvc_recollection` lors de la création du PaymentIntent.

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const ephemeralKey = await stripe.ephemeralKeys.create(
    {customer: customer.id},
    {
      stripeAccount: '{{CONNECTED_ACCOUNT_ID}}',
      apiVersion: '2026-04-22.dahlia'
    }
  );
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,payment_method_options: {
      card: {
        require_cvc_recollection: true,
      },
    },

    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```


# Intégration des applications pour React Native

![](https://b.stripecdn.com/docs-statics-srv/assets/ios-overview.9e0d68d009dc005f73a6f5df69e00458.png)

Cette intégration combine toutes les étapes nécessaires au paiement (dont la collecte des informations de paiement et la confirmation du paiement) en une seule feuille qui s’affiche en haut de votre application.

> #### Prise en charge de l’API Accounts&nbsp;v2
> 
> La feuille des moyens de paiement ne prend pas en charge les *comptes configurés par le client* (Account configurations represent role-based functionality that you can enable for accounts, such as merchant, customer, or recipient). Elle prend uniquement en charge les objets `Customer`.

## Configurer Stripe [Côté serveur] [Côté client]

### Côté serveur

Cette intégration exige des endpoints sur votre serveur qui communiquent avec l’API Stripe. Utilisez nos bibliothèques officielles pour accéder à l’API Stripe depuis votre serveur&nbsp;:

#### Node.js

```bash
# Install with npm
npm install stripe --save
```

### Côté client

Le [SDK React Native](https://github.com/stripe/stripe-react-native) est disponible en open source et fait l’objet d’une documentation complète. En interne, il utilise des SDK [Android](https://github.com/stripe/stripe-android) et [iOS natifs](https://github.com/stripe/stripe-ios). Pour installer le SDK React Native de Stripe, exécutez l’une des commandes suivantes dans le répertoire de votre projet (selon le gestionnaire de paquets que vous utilisez)&nbsp;:

#### yarn

```bash
yarn add @stripe/stripe-react-native
```

#### npm

```bash
npm install @stripe/stripe-react-native
```

Ensuite, installez les autres dépendances nécessaires&nbsp;:

- Pour iOS, accédez au directeur **ios** et exécutez `pod install` pour vous assurer que vous installez également les dépendances natives requises.
- Pour Android, il n’y a plus de dépendances à installer.

> Nous vous recommandons de suivre le [guide officiel de TypeScript](https://reactnative.dev/docs/typescript#adding-typescript-to-an-existing-project) pour ajouter la prise en charge de TypeScript.

### Initialisation de Stripe

Pour initialiser Stripe dans votre application React&nbsp;Native, wrappez votre écran de paiement avec le composant `StripeProvider` ou utilisez la méthode d’initialisation `initStripe`. Seule la [clé publiable](https://docs.stripe.com/keys.md#obtain-api-keys) de l’API dans `publishableKey` est nécessaire. L’exemple suivant montre comment initialiser Stripe à l’aide du composant `StripeProvider`.

```jsx
import { useState, useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  const [publishableKey, setPublishableKey] = useState('');

  const fetchPublishableKey = async () => {
    const key = await fetchKey(); // fetch key from your server here
    setPublishableKey(key);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);

  return (
    <StripeProvider
      publishableKey={publishableKey}
      merchantIdentifier="merchant.identifier" // required for Apple Pay
      urlScheme="your-url-scheme" // required for 3D Secure and bank redirects
    >
      {/* Your app code here */}
    </StripeProvider>
  );
}
```

> Utilisez vos [clés de test](https://docs.stripe.com/keys.md#obtain-api-keys) d’API lors de vos activités de test et de développement, et vos clés du [mode production](https://docs.stripe.com/keys.md#test-live-modes) pour la publication de votre application.

## Activer les moyens de paiement

Affichez vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) et activez les moyens de paiement que vous souhaitez prendre en charge. Vous devez activer au moins un moyen de paiement pour créer un *PaymentIntent* (The Payment Intents API tracks the lifecycle of a customer checkout flow and triggers additional authentication steps when required by regulatory mandates, custom Radar fraud rules, or redirect-based payment methods).

Par défaut, Stripe active les cartes bancaires et les autres moyens de paiement courants qui peuvent vous permettre d’atteindre davantage de clients. Nous vous recommandons toutefois d’activer d’autres moyens de paiement pertinents pour votre entreprise et vos clients. Consultez la page [Prise en charge des moyens de paiement](https://docs.stripe.com/payments/payment-methods/payment-method-support.md) pour en savoir plus sur la prise en charge des produits et des moyens de paiement, et notre [page des tarifs](https://stripe.com/pricing/local-payment-methods) pour prendre connaissance des frais que nous appliquons.

## Ajouter un endpoint [Côté serveur]

> #### Remarque
> 
> Pour afficher PaymentSheet avant de créer un PaymentIntent, consultez notre article [Collecter les détails du paiement avant de créer un Intent](https://docs.stripe.com/payments/accept-a-payment-deferred.md?type=payment).

Cette intégration utilise trois&nbsp;objets de l’API Stripe&nbsp;:

1. [PaymentIntent](https://docs.stripe.com/api/payment_intents.md)&nbsp;: pour représenter votre intention d’encaisser le paiement d’un client, Stripe utilise un objet PaymentIntent qui suit vos tentatives de débit et les changements d’état du paiement tout au long du processus.

1. (Optional) Un objet [Account côté client](https://docs.stripe.com/api/v2/core/accounts/object.md#v2_account_object-applied_configurations) ou [Customer](https://docs.stripe.com/api/customers.md)&nbsp;: pour configurer un moyen de paiement en vue de paiements futurs, vous devez l’associer à un client. Créez un objet pour représenter votre client lorsqu’il ouvre un compte chez vous. Si votre client effectue un paiement en tant qu’invité, vous pouvez créer un objet `Account` ou `Customer` avant le paiement, puis l’associer ultérieurement à votre représentation interne du compte client.

1. (Optional) [CustomerSession](https://docs.stripe.com/api/customer_sessions.md)&nbsp;: l’objet qui représente votre client contient des informations sensibles qu’il n’est pas possible de récupérer directement depuis une application. Une `CustomerSession` accorde au SDK un accès temporaire à l’objet `Account` ou `Customer` et fournit des options de configuration supplémentaires. Consultez la liste complète des [options de configuration](https://docs.stripe.com/api/customer_sessions/create.md#create_customer_session-components).

> Si vous n’enregistrez jamais les cartes bancaires des clients et que vous n’autorisez pas vos clients récurrents à réutiliser les cartes enregistrées, vous pouvez exclure les objets `Account` ou `Customer`, ainsi que l’objet `CustomerSession` de votre intégration.

Pour des raisons de sécurité, votre application ne peut pas créer ces objets. À la place, ajoutez sur votre serveur un endpoint qui&nbsp;:

1. Récupère l’objet `Account` ou `Customer` ou en crée un nouveau.
1. Crée une [CustomerSession](https://docs.stripe.com/api/customer_sessions.md) pour l’objet `Account` ou `Customer` concerné.
1. Crée un `PaymentIntent` avec les valeurs [amount](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-amount), [la currency](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-currency), et soit [customer_account](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer_account), soit [customer](https://docs.stripe.com/api/payment_intents/create.md#create_payment_intent-customer).
1. Renvoie la *clé secrète du client* (The client secret is a unique key returned from Stripe as part of a PaymentIntent. This key lets the client access important fields from the PaymentIntent (status, amount, currency) while hiding sensitive ones (metadata, customer)) du `PaymentIntent`, le `client_secret` de la `CustomerSession`, l’ID de l’objet `Account` ou `Customer` et votre [clé publique](https://dashboard.stripe.com/apikeys) pour votre application.

Les moyens de paiement présentés à votre client lors du processus de paiement sont également inclus dans le PaymentIntent. Vous pouvez laisser Stripe extraire (depuis les paramètres de votre Dashboard) les moyens de paiement à présenter, ou les répertorier manuellement. Quelle que soit l’option que vous choisissez, sachez que la devise transmise dans le PaymentIntent filtre les moyens de paiement présentés au client. Par exemple, si vous transmettez `eur` dans le PaymentIntent et que vous avez activé OXXO dans votre Dashboard, votre client ne verra pas ce moyen de paiement étant donné qu’OXXO ne prend pas en charge les paiements en `eur`.

À moins que votre intégration ne nécessite du code pour la présentation des moyens de paiement, Stripe vous recommande l’option automatisée. En effet, Stripe évalue la devise, les restrictions en matière de moyens de paiement ainsi que d’autres paramètres pour dresser la liste des moyens de paiement pris en charge. Ceux qui augmentent le taux de conversion et qui sont les plus pertinents pour la devise et le lieu de résidence du client sont priorisés.

#### Gérer les moyens de paiement dans le Dashboard

Vous pouvez gérer les moyens de paiement depuis le [Dashboard](https://dashboard.stripe.com/settings/payment_methods). Stripe gère le renvoi des moyens de paiement admissibles en fonction de facteurs tels que le montant de la transaction, la devise et le tunnel de paiement. Le PaymentIntent est créé à l’aide des moyens de paiement configurés dans le Dashboard. Si vous ne souhaitez pas utiliser le Dashboard ou souhaitez spécifier des moyens de paiement manuellement, vous pouvez les répertorier à l’aide de l’attribut `payment_method_types`.

#### Node.js

```javascript

// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
const stripe = require('stripe')('<<YOUR_SECRET_KEY>>');
// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,

    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

#### Répertorier manuellement les moyens de paiement

#### Node.js

```javascript

// This example sets up an endpoint using the Express framework.

app.post('/payment-sheet', async (req, res) => {
  // Use an existing Customer ID if this is a returning customer.
  const customer = await stripe.customers.create(stripeAccount:'{{CONNECTED_ACCOUNT_ID}}');
  const customerSession = await stripe.customerSessions.create({
    customer: customer.id,
    components: {
      mobile_payment_element: {
        enabled: true,
        features: {
          payment_method_save: 'enabled',
          payment_method_redisplay: 'enabled',
          payment_method_remove: 'enabled'
        }
      },
    },
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1099,
    currency: 'eur',
    customer: customer.id,
    payment_method_types: ['bancontact', 'card', 'ideal', 'klarna', 'sepa_debit'],
  });

  res.json({
    paymentIntent: paymentIntent.client_secret,
    customerSessionClientSecret: customerSession.client_secret,
    customer: customer.id,
    publishableKey: '<<YOUR_PUBLISHABLE_KEY>>'
  });
});
```

> Chacun des moyens de paiement doit prendre en charge la devise transmise dans le PaymentIntent, et votre activité doit par ailleurs être basée dans l’un des pays pris en charge par chaque moyen de paiement. Consultez la page [Options d’intégration des moyens de paiement](https://docs.stripe.com/payments/payment-methods/integration-options.md) pour plus d’informations sur la prise en charge.

## Collecter les données de paiement [Côté client]

Avant d’afficher le composant Element Payment pour mobile, vous devez, sur votre écran de paiement&nbsp;:

- Présenter les produits commandés et le montant total des achats
- Collecter les éventuelles informations de livraison requises
- Inclure un bouton de règlement pour afficher l’interface utilisateur de Stripe

Au cours du processus de paiement de votre application, effectuez une demande réseau auprès du endpoint du back-end que vous avez créé à l’étape précédente, puis appelez `initPaymentSheet` depuis le hook `useStripe`.

#### Accounts&nbsp;v2

```javascript
export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { paymentIntent, ephemeralKey, customer_account } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer_account,
    };
  };

  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer_account,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerAccountId: customer_account,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business accepts payment
      // methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Jane Doe',
      }
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    // see below
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

#### Customers&nbsp;v1

```javascript

export default function CheckoutScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    const response = await fetch(`${API_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { paymentIntent, ephemeralKey, customer } = await response.json();

    return {
      paymentIntent,
      ephemeralKey,
      customer,
    };
  };

  const initializePaymentSheet = async () => {
    const {
      paymentIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      // Set `allowsDelayedPaymentMethods` to true if your business can handle payment
      //methods that complete payment after a delay, like SEPA Debit and Sofort.
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Jane Doe',
      }
    });
    if (!error) {
      setLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    // see below
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

Lorsque votre client touche le bouton **Paiement**, appelez `presentPaymentSheet()` pour ouvrir le formulaire de paiement. Une fois la transaction finalisée, le formulaire se ferme et la promesse aboutit avec le résultat facultatif `StripeError<PaymentSheetError>`.

```javascript
export default function CheckoutScreen() {
  // continued from above

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
    }
  };

  return (
    <Screen>
      <Button
        variant="primary"
        disabled={!loading}
        title="Checkout"
        onPress={openPaymentSheet}
      />
    </Screen>
  );
}
```

En l’absence d’erreurs, informez le client que l’opération est terminée (par exemple, en affichant un écran de confirmation de commande).

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.

## Configurer une URL de redirection (iOS uniquement) [Côté client]

Lorsqu’un client quitte votre application (par exemple, pour s’authentifier dans Safari ou dans son application bancaire), donnez-lui un moyen de revenir automatiquement dans votre application. De nombreux types de moyens de paiement *nécessitent* une URL de redirection. Si vous n’en fournissez pas, nous ne pourrons pas présenter à vos utilisateurs les moyens de paiement nécessitant une URL de redirection, même si vous les avez activés.

Pour fournir une URL de redirection&nbsp;:

1. [Enregistrez](https://developer.apple.com/documentation/xcode/defining-a-custom-url-scheme-for-your-app#Register-your-URL-scheme) une URL personnalisée. Les liens universels ne sont pas pris en charge.
1. [Configurez](https://reactnative.dev/docs/linking) votre URL personnalisée.
1. Configurez votre composant racine pour qu’il transfère l’URL au SDK de Stripe, comme illustré ci-dessous.

> Si vous utilisez Expo, [définissez votre schéma](https://docs.expo.io/guides/linking/#in-a-standalone-app) dans le fichier `app.json`.

```jsx
import { useEffect, useCallback } from 'react';
import { Linking, View } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';

export default function MyApp() {
  const { handleURLCallback } = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
        }
      }
    },
    [handleURLCallback]
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: { url: string }) => {
        handleDeepLink(event.url);
      }
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <View>
      <AwesomeAppComponent />
    </View>
  );
}
```

Définissez aussi la `returnURL` lorsque vous appelez la méthode `initPaymentSheet`&nbsp;:

```js
await initPaymentSheet({
  ...
  returnURL: 'your-app://stripe-redirect',
  ...
});
```

Pour plus d’informations sur les schémas d’URL natifs, consultez la documentation [Android](https://developer.android.com/training/app-links/deep-linking) et [iOS](https://developer.apple.com/documentation/xcode/allowing_apps_and_websites_to_link_to_your_content/defining_a_custom_url_scheme_for_your_app).

## Gérer les événements post-paiement

Stripe envoie un événement [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md#event_types-payment_intent.succeeded) à l’issue du paiement. Utilisez l’[outil de webhook du Dashboard](https://dashboard.stripe.com/webhooks) ou suivez le [guide consacré aux webhooks](https://docs.stripe.com/webhooks/quickstart.md) pour recevoir ces événements et exécuter des actions, comme envoyer une confirmation de commande par e-mail à votre client, enregistrer la vente dans une base de données ou lancer un flux de livraison.

Plutôt que d’attendre un rappel de votre client, écoutez ces événements. Côté client, il arrive en effet que l’utilisateur ferme la fenêtre de son navigateur ou quitte l’application avant l’exécution du rappel. Certains clients malintentionnés peuvent d’autre part tenter de manipuler la réponse. En configurant votre intégration de manière à ce qu’elle écoute les événements asynchrones, vous pourrez accepter [plusieurs types de moyens de paiement](https://stripe.com/payments/payment-methods-guide) avec une seule et même intégration.

En plus de l’événement `payment_intent.succeeded`, nous vous recommandons de gérer ces autres événements lorsque vous encaissez des paiements à l’aide de l’Element Payment&nbsp;:

| Événement                                                                                                                       | Description                                                                                                                                                                                                                                                                         | Action                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [payment_intent.succeeded](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.succeeded)           | Envoyé lorsqu’un client effectue un paiement avec succès.                                                                                                                                                                                                                           | Envoyez au client une confirmation de commande et *traitez* (Fulfillment is the process of providing the goods or services purchased by a customer, typically after payment is collected) sa commande.           |
| [payment_intent.processing](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.processing)         | Envoyé lorsqu’un client initie un paiement, mais qu’il ne l’a pas encore finalisé. Dans la plupart des cas, cet événement est envoyé lorsque le client initie un prélèvement bancaire. Il est suivi par un événement `payment_intent.succeeded` ou `payment_intent.payment_failed`. | Envoyez au client une confirmation de commande qui indique que son paiement est en attente. Pour des marchandises dématérialisées, vous pourrez traiter la commande sans attendre que le paiement soit effectué. |
| [payment_intent.payment_failed](https://docs.stripe.com/api/events/types.md?lang=php#event_types-payment_intent.payment_failed) | Envoyé lorsqu’un client effectue une tentative de paiement qui se solde par un échec.                                                                                                                                                                                               | Si un paiement passe de l’état `processing` à `payment_failed`, proposez au client de retenter le paiement.                                                                                                      |

## Tester l'intégration

#### Cartes bancaires

| Numéro de carte     | Scénario                                                                                                                                                                                                                                                                                                          | Méthode de test                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4242424242424242    | Le paiement par carte bancaire aboutit et ne nécessite pas d’authentification.                                                                                                                                                                                                                                    | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000002500003155    | Le paiement par carte bancaire requiert une *authentification* (Strong Customer Authentication (SCA) is a regulatory requirement in effect as of September 14, 2019, that impacts many European online payments. It requires customers to use two-factor authentication like 3D Secure to verify their purchase). | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 4000000000009995    | La carte est refusée avec un code de refus de type `insufficient_funds`.                                                                                                                                                                                                                                          | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |
| 6205500000000000004 | La carte UnionPay a un numéro d’une longueur variable, allant de 13 à 19&nbsp;chiffres.                                                                                                                                                                                                                           | Remplissez le formulaire de paiement par carte bancaire en saisissant le numéro de carte ainsi que la date d’expiration, le CVC et le code postal de votre choix. |

#### Virements avec redirection bancaire

| Moyen de paiement | Scénario                                                                                                                                                                                                               | Méthode de test                                                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bancontact, iDEAL | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification immédiate.                                                               | Choisissez un moyen de paiement avec redirection, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche. |
| Pay by Bank       | Le montant dû est réglé via un moyen de paiement avec redirection et à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification).                                              | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Finaliser le paiement test** sur la page qui s’affiche.                      |
| Pay by Bank       | Votre client ne parvient pas à s’authentifier sur la page de redirection en utilisant un moyen de paiement avec redirection et à notification différée.                                                                | Choisissez le moyen de paiement, renseignez les informations demandées, puis confirmez le paiement. Enfin, cliquez sur **Faire échouer le paiement test** sur la page qui s’affiche.                  |
| BLIK              | Les paiements BLIK échouent de diverses manières&nbsp;: échecs immédiats (par exemple, code expiré ou non valide), erreurs différées (refus de la banque) ou expirations du délai (le client n’a pas répondu à temps). | Utiliser des modèles d’e-mail pour [simuler les différents échecs.](https://docs.stripe.com/payments/blik/accept-a-payment.md#simulate-failures)                                                      |

#### Prélèvements bancaires

| Moyen de paiement            | Scénario                                                                                                 | Méthode de test                                                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Prélèvement automatique SEPA | Le montant dû est réglé par prélèvement automatique SEPA.                                                | Remplissez le formulaire à l’aide du numéro de compte `AT321904300235473204`. Le PaymentIntent confirmé passe d’abord à l’état processing, puis à l’état succeeded trois&nbsp;minutes plus tard. |
| Prélèvement automatique SEPA | L’intention de paiement de votre client passe de l’état `processing` à l’état `requires_payment_method`. | Remplissez le formulaire à l’aide du numéro de compte `AT861904300235473202`.                                                                                                                    |

Consultez la section consacrée aux [tests](https://docs.stripe.com/testing.md) pour obtenir des informations supplémentaires sur la manière de tester votre intégration.

## Activer la numérisation de carte [Côté client]

> L’activation de la numérisation de cartes est nécessaire pour le processus de vérification de l’application iOS d’Apple. La numérisation de cartes n’est pas obligatoire pour le processus de vérification de l’application d’Android, mais nous recommandons de l’activer.

### iOS

Pour activer la numérisation des cartes pour iOS, définissez le paramètre `NSCameraUsageDescription` (**Confidentialité – Description de l’utilisation de l’appareil photo**) dans le fichier `Info.plist` de votre application et indiquez le motif d’accès à l’appareil photo («&nbsp;pour numériser des cartes&nbsp;», par exemple).

### (Optional) Android

Pour activer la prise en charge de la numérisation des cartes bancaires, faites une [requête d’accès](https://developers.google.com/pay/api/android/guides/test-and-deploy/request-prod-access) à l’API Google Pay auprès de la [console Google Pay et Wallet](https://pay.google.com/business/console?utm_source=devsite&utm_medium=devsite&utm_campaign=devsite).

- Si vous avez activé Google Pay, la fonctionnalité de numérisation de carte bancaire est automatiquement disponible dans notre interface utilisateur sur les appareils admissibles. Pour en savoir plus sur les appareils admissibles, consultez les [contraintes de l’API Google Pay](https://developers.google.com/pay/payment-card-recognition/debit-credit-card-recognition)
- **Important :** la fonctionnalité de lecture de carte n’apparaît que dans les versions signées avec la même clé de signature enregistrée dans la [console Google Pay et Wallet](https://pay.google.com/business/console). Les versions de test ou de débogage utilisant différentes clés de signature (par exemple, les versions distribuées via Firebase App Tester) n’affichent pas l’option **Lire la carte**. Pour tester la lecture de carte dans les versions préliminaires, vous devez soit :
  - Signez vos versions de test avec votre clé de signature de production.
  - Ajoutez l’empreinte d’identification de votre clé de signature de test à la console Google Pay et Wallet

Si votre application ne prend pas en charge Google Pay, vous pouvez utiliser le scanner de cartes Stripe.

> Le scanner de carte Stripe est en version bêta publique.

Pour activer la prise en charge de la numérisation de carte, ajoutez `stripecardscan` au bloc `dependencies` de votre fichier [app/build.gradle](https://developer.android.com/studio/build/dependencies)&nbsp;:

#### Groovy

```groovy
implementation 'com.stripe:stripecardscan:23.9.1'
```

## Optional: Enable Link

Activez Link dans vos [paramètres des moyens de paiement](https://dashboard.stripe.com/settings/payment_methods) pour permettre à vos clients d’enregistrer et de réutiliser en toute sécurité leurs informations de paiement à l’aide du bouton de paiement express en un clic de Link.

### Transmettre l’adresse e-mail de votre client au composant Mobile Payment Element

Link authentifie un client à l’aide de son adresse e-mail. Stripe recommande de préremplir autant d’informations que possible afin de simplifier le processus de paiement.

Pour préremplir automatiquement le nom, l’adresse e-mail et le numéro de téléphone du client, fournissez la propriété `defaultBillingDetails` comprenant les informations du client à `initPaymentSheet`.

```javascript
await initPaymentSheet({
  ...
  defaultBillingDetails: {
    name: 'Jenny Rosen',
    email: 'jenny.rosen@example.com',
    phone: '888-888-8888',
  },
});
```

## Optional: Activer Apple&nbsp;Pay

### Demander un ID de marchand Apple

Pour obtenir un ID de marchand Apple, [demandez un nouvel identifiant](https://developer.apple.com/account/resources/identifiers/add/merchant) sur le site Web Apple Developer.

Renseignez le formulaire en indiquant une description et un identifiant. La description n’est destinée qu’à votre propre information et vous pourrez la modifier ultérieurement au besoin. En ce qui concerne l’identifiant, Stripe vous recommande d’utiliser le nom de votre application (par exemple, `merchant.com.{{YOUR_APP_NAME}}`).

### Créer un nouveau certificat Apple&nbsp;Pay

Créez un certificat permettant à votre application de chiffrer les données de paiement.

Accédez aux [paramètres des certificats iOS](https://dashboard.stripe.com/settings/ios_certificates) dans le Dashboard, cliquez sur **Ajouter une nouvelle application** et suivez le guide.

Téléchargez un fichier CSR (Certificate Signing Request) pour obtenir d’Apple un certificat sécurisé vous autorisant à utiliser Apple&nbsp;Pay.

Un fichier CSR peut émettre exactement un certificat. Si vous changez d’ID de marchand Apple, vous devez accéder aux [paramètres des certificats iOS](https://dashboard.stripe.com/settings/ios_certificates) dans le Dashboard pour obtenir un nouveau fichier CSR et un nouveau certificat.

### Réaliser une intégration avec Xcode

Ajoutez la fonctionnalité Apple&nbsp;Pay à votre application. Dans Xcode, ouvrez vos paramètres de projet, cliquez sur l’onglet **Signature et fonctionnalités**, puis ajoutez **Apple&nbsp;Pay**. Vous serez peut-être alors invité(e) à vous connecter à votre compte développeur. Sélectionnez l’ID du marchand créé plus tôt. Il est désormais possible d’utiliser Apple&nbsp;Pay sur votre application.
![](https://b.stripecdn.com/docs-statics-srv/assets/xcode.a701d4c1922d19985e9c614a6f105bf1.png)

Activez la fonctionnalité Apple&nbsp;Pay dans Xcode

### Ajouter Apple&nbsp;Pay

#### Paiement ponctuel

Transmettez votre ID de marchand lorsque vous créez `StripeProvider`&nbsp;:

```javascript
import { StripeProvider } from '@stripe/stripe-react-native';

function App() {
  return (
    <StripeProvider
      publishableKey="<<YOUR_PUBLISHABLE_KEY>>"
      merchantIdentifier="MERCHANT_ID"
    >
      {/* Your app code here */}
    </StripeProvider>
  );
}
```

Lorsque vous appelez `initPaymentSheet`, transmettez vos paramètres [ApplePayParams](https://stripe.dev/stripe-react-native/api-reference/modules/PaymentSheet.html#ApplePayParams)&nbsp;:

```javascript
await initPaymentSheet({
  // ...
  applePay: {
    merchantCountryCode: 'US',
  },
});
```

#### Paiements récurrents

Lorsque vous appelez `initPaymentSheet`, transmettez-le dans un [ApplePayParams](https://stripe.dev/stripe-react-native/api-reference/modules/PaymentSheet.html#ApplePayParams) avec `merchantCountryCode` défini au code de pays de votre entreprise.

Conformément aux [directives d’Apple](https://developer.apple.com/design/human-interface-guidelines/apple-pay#Supporting-subscriptions) relatives aux paiements récurrents, vous devez aussi définir un `cardItems` qui inclut un[RecurringCartSummaryItemT](https://stripe.dev/stripe-react-native/api-reference/modules/ApplePay.html#RecurringCartSummaryItem) avec le montant que vous comptez facturer (par exemple, «&nbsp;59,95&nbsp;USD par mois&nbsp;»).

Vous pouvez également adopter des [tokens de marchand](https://developer.apple.com/apple-pay/merchant-tokens/) en définissant `request` et son `type` sur `PaymentRequestType.Recurring`.

Pour en savoir plus sur l’utilisation des paiements récurrents avec Apple Pay, consultez la [documentation d’Apple sur PassKit](https://developer.apple.com/documentation/passkit/pkpaymentrequest).

#### iOS (React Native)

```javascript
const initializePaymentSheet = async () => {
  const recurringSummaryItem = {
    label: 'My Subscription',
    amount: '59.99',
    paymentType: 'Recurring',
    intervalCount: 1,
    intervalUnit: 'month',
    // Payment starts today
    startDate: new Date().getTime() / 1000,

    // Payment ends in one year
    endDate: new Date().getTime() / 1000 + 60 * 60 * 24 * 365,
  };

  const {error} = await initPaymentSheet({
    // ...
    applePay: {
      merchantCountryCode: 'US',
      cartItems: [recurringSummaryItem],
      request: {
        type: PaymentRequestType.Recurring,
        description: 'Recurring',
        managementUrl: 'https://my-backend.example.com/customer-portal',
        billing: recurringSummaryItem,
        billingAgreement:
          "You'll be billed $59.99 every month for the next 12 months. To cancel at any time, go to Account and click 'Cancel Membership.'",
      },
    },
  });
};
```

### Suivi des commandes

Pour ajouter des informations de [suivi de commande](https://developer.apple.com/design/human-interface-guidelines/technologies/wallet/designing-order-tracking) dans iOS 16 ou les versions ultérieures, configurez une fonction de rappel `setOrderTracking`. Stripe appelle votre déploiement une fois le paiement effectué, mais avant qu’iOS ne ferme le formulaire de paiement Apple Pay.

Dans votre déploiement de la fonction de rappel `setOrderTracking`, récupérez les détails de la commande validée sur votre serveur et transmettez-les à la fonction `completion` indiquée.

Pour en savoir plus sur le suivi des commandes, consultez la [documentation d’Apple sur les commandes Wallet](https://developer.apple.com/documentation/walletorders).

#### iOS (React Native)

```javascript
await initPaymentSheet({
  // ...
  applePay: {
    // ...
    setOrderTracking: async complete => {
      const apiEndpoint =
        Platform.OS === 'ios'
          ? 'http://localhost:4242'
          : 'http://10.0.2.2:4567';
      const response = await fetch(
        `${apiEndpoint}/retrieve-order?orderId=${orderId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.status === 200) {
        const orderDetails = await response.json();
        // orderDetails should include orderIdentifier, orderTypeIdentifier,
        // authenticationToken and webServiceUrl
        complete(orderDetails);
      }
    },
  },
});
```

## Optional: Activer Google&nbsp;Pay

### Configurer votre intégration

Pour utiliser Google Pay, commencez par activer l’API Google Pay en ajoutant les informations suivantes au libellé `<application>` de votre **AndroidManifest.xml**&nbsp;:

```xml
<application>
  ...
  <meta-data
    android:name="com.google.android.gms.wallet.api.enabled"
    android:value="true" />
</application>
```

Pour en savoir plus, consultez cette page indiquant comment [configurer l’API Google Pay](https://developers.google.com/pay/api/android/guides/setup) pour Android.

### Ajouter Google&nbsp;Pay

Lorsque vous initialisez `PaymentSheet`, définissez `merchantCountryCode` sur le code pays de votre entreprise et définissez `googlePay` sur true.

Vous pouvez également utiliser l’environnement de test en transmettant le paramètre `testEnv`. Vous ne pouvez tester Google Pay que sur un appareil Android physique. Suivez la [documentation React Native](https://reactnative.dev/docs/running-on-device) pour tester votre application sur un appareil physique.

```javascript
const { error, paymentOption } = await initPaymentSheet({
  // ...
  googlePay: {
    merchantCountryCode: 'US',
    testEnv: true, // use test environment
  },
});
```

## Optional: Personnaliser la fiche [Côté client]

Pour personnaliser le formulaire de paiement, vous devez obligatoirement utiliser l’objet `initPaymentSheet`.

### Appearance

Personnalisez les couleurs, les polices et plus encore afin de vous adapter à l’apparence de votre application à l’aide de l’[API&nbsp;Appearance](https://docs.stripe.com/elements/appearance-api/mobile.md?platform=react-native).

### Nom d’affichage du marchand

Renseignez le nom usuel de votre entreprise en configurant `merchantDisplayName`. Par défaut, il s’agit du nom de votre application.

```javascript
await initPaymentSheet({
  // ...
  merchantDisplayName: 'Example Inc.',
});
```

### Mode sombre

Par défaut, `PaymentSheet` s’adapte automatiquement aux paramètres d’affichage du système de l’utilisateur (mode clair ou mode sombre). Sur iOS, vous pouvez modifier ce comportement en définissant la propriété `style` sur le mode `alwaysLight` ou `alwaysDark`.

```javascript
await initPaymentSheet({
  // ...
  style: 'alwaysDark',
});
```

Sur Android, configurez le mode clair ou le mode sombre sur votre application&nbsp;:

```
// force dark
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
// force light
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
```

## Optional: Gérer la déconnexion de l'utilisateur

`PaymentSheet` enregistre certaines informations localement pour se souvenir si un utilisateur a utilisé Link au sein d’une application. Pour effacer l’état interne de `PaymentSheet`, appelez la méthode `resetPaymentSheetCustomer()` lorsque votre utilisateur se déconnecte.

```javascript
export default function CheckoutScreen() {
  // continued from above
  const { initPaymentSheet, presentPaymentSheet, resetPaymentSheetCustomer } = useStripe();

  const logout = async () => {
    await resetPaymentSheetCustomer();
  };

  return (
    <Screen>
      <Button
        title="Checkout"
        onPress={openPaymentSheet}
      />
      <Button
        title="Checkout"
        onPress={logout}
      />
    </Screen>
  );
}
```

## Optional: Mener à bien le paiement dans votre interface utilisateur

Vous pouvez présenter le formulaire de paiement pour la seule collecte des données du moyen de paiement, puis appeler une méthode `confirm` pour mener à bien l’opération de paiement dans l’interface utilisateur de votre application. Cette approche est utile si vous avez intégré un bouton d’achat personnalisé ou si des étapes supplémentaires sont nécessaires après la collecte des informations de paiement.
![](https://b.stripecdn.com/docs-statics-srv/assets/react-native-multi-step.84d8a0a44b1baa596bda491322b6d9fd.png)

> Un exemple d’intégration est [disponible sur notre GitHub](https://github.com/stripe/stripe-react-native/blob/master/example/src/screens/PaymentsUICustomScreen.tsx).

1. Tout d’abord, appelez `initPaymentSheet` et transmettez `customFlow: true`. `initPaymentSheet` se résout avec une option de paiement initiale contenant une image et une étiquette représentant le moyen de paiement du client. Mettez à jour votre interface utilisateur avec ces informations.

```javascript
const {
  initPaymentSheet,
  presentPaymentSheet,
  confirmPaymentSheetPayment,
} = useStripe()

const { error, paymentOption } = await initPaymentSheet({
  customerId: customer,
  customerEphemeralKeySecret: ephemeralKey,
  paymentIntentClientSecret: paymentIntent,
  customFlow: true,
  merchantDisplayName: 'Example Inc.',
});
// Update your UI with paymentOption
```

1. Utilisez `presentPaymentSheet` pour collecter les informations de paiement. Lorsque le client a terminé, le formulaire se ferme et la promesse aboutit. Ajoutez les informations du moyen de paiement sélectionné à votre Interface utilisateur.

```javascript
const { error, paymentOption } = await presentPaymentSheet();
```

1. Utilisez `confirmPaymentSheetPayment` pour confirmer le paiement. L’opération se résout avec le résultat du paiement.

```javascript
const { error } = await confirmPaymentSheetPayment();

if (error) {
  Alert.alert(`Error code: ${error.code}`, error.message);
} else {
  Alert.alert(
    'Success',
    'Your order is confirmed!'
  );
}
```

Si vous définissez `allowsDelayedPaymentMethods` sur true, les moyens de paiement à [notification différée](https://docs.stripe.com/payments/payment-methods.md#payment-notification), comme les comptes bancaires étasuniens, seront acceptés. Pour ces moyens de paiement, l’état final du paiement n’est pas connu une fois le processus du `PaymentSheet` achevé, et le paiement peut plus tard aboutir comme échouer. Si vous prenez en charge ces types de moyens de paiement, informez votre client que sa commande est confirmée et ne la traitez (en lui expédiant son produit, par exemple) qu’une fois le paiement reçu.
