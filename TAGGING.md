# Preparação para GTM e tagueamento — Stagnum

O contêiner **GTM-NCB7TT8T** está integrado e é carregado **somente após o consentimento para estatísticas ou marketing**. A presença do GTM não significa que o GA4, pixels ou tags publicitárias estejam configurados; isso depende da publicação das tags no próprio contêiner.

## Consentimento

- `consent.js` executa **antes** do carregamento assíncrono do GTM em todas as páginas.
- O script do GTM só é injetado no documento quando `analytics` ou `marketing` está autorizado. Sem essa autorização, nenhuma requisição ao domínio do GTM é iniciada por este código.
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
| `view_service` | Carregamento de uma página de serviço após consentimento existente | `page_path` |
| `click_whatsapp` | Clique em link de contato pelo WhatsApp após consentimento | `page_path` |
| `gallery_interaction` | Clique em um dot da galeria de fotos após consentimento | `page_path`, `photo_label` |

A leitura por código próprio também está disponível em `window.StagnumPrivacy.getConsent()` e `window.StagnumPrivacy.getVisitorId()`.

O identificador **não deve** ser automaticamente enviado como `user_id` do GA4 nem associado a informações pessoais. Definir objetivos, finalidade, retenção e política de mensuração antes de ativar tags.

## Passos antes da produção

1. Validar texto da política com o responsável da Stagnum e confirmar contato adequado para privacidade.
2. Configurar e publicar tags dentro do contêiner GTM-NCB7TT8T, com Consent Mode v2 e verificações de consentimento específicas para cada tag. Validar com Tag Assistant.
3. Garantir que tags de estatísticas só executem com `analytics_storage: granted`, e tags de marketing apenas com permissões pertinentes. Após o carregamento do GTM, a revogação atualiza o consentimento, mas não descarrega o JavaScript; revisar também limpeza dos cookies de terceiros conforme as tags utilizadas.
4. Validar a versão final no domínio corporativo, inclusive escopo dos cookies e ambiente HTTPS.
5. Testar aceitar, rejeitar, personalizar, revogar e recarregar em navegadores desktop e mobile.

Fontes: [Google Consent Mode](https://developers.google.com/tag-platform/security/guides/consent) · [ANPD: Guia de Cookies](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia_orientativo_cookies_e_protecao_de_dados_pessoais).
