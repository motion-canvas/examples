uniform float distance;
uniform float intensity;
uniform float opacity;
uniform vec2 angleRange;
uniform vec4 normalVisibility;
uniform vec3 lightTint;
uniform sampler2D normals;
uniform sampler2D colors;

in vec3 positionOS;
in vec4 positionPS;
in vec2 positionWS;
in vec2 centerWS;

void main() {
    vec2 positionSS = positionPS.xy / positionPS.w * 0.5 + 0.5;
    vec4 normal = texture(normals, positionSS);
    vec4 color = texture(colors, positionSS);

    float length = length(positionOS.xy);
    float distanceFalloff = clamp(1.0 - length * 2.0 + distance, 0.0, 1.0);
    distanceFalloff *= distanceFalloff;

    vec2 direction = positionOS.xy / length;
    float angle = acos(dot(direction, vec2(0.99, 0.0)));
    float angularFalloff = clamp(smoothstep(angleRange.x, angleRange.y, angle), 0.0, 1.0);

    vec2 normalVector = normal.xy * 2.0 - 1.0;

    direction = normalize(positionWS - centerWS);
    float strength = clamp(dot(-direction, normalVector), 0.0, 1.0);
    strength = mix(1.0, strength, normal.a * normalVisibility.y * normal.b);

    float finalA = angularFalloff * distanceFalloff * intensity * strength;
    vec3 finalColor = mix(vec3(1.0), color.rgb, normalVisibility.z);
    float originalA = finalA;
    finalA *= mix(1.0, color.a, opacity);

    float normalA = normal.a * step(positionSS.y, normalVisibility.x);

    gl_FragColor.rgb = finalColor * lightTint;
    gl_FragColor.a = finalA;

    gl_FragColor.rgba += mix(
        vec4(lightTint * finalA * normalVisibility.w, 0.0),
        vec4(lightTint * originalA * normalVisibility.w, originalA),
        opacity
    );
}