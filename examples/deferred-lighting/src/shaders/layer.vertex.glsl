out vec2 textureUV;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    textureUV = uv;
}