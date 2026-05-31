const fs = require('fs');
fetch('https://raw.githubusercontent.com/github/gemoji/master/db/emoji.json')
  .then(r => r.json())
  .then(j => {
    const emojis = j.filter(e => e.emoji).map(e => {
      // Remove aliases that are too similar to the description
      const desc = e.description.toLowerCase();
      const filteredAliases = e.aliases.filter(a => {
          const cleanAlias = a.replace(/_/g, ' ').toLowerCase();
          return cleanAlias !== desc && !desc.includes(cleanAlias);
      });
      return {
        char: e.emoji,
        name: desc,
        search: filteredAliases.join(' ')
      };
    });
    fs.writeFileSync('src/emojis.ts', 'export const EMOJIS = ' + JSON.stringify(emojis, null, 2) + ';');
  });
