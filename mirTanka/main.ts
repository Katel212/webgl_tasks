import phongShader from "../task14/shaders/fong_shader.frag";
import vertexShader from "../task14/shaders/shader.vert";

import {Drawer} from "../src/drawer";
import {Camera} from "../src/camera";
import {ShaderProgram} from "../src/shader_program";

import { CameraController } from "../src/camera_controller";
import { IndexDrawData } from "../src/draw_data";
import { ProgramBuilder } from "../src/program_builder";


import Grass from "../static/objects/Grass.obj";
import Tank from "../static/objects/mirTanka/Tanks.obj";
import ChristmasTree from "../static/objects/mirTanka/ChristmasTree.obj";


import GrassTex from '../src/images/Grass_BaseColor.jpg';
import TankTex from '../src/images/mirTanka/Tank.png';
import ChristmasTreeTex from "../src/images/mirTanka/ChristmasTree.png";


import { Texture } from "../src/texture";
import { LightController } from "../task14/light_controller";
import { LightSource } from "../task14/light_source";
import { SpotLightSource } from "../task14/spot_light_source";
import { LoadedObject } from "../src/loaded_object";


class Main {
    gl: WebGL2RenderingContext;
    phongProgram: ShaderProgram;
    program: ShaderProgram;
    camera: Camera;
    cameraController: CameraController;
    grass: LoadedObject;
    tank: LoadedObject;
    christmasTree: LoadedObject;
    lightController: LightController;
    phongLightController: LightController;
    textures: {[key:number]: Texture} = {};
    data: {[key:number]: IndexDrawData} = {}; 
    activeLightSources: [boolean,boolean,boolean] = [true,false, false];

    constructor(canvas: HTMLCanvasElement) {
        this.gl = this.get_gl(canvas);
        const programBuilder = new ProgramBuilder(this.gl);
        
        this.phongProgram = programBuilder.buildProgram(vertexShader, phongShader);
        
        
        //this.program = this.toonProgram;
        this.program = this.phongProgram;
        //this.program = this.bidirectProgram;
        this.gl.useProgram(this.program.program);
        
        this.camera = new Camera(this.gl, this.program);
        this.cameraController = new CameraController(this.gl, this.camera);
        this.camera.setPosition(0, 50, -200);

        this.grass = LoadedObject.fromProgram(this.phongProgram, Grass, GrassTex);
        this.grass.transformator.setdDefaultScaling();
        this.grass.transformator.setDefaultTranslation();
        this.grass.transformator.rotate([270, 0, 0]);

        this.tank = LoadedObject.fromProgram(this.phongProgram, Tank, TankTex);
        this.tank.transformator.scale(10,10,10);
        this.tank.transformator.translate(0,1,-8);
        this.tank.transformator.rotate([0, 90, 0]);

        this.christmasTree = LoadedObject.fromProgram(this.phongProgram, ChristmasTree, ChristmasTreeTex);
        this.christmasTree.transformator.scale(6,6,6);
        this.christmasTree.transformator.translate(0,2,10);
        this.christmasTree.transformator.rotate([0, 0, 0]);

        let spls0 = new SpotLightSource( 
            this.gl,       
            [0, 15, 15], // lightPosition
            [0, 15, 200], // lightTarget
            15, //lightLimit
            [0.01,0.01,0.01], // lightAmbient
            [0.7,0.7,0.7], // lightDiffuse
            [1,1,1], // lightSpecular
        );
        
        this.gl.useProgram(this.phongProgram.program);
        this.phongLightController = new LightController(this.gl, this.phongProgram);
        this.phongLightController.add_spotlight_source(spls0);
        
        this.lightController = this.phongLightController;
        
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        document.addEventListener('keydown', (e) => { this.keyDown(e); }, false);
        this.configure_loop();
    }

    get_gl(canvas: HTMLCanvasElement): WebGL2RenderingContext {
        if (canvas == null) {
            throw "canvas not found";
        }
    
        const gl = canvas.getContext("webgl2");
    
        if (gl == null) {
            throw "GL is not supported";
        }
    
        return gl
    }

    configure_loop() {
        requestAnimationFrame(() => {this.update()});
    }

    update() {
        Drawer.clearBg(this.gl);
        this.changeProgram(this.phongProgram, this.phongLightController);
        this.grass.draw();
        this.tank.draw();
        this.christmasTree.draw(); 
        requestAnimationFrame(() => {this.update()});
    }

    changeProgram(newProgram: ShaderProgram, lightController: LightController) {
        this.program = newProgram;
        this.gl.useProgram(this.program.program);
        this.camera.changeProgram(newProgram);
        this.lightController = lightController;
        this.lightController.set_active_lights(this.activeLightSources);
    }



    private keyDown(e:KeyboardEvent): void{
        if (e.code=='Space'){
            if (this.activeLightSources[2]==true)
            {this.activeLightSources[2] = false; }
            else this.activeLightSources[2] =true;
        }
    }
}

function main(){
    const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
    canvas.setAttribute("width", "600");
    canvas.setAttribute("height", "600");
    const mainObj = new Main(canvas);
}

main();
