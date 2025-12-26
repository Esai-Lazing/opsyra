<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau message de contact</title>
    <!--[if mso]>
    <style type="text/css">
        body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Container -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #7C3AED 0%, #6366F1 50%, #22D3EE 100%); padding: 40px 40px 30px; border-radius: 8px 8px 0 0; text-align: center;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                            Nouveau message de contact
                                        </h1>
                                        <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                                            Opsyra - Gestion de Flotte
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 30px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Bonjour,
                            </p>
                            <p style="margin: 0 0 30px; color: #555555; font-size: 15px; line-height: 1.6;">
                                Vous avez reçu un nouveau message depuis le formulaire de contact du site Opsyra.
                            </p>

                            <!-- Info Card -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa; border-radius: 6px; margin-bottom: 30px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="120" style="color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                Nom complet
                                                            </td>
                                                            <td style="color: #1a1a1a; font-size: 15px; font-weight: 600;">
                                                                {{ $name }}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 15px 0; border-top: 1px solid #e0e0e0;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="120" style="color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                Email
                                                            </td>
                                                            <td>
                                                                <a href="mailto:{{ $email }}" style="color: #6366F1; text-decoration: none; font-size: 15px; font-weight: 500;">
                                                                    {{ $email }}
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            @if($company)
                                            <tr>
                                                <td style="padding: 15px 0; border-top: 1px solid #e0e0e0;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td width="120" style="color: #666666; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                                Entreprise
                                                            </td>
                                                            <td style="color: #1a1a1a; font-size: 15px; font-weight: 500;">
                                                                {{ $company }}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            @endif
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Message Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding-bottom: 12px;">
                                        <h2 style="margin: 0; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                            Message
                                        </h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="background-color: #ffffff; border-left: 3px solid #6366F1; padding: 20px; border-radius: 4px; color: #333333; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
{{ $contactMessage }}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="background-color: #6366F1; border-radius: 6px;">
                                        <a href="mailto:{{ $email }}?subject=Re: Votre demande de contact - Opsyra" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 6px;">
                                            Répondre à {{ $name }}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px 40px; border-radius: 0 0 8px 8px; border-top: 1px solid #e0e0e0;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #666666; font-size: 13px; line-height: 1.6;">
                                        <p style="margin: 0 0 8px;">
                                            <strong style="color: #1a1a1a;">Opsyra</strong> - Gestion de Flotte Moderne
                                        </p>
                                        <p style="margin: 0; font-size: 12px;">
                                            Ce message a été envoyé depuis le formulaire de contact du site web.
                                        </p>
                                        <p style="margin: 15px 0 0; font-size: 12px; color: #999999;">
                                            © {{ date('Y') }} Opsyra. Tous droits réservés.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

