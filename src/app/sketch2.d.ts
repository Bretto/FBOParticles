import { RendererService } from './renderer.service';
import { BufferGeometry, DataTexture, Points, Scene } from 'three';
import { GPUComputationRenderer, Variable } from 'three/examples/jsm/misc/GPUComputationRenderer';
export declare class Sketch {
    private renderer;
    scene: Scene;
    isRunning: boolean;
    gpuCompute: GPUComputationRenderer;
    WIDTH: number;
    dtPosition1: DataTexture;
    dtPosition2: DataTexture;
    positionVariable: Variable;
    material: any;
    maxDistance: number;
    frequency: number;
    amplitude: number;
    faceTexture: DataTexture;
    sphereTexture: DataTexture;
    boxTexture: DataTexture;
    normalizedTime: number;
    faceGeometry: BufferGeometry;
    particleSpeed: number;
    delta: number;
    points: Points;
    lines: any;
    initTexture: DataTexture;
    constructor(renderer: RendererService);
    init(): void;
    preload(): Promise<void>;
    addLines(): void;
    addMesh(): void;
    initGpuCompute(): void;
    createTexture(gpuCompute: GPUComputationRenderer, geometry: BufferGeometry): DataTexture;
    update(time: number): void;
    fillPositionTexture(dtPosition: DataTexture, geometry: any): void;
    updateLines(): void;
    loadObj(url: string): Promise<any>;
}
