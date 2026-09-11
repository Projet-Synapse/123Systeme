// Powered by OnSpace.AI — Metro : exclure du résolveur ET du watcher les
// dossiers dont les fichiers apparaissent/disparaissent en cours d'exécution.
// Sur Windows, le verrou mimosa (.mimosa/hook-state/*.lock) fait planter le
// watcher (ENOENT watch) dès qu'il est supprimé sous ses pieds. Le motif est
// volontairement non ancré : Metro le teste aussi bien contre des chemins
// absolus Windows que relatifs POSIX.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const existing = config.resolver.blockList;
const previous = Array.isArray(existing) ? existing : existing ? [existing] : [];
// Tous les motifs doivent partager les mêmes drapeaux pour être combinés.
const volatileDirs = /(^|[\\/])\.(mimosa|git)([\\/]|$)/;

config.resolver.blockList = [...previous, volatileDirs];

module.exports = config;
