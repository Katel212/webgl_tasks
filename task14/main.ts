import phongShader from "./shaders/fong_shader.frag";
import toonShader from "./shaders/toon_shader.frag";
import bidirectShader from "./shaders/bidir_shader.frag";
import vertexShader from "./shaders/shader.vert";

import {Drawer} from "../src/drawer";
import {Camera} from "../src/camera";
import {ShaderProgram} from "../src/shader_program";

import { CameraController } from "../src/camera_controller";
import { IndexDrawData } from "../src/draw_data";
import { ProgramBuilder } from "../src/program_builder";

import Cat from "../static/objects/Cat.obj";
import Span from "../static/objects/spam.obj";
import Grass from "../static/objects/Grass.obj";
import Gun from "../static/objects/Gun.obj";
import Cattle from "../static/objects/cattle.obj";
import Turkey from "../static/objects/Cooked_Turkey.obj";

import CatTex from '../src/images/Cat.jpg';
import SpanTex from '../src/images/spam_BaseColor.jpg';
import GrassTex from '../src/images/Grass_BaseColor.jpg';
import GunTex from '../src/images/Gun.png';
import WoodTex from '../src/images/WoodTex2.jpeg';
import TurkeyTex from '../src/images/Cooked_Turkey.jpg';

import { Texture } from "../src/texture";
import { LightController } from "./light_controller";
import { LightSource } from "./light_source";
import { SpotLightSource } from "./spot_light_source";
import { LoadedObject } from "../src/loaded_object";


class Main {
    gl: WebGL2RenderingContext;
    phongProgram: ShaderProgram;
    toonProgram: ShaderProgram;
    bidirectProgram: ShaderProgram;
    program: ShaderProgram;
    camera: Camera;
    cameraController: CameraController;
    grass: LoadedObject;
    cat: LoadedObject;
    gun: LoadedObject;
    span: LoadedObject;
    turkey: LoadedObject;
    lightController: LightController;
    phongLightController: LightController;
    toonLightController: LightController;
    bidirectionalLightController: LightController;
    textures: {[key:number]: Texture} = {};
    data: {[key:number]: IndexDrawData} = {}; 
    
    select:HTMLSelectElement;
    directionalCheckBox: HTMLInputElement;
    pointLightCheckBox: HTMLInputElement;
    projectorCheckBox: HTMLInputElement;

