uniform vec3 lightWS;
uniform float strength;

out vec3 normalWS;

void main() {
    vec3 x = normalize(vec3(modelViewMatrix[0][0], modelViewMatrix[1][0], modelViewMatrix[2][0]));
    vec3 y = normalize(vec3(modelViewMatrix[0][1], modelViewMatrix[1][1], modelViewMatrix[2][1]));
    vec3 z = normalize(vec3(modelViewMatrix[0][2], modelViewMatrix[1][2], modelViewMatrix[2][2]));

    mat3 rotation = mat3(
        x.x, y.x, z.x,
        x.y, y.y, z.y,
        x.z, y.z, z.z
    );

    normalWS = rotation * normal;

    vec3 positionWS = (modelViewMatrix * vec4( position, 1.0 )).xyz;
    vec3 lightDir = normalize(positionWS - lightWS);
    float alignment = dot(lightDir, normalWS);

    if (alignment > 0.0) {
        positionWS += lightDir * 1920.0 * strength;
    }

    gl_Position = projectionMatrix * vec4(positionWS, 1.0);
}