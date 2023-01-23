uniform sampler2D map;
uniform float transparency;

in vec3 normalWS;
in vec3 positionOS;
in mat3 rotation;

void main() {
//    gl_FragColor.rgb = normalWS;
//    gl_FragColor.a = 1.0;
    vec2 uv = (positionOS.xy + 1.0) * 0.5;
    vec3 packed = texture(map, uv).xyz;
    vec3 unpacked = packed * 2.0 - 1.0;
    vec3 unpackedWS = rotation * unpacked;
    vec3 packedWS = (unpackedWS + 1.0) * 0.5;
    packedWS.z = 1.0;

    gl_FragColor.rgb = packed;
    gl_FragColor.a = 1.0 - transparency;
}