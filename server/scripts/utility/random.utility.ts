export class RandomUtility {
  static random (seed: number, min: number, max: number): number {
    seed = seed || 42;
    max = max || 1;
    min = min || 0;
    let generated: number = (seed * 9301 + 49297) % 233280;
    let offset: number = generated / 233280;
    let rand: number = min + offset * (max - min);
    return rand;
  }

  static stringToColor (name: string): string {
    let length: number = name.length;
    let magicNumber: number = 128;
    let seedR: number = length + name.charCodeAt(0) + name.charCodeAt(length - 1) + magicNumber;
    let seedG: number = length + name.charCodeAt(0) + name.charCodeAt(length / 2) + magicNumber;
    let seedB: number = length + name.charCodeAt(length / 2) + name.charCodeAt(length - 1) + magicNumber;
    let r: number = RandomUtility.random(seedR, 0, 1) * 255;
    let g: number = RandomUtility.random(seedG, 0, 1) * 255;
    let b: number = RandomUtility.random(seedB, 0, 1) * 255;
    let red: string = '00' + Number(parseInt(r.toString(), 10)).toString(16);
    let green: string = '00' + Number(parseInt(g.toString(), 10)).toString(16);
    let blue: string = '00' + Number(parseInt(b.toString(), 10)).toString(16);
    let hexColor: string = '#' + red.substring(red.length - 2) + green.substring(green.length - 2) + blue.substring(blue.length - 2);
    return hexColor;
  }
}
