out vec3 normalWS;
out vec3 positionOS;
out mat3 rotation;

void main() {
    vec3 x = normalize(vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]));
    vec3 y = normalize(vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1]));
    vec3 z = normalize(vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]));

    rotation = mat3(
        x.x, y.x, z.x,
        x.y, y.y, z.y,
        x.z, y.z, z.z
    );

    vec3 unpacked = normal;
    unpacked.z = 0.0;
    unpacked.xy = (rotation * unpacked).xy;
    vec3 packed = (unpacked + 1.0) * 0.5;
    packed.z = 1.0;
    normalWS = packed;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    positionOS = position;
}