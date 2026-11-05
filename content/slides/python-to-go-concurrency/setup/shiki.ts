// Original, deliberately narrow syntax palette: structure in oxblood,
// values in ink. Use the same light theme for both OS color preferences.
const theme = {
  name: 'talk-paper',
  type: 'light' as const,
  colors: {
    'editor.background': '#f1eee7',
    'editor.foreground': '#252823',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#596057', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier'], settings: { foreground: '#9e3039' } },
    { scope: ['string', 'constant', 'support', 'entity.name', 'variable', 'punctuation'], settings: { foreground: '#252823' } },
    { scope: ['invalid'], settings: { foreground: '#9e3039', fontStyle: 'underline' } },
  ],
}

export default function () {
  return { themes: { light: theme, dark: theme } }
}
