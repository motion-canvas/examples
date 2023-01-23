flat in vec3 normalWS;
in vec3 positionOS;

void main() {
    gl_FragColor.rgb = normalWS;
    float strength = length(positionOS.xy);
    gl_FragColor.b = clamp(1.0 - strength, 0.0, 1.0);
    gl_FragColor.a = 1.0;
}