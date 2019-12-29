export interface Source {
  // A source material required to create the current material
  material: Material;
  // The amount of source material to create the reaction
  sourceCount: number;
}

class Material {
  private name: string;
  private sources: Source[] = [];
  private resultCount: number = -1;
  private available = 0;
  public totalCreated = 0;
  
  constructor(name: string) {
    this.name = name;
  }

  public addReaction(count: number, sources: Source[]) {
    this.resultCount = count;
    this.sources = sources;
  }

  // Recursively runs the reaction. Argument is the amount of the material needed
  // If the amount available is not less than the amount wanted, it is simply subtracted
  // Otherwise, the sources are all created until at least that much is available of each
  public create(amount: number) {
    if (this.resultCount === -1) {
      throw new Error(`Material '${this.name}' has no result count, remember to call 'addReaction()' before creating`); 
    }
    if (amount <= this.available) {
      this.available -= amount;
    } else {
      // The number of reactions needed to get the correct amount of material
      // The available count is subtracted from the requested amount first to find the difference
      // The minimum number of reactions to reach that difference is how many sub reactions to run
      const multiplier = Math.ceil((amount - this.available) / this.resultCount);
      // Once we reach ORE, the list will be empty, so the recursion will end
      this.sources.forEach(({ material, sourceCount }) => {
        material.create(sourceCount * multiplier);
      });
      // How much was just created
      const created = multiplier * this.resultCount;
      // Tracking the total amount of material created over all
      this.totalCreated += created;
      // Ensuring that any extras are saved for future reactions
      this.available = this.available + created - amount;
    }
  }

  public reset() {
    this.available = 0;
    this.totalCreated = 0;
  }
}

export default Material;
