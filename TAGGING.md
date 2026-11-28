# Preparação para GTM e tagueamento — Stagnum

Esta versão do site **não carrega Google Tag Manager, Google Analytics, pixels ou scripts de marketing**. O objetivo é preparar os controles antes da ativação, após validação do cliente.

## Consentimento

- `consent.js` deve executar **antes** do script do GTM em todas as páginas.
- Google Consent Mode v2 usa `analytics_storage`, `ad_storage`, `ad_user_data` e `ad_personalization`: todos `denied` por padrão, até escolha explícita.
- O cookie necessário `stagnum_consent` armazena `v`, `analytics`, `marketing`, `at`, com prazo de 180 dias.
- O cookie opcional `stagnum_visitor_id` é um UUID v4 gerado com `crypto.randomUUID()` **somente após** aceitar estatísticas. É excluído ao revogar estatísticas.
- Cookies estão limitados ao caminho `/stagnum-website/` no GitHub Pages; o caminho será `/` no domínio corporativo.
- Não existe fingerprint por canvas, fontes, hardware, IP, user-agent ou combinações de sinais.
- O botão “Preferências de cookies” fica disponível no rodapé.

## Eventos disponíveis no `window.dataLayer`

| Evento | Quando ocorre | Campos |
| --- | --- | --- |
| `stagnum_consent_updated` | Alteração de escolhas | `consent_analytics`, `consent_marketing` |
| `stagnum_visitor_ready` | ID gerado ou restaurado com consentimento | `stagnum_visitor_id` |

A leitura por código próprio também está disponível em `window.StagnumPrivacy.getConsent()` e `window.StagnumPrivacy.getVisitorId()`.

O identificador **não deve** ser automaticamente enviado como `user_id` do GA4 nem associado a informações pessoais. Definir objetivos, finalidade, retenção e política de mensuração antes de ativar tags.

## Passos antes da produção

1. Validar texto da política com o responsável da Stagnum e confirmar contato adequado para privacidade.
2. Configurar contêiner GTM com Consent Mode v2 usando integração de consentimento compatível e validar com Tag Assistant.
3. Bloquear execução dos serviços de medição até consentimento apropriado e configurar revogação dos cookies de terceiros que forem adicionados.
4. Validar a versão final no domínio corporativo, inclusive escopo dos cookies e ambiente HTTPS.
5. Testar aceitar, rejeitar, personalizar, revogar e recarregar em navegadores desktop e mobile.

Fontes: [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) · [ANPD: Guia de Cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
