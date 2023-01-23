flat out vec3 normalWS;
out vec3 positionOS;

void main() {
    vec3 unpacked = normal * 2.0 - 1.0;
    unpacked.z = 0.0;
    unpacked = normalize(modelViewMatrix * vec4(unpacked, 0.0)).xyz;
    vec3 packed = (unpacked + 1.0) * 0.5;
    packed.z = normal.z;
    normalWS = packed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    positionOS = position;
}