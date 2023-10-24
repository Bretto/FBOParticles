export const vertexFaceParticles = `

uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
uniform sampler2D positions;
attribute vec2 reference;
float PI = 3.141592653589793238;

void main() {
  vUv = reference;
  vec3 pos = texture2D( positions, reference ).xyz;
  vPosition = pos;
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  gl_PointSize = 1.1; //( 1. * ( 1. / -mvPosition.z )) * 100. * ( 1. / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;
