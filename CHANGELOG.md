## 2.4.0 | 6 de junho de 2026

NEW | Suporte a provedores customizados via `favicon-providers.json`
NEW | Quadro de avisos centralizado com estado persistido nas configurações
IMP | Cache reescrito — leitura 3× mais rápida em vaults grandes
FIX | Favicon em branco ao abrir nota offline com DuckDuckGo
FIX | SVGs personalizados acima de 80 KB causavam travamento silencioso
BRK | `faviconSource` renomeado para `faviconProvider` — migração automática ao abrir o vault

## 2.3.1 | 14 de abril de 2026

FIX | Ícones não carregavam em vaults com caracteres especiais no caminho
FIX | Conflito com o plugin Iconize ao usar ícones personalizados

## 2.3.0 | 2 de março de 2026

NEW | Suporte a fallback em cadeia: Google → DuckDuckGo → Busca direta
IMP | Tamanho máximo de SVG personalizado aumentado de 50 KB para 100 KB
FIX | Modal de configurações não fechava corretamente no Obsidian 1.7+
