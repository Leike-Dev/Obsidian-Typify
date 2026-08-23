## 1.6.0 | 23 de agosto de 2026

NEW | Modo de cor "Outline": estilo apenas com borda e contraste sutil com o fundo do tema.
NEW | "Correspondência por prefixo" para links associados: aplica o estilo a qualquer URL que comece com o valor configurado.
NEW | Duplicação de estilos: duplique rapidamente um estilo existente pelo Gerenciador.
NEW | Criação de estilos em lote: crie estilos automaticamente para múltiplos valores de uma vez (até 50).
NEW | Ordenação e filtros avançados no Gerenciador de Estilos: Recente, Alfabética, Formato, Ícone, Preenchimento, Link.
NEW | Explicações detalhadas adicionadas a cada opção no modal "Criar estilo".
NEW | Ícone exclusivo (sparkles) ao lado do nome do Typify na pesquisa de configurações.
NEW | Aviso informativo sobre "Correspondência por Prefixo" adicionado ao painel de "Avisos do plugin".
IMP | Migração para a nova API nativa de configurações do Obsidian (requer Obsidian 1.13.0+).
IMP | "Gerenciar estilos" e "Outros Estilos" migrados de modais para subpáginas de configurações.
IMP | Modal "Paleta de Cores" reestruturado com layout nativo do Obsidian, design responsivo e ícones Lucide.
IMP | "Gerenciar favicons" redesenhado: layout compacto com provedor integrado à barra de busca.
IMP | Modais "Quadro de Novidades" e "Avisos do Plugin" redesenhados com abas em pílula e altura fixa.
IMP | "Formato" e "Modo de cor" já vêm preenchidos por padrão na criação de novos estilos.
IMP | Termo "Todas as propriedades" renomeado para "Geral" para evitar confusão com "Mostrar todos".
IMP | Estilos aplicados imediatamente ao adicionar uma propriedade — sem recarregamento.
IMP | Carregamento paralelo de ícones, imagens e favicons para inicialização mais rápida.
IMP | Cache inteligente de ícones Lucide para atualizações visuais mais rápidas com muitos estilos.
IMP | Conversão interna de arquivos substituída pela função nativa do Obsidian.
IMP | READMEs reestruturados nos 5 idiomas com novos banners e páginas dedicadas de features.
IMP | Badge de patrocínio e badge da página oficial do Obsidian adicionados aos READMEs.
FIX | CSS das tags desaparecendo ao editar cores na "Paleta de Cores" com configurações abertas.
FIX | SVGs sem `viewBox` quebrando a interface do modal "Criar estilo".
FIX | Ícones/favicons customizados não sumindo ao desativar ou aparecendo como quadrados ao reativar.
FIX | Views dinâmicas (Canvas, Bases) exigindo recarregamento para exibir novos estilos.
FIX | Atraso na renderização de estilos em janelas sem foco.
FIX | Remover uma propriedade agora limpa seus estilos imediatamente da nota aberta.
FIX | "Links associados" volta a exibir a URL original quando a propriedade deixa de ser estilizada.
FIX | Pesquisa de favicons diferenciada de cache vazio.
FIX | Busca de favicons não trava mais o plugin em sites lentos.
FIX | Favicon antigo preservado quando a internet cai durante atualização.
FIX | Botão "Tentar novamente" funciona em sites marcados como falha permanente.
FIX | Tamanho dos favicons armazenados exibido corretamente.
