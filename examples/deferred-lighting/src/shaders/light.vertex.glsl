out vec3 positionOS;
out vec4 positionPS;
out vec2 positionWS;
out vec2 centerWS;

void main() {
    positionWS = (modelViewMatrix * vec4( position, 1.0 )).xy;
    centerWS = (modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 )).xy;
    positionPS = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    gl_Position = positionPS;
    positionOS = position;
}