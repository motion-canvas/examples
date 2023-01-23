uniform vec3 layer;
uniform sampler2D map;

in vec2 textureUV;

void main() {
    ivec2 size = textureSize(map, 0).xy;
    float ratio = (16.0 * float(size.y) * layer.x) / (9.0 * float(size.x));

    float fraction = 0.5 / float(size.y);

    vec2 uv = textureUV;
    uv.x *= ratio;
    uv.x += (1.0 - ratio) * layer.z * layer.x * layer.y;

    uv.y *= layer.x;
    uv.y += layer.x * layer.y;
    uv.y = clamp(uv.y, layer.x * layer.y + fraction, layer.x + layer.x * layer.y - fraction);

    vec4 color = texture(map, uv);
    gl_FragColor = mix(vec4(1.0, 1.0, 1.0, 0.02), color, color.a);
}