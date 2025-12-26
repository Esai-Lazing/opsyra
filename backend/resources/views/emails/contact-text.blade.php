Nouveau message de contact - Opsyra
=====================================

Bonjour,

Vous avez reçu un nouveau message depuis le formulaire de contact du site Opsyra.

INFORMATIONS DU CONTACT
------------------------
Nom complet : {{ $name }}
Email : {{ $email }}
@if($company)
Entreprise : {{ $company }}
@endif

MESSAGE
-------
{{ $contactMessage }}

---
Pour répondre à ce message, répondez directement à cet email.
L'adresse de réponse est configurée sur : {{ $email }}

© {{ date('Y') }} Opsyra - Gestion de Flotte Moderne

