import { characters } from './wiki/characters';
import { guilds } from './wiki/guilds';
import { locations } from './wiki/locations';

export const WIKI_DATA = {
  ...characters,
  ...guilds,
  ...locations,
};