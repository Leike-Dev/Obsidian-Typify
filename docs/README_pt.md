

<div align="center">
  <img src="./assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.3.0-lightgreen.svg)

</div>

<div align="center">

   [English](../README.md) | Português | [Español](./README_es.md) | [Français](./README_fr.md) | [简体中文](./README_zh-CN.md)

</div>

---

Transforme a visualização dos seus metadados entediantes em uma visualização dinâmica e colorida! 🎨✨

Typify é um plugin para o Obsidian que permite que você crie estilos únicos para seus metadados. O que antes era limitado apenas às tags, agora pode ser personalizado para qualquer propriedade do Obsidian.

## Recursos 

- **🎨 Estilos customizáveis**: Crie estilos únicos para seus metadados.

- **✨ 1700+ ícones**: Busca fuzzy integrada para toda a biblioteca de ícones Lucide.

- **🌑 Modo claro/escuro**: As cores se adaptam automaticamente ao tema do seu Obsidian.

- **🚫 Ícones opcionais**: Suporte para pílulas apenas com texto (basta remover o ícone!).

- **🧩 Ícones customizados**: Poucos ícones? Você pode usar os seus próprios de forma fácil.

- **🌍 Internacionalização**: Totalmente traduzido para inglês, português (Brasil), espanhol, francês e chinês simplificado.

- **💾 Exportar/Importar**: Faça backup e compartilhe suas configurações facilmente.

- **📋 Plugin Bases**: Os estilos também funcionam nas visualizações do Bases (tabela e cards).

- **🎯 Estilos por propriedade**: Limite um estilo a propriedades específicas usando "Aplica-se a".

- **🖼️ Tags com Imagens**: Faça upload de suas próprias imagens locais (PNG, JPG, SVG) para usar como avatares de contato ou ícones customizados.

- **👁️ Ocultar Botão de Remover**: Oculte esteticamente o botão "X" globalmente ou por visualização para criar pílulas de leitura.

- **♾️ Suporte ao Canvas**: Totalmente compatível com o Obsidian Canvas, renderizando os estilos dinamicamente.

## Como Usar

1. **Defina a propriedade alvo:**: Nas configurações do plugin, digite o nome da propriedade que você quer estilizar (ex: `Status`). Se quiser mais de uma, separe por vírgulas (ex: `Status, Prioridade`).

2. **Crie o estilo do valor**:
   - Vá em **Configurações > Typify**.
   - Clique em "Criar estilo".
   - No campo **Nome do estilo**, digite o texto que você quer transformar em pílula (ex: `Concluído`).
   - Escolha uma cor base e um ícone, ou deixe sem ícone.
   - Opcionalmente, use **Aplica-se a** para limitar o estilo a propriedades específicas.

3. **Use seu novo estilo**: Nas propriedades da sua nota (YAML), use a propriedade e o valor que você configurou (ex: `Status: Em Progresso`).

Voilá! Sua propriedade agora é uma linda pílula colorida ✨

## Instalação

### Instalação Manual
1. Baixe a última release: `main.js`, `manifest.json` e `styles.css`.

2. Crie uma pasta `typify` dentro do diretório `.obsidian/plugins/`.

3. Cole os arquivos lá.

4. Recarregue o Obsidian e ative o plugin.

## Avisos

> [!Important]  
> O efeito do estilo só é aplicado em propriedades do tipo **Lista** no Obsidian.

> [!Note]  
> O plugin não faz distinção de maiúsculas e minúsculas seja no nome da propriedade ou nos valores. Exemplo: `Status` e `status` são a mesma propriedade.

> [!Note]  
> Se dois estilos possuem o mesmo nome mas escopos diferentes (ex: um em "Todas as propriedades" e outro em uma propriedade específica), o estilo mais específico terá prioridade para aquela propriedade.

> [!Tip]  
> Você pode usar mais de uma propriedade como alvo. Apenas adicione uma vírgula entre as opções. Exemplo: `Status, Priority`.

> [!Note]  
> As imagens personalizadas na visualização **Bases Cards** são intencionalmente renderizadas um pouco menores (14px em vez de 18px) para evitar cortes no layout, devido à restrição de altura fixa imposta pelo contêiner dos cartões.

> [!Warning]  
> A importação de configurações **substitui todos os estilos existentes**. Estilos criados após o backup serão perdidos.


## Desenvolvimento

Caso você queira compilar o plugin, faça o seguinte:

1. Clone este repositório.
2. Execute `npm install`.
3. Execute `npm run dev` para iniciar a compilação em modo watch.


## Disclaimer

Esse plugin nasceu pelo meu desejo de ter mais opção de customização para as propriedades, igual há no Notion, mas do jeito Obsidian de ser. 

E vale dizer que sem a grande ajuda do [Antigravity](https://antigravity.google/) nada disso seria possível. Claro, não houve mágica feita com um clique, mas sim cuidado com cada prompt, além de muita revisão e testes.

Isso não foi "vibecodado" de qualquer jeito, tive que alterar várias coisas "na mão", mas não é aprova de bala. Se encontrar algum bug, por favor, abra uma issue que eu vou fazer o máximo que posso para corrigir.

Se você quiser contribuir com o projeto, sinta-se à vontade para abrir uma pull request. Ou se não sentir bem usando código gerado por máquina e quiser fazer uma versão sua feito "à mão", sinta-se à vontade também. Só lembra de me avisar, pois amo plugins novos 😉.
