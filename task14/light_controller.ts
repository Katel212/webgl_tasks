import { vec3 } from "gl-matrix";
import { LightSource } from "./light_source";
import { ShaderProgram } from "../src/shader_program";
import { SpotLightSource } from "./spot_light_source";

export class LightController {
    lightSources: LightSource[] = [];
    spotlightsSources: SpotLightSource[] = [];
    currentMode: string;
    gl: WebGL2RenderingContext;
    //Направление глобального света
    globalLightDirection: number[] = [0.0,1,-0.3];
    globalLightAmbient: number[] = [0.2,0.2,0.2];
    globalLightDiffuse: number[] = [0.7,0.7,0.7];
    globalLightSpecular: number[] = [1.0,1.0,1.0];

    //Параметры точечных источников света
    lightSourcesNumLocation : WebGLUniformLocation | null;
    lightSourcesNumLocationFrag : WebGLUniformLocation | null;


    //Параметры глобального источника света
    globalLightDirectionLocation: WebGLUniformLocation | null;
    globalLightAmbientLocation: WebGLUniformLocation | null;
    globalLightDiffuseLocation: WebGLUniformLocation | null;
    globalLightSpecularLocation: WebGLUniformLocation | null;

    //Параметры проецирующих источников света
    spotlightSourcesNumLocation: WebGLUniformLocation | null;
    spotlightSourcesNumLocationFrag: WebGLUniformLocation | null;

    //Режимы источников света
    GlobalLightEnabledLocation: WebGLUniformLocation | null;
    PointLightEnabledLocation: WebGLUniformLocation | null;
    ProjLightEnabledLocation: WebGLUniformLocation | null;


    constructor(gl: WebGL2RenderingContext, readonly program: ShaderProgram) {
        this.program = program;
        this.currentMode = "directional";
        this.gl = gl;

        this.lightSources = [];
        this.spotlightsSources = [];

        //Параметры глобального источника света
        this.globalLightDirectionLocation = this.program.getUniformLocation("globalLightDirection");
        this.gl.uniform3fv(this.globalLightDirectionLocation, this.globalLightDirection)
        this.globalLightAmbientLocation = this.program.getUniformLocation("globalLightAmbient");
        this.gl.uniform3fv(this.globalLightAmbientLocation, this.globalLightAmbient)
        this.globalLightDiffuseLocation = this.program.getUniformLocation("globalLightDiffuse");
        this.gl.uniform3fv(this.globalLightDiffuseLocation, this.globalLightDiffuse)
        this.globalLightSpecularLocation = this.program.getUniformLocation("globalLightSpecular");
        this.gl.uniform3fv(this.globalLightSpecularLocation, this.globalLightSpecular)


        //Параметры точечных источников света
        this.lightSourcesNumLocation = this.program.getUniformLocation("num_lights");
        this.lightSourcesNumLocationFrag = this.program.getUniformLocation("num_lightsF");

        //Параметры проецирующих источников света
        this.spotlightSourcesNumLocation = this.program.getUniformLocation("num_spotlights");
        this.spotlightSourcesNumLocationFrag = this.program.getUniformLocation("num_spotlightsF");

        //Режимы источников света
        this.GlobalLightEnabledLocation = this.program.getUniformLocation("globalLight");
        this.PointLightEnabledLocation = this.program.getUniformLocation("pointLight");
        this.ProjLightEnabledLocation = this.program.getUniformLocation("spotLight");
        // this.switch_mode(lm);
        // this.add_light_source(ls);
    }

    add_light_source(ls: LightSource) {
        //Привязываем источник света к шейдеру
        ls.bind_to_shader(this.program, this.lightSources.length);
        this.lightSources.push(ls);

        //Передаём количество источников света в шейдер
        this.gl.uniform1i(this.lightSourcesNumLocation, this.lightSources.length);
        this.gl.uniform1i(this.lightSourcesNumLocationFrag, this.lightSources.length);
    }

    add_spotlight_source(sls: SpotLightSource) {
        //Привязываем источник света к шейдеру
        sls.bind_to_shader(this.program, this.spotlightsSources.length);
        this.spotlightsSources.push(sls);

        //Передаём количество источников света в шейдер
        this.gl.uniform1i(this.spotlightSourcesNumLocation, this.spotlightsSources.length);
        this.gl.uniform1i(this.spotlightSourcesNumLocationFrag, this.spotlightsSources.length);
    }


    set_active_lights(flags: [boolean, boolean, boolean]) {
        let global = flags[0] ? 1 : 0;
        let point = flags[1] ? 1 : 0;
        let proj = flags[2] ? 1 : 0;
        this.gl.uniform1i(this.GlobalLightEnabledLocation, global);
        this.gl.uniform1i(this.PointLightEnabledLocation, point);
        this.gl.uniform1i(this.ProjLightEnabledLocation, proj);
    }

    switch_mode(new_mode:string){
        this.currentMode = new_mode;
        switch (this.currentMode){
            case "directional": {
                this.gl.uniform1i(this.GlobalLightEnabledLocation,1);
                this.gl.uniform1i(this.PointLightEnabledLocation,0);
                this.gl.uniform1i(this.ProjLightEnabledLocation,0);
                break;
            }
            case "point": {
                this.gl.uniform1i(this.GlobalLightEnabledLocation,0);
                this.gl.uniform1i(this.PointLightEnabledLocation,1);
                this.gl.uniform1i(this.ProjLightEnabledLocation,0);
                break;
            }
            case "projector": {
                this.gl.uniform1i(this.GlobalLightEnabledLocation,0);
                this.gl.uniform1i(this.PointLightEnabledLocation,0);
                this.gl.uniform1i(this.ProjLightEnabledLocation,1);
                break;
            }
            default: {
                throw new Error('No such light mode');
            }
        }
    }
}