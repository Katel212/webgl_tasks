import fragmentShader from "./shaders/shader.frag";
import vertexShader from "./shaders/shader3d.vert";

import {ProgramBuilder} from "../src/program_builder";
import {Drawer} from "../src/drawer";
import {TextureController} from "./texture_controller";
import {DrawDataCreator} from "./data_creator";
import {Transformator} from "../src/transformator";
import {Camera} from "../src/camera";
import {ControlMode} from "../src/control_mode";
import {CircleMode} from "./circle_mode";
import {CubeMode} from "./cube_mode";
import {TetrahedronMode} from "./tetrahedron_mode";
import { ShaderProgram } from "../src/shader_program";

class Main {
    gl: WebGL2RenderingContext;
    select: HTMLSelectElement;
    program: ShaderProgram;
    drawer: Drawer;
    transformator: Transformator;
    camera: Camera;
    textureController: TextureController;
    dataCreator: DrawDataCreator;
    circleMode: CircleMode;
    cubeMode: CubeMode;
    tetrahedronMode: TetrahedronMode;
    controlMode: ControlMode;

    constructor(canvas: HTMLCanvasElement) {
        this.gl = this.get_gl(canvas)
        this.select = document.querySelector("select#selectFigure") as HTMLSelectElement;
        const programBuilder = new ProgramBuilder(this.gl);
        this.program = programBuilder.buildProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program.program);
        this.drawer = new Drawer(this.gl, this.program);
        this.transformator = new Transformator(this.gl, this.program);
        this.camera = new Camera(this.gl, this.program);
        this.camera.setPosition(0, 0, -7);
        this.textureController = new TextureController(this.gl, this.program);
        this.textureController.load_textures();
        this.dataCreator = new DrawDataCreator(this.gl);
        this.circleMode = new CircleMode(this.transformator, this.textureController, 
                                         this.dataCreator, this.gl);
        this.cubeMode = new CubeMode(this.transformator, this.textureController, 
                                         this.dataCreator, this.gl);
        this.tetrahedronMode = new TetrahedronMode(this.transformator, this.textureController, 
                                         this.dataCreator, this.gl);

        this.controlMode = this.circleMode;
        console.log("before setup");
        this.controlMode.setup(this.drawer);
        console.log("after setup");
        this.select.addEventListener('change', (e) => { this.onSelectChange(e); });
        document.addEventListener('keyup', (e) => {this.onKeyUp(e)}, false);
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
        this.controlMode.update(this.drawer);
        requestAnimationFrame(() => {this.update()});
    }

    onSelectChange(event: Event) {
        console.log("onSelectChange");
        const figureName = this.selectedFigureName();
        switch (figureName) {
            case "Градиентный круг": {
                this.controlMode = this.circleMode;
                break;
            }
            case "Текстурирование куба": {
                this.controlMode = this.cubeMode;
                break;
            }
            case "Градиентный тетраэдр": {
                this.controlMode = this.tetrahedronMode;
                break;
            }
            default: {
                throw new Error(`Unknown figure name ${figureName}`);
            }
        }
        this.controlMode.setup(this.drawer);
    }

    onKeyUp(event: KeyboardEvent) {
        this.controlMode.onKeyUp(event);
    }

    private selectedFigureName(): string {
        return this.select.options[this.select.options.selectedIndex].text;
    } 
}

function main(){
    const canvas = document.querySelector("canvas#mycanvas") as HTMLCanvasElement;
    canvas.setAttribute("width", "600");
    canvas.setAttribute("height", "600");
    const mainObj = new Main(canvas);
}

main();
