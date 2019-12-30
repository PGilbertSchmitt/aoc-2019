export class Vector2 {
  public x: number;
  public y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  public static fromString(str: string) {
    const [x, y] = str.split(',').map(n => parseInt(n, 10));
    return new Vector2(x, y);
  }

  public toString() {
    return `${this.x},${this.y}`;
  }

  public neighbors() {
    const [x, y] = [this.x, this.y];
    return [
      new Vector2(x, y + 1),
      new Vector2(x + 1, y),
      new Vector2(x, y - 1),
      new Vector2(x - 1, y),
    ];
  }

  public add(other: Vector2) {
    this.x += other.x;
    this.y += other.y;
  }
}
