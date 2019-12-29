import Material, { Source } from './material';
import { final as reactionSheet } from './reactions';

const ONE_TRILLION = 1000000000000;

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

  const resetAll = () => {
    for (const material of materialMap.values()) {
      material.reset();
    }
  };

  const fuel = materialMap.get('FUEL') as Material;
  const ore = materialMap.get('ORE') as Material;
  // Largest known quantity of fuel that doesn't exceed ore limit
  let lowerBound = 1;
  // Smallest known quantity of fuel that exceeds ore limit
  let upperBound = 0;
  // Amount of fuel we're checking now
  let currentFuel = 1;
  while (true) {
    if (lowerBound + 1 === upperBound) {
      currentFuel = lowerBound;
      break;
    }
    resetAll();

    fuel.create(currentFuel);
    const oreCount = ore.totalCreated;

    if (oreCount > ONE_TRILLION) {
      upperBound = currentFuel;
      currentFuel = midPoint(lowerBound, upperBound);
    } else if (oreCount < ONE_TRILLION) {
      lowerBound = currentFuel;
      if (upperBound === 0) {
        currentFuel *= 2;
      } else {
        currentFuel = midPoint(lowerBound, upperBound);
      }
    } else {
      // Early break if we happen to find an amount of fuel that requires exactly one trillion units of ore
      break;
    }
  }

  console.log(`It turns out that one trillion units of ore turns into ${currentFuel} units of fuel`);
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

const midPoint = (low: number, high: number) => {
  return low + Math.ceil((high - low) / 2);
}

main(reactionSheet);
