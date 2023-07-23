uniform vec2 resolution;
varying vec2 vUv;

void main() {
  // Get the distance from the center of the texture
  vec2 center = vec2(0.5, 0.5);
  float distanceFromCenter = length(vUv - center);

  // Define the colors
  vec3 darkRed = vec3(1.0, 0.0, 0.0);
  vec3 lightRed = vec3(1.0, 1.0, 0.0);
  vec3 white = vec3(1.0, 1.0, 1.0);

  // Interpolate between the colors based on the distance from the center
  vec3 color = mix(darkRed, lightRed, distanceFromCenter * .09);

  // Threshold past which the color will transition to white
  float threshold = .09;

  if (distanceFromCenter > threshold) {
    // Calculate how far past the threshold we are (between 0 and 1)
    float t = (distanceFromCenter - threshold) / (1.0 - threshold);

    // Interpolate between the current color and white based on t
    color = mix(color, white, 1.);
//    color = white;
  }

  // Set the alpha value to 0.5 to make the color semi-transparent
  gl_FragColor = vec4(color, .5);
}
