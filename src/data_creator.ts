import {DrawData} from "./draw_data"
import {Vertex2D} from "./vertex2d"

export class DrawDataCreator {
    constructor(readonly gl: WebGL2RenderingContext) {
        this.gl = gl;
    }
    
    drawDataFromFigureName(figureName: string): DrawData {
        switch (figureName) {
            case "Треугольник": {
                return this.triangleData();
            }
            case "Прямоугольник": {
                return this.rectangleData();
            }
            case "Веер": {
                return this.fanData();
            }
            case "Пятиугольник": {
                return this.pentagonData();
            }
            default: {
                throw new Error(`Unknown figure name ${figureName}`);
            }
        }
    }

    private triangleData(): DrawData {
        let vertices = [new Vertex2D(-1.0, 1.0), 
            new Vertex2D(0.0, -1.0),
            new Vertex2D(1.0, 1.0)];
        let drawMethod = this.gl.TRIANGLES;
        let pointsCount = 3;
        return {
            "vertices": vertices,
            "drawMethod": drawMethod,
            "pointsCount": pointsCount
        };
    }

    private rectangleData(): DrawData {
        let vertices = [new Vertex2D(-1.0, -1.0), 
            new Vertex2D(-1.0, 1.0),
            new Vertex2D(1.0, -1.0),
            new Vertex2D(1.0, 1.0)];
        let drawMethod = this.gl.TRIANGLE_STRIP;
        let pointsCount = 4;
        return {
            "vertices": vertices,
            "drawMethod": drawMethod,
            "pointsCount": pointsCount
        };
    }

    private fanData(): DrawData {
        let vertices = [new Vertex2D(0.0, 0.0)]
        let angle = 30;
        let count = 180 / angle;
        let radAngle = angle / 180.0 * Math.PI
        for (let i = 0; i <= count; i++) {
            vertices.push(new Vertex2D(Math.cos(radAngle * i), Math.sin(radAngle * i)));
        }
        let drawMethod = this.gl.TRIANGLE_FAN;
        let pointsCount = count + 2;
        return {
            "vertices": vertices,
            "drawMethod": drawMethod,
            "pointsCount": pointsCount
        };
    }

    private pentagonData() {
        let vertices = [new Vertex2D(0.0, 0.0)]
        let angle = 360 / 5;
        let count = 5;
        let radAngle = angle / 180.0 * Math.PI
        for (let i = 0; i <= count; i++) {
            vertices.push(new Vertex2D(Math.cos(radAngle * i), Math.sin(radAngle * i)));
        }
        let drawMethod = this.gl.TRIANGLE_FAN;
        let pointsCount = 5 + 2;
        return {
            "vertices": vertices,
            "drawMethod": drawMethod,
            "pointsCount": pointsCount
        };
    }
}