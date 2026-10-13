// Cached layered noise gives clouds uneven density without circular silhouettes.
export function createCloudTextures(dark) {
  return Array.from({ length: 3 }, () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 192;
    const context = canvas.getContext('2d');
    if (!context) return canvas;
    const grid = Float32Array.from({ length: 128 * 64 }, () => Math.random());
    const smooth = value => value * value * (3 - 2 * value);
    const noise = (x, y) => {
      const ix = Math.floor(x), iy = Math.floor(y);
      const u = smooth(x - ix), v = smooth(y - iy);
      const at = (a,b) => grid[(a & 127) + (b & 63) * 128];
      const top = at(ix,iy) * (1-u) + at(ix+1,iy) * u;
      const bottom = at(ix,iy+1) * (1-u) + at(ix+1,iy+1) * u;
      return top * (1-v) + bottom * v;
    };
    const image = context.createImageData(canvas.width, canvas.height);
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const nx = x / canvas.width, ny = y / canvas.height;
        let density = 0, weight = .53, scale = 4;
        const warp = noise(nx*3+25,ny*2+15) - .5;
        for (let octave = 0; octave < 5; octave++) {
          density += noise(nx*scale+warp*1.5,ny*scale*.7+11) * weight;
          weight *= .5;
          scale *= 2;
        }
        // Dissolve all edges so overlapping layers never reveal a sprite boundary.
        const edge = Math.pow(Math.sin(nx*Math.PI),.7) * Math.pow(Math.sin(ny*Math.PI),1.1);
        const body = smooth(Math.max(0,Math.min(1,(density-.27)*2.3)));
        const index = (y*canvas.width+x)*4;
        const shade = dark ? [139,151,166] : [67,78,91];
        const highlight = Math.round((density-.4)*35);
        image.data[index] = shade[0]+highlight;
        image.data[index+1] = shade[1]+highlight;
        image.data[index+2] = shade[2]+highlight;
        image.data[index+3] = Math.round(body*edge*190);
      }
    }
    context.putImageData(image,0,0);
    return canvas;
  });
}