    constructor(canvas: HTMLCanvasElement) {
        this.gl = this.get_gl(canvas);
        this.select = document.querySelector("select#selectFigure") as HTMLSelectElement;
        this.directionalCheckBox = document.querySelector("input#directionalCheckbox") as HTMLInputElement;
        this.pointLightCheckBox = document.querySelector("input#pointLightCheckbox") as HTMLInputElement;
        this.projectorCheckBox = document.querySelector("input#projectorCheckbox") as HTMLInputElement;
        const programBuilder = new ProgramBuilder(this.gl);
        
        this.phongProgram = programBuilder.buildProgram(vertexShader, phongShader);
        this.toonProgram = programBuilder.buildProgram(vertexShader, toonShader);
        this.bidirectProgram = programBuilder.buildProgram(vertexShader, bidirectShader);
        
        
        //this.program = this.toonProgram;
        this.program = this.phongProgram;
        //this.program = this.bidirectProgram;
        this.gl.useProgram(this.program.program);
        
        this.camera = new Camera(this.gl, this.program);
        this.cameraController = new CameraController(this.gl, this.camera);
        this.camera.setPosition(0, 50, -200);
        
        this.cat = LoadedObject.fromProgram(this.toonProgram, Cat, CatTex);
        this.cat.transformator.setdDefaultScaling();
        this.cat.transformator.translate(0, 10, 0);
        this.cat.transformator.rotate([270, 0, 180]);

        this.grass = LoadedObject.fromProgram(this.toonProgram, Grass, GrassTex);
        this.grass.transformator.setdDefaultScaling();
        this.grass.transformator.setDefaultTranslation();
        this.grass.transformator.rotate([270, 0, 0]);

        this.gun = LoadedObject.fromProgram(this.bidirectProgram, Gun, GunTex);
        this.gun.transformator.translate(0.19, 0.47, 0);
        this.gun.transformator.scale(50, 50, 50);
        this.gun.transformator.rotate([0, 270, 0]);

        this.span = LoadedObject.fromProgram(this.toonProgram, Span, SpanTex);
        this.span.transformator.translate(10, 5, 0);
        this.span.transformator.scale(5, 5, 5);
        this.span.transformator.rotate([0, 210, 0]);

        this.turkey = LoadedObject.fromProgram(this.phongProgram, Turkey, TurkeyTex);
        this.turkey.transformator.translate(50, 1, -50);
        this.turkey.transformator.scale(1, 1, 1);
        this.turkey.transformator.rotate([-90, 0, 70]);

        let ls0 = new LightSource(
            this.gl,
            [0, 200, 0], // lightPosition
            [0.2,0.0,0.0], // lightAmbient
            [1,1,1], // lightDiffuse
            [1,1,1], // lightSpecular
        );
        let ls1 = new LightSource(
            this.gl,
            [-500, -500, 0], // lightPosition
            [0.0,0.0,0.2], // lightAmbient
            [0.2,0.2,0.2], // lightDiffuse
            [1,1,1], // lightSpecular
        );

        let spls0 = new SpotLightSource( 
            this.gl,       
            [0, 200, 0], // lightPosition
            [0, 0, 0], // lightTarget
            10, //lightLimit
            [0.2,0.2,0.2], // lightAmbient
            [1,1,1], // lightDiffuse
            [1,1,1], // lightSpecular
        );

        let spls1 = new SpotLightSource(
            this.gl,          
            [0, 50, -200], // lightPosition
            [0, 50, 0], // lightTarget
            5, //lightLimit
            [0.2,0.0,0.0], // lightAmbient
            [0.2,0.2,0.2], // lightDiffuse
            [1,1,1], // lightSpecular
        );
        
        this.gl.useProgram(this.phongProgram.program);
        this.phongLightController = new LightController(this.gl, this.phongProgram)
        this.phongLightController.add_light_source(ls1);
        this.phongLightController.add_spotlight_source(spls0);
        //this.phongLightController.add_spotlight_source(spls1);
        
        this.gl.useProgram(this.toonProgram.program);
        this.toonLightController = new LightController(this.gl, this.toonProgram)
        this.toonLightController.add_light_source(ls1);
        this.toonLightController.add_spotlight_source(spls0);
        //this.toonLightController.add_spotlight_source(spls1);

        this.gl.useProgram(this.bidirectProgram.program);
        this.bidirectionalLightController = new LightController(this.gl, this.bidirectProgram)
        this.bidirectionalLightController.add_light_source(ls1);
        this.bidirectionalLightController.add_spotlight_source(spls0);
        //this.bidirectionalLightController.add_spotlight_source(spls1);

        this.lightController = this.phongLightController;
        
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
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
        console.log("checkbox data: " + this.activeLightSources());
        Drawer.clearBg(this.gl);
        this.changeProgram(this.phongProgram, this.phongLightController);
        this.turkey.draw();
        
        
        this.changeProgram(this.toonProgram, this.toonLightController);
        this.cat.draw();
        this.span.draw();
        this.grass.draw();
        
        this.changeProgram(this.bidirectProgram, this.bidirectionalLightController);
        this.gun.draw();
        requestAnimationFrame(() => {this.update()});
    }

    changeProgram(newProgram: ShaderProgram, lightController: LightController) {
        this.program = newProgram;
        this.gl.useProgram(this.program.program);
        this.camera.changeProgram(newProgram);
        this.lightController = lightController;
        this.lightController.set_active_lights(this.activeLightSources());
    }

    onSelectChange(event?: Event) {
        console.log("onSelectChange");
        const lightMode = this.selectedLightMode();
        switch (lightMode) {
            case "Направленное": {
                this.lightController.switch_mode("directional");
                break;
            }
            case "Точечное": {
                this.lightController.switch_mode("point");
                break;
            }
            case "Прожектор": {
                this.lightController.switch_mode("projector");
                break;
            }
            default: {
                throw new Error(`Unknown figure name ${lightMode}`);
            }
        }
    }

    private activeLightSources(): [boolean, boolean, boolean] {    
        return [this.directionalCheckBox.checked, 
                this.pointLightCheckBox.checked, 
                this.projectorCheckBox.checked]
    }

    private selectedLightMode(): string {
        return this.select.options[this.select.options.selectedIndex].text;
    } 
    
    private degToRad(d:number) {
        return d * Math.PI/180;
    }
}

function main(){
    const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
    canvas.setAttribute("width", "600");
    canvas.setAttribute("height", "600");
    const mainObj = new Main(canvas);
}

main();
