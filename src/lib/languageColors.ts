// Colors match the ones GitHub shows next to each language.
const COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  PowerShell: '#012456',
  Lua: '#000080',
  'Jupyter Notebook': '#DA5B0B',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Solidity: '#AA6746',
  Zig: '#ec915c',
  Astro: '#ff5a03',
  MDX: '#fcb32c',
};

export function languageColor(name: string): string {
  return COLORS[name] ?? '#8b949e';
}
