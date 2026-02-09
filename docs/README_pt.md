

<div align="center">
  <img src="./assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.4.2-lightgreen.svg)

</div>

<div align="center">

   [English](../README.md) | Português

</div>

---

Transforme a visualização dos seus metadados entediantes em uma visualização dinâmica e colorida! 🎨✨

Typify é um plugin para o Obsidian que permite que você crie estilos únicos para seus metadados. O que antes era limitado apenas às tags, agora pode ser personalizado para qualquer propriedade do Obsidian.

## Recursos 

- **🎨 Estilos customizáveis**: Crie estilos únicos para seus metadados.

- **✨ 1700+ ícones**: Busca fuzzy integrada para toda a biblioteca de ícones Lucide.

- **🌑 Modo claro/escuro**: As cores se adaptam automaticamente ao tema do seu Obsidian.

- **🚫 Ícones opcionais**: Suporte para pílulas apenas com texto (basta remover o ícone!).

- **🌍 Internacionalização**: Totalmente traduzido para inglês e português (Brasil).

- **💾 Exportar/Importar**: Faça backup e compartilhe suas configurações facilmente.

> [!Warning]  
> A importação de configurações **substitui todos os estilos existentes**. Estilos criados após o backup serão perdidos.

## Como Usar

1. **Propriedade alvo**: Nas configurações do plugin, defina qual propriedade será o alvo.

> [!Tip]  
> Você pode usar mais de uma propriedade como alvo. Apenas adicione uma vírgula entre as opções. Exemplo: `Status, Priority`.

2. **Crie um estilo**:
   - Vá em **Configurações > Typify**.
   - Clique em "Criar novo estilo".
   - Defina o nome para corresponder ao valor da sua propriedade (ex: `Em Progresso`).
   - Escolha uma cor base e um ícone, ou deixe sem ícone.
   - Voilá! Sua propriedade agora é uma linda pílula colorida.

3. **Use seu novo estilo**: Nas propriedades da sua nota (YAML), adicione a propriedade alvo e defina um valor (ex: `Status: Em Progresso`).

> [!Important]  
> O plugin não faz distinção de maiúsculas e minúsculas. Exemplo: `Status` e `status` são a mesma propriedade.

> [!Note]  
> O efeito do estilo só é aplicado em propriedades do tipo **Lista** no Obsidian.

## Instalação

### Instalação Manual
1. Baixe a última release: `main.js`, `manifest.json` e `styles.css`.

2. Crie uma pasta `typify` dentro do diretório `.obsidian/plugins/`.

3. Cole os arquivos lá.

4. Recarregue o Obsidian e ative o plugin.


## Desenvolvimento
1. Clone este repositório.
2. Execute `npm install`.
3. Execute `npm run dev` para iniciar a compilação em modo watch.


## Aviso

Esse plugin nasceu pelo meu desejo de ter mais opção de customização para as propriedades, igual há no Notion, mas do jeito Obsidian de ser. 

E vale dizer que sem a grande ajuda do [Antigravity](https://antigravity.google/) nada disso seria possível. Claro, não houve mágica feita com um clique, mas sim cuidado com cada prompt, além de muita revisão e testes.

Isso não foi "vibecodado" de qualquer jeito, tive que alterar várias coisas "na mão", mas não é aprova de bala. Se encontrar algum bug, por favor, abra uma issue que eu vou fazer o máximo que posso para corrigir.

Se você quiser contribuir com o projeto, sinta-se à vontade para abrir uma pull request. Ou se não sentir bem usando código gerado por máquina e quiser fazer uma versão sua feito "à mão", sinta-se à vontade também. Só lembra de me avisar, pois amo plugins novos 😉.
