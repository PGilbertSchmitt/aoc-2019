import Material, { Source } from './material';
import { final as reactionSheet } from './reactions';

interface Pair {
  name: string,
  amount: number,
}

const main = (reactions: string) => {
  const reactionMap = parseReactions(reactions);
  const materialMap = new Map<string, Material>();

  // ORE reaction doesn't exist, so we add it first
  materialMap.set('ORE', new Material('ORE'));
  materialMap.get('ORE')?.addReaction(1, []);

  // Then instantiate the rest of the materials
  for (const name of reactionMap.keys()) {
    materialMap.set(name, new Material(name));
  }

  // Now that they exist, set the reactions
  for (const [name, [amount, sourcePairs]] of reactionMap.entries()) {
    const sources: Source[] = sourcePairs.map(pair => ({
        material: materialMap.get(pair.name) as Material,
        sourceCount: pair.amount
      }));
    materialMap.get(name)?.addReaction(amount, sources);
  }

  const fuel = materialMap.get('FUEL') as Material;
  fuel.create(1);

  const ore = materialMap.get('ORE') as Material;
  console.log(`${ore.totalCreated} ore needed to create one fuel`);
};

const parseReactions = (reactions: string) => {
  const reactionMap = new Map<string, [number, Pair[]]>();

  reactions.trim().split('\n').forEach(reaction => {
    const [ sources, result ] = reaction.split('=>').map(str => str.trim());
    const resultPair = parsePair(result);
    const sourcePairs = sources.split(',').map(parsePair);
    reactionMap.set(resultPair.name, [resultPair.amount, sourcePairs]);
  });
  
  return reactionMap;
};

const parsePair = (str: string): Pair => {
  const [amount, name] = str.trim().split(' ');
  return {
    name,
    amount: parseInt(amount, 10),
  };
};

main(reactionSheet);
