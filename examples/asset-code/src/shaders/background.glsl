#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"
#define PI 3.1415926535897932384626433832795

uniform mat3x3 codeMatrix;
uniform vec4 codeFill;
uniform vec4 codeStroke;
uniform vec4 codeBg;
uniform mat3x3 dataMatrix;
uniform vec4 dataFill;
uniform vec4 dataStroke;
uniform vec4 dataBg;
uniform vec4 background;
uniform float backgroundSd;
uniform float codeRadius;
uniform float dataRadius;
uniform float order;
uniform float morph;
uniform float shape;
uniform float blur;

float sdCircle(vec2 p, float r)
{
    return length(p) - r;
}

float sdTriangle(vec2 p, float r)
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}

float sdShape(vec2 p, float morph) {
    float circle = sdCircle(p, 270.0);
    float triangle = sdTriangle(p, 200.0) - 80.0;
    return mix(circle, triangle, morph);
}

vec4 mixSdfBlur(vec4 from, vec4 to, float edge, float blur) {
    return mix(
        from,
        to,
        smoothstep(-blur, blur, edge)
    );
}

vec4 mixSdf(vec4 from, vec4 to, float edge) {
    return mixSdfBlur(from, to, edge, 0.5);
}

float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec4 text = texture(sourceTexture, sourceUV);

    vec3 screenPosition = vec3(resolution * vec2(screenUV.x, 1.0 - screenUV.y), 1.0);
    float dataSd = sdShape(-(dataMatrix * screenPosition).xy, 0.0 + max(0.0, shape));
    float codeSd = sdShape(-(codeMatrix * screenPosition).xy, 1.0 - max(0.0, -shape));

    if (order == 0.0) {
        float mixSd = mix(dataSd, codeSd, 0.5) - mix(200.0, 0.0, morph);
        dataSd = mix(dataSd, mixSd, morph);
        codeSd = mix(codeSd, mixSd, morph);

        float codeStrokeSd = codeSd - codeRadius;
        float dataStrokeSd = dataSd - dataRadius;

        float shapeSd = codeSd - dataSd;
        float shapeStrokeSd = codeStrokeSd - dataStrokeSd;

        vec4 shapeFillColor = mixSdfBlur(codeFill, dataFill, shapeSd, blur);
        vec4 shapeStrokeColor = mixSdfBlur(codeStroke, dataStroke, shapeStrokeSd, blur);

        shapeStrokeSd = codeStrokeSd - dataStrokeSd + (rand(screenUV) - 0.5) * blur * 0.05;
        vec4 shapeBgColor = mixSdfBlur(codeBg, dataBg, shapeStrokeSd, blur);

        outColor = mixSdf(shapeFillColor, shapeStrokeColor, min(codeSd, dataSd));
        outColor = mixSdf(outColor, shapeBgColor, min(codeStrokeSd, dataStrokeSd));
        outColor = mixSdf(background, outColor, backgroundSd - min(codeStrokeSd, dataStrokeSd));

        text = mixSdf(text, vec4(0.0), min(codeSd, dataSd));
        outColor.xyz = outColor.xyz * (1.0 - text.a) + shapeFillColor.xyz * 0.6 * text.a;

        return;
    }

    vec4 dataColor = mixSdf(dataFill, dataStroke, dataSd);
    vec4 codeColor = mixSdf(codeFill, codeStroke, codeSd);

    dataSd -= dataRadius;
    dataColor = mixSdf(dataColor, dataBg, dataSd);

    codeSd -= codeRadius;
    codeColor = mixSdf(codeColor, codeBg, codeSd);

    if (order > 0.0) {
        codeSd = max(0.0, codeSd);
    }
    if (order < 0.0) {
        dataSd = max(0.0, dataSd);
    }

    vec4 shapeColor = mixSdf(codeColor, dataColor, codeSd - dataSd);
    float shapeSd = min(dataSd, codeSd);

    outColor = mixSdf(background, shapeColor, backgroundSd - shapeSd);
}
