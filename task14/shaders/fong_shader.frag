#version 300 es

precision mediump float;

in vec3 color;
in vec2 fragTexCoord;
in vec3 fragNormal;
out vec4 fragColor;
uniform sampler2D u_texture1;
uniform float colorMix;

in vec3 v_surfaceToView;

//Параметры глобального света
uniform vec3 globalLightDirection;
uniform vec3 globalLightAmbient;
uniform vec3 globalLightDiffuse;
uniform vec3 globalLightSpecular;

//Параметры точечного света
uniform int num_lightsF;
in vec3[10] tolDirection;
uniform vec3[10] lAmbient;
uniform vec3[10] lDiffuse;
uniform vec3[10] lSpecular;

//Параметры направленного света
in vec3[10] toslDirection;
uniform int num_spotlightsF;
uniform vec3[10] slDirection;
uniform float[10] slLimit;
uniform vec3[10] slAmbient;
uniform vec3[10] slDiffuse;
uniform vec3[10] slSpecular;

uniform bool globalLight;
uniform bool pointLight;
uniform bool spotLight;

void main()
{
    vec4 tex_col1 = texture(u_texture1, fragTexCoord);
    fragColor =  mix(tex_col1, vec4(color, 1.0), colorMix);
    vec3 vfragNormal  = normalize(fragNormal);


    vec3 sumAmbient = vec3(0.0, 0.0, 0.0);
    vec3 sumDiffuse = vec3(0.0, 0.0, 0.0);
    vec3 sumSpecular = vec3(0.0, 0.0, 0.0);

    if (globalLight)
    {
        vec3 lightdir = normalize(globalLightDirection);
        vec3 r = normalize(-reflect(lightdir,vfragNormal));
        vec3 v = normalize(v_surfaceToView);

        vec3 ambient = globalLightAmbient;
        vec3 diffuse = globalLightDiffuse * max(dot(vfragNormal, lightdir),0.0);
        diffuse = clamp(diffuse, 0.0, 1.0);

        vec3 specular = globalLightSpecular * pow(max(dot(r,v),0.0), 10.0);
        specular = clamp(specular, 0.0, 1.0);

        sumAmbient += ambient;
        sumDiffuse += diffuse;
        sumSpecular += 0.4*specular;
    }

    if (pointLight)
    {
        vec3 amdiff = vec3(0.0, 0.0, 0.0);
        vec3 spec = vec3(0.0, 0.0, 0.0);
        for (int i = 0; i < num_lightsF; i++)
        {
            vec3 lightdir = normalize(tolDirection[i]);
            vec3 r = normalize(-reflect(lightdir,vfragNormal));
            vec3 v = normalize(v_surfaceToView);

            vec3 ambient = lAmbient[i];
            vec3 diffuse = lDiffuse[i] * max(dot(vfragNormal, lightdir),0.0);
            diffuse = clamp(diffuse, 0.0, 1.0);
            vec3 specular = lSpecular[i] * pow(max(dot(r,v),0.0), 300.0);
            specular = clamp(specular, 0.0, 1.0);

            sumAmbient += ambient;
            sumDiffuse += diffuse;
            sumSpecular += 0.4*specular;
        }
    }

    if (spotLight)
    {
        for (int i = 0; i < num_spotlightsF; i++)
        {
            vec3 l = normalize(toslDirection[i]);
            vec3 d = normalize(slDirection[i]);
            float dotFromDirection = dot(l,-d);

            if (dotFromDirection >= slLimit[i]) 
            {
                vec3 lightdir = l;
                vec3 r = normalize(-reflect(lightdir,vfragNormal));
                vec3 v = normalize(v_surfaceToView);

                vec3 ambient = slAmbient[i];
                vec3 diffuse = slDiffuse[i] * max(dot(vfragNormal, lightdir),0.0);
                diffuse = clamp(diffuse, 0.0, 1.0);

                vec3 specular = slSpecular[i] * pow(max(dot(r,v),0.0), 300.0);
                specular = clamp(specular, 0.0, 1.0);
                
                sumAmbient += ambient;
                sumDiffuse += diffuse;
                sumSpecular += 0.4*specular;     
            }else
            {
                sumAmbient += slAmbient[i];
            }
        }
    }

    sumAmbient = sumAmbient / (float(num_lightsF) + float(num_spotlightsF) + 1.0);
    sumDiffuse = clamp(sumDiffuse, 0.0, 1.0);
    sumSpecular = clamp(sumSpecular, 0.0, 1.0);

    fragColor.rgb = fragColor.rgb * (sumAmbient + sumDiffuse) + sumSpecular;

}